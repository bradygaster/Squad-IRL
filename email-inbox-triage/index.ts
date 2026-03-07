// Email Inbox Triage System
// 3 Agents: Classifier, Summarizer, Action Suggester
// Processes 18 realistic emails with confidence scoring and fallback routing

// ── Types ─────────────────────────────────────────────────────────────────────

interface Email {
  id: number;
  from: string;
  to: string;
  subject: string;
  body: string;
  date: string;
  hasAttachments: boolean;
}

type Category = "Work" | "Shopping" | "Newsletter" | "Alert" | "Personal" | "Spam";

interface ClassificationResult {
  category: Category;
  priority: number; // 1=critical, 5=low
  confidence: number;
  fallbackTriggered: boolean;
  initialCategory?: Category;
  initialConfidence?: number;
}

interface SummaryResult {
  summary: string;
  entities: string[];
}

interface ActionResult {
  action: string;
  deadline: string | null;
}

interface TriagedEmail {
  email: Email;
  classification: ClassificationResult;
  summary: SummaryResult;
  actionSuggestion: ActionResult;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

const sleep = (ms: number): Promise<void> => new Promise(r => setTimeout(r, ms));

// ANSI color codes
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
  gray: "\x1b[90m",
  bgRed: "\x1b[41m",
  bgYellow: "\x1b[43m",
  bgGreen: "\x1b[42m",
  bgBlue: "\x1b[44m",
};

function priorityStars(p: number): string {
  const filled = 6 - p;
  return "★".repeat(filled) + "☆".repeat(p - 1);
}

function priorityLabel(p: number): string {
  const labels: Record<number, string> = {
    1: "CRITICAL",
    2: "HIGH",
    3: "MEDIUM",
    4: "LOW",
    5: "MINIMAL",
  };
  return labels[p] ?? "UNKNOWN";
}

function priorityColor(p: number): string {
  if (p === 1) return c.red;
  if (p === 2) return c.yellow;
  if (p === 3) return c.cyan;
  if (p === 4) return c.green;
  return c.gray;
}

function categoryEmoji(cat: Category): string {
  const map: Record<Category, string> = {
    Work: "💼",
    Shopping: "🛒",
    Newsletter: "📰",
    Alert: "🚨",
    Personal: "👤",
    Spam: "🗑️",
  };
  return map[cat];
}

function actionEmoji(action: string): string {
  if (action.includes("Urgently")) return "🔴";
  if (action === "Reply") return "🟡";
  if (action === "Archive") return "📦";
  if (action === "Delete") return "🗑️";
  if (action === "Unsubscribe") return "🚫";
  if (action.includes("Flag")) return "🚩";
  if (action.includes("Forward")) return "➡️";
  return "⚪";
}

// ── Email Data (18 realistic emails) ──────────────────────────────────────────

const emails: Email[] = [
  {
    id: 1,
    from: "boss@company.com",
    to: "you@company.com",
    subject: "Q4 Budget Review Meeting - Tomorrow 2pm",
    body: "Hi team, reminder that our Q4 budget review is tomorrow at 2pm in Conference Room B. Please bring your department spending reports and projections for next quarter. We need to finalize allocations before the board meeting on Friday.",
    date: "2024-11-18T09:15:00Z",
    hasAttachments: false,
  },
  {
    id: 2,
    from: "noreply@amazon.com",
    to: "you@gmail.com",
    subject: "Your order #112-4839201 has shipped!",
    body: "Great news! Your order containing Wireless Noise-Cancelling Headphones has shipped via UPS. Estimated delivery: November 20, 2024. Track your package with tracking number 1Z999AA10123456784.",
    date: "2024-11-17T14:22:00Z",
    hasAttachments: false,
  },
  {
    id: 3,
    from: "devweekly@techdigest.io",
    to: "you@gmail.com",
    subject: "Dev Weekly #287: Rust in Production, AI Code Review Tools",
    body: "This week in tech: How Cloudflare migrated 30% of their services to Rust. Plus: 5 AI-powered code review tools compared, TypeScript 6.0 preview features, and why SQLite is the most deployed database in the world. Read more inside.",
    date: "2024-11-18T06:00:00Z",
    hasAttachments: false,
  },
  {
    id: 4,
    from: "alerts@bankofamerica.com",
    to: "you@gmail.com",
    subject: "Unusual Activity Detected on Account ending 4821",
    body: "We detected an unusual transaction of $2,847.00 at an electronics store in Miami, FL on Nov 17. If you did not authorize this transaction, please call 1-800-432-1000 immediately. Your account has been temporarily restricted for your protection.",
    date: "2024-11-17T23:45:00Z",
    hasAttachments: false,
  },
  {
    id: 5,
    from: "sarah.chen@gmail.com",
    to: "you@gmail.com",
    subject: "Birthday party this Saturday! 🎉",
    body: "Hey! Just a reminder about my birthday party this Saturday at 7pm. We're doing a backyard BBQ at my place. Bring your appetite and maybe a lawn chair if you have one! Let me know if you're still coming.",
    date: "2024-11-18T10:30:00Z",
    hasAttachments: false,
  },
  {
    id: 6,
    from: "prince.abubakar@diplomats.ng",
    to: "you@gmail.com",
    subject: "URGENT: $15.5 Million USD Inheritance Awaiting You",
    body: "Dear Beloved, I am Prince Abubakar of Nigeria. My late father left $15.5 million that I need to transfer to your account for safekeeping. You will receive 30% as commission. Please send your bank details and a processing fee of $500 immediately.",
    date: "2024-11-18T02:15:00Z",
    hasAttachments: true,
  },
  {
    id: 7,
    from: "monitoring@infra.company.com",
    to: "ops-team@company.com",
    subject: "🔴 CRITICAL: Production server us-east-1 DOWN",
    body: "ALERT: Production server us-east-1-web-03 is unreachable since 03:42 UTC. Health checks failing for 15 minutes. CPU was at 98% before disconnect. Auto-scaling has been triggered but new instances are failing to start. Immediate investigation required.",
    date: "2024-11-18T03:42:00Z",
    hasAttachments: false,
  },
  {
    id: 8,
    from: "jira@company.atlassian.net",
    to: "you@company.com",
    subject: "Code Review Requested: PROJ-1842 - Fix auth token refresh",
    body: "Alex Martinez has requested your review on PROJ-1842: Fix authentication token refresh race condition. The PR addresses a bug where concurrent API calls could cause duplicate token refresh requests. 3 files changed, 47 additions, 12 deletions.",
    date: "2024-11-18T11:20:00Z",
    hasAttachments: false,
  },
  {
    id: 9,
    from: "deals@shopify-store.com",
    to: "you@gmail.com",
    subject: "⚡ FLASH SALE: 70% Off Everything - Ends Tonight!",
    body: "Don't miss our biggest sale of the year! Everything in store is 70% off for the next 12 hours only. Use code FLASH70 at checkout. Free shipping on orders over $50. Shop now before your favorites sell out!",
    date: "2024-11-18T08:00:00Z",
    hasAttachments: false,
  },
  {
    id: 10,
    from: "hr@company.com",
    to: "you@company.com",
    subject: "Annual Performance Review - Schedule Your Session",
    body: "It's time for your annual performance review. Please schedule a 1-hour session with your manager before November 30th using the HR portal. Remember to complete your self-assessment form beforehand. Peer feedback requests have already been sent out.",
    date: "2024-11-15T09:00:00Z",
    hasAttachments: true,
  },
  {
    id: 11,
    from: "uncle.mike@family.org",
    to: "you@gmail.com",
    subject: "Thanksgiving photos from last year 📸",
    body: "Hey kiddo! Found these photos from last Thanksgiving while cleaning out my laptop. Some real gems in here including that epic pie-eating contest. Attached the whole album. Can't wait to see everyone again this year!",
    date: "2024-11-16T15:30:00Z",
    hasAttachments: true,
  },
  {
    id: 12,
    from: "winner-notice@lotteryprize.xyz",
    to: "you@gmail.com",
    subject: "Congratulations! You've Won $1,000,000 in our Annual Draw",
    body: "You have been selected as the winner of our International Email Lottery with a prize of $1,000,000 USD. To claim your prize, reply with your full name, address, and bank account number. A processing fee of $200 is required via wire transfer.",
    date: "2024-11-17T05:00:00Z",
    hasAttachments: false,
  },
  {
    id: 13,
    from: "noreply@github.com",
    to: "you@company.com",
    subject: "[squad-framework] Issue #247: Memory leak in session pool",
    body: "A new issue has been filed in squad-framework. User reports memory usage growing unbounded after 200+ concurrent sessions. Heap snapshots attached show retained objects in the SessionPool class. Reproducible on Node 20.x with the provided test case.",
    date: "2024-11-18T07:45:00Z",
    hasAttachments: true,
  },
  {
    id: 14,
    from: "security@company.com",
    to: "all-staff@company.com",
    subject: "🔒 Security Incident: Credential Rotation Required",
    body: "A potential security breach has been detected in our CI/CD pipeline. All employees must rotate their access tokens and passwords within the next 4 hours. Use the security portal at https://security.company.com/rotate. MFA will be enforced on all accounts starting immediately.",
    date: "2024-11-18T04:30:00Z",
    hasAttachments: false,
  },
  {
    id: 15,
    from: "weightloss@miracle-pills.biz",
    to: "you@gmail.com",
    subject: "Lose 30 Pounds in 30 Days - Doctor's HATE This Trick!",
    body: "Revolutionary new formula discovered by scientists burns fat while you sleep! No diet, no exercise needed. Order now and get a FREE bottle. Limited time offer. Results guaranteed or your money back. Click here to transform your body today!",
    date: "2024-11-17T12:00:00Z",
    hasAttachments: false,
  },
  {
    id: 16,
    from: "pm@company.com",
    to: "you@company.com",
    subject: "Sprint 24 Retrospective Notes + Action Items",
    body: "Attached are the notes from yesterday's sprint retro. Key action items: 1) Reduce PR review turnaround to <24hrs, 2) Add integration tests for the payment module, 3) Set up monitoring dashboards for the new microservices. Please review and add your comments by Wednesday.",
    date: "2024-11-18T13:00:00Z",
    hasAttachments: true,
  },
  {
    id: 17,
    from: "noreply@etsy.com",
    to: "you@gmail.com",
    subject: "Order Confirmed: Handmade Ceramic Mug Set (#ETY-98234)",
    body: "Thank you for your purchase! Your order for Handmade Ceramic Mug Set (Qty: 1, $42.99) has been confirmed. The artisan will begin crafting your item within 2 business days. Estimated shipping: Nov 22-25. You'll receive a notification when it ships.",
    date: "2024-11-18T16:10:00Z",
    hasAttachments: false,
  },
  {
    id: 18,
    from: "newsletter@industryinsider.com",
    to: "you@gmail.com",
    subject: "The Future of Remote Work: 2025 Trends Report",
    body: "Our annual report is here. Key findings: 62% of companies plan hybrid-first policies, AI productivity tools adoption up 340%, and the average remote worker saves $12,000/year. Plus exclusive interviews with CTOs from Fortune 500 companies. Download the full report inside.",
    date: "2024-11-18T07:00:00Z",
    hasAttachments: true,
  },
];

// ── Agent 1: Classifier ──────────────────────────────────────────────────────

type KeywordDict = Record<Category, { keywords: Record<string, number>; domainHints: string[] }>;

const classifierConfig: KeywordDict = {
  Work: {
    keywords: {
      meeting: 3, budget: 3, review: 2, sprint: 3, project: 3, deadline: 3,
      manager: 2, team: 2, jira: 3, pr: 2, deploy: 3, code: 2, performance: 2,
      retro: 3, action: 1, retrospective: 3, schedule: 1, department: 2,
      quarterly: 2, board: 2, "pull request": 3, integration: 2, microservice: 2,
      monitor: 2, pipeline: 2, session: 1, issue: 1, memory: 1, fix: 1,
    },
    domainHints: ["company.com", "atlassian.net", "github.com", "company.atlassian.net"],
  },
  Shopping: {
    keywords: {
      order: 3, shipped: 3, delivery: 3, tracking: 3, purchase: 3, cart: 2,
      "flash sale": 3, discount: 2, checkout: 3, shipping: 3, "free shipping": 2,
      confirmed: 2, artisan: 1, crafting: 1, "order confirmed": 3, store: 1,
    },
    domainHints: ["amazon.com", "etsy.com", "shopify-store.com", "ebay.com"],
  },
  Newsletter: {
    keywords: {
      weekly: 3, digest: 3, newsletter: 3, subscribe: 2, "this week": 2,
      report: 2, trends: 2, annual: 1, findings: 2, "read more": 2,
      industry: 2, exclusive: 1, download: 1, interview: 1,
    },
    domainHints: ["techdigest.io", "industryinsider.com", "substack.com", "medium.com"],
  },
  Alert: {
    keywords: {
      alert: 4, critical: 4, urgent: 2, security: 3, breach: 4, down: 4,
      unreachable: 4, incident: 4, unusual: 3, restricted: 3, immediately: 2,
      "health check": 3, failing: 3, detected: 2, rotation: 3, mfa: 2,
      credential: 3, password: 2, unauthorized: 3, "auto-scaling": 3,
    },
    domainHints: ["bankofamerica.com", "infra.company.com", "security.company.com"],
  },
  Personal: {
    keywords: {
      birthday: 3, party: 2, friend: 2, family: 3, photo: 3, thanksgiving: 3,
      bbq: 2, "can't wait": 2, kiddo: 2, hey: 1, album: 2, invitation: 2,
      "see everyone": 2, backyard: 2, saturday: 1,
    },
    domainHints: ["gmail.com", "family.org", "yahoo.com", "hotmail.com"],
  },
  Spam: {
    keywords: {
      prince: 4, inheritance: 4, lottery: 4, winner: 3, million: 3,
      "processing fee": 4, "bank details": 4, "wire transfer": 4,
      "click here": 3, miracle: 4, "no diet": 3, guaranteed: 2,
      "limited time": 2, "lose weight": 3, "burn fat": 3, revolutionary: 3,
      "free bottle": 3, commission: 2, safekeeping: 3, congratulations: 1,
    },
    domainHints: ["diplomats.ng", "lotteryprize.xyz", "miracle-pills.biz"],
  },
};

function extractDomain(email: string): string {
  const atIndex = email.indexOf("@");
  return atIndex >= 0 ? email.slice(atIndex + 1).toLowerCase() : "";
}

function computeCategoryScore(email: Email, category: Category): number {
  const config = classifierConfig[category];
  const text = `${email.subject} ${email.body}`.toLowerCase();
  let score = 0;
  let maxPossible = 0;

  for (const [keyword, weight] of Object.entries(config.keywords)) {
    maxPossible += weight;
    if (text.includes(keyword.toLowerCase())) {
      score += weight;
    }
  }

  return maxPossible > 0 ? score / maxPossible : 0;
}

function classifyByDomain(email: Email): Category | null {
  const domain = extractDomain(email.from);
  for (const [cat, config] of Object.entries(classifierConfig) as [Category, KeywordDict[Category]][]) {
    if (config.domainHints.some(d => domain.includes(d) || d.includes(domain))) {
      return cat;
    }
  }
  return null;
}

function assignPriority(category: Category, email: Email): number {
  const text = `${email.subject} ${email.body}`.toLowerCase();

  if (category === "Alert") {
    if (text.includes("critical") || text.includes("down") || text.includes("breach")) return 1;
    return 2;
  }
  if (category === "Work") {
    if (text.includes("tomorrow") || text.includes("urgent") || text.includes("immediately")) return 2;
    if (text.includes("deadline") || text.includes("before")) return 3;
    return 3;
  }
  if (category === "Personal") return 4;
  if (category === "Shopping") {
    if (text.includes("flash sale") || text.includes("ends tonight")) return 4;
    return 4;
  }
  if (category === "Newsletter") return 5;
  if (category === "Spam") return 5;
  return 4;
}

function classifierAgent(email: Email): ClassificationResult {
  const scores: { category: Category; score: number }[] = [];
  const categories: Category[] = ["Work", "Shopping", "Newsletter", "Alert", "Personal", "Spam"];

  for (const cat of categories) {
    scores.push({ category: cat, score: computeCategoryScore(email, cat) });
  }

  scores.sort((a, b) => b.score - a.score);
  const best = scores[0];
  let fallbackTriggered = false;
  let initialCategory: Category | undefined;
  let initialConfidence: number | undefined;
  let finalCategory = best.category;
  let finalConfidence = Math.min(best.score * 2.5, 0.99); // scale up for display

  // Ensure minimum spread — if top two scores are close, lower confidence
  if (scores.length > 1) {
    const spread = best.score - scores[1].score;
    if (spread < 0.05) {
      finalConfidence = Math.min(finalConfidence, 0.55);
    }
  }

  // Fallback routing if confidence < 0.6
  if (finalConfidence < 0.6) {
    fallbackTriggered = true;
    initialCategory = finalCategory;
    initialConfidence = finalConfidence;

    const domainCategory = classifyByDomain(email);
    if (domainCategory) {
      finalCategory = domainCategory;
      // Boost confidence from domain match
      const domainBoost = 0.25;
      const keywordScore = computeCategoryScore(email, domainCategory);
      finalConfidence = Math.min((keywordScore * 2.5) + domainBoost, 0.95);
      if (finalConfidence < 0.6) finalConfidence = 0.65; // domain match gives baseline confidence
    }
  }

  // Round to 2 decimal places
  finalConfidence = Math.round(finalConfidence * 100) / 100;
  if (initialConfidence !== undefined) {
    initialConfidence = Math.round(initialConfidence * 100) / 100;
  }

  const priority = assignPriority(finalCategory, email);

  return {
    category: finalCategory,
    priority,
    confidence: finalConfidence,
    fallbackTriggered,
    initialCategory,
    initialConfidence,
  };
}

// ── Agent 2: Summarizer ──────────────────────────────────────────────────────

function truncateAtWordBoundary(text: string, maxLen: number): string {
  if (text.length <= maxLen) return text;
  const truncated = text.slice(0, maxLen);
  const lastSpace = truncated.lastIndexOf(" ");
  return (lastSpace > maxLen * 0.5 ? truncated.slice(0, lastSpace) : truncated) + "...";
}

function extractEntities(email: Email): string[] {
  const entities: string[] = [];
  const text = `${email.subject} ${email.body}`;

  // Extract dates
  const datePatterns = [
    /\b(?:January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{1,2}(?:,?\s+\d{4})?\b/gi,
    /\b(?:tomorrow|today|tonight|this saturday|this friday|wednesday|monday)\b/gi,
    /\b(?:Nov|Dec|Jan|Feb)\s+\d{1,2}[-–]\d{1,2}\b/gi,
    /\b\d{1,2}pm\b/gi,
  ];
  for (const pattern of datePatterns) {
    const matches = text.match(pattern);
    if (matches) entities.push(...matches.map(m => `📅 ${m}`));
  }

  // Extract amounts
  const amountPattern = /\$[\d,]+(?:\.\d{2})?/g;
  const amounts = text.match(amountPattern);
  if (amounts) entities.push(...amounts.map(a => `💰 ${a}`));

  // Extract names (simple heuristic: capitalized word pairs not at sentence start)
  const namePattern = /(?:^|\.\s+)?([A-Z][a-z]+\s+[A-Z][a-z]+)/g;
  const nameMatches = text.match(namePattern);
  if (nameMatches) {
    const skipWords = new Set(["Flash Sale", "Dear Beloved", "Read More", "Great News", "Key Action", "Annual Draw"]);
    for (const name of nameMatches) {
      const trimmed = name.replace(/^\.\s+/, "").trim();
      if (!skipWords.has(trimmed) && !entities.some(e => e.includes(trimmed))) {
        entities.push(`👤 ${trimmed}`);
      }
    }
  }

  // Extract tracking numbers or order numbers
  const orderPattern = /#[\w-]+/g;
  const orders = text.match(orderPattern);
  if (orders) entities.push(...orders.slice(0, 2).map(o => `📦 ${o}`));

  return entities.slice(0, 5); // cap at 5 entities
}

function summarizerAgent(email: Email, category: Category): SummaryResult {
  const text = `${email.subject}. ${email.body}`;

  // Build summary based on category focus
  let summary: string;
  const bodyLower = email.body.toLowerCase();

  switch (category) {
    case "Work":
      if (bodyLower.includes("meeting") || bodyLower.includes("schedule")) {
        const timeMatch = email.body.match(/\d{1,2}(?::\d{2})?\s*(?:am|pm)/i);
        const time = timeMatch ? timeMatch[0] : "";
        summary = `${email.subject.replace(/\s*-\s*/, ": ").slice(0, 50)}${time ? `, prep needed` : ""}`;
      } else if (bodyLower.includes("review")) {
        summary = `Review requested: ${email.subject.replace(/.*:\s*/, "").slice(0, 55)}`;
      } else {
        summary = email.subject.slice(0, 70);
      }
      break;
    case "Shopping":
      if (bodyLower.includes("shipped")) {
        summary = `Order shipped — ${email.body.match(/(?:delivery|estimated)[:\s]+([^.]+)/i)?.[1]?.trim().slice(0, 40) ?? "check tracking"}`;
      } else if (bodyLower.includes("confirmed")) {
        summary = `Order confirmed: ${email.body.match(/for\s+(.+?)(?:\s*\(|\.|$)/i)?.[1]?.trim().slice(0, 45) ?? email.subject.slice(0, 45)}`;
      } else {
        summary = `Sale alert: ${email.subject.slice(0, 60)}`;
      }
      break;
    case "Newsletter":
      summary = `Newsletter: ${email.subject.replace(/^.*?:\s*/, "").slice(0, 60)}`;
      break;
    case "Alert": {
      const urgency = bodyLower.includes("critical") || bodyLower.includes("breach") ? "URGENT" : "Alert";
      summary = `${urgency}: ${email.subject.replace(/[🔴🔒]\s*/g, "").slice(0, 55)}`;
      break;
    }
    case "Personal":
      summary = `${email.subject.replace(/[🎉📸]\s*/g, "").slice(0, 70)}`;
      break;
    case "Spam":
      summary = `Spam: ${email.subject.slice(0, 65)}`;
      break;
    default:
      summary = email.subject.slice(0, 75);
  }

  summary = truncateAtWordBoundary(summary, 80);
  const entities = extractEntities(email);

  return { summary, entities };
}

// ── Agent 3: Action Suggester ────────────────────────────────────────────────

function actionSuggesterAgent(
  email: Email,
  classification: ClassificationResult,
  _summary: SummaryResult
): ActionResult {
  const { category, priority } = classification;
  const bodyLower = email.body.toLowerCase();

  let action: string;
  let deadline: string | null = null;

  switch (category) {
    case "Alert":
      if (priority === 1) {
        action = "Reply Urgently";
        deadline = "Immediately";
      } else {
        action = "Reply Urgently";
        deadline = "Within 4 hours";
      }
      break;
    case "Work":
      if (bodyLower.includes("tomorrow") || bodyLower.includes("immediately")) {
        action = "Reply Urgently";
        deadline = "Today by EOD";
      } else if (bodyLower.includes("before") || bodyLower.includes("deadline")) {
        action = "Reply";
        const dateMatch = email.body.match(/before\s+(\w+\s+\d+)/i);
        deadline = dateMatch ? `By ${dateMatch[1]}` : "This week";
      } else if (bodyLower.includes("review")) {
        action = "Reply";
        deadline = "Within 24 hours";
      } else {
        action = "Flag for Follow-up";
        deadline = "This week";
      }
      break;
    case "Shopping":
      if (bodyLower.includes("flash sale") || bodyLower.includes("ends tonight")) {
        action = "Flag for Follow-up";
        deadline = "Today";
      } else {
        action = "Archive";
        deadline = null;
      }
      break;
    case "Newsletter":
      action = "Archive";
      deadline = null;
      break;
    case "Personal":
      if (bodyLower.includes("rsvp") || bodyLower.includes("let me know")) {
        action = "Reply";
        deadline = "Within 2 days";
      } else {
        action = "Reply";
        deadline = "When convenient";
      }
      break;
    case "Spam":
      if (bodyLower.includes("subscribe") || bodyLower.includes("unsubscribe")) {
        action = "Unsubscribe";
      } else {
        action = "Delete";
      }
      deadline = null;
      break;
    default:
      action = "Archive";
      deadline = null;
  }

  // Override: if it involves team/ops, suggest forwarding
  if (category === "Work" && (bodyLower.includes("team") || bodyLower.includes("all-staff"))) {
    if (bodyLower.includes("action items") || bodyLower.includes("notes")) {
      action = "Forward to Team";
      deadline = "Today";
    }
  }

  // Override: GitHub issues should be flagged
  if (email.from.includes("github.com") && bodyLower.includes("issue")) {
    action = "Flag for Follow-up";
    deadline = "Within 24 hours";
  }

  return { action, deadline };
}

// ── Output Rendering ─────────────────────────────────────────────────────────

function printBanner(): void {
  console.log();
  console.log(`${c.cyan}╔══════════════════════════════════════════════════╗${c.reset}`);
  console.log(`${c.cyan}║${c.reset}${c.bold}        📧 Email Inbox Triage System              ${c.reset}${c.cyan}║${c.reset}`);
  console.log(`${c.cyan}║${c.reset}${c.dim}        3 Agents • 18 Emails • Smart Routing      ${c.reset}${c.cyan}║${c.reset}`);
  console.log(`${c.cyan}╚══════════════════════════════════════════════════╝${c.reset}`);
  console.log();
}

async function printEmailProcessing(result: TriagedEmail, index: number, total: number): Promise<void> {
  const { email, classification, summary, actionSuggestion } = result;
  const pColor = priorityColor(classification.priority);

  console.log(`${c.bold}━━━ Processing Email ${index + 1}/${total} ━━━━━━━━━━━━━━━━━━━━━━━━${c.reset}`);
  console.log(`${c.dim}From:${c.reset}    ${email.from}`);
  console.log(`${c.dim}Subject:${c.reset} ${email.subject}`);
  console.log();

  await sleep(150);

  // Classifier output
  if (classification.fallbackTriggered) {
    console.log(
      `${c.magenta}🏷️  Classifier${c.reset} → Initial: ${classification.initialCategory} ` +
      `(confidence: ${classification.initialConfidence?.toFixed(2)}) ${c.yellow}⚠️ LOW CONFIDENCE${c.reset}`
    );
    await sleep(200);
    console.log(`${c.dim}                  Fallback: analyzing sender domain...${c.reset}`);
    await sleep(250);
    console.log(
      `${c.dim}                  Reclassified:${c.reset} ${c.bold}${classification.category}${c.reset} ` +
      `(confidence: ${classification.confidence.toFixed(2)}) ${c.green}✓${c.reset}`
    );
  } else {
    console.log(
      `${c.magenta}🏷️  Classifier${c.reset} → Category: ${c.bold}${classification.category}${c.reset} ` +
      `${categoryEmoji(classification.category)} (confidence: ${classification.confidence.toFixed(2)})`
    );
    console.log(
      `${c.dim}                  Priority:${c.reset} ${pColor}${priorityStars(classification.priority)}${c.reset} ` +
      `(${classification.priority} - ${priorityLabel(classification.priority)})`
    );
  }

  await sleep(150);

  // Summarizer output
  console.log(`${c.blue}📝 Summarizer${c.reset}  → "${summary.summary}"`);
  if (summary.entities.length > 0) {
    console.log(`${c.dim}                  Entities: ${summary.entities.join(", ")}${c.reset}`);
  }

  await sleep(100);

  // Action output
  const actionColor = actionSuggestion.action.includes("Urgently") ? c.red :
    actionSuggestion.action === "Delete" ? c.gray : c.green;
  const deadlineStr = actionSuggestion.deadline ? ` | Deadline: ${actionSuggestion.deadline}` : "";
  console.log(
    `${c.yellow}⚡ Action${c.reset}      → ${actionColor}${actionEmoji(actionSuggestion.action)} ` +
    `${actionSuggestion.action}${c.reset}${c.dim}${deadlineStr}${c.reset}`
  );

  console.log();
  await sleep(100);
}

function printTriagedInbox(results: TriagedEmail[]): void {
  const sorted = [...results].sort((a, b) => a.classification.priority - b.classification.priority);
  const grouped = new Map<number, TriagedEmail[]>();
  for (const r of sorted) {
    const p = r.classification.priority;
    if (!grouped.has(p)) grouped.set(p, []);
    grouped.get(p)!.push(r);
  }

  const boxWidth = 72;
  const line = "═".repeat(boxWidth - 2);
  const thinLine = "─".repeat(boxWidth - 2);

  console.log(`${c.cyan}╔${line}╗${c.reset}`);
  console.log(`${c.cyan}║${c.reset}${c.bold}${"📋 TRIAGED INBOX".padStart(Math.floor((boxWidth - 2 + 16) / 2)).padEnd(boxWidth - 2)}${c.reset}${c.cyan}║${c.reset}`);
  console.log(`${c.cyan}╠${line}╣${c.reset}`);

  for (const [priority, group] of grouped) {
    const pColor = priorityColor(priority);
    const label = `${priorityStars(priority)} ${priorityLabel(priority)}`;
    console.log(`${c.cyan}║${c.reset} ${pColor}${c.bold}${label}${c.reset}${" ".repeat(Math.max(0, boxWidth - 3 - label.length))}${c.cyan}║${c.reset}`);
    console.log(`${c.cyan}╠${thinLine.split("").map(() => "─").join("")}╣${c.reset}`);

    for (const r of group) {
      const id = `#${r.email.id}`.padEnd(4);
      const emoji = actionEmoji(r.actionSuggestion.action);
      const subj = truncateAtWordBoundary(r.email.subject.replace(/[🔴🔒⚡🎉📸]\s*/g, ""), 26);
      const cat = r.classification.category.padEnd(12);
      const action = `→ ${r.actionSuggestion.action}`;
      const row = ` ${id} ${emoji} ${subj.padEnd(28)} ${cat} ${action}`;
      const displayLen = id.length + 1 + 2 + 1 + 28 + 1 + 12 + 1 + action.length + 1;
      const pad = Math.max(0, boxWidth - 3 - displayLen);
      console.log(`${c.cyan}║${c.reset}${pColor}${row}${c.reset}${" ".repeat(pad)}${c.cyan}║${c.reset}`);
    }

    console.log(`${c.cyan}╠${thinLine.split("").map(() => "─").join("")}╣${c.reset}`);
  }

  // Replace last separator with bottom border
  console.log(`${c.cyan}╚${line}╝${c.reset}`);
}

function printStatistics(results: TriagedEmail[], elapsedMs: number): void {
  const categoryCount: Record<string, number> = {};
  const actionCount: Record<string, number> = {};
  let fallbackCount = 0;

  for (const r of results) {
    const cat = r.classification.category;
    categoryCount[cat] = (categoryCount[cat] ?? 0) + 1;
    const act = r.actionSuggestion.action;
    actionCount[act] = (actionCount[act] ?? 0) + 1;
    if (r.classification.fallbackTriggered) fallbackCount++;
  }

  const catStr = Object.entries(categoryCount)
    .map(([k, v]) => `${k}(${v})`)
    .join(" ");
  const actStr = Object.entries(actionCount)
    .map(([k, v]) => `${k}(${v})`)
    .join(" ");
  const fallbackPct = ((fallbackCount / results.length) * 100).toFixed(1);

  console.log();
  console.log(`${c.bold}📊 Triage Statistics:${c.reset}`);
  console.log(`   Processed: ${c.bold}${results.length} emails${c.reset} in ${c.bold}${(elapsedMs / 1000).toFixed(1)}s${c.reset}`);
  console.log(`   Categories: ${c.cyan}${catStr}${c.reset}`);
  console.log(`   Fallback routing triggered: ${c.yellow}${fallbackCount} times (${fallbackPct}%)${c.reset}`);
  console.log(`   Actions: ${c.green}${actStr}${c.reset}`);
  console.log();
}

// ── Main Pipeline ────────────────────────────────────────────────────────────

async function main(): Promise<void> {
  const startTime = Date.now();

  printBanner();

  console.log(`${c.dim}Initializing agents...${c.reset}`);
  await sleep(300);
  console.log(`  ${c.green}✓${c.reset} Classifier Agent (keyword matching + domain fallback)`);
  await sleep(150);
  console.log(`  ${c.green}✓${c.reset} Summarizer Agent (entity extraction + smart truncation)`);
  await sleep(150);
  console.log(`  ${c.green}✓${c.reset} Action Suggester Agent (priority-aware routing)`);
  await sleep(200);
  console.log();

  const results: TriagedEmail[] = [];

  for (let i = 0; i < emails.length; i++) {
    const email = emails[i];

    // Agent 1: Classify
    const classification = classifierAgent(email);

    // Agent 2: Summarize
    const summary = summarizerAgent(email, classification.category);

    // Agent 3: Suggest action
    const actionSuggestion = actionSuggesterAgent(email, classification, summary);

    const triaged: TriagedEmail = { email, classification, summary, actionSuggestion };
    results.push(triaged);

    await printEmailProcessing(triaged, i, emails.length);
  }

  // Final sorted view
  console.log(`${c.bold}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${c.reset}`);
  console.log();
  printTriagedInbox(results);

  const elapsedMs = Date.now() - startTime;
  printStatistics(results, elapsedMs);
}

main().catch(console.error);
