// ─── Bug Triage — Squad Multi-Agent Pipeline ─────────────────────────────────
// Five agents collaborate to triage 10 incoming bug reports.
// Pure TypeScript, zero runtime deps, deterministic algorithms.

// ═══════════════════════════════════════════════════════════════════════════════
// ANSI Helpers
// ═══════════════════════════════════════════════════════════════════════════════

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
  bgYellow: "\x1b[43m",
  bgGreen: "\x1b[42m",
  bgBlue: "\x1b[44m",
  gray: "\x1b[90m",
  orange: "\x1b[38;5;208m",
};

const banner = (text: string) =>
  console.log(`\n${c.bold}${c.cyan}${"═".repeat(78)}${c.reset}\n${c.bold}${c.cyan}  ${text}${c.reset}\n${c.bold}${c.cyan}${"═".repeat(78)}${c.reset}`);

const section = (text: string) =>
  console.log(`\n${c.bold}${c.blue}── ${text} ${"─".repeat(Math.max(0, 72 - text.length))}${c.reset}`);

const bar = (value: number, max: number, width = 20) => {
  const filled = Math.round((value / max) * width);
  return `${"█".repeat(filled)}${"░".repeat(width - filled)}`;
};

const pctBar = (pct: number, width = 15) => {
  const filled = Math.round(pct * width);
  return `${"█".repeat(filled)}${"░".repeat(width - filled)} ${(pct * 100).toFixed(0).padStart(3)}%`;
};

// ═══════════════════════════════════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════════════════════════════════

interface BugReport {
  id: number;
  title: string;
  body: string;
  submittedBy: string;
  timestamp: string;
}

interface ParsedBug {
  id: number;
  title: string;
  body: string;
  system: { os: string; browser: string; version: string };
  steps: string;
  expected: string;
  actual: string;
  errorCodes: string[];
  severityGuess: string;
  qualityScore: number;
  qualityReason: string;
}

interface ExistingBug {
  id: string;
  title: string;
  body: string;
  status: string;
  component: string;
}

interface DuplicateMatch {
  existingId: string;
  existingTitle: string;
  jaccard: number;
  cosine: number;
  combined: number;
}

interface DuplicateResult {
  bugId: number;
  isDuplicate: boolean;
  bestMatch: DuplicateMatch | null;
  allMatches: DuplicateMatch[];
}

interface EnvCheckResult {
  bugId: number;
  status: "CONFIRMED" | "UNCONFIRMED" | "NEW";
  knownIssue: string | null;
  workaround: string | null;
  affectedVersions: string;
}

interface PriorityScores {
  severity: number;
  affectedUsers: number;
  workaround: number;
  businessImpact: number;
  reproducibility: number;
}

interface PriorityResult {
  bugId: number;
  scores: PriorityScores;
  finalScore: number;
  label: string;
}

interface Engineer {
  name: string;
  specialties: string[];
  workload: number;
  pastAreas: string[];
}

interface AssignmentResult {
  bugId: number;
  engineer: string;
  specialtyScore: number;
  workloadScore: number;
  experienceScore: number;
  totalScore: number;
  allScores: { name: string; total: number }[];
}

// ═══════════════════════════════════════════════════════════════════════════════
// Data — 10 Incoming Bug Reports
// ═══════════════════════════════════════════════════════════════════════════════

const INCOMING_BUGS: BugReport[] = [
  {
    id: 1,
    title: "Login fails with 500 error on Chrome 120",
    body: "Login fails with 500 error on Chrome 120, Windows 11. Steps: go to /login, enter valid credentials, click submit. Expected: redirect to dashboard. Actual: 500 error page with 'Internal Server Error'. Started happening after v2.4.1 deploy. Affects all users in our org (~50 people).",
    submittedBy: "alice@corp.com",
    timestamp: "2024-01-15T09:23:00Z",
  },
  {
    id: 2,
    title: "app is broken cant login anymore help!!!",
    body: "app is broken cant login anymore help!!! i tried everything nothing works someone fix this asap",
    submittedBy: "bob@corp.com",
    timestamp: "2024-01-15T09:45:00Z",
  },
  {
    id: 3,
    title: "Payment processing timeout in checkout flow",
    body: "Payment processing times out after 30s during checkout. Stack trace: TimeoutError at PaymentGateway.charge (payments.ts:142) -> OrderService.complete (orders.ts:87) -> CheckoutController.submit (checkout.ts:34). Stripe webhook never fires. Reproducible with any card. Affects all paying customers. Environment: Node 20.10, production cluster us-east-1. Error code: PAY_TIMEOUT_5030. Revenue impact is significant — we're losing ~$2000/hour in failed orders.",
    submittedBy: "carol@corp.com",
    timestamp: "2024-01-15T10:01:00Z",
  },
  {
    id: 4,
    title: "Getting server error when trying to sign in",
    body: "Getting server error when trying to sign in, using Chrome on Windows. Just shows an error page. Was working fine yesterday before the update.",
    submittedBy: "dave@corp.com",
    timestamp: "2024-01-15T10:15:00Z",
  },
  {
    id: 5,
    title: "Search should support fuzzy matching",
    body: "The search feature doesn't support fuzzy matching. If I type 'recieve' instead of 'receive' it returns no results. This is a bug because modern search should handle typos. Other apps like Google and Slack do this automatically.",
    submittedBy: "eve@corp.com",
    timestamp: "2024-01-15T10:30:00Z",
  },
  {
    id: 6,
    title: "App crashes on Safari iOS when uploading large images",
    body: "App crashes on Safari 16 iOS 17.2 when uploading images larger than 5MB. The page freezes, then Safari shows 'A problem repeatedly occurred'. Tested on iPhone 15 Pro. Smaller images (under 2MB) work fine. This blocks our field team who take high-res photos.",
    submittedBy: "frank@corp.com",
    timestamp: "2024-01-15T11:00:00Z",
  },
  {
    id: 7,
    title: "Dashboard takes 45 seconds to load with many records",
    body: "Dashboard takes 45 seconds to load when there are more than 1000 records. The spinner just goes on forever. Network tab shows a single API call to /api/dashboard/stats that returns 12MB of JSON. This started in v2.4.0 when the new analytics widget was added. Only admin users with large datasets are affected (~20 users).",
    submittedBy: "grace@corp.com",
    timestamp: "2024-01-15T11:20:00Z",
  },
  {
    id: 8,
    title: "CSV export generates empty files since v2.4.1",
    body: "Export to CSV was working perfectly in v2.3.0 but now generates empty files in v2.4.1. Steps: go to Reports > Monthly, click Export CSV. File downloads but is 0 bytes. Tested in Chrome and Firefox, same result. This is a regression — worked fine before the last deploy.",
    submittedBy: "hank@corp.com",
    timestamp: "2024-01-15T11:45:00Z",
  },
  {
    id: 9,
    title: "User profile page leaks other users' emails",
    body: "User profile page shows other users' email addresses in the HTML source code. If you View Source on /profile/123, you can see emails of other users in a hidden div with class 'user-suggestions'. This is a privacy/security issue. PII data is being exposed to any authenticated user.",
    submittedBy: "irene@corp.com",
    timestamp: "2024-01-15T12:00:00Z",
  },
  {
    id: 10,
    title: "Notification bell sometimes throws JS error",
    body: "Occasionally get 'undefined is not a function' error when clicking the notification bell — maybe 1 in 10 clicks. Console shows: TypeError: Cannot read properties of undefined (reading 'map') at NotificationList.render (notifications.tsx:67). Happens more often right after page load. Not a blocker but annoying.",
    submittedBy: "jake@corp.com",
    timestamp: "2024-01-15T12:15:00Z",
  },
];

// ═══════════════════════════════════════════════════════════════════════════════
// Data — 20 Existing Bugs (for duplicate detection)
// ═══════════════════════════════════════════════════════════════════════════════

const EXISTING_BUGS: ExistingBug[] = [
  { id: "EX-101", title: "Login page returns HTTP 500 after v2.4.1 update", body: "Users unable to login, server returns 500. Chrome browser, Windows.", status: "open", component: "auth" },
  { id: "EX-102", title: "Sidebar menu overlaps on mobile", body: "Navigation sidebar overlaps content on mobile screens below 375px width.", status: "open", component: "frontend" },
  { id: "EX-103", title: "Database connection pool exhaustion under load", body: "Connection pool runs out after 500 concurrent requests, causing 503 errors.", status: "in-progress", component: "backend" },
  { id: "EX-104", title: "Email notifications delayed by 2 hours", body: "Email notifications for new comments are delivered 2 hours late.", status: "open", component: "notifications" },
  { id: "EX-105", title: "Safari iOS crash on file upload", body: "App crashes on Safari iOS when uploading files, possibly memory related. Large files trigger the crash.", status: "open", component: "frontend" },
  { id: "EX-106", title: "Dark mode colors wrong in settings page", body: "Settings page has incorrect background colors in dark mode.", status: "closed", component: "frontend" },
  { id: "EX-107", title: "API rate limiter too aggressive for batch operations", body: "Rate limiter blocks legitimate batch operations after 10 requests.", status: "open", component: "backend" },
  { id: "EX-108", title: "PDF export missing footer on last page", body: "When exporting to PDF, the footer is missing on the last page of multi-page reports.", status: "open", component: "reports" },
  { id: "EX-109", title: "Search results not updating after new item added", body: "Search index is stale, newly added items don't appear in search for ~5 minutes.", status: "open", component: "search" },
  { id: "EX-110", title: "Webhook retry logic sends duplicate events", body: "Webhook system retries on timeout but doesn't deduplicate, causing double-processing.", status: "in-progress", component: "integrations" },
  { id: "EX-111", title: "CSV export broken in v2.4.1", body: "CSV export generates empty files after upgrading to v2.4.1. Was working in previous version.", status: "open", component: "reports" },
  { id: "EX-112", title: "Memory leak in long-running dashboard sessions", body: "Dashboard tab consumes increasing memory over time, eventually slowing browser.", status: "open", component: "frontend" },
  { id: "EX-113", title: "Two-factor auth codes expire too quickly", body: "2FA codes expire before users can enter them, 15-second window too short.", status: "open", component: "auth" },
  { id: "EX-114", title: "Timezone handling wrong for Australian users", body: "Dates display incorrectly for users in AEST timezone.", status: "open", component: "backend" },
  { id: "EX-115", title: "Image thumbnail generation fails for PNG", body: "Thumbnail generator crashes on PNG files with alpha channels.", status: "closed", component: "media" },
  { id: "EX-116", title: "Notification dropdown render error", body: "Notification dropdown occasionally throws TypeError when clicking bell icon. Undefined map error.", status: "open", component: "notifications" },
  { id: "EX-117", title: "GraphQL query N+1 on user list", body: "User list page triggers N+1 queries, loading slowly for large organizations.", status: "open", component: "backend" },
  { id: "EX-118", title: "File upload size limit not enforced client-side", body: "Client allows uploading files over the 10MB limit, server then rejects them.", status: "open", component: "frontend" },
  { id: "EX-119", title: "Stripe payment webhook timeout", body: "Stripe webhooks timing out on payment confirmation, orders stuck in pending. Timeout after 30 seconds.", status: "open", component: "payments" },
  { id: "EX-120", title: "Cursor jumps in rich text editor", body: "Cursor position resets to beginning when pasting text in the rich text editor.", status: "open", component: "frontend" },
];

// ═══════════════════════════════════════════════════════════════════════════════
// Data — 6 Engineers
// ═══════════════════════════════════════════════════════════════════════════════

const ENGINEERS: Engineer[] = [
  { name: "Priya", specialties: ["auth", "security", "backend"], workload: 3, pastAreas: ["auth", "login", "session", "2fa", "oauth", "profile", "permissions"] },
  { name: "Marcus", specialties: ["payments", "backend", "integrations"], workload: 5, pastAreas: ["payments", "stripe", "checkout", "orders", "webhooks", "billing"] },
  { name: "Lena", specialties: ["frontend", "media", "performance"], workload: 2, pastAreas: ["dashboard", "upload", "images", "thumbnails", "css", "responsive", "safari"] },
  { name: "Raj", specialties: ["backend", "infra", "database"], workload: 4, pastAreas: ["api", "database", "cache", "performance", "queries", "reports", "csv", "export"] },
  { name: "Sofia", specialties: ["frontend", "notifications", "search"], workload: 1, pastAreas: ["notifications", "bell", "search", "dropdown", "realtime", "websocket"] },
  { name: "Tom", specialties: ["security", "compliance", "backend"], workload: 3, pastAreas: ["security", "audit", "pii", "gdpr", "encryption", "access-control", "vulnerability"] },
];

// ═══════════════════════════════════════════════════════════════════════════════
// Data — Known Environment Issues
// ═══════════════════════════════════════════════════════════════════════════════

interface KnownIssue {
  pattern: string;
  versions: string[];
  description: string;
  workaround: string | null;
  affectedRange: string;
}

const KNOWN_ISSUES: KnownIssue[] = [
  { pattern: "v2.4.1.*auth|login.*v2.4.1", versions: ["v2.4.1"], description: "Auth regression introduced in v2.4.1 deploy", workaround: "Roll back to v2.4.0 or use API token auth", affectedRange: "v2.4.1" },
  { pattern: "safari.*16.*upload|upload.*safari.*16", versions: ["safari 16"], description: "Safari 16 memory issue with large file uploads", workaround: "Limit upload to 4MB or use Chrome", affectedRange: "Safari 16.x on iOS 17+" },
  { pattern: "v2.4.1.*csv|csv.*v2.4.1|export.*v2.4.1", versions: ["v2.4.1"], description: "CSV export regression in v2.4.1", workaround: "Use PDF export as alternative", affectedRange: "v2.4.1" },
  { pattern: "v2.4.0.*dashboard|dashboard.*v2.4.0", versions: ["v2.4.0"], description: "Analytics widget causes slow dashboard in v2.4.0+", workaround: "Disable analytics widget in admin settings", affectedRange: "v2.4.0+" },
  { pattern: "chrome.*120", versions: ["chrome 120"], description: "No known Chrome 120-specific issues", workaround: null, affectedRange: "n/a" },
  { pattern: "stripe.*timeout|payment.*timeout", versions: [], description: "Stripe webhook timeout — known intermittent issue with us-east-1", workaround: "Increase timeout to 60s, add retry logic", affectedRange: "All versions" },
];

// ═══════════════════════════════════════════════════════════════════════════════
// Agent 1 — Parser
// ═══════════════════════════════════════════════════════════════════════════════

function extractSystem(text: string): { os: string; browser: string; version: string } {
  const lower = text.toLowerCase();
  let os = "Unknown";
  let browser = "Unknown";
  let version = "Unknown";

  if (lower.includes("windows 11")) os = "Windows 11";
  else if (lower.includes("windows 10")) os = "Windows 10";
  else if (lower.includes("windows")) os = "Windows";
  else if (lower.includes("ios 17") || lower.includes("ios17")) os = "iOS 17";
  else if (lower.includes("ios")) os = "iOS";
  else if (lower.includes("macos") || lower.includes("mac os")) os = "macOS";
  else if (lower.includes("linux") || lower.includes("ubuntu")) os = "Linux";

  if (lower.includes("chrome 120")) { browser = "Chrome"; version = "120"; }
  else if (lower.includes("chrome")) { browser = "Chrome"; version = "Unknown"; }
  else if (lower.includes("safari 16")) { browser = "Safari"; version = "16"; }
  else if (lower.includes("safari")) { browser = "Safari"; version = "Unknown"; }
  else if (lower.includes("firefox")) { browser = "Firefox"; version = "Unknown"; }

  const versionMatch = text.match(/v(\d+\.\d+\.\d+)/);
  if (versionMatch && version === "Unknown") version = `v${versionMatch[1]}`;

  return { os, browser, version };
}

function extractSteps(text: string): string {
  const stepsPatterns = [
    /steps[:\s]*(.+?)(?=expected|actual|error|$)/is,
    /to reproduce[:\s]*(.+?)(?=expected|actual|error|$)/is,
    /steps to reproduce[:\s]*(.+?)(?=expected|actual|$)/is,
  ];
  for (const pat of stepsPatterns) {
    const match = text.match(pat);
    if (match) return match[1].trim().substring(0, 200);
  }
  if (text.includes("go to") || text.includes("click") || text.includes("navigate")) {
    const sentences = text.split(/[.!]/).filter(s => /go to|click|navigate|enter|open|type/i.test(s));
    if (sentences.length > 0) return sentences.map(s => s.trim()).join(". ").substring(0, 200);
  }
  return "Not provided";
}

function extractExpected(text: string): string {
  const match = text.match(/expected[:\s]*(.+?)(?=actual|but|error|$)/is);
  return match ? match[1].trim().substring(0, 150) : "Not provided";
}

function extractActual(text: string): string {
  const match = text.match(/actual[:\s]*(.+?)(?=expected|steps|error|$)/is);
  return match ? match[1].trim().substring(0, 150) : "Not provided";
}

function extractErrorCodes(text: string): string[] {
  const codes: string[] = [];
  const httpMatch = text.match(/\b(4\d{2}|5\d{2})\b/g);
  if (httpMatch) codes.push(...httpMatch.map(m => `HTTP ${m}`));
  const codeMatch = text.match(/(?:error\s*(?:code)?[:\s]*|code[:\s]*)([A-Z_]+\d*)/gi);
  if (codeMatch) codes.push(...codeMatch.map(m => m.replace(/error\s*(?:code)?[:\s]*/i, "").trim()));
  const typeErrorMatch = text.match(/(TypeError|ReferenceError|TimeoutError|SyntaxError)[:\s]*.{0,80}/g);
  if (typeErrorMatch) codes.push(...typeErrorMatch.map(m => m.substring(0, 80)));
  return [...new Set(codes)].slice(0, 5);
}

function guessSeverity(text: string): string {
  const lower = text.toLowerCase();
  if (lower.includes("security") || lower.includes("pii") || lower.includes("privacy") || lower.includes("leak")) return "critical";
  if (lower.includes("crash") || lower.includes("500") || lower.includes("data loss") || lower.includes("timeout")) return "high";
  if (lower.includes("broken") || lower.includes("fails") || lower.includes("error") || lower.includes("empty")) return "medium";
  if (lower.includes("slow") || lower.includes("performance") || lower.includes("delay")) return "medium";
  if (lower.includes("should") || lower.includes("feature") || lower.includes("enhancement")) return "low";
  if (lower.includes("intermittent") || lower.includes("occasionally") || lower.includes("sometimes")) return "medium";
  return "medium";
}

function scoreQuality(text: string): { score: number; reason: string } {
  let score = 0;
  const reasons: string[] = [];

  if (/steps|to reproduce/i.test(text)) { score += 2; reasons.push("steps to reproduce"); }
  if (/expected/i.test(text)) { score += 1; reasons.push("expected behavior"); }
  if (/actual/i.test(text)) { score += 1; reasons.push("actual behavior"); }
  if (/chrome|firefox|safari|edge/i.test(text)) { score += 1; reasons.push("browser info"); }
  if (/windows|ios|macos|linux/i.test(text)) { score += 1; reasons.push("OS info"); }
  if (/v\d+\.\d+/i.test(text)) { score += 1; reasons.push("version info"); }
  if (/error|exception|trace|stack/i.test(text)) { score += 1; reasons.push("error details"); }
  if (text.length > 200) { score += 1; reasons.push("detailed description"); }
  if (/\d+ (user|people|customer)/i.test(text)) { score += 1; reasons.push("impact scope"); }

  return {
    score: Math.min(10, Math.max(1, score)),
    reason: reasons.length > 0 ? reasons.join(", ") : "minimal information",
  };
}

function parseBug(bug: BugReport): ParsedBug {
  const fullText = `${bug.title} ${bug.body}`;
  const system = extractSystem(fullText);
  const { score, reason } = scoreQuality(fullText);

  return {
    id: bug.id,
    title: bug.title,
    body: bug.body,
    system,
    steps: extractSteps(fullText),
    expected: extractExpected(fullText),
    actual: extractActual(fullText),
    errorCodes: extractErrorCodes(fullText),
    severityGuess: guessSeverity(fullText),
    qualityScore: score,
    qualityReason: reason,
  };
}

function runParser(bugs: BugReport[]): ParsedBug[] {
  banner("AGENT 1 — PARSER");
  console.log(`${c.dim}  Extracting structured data from ${bugs.length} free-text bug reports${c.reset}`);

  const parsed = bugs.map(parseBug);

  for (const p of parsed) {
    section(`Bug #${p.id}: ${p.title}`);

    const qualityColor = p.qualityScore >= 7 ? c.green : p.qualityScore >= 4 ? c.yellow : c.red;
    console.log(`  ${c.dim}Quality:${c.reset} ${qualityColor}${bar(p.qualityScore, 10, 10)} ${p.qualityScore}/10${c.reset}  ${c.dim}(${p.qualityReason})${c.reset}`);
    console.log(`  ${c.dim}Severity guess:${c.reset} ${c.bold}${p.severityGuess}${c.reset}`);
    console.log(`  ${c.dim}System:${c.reset} ${p.system.os} / ${p.system.browser} ${p.system.version}`);
    console.log(`  ${c.dim}Steps:${c.reset} ${p.steps.substring(0, 80)}${p.steps.length > 80 ? "…" : ""}`);
    console.log(`  ${c.dim}Expected:${c.reset} ${p.expected.substring(0, 60)}${p.expected.length > 60 ? "…" : ""}`);
    console.log(`  ${c.dim}Actual:${c.reset} ${p.actual.substring(0, 60)}${p.actual.length > 60 ? "…" : ""}`);
    if (p.errorCodes.length > 0) {
      console.log(`  ${c.dim}Errors:${c.reset} ${c.red}${p.errorCodes.join(", ")}${c.reset}`);
    }
  }

  return parsed;
}

// ═══════════════════════════════════════════════════════════════════════════════
// Agent 2 — Duplicate Detector
// ═══════════════════════════════════════════════════════════════════════════════

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter(t => t.length > 2)
    .filter(t => !STOP_WORDS.has(t));
}

const STOP_WORDS = new Set([
  "the", "and", "for", "are", "but", "not", "you", "all", "can", "her",
  "was", "one", "our", "out", "has", "have", "had", "this", "that", "with",
  "they", "been", "from", "some", "than", "its", "also", "into", "just",
  "when", "which", "them", "then", "each", "any", "about", "would",
  "there", "their", "what", "other", "more", "after", "should", "does",
]);

function jaccardSimilarity(tokensA: string[], tokensB: string[]): number {
  const setA = new Set(tokensA);
  const setB = new Set(tokensB);
  const intersection = new Set([...setA].filter(x => setB.has(x)));
  const union = new Set([...setA, ...setB]);
  return union.size === 0 ? 0 : intersection.size / union.size;
}

function computeTfIdf(docs: string[][]): { vectors: Map<string, number>[]; vocabulary: Set<string> } {
  const N = docs.length;
  const df = new Map<string, number>();
  const vocabulary = new Set<string>();

  for (const doc of docs) {
    const unique = new Set(doc);
    for (const term of unique) {
      vocabulary.add(term);
      df.set(term, (df.get(term) ?? 0) + 1);
    }
  }

  const vectors: Map<string, number>[] = docs.map(doc => {
    const termCount = new Map<string, number>();
    for (const t of doc) termCount.set(t, (termCount.get(t) ?? 0) + 1);

    const vec = new Map<string, number>();
    const totalTerms = doc.length || 1;
    for (const [term, count] of termCount) {
      const tf = count / totalTerms;
      const idf = Math.log(N / (df.get(term) ?? 1));
      vec.set(term, tf * idf);
    }
    return vec;
  });

  return { vectors, vocabulary };
}

function cosineSimilarity(vecA: Map<string, number>, vecB: Map<string, number>): number {
  let dot = 0;
  let magA = 0;
  let magB = 0;

  for (const [term, valA] of vecA) {
    const valB = vecB.get(term) ?? 0;
    dot += valA * valB;
    magA += valA * valA;
  }
  for (const [, valB] of vecB) {
    magB += valB * valB;
  }

  // Add remaining terms from vecA that weren't iterated
  for (const [, valA] of vecA) {
    magA += 0; // already counted above
  }

  const magnitude = Math.sqrt(magA) * Math.sqrt(magB);
  return magnitude === 0 ? 0 : dot / magnitude;
}

function runDuplicateDetector(parsed: ParsedBug[]): DuplicateResult[] {
  banner("AGENT 2 — DUPLICATE DETECTOR");
  console.log(`${c.dim}  Comparing ${parsed.length} incoming bugs against ${EXISTING_BUGS.length} existing bugs${c.reset}`);
  console.log(`${c.dim}  Using Jaccard Similarity + Cosine Similarity on TF-IDF vectors${c.reset}`);

  const THRESHOLD = 0.4;

  // Tokenize all docs
  const incomingTokens = parsed.map(p => tokenize(`${p.title} ${p.body}`));
  const existingTokens = EXISTING_BUGS.map(e => tokenize(`${e.title} ${e.body}`));

  // Build TF-IDF across all documents
  const allDocs = [...incomingTokens, ...existingTokens];
  const { vectors } = computeTfIdf(allDocs);

  const results: DuplicateResult[] = [];

  for (let i = 0; i < parsed.length; i++) {
    const bug = parsed[i];
    const inTokens = incomingTokens[i];
    const inVec = vectors[i];
    const matches: DuplicateMatch[] = [];

    for (let j = 0; j < EXISTING_BUGS.length; j++) {
      const existing = EXISTING_BUGS[j];
      const exTokens = existingTokens[j];
      const exVec = vectors[parsed.length + j];

      const jaccard = jaccardSimilarity(inTokens, exTokens);
      const cosine = cosineSimilarity(inVec, exVec);
      const combined = jaccard * 0.4 + cosine * 0.6;

      if (combined > 0.15) {
        matches.push({
          existingId: existing.id,
          existingTitle: existing.title,
          jaccard,
          cosine,
          combined,
        });
      }
    }

    matches.sort((a, b) => b.combined - a.combined);
    const best = matches.length > 0 && matches[0].combined >= THRESHOLD ? matches[0] : null;

    results.push({
      bugId: bug.id,
      isDuplicate: best !== null,
      bestMatch: best,
      allMatches: matches.slice(0, 3),
    });

    // Display
    section(`Bug #${bug.id}: ${bug.title.substring(0, 50)}`);

    if (best) {
      console.log(`  ${c.red}${c.bold}⚠ DUPLICATE DETECTED${c.reset} → ${c.yellow}${best.existingId}${c.reset}: ${best.existingTitle}`);
      console.log(`    Jaccard:  ${pctBar(best.jaccard)}`);
      console.log(`    Cosine:   ${pctBar(best.cosine)}`);
      console.log(`    Combined: ${pctBar(best.combined)}`);

      // Show token overlap for Jaccard
      const inSet = new Set(inTokens);
      const exSet = new Set(tokenize(`${EXISTING_BUGS.find(e => e.id === best.existingId)!.title} ${EXISTING_BUGS.find(e => e.id === best.existingId)!.body}`));
      const overlap = [...inSet].filter(t => exSet.has(t));
      if (overlap.length > 0) {
        console.log(`    ${c.dim}Shared tokens: ${c.cyan}${overlap.slice(0, 10).join(", ")}${c.reset}`);
      }
    } else if (matches.length > 0) {
      console.log(`  ${c.green}No duplicate${c.reset} ${c.dim}(closest match: ${matches[0].existingId} at ${(matches[0].combined * 100).toFixed(0)}%)${c.reset}`);
    } else {
      console.log(`  ${c.green}No duplicate${c.reset} ${c.dim}(no significant matches)${c.reset}`);
    }
  }

  // Summary matrix
  const dupes = results.filter(r => r.isDuplicate);
  if (dupes.length > 0) {
    section("Duplicate Match Matrix");
    console.log(`  ${c.dim}${"Incoming".padEnd(12)} ${"Existing".padEnd(12)} ${"Jaccard".padEnd(10)} ${"Cosine".padEnd(10)} ${"Combined".padEnd(10)}${c.reset}`);
    for (const d of dupes) {
      if (d.bestMatch) {
        const m = d.bestMatch;
        console.log(`  ${c.yellow}Bug #${String(d.bugId).padEnd(6)}${c.reset} ${m.existingId.padEnd(12)} ${(m.jaccard * 100).toFixed(1).padStart(5)}%     ${(m.cosine * 100).toFixed(1).padStart(5)}%     ${(m.combined * 100).toFixed(1).padStart(5)}%`);
      }
    }
  }

  return results;
}

// ═══════════════════════════════════════════════════════════════════════════════
// Agent 3 — Environment Checker
// ═══════════════════════════════════════════════════════════════════════════════

function runEnvironmentChecker(parsed: ParsedBug[]): EnvCheckResult[] {
  banner("AGENT 3 — ENVIRONMENT CHECKER");
  console.log(`${c.dim}  Cross-referencing environment data against ${KNOWN_ISSUES.length} known issues${c.reset}`);

  const results: EnvCheckResult[] = [];

  for (const bug of parsed) {
    const fullText = `${bug.title} ${bug.body}`.toLowerCase();
    let matched: KnownIssue | null = null;

    for (const issue of KNOWN_ISSUES) {
      try {
        const regex = new RegExp(issue.pattern, "i");
        if (regex.test(fullText)) {
          // Skip the "no known issues" entry
          if (issue.workaround !== null || issue.description.includes("regression") || issue.description.includes("issue")) {
            matched = issue;
            break;
          }
        }
      } catch {
        // Invalid regex, skip
      }
    }

    const status: EnvCheckResult["status"] = matched
      ? (matched.workaround ? "CONFIRMED" : "UNCONFIRMED")
      : "NEW";

    results.push({
      bugId: bug.id,
      status,
      knownIssue: matched?.description ?? null,
      workaround: matched?.workaround ?? null,
      affectedVersions: matched?.affectedRange ?? "Unknown",
    });

    // Display
    const statusColor = status === "CONFIRMED" ? c.yellow : status === "NEW" ? c.cyan : c.magenta;
    const statusIcon = status === "CONFIRMED" ? "⚡" : status === "NEW" ? "🆕" : "❓";
    console.log(`  ${statusIcon} ${c.bold}Bug #${bug.id}${c.reset} ${statusColor}[${status}]${c.reset} ${bug.system.os}/${bug.system.browser} ${bug.system.version}`);
    if (matched) {
      console.log(`    ${c.dim}Known: ${matched.description}${c.reset}`);
      if (matched.workaround) console.log(`    ${c.dim}Workaround: ${matched.workaround}${c.reset}`);
      console.log(`    ${c.dim}Affected: ${matched.affectedRange}${c.reset}`);
    }
  }

  return results;
}

// ═══════════════════════════════════════════════════════════════════════════════
// Agent 4 — Priority Scorer
// ═══════════════════════════════════════════════════════════════════════════════

function scoreSeverity(bug: ParsedBug): number {
  const text = `${bug.title} ${bug.body}`.toLowerCase();
  if (text.includes("security") || text.includes("pii") || text.includes("privacy") || text.includes("leak")) return 9;
  if (text.includes("crash") || text.includes("data loss")) return 8;
  if (text.includes("500") || text.includes("timeout") || text.includes("empty files")) return 7;
  if (text.includes("broken") || text.includes("fails") || text.includes("error")) return 6;
  if (text.includes("slow") || text.includes("performance") || text.includes("45 seconds")) return 5;
  if (text.includes("intermittent") || text.includes("occasionally")) return 4;
  if (text.includes("should") || text.includes("feature")) return 2;
  return 5;
}

function scoreAffectedUsers(bug: ParsedBug): number {
  const text = `${bug.title} ${bug.body}`.toLowerCase();
  if (text.includes("all users") || text.includes("all paying") || text.includes("all customers")) return 9;
  if (text.includes("50 people") || text.includes("org")) return 7;
  if (text.match(/\b\d{3,}\b.*users|records/)) return 6;
  if (text.includes("field team") || text.includes("admin users")) return 5;
  if (text.includes("20 users")) return 4;
  if (text.includes("any authenticated")) return 7;
  return 3;
}

function scoreWorkaround(envResult: EnvCheckResult): number {
  if (envResult.workaround) return 4;
  return 8;
}

function scoreBusinessImpact(bug: ParsedBug): number {
  const text = `${bug.title} ${bug.body}`.toLowerCase();
  if (text.includes("revenue") || text.includes("$") || text.includes("losing")) return 10;
  if (text.includes("security") || text.includes("pii") || text.includes("privacy")) return 9;
  if (text.includes("login") || text.includes("auth")) return 8;
  if (text.includes("payment") || text.includes("checkout")) return 9;
  if (text.includes("export") || text.includes("report")) return 6;
  if (text.includes("performance") || text.includes("slow")) return 5;
  if (text.includes("feature") || text.includes("enhancement")) return 2;
  return 4;
}

function scoreReproducibility(bug: ParsedBug): number {
  const text = `${bug.title} ${bug.body}`.toLowerCase();
  if (text.includes("always") || text.includes("every time") || text.includes("reproducible")) return 10;
  if (text.includes("steps") || text.includes("go to")) return 8;
  if (text.includes("intermittent") || text.includes("occasionally") || text.includes("sometimes")) return 4;
  if (text.includes("1 in 10") || text.includes("maybe")) return 3;
  if (text.includes("rare")) return 2;
  return 6;
}

function runPriorityScorer(parsed: ParsedBug[], envResults: EnvCheckResult[]): PriorityResult[] {
  banner("AGENT 4 — PRIORITY SCORER");
  console.log(`${c.dim}  Scoring each bug on 5 dimensions with weighted composite${c.reset}`);
  console.log(`${c.dim}  Weights: severity=0.30, users=0.25, workaround=0.15, business=0.20, repro=0.10${c.reset}`);

  const results: PriorityResult[] = [];

  for (const bug of parsed) {
    const env = envResults.find(e => e.bugId === bug.id)!;
    const scores: PriorityScores = {
      severity: scoreSeverity(bug),
      affectedUsers: scoreAffectedUsers(bug),
      workaround: scoreWorkaround(env),
      businessImpact: scoreBusinessImpact(bug),
      reproducibility: scoreReproducibility(bug),
    };

    const finalScore =
      scores.severity * 0.30 +
      scores.affectedUsers * 0.25 +
      scores.workaround * 0.15 +
      scores.businessImpact * 0.20 +
      scores.reproducibility * 0.10;

    let label: string;
    if (finalScore >= 8) label = "P0";
    else if (finalScore >= 6.5) label = "P1";
    else if (finalScore >= 5) label = "P2";
    else if (finalScore >= 3.5) label = "P3";
    else label = "P4";

    results.push({ bugId: bug.id, scores, finalScore, label });

    // Display — radar-chart-like visualization
    section(`Bug #${bug.id}: ${bug.title.substring(0, 45)}`);
    const labelColor = label === "P0" ? c.red : label === "P1" ? c.orange : label === "P2" ? c.yellow : label === "P3" ? c.green : c.dim;

    console.log(`  ${labelColor}${c.bold}${label}${c.reset} — Final Score: ${c.bold}${finalScore.toFixed(2)}${c.reset}/10`);
    console.log(`  ┌──────────────────────────────────────────────┐`);
    console.log(`  │ Severity     ${bar(scores.severity, 10, 15)} ${String(scores.severity).padStart(2)}/10 ×0.30 │`);
    console.log(`  │ Users        ${bar(scores.affectedUsers, 10, 15)} ${String(scores.affectedUsers).padStart(2)}/10 ×0.25 │`);
    console.log(`  │ Workaround   ${bar(scores.workaround, 10, 15)} ${String(scores.workaround).padStart(2)}/10 ×0.15 │`);
    console.log(`  │ Business     ${bar(scores.businessImpact, 10, 15)} ${String(scores.businessImpact).padStart(2)}/10 ×0.20 │`);
    console.log(`  │ Reproducible ${bar(scores.reproducibility, 10, 15)} ${String(scores.reproducibility).padStart(2)}/10 ×0.10 │`);
    console.log(`  └──────────────────────────────────────────────┘`);
    console.log(`  ${c.dim}= ${scores.severity}×0.30 + ${scores.affectedUsers}×0.25 + ${scores.workaround}×0.15 + ${scores.businessImpact}×0.20 + ${scores.reproducibility}×0.10 = ${finalScore.toFixed(2)}${c.reset}`);
  }

  return results;
}

// ═══════════════════════════════════════════════════════════════════════════════
// Agent 5 — Assignee Recommender
// ═══════════════════════════════════════════════════════════════════════════════

function inferComponent(bug: ParsedBug): string[] {
  const text = `${bug.title} ${bug.body}`.toLowerCase();
  const components: string[] = [];

  if (text.includes("login") || text.includes("auth") || text.includes("sign in") || text.includes("session")) components.push("auth");
  if (text.includes("payment") || text.includes("checkout") || text.includes("stripe") || text.includes("billing")) components.push("payments");
  if (text.includes("upload") || text.includes("image") || text.includes("safari") || text.includes("css") || text.includes("dashboard")) components.push("frontend");
  if (text.includes("api") || text.includes("server") || text.includes("database") || text.includes("timeout")) components.push("backend");
  if (text.includes("security") || text.includes("pii") || text.includes("privacy") || text.includes("leak") || text.includes("email")) components.push("security");
  if (text.includes("notification") || text.includes("bell")) components.push("notifications");
  if (text.includes("search") || text.includes("fuzzy")) components.push("search");
  if (text.includes("export") || text.includes("csv") || text.includes("report")) components.push("reports");
  if (text.includes("performance") || text.includes("slow") || text.includes("load")) components.push("performance");

  return components.length > 0 ? components : ["general"];
}

function scoreSpecialty(engineer: Engineer, components: string[]): number {
  let matchCount = 0;
  for (const comp of components) {
    if (engineer.specialties.includes(comp)) matchCount++;
    // Partial matches for related areas
    if (comp === "reports" && engineer.specialties.includes("backend")) matchCount += 0.5;
    if (comp === "performance" && engineer.specialties.includes("frontend")) matchCount += 0.5;
    if (comp === "performance" && engineer.specialties.includes("backend")) matchCount += 0.5;
  }
  return Math.min(10, (matchCount / Math.max(1, components.length)) * 10);
}

function scoreWorkload(engineer: Engineer): number {
  // Lower workload = higher score
  return Math.max(1, 10 - engineer.workload * 1.5);
}

function scoreExperience(engineer: Engineer, components: string[], bugText: string): number {
  const keywords = bugText.toLowerCase().split(/\s+/).filter(w => w.length > 3);
  let matchCount = 0;

  for (const area of engineer.pastAreas) {
    if (components.includes(area)) matchCount += 2;
    if (keywords.some(k => k.includes(area) || area.includes(k))) matchCount += 1;
  }

  return Math.min(10, matchCount);
}

function runAssigneeRecommender(parsed: ParsedBug[], priorityResults: PriorityResult[]): AssignmentResult[] {
  banner("AGENT 5 — ASSIGNEE RECOMMENDER");
  console.log(`${c.dim}  Matching ${parsed.length} bugs to ${ENGINEERS.length} engineers${c.reset}`);
  console.log(`${c.dim}  Weights: specialty=40%, workload=25%, experience=35%${c.reset}`);

  // Copy workloads so we can update as we assign
  const workloads = new Map(ENGINEERS.map(e => [e.name, e.workload]));
  const results: AssignmentResult[] = [];

  // Sort by priority to assign highest priority first
  const sortedBugs = [...parsed].sort((a, b) => {
    const pa = priorityResults.find(p => p.bugId === a.id)!.finalScore;
    const pb = priorityResults.find(p => p.bugId === b.id)!.finalScore;
    return pb - pa;
  });

  for (const bug of sortedBugs) {
    const components = inferComponent(bug);
    const bugText = `${bug.title} ${bug.body}`;
    const allScores: { name: string; specialty: number; workload: number; experience: number; total: number }[] = [];

    for (const eng of ENGINEERS) {
      const currentWorkload = workloads.get(eng.name)!;
      const engWithLoad = { ...eng, workload: currentWorkload };

      const specialty = scoreSpecialty(engWithLoad, components);
      const workload = scoreWorkload(engWithLoad);
      const experience = scoreExperience(engWithLoad, components, bugText);
      const total = specialty * 0.40 + workload * 0.25 + experience * 0.35;

      allScores.push({ name: eng.name, specialty, workload, experience, total });
    }

    allScores.sort((a, b) => b.total - a.total);
    const winner = allScores[0];

    // Update workload
    workloads.set(winner.name, (workloads.get(winner.name)!) + 1);

    results.push({
      bugId: bug.id,
      engineer: winner.name,
      specialtyScore: winner.specialty,
      workloadScore: winner.workload,
      experienceScore: winner.experience,
      totalScore: winner.total,
      allScores: allScores.map(s => ({ name: s.name, total: s.total })),
    });

    // Display
    section(`Bug #${bug.id}: ${bug.title.substring(0, 40)} → ${c.green}${winner.name}${c.reset}`);
    console.log(`  ${c.dim}Components: ${c.cyan}${components.join(", ")}${c.reset}`);
    console.log(`  ${"Engineer".padEnd(10)} ${"Specialty".padEnd(12)} ${"Workload".padEnd(12)} ${"Experience".padEnd(12)} ${"Total".padEnd(8)}`);
    for (const s of allScores) {
      const isWinner = s.name === winner.name;
      const prefix = isWinner ? `${c.green}${c.bold}` : c.dim;
      const suffix = isWinner ? ` ← ✓${c.reset}` : c.reset;
      console.log(`  ${prefix}${s.name.padEnd(10)} ${s.specialty.toFixed(1).padStart(5)}       ${s.workload.toFixed(1).padStart(5)}       ${s.experience.toFixed(1).padStart(5)}       ${s.total.toFixed(2).padStart(6)}${suffix}`);
    }
  }

  // Show final workload distribution
  section("Engineer Workload After Assignment");
  for (const eng of ENGINEERS) {
    const newLoad = workloads.get(eng.name)!;
    const added = newLoad - eng.workload;
    console.log(`  ${eng.name.padEnd(10)} ${bar(newLoad, 10, 20)} ${newLoad} bugs ${c.dim}(+${added} new)${c.reset}`);
  }

  return results;
}

// ═══════════════════════════════════════════════════════════════════════════════
// Final Output — Triage Queue
// ═══════════════════════════════════════════════════════════════════════════════

function displayTriageQueue(
  parsed: ParsedBug[],
  dupeResults: DuplicateResult[],
  envResults: EnvCheckResult[],
  priorityResults: PriorityResult[],
  assignResults: AssignmentResult[],
) {
  banner("FINAL TRIAGE QUEUE");

  // Sort by priority score descending
  const sorted = [...priorityResults].sort((a, b) => b.finalScore - a.finalScore);

  console.log();
  console.log(`  ${c.bold}${"#".padEnd(4)} ${"Bug".padEnd(45)} ${"Pri".padEnd(6)} ${"Score".padEnd(7)} ${"Dup?".padEnd(12)} ${"Env".padEnd(14)} ${"Assigned".padEnd(10)}${c.reset}`);
  console.log(`  ${c.dim}${"─".repeat(98)}${c.reset}`);

  for (const pri of sorted) {
    const bug = parsed.find(p => p.id === pri.bugId)!;
    const dupe = dupeResults.find(d => d.bugId === pri.bugId)!;
    const env = envResults.find(e => e.bugId === pri.bugId)!;
    const assign = assignResults.find(a => a.bugId === pri.bugId)!;

    const labelColor = pri.label === "P0" ? `${c.bgRed}${c.white}${c.bold}`
      : pri.label === "P1" ? `${c.orange}${c.bold}`
      : pri.label === "P2" ? `${c.yellow}`
      : pri.label === "P3" ? `${c.green}`
      : c.dim;

    const dupeStr = dupe.isDuplicate
      ? `${c.red}DUP→${dupe.bestMatch!.existingId}${c.reset}`
      : `${c.green}New${c.reset}`;

    const envColor = env.status === "CONFIRMED" ? c.yellow : env.status === "NEW" ? c.cyan : c.magenta;
    const envStr = `${envColor}${env.status}${c.reset}`;

    const title = bug.title.length > 42 ? bug.title.substring(0, 39) + "…" : bug.title;

    console.log(`  ${String(bug.id).padEnd(4)} ${title.padEnd(45)} ${labelColor}${pri.label.padEnd(4)}${c.reset}  ${pri.finalScore.toFixed(2).padStart(5)}   ${dupeStr.padEnd(22)} ${envStr.padEnd(24)} ${c.bold}${assign.engineer}${c.reset}`);
  }

  // Summary stats
  const dupeCount = dupeResults.filter(d => d.isDuplicate).length;
  const confirmedCount = envResults.filter(e => e.status === "CONFIRMED").length;
  const newCount = envResults.filter(e => e.status === "NEW").length;
  const p0Count = priorityResults.filter(p => p.label === "P0").length;
  const p1Count = priorityResults.filter(p => p.label === "P1").length;

  console.log();
  section("Summary");
  console.log(`  ${c.bold}Total bugs:${c.reset}       ${parsed.length}`);
  console.log(`  ${c.bold}Duplicates:${c.reset}       ${c.red}${dupeCount}${c.reset} ${c.dim}(auto-linked to existing)${c.reset}`);
  console.log(`  ${c.bold}New bugs:${c.reset}         ${c.cyan}${parsed.length - dupeCount}${c.reset}`);
  console.log(`  ${c.bold}Env confirmed:${c.reset}    ${c.yellow}${confirmedCount}${c.reset} ${c.dim}(matched known issues)${c.reset}`);
  console.log(`  ${c.bold}Env new:${c.reset}          ${c.cyan}${newCount}${c.reset}`);
  console.log(`  ${c.bold}Critical (P0):${c.reset}    ${c.red}${p0Count}${c.reset}`);
  console.log(`  ${c.bold}High (P1):${c.reset}        ${c.orange}${p1Count}${c.reset}`);

  const avgTime = 12; // minutes per manual triage
  const autoTime = 0.5; // minutes per auto-triage
  console.log();
  console.log(`  ${c.bold}Manual triage estimate:${c.reset}  ${parsed.length} × ${avgTime}min = ${c.red}${parsed.length * avgTime} min${c.reset}`);
  console.log(`  ${c.bold}Automated triage:${c.reset}        ${parsed.length} × ${autoTime}min = ${c.green}${parsed.length * autoTime} min${c.reset}`);
  console.log(`  ${c.bold}Time saved:${c.reset}              ${c.green}${c.bold}${((1 - autoTime / avgTime) * 100).toFixed(0)}%${c.reset} ${c.dim}(${(parsed.length * avgTime - parsed.length * autoTime).toFixed(0)} minutes)${c.reset}`);

  console.log(`\n${c.bold}${c.cyan}${"═".repeat(78)}${c.reset}`);
  console.log(`${c.bold}${c.cyan}  Bug Triage Complete — ${parsed.length} reports processed by 5 agents${c.reset}`);
  console.log(`${c.bold}${c.cyan}${"═".repeat(78)}${c.reset}\n`);
}

// ═══════════════════════════════════════════════════════════════════════════════
// Main
// ═══════════════════════════════════════════════════════════════════════════════

const parsed = runParser(INCOMING_BUGS);
const dupeResults = runDuplicateDetector(parsed);
const envResults = runEnvironmentChecker(parsed);
const priorityResults = runPriorityScorer(parsed, envResults);
const assignResults = runAssigneeRecommender(parsed, priorityResults);
displayTriageQueue(parsed, dupeResults, envResults, priorityResults, assignResults);
