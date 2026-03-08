// ─── Realtor Scraper — Playwright-based Redfin + Zillow listing reader ────────
// Launches a headful Chromium browser, lets the user navigate to a target area,
// then scrapes property listings from BOTH Redfin and Zillow for CMA data:
// address, price, sqft, beds/baths, days on market, and recent sales nearby.

import { chromium, type Browser, type Page } from 'playwright';
import { resolve } from 'node:path';

export interface PropertyData {
  source: 'redfin' | 'zillow' | 'unknown';
  address: string;
  price: string;
  beds: string;
  baths: string;
  sqft: string;
  daysOnMarket: string;
  pricePerSqft: string;
  status: string;
  details: string;
}

const USER_DATA_DIR = resolve(import.meta.dirname ?? '.', '.realtor-session');
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
export async function navigateToRedfin(page: Page, searchQuery: string): Promise<void> {
  await page.goto('https://www.redfin.com', { waitUntil: 'domcontentloaded', timeout: LOAD_TIMEOUT_MS });

  // Type the query into Redfin's search box and submit
  const searchInput = page.locator('#search-box-input, input[type="search"], input[placeholder*="Search"], input[placeholder*="Address"]').first();
  await searchInput.waitFor({ state: 'visible', timeout: 15_000 });
  await searchInput.click();
  await searchInput.fill(searchQuery);
  await page.waitForTimeout(1500);
  await page.keyboard.press('Enter');
  await page.waitForTimeout(5000);
}

/**
 * Navigate to Zillow and auto-search for the given query. Opens in a new tab.
 */
export async function navigateToZillow(page: Page, searchQuery: string): Promise<Page> {
  const context = page.context();
  const zillowPage = await context.newPage();
  await zillowPage.goto('https://www.zillow.com', { waitUntil: 'domcontentloaded', timeout: LOAD_TIMEOUT_MS });

  // Type the query into Zillow's search box and submit
  const searchInput = zillowPage.locator('input[type="search"], input[placeholder*="Search"], input[placeholder*="Address"], #search-box-input').first();
  await searchInput.waitFor({ state: 'visible', timeout: 15_000 });
  await searchInput.click();
  await searchInput.fill(searchQuery);
  await zillowPage.waitForTimeout(1500);
  await zillowPage.keyboard.press('Enter');
  await zillowPage.waitForTimeout(5000);

  return zillowPage;
}

// ═══════════════════════════════════════════════════════════════════════════════
// Redfin scraping — multi-strategy with fallbacks
// ═══════════════════════════════════════════════════════════════════════════════

export async function scrapeRedfin(page: Page): Promise<PropertyData[]> {
  await page.waitForTimeout(3000);

  const listings = await page.evaluate(() => {
    const results: {
      source: 'redfin';
      address: string;
      price: string;
      beds: string;
      baths: string;
      sqft: string;
      daysOnMarket: string;
      pricePerSqft: string;
      status: string;
      details: string;
    }[] = [];

    // Strategy 1: Redfin HomeCard selectors
    const cards = document.querySelectorAll(
      '.HomeCardContainer, .MapHomeCard, [data-rf-test-id="mapHomeCard"], .bottomV2'
    );

    for (const card of cards) {
      const address =
        (card.querySelector('.homeAddressV2, .link-and-anchor, [data-rf-test-id="abp-homeinfo-homeAddress"]')?.textContent?.trim() ?? '') ||
        (card.querySelector('.homecardV2 .homeAddressV2')?.textContent?.trim() ?? '') ||
        (card.querySelector('a[href*="/home/"]')?.textContent?.trim() ?? '');

      const price =
        (card.querySelector('.homecardV2 .homecardV2Price, .bp-Homecard__Price--value, .priceEstimate, span[data-rf-test-id="abp-price"]')?.textContent?.trim() ?? '') ||
        (card.querySelector('.price')?.textContent?.trim() ?? '');

      // Stats row: beds, baths, sqft
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

      // Days on market
      let daysOnMarket = '';
      const domEl = card.querySelector('.dom, .timeOnRedfin, [data-rf-test-id="abp-dom"]');
      if (domEl) {
        const domText = (domEl?.textContent?.trim() ?? '');
        const domMatch = domText.match(/(\d+)\s*(?:day|d)/i);
        if (domMatch) daysOnMarket = domMatch[1]!;
      }

      // Price per sqft
      let pricePerSqft = '';
      const priceSqftEl = card.querySelector('.pricePerSqFt, .price-sqft');
      if (priceSqftEl) pricePerSqft = (priceSqftEl?.textContent?.trim() ?? '');

      // Status (Active, Pending, Sold, etc.)
      let status = '';
      const statusEl = card.querySelector('.labelLine, .homecardV2Label, .listingRemarks');
      if (statusEl) status = (statusEl?.textContent?.trim() ?? '');

      // Additional details
      const detailParts: string[] = [];
      const typeEl = card.querySelector('.HomeStatsV2 .propertyType, .property-type');
      if (typeEl) detailParts.push(typeEl?.textContent?.trim() ?? '');
      const brokerEl = card.querySelector('.broker, .branding');
      if (brokerEl) detailParts.push(brokerEl?.textContent?.trim() ?? '');

      if (address || price) {
        results.push({
          source: 'redfin',
          address: address || '(address not found)',
          price: price || '(price not listed)',
          beds,
          baths,
          sqft,
          daysOnMarket,
          pricePerSqft,
          status,
          details: detailParts.join(' | ') || statsLine,
        });
      }
    }

    // Strategy 2: Redfin recently sold page or table view
    if (results.length === 0) {
      const tableRows = document.querySelectorAll('.tableList .tableRow, .ReactDataTable .rt-tr');
      for (const row of tableRows) {
        const fullText = (row as HTMLElement).innerText?.trim() ?? '';
        if (fullText && fullText.length > 20) {
          const priceMatch = fullText.match(/\$[\d,]+(?:\.\d+)?/);
          const bedMatch = fullText.match(/(\d+(?:\.\d+)?)\s*(?:bd|bed|BR)/i);
          const bathMatch = fullText.match(/(\d+(?:\.\d+)?)\s*(?:ba|bath)/i);
          const sqftMatch = fullText.match(/([\d,]+)\s*(?:sq\s*ft|sqft)/i);
          const domMatch = fullText.match(/(\d+)\s*(?:day|d)\s*(?:on|ago)/i);

          results.push({
            source: 'redfin',
            address: fullText.split('\n')[0]?.trim().slice(0, 120) ?? '(unknown)',
            price: priceMatch?.[0] ?? '(price not found)',
            beds: bedMatch?.[1] ?? '',
            baths: bathMatch?.[1] ?? '',
            sqft: sqftMatch?.[1] ?? '',
            daysOnMarket: domMatch?.[1] ?? '',
            pricePerSqft: '',
            status: '',
            details: fullText.slice(0, 300),
          });
        }
      }
    }

    // Strategy 3: Generic fallback
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
            source: 'redfin',
            address: fullText.split('\n')[0]?.trim().slice(0, 120) ?? '(unknown)',
            price: priceMatch?.[0] ?? '(price not found)',
            beds: bedMatch?.[1] ?? '',
            baths: bathMatch?.[1] ?? '',
            sqft: sqftMatch?.[1] ?? '',
            daysOnMarket: '',
            pricePerSqft: '',
            status: '',
            details: fullText.slice(0, 300),
          });
        }
      }
    }

    return results;
  });

  return listings;
}

// ═══════════════════════════════════════════════════════════════════════════════
// Zillow scraping — multi-strategy with fallbacks
// ═══════════════════════════════════════════════════════════════════════════════

export async function scrapeZillow(page: Page): Promise<PropertyData[]> {
  await page.waitForTimeout(3000);

  const listings = await page.evaluate(() => {
    const results: {
      source: 'zillow';
      address: string;
      price: string;
      beds: string;
      baths: string;
      sqft: string;
      daysOnMarket: string;
      pricePerSqft: string;
      status: string;
      details: string;
    }[] = [];

    // Strategy 1: Zillow property cards
    const cards = document.querySelectorAll(
      '[data-test="property-card"], article.property-card, .ListItem, .list-card, .StyledPropertyCardDataWrapper'
    );

    for (const card of cards) {
      const address =
        (card.querySelector('[data-test="property-card-addr"], address, .list-card-addr, .property-card-link')?.textContent?.trim() ?? '') ||
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

      // Days on Zillow
      let daysOnMarket = '';
      const domEl = card.querySelector('.days-on-zillow, [data-test="days-on-zillow"]');
      if (domEl) {
        const domText = (domEl?.textContent?.trim() ?? '');
        const domMatch = domText.match(/(\d+)\s*(?:day|d)/i);
        if (domMatch) daysOnMarket = domMatch[1]!;
      }

      // Status badge
      let status = '';
      const statusEl = card.querySelector('.StyledPropertyCardBadge, .list-card-statusText, [class*="StatusBadge"]');
      if (statusEl) status = (statusEl?.textContent?.trim() ?? '');

      if (address || price) {
        results.push({
          source: 'zillow',
          address: address || '(address not found)',
          price: price || '(price not listed)',
          beds,
          baths,
          sqft,
          daysOnMarket,
          pricePerSqft: '',
          status,
          details: detailText,
        });
      }
    }

    // Strategy 2: Zillow search result list items
    if (results.length === 0) {
      const listItems = document.querySelectorAll(
        '[id^="zpid_"], .property-card-data, ul.photo-cards li'
      );

      for (const item of listItems) {
        const fullText = (item as HTMLElement).innerText?.trim() ?? '';
        if (fullText && fullText.length > 20) {
          const priceMatch = fullText.match(/\$[\d,]+(?:\.\d+)?/);
          const bedMatch = fullText.match(/(\d+(?:\.\d+)?)\s*(?:bd|bed|bds|br)/i);
          const bathMatch = fullText.match(/(\d+(?:\.\d+)?)\s*(?:ba|bath|bas)/i);
          const sqftMatch = fullText.match(/([\d,]+)\s*(?:sq\s*ft|sqft)/i);
          const domMatch = fullText.match(/(\d+)\s*(?:day|d)\s*(?:on|ago)/i);

          results.push({
            source: 'zillow',
            address: fullText.split('\n')[0]?.trim().slice(0, 120) ?? '(unknown)',
            price: priceMatch?.[0] ?? '(price not found)',
            beds: bedMatch?.[1] ?? '',
            baths: bathMatch?.[1] ?? '',
            sqft: sqftMatch?.[1] ?? '',
            daysOnMarket: domMatch?.[1] ?? '',
            pricePerSqft: '',
            status: '',
            details: fullText.slice(0, 300),
          });
        }
      }
    }

    // Strategy 3: Generic fallback for Zillow
    if (results.length === 0) {
      const genericCards = document.querySelectorAll(
        '[class*="listing"], [class*="property"], [class*="result-list"]'
      );
      for (const card of genericCards) {
        const fullText = (card as HTMLElement).innerText?.trim() ?? '';
        if (fullText && fullText.length > 20) {
          const priceMatch = fullText.match(/\$[\d,]+(?:\.\d+)?/);
          const bedMatch = fullText.match(/(\d+(?:\.\d+)?)\s*(?:bd|bed|bds|br)/i);
          const bathMatch = fullText.match(/(\d+(?:\.\d+)?)\s*(?:ba|bath|bas)/i);
          const sqftMatch = fullText.match(/([\d,]+)\s*(?:sq\s*ft|sqft)/i);

          results.push({
            source: 'zillow',
            address: fullText.split('\n')[0]?.trim().slice(0, 120) ?? '(unknown)',
            price: priceMatch?.[0] ?? '(price not found)',
            beds: bedMatch?.[1] ?? '',
            baths: bathMatch?.[1] ?? '',
            sqft: sqftMatch?.[1] ?? '',
            daysOnMarket: '',
            pricePerSqft: '',
            status: '',
            details: fullText.slice(0, 300),
          });
        }
      }
    }

    return results;
  });

  return listings;
}

// ═══════════════════════════════════════════════════════════════════════════════
// Formatting — build CMA prompt from scraped data
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Format scraped property data into a prompt for the CMA squad.
 */
export function formatPropertiesForPrompt(
  redfinListings: PropertyData[],
  zillowListings: PropertyData[],
  targetArea: string,
): string {
  const total = redfinListings.length + zillowListings.length;

  if (total === 0) {
    return 'I couldn\'t read any property listings from either site. The pages may still be loading or the DOM structure may have changed.';
  }

  const lines: string[] = [
    `Build a Comparative Market Analysis (CMA) sales package for the **${targetArea}** area.`,
    `Scraped ${redfinListings.length} listing(s) from Redfin and ${zillowListings.length} listing(s) from Zillow.\n`,
  ];

  function formatListing(l: PropertyData, i: number): string {
    const bedBath = [
      l.beds ? `${l.beds} bed` : '',
      l.baths ? `${l.baths} bath` : '',
      l.sqft ? `${l.sqft} sqft` : '',
    ].filter(Boolean).join(', ');

    const extras = [
      l.daysOnMarket ? `${l.daysOnMarket} days on market` : '',
      l.pricePerSqft ? `$${l.pricePerSqft}/sqft` : '',
      l.status ? `Status: ${l.status}` : '',
    ].filter(Boolean).join(' | ');

    return (
      `${i + 1}. **${l.address}** [${l.source.toUpperCase()}]\n` +
      `   Price: ${l.price}` +
      (bedBath ? ` | ${bedBath}` : '') +
      (extras ? `\n   ${extras}` : '') +
      (l.details ? `\n   Details: ${l.details}` : '')
    );
  }

  if (redfinListings.length > 0) {
    lines.push('### Redfin Listings\n');
    redfinListings.forEach((l, i) => lines.push(formatListing(l, i)));
    lines.push('');
  }

  if (zillowListings.length > 0) {
    lines.push('### Zillow Listings\n');
    zillowListings.forEach((l, i) => lines.push(formatListing(l, i)));
    lines.push('');
  }

  lines.push(
    '\nPlease have all four specialists work together to build a complete, client-ready ' +
    'Comparative Market Analysis package: scan the market data, identify true comparables, ' +
    'profile the neighborhood, and assemble a polished presentation with pricing recommendations.'
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
