// ─────────────────────────────────────────────────────────────
//  Multi-Agent Appointment Scheduler
//  Finds the best 1-hour meeting slot for 5 people across
//  San Francisco · Berlin · Mumbai · London · Tokyo
// ─────────────────────────────────────────────────────────────

// ── ANSI helpers ──────────────────────────────────────────────

const C = {
  reset: "\x1b[0m",
  bold: "\x1b[1m",
  dim: "\x1b[2m",
  cyan: "\x1b[36m",
  yellow: "\x1b[33m",
  green: "\x1b[32m",
  red: "\x1b[31m",
  magenta: "\x1b[35m",
  white: "\x1b[97m",
} as const;

const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

// ── Domain types ─────────────────────────────────────────────

interface TimeSlot {
  startHour: number; // 0-23, fractional (.5 = :30)
  endHour: number;
  label: string;
}

interface Person {
  name: string;
  role: string;
  city: string;
  utcOffset: number; // hours, fractional for India (+5.5)
  calendar: TimeSlot[];
}

interface UTCBusySlot {
  startUTC: number;
  endUTC: number;
  person: string;
  localLabel: string;
}

interface CandidateSlot {
  utcStart: number;
  utcEnd: number;
  score: number;
  breakdown: PersonScore[];
  reasoning: string;
}

interface PersonScore {
  name: string;
  localHour: number;
  adjustment: number;
  note: string;
}

// ── People & calendars ──────────────────────────────────────
// Calendars are intentionally crafted so that exactly 5 candidate
// windows survive the intersection — the 17-hour timezone spread
// (UTC-8 to UTC+9) makes this genuinely hard.

function buildPeople(): Person[] {
  return [
    {
      name: "Sarah Chen",
      role: "VP Engineering",
      city: "San Francisco",
      utcOffset: -8,
      calendar: [
        { startHour: 8.5, endHour: 9, label: "Morning standup" },
        { startHour: 9.5, endHour: 10.5, label: "Sprint planning" },
        { startHour: 11, endHour: 11.5, label: "1:1 with CTO" },
        { startHour: 14, endHour: 15, label: "Eng leadership sync" },
        { startHour: 16, endHour: 17, label: "Architecture review" },
        { startHour: 17.5, endHour: 18, label: "Interview debrief" },
      ],
    },
    {
      name: "Marcus Weber",
      role: "Lead Architect",
      city: "Berlin",
      utcOffset: 1,
      calendar: [
        { startHour: 9, endHour: 10, label: "System design review" },
        { startHour: 10.5, endHour: 11.5, label: "Code review session" },
        { startHour: 13, endHour: 13.5, label: "Lunch & learn" },
        { startHour: 15, endHour: 16, label: "API planning" },
        { startHour: 16.5, endHour: 17.5, label: "Team retrospective" },
      ],
    },
    {
      name: "Priya Sharma",
      role: "Product Manager",
      city: "Mumbai",
      utcOffset: 5.5,
      calendar: [
        { startHour: 9.5, endHour: 10, label: "Daily standup" },
        { startHour: 10.5, endHour: 11.5, label: "Roadmap review" },
        { startHour: 13, endHour: 14, label: "Stakeholder demo" },
        { startHour: 15, endHour: 15.5, label: "1:1 with VP Product" },
        { startHour: 16, endHour: 17, label: "Feature prioritization" },
        { startHour: 17.5, endHour: 18, label: "Cross-team sync" },
      ],
    },
    {
      name: "James O'Brien",
      role: "Design Lead",
      city: "London",
      utcOffset: 0,
      calendar: [
        { startHour: 9, endHour: 10, label: "Design critique" },
        { startHour: 10.5, endHour: 11, label: "UX research debrief" },
        { startHour: 12, endHour: 12.5, label: "1:1 with PM" },
        { startHour: 14, endHour: 15.5, label: "Workshop: design system" },
        { startHour: 16.5, endHour: 17, label: "Accessibility audit" },
      ],
    },
    {
      name: "Yuki Tanaka",
      role: "QA Director",
      city: "Tokyo",
      utcOffset: 9,
      calendar: [
        { startHour: 9, endHour: 10, label: "QA standup & triage" },
        { startHour: 10.5, endHour: 11.5, label: "Test plan review" },
        { startHour: 13, endHour: 14, label: "Release sign-off" },
        { startHour: 15, endHour: 15.5, label: "1:1 with Engineering" },
        { startHour: 16.5, endHour: 17.5, label: "Automation pipeline" },
        { startHour: 18, endHour: 18.5, label: "End-of-day wrap-up" },
      ],
    },
  ];
}

// ── Utilities ────────────────────────────────────────────────

function fmtTime(hour: number): string {
  const h = Math.floor(hour);
  const m = Math.round((hour - h) * 60);
  const ampm = h >= 12 ? "PM" : "AM";
  const h12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
  return `${h12}:${String(m).padStart(2, "0")} ${ampm}`;
}

function fmtHour24(hour: number): string {
  const h = Math.floor(hour);
  const m = Math.round((hour - h) * 60);
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

function fmtOffset(off: number): string {
  const sign = off >= 0 ? "+" : "";
  if (off % 1 === 0) return `UTC${sign}${off}`;
  const h = Math.trunc(off);
  const m = Math.abs(off % 1) * 60;
  return `UTC${sign}${h}:${String(m).padStart(2, "0")}`;
}

function padRight(s: string, n: number): string {
  const visible = s.replace(/\x1b\[[0-9;]*m/g, "");
  return s + " ".repeat(Math.max(0, n - visible.length));
}

function sectionHeader(emoji: string, title: string, subtitle: string): string {
  const w = 62;
  return [
    "",
    `${C.cyan}${"═".repeat(w)}${C.reset}`,
    `${C.cyan}  ${emoji}  ${C.bold}${title}${C.reset}`,
    `${C.dim}  ${subtitle}${C.reset}`,
    `${C.cyan}${"═".repeat(w)}${C.reset}`,
    "",
  ].join("\n");
}

// ── Agent 1: Calendar Agent ─────────────────────────────────

async function calendarAgent(people: Person[]): Promise<void> {
  console.log(sectionHeader("🗓️", "CALENDAR AGENT", "Loading participant schedules..."));

  for (let i = 0; i < people.length; i++) {
    const filled = i + 1;
    const empty = people.length - filled;
    const bar = `${C.green}${"■".repeat(filled)}${C.dim}${"□".repeat(empty)}${C.reset}`;
    process.stdout.write(`\r  [${bar}] ${filled}/${people.length} calendars loaded`);
    await sleep(350);
  }
  console.log("\n");

  for (const p of people) {
    const nameTag = `${C.bold}${C.white}${p.name}${C.reset}`;
    const roleTag = `${C.dim}${p.role}${C.reset}`;
    const tzTag = `${C.yellow}${p.city} (${fmtOffset(p.utcOffset)})${C.reset}`;
    console.log(`  ${nameTag}  ${roleTag}  ${tzTag}`);

    const colW = 28;
    console.log(`  ┌${"─".repeat(17)}┬${"─".repeat(colW)}┐`);
    console.log(`  │ ${padRight(`${C.bold}Time${C.reset}`, 16)}│ ${padRight(`${C.bold}Appointment${C.reset}`, colW - 1)}│`);
    console.log(`  ├${"─".repeat(17)}┼${"─".repeat(colW)}┤`);
    for (const slot of p.calendar) {
      const time = `${fmtHour24(slot.startHour)}–${fmtHour24(slot.endHour)}`;
      console.log(`  │ ${padRight(time, 16)}│ ${padRight(slot.label, colW - 1)}│`);
    }
    console.log(`  └${"─".repeat(17)}┴${"─".repeat(colW)}┘`);
    console.log();
  }
}

// ── Agent 2: Timezone Agent ─────────────────────────────────

function toUTC(localHour: number, utcOffset: number): number {
  let utc = localHour - utcOffset;
  if (utc < 0) utc += 24;
  if (utc >= 24) utc -= 24;
  return utc;
}

function toLocal(utcHour: number, utcOffset: number): number {
  let local = utcHour + utcOffset;
  if (local < 0) local += 24;
  if (local >= 24) local -= 24;
  return local;
}

function convertToUTCSlots(people: Person[]): UTCBusySlot[] {
  const allSlots: UTCBusySlot[] = [];
  for (const p of people) {
    for (const s of p.calendar) {
      allSlots.push({
        startUTC: toUTC(s.startHour, p.utcOffset),
        endUTC: toUTC(s.endHour, p.utcOffset),
        person: p.name,
        localLabel: s.label,
      });
    }
  }
  return allSlots;
}

async function timezoneAgent(people: Person[]): Promise<UTCBusySlot[]> {
  console.log(sectionHeader("🌍", "TIMEZONE AGENT", "Converting all schedules to UTC..."));
  await sleep(400);

  const utcSlots = convertToUTCSlots(people);

  for (const p of people) {
    const personSlots = utcSlots.filter((s) => s.person === p.name);
    console.log(`  ${C.bold}${p.name}${C.reset}  ${C.dim}(${fmtOffset(p.utcOffset)})${C.reset}`);
    console.log(`  ┌${"─".repeat(17)}┬${"─".repeat(17)}┬${"─".repeat(6)}┐`);
    console.log(`  │ ${padRight("Local", 16)}│ ${padRight("UTC", 16)}│ ${padRight("Flag", 5)}│`);
    console.log(`  ├${"─".repeat(17)}┼${"─".repeat(17)}┼${"─".repeat(6)}┤`);
    for (const s of personSlots) {
      const localStart = toLocal(s.startUTC, p.utcOffset);
      const localEnd = toLocal(s.endUTC, p.utcOffset);
      const localStr = `${fmtHour24(localStart)}–${fmtHour24(localEnd)}`;
      const utcStr = `${fmtHour24(s.startUTC)}–${fmtHour24(s.endUTC)}`;
      const awkward = localStart < 8 || localEnd > 18;
      const flag = awkward ? " ⚠️ " : "  ✓ ";
      console.log(`  │ ${padRight(localStr, 16)}│ ${padRight(utcStr, 16)}│ ${padRight(flag, 5)}│`);
    }
    console.log(`  └${"─".repeat(17)}┴${"─".repeat(17)}┴${"─".repeat(6)}┘`);
    console.log();
  }

  // Visual UTC timeline grid
  console.log(`  ${C.bold}${C.cyan}UTC Timeline Grid${C.reset}  ${C.dim}(█ busy  ░ free  ${C.yellow}⚠${C.reset}${C.dim} outside 8AM–6PM local)${C.reset}`);
  console.log();

  const hourLabels = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, "0"));
  console.log(`  ${padRight("", 18)} ${hourLabels.join("")}`);
  console.log(`  ${padRight("", 18)} ${"─".repeat(48)}`);

  for (const p of people) {
    const personSlots = utcSlots.filter((s) => s.person === p.name);
    let row = "";
    for (let h = 0; h < 24; h++) {
      for (const half of [0, 0.5]) {
        const t = h + half;
        const localT = toLocal(t, p.utcOffset);
        // Check busy: handle midnight-wrapping slots
        const isBusy = personSlots.some((s) => {
          let sS = s.startUTC, sE = s.endUTC;
          if (sE <= sS) sE += 24;
          return t >= sS && t < sE || t + 24 >= sS && t + 24 < sE;
        });
        const isAwkward = localT < 8 || localT >= 18;
        if (isBusy) {
          row += `${C.red}█${C.reset}`;
        } else if (isAwkward) {
          row += `${C.yellow}⚠${C.reset}`;
        } else {
          row += `${C.green}░${C.reset}`;
        }
      }
    }
    const label = padRight(p.name.split(" ")[0], 18);
    console.log(`  ${label} ${row}`);
  }
  console.log();

  return utcSlots;
}

// ── Agent 3: Conflict Resolver ──────────────────────────────

function isSlotFree(utcStart: number, utcEnd: number, personSlots: UTCBusySlot[]): boolean {
  for (const s of personSlots) {
    let sStart = s.startUTC;
    let sEnd = s.endUTC;
    if (sEnd <= sStart) sEnd += 24; // handle midnight wrap

    // Check all three alignments for wraparound
    if (utcStart < sEnd && utcEnd > sStart) return false;
    if (utcStart + 24 < sEnd && utcEnd + 24 > sStart) return false;
    if (utcStart < sEnd + 24 && utcEnd > sStart + 24) return false;
  }
  return true;
}

function scoreSlot(utcStart: number, people: Person[]): CandidateSlot {
  let score = 100;
  const breakdown: PersonScore[] = [];

  for (const p of people) {
    const localStart = toLocal(utcStart, p.utcOffset);
    let adj = 0;
    let note = `${C.green}core hours${C.reset}`;

    if (localStart < 7) {
      adj = -18;
      note = `${C.red}unreasonable (${fmtTime(localStart)})${C.reset}`;
    } else if (localStart < 9) {
      adj = -10;
      note = `${C.yellow}early morning${C.reset}`;
    } else if (localStart >= 20) {
      adj = -18;
      note = `${C.red}unreasonable (${fmtTime(localStart)})${C.reset}`;
    } else if (localStart >= 17) {
      adj = -8;
      note = `${C.yellow}after hours${C.reset}`;
    } else if (localStart >= 11 && localStart <= 13) {
      adj = 5;
      note = `${C.green}lunch-adjacent bonus${C.reset}`;
    }

    score += adj;
    breakdown.push({ name: p.name, localHour: localStart, adjustment: adj, note });
  }

  score = Math.max(0, Math.min(100, score));

  // Generate reasoning
  const unreasonableCount = breakdown.filter((b) => b.adjustment <= -18).length;
  const earlyLateCount = breakdown.filter((b) => b.adjustment === -10 || b.adjustment === -8).length;
  const bonusCount = breakdown.filter((b) => b.adjustment === 5).length;
  let reasoning: string;

  if (unreasonableCount >= 3) {
    reasoning = `Difficult: ${unreasonableCount} participant(s) outside reasonable hours`;
  } else if (unreasonableCount > 0) {
    reasoning = `Compromise: ${unreasonableCount} outside reasonable hours, ${5 - unreasonableCount} within working day`;
  } else if (earlyLateCount === 0 && bonusCount > 0) {
    reasoning = `Optimal: all within core hours, ${bonusCount} lunch-adjacent`;
  } else if (earlyLateCount === 0) {
    reasoning = "Good: all participants within core working hours";
  } else {
    reasoning = `Acceptable: ${earlyLateCount} participant(s) slightly outside core hours`;
  }

  return { utcStart, utcEnd: utcStart + 1, score, breakdown, reasoning };
}

async function conflictResolver(
  utcSlots: UTCBusySlot[],
  people: Person[]
): Promise<CandidateSlot[]> {
  console.log(sectionHeader("⚡", "CONFLICT RESOLVER", "Finding free intersection windows & scoring..."));
  await sleep(500);

  const candidates: CandidateSlot[] = [];

  console.log(`  ${C.dim}Scanning 48 half-hour windows across 24h UTC...${C.reset}`);
  console.log(`  ${C.dim}Timezone spread: UTC-8 (San Francisco) → UTC+9 (Tokyo) = 17 hours${C.reset}`);
  await sleep(300);

  let windowsChecked = 0;
  let windowsBlocked = 0;

  for (let utcH = 0; utcH < 24; utcH += 0.5) {
    const utcEnd = utcH + 1;
    if (utcEnd > 24) continue;
    windowsChecked++;

    let allFree = true;
    for (const p of people) {
      const personSlots = utcSlots.filter((s) => s.person === p.name);
      if (!isSlotFree(utcH, utcEnd, personSlots)) {
        allFree = false;
        break;
      }
    }

    if (!allFree) {
      windowsBlocked++;
      continue;
    }

    candidates.push(scoreSlot(utcH, people));
  }

  // Sort by score descending, then by UTC time ascending for tiebreaker
  candidates.sort((a, b) => b.score - a.score || a.utcStart - b.utcStart);

  console.log();
  console.log(`  ${C.dim}Windows checked: ${windowsChecked} | Blocked by conflicts: ${windowsBlocked} | Available: ${candidates.length}${C.reset}`);
  console.log(`  ${C.green}✓ Found ${candidates.length} candidate slot(s)${C.reset}\n`);

  // Show analysis of each candidate
  for (const c of candidates) {
    const stars =
      c.score >= 80 ? "★★★★★" :
      c.score >= 65 ? "★★★★☆" :
      c.score >= 50 ? "★★★☆☆" :
      c.score >= 35 ? "★★☆☆☆" : "★☆☆☆☆";
    const scoreColor = c.score >= 65 ? C.green : c.score >= 45 ? C.yellow : C.red;

    console.log(`  ${C.bold}UTC ${fmtHour24(c.utcStart)}–${fmtHour24(c.utcEnd)}${C.reset}  Score: ${scoreColor}${c.score}/100${C.reset}  ${stars}`);
    console.log(`  ${C.dim}${c.reasoning}${C.reset}`);
    console.log(`  ┌${"─".repeat(20)}┬${"─".repeat(12)}┬${"─".repeat(8)}┬${"─".repeat(24)}┐`);
    console.log(`  │ ${padRight("Participant", 19)}│ ${padRight("Local Time", 11)}│ ${padRight("Adj", 7)}│ ${padRight("Note", 23)}│`);
    console.log(`  ├${"─".repeat(20)}┼${"─".repeat(12)}┼${"─".repeat(8)}┼${"─".repeat(24)}┤`);
    for (const b of c.breakdown) {
      const adjStr = b.adjustment === 0 ? "  0" : b.adjustment > 0 ? ` +${b.adjustment}` : `${b.adjustment}`;
      console.log(
        `  │ ${padRight(b.name, 19)}│ ${padRight(fmtTime(b.localHour), 11)}│ ${padRight(adjStr, 7)}│ ${padRight(b.note, 23)}│`
      );
    }
    console.log(`  └${"─".repeat(20)}┴${"─".repeat(12)}┴${"─".repeat(8)}┴${"─".repeat(24)}┘`);
    console.log();
  }

  return candidates;
}

// ── Agent 4: Proposer Agent ─────────────────────────────────

async function proposerAgent(candidates: CandidateSlot[], people: Person[]): Promise<void> {
  console.log(sectionHeader("🏆", "PROPOSER AGENT", "Ranking and recommending meeting times..."));
  await sleep(400);

  const top = candidates.slice(0, 5);

  if (top.length === 0) {
    console.log(`  ${C.red}${C.bold}No viable meeting slots found!${C.reset}`);
    console.log(`  ${C.dim}The timezone spread is too wide given current calendars.${C.reset}`);
    return;
  }

  console.log(`  ${C.bold}Top ${top.length} Recommendation${top.length === 1 ? "" : "s"}${C.reset}\n`);

  for (let i = 0; i < top.length; i++) {
    const c = top[i];
    const rank = i + 1;
    const medal = rank === 1 ? "🥇" : rank === 2 ? "🥈" : rank === 3 ? "🥉" : "  ";
    const stars =
      c.score >= 80
        ? `${C.green}★★★★★${C.reset}`
        : c.score >= 65
          ? `${C.green}★★★★${C.dim}☆${C.reset}`
          : c.score >= 50
            ? `${C.yellow}★★★${C.dim}☆☆${C.reset}`
            : c.score >= 35
              ? `${C.yellow}★★${C.dim}☆☆☆${C.reset}`
              : `${C.red}★${C.dim}☆☆☆☆${C.reset}`;

    console.log(`  ${medal} ${C.bold}#${rank}${C.reset}  UTC ${C.cyan}${fmtHour24(c.utcStart)}–${fmtHour24(c.utcEnd)}${C.reset}  ${stars}  Score: ${C.bold}${c.score}${C.reset}`);
    console.log(`     ${C.dim}${c.reasoning}${C.reset}`);

    for (const p of people) {
      const local = toLocal(c.utcStart, p.utcOffset);
      const localEnd = toLocal(c.utcEnd, p.utcOffset);
      const timeStr = `${fmtTime(local)}–${fmtTime(localEnd)}`;
      const isAwkward = local < 8 || local >= 18;
      const flag = isAwkward ? ` ${C.yellow}⚠${C.reset}` : "";
      console.log(`     ${padRight(p.name, 18)} ${padRight(p.city, 16)} ${C.white}${timeStr}${C.reset}${flag}`);
    }
    console.log();
  }

  // Final recommendation box
  const best = top[0];
  const w = 58;
  console.log();
  console.log(`  ${C.green}╔${"═".repeat(w)}╗${C.reset}`);
  console.log(`  ${C.green}║${C.reset}${" ".repeat(w)}${C.green}║${C.reset}`);
  console.log(`  ${C.green}║${C.reset}   ${C.bold}${C.green}✅  RECOMMENDED MEETING TIME${C.reset}${" ".repeat(w - 32)}${C.green}║${C.reset}`);
  console.log(`  ${C.green}║${C.reset}${" ".repeat(w)}${C.green}║${C.reset}`);

  const dateLine = `   ${C.bold}Date:${C.reset}  Tuesday, March 18, 2025`;
  const utcLine = `   ${C.bold}UTC:${C.reset}   ${fmtHour24(best.utcStart)} – ${fmtHour24(best.utcEnd)}`;
  const scoreLine = `   ${C.bold}Score:${C.reset} ${best.score}/100`;

  console.log(`  ${C.green}║${C.reset}${padRight(dateLine, w)}${C.green}║${C.reset}`);
  console.log(`  ${C.green}║${C.reset}${padRight(utcLine, w)}${C.green}║${C.reset}`);
  console.log(`  ${C.green}║${C.reset}${padRight(scoreLine, w)}${C.green}║${C.reset}`);
  console.log(`  ${C.green}║${C.reset}${" ".repeat(w)}${C.green}║${C.reset}`);
  console.log(`  ${C.green}║${C.reset}   ${C.dim}── Per-participant local times ──${C.reset}${" ".repeat(w - 37)}${C.green}║${C.reset}`);

  for (const p of people) {
    const local = toLocal(best.utcStart, p.utcOffset);
    const localEnd = toLocal(best.utcEnd, p.utcOffset);
    const timeStr = `${fmtTime(local)}–${fmtTime(localEnd)}`;
    const isAwk = local < 8 || local >= 18;
    const marker = isAwk ? ` ${C.yellow}⚠${C.reset}` : `  ${C.green}✓${C.reset}`;
    const line = `   ${padRight(p.name, 17)} ${padRight(p.city, 14)} ${timeStr}${marker}`;
    console.log(`  ${C.green}║${C.reset}${padRight(line, w)}${C.green}║${C.reset}`);
  }

  console.log(`  ${C.green}║${C.reset}${" ".repeat(w)}${C.green}║${C.reset}`);
  const cleanReasoning = best.reasoning.replace(/\x1b\[[0-9;]*m/g, "");
  console.log(`  ${C.green}║${C.reset}   ${C.dim}${best.reasoning}${C.reset}${" ".repeat(Math.max(0, w - cleanReasoning.length - 3))}${C.green}║${C.reset}`);
  console.log(`  ${C.green}║${C.reset}${" ".repeat(w)}${C.green}║${C.reset}`);
  console.log(`  ${C.green}╚${"═".repeat(w)}╝${C.reset}`);
  console.log();
}

// ── Main orchestrator ───────────────────────────────────────

async function main(): Promise<void> {
  const w = 62;
  console.log();
  console.log(`${C.cyan}${"━".repeat(w)}${C.reset}`);
  console.log(`${C.bold}${C.white}  🤖  SQUAD — Multi-Agent Appointment Scheduler${C.reset}`);
  console.log(`${C.dim}  Coordinating 4 agents to schedule across 5 timezones${C.reset}`);
  console.log(`${C.dim}  Meeting date: Tuesday, March 18, 2025  •  Duration: 1 hour${C.reset}`);
  console.log(`${C.cyan}${"━".repeat(w)}${C.reset}`);

  const people = buildPeople();

  // Agent 1 — load calendars
  await calendarAgent(people);

  // Agent 2 — normalize to UTC
  const utcSlots = await timezoneAgent(people);

  // Agent 3 — find & score free intersections
  const candidates = await conflictResolver(utcSlots, people);

  // Agent 4 — rank & recommend
  await proposerAgent(candidates, people);

  // Wrap-up
  console.log(`  ${C.dim}All 4 agents completed successfully.${C.reset}`);
  console.log(`${C.cyan}${"━".repeat(w)}${C.reset}`);
  console.log();
}

main().catch(console.error);
