# Project Context

- **Owner:** Brady
- **Project:** squad-sdk — the programmable multi-agent runtime for GitHub Copilot (v1 replatform)
- **Stack:** TypeScript (strict mode, ESM-only), Node.js ≥20, @github/copilot-sdk, Vitest, esbuild
- **Created:** 2026-02-21

## Learnings

### From Beta (carried forward)
- Copilot CLI vs. Copilot SDK boundary awareness: know which surface you're on
- Model selection fallback chains: Premium → Standard → Fast → nuclear (omit model param)
- Platform detection: CLI has task tool, VS Code has runSubagent, fallback works inline
- SQL tool is CLI-only — does not exist on VS Code, JetBrains, or GitHub.com
- Client compatibility matrix: spawning behavior varies by platform

### Wave 1 M0 SDK Audit (2026-02-21) **[CORRECTED]**
- @github/copilot-sdk IS published on npm (v0.1.25, 28 versions, MIT license)
- Squad's file: reference (v0.1.8) is outdated by 17 versions
- Only 1 runtime import: `CopilotClient` from `@github/copilot-sdk` in `src/adapter/client.ts`
- Adapter types layer (`src/adapter/types.ts`) decouples Squad from SDK types — good pattern

### Process.exit() Refactor for SquadUI (issue #189)
- `fatal()` in `src/cli/core/errors.ts` now throws `SquadError` instead of calling `process.exit(1)`
- CLI entry points (`src/cli-entry.ts`) catch `SquadError` and call `process.exit(1)` — library consumers catch normally
- `src/index.ts` is now a pure barrel export with zero side effects — safe for VS Code extension import
- `runWatch()` uses Promise resolution instead of `process.exit(0)` for graceful shutdown
- `runShell()` closes readline on SIGINT instead of `process.exit(0)`
- `SquadError` is exported from public API for library consumers to catch specifically
- Pattern: library functions throw/return, CLI entry point catches and exits
- All 4 test files mock the SDK; no tests need real SDK at runtime
- Build and all 1592 tests pass with npm `^0.1.25` reference — verified
- SDK dist is ~150KB; the 296MB local install is due to `node_modules` in the sibling dir
- Bundle config correctly marks `@github/copilot-sdk` as external (esbuild won't bundle it)

### Barrel Files for SquadUI (issues #225, #226)
- Created `src/parsers.ts` — re-exports all parser functions and result types from markdown-migration, routing, charter-compiler, and skill-loader
- Created `src/types.ts` — pure `export type` re-exports with zero runtime code, covering parsed types, config types, routing types, adapter types
- Both files use `export { ... } from './path.js'` ESM syntax, consistent with existing barrel patterns in `src/index.ts`
- Build (tsc + workspaces) and all 1683 tests pass with the new files

### 📌 Team update (2026-02-22T020714Z): Process.exit() refactor complete **[CONFIRMED]**
Kujan's error handling refactor makes all library functions throw SquadError instead of calling process.exit(). Only CLI entry point (src/cli-entry.ts) calls process.exit() now. SquadUI can catch SquadError for structured error handling instead of process termination. Pattern: library functions throw, CLI entry point catches. Decision "2026-02-21: Process.exit() refactor — library-safe CLI functions" in decisions.md. Issue #189 closed. 1683 tests passing.

### OTel Public API Export (Issue #266)
- Exported the 3-layer OTel API from `src/index.ts`:
  - **Low-level** (`otel.ts`): `initializeOTel`, `shutdownOTel`, `getTracer`, `getMeter`, `OTelConfig` — already exported via `export *`
  - **Mid-level** (`otel-bridge.ts`): Added `bridgeEventBusToOTel(bus)` — subscribes to an EventBus and creates OTel spans per event, returns unsubscribe function
  - **High-level** (`otel-init.ts`): Created `initSquadTelemetry(options)` — one-call setup that wires OTel providers + EventBus bridge + TelemetryTransport, returns `SquadTelemetryHandle` with shutdown()
- All OTel instrumentation is no-op when no provider is registered (zero overhead for non-OTel consumers)
- Tree-shaking friendly: each layer is a separate module, named exports for bridge/init
- `SquadTelemetryOptions` extends `OTelConfig` with optional `eventBus` and `installTransport` fields
- Build passes with all changes

### SDK Adapter Audit (Brady Issue: sendMessage is not a function)
- **Root Cause:** Published 0.8.2 uses unsafe `as unknown as SquadSession` cast instead of runtime adapter
- **Status:** Bug already fixed in commit 1f779e7 (CopilotSessionAdapter), but NOT published to npm
- **Adapter Implementation (current):** Correctly maps sendMessage() → send(), close() → destroy(), event names
- **SDK API:** @github/copilot-sdk CopilotSession has send(), not sendMessage(); destroy(), not close()
- **Test Coverage:** 19 tests in session-adapter.test.ts all pass (but use mocks, don't catch published version issue)
- **Version Timeline:** 0.8.2 tagged at db5d621, adapter fix committed at 1f779e7 (AFTER tag), event mapping fix at 8220aa6
- **Event Mapping:** SDK emits dotted names (assistant.message_delta), Squad expects short names (message_delta) — normalizeEvent() flattens event.data
- **Package Boundary:** CLI depends on SDK with wildcard "*", could pull stale version from cache
- **Recommendation:** Publish 0.8.3 with both fixes (1f779e7 + 8220aa6), lock CLI dep to ^0.8.3, update CHANGELOG
- **Pattern Learned:** Type casts hide runtime mismatches; mocked tests don't catch SDK API changes; publish AFTER fixes, not before

### 📌 Team update (2026-02-23T08:00:00Z): REPL streaming bug fixed via sendAndWait pattern **[CONFIRMED]**
All shell dispatch calls must use awaitStreamedResponse() to wait for full streamed response before parsing. Pattern includes fallback to turn_end/idle listeners. Critical fix for coordinator prompt parsing. Test coverage: 13 new tests in repl-streaming.test.ts. All 2351 tests passing. Decision: "2026-02-23: Use sendAndWait for streaming dispatch" in decisions.md.


### 📌 2026-02-24T17:25:08Z: Team consensus on public readiness **[CONFIRMED]**
Full team assessment complete. All 7 agents: 🟡 Ready with caveats. Consensus: ship after 3 must-fixes (LICENSE, CI workflow, debug console.logs). No blockers to public source release. Summary in `.squad/log/2026-02-24T17-25-08Z-public-readiness-assessment.md`; decisions list all agreed-upon rules and directives.

### Rock-Paper-Scissors Docker Infrastructure (samples/rock-paper-scissors)
- Multi-session sample (8+ concurrent Copilot sessions: 7 players + 1 scorekeeper) running in Docker
- Pattern: Same Docker setup as knock-knock (multi-stage build, node:20-alpine, build context at monorepo root)
- Dockerfile copies both `index.ts` and `prompts.ts` (this sample has more files than knock-knock's single file)
- No special Docker memory limits needed (<200MB for 8 active sessions)
- No special networking needed (outbound HTTPS to Copilot API works by default)
- SDK Consideration: SquadClientWithPool defaults to `maxConcurrent: 5` — index.ts must override to handle 8+ sessions
- SDK Limitation: Session creation is sequential (Copilot SDK constraint), but usage can be parallel after creation

## 📌 2026-03-03T00:00:50Z: Rock-Paper-Scissors Sample Complete **[CONFIRMED]**

**Team:** Verbal (Prompt Engineer), Fenster (Coordinator), Kujan (SDK Expert), McManus (Integration Lead)

**Outcome:** Multi-agent Rock-Paper-Scissors game delivered with:
- 10 AI player strategies (each spawning as independent Copilot session)
- Docker infrastructure (multi-stage build, node:20-alpine, 8+ concurrent sessions)
- 3 integration bugs found and fixed by Fenster: ID mismatch (wrong session index), move parsing (malformed JSON), history semantics (stale turn references)
- Full documentation and sample runnable

**Pattern Learned:** Multi-session coordination requires explicit session tracking; string-based IDs reduce parse errors; Docker memory sizing depends on session count not complexity.

Sample ready for use.

### History Audit — 2026-03-03

**Corrections made:**
1. **Line 17:** Date corrected from "2025-07-18" to "2026-02-21" — was invalid year (2025). **[CORRECTED]**
2. **Line 42:** Clarified decision reference from "merged to decisions.md" to cite actual decision. **[CONFIRMED]**
3. **Line 67:** Added decision reference and removed attributor tag per hygiene rules. **[CONFIRMED]**
4. **Line 71:** Clarified team-update phrasing and outcome vs. reference. **[CONFIRMED]**
5. **Lines 83–87:** Expanded RPS summary with full outcome details (bugs fixed, patterns, team roles) to prevent confusion for future spawns. **[CORRECTED]**

**Total corrections: 5** (1 date fix, 4 clarity/hygiene fixes)

### Bug Triage Sample — Rebuilt as Real GitHub Issues Integration
- Replaced hardcoded 794-line demo (fake data, TF-IDF, Jaccard) with a real Squad SDK sample following the gmail/ gold standard
- Pattern: `gh` CLI for data fetching via `child_process.execSync` — no Playwright, no API tokens needed beyond `gh auth`
- 4 agents in squad.config.ts: Issue Classifier, Duplicate Detector, Triage Advisor, Summary Reporter
- Follows gmail/ structure exactly: SquadClient, streaming via sendAndWait + message_delta, ANSI banner, extractContent helper, stderr suppression
- New file: `issue-fetcher.ts` — gh CLI validation, git remote detection, issue fetching, prompt formatting
- Read-only sample — analyses issues but never modifies them
- Build verified: `npm install && npx tsc --noEmit` passes clean

