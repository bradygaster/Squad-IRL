// ─────────────────────────────────────────────────────────────
//  A/B Test Analyzer  —  6-Agent Squad Demo
//  All code in one file, zero external dependencies.
// ─────────────────────────────────────────────────────────────

const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

// ── ANSI helpers ────────────────────────────────────────────
const ANSI = {
  reset: "\x1b[0m",
  bold: "\x1b[1m",
  dim: "\x1b[2m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  magenta: "\x1b[35m",
  cyan: "\x1b[36m",
  white: "\x1b[37m",
  bgRed: "\x1b[41m",
  bgGreen: "\x1b[42m",
  bgYellow: "\x1b[43m",
  bgBlue: "\x1b[44m",
  bgMagenta: "\x1b[45m",
  bgCyan: "\x1b[46m",
};

function clr(text: string, ...codes: string[]): string {
  return codes.join("") + text + ANSI.reset;
}

function header(icon: string, title: string, color: string) {
  const line = "─".repeat(60);
  console.log();
  console.log(clr(line, color));
  console.log(clr(`  ${icon}  ${title}`, color, ANSI.bold));
  console.log(clr(line, color));
}

function box(lines: string[], color: string = ANSI.white) {
  const maxLen = Math.max(...lines.map((l) => stripAnsi(l).length));
  const top = "╔" + "═".repeat(maxLen + 2) + "╗";
  const bot = "╚" + "═".repeat(maxLen + 2) + "╝";
  console.log(clr(top, color));
  for (const l of lines) {
    const pad = " ".repeat(maxLen - stripAnsi(l).length);
    console.log(clr("║ ", color) + l + pad + clr(" ║", color));
  }
  console.log(clr(bot, color));
}

function stripAnsi(s: string): string {
  return s.replace(/\x1b\[[0-9;]*m/g, "");
}

function pct(n: number, d: number = 1): string {
  return (n * 100 * d).toFixed(2) + "%";
}

function money(n: number): string {
  if (Math.abs(n) >= 1_000_000) return "$" + (n / 1_000_000).toFixed(1) + "M";
  if (Math.abs(n) >= 1_000) return "$" + (n / 1_000).toFixed(0) + "K";
  return "$" + n.toFixed(2);
}

// ── Data types ──────────────────────────────────────────────
interface TestVariant {
  name: string;
  visitors: number;
  conversions: number;
  revenue: number;
  avgOrderValue: number;
}

interface SegmentArm {
  visitors: number;
  conversions: number;
  revenue: number;
}

interface Segment {
  name: string;
  control: SegmentArm;
  treatment: SegmentArm;
}

interface ABTest {
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  control: TestVariant;
  treatment: TestVariant;
  segments: Segment[];
}

// ── Demo data ───────────────────────────────────────────────
const tests: ABTest[] = [
  {
    name: "Checkout Button Color",
    description: "Changed CTA from grey to green on checkout page",
    startDate: "2025-05-01",
    endDate: "2025-05-28",
    control: { name: "Grey Button", visitors: 45_230, conversions: 1_582, revenue: 142_380, avgOrderValue: 90.0 },
    treatment: { name: "Green Button", visitors: 45_180, conversions: 1_851, revenue: 170_292, avgOrderValue: 92.0 },
    segments: [
      { name: "Mobile", control: { visitors: 22_100, conversions: 710, revenue: 63_190 }, treatment: { visitors: 22_050, conversions: 882, revenue: 80_614 } },
      { name: "Desktop", control: { visitors: 23_130, conversions: 872, revenue: 79_190 }, treatment: { visitors: 23_130, conversions: 969, revenue: 89_678 } },
      { name: "New Users", control: { visitors: 18_000, conversions: 540, revenue: 47_520 }, treatment: { visitors: 17_900, conversions: 680, revenue: 62_560 } },
      { name: "Returning", control: { visitors: 27_230, conversions: 1_042, revenue: 94_860 }, treatment: { visitors: 27_280, conversions: 1_171, revenue: 107_732 } },
      { name: "US", control: { visitors: 27_000, conversions: 972, revenue: 88_452 }, treatment: { visitors: 26_950, conversions: 1_157, revenue: 107_581 } },
      { name: "EU", control: { visitors: 12_230, conversions: 404, revenue: 35_148 }, treatment: { visitors: 12_230, conversions: 462, revenue: 41_118 } },
      { name: "Asia", control: { visitors: 6_000, conversions: 206, revenue: 18_780 }, treatment: { visitors: 6_000, conversions: 232, revenue: 21_593 } },
    ],
  },
  {
    name: "Product Page Layout",
    description: "Moved reviews above the fold on product detail pages",
    startDate: "2025-05-10",
    endDate: "2025-05-24",
    control: { name: "Reviews Below", visitors: 28_100, conversions: 843, revenue: 67_440, avgOrderValue: 80.0 },
    treatment: { name: "Reviews Above", visitors: 27_950, conversions: 867, revenue: 68_493, avgOrderValue: 79.0 },
    segments: [
      { name: "Mobile", control: { visitors: 14_200, conversions: 412, revenue: 32_548 }, treatment: { visitors: 14_100, conversions: 420, revenue: 33_180 } },
      { name: "Desktop", control: { visitors: 13_900, conversions: 431, revenue: 34_892 }, treatment: { visitors: 13_850, conversions: 447, revenue: 35_313 } },
      { name: "New Users", control: { visitors: 11_500, conversions: 322, revenue: 25_438 }, treatment: { visitors: 11_400, conversions: 335, revenue: 26_465 } },
      { name: "Returning", control: { visitors: 16_600, conversions: 521, revenue: 42_002 }, treatment: { visitors: 16_550, conversions: 532, revenue: 42_028 } },
      { name: "US", control: { visitors: 16_860, conversions: 505, revenue: 40_400 }, treatment: { visitors: 16_770, conversions: 520, revenue: 41_080 } },
      { name: "EU", control: { visitors: 7_800, conversions: 234, revenue: 18_720 }, treatment: { visitors: 7_780, conversions: 240, revenue: 18_960 } },
      { name: "Asia", control: { visitors: 3_440, conversions: 104, revenue: 8_320 }, treatment: { visitors: 3_400, conversions: 107, revenue: 8_453 } },
    ],
  },
  {
    name: "Free Shipping Threshold",
    description: "Lowered free-shipping minimum from $50 → $35",
    startDate: "2025-04-20",
    endDate: "2025-05-25",
    control: { name: "$50 Threshold", visitors: 52_000, conversions: 2_340, revenue: 210_600, avgOrderValue: 90.0 },
    treatment: { name: "$35 Threshold", visitors: 51_800, conversions: 2_590, revenue: 194_250, avgOrderValue: 75.0 },
    segments: [
      // Simpson's paradox: Mobile shows treatment WINS on conversions, but overall revenue drops
      { name: "Mobile", control: { visitors: 26_000, conversions: 1_040, revenue: 88_400 }, treatment: { visitors: 26_200, conversions: 1_310, revenue: 91_700 } },
      { name: "Desktop", control: { visitors: 26_000, conversions: 1_300, revenue: 122_200 }, treatment: { visitors: 25_600, conversions: 1_280, revenue: 102_550 } },
      // New Users: treatment wins on rate but loses revenue per visitor
      { name: "New Users", control: { visitors: 20_800, conversions: 832, revenue: 72_384 }, treatment: { visitors: 20_720, conversions: 952, revenue: 66_640 } },
      { name: "Returning", control: { visitors: 31_200, conversions: 1_508, revenue: 138_216 }, treatment: { visitors: 31_080, conversions: 1_638, revenue: 127_610 } },
      { name: "US", control: { visitors: 31_200, conversions: 1_404, revenue: 126_360 }, treatment: { visitors: 31_080, conversions: 1_554, revenue: 116_550 } },
      { name: "EU", control: { visitors: 14_560, conversions: 655, revenue: 58_968 }, treatment: { visitors: 14_504, conversions: 726, revenue: 54_390 } },
      { name: "Asia", control: { visitors: 6_240, conversions: 281, revenue: 25_272 }, treatment: { visitors: 6_216, conversions: 310, revenue: 23_310 } },
    ],
  },
];

// ── Statistical functions (REAL MATH) ───────────────────────

/** Standard normal CDF — Abramowitz & Stegun 26.2.17 */
function normalCDF(z: number): number {
  if (z < -8) return 0;
  if (z > 8) return 1;
  const a1 = 0.254829592;
  const a2 = -0.284496736;
  const a3 = 1.421413741;
  const a4 = -1.453152027;
  const a5 = 1.061405429;
  const p = 0.3275911;
  const sign = z < 0 ? -1 : 1;
  const x = Math.abs(z) / Math.SQRT2;
  const t = 1.0 / (1.0 + p * x);
  const y = 1.0 - ((((a5 * t + a4) * t + a3) * t + a2) * t + a1) * t * Math.exp(-x * x);
  return 0.5 * (1.0 + sign * y);
}

/** Inverse normal CDF — rational approximation (Peter Acklam) */
function normalInvCDF(p: number): number {
  if (p <= 0) return -Infinity;
  if (p >= 1) return Infinity;
  const a = [
    -3.969683028665376e1, 2.209460984245205e2, -2.759285104469687e2,
    1.383577518672690e2, -3.066479806614716e1, 2.506628277459239e0,
  ];
  const b = [
    -5.447609879822406e1, 1.615858368580409e2, -1.556989798598866e2,
    6.680131188771972e1, -1.328068155288572e1,
  ];
  const c = [
    -7.784894002430293e-3, -3.223964580411365e-1, -2.400758277161838e0,
    -2.549732539343734e0, 4.374664141464968e0, 2.938163982698783e0,
  ];
  const d = [
    7.784695709041462e-3, 3.224671290700398e-1, 2.445134137142996e0,
    3.754408661907416e0,
  ];
  const pLow = 0.02425;
  const pHigh = 1 - pLow;

  let q: number, r: number;
  if (p < pLow) {
    q = Math.sqrt(-2 * Math.log(p));
    return (
      (((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) /
      ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1)
    );
  }
  if (p <= pHigh) {
    q = p - 0.5;
    r = q * q;
    return (
      ((((((a[0] * r + a[1]) * r + a[2]) * r + a[3]) * r + a[4]) * r + a[5]) * q) /
      (((((b[0] * r + b[1]) * r + b[2]) * r + b[3]) * r + b[4]) * r + 1)
    );
  }
  q = Math.sqrt(-2 * Math.log(1 - p));
  return (
    -(((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) /
    ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1)
  );
}

/** Two-proportion z-test */
function zTest(
  p1: number, n1: number, p2: number, n2: number
): { z: number; pValue: number; pooled: number; se: number } {
  const pooled = (p1 * n1 + p2 * n2) / (n1 + n2);
  const se = Math.sqrt(pooled * (1 - pooled) * (1 / n1 + 1 / n2));
  const z = (p2 - p1) / se;
  const pValue = 2 * (1 - normalCDF(Math.abs(z)));
  return { z, pValue, pooled, se };
}

/** Wald confidence interval for difference in proportions */
function confidenceInterval(
  p1: number, n1: number, p2: number, n2: number, confidence: number
): { lower: number; upper: number; center: number } {
  const zCrit = normalInvCDF(1 - (1 - confidence) / 2);
  const center = p2 - p1;
  const se = Math.sqrt(p1 * (1 - p1) / n1 + p2 * (1 - p2) / n2);
  return { lower: center - zCrit * se, upper: center + zCrit * se, center };
}

/** Statistical power for a two-proportion z-test */
function statisticalPower(
  p1: number, p2: number, n1: number, n2: number, alpha: number
): number {
  const zAlpha = normalInvCDF(1 - alpha / 2);
  const se0 = Math.sqrt(
    ((p1 + p2) / 2) * (1 - (p1 + p2) / 2) * (1 / n1 + 1 / n2)
  );
  const se1 = Math.sqrt(p1 * (1 - p1) / n1 + p2 * (1 - p2) / n2);
  const zBeta = (Math.abs(p2 - p1) - zAlpha * se0) / se1;
  return normalCDF(zBeta);
}

/** Minimum per-arm sample size for desired power */
function minSampleSize(
  p1: number, mde: number, alpha: number, power: number
): number {
  const p2 = p1 + mde;
  const zAlpha = normalInvCDF(1 - alpha / 2);
  const zBeta = normalInvCDF(power);
  const num =
    Math.pow(zAlpha + zBeta, 2) * (p1 * (1 - p1) + p2 * (1 - p2));
  const denom = Math.pow(p2 - p1, 2);
  return Math.ceil(num / denom);
}

/** Chi-squared test for 1-dof (sample ratio mismatch) */
function chiSquaredSRM(observed1: number, observed2: number, expected_ratio: number): { chi2: number; pValue: number } {
  const total = observed1 + observed2;
  const e1 = total * (expected_ratio / (1 + expected_ratio));
  const e2 = total - e1;
  const chi2 = Math.pow(observed1 - e1, 2) / e1 + Math.pow(observed2 - e2, 2) / e2;
  // 1-dof chi-squared p-value via normal approximation
  const pValue = 1 - normalCDF(Math.sqrt(chi2));
  return { chi2, pValue };
}

// ── Agent 1: Data Validator ─────────────────────────────────
async function agentDataValidator() {
  header("🔍", "Agent 1 — Data Validator", ANSI.cyan);
  await sleep(200);
  console.log(clr("  Checking data quality across all three experiments…\n", ANSI.dim));
  await sleep(300);

  console.log(clr("  Formula for minimum sample size:", ANSI.cyan));
  console.log(clr("  n = (Z_α/2 + Z_β)² × (p₁(1-p₁) + p₂(1-p₂)) / (p₁ - p₂)²", ANSI.bold, ANSI.white));
  console.log();
  await sleep(200);

  const rows: string[][] = [];

  for (const t of tests) {
    const p1 = t.control.conversions / t.control.visitors;
    const p2 = t.treatment.conversions / t.treatment.visitors;
    const mde = Math.abs(p2 - p1);
    const needed = minSampleSize(p1, mde || 0.005, 0.05, 0.80);
    const actualPerArm = Math.min(t.control.visitors, t.treatment.visitors);
    const sampleOk = actualPerArm >= needed;

    console.log(clr(`  ▸ ${t.name}`, ANSI.bold, ANSI.white));

    // Sample size check
    const zAlpha = normalInvCDF(0.975);
    const zBeta = normalInvCDF(0.80);
    const p2Calc = p1 + (mde || 0.005);
    console.log(clr(`    p_control = ${p1.toFixed(4)}   p_treatment = ${p2.toFixed(4)}   MDE = ${(mde || 0.005).toFixed(4)}`, ANSI.dim));
    console.log(clr(`    Z_α/2 = ${zAlpha.toFixed(4)}   Z_β = ${zBeta.toFixed(4)}`, ANSI.dim));
    console.log(clr(`    n = (${zAlpha.toFixed(2)} + ${zBeta.toFixed(2)})² × (${p1.toFixed(4)}×${(1 - p1).toFixed(4)} + ${p2Calc.toFixed(4)}×${(1 - p2Calc).toFixed(4)}) / (${(mde || 0.005).toFixed(4)})²`, ANSI.dim));
    console.log(clr(`    n = ${needed.toLocaleString()} per arm   (actual: ${actualPerArm.toLocaleString()})`, ANSI.dim));
    const sampleIcon = sampleOk ? clr("✅ Adequate", ANSI.green) : clr("❌ Under-powered", ANSI.red);
    console.log(`    Sample size: ${sampleIcon}`);
    await sleep(150);

    // Sample ratio mismatch
    const srm = chiSquaredSRM(t.control.visitors, t.treatment.visitors, 1);
    const srmOk = srm.pValue > 0.01;
    console.log(clr(`    χ² SRM = ${srm.chi2.toFixed(4)}  p = ${srm.pValue.toFixed(4)}`, ANSI.dim));
    const srmIcon = srmOk ? clr("✅ No mismatch", ANSI.green) : clr("⚠️  Ratio mismatch", ANSI.yellow);
    console.log(`    Sample ratio: ${srmIcon}`);
    await sleep(150);

    // Simpson's paradox
    const overallLift = p2 - p1;
    let paradoxFound = false;
    for (const seg of t.segments) {
      const sc = seg.control.conversions / seg.control.visitors;
      const st = seg.treatment.conversions / seg.treatment.visitors;
      const segLift = st - sc;
      // Revenue-based paradox check too
      const revC = seg.control.revenue / seg.control.visitors;
      const revT = seg.treatment.revenue / seg.treatment.visitors;
      const revLift = revT - revC;
      const overallRevLift = t.treatment.revenue / t.treatment.visitors - t.control.revenue / t.control.visitors;
      if ((segLift > 0 && overallLift < 0) || (segLift < 0 && overallLift > 0) ||
          (revLift > 0 && overallRevLift < 0) || (revLift < 0 && overallRevLift > 0)) {
        paradoxFound = true;
        break;
      }
    }
    const paradoxIcon = paradoxFound
      ? clr("⚠️  Simpson's paradox detected", ANSI.yellow)
      : clr("✅ Consistent", ANSI.green);
    console.log(`    Simpson's paradox: ${paradoxIcon}`);
    await sleep(150);

    // Randomization
    const days = (new Date(t.endDate).getTime() - new Date(t.startDate).getTime()) / 86_400_000;
    const randOk = days >= 7 && srmOk;
    const randIcon = randOk ? clr("✅ Pass", ANSI.green) : clr("⚠️  Check", ANSI.yellow);
    console.log(`    Randomization (${days}d runtime): ${randIcon}`);
    console.log();
    await sleep(200);

    rows.push([t.name, sampleOk ? "✅" : "❌", srmOk ? "✅" : "⚠️", paradoxFound ? "⚠️" : "✅", randOk ? "✅" : "⚠️"]);
  }

  // Summary table
  console.log(clr("  Validation Summary", ANSI.bold, ANSI.cyan));
  console.log("  ┌────────────────────────────┬──────────┬──────┬──────────┬──────┐");
  console.log("  │ Test                       │ Sample   │ SRM  │ Simpson  │ Rand │");
  console.log("  ├────────────────────────────┼──────────┼──────┼──────────┼──────┤");
  for (const r of rows) {
    const name = r[0].padEnd(26);
    console.log(`  │ ${name} │   ${r[1]}     │  ${r[2]}  │   ${r[3]}     │  ${r[4]}  │`);
  }
  console.log("  └────────────────────────────┴──────────┴──────┴──────────┴──────┘");
}

// ── Agent 2: Stats Engine ───────────────────────────────────
async function agentStatsEngine() {
  header("📊", "Agent 2 — Stats Engine", ANSI.magenta);
  await sleep(200);
  console.log(clr("  Running two-proportion z-tests with full workings…\n", ANSI.dim));

  const summaryRows: string[][] = [];

  for (const t of tests) {
    const n1 = t.control.visitors;
    const n2 = t.treatment.visitors;
    const p1 = t.control.conversions / n1;
    const p2 = t.treatment.conversions / n2;

    console.log(clr(`  ═══ ${t.name} ═══`, ANSI.bold, ANSI.magenta));
    await sleep(150);

    // Step 1: Conversion rates
    console.log(clr("  Step 1: Conversion Rates", ANSI.bold));
    console.log(`    p_control   = ${t.control.conversions} / ${n1} = ${clr(pct(p1), ANSI.white, ANSI.bold)}`);
    console.log(`    p_treatment = ${t.treatment.conversions} / ${n2} = ${clr(pct(p2), ANSI.white, ANSI.bold)}`);
    await sleep(150);

    // Step 2: Pooled proportion
    const result = zTest(p1, n1, p2, n2);
    console.log(clr("\n  Step 2: Pooled Proportion", ANSI.bold));
    console.log(`    p̂ = (${t.control.conversions} + ${t.treatment.conversions}) / (${n1} + ${n2})`);
    console.log(`    p̂ = ${(t.control.conversions + t.treatment.conversions)} / ${(n1 + n2)} = ${clr(result.pooled.toFixed(6), ANSI.white, ANSI.bold)}`);
    await sleep(150);

    // Step 3: Standard error
    console.log(clr("\n  Step 3: Standard Error", ANSI.bold));
    console.log(`    SE = √( p̂(1-p̂)(1/n₁ + 1/n₂) )`);
    console.log(`    SE = √( ${result.pooled.toFixed(6)} × ${(1 - result.pooled).toFixed(6)} × (1/${n1} + 1/${n2}) )`);
    console.log(`    SE = ${clr(result.se.toFixed(8), ANSI.white, ANSI.bold)}`);
    await sleep(150);

    // Step 4: Z-score
    console.log(clr("\n  Step 4: Z-Score", ANSI.bold));
    console.log(`    z = (p₂ - p₁) / SE`);
    console.log(`    z = (${p2.toFixed(6)} - ${p1.toFixed(6)}) / ${result.se.toFixed(8)}`);
    console.log(`    z = ${clr(result.z.toFixed(4), ANSI.white, ANSI.bold)}`);
    await sleep(150);

    // Step 5: P-value
    console.log(clr("\n  Step 5: P-Value (two-tailed)", ANSI.bold));
    console.log(`    p-value = 2 × (1 - Φ(|${result.z.toFixed(4)}|))`);
    const sig = result.pValue < 0.05;
    const pColor = sig ? ANSI.green : ANSI.yellow;
    console.log(`    p-value = ${clr(result.pValue < 0.0001 ? result.pValue.toExponential(4) : result.pValue.toFixed(6), pColor, ANSI.bold)}  ${sig ? "← significant at α=0.05" : "← NOT significant"}`);
    await sleep(150);

    // Step 6: Confidence interval
    const ci = confidenceInterval(p1, n1, p2, n2, 0.95);
    console.log(clr("\n  Step 6: 95% Confidence Interval (difference)", ANSI.bold));
    console.log(`    Δ = ${ci.center >= 0 ? "+" : ""}${pct(ci.center)}  [${pct(ci.lower)}, ${pct(ci.upper)}]`);
    const relLift = (p2 - p1) / p1;
    const relLower = ci.lower / p1;
    const relUpper = ci.upper / p1;
    console.log(`    Relative lift: ${relLift >= 0 ? "+" : ""}${pct(relLift)}  [${pct(relLower)}, ${pct(relUpper)}]`);
    await sleep(150);

    // Step 7: Power
    const power = statisticalPower(p1, p2, n1, n2, 0.05);
    console.log(clr("\n  Step 7: Statistical Power", ANSI.bold));
    console.log(`    Power = ${clr(pct(power), ANSI.white, ANSI.bold)}  (target ≥ 80%)`);
    console.log();
    await sleep(200);

    summaryRows.push([
      t.name,
      pct(p1),
      pct(p2),
      result.z.toFixed(2),
      result.pValue < 0.0001 ? "<0.0001" : result.pValue.toFixed(4),
      `${ci.center >= 0 ? "+" : ""}${pct(ci.center)}`,
      pct(power),
      sig ? "Yes ✓" : "No ✗",
    ]);
  }

  // Summary table
  console.log(clr("  ┌────────────────────────────┬─────────┬─────────┬────────┬──────────┬──────────┬─────────┬───────┐", ANSI.magenta));
  console.log(clr("  │ Test                       │ p_ctrl  │ p_treat │ z-stat │ p-value  │ Δ rate   │ Power   │ Sig?  │", ANSI.magenta));
  console.log(clr("  ├────────────────────────────┼─────────┼─────────┼────────┼──────────┼──────────┼─────────┼───────┤", ANSI.magenta));
  for (const r of summaryRows) {
    const cells = [
      r[0].padEnd(26),
      r[1].padStart(7),
      r[2].padStart(7),
      r[3].padStart(6),
      r[4].padStart(8),
      r[5].padStart(8),
      r[6].padStart(7),
      r[7].padStart(5),
    ];
    console.log(clr(`  │ ${cells[0]} │ ${cells[1]} │ ${cells[2]} │ ${cells[3]} │ ${cells[4]} │ ${cells[5]} │ ${cells[6]} │ ${cells[7]} │`, ANSI.magenta));
  }
  console.log(clr("  └────────────────────────────┴─────────┴─────────┴────────┴──────────┴──────────┴─────────┴───────┘", ANSI.magenta));
}

// ── Agent 3: Segment Analyzer ───────────────────────────────
async function agentSegmentAnalyzer() {
  header("📈", "Agent 3 — Segment Analyzer", ANSI.blue);
  await sleep(200);
  console.log(clr("  Breaking down each experiment by user segments…\n", ANSI.dim));

  // Per-test segment tables
  for (const t of tests) {
    console.log(clr(`  ▸ ${t.name}`, ANSI.bold, ANSI.white));
    console.log("  ┌──────────────┬──────────┬──────────┬──────────┬─────────┬──────────┐");
    console.log("  │ Segment      │ ctrl CVR │ treat CVR│ Lift     │ p-value │ Sig?     │");
    console.log("  ├──────────────┼──────────┼──────────┼──────────┼─────────┼──────────┤");
    for (const seg of t.segments) {
      const sc = seg.control.conversions / seg.control.visitors;
      const st = seg.treatment.conversions / seg.treatment.visitors;
      const lift = (st - sc) / sc;
      const res = zTest(sc, seg.control.visitors, st, seg.treatment.visitors);
      const sig = res.pValue < 0.05;
      const liftStr = (lift >= 0 ? "+" : "") + pct(lift);
      const sigStr = sig ? clr("Yes ✓", ANSI.green) : clr("No ✗ ", ANSI.dim);
      console.log(
        `  │ ${seg.name.padEnd(12)} │ ${pct(sc).padStart(8)} │ ${pct(st).padStart(8)} │ ${liftStr.padStart(8)} │ ${res.pValue.toFixed(4).padStart(7)} │ ${sigStr}    │`
      );
    }
    console.log("  └──────────────┴──────────┴──────────┴──────────┴─────────┴──────────┘");
    console.log();
    await sleep(200);
  }

  // ASCII Heatmap
  console.log(clr("  Segment Performance Heatmap (conversion rate lift %)", ANSI.bold, ANSI.blue));
  console.log();
  const segNames = ["Mobile", "Desktop", "New Users", "Returning", "US", "EU", "Asia"];
  const hdr = "                " + tests.map((t) => t.name.substring(0, 14).padEnd(16)).join("");
  console.log(clr(hdr, ANSI.bold));

  for (const segName of segNames) {
    let row = `  ${segName.padEnd(14)}`;
    for (const t of tests) {
      const seg = t.segments.find((s) => s.name === segName);
      if (!seg) { row += "".padEnd(16); continue; }
      const sc = seg.control.conversions / seg.control.visitors;
      const st = seg.treatment.conversions / seg.treatment.visitors;
      const lift = ((st - sc) / sc) * 100;
      const absLift = Math.abs(lift);
      const barLen = Math.min(Math.round(absLift / 2), 8);
      let bar: string;
      if (lift > 3) bar = clr("█".repeat(barLen), ANSI.green) + ` +${lift.toFixed(0)}%`;
      else if (lift > 0) bar = clr("░".repeat(Math.max(barLen, 1)), ANSI.dim) + ` +${lift.toFixed(0)}%`;
      else if (lift > -3) bar = clr("▒".repeat(Math.max(barLen, 1)), ANSI.yellow) + ` ${lift.toFixed(0)}%`;
      else bar = clr("▓".repeat(barLen), ANSI.red) + ` ${lift.toFixed(0)}%`;
      row += bar.padEnd(16 + 10); // extra for ANSI codes
    }
    console.log(row);
  }
  console.log();
  await sleep(200);

  // Simpson's paradox callout
  console.log(clr("  ⚠️  Simpson's Paradox Alert", ANSI.bold, ANSI.yellow));
  for (const t of tests) {
    const overallRevC = t.control.revenue / t.control.visitors;
    const overallRevT = t.treatment.revenue / t.treatment.visitors;
    const overallRevLift = overallRevT - overallRevC;
    for (const seg of t.segments) {
      const revC = seg.control.revenue / seg.control.visitors;
      const revT = seg.treatment.revenue / seg.treatment.visitors;
      const segRevLift = revT - revC;
      if ((segRevLift > 0.01 && overallRevLift < -0.01) || (segRevLift < -0.01 && overallRevLift > 0.01)) {
        console.log(
          clr(`  → ${t.name} / ${seg.name}:`, ANSI.yellow) +
          ` segment rev/visitor ${segRevLift > 0 ? "+" : ""}$${segRevLift.toFixed(4)} vs overall ${overallRevLift > 0 ? "+" : ""}$${overallRevLift.toFixed(4)}`
        );
      }
    }
  }
}

// ── Agent 4: Revenue Calculator ─────────────────────────────
async function agentRevenueCalculator() {
  header("💰", "Agent 4 — Revenue Calculator", ANSI.green);
  await sleep(200);
  console.log(clr("  Projecting annualized revenue impact with confidence bands…\n", ANSI.dim));

  let totalBest = 0;
  let totalWorst = 0;
  let totalExpected = 0;

  for (const t of tests) {
    const n1 = t.control.visitors;
    const n2 = t.treatment.visitors;
    const rpv1 = t.control.revenue / n1;
    const rpv2 = t.treatment.revenue / n2;
    const rpvDiff = rpv2 - rpv1;

    const days = (new Date(t.endDate).getTime() - new Date(t.startDate).getTime()) / 86_400_000;
    const dailyVisitors = Math.round((n1 + n2) / days);

    // Bootstrap-style CI using conversion CI scaled by AOV
    const p1 = t.control.conversions / n1;
    const p2 = t.treatment.conversions / n2;
    const ci = confidenceInterval(p1, n1, p2, n2, 0.95);

    const aovBlend = (t.control.avgOrderValue + t.treatment.avgOrderValue) / 2;
    const annualLow = dailyVisitors * 365 * ci.lower * aovBlend;
    const annualMid = dailyVisitors * 365 * ci.center * aovBlend;
    const annualHigh = dailyVisitors * 365 * ci.upper * aovBlend;

    console.log(clr(`  ▸ ${t.name}`, ANSI.bold, ANSI.white));
    console.log(clr(`    Revenue/visitor:  control = $${rpv1.toFixed(4)}   treatment = $${rpv2.toFixed(4)}`, ANSI.dim));
    console.log(clr(`    Δ RPV = $${rpvDiff >= 0 ? "+" : ""}${rpvDiff.toFixed(4)}/visitor`, ANSI.dim));
    console.log(clr(`    Daily visitors ≈ ${dailyVisitors.toLocaleString()}   (over ${days} day test)`, ANSI.dim));
    console.log(clr(`    Annual impact = ${dailyVisitors.toLocaleString()} × 365 × Δ_conversion_rate × AOV`, ANSI.dim));
    console.log(`    Projected annual: ${clr(money(annualLow), annualLow < 0 ? ANSI.red : ANSI.dim)} — ${clr(money(annualMid), annualMid < 0 ? ANSI.red : ANSI.green, ANSI.bold)} — ${clr(money(annualHigh), annualHigh < 0 ? ANSI.red : ANSI.dim)}`);
    await sleep(150);

    // ASCII bar
    const barWidth = 50;
    const range = Math.max(Math.abs(annualHigh), Math.abs(annualLow)) * 1.3;
    const zeroPos = Math.round(barWidth / 2);
    const lowPos = Math.round(zeroPos + (annualLow / range) * (barWidth / 2));
    const midPos = Math.round(zeroPos + (annualMid / range) * (barWidth / 2));
    const highPos = Math.round(zeroPos + (annualHigh / range) * (barWidth / 2));
    const minP = Math.max(0, Math.min(lowPos, highPos));
    const maxP = Math.min(barWidth, Math.max(lowPos, highPos));
    let bar = "";
    for (let i = 0; i < barWidth; i++) {
      if (i === midPos) bar += "|";
      else if (i >= minP && i <= maxP) bar += "=";
      else if (i === zeroPos) bar += "·";
      else bar += " ";
    }
    const label = `    [${bar}]  ${money(annualLow)} — ${money(annualMid)} — ${money(annualHigh)}`;
    console.log(clr(label, annualMid >= 0 ? ANSI.green : ANSI.red));
    console.log();
    await sleep(200);

    totalBest += annualHigh;
    totalWorst += annualLow;
    totalExpected += annualMid;
  }

  console.log(clr("  Portfolio Impact (all 3 tests combined)", ANSI.bold, ANSI.green));
  console.log(`    Worst case:  ${clr(money(totalWorst), totalWorst < 0 ? ANSI.red : ANSI.green)}`);
  console.log(`    Expected:    ${clr(money(totalExpected), totalExpected < 0 ? ANSI.red : ANSI.green, ANSI.bold)}`);
  console.log(`    Best case:   ${clr(money(totalBest), totalBest < 0 ? ANSI.red : ANSI.green)}`);
}

// ── Agent 5: Risk Assessor ──────────────────────────────────
async function agentRiskAssessor() {
  header("⚠️", "Agent 5 — Risk Assessor", ANSI.yellow);
  await sleep(200);
  console.log(clr("  Evaluating experiment risks across five dimensions…\n", ANSI.dim));

  type RiskLevel = "Low" | "Medium" | "High";
  interface RiskRow {
    test: string;
    novelty: RiskLevel;
    srm: RiskLevel;
    peeking: RiskLevel;
    seasonality: RiskLevel;
    external: RiskLevel;
    score: number;
  }

  const weights = { novelty: 0.2, srm: 0.25, peeking: 0.2, seasonality: 0.15, external: 0.2 };
  const riskVal = (r: RiskLevel) => r === "Low" ? 1 : r === "Medium" ? 2 : 3;

  const riskRows: RiskRow[] = [];

  for (const t of tests) {
    const days = (new Date(t.endDate).getTime() - new Date(t.startDate).getTime()) / 86_400_000;
    const srm = chiSquaredSRM(t.control.visitors, t.treatment.visitors, 1);
    const p1 = t.control.conversions / t.control.visitors;
    const p2 = t.treatment.conversions / t.treatment.visitors;
    const power = statisticalPower(p1, p2, t.control.visitors, t.treatment.visitors, 0.05);

    const novelty: RiskLevel = days < 14 ? "High" : days < 21 ? "Medium" : "Low";
    const srmRisk: RiskLevel = srm.pValue < 0.01 ? "High" : srm.pValue < 0.05 ? "Medium" : "Low";
    const peekingRisk: RiskLevel = power < 0.5 ? "High" : power < 0.8 ? "Medium" : "Low";
    const seasonalityRisk: RiskLevel = days < 14 ? "High" : days >= 28 ? "Low" : "Medium";
    const externalRisk: RiskLevel = "Medium"; // conservative default

    const score =
      weights.novelty * riskVal(novelty) +
      weights.srm * riskVal(srmRisk) +
      weights.peeking * riskVal(peekingRisk) +
      weights.seasonality * riskVal(seasonalityRisk) +
      weights.external * riskVal(externalRisk);

    riskRows.push({ test: t.name, novelty, srm: srmRisk, peeking: peekingRisk, seasonality: seasonalityRisk, external: externalRisk, score });
  }

  function riskClr(r: RiskLevel): string {
    if (r === "Low") return clr(r.padEnd(6), ANSI.green);
    if (r === "Medium") return clr(r.padEnd(6), ANSI.yellow);
    return clr(r.padEnd(6), ANSI.red);
  }

  console.log("  ┌────────────────────────────┬─────────┬─────────┬─────────┬────────────┬──────────┬───────┐");
  console.log("  │ Test                       │ Novelty │ SRM     │ Peeking │ Seasonal   │ External │ Score │");
  console.log("  ├────────────────────────────┼─────────┼─────────┼─────────┼────────────┼──────────┼───────┤");
  for (const r of riskRows) {
    const name = r.test.padEnd(26);
    console.log(`  │ ${name} │ ${riskClr(r.novelty)}  │ ${riskClr(r.srm)}  │ ${riskClr(r.peeking)}  │ ${riskClr(r.seasonality)}     │ ${riskClr(r.external)}   │ ${r.score.toFixed(1).padStart(5)} │`);
  }
  console.log("  └────────────────────────────┴─────────┴─────────┴─────────┴────────────┴──────────┴───────┘");
  console.log();
  await sleep(200);

  console.log(clr("  Risk scale: 1.0 = minimal risk … 3.0 = high risk", ANSI.dim));
  for (const r of riskRows) {
    const barLen = Math.round(r.score * 8);
    const color = r.score < 1.5 ? ANSI.green : r.score < 2.2 ? ANSI.yellow : ANSI.red;
    console.log(`    ${r.test.padEnd(28)} ${clr("█".repeat(barLen), color)} ${r.score.toFixed(2)}`);
  }
}

// ── Agent 6: Decision Maker ─────────────────────────────────
async function agentDecisionMaker() {
  header("🎯", "Agent 6 — Decision Maker", ANSI.green);
  await sleep(200);
  console.log(clr("  Synthesizing all evidence into final recommendations…\n", ANSI.dim));

  const decisions: { test: string; decision: string; confidence: string; reasons: string[] }[] = [];

  for (const t of tests) {
    const n1 = t.control.visitors;
    const n2 = t.treatment.visitors;
    const p1 = t.control.conversions / n1;
    const p2 = t.treatment.conversions / n2;
    const result = zTest(p1, n1, p2, n2);
    const power = statisticalPower(p1, p2, n1, n2, 0.05);
    const ci = confidenceInterval(p1, n1, p2, n2, 0.95);
    const relLift = (p2 - p1) / p1;
    const days = (new Date(t.endDate).getTime() - new Date(t.startDate).getTime()) / 86_400_000;

    // Revenue check
    const rpvDiff = t.treatment.revenue / n2 - t.control.revenue / n1;

    // Segment consistency
    let segConsistent = true;
    let segDisagree = 0;
    for (const seg of t.segments) {
      const sc = seg.control.conversions / seg.control.visitors;
      const st = seg.treatment.conversions / seg.treatment.visitors;
      if ((st > sc && p2 < p1) || (st < sc && p2 > p1)) segDisagree++;
    }
    if (segDisagree >= 2) segConsistent = false;

    console.log(clr(`  ═══ ${t.name} ═══`, ANSI.bold, ANSI.white));
    console.log();

    // Scorecard
    const criteria: { name: string; pass: boolean; weight: number; detail: string }[] = [
      { name: "Statistical significance", pass: result.pValue < 0.05, weight: 0.25, detail: `p=${result.pValue < 0.0001 ? "<0.0001" : result.pValue.toFixed(4)}` },
      { name: "Practical significance", pass: Math.abs(relLift) > 0.02, weight: 0.20, detail: `lift=${(relLift * 100).toFixed(1)}% (MDE=2%)` },
      { name: "Adequate power", pass: power >= 0.8, weight: 0.15, detail: `power=${(power * 100).toFixed(0)}%` },
      { name: "Revenue positive", pass: rpvDiff > 0, weight: 0.20, detail: `Δ RPV=$${rpvDiff >= 0 ? "+" : ""}${rpvDiff.toFixed(4)}` },
      { name: "Segments consistent", pass: segConsistent, weight: 0.10, detail: `${segDisagree} segment(s) disagree` },
      { name: "Low risk (duration)", pass: days >= 14, weight: 0.10, detail: `${days} days` },
    ];

    let weightedScore = 0;
    console.log("  ┌───────────────────────────────┬────────┬────────┬───────────────────────────┐");
    console.log("  │ Criterion                     │ Weight │ Result │ Detail                    │");
    console.log("  ├───────────────────────────────┼────────┼────────┼───────────────────────────┤");
    for (const c of criteria) {
      const icon = c.pass ? clr("PASS", ANSI.green) : clr("FAIL", ANSI.red);
      weightedScore += c.pass ? c.weight : 0;
      console.log(`  │ ${c.name.padEnd(29)} │  ${(c.weight * 100).toFixed(0).padStart(3)}%  │ ${icon}   │ ${c.detail.padEnd(25)} │`);
    }
    console.log("  └───────────────────────────────┴────────┴────────┴───────────────────────────┘");
    console.log(`    Weighted score: ${clr((weightedScore * 100).toFixed(0) + "%", ANSI.bold, ANSI.white)}`);
    console.log();
    await sleep(200);

    // Decision logic
    let decision: string;
    let confidence: string;
    const reasons: string[] = [];

    // Negative revenue with high power is a clear DON'T SHIP
    if (rpvDiff < 0 && power >= 0.8 && result.pValue < 0.05) {
      decision = "DON'T SHIP";
      confidence = "HIGH";
      reasons.push("Treatment decreases revenue per visitor despite higher conversions");
      reasons.push("Sufficient power to trust this negative result");
    } else if (weightedScore >= 0.75 && result.pValue < 0.05 && rpvDiff > 0) {
      decision = "SHIP";
      confidence = "HIGH";
      reasons.push("Statistically significant with positive revenue impact");
      if (segConsistent) reasons.push("Consistent across all segments");
    } else if (weightedScore >= 0.50 || (result.pValue < 0.10 && rpvDiff > 0)) {
      decision = "EXTEND";
      confidence = "MEDIUM";
      if (result.pValue >= 0.05) reasons.push("Not yet significant — need more data");
      if (power < 0.8) reasons.push("Under-powered — extend to reach 80% power");
      if (!segConsistent) reasons.push("Mixed segment results — investigate further");
    } else {
      decision = "DON'T SHIP";
      confidence = rpvDiff < 0 ? "HIGH" : "MEDIUM";
      if (rpvDiff < 0) reasons.push("Treatment decreases revenue per visitor");
      if (!segConsistent) reasons.push("Inconsistent segment-level results");
      if (result.pValue >= 0.05) reasons.push("No statistically significant improvement");
    }

    decisions.push({ test: t.name, decision, confidence, reasons });
  }

  // Final recommendation box
  console.log();
  console.log(clr("  ╔══════════════════════════════════════════════════════════════╗", ANSI.bold, ANSI.green));
  console.log(clr("  ║                  FINAL RECOMMENDATIONS                      ║", ANSI.bold, ANSI.green));
  console.log(clr("  ╠══════════════════════════════════════════════════════════════╣", ANSI.bold, ANSI.green));

  for (const d of decisions) {
    let decColor: string;
    let decIcon: string;
    if (d.decision === "SHIP") { decColor = ANSI.green; decIcon = "🟢"; }
    else if (d.decision === "EXTEND") { decColor = ANSI.yellow; decIcon = "🟡"; }
    else { decColor = ANSI.red; decIcon = "🔴"; }

    const decStr = `${decIcon} ${d.test}`;
    const decLabel = clr(d.decision, decColor, ANSI.bold);
    const confLabel = clr(`(${d.confidence} confidence)`, ANSI.dim);
    console.log(clr("  ║", ANSI.bold, ANSI.green));
    console.log(clr("  ║  ", ANSI.bold, ANSI.green) + `${decStr}`);
    console.log(clr("  ║  ", ANSI.bold, ANSI.green) + `Decision: ${decLabel}  ${confLabel}`);
    for (const r of d.reasons) {
      console.log(clr("  ║  ", ANSI.bold, ANSI.green) + clr(`  → ${r}`, ANSI.dim));
    }
  }
  console.log(clr("  ║", ANSI.bold, ANSI.green));
  console.log(clr("  ╚══════════════════════════════════════════════════════════════╝", ANSI.bold, ANSI.green));
}

// ── Main ────────────────────────────────────────────────────
async function main() {
  console.clear();
  box(
    [
      clr("A/B Test Analyzer — Squad Demo", ANSI.bold, ANSI.white),
      "",
      "6 specialist agents collaborate to evaluate 3 experiments",
      "with real statistical tests, segment analysis, and revenue projections.",
      "",
      `Tests: ${tests.map((t) => `"${t.name}"`).join(", ")}`,
    ],
    ANSI.cyan
  );

  console.log(clr("\n  Agents:", ANSI.bold));
  const agents = [
    ["🔍", "Data Validator", "Sample sizes, SRM, Simpson's paradox"],
    ["📊", "Stats Engine", "Z-tests, confidence intervals, power analysis"],
    ["📈", "Segment Analyzer", "Per-segment breakdowns, heatmap"],
    ["💰", "Revenue Calculator", "Annualized revenue projections with CIs"],
    ["⚠️", "Risk Assessor", "Novelty, peeking bias, seasonality risks"],
    ["🎯", "Decision Maker", "Ship / Don't ship / Extend recommendations"],
  ];
  for (const [icon, name, desc] of agents) {
    console.log(`    ${icon}  ${clr(name, ANSI.bold)}  ${clr("— " + desc, ANSI.dim)}`);
  }
  await sleep(500);

  await agentDataValidator();
  await agentStatsEngine();
  await agentSegmentAnalyzer();
  await agentRevenueCalculator();
  await agentRiskAssessor();
  await agentDecisionMaker();

  console.log();
  console.log(clr("  ✓ Analysis complete — all 6 agents reported.", ANSI.bold, ANSI.green));
  console.log();
}

main();
