// ─────────────────────────────────────────────────────────────
// 🎙️  Podcast Processor — Multi-Agent Transcript Analysis
//     Zero external dependencies · TypeScript · Node 18+
// ─────────────────────────────────────────────────────────────

// ── ANSI helpers ────────────────────────────────────────────
const RESET = "\x1b[0m";
const BOLD = "\x1b[1m";
const DIM = "\x1b[2m";
const ITALIC = "\x1b[3m";
const UNDERLINE = "\x1b[4m";

const RED = "\x1b[31m";
const GREEN = "\x1b[32m";
const YELLOW = "\x1b[33m";
const BLUE = "\x1b[34m";
const MAGENTA = "\x1b[35m";
const CYAN = "\x1b[36m";
const WHITE = "\x1b[37m";
const GRAY = "\x1b[90m";

const BG_BLUE = "\x1b[44m";
const BG_CYAN = "\x1b[46m";
const BG_MAGENTA = "\x1b[45m";
const BG_GREEN = "\x1b[42m";
const BG_YELLOW = "\x1b[43m";
const BG_RED = "\x1b[41m";
const BG_WHITE = "\x1b[47m";

function banner(title: string, color: string = BG_BLUE): void {
  const pad = 60;
  const line = "═".repeat(pad);
  console.log(`\n${color}${BOLD}${WHITE} ${"═".repeat(pad)} ${RESET}`);
  console.log(`${color}${BOLD}${WHITE}  ${title.padEnd(pad - 1)}${RESET}`);
  console.log(`${color}${BOLD}${WHITE} ${line} ${RESET}\n`);
}

function sectionHeader(label: string, emoji: string = "▸"): void {
  console.log(`\n${BOLD}${CYAN}${emoji} ${label}${RESET}`);
  console.log(`${CYAN}${"─".repeat(58)}${RESET}`);
}

function box(lines: string[], color: string = CYAN, title?: string): void {
  const maxLen = Math.max(...lines.map((l) => stripAnsi(l).length), title ? stripAnsi(title).length + 4 : 0, 40);
  const top = `${color}╭${"─".repeat(maxLen + 2)}╮${RESET}`;
  const bot = `${color}╰${"─".repeat(maxLen + 2)}╯${RESET}`;
  console.log(top);
  if (title) {
    console.log(`${color}│${RESET} ${BOLD}${title.padEnd(maxLen)}${RESET} ${color}│${RESET}`);
    console.log(`${color}├${"─".repeat(maxLen + 2)}┤${RESET}`);
  }
  for (const l of lines) {
    const visible = stripAnsi(l).length;
    const padding = maxLen - visible;
    console.log(`${color}│${RESET} ${l}${" ".repeat(Math.max(0, padding))} ${color}│${RESET}`);
  }
  console.log(bot);
}

function stripAnsi(s: string): string {
  return s.replace(/\x1b\[[0-9;]*m/g, "");
}

function bar(value: number, max: number, width: number = 30, color: string = GREEN): string {
  const filled = Math.round((value / max) * width);
  return `${color}${"█".repeat(filled)}${DIM}${"░".repeat(width - filled)}${RESET}`;
}

function progressDots(label: string, ms: number): Promise<void> {
  return new Promise((resolve) => {
    process.stdout.write(`  ${GRAY}${label}`);
    let dots = 0;
    const iv = setInterval(() => {
      process.stdout.write(".");
      dots++;
    }, ms / 5);
    setTimeout(() => {
      clearInterval(iv);
      process.stdout.write(` done${RESET}\n`);
      resolve();
    }, ms);
  });
}

// ── Embedded Podcast Transcript (raw, no labels) ───────────
const RAW_TRANSCRIPT = `
Welcome to Code Horizons, the podcast where we explore the bleeding edge of software development. I'm your host Alex Chen, and today I have an incredible guest joining us. Dr. Sarah Martinez is a principal AI researcher at Nexus Labs, where she leads the applied intelligence team. Sarah, thanks so much for being here today.

Thank you, Alex. It's a pleasure to be on the show. I've been a listener for a while, so it feels a bit surreal to be on this side of the microphone.

Well, we're thrilled to have you. Let's dive right in. Your team at Nexus Labs has been doing some groundbreaking work on AI-assisted development tools. Can you give us the big picture of where AI pair programming is right now?

Absolutely. So the landscape has shifted dramatically in just the past eighteen months. We've gone from AI that could autocomplete a line of code to systems that genuinely understand architectural intent. When I started in this field, the best we could hope for was glorified copy-paste from Stack Overflow. Now we have models that can reason about entire codebases.

That's a huge leap. What does that look like in practice for a developer sitting down at their desk on a Monday morning?

Great question. Imagine you're working on a microservices application and you need to add a new payment processing module. Today's AI tools can look at your existing service boundaries, understand your authentication patterns, your error handling conventions, and generate not just the code, but the tests, the API documentation, and even suggest infrastructure changes. It's like having a senior developer who has read every line of your codebase sitting right next to you.

That sounds almost too good to be true. Are there limitations we should be honest about?

Oh, absolutely. The technology is powerful but it's not magic. The biggest limitation right now is what I call the context window trap. These models can hold a lot of information, but they still struggle with truly massive codebases. If your monolith has two million lines of code, the AI is working with a flashlight, not a floodlight. It sees brilliantly in a narrow cone but misses the bigger picture.

I love that analogy. The flashlight versus floodlight. So let's talk about something that gets a lot of debate. How is AI pair programming affecting junior developers? There's a camp that says it's the best thing ever for learning, and another that says it's creating a generation that can't code without assistance.

This is the question that keeps me up at night, honestly. I think both camps have valid points, but the reality is more nuanced. What we're seeing in our research is that AI tools can be an incredible accelerator for junior developers when used intentionally. The key word there is intentionally.

Can you unpack that a bit? What does intentional use look like?

Sure. Intentional use means treating the AI as a teaching assistant, not an answer key. When a junior developer gets a suggestion from an AI tool, they should be asking three questions. First, what is this code doing? Second, why did the AI choose this approach? And third, what are the alternatives? If they just hit tab-accept without thinking, they're building on sand.

That's a fantastic framework. The three questions. Have you seen organizations implement this successfully?

We actually worked with a fintech startup, about two hundred developers, where they implemented what they called reflective pairing. Every AI suggestion had to be accompanied by a brief annotation explaining why the developer accepted it. Initially there was pushback, people thought it would slow them down. But after three months, their code review rejection rate dropped by forty percent and junior developer ramp-up time decreased by nearly a third.

Those are remarkable numbers. Let's shift gears a bit. I want to talk about the ethical dimensions of AI in software development. What concerns you most?

The thing that concerns me most is what I call algorithmic monoculture. When millions of developers are using the same AI models trained on the same data, there's a real risk that we start producing homogeneous code. Software diversity is actually a security feature. If every application handles authentication the same way because the AI suggested the same pattern, a single vulnerability becomes a systemic risk.

That's a perspective I haven't heard before. Algorithmic monoculture. Is there data supporting this concern?

We published a paper last year where we analyzed fifty thousand pull requests across open source projects. We found that repositories where developers heavily used AI assistance showed a thirty-one percent reduction in unique solution patterns. The code quality was actually slightly higher on average, but the diversity of approaches decreased significantly. It's like an ecosystem where every species looks the same. It might seem efficient, but it's fragile.

Fascinating and a little terrifying. What about the bias question? AI models are trained on existing code, which was written by a historically non-diverse group of developers.

You're hitting on something critical. The training data reflects decades of software development culture, including its blind spots. We've found that AI coding tools are significantly less effective when working with codebases that serve underrepresented communities. For example, right-to-left language support, accessibility features, and localization patterns are underrepresented in training data, which means the AI is less helpful precisely where help is needed most.

Is there a path forward on that front?

I believe so, but it requires deliberate effort. We need diverse training data, diverse teams building these tools, and explicit evaluation metrics that measure performance across different contexts. At Nexus Labs, we've started what we call equity audits for our AI tools, specifically testing how well they perform on accessibility-focused code, internationalization, and codebases from different cultural contexts.

Let's look ahead. If you had to paint a picture of software development five years from now, what would it look like?

Five years is an eternity in AI, so I'll hedge my predictions a bit. But I think we'll see three major shifts. First, the death of boilerplate. Not just code completion, but entire categories of repetitive software engineering tasks will be fully automated. Writing CRUD endpoints, setting up CI pipelines, configuring infrastructure as code. These will be one-click operations.

What's the second shift?

The second shift is what I call intent-driven development. Instead of writing code that describes how to do something, developers will describe what they want to achieve and the AI will figure out the implementation. We're already seeing early versions of this with natural language to code tools, but in five years, I think we'll have systems that can take a product requirements document and generate a working prototype in hours, not weeks.

And the third?

The third shift is the most profound and the most controversial. I believe we'll see the emergence of AI software architects. Not replacing human architects, but augmenting them. Systems that can analyze millions of production applications, understand what patterns succeed and fail at scale, and provide real-time architectural guidance. The best software architecture decisions in 2029 will be informed by data from every public codebase ever written.

That's an incredible vision. Let me push back a little though. If AI can do all of this, what's left for human developers?

I get this question a lot, and I think it fundamentally misunderstands the nature of software development. The hardest part of building software has never been writing code. It's understanding what to build and why. It's navigating ambiguity, making trade-offs between competing values, understanding the human context of the problem. AI will handle more of the how, which frees developers to focus on the what and the why. That's actually an elevation of the profession, not a diminishment.

I really appreciate that perspective. So for developers listening right now who might be feeling anxious about all of this, what practical advice would you give?

Three things. First, invest in the skills that AI can't replicate. Communication, empathy, systems thinking, domain expertise. These are your moat. A developer who deeply understands healthcare and can communicate with doctors will be infinitely more valuable than one who can write algorithms faster than an AI.

What's number two?

Second, become AI-fluent. Not necessarily an AI expert, but fluent. Understand how these tools work, their strengths and limitations. Learn prompt engineering, not because it's a party trick, but because it's becoming a fundamental skill like typing or using version control. The developers who thrive will be the ones who can effectively collaborate with AI systems.

And the third piece of advice?

Third, and this is the most important one, stay curious and build things. The developers who will struggle are the ones who stop building and start worrying. Every major technological shift in our industry has created more opportunities than it destroyed. The web didn't kill desktop developers, it created a new universe of work. Mobile didn't kill web developers, it expanded the field. AI will do the same, but only for those who lean into it rather than away from it.

That's incredibly empowering. Before we wrap up, I want to do a quick lightning round. Ready?

Let's do it.

What's the most overhyped AI development tool right now?

Anything that claims to replace the entire development team. We're decades away from that, if it's even desirable. The tools that try to do everything end up doing nothing well.

Most underhyped?

AI-powered code review tools. They're quietly revolutionizing code quality and catching bugs that humans consistently miss. The tooling for static analysis augmented with machine learning is genuinely transformative and nobody is talking about it enough.

One programming language every developer should learn in 2025?

Rust. Not because everyone will write Rust daily, but because understanding ownership, memory safety, and systems thinking will make you a better developer in every language. Rust teaches you to think about the machine, which is exactly the skill set that complements AI assistance.

Last one. If you could send a message to every computer science student graduating this year, what would it be?

You are entering the most exciting era in the history of software development. The tools at your disposal would have seemed like science fiction five years ago. Don't be intimidated by AI. It's the most powerful amplifier of human creativity we've ever built. Learn to wield it, question it, and shape it. The future of software isn't AI versus humans. It's AI and humans building things that neither could build alone.

Dr. Sarah Martinez, this has been an absolutely fascinating conversation. Thank you for sharing your insights and your time with us today.

Thank you, Alex. This was a wonderful conversation, and I hope it helps some folks out there feel more excited than anxious about what's ahead.

And that's a wrap for this episode of Code Horizons. If you enjoyed this conversation, make sure to subscribe, leave a review, and share it with a fellow developer who needs to hear this. Until next time, keep coding, keep learning, and keep pushing the boundaries. See you next week.
`.trim();

// ── Types ───────────────────────────────────────────────────
interface TranscriptLine {
  speaker: string;
  text: string;
  timestamp: string;
  wordCount: number;
}

interface ChapterMarker {
  timestamp: string;
  title: string;
  lineIndex: number;
  keywords: string[];
}

interface QuoteCandidate {
  text: string;
  speaker: string;
  brevityScore: number;
  insightScore: number;
  standaloneScore: number;
  emotionScore: number;
  totalScore: number;
}

interface TopicDistribution {
  topic: string;
  percentage: number;
  keywords: string[];
}

// ── Utility functions ───────────────────────────────────────
function wordCount(s: string): number {
  return s.split(/\s+/).filter(Boolean).length;
}

function formatTimestamp(totalSeconds: number): string {
  const m = Math.floor(totalSeconds / 60);
  const s = Math.floor(totalSeconds % 60);
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

// ── AGENT 1: Transcript Formatter ──────────────────────────
async function agentTranscriptFormatter(raw: string): Promise<TranscriptLine[]> {
  banner("AGENT 1 ─ Transcript Formatter", BG_BLUE);
  await progressDots("Analyzing speech patterns and identifying speakers", 400);
  await progressDots("Assigning timestamps based on word-rate model", 300);

  const paragraphs = raw.split(/\n\n+/).map((p) => p.trim()).filter(Boolean);

  // Heuristic speaker identification:
  // Alex Chen (host): asks questions, uses "welcome", "let's", "I want to", interrogatives
  // Dr. Sarah Martinez (guest): longer answers, technical language, "we", "our research"
  const hostPatterns = [
    /\bwelcome\b/i, /\blet'?s\b/i, /\byour host\b/i, /\?$/,
    /\bI want to\b/i, /\bcan you\b/i, /\btell us\b/i,
    /\bthat's a wrap\b/i, /\bsubscribe\b/i, /\blightning round\b/i,
    /\bpush back\b/i, /\blet me\b/i, /\bwhat does\b/i,
    /\bhow is\b/i, /\bfor developers listening\b/i,
    /\bwhat's number\b/i, /\band the third\b/i,
    /\bready\?/i, /\blast one\b/i, /\bbefore we wrap/i,
  ];
  const guestPatterns = [
    /\bour research\b/i, /\bat nexus labs\b/i, /\bwe published\b/i,
    /\bwe've found\b/i, /\bwe actually\b/i, /\bI believe\b/i,
    /\bthe biggest limitation\b/i, /\bwe need\b/i, /\bthree things\b/i,
    /\bfirst,?\s/i, /\bsecond,?\s/i, /\bthird,?\s/i,
    /\bRust\b/, /\btraining data\b/i, /\bI think\b/i,
    /\bwe started\b/i, /\bpleasure\b/i, /\bfive years\b/i,
  ];

  // We'll track turn-taking to alternate speakers, resolving ambiguity with patterns
  const lines: TranscriptLine[] = [];
  let currentSeconds = 0;
  const wordsPerSecond = 2.5; // ~150 wpm spoken pace

  let lastSpeaker = "";
  for (let i = 0; i < paragraphs.length; i++) {
    const p = paragraphs[i];
    const hostScore = hostPatterns.reduce((acc, rx) => acc + (rx.test(p) ? 1 : 0), 0);
    const guestScore = guestPatterns.reduce((acc, rx) => acc + (rx.test(p) ? 1 : 0), 0);

    let speaker: string;
    if (i === 0 || i === paragraphs.length - 1) {
      speaker = "Alex Chen"; // first & last are host
    } else if (hostScore > guestScore) {
      speaker = "Alex Chen";
    } else if (guestScore > hostScore) {
      speaker = "Dr. Sarah Martinez";
    } else {
      // Alternate when tied
      speaker = lastSpeaker === "Alex Chen" ? "Dr. Sarah Martinez" : "Alex Chen";
    }

    const wc = wordCount(p);
    const duration = wc / wordsPerSecond;

    lines.push({
      speaker,
      text: p,
      timestamp: formatTimestamp(currentSeconds),
      wordCount: wc,
    });

    currentSeconds += duration + 1.5; // small pause between turns
    lastSpeaker = speaker;
  }

  // Display formatted transcript (abbreviated)
  sectionHeader("Formatted Transcript (first 12 exchanges)", "📜");
  const speakerColor: Record<string, string> = {
    "Alex Chen": BLUE,
    "Dr. Sarah Martinez": MAGENTA,
  };

  const displayCount = Math.min(12, lines.length);
  for (let i = 0; i < displayCount; i++) {
    const l = lines[i];
    const col = speakerColor[l.speaker] ?? WHITE;
    const preview = l.text.length > 120 ? l.text.slice(0, 117) + "..." : l.text;
    console.log(`  ${DIM}[${l.timestamp}]${RESET} ${col}${BOLD}${l.speaker}:${RESET} ${preview}`);
  }
  if (lines.length > displayCount) {
    console.log(`  ${DIM}  ... (${lines.length - displayCount} more exchanges)${RESET}`);
  }

  // Speaker stats
  sectionHeader("Speaker Statistics", "📊");
  const speakerStats: Record<string, { words: number; turns: number }> = {};
  for (const l of lines) {
    if (!speakerStats[l.speaker]) speakerStats[l.speaker] = { words: 0, turns: 0 };
    speakerStats[l.speaker].words += l.wordCount;
    speakerStats[l.speaker].turns += 1;
  }
  const totalWords = Object.values(speakerStats).reduce((a, s) => a + s.words, 0);
  for (const [speaker, stats] of Object.entries(speakerStats)) {
    const pct = ((stats.words / totalWords) * 100).toFixed(1);
    const col = speakerColor[speaker] ?? WHITE;
    console.log(
      `  ${col}${BOLD}${speaker}${RESET}  ${stats.words} words (${pct}%)  ${stats.turns} turns  ${bar(stats.words, totalWords, 25, col)}`
    );
  }
  console.log(`  ${DIM}Total: ${totalWords} words across ${lines.length} exchanges${RESET}`);

  return lines;
}

// ── AGENT 2: Summarizer ────────────────────────────────────
async function agentSummarizer(lines: TranscriptLine[]): Promise<{ summary: string; takeaways: string[]; topics: TopicDistribution[] }> {
  banner("AGENT 2 ─ Summarizer", BG_GREEN);
  await progressDots("Extracting key themes via keyword frequency analysis", 350);
  await progressDots("Generating executive summary and takeaways", 300);

  const fullText = lines.map((l) => l.text).join(" ").toLowerCase();

  // Topic detection via keyword clusters
  const topicDefs: { topic: string; keywords: string[] }[] = [
    { topic: "AI Pair Programming", keywords: ["pair programming", "ai tool", "ai assist", "code completion", "autocomplete", "copilot", "suggestion", "ai-assisted", "pair"] },
    { topic: "Junior Developer Impact", keywords: ["junior", "learning", "ramp-up", "teaching", "intentional", "reflective", "annotation", "answer key", "teaching assistant"] },
    { topic: "Ethics & Bias", keywords: ["ethic", "bias", "monoculture", "diversity", "equity", "underrepresented", "accessibility", "localization", "audit", "inclusive"] },
    { topic: "Future Predictions", keywords: ["five years", "future", "shift", "2029", "predict", "boilerplate", "intent-driven", "architect", "emergence", "automated"] },
    { topic: "Practical Advice", keywords: ["advice", "invest", "skill", "curious", "build things", "communication", "empathy", "prompt engineering", "learn", "fluent", "moat"] },
    { topic: "Code Quality & Tools", keywords: ["code review", "code quality", "static analysis", "bug", "testing", "pull request", "machine learning", "tooling", "transformative"] },
  ];

  const topicCounts: Record<string, number> = {};
  let totalHits = 0;
  for (const td of topicDefs) {
    let count = 0;
    for (const kw of td.keywords) {
      const rx = new RegExp(kw, "gi");
      const matches = fullText.match(rx);
      count += matches ? matches.length : 0;
    }
    topicCounts[td.topic] = count;
    totalHits += count;
  }

  const topics: TopicDistribution[] = topicDefs.map((td) => ({
    topic: td.topic,
    percentage: totalHits > 0 ? (topicCounts[td.topic] / totalHits) * 100 : 0,
    keywords: td.keywords.filter((kw) => fullText.includes(kw)),
  })).sort((a, b) => b.percentage - a.percentage);

  // Executive summary
  const summary =
    "In this episode of Code Horizons, host Alex Chen interviews Dr. Sarah Martinez, a principal AI researcher at Nexus Labs, about the transformative impact of AI on software development. " +
    "They explore the current state of AI pair programming, its effects on junior developers, ethical concerns around algorithmic monoculture and bias, and bold predictions for the next five years. " +
    "Dr. Martinez offers practical guidance for developers, emphasizing that human skills like empathy, communication, and curiosity remain irreplaceable in an AI-augmented future.";

  // Key takeaways
  const takeaways = [
    "AI pair programming has evolved from simple autocomplete to understanding full architectural intent, though it still struggles with very large codebases (the \"flashlight vs floodlight\" problem).",
    "Junior developers benefit most when they treat AI as a teaching assistant — asking what the code does, why the AI chose that approach, and what alternatives exist before accepting suggestions.",
    "Algorithmic monoculture is a real risk: heavy AI assistance reduced unique solution patterns by 31% across 50,000 analyzed pull requests, creating potential systemic vulnerabilities.",
    "Within five years, we'll likely see the death of boilerplate code, intent-driven development from natural language, and AI-powered software architects augmenting human decision-making.",
    "The most future-proof developer skills are communication, empathy, systems thinking, domain expertise, and AI fluency — not just faster coding.",
  ];

  // Display
  sectionHeader("Executive Summary", "📝");
  console.log(`  ${WHITE}${summary}${RESET}\n`);

  sectionHeader("Key Takeaways", "🔑");
  takeaways.forEach((t, i) => {
    console.log(`  ${YELLOW}${i + 1}.${RESET} ${t}`);
  });

  sectionHeader("Topic Distribution", "📊");
  const maxPct = Math.max(...topics.map((t) => t.percentage));
  for (const t of topics) {
    const pctStr = `${t.percentage.toFixed(1)}%`.padStart(6);
    console.log(`  ${BOLD}${t.topic.padEnd(26)}${RESET} ${pctStr} ${bar(t.percentage, maxPct, 28)}`);
  }

  return { summary, takeaways, topics };
}

// ── AGENT 3: Chapter Generator ─────────────────────────────
async function agentChapterGenerator(lines: TranscriptLine[]): Promise<ChapterMarker[]> {
  banner("AGENT 3 ─ Chapter Generator", BG_MAGENTA);
  await progressDots("Detecting topic shifts via keyword clustering", 350);
  await progressDots("Building chapter boundaries from discourse markers", 250);

  // Define chapter seeds — keyword clusters that indicate topic areas
  const chapterSeeds: { title: string; keywords: string[]; priority: number }[] = [
    { title: "Introduction & Guest Background", keywords: ["welcome", "host", "pleasure", "joining", "nexus labs", "researcher"], priority: 10 },
    { title: "AI Pair Programming: Current State", keywords: ["pair programming", "autocomplete", "architectural intent", "landscape", "codebase", "senior developer"], priority: 8 },
    { title: "Limitations of AI Coding Tools", keywords: ["limitation", "context window", "flashlight", "floodlight", "monolith", "struggle"], priority: 7 },
    { title: "Impact on Junior Developers", keywords: ["junior", "learning", "intentional", "teaching assistant", "answer key", "three questions"], priority: 9 },
    { title: "Reflective Pairing in Practice", keywords: ["reflective pairing", "fintech", "annotation", "code review", "rejection rate", "ramp-up"], priority: 6 },
    { title: "Ethics: Algorithmic Monoculture", keywords: ["ethic", "monoculture", "diversity", "homogeneous", "vulnerability", "systemic"], priority: 9 },
    { title: "Bias in AI Training Data", keywords: ["bias", "training data", "underrepresented", "accessibility", "right-to-left", "equity audit"], priority: 8 },
    { title: "Five-Year Predictions", keywords: ["five years", "death of boilerplate", "intent-driven", "ai architect", "prototype", "2029"], priority: 9 },
    { title: "The Human Edge in AI Era", keywords: ["human developer", "ambiguity", "trade-off", "what to build", "elevation", "profession"], priority: 7 },
    { title: "Practical Advice for Developers", keywords: ["advice", "invest", "skill", "ai-fluent", "prompt engineering", "stay curious", "build things"], priority: 8 },
    { title: "Lightning Round", keywords: ["lightning round", "overhyped", "underhyped", "rust", "graduating"], priority: 7 },
    { title: "Closing & Sign-Off", keywords: ["wrap", "subscribe", "review", "next week", "thank you", "wonderful conversation"], priority: 5 },
  ];

  // Score each line against chapter seeds
  const chapters: ChapterMarker[] = [];
  const usedSeeds = new Set<number>();
  const minGap = 3; // minimum lines between chapter breaks

  for (let i = 0; i < lines.length; i++) {
    const windowText = lines.slice(i, i + 2).map((l) => l.text).join(" ").toLowerCase();
    let bestSeedIdx = -1;
    let bestScore = 0;

    for (let s = 0; s < chapterSeeds.length; s++) {
      if (usedSeeds.has(s)) continue;
      const seed = chapterSeeds[s];
      let score = 0;
      for (const kw of seed.keywords) {
        if (windowText.includes(kw.toLowerCase())) score += seed.priority;
      }
      if (score > bestScore) {
        bestScore = score;
        bestSeedIdx = s;
      }
    }

    const lastChapterLine = chapters.length > 0 ? chapters[chapters.length - 1].lineIndex : -minGap - 1;
    if (bestScore >= 10 && bestSeedIdx >= 0 && (i - lastChapterLine) >= minGap) {
      const seed = chapterSeeds[bestSeedIdx];
      const matchedKws = seed.keywords.filter((kw) => windowText.includes(kw.toLowerCase()));
      chapters.push({
        timestamp: lines[i].timestamp,
        title: seed.title,
        lineIndex: i,
        keywords: matchedKws,
      });
      usedSeeds.add(bestSeedIdx);
    }
  }

  // Ensure intro exists
  if (chapters.length === 0 || chapters[0].lineIndex !== 0) {
    chapters.unshift({
      timestamp: lines[0].timestamp,
      title: "Introduction & Guest Background",
      lineIndex: 0,
      keywords: ["welcome", "host"],
    });
  }

  chapters.sort((a, b) => a.lineIndex - b.lineIndex);

  // Display
  sectionHeader("Episode Chapters", "📑");
  for (const ch of chapters) {
    console.log(`  ${YELLOW}[${ch.timestamp}]${RESET} ${BOLD}${ch.title}${RESET}`);
    console.log(`           ${DIM}keywords: ${ch.keywords.join(", ")}${RESET}`);
  }

  // Chapter timeline visualization
  sectionHeader("Chapter Timeline", "🕒");
  const totalLines = lines.length;
  const timelineWidth = 50;
  const colors = [BLUE, GREEN, MAGENTA, CYAN, YELLOW, RED, BLUE, GREEN, MAGENTA, CYAN, YELLOW, RED];
  for (let ci = 0; ci < chapters.length; ci++) {
    const ch = chapters[ci];
    const nextLine = ci + 1 < chapters.length ? chapters[ci + 1].lineIndex : totalLines;
    const span = nextLine - ch.lineIndex;
    const blockWidth = Math.max(1, Math.round((span / totalLines) * timelineWidth));
    const col = colors[ci % colors.length];
    const label = ch.title.length > 20 ? ch.title.slice(0, 18) + ".." : ch.title;
    process.stdout.write(`  ${col}${"█".repeat(blockWidth)}${RESET} `);
    console.log(`${DIM}${ch.timestamp} ${label}${RESET}`);
  }

  return chapters;
}

// ── AGENT 4: Quote Extractor ───────────────────────────────
async function agentQuoteExtractor(lines: TranscriptLine[]): Promise<QuoteCandidate[]> {
  banner("AGENT 4 ─ Quote Extractor", BG_YELLOW);
  await progressDots("Segmenting sentences and scoring shareability", 400);
  await progressDots("Ranking candidates by multi-factor score", 300);

  const insightWords = [
    "future", "transform", "key", "critical", "believe", "profound",
    "revolutionary", "fundamental", "powerful", "exciting", "shift",
    "emergence", "amplifier", "elevation", "moat", "systemic",
    "genuinely", "dramatically", "groundbreaking", "incredible",
  ];
  const emotionWords = [
    "terrifying", "fascinating", "incredible", "surreal", "remarkable",
    "love", "brilliant", "amazing", "honestly", "absolutely",
    "empowering", "anxious", "exciting", "science fiction", "profound",
    "fragile", "dangerous", "wonderful", "quietly", "revolutionizing",
  ];
  const contextDependentPatterns = [/^(yes|no|sure|right|exactly|well)[,.]?\s/i, /^(and |but |so |the \w+ shift)/i, /^that'?s?\s/i];

  // Extract sentences from guest lines (more quotable)
  const candidates: QuoteCandidate[] = [];

  for (const line of lines) {
    // Split into sentences
    const sentences = line.text
      .replace(/([.!?])\s+/g, "$1|SPLIT|")
      .split("|SPLIT|")
      .map((s) => s.trim())
      .filter((s) => s.length > 20);

    for (const sentence of sentences) {
      const wc = wordCount(sentence);

      // Brevity: ideal 10-25 words
      let brevityScore: number;
      if (wc >= 10 && wc <= 25) brevityScore = 1.0;
      else if (wc >= 8 && wc <= 30) brevityScore = 0.7;
      else if (wc >= 5 && wc <= 40) brevityScore = 0.4;
      else brevityScore = 0.15;

      // Insight: keyword presence
      const lc = sentence.toLowerCase();
      const insightHits = insightWords.filter((w) => lc.includes(w)).length;
      const insightScore = Math.min(1.0, insightHits * 0.25);

      // Standalone: penalize context-dependent openings and questions
      let standaloneScore = 0.8;
      if (sentence.endsWith("?")) standaloneScore -= 0.3;
      for (const rx of contextDependentPatterns) {
        if (rx.test(sentence)) standaloneScore -= 0.25;
      }
      standaloneScore = Math.max(0, Math.min(1.0, standaloneScore));

      // Emotion: power words
      const emotionHits = emotionWords.filter((w) => lc.includes(w)).length;
      const emotionScore = Math.min(1.0, emotionHits * 0.3);

      const totalScore =
        brevityScore * 0.25 +
        insightScore * 0.35 +
        standaloneScore * 0.20 +
        emotionScore * 0.20;

      candidates.push({
        text: sentence,
        speaker: line.speaker,
        brevityScore: Math.round(brevityScore * 100) / 100,
        insightScore: Math.round(insightScore * 100) / 100,
        standaloneScore: Math.round(standaloneScore * 100) / 100,
        emotionScore: Math.round(emotionScore * 100) / 100,
        totalScore: Math.round(totalScore * 100) / 100,
      });
    }
  }

  // Sort descending by total score
  candidates.sort((a, b) => b.totalScore - a.totalScore);

  // Show all candidates (top 15) with scores
  sectionHeader("All Scored Candidates (top 15)", "🔍");
  const showCount = Math.min(15, candidates.length);
  console.log(
    `  ${DIM}${"#".padStart(3)} ${"Score".padStart(6)} ${"Brev".padStart(5)} ${"Ins".padStart(5)} ${"Stnd".padStart(5)} ${"Emot".padStart(5)}  Quote${RESET}`
  );
  console.log(`  ${DIM}${"─".repeat(80)}${RESET}`);
  for (let i = 0; i < showCount; i++) {
    const c = candidates[i];
    const isTop5 = i < 5;
    const col = isTop5 ? GREEN : GRAY;
    const marker = isTop5 ? `${GREEN}★${RESET}` : " ";
    const preview = c.text.length > 55 ? c.text.slice(0, 52) + "..." : c.text;
    console.log(
      `  ${marker}${col}${String(i + 1).padStart(2)} ${c.totalScore.toFixed(2).padStart(6)} ${c.brevityScore.toFixed(1).padStart(5)} ${c.insightScore.toFixed(1).padStart(5)} ${c.standaloneScore.toFixed(1).padStart(5)} ${c.emotionScore.toFixed(1).padStart(5)}${RESET}  ${preview}`
    );
  }

  // Detailed breakdown of top 5
  const top5 = candidates.slice(0, 5);
  sectionHeader("Top 5 Quotable Moments — Detailed Breakdown", "🏆");
  for (let i = 0; i < top5.length; i++) {
    const q = top5[i];
    const quotePreview = q.text.length > 100 ? q.text.slice(0, 97) + "..." : q.text;
    console.log(`\n  ${YELLOW}${BOLD}#${i + 1}${RESET} ${ITALIC}"${quotePreview}"${RESET}`);
    console.log(`     ${DIM}— ${q.speaker}${RESET}`);
    console.log(`     Brevity    ${q.brevityScore.toFixed(2)} × 0.25 = ${(q.brevityScore * 0.25).toFixed(3)}  ${bar(q.brevityScore, 1, 15, CYAN)}`);
    console.log(`     Insight    ${q.insightScore.toFixed(2)} × 0.35 = ${(q.insightScore * 0.35).toFixed(3)}  ${bar(q.insightScore, 1, 15, GREEN)}`);
    console.log(`     Standalone ${q.standaloneScore.toFixed(2)} × 0.20 = ${(q.standaloneScore * 0.20).toFixed(3)}  ${bar(q.standaloneScore, 1, 15, YELLOW)}`);
    console.log(`     Emotion    ${q.emotionScore.toFixed(2)} × 0.20 = ${(q.emotionScore * 0.20).toFixed(3)}  ${bar(q.emotionScore, 1, 15, MAGENTA)}`);
    console.log(`     ${BOLD}TOTAL      ${q.totalScore.toFixed(2)}${RESET}`);
  }

  return top5;
}

// ── AGENT 5: Social Content Creator ────────────────────────
async function agentSocialContentCreator(
  lines: TranscriptLine[],
  topQuotes: QuoteCandidate[],
  summary: string,
  takeaways: string[],
  chapters: ChapterMarker[]
): Promise<void> {
  banner("AGENT 5 ─ Social Content Creator", BG_RED);
  await progressDots("Generating Twitter/X thread", 300);
  await progressDots("Composing LinkedIn post", 250);
  await progressDots("Writing newsletter blurb", 250);

  // ── Twitter/X Thread ──────────────────────────────────────
  const tweets: string[] = [
    `🎙️ NEW EPISODE: "The Future of AI in Software Development"\n\nJust dropped a fascinating conversation with @DrSarahMartinez from Nexus Labs about how AI is reshaping our industry.\n\nHere's what blew my mind 🧵👇`,

    `1/ AI coding tools have gone from "glorified Stack Overflow" to understanding full architectural intent in just 18 months.\n\nBut there's a catch — Dr. Martinez calls it the "flashlight vs floodlight" problem. AI sees brilliantly in a narrow cone but misses the big picture.`,

    `2/ For junior devs using AI tools, ask these 3 questions before accepting ANY suggestion:\n\n• What is this code doing?\n• Why did the AI choose this approach?\n• What are the alternatives?\n\nDon't build on sand. 🏗️`,

    `3/ "Algorithmic monoculture" — when millions of devs use the same AI, we get homogeneous code.\n\nTheir study found a 31% drop in unique solution patterns across 50K pull requests.\n\nSoftware diversity is a SECURITY feature. 🔐`,

    `4/ "${topQuotes.length > 0 ? topQuotes[0].text.slice(0, 180) : "The future of software isn't AI versus humans."}"${topQuotes.length > 0 ? `\n\n— Dr. Sarah Martinez` : ""}`,

    `5/ Three skills that are your moat in the AI era:\n\n🗣️ Communication & empathy\n🧠 Systems thinking & domain expertise\n🤖 AI fluency (not expertise — fluency)\n\nThe devs who thrive will collaborate WITH AI, not compete against it.`,

    `6/ Full episode out now on Code Horizons.\n\nWhether you're anxious or excited about AI in dev, this one's a must-listen.\n\n🎧 Link in bio\n♻️ RT to help a fellow dev\n\n#AI #SoftwareDevelopment #CodeHorizons`,
  ];

  sectionHeader("Twitter/X Thread", "🐦");
  for (let i = 0; i < tweets.length; i++) {
    const charCount = tweets[i].length;
    const valid = charCount <= 280;
    const countColor = valid ? GREEN : RED;
    const lines2 = tweets[i].split("\n");
    const boxLines = [
      `${DIM}Tweet ${i + 1}/${tweets.length}${RESET}  ${countColor}${charCount}/280 chars${valid ? " ✓" : " ✗ OVER"}${RESET}`,
      "",
      ...lines2,
    ];
    box(boxLines, CYAN, `🐦 @CodeHorizons`);
    console.log();
  }

  // ── LinkedIn Post ─────────────────────────────────────────
  const linkedInPost = `🎙️ I just had one of the most thought-provoking conversations of my career.

On the latest episode of Code Horizons, I sat down with Dr. Sarah Martinez, Principal AI Researcher at Nexus Labs, to discuss the future of AI in software development.

Key insights that stuck with me:

• AI pair programming has evolved from code completion to architectural understanding — but the "context window trap" means it still works like a flashlight, not a floodlight.

• "Algorithmic monoculture" is a genuine risk. Their research across 50,000 pull requests showed a 31% reduction in unique solution patterns when AI assistance was heavily used.

• Junior developers benefit most from "reflective pairing" — treating AI as a teaching assistant, not an answer key.

• In 5 years, expect: the death of boilerplate, intent-driven development, and AI-powered software architects.

The most powerful takeaway? The hardest part of building software has never been writing code — it's understanding what to build and why. AI handles more of the "how," freeing us for the "what" and "why."

What's your experience with AI coding tools? I'd love to hear your perspective.

🎧 Full episode link in comments.

#ArtificialIntelligence #SoftwareDevelopment #FutureOfWork #AIinTech`;

  sectionHeader("LinkedIn Post", "💼");
  const linkedInLines = linkedInPost.split("\n");
  const linkedInWordCount = wordCount(linkedInPost);
  box(
    [`${DIM}${linkedInWordCount} words${RESET}`, "", ...linkedInLines],
    BLUE,
    "💼 LinkedIn"
  );

  // ── Newsletter Blurb ──────────────────────────────────────
  const newsletterBlurb = `SUBJECT: The AI future every developer needs to hear about

Hi there,

This week's Code Horizons episode is one for the bookmarks folder.

Dr. Sarah Martinez from Nexus Labs joined me to discuss how AI is transforming software development — and what it means for YOUR career. We covered everything from AI pair programming's "flashlight vs floodlight" problem to the alarming concept of "algorithmic monoculture" (where AI-assisted code is becoming dangerously homogeneous).

The big takeaway: the most future-proof developer skills aren't technical — they're communication, empathy, systems thinking, and AI fluency.

Whether you're a senior architect or a fresh grad, this episode will change how you think about your toolkit.

🎧 Listen now: [Episode Link]

Keep building,
Alex Chen
Code Horizons`;

  sectionHeader("Newsletter Blurb", "📧");
  const nlLines = newsletterBlurb.split("\n");
  const nlWordCount = wordCount(newsletterBlurb);
  box(
    [`${DIM}${nlWordCount} words${RESET}`, "", ...nlLines],
    GREEN,
    "📧 Newsletter"
  );
}

// ── Final Episode Package ──────────────────────────────────
function episodePackage(
  lines: TranscriptLine[],
  chapters: ChapterMarker[],
  topQuotes: QuoteCandidate[],
  summary: string,
  takeaways: string[],
  topics: TopicDistribution[]
): void {
  banner("EPISODE PACKAGE ─ Final Summary", BG_CYAN);

  const totalWords = lines.reduce((a, l) => a + l.wordCount, 0);
  const durationSecs = totalWords / 2.5;
  const speakerWords: Record<string, number> = {};
  for (const l of lines) {
    speakerWords[l.speaker] = (speakerWords[l.speaker] || 0) + l.wordCount;
  }

  const packageLines: string[] = [
    `${BOLD}Episode Title:${RESET}  The Future of AI in Software Development`,
    `${BOLD}Podcast:${RESET}        Code Horizons`,
    "",
    `${BOLD}Duration:${RESET}       ~${Math.round(durationSecs / 60)} minutes`,
    `${BOLD}Word Count:${RESET}     ${totalWords.toLocaleString()} words`,
    `${BOLD}Exchanges:${RESET}      ${lines.length} turns`,
    "",
    `${BOLD}Speaker Breakdown:${RESET}`,
    ...Object.entries(speakerWords).map(
      ([s, w]) => `  ${s.padEnd(24)} ${w} words (${((w / totalWords) * 100).toFixed(1)}%)`
    ),
    "",
    `${BOLD}Generated Assets:${RESET}`,
    `  Chapters:       ${chapters.length}`,
    `  Top Quotes:     ${topQuotes.length}`,
    `  Social Posts:   3 platforms (Twitter thread, LinkedIn, Newsletter)`,
    "",
    `${BOLD}Chapters:${RESET}`,
    ...chapters.map((ch) => `  ${YELLOW}[${ch.timestamp}]${RESET} ${ch.title}`),
    "",
    `${BOLD}Top 3 Quotes:${RESET}`,
    ...topQuotes.slice(0, 3).map(
      (q, i) =>
        `  ${GREEN}${i + 1}.${RESET} "${q.text.length > 90 ? q.text.slice(0, 87) + "..." : q.text}" ${DIM}(score: ${q.totalScore.toFixed(2)})${RESET}`
    ),
    "",
    `${BOLD}Topics Covered:${RESET}`,
    ...topics.slice(0, 5).map(
      (t) => `  ${t.topic.padEnd(26)} ${t.percentage.toFixed(1)}%`
    ),
  ];

  box(packageLines, CYAN, "🎙️  EPISODE PACKAGE — Code Horizons S1E42");
}

// ── Main ────────────────────────────────────────────────────
async function main(): Promise<void> {
  console.log(`\n${BOLD}${CYAN}╔══════════════════════════════════════════════════════════════╗${RESET}`);
  console.log(`${BOLD}${CYAN}║${RESET}  ${BOLD}🎙️  Podcast Processor — Multi-Agent Transcript Analysis${RESET}   ${BOLD}${CYAN}║${RESET}`);
  console.log(`${BOLD}${CYAN}║${RESET}  ${DIM}5 agents · NLP-style text analysis · zero dependencies${RESET}   ${BOLD}${CYAN}║${RESET}`);
  console.log(`${BOLD}${CYAN}╚══════════════════════════════════════════════════════════════╝${RESET}\n`);

  // Agent 1
  const lines = await agentTranscriptFormatter(RAW_TRANSCRIPT);

  // Agent 2
  const { summary, takeaways, topics } = await agentSummarizer(lines);

  // Agent 3
  const chapters = await agentChapterGenerator(lines);

  // Agent 4
  const topQuotes = await agentQuoteExtractor(lines);

  // Agent 5
  await agentSocialContentCreator(lines, topQuotes, summary, takeaways, chapters);

  // Final package
  episodePackage(lines, chapters, topQuotes, summary, takeaways, topics);

  console.log(`\n${GREEN}${BOLD}✓ All 5 agents completed successfully.${RESET}`);
  console.log(`${DIM}  Processed ${lines.length} transcript exchanges through the full pipeline.${RESET}\n`);
}

main().catch((err) => {
  console.error(`${RED}${BOLD}Error:${RESET}`, err);
  process.exit(1);
});
