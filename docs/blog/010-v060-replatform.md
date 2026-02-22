# v0.6.0: The Replatform — From Markdown to Typed Config

> **⚠️ INTERNAL ONLY — DO NOT PUBLISH**

**Milestone:** M6 · **Issue:** #53 (M6-15)
**Date:** Sprint 6

---

## Why We Rebuilt

Beta Squad proved the concept: AI teams coordinated through markdown files, routing tables parsed from text, agent capabilities described in prose. It worked. Teams shipped real products with it. But as adoption grew, the limitations became clear.

Markdown is expressive but untyped. A misspelled role name silently breaks routing. A missing field in `team.md` fails at runtime, not at edit time. There's no autocomplete, no refactoring support, no way to catch errors before they reach production. Beta Squad traded developer experience for simplicity — and that trade stopped being worth it.

v0.6.0 is the replatform: same capabilities, typed foundation.

## What Changed

### Typed Configuration

`squad.config.ts` and `.squad/` directory work together as the source of truth. `defineConfig()` provides a Vite-style API with full TypeScript inference. `SquadConfig`, `AgentConfig`, `RoutingConfig`, `ModelConfig`, and `HooksConfig` give every setting a type, a default, and editor support.

### SDK Adapter

`SquadClient` wraps `@github/copilot-sdk` with lifecycle management, auto-reconnection, and structured errors. The adapter layer means Squad never calls the SDK directly — every interaction flows through typed interfaces that we control and can evolve independently.

### Agent Lifecycle

`AgentLifecycleManager` replaces ad-hoc agent spawning with a state machine: `pending → spawning → active → idle → destroyed`. Idle reaping reclaims resources automatically. `SessionPool` enforces concurrency limits with health checks.

### Coordinator

The new `Coordinator` owns the full request lifecycle — intake, routing, agent selection, execution, response assembly. Routing decisions that were embedded in prompts are now deterministic code paths. Response tiers (`direct`, `lightweight`, `standard`, `full`) let the coordinator choose the right delivery mode per request.

### Skills System

`SkillRegistry` loads domain knowledge on demand through `SKILL.md` files matched by keyword triggers and role affinity. Context pressure drops because agents only carry the knowledge relevant to each task.

### Distribution Pipeline

`BundleBuilder`, `NpmPackageBuilder`, `GitHubDistBuilder`, and `CiPipelineBuilder` handle the full build → package → ship pipeline. The `squad upgrade` CLI supports version pinning and release channels.

### Marketplace

Export, import, browse, install, publish — with seven security rules that gate every agent entering the ecosystem. Conflict resolution, offline mode, and cache management round out the sharing story.

## What Stayed the Same

The mental model is unchanged. You still define agents with roles and expertise. You still route work by type and label. You still use the same five built-in tools. Teams can use `migrateMarkdownToConfig()` to manage configuration changes as Squad evolves.

## By the Numbers

| Metric | Value |
|--------|-------|
| Milestones | 6 (M0–M5) |
| Work items closed | 80+ |
| Tests passing | 1,400+ |
| Source modules | 15 |
| API surface exports | 150+ |
| Feature parity with beta | 100% |
| Migration path | Automated + legacy fallback |

## The Foundation

v0.6.0 isn't the destination — it's the foundation. Typed config means we can build tooling: linters, generators, IDE extensions. The marketplace schema means community agents can be shared safely. The adapter layer means we can track SDK changes without breaking consumer code.

Everything that comes next — marketplace GA, multi-model intelligence, enterprise features — builds on this typed, tested, extensible runtime.
