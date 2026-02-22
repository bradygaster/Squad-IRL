import { parseCoordinatorResponse, type RoutingDecision } from './coordinator.js';
import { SessionRegistry } from './sessions.js';

export type MessageType = 'slash_command' | 'direct_agent' | 'coordinator';

export interface ParsedInput {
  type: MessageType;
  raw: string;
  command?: string;        // for slash commands: 'status', 'history', etc.
  args?: string[];         // command arguments
  agentName?: string;      // for @Agent direct messages
  content?: string;        // the actual message content
}

/**
 * Parse user input to determine routing.
 * - /command → slash command
 * - @AgentName message → direct to agent
 * - anything else → coordinator
 */
export function parseInput(input: string, knownAgents: string[]): ParsedInput {
  const trimmed = input.trim();

  // Slash commands
  if (trimmed.startsWith('/')) {
    const parts = trimmed.slice(1).split(/\s+/);
    return {
      type: 'slash_command',
      raw: trimmed,
      command: parts[0]!.toLowerCase(),
      args: parts.slice(1),
    };
  }

  // @Agent direct addressing
  const atMatch = trimmed.match(/^@(\w+)\s*(.*)/s);
  if (atMatch) {
    const name = atMatch[1]!;
    // Case-insensitive match against known agents
    const match = knownAgents.find(a => a.toLowerCase() === name.toLowerCase());
    if (match) {
      return {
        type: 'direct_agent',
        raw: trimmed,
        agentName: match,
        content: atMatch[2]!.trim() || undefined,
      };
    }
  }

  // Also support "AgentName, do something" syntax
  const commaMatch = trimmed.match(/^(\w+),\s*(.*)/s);
  if (commaMatch) {
    const name = commaMatch[1]!;
    const match = knownAgents.find(a => a.toLowerCase() === name.toLowerCase());
    if (match) {
      return {
        type: 'direct_agent',
        raw: trimmed,
        agentName: match,
        content: commaMatch[2]!.trim() || undefined,
      };
    }
  }

  // Default: route to coordinator
  return {
    type: 'coordinator',
    raw: trimmed,
    content: trimmed,
  };
}
