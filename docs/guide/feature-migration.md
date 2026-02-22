# Feature Migration Guide

> **⚠️ INTERNAL ONLY — DO NOT PUBLISH**

**Issue:** #37 (M3-14)

---

## Overview

This guide covers migrating from beta Squad features to their SDK-native equivalents: casting, skills, response tiers, the coordinator, streaming, and legacy fallback.

## Casting

Beta casting was implicit — agents were assigned to work by naming them in markdown. In v1, `CastingEngine` provides explicit team assembly:

```typescript
import { CastingEngine } from '@squad/sdk';

const engine = new CastingEngine(config.agents);
const cast = engine.assemble({
  universe: 'usual-suspects',
  task: 'Build the payment API',
});
// Returns CastMember[] with roles, models, and tool assignments
```

`CastingHistory` tracks past assemblies. `CastingRegistry` supports multiple universes (`usual-suspects`, `oceans-eleven`, `custom`) with pluggable agent sources.

## Skills

Skills moved from inline markdown to structured `SkillDefinition` objects:

```typescript
import { SkillRegistry, loadSkillsFromDirectory } from '@squad/sdk';

const registry = new SkillRegistry();
const skills = await loadSkillsFromDirectory('.squad/skills');
skills.forEach(s => registry.register(s));

const matches = registry.match({ keywords: ['auth'], role: 'backend' });
// Returns SkillMatch[] with score (0–1) and reason
```

`SkillSourceRegistry` supports `LocalSkillSource` and `GitHubSkillSource` with priority ordering.

## Response Tiers

The coordinator now classifies requests into four tiers before spawning agents:

| Tier | When | What happens |
|------|------|-------------|
| `direct` | Factual lookups, status | Coordinator answers immediately |
| `lightweight` | Simple tasks | Single agent, fast model |
| `standard` | Normal work | Single agent, full model |
| `full` | Complex/parallel | Multiple agents via `spawnParallel()` |

`selectResponseTier()` auto-classifies. Override with routing config: `{ tier: 'direct' }`.

## Coordinator

`Coordinator` replaces the beta routing table with compiled dispatch. Messages flow through: `matchRoute()` → `selectResponseTier()` → `HookPipeline` → agent spawn/direct response. `RoutingDecision` carries targets, tier, and parallelism flag.

## Streaming

`StreamingPipeline` handles real-time agent output:

```typescript
pipeline.onDelta((event: StreamDelta) => process.stdout.write(event.content));
pipeline.onUsage((event: UsageEvent) => costTracker.record(event));
pipeline.onReasoning((event: ReasoningDelta) => log(event));
```

`CostTracker` aggregates per-agent and per-session costs. `UsageSummary` provides totals.

## Legacy Fallback

`migrateMarkdownToConfig()` converts `.squad/` files to typed config. `parseTeamMarkdown()` and `parseRoutingMarkdown()` handle configuration formats. `MigrationRegistry` chains versioned transforms (v0.4 → v0.5 → v0.6). The system ensures `.squad/` is the standard directory for team state.
