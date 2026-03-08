// ─── EDHREC Card Scraper — Playwright-based card recommendation reader ────────
// Launches a headful Chromium browser, navigates to EDHREC, and scrapes
// recommended cards for a given commander or theme.

import { chromium, type Browser, type Page } from 'playwright';
import { resolve } from 'node:path';

export interface EDHRECCard {
  name: string;
  category: string; // creature, instant, sorcery, artifact, enchantment, land, planeswalker
  inclusionRate: number; // percentage of decks that include this card
  price?: string;
}

const USER_DATA_DIR = resolve(import.meta.dirname ?? '.', '.edhrec-session');
const EDHREC_BASE = 'https://edhrec.com';
const LOAD_TIMEOUT_MS = 60_000;

/**
 * Slugify a card or theme name for EDHREC URLs.
 * "Atraxa, Praetors' Voice" → "atraxa-praetors-voice"
 */
function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[',]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Launch a headful Chromium browser with a persistent profile so cookie
 * consent / preferences persist across runs.
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
 * Navigate to a specific commander's page on EDHREC.
 */
export async function navigateToEDHREC(page: Page, commanderName: string): Promise<void> {
  const slug = slugify(commanderName);
  const url = `${EDHREC_BASE}/commanders/${slug}`;
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: LOAD_TIMEOUT_MS });
  // Let dynamic card lists render
  await page.waitForTimeout(3000);
}

/**
 * Navigate to a theme page on EDHREC.
 */
export async function navigateToEDHRECTheme(page: Page, theme: string): Promise<void> {
  const slug = slugify(theme);
  const url = `${EDHREC_BASE}/themes/${slug}`;
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: LOAD_TIMEOUT_MS });
  await page.waitForTimeout(3000);
}

/**
 * Scrape recommended cards from the current EDHREC page.
 *
 * EDHREC's DOM changes frequently. We try multiple selector strategies
 * with fallbacks (same resilience pattern as gmail-scraper.ts).
 */
export async function scrapeRecommendedCards(page: Page): Promise<EDHRECCard[]> {
  // Scroll down to trigger lazy-loaded sections
  await page.evaluate('window.scrollBy(0, 2000)');
  await page.waitForTimeout(2000);
  await page.evaluate('window.scrollBy(0, 2000)');
  await page.waitForTimeout(2000);

  const cards = await page.evaluate(`(() => {
    const results = [];
    const seenNames = new Set();

    const categoryKeywords = {
      creature: 'creature',
      instant: 'instant',
      sorcery: 'sorcery',
      artifact: 'artifact',
      enchantment: 'enchantment',
      land: 'land',
      planeswalker: 'planeswalker',
      mana: 'land',
    };

    const inferCategory = (sectionText) => {
      const lower = sectionText.toLowerCase();
      for (const [keyword, cat] of Object.entries(categoryKeywords)) {
        if (lower.includes(keyword)) return cat;
      }
      return 'other';
    };

    const parseInclusionRate = (text) => {
      const match = text.match(/(\\d+)%/);
      return match ? parseInt(match[1], 10) : 0;
    };

    // Strategy 1: Card containers with data attributes
    const cardContainers = document.querySelectorAll(
      '[class*="Card_container"], [class*="card-container"], .cardlist-card, .card-wrapper'
    );

    if (cardContainers.length > 0) {
      let currentCategory = 'other';
      for (const card of cardContainers) {
        const section = card.closest('section, [class*="Section"], [class*="panel"]');
        if (section) {
          const header = section.querySelector('h2, h3, h4, [class*="header"], [class*="title"]');
          if (header && header.textContent) {
            currentCategory = inferCategory(header.textContent);
          }
        }

        const nameEl = card.querySelector(
          '[class*="Card_name"], [class*="card-name"], .card-name, a[data-name], img[alt]'
        );
        const name =
          (nameEl && nameEl.getAttribute('data-name')) ||
          (nameEl && nameEl.getAttribute('alt')) ||
          (nameEl && nameEl.textContent && nameEl.textContent.trim()) ||
          '';

        if (!name || seenNames.has(name.toLowerCase())) continue;
        seenNames.add(name.toLowerCase());

        const rateEl = card.querySelector(
          '[class*="inclusion"], [class*="synergy"], [class*="percent"]'
        );
        const inclusionRate = rateEl ? parseInclusionRate((rateEl.textContent || '')) : 0;

        const priceEl = card.querySelector('[class*="price"], [class*="tcg"]');
        const price = (priceEl && priceEl.textContent && priceEl.textContent.trim()) || undefined;

        results.push({ name: name, category: currentCategory, inclusionRate: inclusionRate, price: price });
      }
    }

    // Strategy 2: Links with card image tooltips
    if (results.length === 0) {
      const cardLinks = document.querySelectorAll(
        'a[class*="card"], a[data-entry], .cardlink, a[href*="/cards/"]'
      );
      let currentCategory = 'other';

      for (const link of cardLinks) {
        const section = link.closest('div[class*="section"], section, .panel');
        if (section) {
          const header = section.querySelector('h2, h3, h4');
          if (header && header.textContent) {
            currentCategory = inferCategory(header.textContent);
          }
        }

        const name =
          link.getAttribute('data-entry') ||
          link.getAttribute('data-name') ||
          link.alt ||
          (link.textContent && link.textContent.trim()) ||
          '';

        if (!name || name.length < 2 || seenNames.has(name.toLowerCase())) continue;
        seenNames.add(name.toLowerCase());

        const parent = link.parentElement;
        const rateText = (parent && parent.textContent) || '';
        const inclusionRate = parseInclusionRate(rateText);

        results.push({ name: name, category: currentCategory, inclusionRate: inclusionRate });
      }
    }

    // Strategy 3: Fallback — grab any image alt text that looks like a card
    if (results.length === 0) {
      const images = document.querySelectorAll('img[alt]');
      for (const img of images) {
        const alt = img.getAttribute('alt') || '';
        if (
          alt.length > 3 &&
          alt.length < 60 &&
          !alt.includes('http') &&
          !alt.includes('logo') &&
          /^[A-Z]/.test(alt)
        ) {
          if (seenNames.has(alt.toLowerCase())) continue;
          seenNames.add(alt.toLowerCase());
          results.push({ name: alt, category: 'other', inclusionRate: 0 });
        }
      }
    }

    return results;
  })()`) as EDHRECCard[];

  return cards;
}

/**
 * Attempt to scrape pricing data from the current EDHREC page.
 */
export async function scrapePricing(page: Page): Promise<Map<string, string>> {
  const pricing = await page.evaluate(`(() => {
    const priceMap = {};
    const priceEls = document.querySelectorAll(
      '[class*="price"], [class*="tcg"], [class*="dollar"]'
    );
    for (const el of priceEls) {
      const card = el.closest('[class*="Card"], [class*="card"], .cardlist-card');
      if (!card) continue;
      const nameEl = card.querySelector(
        '[class*="name"], a[data-name], img[alt]'
      );
      const name =
        (nameEl && nameEl.getAttribute('data-name')) ||
        (nameEl && nameEl.getAttribute('alt')) ||
        (nameEl && nameEl.textContent && nameEl.textContent.trim()) ||
        '';
      const price = (el.textContent && el.textContent.trim()) || '';
      if (name && price) priceMap[name] = price;
    }
    return priceMap;
  })()`) as Record<string, string>;

  return new Map(Object.entries(pricing));
}

/**
 * Format scraped card data into a prompt for the squad.
 */
export function formatCardsForPrompt(cards: EDHRECCard[], userRequest: string): string {
  if (cards.length === 0) {
    return `The user wants to build a Commander deck.\n\nUser request: "${userRequest}"\n\nNo cards could be scraped from EDHREC. Please build a deck based on your knowledge of the Commander format and the user's request. Create a complete 100-card deck list.`;
  }

  const byCategory = new Map<string, EDHRECCard[]>();
  for (const card of cards) {
    const cat = card.category || 'other';
    if (!byCategory.has(cat)) byCategory.set(cat, []);
    byCategory.get(cat)!.push(card);
  }

  const lines: string[] = [
    `Build a Commander deck based on the following EDHREC recommendations and the user's request.`,
    ``,
    `User request: "${userRequest}"`,
    ``,
    `Scraped ${cards.length} recommended cards from EDHREC:`,
    ``,
  ];

  for (const [category, catCards] of byCategory) {
    lines.push(`### ${category.charAt(0).toUpperCase() + category.slice(1)}s`);
    const sorted = catCards.sort((a, b) => b.inclusionRate - a.inclusionRate);
    for (const card of sorted) {
      const rate = card.inclusionRate > 0 ? ` (${card.inclusionRate}% of decks)` : '';
      const price = card.price ? ` — ${card.price}` : '';
      lines.push(`- ${card.name}${rate}${price}`);
    }
    lines.push('');
  }

  lines.push(`Use these recommendations as a starting point. Build a complete, legal 100-card Commander deck.`);
  lines.push(`Include the commander, appropriate mana base, and explain your card choices.`);
  lines.push(`Output the deck in a structured format with categories and quantities.`);

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
