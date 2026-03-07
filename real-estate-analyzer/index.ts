// Real Estate Investment Analyzer — 6 agents, 5 properties
// Self-contained TypeScript sample. No external APIs.

// ── Helpers ──────────────────────────────────────────────────────────

const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

const fmt = (n: number): string => {
  const abs = Math.abs(n);
  const s = abs.toLocaleString("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
  return n < 0 ? `-$${s}` : `$${s}`;
};

const fmtDec = (n: number, d = 2): string => {
  const abs = Math.abs(n);
  const s = abs.toLocaleString("en-US", {
    minimumFractionDigits: d,
    maximumFractionDigits: d,
  });
  return n < 0 ? `-$${s}` : `$${s}`;
};

const pct = (n: number, d = 1): string => `${n.toFixed(d)}%`;

const bar = (score: number, max = 10, width = 20): string => {
  const filled = Math.round((score / max) * width);
  return "█".repeat(filled) + "░".repeat(width - filled);
};

// ANSI colours
const C = {
  reset: "\x1b[0m",
  bold: "\x1b[1m",
  dim: "\x1b[2m",
  italic: "\x1b[3m",
  underline: "\x1b[4m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  red: "\x1b[31m",
  blue: "\x1b[34m",
  magenta: "\x1b[35m",
  cyan: "\x1b[36m",
  white: "\x1b[37m",
  bgGreen: "\x1b[42m",
  bgYellow: "\x1b[43m",
  bgRed: "\x1b[41m",
  bgBlue: "\x1b[44m",
  bgCyan: "\x1b[46m",
  bgMagenta: "\x1b[45m",
};

const line = (ch = "─", len = 72) => ch.repeat(len);
const boxTop = (title: string, w = 70) => {
  const inner = w - 4 - title.length;
  return `╭─ ${title} ${"─".repeat(Math.max(0, inner))}╮`;
};
const boxBot = (w = 70) => `╰${"─".repeat(w - 2)}╯`;
const boxRow = (content: string, w = 70) => {
  const plain = content.replace(/\x1b\[[0-9;]*m/g, "");
  const pad = Math.max(0, w - 4 - plain.length);
  return `│ ${content}${" ".repeat(pad)} │`;
};

function agentHeader(name: string, emoji: string, desc: string) {
  console.log();
  console.log(`${C.bold}${C.cyan}${"═".repeat(72)}${C.reset}`);
  console.log(
    `${C.bold}${C.cyan}  ${emoji}  ${name}${C.reset}${C.dim} — ${desc}${C.reset}`
  );
  console.log(`${C.bold}${C.cyan}${"═".repeat(72)}${C.reset}`);
  console.log();
}

// ── Types ────────────────────────────────────────────────────────────

interface Property {
  id: number;
  address: string;
  neighborhood: string;
  price: number;
  sqft: number;
  beds: number;
  baths: number;
  yearBuilt: number;
  hoaMonthly: number;
  annualTaxes: number;
  lotSize: string;
  parking: string;
  features: string[];
  condition: number; // 1-10
}

interface SaleComp {
  address: string;
  salePrice: number;
  saleDate: string;
  sqft: number;
  pricePerSqft: number;
}

interface CompResult {
  property: Property;
  comps: SaleComp[];
  estimatedValue: number;
  valueDiff: number;
  valueDiffPct: number;
}

interface RentalComp {
  address: string;
  rent: number;
  sqft: number;
  rentPerSqft: number;
}

interface RentalResult {
  property: Property;
  rentalComps: RentalComp[];
  estimatedRent: number;
  grossRentMultiplier: number;
  vacancyRate: number;
}

interface MortgageCalc {
  rate: number;
  monthlyPayment: number;
  totalInterest: number;
}

interface FinancialResult {
  property: Property;
  downPayment: number;
  closingCosts: number;
  totalCashInvested: number;
  mortgages: MortgageCalc[];
  annualRent: number;
  noi: number;
  capRate: number;
  monthlyCashFlow: number;
  annualCashFlow: number;
  cashOnCash: number;
  npv6: number;
  npv8: number;
  npv10: number;
}

interface NeighborhoodScore {
  neighborhood: string;
  schools: number;
  transit: number;
  safety: number;
  jobGrowth: number;
  walkScore: number;
  populationTrend: number;
  overall: number;
}

type RiskLevel = "LOW" | "MEDIUM" | "HIGH";

interface RiskFactor {
  name: string;
  level: RiskLevel;
  detail: string;
}

interface RiskResult {
  property: Property;
  factors: RiskFactor[];
  overallRisk: RiskLevel;
}

// ── Property Data ────────────────────────────────────────────────────

const PROPERTIES: Property[] = [
  {
    id: 1,
    address: "742 Elm Street",
    neighborhood: "Oak Park",
    price: 285000,
    sqft: 1450,
    beds: 3,
    baths: 2,
    yearBuilt: 1962,
    hoaMonthly: 0,
    annualTaxes: 4200,
    lotSize: "0.28 acres",
    parking: "2-car garage",
    features: [
      "Hardwood floors",
      "Updated kitchen",
      "Fenced yard",
      "Central AC",
    ],
    condition: 7,
  },
  {
    id: 2,
    address: "101 Main Street, Unit 14B",
    neighborhood: "Downtown",
    price: 340000,
    sqft: 1100,
    beds: 2,
    baths: 2,
    yearBuilt: 2018,
    hoaMonthly: 350,
    annualTaxes: 5100,
    lotSize: "N/A (condo)",
    parking: "1 assigned spot",
    features: [
      "Floor-to-ceiling windows",
      "In-unit laundry",
      "Rooftop deck",
      "Concierge",
    ],
    condition: 9,
  },
  {
    id: 3,
    address: "28 Riverside Drive",
    neighborhood: "Riverside",
    price: 425000,
    sqft: 2200,
    beds: 4,
    baths: 3,
    yearBuilt: 1985,
    hoaMonthly: 75,
    annualTaxes: 6800,
    lotSize: "0.45 acres",
    parking: "2-car attached garage",
    features: [
      "Finished basement",
      "Fireplace",
      "Screened porch",
      "New roof 2021",
    ],
    condition: 6,
  },
  {
    id: 4,
    address: "555 West 4th Avenue",
    neighborhood: "Westside",
    price: 195000,
    sqft: 850,
    beds: 2,
    baths: 1,
    yearBuilt: 1955,
    hoaMonthly: 0,
    annualTaxes: 2900,
    lotSize: "0.15 acres",
    parking: "Street parking",
    features: [
      "Duplex unit",
      "Separate entrance",
      "Updated plumbing",
      "Storage shed",
    ],
    condition: 5,
  },
  {
    id: 5,
    address: "1200 Lakewood Boulevard",
    neighborhood: "Lakewood",
    price: 310000,
    sqft: 1650,
    beds: 3,
    baths: 2.5,
    yearBuilt: 2005,
    hoaMonthly: 200,
    annualTaxes: 4800,
    lotSize: "0.12 acres",
    parking: "2-car garage",
    features: [
      "Open floor plan",
      "Granite counters",
      "Community pool",
      "Walk-in closets",
    ],
    condition: 8,
  },
];

// ── Comparable Sales Data ────────────────────────────────────────────

const SALE_COMPS: Record<number, SaleComp[]> = {
  1: [
    { address: "718 Elm Street", salePrice: 278000, saleDate: "2024-11-15", sqft: 1400, pricePerSqft: 198.57 },
    { address: "803 Oak Avenue", salePrice: 295000, saleDate: "2024-10-03", sqft: 1520, pricePerSqft: 194.08 },
    { address: "651 Maple Lane", salePrice: 272000, saleDate: "2024-12-01", sqft: 1380, pricePerSqft: 197.10 },
  ],
  2: [
    { address: "101 Main St, Unit 8A", salePrice: 355000, saleDate: "2024-10-20", sqft: 1150, pricePerSqft: 308.70 },
    { address: "225 Commerce Blvd, Unit 3C", salePrice: 330000, saleDate: "2024-11-08", sqft: 1050, pricePerSqft: 314.29 },
    { address: "101 Main St, Unit 22D", salePrice: 348000, saleDate: "2024-09-25", sqft: 1120, pricePerSqft: 310.71 },
  ],
  3: [
    { address: "15 Riverside Drive", salePrice: 440000, saleDate: "2024-10-12", sqft: 2300, pricePerSqft: 191.30 },
    { address: "42 River Road", salePrice: 418000, saleDate: "2024-11-28", sqft: 2150, pricePerSqft: 194.42 },
    { address: "7 Creekview Court", salePrice: 455000, saleDate: "2024-09-30", sqft: 2400, pricePerSqft: 189.58 },
  ],
  4: [
    { address: "540 West 4th Avenue", salePrice: 188000, saleDate: "2024-11-05", sqft: 820, pricePerSqft: 229.27 },
    { address: "612 West 3rd Avenue", salePrice: 205000, saleDate: "2024-10-18", sqft: 900, pricePerSqft: 227.78 },
    { address: "489 Westside Blvd", salePrice: 192000, saleDate: "2024-12-10", sqft: 840, pricePerSqft: 228.57 },
  ],
  5: [
    { address: "1180 Lakewood Blvd", salePrice: 305000, saleDate: "2024-10-22", sqft: 1600, pricePerSqft: 190.63 },
    { address: "1315 Lakeview Terrace", salePrice: 320000, saleDate: "2024-11-14", sqft: 1700, pricePerSqft: 188.24 },
    { address: "1050 Lakewood Court", salePrice: 298000, saleDate: "2024-09-18", sqft: 1580, pricePerSqft: 188.61 },
  ],
};

// ── Rental Comp Data ─────────────────────────────────────────────────

const RENTAL_COMPS: Record<number, RentalComp[]> = {
  1: [
    { address: "730 Elm Street", rent: 1750, sqft: 1400, rentPerSqft: 1.25 },
    { address: "815 Oak Avenue", rent: 1850, sqft: 1500, rentPerSqft: 1.23 },
    { address: "660 Maple Lane", rent: 1700, sqft: 1350, rentPerSqft: 1.26 },
  ],
  2: [
    { address: "101 Main St, Unit 6A", rent: 2200, sqft: 1100, rentPerSqft: 2.00 },
    { address: "225 Commerce Blvd, Unit 5B", rent: 2050, sqft: 1000, rentPerSqft: 2.05 },
    { address: "101 Main St, Unit 19C", rent: 2300, sqft: 1180, rentPerSqft: 1.95 },
  ],
  3: [
    { address: "20 Riverside Drive", rent: 2600, sqft: 2200, rentPerSqft: 1.18 },
    { address: "50 River Road", rent: 2500, sqft: 2100, rentPerSqft: 1.19 },
    { address: "12 Creekview Court", rent: 2750, sqft: 2350, rentPerSqft: 1.17 },
  ],
  4: [
    { address: "548 West 4th Avenue", rent: 1250, sqft: 830, rentPerSqft: 1.51 },
    { address: "620 West 3rd Avenue", rent: 1300, sqft: 880, rentPerSqft: 1.48 },
    { address: "495 Westside Blvd", rent: 1200, sqft: 800, rentPerSqft: 1.50 },
  ],
  5: [
    { address: "1190 Lakewood Blvd", rent: 2050, sqft: 1620, rentPerSqft: 1.27 },
    { address: "1320 Lakeview Terrace", rent: 2150, sqft: 1680, rentPerSqft: 1.28 },
    { address: "1060 Lakewood Court", rent: 1950, sqft: 1560, rentPerSqft: 1.25 },
  ],
};

// ── Neighborhood Data ────────────────────────────────────────────────

const NEIGHBORHOOD_SCORES: Record<string, NeighborhoodScore> = {
  "Oak Park": {
    neighborhood: "Oak Park",
    schools: 7,
    transit: 5,
    safety: 8,
    jobGrowth: 2.8,
    walkScore: 62,
    populationTrend: 1.2,
    overall: 0,
  },
  Downtown: {
    neighborhood: "Downtown",
    schools: 5,
    transit: 9,
    safety: 6,
    jobGrowth: 4.5,
    walkScore: 92,
    populationTrend: 3.1,
    overall: 0,
  },
  Riverside: {
    neighborhood: "Riverside",
    schools: 8,
    transit: 4,
    safety: 9,
    jobGrowth: 2.1,
    walkScore: 45,
    populationTrend: 0.8,
    overall: 0,
  },
  Westside: {
    neighborhood: "Westside",
    schools: 4,
    transit: 6,
    safety: 5,
    jobGrowth: 3.2,
    walkScore: 71,
    populationTrend: 1.8,
    overall: 0,
  },
  Lakewood: {
    neighborhood: "Lakewood",
    schools: 8,
    transit: 6,
    safety: 8,
    jobGrowth: 3.5,
    walkScore: 58,
    populationTrend: 2.4,
    overall: 0,
  },
};

// ── Risk Data ────────────────────────────────────────────────────────

const RISK_DATA: Record<number, RiskFactor[]> = {
  1: [
    { name: "Flood Zone", level: "LOW", detail: "Zone X — minimal flood risk" },
    { name: "Market Trend", level: "LOW", detail: "Steady 3.2% annual appreciation" },
    { name: "Vacancy Risk", level: "MEDIUM", detail: "Area vacancy rate 6.8%" },
    { name: "Deferred Maintenance", level: "MEDIUM", detail: "HVAC system is 18 years old" },
    { name: "Environmental", level: "LOW", detail: "No known hazards" },
    { name: "Insurance", level: "LOW", detail: "Standard rates, no special assessments" },
  ],
  2: [
    { name: "Flood Zone", level: "LOW", detail: "Zone X — elevated building" },
    { name: "Market Trend", level: "MEDIUM", detail: "Condo market softening, 1.1% growth" },
    { name: "Vacancy Risk", level: "HIGH", detail: "Downtown vacancy rate 11.2%" },
    { name: "Deferred Maintenance", level: "LOW", detail: "Built 2018, all systems current" },
    { name: "Environmental", level: "LOW", detail: "No known hazards" },
    { name: "Insurance", level: "MEDIUM", detail: "High-rise surcharge applies" },
  ],
  3: [
    { name: "Flood Zone", level: "MEDIUM", detail: "Zone AE — 100-year floodplain edge" },
    { name: "Market Trend", level: "LOW", detail: "Strong 4.1% appreciation trend" },
    { name: "Vacancy Risk", level: "LOW", detail: "Family area, 3.2% vacancy" },
    { name: "Deferred Maintenance", level: "HIGH", detail: "Original windows, furnace 25+ years" },
    { name: "Environmental", level: "MEDIUM", detail: "Radon levels slightly elevated" },
    { name: "Insurance", level: "HIGH", detail: "Flood insurance required, ~$1,800/yr" },
  ],
  4: [
    { name: "Flood Zone", level: "LOW", detail: "Zone X — no flood history" },
    { name: "Market Trend", level: "MEDIUM", detail: "Gentrifying area, 2.5% growth" },
    { name: "Vacancy Risk", level: "MEDIUM", detail: "Transitional area, 7.5% vacancy" },
    { name: "Deferred Maintenance", level: "HIGH", detail: "1955 build, foundation needs inspection" },
    { name: "Environmental", level: "HIGH", detail: "Possible lead paint, asbestos risk" },
    { name: "Insurance", level: "MEDIUM", detail: "Older structure surcharge" },
  ],
  5: [
    { name: "Flood Zone", level: "LOW", detail: "Zone X — well-drained area" },
    { name: "Market Trend", level: "LOW", detail: "Growing suburb, 3.8% appreciation" },
    { name: "Vacancy Risk", level: "LOW", detail: "Popular area, 4.1% vacancy" },
    { name: "Deferred Maintenance", level: "LOW", detail: "2005 build, well-maintained" },
    { name: "Environmental", level: "LOW", detail: "No known hazards" },
    { name: "Insurance", level: "LOW", detail: "Standard HOA master policy" },
  ],
};

// ── Agent 1: Data Agent ──────────────────────────────────────────────

async function dataAgent(): Promise<void> {
  agentHeader("DATA AGENT", "🏠", "Property Research & Details");

  for (const p of PROPERTIES) {
    await sleep(80);
    const pricePerSqft = p.price / p.sqft;
    console.log(boxTop(`Property #${p.id}: ${p.neighborhood}`, 70));
    console.log(boxRow(`${C.bold}${p.address}${C.reset}`, 70));
    console.log(boxRow(`${C.dim}${line("─", 66)}${C.reset}`, 70));
    console.log(
      boxRow(
        `${C.green}${C.bold}${fmt(p.price)}${C.reset}  │  ${p.beds}BR/${p.baths}BA  │  ${p.sqft.toLocaleString()} sqft  │  Built ${p.yearBuilt}`,
        70
      )
    );
    console.log(
      boxRow(
        `Price/sqft: ${C.cyan}${fmtDec(pricePerSqft)}${C.reset}  │  HOA: ${fmtDec(p.hoaMonthly)}/mo  │  Taxes: ${fmt(p.annualTaxes)}/yr`,
        70
      )
    );
    console.log(
      boxRow(`Lot: ${p.lotSize}  │  Parking: ${p.parking}  │  Condition: ${p.condition}/10`, 70)
    );
    console.log(
      boxRow(
        `${C.dim}Features: ${p.features.join(", ")}${C.reset}`,
        70
      )
    );
    console.log(boxBot(70));
    console.log();
  }
}

// ── Agent 2: Comp Agent ──────────────────────────────────────────────

async function compAgent(): Promise<CompResult[]> {
  agentHeader("COMP AGENT", "📊", "Comparable Sales Analysis");

  const results: CompResult[] = [];

  for (const p of PROPERTIES) {
    await sleep(60);
    const comps = SALE_COMPS[p.id];
    // Weighted average: most recent sale gets highest weight
    const weights = [0.35, 0.35, 0.30];
    const estimatedValue = Math.round(
      comps.reduce((sum, c, i) => sum + c.pricePerSqft * weights[i], 0) * p.sqft
    );
    const valueDiff = p.price - estimatedValue;
    const valueDiffPct = (valueDiff / estimatedValue) * 100;

    results.push({ property: p, comps, estimatedValue, valueDiff, valueDiffPct });

    console.log(
      `  ${C.bold}${C.cyan}Property #${p.id}${C.reset} — ${p.address} (${p.neighborhood})`
    );
    console.log(`  ${C.dim}${"─".repeat(64)}${C.reset}`);
    console.log(
      `  ${C.dim}${"Comp".padEnd(30)} ${"Sale Price".padStart(12)} ${"Date".padStart(12)} ${"$/sqft".padStart(10)}${C.reset}`
    );

    for (const c of comps) {
      console.log(
        `  ${c.address.padEnd(30)} ${fmt(c.salePrice).padStart(12)} ${c.saleDate.padStart(12)} ${fmtDec(c.pricePerSqft).padStart(10)}`
      );
    }

    const tag =
      valueDiffPct < -2
        ? `${C.green}▼ UNDERVALUED by ${pct(Math.abs(valueDiffPct))}${C.reset}`
        : valueDiffPct > 2
          ? `${C.red}▲ OVERVALUED by ${pct(valueDiffPct)}${C.reset}`
          : `${C.yellow}≈ FAIR VALUE${C.reset}`;

    console.log(
      `  ${C.bold}Estimated Market Value: ${C.cyan}${fmt(estimatedValue)}${C.reset}  │  Listed: ${fmt(p.price)}  │  ${tag}`
    );
    console.log();
  }

  return results;
}

// ── Agent 3: Rental Agent ────────────────────────────────────────────

async function rentalAgent(): Promise<RentalResult[]> {
  agentHeader("RENTAL AGENT", "🔑", "Rental Income Estimation");

  const results: RentalResult[] = [];

  const vacancyRates: Record<string, number> = {
    "Oak Park": 6.8,
    Downtown: 11.2,
    Riverside: 3.2,
    Westside: 7.5,
    Lakewood: 4.1,
  };

  for (const p of PROPERTIES) {
    await sleep(60);
    const comps = RENTAL_COMPS[p.id];
    const avgRentPerSqft =
      comps.reduce((s, c) => s + c.rentPerSqft, 0) / comps.length;
    const estimatedRent = Math.round(avgRentPerSqft * p.sqft);
    const annualRent = estimatedRent * 12;
    const grm = p.price / annualRent;
    const vacancy = vacancyRates[p.neighborhood];

    results.push({
      property: p,
      rentalComps: comps,
      estimatedRent,
      grossRentMultiplier: grm,
      vacancyRate: vacancy,
    });

    console.log(
      `  ${C.bold}${C.cyan}Property #${p.id}${C.reset} — ${p.neighborhood}`
    );
    console.log(`  ${C.dim}${"─".repeat(58)}${C.reset}`);
    console.log(
      `  ${C.dim}${"Rental Comp".padEnd(32)} ${"Rent".padStart(8)} ${"Sqft".padStart(8)} ${"$/sqft".padStart(8)}${C.reset}`
    );

    for (const c of comps) {
      console.log(
        `  ${c.address.padEnd(32)} ${fmtDec(c.rent, 0).padStart(8)} ${c.sqft.toString().padStart(8)} ${fmtDec(c.rentPerSqft).padStart(8)}`
      );
    }

    const grmColor = grm < 15 ? C.green : grm < 20 ? C.yellow : C.red;
    console.log(
      `  ${C.bold}Est. Monthly Rent: ${C.green}${fmtDec(estimatedRent, 0)}${C.reset}  │  ` +
        `Annual: ${fmt(annualRent)}  │  ` +
        `GRM: ${grmColor}${grm.toFixed(1)}${C.reset}  │  ` +
        `Vacancy: ${pct(vacancy)}`
    );
    console.log();
  }

  return results;
}

// ── Agent 4: Financial Agent ─────────────────────────────────────────

function calcMortgage(principal: number, annualRate: number, months: number): number {
  const r = annualRate / 12;
  const n = months;
  if (r === 0) return principal / n;
  return (principal * (r * Math.pow(1 + r, n))) / (Math.pow(1 + r, n) - 1);
}

function calcNPV(
  annualCashFlow: number,
  discountRate: number,
  years: number,
  initialInvestment: number
): number {
  let npv = -initialInvestment;
  for (let t = 1; t <= years; t++) {
    npv += annualCashFlow / Math.pow(1 + discountRate, t);
  }
  return npv;
}

async function financialAgent(
  rentalResults: RentalResult[]
): Promise<FinancialResult[]> {
  agentHeader("FINANCIAL AGENT", "💰", "Investment Modeling & NPV Analysis");

  const RATES = [0.065, 0.07, 0.075];
  const DOWN_PCT = 0.25;
  const CLOSING_PCT = 0.03;
  const INSURANCE_RATE = 0.004; // annual, % of price
  const MAINTENANCE_RATE = 0.01; // annual, % of price

  const results: FinancialResult[] = [];

  for (let idx = 0; idx < PROPERTIES.length; idx++) {
    const p = PROPERTIES[idx];
    const rental = rentalResults[idx];
    await sleep(80);

    const downPayment = p.price * DOWN_PCT;
    const closingCosts = p.price * CLOSING_PCT;
    const totalCashInvested = downPayment + closingCosts;
    const principal = p.price - downPayment;
    const annualInsurance = p.price * INSURANCE_RATE;
    const annualMaintenance = p.price * MAINTENANCE_RATE;
    const annualHOA = p.hoaMonthly * 12;
    const monthlyRent = rental.estimatedRent;
    const annualRent = monthlyRent * 12;
    const vacancyLoss = annualRent * (rental.vacancyRate / 100);

    // NOI
    const noi =
      annualRent -
      vacancyLoss -
      p.annualTaxes -
      annualInsurance -
      annualMaintenance -
      annualHOA;
    const capRate = (noi / p.price) * 100;

    // Mortgages at 3 rates
    const mortgages: MortgageCalc[] = RATES.map((rate) => {
      const mp = calcMortgage(principal, rate, 360);
      return {
        rate: rate * 100,
        monthlyPayment: mp,
        totalInterest: mp * 360 - principal,
      };
    });

    // Cash flow at middle rate (7.0%)
    const primaryMortgage = mortgages[1].monthlyPayment;
    const monthlyCashFlow =
      monthlyRent -
      primaryMortgage -
      p.annualTaxes / 12 -
      annualInsurance / 12 -
      p.hoaMonthly -
      annualMaintenance / 12;
    const annualCashFlow = monthlyCashFlow * 12;
    const cashOnCash = (annualCashFlow / totalCashInvested) * 100;

    // NPV at 3 discount rates
    const npv6 = calcNPV(annualCashFlow, 0.06, 30, totalCashInvested);
    const npv8 = calcNPV(annualCashFlow, 0.08, 30, totalCashInvested);
    const npv10 = calcNPV(annualCashFlow, 0.10, 30, totalCashInvested);

    results.push({
      property: p,
      downPayment,
      closingCosts,
      totalCashInvested,
      mortgages,
      annualRent,
      noi,
      capRate,
      monthlyCashFlow,
      annualCashFlow,
      cashOnCash,
      npv6,
      npv8,
      npv10,
    });

    // Show detailed math for first property, summary for others
    if (idx === 0) {
      console.log(
        `  ${C.bold}${C.yellow}Detailed Calculation — Property #${p.id}: ${p.address}${C.reset}`
      );
      console.log(`  ${C.dim}${"═".repeat(64)}${C.reset}`);
      console.log();

      // Mortgage math
      console.log(`  ${C.bold}${C.underline}Mortgage Calculation${C.reset}`);
      console.log(
        `  ${C.dim}Formula: M = P × [r(1+r)^n] / [(1+r)^n − 1]${C.reset}`
      );
      console.log(`  Purchase Price:     ${fmt(p.price)}`);
      console.log(
        `  Down Payment (25%): ${fmt(downPayment)}`
      );
      console.log(`  Loan Principal (P): ${fmt(principal)}`);
      console.log(`  Term (n):           360 months`);
      console.log();

      for (const m of mortgages) {
        const r = m.rate / 100 / 12;
        const factor = (r * Math.pow(1 + r, 360)) / (Math.pow(1 + r, 360) - 1);
        console.log(
          `  ${C.cyan}Rate ${pct(m.rate)}:${C.reset} r = ${(m.rate / 100).toFixed(4)}/12 = ${r.toFixed(6)}`
        );
        console.log(
          `    (1+r)^360 = ${Math.pow(1 + r, 360).toFixed(4)}`
        );
        console.log(
          `    Factor    = ${factor.toFixed(6)}`
        );
        console.log(
          `    ${C.bold}M = ${fmt(principal)} × ${factor.toFixed(6)} = ${C.green}${fmtDec(m.monthlyPayment)}/mo${C.reset}`
        );
        console.log(
          `    Total interest over 30 years: ${C.red}${fmt(Math.round(m.totalInterest))}${C.reset}`
        );
        console.log();
      }

      // NOI & Cap Rate
      console.log(`  ${C.bold}${C.underline}Net Operating Income & Cap Rate${C.reset}`);
      console.log(
        `  ${C.dim}Cap Rate = (NOI / Purchase Price) × 100${C.reset}`
      );
      console.log(`  Annual Rent:         ${fmt(annualRent)}`);
      console.log(`  − Vacancy (${pct(rental.vacancyRate)}):   (${fmt(Math.round(vacancyLoss))})`);
      console.log(`  − Taxes:             (${fmt(p.annualTaxes)})`);
      console.log(`  − Insurance:         (${fmt(Math.round(annualInsurance))})`);
      console.log(`  − Maintenance:       (${fmt(Math.round(annualMaintenance))})`);
      console.log(`  − HOA:               (${fmt(annualHOA)})`);
      console.log(`  ${C.dim}${"─".repeat(38)}${C.reset}`);
      console.log(`  ${C.bold}NOI:                   ${C.green}${fmt(Math.round(noi))}${C.reset}`);
      console.log(
        `  ${C.bold}Cap Rate:              ${capRate >= 5 ? C.green : capRate >= 3 ? C.yellow : C.red}${pct(capRate)}${C.reset}`
      );
      console.log();

      // Cash-on-Cash
      console.log(`  ${C.bold}${C.underline}Cash-on-Cash Return${C.reset}`);
      console.log(
        `  ${C.dim}CoC = (Annual Cash Flow / Cash Invested) × 100${C.reset}`
      );
      console.log(`  Monthly Rent:             ${fmtDec(monthlyRent, 0)}`);
      console.log(`  − Mortgage (7.0%):        (${fmtDec(primaryMortgage)})`);
      console.log(`  − Taxes/12:               (${fmtDec(p.annualTaxes / 12)})`);
      console.log(`  − Insurance/12:           (${fmtDec(annualInsurance / 12)})`);
      console.log(`  − HOA:                    (${fmtDec(p.hoaMonthly)})`);
      console.log(`  − Maintenance/12:         (${fmtDec(annualMaintenance / 12)})`);
      console.log(`  ${C.dim}${"─".repeat(42)}${C.reset}`);
      console.log(
        `  ${C.bold}Monthly Cash Flow:          ${monthlyCashFlow >= 0 ? C.green : C.red}${fmtDec(monthlyCashFlow)}${C.reset}`
      );
      console.log(`  Annual Cash Flow:         ${fmtDec(annualCashFlow)}`);
      console.log(`  Down Payment:             ${fmt(downPayment)}`);
      console.log(`  + Closing Costs (3%):     ${fmt(closingCosts)}`);
      console.log(`  ${C.bold}Total Cash Invested:        ${fmt(totalCashInvested)}${C.reset}`);
      console.log(
        `  ${C.bold}Cash-on-Cash Return:        ${cashOnCash >= 8 ? C.green : cashOnCash >= 4 ? C.yellow : C.red}${pct(cashOnCash)}${C.reset}`
      );
      console.log();

      // NPV
      console.log(`  ${C.bold}${C.underline}30-Year Net Present Value${C.reset}`);
      console.log(
        `  ${C.dim}NPV = Σ(t=1→30) [CF_t / (1+d)^t] − Investment${C.reset}`
      );
      console.log(
        `  Annual CF: ${fmtDec(annualCashFlow)}  │  Investment: ${fmt(totalCashInvested)}`
      );
      console.log(
        `    @ 6%:  ${C.bold}${npv6 >= 0 ? C.green : C.red}${fmt(Math.round(npv6))}${C.reset}`
      );
      console.log(
        `    @ 8%:  ${C.bold}${npv8 >= 0 ? C.green : C.red}${fmt(Math.round(npv8))}${C.reset}`
      );
      console.log(
        `    @ 10%: ${C.bold}${npv10 >= 0 ? C.green : C.red}${fmt(Math.round(npv10))}${C.reset}`
      );
      console.log();
    } else {
      // Summary line for remaining properties
      console.log(
        `  ${C.bold}${C.cyan}Property #${p.id}${C.reset} — ${p.address} (${p.neighborhood})`
      );
      console.log(
        `    Mortgage @7.0%: ${C.bold}${fmtDec(primaryMortgage)}${C.reset}/mo  │  ` +
          `NOI: ${fmt(Math.round(noi))}  │  ` +
          `Cap Rate: ${capRate >= 5 ? C.green : capRate >= 3 ? C.yellow : C.red}${pct(capRate)}${C.reset}`
      );
      console.log(
        `    Cash Flow: ${monthlyCashFlow >= 0 ? C.green : C.red}${fmtDec(monthlyCashFlow)}${C.reset}/mo  │  ` +
          `CoC: ${cashOnCash >= 8 ? C.green : cashOnCash >= 4 ? C.yellow : C.red}${pct(cashOnCash)}${C.reset}  │  ` +
          `NPV @8%: ${npv8 >= 0 ? C.green : C.red}${fmt(Math.round(npv8))}${C.reset}`
      );
      console.log();
    }
  }

  // Summary table
  console.log(`  ${C.bold}${C.yellow}Financial Summary — All Properties${C.reset}`);
  console.log(`  ${C.dim}${"═".repeat(64)}${C.reset}`);
  console.log(
    `  ${C.dim}${"#".padEnd(4)} ${"Neighborhood".padEnd(14)} ${"Mortgage".padStart(10)} ${"NOI".padStart(10)} ${"Cap%".padStart(7)} ${"CoC%".padStart(7)} ${"NPV@8%".padStart(12)}${C.reset}`
  );

  for (const r of results) {
    const capColor = r.capRate >= 5 ? C.green : r.capRate >= 3 ? C.yellow : C.red;
    const cocColor = r.cashOnCash >= 8 ? C.green : r.cashOnCash >= 4 ? C.yellow : C.red;
    const npvColor = r.npv8 >= 0 ? C.green : C.red;
    console.log(
      `  ${r.property.id.toString().padEnd(4)} ` +
        `${r.property.neighborhood.padEnd(14)} ` +
        `${fmtDec(r.mortgages[1].monthlyPayment).padStart(10)} ` +
        `${fmt(Math.round(r.noi)).padStart(10)} ` +
        `${capColor}${pct(r.capRate).padStart(7)}${C.reset} ` +
        `${cocColor}${pct(r.cashOnCash).padStart(7)}${C.reset} ` +
        `${npvColor}${fmt(Math.round(r.npv8)).padStart(12)}${C.reset}`
    );
  }
  console.log();

  return results;
}

// ── Agent 5: Neighborhood Agent ──────────────────────────────────────

async function neighborhoodAgent(): Promise<NeighborhoodScore[]> {
  agentHeader("NEIGHBORHOOD AGENT", "🏘️", "Area Quality & Livability Scoring");

  // Compute overall scores
  const scores = Object.values(NEIGHBORHOOD_SCORES).map((n) => {
    const overall =
      n.schools * 0.2 +
      n.transit * 0.15 +
      n.safety * 0.2 +
      (n.jobGrowth / 5) * 10 * 0.15 +
      (n.walkScore / 100) * 10 * 0.15 +
      (n.populationTrend / 4) * 10 * 0.15;
    return { ...n, overall: Math.round(overall * 10) / 10 };
  });

  // Table header
  console.log(
    `  ${C.dim}${"Neighborhood".padEnd(14)} ${"Schools".padStart(10)} ${"Transit".padStart(10)} ${"Safety".padStart(10)} ${"Jobs%".padStart(8)} ${"Walk".padStart(8)} ${"Pop%".padStart(8)} ${"Overall".padStart(10)}${C.reset}`
  );
  console.log(`  ${C.dim}${"─".repeat(80)}${C.reset}`);

  for (const s of scores) {
    await sleep(40);
    console.log(
      `  ${C.bold}${s.neighborhood.padEnd(14)}${C.reset} ` +
        `${s.schools.toString().padStart(10)} ` +
        `${s.transit.toString().padStart(10)} ` +
        `${s.safety.toString().padStart(10)} ` +
        `${pct(s.jobGrowth).padStart(8)} ` +
        `${s.walkScore.toString().padStart(8)} ` +
        `${pct(s.populationTrend).padStart(8)} ` +
        `${C.bold}${s.overall >= 7 ? C.green : s.overall >= 5 ? C.yellow : C.red}${s.overall.toFixed(1).padStart(10)}${C.reset}`
    );
  }

  console.log();
  console.log(`  ${C.bold}Visual Comparison${C.reset}`);
  console.log(`  ${C.dim}${"─".repeat(50)}${C.reset}`);

  const dims: { key: keyof NeighborhoodScore; label: string }[] = [
    { key: "schools", label: "Schools" },
    { key: "transit", label: "Transit" },
    { key: "safety", label: "Safety" },
  ];

  for (const dim of dims) {
    console.log(`  ${C.bold}${dim.label}:${C.reset}`);
    for (const s of scores) {
      const val = s[dim.key] as number;
      const color = val >= 8 ? C.green : val >= 5 ? C.yellow : C.red;
      console.log(
        `    ${s.neighborhood.padEnd(12)} ${color}${bar(val)} ${val}/10${C.reset}`
      );
    }
    console.log();
  }

  return scores;
}

// ── Agent 6: Risk Agent ──────────────────────────────────────────────

async function riskAgent(): Promise<RiskResult[]> {
  agentHeader("RISK AGENT", "⚠️", "Risk Assessment & Due Diligence");

  const results: RiskResult[] = [];

  for (const p of PROPERTIES) {
    await sleep(60);
    const factors = RISK_DATA[p.id];
    const highCount = factors.filter((f) => f.level === "HIGH").length;
    const medCount = factors.filter((f) => f.level === "MEDIUM").length;
    const overallRisk: RiskLevel =
      highCount >= 2 ? "HIGH" : highCount >= 1 || medCount >= 3 ? "MEDIUM" : "LOW";

    results.push({ property: p, factors, overallRisk });

    const riskColor =
      overallRisk === "LOW"
        ? C.green
        : overallRisk === "MEDIUM"
          ? C.yellow
          : C.red;
    const riskBg =
      overallRisk === "LOW"
        ? C.bgGreen
        : overallRisk === "MEDIUM"
          ? C.bgYellow
          : C.bgRed;

    console.log(
      `  ${C.bold}${C.cyan}Property #${p.id}${C.reset} — ${p.address} (${p.neighborhood})  ` +
        `${riskBg}${C.bold} ${overallRisk} RISK ${C.reset}`
    );
    console.log(`  ${C.dim}${"─".repeat(64)}${C.reset}`);

    for (const f of factors) {
      const fc =
        f.level === "LOW"
          ? C.green
          : f.level === "MEDIUM"
            ? C.yellow
            : C.red;
      const icon =
        f.level === "LOW" ? "●" : f.level === "MEDIUM" ? "◐" : "○";
      console.log(
        `    ${fc}${icon} ${f.level.padEnd(7)}${C.reset} ${C.bold}${f.name.padEnd(22)}${C.reset} ${C.dim}${f.detail}${C.reset}`
      );
    }
    console.log();
  }

  return results;
}

// ── Final Ranking ────────────────────────────────────────────────────

interface FinalScore {
  property: Property;
  capRate: number;
  cashOnCash: number;
  npv8: number;
  monthlyCashFlow: number;
  neighborhoodScore: number;
  riskLevel: RiskLevel;
  investmentScore: number;
}

function computeFinalRanking(
  financials: FinancialResult[],
  neighborhoods: NeighborhoodScore[],
  risks: RiskResult[]
): FinalScore[] {
  const scores: FinalScore[] = [];

  for (let i = 0; i < PROPERTIES.length; i++) {
    const fin = financials[i];
    const nbh = neighborhoods.find(
      (n) => n.neighborhood === PROPERTIES[i].neighborhood
    )!;
    const risk = risks[i];

    // Weighted investment score (0-100)
    const capScore = Math.min(fin.capRate / 10, 1) * 25; // 25 pts max
    const cocScore = Math.min(Math.max(fin.cashOnCash, 0) / 15, 1) * 25; // 25 pts max
    const nbhScore = (nbh.overall / 10) * 20; // 20 pts max
    const riskScore =
      risk.overallRisk === "LOW"
        ? 20
        : risk.overallRisk === "MEDIUM"
          ? 10
          : 0; // 20 pts max
    const cashFlowScore =
      Math.min(Math.max(fin.monthlyCashFlow, 0) / 500, 1) * 10; // 10 pts max

    const investmentScore = Math.round(
      (capScore + cocScore + nbhScore + riskScore + cashFlowScore) * 10
    ) / 10;

    scores.push({
      property: PROPERTIES[i],
      capRate: fin.capRate,
      cashOnCash: fin.cashOnCash,
      npv8: fin.npv8,
      monthlyCashFlow: fin.monthlyCashFlow,
      neighborhoodScore: nbh.overall,
      riskLevel: risk.overallRisk,
      investmentScore,
    });
  }

  return scores.sort((a, b) => b.investmentScore - a.investmentScore);
}

// ── Main ─────────────────────────────────────────────────────────────

async function main() {
  console.log();
  console.log(
    `${C.bold}${C.bgBlue}${C.white}                                                                        ${C.reset}`
  );
  console.log(
    `${C.bold}${C.bgBlue}${C.white}   🏠  REAL ESTATE INVESTMENT ANALYZER                                  ${C.reset}`
  );
  console.log(
    `${C.bold}${C.bgBlue}${C.white}   Multi-Agent Rental Property Evaluation — 6 Agents, 5 Properties     ${C.reset}`
  );
  console.log(
    `${C.bold}${C.bgBlue}${C.white}                                                                        ${C.reset}`
  );
  console.log();

  // Agent 1: Data
  await dataAgent();

  // Agent 2: Comps
  const compResults = await compAgent();

  // Agent 3: Rental
  const rentalResults = await rentalAgent();

  // Agent 4: Financial
  const financialResults = await financialAgent(rentalResults);

  // Agent 5: Neighborhood
  const neighborhoodResults = await neighborhoodAgent();

  // Agent 6: Risk
  const riskResults = await riskAgent();

  // Final Ranking
  console.log();
  console.log(`${C.bold}${C.cyan}${"═".repeat(72)}${C.reset}`);
  console.log(
    `${C.bold}${C.cyan}  🏆  FINAL INVESTMENT RANKING${C.reset}`
  );
  console.log(`${C.bold}${C.cyan}${"═".repeat(72)}${C.reset}`);
  console.log();

  const ranked = computeFinalRanking(
    financialResults,
    neighborhoodResults,
    riskResults
  );

  // Header
  console.log(
    `  ${C.dim}${"Rank".padEnd(6)} ` +
      `${"Property".padEnd(22)} ` +
      `${"Cap%".padStart(7)} ` +
      `${"CoC%".padStart(7)} ` +
      `${"CF/mo".padStart(10)} ` +
      `${"NPV@8%".padStart(12)} ` +
      `${"Area".padStart(6)} ` +
      `${"Risk".padStart(8)} ` +
      `${"Score".padStart(8)}${C.reset}`
  );
  console.log(`  ${C.dim}${"─".repeat(68 + 22)}${C.reset}`);

  for (let i = 0; i < ranked.length; i++) {
    const s = ranked[i];
    await sleep(120);

    const rankLabel = i === 0 ? `${C.bold}${C.green}  #1 🏆` : `  #${i + 1}   `;
    const capColor = s.capRate >= 5 ? C.green : s.capRate >= 3 ? C.yellow : C.red;
    const cocColor = s.cashOnCash >= 8 ? C.green : s.cashOnCash >= 4 ? C.yellow : C.red;
    const cfColor = s.monthlyCashFlow >= 0 ? C.green : C.red;
    const npvColor = s.npv8 >= 0 ? C.green : C.red;
    const riskColor =
      s.riskLevel === "LOW"
        ? C.green
        : s.riskLevel === "MEDIUM"
          ? C.yellow
          : C.red;
    const scoreColor = i === 0 ? C.green : i < 3 ? C.yellow : C.red;

    const name = `${s.property.neighborhood} #${s.property.id}`;
    console.log(
      `${rankLabel}${C.reset} ` +
        `${(i === 0 ? C.bold : "") + name.padEnd(22)}${C.reset} ` +
        `${capColor}${pct(s.capRate).padStart(7)}${C.reset} ` +
        `${cocColor}${pct(s.cashOnCash).padStart(7)}${C.reset} ` +
        `${cfColor}${fmtDec(s.monthlyCashFlow).padStart(10)}${C.reset} ` +
        `${npvColor}${fmt(Math.round(s.npv8)).padStart(12)}${C.reset} ` +
        `${s.neighborhoodScore.toFixed(1).padStart(6)} ` +
        `${riskColor}${s.riskLevel.padStart(8)}${C.reset} ` +
        `${scoreColor}${C.bold}${s.investmentScore.toFixed(1).padStart(8)}${C.reset}`
    );
  }

  console.log();

  // Winner highlight
  const winner = ranked[0];
  console.log(
    `${C.bold}${C.bgGreen}${C.white}                                                                        ${C.reset}`
  );
  console.log(
    `${C.bold}${C.bgGreen}${C.white}   🏆 BEST INVESTMENT: Property #${winner.property.id} — ${winner.property.address.padEnd(34)}${C.reset}`
  );
  console.log(
    `${C.bold}${C.bgGreen}${C.white}   ${winner.property.neighborhood} │ ${fmt(winner.property.price)} │ Cap ${pct(winner.capRate)} │ CoC ${pct(winner.cashOnCash)} │ Score: ${winner.investmentScore.toFixed(1)}       ${C.reset}`
  );
  console.log(
    `${C.bold}${C.bgGreen}${C.white}                                                                        ${C.reset}`
  );
  console.log();

  // Runner-up
  if (ranked.length > 1) {
    const ru = ranked[1];
    console.log(
      `  ${C.dim}Runner-up: Property #${ru.property.id} — ${ru.property.address} ` +
        `(${ru.property.neighborhood}) — Score: ${ru.investmentScore.toFixed(1)}${C.reset}`
    );
  }

  console.log();
  console.log(`${C.dim}  Analysis complete. 6 agents evaluated 5 properties across 30+ metrics.${C.reset}`);
  console.log();
}

main().catch(console.error);
