# Architecture Overview

> **⚠️ INTERNAL ONLY — DO NOT PUBLISH**

Squad is a programmable multi-agent runtime for GitHub Copilot. This guide explains how the SDK, CLI, and SquadUI fit together, what each package provides, and how they orchestrate AI agent teams.

## System Architecture

Squad has three layers:

1. **SDK** — Core runtime (`@bradygaster/squad-sdk`): agents, casting, routing, tools, OTel observability
2. **CLI** — Command-line interface (`@bradygaster/squad-cli`): shell, commands, Ink UI
3. **SquadUI** — VS Code extension client: spawns agents via the SDK's runSubagent interface

```
┌─────────────────────────────────────────────────────────┐
│                   GitHub Copilot                        │
│                   (VS Code / CLI)                       │
└────────────────────┬────────────────────────────────────┘
                     │ Input: user request
                     │ Output: agent responses
                     │
        ┌────────────▼────────────┐
        │                         │
    ┌──▼────────────┐    ┌───────┴──────┐
    │  CLI Shell    │    │  SquadUI     │
    │ (@bradygaster/│    │ (VS Code ext)│
    │  squad-cli)   │    │              │
    └──┬────────────┘    └───────┬──────┘
       │                         │
       │ CLI commands            │ runSubagent API
       │ (init, upgrade, watch)  │
       │                         │
       └────────────┬────────────┘
                    │
       ┌────────────▼────────────────────┐
       │   Squad SDK Runtime             │
       │ (@bradygaster/squad-sdk)        │
       │                                 │
       │  ┌─────────────────────────┐   │
       │  │ Agent Coordination      │   │
       │  │ - Charter compiler      │   │
       │  │ - Casting engine        │   │
       │  │ - Router & response tiers│  │
       │  └─────────────────────────┘   │
       │                                 │
       │  ┌─────────────────────────┐   │
       │  │ Tools & Skills          │   │
       │  │ - squad_route           │   │
       │  │ - squad_decide          │   │
       │  │ - squad_memory          │   │
       │  │ - Custom tools          │   │
       │  └─────────────────────────┘   │
       │                                 │
       │  ┌─────────────────────────┐   │
       │  │ Observability (OTel)    │   │
       │  │ - Traces → Aspire       │   │
       │  │ - Metrics               │   │
       │  │ - Event bus             │   │
       │  └─────────────────────────┘   │
       │                                 │
       │  ┌─────────────────────────┐   │
       │  │ Upstream Inheritance    │   │
       │  │ - Skills sharing        │   │
       │  │ - Decision propagation  │   │
       │  └─────────────────────────┘   │
       └────────────────────────────────┘
                    │
                    │ GitHub Copilot SDK
                    │ (.agent/.tool definitions)
                    │
        ┌───────────▼────────────┐
        │  GitHub Copilot API    │
        │  (Agent execution)     │
        └────────────────────────┘
```

## Package Boundaries

### Squad SDK (`@bradygaster/squad-sdk`)

The core runtime. **Zero side effects** — safe to import as a library.

**Exports** (from `src/index.ts`):

| Domain | Module | Purpose |
|--------|--------|---------|
| **Resolution** | `resolution.ts` | `resolveSquad()`, `resolveGlobalSquadPath()` — find .squad directories |
| **Runtime Constants** | `runtime/constants.ts` | Models, timeouts, agent roles |
| **Config** | `config/*.ts` | `loadConfig()`, schema validation, routing, agent sources |
| **Agents** | `agents/onboarding.ts` | `onboardAgent()` — runtime agent creation |
| **Casting** | `casting/index.ts` | `CastingEngine`, `CastingHistory` — persona generation |
| **Coordinator** | `coordinator/index.ts` | `SquadCoordinator`, `selectResponseTier()`, fan-out, direct response |
| **Tools** | `tools/index.ts` | `defineTool()`, `ToolRegistry` — squad_route, squad_decide, squad_memory, squad_status, squad_skill |
| **Skills** | `skills/index.ts` | Skill loading and management |
| **Streaming** | `runtime/streaming.ts` | Text streaming for agent output |
| **Cost Tracking** | `runtime/cost-tracker.ts` | Token usage and cost estimation |
| **Telemetry** | `runtime/telemetry.ts` | Event recording and transport |
| **Offline Mode** | `runtime/offline.ts` | Graceful degradation without network |
| **i18n** | `runtime/i18n.ts` | Localization support |
| **Benchmarks** | `runtime/benchmarks.ts` | Performance measurement utilities |
| **OTel** | `runtime/otel*.ts` | 3-layer observability API (see below) |
| **Marketplace** | `marketplace/index.ts` | Plugin registry |
| **Build** | `build/index.ts` | Compilation utilities |
| **Sharing** | `sharing/index.ts` | Squad export/import |
| **Upstream** | `upstream/index.ts` | Inheritance resolution |

### Squad CLI (`@bradygaster/squad-cli`)

Command-line interface. Entry point: `dist/cli-entry.js` (not in SDK's public API).

**Structure:**
- `src/cli-entry.ts` — Entry point, CLI argument parsing
- `src/cli/commands/` — Command handlers (init, upgrade, status, watch, plugin, export, import, scrub-emails)
- `src/cli/shell/` — Interactive shell (spawn, input processing, Ink UI)
- `src/cli/core/` — Utilities (errors, output formatting, filesystem)

**How it connects to SDK:**
1. Imports SDK public API from `@bradygaster/squad-sdk`
2. Uses `resolveSquad()`, `loadConfig()`, `SquadCoordinator` to manage teams
3. Spawns agents via the Copilot SDK's agent framework
4. Emits telemetry and events that SDK consumers can observe

### SquadUI (VS Code Extension)

External client that integrates Squad via:
- **runSubagent API** — Request SDK to spawn an agent
- **Client compatibility** — Works in both CLI and VS Code modes
- **Types** — Consumes types from SDK (agent roles, casting records, responses)

SquadUI does NOT directly import the SDK. Instead, it:
1. Invokes squad CLI commands
2. Calls the Copilot SDK agent framework
3. Receives events/telemetry via standard channels (stdout, event bus)

## Module Map

### Core Agent Runtime

```
agents/
├── charter-compiler.ts     — Parse charter.md → typed AgentCharter
├── onboarding.ts          — Create agent directory + charter + history at runtime
├── model-selector.ts      — Pick best model for agent role
├── lifecycle.ts           — Agent session lifecycle and state management
└── history-shadow.ts      — Maintain agent learning history
```

**Key types:**
- `AgentCharter` — Parsed charter with identity, knowledge, tools
- `AgentSessionManager` — Lifecycle and state
- `OnboardOptions` / `OnboardResult` — Onboarding parameters and results

### Casting System

```
casting/
├── casting-engine.ts       — Generate agent personas from universe themes
├── casting-history.ts      — Track casting decisions over time
└── universes/              — Built-in universes (The Wire, Seinfeld, etc.)
```

**Key types:**
- `CastingEngine` — Core casting logic
- `CastMember` — Typed agent persona (name, role, universe)
- `CastingHistory` — Mutable record of all past castings

### Routing & Coordination

```
coordinator/
├── coordinator.ts          — Central orchestration engine
├── routing.ts              — Pattern-based work routing
├── direct-response.ts      — Status/info queries (no agent needed)
├── response-tiers.ts       — Complexity-based tier selection
└── fan-out.ts              — Parallel agent spawning
```

**Key types:**
- `SquadCoordinator` — Routes messages to agents
- `RoutingDecision` — Tier, target agents, parallel flag
- `ResponseTier` — 'direct', 'lightweight', 'standard', 'full'

### Tools & Hooks

```
tools/
├── index.ts                — Squad's 5 built-in tools
├── defineTool()            — Tool definition helper
└── ToolRegistry            — Tool management and lookup

hooks/
├── hook-pipeline.ts        — Middleware pattern for agent lifecycle
└── hook-registry.ts        — Register hooks by event type
```

**Built-in tools:**
- `squad_route` — Spawn work in another agent
- `squad_decide` — Write decisions to inbox
- `squad_memory` — Append to agent history
- `squad_status` — Query session pool state
- `squad_skill` — Read/write agent skills

### Configuration & Parsing

```
config/
├── schema.ts               — Zod schemas for config validation
├── init.ts                 — Default config generation
├── routing.ts              — Parse routing.md → RoutingRules
├── markdown-migration.ts   — Legacy config migration
├── models.ts               — ModelRegistry catalog
└── agent-source.ts         — Source override resolution (env, flag, file)

parsers.ts                  — All markdown parsers (re-exported)
```

### Upstream Inheritance

```
upstream/
├── resolver.ts             — Read and resolve upstream.json
├── types.ts                — UpstreamSource, UpstreamResolution
└── cli.ts                  — CLI commands (add, remove, list, sync)
```

**Resolution order:** Org → Team → Repo → Local

### Adapter Layer

```
adapter/
├── client.ts               — SquadClient abstraction
├── types.ts                — SquadTool, SquadToolResult, SquadEvent
└── errors.ts               — Error handling patterns
```

Abstracts the Copilot SDK so coordinators don't depend on it directly.

### Runtime Services

```
runtime/
├── event-bus.ts            — Central event dispatcher
├── session-pool.ts         — Agent session management
├── otel.ts                 — Low-level OTel initialization (TracerProvider, MeterProvider)
├── otel-bridge.ts          — Mid-level EventBus → OTel spans
├── otel-init.ts            — High-level one-call setup (initSquadTelemetry)
├── otel-metrics.ts         — Metric definitions
├── telemetry.ts            — Event-based telemetry collection
├── streaming.ts            — Text stream handling
├── cost-tracker.ts         — Token usage tracking
├── offline.ts              — Offline mode fallbacks
├── i18n.ts                 — Localization
├── benchmarks.ts           — Performance measurement
├── config.ts               — Configuration loading (loadConfig, loadConfigSync)
├── health.ts               — Health checks
├── constants.ts            — MODELS, TIMEOUTS, AGENT_ROLES
├── squad-observer.ts       — File change monitoring
└── streaming.ts            — Streaming response handling
```

## OTel Observability Pipeline

Squad exports a **3-layer OpenTelemetry API** for observability:

### Layer 1: Low-Level Control

```typescript
import { initializeOTel, shutdownOTel, getTracer, getMeter } from '@bradygaster/squad-sdk';

// Direct control of OTel providers
initializeOTel({ endpoint: 'http://localhost:4318' });
const tracer = getTracer('my-app');
const span = tracer.startSpan('my-work');
// ...
await shutdownOTel();
```

**Exports:** `initializeOTel()`, `shutdownOTel()`, `getTracer()`, `getMeter()`, `OTelConfig` type

### Layer 2: Mid-Level Bridge

```typescript
import { bridgeEventBusToOTel, createOTelTransport } from '@bradygaster/squad-sdk';

// Wire EventBus → OTel spans automatically
bridgeEventBusToOTel(eventBus);

// Or wire TelemetryCollector → OTel transport
const transport = createOTelTransport();
setTelemetryTransport(transport);
```

**Exports:** `bridgeEventBusToOTel()`, `createOTelTransport()`

### Layer 3: High-Level Convenience

```typescript
import { initSquadTelemetry } from '@bradygaster/squad-sdk';

// One-call setup with lifecycle handle
const telemetry = await initSquadTelemetry({
  endpoint: 'http://localhost:4318',
  eventBus: myEventBus,
  installTransport: true, // default
});

// Later: graceful shutdown
await telemetry.shutdown();
```

**Exports:** `initSquadTelemetry()`, `SquadTelemetryOptions`, `SquadTelemetryHandle`

### Trace Flow

```
User Agent Work
    ↓
SDK spans via tracer.startSpan()
    ↓
EventBus events (if bridged)
    ↓
OTel TelemetryTransport
    ↓
OTLPTraceExporter (HTTP)
    ↓
Aspire Dashboard (localhost:18888)
```

**Zero overhead:** If no `TracerProvider` is configured, all `@opentelemetry/api` calls return no-op implementations. Squad instrumentation becomes zero-cost function calls.

## Execution Flow: From User Input to Agent Response

### CLI Shell Execution

1. User types in `squad` shell
2. `runShell()` captures input
3. CLI calls `SquadCoordinator.route(message)` → `RoutingDecision`
4. Coordinator emits `coordinator:routing` event (EventBus)
5. `SquadClient` spawns agent session(s) via Copilot SDK
6. Agent runs within its charter context
7. Agent can call `squad_route`, `squad_decide`, `squad_memory`, `squad_skill` tools
8. Response streams back via `streaming.ts` utilities
9. Telemetry captured (OTel, EventBus, cost tracker)

### SquadUI Execution

1. User opens VS Code command palette
2. Selects Squad agent
3. VS Code extension calls SquadUI.runSubagent()
4. SDK spawns agent with charter context
5. Agent executes and returns response
6. VS Code displays result in editor/panel

### Key Integration Points

- **CLI imports SDK**: `import { SquadCoordinator, loadConfig, resolveSquad } from '@bradygaster/squad-sdk'`
- **SDK imports Copilot SDK**: `import { ... } from '@github/copilot-sdk'` (internal, not re-exported)
- **SquadUI imports SDK types**: `import type { CastMember, AgentCharter } from '@bradygaster/squad-sdk'`
- **Telemetry flows outward**: EventBus → OTel → OTLP → Aspire Dashboard

## Development Workflow

### Adding a New CLI Command

1. Create `src/cli/commands/{name}.ts`
2. Export handler function
3. Call from `cli-entry.ts` based on argument parsing
4. Handler uses SDK public API (loadConfig, resolveSquad, etc.)

### Adding a New Tool

1. Define tool in `tools/index.ts` using `defineTool()`
2. Register in `ToolRegistry.registerSquadTools()`
3. Export type and handler
4. SDK consumers can query available tools via `toolRegistry.getTools()`

### Adding SDK Export

1. Implement in appropriate module (e.g., `config/`, `agents/`, `tools/`)
2. Add to `src/index.ts` barrel export
3. Update type declarations if public API
4. Test that it's tree-shakeable (not re-exported from other exports)

## Glossary

| Term | Definition |
|------|-----------|
| **Charter** | Agent identity, expertise, tools, and knowledge (parsed from charter.md) |
| **Cast** | Runtime persona assignment (character name + universe) |
| **Router** | Maps user messages to agents via patterns or agent mentions |
| **Response Tier** | Complexity level: direct (0 agents), lightweight, standard, full (multi-agent) |
| **Tool** | Callable function available to agents (squad_route, squad_decide, etc.) |
| **Upstream** | External Squad source (local, git, or export) for knowledge inheritance |
| **EventBus** | Central pub/sub for lifecycle and telemetry events |
| **OTel** | OpenTelemetry — structured observability (traces, metrics) |
| **Aspire** | Microsoft orchestration and observability dashboard (displays OTel traces) |
