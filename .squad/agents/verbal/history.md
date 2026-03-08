# Project Context

- **Owner:** Brady
- **Project:** squad-sdk — the programmable multi-agent runtime for GitHub Copilot (v1 replatform)
- **Stack:** TypeScript (strict mode, ESM-only), Node.js ≥20, @github/copilot-sdk, Vitest, esbuild
- **Created:** 2026-02-21



## Learnings

### From Beta (carried forward)
- Tiered response modes (Direct/Lightweight/Standard/Full) — spawn templates vary by complexity
- Silent success detection: 6-line RESPONSE ORDER block prevents ~7-10% of background spawns from returning no text
- Skills system architecture: SKILL.md lifecycle with confidence progression (low → medium → high)
- Spawn template design: charter inline, history read, decisions read — ceremony varies by tier
- Coordinator prompt structure: squad.agent.md is the authoritative governance file
- respawn-prompt.md is the team DNA — owned by Verbal, reviewed by Keaton

### #241: Coordinator Session — Routing LLM Prompt + Parser
- Created `src/cli/shell/coordinator.ts` with three exports: `buildCoordinatorPrompt()`, `parseCoordinatorResponse()`, `formatConversationContext()`
- Prompt assembles from team.md (roster) + routing.md (rules) — graceful fallback if either is missing
- Response parser handles three routing modes: DIRECT (answer inline), ROUTE (single agent), MULTI (fan-out)
- Removed unused `resolveSquad` import from the task spec — kept imports clean for strict mode
- Exported all functions and types from `src/cli/shell/index.ts`
- PR #286 → bradygaster/dev

### #313: Remote Squad Mode — Coordinator Awareness
- Updated `.github/agents/squad.agent.md` Worktree Awareness section with third resolution strategy: remote squad mode via `.squad/config.json` `teamRoot` field
- Added `PROJECT_ROOT` variable to spawn template alongside `TEAM_ROOT`, with scope explanation (identity vs. project-local paths)
- Updated "Passing the team root to agents" section to describe dual-path passing in remote vs. local mode
- Added @copilot incompatibility note — remote mode is local-dev only
- Kept changes minimal: three targeted sections modified, no structural changes to existing content

### 2026-02-24T17-25-08Z : Team consensus on public readiness
📌 Full team assessment complete. All 7 agents: 🟡 Ready with caveats. Consensus: ship after 3 must-fixes (LICENSE, CI workflow, debug console.logs). No blockers to public source release. See .squad/log/2026-02-24T17-25-08Z-public-readiness-assessment.md and .squad/decisions.md for details.

### Rock-Paper-Scissors Sample — Prompt Architecture
- Created `samples/rock-paper-scissors/prompts.ts` with 10 player strategies and scorekeeper prompt
- **The Learner (Sherlock 🔍)** is the key demo agent — prompt instructs LLM to analyze opponent play history, detect patterns (frequency bias, sequences, cycles), predict next move, and counter strategically with reasoning
- Two-line response format for The Learner: [analysis sentence] + [move]. Makes logs showcase actual LLM pattern recognition
- Deterministic agents (Rocky, Edward, Papyrus) have absolute prompts: "ALWAYS throw X. Never deviate."
- Cycler uses modulo arithmetic in prompt: "Round % 3 == 1 → rock" (teaches LLM stateful behavior)
- Creative agents: Echo (copycat), Rebel (contrarian — intentionally loses), Poker (bluffer with fake tells)
- Scorekeeper prompt: entertaining commentary + mental leaderboard tracking + personality-driven announcements
- Design principle: prompts are code. Precision over prose. Each must be robust against LLM drift.

## 📌 Team Update (2026-03-03T00:00:50Z)

**Session:** RPS Sample Complete — Verbal, Fenster, Kujan, McManus collaboration

Multi-agent build of Rock-Paper-Scissors game with 10 AI strategies, Docker infrastructure, and full documentation. Fenster (Coordinator) identified and resolved 3 integration bugs (ID mismatch, move parsing, history semantics). Sample ready for use.

### Skill: history-hygiene (2026-03-04)
Created `.squad/skills/history-hygiene/SKILL.md` to codify lesson from Kobayashi v0.6.0 incident. Core rule: record final outcomes to history, not intermediate requests or reversed decisions. One read = one truth. No cross-referencing required. Team learned hard way that stale history entries poison future spawns. Formal intervention: Keaton rewrote charter guardrails, Fenster corrected 19 entries.

---

## History Audit — 2026-03-03

**Audit Results:** 0 corrections. File is clean.

**Checked for:**
- ✓ No conflicting entries
- ✓ No stale or reversed decisions
- ✓ No v0.6.0 target references (v0.6.0 appears only as historical incident context, which is correct)
- ✓ No intermediate states recorded as final (all entries document outcomes)
- ✓ All future-spawn-readable: no cross-reference dependencies

**Timeline integrity:** Forward-moving (2026-02-21 → 2026-03-04), no reversals.

**Note:** v0.6.0 reference in history-hygiene entry is correct as-written — it documents the *Kobayashi incident* that taught the team the skill itself. No change needed.

### LinkedIn Monitor Sample — Squad Config Design
- Created `linkedin-monitor/squad.config.ts` with 4 agents: Notification Classifier, Engagement Scorer, Action Advisor, Summary Reporter
- Followed gmail/squad.config.ts pattern exactly: same imports, section structure, defineSquad export shape
- Key design choice: Action Advisor charter has a **CRITICAL** section mandating direct LinkedIn URLs with every recommendation — the UX is "see it, click it, act on it"
- Engagement Scorer incorporates LinkedIn-specific dynamics: early-comment amplification, creator-to-creator weighting, decay rates on comment threads vs. connection requests
- Summary Reporter uses fixed output template (📊 Daily Briefing) with counts, priority groups (🔴/🟡/🟢), and time estimates — scannable in 10 seconds
- Classifier has explicit Squad-mention detection as a first-class field, not just a tag — product mentions surface regardless of notification type
- Routing: 5 rules — 4 direct routes for individual agents, 1 full-tier catch-all for "triage|check|linkedin|monitor|everything" (priority 10)
- Model: claude-sonnet-4.5 preferred, claude-haiku-4.5 fallback — consistent with gmail sample



📌 Team update (2026-03-08T13:21:18Z): LinkedIn Monitor sample completed — full TypeScript implementation, four-agent squad.config.ts, URL-first action design pattern — decided by Fenster and Verbal

### Contract Reviewer Sample — Full Rewrite from Hardcoded to Real Squad
- Replaced hardcoded 1000+ line demo with real file-based Squad sample following gmail gold standard
- Created `contract-reviewer/squad.config.ts` with 4 agents: Clause Extractor, Risk Assessor, Negotiation Advisor, Summary Reporter
- **Charter quality showcase**: Each charter is 35-50 lines with domain-specific legal knowledge, calibrated benchmarks (Net 30 payment, 12-month liability cap, 99.9% SLA), explicit output formats, and strict role boundaries
- Risk Assessor charter includes quantitative industry benchmarks — not vague "this could be concerning" but "industry standard is 12-month cap; this is 3 months"
- Negotiation Advisor produces ready-to-insert redline language with fallback positions and leverage analysis
- Summary Reporter follows a fixed template: risk heatmap table, top 3 concerns, action items, sign/negotiate/walk recommendation
- Created `contract-reader.ts` as a clean file-reading module: validates extension (.txt/.md), size (500KB max), empty files. Falls back to stdin paste if no file provided
- Created `sample-contract.md`: a deliberately vendor-hostile 15-clause SaaS agreement packed with red flags (3-month liability cap, 24-month non-compete, perpetual data license, unilateral amendments, asymmetric termination)
- Pattern: read-only analysis, streaming responses, ANSI terminal output, banner, extension ideas, same SquadClient connection flow as gmail/linkedin-monitor
- Model: claude-sonnet-4.5 preferred, claude-haiku-4.5 fallback — consistent with all samples
- Routing: 5 rules — 4 direct routes for individual agents, 1 full-tier catch-all for "review|analyze|contract|everything"
- TypeScript strict mode, clean `npx tsc --noEmit`, zero errors

