// Receipt Scanner & Expense Processor
// 4 agents • 10 receipts • policy engine

// ─── Types ──────────────────────────────────────────────────────────

interface RawReceipt {
  id: number;
  ocrText: string;
}

interface ExtractedField<T> {
  value: T;
  confidence: number;
}

interface LineItem {
  description: string;
  amount: number;
}

interface ScannedReceipt {
  id: number;
  ocrText: string;
  vendor: ExtractedField<string>;
  amount: ExtractedField<number>;
  date: ExtractedField<string>;
  payment: ExtractedField<string>;
  lineItems: LineItem[];
}

interface MatchResult {
  isDuplicate: boolean;
  duplicateOf: number | null;
  similarity: number;
  splitTransaction: boolean;
  splitWith: number | null;
}

interface Classification {
  glCode: number;
  glLabel: string;
  department: string;
}

type ApprovalStatus = "Auto-Approved" | "Needs Review" | "Flagged" | "Rejected";

interface ApprovalResult {
  status: ApprovalStatus;
  reasons: string[];
  requiredAction: string | null;
}

interface ProcessedReceipt {
  id: number;
  scanned: ScannedReceipt;
  match: MatchResult;
  classification: Classification;
  approval: ApprovalResult;
}

// ─── ANSI helpers ───────────────────────────────────────────────────

const C = {
  reset: "\x1b[0m",
  bold: "\x1b[1m",
  dim: "\x1b[2m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  red: "\x1b[31m",
  cyan: "\x1b[36m",
  magenta: "\x1b[35m",
  white: "\x1b[37m",
  bgGreen: "\x1b[42m",
  bgYellow: "\x1b[43m",
  bgRed: "\x1b[41m",
};

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

function fmt(n: number): string {
  return n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

// ─── Receipt OCR Data ───────────────────────────────────────────────

const receipts: RawReceipt[] = [
  {
    id: 1,
    ocrText: `SAKURA JAPANESE RESTAURANT
  14523 EI Camino Real, Ste B
  Mountain View, CA 94040
  Tel: (650) 988-77l2

  Server: Mike    Tab1e: 12
  Date: 03/15/2024   Time: 12:34 PM
  Guests: 4

  Chicken Teriyaki      $16.50
  Sa1mon Sashimi        $22.00
  Tempura Udon          $14.50
  Beef Ramen            $15.00
  Edamame               $6.50
  Miso Soup x3          $10.50
  Green Tea Ice Cream   $7.00
  Iced Tea x4           $14.00

  Subtota1:           $106.00
  Tax (8.75%):          $9.28
  Tip (20%):           $23.06
  ---------------------------
  TOTAL:              $l87.50
  Visa ****4521

  Thank you for dining with us!`,
  },
  {
    id: 2,
    ocrText: `Uber Technologies, lnc.
  Trip Receipt

  Date: March 15, 2024
  UberX

  Pick-up: 455 Market St, San Francisco
  Drop-off: SFO lnternational Terminal
  Distance: 13.2 mi

  Base Fare        $2.50
  Distance         $l5.84
  Time             $8.36
  Booking Fee      $2.75
  Airport Surcharge $4.75

  Tota1 Fare:    $34.20

  Paid with: Amex ***8832
  Trip lD: 8f3a-29dc-441b`,
  },
  {
    id: 3,
    ocrText: `STAPLES #0922
  2100 Charleston Rd
  Mountain View CA 94043
  (650) 960-3782

  03/14/2024  l0:22 AM
  Reg 03  Trans 4491  Cashier: DEB

  HP 65XL lnk BIk        $42.99
  HP 65XL lnk CoIor      $44.99
  Copy Paper 10-ream     $52.99
  Sharpie Markers 24pk   $18.49
  Post-it Notes l2pk     $22.99
  Binder Clips Asst      $8.99
  File Fo1ders l00ct     $24.49
  Desk Organizer         $29.96

  Subtota1:             $245.89
  Tax:                    $0.00
  --------------------------
  AMOUNT DUE:           $245.89

  VISA ****3307
  Auth: 882741
  APPROVED

  Return po1icy: 30 days w/ receipt`,
  },
  {
    id: 4,
    ocrText: `TechConnect 2024
  Annual Developer Conference
  Registration Confirmation

  Attendee: Sarah Chen
  Company: Acme Corp — Engineering
  Badge Type: Full Access (3-day)

  Registration Fee:   $l,250.00

  Date: March 20-22, 2024
  Venue: Moscone Center, SF

  Paid: 03/12/2024
  Method: Corporate Amex ****8832
  Conf#: TC2024-00891
  
  lncludes: All sessions, workshops,
  networking dinner, and expo hall.
  Cance11ation po1icy: 50% refund
  before March 1.`,
  },
  {
    id: 5,
    ocrText: `MARRIOTT MARQUIS
  780 Mission Street
  San Francisco CA 94l03
  (4l5) 896-l600

  GUEST: CHEN, SARAH
  ROOM: 1812  CHECK-lN: 03/20/2024
                CHECK-0UT: 03/22/2024

  Room Rate (King Exec)
    03/20  1 Night      $489.00
    03/21  1 Night      $489.00
  Room Subtota1:       $978.00
  Tourism Fee:          $5.72
  Occupancy Tax(l4%):  $136.92
  CA Tourism Asmt:       $3.47

  TOTAL:            $l,l24.ll

  Payment: Corp Amex ****8832
  Folio: MQ-2024-88123

  Thank you for staying with us!`,
  },
  {
    id: 6,
    ocrText: `BLUE BOTTLE COFFEE
  315 Lytton Ave
  PaIo Alto CA 94301

  03/15/2024  8:02 AM

  Drip Coffee  Lg     $4.75
  Croissant            $2.00
  -------------------
  Subtota1:           $6.75
  Tax:                $0.00
  TOTAL:              $6.75

  VISA tap ****4521
  
  Have a great day!`,
  },
  {
    id: 7,
    ocrText: `JetBrains s.r.o.
  lNVOlCE

  Bi11 To:
    Acme Corp
    Engineering Dept
    455 Market St, San Francisco

  Product: lnte11iJ lDEA U1timate
  License: Annual Subscr1ption
  Period: 03/15/2024 — 03/l4/2025
  Seats: 1

  Subtota1:            $299.00
  Discount:              $0.00
  Tax:                   $0.00
  ========================
  TOTAL DUE:           $299.00

  Payment Received: 03/15/2024
  Method: Corp Visa ****3307
  lnvoice#: JB-2024-1190847`,
  },
  {
    id: 8,
    ocrText: `UNITED AlRLlNES
  E-TlCKET RECElPT

  Passenger: CHEN/SARAH
  Confirmation: UA8K2M
  Ticket: 016-2481990847

  SFO -> JFK
  UA 237   March 19, 2024
  Depart: 07:00 AM  Arrive: 3:35 PM
  Class: Economy (W)
  Seat: 14C

  Base Fare:          $487.00
  Carrier Surcharge:   $38.00
  Sept 11 Fee:          $5.60
  Passenger Faci1ity:  $4.50
  US Segment Fee:       $4.50
  Excise Tax(7.5%):   $27.40
  ===========================
  TOTAL:              $567.00

  Form of Payment: Amex ****8832
  E-ticket issued: 03/0l/2024`,
  },
  {
    id: 9,
    ocrText: `THE GRAND STEAKHOUSE
  888 Broadway, New York NY l0003
  (212) 555-0l98

  Date: Saturday 03/23/2024  8:45 PM

  Server: Antonio    Party: 2

  Wagyu Ribeye 16oz   $89.00
  Fi1et Mignon 8oz    $72.00
  Lobster Tai1        $45.00
  Caesar Sa1ad         $16.00
  Creamed Spinach      $14.00
  2x Old Fash1oned     $36.00

  Subtota1:          $272.00
  Tax(8.875%):        $24.l4
  Gratuity(18%):      $48.96
  -----------------------
  TOTAL:             $3l2.00

  Amex ****8832
  Auth Code: 55l209
  
  Thank you!`,
  },
  {
    id: 10,
    ocrText: `SHELL STATION #44891
  2900 EI Camino Rea1
  Santa C1ara CA 95051

  Date: 03/15/2024  6:47 PM
  Pump #: 7

  Regu1ar Unleaded
  l0.528 GAL @ $4.339/GAL

  FUEL TOTAL:         $45.67

  Visa ****4521
  Auth: 339201

  ---- CUSTOMER COPY ----


  SHELL STATION #44891
  2900 EI Camino Rea1
  Santa C1ara CA 95051

  Date: 03/15/2024  6:47 PM
  Pump #: 7

  Regu1ar Unleaded
  l0.528 GAL @ $4.339/GAL

  FUEL TOTAL:         $45.67

  Visa ****4521
  Auth: 339201

  ---- MERCHANT COPY ----`,
  },
];

// ─── GL Code Map ────────────────────────────────────────────────────

const GL_CODES: Record<number, string> = {
  6100: "Travel & Transportation",
  6200: "Meals & Entertainment",
  6300: "Office Supplies",
  6400: "Software & Subscriptions",
  6500: "Conference & Training",
  6600: "Accommodation",
  6900: "Miscellaneous",
};

// ─── Agent 1: Scanner ───────────────────────────────────────────────

function fixOcrErrors(text: string): string {
  let t = text;

  // Phase 1: Compound word fixes (before single-char fixes can interfere)
  t = t.replace(/AlRLlNES/g, "AIRLINES");
  t = t.replace(/E-TlCKET/g, "E-TICKET");
  t = t.replace(/RECElPT/g, "RECEIPT");
  t = t.replace(/lNVOlCE/g, "INVOICE");
  t = t.replace(/lnte11iJ/g, "IntelliJ");
  t = t.replace(/lDEA/g, "IDEA");
  t = t.replace(/U1timate/g, "Ultimate");
  t = t.replace(/Subscr1ption/g, "Subscription");
  t = t.replace(/Cance11ation/g, "Cancellation");
  t = t.replace(/lnvoice#/g, "Invoice#");

  // Phase 2: Word-level fixes
  t = t.replace(/Tab1e/g, "Table");
  t = t.replace(/Subtota1/g, "Subtotal");
  t = t.replace(/Tota1/g, "Total");
  t = t.replace(/Regu1ar/g, "Regular");
  t = t.replace(/Faci1ity/g, "Facility");
  t = t.replace(/Sa1mon/g, "Salmon");
  t = t.replace(/Sa1ad/g, "Salad");
  t = t.replace(/Fo1ders/g, "Folders");
  t = t.replace(/po1icy/g, "policy");
  t = t.replace(/CoIor/g, "Color");
  t = t.replace(/PaIo/g, "Palo");
  t = t.replace(/BIk/g, "Blk");
  t = t.replace(/Fi1et/g, "Filet");
  t = t.replace(/Tai1/g, "Tail");
  t = t.replace(/Fash1oned/g, "Fashioned");
  t = t.replace(/C1ara/g, "Clara");
  t = t.replace(/Rea1\b/g, "Real");
  t = t.replace(/Bi11/g, "Bill");
  t = t.replace(/lnc\b/g, "Inc");

  // Phase 3: Context-sensitive character fixes
  t = t.replace(/0UT/g, "OUT");
  t = t.replace(/lN/g, "IN");
  t = t.replace(/l(\d)/g, "1$1");
  t = t.replace(/(\d)l/g, "$11");

  // Phase 4: Fix l→1 in dollar amounts (catches $l,250.00 and $l,l24.ll)
  t = t.replace(/\$[l0-9,]+\.[l0-9]{2}/g, (m) => m.replace(/l/g, "1"));

  return t;
}

function extractVendor(text: string): ExtractedField<string> {
  const cleaned = fixOcrErrors(text);
  const firstLine = cleaned.trim().split("\n")[0].trim();

  // Heuristic: first line of receipt is usually vendor
  if (firstLine.length > 2 && firstLine.length < 60) {
    const confidence = firstLine === firstLine.toUpperCase() ? 0.95 : 0.88;
    return { value: titleCase(firstLine), confidence };
  }
  return { value: "Unknown Vendor", confidence: 0.3 };
}

function titleCase(s: string): string {
  return s
    .toLowerCase()
    .split(" ")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

function extractAmount(text: string): ExtractedField<number> {
  const cleaned = fixOcrErrors(text);

  // Try explicit total patterns in priority order
  const patterns: Array<{ re: RegExp; conf: number }> = [
    { re: /(?<!sub)total\s*(?:DUE)?[:\s]*\$([0-9,]+\.\d{2})/i, conf: 0.95 },
    { re: /AMOUNT\s*DUE[:\s]*\$([0-9,]+\.\d{2})/i, conf: 0.95 },
    { re: /FUEL\s*TOTAL[:\s]*\$([0-9,]+\.\d{2})/i, conf: 0.92 },
    { re: /Total\s*Fare[:\s]*\$([0-9,]+\.\d{2})/i, conf: 0.93 },
    { re: /Registration\s*Fee[:\s]*\$([0-9,]+\.\d{2})/i, conf: 0.90 },
  ];

  for (const { re, conf } of patterns) {
    const m = cleaned.match(re);
    if (m) {
      const val = parseFloat(m[1].replace(/,/g, ""));
      if (!isNaN(val) && val > 0) return { value: val, confidence: conf };
    }
  }

  // Fallback: largest dollar amount
  const amounts = [...cleaned.matchAll(/\$([0-9,]+\.\d{2})/g)]
    .map((m) => parseFloat(m[1].replace(/,/g, "")))
    .filter((v) => !isNaN(v) && v > 0);

  if (amounts.length > 0) {
    const max = Math.max(...amounts);
    return { value: max, confidence: 0.70 };
  }

  return { value: 0, confidence: 0.0 };
}

function extractDate(text: string): ExtractedField<string> {
  const cleaned = fixOcrErrors(text);

  // MM/DD/YYYY
  const slashDate = cleaned.match(/(\d{2})\/(\d{2})\/(\d{4})/);
  if (slashDate) {
    return {
      value: `${slashDate[3]}-${slashDate[1]}-${slashDate[2]}`,
      confidence: 0.92,
    };
  }

  // Month DD, YYYY
  const longDate = cleaned.match(
    /(January|February|March|April|May|June|July|August|September|October|November|December)\s+(\d{1,2}),?\s+(\d{4})/i
  );
  if (longDate) {
    const months: Record<string, string> = {
      january: "01", february: "02", march: "03", april: "04",
      may: "05", june: "06", july: "07", august: "08",
      september: "09", october: "10", november: "11", december: "12",
    };
    const mm = months[longDate[1].toLowerCase()];
    const dd = longDate[2].padStart(2, "0");
    return { value: `${longDate[3]}-${mm}-${dd}`, confidence: 0.88 };
  }

  return { value: "unknown", confidence: 0.0 };
}

function extractPayment(text: string): ExtractedField<string> {
  const cleaned = fixOcrErrors(text);

  const visa = cleaned.match(/Visa\s*(?:tap\s*)?\*{3,4}(\d{4})/i);
  if (visa) return { value: `Visa ****${visa[1]}`, confidence: 0.95 };

  const amex = cleaned.match(/Amex\s*\*{3,4}(\d{4})/i);
  if (amex) return { value: `Amex ****${amex[1]}`, confidence: 0.95 };

  const corp = cleaned.match(/Corp(?:orate)?\s*(Visa|Amex)\s*\*{3,4}(\d{4})/i);
  if (corp) return { value: `Corp ${corp[1]} ****${corp[2]}`, confidence: 0.93 };

  const generic = cleaned.match(/(Visa|Amex|Mastercard|Discover)\s*\*{3,4}(\d{4})/i);
  if (generic) return { value: `${generic[1]} ****${generic[2]}`, confidence: 0.90 };

  return { value: "Unknown", confidence: 0.3 };
}

function extractLineItems(text: string): LineItem[] {
  const cleaned = fixOcrErrors(text);
  const items: LineItem[] = [];

  // Match lines like "Item Name    $12.34" or "Item Name   12.34"
  const lineRe = /^\s{0,4}(.{3,30}?)\s{2,}\$?(\d+\.\d{2})\s*$/gm;
  let m: RegExpExecArray | null;
  while ((m = lineRe.exec(cleaned)) !== null) {
    const desc = m[1].trim();
    const amt = parseFloat(m[2]);
    // Skip subtotals, tax, tip, total lines
    if (/subtotal|tax|tip|total|gratuity|fee|surcharge|discount|amount due|booking/i.test(desc)) continue;
    if (!isNaN(amt) && amt > 0 && desc.length > 1) {
      items.push({ description: desc, amount: amt });
    }
  }

  return items;
}

function scanReceipt(raw: RawReceipt): ScannedReceipt {
  return {
    id: raw.id,
    ocrText: raw.ocrText,
    vendor: extractVendor(raw.ocrText),
    amount: extractAmount(raw.ocrText),
    date: extractDate(raw.ocrText),
    payment: extractPayment(raw.ocrText),
    lineItems: extractLineItems(raw.ocrText),
  };
}

// ─── Agent 2: Matcher ───────────────────────────────────────────────

function normalizeVendor(v: string): string {
  return v.toLowerCase().replace(/[^a-z0-9]/g, "");
}

function vendorSimilarity(a: string, b: string): number {
  const na = normalizeVendor(a);
  const nb = normalizeVendor(b);
  if (na === nb) return 1.0;
  // Check if one contains the other
  if (na.includes(nb) || nb.includes(na)) return 0.8;
  // Simple character overlap (Jaccard on bigrams)
  const bigramsOf = (s: string): Set<string> => {
    const bg = new Set<string>();
    for (let i = 0; i < s.length - 1; i++) bg.add(s.slice(i, i + 2));
    return bg;
  };
  const ba = bigramsOf(na);
  const bb = bigramsOf(nb);
  let intersection = 0;
  for (const b of ba) if (bb.has(b)) intersection++;
  const union = ba.size + bb.size - intersection;
  return union === 0 ? 0 : intersection / union;
}

function amountSimilarity(a: number, b: number): number {
  if (a === 0 || b === 0) return 0;
  const diff = Math.abs(a - b);
  const avg = (a + b) / 2;
  const pct = diff / avg;
  return pct <= 0.05 ? 1.0 - pct : 0;
}

function dateDiffDays(a: string, b: string): number {
  if (a === "unknown" || b === "unknown") return Infinity;
  const da = new Date(a);
  const db = new Date(b);
  return Math.abs(da.getTime() - db.getTime()) / (1000 * 60 * 60 * 24);
}

function matchReceipt(
  scanned: ScannedReceipt,
  previouslyProcessed: ScannedReceipt[]
): MatchResult {
  let bestDupScore = 0;
  let bestDupId: number | null = null;
  let splitWith: number | null = null;

  for (const prev of previouslyProcessed) {
    const vSim = vendorSimilarity(scanned.vendor.value, prev.vendor.value);
    const aSim = amountSimilarity(scanned.amount.value, prev.amount.value);
    const dDiff = dateDiffDays(scanned.date.value, prev.date.value);
    const dateClose = dDiff <= 3 ? 1.0 : 0;

    // Duplicate: same vendor + similar amount + close date
    const dupScore = vSim * 0.4 + aSim * 0.4 + dateClose * 0.2;
    if (dupScore > bestDupScore && aSim > 0) {
      bestDupScore = dupScore;
      bestDupId = prev.id;
    }

    // Split transaction: same vendor, same day, different amounts
    if (vSim > 0.7 && dDiff === 0 && aSim === 0) {
      splitWith = prev.id;
    }
  }

  // Check for internal duplicate (e.g. customer copy + merchant copy scanned together)
  const hasInternalDup =
    /CUSTOMER\s*COPY/i.test(scanned.ocrText) &&
    /MERCHANT\s*COPY/i.test(scanned.ocrText);

  const isDuplicate = bestDupScore >= 0.75 || hasInternalDup;

  return {
    isDuplicate,
    duplicateOf: hasInternalDup ? scanned.id : isDuplicate ? bestDupId : null,
    similarity: hasInternalDup ? 100 : Math.round(bestDupScore * 100),
    splitTransaction: splitWith !== null,
    splitWith,
  };
}

// ─── Agent 3: Classifier ───────────────────────────────────────────

interface VendorRule {
  pattern: RegExp;
  glCode: number;
  department: string;
}

const VENDOR_RULES: VendorRule[] = [
  { pattern: /uber|lyft|taxi|united|airline|flight|delta|southwest/i, glCode: 6100, department: "Engineering" },
  { pattern: /shell|gas|fuel|chevron|bp|exxon/i, glCode: 6100, department: "Engineering" },
  { pattern: /restaurant|steakhouse|coffee|cafe|diner|sushi|japanese|pizza|grill/i, glCode: 6200, department: "Engineering" },
  { pattern: /blue\s*bottle/i, glCode: 6200, department: "Engineering" },
  { pattern: /staples|office\s*depot|supplies/i, glCode: 6300, department: "Operations" },
  { pattern: /jetbrains|intellij|github|aws|azure|subscription|software/i, glCode: 6400, department: "Engineering" },
  { pattern: /conference|techconnect|summit|workshop|registration/i, glCode: 6500, department: "Engineering" },
  { pattern: /marriott|hilton|hyatt|hotel|airbnb|inn|lodge/i, glCode: 6600, department: "Engineering" },
];

function classifyReceipt(scanned: ScannedReceipt): Classification {
  const vendorText = scanned.vendor.value + " " + scanned.ocrText.slice(0, 200);

  for (const rule of VENDOR_RULES) {
    if (rule.pattern.test(vendorText)) {
      return {
        glCode: rule.glCode,
        glLabel: GL_CODES[rule.glCode],
        department: rule.department,
      };
    }
  }

  return { glCode: 6900, glLabel: GL_CODES[6900], department: "Operations" };
}

// ─── Agent 4: Approver ─────────────────────────────────────────────

function approveReceipt(
  scanned: ScannedReceipt,
  matchResult: MatchResult,
  classification: Classification
): ApprovalResult {
  const reasons: string[] = [];
  const statusRank: Record<ApprovalStatus, number> = {
    "Auto-Approved": 0,
    "Needs Review": 1,
    "Flagged": 2,
    "Rejected": 3,
  };
  let worstRank = 0;

  const escalate = (status: ApprovalStatus, reason: string): void => {
    reasons.push(reason);
    if (statusRank[status] > worstRank) worstRank = statusRank[status];
  };

  // Meals > $75/person
  if (classification.glCode === 6200 && scanned.amount.value > 75) {
    escalate("Needs Review", "Meal exceeds $75/person threshold");
  }

  // Single expense > $500 → VP approval
  if (scanned.amount.value > 500) {
    escalate("Flagged", `Amount $${fmt(scanned.amount.value)} exceeds $500 — requires VP approval`);
  }

  // Weekend expenses
  if (scanned.date.value !== "unknown") {
    const d = new Date(scanned.date.value);
    const day = d.getUTCDay();
    if (day === 0 || day === 6) {
      escalate("Needs Review", "Weekend expense — business justification required");
    }
  }

  // Duplicate
  if (matchResult.isDuplicate) {
    escalate("Flagged", `Potential duplicate of receipt #${matchResult.duplicateOf} (${matchResult.similarity}% match)`);
  }

  // Missing fields
  const missingFields: string[] = [];
  if (scanned.vendor.confidence < 0.5) missingFields.push("vendor");
  if (scanned.amount.confidence < 0.5) missingFields.push("amount");
  if (scanned.date.confidence < 0.5) missingFields.push("date");
  if (missingFields.length > 0) {
    escalate("Needs Review", `Low confidence on fields: ${missingFields.join(", ")}`);
  }

  const rankToStatus: ApprovalStatus[] = ["Auto-Approved", "Needs Review", "Flagged", "Rejected"];
  const worstStatus: ApprovalStatus = rankToStatus[worstRank];

  let requiredAction: string | null = null;
  if (worstRank === 1) {
    requiredAction = "Manager approval note required";
  } else if (worstRank >= 2) {
    requiredAction = "VP review and approval required";
  }

  return { status: worstStatus, reasons, requiredAction };
}

// ─── Display helpers ────────────────────────────────────────────────

function statusColor(status: ApprovalStatus): string {
  switch (status) {
    case "Auto-Approved": return C.green;
    case "Needs Review": return C.yellow;
    case "Flagged": return C.red;
    case "Rejected": return C.red;
  }
}

function statusIcon(status: ApprovalStatus): string {
  switch (status) {
    case "Auto-Approved": return "✅";
    case "Needs Review": return "⚠️";
    case "Flagged": return "🚩";
    case "Rejected": return "❌";
  }
}

function shortStatus(status: ApprovalStatus): string {
  switch (status) {
    case "Auto-Approved": return "Auto";
    case "Needs Review": return "Review";
    case "Flagged": return "Flagged";
    case "Rejected": return "Reject";
  }
}

function padRight(s: string, n: number): string {
  return s.length >= n ? s.slice(0, n) : s + " ".repeat(n - s.length);
}

function padLeft(s: string, n: number): string {
  return s.length >= n ? s.slice(0, n) : " ".repeat(n - s.length) + s;
}

function ocrPreview(text: string, maxLen: number): string {
  const oneLine = text.replace(/\n/g, " ").replace(/\s{2,}/g, " ").trim();
  return oneLine.length > maxLen ? oneLine.slice(0, maxLen) + "..." : oneLine;
}

// ─── Main pipeline ──────────────────────────────────────────────────

async function main(): Promise<void> {
  const startTime = Date.now();

  // Banner
  console.log();
  console.log(`${C.cyan}╔══════════════════════════════════════════════════════╗${C.reset}`);
  console.log(`${C.cyan}║${C.bold}       🧾 Receipt Scanner & Expense Processor        ${C.reset}${C.cyan}║${C.reset}`);
  console.log(`${C.cyan}║       4 Agents • 10 Receipts • Policy Engine         ║${C.reset}`);
  console.log(`${C.cyan}╚══════════════════════════════════════════════════════╝${C.reset}`);
  console.log();

  const processed: ProcessedReceipt[] = [];
  const scannedSoFar: ScannedReceipt[] = [];

  for (const raw of receipts) {
    console.log(`${C.bold}━━━ Receipt ${raw.id}/10 ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${C.reset}`);
    console.log(`${C.dim}OCR Input Preview: "${ocrPreview(raw.ocrText, 60)}"${C.reset}`);
    console.log();

    // Agent 1: Scanner
    await sleep(150);
    const scanned = scanReceipt(raw);
    console.log(`${C.magenta}🔍 Scanner ${C.reset} → Vendor: ${C.bold}${scanned.vendor.value}${C.reset}`);
    console.log(`             Amount: ${C.green}$${fmt(scanned.amount.value)}${C.reset} ${C.dim}(confidence: ${scanned.amount.confidence.toFixed(2)})${C.reset}`);
    console.log(`             Date: ${scanned.date.value} ${C.dim}(confidence: ${scanned.date.confidence.toFixed(2)})${C.reset}`);
    console.log(`             Payment: ${scanned.payment.value}`);
    if (scanned.lineItems.length > 0) {
      console.log(`             ${C.dim}Line items: ${scanned.lineItems.length} extracted${C.reset}`);
    }
    console.log();

    // Agent 2: Matcher
    await sleep(100);
    const matchResult = matchReceipt(scanned, scannedSoFar);
    process.stdout.write(`${C.cyan}🔗 Matcher ${C.reset} → `);
    if (matchResult.isDuplicate && matchResult.duplicateOf === scanned.id) {
      console.log(`${C.red}⚠ INTERNAL DUPLICATE${C.reset} — customer copy & merchant copy detected (${matchResult.similarity}% match)`);
    } else if (matchResult.isDuplicate) {
      console.log(`${C.red}⚠ DUPLICATE DETECTED${C.reset} — matches receipt #${matchResult.duplicateOf} (${matchResult.similarity}% similarity)`);
    } else {
      console.log("No duplicates found");
    }
    if (matchResult.splitTransaction) {
      console.log(`             ${C.yellow}Split transaction detected with receipt #${matchResult.splitWith}${C.reset}`);
    } else {
      console.log(`             No split transactions detected`);
    }
    console.log();

    scannedSoFar.push(scanned);

    // Agent 3: Classifier
    await sleep(100);
    const classification = classifyReceipt(scanned);
    console.log(`${C.yellow}📂 Classifier${C.reset} → GL Code: ${C.bold}${classification.glCode}${C.reset} (${classification.glLabel})`);
    console.log(`               Department: ${classification.department}`);
    console.log();

    // Agent 4: Approver
    await sleep(200);
    const approval = approveReceipt(scanned, matchResult, classification);
    const sc = statusColor(approval.status);
    const icon = statusIcon(approval.status);
    console.log(`${C.green}✅ Approver${C.reset}  → ${sc}${icon} ${approval.status.toUpperCase()}${C.reset}`);
    for (const reason of approval.reasons) {
      console.log(`              ${C.dim}Reason: ${reason}${C.reset}`);
    }
    if (approval.requiredAction) {
      console.log(`              ${C.bold}Required: ${approval.requiredAction}${C.reset}`);
    }
    if (approval.reasons.length === 0) {
      console.log(`              ${C.dim}All policy checks passed${C.reset}`);
    }
    console.log();

    processed.push({
      id: raw.id,
      scanned,
      match: matchResult,
      classification,
      approval,
    });
  }

  // ─── Expense Report Summary ─────────────────────────────────────

  await sleep(300);

  // Calculate totals
  const grandTotal = processed.reduce((s, p) => s + p.scanned.amount.value, 0);

  const byGL: Record<number, number> = {};
  for (const p of processed) {
    const code = p.classification.glCode;
    byGL[code] = (byGL[code] ?? 0) + p.scanned.amount.value;
  }

  const byStatus: Record<ApprovalStatus, { total: number; count: number }> = {
    "Auto-Approved": { total: 0, count: 0 },
    "Needs Review": { total: 0, count: 0 },
    "Flagged": { total: 0, count: 0 },
    "Rejected": { total: 0, count: 0 },
  };
  for (const p of processed) {
    byStatus[p.approval.status].total += p.scanned.amount.value;
    byStatus[p.approval.status].count++;
  }

  const W = 71;
  const sep = "═".repeat(W);
  const thin = "─".repeat(W);

  console.log(`${C.cyan}╔${sep}╗${C.reset}`);
  console.log(`${C.cyan}║${C.bold}${padRight("                    💰 EXPENSE REPORT SUMMARY", W)}${C.reset}${C.cyan}║${C.reset}`);
  console.log(`${C.cyan}║${padRight("                    Period: March 2024", W)}║${C.reset}`);
  console.log(`${C.cyan}╠${sep}╣${C.reset}`);

  // Header
  console.log(`${C.cyan}║${C.reset} ${C.bold}${padRight("#", 3)}│ ${padRight("Vendor", 21)}│ ${padRight("Amount", 10)}│ ${padRight("GL", 7)}│ ${padRight("Dept", 8)}│ ${padRight("Status", 7)}${C.reset}${C.cyan}║${C.reset}`);
  console.log(`${C.cyan}╠${thin}╣${C.reset}`);

  for (const p of processed) {
    const vendorShort = p.scanned.vendor.value.length > 20
      ? p.scanned.vendor.value.slice(0, 18) + ".."
      : p.scanned.vendor.value;
    const amtStr = "$" + fmt(p.scanned.amount.value);
    const sc = statusColor(p.approval.status);
    const ss = shortStatus(p.approval.status);
    const icon = statusIcon(p.approval.status);

    console.log(
      `${C.cyan}║${C.reset} ${padRight(String(p.id), 3)}│ ${padRight(vendorShort, 21)}│ ${padLeft(amtStr, 10)}│ ${padRight(String(p.classification.glCode), 7)}│ ${padRight(p.classification.department.slice(0, 7), 8)}│ ${sc}${padRight(icon + " " + ss, 7)}${C.reset}${C.cyan}║${C.reset}`
    );
  }

  console.log(`${C.cyan}╠${sep}╣${C.reset}`);
  console.log(`${C.cyan}║${C.bold}${padRight(" TOTALS BY CATEGORY", W)}${C.reset}${C.cyan}║${C.reset}`);
  console.log(`${C.cyan}╠${thin}╣${C.reset}`);

  const sortedGL = Object.keys(byGL).map(Number).sort();
  for (const code of sortedGL) {
    const label = GL_CODES[code];
    const amt = byGL[code];
    console.log(`${C.cyan}║${C.reset} ${padRight(label, 28)}│ ${padLeft("$" + fmt(amt), 40)} ${C.cyan}║${C.reset}`);
  }

  console.log(`${C.cyan}╠${thin}╣${C.reset}`);
  console.log(`${C.cyan}║${C.bold} ${padRight("GRAND TOTAL", 28)}│ ${padLeft("$" + fmt(grandTotal), 40)} ${C.reset}${C.cyan}║${C.reset}`);

  for (const status of ["Auto-Approved", "Needs Review", "Flagged", "Rejected"] as ApprovalStatus[]) {
    const d = byStatus[status];
    if (d.count === 0) continue;
    const sc = statusColor(status);
    const label = `${status}`;
    const val = `$${fmt(d.total)} (${d.count} item${d.count === 1 ? "" : "s"})`;
    console.log(`${C.cyan}║${C.reset} ${sc}${padRight(label, 28)}│ ${padLeft(val, 40)} ${C.reset}${C.cyan}║${C.reset}`);
  }

  console.log(`${C.cyan}╚${sep}╝${C.reset}`);

  // Processing stats
  const elapsed = Date.now() - startTime;
  console.log();
  console.log(`${C.bold}📊 Processing Statistics${C.reset}`);
  console.log(`${C.dim}───────────────────────────────────────${C.reset}`);
  console.log(`   Receipts processed:  ${processed.length}`);
  console.log(`   Duplicates found:    ${processed.filter((p) => p.match.isDuplicate).length}`);
  console.log(`   Auto-approved:       ${byStatus["Auto-Approved"].count}`);
  console.log(`   Needs review:        ${byStatus["Needs Review"].count}`);
  console.log(`   Flagged:             ${byStatus["Flagged"].count}`);
  console.log(`   Total time:          ${elapsed}ms`);
  console.log(`   Avg per receipt:     ${Math.round(elapsed / processed.length)}ms`);
  console.log();
}

main().catch((err: unknown) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
