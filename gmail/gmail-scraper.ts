// ─── Gmail Scraper — Playwright-based inbox reader ───────────────────────────
// Launches a headful Chromium browser, navigates to Gmail, waits for the user
// to log in, then scrapes the visible inbox rows into structured email objects.

import { chromium, type Browser, type Page } from 'playwright';
import { resolve } from 'node:path';

export interface GmailEmail {
  sender: string;
  subject: string;
  snippet: string;
  unread: boolean;
  labels: string[];
}

const USER_DATA_DIR = resolve(import.meta.dirname ?? '.', '.gmail-session');
const GMAIL_URL = 'https://mail.google.com';
const LOAD_TIMEOUT_MS = 120_000;

/**
 * Launch a headful Chromium browser with a persistent profile so the user
 * doesn't have to re-authenticate every run.
 */
export async function launchBrowser(): Promise<{ browser: Browser; page: Page }> {
  const context = await chromium.launchPersistentContext(USER_DATA_DIR, {
    headless: false,
    viewport: { width: 1280, height: 900 },
    args: ['--disable-blink-features=AutomationControlled'],
  });

  const page = context.pages()[0] ?? await context.newPage();
  return { browser: context.browser()!, page };
}

/**
 * Navigate to Gmail. Returns the page once navigation completes (or throws
 * on timeout).
 */
export async function navigateToGmail(page: Page): Promise<void> {
  await page.goto(GMAIL_URL, { waitUntil: 'domcontentloaded', timeout: LOAD_TIMEOUT_MS });
}

/**
 * Scrape the visible inbox rows from the currently-loaded Gmail page.
 *
 * Gmail's DOM is notoriously dynamic and obfuscated. We try known selectors
 * first, then fall back to extracting the visible text of each table row.
 */
export async function scrapeInbox(page: Page): Promise<GmailEmail[]> {
  // Give Gmail a moment to finish rendering dynamic content
  await page.waitForTimeout(2000);

  const emails = await page.evaluate(() => {
    const results: {
      sender: string;
      subject: string;
      snippet: string;
      unread: boolean;
      labels: string[];
    }[] = [];

    // Gmail inbox rows are <tr> elements with class "zA"
    const rows = document.querySelectorAll('tr.zA');

    for (const row of rows) {
      // ── Sender ──
      // .yW contains the sender display name/email; .zF is the inner span
      const senderEl =
        row.querySelector('.yW .zF') ??
        row.querySelector('.yW') ??
        row.querySelector('[email]');
      const sender =
        senderEl?.getAttribute('name') ??
        senderEl?.getAttribute('email') ??
        senderEl?.textContent?.trim() ??
        '';

      // ── Subject ──
      // .bog or .bqe wraps the subject text
      const subjectEl =
        row.querySelector('.bog') ??
        row.querySelector('.bqe') ??
        row.querySelector('.xT .y6');
      const subject = subjectEl?.textContent?.trim() ?? '';

      // ── Snippet ──
      // .y2 contains the snippet/preview text (usually preceded by " - ")
      const snippetEl = row.querySelector('.y2');
      let snippet = snippetEl?.textContent?.trim() ?? '';
      // Strip the leading dash separator Gmail sometimes includes
      snippet = snippet.replace(/^[\s–—-]+/, '').trim();

      // ── Unread ──
      const unread = row.classList.contains('zE');

      // ── Labels ──
      const labelEls = row.querySelectorAll('.av');
      const labels: string[] = [];
      for (const lbl of labelEls) {
        const text = lbl.textContent?.trim();
        if (text) labels.push(text);
      }

      // Only include rows where we got at least a sender or subject
      if (sender || subject) {
        results.push({ sender, subject, snippet, unread, labels });
      }
    }

    // ── Fallback: if structured selectors yielded nothing, grab raw row text ──
    if (results.length === 0) {
      const allRows = document.querySelectorAll('tr[role="row"], div[role="row"], tr.zA');
      for (const row of allRows) {
        const text = (row as HTMLElement).innerText?.trim() ?? '';
        if (text && text.length > 10) {
          results.push({
            sender: '',
            subject: text.slice(0, 200),
            snippet: '',
            unread: false,
            labels: [],
          });
        }
      }
    }

    return results;
  });

  return emails;
}

/**
 * Format scraped emails into a prompt suitable for the triage squad.
 */
export function formatEmailsForPrompt(emails: GmailEmail[], userContext?: string): string {
  if (emails.length === 0) {
    return 'I couldn\'t read any emails from the inbox. The page may still be loading or the inbox might be empty.';
  }

  const lines: string[] = [
    `Triage these ${emails.length} emails from my Gmail inbox:\n`,
  ];

  for (let i = 0; i < emails.length; i++) {
    const e = emails[i]!;
    const unreadTag = e.unread ? ' [UNREAD]' : '';
    const labelTag = e.labels.length > 0 ? ` [${e.labels.join(', ')}]` : '';
    const snippetPart = e.snippet ? ` — "${e.snippet}"` : '';
    lines.push(
      `${i + 1}. From: ${e.sender || '(unknown)'}${unreadTag}${labelTag}\n` +
      `   Subject: ${e.subject || '(no subject)'}${snippetPart}`
    );
  }

  if (userContext?.trim()) {
    lines.push(`\nContext about me: ${userContext.trim()}`);
  }

  return lines.join('\n');
}

/**
 * Close the browser gracefully.
 */
export async function closeBrowser(page: Page): Promise<void> {
  try {
    const context = page.context();
    await context.close();
  } catch {
    // best effort — browser may already be closed by user
  }
}
