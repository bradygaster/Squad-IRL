// ─── Listing Scraper — Playwright-based real estate listing reader ─────────────
// Launches a headful Chromium browser, lets the user navigate to a Redfin or
// Zillow search results page, then scrapes the visible listing cards into
// structured property objects.

import { chromium, type Browser, type Page } from 'playwright';
import { resolve } from 'node:path';

export interface PropertyListing {
  address: string;
  price: string;
  beds: string;
  baths: string;
  sqft: string;
  details: string;
}

const USER_DATA_DIR = resolve(import.meta.dirname ?? '.', '.realestate-session');
const LOAD_TIMEOUT_MS = 120_000;

/**
 * Launch a headful Chromium browser with a persistent profile so the user
 * doesn't have to re-authenticate every run.
 */
export async function launchBrowser(): Promise<{ browser: Browser; page: Page }> {
  const context = await chromium.launchPersistentContext(USER_DATA_DIR, {
    headless: false,
    viewport: { width: 1400, height: 900 },
    args: ['--disable-blink-features=AutomationControlled'],
  });

  const page = context.pages()[0] ?? await context.newPage();
  return { browser: context.browser()!, page };
}

/**
 * Navigate to Redfin and auto-search for the given query.
 */
export async function navigateToSearch(page: Page, searchQuery: string): Promise<void> {
  await page.goto('https://www.redfin.com', { waitUntil: 'domcontentloaded', timeout: LOAD_TIMEOUT_MS });

  const searchInput = page.locator('#search-box-input, input[type="search"], input[placeholder*="Search"], input[placeholder*="Address"]').first();
  await searchInput.waitFor({ state: 'visible', timeout: 15_000 });
  await searchInput.click();
  await searchInput.fill(searchQuery);
  await page.waitForTimeout(1500);
  await page.keyboard.press('Enter');
  await page.waitForTimeout(5000);
}

/**
 * Scrape visible property listing cards from Redfin or Zillow search results.
 *
 * Real estate sites change their DOM frequently, so we try multiple selector
 * strategies with fallbacks.
 */
export async function scrapeListings(page: Page): Promise<PropertyListing[]> {
  // Give the page time to finish rendering dynamic content
  await page.waitForTimeout(3000);

  const listings = await page.evaluate(() => {
    const results: {
      address: string;
      price: string;
      beds: string;
      baths: string;
      sqft: string;
      details: string;
    }[] = [];

    // ════════════════════════════════════════════════════════════════════════
    // Strategy 1: Redfin listing cards
    // ════════════════════════════════════════════════════════════════════════
    const redfinCards = document.querySelectorAll(
      '.HomeCardContainer, .MapHomeCard, [data-rf-test-id="mapHomeCard"], .bottomV2'
    );

    for (const card of redfinCards) {
      const address =
        (card.querySelector('.homeAddressV2, .link-and-anchor, [data-rf-test-id="abp-homeinfo-homeAddress"]')?.textContent?.trim() ?? '') ||
        (card.querySelector('.homecardV2 .homeAddressV2')?.textContent?.trim() ?? '') ||
        (card.querySelector('a[href*="/home/"]')?.textContent?.trim() ?? '');

      const price =
        (card.querySelector('.homecardV2 .homecardV2Price, .bp-Homecard__Price--value, .priceEstimate, span[data-rf-test-id="abp-price"]')?.textContent?.trim() ?? '') ||
        (card.querySelector('.price')?.textContent?.trim() ?? '');

      // Stats: beds, baths, sqft — often in a stats row
      const statsEls = card.querySelectorAll('.HomeStatsV2 .stats, .bp-Homecard__Stats--item, .HomeStatsV2 span');
      const statsTexts: string[] = [];
      for (const s of statsEls) {
        const t = (s?.textContent?.trim() ?? '');
        if (t) statsTexts.push(t);
      }
      const statsLine = statsTexts.join(' ') || (card.querySelector('.HomeStatsV2')?.textContent?.trim() ?? '');

      let beds = '';
      let baths = '';
      let sqft = '';

      const bedMatch = statsLine.match(/(\d+(?:\.\d+)?)\s*(?:bd|bed|BR)/i);
      const bathMatch = statsLine.match(/(\d+(?:\.\d+)?)\s*(?:ba|bath)/i);
      const sqftMatch = statsLine.match(/([\d,]+)\s*(?:sq\s*ft|sqft)/i);

      if (bedMatch) beds = bedMatch[1]!;
      if (bathMatch) baths = bathMatch[1]!;
      if (sqftMatch) sqft = sqftMatch[1]!;

      // Collect remaining details
      const detailParts: string[] = [];
      const typeEl = card.querySelector('.HomeStatsV2 .propertyType, .property-type');
      if (typeEl) detailParts.push(typeEl?.textContent?.trim() ?? '');
      const brokerEl = card.querySelector('.broker, .branding');
      if (brokerEl) detailParts.push(brokerEl?.textContent?.trim() ?? '');

      if (address || price) {
        results.push({
          address: address || '(address not found)',
          price: price || '(price not listed)',
          beds,
          baths,
          sqft,
          details: detailParts.join(' | ') || statsLine,
        });
      }
    }

    // ════════════════════════════════════════════════════════════════════════
    // Strategy 2: Zillow listing cards
    // ════════════════════════════════════════════════════════════════════════
    if (results.length === 0) {
      const zillowCards = document.querySelectorAll(
        '[data-test="property-card"], article.property-card, .ListItem, .list-card'
      );

      for (const card of zillowCards) {
        const address =
          (card.querySelector('[data-test="property-card-addr"], address, .list-card-addr')?.textContent?.trim() ?? '') ||
          (card.querySelector('a[data-test="property-card-link"]')?.textContent?.trim() ?? '');

        const price =
          (card.querySelector('[data-test="property-card-price"], .list-card-price')?.textContent?.trim() ?? '') ||
          (card.querySelector('span[data-test="property-card-price"]')?.textContent?.trim() ?? '');

        const detailsEl = card.querySelector(
          '[data-test="property-card-details"], .list-card-details, .StyledPropertyCardDataArea-anchor'
        );
        const detailText = (detailsEl?.textContent?.trim() ?? '');

        let beds = '';
        let baths = '';
        let sqft = '';

        const bedMatch = detailText.match(/(\d+(?:\.\d+)?)\s*(?:bd|bed|bds|br)/i);
        const bathMatch = detailText.match(/(\d+(?:\.\d+)?)\s*(?:ba|bath|bas)/i);
        const sqftMatch = detailText.match(/([\d,]+)\s*(?:sq\s*ft|sqft)/i);

        if (bedMatch) beds = bedMatch[1]!;
        if (bathMatch) baths = bathMatch[1]!;
        if (sqftMatch) sqft = sqftMatch[1]!;

        if (address || price) {
          results.push({
            address: address || '(address not found)',
            price: price || '(price not listed)',
            beds,
            baths,
            sqft,
            details: detailText,
          });
        }
      }
    }

    // ════════════════════════════════════════════════════════════════════════
    // Strategy 3: Generic fallback — grab any card-like elements
    // ════════════════════════════════════════════════════════════════════════
    if (results.length === 0) {
      const genericCards = document.querySelectorAll(
        '[class*="listing"], [class*="property"], [class*="home-card"], [class*="HomeCard"]'
      );

      for (const card of genericCards) {
        const fullText = (card as HTMLElement).innerText?.trim() ?? '';
        if (fullText && fullText.length > 20) {
          const priceMatch = fullText.match(/\$[\d,]+(?:\.\d+)?/);
          const bedMatch = fullText.match(/(\d+(?:\.\d+)?)\s*(?:bd|bed|BR)/i);
          const bathMatch = fullText.match(/(\d+(?:\.\d+)?)\s*(?:ba|bath)/i);
          const sqftMatch = fullText.match(/([\d,]+)\s*(?:sq\s*ft|sqft)/i);

          results.push({
            address: fullText.split('\n')[0]?.trim().slice(0, 120) ?? '(unknown)',
            price: priceMatch?.[0] ?? '(price not found)',
            beds: bedMatch?.[1] ?? '',
            baths: bathMatch?.[1] ?? '',
            sqft: sqftMatch?.[1] ?? '',
            details: fullText.slice(0, 300),
          });
        }
      }
    }

    return results;
  });

  return listings;
}

/**
 * Format scraped listings into a prompt suitable for the analysis squad.
 */
export function formatListingsForPrompt(listings: PropertyListing[]): string {
  if (listings.length === 0) {
    return 'I couldn\'t read any property listings from the page. The page may still be loading or the DOM structure may have changed.';
  }

  const lines: string[] = [
    `Analyze these ${listings.length} property listings scraped from a real estate search:\n`,
  ];

  for (let i = 0; i < listings.length; i++) {
    const l = listings[i]!;
    const bedBath = [
      l.beds ? `${l.beds} bed` : '',
      l.baths ? `${l.baths} bath` : '',
      l.sqft ? `${l.sqft} sqft` : '',
    ].filter(Boolean).join(', ');

    lines.push(
      `${i + 1}. **${l.address}**\n` +
      `   Price: ${l.price}` +
      (bedBath ? ` | ${bedBath}` : '') +
      (l.details ? `\n   Details: ${l.details}` : '')
    );
  }

  lines.push(
    '\nPlease have all four specialists analyze these listings: evaluate each property, ' +
    'run investment financial scenarios, score the neighborhoods, and produce a final ' +
    'ranked opportunity report with your top recommendations.'
  );

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
