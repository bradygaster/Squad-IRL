# Project Context

- **Owner:** Brady
- **Project:** squad-sdk — the programmable multi-agent runtime for GitHub Copilot (v1 replatform)
- **Stack:** TypeScript (strict mode, ESM-only), Node.js ≥20, @github/copilot-sdk, Vitest, esbuild
- **Created:** 2026-02-21

---

## 2025-01-XX: CLI Command Inventory (Complete Ground Truth)

**Task:** Map every CLI command that exists — implementation status, help coverage, ghost commands, orphaned commands.

**Deliverable:** `.squad/agents/fenster/cli-command-inventory.md` (28KB comprehensive reference)

**Key Findings:**
- **13 implemented commands:** init, upgrade, status, triage/watch, copilot, plugin, export, import, scrub-emails, doctor, link, aspire, (no args)
- **1 orphaned command:** `upstream` — fully implemented, not in help
- **5 ghost commands:** hire, heartbeat, loop, shell, run — in docs, not in code
- **10 shell commands:** /status, /history, /agents, /clear, /help, /quit, /exit, /sessions, /resume, /version
- **Help coverage:** 12/13 in main help (missing upstream), 0/13 with dedicated --help handlers, 0/13 with examples

**Recommendations:**
1. Wire ghost commands or remove from docs (Priority 1)
2. Add `upstream` to main help (Priority 2)
3. Add dedicated --help handlers + examples (Priority 3)

**Files Created:**
- `.squad/agents/fenster/cli-command-inventory.md` — full inventory with command tables, implementation file map, draft help outputs for all 13 commands

---

## Core Context

**Created:** 2026-02-21  
**Role:** Core Developer — Runtime implementation, CLI structure, shell infrastructure  
**Key Decisions Owned:** Test import patterns (vitest via dist/), CRLF normalization at parser entry, shell module structure (readline→ink progression), spawn lifecycle, SessionRegistry design

**Phase 1-2 Complete (2026-02-21 → 2026-02-22T041800Z):**
- M3 Resolution (#210/#211): `resolveSquad()` + `resolveGlobalSquadPath()` in src/resolution.ts, standalone concerns (no auto-fallback)
- CLI: --global flag routing, `squad status` command composition, command rename finalized (triage, loop, hire)
- Shell foundation: readline-based CLI shell, SessionRegistry (Map-backed, no persistence), spawn infrastructure (loadAgentCharter, buildAgentPrompt, spawnAgent)
- CRLF hardening: normalize-eol.ts applied to 8 parsers, one-line guard at entry point
- SDK/CLI split executed: 15 dirs + 4 files migrated to packages/, exports map updated (7→18 subpaths SDK, 14 subpaths CLI), 6 config files fixed, versions aligned to 0.8.0
- Test import migration: 56 test files migrated from ../src/ to @bradygaster/squad-sdk/* and @bradygaster/squad-cli/*, 26 SDK + 16 CLI subpath exports, vitest resolves via dist/, all 1719+ tests passing

### 📌 Team update (2026-02-22T10:03Z): PR #300 architecture review completed — REQUEST CHANGES verdict with 4 blockers (proposal doc, type safety on castingPolicy, missing sanitization, ambiguous .ai-team/ fallback) — decided by Keaton
- Zero-dependency scaffolding preserved, strict mode enforced, build clean (tsc 0 errors)

**Phase 3 Blocking (2026-02-22 onwards):**
- Ralph start(): EventBus subscription + health checks (14 TODOs)
- Coordinator initialize()/route(): CopilotClient wiring + agent manager (13 TODOs)
- Agents spawn(): SDK session creation + history injection (14 TODOs)
- Shell UI: Ink components not yet wired (readline only), streaming responses, agent status display
- Casting: registry.json parsing stub (1 TODO)
- Triage/Loop/Hire: placeholder commands (low priority, defer)

## Learnings

### 📌 Core Context: SDK/CLI Migration & Test Import Foundation

**SDK/CLI File Migration (2026-02-21):**
Migrated 15 directories (adapter, agents, build, casting, client, config, coordinator, hooks, marketplace, ralph, runtime, sharing, skills, tools, utils) and 4 files (index.ts, resolution.ts, parsers.ts, types.ts) into packages/squad-sdk/src/ and packages/squad-cli/src/. Updated exports maps: 18 SDK subpaths, 14 CLI subpaths. Rewrote 4 cross-package imports. SDK barrel cleaned (no CLI re-exports). Root src/ preserved. Pattern: SDK subpath exports resolve to dist/{module}/index.js.

**Test Import Migration (2026-02-21→2026-02-22):**
Migrated 56 test files (173 imports) from ../src/ to @bradygaster/squad-sdk/* and @bradygaster/squad-cli/*. 26 SDK + 16 CLI subpath exports. Added 8 new deep SDK exports (adapter/errors, config/migrations, runtime/event-bus, etc.). Verified barrel re-exports for missing symbols. All 1727 tests passing. Pattern: vitest resolves through compiled dist/, so barrel changes require npm run build.

---

### 📌 Adapter Layer Audit (2026-02-22) — Fenster
**Requested by:** Brady. Audit for unsafe casts and method mismatches post-#315.
**Findings:** 7 total — 2 P0, 3 P1, 2 P2. Full report: `docs/audits/adapter-unsafe-casts-audit.md`
**Critical:** Event name mismatch (`message_delta` vs SDK `assistant.message_delta`) and event data shape mismatch (`event.delta` vs SDK `event.data.deltaContent`) mean streaming listeners never fire through the adapter. `listSessions()` uses `as unknown as` cast. `SquadClient.on()` casts to `any`.

---

### 📌 Team update (2026-02-23T08:00:00Z): REPL streaming bug fixed via sendAndWait pattern — decided by Kovash
All shell dispatch calls must use awaitStreamedResponse() to wait for full streamed response before parsing. Pattern includes fallback to turn_end/idle listeners. Critical fix for coordinator prompt parsing. Test coverage: 13 new tests in repl-streaming.test.ts. All 2351 tests passing.


**Requested by:** Brady. Understand current build capability, identify gaps for GitHub Pages deployment.

**Build System Status:**
- ✅ **Custom markdown → HTML converter** (`docs/build.js`): Regex-based, converts headers (h1-h3), code blocks, inline code, bold, italic, links, lists, paragraphs. Inputs from `docs/guide/*.md`, outputs to `docs/dist/`.
- ✅ **Template system ready** (`docs/template.html`): Standard HTML structure with `{{NAV}}` and `{{CONTENT}}` placeholders. Includes header (branding), sidebar (nav), main content area, footer.
- ✅ **Styling complete** (`docs/assets/style.css`): Modern theme, sidebar navigation, responsive design (mobile menu toggle), CSS variables for theming (primary: #0969da, secondary: #1f6feb).
- ✅ **Client-side JS** (`docs/assets/app.js`): Mobile menu toggle, sidebar hide/show, active nav highlighting based on current path.
- ✅ **Content authored** (`docs/guide/`): 14 markdown files covering installation, configuration, SDK integration, tools, marketplace, upstream inheritance, feature migration, architecture, CLI, vscode integration.
- ❌ **No GitHub Actions workflow** in squad-pr repo for Pages deployment.
- ❌ **No npm script** for docs build in `package.json`.
- ❌ **No output directory** — build.js creates `docs/dist/` but no CI/CD artifact strategy.

**What the Old Repo Does (bradygaster/squad):**
- Uses `markdown-it` + `markdown-it-anchor` npm deps (better markdown processing, auto-anchor IDs for headers).
- GitHub Actions workflow (`.github/workflows/squad-docs.yml`):
  - Triggers: manual `workflow_dispatch` or push to `preview` branch with `docs/**` or workflow changes.
  - Runs: `npm install markdown-it markdown-it-anchor` → `node docs/build.js --out _site --base /squad`.
  - Deploys: Artifacts from `_site/` via `upload-pages-artifact@v3` → `deploy-pages@v4`.
  - Permissions: `contents: read`, `pages: write`, `id-token: write`.
  - Concurrency: Pages group with cancel-in-progress.

**Gap Analysis:**
1. **Markdown library upgrade needed:** Current build.js lacks syntax highlighting, table support, anchor auto-generation. Old repo added `markdown-it` to handle these.
2. **No GitHub Actions workflow:** Need `.github/workflows/pages-deploy.yml` to automate build + artifact upload + GitHub Pages deployment.
3. **No npm script:** Add `"docs": "node docs/build.js --out dist/docs"` to root `package.json` for CI consistency.
4. **Output path decision:** Old repo uses `_site/`. We should use `dist/docs/` (aligns with monorepo build conventions: dist/ is .gitignored artifact dir).
5. **Base path unclear:** Old repo uses `--base /squad` (matches repo name). New repo URL TBD — may need `--base /squad-pr` or custom base. Affects relative asset paths in HTML.
6. **No Git branch strategy:** Old repo deploys from `preview` branch. New repo should clarify: deploy from `main` on PR merge, or from a `docs-preview` branch for staging?

**Recommendation for Brady:**
- Upgrade `docs/build.js` to use `markdown-it` (1-line: `npm install markdown-it markdown-it-anchor --save-dev`, 10-line refactor).
- Create `.github/workflows/pages-deploy.yml` (copy old workflow, adapt base path + branch trigger).
- Add `"docs": "node docs/build.js --out dist/docs"` to `package.json`.
- Configure repo Settings → Pages → Deployment → GitHub Actions as source.
- Test on feature branch before merging to main.

---

### 📌 Runtime Implementation Assessment (2026-02-22T22:00Z) — Fenster
**Status:** Phase 1-2 complete (SDK/CLI split, monorepo structure). Phase 3 (runtime integration) blocked.

**Implemented & Working:**
- ✅ **SDK/CLI split:** Both packages at 0.8.0 (SDK)/0.8.1 (CLI). Clean exports maps (18 subpaths SDK, 14 subpaths CLI).
- ✅ **Build pipeline:** tsc compiles both packages to dist/, all dependencies resolved (SDK→Copilot SDK, CLI→SDK+ink+react). Zero errors.
- ✅ **CLI structure:** Entry point (cli-entry.ts) routes 14 commands. Commands implemented: `help`, `version`, `status`, `init`, `upgrade`, `export`, `import`, `copilot`, `plugin`, `scrub-emails`. Commands stubbed: `triage` (watch alias), `loop`, `hire`.
- ✅ **Shell foundation:** readline-based CLI shell with header chrome, session registry, spawn infrastructure. Agent discovery, charter loading, and spawn lifecycle foundation. Type-safe completion.
- ✅ **Core modules:** resolution.ts, config/, build/, skills/, hooks/, tools/, client/ (EventBus structure), marketplace/, adapter/ all present.
- ✅ **Monorepo:** npm workspaces, changesets configured, independent versioning (SDK/CLI can release separately).
### 📌 Team update (2026-02-22T041800Z): SDK/CLI split executed, versions aligned to 0.8.0, 1719 tests passing — decided by Keaton, Fenster, Edie, Kobayashi, Hockney, Rabin, Coordinator
- **Phase 1 (SDK):** Migrated 15 directories + 4 standalone files from root `src/` into `packages/squad-sdk/src/`. Cleaned SDK barrel (removed CLI re-exports block). Updated exports map from 7 to 18 subpath entries.
- **Phase 2 (CLI):** Migrated `src/cli/` + `src/cli-entry.ts` to `packages/squad-cli/src/`. Copied `templates/` into CLI package. Rewrote 6 cross-package imports to use `@bradygaster/squad-sdk/*` package names.
- **Configuration:** All 6 config files fixed (root tsconfig with project refs, SDK/CLI tconfigs with composite builds, package.json exports maps). Root marked private (prevents accidental npm publish).
- **Versions:** All strings aligned to 0.8.0 — clear break from 0.7.0 stubs. CLI dependency on SDK pinned to `0.8.0`.
- **Testing:** Build clean (0 errors), all 1719 tests passing. Test import migration deferred until root `src/` deletion (lazy migration reduces risk).
- **Distribution:** Both packages published to npm (@bradygaster/squad-sdk@0.8.0, @bradygaster/squad-cli@0.8.0). Publish workflows verified ready.
- **Dependency graph verified:** Clean DAG (CLI → SDK → @github/copilot-sdk, no cycles). SDK pure library (zero UI deps). CLI thin consumer (owns ink, react).
- **Next phase:** Phase 3 (root cleanup) — delete root src/, update test imports when blocking.


**Incomplete/Stubs (Phase 3 blockers):**
- ⏳ **Ralph monitor** (src/ralph/index.ts): Class structure present. 14 TODO comments (PRD 8). Methods stubbed: start(), handleEvent(), healthCheck(), stop(). EventBus subscription logic not wired.
- ⏳ **Coordinator** (src/coordinator/index.ts): Class structure present. 13 TODO comments (PRD 5). Methods stubbed: initialize(), route(), spawn(), monitor(), destroy(). No SquadClient wiring, no agent manager hookup.
- ⏳ **Agents module** (src/agents/index.ts): Charter compilation imported from separate file (working). SessionManager class present but 14 TODO comments (PRD 4). Methods stubbed: spawn(), resume(), terminate(). No SDK session creation wired.
- ⏳ **Casting system** (src/casting/index.ts): v1 CastingEngine imported (working). Legacy CastingRegistry stubbed — 1 TODO (PRD 11) for registry.json parsing. Cast/recast methods throw "Not implemented".
- ⏳ **Shell UI:** No ink-based components wired. readline loop exists but command handling is echo-only (line 78 in shell/index.ts). No agent discovery integration, no streaming response display, no real coordinator handoff.
- ⏳ **Triage/Loop/Hire commands:** Placeholder messages in cli-entry.ts lines 115-148. No implementation.

**Important TODOs in Code:**
- **Ralph (8):** start() needs EventBus subscription, health checks, persistent state loading/saving (8 items).
- **Coordinator (13):** initialize() needs client connection, charter loading, hook setup, EventBus wiring (13 items).
- **Agents (14):** spawn() needs charter reading, YAML parsing, SDK session creation with history injection (14 items).
- **Shell spawn.ts (1):** "Wire to CopilotClient session API" — CopilotClient session creation stubbed with TODO (line ~78 in spawn.ts).
- **Casting (1):** registry.json parsing stub.

**CLI Commands Status:**
- **Fully working (7):** help, version, status, init, upgrade, export, import, copilot, plugin, scrub-emails
- **Stubbed (3):** triage (watch alias), loop, hire — all print placeholder messages
- **Design note:** Commands are correct per Brady's directives (squad loop, squad triage, squad hire). Command routing works; implementations pending.

**Technical Debt:**
- **Phase 3 cleanup pending:** root `src/` directory still exists (backward compat). Will be deleted after monorepo migration complete per history.
- **Ink components:** No UI components wired yet. Shell uses readline only. Ink dependency is in CLI package.json but not used.
- **Event-driven flow:** EventBus is defined (event-bus.ts) but no actual event emission wired. Handler error isolation TODO (PRD 1).

**CLI Entry Point Wiring:**
- `main()` parses command and routes to implementations (all sync/await patterns clean).
- No external commands spawned yet (e.g., `gh api`, file system watch).
- `--global` flag works (resolveGlobalSquadPath routing correct).

**Build/Test/Lint Status:**
- ✅ **Build:** 0 errors (tsc clean).
- ✅ **Tests:** 1700+ passing (exact count varies by run, all passing).
- ✅ **Lint:** tsc --noEmit clean (strict mode enforced).

**Next Phase Blocking Items:**
1. Wire EventBus: Actual event emission from sessions + handler execution in coordinator/ralph.
2. CopilotClient session integration: Ralph.start() and spawnAgent() need live session creation/resumption.
3. Coordinator.initialize() and route(): Accept user message, load charters, route to agents.
4. Shell UI: Wire ink components for agent display, streaming responses, session status.

### 📌 Team update (2026-02-22T08:50:00Z): Ink Shell Wiring — ShellApi callback pattern — decided by Fenster
App component accepts `onReady` prop that fires on mount, delivering ShellApi object with `addMessage`, `setStreamingContent`, `refreshAgents` methods. Host captures API and wires to StreamBridge callbacks. Keeps Ink component decoupled from bridge internals. Streaming content accumulation uses per-agent buffers. Ready for coordinator integration (Phase 3).
5. Triage/Loop/Hire: Implement placeholder commands (low priority, can defer).

**Assessment for Brady:** Core runtime foundation is solid — SDK/CLI split is complete, command routing works, type safety is enforced. Phase 3 (integrating with CopilotClient, EventBus event emission, Coordinator logic) is the next lift. Ralph and Coordinator are well-structured but need internal wiring. No broken code — just incomplete TODOs. Estimate 2-3 weeks to wire Phase 3 fully.

### 📌 Team update (2026-02-22T070156Z): Test import migration merged to decisions, CLI functions correctly exported from CLI package — decided by Fenster, Edie, Hockney
- **Test import migration decision:** 56 test files migrated from `../src/` to `@bradygaster/squad-sdk` / `@bradygaster/squad-cli`. 26 SDK subpath exports, 16 CLI subpath exports. Barrel re-exports verified for missing symbols. All 1727 tests passing.
- **CLI function placement clarified:** runInit, runExport, runImport, scrubEmails correctly exported from `@bradygaster/squad-cli` (not SDK), reflecting intentional architecture separation.
- **Pattern established:** Vitest resolves through compiled `dist/`, so barrel changes require `npm run build` in the package before tests see them.
- **Decision merged to decisions.md.** Status: Test infrastructure aligned with workspace split, ready for Phase 3 runtime integration.

### 📌 Ink shell wiring (2026-02-22) — Fenster
- **Replaced readline loop with Ink render** in `packages/squad-cli/src/cli/shell/index.ts`. The `runShell()` function now uses `ink.render()` + `waitUntilExit()` instead of `readline.createInterface`.
- **Created `App.tsx`** (`packages/squad-cli/src/cli/shell/components/App.tsx`) — main Ink component composing AgentPanel, MessageStream, InputPrompt. Manages messages, agents, streaming state via React hooks.
- **ShellApi pattern:** App exposes an `onReady` callback prop that delivers a `ShellApi` object (`addMessage`, `setStreamingContent`, `refreshAgents`). This lets the host wire StreamBridge callbacks into React state without coupling the component to the bridge directly.
- **StreamBridge wiring:** `runShell()` creates a StreamBridge with callbacks that accumulate content deltas in a local `streamBuffers` Map, then push accumulated content into the Ink component via ShellApi. The bridge is ready for coordinator integration — just call `_bridge.handleEvent(event)`.
- **Router + command handler integration:** App's `handleSubmit` calls `parseInput()` for input classification and `executeCommand()` for slash commands. Direct agent and coordinator messages produce system placeholders until coordinator is wired.
- **Exit handling:** `/quit`, `/exit` (via executeCommand), bare `exit` (via EXIT_WORDS set), and Ctrl+C (via `useInput` + `useApp().exit()` with `exitOnCtrlC: false`). Farewell message "👋 Squad out." printed after `waitUntilExit()`.
- **index.ts uses `React.createElement`** instead of JSX to avoid renaming the file to .tsx. All existing exports preserved. New exports: `App`, `ShellApi`, `AppProps`.
- **No test breakage:** All 60 previously-passing test files still pass (1813 tests). 5 pre-existing failures in agent-session-manager.test.ts are unrelated.
- **Key file paths:** `components/App.tsx`, `components/index.ts`, `shell/index.ts`.

### 📌 OpenTelemetry tracing instrumentation (2026-02-22) — Fenster (Issues #257, #258)
- **Added `@opentelemetry/api`** as a dependency in `packages/squad-sdk`. Imported `trace` and `SpanStatusCode` only — no SDK packages.
- **Instrumented 4 files:** `agents/index.ts` (AgentSessionManager: spawn/resume/destroy), `agents/lifecycle.ts` (AgentLifecycleManager: spawnAgent/destroyAgent), `coordinator/index.ts` (Coordinator: initialize/route/execute/shutdown), `coordinator/coordinator.ts` (SquadCoordinator: handleMessage).
- **Span naming convention:** `squad.{module}.{method}` — e.g. `squad.agent.spawn`, `squad.coordinator.route`.
- **Error pattern:** catch block sets `SpanStatusCode.ERROR` + `recordException()`, then re-throws. `span.end()` always in `finally`.
- **No-op by default:** Without a registered TracerProvider, all spans are no-ops. Zero overhead unless OTel is configured.
- **Build:** 0 errors in instrumented files (2 pre-existing errors in Fortier's `otel.ts` — unrelated SDK type mismatch).
- **Tests:** All 1828 passing tests unaffected. 23 pre-existing failures in `otel-provider.test.ts` are Fortier's parallel work.

### 📌 Tool trace enhancements + agent metric wiring (2026-02-22) — Fenster (Issues #260, #262)
- **Issue #260 — Tool traces enhanced** in `tools/index.ts`:
  - Added `sanitizeArgs()` — strips fields matching `/token|secret|password|key|auth/i`, truncates to 1024 chars. Exported for reuse.
  - `defineTool` now accepts optional `agentName` in config → recorded as `agent.name` span attribute.
  - `squad.tool.result` event now includes `result.length` (textResultForLlm length).
  - `duration_ms` verified present on both result and error events (was already there, confirmed consistent).
  - TODO comment added re: parent span context propagation (deferred until agent.work span lifecycle is complete).
- **Issue #262 — Agent metrics wired** into lifecycle code:
  - `AgentSessionManager` (agents/index.ts): `recordAgentSpawn` in spawn(), `recordAgentDuration`+`recordAgentDestroy` in destroy(), `recordAgentError` in catch blocks.
  - `AgentLifecycleManager` (agents/lifecycle.ts): `recordAgentSpawn` in spawnAgent(), `recordAgentDestroy` in destroyAgent(), `recordAgentError` in catch.
  - Duration computed from `createdAt` timestamp in destroy path.
- **Build:** tsc clean (0 errors). **Tests:** All 1886 tests passing (65 files).

### 📌 Team update (2026-02-22T093300Z): OTel Phase 2 complete — session traces, latency metrics, tool enhancements, agent metrics, token usage wiring, metrics tests — decided by Fortier, Fenster, Edie, Hockney
All four agents shipped Phase 2 in parallel: Fortier wired TTFT/duration/throughput metrics. Fenster established tool trace patterns and agent metric wiring conventions. Edie wired token usage and session pool metrics. Hockney created spy-meter test pattern (39 new tests). Total: 1940 tests passing, metrics ready for production telemetry.
### 📌 Team update (2026-02-22T020714Z): CRLF normalization complete and merged
Fenster's src/utils/normalize-eol.ts utility is now applied to 8 parser entry points across 6 files. Pattern established: normalize at parser entry, not at file-read callsite. This ensures cross-platform line ending safety for all parsers (Windows CRLF, Unix LF, old Mac CR). Decision merged to decisions.md. Issue #220, #221 closed. All 1683 tests passing.

### 📌 SDK/CLI File Migration — Keaton's split plan executed
- **Phase 1 (SDK):** Copied all 15 directories (adapter, agents, build, casting, client, config, coordinator, hooks, marketplace, ralph, runtime, sharing, skills, tools, utils) and 4 standalone files (index.ts, resolution.ts, parsers.ts, types.ts) from root `src/` into `packages/squad-sdk/src/`. Cleaned the SDK barrel (`packages/squad-sdk/src/index.ts`) — removed the CLI re-exports block (lines 25-52 of the original, exporting success/error/warn/fatal/SquadError/detectSquadDir/runWatch/runInit/runExport/runImport/runCopilot etc. from `./cli/index.js`). Updated SDK `package.json` exports map: removed `./cli`, added all subpath exports from Keaton's plan (resolution, runtime/streaming, coordinator, hooks, tools, adapter, client, marketplace, build, sharing, ralph, casting).
- **Phase 2 (CLI):** Copied `src/cli/` directory and `src/cli-entry.ts` into `packages/squad-cli/src/`. Copied `templates/` into `packages/squad-cli/templates/`. Rewrote 4 cross-package imports in CLI source:
  - `cli/upgrade.ts`: `../config/migration.js` → `@bradygaster/squad-sdk/config`
  - `cli/copilot-install.ts`: `../config/init.js` → `@bradygaster/squad-sdk/config`
  - `cli/shell/spawn.ts`: `../../resolution.js` → `@bradygaster/squad-sdk/resolution`
  - `cli/shell/stream-bridge.ts`: `../../runtime/streaming.js` → `@bradygaster/squad-sdk/runtime/streaming`
  - `cli-entry.ts`: `./resolution.js` and `./index.js` → `@bradygaster/squad-sdk`
- **Intra-CLI imports** (within `cli/` directory) left untouched — all relative.
- **Root `src/` preserved** — not deleted, per plan (cleanup after tests pass).
- Pattern: SDK subpath exports match the directory barrel structure — `@bradygaster/squad-sdk/{module}` resolves to `dist/{module}/index.js`. Special cases: `./resolution` → `dist/resolution.js`, `./runtime/streaming` → `dist/runtime/streaming.js`.

### 📌 Test import migration to workspace packages — completed
- Migrated all 56 test files (173 import replacements) from relative `../src/` paths to workspace package imports.
- SDK imports use 26 subpath exports (18 existing + 8 new): `@bradygaster/squad-sdk/config`, `@bradygaster/squad-sdk/agents`, etc.
- CLI imports use 16 new subpath exports: `@bradygaster/squad-cli/shell/sessions`, `@bradygaster/squad-cli/core/init`, etc.
- Added 8 new SDK subpath exports for deep modules not covered by barrels: `adapter/errors`, `config/migrations`, `runtime/event-bus`, `runtime/benchmarks`, `runtime/i18n`, `runtime/telemetry`, `runtime/offline`, `runtime/cost-tracker`.
- Added missing barrel re-exports: `selectResponseTier`/`getTier` in coordinator/index.ts, `onboardAgent`/`addAgentToConfig` in agents/index.ts.
- Updated consumer-imports test: CLI functions (`runInit`, `runExport`, `runImport`, `scrubEmails`) now imported from `@bradygaster/squad-cli` instead of SDK barrel.
- Rebuilt SDK and CLI packages to update dist. All 1727 tests pass across 57 files.
- Pattern: vitest resolves through compiled `dist/` files, not TypeScript source — barrel changes require a package rebuild to take effect.
- Pattern: when consolidating deep imports to barrel paths, verify the barrel actually re-exports the needed symbols before assuming availability.

### 📌 PR #300 Code Quality Review — Upstream Inheritance (2026-02-22) — Fenster
- **Reviewed:** resolver.ts (236 lines), upstream.ts CLI (228 lines), types.ts (56 lines), upstream/index.ts barrel, SDK barrel+exports, 2 test files (509 lines total), package-lock.json
- **Verdict:** Approve with required fixes (5 items). Architecture is sound — types in SDK, CLI command in CLI package, barrel exports correct.
- **Critical finding (from Baer, confirmed):** `execSync` string interpolation in upstream.ts is CWE-78 command injection. Must switch to `execFileSync` with array args.
- **Bug found:** upstream.ts imports `error as fatal` from `output.ts` (which just prints and returns void). Existing pattern uses `fatal()` from `errors.ts` (which throws SquadError, return type `never`). This means after "fatal" error messages, execution continues to the next `if (action === ...)` block. The explicit `return` statements mask this but the pattern is wrong and fragile.
- **Missing integration:** `upstream` command is not registered in `cli-entry.ts` command router. Users can't actually invoke it.
- **Test import pattern violated:** Tests import from `../packages/squad-sdk/src/upstream/resolver.js` (relative source paths) instead of `@bradygaster/squad-sdk/upstream` (package imports). Violates the test import migration decision.
- **Minor:** Test uses `(org.castingPolicy as any)` — should use typed cast `as Record<string, unknown>` per strict-mode decision.
### 📌 OTel Phase 4: Aspire command + Squad Observer file watcher (2026-02-22) — Fenster (Issues #265, #268)
- **Issue #265 — `squad aspire` command** added at `packages/squad-cli/src/cli/commands/aspire.ts`:
  - Launches the .NET Aspire dashboard for viewing Squad OTel telemetry.
  - Auto-detects Docker vs dotnet Aspire workload; falls back to Docker.
  - Sets `OTEL_EXPORTER_OTLP_ENDPOINT` env var so OTel providers auto-export.
  - Flags: `--docker` (force Docker), `--port <number>` (custom OTLP port, default 18888).
  - Wired into CLI entry point (`cli-entry.ts`) with help text.
  - Subpath export: `@bradygaster/squad-cli/commands/aspire`.
- **Issue #268 — SquadObserver file watcher** added at `packages/squad-sdk/src/runtime/squad-observer.ts`:
  - Watches `.squad/` directory recursively via `fs.watch()` with debounce (200ms default).
  - Classifies files into categories: agent, casting, config, decision, skill, unknown.
  - Emits OTel spans (`squad.observer.start`, `squad.observer.stop`, `squad.observer.file_change`) with file.path, file.category, change.type attributes.
  - Emits EventBus events (`agent:milestone` type) when an EventBus is provided.
  - Full start/stop lifecycle with error handling and OTel error spans.
  - Subpath export: `@bradygaster/squad-sdk/runtime/squad-observer`.
  - Barrel export in SDK index.ts: `SquadObserver`, `classifyFile`, types.
- **Tests:** 16 new tests (14 observer: classifyFile categories, start/stop, OTel spans, EventBus events, idempotency; 2 aspire: module exports). All 2024 tests passing.
- **Pattern:** `classifyFile()` normalizes Windows backslashes before classification — cross-platform safe.
- **Pattern:** Observer uses `fs.watch` with `{ recursive: true }` — works on Windows/macOS, may need inotify tuning on Linux.

### 📌 Spawn wiring + error handling cleanup (2026-02-22) — Fenster
- **spawn.ts wired to SquadClient:** `spawnAgent()` now accepts `client: SquadClient` via `SpawnOptions`. When provided, creates a real SDK session with the agent's charter as system prompt, sends the task, streams `message_delta` events, accumulates the response, closes the session, and returns the result in `SpawnResult`. Without a client, returns a backward-compatible stub.
- **Pattern mirrors shell/index.ts `dispatchToAgent()`** but is self-contained — no dependency on Ink components, ShellApi, or StreamBridge. Can be used outside the shell (e.g., from coordinator, CLI commands, or programmatic API).
- **Error handling audit:** Removed unused `error` import from `plugin.ts` (already correctly uses `fatal()` from `errors.ts`). Removed unused `error as errorMsg` import from `upgrade.ts` (same — already uses `fatal()`). `upstream.ts` has the `error as fatal` bug but is owned by Baer.
- **TODO removed:** "Wire to CopilotClient session API" in spawn.ts — resolved by this change.
- **TODO deferred:** "Parent span context propagation" in `tools/index.ts` — requires agent.work span lifecycle to be complete first. Left in place.
- **Build:** tsc clean (0 errors). **Tests:** 47 shell tests passing.

### 📌 Mechanical Documentation Updates (2026-02-23) — Fenster (Issues #191, #192, #195)
- **Issue #191 (.ai-team/ → .squad/):** Updated 42+ doc files to reflect `.squad/` as the standard team directory. Removed language about "legacy fallback" and "auto-detection of .ai-team/". Updated migration guides, feature docs, blog posts, templates, and architecture diagrams to use `.squad/` consistently.
  - Files updated: diagrams.md, quick-reference.md, module-map.md, codebase-comparison.md, 004-m3-feature-parity.md, checklist.md, beta-to-v1.md, feature-migration.md, 006-sdk-replatform.md, respawn-prompt.md, demo-scenarios.md, faq.md, migration-guide-v051-v060.md, 010-v060-replatform.md, operational-runbooks.md, squadui-type-corrections.md, release-notes-v060.md, 015-m2-configuring-squad.md, 011-migration-guide.md, test-scripts/05-beta-parity.md, team-to-brady.md, templates/scribe-charter.md, templates/squad.agent.md.
  - Pattern: Removed references to `.ai-team/` as a fallback/legacy directory. Updated code examples, comments, and prose to assume `.squad/` is the primary and only standard directory.
- **Issue #192 (CLI invocations):** Verified current package names in docs (@bradygaster/squad-cli, @bradygaster/squad-sdk) are already correct. No old `@bradygaster/ai-team` or `squad-cli` invocation patterns found. Confirmed README.md uses correct npm install patterns.
- **Issue #195 (repo URLs):** Updated 2 files:
  - CONTRIBUTING.md: Changed clone URL from `bradygaster/squad` to `bradygaster/squad-pr` (v1 SDK repo).
  - docs/README.md: Clarified repo column as `bradygaster/squad` (beta) vs `bradygaster/squad-pr` (v1 SDK).

### 📌 REPL sendMessage Bug Fix (2026-02-23) — Fenster
**Reported by:** Brady. REPL in 0.8.2 throws `coordinatorSession.sendMessage is not a function`.
**Root Cause:** CLI package.json had wildcard dependency `"@bradygaster/squad-sdk": "*"` instead of pinned version. When CLI is installed from npm (not in a workspace), npm may resolve to an older SDK version that lacks the CopilotSessionAdapter wrapping or has incompatible session interfaces.
**Fix:** Changed CLI dependency to `"@bradygaster/squad-sdk": "0.8.2"` to ensure SDK and CLI versions stay aligned. Both packages are at 0.8.2, and they should be published together as a matched set.
**Verification:** CopilotSessionAdapter in `packages/squad-sdk/src/adapter/client.ts` correctly wraps SDK sessions with `sendMessage()` → `send()` mapping at line 76-78. Both `createSession()` (line 453) and `resumeSession()` (line 345 in compiled JS) wrap sessions. All test suites pass.
**Pattern:** Workspace packages with synchronized versions should use exact version pins, not wildcards, to prevent version drift when published to npm.
  - Pattern: Intentionally preserved references to `bradygaster/squad` (the beta repo) where appropriate — it still exists and is referenced for context/comparison. Only updated URLs that should point to squad-pr (v1 SDK repo).
- **Build:** No build changes needed. **Tests:** All docs-only changes, no test impact. Verified no breaking changes to code or configuration.

### 📌 Dual-root path resolution (2026-02-23) — Fenster (Issue #311)
- **Added `resolveSquadPaths()`** to `packages/squad-sdk/src/resolution.ts` — dual-root resolver for remote squad mode.
- **New types:** `SquadDirConfig` (schema for `.squad/config.json` — version, teamRoot, projectKey) and `ResolvedSquadPaths` (mode, projectDir, teamDir, config, name, isLegacy). Named `SquadDirConfig` to avoid collision with existing `SquadConfig` in config/schema.ts and runtime/config.ts.
- **Local mode:** No config.json or invalid config → projectDir === teamDir. **Remote mode:** config.json with valid `teamRoot` string → teamDir resolved via `path.resolve(projectRoot, config.teamRoot)` relative to the project root (parent of .squad/), not relative to .squad/ itself.
- **Legacy fallback:** `resolveSquadPaths()` checks for both `.squad/` and `.ai-team/` (in priority order). Sets `isLegacy: true` and `name: '.ai-team'` for legacy repos.
- **Graceful degradation:** Malformed JSON, missing teamRoot, or non-string teamRoot all fall back to local mode with `config: null`.
- **Internal refactor:** Extracted `findSquadDir()` helper (walks up checking both dir names) and `loadDirConfig()` (reads/validates config.json). Original `resolveSquad()` untouched — backward compatible.
- **Exports:** `resolveSquadPaths`, `ResolvedSquadPaths`, `SquadDirConfig` added to SDK barrel (`index.ts`). Available via `@bradygaster/squad-sdk` and `@bradygaster/squad-sdk/resolution`.
- **Tests:** 12 new tests in `test/dual-root-resolver.test.ts` — local mode, remote mode, relative path resolution, malformed JSON fallback, missing teamRoot fallback, legacy .ai-team detection, .squad priority over .ai-team, walk-up behavior, projectKey null handling.
- **Build:** tsc clean (0 errors). All 21 existing resolution tests still passing. **Pattern:** `resolveSquad()` is the simple path finder; `resolveSquadPaths()` is the full dual-root resolver for code that needs to distinguish project-local vs team identity directories.

### 📌 Remote squad mode CLI — squad link + init --mode remote (2026-02-23) — Fenster (Issue #313)
- **Created `squad link` command** at `packages/squad-cli/src/cli/commands/link.ts`:
  - Accepts a path argument (relative or absolute) to a team repo.
  - Validates target exists, is a directory, and contains `.squad/` or `.ai-team/`.
  - Computes relative path via `path.relative()` — never stores absolute paths.
  - Writes `.squad/config.json` with `{ version: 1, teamRoot: "<relative>", projectKey: null }`.
  - Prints `✅ Linked to team root: <path>` on success.
  - Uses `fatal()` from `errors.ts` for all error paths.
- **Created `init --mode remote` support** at `packages/squad-cli/src/cli/commands/init-remote.ts`:
  - `writeRemoteConfig(projectDir, teamRepoPath)` creates `.squad/config.json` before normal init scaffolding runs.
  - Relative path computed from project root, same as `link`.
- **Registered both commands** in `cli-entry.ts`:
  - `squad init --mode remote <path>` writes config then runs normal init.
  - `squad link <path>` is a standalone command for post-init linking.
  - Help text updated for both.
- **Subpath exports added:** `./commands/link`, `./commands/init-remote` in CLI package.json.
- **Tests:** 9 new tests in `test/cli/remote-mode.test.ts` — link creates valid config, fails on missing target, fails on target without .squad/, relative-only paths, .ai-team legacy support, .squad/ auto-creation, round-trip with resolveSquadPaths.
- **Build:** tsc clean (0 errors). All 12 dual-root resolver tests still passing.

### 📌 CopilotSessionAdapter — P0 Codespaces fix (Issue #315) — Fenster
- **Root cause:** `createSession()` and `resumeSession()` in `adapter/client.ts` used `as unknown as SquadSession` — a compile-time-only cast that silently skipped runtime method mapping. CopilotSession has `send()`, `on()` (returns unsubscribe fn), `destroy()`; SquadSession expects `sendMessage()`, `on()`/`off()`, `close()`. In GitHub Codespaces, calling `coordinatorSession.sendMessage()` threw "sendMessage is not a function".
- **Fix:** Created `CopilotSessionAdapter` class in `adapter/client.ts` that wraps raw CopilotSession and implements SquadSession:
  - `sendMessage(opts)` → delegates to `inner.send(opts)` (same shape: prompt, attachments, mode)
  - `on(type, handler)` → calls `inner.on(type, handler)` and stores the unsubscribe function
  - `off(type, handler)` → calls stored unsubscribe function (CopilotSession has no off())
  - `close()` → delegates to `inner.destroy()` and clears tracked unsubscribers
  - `sessionId` → reads `inner.sessionId`
- **Updated `createSession()` and `resumeSession()`** to wrap with `new CopilotSessionAdapter(session)` instead of unsafe cast.
- **Test mocks updated:** 4 test files (`adapter-client.test.ts`, `session-traces.test.ts`, `integration.test.ts`, `session-adapter.test.ts`) — mocks now return CopilotSession-shaped objects (`send`, `on` returning unsubscribe, `destroy`) instead of SquadSession-shaped.
- **New tests:** 9 tests in `test/session-adapter.test.ts` — sessionId access, sendMessage→send delegation, attachments passthrough, on/off lifecycle, close→destroy delegation, unsubscriber cleanup.
- **Build:** tsc clean (0 errors). **Tests:** 157 affected tests passing, 9 new tests.

---

### 📌 Adapter Event Layer Fix (#316, #317, #319) — Fenster
**Requested by:** Brady. Fix event name mapping and data normalization in CopilotSessionAdapter.
**Investigation:** Inspected @github/copilot-sdk generated types at dist/generated/session-events.d.ts. SDK uses dotted-namespace event types (e.g., `assistant.message_delta`, `assistant.usage`, `session.idle`). Our adapter was passing short names (`message_delta`, `usage`) directly to CopilotSession.on(), which meant handlers silently never fired. SDK event payloads also wrap data in an `event.data` envelope (e.g., `event.data.inputTokens`), while our SquadSessionEvent expects flat access (`event.inputTokens`).

**Changes:**
- Added `EVENT_MAP` (10 entries) and `REVERSE_EVENT_MAP` to CopilotSessionAdapter — maps Squad short names → SDK dotted names and back
- Rewrote `on()` to map event names and wrap handlers with `normalizeEvent()` — flattens `event.data` onto top-level and maps type back to Squad short name
- Changed `unsubscribers` from `Map<handler, unsubscribe>` to `Map<handler, Map<eventType, unsubscribe>>` — fixes pre-existing bug where same handler on two event types caused one subscription to leak on `off()`
- `off()` now removes only the specified event type for a handler, not all subscriptions
- OTel `sendMessage()` telemetry now works automatically through the adapter: `message_delta` subscription fires `first_token`, `usage` subscription populates `tokens.input`/`tokens.output`

**Tests:** 16 tests in `test/session-adapter.test.ts` (was 9): event name mapping (3), data normalization (2), off/unsubscribe correctness (3), OTel-relevant handlers (2), existing tests preserved (6). All 16 passing. Build clean (tsc 0 errors).

**Key SDK event types discovered:** `session.start`, `session.resume`, `session.error`, `session.idle`, `session.usage_info`, `session.shutdown`, `user.message`, `assistant.message`, `assistant.message_delta`, `assistant.usage`, `assistant.reasoning`, `assistant.reasoning_delta`, `assistant.turn_start`, `assistant.turn_end`, `assistant.intent`, `tool.execution_start`, `tool.execution_complete`, `subagent.started`, `subagent.completed`, `hook.start`, `hook.end`, `system.message`.

---

### $([char]0x1f4cc) Docs Build Upgrade (2026-02-22)

**docs/build.js rewritten with markdown-it:**
Replaced regex-based markdownToHtml() with markdown-it for proper rendering of code blocks (with language classes), tables, nested lists, blockquotes, images, and links. Added frontmatter parser (--- fenced YAML), title extraction, asset copying (docs/assets/ -> dist/assets/), and updated nav to cover all 14 guide files across 4 sections (Getting Started, Guides, Reference, Migration). Template updated: asset paths fixed from `../assets/` to `assets/` for flat dist/ output, added {{TITLE}} placeholder, GitHub link updated to bradygaster/squad-pr. npm scripts added: `docs:build` and `docs:preview`. All 17 docs-build tests passing.

---

### 📌 Docs Build Multi-Directory Restructure (2026-02-23) — Fenster
**Requested by:** Brady. Update docs/build.js to handle new multi-directory doc structure (guide/, cli/, sdk/, features/, scenarios/).

**Changes to docs/build.js:**
- Replaced flat guide/*.md discovery with section-based discovery across 5 configured directories (guide, cli, sdk, features, scenarios). Each section skips gracefully if the directory doesn't exist yet.
- Nav generation now uses <details class="nav-section"> groups per section (Getting Started, CLI, SDK, Features, Scenarios) with dynamic discovery instead of hardcoded file lists.
- Output mirrors source structure: docs/guide/index.md → docs/dist/guide/index.html. Root dist/index.html is a redirect to guide/index.html.
- Asset paths computed via ssetsPrefix() helper — pages in subdirs get ../assets/ prefix. Template's href="assets/" and src="assets/" are rewritten per-page.
- Search index now spans all sections (62 entries vs previous 14).
- Added .md → .html link rewriting via ewriteLinks().
- Title extraction chain: frontmatter → H1 → filename-derived.
- All 30 docs-build tests passing. Build produces 62 pages across 5 sections + redirect.

### Syntax Highlighting Integration (highlight.js)
**Task from:** Brady  
**What:** Added syntax highlighting (colorization) for fenced code blocks in the docs build.

**Changes:**
- Installed `highlight.js` as devDependency.
- Updated `docs/build.js`: imported hljs, configured markdown-it's `highlight` option to use `hljs.highlight()` for known languages and `hljs.highlightAuto()` as fallback. Copies `github-dark.css` and `github.css` themes into `dist/assets/` during build.
- Updated `docs/template.html`: added `<link>` tags for both light (`hljs-light.css`) and dark (`hljs-dark.css`) highlight.js themes, with `id` attributes for JS toggling.
- Updated `docs/assets/script.js`: added `syncHljsTheme()` function that enables/disables the correct hljs stylesheet based on `[data-theme]` attribute and `prefers-color-scheme` media query, called from `updateThemeBtn()`.
- Build verified: all 42 pages generated, HTML output contains `hljs-keyword`, `hljs-string`, `hljs-built_in` spans inside `<code>` blocks, CSS paths correctly rewritten for subdirectory pages.

---

### Mermaid Diagram Rendering (client-side)
**Task from:** Brady  
**What:** Added Mermaid diagram rendering support so `mermaid` fenced code blocks render as interactive SVG diagrams in the HTML docs output.

**Changes:**
- Updated `docs/build.js`: Added custom markdown-it fence rule that intercepts `mermaid` code blocks and emits `<div class="mermaid">` with raw (unescaped) diagram text instead of `<pre><code>`. The `highlight()` function also short-circuits for mermaid to avoid hljs processing. All other code blocks continue using highlight.js.
- Updated `docs/template.html`: Added Mermaid.js v11 CDN script before `</body>` with `mermaid.initialize()` configured for startOnLoad, theme-aware rendering (dark/light), and responsive flowcharts/sequences.
- Updated `docs/assets/script.js`: Extended `toggleTheme()` to re-initialize and re-render mermaid diagrams when the user switches between dark/light/auto themes.
- Updated `docs/assets/style.css`: Added `.mermaid` CSS rule for centered layout, padding, code-bg background, border, border-radius, and horizontal scroll overflow.
- Build verified: all 42 pages generated. End-to-end test confirmed `<div class="mermaid">` output for mermaid blocks while regular code blocks remain as `<pre><code>` with hljs spans.

---

### CLI Entry-Point Fixes (#431, #429) — Fenster (2026-02-24)
**Requested by:** Brady. Fix CLI entry-point issues — empty/whitespace args behavior and version format inconsistency.
**PR:** #447 (branch: squad/cli-fixes-431-429)
**Changes:**
- #431: Confirmed empty/whitespace args defensive guard (shows abbreviated help, not error). Existing behavior was correct per P0 regression tests. No code change needed for this behavior.
- #429: Unified version output to bare semver across all entry points:
  - `cli-entry.ts`: Added `version` as recognized subcommand alongside `--version`/`-v` — all output bare semver.
  - `cli.js` (deprecated bundle): Replaced hardcoded `0.6.0-alpha.0` with dynamic `getPackageVersion()`, changed format from `squad {ver}` to bare semver.
  - Shell: Added `/version` slash command via `commands.ts` — passes `version` prop from `App.tsx` through `CommandContext`.
- Canonical version format decision: bare semver (e.g., `0.8.5.1`), matching existing P0 regression test expectations. Display contexts (help text, shell banner) continue using `squad v{VERSION}` for branding.
- All 148 tests passing (cli-shell-comprehensive, hostile-integration, cli-p0-regressions).

---

### Hostile Integration Test Timeout Fix (2026-02-24) — Fenster
**Requested by:** Brady. Fix failing `test/hostile-integration.test.ts` test (renders all 67 hostile strings).
**Branch:** squad/hockney-fix-test-vocab (Hockney's PR in progress)
**Root Cause:** Test was timing out when run with full test suite due to 5s default timeout. Rendering 67 hostile strings (including three 1KB, 10KB, and 100KB strings) through Ink/React legitimately takes 4.3-4.7s, exceeding default timeout under resource contention.
**Fix:** Added explicit 10s timeout to the slow test via third argument to `it()`: `it('renders all 67 hostile strings...', () => {...}, 10000)`. This is the standard Vitest pattern for long-running tests per their error message.
**Verification:** All 2912 tests now pass, including the previously failing hostile integration test. No code changes to MessageStream component or hostile corpus needed — test expectation was correct, just needed more time.


## Learnings

### 📌 Public Readiness Assessment (2026-02-24) — Fenster
**Requested by:** Brady. Evaluate SDK and CLI for public source release.

**Build status:** ✅ Clean. Both packages build with 0 TypeScript errors, 0 warnings. Monorepo workspace resolves correctly.

**Code quality findings:**
- SDK: 1 benign TODO in tools/index.ts (parent span context propagation — future enhancement). 3 console.log statements in coordinator/index.ts (lines 117, 122, 127) — event subscription debug logging. Only in commented example code elsewhere.
- CLI: 0 TODOs/FIXMEs/HACKs found in shell modules. All console.log occurrences are in examples or commented code.
- Hardcoded paths: localhost references only in OTel config docs/examples — not in runtime defaults.

**Runtime modules:**
- Adapter (client.ts, errors.ts): Robust. CopilotSessionAdapter properly wraps SDK, event mapping complete (10 event types), unsubscriber tracking fixed (#315-#319). No unsafe casts in hot path.
- Client (session-pool.ts, index.ts): Complete. Pool lifecycle, health checks, concurrency limits implemented.
- Casting engine: Complete. Universe templates (Usual Suspects, Ocean's Eleven), role assignment logic solid.
- Ralph (monitor): Event-driven work monitor implemented with health checks and state persistence.
- Tools: Tool definition with OTel span tracking, 1 TODO for future parent span wiring.

**CLI completeness:** ✅ Full command set. Help output shows 12 commands (init, upgrade, status, triage, copilot, plugin, export, import, scrub-emails, doctor, link, aspire) plus interactive shell. All documented commands implemented.

**Code hygiene issues:**
- **P1:** coordinator/index.ts lines 117/122/127 — 3 console.log statements in initialize() for session lifecycle events. Should be debug-gated or removed before public release.
- **P2:** tools/index.ts line 119 — TODO comment about parent span propagation. Non-blocking, documents future work.

**Dependencies:** Clean. SDK: @github/copilot-sdk + optional OTel. CLI: squad-sdk + ink + react. No problematic deps. Zero-dependency scaffolding preserved per Rabin decision.

**Tests:** 2930 tests passing per now.md. Build passes strict TypeScript.

**VERDICT:** 🟡 Ready with caveats. Code is solid, runtime stable, CLI complete. One P1 issue: remove/gate 3 coordinator console.log statements. Otherwise production-ready. Recommend: 1) Gate coordinator debug logs behind SQUAD_DEBUG env var, 2) Add source code disclaimer in README (alpha/preview status), 3) Ship it.

### 2026-02-24T17-25-08Z : Team consensus on public readiness
📌 Full team assessment complete. All 7 agents: 🟡 Ready with caveats. Consensus: ship after 3 must-fixes (LICENSE, CI workflow, debug console.logs). No blockers to public source release. See .squad/log/2026-02-24T17-25-08Z-public-readiness-assessment.md and .squad/decisions.md for details.

### 📌 Ghost Command Wiring (2026-02-24) — Fenster
**Issues:** #501, #503, #504, #507, #509
**Requested by:** Brady

Wired 5 ghost commands that were documented but missing from CLI routing in cli-entry.ts:
- `squad hire` → alias for `squad init` (team creation)
- `squad heartbeat` → alias for `squad doctor` (health check)
- `squad shell` → explicit REPL launch (same as no-args)
- `squad loop` → alias for `squad triage` (work monitoring)
- `squad run <agent>` → stub with "coming soon" message (deferred — needs session lifecycle work)

**Approach:** Aliases added to existing if-conditions in command router. `shell` and `run` added as new blocks before the unknown-command catch-all. Help text updated to show all five commands with alias annotations.

**Learning:** Aliasing in the CLI router is trivial — just extend the if-condition. The hard part is `run`, which needs non-interactive agent dispatch (session init, message send, teardown) that doesn't exist yet outside the REPL. Stubbed for now.
## Learnings

### 2026-02-24 : Wire upstream command (#505 → PR #534)
The upstream.ts command was fully implemented but never wired into cli-entry.ts. Routing pattern is consistent: dynamic import + args.slice(1). Help text lives inline in the help block. Surgical 8-line change — no new dependencies needed. CLI now exposes 13 commands.
### Per-command --help/-h intercept pattern
- Intercepting help flags BEFORE command dispatch is critical — without it, `squad init --help` runs init as a side effect
- A single intercept point (one if-block before the routing switch) is cleaner than adding help checks inside each command handler
- Help text sourced from cli-command-inventory.md draft outputs — that document proved invaluable as a single source of truth
- The `watch` → `triage` alias needs explicit handling in the help lookup (not just in the routing)
- PR #533 on branch `squad/511-per-command-help`, closes #511 and #512

### 2026-02-28: CLI command test coverage analysis — 4 critical, 10 moderate gaps
📌 Team update (2026-02-28T01:05:24Z): Exhaustive CLI command test coverage analysis complete. Consistency matrix created analyzing all 25 commands. Critical gaps found: --preview (undocumented, untested), --timeout (undocumented, untested), upgrade --self (dead code path), run subcommand (stub in help). Moderate gaps: untested aliases (--help/-h, --version/-v), missing per-command help (squad spawn --help, squad triage --help), flag parsing error handling, shell-specific flag behavior, config file precedence, env var fallback, timeout edge cases, agent spawn flags, REPL mode transitions, exit code consistency. Full analysis in .squad/orchestration-log/2026-02-28T01-05-24-fenster.md.


### 2026-02-27 : Watch PR/CI visibility added
- Added PR polling to `watch.ts` via `ghPrList()` and `GhPullRequest` so Ralph now reports squad draft PRs, change-requested PRs, CI failures, and approved+green PRs ready to merge.
- Kept issue triage flow intact and layered PR checks after issue handling, with an early PR check before emitting the board-clear message when no issue work is pending.

### 2026-02-27 : Standalone Ralph triage script template
- Added `ralph-triage.js` as a zero-dependency CommonJS template for heartbeat workflows to run outside the SDK runtime.
- Ported `packages/squad-sdk/src/ralph/triage.ts` parsing/matching logic directly (module ownership → routing keyword → role keyword → lead fallback) to keep routing behavior identical.
- Script reads `.squad/team.md` + `.squad/routing.md`, fetches open `squad` issues with `GITHUB_TOKEN`, filters untriaged issues (no `squad:{member}` label), and emits JSON decisions for downstream workflow steps.

### 2026-02-27 : watch.ts moved to SDK routing-aware triage
- Replaced local watch.ts parsing/triage helpers with SDK exports from @bradygaster/squad-sdk/ralph/triage.
- watch now reads .squad/routing.md once, parses Work Type rules and Module Ownership, and reuses rules/modules/roster for each runCheck cycle.
- Added SDK package export subpath ./ralph/triage so CLI can import triage helpers without duplicating routing logic.

### 2026-02-27 : Watch loop board state + rounds
- `watch.ts` now returns a `BoardState` from `runCheck()` and prints a per-round board summary with round number, while preserving detailed issue/PR item logs.
- PR monitoring returns structured counts (`drafts`, `needsReview`, `changesRequested`, `ciFailures`, `readyToMerge`) so board status and board-clear idling can be computed after each poll cycle.
- Assigned issue WIP is derived from labeled squad issues minus active squad PR count, keeping "assigned" focused on issue work that has not started a PR yet.

### 2026-02-27 : Heartbeat workflow now uses standalone triage script
- Replaced the inline "Ralph — Check for squad work" workflow logic with script-driven triage (`node .squad-templates/ralph-triage.js`) plus a separate apply-decisions step.
- Added a guard step that checks for `.squad-templates/ralph-triage.js` and logs upgrade guidance when missing.
- Kept triggers and `Ralph — Assign @copilot issues` unchanged, and synchronized all four heartbeat workflow copies to identical content.

### 2026-02-27 : Watch wired to RalphMonitor SDK
- Wired `runWatch()` to instantiate `RalphMonitor` with team root, interval-based health checks, 3x stale threshold, and persisted state at `.squad/.ralph-state.json`.
- Added an in-process `EventBus` (`@bradygaster/squad-sdk/runtime/event-bus`) so watch emits `session:created`, per-round `agent:milestone`, and `session:destroyed` lifecycle events.
- Added `monitor.healthCheck()` after each watch cycle and `monitor.stop()` during graceful shutdown so monitor state is persisted across watch sessions.

### 2026-02-27 : PR #552 reviewer follow-ups
- `watch.ts` now reports `assigned` as raw `assignedIssues.length` instead of subtracting active PR count, avoiding fragile issue↔PR assumptions.
- `packages/squad-cli/package.json` now pins `@bradygaster/squad-sdk` to `workspace:*` for monorepo-local dependency resolution.
- `.squad/templates/ralph-reference.md` now documents PR state tracking via `reviewDecision` and `statusCheckRollup` API fields instead of non-existent status labels.

### 2026-02-27 : Sync headers for duplicated templates
- Added explicit sync notices to all three `ralph-triage.js` template copies so SDK triage parity ownership is documented in-file.
- Added sync notices to all four `squad-heartbeat.yml` workflow copies to make multi-location maintenance requirements visible at the workflow definition header.

---

## 2026-02-28: Codebase Scan for Unfiled Issues

**Task:** Brady requested scan of codebase for known issues not yet filed as GitHub issues.

**Scope:** Checked for:
1. TODO/FIXME/HACK/XXX comments in code
2. TypeScript strict mode violations (@ts-ignore/@ts-expect-error)
3. Skipped/todo tests (\.skip\(|\.todo\()
4. Errant console.log statements
5. Missing package.json fields

**Findings:**

✅ **No @ts-ignore/@ts-expect-error violations** — Strict mode compliance is solid across the codebase. Team decision on type safety is being followed faithfully.

❌ **workspace:* protocol violation in squad-cli** (Issue #592 filed)
- Location: `packages/squad-cli/package.json:129`
- Current: `"@bradygaster/squad-sdk": "workspace:*"`
- Violates: Team decision (2026-02-21) to use npm-native workspace resolution (version strings, not pnpm-specific protocol)
- Fix: Replace with `"0.8.5.1"`

❌ **Skipped test for SQUAD_DEBUG** (Issue #588 filed)
- Location: `test/repl-streaming.test.ts:658`
- Test placeholder: `it.todo('SQUAD_DEBUG env var enables diagnostic logging')`
- Gap: No test coverage for debug mode activation
- Needs: Implementation of diagnostic logging test case

✅ **TODO comments in generated workflow templates** — Not code issues
- Lines in `upgrade.ts` and `workflows.ts` are template strings inserted into GitHub Actions YAML files
- These are intentional placeholders for users to fill in (build commands, release commands, etc.)
- Correctly documented as templates, not actual code TODOs

✅ **Console.log statements are intentional** — All are user-facing status/output
- `aspire.ts`: Dashboard startup messages and OTel endpoint info
- `copilot.ts`: Status and configuration messages
- `watch.ts`: Error/status reporting for labeling operations
- `shell/index.ts`: Loading and telemetry notifications

✅ **Package.json fields** — Already tracked
- Issue #583 already filed for missing `homepage` and `bugs` fields

**Summary:** Codebase is clean. Type safety discipline is being maintained. Two legitimate issues filed (workspace protocol violation + skipped test). No broken or abandoned code patterns detected.
