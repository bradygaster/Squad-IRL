// ─────────────────────────────────────────────────────────
// Contract Reviewer — Squad Multi-Agent Demo
// Five agents collaborate to review a 15-clause SaaS contract
// ─────────────────────────────────────────────────────────

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

// ── ANSI helpers ──────────────────────────────────────────
const c = {
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

function riskColor(score: number): string {
  if (score <= 3) return c.green;
  if (score <= 6) return c.yellow;
  return c.red;
}

function trafficLight(score: number): string {
  if (score <= 3) return "🟢";
  if (score <= 6) return "🟡";
  return "🔴";
}

function bar(score: number, width = 20): string {
  const filled = Math.round((score / 10) * width);
  const empty = width - filled;
  const color = riskColor(score);
  return `${color}${"█".repeat(filled)}${c.dim}${"░".repeat(empty)}${c.reset}`;
}

function box(lines: string[], width = 72, borderColor = c.cyan): string {
  const top = `${borderColor}╔${"═".repeat(width)}╗${c.reset}`;
  const bot = `${borderColor}╚${"═".repeat(width)}╝${c.reset}`;
  const body = lines.map((l) => {
    const stripped = l.replace(/\x1b\[[0-9;]*m/g, "");
    const pad = width - stripped.length;
    return `${borderColor}║${c.reset} ${l}${" ".repeat(Math.max(0, pad - 1))}${borderColor}║${c.reset}`;
  });
  return [top, ...body, bot].join("\n");
}

function sectionHeader(emoji: string, title: string, sub: string): string {
  const w = 74;
  const line = "═".repeat(w);
  return [
    "",
    `${c.bold}${c.cyan}╔${line}╗${c.reset}`,
    `${c.bold}${c.cyan}║${c.reset}  ${emoji}  ${c.bold}${c.white}${title}${c.reset}`,
    `${c.bold}${c.cyan}║${c.reset}  ${c.dim}${sub}${c.reset}`,
    `${c.bold}${c.cyan}╚${line}╝${c.reset}`,
    "",
  ].join("\n");
}

function padRight(s: string, n: number): string {
  const stripped = s.replace(/\x1b\[[0-9;]*m/g, "");
  return s + " ".repeat(Math.max(0, n - stripped.length));
}

// ── Types ─────────────────────────────────────────────────
type ClauseType = "Payment" | "Termination" | "Liability" | "SLA" | "Data" | "IP" | "Legal";
type Party = "Customer" | "Vendor" | "Mutual";
type Priority = "Must Change" | "Should Change" | "Nice to Have";

interface Clause {
  id: number;
  title: string;
  text: string;
  type: ClauseType;
}

interface ParsedClause extends Clause {
  keyTerms: string[];
  obligatedParty: Party;
}

interface RiskResult {
  clause: ParsedClause;
  score: number;
  reasons: string[];
}

interface BenchmarkResult {
  clause: ParsedClause;
  thisContract: string;
  industryStandard: string;
  deviationPct: number;
  flagged: boolean;
}

interface NegotiationAdvice {
  clause: ParsedClause;
  riskScore: number;
  priority: Priority;
  riskExplanation: string;
  suggestedLanguage: string;
}

// ── Contract Data ─────────────────────────────────────────
const CONTRACT: Clause[] = [
  { id: 1, title: "Payment Terms", type: "Payment",
    text: "Customer shall remit payment within sixty (60) days of invoice date. Invoices shall be issued on a quarterly basis. Late payments accrue interest at 1.5% per month." },
  { id: 2, title: "Auto-Renewal", type: "Termination",
    text: "This Agreement shall automatically renew for successive two (2) year terms unless either party provides written notice of non-renewal at least ninety (90) days prior to the end of the then-current term." },
  { id: 3, title: "Termination for Convenience", type: "Termination",
    text: "Vendor may terminate this Agreement for convenience upon thirty (30) days' written notice. Customer may terminate for convenience upon one hundred eighty (180) days' written notice and payment of early termination fee equal to remaining contract value." },
  { id: 4, title: "Liability Cap", type: "Liability",
    text: "In no event shall Vendor's aggregate liability exceed the total fees paid by Customer during the six (6) month period immediately preceding the claim. This limitation applies to all causes of action in the aggregate." },
  { id: 5, title: "SLA Uptime Guarantee", type: "SLA",
    text: "Vendor guarantees 99.5% monthly uptime for the Service. For each 0.1% below the guaranteed level, Customer shall receive a service credit equal to 2% of monthly fees, up to a maximum credit of 10% of monthly fees." },
  { id: 6, title: "Data Handling & Analytics", type: "Data",
    text: "Vendor retains the right to collect, aggregate, and use anonymized and de-identified Customer data for product improvement, benchmarking, and analytics purposes. Such data may be shared with Vendor's affiliates and partners." },
  { id: 7, title: "IP Ownership of Customizations", type: "IP",
    text: "All customizations, configurations, integrations, and derivative works created during the term of this Agreement shall become the exclusive intellectual property of Vendor upon expiration or termination." },
  { id: 8, title: "Indemnification", type: "Liability",
    text: "Customer shall defend, indemnify, and hold harmless Vendor and its officers, directors, and employees against any and all third-party claims, losses, damages, and expenses arising from Customer's use of the Service." },
  { id: 9, title: "Price Escalation", type: "Payment",
    text: "Vendor reserves the right to increase subscription fees by up to twelve percent (12%) annually, effective upon renewal. Vendor shall provide at least thirty (30) days' notice of any price increase." },
  { id: 10, title: "Audit Rights", type: "Legal",
    text: "Vendor may audit Customer's use of the Service upon forty-eight (48) hours' written notice. Customer shall provide reasonable access to systems and records. Audit costs borne by Customer if overuse is found." },
  { id: 11, title: "Data Portability", type: "Data",
    text: "Upon termination, Customer may request export of its data in CSV format only. Vendor shall make data available for download within sixty (60) days post-termination. After such period, Vendor may delete all Customer data." },
  { id: 12, title: "Force Majeure", type: "Legal",
    text: "Neither party shall be liable for delays caused by force majeure events, including but not limited to natural disasters, war, pandemic, government action, labor disputes, supply chain disruption, or adverse market conditions." },
  { id: 13, title: "Governing Law", type: "Legal",
    text: "This Agreement shall be governed by and construed in accordance with the laws of the Cayman Islands, without regard to its conflict of law provisions." },
  { id: 14, title: "Non-Solicitation", type: "Legal",
    text: "During the term and for two (2) years thereafter, Customer shall not directly or indirectly solicit, recruit, or hire any employee or contractor of Vendor who was involved in providing the Service." },
  { id: 15, title: "Dispute Resolution", type: "Legal",
    text: "All disputes arising under this Agreement shall be resolved through binding arbitration administered in Vendor's principal place of business. The arbitrator shall be selected by Vendor from a panel of qualified arbitrators." },
];

// ── Benchmarks ────────────────────────────────────────────
const BENCHMARKS: Record<number, { standard: string; value: number; actual: number; unit: string; lowerIsBetter: boolean }> = {
  1:  { standard: "Net 30 days",              value: 30,   actual: 60,   unit: "days",    lowerIsBetter: true },
  2:  { standard: "1-year auto-renewal",      value: 1,    actual: 2,    unit: "years",   lowerIsBetter: true },
  3:  { standard: "Symmetric 60-day notice",  value: 60,   actual: 180,  unit: "days",    lowerIsBetter: true },
  4:  { standard: "12-month liability cap",   value: 12,   actual: 6,    unit: "months",  lowerIsBetter: false },
  5:  { standard: "99.9% uptime SLA",         value: 99.9, actual: 99.5, unit: "%",       lowerIsBetter: false },
  6:  { standard: "No data sharing",          value: 0,    actual: 1,    unit: "sharing",  lowerIsBetter: true },
  7:  { standard: "Customer retains IP",      value: 0,    actual: 1,    unit: "vendor-owns", lowerIsBetter: true },
  8:  { standard: "Mutual indemnification",   value: 0,    actual: 1,    unit: "one-sided", lowerIsBetter: true },
  9:  { standard: "Max 5% annual increase",   value: 5,    actual: 12,   unit: "%",       lowerIsBetter: true },
  10: { standard: "30-day audit notice",      value: 30,   actual: 2,    unit: "days",    lowerIsBetter: false },
  11: { standard: "Multiple formats, 90 days", value: 90,  actual: 60,   unit: "days",    lowerIsBetter: false },
  12: { standard: "Narrow force majeure",     value: 0,    actual: 1,    unit: "broad",   lowerIsBetter: true },
  13: { standard: "Customer's jurisdiction",  value: 0,    actual: 1,    unit: "offshore", lowerIsBetter: true },
  14: { standard: "1-year non-solicitation",  value: 1,    actual: 2,    unit: "years",   lowerIsBetter: true },
  15: { standard: "Neutral arbitration",      value: 0,    actual: 1,    unit: "biased",  lowerIsBetter: true },
};

// ── Importance weights for final score ────────────────────
const IMPORTANCE: Record<ClauseType, number> = {
  Payment: 1.0,
  Termination: 1.3,
  Liability: 1.5,
  SLA: 1.1,
  Data: 1.4,
  IP: 1.4,
  Legal: 1.2,
};

// ══════════════════════════════════════════════════════════
// AGENT 1 — PARSER
// ══════════════════════════════════════════════════════════
function parseClause(clause: Clause): ParsedClause {
  const termPatterns: Record<string, RegExp> = {
    days:       /(\w+)\s*\((\d+)\)\s*days/gi,
    years:      /(\w+)\s*\((\d+)\)\s*year/gi,
    months:     /(\w+)\s*\((\d+)\)\s*month/gi,
    percent:    /(\d+(?:\.\d+)?)\s*%/g,
    pctWord:    /(\w+)\s*percent\s*\((\d+(?:\.\d+)?)%?\)/gi,
  };

  const keyTerms: string[] = [];
  let m: RegExpExecArray | null;
  for (const [label, rx] of Object.entries(termPatterns)) {
    rx.lastIndex = 0;
    while ((m = rx.exec(clause.text)) !== null) {
      if (label === "percent") {
        keyTerms.push(`${m[1]}%`);
      } else if (label === "pctWord") {
        keyTerms.push(`${m[2]}%`);
      } else {
        keyTerms.push(`${m[2]} ${label}`);
      }
    }
  }

  // Deduplicate
  const unique = [...new Set(keyTerms)];

  // Determine obligated party
  const txt = clause.text.toLowerCase();
  const custMentions = (txt.match(/customer/g) || []).length;
  const venMentions = (txt.match(/vendor/g) || []).length;
  let obligatedParty: Party = "Mutual";
  if (custMentions > venMentions + 1) obligatedParty = "Customer";
  else if (venMentions > custMentions + 1) obligatedParty = "Vendor";

  // Manual overrides for accuracy
  const overrides: Record<number, Party> = {
    1: "Customer", 3: "Customer", 4: "Vendor", 5: "Vendor",
    6: "Vendor", 7: "Vendor", 8: "Customer", 9: "Vendor",
    10: "Vendor", 11: "Vendor", 13: "Mutual", 15: "Vendor",
  };
  if (overrides[clause.id]) obligatedParty = overrides[clause.id];

  return { ...clause, keyTerms: unique, obligatedParty };
}

// ══════════════════════════════════════════════════════════
// AGENT 2 — RISK ANALYZER
// ══════════════════════════════════════════════════════════
function analyzeRisk(parsed: ParsedClause): RiskResult {
  let score = 2; // baseline
  const reasons: string[] = [];

  switch (parsed.id) {
    case 1: // Payment Net 60
      score = 5;
      reasons.push("Net 60 exceeds 45-day policy threshold (+2 risk)");
      reasons.push("Quarterly invoicing delays cash-flow visibility");
      reasons.push("1.5% monthly late interest is aggressive");
      break;
    case 2: // Auto-Renewal 2yr
      score = 8;
      reasons.push("2-year auto-renewal far exceeds 1-year maximum (+4 risk)");
      reasons.push("90-day cancellation window is narrow for 2-year term");
      reasons.push("Lock-in risk: stuck if service quality degrades");
      break;
    case 3: // Termination asymmetry
      score = 9;
      reasons.push("Severe asymmetry: Vendor 30 days vs Customer 180 days (+5 risk)");
      reasons.push("Early termination fee = remaining contract value is punitive");
      reasons.push("Customer has virtually no practical exit path");
      break;
    case 4: // Liability cap 6 months
      score = 8;
      reasons.push("6-month cap is half the 12-month industry standard (+4 risk)");
      reasons.push("Applies to ALL causes of action — no carve-outs");
      reasons.push("Inadequate for enterprise-scale data breach scenarios");
      break;
    case 5: // SLA 99.5%
      score = 5;
      reasons.push("99.5% uptime allows ~3.6 hours downtime/month");
      reasons.push("Below 99.9% industry standard for enterprise SaaS");
      reasons.push("Credit cap of 10% provides minimal compensation");
      break;
    case 6: // Data handling
      score = 7;
      reasons.push("Anonymized data sharing with affiliates raises privacy concerns");
      reasons.push("No opt-out mechanism for data analytics usage");
      reasons.push("Potential regulatory exposure under GDPR/CCPA");
      break;
    case 7: // IP ownership
      score = 9;
      reasons.push("Customer loses ALL customization IP upon termination (+5 risk)");
      reasons.push("Includes integrations — could affect adjacent systems");
      reasons.push("No license-back provision for customer's own work");
      break;
    case 8: // Indemnification
      score = 8;
      reasons.push("One-sided: Customer indemnifies Vendor only (+4 risk)");
      reasons.push("Covers 'any and all' claims — unlimited scope");
      reasons.push("No reciprocal obligation from Vendor");
      break;
    case 9: // Price escalation
      score = 8;
      reasons.push("12% annual increase is 2.4x the 5% benchmark (+4 risk)");
      reasons.push("'At Vendor's discretion' — no cost justification required");
      reasons.push("Compounded: 12% annual = 40%+ over 3-year term");
      break;
    case 10: // Audit rights
      score = 6;
      reasons.push("48-hour notice is very short (standard is 30 days)");
      reasons.push("Customer bears audit costs if overuse found");
      reasons.push("Broad access to 'systems and records' is vague");
      break;
    case 11: // Data portability
      score = 7;
      reasons.push("CSV-only export is limiting for complex data structures");
      reasons.push("60-day window is tight; standard is 90 days");
      reasons.push("Vendor may DELETE data after window — no recovery");
      break;
    case 12: // Force majeure
      score = 7;
      reasons.push("'Market conditions' is an abnormally broad carve-out");
      reasons.push("Could excuse non-performance for economic reasons");
      reasons.push("No obligation to resume service within defined period");
      break;
    case 13: // Governing law
      score = 8;
      reasons.push("Cayman Islands law limits regulatory protections (+4 risk)");
      reasons.push("Enforcement of judgments is complex and expensive");
      reasons.push("Likely chosen to avoid consumer-protection statutes");
      break;
    case 14: // Non-solicitation
      score = 5;
      reasons.push("2-year period exceeds 1-year industry standard");
      reasons.push("Includes contractors, not just employees");
      reasons.push("Could limit hiring in specialized talent markets");
      break;
    case 15: // Dispute resolution
      score = 9;
      reasons.push("Vendor selects arbitrator — eliminates neutrality (+5 risk)");
      reasons.push("Binding arbitration in vendor's jurisdiction");
      reasons.push("No appeal mechanism; no neutral panel option");
      break;
  }

  return { clause: parsed, score, reasons };
}

// ══════════════════════════════════════════════════════════
// AGENT 3 — COMPARATOR
// ══════════════════════════════════════════════════════════
function compareToBenchmark(parsed: ParsedClause): BenchmarkResult {
  const bm = BENCHMARKS[parsed.id];
  let deviationPct: number;

  if (bm.unit === "sharing" || bm.unit === "vendor-owns" || bm.unit === "one-sided" ||
      bm.unit === "broad" || bm.unit === "offshore" || bm.unit === "biased") {
    deviationPct = bm.actual === 0 ? 0 : 100;
  } else if (bm.lowerIsBetter) {
    deviationPct = bm.value === 0 ? (bm.actual > 0 ? 100 : 0) : ((bm.actual - bm.value) / bm.value) * 100;
  } else {
    deviationPct = bm.value === 0 ? 0 : ((bm.value - bm.actual) / bm.value) * 100;
  }

  const contractDesc: Record<number, string> = {
    1:  "Net 60, quarterly invoicing",
    2:  "2-year auto-renewal, 90-day notice",
    3:  "Vendor 30d / Customer 180d + fee",
    4:  "6-month fee cap, all claims",
    5:  "99.5% uptime, max 10% credit",
    6:  "Anonymized data shared with affiliates",
    7:  "All customizations become Vendor IP",
    8:  "Customer indemnifies Vendor only",
    9:  "Up to 12% annual increase",
    10: "48-hour audit notice, customer pays",
    11: "CSV only, 60-day window",
    12: "Includes 'market conditions'",
    13: "Cayman Islands",
    14: "2-year, includes contractors",
    15: "Vendor picks arbitrator, vendor location",
  };

  return {
    clause: parsed,
    thisContract: contractDesc[parsed.id] || parsed.title,
    industryStandard: bm.standard,
    deviationPct: Math.round(deviationPct),
    flagged: deviationPct > 50,
  };
}

// ══════════════════════════════════════════════════════════
// AGENT 4 — NEGOTIATION ADVISOR
// ══════════════════════════════════════════════════════════
function adviseNegotiation(risk: RiskResult): NegotiationAdvice | null {
  if (risk.score < 7) return null;

  const advice: Record<number, { priority: Priority; explanation: string; language: string }> = {
    2: {
      priority: "Must Change",
      explanation: "A 2-year auto-renewal creates excessive lock-in. If service quality deteriorates or business needs change, you are trapped with limited recourse.",
      language: "This Agreement shall renew for successive one (1) year terms unless either party provides sixty (60) days' written notice of non-renewal.",
    },
    3: {
      priority: "Must Change",
      explanation: "The 6:1 asymmetry in termination notice (30d vs 180d) plus a remaining-value fee makes it nearly impossible for Customer to exit. This is the most restrictive clause in the contract.",
      language: "Either party may terminate for convenience upon ninety (90) days' written notice. Early termination fees shall not exceed three (3) months of fees.",
    },
    4: {
      priority: "Must Change",
      explanation: "A 6-month liability cap leaves Customer exposed in any significant incident. Industry standard is 12 months, with uncapped carve-outs for data breaches and IP infringement.",
      language: "Vendor's aggregate liability shall not exceed fees paid in the twelve (12) months preceding the claim. This cap excludes data breach, confidentiality, and IP infringement claims.",
    },
    6: {
      priority: "Should Change",
      explanation: "Broad data sharing rights, even anonymized, create regulatory risk under GDPR/CCPA and may expose proprietary business patterns to competitors via vendor's partners.",
      language: "Vendor may use anonymized data solely for internal product improvement. No data shall be shared with third parties or affiliates without Customer's prior written consent.",
    },
    7: {
      priority: "Must Change",
      explanation: "Losing IP on customizations you paid for and designed is a significant asset risk. It also discourages investment in the platform since improvements benefit the vendor.",
      language: "Customer shall retain ownership of all customizations and configurations. Vendor receives a non-exclusive license to use such works for product improvement.",
    },
    8: {
      priority: "Must Change",
      explanation: "One-sided indemnification means Customer bears all third-party litigation risk, even if Vendor's service caused the issue. This is highly unusual and exposes Customer to unlimited liability.",
      language: "Each party shall indemnify the other against third-party claims arising from its own breach of this Agreement or negligent acts.",
    },
    9: {
      priority: "Must Change",
      explanation: "A 12% discretionary increase compounds to over 40% in three years. With no cost justification requirement, this is essentially an uncapped pricing clause.",
      language: "Annual price increases shall not exceed the greater of 3% or the Consumer Price Index (CPI) change. Any increase above CPI requires 90 days' notice and written justification.",
    },
    11: {
      priority: "Should Change",
      explanation: "CSV-only export with a 60-day window makes migration extremely difficult for complex data. This creates de facto lock-in even after termination.",
      language: "Data export shall be available in CSV, JSON, and native database formats. Vendor shall maintain data availability for ninety (90) days post-termination at no additional cost.",
    },
    12: {
      priority: "Should Change",
      explanation: "'Market conditions' as force majeure is abnormally broad and could excuse non-performance during economic downturns — exactly when you need the service most.",
      language: "Force majeure events shall be limited to natural disasters, war, pandemic, and government action. Economic conditions, market changes, and supply chain issues are expressly excluded.",
    },
    13: {
      priority: "Must Change",
      explanation: "Cayman Islands jurisdiction severely limits available legal remedies and increases enforcement costs. This choice of law is designed to disadvantage the Customer.",
      language: "This Agreement shall be governed by the laws of the State of Delaware, USA, or Customer's principal place of business, at Customer's election.",
    },
    15: {
      priority: "Must Change",
      explanation: "Vendor-selected arbitrator in vendor's jurisdiction eliminates any pretense of neutrality. This clause alone could justify walking away from the contract.",
      language: "Disputes shall be resolved through binding arbitration under AAA Commercial Rules. The arbitrator shall be mutually selected by the parties. Arbitration venue shall alternate between the parties' principal offices.",
    },
  };

  const a = advice[risk.clause.id];
  if (!a) return null;

  return {
    clause: risk.clause,
    riskScore: risk.score,
    priority: a.priority,
    riskExplanation: a.explanation,
    suggestedLanguage: a.language,
  };
}

// ══════════════════════════════════════════════════════════
// AGENT 5 — SUMMARY WRITER
// ══════════════════════════════════════════════════════════
function generateSummary(risks: RiskResult[], benchmarks: BenchmarkResult[], advices: NegotiationAdvice[]) {
  // Weighted average
  let totalWeight = 0;
  let weightedSum = 0;
  for (const r of risks) {
    const w = IMPORTANCE[r.clause.type];
    weightedSum += r.score * w;
    totalWeight += w;
  }
  const overallScore = weightedSum / totalWeight;

  // Sort by risk
  const sorted = [...risks].sort((a, b) => b.score - a.score);
  const topConcerns = sorted.slice(0, 5);

  // Recommendation
  let recommendation: string;
  let recColor: string;
  if (overallScore >= 7.5) {
    recommendation = "WALK AWAY";
    recColor = c.bgRed;
  } else if (overallScore >= 5) {
    recommendation = "NEGOTIATE BEFORE SIGNING";
    recColor = c.bgYellow;
  } else {
    recommendation = "ACCEPTABLE — SIGN WITH MINOR EDITS";
    recColor = c.bgGreen;
  }

  return { overallScore, topConcerns, recommendation, recColor, risks, advices };
}

// ══════════════════════════════════════════════════════════
// RENDERING
// ══════════════════════════════════════════════════════════
async function renderParserAgent(clauses: Clause[]): Promise<ParsedClause[]> {
  console.log(sectionHeader("📄", "AGENT 1 — CONTRACT PARSER", "Extracting clause types, key terms, and obligated parties"));

  const parsed: ParsedClause[] = [];
  for (const clause of clauses) {
    await sleep(200 + Math.random() * 200);
    const p = parseClause(clause);
    parsed.push(p);

    const typeColor = { Payment: c.green, Termination: c.red, Liability: c.red, SLA: c.yellow, Data: c.magenta, IP: c.magenta, Legal: c.cyan }[p.type] || c.white;

    console.log(`  ${c.dim}┌─ Clause ${String(p.id).padStart(2, "0")} ──────────────────────────────────────────────────────┐${c.reset}`);
    console.log(`  ${c.dim}│${c.reset} ${c.bold}${p.title}${c.reset}`);
    console.log(`  ${c.dim}│${c.reset} Type: ${typeColor}${p.type}${c.reset}   Party: ${c.bold}${p.obligatedParty}${c.reset}`);
    console.log(`  ${c.dim}│${c.reset} Terms: ${c.cyan}${p.keyTerms.length > 0 ? p.keyTerms.join(", ") : "(qualitative clause)"}${c.reset}`);
    console.log(`  ${c.dim}└───────────────────────────────────────────────────────────────────┘${c.reset}`);
  }

  console.log(`\n  ${c.green}✓${c.reset} Parsed ${parsed.length} clauses successfully.\n`);
  return parsed;
}

async function renderRiskAgent(parsed: ParsedClause[]): Promise<RiskResult[]> {
  console.log(sectionHeader("🔍", "AGENT 2 — RISK ANALYZER", "Scoring each clause against company risk thresholds (1-10)"));

  const results: RiskResult[] = [];
  for (const p of parsed) {
    await sleep(250 + Math.random() * 250);
    const r = analyzeRisk(p);
    results.push(r);

    const sc = riskColor(r.score);
    console.log(`  ${c.bold}Clause ${String(r.clause.id).padStart(2, "0")}: ${r.clause.title}${c.reset}`);
    console.log(`  Risk Score: ${sc}${c.bold}${r.score}/10${c.reset}  ${bar(r.score)}  ${trafficLight(r.score)}`);
    for (const reason of r.reasons) {
      console.log(`    ${c.dim}→${c.reset} ${reason}`);
    }
    console.log();
  }

  const avg = results.reduce((s, r) => s + r.score, 0) / results.length;
  const highRisk = results.filter((r) => r.score >= 7).length;
  console.log(`  ${c.bold}Summary:${c.reset} Average risk ${c.bold}${avg.toFixed(1)}${c.reset}/10 | ${c.red}${highRisk} high-risk clauses${c.reset} | ${results.filter(r => r.score <= 3).length} low-risk\n`);

  return results;
}

async function renderComparatorAgent(parsed: ParsedClause[]): Promise<BenchmarkResult[]> {
  console.log(sectionHeader("📊", "AGENT 3 — BENCHMARK COMPARATOR", "Comparing each clause against industry-standard terms"));

  const results: BenchmarkResult[] = [];
  const colW = [4, 24, 30, 30, 10];
  const header = `  ${c.bold}${padRight("#", colW[0])}${padRight("Clause", colW[1])}${padRight("This Contract", colW[2])}${padRight("Industry Standard", colW[3])}${padRight("Deviation", colW[4])}${c.reset}`;
  console.log(header);
  console.log(`  ${"─".repeat(colW.reduce((a, b) => a + b, 0))}`);

  for (const p of parsed) {
    await sleep(150 + Math.random() * 100);
    const b = compareToBenchmark(p);
    results.push(b);

    const devColor = b.deviationPct > 50 ? c.red : b.deviationPct > 20 ? c.yellow : c.green;
    const flag = b.flagged ? ` ${c.red}⚠${c.reset}` : "";
    console.log(
      `  ${padRight(String(b.clause.id), colW[0])}` +
      `${padRight(b.clause.title, colW[1])}` +
      `${padRight(b.thisContract, colW[2])}` +
      `${padRight(b.industryStandard, colW[3])}` +
      `${devColor}${b.deviationPct > 0 ? "+" : ""}${b.deviationPct}%${c.reset}${flag}`
    );
  }

  const flagged = results.filter((r) => r.flagged).length;
  console.log(`\n  ${c.bold}${flagged} of ${results.length} clauses${c.reset} deviate >50% from industry standards and are ${c.red}flagged for review${c.reset}.\n`);

  return results;
}

async function renderNegotiationAgent(risks: RiskResult[]): Promise<NegotiationAdvice[]> {
  console.log(sectionHeader("💡", "AGENT 4 — NEGOTIATION ADVISOR", "Drafting alternative language for high-risk clauses (score ≥ 7)"));

  const advices: NegotiationAdvice[] = [];
  const highRisk = risks.filter((r) => r.score >= 7);

  for (const r of highRisk) {
    await sleep(300 + Math.random() * 300);
    const a = adviseNegotiation(r);
    if (!a) continue;
    advices.push(a);

    const prioColor = a.priority === "Must Change" ? c.red : a.priority === "Should Change" ? c.yellow : c.green;

    console.log(box([
      `${c.bold}Clause ${a.clause.id}: ${a.clause.title}${c.reset}`,
      `Risk: ${riskColor(a.riskScore)}${a.riskScore}/10${c.reset}   Priority: ${prioColor}${c.bold}${a.priority}${c.reset}`,
      "",
      `${c.dim}Why this matters:${c.reset}`,
      ...wrapText(a.riskExplanation, 68).map(l => `  ${l}`),
      "",
      `${c.green}${c.bold}Suggested alternative:${c.reset}`,
      ...wrapText(a.suggestedLanguage, 68).map(l => `  ${c.green}${l}${c.reset}`),
    ], 72, c.yellow));
    console.log();
  }

  const mustChange = advices.filter((a) => a.priority === "Must Change").length;
  const shouldChange = advices.filter((a) => a.priority === "Should Change").length;
  console.log(`  ${c.bold}Negotiation items:${c.reset} ${c.red}${mustChange} Must Change${c.reset} | ${c.yellow}${shouldChange} Should Change${c.reset}\n`);

  return advices;
}

function wrapText(text: string, maxWidth: number): string[] {
  const words = text.split(" ");
  const lines: string[] = [];
  let current = "";
  for (const word of words) {
    if (current.length + word.length + 1 > maxWidth) {
      lines.push(current);
      current = word;
    } else {
      current = current ? current + " " + word : word;
    }
  }
  if (current) lines.push(current);
  return lines;
}

async function renderSummaryAgent(risks: RiskResult[], benchmarks: BenchmarkResult[], advices: NegotiationAdvice[]) {
  console.log(sectionHeader("📋", "AGENT 5 — EXECUTIVE SUMMARY", "Compiling final dashboard with recommendation"));
  await sleep(500);

  const summary = generateSummary(risks, benchmarks, advices);
  const w = 76;

  // ── Dashboard header ──
  console.log(`${c.bold}${c.cyan}╔${"═".repeat(w)}╗${c.reset}`);
  console.log(`${c.bold}${c.cyan}║${c.reset}${padRight(`  ${c.bold}${c.white}CONTRACT REVIEW DASHBOARD${c.reset}`, w + 14)}${c.bold}${c.cyan}║${c.reset}`);
  console.log(`${c.bold}${c.cyan}║${c.reset}${padRight(`  ${c.dim}CloudStack Pro SaaS Agreement — Confidential${c.reset}`, w + 10)}${c.bold}${c.cyan}║${c.reset}`);
  console.log(`${c.bold}${c.cyan}╠${"═".repeat(w)}╣${c.reset}`);

  // ── Traffic light grid ──
  console.log(`${c.bold}${c.cyan}║${c.reset}                                                                            ${c.bold}${c.cyan}║${c.reset}`);
  console.log(`${c.bold}${c.cyan}║${c.reset}  ${c.bold}CLAUSE RISK GRID${c.reset}                                                          ${c.bold}${c.cyan}║${c.reset}`);

  const perRow = 5;
  for (let row = 0; row < Math.ceil(risks.length / perRow); row++) {
    let nameLine = `${c.bold}${c.cyan}║${c.reset}  `;
    let scoreLine = `${c.bold}${c.cyan}║${c.reset}  `;
    for (let col = 0; col < perRow; col++) {
      const idx = row * perRow + col;
      if (idx >= risks.length) break;
      const r = risks[idx];
      const name = r.clause.title.length > 12 ? r.clause.title.substring(0, 11) + "…" : r.clause.title;
      nameLine += padRight(`${c.dim}${String(r.clause.id).padStart(2, "0")}.${c.reset} ${name}`, 24);
      scoreLine += padRight(`    ${trafficLight(r.score)} ${riskColor(r.score)}${c.bold}${r.score}/10${c.reset}`, 30);
    }
    // Pad to fill row
    const nameStripped = nameLine.replace(/\x1b\[[0-9;]*m/g, "");
    const scoreStripped = scoreLine.replace(/\x1b\[[0-9;]*m/g, "");
    nameLine += " ".repeat(Math.max(0, w + 4 - nameStripped.length)) + `${c.bold}${c.cyan}║${c.reset}`;
    scoreLine += " ".repeat(Math.max(0, w + 4 - scoreStripped.length)) + `${c.bold}${c.cyan}║${c.reset}`;
    console.log(nameLine);
    console.log(scoreLine);
    if (row < Math.ceil(risks.length / perRow) - 1) {
      console.log(`${c.bold}${c.cyan}║${c.reset}${" ".repeat(w)}${c.bold}${c.cyan}║${c.reset}`);
    }
  }

  // ── Divider ──
  console.log(`${c.bold}${c.cyan}╠${"═".repeat(w)}╣${c.reset}`);

  // ── Key metrics ──
  const overallColor = riskColor(Math.round(summary.overallScore));
  const highCount = risks.filter((r) => r.score >= 7).length;
  const medCount = risks.filter((r) => r.score >= 4 && r.score <= 6).length;
  const lowCount = risks.filter((r) => r.score <= 3).length;
  const flaggedCount = benchmarks.filter((b) => b.flagged).length;

  const metricLines = [
    `  ${c.bold}KEY METRICS${c.reset}`,
    ``,
    `  Overall Risk Score:   ${overallColor}${c.bold}${summary.overallScore.toFixed(1)}/10${c.reset}  ${bar(Math.round(summary.overallScore), 30)}`,
    `  High-Risk Clauses:    ${c.red}${c.bold}${highCount}${c.reset}  (score ≥ 7)`,
    `  Moderate-Risk:        ${c.yellow}${c.bold}${medCount}${c.reset}  (score 4-6)`,
    `  Low-Risk:             ${c.green}${c.bold}${lowCount}${c.reset}  (score 1-3)`,
    `  Benchmark Violations: ${c.red}${c.bold}${flaggedCount}${c.reset}  (>50% deviation)`,
    `  Negotiation Items:    ${c.bold}${summary.advices.length}${c.reset}  (${summary.advices.filter(a => a.priority === "Must Change").length} must-change)`,
  ];

  for (const line of metricLines) {
    const stripped = line.replace(/\x1b\[[0-9;]*m/g, "");
    const pad = w - stripped.length;
    console.log(`${c.bold}${c.cyan}║${c.reset}${line}${" ".repeat(Math.max(0, pad))}${c.bold}${c.cyan}║${c.reset}`);
  }

  // ── Divider ──
  console.log(`${c.bold}${c.cyan}╠${"═".repeat(w)}╣${c.reset}`);

  // ── Top 5 concerns ──
  const concernHeader = `  ${c.bold}TOP 5 CONCERNS${c.reset}`;
  const chStripped = concernHeader.replace(/\x1b\[[0-9;]*m/g, "");
  console.log(`${c.bold}${c.cyan}║${c.reset}${concernHeader}${" ".repeat(Math.max(0, w - chStripped.length))}${c.bold}${c.cyan}║${c.reset}`);
  console.log(`${c.bold}${c.cyan}║${c.reset}${" ".repeat(w)}${c.bold}${c.cyan}║${c.reset}`);

  for (let i = 0; i < summary.topConcerns.length; i++) {
    const tc = summary.topConcerns[i];
    const line = `  ${c.bold}${i + 1}.${c.reset} ${trafficLight(tc.score)} ${c.bold}Clause ${tc.clause.id}${c.reset}: ${tc.clause.title} — ${riskColor(tc.score)}Risk ${tc.score}/10${c.reset} — ${tc.reasons[0]}`;
    const stripped = line.replace(/\x1b\[[0-9;]*m/g, "");
    const pad = w - stripped.length;
    if (pad >= 0) {
      console.log(`${c.bold}${c.cyan}║${c.reset}${line}${" ".repeat(pad)}${c.bold}${c.cyan}║${c.reset}`);
    } else {
      // Truncate for display
      const maxContentLen = w - 2;
      const truncated = `  ${c.bold}${i + 1}.${c.reset} ${trafficLight(tc.score)} ${c.bold}Cl.${tc.clause.id}${c.reset} ${tc.clause.title} — ${riskColor(tc.score)}${tc.score}/10${c.reset}`;
      const tStripped = truncated.replace(/\x1b\[[0-9;]*m/g, "");
      const tPad = w - tStripped.length;
      console.log(`${c.bold}${c.cyan}║${c.reset}${truncated}${" ".repeat(Math.max(0, tPad))}${c.bold}${c.cyan}║${c.reset}`);
    }
  }

  // ── Divider ──
  console.log(`${c.bold}${c.cyan}╠${"═".repeat(w)}╣${c.reset}`);

  // ── Recommendation ──
  console.log(`${c.bold}${c.cyan}║${c.reset}${" ".repeat(w)}${c.bold}${c.cyan}║${c.reset}`);
  const recLine = `  ${c.bold}RECOMMENDATION:  ${summary.recColor}${c.bold} ${summary.recommendation} ${c.reset}`;
  const recStripped = recLine.replace(/\x1b\[[0-9;]*m/g, "");
  const recPad = w - recStripped.length;
  console.log(`${c.bold}${c.cyan}║${c.reset}${recLine}${" ".repeat(Math.max(0, recPad))}${c.bold}${c.cyan}║${c.reset}`);
  console.log(`${c.bold}${c.cyan}║${c.reset}${" ".repeat(w)}${c.bold}${c.cyan}║${c.reset}`);

  const recNote = summary.overallScore >= 7.5
    ? "This contract is heavily vendor-favorable. Walking away is recommended unless ALL must-change items are accepted."
    : summary.overallScore >= 5
    ? "This contract contains significant risks. Do not sign without addressing the must-change items listed above."
    : "This contract is broadly acceptable with minor adjustments needed.";

  const noteLines = wrapText(recNote, w - 4);
  for (const nl of noteLines) {
    const padded = `  ${c.dim}${nl}${c.reset}`;
    const nStripped = padded.replace(/\x1b\[[0-9;]*m/g, "");
    const nPad = w - nStripped.length;
    console.log(`${c.bold}${c.cyan}║${c.reset}${padded}${" ".repeat(Math.max(0, nPad))}${c.bold}${c.cyan}║${c.reset}`);
  }

  console.log(`${c.bold}${c.cyan}║${c.reset}${" ".repeat(w)}${c.bold}${c.cyan}║${c.reset}`);
  console.log(`${c.bold}${c.cyan}╚${"═".repeat(w)}╝${c.reset}`);
}

// ══════════════════════════════════════════════════════════
// MAIN ORCHESTRATOR
// ══════════════════════════════════════════════════════════
async function main() {
  console.log();
  console.log(`${c.bold}${c.cyan}  ███████╗ ██████╗ ██╗   ██╗ █████╗ ██████╗ ${c.reset}`);
  console.log(`${c.bold}${c.cyan}  ██╔════╝██╔═══██╗██║   ██║██╔══██╗██╔══██╗${c.reset}`);
  console.log(`${c.bold}${c.cyan}  ███████╗██║   ██║██║   ██║███████║██║  ██║${c.reset}`);
  console.log(`${c.bold}${c.cyan}  ╚════██║██║▄▄ ██║██║   ██║██╔══██║██║  ██║${c.reset}`);
  console.log(`${c.bold}${c.cyan}  ███████║╚██████╔╝╚██████╔╝██║  ██║██████╔╝${c.reset}`);
  console.log(`${c.bold}${c.cyan}  ╚══════╝ ╚══▀▀═╝  ╚═════╝ ╚═╝  ╚═╝╚═════╝ ${c.reset}`);
  console.log();
  console.log(`${c.bold}  Contract Review Agent Squad${c.reset}`);
  console.log(`${c.dim}  Analyzing: CloudStack Pro SaaS Agreement (15 clauses)${c.reset}`);
  console.log(`${c.dim}  Agents: Parser → Risk Analyzer → Comparator → Negotiation Advisor → Summary Writer${c.reset}`);
  console.log(`${c.dim}${"─".repeat(78)}${c.reset}`);

  await sleep(600);

  // Phase 1: Parse
  const parsed = await renderParserAgent(CONTRACT);

  // Phase 2: Risk
  const risks = await renderRiskAgent(parsed);

  // Phase 3: Benchmark comparison
  const benchmarks = await renderComparatorAgent(parsed);

  // Phase 4: Negotiation advice
  const advices = await renderNegotiationAgent(risks);

  // Phase 5: Executive summary
  await renderSummaryAgent(risks, benchmarks, advices);

  console.log();
  console.log(`${c.dim}  Review completed by 5 agents in ${(15 * 0.35 + 5).toFixed(1)}s (simulated). All scores are deterministic.${c.reset}`);
  console.log();
}

main().catch(console.error);
