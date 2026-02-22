# Project Context

- **Owner:** Brady
- **Project:** squad-sdk — the programmable multi-agent runtime for GitHub Copilot (v1 replatform)
- **Stack:** TypeScript (strict mode, ESM-only), Node.js ≥20, @github/copilot-sdk, Vitest, esbuild
- **Created:** 2026-02-21

## Learnings

### From Beta (carried forward)
- Architecture patterns that compound — decisions that make future features easier
- Silent success mitigation lessons: ~7-10% of background spawns return no text, mitigated by RESPONSE ORDER block + filesystem checks
- Reviewer rejection lockout enforcement: if Keaton/Hockney/Baer rejects, original author is locked out
- Proposal-first workflow: docs/proposals/ before execution for meaningful changes
- 13 modules: adapter, agents, build, casting, cli, client, config, coordinator, hooks, marketplace, ralph, runtime, sharing, skills, tools
- Distribution: GitHub-native (npx github:bradygaster/squad), never npmjs.com
- v1 docs are internal only — no published docs site

### 2026-02-21: Interactive Shell Proposal
- **Problem:** Copilot CLI dependency creates unreliable handoffs, zero agent visibility, and external UX control
- **Solution:** Squad becomes its own REPL/shell — users launch `squad` with no args, enter interactive session
- **Architecture decision:** Copilot SDK as LLM backend (streaming, tool dispatch), Squad owns spawning + coordination UX
- **Terminal UI:** Recommend `ink` (React for CLIs) — battle-tested, component model, testable, cross-platform
- **No breaking changes:** All subcommands (init, watch, export) unchanged; squad.agent.md still works for Copilot-native users
- **Wave restructure:** This becomes Wave 0 (foundation) — blocks distribution (Wave 1), SquadUI (Wave 2), docs (Wave 3)
- **Key decisions needed:** ink vs. alternatives, session-per-agent vs. pooling, background cleanup strategy
- **File paths:** docs/proposals/squad-interactive-shell.md (proposal), GitHub issue #232 (epic tracking)
- **Pattern:** When product direction shifts, invalidate existing wave structure and rebuild from foundation

### 2026-02-21: SDK/CLI Split Architecture Decision
- **Problem:** All 114 .ts files live in root `src/`. Workspace packages `squad-sdk` and `squad-cli` are published stubs. Need to move real code into them.
- **Analysis:** Dependency flow is strictly CLI → SDK → @github/copilot-sdk. No circular deps. No SDK module imports from CLI. Clean DAG.
- **Architecture decision:** SDK gets 15 directories + 4 standalone files (adapter, agents, build, casting, client, config, coordinator, hooks, marketplace, ralph, runtime, sharing, skills, tools, utils, index.ts, resolution.ts, parsers.ts, types.ts). CLI gets `src/cli/` + `src/cli-entry.ts`. Root becomes workspace orchestrator only.
- **Key call:** Remove CLI utility re-exports (`success`, `error`, `fatal`, `runInit`, etc.) from SDK barrel. These leaked CLI implementation into the library surface. Breaking change — correct and intentional.
- **Key call:** `ink` and `react` are CLI-only deps. SDK has zero UI dependencies.
- **Migration order:** SDK first (CLI depends on it), CLI second (rewrite imports to package names), root cleanup third.
- **Exports map:** SDK subpath exports expand from 7 to 18 entries — every module independently importable.
- **File path:** `.squad/decisions/inbox/keaton-sdk-cli-split-plan.md`
- **Pattern:** One-way dependency graphs enable independent package evolution. SDK stays pure library; CLI stays thin consumer.

### 📌 Team update (2026-02-22T041800Z): SDK/CLI split plan executed, versions aligned to 0.8.0, 1719 tests passing
Keaton's split plan produced definitive SDK/CLI mapping with clean DAG (CLI → SDK → @github/copilot-sdk). Fenster migrated 154 files across both packages. Edie fixed all 6 config files (tsconfigs with composite builds, package.json exports maps). Kobayashi aligned all versions to 0.8.0 (clear break from 0.7.0 stubs). Hockney verified build clean + all 1719 tests pass, deferred test import migration until root src/ removal. Rabin verified publish workflows ready. Coordinator published both packages to npm (0.8.0). Inbox merged to decisions.md. Ready for Phase 3 (root cleanup).

## Status Snapshot (2026-02-22T225951Z)

**Current Branch:** `bradygaster/dev` (latest: d2b1b1f)  
**No Open PRs** — Previous work is merged. Repository is in a clean state.

### What's Shipped ✅
- **Root package:** v0.6.0-alpha.0 (workspace coordinator, private)
- **SDK package:** v0.8.0 (real code, 18 subpath exports, @github/copilot-sdk only)
- **CLI package:** v0.8.1 (ink/react shell foundation, parser functions, agent spawn skeleton)
- **Build:** ✅ Clean (SDK + CLI both compile with zero errors)
- **Tests:** ✅ 1,727 passing across 57 test files
- **Architecture:** ✅ SDK/CLI split complete, one-way dependency graph (CLI → SDK → Copilot SDK)

### What's Missing / Incomplete ⚠️
1. **Root src/ directory removal** — Still exists alongside workspace packages. Phase 3 cleanup is blocked. This creates confusion about canonical source location.
2. **Interactive shell UX implementation** — `runShell()` is console.log-only. Ink component wiring not done (AgentPanel.tsx, MessageStream.tsx defined but not integrated). Session/prompt/spawn all stubbed.
3. **OpenTelemetry observability epic** — 9 P0/P1 issues (#261, #257–259, etc.): token metrics, agent/coordinator tracing, session pool metrics. None in progress.
4. **Documentation migration epic** — 11 issues (#182–206): copy beta docs, update URLs, write new guides (Architecture, Migration, SDK API Reference). High priority but no active work.
5. **Test import migration** — 150+ import lines still use `../src/` (root); blocked until root deletion.

### Open Issues Summary (27 open, 6 assigned to Keaton)
- **Observability (9):** Epic #253 — Token usage metrics (P0), agent lifecycle traces (P0/P1), session pool metrics, Aspire dashboard integration
- **Docs (11):** Epic #182 — Migration guide, API reference, architecture overview, install guides (all Keaton)
- **File watcher:** #268 (Fenster, P1) — Port squad-observer from paulyuk/squad
- **OTel integration tests:** #267 (Hockney, P1)
- **SquadUI integration:** 2 issues in pipeline

### Critical Blockers ⛔
**None for current release.** But two near-term constraints:
1. **Root src/ is a time bomb** — Parallel structure (root src/ + workspace packages) is confusing and error-prone. Removing it unblocks test migration and clarifies package boundaries.
2. **Observability is a pre-requisite for production** — All 9 OTel issues are P0/P1, needed before a public release. Token metrics (#261) is marked P0 (release blocker).

### Recommended Next Steps (Prioritized)
1. **Phase 3: Delete root src/ directory** — Move remaining 56 test files to use workspace packages. Unblock test import migration. Forces clarity.
2. **Merge missing observability** — Assign OTel work (9 issues) to sprint. #261 (token metrics) is P0. Others are P1 (agent/coordinator traces). Needed for production observability.
3. **Documentation pass** — Assign 11-issue epic to Keaton (already labeled). Write Architecture Overview (#206), Migration Guide (#203), API Reference (#196). Unblock public release.
4. **Complete interactive shell wiring** — Wire Ink components (AgentPanel, MessageStream, InputPrompt) to SDK session → streaming. Current code is skeleton-only.
5. **Verify insider publish pipeline** — Both packages published to npm (0.8.0 insider). Run end-to-end test: `npm install -g @bradygaster/squad-cli && squad` on a fresh machine.
