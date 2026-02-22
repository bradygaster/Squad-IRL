# SquadUI v2 Integration: Type Mapping Corrections

> **Objective:** Communicate 4 type mapping errors found in SquadUI's v2 proposal before they build adapters on wrong shapes. This prevents costly integration refactors and alignment delays.

> **Scope:** Type corrections only. Architecture is separate.

---

## 1. Type Mapping Errors

### Error 1: `SkillDefinition` Shape Mismatch

**SquadUI Proposal Shows:**
```typescript
{ name, description, triggers, requiredTools }
```

**Actual Type (v0.6.x):**

From `src/skills/skill-loader.ts`:

```typescript
export interface SkillDefinition {
  /** Unique identifier (derived from directory name) */
  id: string;
  /** Human-readable name */
  name: string;
  /** Knowledge domain */
  domain: string;
  /** Markdown content body */
  content: string;
  /** Keyword patterns that trigger this skill */
  triggers: string[];
  /** Agent roles that have affinity for this skill */
  agentRoles: string[];
}
```

**What's Different:**
- ✅ `name`, `triggers` exist
- ❌ `description` does NOT exist (use `content` — the full markdown body)
- ❌ `requiredTools` does NOT exist (use `agentRoles` — roles with affinity for this skill)
- ✅ **NEW FIELDS:** `id` (from directory name), `domain` (knowledge domain), `content` (full body)

**Migration Path:** Adapter must map proposal's `requiredTools` to `agentRoles` and `description` to the body of `content`.

---

### Error 2: `ParsedCharter` Structure is Nested, Not Flat

**SquadUI Proposal Shows:**
```typescript
{ name, role, expertise, style, owns, voice }
```

**Actual Type (v0.6.x):**

From `src/agents/charter-compiler.ts`:

```typescript
export interface ParsedCharter {
  /** Identity section: name, role, expertise, style */
  identity: {
    name?: string;
    role?: string;
    expertise?: string[];
    style?: string;
  };
  /** What I Own section content */
  ownership?: string;
  /** Boundaries section content */
  boundaries?: string;
  /** Model preference from ## Model section */
  modelPreference?: string;
  /** Collaboration section content */
  collaboration?: string;
  /** Full charter content */
  fullContent: string;
}
```

**What's Different:**
- ✅ `name`, `role`, `expertise`, `style` exist — but they're NESTED under `identity` object
- ❌ `owns` and `voice` don't exist; replace with `ownership` (What I Own section) and `collaboration` (Collaboration section)
- ✅ **NEW STRUCTURE:** Top-level fields include `boundaries`, `modelPreference`, `collaboration`, `fullContent`
- ❌ **Shapes are very different** — proposal assumes flat object; actual type is nested

**Migration Path:** Adapter must access charter identity fields via `parsedCharter.identity.name`, `parsedCharter.identity.role`, etc. Map proposal's `owns` → `ownership`, `voice` → `collaboration`.

---

### Error 3: `RoutingConfig` Missing Fields

**SquadUI Proposal Shows:**
```typescript
{ rules, defaultAgent }
```

**Actual Runtime Type (v0.6.x):**

From `src/runtime/config.ts`:

```typescript
export interface RoutingConfig {
  /** Work type → agent routing rules */
  rules: RoutingRule[];
  
  /** Issue label → routing rules */
  issueRouting?: IssueRoutingRule[];
  
  /** @copilot capability evaluation */
  copilotEvaluation?: CopilotCapabilityEvaluation;
  
  /** Routing governance rules */
  governance?: {
    eagerByDefault?: boolean;
    scribeAutoRuns?: boolean;
    allowRecursiveSpawn?: boolean;
    [key: string]: unknown;
  };
}
```

**And `RoutingRule` structure:**

```typescript
export interface RoutingRule {
  /** Work type identifier */
  workType: WorkType;
  
  /** Agent(s) to route this work to */
  agents: string[];
  
  /** Examples to help LLM understand this work type */
  examples?: string[];
  
  /** Confidence level for LLM self-assessment */
  confidence?: 'high' | 'medium' | 'low';
}
```

**What's Different:**
- ✅ `rules` exists
- ❌ `defaultAgent` does NOT exist; use `fallbackAgent` (but it's in `CopilotCapabilityEvaluation`, not at top level)
- ✅ **NEW FIELDS AT TOP LEVEL:** `issueRouting` (label-based routing), `governance` (eagerByDefault, scribeAutoRuns, allowRecursiveSpawn), `copilotEvaluation`
- ⚠️ **CRITICAL:** Proposal shows `pattern` in routing rules; actual type uses `workType` (string, not regex)

**RoutingRule Structure in Proposal:**
Assumed `{ pattern, agents }` — does NOT match actual `{ workType, agents, examples?, confidence? }`

**Migration Path:** 
1. Map proposal's `defaultAgent` to `copilotEvaluation.fallbackAgent`
2. Change `pattern` → `workType` (literal string, not a regex pattern)
3. Add `examples` and `confidence` if available from proposal
4. Populate `issueRouting` array if any label-based rules exist

---

### Error 4: `parseDecisionsMarkdown()` Return Type

**SquadUI Proposal Shows:**
```typescript
ParsedDecision[]
```

**Actual Return Type (v0.6.x):**

From `src/config/markdown-migration.ts`:

```typescript
export function parseDecisionsMarkdown(
  content: string,
): { decisions: ParsedDecision[]; warnings: string[] } {
  // ...
  return { decisions, warnings };
}
```

**What's Different:**
- ❌ Does NOT return `ParsedDecision[]` directly
- ✅ Returns an object: `{ decisions: ParsedDecision[]; warnings: string[] }`

**`ParsedDecision` Type:**

```typescript
export interface ParsedDecision {
  /** Decision title */
  title: string;
  /** Decision body / description */
  body: string;
  /** Whether this decision affects configuration */
  configRelevant: boolean;
  /** ISO 8601 date extracted from heading (e.g. "2026-02-21") */
  date?: string;
  /** Author extracted from **By:** lines */
  author?: string;
  /** Heading depth (2 for ##, 3 for ###) */
  headingLevel?: number;
}
```

**Migration Path:** Destructure the result: `const { decisions, warnings } = parseDecisionsMarkdown(content)`. Warnings capture parsing issues; decisions is the array you need.

---

## 2. Architectural Clarifications

### Two Routing Parsers — Which Do You Need?

**Parser 1: `parseRoutingRulesMarkdown()`**
- **Location:** `src/config/markdown-migration.ts`
- **Purpose:** Parse `.squad/routing.md` files into structured rules
- **Returns:** `{ rules: ParsedRoutingRule[]; warnings: string[] }`
- **Use Case:** Migrating from markdown-based routing to typed config
- **Rule Shape:** `ParsedRoutingRule = { workType: string; agents: string[]; examples?: string[] }`

**Parser 2: `parseRoutingMarkdown()`**
- **Location:** `src/config/routing.ts`
- **Purpose:** Parse routing.md and compile into a high-speed `CompiledRouter`
- **Returns:** `RoutingConfig` (the full configuration object)
- **Use Case:** Runtime routing with compiled regex patterns
- **Rule Shape:** `CompiledWorkTypeRule = { workType, agents, patterns (RegExp[]), examples, confidence, priority }`

**Action for SquadUI:**
Clarify which parser your adapter consumes. If you're migrating from markdown → typed config, use Parser 1. If you're consuming the runtime config directly, use Parser 2.

---

### Orchestration Log Parsing is Out of Scope

The SDK does **not** provide parsing for `OrchestrationLogService` output. SquadUI must maintain that independently.

- **What you get:** `CompiledRouter` for work-type matching
- **What you don't get:** Log parsing, audit trails, execution traces
- **Plan:** Build `OrchestrationLogService` parsing on your side; it's not part of the SDK contract

---

### CLI Function Imports Require `cli-entry.ts` Split

This is now complete (v0.6.0-alpha.0+). CLI functions are safe to import into VS Code extension hosts because:

1. **Before:** `src/index.ts` imported CLI code directly → process.exit() calls → crashed extension host
2. **After:** `src/cli-entry.ts` holds CLI-only logic; `src/index.ts` is library-safe

**For SquadUI Extensions:**
- ✅ Import SDK functions from `@bradygaster/squad` (the main export)
- ❌ Do NOT import from `dist/cli-entry.js` (CLI-only bundle)
- ✅ Safe functions: `parseDecisionsMarkdown()`, `parseRoutingRulesMarkdown()`, `compileCharter()`, skill loader functions

---

## 3. Correct Type Shapes (v0.6.x Snapshot)

### `SkillDefinition`
```typescript
export interface SkillDefinition {
  id: string;
  name: string;
  domain: string;
  content: string;
  triggers: string[];
  agentRoles: string[];
}
```

### `ParsedCharter`
```typescript
export interface ParsedCharter {
  identity: {
    name?: string;
    role?: string;
    expertise?: string[];
    style?: string;
  };
  ownership?: string;
  boundaries?: string;
  modelPreference?: string;
  collaboration?: string;
  fullContent: string;
}
```

### `RoutingConfig`
```typescript
export interface RoutingConfig {
  rules: RoutingRule[];
  issueRouting?: IssueRoutingRule[];
  copilotEvaluation?: CopilotCapabilityEvaluation;
  governance?: {
    eagerByDefault?: boolean;
    scribeAutoRuns?: boolean;
    allowRecursiveSpawn?: boolean;
    [key: string]: unknown;
  };
}

export interface RoutingRule {
  workType: WorkType;
  agents: string[];
  examples?: string[];
  confidence?: 'high' | 'medium' | 'low';
}
```

### `ParsedDecision`
```typescript
export interface ParsedDecision {
  title: string;
  body: string;
  configRelevant: boolean;
  date?: string;
  author?: string;
  headingLevel?: number;
}
```

---

## 4. SDK Type Exports (Public API)

All types are exported from `@bradygaster/squad` and safe to consume in adapters and extensions.

**From `src/types.ts` (the public barrel):**

- **Parsed Types:** `ParsedAgent`, `ParsedRoutingRule`, `ParsedDecision`, `MarkdownParseResult`, `MarkdownMigrationOptions`, `MarkdownMigrationResult`
- **Charter Types:** `ParsedCharter`, `CharterCompileOptions`, `CharterConfigOverrides`, `CompiledCharter`
- **Routing Types:** `CompiledRouter`, `CompiledWorkTypeRule`, `CompiledIssueRule`, `RoutingMatch`
- **Skill Types:** `SkillDefinition`
- **Config Types:** `SquadConfig`, `RoutingConfig`, `RoutingRule`, `IssueRoutingRule`, `ModelSelectionConfig`, `ModelTier`, `ModelId`, `WorkType`, `AgentRole`, `TaskOutputType`, `TaskToModelRule`, `RoleToModelMapping`, `ComplexityAdjustment`, `CastingPolicy`, `AgentSourceConfig`, `PlatformOverrides`, `CopilotCapabilityEvaluation`, `ConfigLoadResult`, `ConfigValidationError`
- **Adapter Types:** `SquadSessionConfig`, `SquadCustomAgentConfig`

**Note:** These are type-only exports (using `export type`). Zero runtime code imported.

---

## Summary: What to Update in Your Adapter

| Proposal Assumption | Correct Reality | Action |
|---|---|---|
| `SkillDefinition.description` | `SkillDefinition.content` (full markdown body) | Map description → content |
| `SkillDefinition.requiredTools` | `SkillDefinition.agentRoles` | Map requiredTools → agentRoles |
| `ParsedCharter` flat object | `ParsedCharter.identity` nested object | Access via `charter.identity.name`, etc. |
| `ParsedCharter.owns` | `ParsedCharter.ownership` | Rename field |
| `ParsedCharter.voice` | `ParsedCharter.collaboration` | Rename field |
| `RoutingConfig.defaultAgent` | `RoutingConfig.copilotEvaluation.fallbackAgent` | Move under copilotEvaluation |
| `RoutingRule.pattern` | `RoutingRule.workType` (literal string) | Use workType, not regex pattern |
| `parseDecisionsMarkdown()` returns `ParsedDecision[]` | Returns `{ decisions: ParsedDecision[]; warnings: string[] }` | Destructure: `const { decisions } = ...` |

---

## References

- Type definitions: `src/skills/skill-loader.ts`, `src/agents/charter-compiler.ts`, `src/runtime/config.ts`, `src/config/markdown-migration.ts`, `src/config/routing.ts`
- Exported types: `src/types.ts`
- CLI safety: `src/cli-entry.ts` (isolated from `src/index.ts`)
- Related issue: #231 (SquadUI v2 integration alignment)

---

## Questions?

Contact the Squad SDK team. These corrections ensure SquadUI adapters are built on correct type assumptions from day one.
