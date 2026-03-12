// ─── Chart Reader — Playwright-based TradingView signal extractor ─────────────
// Launches a headful Chromium browser, navigates to the TradingView SPX chart,
// and extracts technical signals: SPX price, VWAP, EMA 9/21, RSI, and VIX.
// Falls back to demo data if TradingView can't be reached.

import { chromium, type Browser, type Page } from 'playwright';
import { resolve } from 'node:path';

// ═══════════════════════════════════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════════════════════════════════

export interface ChartSignals {
  spxPrice: number;
  vwapStatus: string;       // 'ABOVE' | 'BELOW' | 'TESTING'
  ema9: number;
  ema21: number;
  emaAlignment: string;     // 'BULLISH' | 'BEARISH' | 'NEUTRAL'
  rsi: number;
  rsiZone: string;          // 'OVERBOUGHT' | 'BULLISH' | 'NEUTRAL' | 'BEARISH' | 'OVERSOLD'
  vixLevel: number;
  vixRegime: string;        // 'LOW' | 'MODERATE' | 'HIGH' | 'EXTREME'
  timestamp: string;
}

// Persistent browser profile so TradingView stays logged in across runs
const USER_DATA_DIR = resolve(import.meta.dirname ?? '.', '.tv-session');
const LOAD_TIMEOUT_MS = 120_000;

// ═══════════════════════════════════════════════════════════════════════════════
// Demo mode — realistic sample data when TradingView isn't available
// ═══════════════════════════════════════════════════════════════════════════════

const DEMO_SIGNALS: ChartSignals[] = [
  {
    spxPrice: 5842.67,
    vwapStatus: 'ABOVE',
    ema9: 5840.12,
    ema21: 5836.45,
    emaAlignment: 'BULLISH',
    rsi: 58.3,
    rsiZone: 'BULLISH',
    vixLevel: 17.2,
    vixRegime: 'MODERATE',
    timestamp: new Date().toISOString(),
  },
  {
    spxPrice: 5845.30,
    vwapStatus: 'ABOVE',
    ema9: 5841.88,
    ema21: 5837.10,
    emaAlignment: 'BULLISH',
    rsi: 61.7,
    rsiZone: 'BULLISH',
    vixLevel: 16.9,
    vixRegime: 'MODERATE',
    timestamp: new Date().toISOString(),
  },
  {
    spxPrice: 5847.15,
    vwapStatus: 'ABOVE',
    ema9: 5843.50,
    ema21: 5838.20,
    emaAlignment: 'BULLISH',
    rsi: 64.2,
    rsiZone: 'BULLISH',
    vixLevel: 16.5,
    vixRegime: 'MODERATE',
    timestamp: new Date().toISOString(),
  },
];

let demoIndex = 0;

/** Get the next demo signal reading (cycles through sample data). */
export function getDemoSignals(): ChartSignals {
  const signals = { ...DEMO_SIGNALS[demoIndex % DEMO_SIGNALS.length]! };
  signals.timestamp = new Date().toISOString();
  // Add slight variation to make readings feel dynamic
  signals.spxPrice += (Math.random() - 0.4) * 3;
  signals.rsi += (Math.random() - 0.5) * 2;
  signals.vixLevel += (Math.random() - 0.5) * 0.5;
  signals.spxPrice = Math.round(signals.spxPrice * 100) / 100;
  signals.rsi = Math.round(signals.rsi * 10) / 10;
  signals.vixLevel = Math.round(signals.vixLevel * 10) / 10;
  demoIndex++;
  return signals;
}

// ═══════════════════════════════════════════════════════════════════════════════
// Browser management
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Launch a headful Chromium browser with a persistent profile so the user
 * doesn't have to re-authenticate with TradingView every run.
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
 * Navigate to TradingView SPX chart and wait for it to load.
 */
export async function navigateToSPX(page: Page): Promise<void> {
  await page.goto('https://www.tradingview.com/chart/?symbol=SP%3ASPX', {
    waitUntil: 'domcontentloaded',
    timeout: LOAD_TIMEOUT_MS,
  });

  // Wait for the chart container to appear
  try {
    await page.waitForSelector('[class*="chart-container"], [class*="chart-markup-table"], canvas', {
      state: 'visible',
      timeout: 30_000,
    });
  } catch {
    // Chart may use a different selector — continue anyway
  }

  // Give dynamic content time to render indicators
  await page.waitForTimeout(5000);
}

// ═══════════════════════════════════════════════════════════════════════════════
// Signal extraction
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Parse SPX price from the TradingView page title.
 * Title format: "SPX 6,803.43 ▲ +0.11% — TradingView"
 */
function parsePriceFromTitle(title: string): number | null {
  const match = title.match(/SPX\s+([\d,]+\.?\d*)/i);
  if (!match) return null;
  return parseFloat(match[1].replace(/,/g, ''));
}

/**
 * Classify RSI value into a zone.
 */
function classifyRSI(rsi: number): string {
  if (rsi >= 70) return 'OVERBOUGHT';
  if (rsi >= 50) return 'BULLISH';
  if (rsi >= 45) return 'NEUTRAL';
  if (rsi >= 30) return 'BEARISH';
  return 'OVERSOLD';
}

/**
 * Classify VIX level into a regime.
 */
function classifyVIXRegime(vix: number): string {
  if (vix > 30) return 'EXTREME';
  if (vix > 25) return 'HIGH';
  if (vix > 16) return 'MODERATE';
  return 'LOW';
}

/**
 * Read chart signals from the TradingView page.
 *
 * Extracts SPX price from the page title, then attempts to read indicator values
 * from the chart header/info panel. TradingView displays indicator values in hover
 * panels and header areas that can be queried from the DOM.
 *
 * Takes a screenshot for the Squad's reference.
 */
export async function readChartSignals(page: Page): Promise<ChartSignals> {
  // Screenshot for reference
  try {
    await page.screenshot({
      path: resolve(import.meta.dirname ?? '.', `spx-reading-${Date.now()}.png`),
      fullPage: false,
    });
  } catch {
    // Screenshot failure is non-critical
  }

  // Extract SPX price from page title
  const title = await page.title();
  const spxPrice = parsePriceFromTitle(title);

  if (!spxPrice || spxPrice < 1000 || spxPrice > 20000) {
    throw new Error(`Could not parse SPX price from page title: "${title}"`);
  }

  // Try to extract indicator values from TradingView's DOM
  const indicatorData = await page.evaluate(() => {
    const result: Record<string, string> = {};

    // Strategy 1: Look for indicator values in the header/legend area
    // TradingView shows indicator values in elements with specific data attributes
    const legendItems = document.querySelectorAll(
      '[class*="valuesWrapper"], [class*="legend"], [class*="pane-legend"], [data-name="legend-source-item"]'
    );

    for (const item of legendItems) {
      const text = item.textContent?.trim() ?? '';

      // Look for VWAP values
      if (text.includes('VWAP') || text.includes('vwap')) {
        const nums = text.match(/[\d,]+\.?\d*/g);
        if (nums?.length) result['vwap'] = nums[nums.length - 1];
      }

      // Look for EMA values
      if (text.includes('EMA') || text.includes('ema')) {
        const nums = text.match(/[\d,]+\.?\d*/g);
        if (nums && nums.length >= 2) {
          // Try to associate with period (9 or 21)
          if (text.includes('9')) result['ema9'] = nums[nums.length - 1];
          if (text.includes('21')) result['ema21'] = nums[nums.length - 1];
        } else if (nums?.length) {
          if (!result['ema9']) result['ema9'] = nums[nums.length - 1];
          else if (!result['ema21']) result['ema21'] = nums[nums.length - 1];
        }
      }

      // Look for RSI values
      if (text.includes('RSI') || text.includes('rsi')) {
        const nums = text.match(/[\d.]+/g);
        if (nums?.length) result['rsi'] = nums[nums.length - 1];
      }
    }

    // Strategy 2: Look in the Pine Script info table cells
    const cells = document.querySelectorAll('td, [class*="cell"]');
    const cellTexts: string[] = [];
    for (const cell of cells) {
      const t = cell.textContent?.trim();
      if (t) cellTexts.push(t);
    }

    // Walk cell text array looking for known labels with adjacent values
    for (let i = 0; i < cellTexts.length - 1; i++) {
      const label = cellTexts[i].toLowerCase();
      const value = cellTexts[i + 1];

      if (label.includes('vwap') && !result['vwap_status']) {
        result['vwap_status'] = value;
      }
      if (label.includes('ema') && label.includes('9') && !result['ema9']) {
        result['ema9'] = value;
      }
      if (label.includes('ema') && label.includes('21') && !result['ema21']) {
        result['ema21'] = value;
      }
      if ((label === 'rsi' || label === 'rsi val' || label.includes('rsi')) && !result['rsi']) {
        result['rsi'] = value;
      }
      if (label.includes('vix') && !result['vix']) {
        result['vix'] = value;
      }
      if (label.includes('overall') && !result['overall']) {
        result['overall'] = value;
      }
    }

    return result;
  });

  // Parse extracted values with sensible defaults
  const vwapValue = parseFloat(indicatorData['vwap']?.replace(/,/g, '') ?? '0');
  const ema9 = parseFloat(indicatorData['ema9']?.replace(/,/g, '') ?? '0');
  const ema21 = parseFloat(indicatorData['ema21']?.replace(/,/g, '') ?? '0');
  const rsi = parseFloat(indicatorData['rsi'] ?? '0');
  const vixLevel = parseFloat(indicatorData['vix'] ?? '0');

  // Determine VWAP status
  let vwapStatus = 'TESTING';
  if (indicatorData['vwap_status']) {
    const vs = indicatorData['vwap_status'].toUpperCase();
    if (vs.includes('ABOVE') || vs.includes('BULL')) vwapStatus = 'ABOVE';
    else if (vs.includes('BELOW') || vs.includes('BEAR')) vwapStatus = 'BELOW';
  } else if (vwapValue > 0) {
    const diff = ((spxPrice - vwapValue) / vwapValue) * 100;
    if (diff > 0.05) vwapStatus = 'ABOVE';
    else if (diff < -0.05) vwapStatus = 'BELOW';
  }

  // EMA alignment
  let emaAlignment = 'NEUTRAL';
  if (ema9 > 0 && ema21 > 0) {
    const spread = ema9 - ema21;
    if (spread > 0.5) emaAlignment = 'BULLISH';
    else if (spread < -0.5) emaAlignment = 'BEARISH';
  }

  // RSI zone
  const rsiZone = rsi > 0 ? classifyRSI(rsi) : 'NEUTRAL';

  // VIX regime
  const vixRegime = vixLevel > 0 ? classifyVIXRegime(vixLevel) : 'MODERATE';

  return {
    spxPrice,
    vwapStatus,
    ema9: ema9 || spxPrice - 2,   // Fallback: approximate from price
    ema21: ema21 || spxPrice - 5,
    emaAlignment,
    rsi: rsi || 50,
    rsiZone,
    vixLevel: vixLevel || 18,
    vixRegime,
    timestamp: new Date().toISOString(),
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// Prompt formatting
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Format collected chart signals into a clear text prompt for the Squad.
 */
export function formatSignalsForPrompt(signals: ChartSignals[], history: ChartSignals[] = []): string {
  const allReadings = [...history, ...signals];

  if (allReadings.length === 0) {
    return 'No signal readings were captured. The chart may not have loaded or TradingView was unreachable.';
  }

  const latest = allReadings[allReadings.length - 1]!;
  const now = new Date();
  const etHour = now.getUTCHours() - 4; // Approximate ET offset
  const etMinute = now.getUTCMinutes();
  const inWindow = etHour >= 14 && (etHour < 15 || (etHour === 15 && etMinute <= 15));

  const lines: string[] = [
    `## SPX 0DTE Pre-Trade Analysis Request`,
    ``,
    `**Signal readings collected:** ${allReadings.length}`,
    `**Latest reading:** ${latest.timestamp}`,
    `**Entry window (2:00–3:15 PM ET):** ${inWindow ? '✅ ACTIVE' : '⚠️ Outside window'}`,
    ``,
    `### Latest Signal Snapshot`,
    ``,
    `| Signal | Value | Status |`,
    `|--------|-------|--------|`,
    `| SPX Price | $${latest.spxPrice.toLocaleString('en-US', { minimumFractionDigits: 2 })} | — |`,
    `| VWAP | ${latest.vwapStatus} | ${latest.vwapStatus === 'ABOVE' ? '🟢 Bullish' : latest.vwapStatus === 'BELOW' ? '🔴 Bearish' : '🟡 Testing'} |`,
    `| EMA 9 | ${latest.ema9.toFixed(2)} | — |`,
    `| EMA 21 | ${latest.ema21.toFixed(2)} | — |`,
    `| EMA Alignment | ${latest.emaAlignment} | ${latest.emaAlignment === 'BULLISH' ? '🟢' : latest.emaAlignment === 'BEARISH' ? '🔴' : '🟡'} |`,
    `| RSI 14 | ${latest.rsi.toFixed(1)} | ${latest.rsiZone} |`,
    `| VIX | ${latest.vixLevel.toFixed(1)} | ${latest.vixRegime} |`,
    ``,
  ];

  // Count aligned signals
  const bullishCount = [
    latest.vwapStatus === 'ABOVE',
    latest.emaAlignment === 'BULLISH',
    ['BULLISH'].includes(latest.rsiZone),
  ].filter(Boolean).length;

  const bearishCount = [
    latest.vwapStatus === 'BELOW',
    latest.emaAlignment === 'BEARISH',
    ['BEARISH', 'OVERSOLD'].includes(latest.rsiZone),
  ].filter(Boolean).length;

  const maxCount = Math.max(bullishCount, bearishCount);
  const direction = bullishCount > bearishCount ? 'BULLISH' : bearishCount > bullishCount ? 'BEARISH' : 'MIXED';

  lines.push(`**Composite Signal:** ${maxCount} of 3 aligned — ${direction}`);
  lines.push(`**Minimum for entry:** 2 of 3`);
  lines.push(``);

  // Signal history for trend context
  if (allReadings.length > 1) {
    lines.push(`### Signal History (${allReadings.length} readings)`);
    lines.push(``);
    lines.push(`| # | SPX | VWAP | EMA Align | RSI | VIX | Time |`);
    lines.push(`|---|-----|------|-----------|-----|-----|------|`);

    for (let i = 0; i < allReadings.length; i++) {
      const r = allReadings[i]!;
      const time = new Date(r.timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
      lines.push(
        `| ${i + 1} | $${r.spxPrice.toFixed(2)} | ${r.vwapStatus} | ${r.emaAlignment} | ${r.rsi.toFixed(1)} | ${r.vixLevel.toFixed(1)} | ${time} |`
      );
    }
    lines.push(``);
  }

  lines.push(`### Analysis Request`);
  lines.push(``);
  lines.push(`Please perform a complete pre-trade analysis:`);
  lines.push(`1. **Signal Analyst**: Assess the technical setup — is the 2-of-3 composite confirmed?`);
  lines.push(`2. **Risk Manager**: Evaluate VIX regime, confirm we're within risk parameters, gate the trade.`);
  lines.push(`3. **Trade Advisor**: Make the call — ENTER, HOLD, or NO TRADE — with exact spread if entering.`);
  lines.push(`4. **Session Reporter**: Produce the final scannable session report.`);
  lines.push(``);
  lines.push(`⚠️ PAPER TRADE ONLY — do not recommend placing real orders.`);

  return lines.join('\n');
}

// ═══════════════════════════════════════════════════════════════════════════════
// Cleanup
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Close the browser gracefully.
 */
export async function closeBrowser(page: Page): Promise<void> {
  try {
    const context = page.context();
    await context.close();
  } catch {
    // Best effort — browser may already be closed by user
  }
}
