# Operational Runbooks

> **⚠️ INTERNAL ONLY — DO NOT PUBLISH**

**Issue:** #43 (M6-5)

---

## Overview

Runbooks for troubleshooting common Squad SDK issues, enabling debug mode, analyzing logs, and recovering from failures.

---

## Runbook 1: Connection Failures

**Symptom:** `SDKConnectionError` thrown on `client.connect()`.

**Steps:**
1. Check that the Copilot SDK is running and accessible on the configured port
2. Verify auth token: `process.env.COPILOT_TOKEN` must be set
3. Check `SquadConnectionState` — if stuck in `reconnecting`, the backoff may have maxed out
4. Enable debug mode (see below) to see connection attempts
5. Check `HealthMonitor` results: `healthy | degraded | unhealthy`

**Recovery:**
```typescript
client.on('error', (err) => {
  if (err instanceof SDKConnectionError) {
    // Client auto-reconnects with exponential backoff
    // If persistent, check network/auth
  }
});
```

---

## Runbook 2: Agent Spawn Failures

**Symptom:** Agent stuck in `spawning` state, never reaches `active`.

**Steps:**
1. Check `AgentLifecycleManager` state for the agent
2. Verify the agent's charter compiles: `compileCharter(charter)` should not throw
3. Check `SessionPool` — may be at `maxConcurrent` limit
4. Verify model availability: `isModelAvailable(agentConfig.model)`
5. Check `HookPipeline` — a pre-hook may be blocking the spawn

**Recovery:**
```typescript
const manager = new AgentLifecycleManager(pool, config);
const state = manager.getAgentState(agentId);
if (state === 'error') {
  await manager.destroy(agentId);
  await manager.spawn(agentId, options); // retry
}
```

---

## Runbook 3: Routing Mismatches

**Symptom:** Messages routed to wrong agent or falling through to default.

**Steps:**
1. Check compiled routing rules: `compileRoutingRules(config.routing)`
2. Test specific messages: `matchRoute(compiledRules, message)`
3. Verify regex patterns — use `matchRoute()` with debug logging
4. Check `ResponseTier` — message may be classified as `direct` (no agent)
5. Check `matchIssueLabels()` if using label-based routing

**Recovery:** Update routing patterns in `squad.config.ts` and reload:
```typescript
const config = await loadConfig();
const rules = compileRoutingRules(config.routing);
const decision = matchRoute(rules, 'test message');
console.log(decision); // inspect targets, tier, parallelism
```

---

## Runbook 4: Configuration Errors

**Symptom:** `ConfigurationError` on startup.

**Steps:**
1. Read the error message — it includes the exact field and reason
2. Run `validateConfig(config)` to get all validation errors at once
3. Check `ModelRegistry` — model names must match the catalog
4. Verify `defineConfig()` merges correctly with `DEFAULT_CONFIG`
5. For migration issues, run `detectDrift()` to find doc/config mismatches

---

## Enabling Debug Mode

Set the environment variable to enable verbose logging:

```bash
SQUAD_DEBUG=1 node your-app.js
```

Debug mode enables:
- Connection attempt logging with timing
- Routing decision traces (input → compiled rules → decision)
- Hook pipeline execution logs (pre/post, allow/block/modify)
- Session pool state changes
- `TelemetryCollector` output to stderr

## Log Analysis

Key log patterns to search for:

| Pattern | Meaning |
|---------|---------|
| `[SquadClient] reconnecting` | Connection lost, backoff in progress |
| `[Coordinator] tier=direct` | Message answered without agent spawn |
| `[HookPipeline] blocked` | A policy hook blocked a tool call |
| `[SessionPool] idle-reap` | Idle session destroyed |
| `[AgentLifecycle] state=error` | Agent entered error state |

## Recovery Procedures

### Full Reset
```typescript
// Destroy all sessions and reinitialize
await squad.destroyAll();
const freshConfig = await loadConfig();
squad.reconfigure(freshConfig);
```

### Cache Clear
```typescript
// Clear agent and skill caches
agentCache.clear();
skillCache.clear();
```

### Migration Rollback
Use `.squad/` as your primary directory for all team state. Ensure `squad.config.ts` is in sync with your team configuration.
