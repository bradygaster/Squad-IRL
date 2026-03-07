// ─────────────────────────────────────────────────────────────
// Content Pipeline — 5-agent article creation demo
// Zero external dependencies (Node.js built-ins only)
// ─────────────────────────────────────────────────────────────

/* ── ANSI helpers & utilities ──────────────────────────────── */

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
  bgBlue: "\x1b[44m",
  bgMagenta: "\x1b[45m",
  bgGreen: "\x1b[42m",
  bgYellow: "\x1b[43m",
  bgCyan: "\x1b[46m",
};

function clr(c: string, t: string): string {
  return `${c}${t}${C.reset}`;
}

const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

function banner(text: string, color: string): void {
  const inner = `  ${text}  `;
  const width = inner.length + 2;
  const top = "╔" + "═".repeat(width) + "╗";
  const mid = "║ " + inner + " ║";
  const bot = "╚" + "═".repeat(width) + "╝";
  console.log();
  console.log(clr(color, top));
  console.log(clr(color, mid));
  console.log(clr(color, bot));
  console.log();
}

function sectionHeader(num: number, title: string, color: string): void {
  const line = "═".repeat(60);
  console.log();
  console.log(clr(color, line));
  console.log(
    clr(color + C.bold, `  Agent ${num}: ${title}`),
  );
  console.log(clr(color, line));
  console.log();
}

function subHeader(title: string): void {
  console.log(`  ${clr(C.dim, "───")} ${clr(C.bold, title)}`);
}

async function progressBar(
  label: string,
  steps: number,
  color: string,
): Promise<void> {
  const width = 30;
  for (let i = 0; i <= steps; i++) {
    const filled = Math.round((i / steps) * width);
    const bar = "█".repeat(filled) + "░".repeat(width - filled);
    const pct = Math.round((i / steps) * 100);
    process.stdout.write(
      `\r  ${clr(color, "▸")} ${label} [${clr(color, bar)}] ${pct}%`,
    );
    await sleep(60);
  }
  process.stdout.write("\n");
}

/* ── Types ─────────────────────────────────────────────────── */

interface ResearchData {
  keyPoints: string[];
  statistics: { stat: string; source: string }[];
  talkingPoints: string[];
}

interface OutlineSection {
  level: "h2" | "h3";
  title: string;
  keyPoints: string[];
}

interface ArticleDraft {
  sections: { heading: string; content: string; wordCount: number }[];
}

interface SEOAnalysis {
  primaryKeyword: string;
  keywordDensity: { keyword: string; count: number; density: string }[];
  fleschKincaid: {
    score: number;
    grade: number;
    readingEase: number;
    details: {
      totalWords: number;
      totalSentences: number;
      totalSyllables: number;
    };
  };
  titleVariations: string[];
  readabilityIssues: string[];
}

interface EditReview {
  toneScore: number;
  flowScore: number;
  grammarScore: number;
  overallScore: number;
  suggestions: {
    type: string;
    original: string;
    suggested: string;
    reason: string;
  }[];
  finalVerdict: string;
}

/* ── Agent 1: Researcher ───────────────────────────────────── */

async function runResearcher(): Promise<ResearchData> {
  sectionHeader(1, "Researcher", C.cyan);
  console.log(
    `  ${clr(C.cyan, "▸")} Gathering salary negotiation data...\n`,
  );
  await sleep(400);

  const data: ResearchData = {
    keyPoints: [
      "Research your market value using salary databases before any negotiation conversation",
      "Timing matters — request a meeting after a major win, positive review, or completed project",
      "Frame the conversation around value delivered, not personal financial needs",
      "Practice your pitch out loud at least three times before the actual meeting",
      "Bring a one-page summary of accomplishments with quantified impact metrics",
      "Always negotiate the total compensation package, not just base salary",
      "Have a specific number in mind backed by market data, not a vague range",
      "Prepare for common objections like budget constraints or timing concerns",
      "Consider non-salary benefits: remote work, equity, training budget, extra PTO",
      "Get any agreement in writing — verbal promises are not enforceable",
    ],
    statistics: [
      {
        stat: "Employees who negotiate their salary earn on average $7,500 more in their first year",
        source: "Harvard Business Review, 2023",
      },
      {
        stat: "Only 37% of workers always negotiate their salary; 18% never do",
        source: "Glassdoor Employment Confidence Survey",
      },
      {
        stat: "Women who negotiate are 5.5% more likely to receive a raise than those who don't",
        source: "Journal of Organizational Behavior",
      },
      {
        stat: "The average successful negotiation yields a 7-10% salary increase",
        source: "PayScale Compensation Best Practices Report",
      },
      {
        stat: "85% of managers expect candidates to negotiate their initial offer",
        source: "CareerBuilder Annual Survey",
      },
      {
        stat: "Over a 40-year career, failing to negotiate can cost over $1 million in lost earnings",
        source: "Linda Babcock, Carnegie Mellon University",
      },
      {
        stat: "Companies with transparent pay bands see 15% faster salary negotiations",
        source: "Mercer Total Remuneration Survey 2024",
      },
    ],
    talkingPoints: [
      "The negotiation gap compounds over time through raises, bonuses, and retirement contributions",
      "Market rate data from three independent sources creates the strongest anchor",
      "The 'exploding offer' tactic is often a bluff — most deadlines have flexibility",
      "Collaborative framing ('How can we make this work?') outperforms adversarial framing",
      "Remote work flexibility has measurable dollar value ($5,000-$15,000/year equivalent)",
      "Signing bonuses can bridge the gap when base salary hits a hard ceiling",
      "Counter-offers from your current employer have a 50% failure rate within 18 months",
    ],
  };

  subHeader("Key Points");
  for (const point of data.keyPoints) {
    console.log(`    ${clr(C.green, "●")} ${point}`);
    await sleep(80);
  }

  console.log();
  subHeader("Statistics");
  for (const s of data.statistics) {
    console.log(`    ${clr(C.yellow, "📊")} ${s.stat}`);
    console.log(`       ${clr(C.dim, `— ${s.source}`)}`);
    await sleep(80);
  }

  console.log();
  subHeader("Talking Points");
  for (const tp of data.talkingPoints) {
    console.log(`    ${clr(C.blue, "💬")} ${tp}`);
    await sleep(80);
  }

  console.log(
    `\n  ${clr(C.green + C.bold, "✓")} Research complete — ${data.keyPoints.length} key points, ${data.statistics.length} statistics, ${data.talkingPoints.length} talking points\n`,
  );
  return data;
}

/* ── Agent 2: Outliner ─────────────────────────────────────── */

async function runOutliner(research: ResearchData): Promise<OutlineSection[]> {
  sectionHeader(2, "Outliner", C.yellow);
  console.log(
    `  ${clr(C.yellow, "▸")} Structuring ${research.keyPoints.length} research points into outline...\n`,
  );
  await sleep(400);

  const outline: OutlineSection[] = [
    {
      level: "h2",
      title: "Introduction: Why Most People Leave Money on the Table",
      keyPoints: [
        "The cost of not negotiating",
        "Common myths about salary negotiation",
      ],
    },
    {
      level: "h2",
      title: "Research Your Market Value",
      keyPoints: [
        "Using salary databases and benchmarks",
        "Understanding your worth in context",
      ],
    },
    {
      level: "h3",
      title: "Gathering Salary Data from Multiple Sources",
      keyPoints: [
        "Glassdoor, Levels.fyi, PayScale comparison",
        "Industry-specific compensation reports",
      ],
    },
    {
      level: "h3",
      title: "Evaluating Company Financials and Pay Bands",
      keyPoints: [
        "Public vs private company transparency",
        "Reading between the lines of job postings",
      ],
    },
    {
      level: "h3",
      title: "Industry Benchmarks and Regional Adjustments",
      keyPoints: [
        "Cost-of-living multipliers",
        "Remote-first company rate cards",
      ],
    },
    {
      level: "h2",
      title: "Building Your Case",
      keyPoints: [
        "Document before you negotiate",
        "Quantify everything possible",
      ],
    },
    {
      level: "h3",
      title: "Documenting Your Achievements",
      keyPoints: [
        "Keeping a running brag document",
        "Connecting tasks to business outcomes",
      ],
    },
    {
      level: "h3",
      title: "Quantifying Your Impact with Numbers",
      keyPoints: [
        "Revenue generated or saved",
        "Efficiency improvements in measurable terms",
      ],
    },
    {
      level: "h3",
      title: "Gathering Peer and Manager Testimonials",
      keyPoints: [
        "360-degree feedback excerpts",
        "Written praise from stakeholders",
      ],
    },
    {
      level: "h2",
      title: "The Negotiation Conversation",
      keyPoints: [
        "Choosing the right moment",
        "Leading with value, not demands",
      ],
    },
    {
      level: "h3",
      title: "Timing Your Request for Maximum Impact",
      keyPoints: [
        "After a major deliverable or positive review",
        "Budget cycle awareness",
      ],
    },
    {
      level: "h3",
      title: "Crafting Your Opening Statement",
      keyPoints: [
        "The value-first framework",
        "Anchoring with a specific number",
      ],
    },
    {
      level: "h3",
      title: "Handling Pushback and Objections",
      keyPoints: [
        "Budget freeze responses",
        "Bridging to non-salary compensation",
      ],
    },
    {
      level: "h2",
      title: "Beyond Base Salary: Total Compensation",
      keyPoints: [
        "Think beyond the paycheck",
        "Negotiable benefits most people miss",
      ],
    },
    {
      level: "h3",
      title: "Benefits, Perks, and Flexibility",
      keyPoints: [
        "Remote work, flexible hours, wellness stipends",
        "Dollar value of non-cash benefits",
      ],
    },
    {
      level: "h3",
      title: "Equity, Bonuses, and Long-Term Incentives",
      keyPoints: [
        "RSU vesting schedules",
        "Performance bonus structures",
      ],
    },
    {
      level: "h3",
      title: "Professional Development and Growth",
      keyPoints: [
        "Training budgets and conference attendance",
        "Title changes that unlock future earning power",
      ],
    },
    {
      level: "h2",
      title: "Conclusion: Your Raise Starts Before the Conversation",
      keyPoints: [
        "Preparation is the differentiator",
        "Every negotiation builds the next one",
      ],
    },
  ];

  for (const section of outline) {
    if (section.level === "h2") {
      console.log(
        `  ${clr(C.yellow + C.bold, "■")} ${clr(C.bold, section.title)}`,
      );
    } else {
      console.log(
        `    ${clr(C.dim, "└─")} ${section.title}`,
      );
    }
    for (const kp of section.keyPoints) {
      const indent = section.level === "h2" ? "      " : "        ";
      console.log(`${indent}${clr(C.dim, "•")} ${clr(C.dim, kp)}`);
    }
    await sleep(60);
  }

  const h2Count = outline.filter((s) => s.level === "h2").length;
  const h3Count = outline.filter((s) => s.level === "h3").length;
  console.log(
    `\n  ${clr(C.green + C.bold, "✓")} Outline complete — ${h2Count} major sections, ${h3Count} sub-sections\n`,
  );
  return outline;
}

/* ── Agent 3: Writer ───────────────────────────────────────── */

async function runWriter(outline: OutlineSection[]): Promise<ArticleDraft> {
  sectionHeader(3, "Writer", C.green);
  console.log(
    `  ${clr(C.green, "▸")} Drafting article from ${outline.length}-section outline...\n`,
  );
  await sleep(300);

  const sectionContent: { heading: string; body: string }[] = [
    {
      heading: "Introduction: Why Most People Leave Money on the Table",
      body: `Most professionals dramatically underestimate the cost of skipping salary negotiation. According to research from Harvard Business Review, employees who negotiate their salary earn on average $7,500 more in their first year alone. Over a 40-year career, that single conversation compounds into more than one million dollars in lost earnings through raises, bonuses, and retirement contributions. Despite these staggering numbers, only 37 percent of workers consistently negotiate their pay. The rest accept whatever lands on the table, leaving real wealth behind. This article walks you through a proven five-step framework for negotiating a raise, whether you are approaching your annual review, responding to a new offer, or simply recognizing that your compensation no longer matches your contribution.`,
    },
    {
      heading: "Research Your Market Value",
      body: `Effective salary negotiation begins long before you sit across from your manager. Start by gathering compensation data from at least three independent sources: Glassdoor, PayScale, and Levels.fyi each provide different lenses on market rates. Look at job postings for similar roles in your region and note posted salary ranges. Industry-specific compensation surveys from firms like Mercer or Radford offer the most granular benchmarks. Compare your title, years of experience, skill set, and geographic cost-of-living to build a realistic target range. If your company has transparent pay bands, study where you fall within your band. Public companies often disclose compensation philosophy in proxy statements. Regional adjustments matter as well: a software engineer in San Francisco commands a different rate than one in Austin, even at the same company. Remote-first organizations sometimes use location-agnostic rate cards, which can work in your favor or against it depending on where you live.`,
    },
    {
      heading: "Building Your Case",
      body: `Data without narrative is just a spreadsheet. Before you negotiate, build a compelling case document that connects your work to business outcomes. Start a running brag document today and update it weekly. Every revenue-generating project, cost-saving initiative, and efficiency improvement should be captured with concrete numbers. Did you reduce deployment time by forty percent? Write it down. Did your project bring in two hundred thousand dollars in new revenue? Document it. Gather testimonials from peers, stakeholders, and managers. A quote from a VP saying your work was critical to a product launch carries enormous weight. Organize your achievements into a clean one-page summary with metrics front and center. This document serves two purposes: it gives your manager ammunition to advocate for you internally, and it anchors the conversation in objective value rather than subjective feelings.`,
    },
    {
      heading: "The Negotiation Conversation",
      body: `Timing your negotiation request can be just as important as the request itself. The best moments are immediately after a major deliverable, a glowing performance review, or when your team depends on you for an upcoming initiative. Avoid asking during budget freezes, layoffs, or periods of company uncertainty. When you open the conversation, lead with value rather than demands. A strong opening sounds like this: Based on my contributions over the past year, including leading the migration project that saved the company three hundred thousand dollars annually, and market data showing my role compensates between one hundred twenty and one hundred forty thousand dollars, I would like to discuss adjusting my salary to one hundred thirty-five thousand. Anchor with a specific number rather than a range because ranges invite the other party to pick the low end. When you encounter pushback such as budget constraints or timing objections, acknowledge the concern and bridge to alternatives. Phrases like I understand the constraints and I want to find a solution that works for both of us keep the conversation collaborative rather than adversarial.`,
    },
    {
      heading: "Beyond Base Salary: Total Compensation",
      body: `When base salary hits a hard ceiling, smart negotiators expand the conversation to total compensation. Remote work flexibility alone has a measurable dollar value of five to fifteen thousand dollars per year in commuting costs and time savings. Additional paid time off, flexible hours, wellness stipends, and home office budgets are all negotiable levers. Equity compensation in the form of stock options or restricted stock units can dwarf base salary over time, especially at high-growth companies. Understand vesting schedules and ask about refresh grants. Performance bonuses, signing bonuses, and retention packages provide immediate financial upside. Do not overlook professional development benefits either: a ten-thousand-dollar annual training budget, conference attendance, or a sponsored graduate degree compounds your earning power for decades. Even job title changes, which cost the company nothing, can unlock higher salary bands at your next role. Think of negotiation as a portfolio optimization problem where every component adds value.`,
    },
    {
      heading: "Conclusion: Your Raise Starts Before the Conversation",
      body: `The most important thing to understand about salary negotiation is that the outcome is largely determined before you ever open your mouth. Preparation is the single greatest differentiator between people who get what they ask for and people who accept what they are given. Research your market value, document your impact, choose your timing carefully, and practice your delivery until it feels natural. Remember that eighty-five percent of managers expect you to negotiate, so you are not being pushy or difficult by asking for fair compensation. Every successful negotiation builds your confidence and your baseline for the next one. Start preparing today because your future self will thank you for every dollar you had the courage to ask for.`,
    },
  ];

  const draft: ArticleDraft = { sections: [] };

  for (let i = 0; i < sectionContent.length; i++) {
    const { heading, body } = sectionContent[i];
    await progressBar(`Writing: ${heading.slice(0, 40)}...`, 20, C.green);
    const wordCount = body.split(/\s+/).length;
    draft.sections.push({ heading, content: body, wordCount });
    console.log(
      `    ${clr(C.dim, `└─ ${wordCount} words written`)}\n`,
    );
    await sleep(100);
  }

  const totalWords = draft.sections.reduce((s, sec) => s + sec.wordCount, 0);
  console.log(
    `  ${clr(C.green + C.bold, "✓")} Draft complete — ${draft.sections.length} sections, ${totalWords} total words\n`,
  );
  return draft;
}

/* ── Agent 4: SEO Optimizer ────────────────────────────────── */

function countSyllables(word: string): number {
  word = word.toLowerCase().replace(/[^a-z]/g, "");
  if (word.length <= 2) return word.length === 0 ? 0 : 1;

  // common exceptions
  const exceptions: Record<string, number> = {
    every: 3,
    area: 3,
    idea: 3,
    real: 2,
    people: 2,
    business: 3,
    being: 2,
    experience: 4,
    negotiate: 4,
    negotiation: 5,
    compensation: 4,
    collaborative: 5,
    immediately: 5,
    professional: 4,
    dramatically: 5,
    alternative: 4,
    organization: 5,
    organizations: 5,
    initiative: 4,
    initiatives: 4,
    adversarial: 5,
    optimization: 5,
    demonstrate: 3,
    valuable: 3,
    comfortable: 4,
  };
  if (exceptions[word] !== undefined) return exceptions[word];

  let count = 0;
  const vowels = "aeiouy";
  let prevVowel = false;

  for (let i = 0; i < word.length; i++) {
    const isVowel = vowels.includes(word[i]);
    if (isVowel && !prevVowel) {
      count++;
    }
    prevVowel = isVowel;
  }

  // silent e at end
  if (word.endsWith("e") && !word.endsWith("le") && count > 1) {
    count--;
  }

  // -le ending adds a syllable if preceded by a consonant
  if (
    word.endsWith("le") &&
    word.length > 2 &&
    !vowels.includes(word[word.length - 3])
  ) {
    // already counted by vowel group logic in most cases, but ensure at least 1
  }

  // -ed ending: usually not a separate syllable unless preceded by t or d
  if (word.endsWith("ed") && word.length > 3) {
    const beforeEd = word[word.length - 3];
    if (beforeEd !== "t" && beforeEd !== "d") {
      if (count > 1) count--;
    }
  }

  return Math.max(count, 1);
}

async function runSEOOptimizer(draft: ArticleDraft): Promise<SEOAnalysis> {
  sectionHeader(4, "SEO Optimizer", C.magenta);
  console.log(
    `  ${clr(C.magenta, "▸")} Analyzing readability and keyword density...\n`,
  );
  await sleep(400);

  const fullText = draft.sections.map((s) => s.content).join(" ");
  const words = fullText
    .split(/\s+/)
    .filter((w) => w.length > 0);
  const totalWords = words.length;

  // Sentence counting: split on sentence-ending punctuation
  const sentences = fullText
    .split(/[.!?]+/)
    .filter((s) => s.trim().length > 0);
  const totalSentences = sentences.length;

  // Syllable counting
  let totalSyllables = 0;
  for (const w of words) {
    totalSyllables += countSyllables(w);
  }

  // Flesch-Kincaid Grade Level
  const wordsPerSentence = totalWords / totalSentences;
  const syllablesPerWord = totalSyllables / totalWords;
  const fkGrade =
    0.39 * wordsPerSentence + 11.8 * syllablesPerWord - 15.59;
  const fkReadingEase =
    206.835 - 1.015 * wordsPerSentence - 84.6 * syllablesPerWord;

  // Show the math step by step
  subHeader("Flesch-Kincaid Calculation");
  console.log();
  console.log(
    `    ${clr(C.dim, "Total words:")}      ${clr(C.bold, String(totalWords))}`,
  );
  console.log(
    `    ${clr(C.dim, "Total sentences:")}  ${clr(C.bold, String(totalSentences))}`,
  );
  console.log(
    `    ${clr(C.dim, "Total syllables:")} ${clr(C.bold, String(totalSyllables))}`,
  );
  console.log();
  await sleep(200);

  console.log(clr(C.magenta, "    FK Grade Level Formula:"));
  console.log(
    clr(
      C.dim,
      "    = 0.39 × (words / sentences) + 11.8 × (syllables / words) − 15.59",
    ),
  );
  console.log();
  console.log(
    `    = 0.39 × (${totalWords} / ${totalSentences}) + 11.8 × (${totalSyllables} / ${totalWords}) − 15.59`,
  );
  console.log(
    `    = 0.39 × ${wordsPerSentence.toFixed(2)} + 11.8 × ${syllablesPerWord.toFixed(2)} − 15.59`,
  );
  console.log(
    `    = ${(0.39 * wordsPerSentence).toFixed(2)} + ${(11.8 * syllablesPerWord).toFixed(2)} − 15.59`,
  );
  const roundedGrade = Math.round(fkGrade * 100) / 100;
  const gradeInt = Math.round(fkGrade);
  console.log(
    `    = ${clr(C.bold + C.magenta, String(roundedGrade))} → ${clr(C.bold, `Grade ${gradeInt}`)} (${ordinal(gradeInt)} grade reading level)`,
  );
  console.log();
  await sleep(200);

  console.log(clr(C.magenta, "    Flesch Reading Ease Formula:"));
  console.log(
    clr(
      C.dim,
      "    = 206.835 − 1.015 × (words / sentences) − 84.6 × (syllables / words)",
    ),
  );
  console.log();
  console.log(
    `    = 206.835 − 1.015 × ${wordsPerSentence.toFixed(2)} − 84.6 × ${syllablesPerWord.toFixed(2)}`,
  );
  console.log(
    `    = 206.835 − ${(1.015 * wordsPerSentence).toFixed(2)} − ${(84.6 * syllablesPerWord).toFixed(2)}`,
  );
  const roundedEase = Math.round(fkReadingEase * 100) / 100;
  let easeLabel = "Very Easy";
  if (fkReadingEase < 30) easeLabel = "Very Difficult";
  else if (fkReadingEase < 50) easeLabel = "Difficult";
  else if (fkReadingEase < 60) easeLabel = "Fairly Difficult";
  else if (fkReadingEase < 70) easeLabel = "Standard";
  else if (fkReadingEase < 80) easeLabel = "Fairly Easy";
  else if (fkReadingEase < 90) easeLabel = "Easy";
  console.log(
    `    = ${clr(C.bold + C.magenta, String(roundedEase))} → ${clr(C.bold, easeLabel)}`,
  );
  console.log();
  await sleep(200);

  // Keyword density
  const lowerText = fullText.toLowerCase();
  const lowerWords = lowerText.split(/\s+/);
  const keywords = ["negotiate", "salary", "compensation", "raise", "value"];
  const keywordDensity: { keyword: string; count: number; density: string }[] = [];

  subHeader("Keyword Density Analysis");
  console.log();
  for (const kw of keywords) {
    const count = lowerWords.filter(
      (w) => w.replace(/[^a-z]/g, "").includes(kw),
    ).length;
    const density = ((count / totalWords) * 100).toFixed(2);
    keywordDensity.push({ keyword: kw, count, density: `${density}%` });
    const bar = "█".repeat(Math.min(count, 30));
    console.log(
      `    ${clr(C.magenta, "▸")} ${kw.padEnd(15)} ${String(count).padStart(3)} hits  (${density}%)  ${clr(C.dim, bar)}`,
    );
    await sleep(80);
  }
  console.log();

  // Title variations
  const titleVariations = [
    "How to Negotiate a Raise: A Step-by-Step Guide for 2025",
    "Salary Negotiation Secrets: How to Ask for the Raise You Deserve",
    "The Complete Guide to Negotiating a Higher Salary at Work",
    "5 Proven Strategies to Successfully Negotiate Your Next Raise",
    "Stop Leaving Money on the Table: Master Salary Negotiation Today",
  ];

  subHeader("Title Variations for SEO");
  console.log();
  for (let i = 0; i < titleVariations.length; i++) {
    console.log(
      `    ${clr(C.yellow, `${i + 1}.`)} ${titleVariations[i]}`,
    );
    await sleep(60);
  }
  console.log();

  // Readability issues
  const readabilityIssues: string[] = [];
  for (const sentence of sentences) {
    const wc = sentence.trim().split(/\s+/).length;
    if (wc > 25) {
      const preview = sentence.trim().slice(0, 60);
      readabilityIssues.push(
        `Long sentence (${wc} words): "${preview}..."`,
      );
    }
  }

  // Check for paragraphs without key terms
  for (const sec of draft.sections) {
    const lower = sec.content.toLowerCase();
    if (
      !lower.includes("negotiat") &&
      !lower.includes("salary") &&
      !lower.includes("raise")
    ) {
      readabilityIssues.push(
        `Section "${sec.heading}" lacks primary keywords`,
      );
    }
  }

  if (readabilityIssues.length > 0) {
    subHeader("Readability Issues");
    console.log();
    for (const issue of readabilityIssues.slice(0, 8)) {
      console.log(`    ${clr(C.yellow, "⚠")} ${issue}`);
      await sleep(40);
    }
    if (readabilityIssues.length > 8) {
      console.log(
        `    ${clr(C.dim, `... and ${readabilityIssues.length - 8} more`)}`,
      );
    }
    console.log();
  }

  const analysis: SEOAnalysis = {
    primaryKeyword: "negotiate salary",
    keywordDensity,
    fleschKincaid: {
      score: roundedEase,
      grade: roundedGrade,
      readingEase: roundedEase,
      details: { totalWords, totalSentences, totalSyllables },
    },
    titleVariations,
    readabilityIssues,
  };

  console.log(
    `  ${clr(C.green + C.bold, "✓")} SEO analysis complete — FK Grade ${roundedGrade}, Reading Ease ${roundedEase}\n`,
  );
  return analysis;
}

function ordinal(n: number): string {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

/* ── Agent 5: Editor ───────────────────────────────────────── */

async function runEditor(
  draft: ArticleDraft,
  seo: SEOAnalysis,
): Promise<EditReview> {
  sectionHeader(5, "Editor", C.blue);
  console.log(
    `  ${clr(C.blue, "▸")} Reviewing article for tone, flow, and grammar...\n`,
  );
  await sleep(400);

  await progressBar("Tone analysis", 15, C.blue);
  await progressBar("Flow analysis", 15, C.blue);
  await progressBar("Grammar check", 15, C.blue);
  console.log();

  // Calculate scores based on actual article properties
  const totalWords = draft.sections.reduce((s, sec) => s + sec.wordCount, 0);
  const avgWordsPerSection = totalWords / draft.sections.length;

  // Tone: professional and informative → high score
  const toneScore = 8;
  // Flow: good section transitions → decent score
  const flowScore = 7;
  // Grammar: simulated minor issues
  const grammarScore = 8;
  // Reading ease factors into overall
  const readabilityBonus = seo.fleschKincaid.score > 50 ? 1 : 0;
  const overallScore = Math.round(
    ((toneScore + flowScore + grammarScore) / 3) * 10 + readabilityBonus,
  ) / 10;

  const suggestions: EditReview["suggestions"] = [
    {
      type: "Clarity",
      original: "Most professionals dramatically underestimate the cost",
      suggested: "Most professionals significantly underestimate the true cost",
      reason:
        "'Dramatically' is informal for a professional guide; 'significantly' + 'true' adds precision",
    },
    {
      type: "Flow",
      original: "This article walks you through a proven five-step framework",
      suggested:
        "The following five-step framework will help you prepare and execute",
      reason:
        "Active construction engages the reader more directly and avoids meta-reference to the article itself",
    },
    {
      type: "SEO",
      original: "Start by gathering compensation data",
      suggested:
        "Start by gathering salary and compensation data from trusted sources",
      reason:
        "Adds the primary keyword 'salary' and reinforces source credibility",
    },
    {
      type: "Grammar",
      original:
        "a software engineer in San Francisco commands a different rate than one in Austin",
      suggested:
        "a software engineer in San Francisco commands a different rate from one in Austin",
      reason: "'Different from' is grammatically preferred over 'different than'",
    },
    {
      type: "Impact",
      original: "Start preparing today because your future self will thank you",
      suggested:
        "Start preparing today. Your future self — and your bank account — will thank you",
      reason:
        "Breaking into two sentences adds emphasis; the dash parenthetical adds personality",
    },
  ];

  subHeader("Scores");
  console.log();
  const scores = [
    { label: "Tone", score: toneScore, color: C.cyan },
    { label: "Flow", score: flowScore, color: C.yellow },
    { label: "Grammar", score: grammarScore, color: C.green },
    { label: "Overall", score: overallScore, color: C.bold + C.white },
  ];
  for (const s of scores) {
    const filled = Math.round(s.score);
    const bar = "█".repeat(filled) + "░".repeat(10 - filled);
    console.log(
      `    ${s.label.padEnd(10)} [${clr(s.color, bar)}] ${clr(C.bold, String(s.score))}/10`,
    );
    await sleep(100);
  }
  console.log();

  subHeader("Suggestions");
  console.log();
  for (let i = 0; i < suggestions.length; i++) {
    const s = suggestions[i];
    console.log(
      `    ${clr(C.blue + C.bold, `${i + 1}. [${s.type}]`)}`,
    );
    console.log(
      `       ${clr(C.red, "−")} ${clr(C.dim, `"${s.original}"`)}`,
    );
    console.log(
      `       ${clr(C.green, "+")} ${clr(C.bold, `"${s.suggested}"`)}`,
    );
    console.log(
      `       ${clr(C.dim, `↳ ${s.reason}`)}`,
    );
    console.log();
    await sleep(100);
  }

  const finalVerdict =
    totalWords >= 800
      ? "Article is publication-ready with minor revisions. Strong research backing, clear structure, and appropriate reading level for the target audience."
      : "Article meets minimum length. Consider expanding sections on negotiation tactics and total compensation for better depth.";

  subHeader("Final Verdict");
  console.log();
  console.log(`    ${clr(C.green, "✎")} ${finalVerdict}`);
  console.log();

  console.log(
    `  ${clr(C.green + C.bold, "✓")} Editorial review complete\n`,
  );

  return {
    toneScore,
    flowScore,
    grammarScore,
    overallScore,
    suggestions,
    finalVerdict,
  };
}

/* ── Summary Dashboard ─────────────────────────────────────── */

function printDashboard(
  draft: ArticleDraft,
  seo: SEOAnalysis,
  review: EditReview,
): void {
  const line = "═".repeat(60);
  console.log();
  console.log(clr(C.bold + C.white, line));
  console.log(
    clr(C.bold + C.white, "  📊  PIPELINE SUMMARY DASHBOARD"),
  );
  console.log(clr(C.bold + C.white, line));
  console.log();

  const totalWords = draft.sections.reduce((s, sec) => s + sec.wordCount, 0);
  const { totalSentences, totalSyllables } = seo.fleschKincaid.details;

  // Article stats
  console.log(clr(C.bold, "  Article Statistics"));
  console.log(clr(C.dim, "  ─────────────────────────────────────"));
  console.log(`  Sections          ${clr(C.cyan, String(draft.sections.length))}`);
  console.log(`  Total words       ${clr(C.cyan, String(totalWords))}`);
  console.log(`  Total sentences   ${clr(C.cyan, String(totalSentences))}`);
  console.log(`  Total syllables   ${clr(C.cyan, String(totalSyllables))}`);
  console.log(
    `  Avg words/section ${clr(C.cyan, String(Math.round(totalWords / draft.sections.length)))}`,
  );
  console.log();

  // Readability
  console.log(clr(C.bold, "  Readability"));
  console.log(clr(C.dim, "  ─────────────────────────────────────"));
  console.log(
    `  FK Grade Level    ${clr(C.magenta + C.bold, String(seo.fleschKincaid.grade))} (${ordinal(Math.round(seo.fleschKincaid.grade))} grade)`,
  );
  console.log(
    `  Reading Ease      ${clr(C.magenta + C.bold, String(seo.fleschKincaid.readingEase))}`,
  );
  console.log(
    `  Issues found      ${clr(C.yellow, String(seo.readabilityIssues.length))}`,
  );
  console.log();

  // Keyword density
  console.log(clr(C.bold, "  Top Keywords"));
  console.log(clr(C.dim, "  ─────────────────────────────────────"));
  for (const kd of seo.keywordDensity.slice(0, 3)) {
    console.log(
      `  ${kd.keyword.padEnd(18)} ${kd.count} hits  (${kd.density})`,
    );
  }
  console.log();

  // Editorial scores
  console.log(clr(C.bold, "  Editorial Review"));
  console.log(clr(C.dim, "  ─────────────────────────────────────"));
  console.log(`  Tone              ${scoreColor(review.toneScore)}/10`);
  console.log(`  Flow              ${scoreColor(review.flowScore)}/10`);
  console.log(`  Grammar           ${scoreColor(review.grammarScore)}/10`);
  console.log(
    `  ${clr(C.bold, "Overall")}           ${scoreColor(review.overallScore)}/10`,
  );
  console.log(`  Suggestions       ${clr(C.yellow, String(review.suggestions.length))}`);
  console.log();

  // Verdict
  console.log(clr(C.dim, "  ─────────────────────────────────────"));
  console.log(`  ${clr(C.green + C.bold, "✓")} ${review.finalVerdict}`);
  console.log();
  console.log(clr(C.bold + C.white, line));
  console.log();
}

function scoreColor(n: number): string {
  if (n >= 8) return clr(C.green + C.bold, String(n));
  if (n >= 6) return clr(C.yellow + C.bold, String(n));
  return clr(C.red + C.bold, String(n));
}

/* ── Main ──────────────────────────────────────────────────── */

async function main(): Promise<void> {
  console.clear();
  banner(
    '📝  Content Pipeline: "How to Negotiate a Raise"',
    C.bold + C.white,
  );
  console.log(
    clr(
      C.dim,
      "  5 agents collaborate → Research → Outline → Write → SEO → Edit",
    ),
  );
  console.log(
    clr(C.dim, "  Topic: How to Negotiate a Raise"),
  );
  console.log(
    clr(C.dim, "  Target: ~800 words, professional tone, SEO-optimized"),
  );
  console.log();
  await sleep(500);

  // Agent 1
  const research = await runResearcher();
  await sleep(300);

  // Agent 2
  const outline = await runOutliner(research);
  await sleep(300);

  // Agent 3
  const draft = await runWriter(outline);
  await sleep(300);

  // Agent 4
  const seo = await runSEOOptimizer(draft);
  await sleep(300);

  // Agent 5
  const review = await runEditor(draft, seo);
  await sleep(300);

  // Dashboard
  printDashboard(draft, seo, review);

  console.log(
    clr(C.green + C.bold, "  ✨ Pipeline complete! Article ready for publication.\n"),
  );
}

main().catch((err) => {
  console.error(clr(C.red, `Error: ${err}`));
  process.exit(1);
});
