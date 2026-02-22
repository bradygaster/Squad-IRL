# Squad SDK v1 — Module Map

> **⚠️ INTERNAL ONLY — DO NOT PUBLISH**

## Source Layout

```
src/
├── index.ts              CLI entry point & public exports
├── adapter/              SDK wrapper layer
├── client/               Connection pooling & events
├── runtime/              Config loader, event bus, health
├── config/               Typed configuration system
├── agents/               Charter, lifecycle, onboarding
├── coordinator/          Fan-out orchestration
├── hooks/                Policy enforcement
├── tools/                Squad tool registry
├── casting/              Agent casting (discovery/selection)
└── ralph/                (internal/experimental)
```

## Module Details

### `src/adapter/` — SDK Wrapper Layer

| File | Exports | Purpose |
|------|---------|---------|
| `client.ts` | `SquadClient`, `SquadConnectionState`, `SquadClientOptions` | Wraps Copilot SDK with reconnection and lifecycle |
| `errors.ts` | `SquadError`, `ErrorFactory`, `TelemetryCollector`, 9 error classes | Structured error hierarchy with severity and recoverability |
| `types.ts` | `SquadSession`, `SquadTool`, `SquadSessionHooks`, etc. | Shared type definitions for the adapter boundary |

### `src/client/` — Connection Pooling

| File | Exports | Purpose |
|------|---------|---------|
| `session-pool.ts` | `SessionPool`, `SessionStatus`, `SessionPoolConfig` | Bounded concurrent session management |
| `event-bus.ts` | `EventBus`, `SquadEvent`, `SquadEventType` | Pub/sub for session lifecycle events |
| `index.ts` | `SquadClientWithPool` | Composes SquadClient + SessionPool + EventBus |

### `src/runtime/` — Runtime Services

| File | Exports | Purpose |
|------|---------|---------|
| `config.ts` | `loadConfig`, `loadConfigSync`, `validateConfig`, `discoverConfigFile` | Config file discovery, loading, and validation |
| `event-bus.ts` | `EventBus` (enhanced) | Lifecycle and operational events for coordinator |
| `health.ts` | `HealthMonitor`, `HealthCheckResult` | Periodic connection health checks |

### `src/config/` — Typed Configuration

| File | Exports | Purpose |
|------|---------|---------|
| `schema.ts` | `SquadConfig`, `defineConfig`, `validateConfig`, `DEFAULT_CONFIG` | Root config interface and builder |
| `models.ts` | `ModelRegistry`, `MODEL_CATALOG`, `DEFAULT_FALLBACK_CHAINS` | 17-model catalog with tier/provider indexing |
| `routing.ts` | `compileRoutingRules`, `matchRoute`, `parseRoutingMarkdown` | Declarative routing rules engine |
| `agent-source.ts` | `LocalAgentSource`, `GitHubAgentSource`, `AgentRegistry` | Agent discovery from local/remote sources |
| `agent-doc.ts` | `parseAgentDoc`, `AgentDocMetadata` | Parses .agent.md files into structured metadata |
| `doc-sync.ts` | `syncDocToConfig`, `syncConfigToDoc`, `detectDrift` | Bidirectional markdown↔config synchronization |
| `init.ts` | `initSquad`, `InitOptions`, `InitResult` | Project scaffolding |
| `migration.ts` | `MigrationRegistry`, `parseSemVer`, `compareSemVer` | Semver-based config migration chains |
| `markdown-migration.ts` | `migrateMarkdownToConfig`, `parseTeamMarkdown` | Legacy .squad/ → typed config converter |

### `src/agents/` — Agent Management

| File | Exports | Purpose |
|------|---------|---------|
| `index.ts` | `AgentCharter`, `AgentSessionManager`, barrel re-exports | Module root with core interfaces |
| `charter-compiler.ts` | `compileCharter`, `compileCharterFull`, `parseCharterMarkdown` | Charter.md → compiled agent config |
| `model-selector.ts` | `resolveModel`, `TaskType`, `ModelTier`, `ResolvedModel` | 4-layer priority model resolution |
| `lifecycle.ts` | `AgentLifecycleManager`, `AgentHandle`, `AgentStatus` | Full agent spawn→destroy lifecycle |
| `onboarding.ts` | `onboardAgent`, `addAgentToConfig` | Creates agent dirs, charters, and config entries |
| `history-shadow.ts` | `createHistoryShadow`, `appendToHistory`, `readHistory` | Agent history management |

### `src/coordinator/` — Fan-Out Orchestration

| File | Exports | Purpose |
|------|---------|---------|
| `index.ts` | `Coordinator`, `RoutingDecision`, `ResponseTier` | Central orchestrator for agent sessions |
| `fan-out.ts` | `spawnParallel`, `aggregateSessionEvents`, `SpawnResult` | Parallel agent spawning with error isolation |

### `src/hooks/` — Policy Enforcement

| File | Exports | Purpose |
|------|---------|---------|
| `index.ts` | `HookPipeline`, `ReviewerLockoutHook`, `PolicyConfig` | Pre/post tool-use hooks with 5 built-in policies |

### `src/tools/` — Squad Tool Registry

| File | Exports | Purpose |
|------|---------|---------|
| `index.ts` | `ToolRegistry`, `defineTool`, 5 tool interfaces | Typed tool definitions with JSON schema validation |

### `src/casting/` — Agent Casting

| File | Exports | Purpose |
|------|---------|---------|
| `index.ts` | *(casting logic)* | Agent discovery and selection for task assignment |
