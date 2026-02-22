# Frequently Asked Questions

> **⚠️ INTERNAL ONLY — DO NOT PUBLISH**

**Issue:** #45 (M6-8)

---

## Installation

### 1. What are the minimum requirements?
Node.js ≥ 20.0.0 and npm ≥ 9. TypeScript ≥ 5.0 is required for typed config files (`squad.config.ts`).

### 2. How do I install Squad SDK?
```bash
npm install @squad/sdk
```
For global CLI access: `npm install -g @squad/sdk`. For one-shot use: `npx @squad/sdk init my-squad`.

### 3. Can I use Squad without TypeScript?
Yes. Use `squad.config.json` instead of `squad.config.ts`. You lose type inference and editor autocomplete, but `loadConfig()` supports both formats. `loadConfigSync()` is available for synchronous loading.

## Configuration

### 4. Where does Squad look for configuration?
`loadConfig()` walks up the directory tree from `cwd` looking for `squad.config.ts` or `squad.config.json`. Use `discoverConfigFile()` to find the config file path without loading it.

### 5. What does `defineConfig()` do?
It merges your partial config with `DEFAULT_CONFIG`, providing TypeScript inference. It's the recommended way to author `squad.config.ts`:
```typescript
import { defineConfig } from '@squad/sdk';
export default defineConfig({ team: { name: 'my-squad' } });
```

### 6. How do I validate my config?
`loadConfig()` validates automatically. For manual validation, use `validateConfig(config)`. Invalid fields throw `ConfigurationError` with the exact field name and reason.

## Routing

### 7. How does message routing work?
The `Coordinator` evaluates compiled routing rules (`compileRoutingRules()`) against incoming messages. `matchRoute()` returns a `RoutingDecision` with target agents, response tier, and parallelism flag.

### 8. What are response tiers?
Four levels: **direct** (coordinator answers, no agent), **lightweight** (single agent, fast model), **standard** (single agent, full model), **full** (multiple agents in parallel). `selectResponseTier()` classifies messages automatically.

### 9. Can I route based on GitHub issue labels?
Yes. Configure `routing.issueLabels` in your config and use `matchIssueLabels()`:
```typescript
routing: {
  issueLabels: [{ labels: ['bug', 'backend'], targets: ['backend'] }],
}
```

## Agents

### 10. How do I add a new agent?
Use `onboardAgent()` to create the agent directory, charter, and history. Then add the agent to config with `addAgentToConfig()`. Or define it directly in `squad.config.ts` under the `agents` key.

### 11. What is a charter?
An agent charter is a markdown document defining identity, expertise, tools, and model preferences. `compileCharter()` transforms it into a `CompiledCharter` with resolved model references and validated tool lists.

### 12. How does model selection work?
`resolveModel()` applies 4-layer priority: user override → charter preference → task-based auto-selection → config default. The `ModelRegistry` provides fallback chains per tier.

### 13. What happens when an agent is idle?
`AgentLifecycleManager` runs idle reaping on a configurable interval. Idle agents transition from `active → idle → destroyed`, freeing `SessionPool` slots.

## Marketplace

### 14. How do I publish an agent to the marketplace?
Package your project with `packageForMarketplace()`, validate with `validatePackageContents()`, generate a manifest with `generateManifest()`, then publish via `MarketplaceBackend.publish()`.

### 15. How are marketplace agents validated for security?
`validateRemoteAgent()` runs 7 security rules checking for prompt injection, excessive permissions, suspicious tool patterns, and more. `SecurityReport` includes a `riskScore`. Agents that fail critical rules are blocked; `quarantineAgent()` sanitizes them.

### 16. Can I cache marketplace agents locally?
Yes. `AgentCache` provides TTL-based caching. Agent definitions cache for 1 hour (`DEFAULT_AGENT_TTL`); skills for 5 minutes (`DEFAULT_SKILL_TTL`). `CacheStats` tracks hit/miss ratios.

## Migration

### 17. How do I migrate from beta (v0.5.1)?
Use `migrateMarkdownToConfig('.squad/')` to auto-convert markdown config to typed `squad.config.ts`. See the [Migration Guide](./migration-guide-v051-v060.md) for step-by-step instructions.

### 18. Can I use the `.squad/` directory?
Yes. The system uses `.squad/` as the standard. `detectDrift()` reports mismatches between config and documentation.

### 19. What breaks when upgrading?
Key changes: config moves from markdown to TypeScript, model selection uses 4-layer priority, response tiers are new, and `HookPipeline` enforces policies by default. See the [Migration Guide](./migration-guide-v051-v060.md) breaking changes table.

## Troubleshooting

### 20. How do I enable debug mode?
Set `SQUAD_DEBUG=1` in your environment. This enables verbose logging for connections, routing decisions, hook execution, and session pool state.

### 21. My agent is stuck in "spawning" state. What do I do?
Check `SessionPool` capacity (`maxConcurrent`), verify the charter compiles (`compileCharter()`), confirm the model is available (`isModelAvailable()`), and check `HookPipeline` for blocking policies. See the [Operational Runbooks](./operational-runbooks.md) for detailed steps.
