# 🗓️ Multi-Agent Appointment Scheduler

> A [Squad](https://github.com/features/copilot) sample demonstrating how specialized AI agents collaborate to solve a real-world scheduling problem across timezones.

## What It Does

Schedules a 1-hour meeting across **5 people in 3 continents** (San Francisco, Berlin, Mumbai, London, Tokyo), each with a realistic busy calendar. Four cooperating agents handle different phases of the problem:

| Agent | Role | Algorithm |
|---|---|---|
| **Calendar Agent** | Loads each participant's schedule | Simulates async calendar API calls, normalizes busy slots |
| **Timezone Agent** | Converts all times to UTC | Maps local busy windows onto a unified UTC timeline, flags awkward hours |
| **Conflict Resolver** | Finds free intersection windows | Multi-timezone calendar intersection with weighted convenience scoring |
| **Proposer Agent** | Ranks and recommends meeting times | Applies per-person local-time penalties/bonuses, selects optimal slot |

## The Algorithm

1. **Normalize** — Every busy slot is converted from local time to UTC, producing a single unified timeline.
2. **Intersect** — The UTC timeline is scanned in 30-minute increments. A slot is "available" only if *every* participant is free for the full hour.
3. **Score** — Each candidate slot is mapped back to every participant's local time and scored 0–100:
   - −15 per person if before 9 AM local
   - −10 per person if after 5 PM local
   - −25 per person if before 7 AM or after 8 PM local ("unreasonable")
   - +5 per person for lunch-adjacent times (11 AM–1 PM local)
4. **Rank** — Slots are sorted by score; the top 5 are presented with full per-person breakdowns.

## Running It

```bash
npm install
npm start
```

No external runtime dependencies — only Node.js built-ins. `tsx` is used as a dev dependency to execute TypeScript directly.

## Sample Output

The program produces ~100 lines of richly formatted terminal output with:
- Unicode box-drawing tables for each participant's calendar
- A visual UTC timeline grid (█ busy / ░ free / ⚠ awkward hours)
- Per-slot convenience score breakdowns
- A final **RECOMMENDED MEETING TIME** card with star ratings

## Why This Matters for Squad

This sample shows how Squad's multi-agent pattern maps naturally to scheduling:
- Each agent has a **single responsibility** and a clear interface
- Agents run in **sequence** (Calendar → Timezone → Resolver → Proposer) with data flowing through
- The problem is **genuinely hard** — 5 timezones spanning UTC-8 to UTC+9 (17-hour spread) with busy calendars leaves very few viable slots
- The scoring formula balances **competing constraints** (what's convenient for SF is midnight in Tokyo)

A single monolithic function could solve this, but the agent decomposition makes the logic auditable, testable, and extensible — exactly the way Squad structures real work.
