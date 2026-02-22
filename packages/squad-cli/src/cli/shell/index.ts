/**
 * Squad Interactive Shell — entry point
 *
 * Renders the Ink-based shell UI with AgentPanel, MessageStream, and InputPrompt.
 * StreamBridge wires streaming events into component state.
 */

import { createRequire } from 'node:module';
import React from 'react';
import { render } from 'ink';
import { App } from './components/App.js';
import type { ShellApi } from './components/App.js';
import { SessionRegistry } from './sessions.js';
import { ShellRenderer } from './render.js';
import { StreamBridge } from './stream-bridge.js';

export { SessionRegistry } from './sessions.js';
export { StreamBridge } from './stream-bridge.js';
export type { StreamBridgeOptions } from './stream-bridge.js';
export { ShellRenderer } from './render.js';
export { ShellLifecycle } from './lifecycle.js';
export type { LifecycleOptions, DiscoveredAgent } from './lifecycle.js';
export { spawnAgent, loadAgentCharter, buildAgentPrompt } from './spawn.js';
export type { SpawnOptions, SpawnResult, ToolDefinition } from './spawn.js';
export { buildCoordinatorPrompt, parseCoordinatorResponse, formatConversationContext } from './coordinator.js';
export type { CoordinatorConfig, RoutingDecision } from './coordinator.js';
export { parseInput } from './router.js';
export type { MessageType, ParsedInput } from './router.js';
export { executeCommand } from './commands.js';
export type { CommandContext, CommandResult } from './commands.js';
export { MemoryManager, DEFAULT_LIMITS } from './memory.js';
export type { MemoryLimits } from './memory.js';
export { detectTerminal, safeChar, boxChars } from './terminal.js';
export type { TerminalCapabilities } from './terminal.js';
export { createCompleter } from './autocomplete.js';
export type { CompleterFunction, CompleterResult } from './autocomplete.js';
export { App } from './components/App.js';
export type { ShellApi, AppProps } from './components/App.js';

const require = createRequire(import.meta.url);
const pkg = require('../../../package.json') as { version: string };

export async function runShell(): Promise<void> {
  const registry = new SessionRegistry();
  const renderer = new ShellRenderer();
  const teamRoot = process.cwd();

  let shellApi: ShellApi | undefined;
  const streamBuffers = new Map<string, string>();

  // StreamBridge wires streaming pipeline events into Ink component state.
  // The bridge is ready to receive events once the coordinator is connected.
  const _bridge = new StreamBridge(registry, {
    onContent: (agentName: string, delta: string) => {
      const existing = streamBuffers.get(agentName) ?? '';
      const accumulated = existing + delta;
      streamBuffers.set(agentName, accumulated);
      shellApi?.setStreamingContent({ agentName, content: accumulated });
      shellApi?.refreshAgents();
    },
    onComplete: (message) => {
      if (message.agentName) streamBuffers.delete(message.agentName);
      shellApi?.addMessage(message);
      shellApi?.refreshAgents();
    },
    onError: (agentName: string, error: Error) => {
      shellApi?.addMessage({
        role: 'system',
        content: `❌ ${agentName}: ${error.message}`,
        timestamp: new Date(),
      });
    },
  });

  const { waitUntilExit } = render(
    React.createElement(App, {
      registry,
      renderer,
      teamRoot,
      version: pkg.version,
      onReady: (api: ShellApi) => { shellApi = api; },
    }),
    { exitOnCtrlC: false },
  );

  await waitUntilExit();
  console.log('👋 Squad out.');
}
