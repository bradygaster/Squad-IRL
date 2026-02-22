# SquadUI Integration Guide

> **⚠️ INTERNAL ONLY — DO NOT PUBLISH**

This guide explains how Squad works in VS Code (SquadUI), what extension developers need to know, and how the SDK adapts behavior based on the client context.

## How Squad Works in VS Code

### User Interaction Flow

```
User opens VS Code
    ↓
Opens Squad agent panel (SquadUI extension)
    ↓
Selects agent or team
    ↓
SquadUI calls SDK: runSubagent({ agentName, task, context })
    ↓
SDK spawns agent session via Copilot SDK
    ↓
Agent executes within VS Code editor context
    ↓
Agent can:
  - Read open files (via SDK file APIs)
  - Insert code snippets
  - Suggest refactors
  - Post comments
    ↓
Response streams back to VS Code panel
    ↓
User can accept, reject, or iterate
```

## Client Compatibility: CLI Mode vs. VS Code Mode

Squad adapts its behavior based on which client is running it:

### CLI Mode (User runs `squad` command)

```typescript
// Environment
process.env.SQUAD_CLIENT = 'cli'        // OR: not set (defaults to CLI)
process.env.TERM = 'xterm-256color'     // Terminal available

// What's available
- Interactive shell (Ink UI)
- Full filesystem access
- stdin/stdout streaming
- Process exit control
```

**SDK behavior in CLI mode:**
- Interactive prompts for choices
- Streaming output to stdout
- Can call `process.exit()`
- Full file read/write

### VS Code Mode (User opens SquadUI extension)

```typescript
// Environment
process.env.SQUAD_CLIENT = 'vscode'     // Set by SquadUI
process.env.TERM = undefined            // No terminal

// What's available
- VS Code editor context
- Open file list
- Selection/cursor position
- Editor commands (insert, replace, etc.)
```

**SDK behavior in VS Code mode:**
- No interactive prompts
- Structured responses (JSON-like)
- **Never calls `process.exit()`** (would crash extension)
- File operations scoped to editor context

## Extension Developer Checklist

### 1. Detect Client Mode

Before calling Squad APIs, check which client you're running in:

```typescript
// In SquadUI extension code
const isVSCodeMode = process.env.SQUAD_CLIENT === 'vscode';

if (!isVSCodeMode) {
  console.warn('SquadUI should only run in VS Code');
  return;
}
```

### 2. Import SDK Safely

**DO:** Import specific types and functions
```typescript
import type { CastMember, AgentCharter } from '@bradygaster/squad-sdk';
import { loadConfig, resolveSquad } from '@bradygaster/squad-sdk';
```

**DON'T:** Import the CLI entry point
```typescript
// WRONG: This will call process.exit() and crash your extension
import { main } from '@bradygaster/squad-cli/dist/cli-entry.js';
```

### 3. Load Squad Configuration Safely

```typescript
import { loadConfig, resolveSquad } from '@bradygaster/squad-sdk';

try {
  const squadPath = resolveSquad(workspaceRoot);
  const config = await loadConfig(squadPath);
  
  console.log('Squad loaded:', config.team.name);
} catch (err) {
  // Handle gracefully — Squad may not be initialized
  console.warn('Squad not found:', err.message);
  return;
}
```

### 4. Call Agents (SDK Pattern)

Once config is loaded, spawn agents:

```typescript
import { SquadCoordinator } from '@bradygaster/squad-sdk';

const coordinator = new SquadCoordinator({
  teamRoot: squadPath,
});

await coordinator.initialize();

// Route user task to an agent
const decision = await coordinator.route('refactor this function');
// decision.agents: ['lead'] or ['backend', 'tester']
// decision.tier: 'direct' | 'standard' | 'full'

await coordinator.execute(decision, 'refactor this function');
```

### 5. Stream Responses

Responses can be long. Use streaming:

```typescript
import { startStreaming } from '@bradygaster/squad-sdk';

const stream = await startStreaming(agentResponse);

for await (const chunk of stream) {
  vscodePanel.append(chunk);  // Incremental UI update
}
```

### 6. Handle Errors Gracefully

**DO:**
```typescript
try {
  const result = await coordinator.route(userTask);
} catch (err) {
  vscode.window.showErrorMessage(`Squad error: ${err.message}`);
  telemetry.recordException(err);
}
```

**DON'T:**
```typescript
// WRONG: Never call process.exit() in an extension
if (error) process.exit(1);  // Crashes VS Code!

// WRONG: Never throw unhandled errors
throw new Error('something failed');  // Unhandled promise rejection
```

### 7. Respect User Context

Pass editor context to agents:

```typescript
const editor = vscode.window.activeTextEditor;

const decision = await coordinator.route(userTask, {
  fileContent: editor.document.getText(),
  fileName: editor.document.fileName,
  selection: editor.selection,
  language: editor.document.languageId,
});
```

This lets agents see what you're editing and provide relevant suggestions.

## API Reference for Extension Developers

### Core Types

```typescript
// Agent persona
interface CastMember {
  name: string;
  role: string;
  universe: string;
  displayName: string;
}

// Agent configuration
interface AgentCharter {
  identity: {
    name: string;
    role: string;
    expertise: string;
    style: string;
  };
  knowledge: string;
  tools: string[];
  collaboration: string;
}

// Routing decision
interface RoutingDecision {
  tier: 'direct' | 'lightweight' | 'standard' | 'full';
  agents: string[];
  parallel: boolean;
  rationale: string;
}

// Configuration
interface ConfigLoadResult {
  team: { name: string; root: string; description?: string };
  agents?: Record<string, AgentConfig>;
  routing?: RoutingRules;
  models?: ModelConfig;
}
```

### Key Functions

```typescript
// Resolve squad location
export function resolveSquad(startPath?: string): string;
export function resolveGlobalSquadPath(): string;

// Load configuration
export async function loadConfig(squadPath: string): Promise<ConfigLoadResult>;
export function loadConfigSync(squadPath: string): ConfigLoadResult;

// Routing
export async function route(message: string): Promise<RoutingDecision>;

// Response tier selection
export function selectResponseTier(context: TierContext): TierName;

// Streaming
export function startStreaming(response: unknown): AsyncIterable<string>;
```

## Safe Patterns for SquadUI

### Pattern 1: Read-Only Agent Status

```typescript
async function getSquadStatus(workspaceRoot: string) {
  const squadPath = resolveSquad(workspaceRoot);
  const config = await loadConfig(squadPath);
  
  return {
    team: config.team.name,
    agents: Object.keys(config.agents || {}),
    status: 'ready',
  };
}
```

**Safe:** No mutations, no process calls.

### Pattern 2: Non-Blocking Agent Spawn

```typescript
async function spawnAgentNonBlocking(
  workspaceRoot: string,
  agentName: string,
  task: string
) {
  const squadPath = resolveSquad(workspaceRoot);
  const config = await loadConfig(squadPath);
  
  // Validate agent exists
  if (!config.agents?.[agentName]) {
    throw new Error(`Agent ${agentName} not found`);
  }
  
  // Spawn (returns immediately, agent runs in background)
  const sessionId = crypto.randomUUID();
  
  // TODO: Integrate with SDK session pool when available
  
  return { sessionId, agentName, status: 'spawned' };
}
```

**Safe:** Validates input before calling SDK, handles missing agents.

### Pattern 3: Stream Agent Output to VS Code

```typescript
async function* streamAgentOutput(
  workspaceRoot: string,
  agentName: string,
  task: string
): AsyncGenerator<string> {
  const squadPath = resolveSquad(workspaceRoot);
  const coordinator = new SquadCoordinator({ teamRoot: squadPath });
  
  await coordinator.initialize();
  
  try {
    const decision = await coordinator.route(task);
    
    // Stream back to caller (SquadUI panel)
    yield `Routing to: ${decision.agents.join(', ')}\n`;
    
    // TODO: Wire agent response stream when session API available
    
  } finally {
    await coordinator.shutdown();
  }
}
```

**Safe:** Proper cleanup via shutdown(), respects async iteration.

## Troubleshooting

### "Squad not found"

**Cause:** No `.squad/` in workspace or parents

**Fix:**
```typescript
try {
  const squadPath = resolveSquad(workspaceFolder.uri.fsPath);
} catch (err) {
  vscode.window.showInformationMessage(
    'No Squad found. Run `squad init` to get started.',
    'Run Squad Init'
  ).then(() => {
    vscode.commands.executeCommand('squad.init');
  });
}
```

### "process.exit() called inside extension"

**Cause:** Imported CLI entry point by mistake

**Fix:** Only import from `@bradygaster/squad-sdk`, not `@bradygaster/squad-cli/dist/cli-entry.js`

```typescript
// ✅ SAFE
import { resolveSquad } from '@bradygaster/squad-sdk';

// ❌ UNSAFE
import { main } from '@bradygaster/squad-cli/dist/cli-entry';
```

### Agent response not streaming

**Cause:** Not using streaming API

**Fix:**
```typescript
// Instead of awaiting full response:
const response = await agent.run(task);  // Waits for completion

// Use streaming:
for await (const chunk of agent.stream(task)) {
  uiPanel.append(chunk);  // Incremental updates
}
```

### Type errors with agent types

**Cause:** Importing from wrong module

**Fix:**
```typescript
// ✅ CORRECT
import type { AgentCharter, CastMember } from '@bradygaster/squad-sdk';

// ❌ INCORRECT
import type { AgentCharter } from '@bradygaster/squad-sdk/agents';  // Wrong path
```

Use the barrel export from `@bradygaster/squad-sdk`.

## Next Steps

- **Architecture:** See [Architecture Overview](./architecture.md) to understand SDK modules
- **SDK API Reference:** See [SDK API Reference](./sdk-api-reference.md) for all public exports
- **Example Extension:** Check the Squad team's SquadUI extension source for reference implementation
