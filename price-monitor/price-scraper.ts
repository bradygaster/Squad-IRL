// ─── Price Scraper — Playwright-based product/price reader ────────────────────
// Launches a headful Chromium browser with a persistent session. The user
// navigates to any shopping page (Amazon wishlist, Best Buy deals, etc.),
// presses Enter, and we scrape visible product names, prices, and URLs.

import { chromium, type Browser, type Page } from 'playwright';
import { resolve } from 'node:path';

export interface ScrapedProduct {
  name: string;
  price: string;
  url: string;
  onSale: boolean;
  originalPrice: string;
}

const USER_DATA_DIR = resolve(import.meta.dirname ?? '.', '.price-session');
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
 * Navigate to Amazon and auto-search for the given query.
 */
export async function navigateToStore(page: Page, searchQuery: string): Promise<void> {
  await page.goto('https://www.amazon.com', {
    waitUntil: 'domcontentloaded',
    timeout: LOAD_TIMEOUT_MS,
  });

  const searchInput = page.locator('#twotabsearchtextbox, input[type="search"], input[name="field-keywords"], input[placeholder*="Search"]').first();
  await searchInput.waitFor({ state: 'visible', timeout: 15_000 });
  await searchInput.click();
  await searchInput.fill(searchQuery);
  await page.waitForTimeout(1500);
  await page.keyboard.press('Enter');
  await page.waitForTimeout(5000);
}

/**
 * Scrape visible products from the current page.
 *
 * Shopping sites have wildly different DOM structures. We try several
 * strategies: Amazon product cards, generic e-commerce patterns, and a
 * final fallback that looks for any element with a price-like string
 * near a product-name-like string.
 */
export async function scrapeProducts(page: Page): Promise<ScrapedProduct[]> {
  // Give dynamic content a moment to render
  await page.waitForTimeout(2000);

  const currentUrl = page.url();

  const products = await page.evaluate((pageUrl: string) => {
    const results: {
      name: string;
      price: string;
      url: string;
      onSale: boolean;
      originalPrice: string;
    }[] = [];

    const seen = new Set<string>();

    // ── Strategy 1: Amazon product cards ──
    const amazonCards = document.querySelectorAll(
      '[data-component-type="s-search-result"], .s-result-item[data-asin], .a-carousel-card'
    );
    for (const card of amazonCards) {
      const el = card as HTMLElement;

      const nameEl =
        el.querySelector('h2 a span') ??
        el.querySelector('h2 span') ??
        el.querySelector('.a-text-normal') ??
        el.querySelector('[class*="title"] a');
      const name = nameEl?.textContent?.trim() ?? '';

      // Amazon price: whole + fraction
      const wholeEl = el.querySelector('.a-price .a-price-whole');
      const fractionEl = el.querySelector('.a-price .a-price-fraction');
      let price = '';
      if (wholeEl) {
        const whole = wholeEl.textContent?.replace(/[^0-9,]/g, '') ?? '';
        const fraction = fractionEl?.textContent?.replace(/[^0-9]/g, '') ?? '00';
        price = `$${whole}.${fraction}`;
      }

      // Fallback: a-offscreen price
      if (!price) {
        const offscreen = el.querySelector('.a-price .a-offscreen');
        price = offscreen?.textContent?.trim() ?? '';
      }

      const linkEl = el.querySelector('h2 a') ?? el.querySelector('a[href*="/dp/"]');
      const url = linkEl?.getAttribute('href') ?? '';

      // Sale detection: look for a strikethrough/original price
      const origEl = el.querySelector('.a-text-price .a-offscreen') ??
        el.querySelector('.a-price[data-a-strike="true"] .a-offscreen');
      const originalPrice = origEl?.textContent?.trim() ?? '';
      const onSale = !!originalPrice;

      {
        const trimName = name.trim().slice(0, 300);
        const trimPrice = price.trim();
        if (trimName && trimName.length >= 3 && trimPrice) {
          const key = `${trimName}::${trimPrice}`;
          if (!seen.has(key)) {
            seen.add(key);
            let resolvedUrl = url.trim();
            if (resolvedUrl && !resolvedUrl.startsWith('http')) {
              try { resolvedUrl = new URL(resolvedUrl, pageUrl).href; } catch { resolvedUrl = ''; }
            }
            results.push({ name: trimName, price: trimPrice, url: resolvedUrl, onSale, originalPrice: originalPrice.trim() });
          }
        }
      }
    }

    // ── Strategy 2: Amazon wishlist items ──
    if (results.length === 0) {
      const wishlistItems = document.querySelectorAll(
        '#g-items .g-item-sortable, [id^="itemInfo_"]'
      );
      for (const item of wishlistItems) {
        const el = item as HTMLElement;
        const nameEl = el.querySelector('[id^="itemName_"]') ?? el.querySelector('a[id*="itemName"]');
        const name = nameEl?.textContent?.trim() ?? '';
        const priceEl = el.querySelector('.a-price .a-offscreen') ??
          el.querySelector('[id^="itemPrice_"]') ??
          el.querySelector('.a-color-price');
        const price = priceEl?.textContent?.trim() ?? '';
        const url = nameEl?.getAttribute('href') ?? '';
        {
          const trimName = name.trim().slice(0, 300);
          const trimPrice = price.trim();
          if (trimName && trimName.length >= 3 && trimPrice) {
            const key = `${trimName}::${trimPrice}`;
            if (!seen.has(key)) {
              seen.add(key);
              let resolvedUrl = url.trim();
              if (resolvedUrl && !resolvedUrl.startsWith('http')) {
                try { resolvedUrl = new URL(resolvedUrl, pageUrl).href; } catch { resolvedUrl = ''; }
              }
              results.push({ name: trimName, price: trimPrice, url: resolvedUrl, onSale: false, originalPrice: '' });
            }
          }
        }
      }
    }

    // ── Strategy 3: Best Buy product cards ──
    if (results.length === 0) {
      const bbCards = document.querySelectorAll('.sku-item, .list-item, [class*="productCard"]');
      for (const card of bbCards) {
        const el = card as HTMLElement;
        const nameEl = el.querySelector('.sku-title a, .sku-header a, h4 a');
        const name = nameEl?.textContent?.trim() ?? '';
        const priceEl = el.querySelector('[class*="priceView-customer-price"] span, .priceView-hero-price span');
        const price = priceEl?.textContent?.trim() ?? '';
        const url = nameEl?.getAttribute('href') ?? '';
        const origEl = el.querySelector('.pricing-price__regular-price, [class*="was-price"]');
        const originalPrice = origEl?.textContent?.trim() ?? '';
        {
          const trimName = name.trim().slice(0, 300);
          const trimPrice = price.trim();
          if (trimName && trimName.length >= 3 && trimPrice) {
            const key = `${trimName}::${trimPrice}`;
            if (!seen.has(key)) {
              seen.add(key);
              let resolvedUrl = url.trim();
              if (resolvedUrl && !resolvedUrl.startsWith('http')) {
                try { resolvedUrl = new URL(resolvedUrl, pageUrl).href; } catch { resolvedUrl = ''; }
              }
              results.push({ name: trimName, price: trimPrice, url: resolvedUrl, onSale: !!originalPrice, originalPrice: originalPrice.trim() });
            }
          }
        }
      }
    }

    // ── Strategy 4: Generic e-commerce fallback ──
    if (results.length === 0) {
      const genericCards = document.querySelectorAll(
        '[class*="product"], [class*="item-card"], [class*="deal-card"], [data-testid*="product"], article'
      );
      for (const card of genericCards) {
        const el = card as HTMLElement;

        // Look for product name in headings or links
        const nameEl =
          el.querySelector('h2 a, h3 a, h4 a, h2, h3, h4, [class*="title"] a, [class*="name"]');
        const name = nameEl?.textContent?.trim() ?? '';

        // Look for a price pattern
        const allText = el.innerText ?? '';
        const priceMatch = allText.match(/\$[\d,]+\.?\d{0,2}/);
        const price = priceMatch?.[0] ?? '';

        const linkEl = el.querySelector('a[href]');
        const url = linkEl?.getAttribute('href') ?? '';

        {
          const trimName = name.trim().slice(0, 300);
          const trimPrice = price.trim();
          if (trimName && trimName.length >= 3 && trimPrice) {
            const key = `${trimName}::${trimPrice}`;
            if (!seen.has(key)) {
              seen.add(key);
              let resolvedUrl = url.trim();
              if (resolvedUrl && !resolvedUrl.startsWith('http')) {
                try { resolvedUrl = new URL(resolvedUrl, pageUrl).href; } catch { resolvedUrl = ''; }
              }
              results.push({ name: trimName, price: trimPrice, url: resolvedUrl, onSale: false, originalPrice: '' });
            }
          }
        }
      }
    }

    // ── Strategy 5: Last-resort — scan all elements for price patterns ──
    if (results.length === 0) {
      const allElements = document.querySelectorAll('*');
      const priceRegex = /\$[\d,]+\.?\d{0,2}/;

      for (const el of allElements) {
        const text = (el as HTMLElement).innerText?.trim() ?? '';
        if (!text || text.length > 500 || text.length < 5) continue;

        const match = text.match(priceRegex);
        if (!match) continue;

        // Find a nearby heading or link for the product name
        const parent = el.closest('article, section, div, li, tr');
        if (!parent) continue;

        const nameEl =
          parent.querySelector('h1, h2, h3, h4, a[href], [class*="title"], [class*="name"]');
        const name = nameEl?.textContent?.trim() ?? '';
        const linkEl = parent.querySelector('a[href]');
        const url = linkEl?.getAttribute('href') ?? '';

        {
          const trimName = name.trim().slice(0, 300);
          const trimPrice = match[0].trim();
          if (trimName && trimName.length >= 3 && trimPrice) {
            const key = `${trimName}::${trimPrice}`;
            if (!seen.has(key)) {
              seen.add(key);
              let resolvedUrl = url.trim();
              if (resolvedUrl && !resolvedUrl.startsWith('http')) {
                try { resolvedUrl = new URL(resolvedUrl, pageUrl).href; } catch { resolvedUrl = ''; }
              }
              results.push({ name: trimName, price: trimPrice, url: resolvedUrl, onSale: false, originalPrice: '' });
            }
          }
        }
      }
    }

    return results;
  }, currentUrl);

  return products;
}

/**
 * Format scraped products into a prompt suitable for the deal analysis squad.
 */
export function formatProductsForPrompt(products: ScrapedProduct[], pageUrl: string): string {
  if (products.length === 0) {
    return 'I couldn\'t find any products on this page. The DOM may have changed or the page may still be loading.';
  }

  const lines: string[] = [
    `Analyze these ${products.length} product(s) scraped from: ${pageUrl}\n`,
  ];

  for (let i = 0; i < products.length; i++) {
    const p = products[i]!;
    const saleTag = p.onSale ? ` [ON SALE — was ${p.originalPrice}]` : '';
    const urlPart = p.url ? `\n   URL: ${p.url}` : '';
    lines.push(
      `${i + 1}. ${p.name}${saleTag}\n` +
      `   Price: ${p.price}${urlPart}`
    );
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
