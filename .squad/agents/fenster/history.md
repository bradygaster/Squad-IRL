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

