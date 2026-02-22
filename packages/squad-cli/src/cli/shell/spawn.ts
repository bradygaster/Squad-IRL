/**
 * Agent spawning — loads charters, builds prompts, and manages spawn lifecycle.
 *
 * Full SDK session integration is stubbed pending CopilotClient session API wiring.
 */

import { resolveSquad } from '@bradygaster/squad-sdk/resolution';
import { SessionRegistry } from './sessions.js';
import type { AgentSession } from './types.js';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

export interface SpawnOptions {
  /** Wait for completion (sync) or fire-and-track (background) */
  mode: 'sync' | 'background';
  /** Additional system prompt context */
  systemContext?: string;
  /** Tool definitions to register */
  tools?: ToolDefinition[];
}

export interface ToolDefinition {
  name: string;
  description: string;
  parameters: Record<string, unknown>;
}

export interface SpawnResult {
  agentName: string;
  status: 'completed' | 'streaming' | 'error';
  response?: string;
  error?: string;
}

/**
 * Load agent charter from .squad/agents/{name}/charter.md
 */
export function loadAgentCharter(agentName: string, teamRoot?: string): string {
  const squadDir = teamRoot ? join(teamRoot, '.squad') : resolveSquad();
  if (!squadDir) {
    throw new Error('No .squad/ directory found. Run "squad init" first.');
  }
  const charterPath = join(squadDir, 'agents', agentName.toLowerCase(), 'charter.md');
  try {
    return readFileSync(charterPath, 'utf-8');
  } catch {
    throw new Error(`Charter not found for agent "${agentName}" at ${charterPath}`);
  }
}

/**
 * Build system prompt for an agent from their charter + optional context
 */
export function buildAgentPrompt(charter: string, options?: { systemContext?: string }): string {
  let prompt = `You are an AI agent on a software development team.\n\nYOUR CHARTER:\n${charter}`;
  if (options?.systemContext) {
    prompt += `\n\nADDITIONAL CONTEXT:\n${options.systemContext}`;
  }
  return prompt;
}

/**
 * Spawn an agent session.
 * In this initial version, this is a stub that:
 * 1. Loads the agent's charter
 * 2. Registers the session in the registry
 * 3. Returns a SpawnResult
 *
 * Full SDK session integration comes in a follow-up when the CopilotClient
 * session API is wired in.
 */
export async function spawnAgent(
  name: string,
  task: string,
  registry: SessionRegistry,
  options: SpawnOptions = { mode: 'sync' }
): Promise<SpawnResult> {
  // Load charter
  const charter = loadAgentCharter(name);

  // Register in session registry
  // Read role from charter (first line after "# Name — Role")
  const roleMatch = charter.match(/^#\s+\w+\s+—\s+(.+)$/m);
  const role = roleMatch?.[1] ?? 'Agent';

  registry.register(name, role);
  registry.updateStatus(name, 'working');

  try {
    // Build prompt
    const _systemPrompt = buildAgentPrompt(charter, { systemContext: options.systemContext });

    // TODO: Wire to CopilotClient session API
    // For now, return a stub result indicating the spawn infrastructure is ready
    // but actual LLM session creation requires the SDK session management

    const result: SpawnResult = {
      agentName: name,
      status: 'completed',
      response: `[Agent ${name} spawn infrastructure ready — SDK session wiring pending]`,
    };

    registry.updateStatus(name, 'idle');
    return result;
  } catch (error) {
    registry.updateStatus(name, 'error');
    return {
      agentName: name,
      status: 'error',
      error: error instanceof Error ? error.message : String(error),
    };
  }
}
