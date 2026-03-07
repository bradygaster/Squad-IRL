// Medical Appointment Prep — Multi-Agent Squad Simulation
// 5 agents collaborate to prepare for a doctor's appointment

// ─── ANSI Color Helpers ───────────────────────────────────────────────────────

const C = {
  reset: "\x1b[0m", bold: "\x1b[1m", dim: "\x1b[2m",
  red: "\x1b[31m", green: "\x1b[32m", yellow: "\x1b[33m",
  blue: "\x1b[34m", magenta: "\x1b[35m", cyan: "\x1b[36m",
  white: "\x1b[37m", bgRed: "\x1b[41m", bgGreen: "\x1b[42m",
  bgYellow: "\x1b[43m", bgBlue: "\x1b[44m", bgMagenta: "\x1b[45m",
};

const clr = (color: string, text: string) => `${color}${text}${C.reset}`;
const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

// ─── Data Structures ──────────────────────────────────────────────────────────

interface Symptom {
  name: string;
  onsetDate: string;
  severity: number;
  frequency: "daily" | "weekly" | "intermittent";
  description: string;
  bodyArea: string;
  worsensWhen: string;
}

interface MedicalEvent {
  date: string;
  type: "condition" | "surgery" | "medication" | "allergy" | "vaccination" | "lab";
  description: string;
  status: "active" | "resolved" | "ongoing";
  details: string;
}

interface InsuranceInfo {
  provider: string;
  planType: string;
  memberId: string;
  copayPrimary: number;
  copaySpecialist: number;
  deductible: number;
  deductibleMet: number;
  coinsurance: number;
  preAuthRequired: string[];
  coveredServices: { service: string; coverage: string; notes: string }[];
}

interface ScoredSymptom extends Symptom {
  compositeScore: number;
  freqWeight: number;
  durWeight: number;
  daysSinceOnset: number;
  priority: string;
}

interface Question {
  id: number;
  category: string;
  text: string;
  reasoning: string;
  detail: string;
  priority: number;
  stars: string;
}

// ─── Demo Data ────────────────────────────────────────────────────────────────

const symptoms: Symptom[] = [
  { name: "Persistent headaches", onsetDate: "2024-11-15", severity: 7, frequency: "daily", description: "Throbbing pain behind eyes, worse in afternoon", bodyArea: "Head / temples", worsensWhen: "Screen time, bright lights, stress" },
  { name: "Lower back pain", onsetDate: "2024-09-20", severity: 6, frequency: "daily", description: "Dull ache in lumbar region, occasionally sharp", bodyArea: "Lower back / lumbar", worsensWhen: "Sitting > 1 hour, bending, lifting" },
  { name: "Chronic fatigue", onsetDate: "2024-08-01", severity: 8, frequency: "daily", description: "Exhaustion despite 7-8 hrs sleep, no energy by noon", bodyArea: "Systemic / whole body", worsensWhen: "Afternoons, after meals, on exertion" },
  { name: "Insomnia", onsetDate: "2024-10-10", severity: 5, frequency: "weekly", description: "Difficulty falling asleep, waking at 3 AM", bodyArea: "Neurological / sleep", worsensWhen: "Stressful days, caffeine after noon" },
  { name: "Heart palpitations", onsetDate: "2025-01-05", severity: 4, frequency: "intermittent", description: "Fluttering sensation, lasts 5-10 seconds", bodyArea: "Chest / cardiac", worsensWhen: "Caffeine, anxiety, lying down" },
  { name: "Joint stiffness", onsetDate: "2024-07-15", severity: 6, frequency: "daily", description: "Morning stiffness in knees and hands, ~30 min", bodyArea: "Knees / hands", worsensWhen: "Morning, cold weather, inactivity" },
  { name: "Digestive issues", onsetDate: "2024-12-01", severity: 5, frequency: "weekly", description: "Bloating and discomfort after meals", bodyArea: "Abdomen / GI tract", worsensWhen: "Dairy, large meals, eating quickly" },
  { name: "Dizziness on standing", onsetDate: "2025-01-20", severity: 3, frequency: "intermittent", description: "Brief lightheadedness when standing quickly", bodyArea: "Neurological / vestibular", worsensWhen: "Standing quickly, dehydration, hot showers" },
];

const medicalHistory: MedicalEvent[] = [
  { date: "2018-03-10", type: "condition", description: "Hypertension diagnosed", status: "ongoing", details: "BP consistently 145/92, started monitoring and lifestyle changes" },
  { date: "2019-06-22", type: "surgery", description: "Appendectomy", status: "resolved", details: "Emergency laparoscopic surgery, full recovery in 3 weeks" },
  { date: "2020-01-15", type: "medication", description: "Started Lisinopril 10mg", status: "active", details: "ACE inhibitor for blood pressure management, taken daily" },
  { date: "2020-04-10", type: "allergy", description: "Penicillin allergy confirmed", status: "active", details: "Hives and throat swelling, documented anaphylaxis risk" },
  { date: "2021-04-20", type: "vaccination", description: "COVID-19 vaccination (Pfizer)", status: "resolved", details: "Two-dose series completed, mild side effects" },
  { date: "2021-09-14", type: "lab", description: "Annual bloodwork", status: "resolved", details: "CBC normal, lipid panel borderline, A1C 5.8%" },
  { date: "2022-02-08", type: "condition", description: "Pre-diabetes flagged", status: "ongoing", details: "A1C 6.1%, fasting glucose 118 mg/dL, lifestyle modifications advised" },
  { date: "2022-06-30", type: "lab", description: "Vitamin D deficiency", status: "active", details: "Level 18 ng/mL (low), started 2000 IU daily supplement" },
  { date: "2023-01-12", type: "surgery", description: "Right knee arthroscopy", status: "resolved", details: "Meniscus tear repair, 6 weeks PT, good outcome" },
  { date: "2023-05-20", type: "medication", description: "Started Metformin 500mg", status: "active", details: "For pre-diabetes management, taken with evening meal" },
  { date: "2024-03-15", type: "vaccination", description: "Flu shot (2024-2025 season)", status: "resolved", details: "Annual influenza vaccination, no adverse reaction" },
  { date: "2024-06-10", type: "lab", description: "Cholesterol panel elevated", status: "ongoing", details: "Total 242, LDL 158, HDL 42 — lifestyle changes + recheck in 6 months" },
  { date: "2024-09-05", type: "medication", description: "Started Vitamin D3 2000 IU", status: "active", details: "Daily supplement for confirmed deficiency" },
];

const insurance: InsuranceInfo = {
  provider: "Blue Cross Blue Shield",
  planType: "PPO Gold",
  memberId: "BCBS-2847291-A",
  copayPrimary: 25,
  copaySpecialist: 50,
  deductible: 1500,
  deductibleMet: 1120,
  coinsurance: 20,
  preAuthRequired: ["MRI", "CT Scan", "Physical Therapy (>12 visits)", "Surgery", "Sleep Study"],
  coveredServices: [
    { service: "Primary care visit", coverage: "100% after copay", notes: "No deductible applies" },
    { service: "Lab work / bloodwork", coverage: "90% after deductible", notes: "In-network labs only" },
    { service: "X-ray / imaging", coverage: "80% after deductible", notes: "Pre-auth for MRI/CT" },
    { service: "Specialist referral", coverage: "100% after $50 copay", notes: "Referral required" },
    { service: "Prescription (generic)", coverage: "$10 copay", notes: "90-day mail order available" },
    { service: "Prescription (brand)", coverage: "$35 copay", notes: "Formulary only" },
    { service: "Physical therapy", coverage: "80% after deductible", notes: "Pre-auth after 12 visits" },
    { service: "Preventive / wellness", coverage: "100% covered", notes: "Annual wellness exam included" },
  ],
};

// ─── Utility Functions ────────────────────────────────────────────────────────

function daysBetween(dateStr: string, now: Date): number {
  const d = new Date(dateStr);
  return Math.floor((now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24));
}

function padRight(s: string, len: number): string {
  // Strip ANSI codes for length calculation
  const stripped = s.replace(/\x1b\[[0-9;]*m/g, "");
  const pad = Math.max(0, len - stripped.length);
  return s + " ".repeat(pad);
}

function padLeft(s: string, len: number): string {
  const stripped = s.replace(/\x1b\[[0-9;]*m/g, "");
  const pad = Math.max(0, len - stripped.length);
  return " ".repeat(pad) + s;
}

function printSectionHeader(emoji: string, title: string, agentNum: number) {
  const bar = "━".repeat(60);
  console.log();
  console.log(clr(C.cyan, bar));
  console.log(clr(C.bold + C.cyan, `  Agent ${agentNum}/5  ${emoji}  ${title}`));
  console.log(clr(C.cyan, bar));
}

// ─── Agent 1: Symptom Logger ─────────────────────────────────────────────────

async function symptomLogger(symptoms: Symptom[]): Promise<ScoredSymptom[]> {
  printSectionHeader("🩺", "Symptom Logger", 1);
  await sleep(200);

  const now = new Date("2025-02-15");
  console.log(clr(C.dim, "\n  Scoring algorithm: compositeScore = severity × frequencyWeight × durationWeight"));
  console.log(clr(C.dim, "  frequencyWeight: daily=1.5, weekly=1.0, intermittent=0.6"));
  console.log(clr(C.dim, "  durationWeight:  >90 days=1.3, >30 days=1.1, ≤30 days=1.0\n"));
  await sleep(300);

  const freqWeights: Record<string, number> = { daily: 1.5, weekly: 1.0, intermittent: 0.6 };

  const scored: ScoredSymptom[] = symptoms.map((s) => {
    const days = daysBetween(s.onsetDate, now);
    const fw = freqWeights[s.frequency] ?? 1.0;
    const dw = days > 90 ? 1.3 : days > 30 ? 1.1 : 1.0;
    const cs = Math.round(s.severity * fw * dw * 10) / 10;
    const priority = cs > 8 ? "CRITICAL" : cs > 5 ? "MODERATE" : "LOW";
    return { ...s, compositeScore: cs, freqWeight: fw, durWeight: dw, daysSinceOnset: days, priority };
  });

  scored.sort((a, b) => b.compositeScore - a.compositeScore);

  // Show scoring math for each symptom
  console.log(clr(C.bold, "  Applying scoring formula:"));
  for (const s of scored) {
    await sleep(150);
    const sevClr = s.compositeScore > 8 ? C.red : s.compositeScore > 5 ? C.yellow : C.green;
    console.log(
      `  ${clr(C.white, padRight(s.name, 24))} → ` +
      `${s.severity} × ${s.freqWeight} × ${s.durWeight} = ${clr(sevClr + C.bold, s.compositeScore.toFixed(1).padStart(5))} ` +
      `(${s.daysSinceOnset}d, ${s.frequency})`
    );
  }

  await sleep(300);

  // Render table
  const cols = [22, 8, 12, 8, 9, 10];
  const headers = ["Symptom", "Severity", "Frequency", "Days", "Score", "Priority"];

  console.log();
  console.log("  ┌" + cols.map((w) => "─".repeat(w + 2)).join("┬") + "┐");
  console.log(
    "  │" +
    headers.map((h, i) => " " + clr(C.bold + C.white, padRight(h, cols[i])) + " ").join("│") +
    "│"
  );
  console.log("  ├" + cols.map((w) => "─".repeat(w + 2)).join("┼") + "┤");

  for (const s of scored) {
    await sleep(120);
    const sevClr = s.compositeScore > 8 ? C.red : s.compositeScore > 5 ? C.yellow : C.green;
    const prClr = s.priority === "CRITICAL" ? C.red + C.bold : s.priority === "MODERATE" ? C.yellow : C.green;
    const sevBar = "█".repeat(s.severity) + "░".repeat(10 - s.severity);
    console.log(
      "  │ " + padRight(s.name, cols[0]) +
      " │ " + padRight(clr(sevClr, sevBar), cols[1]) +
      " │ " + padRight(s.frequency, cols[2]) +
      " │ " + padLeft(String(s.daysSinceOnset), cols[3]) +
      " │ " + padLeft(clr(sevClr + C.bold, s.compositeScore.toFixed(1)), cols[4]) +
      " │ " + padRight(clr(prClr, s.priority), cols[5]) +
      " │"
    );
  }

  console.log("  └" + cols.map((w) => "─".repeat(w + 2)).join("┴") + "┘");

  const critCount = scored.filter((s) => s.priority === "CRITICAL").length;
  const modCount = scored.filter((s) => s.priority === "MODERATE").length;
  console.log(
    `\n  ${clr(C.bold, "Summary:")} ${clr(C.red, `${critCount} critical`)}, ` +
    `${clr(C.yellow, `${modCount} moderate`)}, ` +
    `${clr(C.green, `${scored.length - critCount - modCount} low`)} priority symptoms`
  );
  console.log(clr(C.green + C.bold, "\n  ✓ Symptom Logger complete"));
  return scored;
}

// ─── Agent 2: History Compiler ────────────────────────────────────────────────

async function historyCompiler(events: MedicalEvent[]): Promise<MedicalEvent[]> {
  printSectionHeader("📋", "History Compiler", 2);
  await sleep(200);

  const sorted = [...events].sort((a, b) => a.date.localeCompare(b.date));

  const typeIcons: Record<string, string> = {
    condition: "●", surgery: "✚", medication: "💊",
    allergy: "⚠", vaccination: "💉", lab: "🔬",
  };

  const statusColors: Record<string, string> = {
    resolved: C.green, active: C.yellow, ongoing: C.red,
  };

  console.log(clr(C.dim, "\n  Rendering medical timeline...\n"));
  await sleep(200);

  let lastYear = "";
  for (let i = 0; i < sorted.length; i++) {
    const ev = sorted[i];
    const year = ev.date.substring(0, 4);
    const month = ev.date.substring(5, 7);
    const icon = typeIcons[ev.type] || "•";
    const sClr = statusColors[ev.status] || C.white;
    const statusTag = clr(sClr + C.bold, `[${ev.status.toUpperCase()}]`);

    if (year !== lastYear) {
      if (lastYear !== "") {
        console.log("           │");
      }
      console.log(clr(C.bold + C.blue, `    ${year}`) + " ─── " + icon + " " + clr(C.bold, ev.description) + " " + statusTag);
      lastYear = year;
    } else {
      console.log("           │");
      console.log("         ─── " + icon + " " + clr(C.bold, ev.description) + " " + statusTag);
    }
    console.log("           │  " + clr(C.dim, `${month}/${year}  ${ev.details}`));
    await sleep(150);
  }
  console.log("           │");
  console.log("         ─── " + clr(C.cyan + C.bold, "● TODAY") + clr(C.dim, " (2025-02-15)"));

  // Summarize
  const active = sorted.filter((e) => e.status === "active");
  const ongoing = sorted.filter((e) => e.status === "ongoing");
  const allergies = sorted.filter((e) => e.type === "allergy");
  const meds = sorted.filter((e) => e.type === "medication" && e.status === "active");

  console.log(
    `\n  ${clr(C.bold, "Summary:")} ${clr(C.red, `${ongoing.length} ongoing conditions`)}, ` +
    `${clr(C.yellow, `${meds.length} active medications`)}, ` +
    `${clr(C.magenta, `${allergies.length} known allergies`)}`
  );
  console.log(clr(C.green + C.bold, "\n  ✓ History Compiler complete"));
  return sorted;
}

// ─── Agent 3: Question Generator ─────────────────────────────────────────────

async function questionGenerator(
  scoredSymptoms: ScoredSymptom[],
  history: MedicalEvent[]
): Promise<Question[]> {
  printSectionHeader("❓", "Question Generator", 3);
  await sleep(200);

  console.log(clr(C.dim, "\n  Cross-referencing symptoms with medications and history...\n"));
  await sleep(300);

  const questions: Question[] = [
    {
      id: 1, category: "Symptom-Related",
      text: "Could the chronic fatigue and headaches be interconnected?",
      reasoning: "Fatigue (score 15.6) and headaches (score 10.5) are the top two symptoms.",
      detail: "Both are daily and worsened by stress — a shared root cause (sleep, hormonal, neurological) should be explored.",
      priority: 3, stars: "★★★",
    },
    {
      id: 2, category: "Medication-Related",
      text: "Could fatigue be a side effect of Lisinopril?",
      reasoning: "Fatigue (severity 8) onset ~4 years after starting Lisinopril 10mg.",
      detail: "ACE inhibitors cause fatigue in 5-10% of patients. Consider dosage review or alternative.",
      priority: 3, stars: "★★★",
    },
    {
      id: 3, category: "Medication-Related",
      text: "Is Metformin contributing to the digestive issues?",
      reasoning: "Digestive issues (bloating) began after Metformin was introduced.",
      detail: "GI side effects are the most common Metformin complaint (up to 25% of patients).",
      priority: 3, stars: "★★★",
    },
    {
      id: 4, category: "Symptom-Related",
      text: "Should we investigate the dizziness and palpitations together?",
      reasoning: "Dizziness on standing + heart palpitations could indicate orthostatic hypotension.",
      detail: "Combined with Lisinopril (blood pressure lowering), BP may be dropping too low on standing.",
      priority: 2, stars: "★★☆",
    },
    {
      id: 5, category: "Preventive",
      text: "Is it time to recheck A1C and fasting glucose?",
      reasoning: "Pre-diabetes flagged in 2022 (A1C 6.1%). On Metformin since 2023.",
      detail: "Last lab was 2024-06 — a 6-month follow-up is overdue to assess Metformin efficacy.",
      priority: 3, stars: "★★★",
    },
    {
      id: 6, category: "Symptom-Related",
      text: "Could the joint stiffness be early-stage arthritis?",
      reasoning: "Joint stiffness (score 11.7) has persisted 7+ months with morning pattern.",
      detail: "30-min morning stiffness in hands + knees warrants rheumatologic screening (RF, anti-CCP).",
      priority: 2, stars: "★★☆",
    },
    {
      id: 7, category: "Preventive",
      text: "Should we follow up on the elevated cholesterol panel?",
      reasoning: "Total cholesterol 242, LDL 158 flagged 2024-06 with 6-month recheck scheduled.",
      detail: "Recheck is now overdue. Consider statin discussion if lifestyle changes insufficient.",
      priority: 2, stars: "★★☆",
    },
    {
      id: 8, category: "Lifestyle",
      text: "Would a sleep study help investigate insomnia and fatigue?",
      reasoning: "Insomnia (waking at 3 AM) + severe fatigue despite adequate sleep hours.",
      detail: "Possible sleep apnea or circadian disruption. Note: sleep study requires pre-authorization.",
      priority: 2, stars: "★★☆",
    },
    {
      id: 9, category: "Medication-Related",
      text: "Is Vitamin D supplementation adequate? Should we recheck levels?",
      reasoning: "Vitamin D deficiency (18 ng/mL) found 2022, supplementing 2000 IU since 2024-09.",
      detail: "Low Vitamin D is linked to fatigue, joint pain, and mood — a recheck could be very informative.",
      priority: 2, stars: "★★☆",
    },
    {
      id: 10, category: "Lifestyle",
      text: "Are there ergonomic or exercise changes for the lower back pain?",
      reasoning: "Lower back pain (score 9.9) worsens with prolonged sitting and bending.",
      detail: "Prior knee arthroscopy (2023) may have altered gait/posture, contributing to lumbar strain.",
      priority: 1, stars: "★☆☆",
    },
  ];

  const categories = ["Symptom-Related", "Medication-Related", "Preventive", "Lifestyle"];
  for (const cat of categories) {
    const catQs = questions.filter((q) => q.category === cat);
    if (catQs.length === 0) continue;

    const catColor = cat === "Symptom-Related" ? C.red : cat === "Medication-Related" ? C.magenta : cat === "Preventive" ? C.blue : C.green;
    console.log(clr(catColor + C.bold, `  ┌─ ${cat} ${"─".repeat(Math.max(0, 50 - cat.length))}`));

    for (const q of catQs) {
      await sleep(200);
      const priClr = q.priority === 3 ? C.red + C.bold : q.priority === 2 ? C.yellow : C.green;
      console.log(`  │`);
      console.log(`  │  ${clr(C.bold + C.white, `Q${q.id}`)} ${clr(C.dim, `[${q.category}]`)} ${clr(C.bold, q.text)}`);
      console.log(`  │     ${clr(C.cyan, "Reasoning:")} ${q.reasoning}`);
      console.log(`  │                ${q.detail}`);
      console.log(`  │     ${clr(C.dim, "Priority:")} ${clr(priClr, q.stars + (q.priority === 3 ? " HIGH" : q.priority === 2 ? " MEDIUM" : " LOW"))}`);
    }
    console.log(`  └${"─".repeat(58)}`);
    console.log();
  }

  console.log(`  ${clr(C.bold, "Generated:")} ${questions.length} questions across ${categories.length} categories`);
  console.log(clr(C.green + C.bold, "\n  ✓ Question Generator complete"));
  return questions;
}

// ─── Agent 4: Insurance Verifier ─────────────────────────────────────────────

async function insuranceVerifier(
  ins: InsuranceInfo,
  scoredSymptoms: ScoredSymptom[]
): Promise<void> {
  printSectionHeader("💳", "Insurance Verifier", 4);
  await sleep(200);

  // Insurance card
  console.log();
  console.log("  ┌──────────────────────────────────────────────────────┐");
  console.log("  │  " + clr(C.bold + C.blue, padRight("INSURANCE CARD", 52)) + "│");
  console.log("  ├──────────────────────────────────────────────────────┤");
  console.log("  │  Provider:    " + clr(C.bold, padRight(ins.provider, 38)) + "│");
  console.log("  │  Plan:        " + padRight(ins.planType, 38) + "│");
  console.log("  │  Member ID:   " + clr(C.cyan, padRight(ins.memberId, 38)) + "│");
  console.log("  │  Copay (PCP): " + padRight(`$${ins.copayPrimary}`, 38) + "│");
  console.log("  │  Copay (Spc): " + padRight(`$${ins.copaySpecialist}`, 38) + "│");
  console.log("  │  Deductible:  " + padRight(`$${ins.deductible} (met: $${ins.deductibleMet})`, 38) + "│");
  console.log("  │  Coinsurance: " + padRight(`${ins.coinsurance}% after deductible`, 38) + "│");
  console.log("  └──────────────────────────────────────────────────────┘");
  await sleep(300);

  // Cost estimation
  console.log(clr(C.bold, "\n  Estimated Visit Cost Breakdown:"));
  console.log(clr(C.dim, "  ─────────────────────────────────────"));
  await sleep(150);

  const remaining = ins.deductible - ins.deductibleMet;
  console.log(`  Base copay (primary care):       ${clr(C.yellow, `$${ins.copayPrimary}`)}`);
  await sleep(100);
  console.log(`  Deductible remaining:            $${ins.deductible} - $${ins.deductibleMet} = ${clr(C.yellow, `$${remaining}`)}`);
  await sleep(100);

  const labCost = 150;
  const labAfterDeductible = Math.max(0, labCost - remaining);
  const labPatientShare = remaining > 0 ? Math.min(labCost, remaining) + labAfterDeductible * (ins.coinsurance / 100) : labCost * (ins.coinsurance / 100);
  console.log(`  Est. lab work (~$${labCost}):            Patient share = ${clr(C.yellow, `$${labPatientShare.toFixed(0)}`)}`);
  await sleep(100);

  const totalEstimate = ins.copayPrimary + labPatientShare;
  console.log(clr(C.dim, "  ─────────────────────────────────────"));
  console.log(`  ${clr(C.bold, "Estimated out-of-pocket:")}           ${clr(C.bold + C.yellow, `$${totalEstimate.toFixed(0)}`)}`);
  await sleep(300);

  // Coverage table
  console.log(clr(C.bold, "\n  Coverage Breakdown:"));
  const sCols = [26, 22, 26];
  console.log("  ┌" + sCols.map((w) => "─".repeat(w + 2)).join("┬") + "┐");
  console.log(
    "  │ " + clr(C.bold, padRight("Service", sCols[0])) +
    " │ " + clr(C.bold, padRight("Coverage", sCols[1])) +
    " │ " + clr(C.bold, padRight("Notes", sCols[2])) + " │"
  );
  console.log("  ├" + sCols.map((w) => "─".repeat(w + 2)).join("┼") + "┤");

  for (const svc of ins.coveredServices) {
    await sleep(100);
    console.log(
      "  │ " + padRight(svc.service, sCols[0]) +
      " │ " + padRight(clr(C.green, svc.coverage), sCols[1]) +
      " │ " + padRight(svc.notes, sCols[2]) + " │"
    );
  }
  console.log("  └" + sCols.map((w) => "─".repeat(w + 2)).join("┴") + "┘");
  await sleep(200);

  // Pre-auth flags
  console.log(clr(C.bold + C.yellow, "\n  ⚠  Pre-Authorization Alerts:"));
  const backPain = scoredSymptoms.find((s) => s.name.includes("back"));
  const sleepIssue = scoredSymptoms.find((s) => s.name.includes("Insomnia"));
  const joints = scoredSymptoms.find((s) => s.name.includes("Joint"));

  if (backPain) {
    await sleep(150);
    console.log(
      `  ${clr(C.red, "→")} Lower back pain may require ${clr(C.bold, "MRI")} — ` +
      clr(C.red, "PRE-AUTH REQUIRED")
    );
  }
  if (sleepIssue) {
    await sleep(150);
    console.log(
      `  ${clr(C.red, "→")} Insomnia + fatigue may warrant ${clr(C.bold, "Sleep Study")} — ` +
      clr(C.red, "PRE-AUTH REQUIRED")
    );
  }
  if (joints) {
    await sleep(150);
    console.log(
      `  ${clr(C.yellow, "→")} Joint stiffness may need ${clr(C.bold, "Specialist referral")} — ` +
      clr(C.yellow, "referral needed, $50 copay")
    );
  }

  console.log(clr(C.green + C.bold, "\n  ✓ Insurance Verifier complete"));
}

// ─── Agent 5: Visit Planner ──────────────────────────────────────────────────

async function visitPlanner(
  scoredSymptoms: ScoredSymptom[],
  history: MedicalEvent[],
  questions: Question[],
  ins: InsuranceInfo
): Promise<void> {
  printSectionHeader("📝", "Visit Planner", 5);
  await sleep(200);

  // Time allocation
  const totalMinutes = 15;
  const segments = [
    { label: "Vital signs & intake", minutes: 2, color: C.blue },
    { label: "Symptom discussion", minutes: 5, color: C.red },
    { label: "History review", minutes: 2, color: C.magenta },
    { label: "Questions for doctor", minutes: 4, color: C.yellow },
    { label: "Next steps & orders", minutes: 2, color: C.green },
  ];

  console.log(clr(C.bold, "\n  Time-Budget Optimization (15-minute appointment):"));
  console.log();

  const barWidth = 45;
  for (const seg of segments) {
    await sleep(150);
    const filled = Math.round((seg.minutes / totalMinutes) * barWidth);
    const bar = clr(seg.color, "█".repeat(filled)) + clr(C.dim, "░".repeat(barWidth - filled));
    console.log(`  ${padRight(seg.label, 22)} ${bar} ${seg.minutes} min`);
  }

  console.log(clr(C.dim, `\n  Total: ${totalMinutes} minutes allocated`));
  await sleep(400);

  // Visit Summary Sheet
  const top3 = scoredSymptoms.slice(0, 3);
  const top5q = questions.sort((a, b) => b.priority - a.priority).slice(0, 5);
  const activeMeds = history.filter((e) => e.type === "medication" && e.status === "active");
  const allergies = history.filter((e) => e.type === "allergy");

  const w = 62;
  const line = "═".repeat(w);
  const divider = "─".repeat(w);

  console.log();
  console.log("  ╔" + line + "╗");
  console.log("  ║" + clr(C.bold + C.cyan, centerText("VISIT SUMMARY SHEET", w)) + "║");
  console.log("  ║" + clr(C.dim, centerText("Prepared by Medical Appointment Prep Squad", w)) + "║");
  console.log("  ║" + clr(C.dim, centerText("Date: 2025-02-15  |  Provider: Dr. Primary Care", w)) + "║");
  console.log("  ╠" + line + "╣");
  await sleep(200);

  // Top 3 concerns
  console.log("  ║" + clr(C.bold + C.red, padRight("  TOP 3 CONCERNS", w)) + "║");
  console.log("  ║" + " ".repeat(w) + "║");
  for (let i = 0; i < top3.length; i++) {
    const s = top3[i];
    const tag = s.priority === "CRITICAL" ? clr(C.red, "CRITICAL") : clr(C.yellow, "MODERATE");
    console.log("  ║  " + padRight(truncate(`${i + 1}. ${s.name} (score: ${s.compositeScore.toFixed(1)}) — ${s.priority}`, w - 2), w - 2) + "║");
    console.log("  ║  " + padRight(clr(C.dim, truncate(`   ${s.description}`, w - 2)), w - 2) + "║");
    await sleep(100);
  }

  console.log("  ║" + divider + "║");
  await sleep(100);

  // Must-ask questions
  console.log("  ║" + clr(C.bold + C.yellow, padRight("  MUST-ASK QUESTIONS (top 5)", w)) + "║");
  console.log("  ║" + " ".repeat(w) + "║");
  for (const q of top5q) {
    console.log("  ║  " + padRight(truncate(`${q.stars} ${q.text}`, w - 2), w - 2) + "║");
    await sleep(100);
  }

  console.log("  ║" + divider + "║");
  await sleep(100);

  // Current medications
  console.log("  ║" + clr(C.bold + C.magenta, padRight("  CURRENT MEDICATIONS", w)) + "║");
  console.log("  ║" + " ".repeat(w) + "║");
  for (const med of activeMeds) {
    console.log("  ║  " + padRight(truncate(`💊 ${med.description} — ${med.details}`, w - 4), w - 2) + "║");
    await sleep(100);
  }

  console.log("  ║" + divider + "║");

  // Allergies alert
  console.log("  ║" + clr(C.bold + C.red, padRight("  ⚠ ALLERGIES", w)) + "║");
  console.log("  ║" + " ".repeat(w) + "║");
  for (const a of allergies) {
    console.log("  ║  " + padRight(clr(C.red, truncate(`⚠ ${a.description}: ${a.details}`, w - 2)), w - 2) + "║");
  }

  console.log("  ║" + divider + "║");
  await sleep(100);

  // Insurance quick ref
  console.log("  ║" + clr(C.bold + C.blue, padRight("  INSURANCE QUICK-REF", w)) + "║");
  console.log("  ║" + " ".repeat(w) + "║");
  console.log("  ║  " + padRight(`Provider: ${ins.provider} (${ins.planType})`, w - 2) + "║");
  console.log("  ║  " + padRight(`Member ID: ${ins.memberId}`, w - 2) + "║");
  console.log("  ║  " + padRight(`Copay: $${ins.copayPrimary} (PCP) / $${ins.copaySpecialist} (Specialist)`, w - 2) + "║");

  console.log("  ╚" + line + "╝");
  await sleep(200);

  console.log(clr(C.green + C.bold, "\n  ✓ Visit Planner complete"));
}

function truncate(text: string, maxLen: number): string {
  if (text.length <= maxLen) return text;
  return text.substring(0, maxLen - 1) + "…";
}

function centerText(text: string, width: number): string {
  const stripped = text.replace(/\x1b\[[0-9;]*m/g, "");
  const pad = Math.max(0, width - stripped.length);
  const left = Math.floor(pad / 2);
  const right = pad - left;
  return " ".repeat(left) + text + " ".repeat(right);
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log();
  console.log(clr(C.bold + C.cyan, "  ╔══════════════════════════════════════════════════════════╗"));
  console.log(clr(C.bold + C.cyan, "  ║     🏥  Medical Appointment Prep — Squad Simulation     ║"));
  console.log(clr(C.bold + C.cyan, "  ║         5 agents preparing your doctor visit             ║"));
  console.log(clr(C.bold + C.cyan, "  ╚══════════════════════════════════════════════════════════╝"));
  console.log();
  console.log(clr(C.dim, "  Agents: 🩺 Symptom Logger → 📋 History Compiler → ❓ Question Generator"));
  console.log(clr(C.dim, "          → 💳 Insurance Verifier → 📝 Visit Planner"));
  console.log();

  await sleep(500);

  // Agent 1
  const scoredSymptoms = await symptomLogger(symptoms);
  await sleep(400);

  // Agent 2
  const sortedHistory = await historyCompiler(medicalHistory);
  await sleep(400);

  // Agent 3
  const questions = await questionGenerator(scoredSymptoms, sortedHistory);
  await sleep(400);

  // Agent 4
  await insuranceVerifier(insurance, scoredSymptoms);
  await sleep(400);

  // Agent 5
  await visitPlanner(scoredSymptoms, sortedHistory, questions, insurance);
  await sleep(300);

  // Final summary
  console.log();
  console.log(clr(C.cyan, "  ━".repeat(30)));
  console.log(clr(C.bold + C.green, "  ✅ All 5 agents complete — your appointment prep is ready!"));
  console.log(clr(C.bold, "  📄 Bring the Visit Summary Sheet to your appointment."));
  console.log(clr(C.dim, "  Tip: Arrive 10 min early to review your top 3 concerns."));
  console.log(clr(C.cyan, "  ━".repeat(30)));
  console.log();
}

main().catch(console.error);
