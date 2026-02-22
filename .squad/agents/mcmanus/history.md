# Project Context

- **Owner:** Brady
- **Project:** squad-sdk — the programmable multi-agent runtime for GitHub Copilot (v1 replatform)
- **Stack:** TypeScript (strict mode, ESM-only), Node.js ≥20, @github/copilot-sdk, Vitest, esbuild
- **Created:** 2026-02-21

## Learnings

### From Beta (carried forward)
- Tone ceiling enforcement: ALWAYS — no hype, no hand-waving, no unsubstantiated claims
- Celebration blog structure: wave:null, parallel narrative format
- docs/proposals/ pattern: meaningful changes require proposals before execution
- v1 docs are internal only — no published docs site for v1
- Distribution message: `npx github:bradygaster/squad` — always GitHub-native, never npmjs.com

### 2026-02-21: Issue #217 — README and help output update for npm distribution
**Status:** Complete.
**Changes made:**
1. **README.md**: Added npm-based installation as primary path with legacy GitHub-native as fallback. New sections:
   - "Install Squad" with Option A (npm) and Option B (Legacy/GitHub-native)
   - "Monorepo Development" section documenting workspace structure, build/test/lint commands, and changesets workflow
   - Updated command table to show `squad` command format instead of `npx github:bradygaster/squad-sdk`
   - Updated "Insider Channel" section with both npm and legacy examples
2. **src/index.ts help output**: Updated to reflect npm-based distribution:
   - Usage line changed from `npx github:bradygaster/squad-sdk [command]` to `squad [command] [options]`
   - Added `--global` flag documentation to init and upgrade entries
   - Moved `status` command to top of commands list (for discoverability)
   - Added Installation and Insider channel sections showing npm commands
   - Removed reference to legacy GitHub-native in help (users get that from README)
3. **CONTRIBUTING.md**: Created comprehensive monorepo development guide:
   - Prerequisites, monorepo structure, getting started (clone, install, build, test, lint)
   - Development workflow (branch naming, commit format, PR process)
   - Code style conventions (TypeScript strict mode, ESM-only, error handling, tone ceiling)
   - Changesets independent versioning workflow (add, release process)
   - Branch strategy (main, insider, user feature branches)
   - Common tasks (add CLI command, add SDK export, migrate legacy code)
   - Key files reference
**Tone applied:** No hype, factual, references back to decisions.md (changesets decision, zero-dependency scaffolding, ESM-only, TypeScript strict mode, tone ceiling)
**Notes:** 
- Help text changed from npx-based to direct `squad` command, reflecting the fact that squad-cli is now a proper npm package that gets installed as a binary (when installed via `npm install @bradygaster/squad-cli`)
- README maintains historical context by keeping GitHub-native option visible but secondary, per decision #2026-02-21
- CONTRIBUTING.md focuses on development experience, not user experience (kept separate from README per v1 internal-only docs decision)

### 📌 Team update (2026-02-21T22:25Z): Decision inbox merged — decided by Scribe
- M5 round complete: McManus (docs PR #280), Fenster (guard PR #279), Kobayashi (blocked #209)
- Decisions merged: ensureSquadPath() guard, CLI routing testability pattern

### 2026-02-21: Epic #181 P0 docs — CHANGELOG and SquadUI integration guide
**Status:** Complete.
**Changes made:**
1. **CHANGELOG.md** — Created with [Unreleased] section documenting three P0 items:
   - Breaking: CLI entry point moved to `dist/cli-entry.js`
   - Fixed: CRLF normalization across 8 parsers
   - Fixed: `process.exit()` removed from library functions
   - Internal: Notes on new `normalizeEol()` utility and `src/cli-entry.ts`
   - Also backfilled v0.6.0 section for context
2. **docs/squadui-integration.md** — Created practical integration guide for SquadUI team:
   - Three subsections matching the P0 work (CRLF, entry point, process.exit)
   - Code snippets showing safe import patterns for extensions
   - Simple table summarizing breaking changes and migration paths
   - Brief P1 roadmap section (type extensions, subpath exports, error types)
3. **Commit on branch `squad/181-squadui-p0`** with proper Co-authored-by trailer
**Tone notes:**
- No hype in CHANGELOG — factual, issue-linked, clear scope
- SquadUI guide is practical not promotional — code-first, minimal prose, brief sections
- Separated "What Changed" (P0) from "What's Coming" (P1) to set expectations
- Breaking changes table is explicit (Impact + Migration Path) to reduce support burden
**Process:** Read history.md and decisions.md for context; verified tone ceiling; no source changes — docs-only.


