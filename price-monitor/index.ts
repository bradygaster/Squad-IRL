// Price Monitor & Deal Finder — 4 agents, 5 products, 4 stores
// Self-contained TypeScript sample. No external APIs.

// ── Helpers ──────────────────────────────────────────────────────────

const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

const fmt = (n: number): string => {
  const abs = Math.abs(n);
  const s = abs.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return n < 0 ? `-$${s}` : `$${s}`;
};

const pct = (n: number, d = 1): string => `${n.toFixed(d)}%`;

const bar = (score: number, width = 20): string => {
  const filled = Math.round((score / 100) * width);
  return "█".repeat(filled) + "░".repeat(width - filled);
};

// ANSI colours
const C = {
  reset: "\x1b[0m",
  bold: "\x1b[1m",
  dim: "\x1b[2m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  red: "\x1b[31m",
  magenta: "\x1b[35m",
  cyan: "\x1b[36m",
  white: "\x1b[37m",
  bgGreen: "\x1b[42m",
  bgYellow: "\x1b[43m",
  bgRed: "\x1b[41m",
  bgMagenta: "\x1b[45m",
};

// ── Types ────────────────────────────────────────────────────────────

interface Product {
  name: string;
  msrp: number;
}

interface StorePrice {
  store: string;
  history: (number | null)[]; // 30 days, null = out of stock
}

interface MonitorResult {
  product: Product;
  stores: {
    store: string;
    price: number | null;
    yesterday: number | null;
    change: number | null;
  }[];
}

interface ComparisonResult {
  product: Product;
  storeAnalyses: StoreAnalysis[];
  bestStore: string;
  bestPrice: number;
}

interface StoreAnalysis {
  store: string;
  price: number | null;
  high30: number;
  low30: number;
  avg30: number;
  percentile: number;
  trendSlope: number;
  trendPct: number;
  volatility: number;
  vsBest: number;
}

type AlertLevel = "BUY_NOW" | "WAIT" | "SKIP" | "FLASH_DEAL";

interface DealScore {
  product: Product;
  store: string;
  price: number;
  discountScore: number;
  historicalScore: number;
  trendScore: number;
  volatilityScore: number;
  stockScore: number;
  total: number;
}

interface Alert {
  product: Product;
  store: string;
  price: number;
  score: number;
  level: AlertLevel;
  reasoning: string;
  potentialSavings: [number, number];
}

// ── Data ─────────────────────────────────────────────────────────────

const PRODUCTS: Product[] = [
  { name: "Sony WH-1000XM5 Headphones", msrp: 399.99 },
  { name: "Apple iPad Air M2", msrp: 599.99 },
  { name: "Samsung 4K Monitor 32\"", msrp: 449.99 },
  { name: "Logitech MX Master 3S Mouse", msrp: 99.99 },
  { name: "Keychron Q1 Pro Keyboard", msrp: 199.99 },
];

const STORES = ["Amazon", "Best Buy", "Walmart", "B&H Photo"];

// Seeded PRNG for reproducibility
function mulberry32(seed: number): () => number {
  let s = seed;
  return () => {
    s |= 0;
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const rng = mulberry32(42);

// Price‐history generation patterns
type Pattern = "declining" | "flash_dip" | "stable" | "rising" | "volatile";

const PATTERNS: Pattern[][] = [
  // Sony WH-1000XM5: declining on Amazon, stable elsewhere → WAIT
  ["declining", "stable", "declining", "stable"],
  // iPad Air M2: rising everywhere, small discounts → SKIP
  ["rising", "rising", "rising", "rising"],
  // Samsung Monitor: stable low on B&H → BUY NOW
  ["declining", "volatile", "stable", "stable"],
  // Logitech Mouse: flash dip on Amazon (sharp drop today) → FLASH DEAL
  ["flash_dip", "declining", "declining", "stable"],
  // Keychron Keyboard: rising (demand), getting pricey → SKIP/WAIT
  ["rising", "stable", "volatile", "rising"],
];

// Base price offsets per store (fraction of MSRP)
const BASE_DISCOUNTS: number[][] = [
  [0.18, 0.12, 0.15, 0.16],  // Sony — moderate discount
  [0.02, 0.01, 0.02, 0.01],  // iPad — tiny discounts, some above MSRP (→ SKIP)
  [0.26, 0.18, 0.20, 0.30],  // Samsung — deep discount on B&H (→ BUY NOW)
  [0.28, 0.22, 0.25, 0.20],  // Logitech — good baseline + flash dip (→ FLASH)
  [0.06, 0.04, 0.08, 0.05],  // Keychron — small discounts
];

// Out of stock: productIdx → storeIdx → day range
const OUT_OF_STOCK: Record<string, [number, number]> = {
  "1-2": [3, 8],   // iPad at Walmart: days 3–8
  "3-1": [0, 2],   // Logitech at Best Buy: days 0–2 (recently restocked)
};

function generateHistory(
  msrp: number,
  baseDiscount: number,
  pattern: Pattern,
  productIdx: number,
  storeIdx: number,
): (number | null)[] {
  const basePrice = msrp * (1 - baseDiscount);
  const history: (number | null)[] = [];
  const oosKey = `${productIdx}-${storeIdx}`;
  const oos = OUT_OF_STOCK[oosKey];

  for (let day = 0; day < 30; day++) {
    // Check out-of-stock
    if (oos && day >= oos[0] && day <= oos[1]) {
      history.push(null);
      continue;
    }

    const t = day / 29; // 0..1
    let noise = (rng() - 0.5) * msrp * 0.02;
    let price: number;

    switch (pattern) {
      case "declining":
        price = basePrice + msrp * 0.06 * (1 - t) + noise;
        break;
      case "rising":
        price = basePrice - msrp * 0.04 + msrp * 0.07 * t + noise;
        break;
      case "stable":
        price = basePrice + noise;
        break;
      case "flash_dip": {
        // Normal price most of the month, then sharp dip on day 29 (today)
        if (day === 29) {
          price = basePrice - msrp * 0.08 + noise * 0.2;
        } else if (day === 28) {
          price = basePrice + msrp * 0.02 + noise * 0.3;
        } else {
          price = basePrice + msrp * 0.02 * (1 - t) + noise;
        }
        break;
      }
      case "volatile":
        noise = (rng() - 0.5) * msrp * 0.06;
        price = basePrice + msrp * 0.03 * Math.sin(day * 0.8) + noise;
        break;
    }

    // Clamp to reasonable range
    price = Math.max(msrp * 0.5, Math.min(msrp * 1.05, price));
    history.push(Math.round(price * 100) / 100);
  }

  return history;
}

// Build all price data
const PRICE_DATA: StorePrice[][] = PRODUCTS.map((product, pi) =>
  STORES.map((store, si) => ({
    store,
    history: generateHistory(
      product.msrp,
      BASE_DISCOUNTS[pi][si],
      PATTERNS[pi][si],
      pi,
      si,
    ),
  })),
);

// ── Math utilities ───────────────────────────────────────────────────

function linearRegression(values: number[]): { slope: number; intercept: number } {
  const n = values.length;
  let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0;
  for (let i = 0; i < n; i++) {
    sumX += i;
    sumY += values[i];
    sumXY += i * values[i];
    sumX2 += i * i;
  }
  const denom = n * sumX2 - sumX * sumX;
  if (denom === 0) return { slope: 0, intercept: values[0] };
  const slope = (n * sumXY - sumX * sumY) / denom;
  const intercept = (sumY - slope * sumX) / n;
  return { slope, intercept };
}

function stddev(values: number[]): number {
  const n = values.length;
  if (n === 0) return 0;
  const mean = values.reduce((a, b) => a + b, 0) / n;
  const variance = values.reduce((s, v) => s + (v - mean) ** 2, 0) / n;
  return Math.sqrt(variance);
}

function sparkline(values: (number | null)[]): string {
  const chars = "▁▂▃▄▅▆▇█";
  const nums = values.filter((v): v is number => v !== null);
  if (nums.length === 0) return "";
  const min = Math.min(...nums);
  const max = Math.max(...nums);
  const range = max - min || 1;
  return values
    .map((v) => {
      if (v === null) return "·";
      const idx = Math.round(((v - min) / range) * (chars.length - 1));
      return chars[idx];
    })
    .join("");
}

// ── Agent 1: Monitor ─────────────────────────────────────────────────

async function monitorAgent(
  productIdx: number,
): Promise<MonitorResult> {
  const product = PRODUCTS[productIdx];
  const storeData = PRICE_DATA[productIdx];

  console.log(
    `\n${C.bold}${C.cyan}━━━ Product ${productIdx + 1}/5: ${product.name} ━━━━━━━━━━━━━━━━━━━${C.reset}`,
  );
  console.log(`${C.dim}MSRP: ${fmt(product.msrp)}${C.reset}\n`);
  console.log(`${C.bold}📡 Monitor scanning stores...${C.reset}`);

  const stores: MonitorResult["stores"] = [];

  for (const sp of storeData) {
    await sleep(120);
    const current = sp.history[29];
    const yesterday = sp.history[28];
    const change =
      current !== null && yesterday !== null ? current - yesterday : null;

    stores.push({ store: sp.store, price: current, yesterday, change });

    const padStore = sp.store.padEnd(10);
    if (current === null) {
      console.log(`  ${C.red}${padStore} OUT OF STOCK${C.reset}`);
    } else {
      let arrow: string;
      if (change === null) {
        arrow = `${C.dim}(restocked today)${C.reset}`;
      } else if (change < -0.005) {
        arrow = `${C.green}(▼ ${fmt(Math.abs(change))} from yesterday)${C.reset}`;
      } else if (change > 0.005) {
        arrow = `${C.red}(▲ ${fmt(change)} from yesterday)${C.reset}`;
      } else {
        arrow = `${C.dim}(→ unchanged)${C.reset}`;
      }
      console.log(`  ${padStore} ${C.bold}${fmt(current)}${C.reset}  ${arrow}`);
    }
  }

  return { product, stores };
}

// ── Agent 2: Comparator ──────────────────────────────────────────────

async function comparatorAgent(
  productIdx: number,
): Promise<ComparisonResult> {
  const product = PRODUCTS[productIdx];
  const storeData = PRICE_DATA[productIdx];

  await sleep(150);
  console.log(
    `\n${C.bold}📊 Comparator analyzing ${product.name}...${C.reset}\n`,
  );

  const analyses: StoreAnalysis[] = [];

  for (const sp of storeData) {
    const validPrices = sp.history.filter((v): v is number => v !== null);
    const current = sp.history[29];
    const high30 = validPrices.length > 0 ? Math.max(...validPrices) : 0;
    const low30 = validPrices.length > 0 ? Math.min(...validPrices) : 0;
    const avg30 =
      validPrices.length > 0
        ? validPrices.reduce((a, b) => a + b, 0) / validPrices.length
        : 0;

    // Percentile: 0=at high, 100=at low
    const range30 = high30 - low30 || 1;
    const percentile =
      current !== null ? ((high30 - current) / range30) * 100 : 0;

    // Trend: linear regression on last 7 valid days
    const last7 = sp.history.slice(-7).filter((v): v is number => v !== null);
    let trendSlope = 0;
    let trendPct = 0;
    if (last7.length >= 3) {
      const reg = linearRegression(last7);
      trendSlope = reg.slope;
      const mid = last7[Math.floor(last7.length / 2)];
      trendPct = mid !== 0 ? (trendSlope / mid) * 100 * 7 : 0; // weekly %
    }

    // Volatility: stddev / mean
    const vol =
      validPrices.length > 0
        ? stddev(validPrices) /
          (validPrices.reduce((a, b) => a + b, 0) / validPrices.length)
        : 0;

    analyses.push({
      store: sp.store,
      price: current,
      high30,
      low30,
      avg30,
      percentile,
      trendSlope,
      trendPct,
      volatility: vol,
      vsBest: 0, // filled below
    });
  }

  // Sort by price (null = last)
  const withPrice = analyses
    .filter((a) => a.price !== null)
    .sort((a, b) => a.price! - b.price!);
  const bestPrice = withPrice.length > 0 ? withPrice[0].price! : 0;
  const bestStore = withPrice.length > 0 ? withPrice[0].store : "N/A";

  for (const a of analyses) {
    a.vsBest = a.price !== null ? a.price - bestPrice : Infinity;
  }

  // Display table
  const sorted = [...analyses].sort((a, b) => {
    if (a.price === null) return 1;
    if (b.price === null) return -1;
    return a.price - b.price;
  });

  console.log("  Price Comparison:");
  console.log(
    `  ┌${"─".repeat(12)}┬${"─".repeat(11)}┬${"─".repeat(11)}┬${"─".repeat(11)}┐`,
  );
  console.log(
    `  │ ${"Store".padEnd(10)} │ ${"Price".padEnd(9)} │ ${"vs Best".padEnd(9)} │ ${"Trend".padEnd(9)} │`,
  );
  console.log(
    `  ├${"─".repeat(12)}┼${"─".repeat(11)}┼${"─".repeat(11)}┼${"─".repeat(11)}┤`,
  );

  for (const a of sorted) {
    const storePad = a.store.padEnd(10);
    const pricePad = a.price !== null ? fmt(a.price).padEnd(9) : "N/A".padEnd(9);
    const vsBestStr =
      a.price === null
        ? "N/A".padEnd(9)
        : a.vsBest < 0.005
          ? `${C.green}BEST ✓${C.reset}`.padEnd(9 + C.green.length + C.reset.length)
          : `+${fmt(a.vsBest)}`.padEnd(9);
    const arrow =
      a.trendPct < -0.5 ? "↓" : a.trendPct > 0.5 ? "↑" : "→";
    const trendColor =
      a.trendPct < -0.5 ? C.green : a.trendPct > 0.5 ? C.red : C.dim;
    const trendStr = `${trendColor}${arrow} ${a.trendPct >= 0 ? "+" : ""}${pct(a.trendPct)}${C.reset}`;

    console.log(`  │ ${storePad} │ ${pricePad} │ ${vsBestStr} │ ${trendStr.padEnd(9 + trendColor.length + C.reset.length)} │`);
  }
  console.log(
    `  └${"─".repeat(12)}┴${"─".repeat(11)}┴${"─".repeat(11)}┴${"─".repeat(11)}┘`,
  );

  // 30-day history for best store
  if (withPrice.length > 0) {
    const bestIdx = storeData.findIndex((s) => s.store === bestStore);
    const bestHistory = storeData[bestIdx].history;
    const bestAnalysis = analyses.find((a) => a.store === bestStore)!;

    console.log(`\n  30-Day History (${bestStore}):`);
    console.log(
      `  High: ${fmt(bestAnalysis.high30)} | Low: ${fmt(bestAnalysis.low30)} | Avg: ${fmt(bestAnalysis.avg30)}`,
    );

    const percLabel =
      bestAnalysis.percentile >= 75
        ? "near low!"
        : bestAnalysis.percentile >= 50
          ? "below average"
          : bestAnalysis.percentile >= 25
            ? "above average"
            : "near high";
    console.log(
      `  Current: ${fmt(bestPrice)} (${Math.round(bestAnalysis.percentile)}th percentile — ${percLabel})`,
    );
    console.log(`\n  Price Spark: ${sparkline(bestHistory)}`);
  }

  return { product, storeAnalyses: analyses, bestStore, bestPrice };
}

// ── Agent 3: Deal Scorer ─────────────────────────────────────────────

async function dealScorerAgent(
  productIdx: number,
  comparison: ComparisonResult,
): Promise<DealScore | null> {
  const product = PRODUCTS[productIdx];
  const { bestStore, bestPrice } = comparison;

  if (bestPrice === 0) return null;

  await sleep(100);
  console.log(
    `\n${C.bold}🎯 Deal Scorer evaluating ${product.name} at ${bestStore}...${C.reset}\n`,
  );

  // 1. Discount from MSRP (weight 0.30)
  const discountPct = ((product.msrp - bestPrice) / product.msrp) * 100;
  const discountScore = Math.min(100, discountPct * 3); // 33% off = 100

  // 2. Historical position (weight 0.25) — 0 at high, 100 at low
  const analysis = comparison.storeAnalyses.find((a) => a.store === bestStore)!;
  const historicalScore = Math.min(100, Math.max(0, analysis.percentile));

  // 3. Trend momentum (weight 0.20) — falling = higher
  const trendScore = Math.min(
    100,
    Math.max(0, 50 + analysis.trendPct * -15),
  );

  // 4. Volatility bonus (weight 0.10) — low volatility + low price = good
  const volatilityScore = Math.min(
    100,
    Math.max(0, 100 - analysis.volatility * 2000),
  );

  // 5. Stock availability (weight 0.15)
  const storeData = PRICE_DATA[productIdx];
  const sp = storeData.find((s) => s.store === bestStore)!;
  const recentNulls = sp.history.slice(-5).filter((v) => v === null).length;
  const stockScore = recentNulls === 0 ? 100 : recentNulls <= 2 ? 50 : 0;

  const total = Math.round(
    discountScore * 0.3 +
      historicalScore * 0.25 +
      trendScore * 0.2 +
      volatilityScore * 0.1 +
      stockScore * 0.15,
  );

  // Display
  const pad = (label: string, w: number) => label.padEnd(w);
  console.log(
    `  ${pad("Discount from MSRP:", 22)} ${pct(discountPct).padStart(6)}  →  ${Math.round(discountScore).toString().padStart(3)}/100 (weight: 0.30)`,
  );
  console.log(
    `  ${pad("Historical position:", 22)} ${(Math.round(analysis.percentile) + "th%").padStart(6)}  →  ${Math.round(historicalScore).toString().padStart(3)}/100 (weight: 0.25)`,
  );
  const tArrow =
    analysis.trendPct < -0.5 ? "↓" : analysis.trendPct > 0.5 ? "↑" : "→";
  console.log(
    `  ${pad("Trend momentum:", 22)} ${(tArrow + " " + pct(analysis.trendPct)).padStart(6)}  →  ${Math.round(trendScore).toString().padStart(3)}/100 (weight: 0.20)`,
  );
  const volLabel =
    analysis.volatility < 0.02
      ? "Low"
      : analysis.volatility < 0.04
        ? "Med"
        : "High";
  console.log(
    `  ${pad("Price volatility:", 22)} ${volLabel.padStart(6)}  →  ${Math.round(volatilityScore).toString().padStart(3)}/100 (weight: 0.10)`,
  );
  const stockLabel =
    stockScore === 100 ? "In Stock" : stockScore === 50 ? "Limited" : "Out";
  console.log(
    `  ${pad("Stock availability:", 22)} ${stockLabel.padStart(6)}  →  ${Math.round(stockScore).toString().padStart(3)}/100 (weight: 0.15)`,
  );
  console.log(`  ${"─".repeat(44)}`);
  const scoreColor =
    total >= 80 ? C.green : total >= 50 ? C.yellow : C.red;
  console.log(
    `  ${C.bold}DEAL SCORE:${C.reset}            ${scoreColor}${C.bold}${total}/100${C.reset}  ${scoreColor}${bar(total)}${C.reset}`,
  );

  return {
    product,
    store: bestStore,
    price: bestPrice,
    discountScore,
    historicalScore,
    trendScore,
    volatilityScore,
    stockScore,
    total,
  };
}

// ── Agent 4: Alert Generator ─────────────────────────────────────────

async function alertAgent(
  productIdx: number,
  comparison: ComparisonResult,
  deal: DealScore | null,
): Promise<Alert | null> {
  if (!deal) return null;

  const product = PRODUCTS[productIdx];
  const { bestStore, bestPrice } = comparison;
  const analysis = comparison.storeAnalyses.find(
    (a) => a.store === bestStore,
  )!;
  const storeData = PRICE_DATA[productIdx];
  const sp = storeData.find((s) => s.store === bestStore)!;
  const yesterday = sp.history[28];
  const current = sp.history[29];

  await sleep(100);
  console.log(`\n${C.bold}🔔 Alert Generator recommendation...${C.reset}\n`);

  const discountPct = ((product.msrp - bestPrice) / product.msrp) * 100;

  // Flash deal detection: >10% drop from yesterday
  const isFlashDeal =
    current !== null &&
    yesterday !== null &&
    (yesterday - current) / yesterday > 0.1;

  let level: AlertLevel;
  let reasoning: string;
  let potentialSavings: [number, number];

  if (isFlashDeal) {
    level = "FLASH_DEAL";
    const dropPct = yesterday !== null && current !== null
      ? ((yesterday - current) / yesterday) * 100
      : 0;
    reasoning =
      `${product.name} at ${fmt(bestPrice)} on ${bestStore} just dropped ${pct(dropPct)} ` +
      `from yesterday's ${fmt(yesterday!)}. This flash deal puts it near the 30-day low of ` +
      `${fmt(analysis.low30)}. Act fast — these dips typically last 1-2 days.`;
    potentialSavings = [
      Math.round((product.msrp - bestPrice) * 0.8),
      Math.round(product.msrp - bestPrice),
    ];
  } else if (deal.total >= 80) {
    level = "BUY_NOW";
    reasoning =
      `${product.name} at ${fmt(bestPrice)} on ${bestStore} is ${pct(discountPct)} off MSRP ` +
      `and sitting at the ${Math.round(analysis.percentile)}th percentile of its 30-day range. ` +
      `Price stability and strong availability make this an excellent buy.`;
    potentialSavings = [
      Math.round(product.msrp - bestPrice - 10),
      Math.round(product.msrp - bestPrice),
    ];
  } else if (deal.total >= 50) {
    level = "WAIT";
    const estimatedDrop = Math.abs(analysis.trendSlope) * 7;
    reasoning =
      `${product.name} at ${fmt(bestPrice)} on ${bestStore} is ${pct(discountPct)} off MSRP ` +
      `and near its 30-day low. However, the ${analysis.trendPct < -0.5 ? "downward" : "current"} trend ` +
      `suggests waiting 5-7 days could save another ${fmt(estimatedDrop)}-${fmt(estimatedDrop * 1.5)}.`;
    potentialSavings = [
      Math.round(estimatedDrop),
      Math.round(estimatedDrop * 1.5),
    ];
  } else {
    level = "SKIP";
    reasoning =
      `${product.name} at ${fmt(bestPrice)} on ${bestStore} is only ${pct(discountPct)} off MSRP ` +
      `and ${analysis.trendPct > 0.5 ? "trending upward" : "not at a compelling price point"}. ` +
      `The 30-day low was ${fmt(analysis.low30)} — wait for a better deal.`;
    potentialSavings = [
      Math.round(bestPrice - analysis.low30),
      Math.round(bestPrice - analysis.low30 + 20),
    ];
  }

  // Display
  const icons: Record<AlertLevel, string> = {
    BUY_NOW: `${C.green}🟢 BUY NOW`,
    WAIT: `${C.yellow}🟡 WAIT`,
    SKIP: `${C.red}🔴 SKIP`,
    FLASH_DEAL: `${C.magenta}⚡ FLASH DEAL`,
  };
  const subtitles: Record<AlertLevel, string> = {
    BUY_NOW: "Excellent price, buy with confidence",
    WAIT: "Good price but likely to drop further",
    SKIP: "Overpriced — wait for better deal",
    FLASH_DEAL: "Rare price drop — act now!",
  };

  console.log(`  ${icons[level]} — ${subtitles[level]}${C.reset}`);
  // Word-wrap reasoning to ~60 chars
  const words = reasoning.split(" ");
  let line = '  "';
  for (const w of words) {
    if (line.length + w.length + 1 > 65) {
      console.log(line);
      line = "   " + w;
    } else {
      line += (line.endsWith('"') || line.endsWith("   ") ? "" : " ") + w;
    }
  }
  console.log(line + '"');

  return { product, store: bestStore, price: bestPrice, score: deal.total, level, reasoning, potentialSavings };
}

// ── Main ─────────────────────────────────────────────────────────────

async function main(): Promise<void> {
  // Banner
  console.log(`
${C.bold}${C.cyan}╔══════════════════════════════════════════════════════╗
║       💰 Price Monitor & Deal Finder                 ║
║       4 Agents • 5 Products • 4 Stores               ║
╚══════════════════════════════════════════════════════╝${C.reset}
`);

  const alerts: Alert[] = [];

  for (let i = 0; i < PRODUCTS.length; i++) {
    // Agent 1: Monitor
    await monitorAgent(i);

    // Agent 2: Comparator
    const comparison = await comparatorAgent(i);

    // Agent 3: Deal Scorer
    const deal = await dealScorerAgent(i, comparison);

    // Agent 4: Alert Generator
    const alert = await alertAgent(i, comparison, deal);
    if (alert) alerts.push(alert);

    console.log("");
  }

  // ── Summary ──────────────────────────────────────────────────────
  alerts.sort((a, b) => b.score - a.score);

  const W = 67;
  const hBar = "═".repeat(W);
  const sBar = "─".repeat(W);

  console.log(`\n${C.bold}${C.cyan}╔${hBar}╗${C.reset}`);
  console.log(
    `${C.bold}${C.cyan}║${C.reset}${C.bold}                    🏆 TODAY'S DEALS — Ranked by Value            ${C.cyan}║${C.reset}`,
  );
  console.log(`${C.bold}${C.cyan}╠${hBar}╣${C.reset}`);

  const levelIcons: Record<AlertLevel, string> = {
    BUY_NOW: "🟢",
    WAIT: "🟡",
    SKIP: "🔴",
    FLASH_DEAL: "⚡",
  };
  const levelColors: Record<AlertLevel, string> = {
    BUY_NOW: C.green,
    WAIT: C.yellow,
    SKIP: C.red,
    FLASH_DEAL: C.magenta,
  };
  const levelLabels: Record<AlertLevel, string> = {
    BUY_NOW: "BUY NOW",
    WAIT: "WAIT",
    SKIP: "SKIP",
    FLASH_DEAL: "FLASH DEAL",
  };
  const shortReasons: Record<AlertLevel, string> = {
    BUY_NOW: "Stable low price, excellent value",
    WAIT: "Price still trending down",
    SKIP: "Wait for better deal",
    FLASH_DEAL: "Flash deal, near historical low!",
  };

  for (let i = 0; i < alerts.length; i++) {
    const a = alerts[i];
    const discPct = ((a.product.msrp - a.price) / a.product.msrp) * 100;
    const icon = levelIcons[a.level];
    const color = levelColors[a.level];

    const line1 = `#${i + 1} ${icon} ${a.product.name}`;
    const line2 = `   ${a.store}: ${fmt(a.price)} (${Math.round(discPct)}% off MSRP)  Score: ${a.score}/100`;
    const line3 = `   ${color}${levelLabels[a.level]}${C.reset} — ${shortReasons[a.level]}`;

    console.log(`${C.bold}${C.cyan}║${C.reset} ${C.bold}${line1.padEnd(W - 1)}${C.cyan}║${C.reset}`);
    console.log(`${C.bold}${C.cyan}║${C.reset} ${line2.padEnd(W - 1)}${C.cyan}║${C.reset}`);
    console.log(`${C.bold}${C.cyan}║${C.reset} ${line3.padEnd(W - 1 + color.length + C.reset.length)}${C.cyan}║${C.reset}`);

    if (i < alerts.length - 1) {
      console.log(`${C.bold}${C.cyan}╠${sBar}╣${C.reset}`);
    }
  }

  // Stats
  const totalSavingsLow = alerts.reduce((s, a) => s + a.potentialSavings[0], 0);
  const totalSavingsHigh = alerts.reduce(
    (s, a) => s + a.potentialSavings[1],
    0,
  );
  const atLows = alerts.filter((a) => a.level === "BUY_NOW" || a.level === "FLASH_DEAL").length;
  const flashDeals = alerts.filter((a) => a.level === "FLASH_DEAL").length;

  console.log(`${C.bold}${C.cyan}╠${hBar}╣${C.reset}`);
  console.log(
    `${C.bold}${C.cyan}║${C.reset} 💡 Potential savings by following recommendations: ${fmt(totalSavingsLow)}-${fmt(totalSavingsHigh)}`.padEnd(
      W + C.bold.length + C.cyan.length + C.reset.length + 1,
    ) + `${C.cyan}║${C.reset}`,
  );
  console.log(
    `${C.bold}${C.cyan}║${C.reset} 📈 Products at historical lows: ${atLows}/${PRODUCTS.length}`.padEnd(
      W + C.bold.length + C.cyan.length + C.reset.length + 1,
    ) + `${C.cyan}║${C.reset}`,
  );
  console.log(
    `${C.bold}${C.cyan}║${C.reset} ⚡ Flash deals detected: ${flashDeals}`.padEnd(
      W + C.bold.length + C.cyan.length + C.reset.length + 1,
    ) + `${C.cyan}║${C.reset}`,
  );
  console.log(`${C.bold}${C.cyan}╚${hBar}╝${C.reset}`);
}

main().catch(console.error);
