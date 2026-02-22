# M3: Feature Parity — Coordinator, Casting, Skills, Streaming

> **⚠️ INTERNAL ONLY — DO NOT PUBLISH**

**Milestone:** M3 · **Work Items:** 13 · **Tests:** 937 (cumulative, 131 parity+compat)
**Date:** Sprint 3

---

## What We Built

M3 closes the feature gap between beta Squad and the v1 SDK. Every runtime capability that existed in the markdown-driven coordinator now has a typed, tested equivalent. The pipeline works end-to-end: cast a team, route a task, stream the response, track the cost.

### Coordinator Replatform

The new `Coordinator` replaces markdown-driven dispatch with a typed orchestration layer. It owns the full request lifecycle — intake, routing, agent selection, execution, and response assembly. Routing decisions that were previously embedded in the agent prompt are now explicit code paths with deterministic behavior.

### Casting Engine — Three Universes

`CastingEngine` builds teams from three agent universes: **usual-suspects** (curated defaults), **marketplace** (community agents), and **custom** (user-defined). `castTeam()` accepts a `CastingConfig`, resolves agents from the selected universe, validates compatibility, and returns a `CastResult` with the assembled roster. Casting history is recorded to enable audit and replay.

### Skills System

`SkillRegistry` provides composable capabilities that agents can declare and the coordinator can query. Skills are matched to tasks during routing, letting the coordinator prefer agents whose skill set aligns with the request. This replaces the implicit "this agent's prompt mentions testing" heuristic with structured metadata.

### Response Tiers & Direct Response Handler

Three response tiers — **streaming**, **buffered**, and **direct** — let the coordinator choose the right delivery mode per request. The `DirectResponseHandler` handles simple queries that don't need agent orchestration, returning answers immediately without spawning an agent process.

### Model Fallback Executor

`ModelFallbackExecutor` wraps model invocation with automatic retry across the fallback chain. If the primary model is unavailable or errors, execution cascades through the configured fallback sequence. Each attempt is logged for observability.

### Streaming Pipeline

`StreamingPipeline` delivers incremental output with typed events: `chunk`, `status`, `tool-call`, `cost`, and `done`. Consumers subscribe to event types selectively. The pipeline integrates with the cost tracker so streaming responses include running cost data — streaming observability was a top request from beta users.

### Cost Tracker

`CostTracker` records token usage and estimated cost per model invocation. It aggregates across a session and exposes `getCostSummary()` for the coordinator to include in responses. Cost data flows through the streaming pipeline as `cost` events.

### Migration Finalization & Legacy Fallback

The migration system from M2 is finalized with end-to-end chain validation. Squad uses `.squad/` as the standard directory for all team state, ensuring consistent configuration across projects.

### Feature Audit & Parity Tests

A systematic audit compared every beta capability against the v1 implementation. The result: 131 parity and compatibility tests that assert behavioral equivalence. These tests run in CI alongside the full suite to prevent regressions.

## Key Decisions

| Decision | Rationale |
|----------|-----------|
| Typed coordinator over prompt dispatch | Deterministic routing; testable without LLM calls |
| Three casting universes | Extensible team composition without monolithic config |
| Streaming cost events | Users see spend in real time, not after the fact |
| Legacy fallback as first-class path | Zero-friction migration; beta projects just work |
| 131 parity tests | Behavioral contract between beta and v1 |

## Test Coverage

937 cumulative tests across the full pipeline. 131 are dedicated parity and compatibility tests verifying behavioral equivalence with beta Squad. Major additions: coordinator lifecycle, casting across all three universes, skill matching, response tier selection, model fallback chains, streaming event delivery, cost aggregation, migration chain finalization, legacy fallback routing, and casting history persistence.
