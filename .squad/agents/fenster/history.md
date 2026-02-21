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

### 📌 #273: ensureSquadPath() guard — no repo root clutter — implemented
- Added `ensureSquadPath(filePath, squadRoot)` to `src/resolution.ts` — validates write targets are inside `.squad/` or system temp dir, throws otherwise
- Exported from `src/index.ts` public API
- 5 tests in `test/resolution.test.ts`: valid .squad/ path, .squad/ root itself, system temp allowed, repo root rejected, arbitrary path rejected
- PR #279 on branch `squad/273-no-root-clutter` → `bradygaster/dev`
- This is a guard utility — does not change existing write behavior, provides a function future code should call before writing scratch/temp/state files
- Audit finding: 30+ `writeFileSync`/`writeFile` calls exist in src/ — most write into .squad/ subdirs or user-requested paths, but the guard is now available to enforce the policy programmatically
