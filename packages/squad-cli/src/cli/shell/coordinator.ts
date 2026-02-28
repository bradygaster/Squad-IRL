import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import type { ShellMessage } from './types.js';

/** Debug logger — writes to stderr only when SQUAD_DEBUG=1. */
function debugLog(...args: unknown[]): void {
  if (process.env['SQUAD_DEBUG'] === '1') {
    console.error('[SQUAD_DEBUG]', ...args);
  }
}

export interface CoordinatorConfig {
  teamRoot: string;
  /** Path to routing.md */
  routingPath?: string;
  /** Path to team.md */
  teamPath?: string;
}

/**
 * Build the coordinator system prompt from team.md + routing.md.
 * This prompt tells the LLM how to route user requests to agents.
 */
export function buildCoordinatorPrompt(config: CoordinatorConfig): string {
  const squadRoot = config.teamRoot;

  // Load team.md for roster
  const teamPath = config.teamPath ?? join(squadRoot, '.squad', 'team.md');
  let teamContent = '';
  try {
    teamContent = readFileSync(teamPath, 'utf-8');
  } catch (err) {
    debugLog('buildCoordinatorPrompt: failed to read team.md at', teamPath, err);
    teamContent = '(No team.md found — run `squad init` to create one)';
  }

  // Load routing.md for routing rules
  const routingPath = config.routingPath ?? join(squadRoot, '.squad', 'routing.md');
  let routingContent = '';
  try {
    routingContent = readFileSync(routingPath, 'utf-8');
  } catch (err) {
    debugLog('buildCoordinatorPrompt: failed to read routing.md at', routingPath, err);
    routingContent = '(No routing.md found — run `squad init` to create one)';
  }

  return `You are the Squad Coordinator — you route work to the right agent.

## Team Roster
${teamContent}

## Routing Rules
${routingContent}

## Your Job
1. Read the user's message
2. Decide which agent(s) should handle it based on routing rules
3. If naming a specific agent ("Fenster, fix the bug"), route directly
4. If ambiguous, pick the best match and explain your choice
5. For status/factual questions, answer directly without spawning

## Response Format
When routing to an agent, respond with:
ROUTE: {agent_name}
TASK: {what the agent should do}
CONTEXT: {any relevant context}

When answering directly:
DIRECT: {your answer}

When routing to multiple agents:
MULTI:
- {agent1}: {task1}
- {agent2}: {task2}
`;
}

/**
 * Parse coordinator response to extract routing decisions.
 */
export interface RoutingDecision {
  type: 'direct' | 'route' | 'multi';
  directAnswer?: string;
  routes?: Array<{ agent: string; task: string; context?: string }>;
}

export function parseCoordinatorResponse(response: string): RoutingDecision {
  const trimmed = response.trim();

  // Direct answer
  if (trimmed.startsWith('DIRECT:')) {
    return {
      type: 'direct',
      directAnswer: trimmed.slice('DIRECT:'.length).trim(),
    };
  }

  // Multi-agent routing
  if (trimmed.startsWith('MULTI:')) {
    const lines = trimmed.split('\n').slice(1);
    const routes = lines
      .filter(l => l.trim().startsWith('-'))
      .map(l => {
        const match = l.match(/^-\s*(\w+):\s*(.+)$/);
        if (match) {
          return { agent: match[1], task: match[2] };
        }
        return null;
      })
      .filter((r): r is { agent: string; task: string } => r !== null);
    return { type: 'multi', routes };
  }

  // Single agent routing
  if (trimmed.startsWith('ROUTE:')) {
    const agentMatch = trimmed.match(/ROUTE:\s*(\w+)/);
    const taskMatch = trimmed.match(/TASK:\s*(.+)/);
    const contextMatch = trimmed.match(/CONTEXT:\s*(.+)/);
    if (agentMatch) {
      return {
        type: 'route',
        routes: [{
          agent: agentMatch[1]!,
          task: taskMatch?.[1] ?? '',
          context: contextMatch?.[1],
        }],
      };
    }
  }

  // Fallback — treat as direct answer
  return { type: 'direct', directAnswer: trimmed };
}

/**
 * Format conversation history for the coordinator context window.
 * Keeps recent messages, summarizes older ones.
 */
export function formatConversationContext(
  messages: ShellMessage[],
  maxMessages: number = 20,
): string {
  const recent = messages.slice(-maxMessages);
  return recent
    .map(m => {
      const prefix = m.agentName ? `[${m.agentName}]` : `[${m.role}]`;
      return `${prefix}: ${m.content}`;
    })
    .join('\n');
}
