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



### 📌 Team update (2026-02-22T020714Z): SquadUI integration docs complete
McManus updated CHANGELOG.md with v0.6.0 entries and created docs/squadui-integration.md. Documentation captures the SquadUI integration work (library-safe CLI, error handling patterns, cross-platform robustness). User directive decision merged: docs as you go during integration. Epic #181 archived.

### 2026-02-22: Issue #231 — SquadUI v2 type mapping corrections
**Status:** Complete.
**Changes made:**
1. **docs/squadui-type-corrections.md** — Created comprehensive type alignment document for SquadUI team:
   - 4 type mapping errors clearly documented with before/after comparisons
   - Error 1: `SkillDefinition` — proposal wrong on `description` (should be `content`), `requiredTools` (should be `agentRoles`), missing `id`, `domain`
   - Error 2: `ParsedCharter` — proposal assumes flat object, actual is nested `identity: { name?, role?, expertise?, style? }`, no `voice` (use `collaboration`), no `owns` (use `ownership`)
   - Error 3: `RoutingConfig` — missing `issueRouting`, `governance`, `copilotEvaluation`; `RoutingRule` uses `workType` not `pattern`
   - Error 4: `parseDecisionsMarkdown()` returns `{ decisions, warnings }` not `ParsedDecision[]` directly
   - 2 architectural clarifications: two routing parsers (parseRoutingRulesMarkdown vs parseRoutingMarkdown) and orchestration log parsing is out of scope
   - Correct type shapes with exact interfaces from source
   - Migration path table for each error
2. **Commit on branch `squad/181-squadui-p2`** with closes #231 reference
**Tone applied:** 
- No hype — factual, error-driven ("Here's what's wrong and why")
- Action-oriented table mapping proposal assumptions to correct reality
- Citations to exact source files (line numbers not included per "tone ceiling" — readers can verify easily)
- Closing with "Questions? Contact the SDK team" rather than "let us know" (professional, boundaried)
**Process:** 
- Read all type definitions from source (skills/skill-loader.ts, agents/charter-compiler.ts, runtime/config.ts, config/markdown-migration.ts, config/routing.ts)
- Verified return types by examining function signatures and actual code
- Cross-referenced parser locations to clarify "two routing parsers" architectural issue
- No speculative content — every statement grounded in actual type inspection
**Notes:**
- Document serves as a blocker for SquadUI adapter development (prevents costly refactors)
- Type corrections enable them to build adapters on correct assumptions from day one
- Orchestration log parsing note prevents scope creep (that's SquadUI's responsibility)

### 2026-02-22: Issue #302 — Upstream inheritance feature documentation
**Status:** Complete.
**Changes made:**
1. **docs/guide/upstream-inheritance.md** — Comprehensive 21KB guide covering:
   - Overview: why upstream inheritance matters (knowledge sharing without duplication)
   - Core concepts: three source types (local/git/export), hierarchy (Org→Team→Repo), closest-wins resolution
   - What gets inherited: skills, decisions, wisdom, casting policy, routing
   - Getting started: quick-start examples for local, git, and export sources
   - CLI reference: all 4 commands (`add`, `remove`, `list`, `sync`) with signatures, examples, and behavior
   - SDK API reference: 5 types (`UpstreamType`, `UpstreamSource`, `UpstreamConfig`, `ResolvedUpstream`, `UpstreamResolution`) and 4 functions (`readUpstreamConfig`, `resolveUpstreams`, `buildInheritedContextBlock`, `buildSessionDisplay`) with TypeScript signatures and usage examples
   - All 6 end-to-end scenarios with detailed narrative:
     1. Platform Team at Scale — org-wide practices flowing to product teams
     2. Open-Source Framework with Community Plugins — community alignment without forking
     3. Consultancy Methodology Across Client Projects — consistent engagement model across clients
     4. Multi-Team Shared Domain Model — single source of truth for domain models
     5. Post-Acquisition Engineering Convergence — merging two organizations' practices
     6. Enterprise Application Modernization — architectural coherence during microservices migration
   - Troubleshooting: 6 common issues (git clone failures, local path issues, export validation, missing context, stale caches, ordering conflicts) with solutions
**Tone applied:** 
- Grounded in actual implementation (CLI commands read from upstream.ts, SDK API from resolver.ts and types.ts)
- No hype — each feature explained with "what" and "why" separately
- Scenarios are realistic narratives grounded in actual engineering problems, not idealized cases
- Every claim about behavior verified against source code (type definitions, function signatures, error handling)
- Troubleshooting section prevents support burden by addressing real failure modes
**Process:**
- Read implementation files: upstream.ts (all CLI commands), resolver.ts (resolution algorithm), types.ts (public API)
- Built type reference from actual interface definitions
- Derived CLI examples from command argument parsing and flag handling
- Scenarios drawn from real patterns: org hierarchy, open-source governance, consultancy standardization, domain-driven design, M&A integration, monolith→microservices migration
- Verified each scenario's code structure against resolution algorithm (what gets inherited, in what order)
**Notes:**
- Document is internal-only per v1 decision; targets team and early adopters
- Closest-wins resolution algorithm and ordering importance emphasized to prevent user error
- Troubleshooting focuses on common paths (git auth, local path validation, cache invalidation, order dependency)
- All SDK examples use actual public exports from `@bradygaster/squad-sdk`

### 2026-02-22: Issue #206, #203, #201, #199, #196 — Five documentation guides
**Status:** Complete.
**Changes made:**
1. **docs/guide/architecture.md** — 15.2KB architecture overview:
   - System diagram showing SDK, CLI, SquadUI, and Copilot integration
   - Package boundaries: Squad SDK (core runtime), Squad CLI (entry point + commands), SquadUI (VS Code extension)
   - Complete module map with subdirectories and key types (Agents, Casting, Routing, Tools, Config, Upstream, Adapter, Runtime)
   - OTel 3-layer observability pipeline (low-level: initializeOTel/getTracer; mid-level: bridgeEventBusToOTel; high-level: initSquadTelemetry)
   - Trace flow from user input → SDK spans → EventBus → OTLP → Aspire
   - Execution flows for CLI shell and SquadUI
   - Development workflow patterns (adding CLI command, adding tool, adding SDK export)

2. **docs/guide/migration.md** — 9.6KB migration from beta to v1:
   - Directory rename: `.ai-team/` → `.squad/` (automated with `squad upgrade --migrate-directory`)
   - Package names: monolithic SDK → separate SDK + CLI (`@bradygaster/squad-sdk`, `@bradygaster/squad-cli`)
   - CLI commands: all work with global install, no more `npx github:bradygaster/squad-sdk`
   - Config changes: .agent.md still exists but no longer baked into routing (now programmatic)
   - Charter format: still markdown but structured sections (Identity, Knowledge, Tools, Collaboration)
   - 10-step migration checklist with validation at each step
   - What's new: deterministic routing, OTel observability, upstream inheritance, response tiers, independent versioning
   - Troubleshooting: command not found, missing directories, agent load failures, model availability, script updates

3. **docs/guide/cli-install.md** — 8.1KB CLI installation guide:
   - Three install methods: global (npm), one-off (npx), GitHub native (development)
   - How resolution works: global PATH lookup vs. npx on-demand vs. git clone
   - Personal squad: `squad init --global` for shared ~/.squad/ across projects
   - Global vs. local squad comparison table
   - Resolution order: ./.squad/ → parents → ~/.squad/ → fallback
   - Command compatibility matrix (which commands work with which install methods)
   - When to use each method (frequency, CI/CD, testing, GitHub native)
   - Version management: check, update, pin, insider channel
   - Troubleshooting: command not found, missing .squad/, permissions, version mismatch, Docker setup

4. **docs/guide/vscode-integration.md** — 10KB SquadUI integration for extension developers:
   - User flow: user → SquadUI → runSubagent → SDK spawns agent
   - Client compatibility modes: CLI (interactive shell, full filesystem) vs. VS Code (no interactive, scoped file ops)
   - Extension developer checklist: 7 items (detect mode, import safely, load config, call agents, stream, error handling, user context)
   - API reference: CastMember, AgentCharter, RoutingDecision, ConfigLoadResult types
   - Safe patterns: read-only status, non-blocking spawn, stream output
   - Detailed troubleshooting: Squad not found, process.exit() crashes, non-streaming responses, import paths
   - Emphasis on never importing CLI entry point (it calls process.exit())

5. **docs/guide/sdk-api-reference.md** — 20.3KB complete SDK API reference:
   - Barrel export overview (all imports work from @bradygaster/squad-sdk)
   - **Resolution**: resolveSquad, resolveGlobalSquadPath, ensureSquadPath
   - **Runtime Constants**: MODELS, TIMEOUTS, AGENT_ROLES with examples
   - **Configuration**: loadConfig, loadConfigSync with types (ConfigLoadResult, AgentConfig, RoutingConfig)
   - **Agents**: onboardAgent with full usage example
   - **Casting**: CastingEngine, CastingHistory with examples
   - **Coordinator**: SquadCoordinator class, selectResponseTier, getTier with complete types
   - **Tools**: defineTool helper, ToolRegistry, built-in tool table
   - **OTel (3-layer)**:
     - Layer 1: initializeOTel, shutdownOTel, getTracer, getMeter (low-level control)
     - Layer 2: bridgeEventBusToOTel, createOTelTransport (mid-level bridge)
     - Layer 3: initSquadTelemetry with lifecycle handle (high-level convenience)
     - Zero overhead guarantee: no-op if no TracerProvider configured
   - **Streaming**: createReadableStream
   - **Upstream**: readUpstreamConfig, resolveUpstreams, buildInheritedContextBlock, buildSessionDisplay
   - **Skills**: loadSkills, readSkill, writeSkill
   - Final glossary table of all exports

**Tone applied:**
- No hype — each API presented matter-of-factly with code examples
- Every export grounded in actual source code (verified against packages/squad-sdk/src/index.ts)
- OTel 3-layer structure explained with zero-overhead guarantee (prevents unfounded adoption fears)
- Migration guide balances pragmatism (automated rename) with honest troubleshooting (what can go wrong)
- CLI install guide emphasizes resolution and decision-making (which method when) rather than prescriptiveness
- SquadUI guide warns against common mistakes (process.exit crash, importing CLI) with concrete fixes
- Architecture guide uses diagrams and module maps (not narrative prose) for clarity
- All five guides cross-reference each other (Next Steps sections)

**Process:**
- Read actual source: packages/squad-sdk/src/index.ts (all exports), src/runtime/otel*.ts, src/tools/index.ts, src/agents/, src/coordinator/, src/upstream/
- Verified CLI structure: packages/squad-cli/src/cli-entry.ts, cli/commands/, cli/shell/
- Verified casting: packages/squad-sdk/src/casting/casting-engine.ts, casting-history.ts
- Verified adapter: packages/squad-sdk/src/adapter/types.ts, client.ts
- Verified upstream: packages/squad-sdk/src/upstream/resolver.ts, types.ts
- Checked history.md for prior tone decisions (ALWAYS: no hype, no unsubstantiated claims)
- All code examples use actual API signatures (not invented)
- Glossaries and index sections for cross-referencing

**Notes:**
- All five guides marked "⚠️ INTERNAL ONLY" per v1 policy (no published docs site)
- Architecture guide serves as central reference; other guides link back to it
- Migration guide is safety-first: backup, validate, rollback instructions
- CLI install guide clarifies confusing resolution behavior (global vs. npx vs. GitHub)
- SquadUI guide prevents costly mistakes (extension crashes, wrong import paths)
- SDK API reference is exhaustive (every export from index.ts) and grouped by domain
- OTel reference emphasizes 3-layer structure matching Issue #266 decision
- No screenshots or videos (text-only for internal review)
- Troubleshooting sections in migration, CLI, and SquadUI guides address real failure modes from beta feedback
