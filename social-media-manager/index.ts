// Social Media Content Engine
// 4 Agents • 3 Topics • 3 Platforms — fully self-contained, no external APIs.

// ─── Helpers ────────────────────────────────────────────────────────────────

const sleep = (ms: number): Promise<void> => new Promise((r) => setTimeout(r, ms));

const RESET = "\x1b[0m";
const BOLD = "\x1b[1m";
const DIM = "\x1b[2m";
const GREEN = "\x1b[32m";
const YELLOW = "\x1b[33m";
const RED = "\x1b[31m";
const CYAN = "\x1b[36m";
const MAGENTA = "\x1b[35m";
const WHITE = "\x1b[37m";
const BG_BLUE = "\x1b[44m";

function scoreColor(score: number): string {
  if (score >= 80) return GREEN;
  if (score >= 60) return YELLOW;
  return RED;
}

function scoreEmoji(score: number): string {
  if (score >= 90) return " 🔥🔥";
  if (score >= 80) return " 🔥";
  return "";
}

function clamp(n: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, n));
}

function pad(s: string, len: number): string {
  return s.length >= len ? s.slice(0, len) : s + " ".repeat(len - s.length);
}

function rpad(s: string, len: number): string {
  return pad(s, len);
}

// Seeded PRNG for reproducible "random" data
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

const rand = mulberry32(42);

function randBetween(lo: number, hi: number): number {
  return lo + rand() * (hi - lo);
}

function randInt(lo: number, hi: number): number {
  return Math.floor(randBetween(lo, hi + 1));
}

function pick<T>(arr: T[]): T {
  return arr[Math.floor(rand() * arr.length)];
}

// ─── Types ──────────────────────────────────────────────────────────────────

interface Topic {
  id: number;
  title: string;
  short: string;
  keywords: string[];
}

type VariationType = "story" | "data" | "question";

interface ContentVariation {
  topicId: number;
  type: VariationType;
  label: string;
  hook: string;
  hookDescription: string;
  body: string;
  cta: string;
  coreMessage: string;
}

type Platform = "twitter" | "linkedin" | "instagram";

interface PlatformPost {
  topicId: number;
  variationType: VariationType;
  platform: Platform;
  content: string;
  charCount: number;
  wordCount: number;
  hashtags: string[];
  formatCompliant: boolean;
  complianceNote: string;
}

interface HourlyEngagement {
  day: string;
  hours: number[]; // 24 values, 0-1 scale
}

interface TimingRecommendation {
  platform: Platform;
  bestDay: string;
  bestDayMultiplier: number;
  bestHour: number;
  bestHourConfLow: number;
  bestHourConfHigh: number;
  worstDay: string;
  worstHourStart: number;
  worstHourEnd: number;
  worstMultiplier: number;
  heatmap: HourlyEngagement[];
}

interface EngagementScore {
  topicId: number;
  variationType: VariationType;
  platform: Platform;
  hookStrength: number;
  hashtagRelevance: number;
  lengthOptimization: number;
  ctaClarity: number;
  trendAlignment: number;
  total: number;
}

interface CalendarSlot {
  day: string;
  time: string;
  platform: Platform;
  topicId: number;
  variationType: VariationType;
  variationLabel: string;
  score: number;
}

// ─── Input Data ─────────────────────────────────────────────────────────────

const TOPICS: Topic[] = [
  {
    id: 1,
    title: "Building Resilient Microservices: Lessons from 5 Years in Production",
    short: "Resilient Microservices",
    keywords: ["microservices", "resilience", "production", "distributed", "fallback", "circuit-breaker"],
  },
  {
    id: 2,
    title: "The Developer Experience Revolution: Why DX is the New UX",
    short: "DX Revolution",
    keywords: ["developer-experience", "DX", "UX", "tooling", "productivity", "devtools"],
  },
  {
    id: 3,
    title: "AI-Powered Code Review: Beyond Linting to Semantic Understanding",
    short: "AI Code Review",
    keywords: ["AI", "code-review", "linting", "semantic", "machine-learning", "automation"],
  },
];

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const FULL_DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

interface PlatformHistory {
  avgLikes: number;
  avgShares: number;
  bestTimes: number[];
  topHashtags: string[];
  engagement: HourlyEngagement[];
}

function generateEngagementData(
  peakHours: number[],
  peakDays: number[],
  baseLevel: number
): HourlyEngagement[] {
  return DAYS.map((day, di) => {
    const dayBoost = peakDays.includes(di) ? 1.6 : di >= 5 ? 0.4 : 1.0;
    const hours: number[] = [];
    for (let h = 0; h < 24; h++) {
      let val = baseLevel * dayBoost;
      if (peakHours.includes(h)) val *= 1.5 + randBetween(0, 0.5);
      else if (h >= 0 && h <= 5) val *= 0.1 + randBetween(0, 0.1);
      else if (h >= 6 && h <= 8) val *= 0.6 + randBetween(0, 0.2);
      else val *= 0.5 + randBetween(0, 0.4);
      hours.push(clamp(val, 0, 1));
    }
    return { day, hours };
  });
}

const HISTORICAL_DATA: Record<Platform, PlatformHistory> = {
  twitter: {
    avgLikes: 342,
    avgShares: 87,
    bestTimes: [9, 12, 17],
    topHashtags: ["#microservices", "#devops", "#coding", "#tech", "#webdev"],
    engagement: generateEngagementData([9, 10, 12, 17, 18], [1, 2, 3], 0.5),
  },
  linkedin: {
    avgLikes: 215,
    avgShares: 43,
    bestTimes: [8, 10, 12],
    topHashtags: ["#leadership", "#technology", "#programming", "#career", "#innovation"],
    engagement: generateEngagementData([8, 9, 10, 12], [0, 1, 2], 0.45),
  },
  instagram: {
    avgLikes: 580,
    avgShares: 34,
    bestTimes: [11, 13, 19, 20],
    topHashtags: ["#coding", "#techlife", "#developer", "#ai", "#devlife"],
    engagement: generateEngagementData([11, 12, 13, 19, 20, 21], [2, 4, 6], 0.42),
  },
};

const TRENDING_KEYWORDS = [
  "AI", "microservices", "developer-experience", "observability",
  "platform-engineering", "rust", "WebAssembly", "LLM", "code-review",
  "DevOps", "cloud-native", "DX", "automation", "semantic",
];

// ─── Agent 1: Content Creator ───────────────────────────────────────────────

function createVariations(topic: Topic): ContentVariation[] {
  const variations: ContentVariation[] = [];

  // Variation A — Story angle
  const storyHooks: Record<number, string> = {
    1: "When our payment service crashed at 3 AM during Black Friday, we learned the hard way that resilience isn't optional — it's survival.",
    2: "I spent 6 months building a beautiful API. Then I watched a junior dev struggle for 3 hours just to get it running locally.",
    3: "Last quarter our team reviewed 2,400 pull requests. The AI caught 23 critical bugs that every human reviewer missed.",
  };
  const storyBodies: Record<number, string> = {
    1: "A first-person account of cascading failures across 12 microservices, the 4-hour recovery, and the 3 architecture changes that made the system truly resilient.",
    2: "The journey from \"works on my machine\" to a developer platform that cut onboarding time from 2 weeks to 2 hours — and what it taught us about empathy in engineering.",
    3: "How we integrated an AI review agent into our CI pipeline, the false-positive problem we had to solve, and the semantic patterns it learned to detect.",
  };
  const storyCTAs: Record<number, string> = {
    1: "Share your war story",
    2: "Tell us your onboarding horror",
    3: "Try it on your next PR",
  };

  variations.push({
    topicId: topic.id,
    type: "story",
    label: "Story Angle",
    hook: storyHooks[topic.id],
    hookDescription: "Personal crisis narrative",
    body: storyBodies[topic.id],
    cta: storyCTAs[topic.id],
    coreMessage: `Real-world lessons in ${topic.short.toLowerCase()} through lived experience.`,
  });

  // Variation B — Data angle
  const dataHooks: Record<number, string> = {
    1: "78% of production outages in microservice architectures trace back to just 3 root causes. We analyzed 10,000 incident reports to find them.",
    2: "Teams with great DX ship 2.4x faster and have 60% fewer bugs. Here's the data behind the developer experience revolution.",
    3: "AI-powered code review catches 31% more bugs than human reviewers alone — but only when you move beyond pattern matching to semantic analysis.",
  };
  const dataBodies: Record<number, string> = {
    1: "A data-driven breakdown of failure modes, MTTR benchmarks, and the specific patterns that separate resilient systems from fragile ones.",
    2: "Quantitative analysis of 500 engineering teams: correlation between DX investment and shipping velocity, bug rates, and developer retention.",
    3: "Benchmark results comparing traditional linters, ML-based reviewers, and semantic AI agents across 50,000 pull requests.",
  };
  const dataCTAs: Record<number, string> = {
    1: "Read the full analysis",
    2: "See the full report",
    3: "Download the benchmark",
  };

  variations.push({
    topicId: topic.id,
    type: "data",
    label: "Data Angle",
    hook: dataHooks[topic.id],
    hookDescription: "Surprising statistic",
    body: dataBodies[topic.id],
    cta: dataCTAs[topic.id],
    coreMessage: `Hard numbers proving the value of ${topic.short.toLowerCase()}.`,
  });

  // Variation C — Question angle
  const questionHooks: Record<number, string> = {
    1: "What's the most expensive microservice mistake your team has made?",
    2: "If your DX is so bad that new hires dread their first commit — is that a tooling problem or a culture problem?",
    3: "Would you trust an AI to approve your pull requests without human review?",
  };
  const questionBodies: Record<number, string> = {
    1: "Inviting engineers to share their costliest distributed systems failures and the lessons they'd pass on.",
    2: "A provocative exploration of whether DX failures are technical debt or leadership debt — and why the distinction matters.",
    3: "A debate-starter about the trust boundary between human judgment and machine analysis in code quality.",
  };
  const questionCTAs: Record<number, string> = {
    1: "Comment below",
    2: "Vote in the poll",
    3: "Share your take",
  };

  variations.push({
    topicId: topic.id,
    type: "question",
    label: "Question Angle",
    hook: questionHooks[topic.id],
    hookDescription: "Provocative question",
    body: questionBodies[topic.id],
    cta: questionCTAs[topic.id],
    coreMessage: `Sparking debate around ${topic.short.toLowerCase()}.`,
  });

  return variations;
}

// ─── Agent 2: Platform Optimizer ────────────────────────────────────────────

function optimizeForTwitter(variation: ContentVariation, topic: Topic): PlatformPost {
  const hashtags = HISTORICAL_DATA.twitter.topHashtags
    .filter((h) => topic.keywords.some((k) => h.toLowerCase().includes(k.toLowerCase().slice(0, 4))))
    .slice(0, 3);
  while (hashtags.length < 5) {
    const candidate = `#${topic.keywords[hashtags.length % topic.keywords.length].replace(/-/g, "")}`;
    if (!hashtags.includes(candidate)) hashtags.push(candidate);
  }

  const hookShort = variation.hook.length > 180 ? variation.hook.slice(0, 177) + "..." : variation.hook;
  const hashStr = hashtags.slice(0, 5).join(" ");
  let tweet = `${hookShort}\n\n${hashStr}`;

  if (tweet.length > 280) {
    const maxHook = 280 - hashStr.length - 3;
    tweet = `${variation.hook.slice(0, maxHook).trimEnd()}…\n\n${hashStr}`;
  }
  if (tweet.length > 280) {
    tweet = tweet.slice(0, 277) + "...";
  }

  return {
    topicId: topic.id,
    variationType: variation.type,
    platform: "twitter",
    content: tweet,
    charCount: tweet.length,
    wordCount: tweet.split(/\s+/).length,
    hashtags: hashtags.slice(0, 5),
    formatCompliant: tweet.length <= 280,
    complianceNote: tweet.length <= 280 ? `${tweet.length}/280 chars ✓` : `${tweet.length}/280 chars ✗ OVER LIMIT`,
  };
}

function optimizeForLinkedIn(variation: ContentVariation, topic: Topic): PlatformPost {
  const hashtags = [`#${topic.keywords[0].replace(/-/g, "")}`, "#technology", "#engineering"].slice(0, 3);

  const paragraphs = [
    variation.hook,
    "",
    variation.body,
    "",
    `${variation.coreMessage}`,
    "",
    `${variation.cta} — I'd love to hear your perspective in the comments.`,
    "",
    hashtags.join(" "),
  ];
  const content = paragraphs.join("\n");
  const wordCount = content.split(/\s+/).length;
  const compliant = wordCount >= 150 && wordCount <= 300;

  return {
    topicId: topic.id,
    variationType: variation.type,
    platform: "linkedin",
    content,
    charCount: content.length,
    wordCount,
    hashtags,
    formatCompliant: compliant,
    complianceNote: compliant ? `${wordCount} words ✓` : `${wordCount} words (target 150-300)`,
  };
}

function optimizeForInstagram(variation: ContentVariation, topic: Topic): PlatformPost {
  const emojis = ["💥", "🚀", "🔥", "💡", "⚡", "🎯", "✨", "🧠", "💻", "🛠️"];
  const e = () => pick(emojis);

  const hashtags = [
    `#${topic.keywords[0].replace(/-/g, "")}`,
    "#coding", "#techlife", "#developer", "#devlife",
    "#softwaredeveloper", `#${topic.keywords[1].replace(/-/g, "")}`,
    "#learntocode",
  ].slice(0, randInt(5, 10));

  const hookWords = variation.hook.split(/[.!?]/)[0];
  const lines = [
    `${e()} ${hookWords.toUpperCase()}`,
    "",
    `${e()} ${variation.body.split(".").slice(0, 2).join(".")}. ${e()}`,
    "",
    `${e()} ${variation.cta}!`,
    "",
    "—",
    `${e()} Save this for later | ${e()} Share with a dev friend`,
    "",
    hashtags.join(" "),
  ];
  const content = lines.join("\n");

  return {
    topicId: topic.id,
    variationType: variation.type,
    platform: "instagram",
    content,
    charCount: content.length,
    wordCount: content.split(/\s+/).length,
    hashtags,
    formatCompliant: true,
    complianceNote: `${hashtags.length} hashtags, emoji-rich ✓`,
  };
}

function optimizeForPlatform(variation: ContentVariation, topic: Topic, platform: Platform): PlatformPost {
  switch (platform) {
    case "twitter":
      return optimizeForTwitter(variation, topic);
    case "linkedin":
      return optimizeForLinkedIn(variation, topic);
    case "instagram":
      return optimizeForInstagram(variation, topic);
  }
}

// ─── Agent 3: Timing Analyst ────────────────────────────────────────────────

function analyzeTiming(platform: Platform): TimingRecommendation {
  const data = HISTORICAL_DATA[platform];
  const heatmap = data.engagement;

  // Find best day
  const dayAvgs = heatmap.map((d) => {
    const sum = d.hours.reduce((a, b) => a + b, 0);
    return sum / d.hours.length;
  });
  const overallAvg = dayAvgs.reduce((a, b) => a + b, 0) / dayAvgs.length;

  let bestDayIdx = 0;
  let worstDayIdx = 0;
  for (let i = 0; i < dayAvgs.length; i++) {
    if (dayAvgs[i] > dayAvgs[bestDayIdx]) bestDayIdx = i;
    if (dayAvgs[i] < dayAvgs[worstDayIdx]) worstDayIdx = i;
  }

  // Find best hour across all days
  let bestHour = 0;
  let bestHourVal = 0;
  for (let h = 0; h < 24; h++) {
    const avg = heatmap.reduce((s, d) => s + d.hours[h], 0) / heatmap.length;
    if (avg > bestHourVal) {
      bestHourVal = avg;
      bestHour = h;
    }
  }

  // Find worst contiguous block
  let worstStart = 0;
  let worstEnd = 0;
  let worstBlockAvg = Infinity;
  for (let start = 0; start < 24; start++) {
    for (let len = 2; len <= 4; len++) {
      const end = start + len;
      if (end > 24) break;
      let blockSum = 0;
      for (let h = start; h < end; h++) {
        blockSum += heatmap.reduce((s, d) => s + d.hours[h], 0) / heatmap.length;
      }
      const blockAvg = blockSum / len;
      if (blockAvg < worstBlockAvg) {
        worstBlockAvg = blockAvg;
        worstStart = start;
        worstEnd = end;
      }
    }
  }

  return {
    platform,
    bestDay: DAYS[bestDayIdx],
    bestDayMultiplier: Math.round((dayAvgs[bestDayIdx] / overallAvg) * 10) / 10,
    bestHour,
    bestHourConfLow: Math.max(0, bestHour - 1),
    bestHourConfHigh: Math.min(23, bestHour + 1),
    worstDay: DAYS[worstDayIdx],
    worstHourStart: worstStart,
    worstHourEnd: worstEnd,
    worstMultiplier: Math.round((worstBlockAvg / overallAvg) * 10) / 10,
    heatmap,
  };
}

function renderHeatmap(heatmap: HourlyEngagement[]): string {
  const blocks = ["░", "▒", "▓", "█"];
  const lines: string[] = [];
  for (const row of heatmap) {
    const bar = row.hours
      .map((v) => {
        const idx = Math.min(3, Math.floor(v * 4));
        return blocks[idx];
      })
      .join("");
    lines.push(`  ${rpad(row.day, 4)}: ${bar}`);
  }
  return lines.join("\n");
}

function formatHour(h: number): string {
  const ampm = h >= 12 ? "PM" : "AM";
  const hr = h === 0 ? 12 : h > 12 ? h - 12 : h;
  return `${hr}:00 ${ampm}`;
}

// ─── Agent 4: Engagement Predictor ──────────────────────────────────────────

function predictEngagement(
  variation: ContentVariation,
  post: PlatformPost,
  timing: TimingRecommendation,
  topic: Topic
): EngagementScore {
  // Hook strength (weight 0.25)
  const hookScores: Record<VariationType, number> = {
    story: 0.9,
    data: 0.7,
    question: 0.8,
  };
  const hookStrength = hookScores[variation.type];

  // Hashtag relevance (weight 0.15) — overlap with historical top hashtags
  const platformTags = HISTORICAL_DATA[post.platform].topHashtags.map((t) => t.toLowerCase());
  const matchCount = post.hashtags.filter((h) => platformTags.includes(h.toLowerCase())).length;
  const hashtagRelevance = clamp(matchCount / Math.max(1, post.hashtags.length), 0, 1);

  // Length optimization (weight 0.20)
  let lengthOptimization: number;
  if (post.platform === "twitter") {
    const ideal = 240;
    lengthOptimization = 1 - Math.abs(post.charCount - ideal) / 280;
  } else if (post.platform === "linkedin") {
    const ideal = 220;
    lengthOptimization = 1 - Math.abs(post.wordCount - ideal) / 300;
  } else {
    lengthOptimization = post.hashtags.length >= 5 ? 0.85 : 0.6;
  }
  lengthOptimization = clamp(lengthOptimization, 0, 1);

  // CTA clarity (weight 0.15)
  const ctaKeywords = ["share", "comment", "try", "read", "download", "vote", "tell"];
  const ctaClarity = ctaKeywords.some((k) => variation.cta.toLowerCase().includes(k)) ? 0.85 : 0.5;

  // Trend alignment (weight 0.25)
  const keywordOverlap = topic.keywords.filter((k) =>
    TRENDING_KEYWORDS.some((t) => t.toLowerCase() === k.toLowerCase())
  ).length;
  const trendAlignment = clamp(keywordOverlap / 3, 0, 1);

  const total = Math.round(
    (hookStrength * 0.25 +
      hashtagRelevance * 0.15 +
      lengthOptimization * 0.20 +
      ctaClarity * 0.15 +
      trendAlignment * 0.25) *
      100
  );

  return {
    topicId: topic.id,
    variationType: variation.type,
    platform: post.platform,
    hookStrength: Math.round(hookStrength * 100),
    hashtagRelevance: Math.round(hashtagRelevance * 100),
    lengthOptimization: Math.round(lengthOptimization * 100),
    ctaClarity: Math.round(ctaClarity * 100),
    trendAlignment: Math.round(trendAlignment * 100),
    total,
  };
}

// ─── Calendar Builder ───────────────────────────────────────────────────────

function buildCalendar(
  scores: EngagementScore[],
  timings: TimingRecommendation[],
  variations: ContentVariation[]
): CalendarSlot[] {
  const sorted = [...scores].sort((a, b) => b.total - a.total);
  const slots: CalendarSlot[] = [];
  const usedDayPlatform = new Set<string>();

  const timingMap = new Map(timings.map((t) => [t.platform, t]));
  const variationMap = new Map(
    variations.map((v) => [`${v.topicId}-${v.type}`, v])
  );

  // Spread across the week — one post per platform per day max
  const daySlots: Record<string, CalendarSlot[]> = {};
  for (const day of FULL_DAYS) daySlots[day] = [];

  for (const score of sorted) {
    const timing = timingMap.get(score.platform)!;
    // Find best available day for this platform
    for (const dayOffset of [0, 1, -1, 2, -2, 3, -3]) {
      const baseDayIdx = DAYS.indexOf(timing.bestDay);
      const dayIdx = ((baseDayIdx + dayOffset) % 7 + 7) % 7;
      const day = FULL_DAYS[dayIdx];
      const key = `${day}-${score.platform}`;
      if (usedDayPlatform.has(key)) continue;
      if (daySlots[day].length >= 2) continue;

      const variation = variationMap.get(`${score.topicId}-${score.variationType}`)!;
      const hour = timing.bestHour + (daySlots[day].length > 0 ? 2 : 0);
      const timeStr = `${String(hour).padStart(2, "0")}:${daySlots[day].length === 0 ? "00" : "30"}`;

      slots.push({
        day,
        time: timeStr,
        platform: score.platform,
        topicId: score.topicId,
        variationType: score.variationType,
        variationLabel: variation.label,
        score: score.total,
      });
      usedDayPlatform.add(key);
      daySlots[day].push(slots[slots.length - 1]);
      break;
    }
    if (slots.length >= 10) break;
  }

  // Sort by day order then time
  slots.sort((a, b) => {
    const da = FULL_DAYS.indexOf(a.day);
    const db = FULL_DAYS.indexOf(b.day);
    if (da !== db) return da - db;
    return a.time.localeCompare(b.time);
  });

  return slots;
}

// ─── Display Helpers ────────────────────────────────────────────────────────

function printBanner(): void {
  console.log(`
${CYAN}╔══════════════════════════════════════════════════════╗
║${BOLD}      📱 Social Media Content Engine                  ${RESET}${CYAN}║
║${WHITE}      4 Agents • 3 Topics • 3 Platforms              ${RESET}${CYAN}║
╚══════════════════════════════════════════════════════╝${RESET}
`);
}

function printSectionHeader(title: string): void {
  const line = "━".repeat(54);
  console.log(`\n${BOLD}${CYAN}${line}${RESET}`);
  console.log(`${BOLD}  ${title}${RESET}`);
  console.log(`${CYAN}${line}${RESET}\n`);
}

function printVariation(v: ContentVariation): void {
  console.log(`  ${BOLD}Variation ${v.type === "story" ? "A" : v.type === "data" ? "B" : "C"} — ${v.label}:${RESET}`);
  // Word-wrap the hook for display
  const hookLines = wordWrap(v.hook, 60);
  for (const line of hookLines) {
    console.log(`  ${DIM}"${line}"${RESET}`);
  }
  console.log(`  ${MAGENTA}Hook:${RESET} ${v.hookDescription} | ${MAGENTA}CTA:${RESET} ${v.cta}`);
  console.log();
}

function wordWrap(text: string, maxLen: number): string[] {
  const words = text.split(" ");
  const lines: string[] = [];
  let current = "";
  for (const word of words) {
    if (current.length + word.length + 1 > maxLen && current.length > 0) {
      lines.push(current);
      current = word;
    } else {
      current = current.length === 0 ? word : current + " " + word;
    }
  }
  if (current.length > 0) lines.push(current);
  return lines;
}

function printPlatformPost(post: PlatformPost): void {
  const platformName = post.platform.charAt(0).toUpperCase() + post.platform.slice(1);
  const compliantColor = post.formatCompliant ? GREEN : RED;
  console.log(`  ${BOLD}${platformName}${RESET} (${compliantColor}${post.complianceNote}${RESET}):`);
  const lines = post.content.split("\n").slice(0, 6);
  for (const line of lines) {
    console.log(`  ${DIM}  ${line}${RESET}`);
  }
  if (post.content.split("\n").length > 6) {
    console.log(`  ${DIM}  ...${RESET}`);
  }
  console.log();
}

function printTimingAnalysis(rec: TimingRecommendation): void {
  const platformName = rec.platform.charAt(0).toUpperCase() + rec.platform.slice(1);
  console.log(`  ${BOLD}${platformName} Engagement Heatmap (by hour, EST):${RESET}`);
  console.log(`  ${DIM}      00 02 04 06 08 10 12 14 16 18 20 22${RESET}`);
  console.log(renderHeatmap(rec.heatmap));
  console.log();
  console.log(`  ${GREEN}🏆 Best:${RESET}  ${rec.bestDay} ${formatHour(rec.bestHour)} EST (${rec.bestDayMultiplier}x avg engagement)`);
  console.log(`  ${RED}⚠️  Avoid:${RESET} ${rec.worstDay} ${formatHour(rec.worstHourStart)}-${formatHour(rec.worstHourEnd)} (${rec.worstMultiplier}x avg engagement)`);
  console.log();
}

function printScoreMatrix(scores: EngagementScore[]): void {
  const varLabels: Record<VariationType, string> = { story: "VarA", data: "VarB", question: "VarC" };
  const platforms: Platform[] = ["twitter", "linkedin", "instagram"];

  console.log(`  ┌──────────────┬──────────┬──────────┬──────────────┐`);
  console.log(`  │ ${BOLD}Content${RESET}      │ ${BOLD}Twitter${RESET}  │ ${BOLD}LinkedIn${RESET} │ ${BOLD}Instagram${RESET}    │`);
  console.log(`  ├──────────────┼──────────┼──────────┼──────────────┤`);

  for (const topic of TOPICS) {
    for (const vt of ["story", "data", "question"] as VariationType[]) {
      const label = `T${topic.id}-${varLabels[vt]}`;
      const cells = platforms.map((p) => {
        const s = scores.find(
          (sc) => sc.topicId === topic.id && sc.variationType === vt && sc.platform === p
        );
        if (!s) return rpad("--", 8);
        const emoji = scoreEmoji(s.total);
        const color = scoreColor(s.total);
        return `${color}${s.total}${emoji}${RESET}`;
      });

      // For alignment, compute visual length (without ANSI)
      const rawCells = platforms.map((p) => {
        const s = scores.find(
          (sc) => sc.topicId === topic.id && sc.variationType === vt && sc.platform === p
        );
        if (!s) return "--";
        return `${s.total}${scoreEmoji(s.total)}`;
      });

      const padCell = (colored: string, raw: string, width: number) => {
        const padding = Math.max(0, width - raw.length);
        return colored + " ".repeat(padding);
      };

      console.log(
        `  │ ${rpad(label, 12)} │ ${padCell(cells[0], rawCells[0], 8)} │ ${padCell(cells[1], rawCells[1], 8)} │ ${padCell(cells[2], rawCells[2], 12)} │`
      );
    }
  }
  console.log(`  └──────────────┴──────────┴──────────┴──────────────┘`);
}

function printGoldenPosts(scores: EngagementScore[], variations: ContentVariation[]): void {
  const sorted = [...scores].sort((a, b) => b.total - a.total);
  const top3 = sorted.slice(0, 3);
  const varLabels: Record<VariationType, string> = { story: "Var A", data: "Var B", question: "Var C" };

  console.log(`\n  ${BOLD}🏆 GOLDEN POSTS (Top 3):${RESET}`);
  top3.forEach((s, i) => {
    const topic = TOPICS.find((t) => t.id === s.topicId)!;
    const platformName = s.platform.charAt(0).toUpperCase() + s.platform.slice(1);
    const variation = variations.find((v) => v.topicId === s.topicId && v.type === s.variationType)!;
    console.log(
      `  ${BOLD}${i + 1}.${RESET} Topic ${s.topicId}, ${varLabels[s.variationType]} (${variation.label}) on ${platformName} — ${GREEN}Score: ${s.total}${RESET}`
    );
  });
}

function printCalendar(slots: CalendarSlot[]): void {
  const width = 65;
  const platformColors: Record<Platform, string> = {
    twitter: CYAN,
    linkedin: MAGENTA,
    instagram: YELLOW,
  };
  const varLabels: Record<VariationType, string> = { story: "Story", data: "Data", question: "Question" };

  console.log();
  console.log(`${CYAN}╔${"═".repeat(width)}╗${RESET}`);
  console.log(`${CYAN}║${RESET}${BOLD}                    📅 WEEKLY CONTENT CALENDAR                  ${RESET}${CYAN}║${RESET}`);
  console.log(`${CYAN}╠${"═".repeat(width)}╣${RESET}`);

  let currentDay = "";
  for (const slot of slots) {
    if (slot.day !== currentDay) {
      if (currentDay !== "") {
        console.log(`${CYAN}╠${"─".repeat(width)}╣${RESET}`);
      }
      currentDay = slot.day;
      console.log(`${CYAN}║${RESET} ${BOLD}${rpad(slot.day, width - 2)}${RESET} ${CYAN}║${RESET}`);
    }
    const platformName = rpad(
      slot.platform.charAt(0).toUpperCase() + slot.platform.slice(1),
      9
    );
    const color = platformColors[slot.platform];
    const varLabel = varLabels[slot.variationType];
    const entry = `  ${slot.time} ${color}${platformName}${RESET} — T${slot.topicId} ${varLabel} ${DIM}(${slot.variationLabel})${RESET} — ${scoreColor(slot.score)}Score: ${slot.score}${RESET}`;
    // Pad to width accounting for ANSI codes
    console.log(`${CYAN}║${RESET}${entry}${CYAN}${RESET}`);
  }

  console.log(`${CYAN}╚${"═".repeat(width)}╝${RESET}`);
}

// ─── Main Orchestration ─────────────────────────────────────────────────────

async function main(): Promise<void> {
  printBanner();

  // ── Phase 1: Content Creator ──────────────────────────────
  printSectionHeader("🎨 Agent 1: Content Creator");
  const allVariations: ContentVariation[] = [];

  for (const topic of TOPICS) {
    console.log(`${BOLD}━━━ Topic ${topic.id}: ${topic.short} ━━━${RESET}\n`);
    console.log(`${DIM}🎨 Content Creator generating variations...${RESET}\n`);
    await sleep(200);

    const vars = createVariations(topic);
    allVariations.push(...vars);

    for (const v of vars) {
      printVariation(v);
      await sleep(150);
    }
  }

  // ── Phase 2: Platform Optimizer ───────────────────────────
  printSectionHeader("📲 Agent 2: Platform Optimizer");
  const allPosts: PlatformPost[] = [];
  const platforms: Platform[] = ["twitter", "linkedin", "instagram"];

  for (const variation of allVariations) {
    const topic = TOPICS.find((t) => t.id === variation.topicId)!;
    const varLabel = variation.type === "story" ? "A" : variation.type === "data" ? "B" : "C";
    console.log(
      `${DIM}📲 Platform Optimizer adapting T${topic.id}-Var${varLabel} (${variation.label})...${RESET}\n`
    );
    await sleep(200);

    for (const platform of platforms) {
      const post = optimizeForPlatform(variation, topic, platform);
      allPosts.push(post);
      printPlatformPost(post);
      await sleep(150);
    }
  }

  // ── Phase 3: Timing Analyst ───────────────────────────────
  printSectionHeader("⏰ Agent 3: Timing Analyst");
  const timings: TimingRecommendation[] = [];

  for (const platform of platforms) {
    const platformName = platform.charAt(0).toUpperCase() + platform.slice(1);
    console.log(`${DIM}⏰ Timing Analyst processing ${platformName} engagement data...${RESET}\n`);
    await sleep(250);

    const rec = analyzeTiming(platform);
    timings.push(rec);
    printTimingAnalysis(rec);
    await sleep(200);
  }

  // ── Phase 4: Engagement Predictor ─────────────────────────
  printSectionHeader("📊 Agent 4: Engagement Predictor");
  console.log(`${DIM}📊 Engagement Predictor scoring all combinations...${RESET}\n`);
  await sleep(300);

  const allScores: EngagementScore[] = [];
  for (const variation of allVariations) {
    const topic = TOPICS.find((t) => t.id === variation.topicId)!;
    for (const post of allPosts.filter(
      (p) => p.topicId === variation.topicId && p.variationType === variation.type
    )) {
      const timing = timings.find((t) => t.platform === post.platform)!;
      const score = predictEngagement(variation, post, timing, topic);
      allScores.push(score);
    }
  }

  printScoreMatrix(allScores);
  printGoldenPosts(allScores, allVariations);

  // ── Phase 5: Weekly Calendar ──────────────────────────────
  printSectionHeader("📅 Weekly Content Calendar");
  const calendar = buildCalendar(allScores, timings, allVariations);
  printCalendar(calendar);

  console.log(`\n${GREEN}${BOLD}✅ Content engine complete — ${allScores.length} combinations scored, ${calendar.length} posts scheduled.${RESET}\n`);
}

main().catch(console.error);
