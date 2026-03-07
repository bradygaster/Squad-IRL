// ─── Support Ticket Router — Squad Multi-Agent Pipeline ───────────────────────
// Five agents collaborate to triage 12 incoming support tickets.
// Pure TypeScript, zero runtime deps, deterministic algorithms.

// ═══════════════════════════════════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════════════════════════════════

type Priority = "P1" | "P2" | "P3" | "P4";
type Category = "Billing" | "Technical" | "Account" | "Feature Request";

interface Ticket {
  id: string;
  subject: string;
  body: string;
  sender: string;
}

interface ClassificationResult {
  ticketId: string;
  priority: Priority;
  priorityConfidence: number;
  category: Category;
  categoryConfidence: number;
  reasoning: string;
}

interface KnownIssue {
  id: string;
  title: string;
  description: string;
  status: string;
}

interface DuplicateMatch {
  ticketId: string;
  knownIssueId: string;
  similarity: number;
  isDuplicate: boolean;
}

interface KBArticle {
  id: string;
  title: string;
  content: string;
  category: Category;
}

interface KBMatch {
  ticketId: string;
  articleId: string;
  articleTitle: string;
  relevanceScore: number;
}

interface DraftResponse {
  ticketId: string;
  responseText: string;
  escalated: boolean;
  kbReferences: string[];
}

interface QualityScore {
  ticketId: string;
  tone: number;
  accuracy: number;
  completeness: number;
  total: number;
  flaggedForReview: boolean;
}

// ═══════════════════════════════════════════════════════════════════════════════
// Data
// ═══════════════════════════════════════════════════════════════════════════════

const TICKETS: Ticket[] = [
  { id: "TK-001", subject: "I was charged twice for my subscription this month", body: "I checked my bank statement and see two identical charges of $49.99 from your company dated March 3rd. Please refund the duplicate charge immediately.", sender: "alice@example.com" },
  { id: "TK-002", subject: "URGENT: Production API returning 500 errors for all users", body: "Our entire production environment is down. Every API call returns HTTP 500 since 3:42 AM UTC. This is affecting all of our 50,000 end users. We need immediate resolution.", sender: "devops@bigcorp.io" },
  { id: "TK-003", subject: "How do I change my password?", body: "I'd like to update my password but I can't find where to do it in the settings. Can you point me in the right direction?", sender: "newuser@gmail.com" },
  { id: "TK-004", subject: "Feature request: dark mode for the dashboard", body: "Would love to see a dark mode option for the analytics dashboard. Working late at night and the bright white screen is hard on the eyes.", sender: "designer@startup.co" },
  { id: "TK-005", subject: "My account was locked after too many login attempts", body: "I forgot my password and tried too many times. Now my account is completely locked out. I have an important deadline today and need access ASAP.", sender: "manager@enterprise.com" },
  { id: "TK-006", subject: "The export to CSV function is broken since last update", body: "After the v2.4 update, clicking 'Export to CSV' on any report gives a blank file. This was working fine before the update. We rely on this for weekly reporting.", sender: "analyst@data.org" },
  { id: "TK-007", subject: "I need a refund for the annual plan I just purchased", body: "I accidentally purchased the annual plan instead of monthly. I'd like a full refund so I can switch to the correct plan. The purchase was made 2 hours ago.", sender: "freelancer@work.me" },
  { id: "TK-008", subject: "Can you add Slack integration?", body: "It would be great if your platform could send notifications to our Slack channels. We use Slack for everything and this would really improve our workflow.", sender: "pm@techteam.dev" },
  { id: "TK-009", subject: "CRITICAL: Data breach - I see another user's data in my account", body: "When I log in, I can see dashboard data that clearly belongs to another company. This is a serious security and privacy violation. I have screenshots.", sender: "ciso@securecorp.com" },
  { id: "TK-010", subject: "Invoice doesn't match the agreed enterprise pricing", body: "Our enterprise contract states $12/user/month but the latest invoice shows $15/user/month for 200 users. That's a $600 overcharge. Please correct this.", sender: "finance@bigcorp.io" },
  { id: "TK-011", subject: "App crashes when uploading files larger than 10MB", body: "Every time I try to upload a file over 10MB the application crashes with no error message. Smaller files work fine. I've tried on Chrome and Firefox.", sender: "user@company.net" },
  { id: "TK-012", subject: "How do I add team members to my organization?", body: "I just created an organization account and need to invite my team of 5 people. Where do I find the invite or team management settings?", sender: "lead@newteam.io" },
];

const KNOWN_ISSUES: KnownIssue[] = [
  { id: "KI-101", title: "Export to CSV broken since v2.4 update", description: "The export to CSV function produces blank files after the v2.4 update. Clicking export on any report gives an empty CSV. Broken for all report types.", status: "In Progress" },
  { id: "KI-102", title: "Charged twice for subscription after plan upgrade", description: "Users are being charged twice for their subscription this month. Double charge appears on bank statement when upgrading from monthly to annual plan.", status: "Investigating" },
  { id: "KI-103", title: "App crashes uploading files larger than 8MB", description: "The application crashes when uploading files larger than 8MB with no error message. File upload fails on Chrome and Firefox for large files.", status: "Confirmed" },
  { id: "KI-104", title: "Production API returning 500 errors", description: "The production API is returning 500 errors for users under high load. All API calls failing with HTTP 500. Affects production environment.", status: "Critical" },
  { id: "KI-105", title: "Account locked after too many login attempts", description: "Accounts are locked after too many failed login attempts. The lockout threshold is too aggressive at 3 attempts instead of 5. Users cannot access their account.", status: "Scheduled" },
  { id: "KI-106", title: "Data breach: users seeing another user's data", description: "Users can see another user's data in their dashboard account. Cross-tenant data leakage in the dashboard. Serious security and privacy breach.", status: "Critical" },
  { id: "KI-107", title: "Invoice pricing doesn't match enterprise contract", description: "Enterprise invoice doesn't match the agreed pricing. Invoice shows incorrect per-user rate instead of contracted enterprise pricing.", status: "Investigating" },
];

const KB_ARTICLES: KBArticle[] = [
  { id: "KB-001", title: "How to reset your password", content: "Navigate to Settings > Security > Change Password. Enter your current password, then your new password twice. If you forgot your password, click 'Forgot Password' on the login screen to receive a reset email.", category: "Account" },
  { id: "KB-002", title: "Understanding your billing statement", content: "Your billing statement shows all charges for the current cycle. Subscription charges appear at the start of each period. Prorated charges appear when you upgrade or downgrade mid-cycle. Contact billing support for discrepancies.", category: "Billing" },
  { id: "KB-003", title: "Requesting a refund", content: "Refunds can be requested within 14 days of purchase. Go to Billing > Transaction History, find the charge, and click 'Request Refund'. Annual plan refunds are prorated after 48 hours.", category: "Billing" },
  { id: "KB-004", title: "Exporting data to CSV", content: "To export reports to CSV, open the report and click the Export button in the top-right corner. Select CSV format. Note: exports are limited to 10,000 rows. For larger datasets, use the API export endpoint.", category: "Technical" },
  { id: "KB-005", title: "Managing your organization and team members", content: "Go to Organization Settings > Members to invite new team members. Enter their email addresses and assign roles (Admin, Member, Viewer). Invitees will receive an email with a join link. You can manage up to 500 members.", category: "Account" },
  { id: "KB-006", title: "Troubleshooting API errors", content: "Common API errors: 400 = bad request (check payload), 401 = unauthorized (refresh token), 403 = forbidden (check permissions), 429 = rate limited (slow down), 500 = server error (contact support with request ID).", category: "Technical" },
  { id: "KB-007", title: "File upload requirements and limits", content: "Supported file types: PDF, PNG, JPG, CSV, XLSX. Maximum file size is 25MB. If uploads fail, check your network connection, try a smaller file, or clear your browser cache. Large files may take several minutes.", category: "Technical" },
  { id: "KB-008", title: "Account lockout and recovery", content: "Accounts are locked after multiple failed login attempts for security. Wait 30 minutes or click 'Unlock Account' in the email sent to your registered address. Contact support if you cannot access your email.", category: "Account" },
  { id: "KB-009", title: "Submitting feature requests", content: "We love hearing your ideas! Submit feature requests through Help > Feature Request or email features@ourproduct.com. Popular requests are reviewed monthly by our product team and added to the public roadmap.", category: "Feature Request" },
  { id: "KB-010", title: "Enterprise billing and custom pricing", content: "Enterprise customers receive custom pricing based on their contract. If your invoice doesn't match your agreement, contact your account manager or billing@ourproduct.com with your contract ID for immediate correction.", category: "Billing" },
  { id: "KB-011", title: "Reporting security vulnerabilities", content: "If you discover a security issue, email security@ourproduct.com immediately. Include screenshots and steps to reproduce. Our security team responds within 1 hour for critical reports. Do not share details publicly.", category: "Technical" },
  { id: "KB-012", title: "Dark mode and accessibility settings", content: "Dark mode is currently available in the mobile app under Settings > Appearance. Desktop dark mode is on our roadmap for Q3. In the meantime, you can use browser extensions like Dark Reader for a similar effect.", category: "Feature Request" },
];

// ═══════════════════════════════════════════════════════════════════════════════
// Utility helpers
// ═══════════════════════════════════════════════════════════════════════════════

const STOP_WORDS = new Set([
  "i", "me", "my", "we", "our", "you", "your", "it", "its", "the", "a", "an",
  "is", "are", "was", "were", "be", "been", "being", "have", "has", "had",
  "do", "does", "did", "will", "would", "could", "should", "may", "might",
  "shall", "can", "to", "of", "in", "for", "on", "with", "at", "by", "from",
  "as", "into", "through", "during", "before", "after", "above", "below",
  "between", "out", "off", "over", "under", "again", "further", "then",
  "once", "here", "there", "when", "where", "why", "how", "all", "each",
  "every", "both", "few", "more", "most", "other", "some", "such", "no",
  "nor", "not", "only", "own", "same", "so", "than", "too", "very", "just",
  "don", "t", "s", "and", "but", "or", "if", "this", "that", "these",
  "those", "am", "what", "which", "who", "whom", "up", "about", "also",
]);

function tokenize(text: string): string[] {
  return text.toLowerCase().replace(/[^a-z0-9\s]/g, " ").split(/\s+/).filter(w => w.length > 1);
}

function significantTokens(text: string): string[] {
  return tokenize(text).filter(w => !STOP_WORDS.has(w));
}

function jaccardSimilarity(a: string[], b: string[]): number {
  const setA = new Set(a);
  const setB = new Set(b);
  let intersection = 0;
  for (const w of setA) if (setB.has(w)) intersection++;
  const union = new Set([...setA, ...setB]).size;
  return union === 0 ? 0 : intersection / union;
}

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// ANSI helpers
const C = {
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
  gray: "\x1b[90m",
  bgRed: "\x1b[41m",
  bgGreen: "\x1b[42m",
  bgYellow: "\x1b[43m",
  bgBlue: "\x1b[44m",
  bgMagenta: "\x1b[45m",
};

function priorityColor(p: Priority): string {
  switch (p) {
    case "P1": return C.red;
    case "P2": return C.yellow;
    case "P3": return C.cyan;
    case "P4": return C.gray;
  }
}

function bar(value: number, max: number, width: number = 20): string {
  const clamped = Math.max(0, Math.min(value, max));
  const filled = Math.round((clamped / max) * width);
  const empty = width - filled;
  const ratio = clamped / max;
  const color = ratio >= 0.7 ? C.green : ratio >= 0.5 ? C.yellow : C.red;
  return `${color}[${"█".repeat(filled)}${"░".repeat(empty)}]${C.reset} ${value}/${max}`;
}

function header(emoji: string, title: string, subtitle: string): void {
  const line = "═".repeat(72);
  console.log();
  console.log(`${C.bold}${C.blue}╔${line}╗${C.reset}`);
  console.log(`${C.bold}${C.blue}║${C.reset}  ${emoji}  ${C.bold}${title}${C.reset}`);
  console.log(`${C.bold}${C.blue}║${C.reset}  ${C.dim}${subtitle}${C.reset}`);
  console.log(`${C.bold}${C.blue}╚${line}╝${C.reset}`);
  console.log();
}

function subHeader(text: string): void {
  console.log(`  ${C.bold}${C.magenta}── ${text} ──${C.reset}`);
}

function padRight(s: string, len: number): string {
  // Strip ANSI for length calculation
  const visible = s.replace(/\x1b\[[0-9;]*m/g, "");
  return s + " ".repeat(Math.max(0, len - visible.length));
}

// ═══════════════════════════════════════════════════════════════════════════════
// Agent 1: Classifier
// ═══════════════════════════════════════════════════════════════════════════════

const CATEGORY_KEYWORDS: Record<Category, string[]> = {
  Billing: ["charged", "charge", "billing", "invoice", "refund", "payment", "subscription", "pricing", "price", "plan", "purchase", "overcharge", "cost", "fee", "money", "bank", "credit", "dollar", "annual", "monthly"],
  Technical: ["api", "error", "errors", "crash", "crashes", "bug", "broken", "update", "upload", "export", "import", "server", "500", "404", "timeout", "performance", "file", "data", "function", "code", "production", "endpoint"],
  Account: ["password", "login", "account", "locked", "access", "settings", "profile", "team", "members", "organization", "invite", "signup", "register", "email", "security", "authentication", "locked"],
  "Feature Request": ["feature", "request", "dark mode", "integration", "add", "would", "love", "idea", "suggestion", "roadmap", "improvement", "wish", "slack", "mode"],
};

const PRIORITY_SIGNALS: { pattern: RegExp; priority: Priority; weight: number }[] = [
  { pattern: /\bcritical\b/i, priority: "P1", weight: 5 },
  { pattern: /\burgent\b/i, priority: "P1", weight: 4 },
  { pattern: /\bbreach\b/i, priority: "P1", weight: 5 },
  { pattern: /\bsecurity\b/i, priority: "P1", weight: 3 },
  { pattern: /\bproduction\b/i, priority: "P1", weight: 3 },
  { pattern: /\ball users\b/i, priority: "P1", weight: 3 },
  { pattern: /\bdown\b/i, priority: "P1", weight: 2 },
  { pattern: /\bbroken\b/i, priority: "P2", weight: 3 },
  { pattern: /\bcrash(es|ing)?\b/i, priority: "P2", weight: 3 },
  { pattern: /\berror(s)?\b/i, priority: "P2", weight: 2 },
  { pattern: /\brefund\b/i, priority: "P2", weight: 2 },
  { pattern: /\blocked\b/i, priority: "P2", weight: 2 },
  { pattern: /\bovercharge\b/i, priority: "P2", weight: 2 },
  { pattern: /\bcharged twice\b/i, priority: "P2", weight: 3 },
  { pattern: /\bhow do i\b/i, priority: "P3", weight: 3 },
  { pattern: /\bwhere (do|can)\b/i, priority: "P3", weight: 2 },
  { pattern: /\bcan you\b/i, priority: "P3", weight: 1 },
  { pattern: /\bfeature request\b/i, priority: "P4", weight: 4 },
  { pattern: /\bwould (love|be great|like)\b/i, priority: "P4", weight: 3 },
  { pattern: /\bsuggestion\b/i, priority: "P4", weight: 2 },
  { pattern: /\broadmap\b/i, priority: "P4", weight: 2 },
];

function classifyTicket(ticket: Ticket): ClassificationResult {
  const text = `${ticket.subject} ${ticket.body}`.toLowerCase();
  const words = tokenize(text);

  // Category scoring
  const catScores: Record<Category, number> = { Billing: 0, Technical: 0, Account: 0, "Feature Request": 0 };
  for (const [cat, keywords] of Object.entries(CATEGORY_KEYWORDS) as [Category, string[]][]) {
    for (const kw of keywords) {
      const count = words.filter(w => w === kw || text.includes(kw)).length;
      if (count > 0) catScores[cat] += count;
    }
  }
  const totalCatScore = Object.values(catScores).reduce((a, b) => a + b, 0);
  const bestCat = (Object.entries(catScores).sort((a, b) => b[1] - a[1])[0][0]) as Category;
  const categoryConfidence = totalCatScore > 0 ? Math.min(0.98, (catScores[bestCat] / totalCatScore) * 0.95 + 0.15) : 0.5;

  // Priority scoring
  const priScores: Record<Priority, number> = { P1: 0, P2: 0, P3: 0, P4: 0 };
  const matchedSignals: string[] = [];
  for (const sig of PRIORITY_SIGNALS) {
    if (sig.pattern.test(text)) {
      priScores[sig.priority] += sig.weight;
      matchedSignals.push(sig.pattern.source.replace(/\\b/g, "").replace(/\(.*?\)/g, ""));
    }
  }
  const totalPriScore = Object.values(priScores).reduce((a, b) => a + b, 0);
  let bestPri: Priority = "P3"; // default
  if (totalPriScore > 0) {
    bestPri = (Object.entries(priScores).sort((a, b) => b[1] - a[1])[0][0]) as Priority;
  }
  const priorityConfidence = totalPriScore > 0
    ? Math.min(0.97, (priScores[bestPri] / totalPriScore) * 0.85 + 0.2)
    : 0.45;

  const topSignals = matchedSignals.slice(0, 3).join(", ") || "general inquiry pattern";
  const reasoning = `Matched keywords: ${topSignals} → ${bestCat} (${(categoryConfidence * 100).toFixed(0)}%), ${bestPri} (${(priorityConfidence * 100).toFixed(0)}%)`;

  return {
    ticketId: ticket.id,
    priority: bestPri,
    priorityConfidence,
    category: bestCat,
    categoryConfidence,
    reasoning,
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// Agent 2: Duplicate Detector (Jaccard Similarity)
// ═══════════════════════════════════════════════════════════════════════════════

function detectDuplicates(ticket: Ticket): DuplicateMatch[] {
  // Use subject + key body terms for matching; subject tokens are weighted by
  // appearing in the set already, so we build a combined significant-word set.
  const subjectTokens = significantTokens(ticket.subject);
  const bodyTokens = significantTokens(ticket.body);
  // Merge into one set — Jaccard uses sets, so duplicates collapse.
  const ticketTokens = [...subjectTokens, ...bodyTokens];

  return KNOWN_ISSUES.map(ki => {
    const kiTokens = significantTokens(`${ki.title} ${ki.description}`);
    // Primary: Jaccard on full text
    const fullSim = jaccardSimilarity(ticketTokens, kiTokens);
    // Boost: Jaccard on subject vs title only (high-signal, short text)
    const titleSim = jaccardSimilarity(subjectTokens, significantTokens(ki.title));
    // Weighted blend — title match is a strong duplicate signal
    const similarity = fullSim * 0.5 + titleSim * 0.5;
    return {
      ticketId: ticket.id,
      knownIssueId: ki.id,
      similarity: Math.round(similarity * 1000) / 1000,
      isDuplicate: similarity >= 0.25,
    };
  });
}

// ═══════════════════════════════════════════════════════════════════════════════
// Agent 3: Knowledge Base Searcher (TF-IDF–like scoring)
// ═══════════════════════════════════════════════════════════════════════════════

function computeIDF(): Map<string, number> {
  const docCount = KB_ARTICLES.length;
  const wordDocCount = new Map<string, number>();
  for (const art of KB_ARTICLES) {
    const words = new Set(significantTokens(`${art.title} ${art.content}`));
    for (const w of words) {
      wordDocCount.set(w, (wordDocCount.get(w) || 0) + 1);
    }
  }
  const idf = new Map<string, number>();
  for (const [word, count] of wordDocCount) {
    idf.set(word, Math.log((docCount + 1) / (count + 1)) + 1);
  }
  return idf;
}

function searchKB(ticket: Ticket, idf: Map<string, number>): KBMatch[] {
  const queryTokens = significantTokens(`${ticket.subject} ${ticket.body}`);
  const scores: KBMatch[] = [];

  // Compute max possible score for normalization
  let maxPossible = 0;
  for (const qt of queryTokens) {
    maxPossible += idf.get(qt) || 1;
  }

  for (const art of KB_ARTICLES) {
    const artTokens = new Set(significantTokens(`${art.title} ${art.content}`));
    let score = 0;
    for (const qt of queryTokens) {
      if (artTokens.has(qt)) {
        score += idf.get(qt) || 1;
      }
    }
    // Normalize to 0-1 range using max possible score
    const normalized = maxPossible > 0 ? score / maxPossible : 0;
    if (normalized > 0.03) {
      scores.push({
        ticketId: ticket.id,
        articleId: art.id,
        articleTitle: art.title,
        relevanceScore: Math.round(normalized * 1000) / 1000,
      });
    }
  }

  return scores.sort((a, b) => b.relevanceScore - a.relevanceScore).slice(0, 3);
}

// ═══════════════════════════════════════════════════════════════════════════════
// Agent 4: Response Generator
// ═══════════════════════════════════════════════════════════════════════════════

function generateResponse(
  ticket: Ticket,
  classification: ClassificationResult,
  duplicates: DuplicateMatch[],
  kbMatches: KBMatch[],
): DraftResponse {
  const bestDup = duplicates.filter(d => d.isDuplicate).sort((a, b) => b.similarity - a.similarity)[0];
  const topKB = kbMatches[0];

  if (classification.priority === "P1") {
    return {
      ticketId: ticket.id,
      responseText: `🚨 ESCALATION NOTICE: This ${classification.category} ticket has been classified as ${classification.priority} (Critical). It has been immediately escalated to the on-call engineering team. A senior engineer will respond within 15 minutes. Incident tracking ID has been created.`,
      escalated: true,
      kbReferences: topKB ? [topKB.articleId] : [],
    };
  }

  let response = `Hi ${ticket.sender.split("@")[0]},\n\nThank you for reaching out to us. We understand this is important and want to help resolve it quickly.\n\n`;

  if (bestDup) {
    const ki = KNOWN_ISSUES.find(k => k.id === bestDup.knownIssueId)!;
    response += `We've identified that your issue matches a known problem (${ki.id}: "${ki.title}"). Our team is actively working on this — current status: ${ki.status}. `;
    response += `You'll be automatically notified when a fix is deployed.\n\n`;
  }

  if (topKB) {
    const art = KB_ARTICLES.find(a => a.id === topKB.articleId)!;
    response += `In the meantime, this article may help: "${art.title}" (${art.id}).\n\n`;
  }

  switch (classification.category) {
    case "Billing":
      response += "Our billing team will review your case within 1 business day. If this is a duplicate charge or pricing discrepancy, corrections are typically processed within 3-5 business days.\n\n";
      break;
    case "Technical":
      response += "Our engineering team has been notified and will investigate. Please include any error messages, screenshots, or steps to reproduce if you haven't already.\n\n";
      break;
    case "Account":
      response += "For account-related issues, you can also try our self-service options in Settings > Account. If the issue persists, our support team will follow up.\n\n";
      break;
    case "Feature Request":
      response += "We've logged your suggestion and forwarded it to our product team. Popular requests are reviewed monthly and considered for our roadmap.\n\n";
      break;
  }

  response += `Ticket Priority: ${classification.priority} | Ref: ${ticket.id}\nBest regards,\nSupport Team`;

  return {
    ticketId: ticket.id,
    responseText: response,
    escalated: false,
    kbReferences: kbMatches.map(k => k.articleId),
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// Agent 5: Quality Checker
// ═══════════════════════════════════════════════════════════════════════════════

const EMPATHY_WORDS = ["understand", "sorry", "apologize", "appreciate", "thank", "help", "important", "quickly", "resolve", "right away"];
const ACCURACY_SIGNALS = ["known problem", "article", "team", "investigate", "review", "escalat", "fix", "correction", "self-service", "roadmap"];
const COMPLETENESS_SIGNALS = ["priority", "ref", "regards", "business day", "notified", "follow up", "next step", "contact", "status", "include"];

function checkQuality(draft: DraftResponse, ticket: Ticket, classification: ClassificationResult): QualityScore {
  const text = draft.responseText.toLowerCase();

  // Tone: 0-30 (empathy, professionalism)
  let toneScore = 10; // baseline for being a coherent response
  for (const w of EMPATHY_WORDS) {
    if (text.includes(w)) toneScore += 2.5;
  }
  if (draft.escalated) toneScore += 5; // urgency recognized
  toneScore = Math.min(30, Math.round(toneScore));

  // Accuracy: 0-40 (addresses issue, correct references)
  let accuracyScore = 15; // baseline
  for (const w of ACCURACY_SIGNALS) {
    if (text.includes(w)) accuracyScore += 3;
  }
  if (draft.kbReferences.length > 0) accuracyScore += 5;
  if (draft.escalated && classification.priority === "P1") accuracyScore += 5;
  accuracyScore = Math.min(40, Math.round(accuracyScore));

  // Completeness: 0-30 (next steps, references, closure)
  let completenessScore = 8; // baseline
  for (const w of COMPLETENESS_SIGNALS) {
    if (text.includes(w)) completenessScore += 2.5;
  }
  if (draft.kbReferences.length > 0) completenessScore += 3;
  if (draft.escalated) completenessScore += 3;
  completenessScore = Math.min(30, Math.round(completenessScore));

  const total = toneScore + accuracyScore + completenessScore;

  return {
    ticketId: draft.ticketId,
    tone: toneScore,
    accuracy: accuracyScore,
    completeness: completenessScore,
    total,
    flaggedForReview: total < 70,
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// Main Pipeline
// ═══════════════════════════════════════════════════════════════════════════════

async function main() {
  console.log();
  console.log(`${C.bold}${C.magenta}    ╔══════════════════════════════════════════════════════════════╗${C.reset}`);
  console.log(`${C.bold}${C.magenta}    ║                                                              ║${C.reset}`);
  console.log(`${C.bold}${C.magenta}    ║   🎫  SQUAD — Support Ticket Router                         ║${C.reset}`);
  console.log(`${C.bold}${C.magenta}    ║   Multi-Agent Triage Pipeline   •   12 Tickets   •  5 Agents ║${C.reset}`);
  console.log(`${C.bold}${C.magenta}    ║                                                              ║${C.reset}`);
  console.log(`${C.bold}${C.magenta}    ╚══════════════════════════════════════════════════════════════╝${C.reset}`);
  console.log();

  // Show incoming tickets
  subHeader("📬 Incoming Ticket Queue");
  console.log();
  for (const t of TICKETS) {
    console.log(`  ${C.bold}${t.id}${C.reset}  ${C.dim}from${C.reset} ${t.sender}`);
    console.log(`  ${C.white}"${t.subject}"${C.reset}`);
    console.log();
  }
  await sleep(400);

  // ─── Phase 1: Classification ────────────────────────────────────────────────
  header("🏷️", "Agent 1: Classifier", "Analyzing keywords and patterns to assign priority & category");

  const classifications: ClassificationResult[] = [];
  for (const ticket of TICKETS) {
    const result = classifyTicket(ticket);
    classifications.push(result);

    const pc = priorityColor(result.priority);
    const conf1 = `${(result.priorityConfidence * 100).toFixed(0)}%`;
    const conf2 = `${(result.categoryConfidence * 100).toFixed(0)}%`;
    console.log(`  ${C.bold}${ticket.id}${C.reset}  ${pc}${C.bold}${result.priority}${C.reset} ${C.dim}(${conf1})${C.reset}  │  ${C.cyan}${padRight(result.category, 16)}${C.reset} ${C.dim}(${conf2})${C.reset}`);
    console.log(`  ${C.dim}    └─ ${result.reasoning}${C.reset}`);
    console.log();
    await sleep(200);
  }

  // Classification summary table
  subHeader("📊 Classification Summary");
  console.log();
  const priCounts: Record<Priority, number> = { P1: 0, P2: 0, P3: 0, P4: 0 };
  const catCounts: Record<Category, number> = { Billing: 0, Technical: 0, Account: 0, "Feature Request": 0 };
  for (const c of classifications) {
    priCounts[c.priority]++;
    catCounts[c.category]++;
  }
  console.log(`  Priority: ${C.red}P1: ${priCounts.P1}${C.reset}  ${C.yellow}P2: ${priCounts.P2}${C.reset}  ${C.cyan}P3: ${priCounts.P3}${C.reset}  ${C.gray}P4: ${priCounts.P4}${C.reset}`);
  console.log(`  Category: Billing: ${catCounts.Billing}  Technical: ${catCounts.Technical}  Account: ${catCounts.Account}  Feature: ${catCounts["Feature Request"]}`);
  console.log();
  await sleep(300);

  // ─── Phase 2: Duplicate Detection ──────────────────────────────────────────
  header("🔍", "Agent 2: Duplicate Detector", "Jaccard similarity against known issues database");

  const allDuplicates: Map<string, DuplicateMatch[]> = new Map();
  const bestMatches: Map<string, DuplicateMatch | null> = new Map();

  for (const ticket of TICKETS) {
    const matches = detectDuplicates(ticket);
    allDuplicates.set(ticket.id, matches);
    const best = matches.filter(m => m.isDuplicate).sort((a, b) => b.similarity - a.similarity)[0] || null;
    bestMatches.set(ticket.id, best);

    if (best) {
      const ki = KNOWN_ISSUES.find(k => k.id === best.knownIssueId)!;
      const simPct = (best.similarity * 100).toFixed(1);
      console.log(`  ${C.bold}${ticket.id}${C.reset}  ${C.yellow}⚠ DUPLICATE${C.reset}  → ${best.knownIssueId} ${C.dim}(${simPct}% match)${C.reset}`);
      console.log(`  ${C.dim}    └─ "${ki.title}" [${ki.status}]${C.reset}`);
    } else {
      const topSim = matches.sort((a, b) => b.similarity - a.similarity)[0];
      const simPct = topSim ? (topSim.similarity * 100).toFixed(1) : "0.0";
      console.log(`  ${C.bold}${ticket.id}${C.reset}  ${C.green}✓ Unique${C.reset}      ${C.dim}(best match: ${simPct}% < 25% threshold)${C.reset}`);
    }
    await sleep(150);
  }
  console.log();

  // Similarity heatmap for tickets with duplicates
  subHeader("🗺️  Top Similarity Scores");
  console.log();
  const duplicateTickets = TICKETS.filter(t => bestMatches.get(t.id) !== null);
  for (const ticket of duplicateTickets) {
    const matches = allDuplicates.get(ticket.id)!.sort((a, b) => b.similarity - a.similarity).slice(0, 3);
    console.log(`  ${C.bold}${ticket.id}${C.reset}:`);
    for (const m of matches) {
      const pct = (m.similarity * 100).toFixed(1);
      const barWidth = Math.round(m.similarity * 20);
      const barStr = `${"█".repeat(barWidth)}${"░".repeat(20 - barWidth)}`;
      const color = m.isDuplicate ? C.yellow : C.dim;
      console.log(`    ${m.knownIssueId} ${color}[${barStr}]${C.reset} ${pct}%${m.isDuplicate ? ` ${C.yellow}← MATCH${C.reset}` : ""}`);
    }
    console.log();
  }
  await sleep(300);

  // ─── Phase 3: KB Search ────────────────────────────────────────────────────
  header("📚", "Agent 3: Knowledge Base Searcher", "TF-IDF scoring across 12 knowledge base articles");

  const idf = computeIDF();
  const allKBMatches: Map<string, KBMatch[]> = new Map();

  for (const ticket of TICKETS) {
    const matches = searchKB(ticket, idf);
    allKBMatches.set(ticket.id, matches);

    console.log(`  ${C.bold}${ticket.id}${C.reset}  ${C.dim}"${ticket.subject.slice(0, 50)}${ticket.subject.length > 50 ? "…" : ""}"${C.reset}`);
    if (matches.length === 0) {
      console.log(`    ${C.dim}No relevant articles found${C.reset}`);
    } else {
      for (const m of matches) {
        const relPct = (m.relevanceScore * 100).toFixed(1);
        const relBar = bar(Math.round(m.relevanceScore * 100), 100, 10);
        console.log(`    ${C.green}→${C.reset} ${m.articleId}  ${relBar}  ${C.dim}"${m.articleTitle}"${C.reset}`);
      }
    }
    console.log();
    await sleep(200);
  }

  // ─── Phase 4: Response Generation ──────────────────────────────────────────
  header("✍️", "Agent 4: Response Generator", "Drafting responses for non-P1 tickets, escalating critical issues");

  const allResponses: Map<string, DraftResponse> = new Map();

  for (const ticket of TICKETS) {
    const cls = classifications.find(c => c.ticketId === ticket.id)!;
    const dups = allDuplicates.get(ticket.id) || [];
    const kbm = allKBMatches.get(ticket.id) || [];
    const draft = generateResponse(ticket, cls, dups, kbm);
    allResponses.set(ticket.id, draft);

    if (draft.escalated) {
      console.log(`  ${C.bgRed}${C.white}${C.bold} 🚨 ESCALATED ${C.reset}  ${C.bold}${ticket.id}${C.reset}  →  On-call team notified`);
      console.log(`  ${C.dim}    "${draft.responseText.slice(0, 90)}…"${C.reset}`);
    } else {
      const preview = draft.responseText.split("\n").find(l => l.trim().length > 30 && !l.startsWith("Hi ") && !l.startsWith("Thank"))?.trim() || draft.responseText.slice(0, 80);
      console.log(`  ${C.green}✉${C.reset}  ${C.bold}${ticket.id}${C.reset}  →  Draft ready  ${C.dim}(${draft.kbReferences.length} KB refs)${C.reset}`);
      console.log(`  ${C.dim}    "${preview.slice(0, 90)}${preview.length > 90 ? "…" : ""}"${C.reset}`);
    }
    console.log();
    await sleep(250);
  }

  // ─── Phase 5: Quality Check ────────────────────────────────────────────────
  header("✅", "Agent 5: Quality Checker", "Scoring responses: Tone (0-30) + Accuracy (0-40) + Completeness (0-30)");

  const allQuality: Map<string, QualityScore> = new Map();

  for (const ticket of TICKETS) {
    const draft = allResponses.get(ticket.id)!;
    const cls = classifications.find(c => c.ticketId === ticket.id)!;
    const quality = checkQuality(draft, ticket, cls);
    allQuality.set(ticket.id, quality);

    const totalColor = quality.total >= 80 ? C.green : quality.total >= 70 ? C.yellow : C.red;
    const flag = quality.flaggedForReview ? `  ${C.red}⚠ NEEDS REVIEW${C.reset}` : `  ${C.green}✓ Approved${C.reset}`;

    console.log(`  ${C.bold}${ticket.id}${C.reset}  ${bar(quality.total, 100, 20)}${flag}`);
    console.log(`  ${C.dim}    Tone: ${bar(quality.tone, 30, 8)}  Accuracy: ${bar(quality.accuracy, 40, 8)}  Complete: ${bar(quality.completeness, 30, 8)}${C.reset}`);
    console.log();
    await sleep(200);
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // Final Dashboard
  // ═══════════════════════════════════════════════════════════════════════════
  header("📋", "Final Triage Dashboard", "Complete routing results for all 12 tickets");

  // Table header
  const sep = `  ${"─".repeat(110)}`;
  console.log(sep);
  console.log(`  ${C.bold}${padRight("Ticket", 8)} ${padRight("Priority", 10)} ${padRight("Category", 18)} ${padRight("Duplicate?", 24)} ${padRight("Response", 14)} ${padRight("Quality", 28)} Status${C.reset}`);
  console.log(sep);

  let escalatedCount = 0;
  let duplicateCount = 0;
  let reviewCount = 0;
  let approvedCount = 0;

  for (const ticket of TICKETS) {
    const cls = classifications.find(c => c.ticketId === ticket.id)!;
    const dup = bestMatches.get(ticket.id);
    const draft = allResponses.get(ticket.id)!;
    const quality = allQuality.get(ticket.id)!;

    const pc = priorityColor(cls.priority);
    const priStr = `${pc}${C.bold}${cls.priority}${C.reset}`;
    const catStr = cls.category;
    const dupStr = dup ? `${C.yellow}→ ${dup.knownIssueId} (${(dup.similarity * 100).toFixed(0)}%)${C.reset}` : `${C.dim}—${C.reset}`;
    const respStr = draft.escalated ? `${C.red}ESCALATED${C.reset}` : `${C.green}Drafted${C.reset}`;
    const qualStr = `${quality.total >= 70 ? C.green : C.red}${quality.total}/100${C.reset}`;

    let status: string;
    if (draft.escalated) {
      status = `${C.bgRed}${C.white} 🚨 ON-CALL ${C.reset}`;
      escalatedCount++;
    } else if (quality.flaggedForReview) {
      status = `${C.yellow}👀 Review${C.reset}`;
      reviewCount++;
    } else {
      status = `${C.green}✅ Ready${C.reset}`;
      approvedCount++;
    }
    if (dup) duplicateCount++;

    console.log(`  ${padRight(ticket.id, 8)} ${padRight(priStr, 10 + 9)} ${padRight(catStr, 18)} ${padRight(dupStr, 24 + 9)} ${padRight(respStr, 14 + 9)} ${padRight(qualStr, 12 + 9)} ${status}`);
  }
  console.log(sep);
  console.log();

  // Summary stats
  subHeader("📈 Pipeline Summary");
  console.log();
  console.log(`  📬 Tickets Processed:   ${C.bold}${TICKETS.length}${C.reset}`);
  console.log(`  🚨 Escalated (P1):      ${C.red}${C.bold}${escalatedCount}${C.reset}`);
  console.log(`  🔍 Duplicates Found:    ${C.yellow}${C.bold}${duplicateCount}${C.reset}`);
  console.log(`  👀 Needs Human Review:  ${C.yellow}${C.bold}${reviewCount}${C.reset}`);
  console.log(`  ✅ Auto-Approved:       ${C.green}${C.bold}${approvedCount}${C.reset}`);
  console.log(`  📚 KB Articles Used:    ${C.cyan}${C.bold}${KB_ARTICLES.length}${C.reset}`);
  console.log(`  🗂️  Known Issues Checked: ${C.cyan}${C.bold}${KNOWN_ISSUES.length}${C.reset}`);
  console.log();

  const avgQuality = Math.round([...allQuality.values()].reduce((s, q) => s + q.total, 0) / allQuality.size);
  console.log(`  Average Quality Score:  ${bar(avgQuality, 100, 25)}`);
  console.log();

  console.log(`${C.bold}${C.magenta}  ══════════════════════════════════════════════════════════════${C.reset}`);
  console.log(`${C.bold}${C.magenta}   Pipeline complete • ${TICKETS.length} tickets routed • ${escalatedCount} escalated • ${approvedCount} auto-approved${C.reset}`);
  console.log(`${C.bold}${C.magenta}  ══════════════════════════════════════════════════════════════${C.reset}`);
  console.log();
}

main().catch(console.error);
