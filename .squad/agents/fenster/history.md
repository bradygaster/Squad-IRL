# Project Context

- **Owner:** Brady
- **Project:** squad-sdk — the programmable multi-agent runtime for GitHub Copilot (v1 replatform)
- **Stack:** TypeScript (strict mode, ESM-only), Node.js ≥20, @github/copilot-sdk, Vitest, esbuild
- **Created:** 2026-02-21

## Learnings

### From Beta (carried forward)
- Casting system implementation: universe selection, registry.json (persistent names), history.json (assignment snapshots)
- Drop-box pattern for decisions inbox: agents write to decisions/inbox/{name}-{slug}.md, Scribe merges
- Parallel spawn mechanics: background mode default, sync only for hard data dependencies
- 13 modules: adapter, agents, build, casting, cli, client, config, coordinator, hooks, marketplace, ralph, runtime, sharing, skills, tools
- CLI is zero-dep scaffolding: cli.js stays thin, runtime is modular
- Ralph module: work monitor, queue manager, keep-alive — runs continuous loop until board is clear

### 📌 Team update (2026-02-21T21:23Z): CLI command renames are pending — decided by Keaton
Recommend renaming `squad watch` to `squad triage` (40% better semantic accuracy; aligns with GitHub terminology). Keep `watch` as silent alias for backward compatibility. Do NOT expose `squad ralph` as user-facing CLI; suggest `squad monitor` or `squad loop` instead for the monitoring function. Ralph remains in team identity, not CLI. Confidence: 85% for triage, 90% against ralph.

### 📌 Team update (2026-02-21T21:35Z): CLI naming finalized — decided by Brady
**Final directives:** `squad triage` (confirmed), `squad loop` (replaces Keaton's `squad monitor` proposal), `squad hire` (replaces `squad init`). Commands chosen for clarity and identity alignment. Brady's preference supersedes earlier recommendations.

### 📌 M3 Resolution (#210, #211) — implemented
- Created `src/resolution.ts` with `resolveSquad()` (walk-up to .git boundary) and `resolveGlobalSquadPath()` (platform-specific global config dir)
- Both exported from `src/index.ts` public API
- 10 tests in `test/resolution.test.ts` — all passing
- PR #275 on branch `squad/210-resolution-algorithms` → `bradygaster/dev`
- Decision: placed in `src/resolution.ts` (root src, not packages/squad-sdk) since code hasn't moved to monorepo packages yet
- Decision: `resolveSquad()` intentionally does NOT fall back to `resolveGlobalSquadPath()` — kept as separate concerns per #210/#211 separation. Consumer code can chain them.

### 📌 #212/#213: --global flag and squad status command — implemented
- Added `--global` flag to `squad init` and `squad upgrade` in `src/index.ts` main()
- `--global` passes `resolveGlobalSquadPath()` as the dest instead of `process.cwd()`
- Added `squad status` command: shows active squad type (repo/personal/none), path, and resolution reason
- Status command composes `resolveSquad()` + `resolveGlobalSquadPath()` — the chaining pattern envisioned in #210/#211
- All changes in `src/index.ts` only — no modifications to resolution.ts, init.ts, or upgrade.ts needed
- PR on branch `squad/212-213-global-flag-status` → `bradygaster/dev`

### 📌 Team update (2026-02-21T22:25Z): Decision inbox merged — decided by Fenster, Hockney
- ensureSquadPath() guard (#273): validation function for .squad/ paths, testable composition pattern for routing logic
- CLI integration tests: direct logic testing instead of process spawning (sets pattern for future CLI tests)

### 📌 #234/#235: Shell module structure + main entry wiring — implemented
- Created `src/cli/shell/` module: `index.ts` (placeholder `runShell()`), `types.ts` (ShellState, ShellMessage, AgentSession), `components/.gitkeep`
- `runShell()` prints version header + exit hint, handles SIGINT, exits cleanly — placeholder until ink UI is wired (#233)
- Wired `src/index.ts`: `squad` with no args now calls `runShell()` instead of `runInit()`. `squad init` is now an explicit subcommand.
- Types defined: `ShellState` (status + agents + history), `ShellMessage` (role/agent/content/timestamp), `AgentSession` (name/role/status/startedAt)
- PR #282 on branch `squad/234-235-shell-module` → `bradygaster/dev`
- Decision: no ink dependency added — another agent (#233) handles that. Shell uses console.log only.

### 📌 #236/#237: Shell chrome + session registry — implemented
- Updated `src/cli/shell/index.ts`: replaced placeholder with full header chrome, readline input loop, clean exit
- Header displays box-drawing chrome with version read from package.json via `createRequire`
- Readline loop (`node:readline/promises`) processes input; `exit` and `/quit` trigger clean shutdown with "👋 Squad out."
- SIGINT (Ctrl+C) handler prints cleanup message and exits cleanly
- Created `src/cli/shell/sessions.ts`: `SessionRegistry` class — Map-backed registry for tracking agent sessions by name
- SessionRegistry methods: register, get, getAll, getActive (filters working/streaming), updateStatus, remove, clear
- Exported `SessionRegistry` from `src/cli/shell/index.ts`
- PR #284 on branch `squad/236-237-shell-chrome-registry` → `bradygaster/dev`
- Pattern: version sourced via `createRequire(import.meta.url)` for ESM-compatible JSON import (matches existing codebase pattern in `github-dist.ts`)
- Pattern: SessionRegistry is a simple stateful class — no persistence, no events — designed for ink UI to consume later (#242+)

### 📌 #238: SDK-based agent spawning infrastructure — implemented
- Created `src/cli/shell/spawn.ts`: `loadAgentCharter()`, `buildAgentPrompt()`, `spawnAgent()`
- `loadAgentCharter(name, teamRoot?)` loads charter from `.squad/agents/{name}/charter.md` using `resolveSquad()` for directory resolution
- `buildAgentPrompt(charter, options?)` constructs system prompt: "You are an AI agent..." + charter + optional context
- `spawnAgent(name, task, registry, options?)` is the full lifecycle: load charter → parse role from `# Name — Role` header → register in SessionRegistry → set status to working → build prompt → return SpawnResult → set status to idle
- Types exported: `SpawnOptions` (mode: sync/background, systemContext, tools), `SpawnResult` (agentName, status, response/error), `ToolDefinition` (name, description, parameters)
- All exported from `src/cli/shell/index.ts` barrel
- SDK session creation intentionally stubbed with TODO — CopilotClient session API wiring deferred until we understand the session management surface
- PR #285 on branch `squad/238-sdk-spawning` → `bradygaster/dev`
- Pattern: charter loading uses `resolveSquad()` (returns `.squad/` dir path) — `teamRoot` param constructs `.squad/` path from project root for testability
- Pattern: role parsing from charter header is regex-based (`/^#\s+\w+\s+—\s+(.+)$/m`), falls back to "Agent" if no match
- Foundation for #239 (stream bridge integration) and #241 (coordinator spawn orchestration)

### 📌 #220/#221: CRLF normalization utility + parser hardening — implemented
- Created `src/utils/normalize-eol.ts` with `normalizeEol()` — strips `\r\n` and lone `\r` to LF-only before any parsing logic runs.
- Applied to all 8 markdown parsers: `parseTeamMarkdown`, `parseRoutingRulesMarkdown`, `parseDecisionsMarkdown` (markdown-migration.ts), `parseRoutingMarkdown` (routing.ts), `parseCharterMarkdown` (charter-compiler.ts), `parseFrontmatter` (skill-loader.ts), `parseAgentDoc` (agent-doc.ts), `buildCapabilitiesBlock` (doc-sync.ts).
- Build clean (0 errors), all 1670 tests pass. Committed on `squad/181-squadui-p0`.
- Pattern: normalize at the entry point of the parser function, before any `.split('\n')` or regex matching. This is a one-line defensive guard — no behavioral change for LF-only inputs.

### 📌 #224: Re-export all CLI functions from main barrel — implemented
- Added `runInit`, `runExport`, `runImport`, `runCopilot`, `type CopilotFlags`, and `scrubEmails` to `src/index.ts` public API surface.
- These were already exported from `src/cli/index.ts` barrel but were missing from the top-level selective named export block in `src/index.ts`.
- Single-line change pattern: expand the existing named import list from `./cli/index.js` — no new import statements needed.
- Build clean (0 errors), all 1683 tests pass. Committed on `squad/181-squadui-p1`.
- Pattern: when Edie split `main()` into `cli-entry.ts`, the barrel became selective. Any new CLI function must be explicitly added to the `src/index.ts` named export list to be part of the public API.


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
