# Migration Guide — v0.5.1 → v0.6.0

> ⚠️ **Experimental** — Squad is alpha software. APIs, commands, and behavior may change between releases.


> **⚠️ INTERNAL ONLY — DO NOT PUBLISH**

**Issue:** #41 (M6-2)

---

## Overview

This guide provides concrete steps to migrate a Squad project from v0.5.1 (markdown-based beta) to v0.6.0 (typed SDK). The migration preserves your team configuration, routing rules, and agent definitions while moving to the new runtime.

## Prerequisites

- Node.js ≥ 20.0.0
- Existing Squad project with `.squad/` directory
- Back up your project before migrating

## Step 1: Install the SDK

```bash
npm install @squad/sdk@0.6.0
```

## Step 2: Generate Typed Config from Markdown

Run the automated migration to convert `.squad/` files:

```typescript
import { migrateMarkdownToConfig } from '@squad/sdk';

const config = await migrateMarkdownToConfig('.squad/');
// Writes squad.config.ts to project root
```

This calls `parseTeamMarkdown()` on `team.md`, `parseRoutingMarkdown()` on `routing.md`, and `generateConfigFromParsed()` to assemble the result. Review the generated `squad.config.ts` for correctness.

## Step 3: Migrate Agent Docs

Agent markdown files (`.squad/agents/*.md`) become structured agent config entries. `parseAgentDoc()` extracts metadata from each file:

```typescript
import { parseAgentDoc, syncDocToConfig } from '@squad/sdk';

const agentMeta = parseAgentDoc(agentMarkdown);
const updatedConfig = syncDocToConfig(agentMeta, config);
```

Verify agent names, models, and tool assignments in the generated config.

## Step 4: Migrate Routing Rules

Beta routing tables become compiled routing rules:

```typescript
// Before (routing.md):
// | Pattern | Agent | Priority |
// |---------|-------|----------|
// | API     | backend | high   |

// After (squad.config.ts):
routing: {
  workTypes: [
    { pattern: /\bAPI\b/i, targets: ['backend'], tier: 'standard' },
  ],
}
```

## Step 5: Update Model References

v0.6.0 uses `ModelRegistry` with a catalog of 17 models. Check that your model names match the catalog:

```typescript
import { isModelAvailable, getModelInfo } from '@squad/sdk';

if (!isModelAvailable('your-model-name')) {
  const info = getModelInfo('claude-sonnet-4'); // use catalog name
}
```

## Step 6: Run Version Migrations

`MigrationRegistry` handles chained version transforms:

```typescript
import { MigrationRegistry } from '@squad/sdk';

const registry = new MigrationRegistry();
// Registered migrations: v0.4→v0.5, v0.5→v0.6
const migrated = await registry.migrate(config, '0.5.1', '0.6.0');
```

## Step 7: Validate Configuration

```typescript
import { loadConfig } from '@squad/sdk';

const result = await loadConfig();
// Throws ConfigurationError with actionable messages if invalid
```

## Step 8: Update Directory Structure

```
# Before (v0.5.1)         # After (v0.6.0)
.squad/                    (standard directory)
  team.md                    agents/
  routing.md                 skills/
  agents/                  squad.config.ts
    backend.md
```

The `.squad/` directory is the standard location. Use `detectDrift()` to check for config/doc mismatches.

## Step 9: Verify

```bash
npm run build   # TypeScript compiles without errors
npm test        # All tests pass
```

## Breaking Changes

| v0.5.1 | v0.6.0 | Action |
|--------|--------|--------|
| `.squad/team.md` | `squad.config.ts` → `team` | Standardized |
| `.squad/routing.md` | `squad.config.ts` → `routing` | Standardized |
| Implicit model selection | `resolveModel()` 4-layer priority | Review model config |
| No response tiers | `ResponseTier` system | New behavior — review routing |
| No hook pipeline | `HookPipeline` with 5 policies | Opt-in, but review defaults |
