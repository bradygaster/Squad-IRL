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
