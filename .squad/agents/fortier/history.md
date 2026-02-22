# Project Context

- **Owner:** Brady
- **Project:** squad-sdk — the programmable multi-agent runtime for GitHub Copilot (v1 replatform)
- **Stack:** TypeScript (strict mode, ESM-only), Node.js ≥20, @github/copilot-sdk, Vitest, esbuild
- **Created:** 2026-02-21

## Learnings

### From Beta (carried forward)
- Event-driven over polling: always prefer event-based patterns
- Streaming-first: async iterators over buffers — this is a core design principle
- Graceful degradation: if one session dies, others survive
- Node.js ≥20: use modern APIs (structuredClone, crypto.randomUUID, fetch, etc.)
- ESM-only: no CJS shims, no dual-package hazards
- Cost tracking and telemetry: runtime performance is a feature, not an afterthought

### Issue #239: StreamingPipeline Bridge + Console Renderer
- **StreamBridge** (`src/cli/shell/stream-bridge.ts`): Callback-based bridge connecting `StreamingPipeline` events to shell rendering. Accumulates `message_delta` chunks in per-session buffers, dispatches `usage` and `reasoning_delta` events to optional callbacks, and `flush()` finalizes buffered content into `ShellMessage` objects while updating `SessionRegistry` status.
- **ShellRenderer** (`src/cli/shell/render.ts`): Pre-ink console renderer using `process.stdout.write()` for streaming deltas and `console.log()` for complete messages. Tracks current agent to avoid redundant headers during contiguous streaming from the same agent.
- **Design pattern**: The bridge is event-sink only — it receives `StreamingEvent` from the pipeline but does not subscribe itself. The caller (shell entry point) is responsible for wiring `pipeline.onDelta()` → `bridge.handleEvent()`. This keeps the bridge testable without a live pipeline.
- **Key type alignment**: `StreamingEvent` is a union of `StreamDelta | UsageEvent | ReasoningDelta` — no `stream_end` or `stream_error` variants exist. Stream completion is signaled externally via `flush()`.

### Issue #240: Shell Session Lifecycle Management
- **ShellLifecycle** (`src/cli/shell/lifecycle.ts`): Manages the full shell session lifecycle — initialization, message history tracking, state transitions, and graceful shutdown.
- **Initialization**: Verifies `.squad/` exists at `teamRoot`, reads `team.md`, parses the Members markdown table to discover agents (name, role, charter path, status). Registers all `Active` agents in `SessionRegistry`.
- **Message history**: Tracks user, agent, and system messages with timestamps. Supports filtering by agent name. State object always gets a shallow copy of the history array (immutable external view).
- **Team manifest parsing**: `parseTeamManifest()` is a local function that extracts agent rows from the `## Members` markdown table. Handles emoji-prefixed status fields (e.g. "✅ Active" → "Active").
- **State machine**: `initializing` → `ready` (on success) or `error` (on missing `.squad/` or `team.md`). Shutdown transitions back through `initializing` while clearing all state.
- **PR**: #287

### 📌 Team update (2026-02-22T08:50:00Z): Runtime EventBus as canonical bus for orchestration classes — decided by Fortier
runtime/event-bus.ts (colon-notation: session:created, subscribe() API, error isolation) is canonical for orchestration classes. client/event-bus.ts (dot-notation, on() API) remains for backward-compat but shouldn't be used in new code. Coordinator and RalphMonitor now import from runtime/event-bus. All new EventBus consumers follow this pattern.

### Coordinator + Ralph Runtime Stubs
- **Coordinator** (`src/coordinator/index.ts`): Legacy Coordinator class fully implemented — constructor accepts optional `CoordinatorDeps` (client, eventBus, agentManager, hookPipeline, toolRegistry), `initialize()` subscribes to lifecycle events via RuntimeEventBus, `route()` classifies messages by tier (direct/standard/full), `execute()` emits `coordinator:routing` events, `shutdown()` unsubscribes and nulls references.
- **RalphMonitor** (`src/ralph/index.ts`): Event-driven work monitor — `start()` subscribes to session lifecycle + milestone events, `handleEvent()` maintains per-agent work status map, `healthCheck()` flags stale sessions beyond configurable threshold (default 5min), `stop()` persists state to JSON file if `statePath` configured.
- **EventBus import alignment**: Both Coordinator and Ralph switched from `client/event-bus.js` (dot-notation types, no error isolation) to `runtime/event-bus.js` (colon-notation types, `executeHandler()` with try/catch). This aligns with SquadCoordinator tests pattern.
- **CastingRegistry.load()**: Implemented `registry.json` parsing — reads from `castingDir/registry.json`, populates entries map by role.
- **Key pattern**: All EventBus subscriptions return unsubscribe functions stored in `unsubscribers[]` array. Shutdown iterates and calls them all — no dangling listeners.

### Issue #255 + #256: OTel Provider Init & Bridge
- **otel.ts** (`src/runtime/otel.ts`): Full OTel provider initialization using `@opentelemetry/sdk-node`'s `NodeSDK`. Exposes `initializeTracing()`, `initializeMetrics()`, `initializeOTel()`, `shutdownOTel()`, `getTracer()`, `getMeter()`. Config priority: explicit config → `OTEL_EXPORTER_OTLP_ENDPOINT` env var → disabled (no-op). Uses `NodeSDK` as unified provider manager to avoid OTel sub-package version skew.
- **otel-bridge.ts** (`src/runtime/otel-bridge.ts`): `createOTelTransport()` returns a `TelemetryTransport` function that converts `TelemetryEvent` instances to OTel spans. Maps all five event types (`squad.init`, `squad.agent.spawn`, `squad.error`, `squad.run`, `squad.upgrade`) to named spans. Error events get `SpanStatusCode.ERROR` + exception event. Bridge is additive — existing transport pipeline untouched.
- **OTel version skew**: The OTel npm ecosystem has pervasive version fragmentation between `sdk-trace-base`, `sdk-trace-node`, `sdk-metrics`, and `resources`. Using `NodeSDK` from `@opentelemetry/sdk-node` and re-exporting its bundled `Resource` and `PeriodicExportingMetricReader` avoids type conflicts. Do NOT install `@opentelemetry/sdk-trace-base`, `@opentelemetry/sdk-metrics`, or `@opentelemetry/resources` as direct deps — let `sdk-node` manage them.
- **Resource attributes**: `service.name` (hardcoded string, not `ATTR_SERVICE_NAME` — avoids `@opentelemetry/semantic-conventions` version issues) and `squad.version` (read from package.json via `createRequire`).

### Issues #259 + #264: Session Traces + Response Latency Metrics
- **SquadClient.sendMessage()** (`src/adapter/client.ts`): New method wrapping `session.sendMessage()` with `squad.session.message` parent span and `squad.session.stream` child span. Stream span emits `first_token`, `last_token`, `stream_error` events and records `tokens.input`, `tokens.output`, `duration_ms` attributes. Temporary event listeners on the session track first delta and usage data, cleaned up in `finally`.
- **SquadClient.closeSession()** (`src/adapter/client.ts`): Traced alias for `deleteSession` — creates a `squad.session.close` span wrapping the existing delete span. Provides semantic clarity for callers closing sessions vs deleting them.
- **StreamingPipeline latency wiring** (`src/runtime/streaming.ts`): `markMessageStart(sessionId)` records a high-res timestamp. On first `message_delta` with `index === 0`, calls `recordTimeToFirstToken()`. On `usage` event, calls `recordResponseDuration()` and `recordTokensPerSecond()` (output tokens / elapsed * 1000). Tracking state auto-cleans after usage event. `clear()` resets tracking maps.
- **Design decision**: Latency tracking is opt-in via `markMessageStart()` — pipeline doesn't assume a send happened. This keeps the pipeline testable without mocking timers and avoids coupling to SquadClient.
- **Tests**: 15 new tests in `test/session-traces.test.ts` covering sendMessage span creation, closeSession alias, TTFT recording, duration recording, tokens/sec calculation, and cleanup semantics.

### 📌 Team update (2026-02-22T093300Z): OTel Phase 2 complete — session traces, latency metrics, tool enhancements, agent metrics, token usage wiring, metrics tests — decided by Fortier, Fenster, Edie, Hockney
All four agents shipped Phase 2 in parallel: Fortier wired TTFT/duration/throughput metrics. Fenster established tool trace patterns and agent metric wiring conventions. Edie wired token usage and session pool metrics. Hockney created spy-meter test pattern (39 new tests). Total: 1940 tests passing, metrics ready for production telemetry.
