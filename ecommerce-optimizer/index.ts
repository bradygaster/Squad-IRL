// ─── E-Commerce Optimizer — 6-Agent Squad Simulation ────────────────────────
// Single-file TypeScript demo. No external dependencies.

// ─── ANSI helpers ───────────────────────────────────────────────────────────

const RST = "\x1b[0m";
const BOLD = "\x1b[1m";
const DIM = "\x1b[2m";
const ITAL = "\x1b[3m";
const UND = "\x1b[4m";
const RED = "\x1b[31m";
const GRN = "\x1b[32m";
const YEL = "\x1b[33m";
const BLU = "\x1b[34m";
const MAG = "\x1b[35m";
const CYN = "\x1b[36m";
const WHT = "\x1b[37m";
const BGBLK = "\x1b[40m";
const BGBLU = "\x1b[44m";

function clr(c: string, t: string): string { return `${c}${t}${RST}`; }
function sleep(ms: number): Promise<void> { return new Promise(r => setTimeout(r, ms)); }
function fmt$(n: number): string { return "$" + n.toFixed(2); }
function fmtK(n: number): string { return "$" + (n / 1000).toFixed(0) + "K"; }
function pct(n: number): string { return (n * 100).toFixed(1) + "%"; }
function pad(s: string, w: number): string { return s.padEnd(w); }
function padL(s: string, w: number): string { return s.padStart(w); }
function bar(len: number, ch = "█"): string { return ch.repeat(Math.max(0, Math.round(len))); }
function divider(): string { return clr(DIM, "─".repeat(72)); }

function seededRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) & 0xffffffff;
    return (s >>> 0) / 0xffffffff;
  };
}

// ─── Interfaces ─────────────────────────────────────────────────────────────

interface Product {
  id: number;
  name: string;
  category: string;
  price: number;
  cost: number;
  monthlySales: number;
  rating: number;
  reviews: number;
  inventory: number;
  elasticity: number;
  returnRate: number;
}

interface Customer {
  id: string;
  lastPurchaseDays: number;
  totalOrders: number;
  totalSpent: number;
  avgOrderValue: number;
}

interface FunnelStage {
  name: string;
  visitors: number;
  dropoffReasons: { reason: string; percentage: number }[];
}

interface CoPurchase {
  productA: number;
  productB: number;
  frequency: number;
  confidence: number;
  lift: number;
}

// ─── Demo Data ──────────────────────────────────────────────────────────────

const products: Product[] = [
  { id: 1,  name: "Wireless Earbuds",       category: "Electronics", price: 79.99,  cost: 32, monthlySales: 420, rating: 4.5, reviews: 1280, inventory: 310, elasticity: -1.2, returnRate: 3.2 },
  { id: 2,  name: "Smart Water Bottle",     category: "Home",        price: 34.99,  cost: 12, monthlySales: 180, rating: 4.2, reviews: 540,  inventory: 420, elasticity: -0.8, returnRate: 1.8 },
  { id: 3,  name: "Yoga Mat Premium",       category: "Sports",      price: 49.99,  cost: 15, monthlySales: 290, rating: 4.7, reviews: 920,  inventory: 250, elasticity: -1.0, returnRate: 2.1 },
  { id: 4,  name: "Laptop Stand",           category: "Electronics", price: 59.99,  cost: 22, monthlySales: 150, rating: 4.3, reviews: 380,  inventory: 180, elasticity: -1.5, returnRate: 2.5 },
  { id: 5,  name: "Kitchen Scale",          category: "Kitchen",     price: 24.99,  cost: 8,  monthlySales: 340, rating: 4.4, reviews: 760,  inventory: 500, elasticity: -0.6, returnRate: 1.2 },
  { id: 6,  name: "Running Shoes",          category: "Sports",      price: 129.99, cost: 48, monthlySales: 95,  rating: 4.6, reviews: 620,  inventory: 120, elasticity: -2.0, returnRate: 8.5 },
  { id: 7,  name: "Desk Organizer",         category: "Home",        price: 19.99,  cost: 6,  monthlySales: 520, rating: 4.1, reviews: 430,  inventory: 600, elasticity: -0.5, returnRate: 1.0 },
  { id: 8,  name: "Bluetooth Speaker",      category: "Electronics", price: 89.99,  cost: 35, monthlySales: 200, rating: 4.4, reviews: 880,  inventory: 200, elasticity: -1.4, returnRate: 4.1 },
  { id: 9,  name: "Travel Backpack",        category: "Fashion",     price: 69.99,  cost: 25, monthlySales: 160, rating: 4.5, reviews: 710,  inventory: 190, elasticity: -1.1, returnRate: 3.0 },
  { id: 10, name: "Air Purifier",           category: "Home",        price: 149.99, cost: 55, monthlySales: 75,  rating: 4.3, reviews: 310,  inventory: 90,  elasticity: -2.2, returnRate: 5.2 },
  { id: 11, name: "Resistance Bands",       category: "Sports",      price: 14.99,  cost: 3,  monthlySales: 680, rating: 4.6, reviews: 1540, inventory: 900, elasticity: -0.4, returnRate: 0.8 },
  { id: 12, name: "Phone Case",             category: "Electronics", price: 12.99,  cost: 2,  monthlySales: 890, rating: 4.0, reviews: 2100, inventory: 1200,elasticity: -0.3, returnRate: 0.5 },
  { id: 13, name: "Coffee Grinder",         category: "Kitchen",     price: 44.99,  cost: 18, monthlySales: 210, rating: 4.5, reviews: 650,  inventory: 230, elasticity: -1.3, returnRate: 2.8 },
  { id: 14, name: "LED Desk Lamp",          category: "Home",        price: 39.99,  cost: 14, monthlySales: 270, rating: 4.3, reviews: 580,  inventory: 350, elasticity: -0.9, returnRate: 1.5 },
  { id: 15, name: "Stainless Water Bottle", category: "Kitchen",     price: 29.99,  cost: 10, monthlySales: 350, rating: 4.4, reviews: 820,  inventory: 450, elasticity: -0.7, returnRate: 1.1 },
];

function generateCustomers(): Customer[] {
  const rng = seededRandom(42);
  const customers: Customer[] = [];
  const firstNames = ["Alex","Sam","Jordan","Taylor","Morgan","Casey","Riley","Quinn","Drew","Pat",
    "Jamie","Avery","Harper","Reese","Skyler","Dakota","Emery","Rowan","Sage","Blake",
    "Finley","Hayden","Charlie","Lennox","Sutton","Ellis","Shiloh","Phoenix","Parker","Lane"];
  for (let i = 0; i < 55; i++) {
    const name = firstNames[i % firstNames.length] + (i >= 30 ? String(i) : "");
    const recency = Math.floor(rng() * 180) + 1;
    const orders = Math.floor(rng() * 25) + 1;
    const aov = 20 + rng() * 120;
    customers.push({
      id: `C-${name}`,
      lastPurchaseDays: recency,
      totalOrders: orders,
      totalSpent: Math.round(orders * aov * 100) / 100,
      avgOrderValue: Math.round(aov * 100) / 100,
    });
  }
  return customers;
}

const customers = generateCustomers();

const funnel: FunnelStage[] = [
  { name: "Visit",          visitors: 100000, dropoffReasons: [
    { reason: "Bounced (no engagement)", percentage: 35 },
    { reason: "Left after homepage", percentage: 12 },
    { reason: "Bot / non-human traffic", percentage: 8 }] },
  { name: "Product View",   visitors: 45000,  dropoffReasons: [
    { reason: "Price too high", percentage: 28 },
    { reason: "Out of stock / limited sizes", percentage: 18 },
    { reason: "Poor product images", percentage: 15 },
    { reason: "Slow page load (>3s)", percentage: 12 }] },
  { name: "Add to Cart",    visitors: 12000,  dropoffReasons: [
    { reason: "Shipping cost surprise", percentage: 32 },
    { reason: "Wanted to compare prices", percentage: 22 },
    { reason: "Complicated checkout form", percentage: 14 },
    { reason: "No guest checkout", percentage: 5 }] },
  { name: "Checkout Start",  visitors: 5400,   dropoffReasons: [
    { reason: "Payment method not available", percentage: 18 },
    { reason: "Form errors / validation", percentage: 15 },
    { reason: "Last-minute price hesitation", percentage: 8 }] },
  { name: "Purchase",        visitors: 3200,   dropoffReasons: [] },
];

const coPurchases: CoPurchase[] = [
  { productA: 3,  productB: 11, frequency: 260, confidence: 0.34, lift: 2.4 },
  { productA: 1,  productB: 12, frequency: 310, confidence: 0.29, lift: 1.8 },
  { productA: 1,  productB: 8,  frequency: 180, confidence: 0.22, lift: 2.1 },
  { productA: 5,  productB: 13, frequency: 200, confidence: 0.31, lift: 2.6 },
  { productA: 7,  productB: 14, frequency: 240, confidence: 0.28, lift: 2.2 },
  { productA: 4,  productB: 14, frequency: 130, confidence: 0.25, lift: 2.0 },
  { productA: 9,  productB: 2,  frequency: 120, confidence: 0.20, lift: 1.7 },
  { productA: 6,  productB: 3,  frequency: 85,  confidence: 0.18, lift: 1.5 },
  { productA: 2,  productB: 15, frequency: 150, confidence: 0.26, lift: 2.3 },
  { productA: 13, productB: 15, frequency: 170, confidence: 0.33, lift: 2.5 },
];

// ─── Agent 1: Catalog Analyst ───────────────────────────────────────────────

async function agentCatalogAnalyst(): Promise<void> {
  console.log("\n" + clr(BOLD + CYN, "╔══════════════════════════════════════════════════════════════════════╗"));
  console.log(clr(BOLD + CYN, "║  📦  AGENT 1 — CATALOG ANALYST                                      ║"));
  console.log(clr(BOLD + CYN, "╚══════════════════════════════════════════════════════════════════════╝"));
  await sleep(200);

  console.log(clr(DIM, "\n  Scanning 15-product catalog across 5 categories...\n"));
  await sleep(150);

  // Compute per-product metrics
  interface ProductMetrics { margin: number; marginPct: number; revenue: number; velocity: number; pmfScore: number; }
  const metrics: Map<number, ProductMetrics> = new Map();
  const maxSales = Math.max(...products.map(p => p.monthlySales));
  const maxReviews = Math.max(...products.map(p => p.reviews));

  for (const p of products) {
    const margin = p.price - p.cost;
    const marginPct = margin / p.price;
    const revenue = p.price * p.monthlySales;
    const velocity = p.monthlySales / maxSales;
    const pmfScore = marginPct * 0.3 + velocity * 0.25 + (p.rating / 5) * 0.25 + (p.reviews / maxReviews) * 0.2;
    metrics.set(p.id, { margin, marginPct, revenue, velocity, pmfScore });
  }

  // Table
  console.log(clr(BOLD, "  Product Scorecard"));
  console.log(clr(DIM, "  " + "─".repeat(70)));
  console.log("  " + clr(BOLD, pad("Product", 24)) + padL("Price", 9) + padL("Margin%", 9) + padL("Revenue", 11) + padL("Velocity", 10) + padL("PMF", 8));
  console.log(clr(DIM, "  " + "─".repeat(70)));
  await sleep(100);

  const sorted = [...products].sort((a, b) => metrics.get(b.id)!.pmfScore - metrics.get(a.id)!.pmfScore);
  for (const p of sorted) {
    const m = metrics.get(p.id)!;
    const rev = p.price * p.monthlySales;
    const velBar = bar(m.velocity * 6, "▓");
    const color = m.pmfScore > 0.65 ? GRN : m.pmfScore > 0.45 ? YEL : RED;
    console.log("  " + clr(color, pad(p.name, 24)) + padL(fmt$(p.price), 9) + padL((m.marginPct * 100).toFixed(0) + "%", 9)
      + padL(fmtK(rev), 11) + padL(velBar, 10) + padL(m.pmfScore.toFixed(2), 8));
    await sleep(60);
  }

  // ASCII Scatter plot — Margin vs Volume
  await sleep(150);
  console.log("\n" + clr(BOLD, "  Margin % vs Monthly Sales Volume (BCG Matrix)"));
  console.log(clr(DIM, "  " + "─".repeat(58)));

  const rows = 10;
  const cols = 50;
  const grid: string[][] = Array.from({ length: rows }, () => Array(cols).fill(" "));
  const minM = 0.55, maxM = 0.85;
  const minV = 50, maxV = 950;

  for (const p of products) {
    const m = metrics.get(p.id)!;
    const r = rows - 1 - Math.round(((m.marginPct - minM) / (maxM - minM)) * (rows - 1));
    const c = Math.round(((p.monthlySales - minV) / (maxV - minV)) * (cols - 1));
    const cr = Math.max(0, Math.min(rows - 1, r));
    const cc = Math.max(0, Math.min(cols - 1, c));
    const label = p.name.split(" ")[0].substring(0, 6);
    grid[cr][cc] = "★";
    if (cc + 1 < cols) {
      for (let i = 0; i < Math.min(label.length, cols - cc - 1); i++) grid[cr][cc + 1 + i] = label[i];
    }
  }

  const yLabels = ["85%", "82%", "78%", "75%", "72%", "68%", "65%", "62%", "58%", "55%"];
  for (let r = 0; r < rows; r++) {
    const yL = padL(yLabels[r] || "", 5);
    console.log(clr(DIM, "  " + yL + " │") + grid[r].join(""));
    await sleep(40);
  }
  console.log(clr(DIM, "        └" + "─".repeat(cols)));
  console.log(clr(DIM, "         100       300       500       700       900"));
  console.log(clr(DIM, "                    Monthly Sales Volume\n"));

  // Quadrant classification
  await sleep(100);
  const medianMargin = 0.65;
  const medianVol = 280;

  const stars = products.filter(p => metrics.get(p.id)!.marginPct >= medianMargin && p.monthlySales >= medianVol);
  const cashCows = products.filter(p => metrics.get(p.id)!.marginPct < medianMargin && p.monthlySales >= medianVol);
  const questionMarks = products.filter(p => metrics.get(p.id)!.marginPct >= medianMargin && p.monthlySales < medianVol);
  const dogs = products.filter(p => metrics.get(p.id)!.marginPct < medianMargin && p.monthlySales < medianVol);

  console.log(clr(BOLD, "  BCG Quadrant Classification"));
  console.log("  " + clr(GRN, "★ Stars:          ") + stars.map(p => p.name).join(", "));
  console.log("  " + clr(CYN, "💰 Cash Cows:      ") + (cashCows.length ? cashCows.map(p => p.name).join(", ") : "(none)"));
  console.log("  " + clr(YEL, "❓ Question Marks: ") + questionMarks.map(p => p.name).join(", "));
  console.log("  " + clr(RED, "🐕 Dogs:           ") + (dogs.length ? dogs.map(p => p.name).join(", ") : "(none)"));
  await sleep(100);

  // Catalog gaps
  console.log("\n" + clr(BOLD, "  Catalog Gap Analysis"));
  const catPrices: Map<string, number[]> = new Map();
  for (const p of products) {
    if (!catPrices.has(p.category)) catPrices.set(p.category, []);
    catPrices.get(p.category)!.push(p.price);
  }
  const gaps: string[] = [];
  for (const [cat, prices] of catPrices) {
    const sorted2 = prices.sort((a, b) => a - b);
    for (let i = 1; i < sorted2.length; i++) {
      if (sorted2[i] - sorted2[i - 1] > 40) {
        gaps.push(`  ${clr(YEL, "⚠")} No products in ${fmt$(sorted2[i - 1])}-${fmt$(sorted2[i])} range for ${clr(BOLD, cat)}`);
      }
    }
    if (sorted2[sorted2.length - 1] < 80 && cat !== "Kitchen") {
      gaps.push(`  ${clr(YEL, "⚠")} No premium (>$80) products in ${clr(BOLD, cat)}`);
    }
  }
  if (gaps.length === 0) gaps.push(`  ${clr(GRN, "✓")} No major catalog gaps detected`);
  for (const g of gaps) { console.log(g); await sleep(60); }

  console.log("\n" + clr(GRN, "  ✓ Catalog analysis complete — 15 products scored and classified.\n"));
}

// ─── Agent 2: Pricing Engine ────────────────────────────────────────────────

async function agentPricingEngine(): Promise<{ recommendations: Map<number, { optimal: number; liftPct: number }> }> {
  console.log("\n" + clr(BOLD + MAG, "╔══════════════════════════════════════════════════════════════════════╗"));
  console.log(clr(BOLD + MAG, "║  💲  AGENT 2 — PRICING ENGINE                                       ║"));
  console.log(clr(BOLD + MAG, "╚══════════════════════════════════════════════════════════════════════╝"));
  await sleep(200);

  console.log(clr(DIM, "\n  Modeling demand curves using constant-elasticity model..."));
  console.log(clr(DIM, "  Formula: Q(P) = Q₀ × (P / P₀)^ε"));
  console.log(clr(DIM, "  Optimal: P* = cost × ε / (ε + 1)  [profit-maximizing price]\n"));
  await sleep(200);

  const recommendations: Map<number, { optimal: number; liftPct: number }> = new Map();

  // Compute optimal price for every product
  for (const p of products) {
    const e = p.elasticity; // negative
    const optimal = p.cost * e / (e + 1);
    const clampedOptimal = Math.max(p.cost * 1.15, Math.min(optimal, p.price * 1.5));

    const currentProfit = (p.price - p.cost) * p.monthlySales;
    const qOptimal = p.monthlySales * Math.pow(clampedOptimal / p.price, e);
    const optimizedProfit = (clampedOptimal - p.cost) * qOptimal;
    const liftPct = (optimizedProfit - currentProfit) / currentProfit;

    recommendations.set(p.id, { optimal: Math.round(clampedOptimal * 100) / 100, liftPct });
  }

  // Show elasticity curves for top 5 by absolute lift potential
  const top5 = [...products]
    .sort((a, b) => Math.abs(recommendations.get(b.id)!.liftPct) - Math.abs(recommendations.get(a.id)!.liftPct))
    .slice(0, 5);

  for (const p of top5) {
    const e = p.elasticity;
    const rec = recommendations.get(p.id)!;
    console.log(clr(BOLD, `  ${p.name}`) + clr(DIM, ` (elasticity: ${e})`));
    console.log("  " + clr(DIM, pad("Price", 9)) + pad("Demand", 9) + pad("Revenue", 12) + pad("Profit", 12) + "  ");
    console.log(clr(DIM, "  " + "─".repeat(52)));

    const steps = 5;
    const lo = p.price * 0.75;
    const hi = p.price * 1.35;
    const maxRev = p.price * p.monthlySales * 1.5;
    const maxProf = (p.price - p.cost) * p.monthlySales * 1.5;

    for (let i = 0; i <= steps; i++) {
      const testP = lo + (hi - lo) * (i / steps);
      const q = p.monthlySales * Math.pow(testP / p.price, e);
      const rev = testP * q;
      const prof = (testP - p.cost) * q;
      const revBar = bar(Math.max(0, (rev / maxRev) * 14));
      const profBar = bar(Math.max(0, (prof / maxProf) * 14));

      let marker = "";
      if (Math.abs(testP - p.price) < (hi - lo) / steps * 0.4) marker = clr(YEL, " ← current");
      if (Math.abs(testP - rec.optimal) < (hi - lo) / steps * 0.4) marker = clr(GRN, " ← optimal");

      console.log("  " + padL(fmt$(testP), 8) + " " + padL(Math.round(q).toString(), 7) + "  "
        + clr(CYN, pad(revBar, 14)) + " " + clr(GRN, pad(profBar, 14)) + marker);
      await sleep(50);
    }
    console.log();
  }

  // Recommendation table
  await sleep(100);
  console.log(clr(BOLD, "  Pricing Recommendations"));
  console.log(clr(DIM, "  " + "─".repeat(68)));
  console.log("  " + clr(BOLD, pad("Product", 24)) + padL("Current", 10) + padL("Optimal", 10) + padL("Δ Price", 10) + padL("Profit Lift", 14));
  console.log(clr(DIM, "  " + "─".repeat(68)));

  const sortedByLift = [...products].sort((a, b) => recommendations.get(b.id)!.liftPct - recommendations.get(a.id)!.liftPct);
  for (const p of sortedByLift) {
    const rec = recommendations.get(p.id)!;
    const delta = rec.optimal - p.price;
    const arrow = delta > 0.5 ? clr(GRN, "↑") : delta < -0.5 ? clr(RED, "↓") : clr(DIM, "≈");
    const color = rec.liftPct > 0.05 ? GRN : rec.liftPct > 0 ? YEL : RED;
    console.log("  " + pad(p.name, 24) + padL(fmt$(p.price), 10) + padL(fmt$(rec.optimal), 10)
      + padL((delta >= 0 ? "+" : "") + fmt$(delta), 10) + " " + arrow + " " + clr(color, padL((rec.liftPct * 100).toFixed(1) + "%", 11)));
    await sleep(50);
  }

  const totalCurrentProfit = products.reduce((s, p) => s + (p.price - p.cost) * p.monthlySales, 0);
  const totalOptimizedProfit = products.reduce((s, p) => {
    const rec = recommendations.get(p.id)!;
    const q = p.monthlySales * Math.pow(rec.optimal / p.price, p.elasticity);
    return s + (rec.optimal - p.cost) * q;
  }, 0);
  const totalLift = totalOptimizedProfit - totalCurrentProfit;

  console.log(clr(DIM, "  " + "─".repeat(68)));
  console.log("  " + clr(BOLD + GRN, `  Total monthly profit lift: +${fmtK(totalLift)} (${(totalLift / totalCurrentProfit * 100).toFixed(1)}%)`));
  console.log(clr(GRN, "\n  ✓ Pricing optimization complete — demand curves modeled for all 15 products.\n"));

  return { recommendations };
}

// ─── Agent 3: Bundle Creator ────────────────────────────────────────────────

async function agentBundleCreator(): Promise<void> {
  console.log("\n" + clr(BOLD + YEL, "╔══════════════════════════════════════════════════════════════════════╗"));
  console.log(clr(BOLD + YEL, "║  🎁  AGENT 3 — BUNDLE CREATOR                                      ║"));
  console.log(clr(BOLD + YEL, "╚══════════════════════════════════════════════════════════════════════╝"));
  await sleep(200);

  const totalTransactions = 3200;
  console.log(clr(DIM, "\n  Analyzing co-purchase patterns across " + totalTransactions + " transactions..."));
  console.log(clr(DIM, "  Applying association rule mining: support, confidence, lift\n"));
  await sleep(200);

  // Show top association rules
  console.log(clr(BOLD, "  Association Rules (sorted by lift)"));
  console.log(clr(DIM, "  " + "─".repeat(68)));

  const sortedRules = [...coPurchases].sort((a, b) => b.lift - a.lift);
  for (const rule of sortedRules.slice(0, 6)) {
    const pA = products.find(p => p.id === rule.productA)!;
    const pB = products.find(p => p.id === rule.productB)!;
    const support = rule.frequency / totalTransactions;
    console.log(`  ${clr(BOLD, "Rule:")} ${pA.name} → ${pB.name}`);
    console.log(`  ${clr(DIM, "Support:")} ${(support * 100).toFixed(1)}%  ${clr(DIM, "Confidence:")} ${(rule.confidence * 100).toFixed(0)}%  ${clr(DIM, "Lift:")} ${clr(GRN, rule.lift.toFixed(1) + "x")}`);
    console.log();
    await sleep(100);
  }

  // Create 5 bundles
  const bundles = [
    { name: "Home Fitness Starter",      ids: [3, 11],    discount: 0.18 },
    { name: "Kitchen Essentials",        ids: [5, 13, 15], discount: 0.20 },
    { name: "Audio Power Pack",          ids: [1, 8],     discount: 0.15 },
    { name: "Desk Upgrade Kit",          ids: [7, 14, 4], discount: 0.22 },
    { name: "Hydration + Travel",        ids: [2, 9],     discount: 0.17 },
  ];

  console.log(clr(BOLD, "  Bundle Recommendations"));
  console.log(clr(DIM, "  " + "─".repeat(68)));

  for (const b of bundles) {
    const items = b.ids.map(id => products.find(p => p.id === id)!);
    const fullPrice = items.reduce((s, p) => s + p.price, 0);
    const bundlePrice = Math.round(fullPrice * (1 - b.discount) * 100) / 100;
    const savings = fullPrice - bundlePrice;
    const bundleCost = items.reduce((s, p) => s + p.cost, 0);
    const bundleMargin = (bundlePrice - bundleCost) / bundlePrice;

    // Find the best matching co-purchase rule for lift
    let bestLift = 1.0;
    for (const cp of coPurchases) {
      if (b.ids.includes(cp.productA) && b.ids.includes(cp.productB)) {
        bestLift = Math.max(bestLift, cp.lift);
      }
    }

    console.log(`\n  ${clr(BOLD + YEL, "🎁 " + b.name)}`);
    console.log(`  ${clr(DIM, "Products:")} ${items.map(p => p.name).join(" + ")}`);
    console.log(`  ${clr(DIM, "Full price:")} ${fmt$(fullPrice)}  →  ${clr(GRN, "Bundle: " + fmt$(bundlePrice))}  ${clr(CYN, "(save " + fmt$(savings) + ")")}`);
    console.log(`  ${clr(DIM, "Margin:")} ${(bundleMargin * 100).toFixed(0)}%  ${clr(DIM, "Lift:")} ${bestLift.toFixed(1)}x  ${clr(DIM, "Discount:")} ${(b.discount * 100).toFixed(0)}%`);

    // Visual margin bar
    const marginBar = bar(bundleMargin * 30);
    const profitOk = bundleMargin > 0.40;
    console.log(`  ${clr(DIM, "Profitability:")} ${clr(profitOk ? GRN : YEL, marginBar)} ${profitOk ? clr(GRN, "✓ Healthy") : clr(YEL, "⚠ Thin")}`);
    await sleep(120);
  }

  const avgDiscount = bundles.reduce((s, b) => s + b.discount, 0) / bundles.length;
  console.log(clr(DIM, "\n  " + "─".repeat(68)));
  console.log(`  ${clr(BOLD, "Summary:")} 5 bundles created, avg discount ${(avgDiscount * 100).toFixed(0)}%, all above min margin threshold.`);
  console.log(clr(GRN, "\n  ✓ Bundle creation complete — 5 profitable bundles ready for launch.\n"));
}

// ─── Agent 4: Conversion Optimizer ──────────────────────────────────────────

async function agentConversionOptimizer(): Promise<void> {
  console.log("\n" + clr(BOLD + BLU, "╔══════════════════════════════════════════════════════════════════════╗"));
  console.log(clr(BOLD + BLU, "║  🔄  AGENT 4 — CONVERSION OPTIMIZER                                ║"));
  console.log(clr(BOLD + BLU, "╚══════════════════════════════════════════════════════════════════════╝"));
  await sleep(200);

  console.log(clr(DIM, "\n  Analyzing purchase funnel with " + funnel[0].visitors.toLocaleString() + " monthly visits...\n"));
  await sleep(150);

  // Funnel visualization
  console.log(clr(BOLD, "  Conversion Funnel"));
  console.log(clr(DIM, "  " + "─".repeat(68)));

  const maxBar = 45;
  let biggestDrop = 0;
  let biggestDropIdx = 0;

  for (let i = 0; i < funnel.length; i++) {
    const stage = funnel[i];
    const pctOfTotal = stage.visitors / funnel[0].visitors;
    const barLen = Math.round(pctOfTotal * maxBar);
    const funnelBar = bar(barLen);

    console.log(`  ${clr(BLU, funnelBar)}${" ".repeat(maxBar - barLen + 1)}${stage.visitors.toLocaleString().padStart(7)} ${stage.name} (${(pctOfTotal * 100).toFixed(1)}%)`);

    if (i > 0) {
      const dropPct = 1 - stage.visitors / funnel[i - 1].visitors;
      if (dropPct > biggestDrop) { biggestDrop = dropPct; biggestDropIdx = i; }
      console.log(clr(DIM, " ".repeat(maxBar + 4) + `  ↓ ${(dropPct * 100).toFixed(0)}% drop`));
    }
    await sleep(100);
  }

  console.log();
  console.log(`  ${clr(RED + BOLD, "⚠ Biggest drop-off:")} ${funnel[biggestDropIdx - 1].name} → ${funnel[biggestDropIdx].name} (${(biggestDrop * 100).toFixed(0)}% loss)`);
  await sleep(150);

  // Drop-off analysis per stage
  console.log(clr(BOLD, "\n  Drop-off Reason Analysis"));
  console.log(clr(DIM, "  " + "─".repeat(68)));

  for (let i = 0; i < funnel.length - 1; i++) {
    const stage = funnel[i];
    const nextStage = funnel[i + 1];
    const lost = stage.visitors - nextStage.visitors;
    console.log(`\n  ${clr(BOLD, stage.name + " → " + nextStage.name)} ${clr(DIM, `(${lost.toLocaleString()} lost)`)}`);
    for (const reason of stage.dropoffReasons) {
      const reasonBar = bar(reason.percentage / 3);
      console.log(`    ${clr(RED, reasonBar)} ${reason.percentage}% — ${reason.reason}`);
      await sleep(40);
    }
  }

  // Revenue impact of 10% improvement at each stage
  await sleep(150);
  console.log(clr(BOLD, "\n\n  Revenue Impact of 10% Improvement at Each Stage"));
  console.log(clr(DIM, "  " + "─".repeat(68)));

  const avgOrderValue = products.reduce((s, p) => s + p.price * p.monthlySales, 0) / funnel[funnel.length - 1].visitors;

  interface Optimization { stage: string; additionalPurchases: number; revenueImpact: number; effort: string; priority: number; }
  const optimizations: Optimization[] = [];

  for (let i = 0; i < funnel.length - 1; i++) {
    const current = funnel[i + 1].visitors;
    const improved = Math.round(current * 1.10);
    const additional = improved - current;
    // Propagate through remaining funnel
    let finalAdditional = additional;
    for (let j = i + 2; j < funnel.length; j++) {
      finalAdditional = Math.round(finalAdditional * (funnel[j].visitors / funnel[j - 1].visitors));
    }
    const revenueImpact = finalAdditional * avgOrderValue;
    const efforts = ["Medium", "High", "Medium", "Low"];
    const effortScores = [2, 3, 2, 1];
    const priority = revenueImpact / effortScores[i];

    optimizations.push({
      stage: `${funnel[i].name} → ${funnel[i + 1].name}`,
      additionalPurchases: finalAdditional,
      revenueImpact,
      effort: efforts[i],
      priority,
    });
  }

  optimizations.sort((a, b) => b.priority - a.priority);
  for (const opt of optimizations) {
    const color = opt.revenueImpact > 40000 ? GRN : opt.revenueImpact > 20000 ? YEL : DIM;
    console.log(`  ${clr(color, "+")}${opt.additionalPurchases.toString().padStart(5)} purchases → ${clr(BOLD, padL(fmtK(opt.revenueImpact), 7))}${"/mo".padEnd(5)} ${clr(DIM, "(effort: " + opt.effort + ")")}  ${opt.stage}`);
    await sleep(80);
  }

  console.log(clr(DIM, "\n  " + "─".repeat(68)));
  console.log(clr(BOLD, "  Top priority:") + ` Fix ${optimizations[0].stage} — estimated ${clr(GRN, fmtK(optimizations[0].revenueImpact) + "/mo")} impact.`);
  console.log(clr(GRN, "\n  ✓ Funnel analysis complete — 4 optimization opportunities identified.\n"));
}

// ─── Agent 5: Customer Segmenter ────────────────────────────────────────────

async function agentCustomerSegmenter(): Promise<void> {
  console.log("\n" + clr(BOLD + RED, "╔══════════════════════════════════════════════════════════════════════╗"));
  console.log(clr(BOLD + RED, "║  👥  AGENT 5 — CUSTOMER SEGMENTER                                  ║"));
  console.log(clr(BOLD + RED, "╚══════════════════════════════════════════════════════════════════════╝"));
  await sleep(200);

  console.log(clr(DIM, `\n  Performing RFM analysis on ${customers.length} customers...\n`));
  await sleep(150);

  // Quintile scoring
  function quintile(values: number[], val: number, invert = false): number {
    const sorted = [...values].sort((a, b) => a - b);
    const idx = sorted.findIndex(v => v >= val);
    const pct = idx === -1 ? 1 : idx / sorted.length;
    const score = Math.ceil(pct * 5);
    return invert ? 6 - Math.max(1, Math.min(5, score)) : Math.max(1, Math.min(5, score));
  }

  const recencies = customers.map(c => c.lastPurchaseDays);
  const frequencies = customers.map(c => c.totalOrders);
  const monetaries = customers.map(c => c.totalSpent);

  interface RFMCustomer { customer: Customer; R: number; F: number; M: number; segment: string; }
  const rfmCustomers: RFMCustomer[] = customers.map(c => {
    const R = quintile(recencies, c.lastPurchaseDays, true); // lower recency = higher score
    const F = quintile(frequencies, c.totalOrders);
    const M = quintile(monetaries, c.totalSpent);

    let segment = "Low Value";
    if (R >= 4 && F >= 4 && M >= 4) segment = "Champions";
    else if (F >= 3 && M >= 3) segment = "Loyal";
    else if (R <= 2 && F >= 3) segment = "At Risk";
    else if (R >= 3 && F <= 2 && M <= 2) segment = "New/Low Value";

    return { customer: c, R, F, M, segment };
  });

  // Sample RFM scores
  console.log(clr(BOLD, "  Sample RFM Scores (first 12 customers)"));
  console.log(clr(DIM, "  " + "─".repeat(68)));
  console.log("  " + clr(BOLD, pad("Customer", 14)) + padL("Recency", 9) + padL("Freq", 7) + padL("Monetary", 10) + padL("R", 4) + padL("F", 4) + padL("M", 4) + "  " + pad("Segment", 14));
  console.log(clr(DIM, "  " + "─".repeat(68)));

  for (const rc of rfmCustomers.slice(0, 12)) {
    const c = rc.customer;
    const segColor = rc.segment === "Champions" ? GRN : rc.segment === "Loyal" ? CYN : rc.segment === "At Risk" ? RED : YEL;
    console.log("  " + pad(c.id.substring(0, 13), 14) + padL(c.lastPurchaseDays + "d", 9) + padL(String(c.totalOrders), 7)
      + padL(fmt$(c.totalSpent), 10) + padL(String(rc.R), 4) + padL(String(rc.F), 4) + padL(String(rc.M), 4) + "  " + clr(segColor, pad(rc.segment, 14)));
    await sleep(50);
  }

  // Segment summary
  await sleep(100);
  const segments: Map<string, RFMCustomer[]> = new Map();
  for (const rc of rfmCustomers) {
    if (!segments.has(rc.segment)) segments.set(rc.segment, []);
    segments.get(rc.segment)!.push(rc);
  }

  // RFM quadrant visualization
  console.log(clr(BOLD, "\n  RFM Quadrant Map"));
  console.log(clr(DIM, "  " + "─".repeat(40)));

  const champCount = (segments.get("Champions") || []).length;
  const loyalCount = (segments.get("Loyal") || []).length;
  const atRiskCount = (segments.get("At Risk") || []).length;
  const newCount = (segments.get("New/Low Value") || []).length;
  const lowCount = (segments.get("Low Value") || []).length;

  console.log(clr(DIM, "  Frequency"));
  console.log(`  5 │ ${clr(RED, pad("At Risk", 16))}│ ${clr(GRN, "Champions")}`);
  console.log(`    │ ${clr(RED, pad(`(${atRiskCount} cust)`, 16))}│ ${clr(GRN, `(${champCount} cust)`)}`);
  console.log(`    │ ${clr(RED, pad("avg $" + Math.round(avgOf(segments.get("At Risk") || [], c => c.customer.totalSpent)).toString(), 16))}│ ${clr(GRN, "avg $" + Math.round(avgOf(segments.get("Champions") || [], c => c.customer.totalSpent)).toString())}`);
  console.log(`  3 ├${"─".repeat(16)}┼${"─".repeat(18)}`);
  console.log(`    │ ${clr(DIM, pad("Hibernating", 16))}│ ${clr(CYN, "Loyal / Promising")}`);
  console.log(`    │ ${clr(DIM, pad(`(${lowCount} cust)`, 16))}│ ${clr(CYN, `(${loyalCount + newCount} cust)`)}`);
  console.log(`  1 └${"─".repeat(16)}┴${"─".repeat(18)}`);
  console.log(clr(DIM, "    1                3                5  Recency"));
  await sleep(100);

  // Segment profiles
  console.log(clr(BOLD, "\n  Segment Profiles & Recommended Actions"));
  console.log(clr(DIM, "  " + "─".repeat(68)));

  const segmentActions: Record<string, string> = {
    "Champions": "Reward program, early access to new products, referral program",
    "Loyal": "Upsell bundles, loyalty discounts, personalized recommendations",
    "At Risk": "Win-back campaign, special discount offer, feedback survey",
    "New/Low Value": "Welcome series, first-purchase discount, educational content",
    "Low Value": "Re-engagement email, flash sale notification, exit survey",
  };

  for (const [segName, custs] of segments) {
    const segColor = segName === "Champions" ? GRN : segName === "Loyal" ? CYN : segName === "At Risk" ? RED : YEL;
    const avgSpend = avgOf(custs, c => c.customer.totalSpent);
    const avgOrders = avgOf(custs, c => c.customer.totalOrders);
    const avgRecency = avgOf(custs, c => c.customer.lastPurchaseDays);
    // Simple CLV: avg spend per order × avg orders × projected lifetime multiplier
    const ltMultiplier = segName === "Champions" ? 3.5 : segName === "Loyal" ? 2.5 : segName === "At Risk" ? 1.2 : 1.0;
    const clv = avgSpend * ltMultiplier;

    console.log(`\n  ${clr(segColor + BOLD, segName)} ${clr(DIM, `(${custs.length} customers)`)}`);
    console.log(`    Avg Spend: ${fmt$(avgSpend)}  |  Avg Orders: ${avgOrders.toFixed(1)}  |  Avg Recency: ${avgRecency.toFixed(0)} days`);
    console.log(`    Est. CLV: ${clr(BOLD, fmt$(clv))}  |  LT Multiplier: ${ltMultiplier}x`);
    console.log(`    ${clr(CYN, "→ Action:")} ${segmentActions[segName] || "Monitor"}`);
    await sleep(80);
  }

  console.log(clr(GRN, "\n\n  ✓ Customer segmentation complete — " + customers.length + " customers classified into " + segments.size + " segments.\n"));
}

function avgOf<T>(arr: T[], fn: (t: T) => number): number {
  if (arr.length === 0) return 0;
  return arr.reduce((s, t) => s + fn(t), 0) / arr.length;
}

// ─── Agent 6: Revenue Forecaster ────────────────────────────────────────────

async function agentRevenueForecaster(pricingRecs: Map<number, { optimal: number; liftPct: number }>): Promise<void> {
  console.log("\n" + clr(BOLD + GRN, "╔══════════════════════════════════════════════════════════════════════╗"));
  console.log(clr(BOLD + GRN, "║  📈  AGENT 6 — REVENUE FORECASTER                                  ║"));
  console.log(clr(BOLD + GRN, "╚══════════════════════════════════════════════════════════════════════╝"));
  await sleep(200);

  console.log(clr(DIM, "\n  Running Monte Carlo simulation (1,000 iterations, seeded PRNG)..."));
  console.log(clr(DIM, "  Modeling uncertainty in conversion, AOV, traffic, pricing, and bundles.\n"));
  await sleep(200);

  // Base monthly revenue
  const baseMonthlyRevenue = products.reduce((s, p) => s + p.price * p.monthlySales, 0);
  const baseConversionRate = 0.032;
  const baseAOV = baseMonthlyRevenue / funnel[funnel.length - 1].visitors;
  const baseTraffic = funnel[0].visitors;

  // Pricing optimization total lift (clamped positive)
  const totalPricingLift = Math.max(0.05, products.reduce((s, p) => {
    const rec = pricingRecs.get(p.id)!;
    return s + Math.max(0, rec.liftPct) * (p.price * p.monthlySales);
  }, 0) / baseMonthlyRevenue);

  const iterations = 1000;
  const months = 3;

  function simulate(optimized: boolean, seed: number): number[] {
    const rng = seededRandom(seed);
    const results: number[] = [];
    for (let i = 0; i < iterations; i++) {
      let totalRevenue = 0;
      for (let m = 0; m < months; m++) {
        // Traffic with growth
        const trafficGrowth = 1 + (0.02 + rng() * 0.03) * (m + 1);
        const traffic = baseTraffic * trafficGrowth * (0.92 + rng() * 0.16);

        // Conversion rate
        let convRate = baseConversionRate * (0.85 + rng() * 0.30);
        if (optimized) convRate *= 1 + 0.05 + rng() * 0.10; // funnel optimization

        // AOV
        let aov = baseAOV * (0.90 + rng() * 0.20);
        if (optimized) {
          aov *= 1 + totalPricingLift * (0.5 + rng() * 0.5); // pricing lift
          aov *= 1 + (0.03 + rng() * 0.05); // bundle adoption
        }

        totalRevenue += traffic * convRate * aov;
      }
      results.push(totalRevenue);
    }
    return results.sort((a, b) => a - b);
  }

  // Progress indicator
  process.stdout.write("  Simulating: ");
  const currentResults = simulate(false, 12345);
  process.stdout.write(clr(DIM, "current ✓  "));
  await sleep(100);
  const optimizedResults = simulate(true, 12345);
  console.log(clr(DIM, "optimized ✓"));
  await sleep(100);

  function percentile(arr: number[], p: number): number {
    const idx = Math.floor(arr.length * p);
    return arr[Math.min(idx, arr.length - 1)];
  }

  const curP10 = percentile(currentResults, 0.10);
  const curP50 = percentile(currentResults, 0.50);
  const curP90 = percentile(currentResults, 0.90);
  const optP10 = percentile(optimizedResults, 0.10);
  const optP50 = percentile(optimizedResults, 0.50);
  const optP90 = percentile(optimizedResults, 0.90);

  // Histogram function
  function showHistogram(title: string, data: number[], color: string): void {
    console.log(clr(BOLD, `\n  ${title}`));
    console.log(clr(DIM, "  " + "─".repeat(55)));

    const minVal = data[0];
    const maxVal = data[data.length - 1];
    const buckets = 12;
    const bucketSize = (maxVal - minVal) / buckets;
    const counts: number[] = Array(buckets).fill(0);
    for (const v of data) {
      const b = Math.min(Math.floor((v - minVal) / bucketSize), buckets - 1);
      counts[b]++;
    }
    const maxCount = Math.max(...counts);
    const p50 = percentile(data, 0.5);

    for (let b = 0; b < buckets; b++) {
      const lo = minVal + b * bucketSize;
      const label = fmtK(lo);
      const barLen = Math.round((counts[b] / maxCount) * 30);
      const histBar = bar(barLen);
      const isMedian = lo <= p50 && p50 < lo + bucketSize;
      const marker = isMedian ? clr(BOLD, " ← median") : "";
      console.log(`  ${padL(label, 7)} │ ${clr(color, histBar)}${" ".repeat(Math.max(0, 31 - barLen))}${counts[b].toString().padStart(4)}${marker}`);
    }
    console.log(clr(DIM, `         └${"─".repeat(40)}`));
  }

  showHistogram("90-Day Revenue — Current (no changes)", currentResults, BLU);
  console.log(`  ${clr(DIM, "P10=")}${fmtK(curP10)}  ${clr(DIM, "P50=")}${clr(BOLD, fmtK(curP50))}  ${clr(DIM, "P90=")}${fmtK(curP90)}`);
  await sleep(200);

  showHistogram("90-Day Revenue — Optimized (all recommendations)", optimizedResults, GRN);
  console.log(`  ${clr(DIM, "P10=")}${fmtK(optP10)}  ${clr(DIM, "P50=")}${clr(BOLD, fmtK(optP50))}  ${clr(DIM, "P90=")}${fmtK(optP90)}`);
  await sleep(200);

  // Comparison
  const upliftP50 = optP50 - curP50;
  const upliftPct = upliftP50 / curP50;
  // Probability optimized > current median
  const probBetter = optimizedResults.filter(v => v > curP50).length / iterations;

  console.log(clr(BOLD, "\n  Scenario Comparison"));
  console.log(clr(DIM, "  " + "─".repeat(55)));
  console.log(`  ${pad("", 20)} ${padL("P10", 10)} ${padL("P50", 10)} ${padL("P90", 10)}`);
  console.log(`  ${clr(BLU, pad("Current", 20))} ${padL(fmtK(curP10), 10)} ${padL(fmtK(curP50), 10)} ${padL(fmtK(curP90), 10)}`);
  console.log(`  ${clr(GRN, pad("Optimized", 20))} ${padL(fmtK(optP10), 10)} ${padL(fmtK(optP50), 10)} ${padL(fmtK(optP90), 10)}`);
  console.log(`  ${clr(BOLD, pad("Uplift (median)", 20))} ${padL("", 10)} ${padL(clr(GRN + BOLD, "+" + fmtK(upliftP50)), 10)} ${padL(`(${(upliftPct * 100).toFixed(1)}%)`, 10)}`);

  console.log(`\n  ${clr(BOLD, "Probability optimized > current median:")} ${clr(GRN + BOLD, (probBetter * 100).toFixed(1) + "%")}`);
  console.log(clr(GRN, "\n  ✓ Monte Carlo forecast complete — 1,000 iterations simulated.\n"));
}

// ─── Main ───────────────────────────────────────────────────────────────────

async function main(): Promise<void> {
  console.log(clr(BOLD + WHT, "\n" + "═".repeat(72)));
  console.log(clr(BOLD + WHT, "  🛒  E-COMMERCE OPTIMIZER  —  Multi-Agent Squad Simulation"));
  console.log(clr(BOLD + WHT, "═".repeat(72)));
  console.log(clr(DIM, `  ${products.length} products  •  ${customers.length} customers  •  ${funnel[0].visitors.toLocaleString()} monthly visits  •  6 agents\n`));
  await sleep(300);

  await agentCatalogAnalyst();
  await sleep(200);

  const { recommendations } = await agentPricingEngine();
  await sleep(200);

  await agentBundleCreator();
  await sleep(200);

  await agentConversionOptimizer();
  await sleep(200);

  await agentCustomerSegmenter();
  await sleep(200);

  await agentRevenueForecaster(recommendations);

  // Final summary
  console.log(clr(BOLD + WHT, "═".repeat(72)));
  console.log(clr(BOLD + WHT, "  🏁  ALL 6 AGENTS COMPLETE — OPTIMIZATION PLAN READY"));
  console.log(clr(BOLD + WHT, "═".repeat(72)));
  console.log(clr(DIM, "  📦 Catalog scored    💲 Prices optimized   🎁 5 bundles created"));
  console.log(clr(DIM, "  🔄 Funnel analyzed   👥 Customers segmented  📈 Revenue forecasted"));
  console.log(clr(BOLD + GRN, "\n  Ready to deploy. Ship it! 🚀\n"));
}

main().catch(console.error);
