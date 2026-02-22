/**
 * Shell session lifecycle management.
 *
 * Manages initialization (team discovery, path resolution),
 * message history tracking, state transitions, and graceful shutdown.
 *
 * @module cli/shell/lifecycle
 */

import fs from 'node:fs';
import path from 'node:path';
import { SessionRegistry } from './sessions.js';
import { ShellRenderer } from './render.js';
import type { ShellState, ShellMessage } from './types.js';

export interface LifecycleOptions {
  teamRoot: string;
  renderer: ShellRenderer;
  registry: SessionRegistry;
}

export interface DiscoveredAgent {
  name: string;
  role: string;
  charter: string | undefined;
  status: string;
}

/**
 * Manages the shell session lifecycle:
 * - Initialization (load team, resolve squad path, populate registry)
 * - Message handling (route user input, track responses)
 * - Cleanup (graceful shutdown, session cleanup)
 */
export class ShellLifecycle {
  private state: ShellState;
  private options: LifecycleOptions;
  private messageHistory: ShellMessage[] = [];
  private discoveredAgents: DiscoveredAgent[] = [];

  constructor(options: LifecycleOptions) {
    this.options = options;
    this.state = {
      status: 'initializing',
      activeAgents: new Map(),
      messageHistory: [],
    };
  }

  /** Initialize the shell — verify .squad/, load team.md, discover agents. */
  async initialize(): Promise<void> {
    this.state.status = 'initializing';

    const squadDir = path.resolve(this.options.teamRoot, '.squad');
    if (!fs.existsSync(squadDir) || !fs.statSync(squadDir).isDirectory()) {
      this.state.status = 'error';
      throw new Error(
        `No .squad/ directory found at "${squadDir}". Run "squad init" to create a team.`
      );
    }

    const teamPath = path.join(squadDir, 'team.md');
    if (!fs.existsSync(teamPath)) {
      this.state.status = 'error';
      throw new Error(
        `No team.md found at "${teamPath}". The .squad/ directory exists but has no team manifest.`
      );
    }

    const teamContent = fs.readFileSync(teamPath, 'utf-8');
    this.discoveredAgents = parseTeamManifest(teamContent);

    // Register discovered agents in the session registry
    for (const agent of this.discoveredAgents) {
      if (agent.status === 'Active') {
        this.options.registry.register(agent.name, agent.role);
      }
    }

    this.state.status = 'ready';
  }

  /** Get current shell state. */
  getState(): ShellState {
    return { ...this.state };
  }

  /** Get agents discovered during initialization. */
  getDiscoveredAgents(): readonly DiscoveredAgent[] {
    return this.discoveredAgents;
  }

  /** Add a user message to history. */
  addUserMessage(content: string): ShellMessage {
    const msg: ShellMessage = {
      role: 'user',
      content,
      timestamp: new Date(),
    };
    this.messageHistory.push(msg);
    this.state.messageHistory = [...this.messageHistory];
    return msg;
  }

  /** Add an agent response to history. */
  addAgentMessage(agentName: string, content: string): ShellMessage {
    const msg: ShellMessage = {
      role: 'agent',
      agentName,
      content,
      timestamp: new Date(),
    };
    this.messageHistory.push(msg);
    this.state.messageHistory = [...this.messageHistory];
    return msg;
  }

  /** Add a system message. */
  addSystemMessage(content: string): ShellMessage {
    const msg: ShellMessage = {
      role: 'system',
      content,
      timestamp: new Date(),
    };
    this.messageHistory.push(msg);
    this.state.messageHistory = [...this.messageHistory];
    return msg;
  }

  /** Get message history (optionally filtered by agent). */
  getHistory(agentName?: string): ShellMessage[] {
    if (agentName) {
      return this.messageHistory.filter(m => m.agentName === agentName);
    }
    return [...this.messageHistory];
  }

  /** Clean shutdown — close all sessions, clear state. */
  async shutdown(): Promise<void> {
    this.state.status = 'initializing'; // transitioning
    this.options.registry.clear();
    this.messageHistory = [];
    this.state.messageHistory = [];
    this.state.activeAgents.clear();
    this.discoveredAgents = [];
  }
}

/**
 * Parse the Members table from team.md and extract agent metadata.
 *
 * Expected markdown table format:
 * ```
 * | Name | Role | Charter | Status |
 * |------|------|---------|--------|
 * | Keaton | Lead | `.squad/agents/keaton/charter.md` | ✅ Active |
 * ```
 */
function parseTeamManifest(content: string): DiscoveredAgent[] {
  const agents: DiscoveredAgent[] = [];
  const lines = content.split('\n');

  let inMembersTable = false;
  let headerParsed = false;

  for (const line of lines) {
    const trimmed = line.trim();

    // Detect the "Members" section header
    if (/^#+\s*Members/i.test(trimmed)) {
      inMembersTable = true;
      headerParsed = false;
      continue;
    }

    // Stop at the next section header
    if (inMembersTable && /^#+\s/.test(trimmed) && !/^#+\s*Members/i.test(trimmed)) {
      inMembersTable = false;
      continue;
    }

    if (!inMembersTable) continue;

    // Skip non-table lines
    if (!trimmed.startsWith('|')) continue;

    // Skip the header row (contains "Name") and separator row (contains "---")
    if (trimmed.includes('---') || /\|\s*Name\s*\|/i.test(trimmed)) {
      headerParsed = true;
      continue;
    }

    if (!headerParsed) continue;

    const cells = trimmed
      .split('|')
      .map(c => c.trim())
      .filter(c => c.length > 0);

    if (cells.length < 4) continue;

    const name = cells[0]!;
    const role = cells[1]!;
    const charter = cells[2]?.startsWith('`') ? cells[2].replace(/`/g, '') : undefined;

    // Extract status text from emoji-prefixed status (e.g. "✅ Active" → "Active")
    const rawStatus = cells[3]!;
    const status = rawStatus.replace(/^[^\w]*/, '').trim();

    agents.push({ name, role, charter, status });
  }

  return agents;
}
