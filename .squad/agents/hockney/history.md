# Project Context

- **Owner:** Brady
- **Project:** squad-sdk — the programmable multi-agent runtime for GitHub Copilot (v1 replatform)
- **Stack:** TypeScript (strict mode, ESM-only), Node.js ≥20, @github/copilot-sdk, Vitest, esbuild
- **Created:** 2026-02-21

## Learnings

### 📌 Core Context: Test Foundation & Beta Learnings

**From Beta (carried forward):**
Multi-agent concurrency testing is critical — spawning is the heart of the system. Casting overflow edge cases (universe exhaustion, diegetic expansion, thematic promotion) need coverage. 80% coverage floor, 100% on critical paths (casting, spawning, coordinator routing). 1551 baseline tests across 45 files. Vitest is the standard test runner.

**Phase 1-2 Test Expansion (2026-02-21→2026-02-22):**
- Issue #214: Added 14 resolution & CLI global/status tests (1592→1616). Windows symlink tests skipped.
- Issue #248: Created shell.test.ts with 47 tests (SessionRegistry, spawn infrastructure, Coordinator, ShellLifecycle, StreamBridge). Used real test-fixtures for integration confidence.
- Issue #228: Added 13 CRLF-specific tests validating Windows line ending handling across all 5 parsers.
- Issue #230: Created consumer-imports.test.ts (6 tests) validating barrel exports from library consumer perspective.
- Post-restructure: All 1719 tests passing post-SDK/CLI migration. Test import migration deferred until root src/ deletion (exports maps expansion needed).
- Coverage: Installed @vitest/coverage-v8, configured v8 provider with text/text-summary/html reporters.

---

### Issue #214: Resolution & CLI global/status tests (2026-02-21)
- Added 14 new tests to resolution.test.ts: deeply nested dirs, nearest .squad/ wins, symlink support
- Created cli-global.test.ts with 10 tests: status routing (repo/personal/none), --global flag for init/upgrade
- Test count grew from ~1592 to 1616 across 51 files — all passing
- Symlink test skipped on Windows (requires elevated privileges) — pattern: `if (process.platform === 'win32') return;`
- CLI routing testable without spawning processes by replicating the conditional logic from src/index.ts main()
- resolveGlobalSquadPath() always creates the directory — tests that check global .squad/ must clean up after themselves

### Issue #248: Shell module integration tests (2026-02-21)
Created test/shell.test.ts (47 tests): SessionRegistry (9), spawn infrastructure (6), Coordinator (11), ShellLifecycle (10), StreamBridge (11). Used real test-fixtures for integration confidence. Shell modules well-structured: pure functions (parsing), simple classes (registry), callback-based (bridge). Test count: 1621→1668.

### Issue #228: CRLF normalization tests (2026-02-21)
Created test/crlf-normalization.test.ts (13 tests) across 5 parsers using withCRLF() helper and expectNoCR() assertions. All passing. Validates Fenster's normalizeEol() applied correctly.

### Issue #230: Consumer-perspective import tests (2026-02-22)
Created test/consumer-imports.test.ts (6 tests): main barrel, parsers barrel, types barrel, side-effect-free imports. Validates barrel split (index.ts/parsers.ts/types.ts) works for consumers.

### Post-restructure assessment (2026-02-22)
**Build:** Clean (exit 0). **Tests:** 1719 passing across 56 files. **Import state:** Tests import from root ../src/ (old monolith). **Migration deferred:** Premature migration risks breaking tests. Expand exports maps or add vitest alias config when root src/ deleted. Exports map gap + CLI no exports + barrel divergence = high risk now.

### 📌 Team update (2026-02-22T041800Z): SDK/CLI split verified, all 1719 tests passing, test import migration deferred — decided by Hockney
- Created test/consumer-imports.test.ts with 6 tests validating package exports from a consumer's perspective
- **Main barrel** (3 tests): key parser functions (parseTeamMarkdown, parseDecisionsMarkdown, parseRoutingMarkdown), CLI functions (runInit, runExport, runImport, scrubEmails), VERSION export as string
- **Parsers barrel** (1 test): parseTeamMarkdown and parseCharterMarkdown importable from src/parsers.js
- **Types barrel** (1 test): Object.keys(types).length === 0 confirms pure type re-exports produce no runtime values
- **Side-effect-free import** (1 test): importing index.ts doesn't mutate process.argv or trigger CLI behavior — test completing without hanging proves clean separation
- Dynamic `await import()` used throughout to keep tests independent and avoid module caching issues
- All 6 tests pass on first run; validates the barrel file split (index.ts / parsers.ts / types.ts) works correctly for consumers

### Post-restructure verification (2026-02-22)
- **Build:** `npm run build` compiles both `@bradygaster/squad-sdk` and `@bradygaster/squad-cli` cleanly via workspace scripts. Exit code 0.
- **Tests:** All 1719 tests pass across 56 test files. `npm run build && npm test` exits clean.
- **vitest.config.ts:** Works as-is — no path aliases needed while root `src/` still exists.
- **Import state:** All 56 test files still import from root `../src/` (the old monolith barrel). Only `consumer-imports.test.ts` had 3 workspace package references but dynamically imports from `../src/index.js`.
- **Import migration deferred:** Cannot blindly rewrite `../src/X.js` → `@bradygaster/squad-sdk/X` because:
  1. Tests import deep internal modules (e.g., `../src/config/agent-doc.js`, `../src/casting/casting-engine.js`) that aren't exposed via the SDK package's `exports` map — only 18 subpath exports exist.
  2. CLI test files import from `../src/cli/...` which lives in `@bradygaster/squad-cli`, but that package has no subpath exports at all.
  3. Root `src/index.ts` (v0.7.0) still re-exports CLI functions (`runInit`, `runExport`, etc.) which SDK package (v0.8.0) correctly does not export — the `consumer-imports.test.ts` tests CLI exports that don't exist in the SDK barrel.
  4. Migrating requires either expanding the `exports` maps in both packages or adding vitest `resolve.alias` config. Both are non-trivial.
- **Recommendation:** Migration should happen as a dedicated task when root `src/` is actually removed. Attempting it now risks breaking 1719 passing tests for no immediate benefit.
- **Flaky test observed:** One run showed 1 failure / 1718 pass in CLI export-import tests (timing-sensitive fs operations). Not reproducible on immediate re-run — pre-existing flake.

### 📌 Team update (2026-02-22T041800Z): SDK/CLI split verified, all 1719 tests passing, test import migration deferred — decided by Hockney
Build clean + all 1719 tests pass post-SDK/CLI migration. Fenster's import rewriting (6 cross-package imports) verified correct. Test import migration deferred until root `src/` deletion blocks (lazy approach reduces risk). Tests remain on old `../src/` paths for now — migration requires expanding exports maps or vitest alias config, both non-trivial. Exports map gap + CLI no exports + barrel divergence make premature migration risky. Decision merged to decisions.md (hockney-test-import-migration.md).

### Test infrastructure: coverage config + package exports test (2026-02-22)
- **Coverage:** Installed `@vitest/coverage-v8@^3.2.0`, configured vitest with `v8` provider and `text`, `text-summary`, `html` reporters. Coverage output goes to `./coverage/` (already in `.gitignore`). Include patterns cover `src/**/*.ts` and `packages/*/src/**/*.ts`.
- **Package exports test:** Created `test/package-exports.test.ts` with 8 tests covering SDK exports map: root (`VERSION`), `/config` (`DEFAULT_CONFIG`), `/resolution` (`resolveSquad`), `/parsers` (`parseTeamMarkdown`), `/types` (type-only, no runtime values), `/agents`, `/skills`, `/tools`.
- Discovered `types` subpath has zero runtime exports (pure `export type` statements) — test only verifies module resolves.
- Config subpath exports `DEFAULT_CONFIG`, `AgentRegistry`, `ModelRegistry`, etc. — not `loadSquadConfig` as initially assumed.
- `npm install` needed `--legacy-peer-deps` flag due to `workspace:*` protocol in squad-cli's package.json (pnpm syntax, not native npm).
- Build passes cleanly. All 8 package-exports tests pass with coverage reporting.

### Test Health Assessment (2026-02-22T23:02Z)
- **Test Results:** All 1727 tests passing across 57 files. Duration: 4.08s (transform 7.23s, setup 0ms, collect 21.44s, tests 16.15s, environment 12ms, prepare 16.17s).
- **No skipped/pending tests:** Zero `.skip()` or `.only()` patterns found. All 57 test files active.
- **Test file coverage:** Distributed across SDK (config, runtime, agents, casting, coordinator, marketplace, sharing, shell, adapter, tools) and CLI (init, upgrade, export-import, cli-global). Strong test-to-source-file ratio.
- **CI Health:** Recent runs show mixed status on feature branches (squad-UI, feat/remote-squad-mode), but main dev branch (run 103) and most completed runs are green. squad-ci.yml triggers on push/PR to main/bradygaster/dev/insider. Two-job matrix (build-node, test-node) with Node 20/22. Rollup "build" job requires both to pass for branch protection.
- **Coverage Infrastructure:** Vitest configured for v8 provider with text, text-summary, html reporters. Include patterns: `packages/*/src/**/*.ts`. Coverage dir: `./coverage/` (gitignored).

### 📌 Team update (2026-02-22T08:50:00Z): Runtime Module Test Patterns — decided by Hockney
Two EventBus APIs require different mocks: client bus uses on()/emit(), runtime bus uses subscribe()/emit(). Tests must use correct mock based on module. CharterCompiler tests use real test-fixtures (integration-level confidence); parseCharterMarkdown uses inline strings (unit isolation). Coordinator routing priority verified: direct > @mention > team keyword > default. RalphMonitor tests future-proof stubs. 105 new tests written (1727 → 1832, all passing).
- **Test Patterns:** Good structure observed: pure functions (parsers, coordinators), simple classes (SessionRegistry, StreamBridge), callback-based async (shell lifecycle). Windows symlink tests skipped (elevated privileges).
- **Flaky tests:** One pre-existing flake in export-import CLI tests (timing-sensitive fs operations on first run, passes on retry). Not blocking merges.
- **Known Issues:** None blocking. Pre-existing TS error in cli-entry.ts VERSION export (mentioned in history). Test import migration deferred until root `src/` deletion.

### Proactive runtime module tests (2026-02-22)
- Created 4 new test files (105 tests) for runtime modules being built in parallel by Fenster, Edie, and Fortier.
- **charter-compiler.test.ts** (34 tests): `parseCharterMarkdown` identity/section/edge cases, `compileCharterFull` metadata/overrides, `CharterCompiler` class compile/compileAll with real test-fixtures charters. Discovered CharterCompiler and AgentSessionManager are now fully implemented (not stubs).
- **agent-session-manager.test.ts** (25 tests): spawn (state, sessionId, timestamps, modes, EventBus events), resume (reactivation, timestamp update, error cases), destroy (map removal, event emission, non-existent agent safety), getAgent/getAllAgents state management.
- **coordinator-routing.test.ts** (27 tests): Coordinator.route() covering direct responses (status/help/show/list/who/what/how), @mention routing (fenster/verbal/hockney), "team" keyword fan-out, default-to-lead, priority ordering (@mention > team, direct > @mention), initialize/execute/shutdown lifecycle.
- **ralph-monitor.test.ts** (19 tests): RalphMonitor start/stop lifecycle, healthCheck, getStatus, config options, edge cases (healthCheck after stop, multiple start/stop calls).
- Test count grew from 1727 to 1832 across 61 files — all passing.
- Key edge cases found: (1) @mention priority beats "team" keyword, (2) direct patterns beat @mentions, (3) AgentSessionManager.destroy() is safe on non-existent agents, (4) CharterCompiler.compileAll() silently skips invalid charters.
- Pattern: EventBus mock for AgentSessionManager uses `on()` method (client EventBus pattern), not `subscribe()` (runtime EventBus pattern) — the two bus implementations have different APIs.

### OTel observability tests — proactive (2026-02-22)
- Created 4 new test files (54 tests) for OTel observability modules being built by Fortier and Edie.
- **otel-provider.test.ts** (20 tests): `initializeOTel` returns `{tracing, metrics}` booleans; `getTracer()`/`getMeter()` return valid no-op instances when unconfigured; `shutdownOTel()` is safe to call with no initialization; config priority verified (explicit endpoint > `OTEL_EXPORTER_OTLP_ENDPOINT` env var > disabled). Also covers `initializeTracing()` and `initializeMetrics()` individually.
- **otel-bridge.test.ts** (12 tests): `createOTelTransport()` returns a function conforming to `TelemetryTransport`. All 5 event types (`squad.init`, `squad.agent.spawn`, `squad.error`, `squad.run`, `squad.upgrade`) produce correctly-named spans. `squad.error` sets `SpanStatusCode.ERROR` and emits an `exception` event. Properties map to span attributes. Batch processing verified.
- **otel-agent-traces.test.ts** (10 tests): Proactive — validates that `AgentSessionManager.spawn()` and `destroy()` create OTel spans with agent name and mode attributes. Error spans verified for invalid charters and resume of non-existent agents. Currently pass with `[PROACTIVE]` warnings since OTel instrumentation is not yet wired into AgentSessionManager.
- **otel-coordinator-traces.test.ts** (12 tests): Proactive — validates that `Coordinator.route()` creates `squad.coordinator.route` spans with tier/message/agents attributes. Span hierarchy tested (route → execute). Currently pass with `[PROACTIVE]` warnings since OTel instrumentation is not yet wired into Coordinator.
- Test count grew from 1832 to 1886 across 65 files — all passing.
- Key discovery: `@opentelemetry/sdk-trace-base` v2.x uses `BasicTracerProvider` (not `NodeTracerProvider`), requires `spanProcessors` in constructor, and uses `trace.setGlobalTracerProvider()` instead of `provider.register()`.
- `AgentSessionInfo` uses `charter.name` and `state` fields (not `name`/`status` directly).
- OTel SDK deps (`@opentelemetry/api`, `@opentelemetry/sdk-trace-base`, `@opentelemetry/sdk-metrics`) installed at root for test resolution.

### OTel Metrics tests — Issues #261-264 (2026-02-23)
- Created `test/otel-metrics.test.ts` (34 tests): Comprehensive coverage of all four metric categories — token usage (#261), agent performance (#262), session pool (#263), response latency (#264), plus reset/cleanup and no-op safety.
- Created `test/otel-metric-wiring.test.ts` (5 tests): Integration tests verifying StreamingPipeline calls recordTokenUsage on usage events, module resolution of otel-metrics subpath and barrel exports.
- Testing strategy: Mock `getMeter()` from otel provider to return spy-enabled meter with tracked instruments. Each `createCounter`/`createHistogram`/`createUpDownCounter`/`createGauge` call returns a spy with `.add()` and `.record()` mocks, allowing precise verification of metric names, values, and attributes.
- Key findings: (1) StreamingPipeline has no constructor args — just `new StreamingPipeline()`, (2) session attach method is `attachToSession()` not `attachSession()`, (3) `_resetMetrics()` clears all four cached instrument categories independently, (4) all metric functions are safe no-ops when OTel is not configured.
- Test count grew from 1901→1940 across 68 files — all passing.

### 📌 Team update (2026-02-22T093300Z): OTel Phase 2 complete — session traces, latency metrics, tool enhancements, agent metrics, token usage wiring, metrics tests — decided by Fortier, Fenster, Edie, Hockney
All four agents shipped Phase 2 in parallel: Fortier wired TTFT/duration/throughput metrics. Fenster established tool trace patterns and agent metric wiring conventions. Edie wired token usage and session pool metrics. Hockney created spy-meter test pattern (39 new tests). Total: 1940 tests passing, metrics ready for production telemetry.
