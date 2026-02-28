# Custom Tools & Hooks Guide

> ⚠️ **Experimental** — Squad is alpha software. APIs, commands, and behavior may change between releases.


**Issue:** #35 (M1-13)

---

## Overview

Squad ships with 5 built-in tools and a hook pipeline for policy enforcement. This guide covers extending both.

## ToolRegistry API

`ToolRegistry` manages tool definitions. Each tool has a name, JSON schema, and async handler:

```typescript
import { ToolRegistry, defineTool } from '@squad/sdk';

const registry = new ToolRegistry();

const myTool = defineTool({
  name: 'search-docs',
  description: 'Search internal documentation',
  schema: {
    type: 'object',
    properties: {
      query: { type: 'string', description: 'Search query' },
    },
    required: ['query'],
  },
  handler: async (params) => {
    const results = await searchIndex(params.query);
    return { success: true, data: results };
  },
});

registry.register(myTool);
```

The handler returns a `ToolResult` with `success` flag and `data` payload. Built-in tools include: `route` (dispatch to another agent), `decision` (record a team decision), `memory` (agent history), `status` (session pool query), and `skill` (read/write skills).

## HookPipeline

`HookPipeline` intercepts tool calls at two points: before execution (`PreToolUseHook`) and after (`PostToolUseHook`). Hooks return a `HookAction`: `allow`, `block`, or `modify`.

```typescript
import { HookPipeline, PreToolUseHook } from '@squad/sdk';

const auditHook: PreToolUseHook = async (toolName, params, context) => {
  console.log(`Agent ${context.agentId} calling ${toolName}`);
  return { action: 'allow' };
};

const pipeline = new HookPipeline();
pipeline.addPreHook(auditHook);
```

## Writing Custom Hooks

Custom hooks receive the tool name, parameters, and agent context. Use them for logging, validation, or transformation:

```typescript
const sanitizeHook: PreToolUseHook = async (toolName, params, context) => {
  if (toolName === 'shell' && params.command.includes('rm -rf')) {
    return { action: 'block', reason: 'Destructive command blocked' };
  }
  return { action: 'allow' };
};
```

Post-tool hooks inspect results and can trigger follow-up actions like notifications or audit logging.

## Built-in Policies

Squad ships 5 policies configured via `PolicyConfig`:

1. **ReviewerLockoutHook** — Agents cannot edit files they are reviewing
2. **File guards** — Restrict write access to sensitive paths
3. **Shell restrictions** — Block dangerous shell commands
4. **Rate limits** — Cap tool invocations per agent per interval
5. **PII filters** — Redact sensitive data before model calls

Configure policies in `squad.config.ts` under the `hooks` key:

```typescript
export default defineConfig({
  hooks: {
    fileGuards: [{ pattern: /\.env/, action: 'block' }],
    shellRestrictions: { allowList: ['git', 'npm', 'node'] },
    rateLimits: { maxCallsPerMinute: 30 },
  },
});
```
