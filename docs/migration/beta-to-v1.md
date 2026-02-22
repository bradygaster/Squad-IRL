# Migration Guide: Squad Beta → v1

> **⚠️ INTERNAL ONLY — DO NOT PUBLISH**
>
> This guide is a work-in-progress stub. Sections marked TODO depend on M3–M6 completion.

## Overview

Squad v1 replaces the markdown-convention-based beta with a typed TypeScript runtime. This guide covers the major changes and how to migrate existing Squad teams.

## Major Changes

| Area | Beta | v1 |
|------|------|----|
| Configuration | `.squad/team.md` (markdown) | `squad.config.ts` (typed TypeScript) |
| Team directory | `.squad/` | `.squad/` |
| Agent files | `agents/{name}/agent.md` | `agents/{name}/charter.md` |
| Routing | `routing.md` (markdown table) | `routing` section in `squad.config.ts` |
| Decisions | `.squad/decisions/inbox/` | TODO: M3+ decision system |
| Model selection | Implicit / per-agent prompt | Explicit 4-layer resolution in config |
| Tools | Prompt-based conventions | `ToolRegistry` with typed schemas |
| Hooks/policies | None | `HookPipeline` with 5 built-in policies |

## Step-by-Step Migration

### 1. Install the SDK

```bash
npm install @bradygaster/squad
```

### 2. Auto-Migrate Markdown Config

Use the built-in markdown migration to convert your squad files:

```ts
import { migrateMarkdownToConfig } from '@bradygaster/squad';

const result = migrateMarkdownToConfig({
  teamRoot: '.squad',
  // parses team.md, routing.md, and decisions/
});
// result.config is a typed SquadConfig
```

The migration uses three parsers:
- `parseTeamMarkdown()` — Extracts team name, agents, and roles from `team.md`
- `parseRoutingRulesMarkdown()` — Converts routing table from `routing.md`
- `parseDecisionsMarkdown()` — Reads decision records from `decisions/`

Then `generateConfigFromParsed()` assembles the typed `SquadConfig`.

### 3. Create squad.config.ts

```ts
import { defineConfig } from '@bradygaster/squad';

export default defineConfig({
  team: {
    name: 'my-team',
    root: '.squad',
  },
  agents: {
    // migrated from team.md agent entries
  },
  routing: {
    // migrated from routing.md
  },
  models: {
    // explicit model preferences (optional)
  },
});
```

### 4. Rename Directory Structure

```
.squad/                  (standard directory)
  agents/NAME/agent.md   →  agents/NAME/charter.md
  routing.md             →  (routing section in squad.config.ts)
  team.md                →  (team section in squad.config.ts)
  decisions/             →  TODO: M3+ decision system
```

### 5. Update Agent Charters

Agent charters in v1 are compiled by `compileCharter()` into `CompiledCharter` objects. The markdown format is similar but adds structured sections:

- **Identity** — Name, role, expertise
- **Model preference** — Explicit model or tier
- **Boundaries** — Owned paths, restricted paths
- **Collaboration** — Which agents this agent works with

TODO: Document exact charter.md format changes (M3+)

### 6. Configure Model Selection

v1 uses 4-layer model resolution. You can set preferences at multiple levels:

1. **Per-request** — User override in the request
2. **Per-agent** — Model preference in charter.md
3. **Per-task-type** — Automatic selection based on task type (code/docs/planning/etc.)
4. **Default** — Fallback through tier chains (premium → standard → fast)

TODO: Document model config examples (M4+)

## Migration Registry API

The `MigrationRegistry` from M2-7 manages versioned config transformations:

```ts
import { MigrationRegistry, parseSemVer } from '@bradygaster/squad';

const registry = new MigrationRegistry();

// Register a migration
registry.register({
  from: parseSemVer('0.3.0'),
  to: parseSemVer('0.4.0'),
  transform: (config) => {
    // transform config shape
    return updatedConfig;
  },
});

// Execute migration chain (automatically chains intermediate versions)
const result = registry.migrate(oldConfig, '0.3.0', '0.6.0');
// result.config — migrated config
// result.steps — list of migrations applied
```

The registry:
- Automatically builds migration chains between any two versions
- Uses `parseSemVer()` and `compareSemVer()` for version ordering
- Returns a `MigrationResult` with the transformed config and applied steps

## Doc-Sync: Keeping Markdown and Config in Sync

After migration, v1 supports bidirectional sync between markdown docs and typed config:

- `syncDocToConfig()` — Merges changes from agent markdown into config
- `syncConfigToDoc()` — Regenerates agent markdown from config
- `detectDrift()` — Reports mismatches between the two

This means teams can continue editing agent docs in markdown while the runtime uses typed config.

## TODO — Pending M3–M6

- [ ] CLI migration command (`squad migrate`)
- [ ] Interactive migration wizard
- [ ] Decision system migration
- [ ] Ceremony/standup migration
- [ ] Plugin system migration
- [ ] Full charter.md format specification
- [ ] Model config cookbook with examples
- [ ] Rollback/undo support
