import { SessionRegistry } from './sessions.js';
import { ShellRenderer } from './render.js';
import type { ShellMessage } from './types.js';

export interface CommandContext {
  registry: SessionRegistry;
  renderer: ShellRenderer;
  messageHistory: ShellMessage[];
  teamRoot: string;
}

export interface CommandResult {
  handled: boolean;
  exit?: boolean;
  output?: string;
}

/**
 * Execute a slash command.
 */
export function executeCommand(
  command: string,
  args: string[],
  context: CommandContext
): CommandResult {
  switch (command) {
    case 'status':
      return handleStatus(context);
    case 'history':
      return handleHistory(args, context);
    case 'clear':
      return handleClear();
    case 'help':
      return handleHelp();
    case 'quit':
    case 'exit':
      return { handled: true, exit: true };
    case 'agents':
      return handleAgents(context);
    default:
      return { handled: false, output: `Unknown command: /${command}. Type /help for available commands.` };
  }
}

function handleStatus(context: CommandContext): CommandResult {
  const agents = context.registry.getAll();
  const active = context.registry.getActive();
  const lines = [
    `Squad Status:`,
    `  Team root: ${context.teamRoot}`,
    `  Registered agents: ${agents.length}`,
    `  Active: ${active.length}`,
    `  Messages: ${context.messageHistory.length}`,
  ];
  if (active.length > 0) {
    lines.push('', '  Working:');
    for (const a of active) {
      lines.push(`    ${a.name} (${a.role}) — ${a.status}`);
    }
  }
  return { handled: true, output: lines.join('\n') };
}

function handleHistory(args: string[], context: CommandContext): CommandResult {
  const limit = args[0] ? parseInt(args[0], 10) : 10;
  const recent = context.messageHistory.slice(-limit);
  if (recent.length === 0) {
    return { handled: true, output: 'No message history yet.' };
  }
  const lines = recent.map(m => {
    const prefix = m.agentName ?? m.role;
    const time = m.timestamp.toLocaleTimeString();
    return `  [${time}] ${prefix}: ${m.content.slice(0, 100)}${m.content.length > 100 ? '...' : ''}`;
  });
  return { handled: true, output: `Recent messages (${recent.length}):\n${lines.join('\n')}` };
}

function handleClear(): CommandResult {
  // Clear is handled by the shell (clears terminal)
  return { handled: true, output: '\x1Bc' }; // ANSI clear screen
}

function handleHelp(): CommandResult {
  return {
    handled: true,
    output: [
      'Available commands:',
      '  /status   — Check squad status and active agents',
      '              Example: /status',
      '  /history  — Review recent message history',
      '              Example: /history 20',
      '  /agents   — List all registered agents',
      '              Example: /agents',
      '  /clear    — Clear the screen',
      '              Example: /clear',
      '  /help     — Show available commands',
      '              Example: /help',
      '  /quit     — Exit the shell',
      '              Example: /quit',
      '',
      'Direct addressing:',
      '  @AgentName message  — Send directly to an agent',
      '              Example: @Cheritto fix the layout bug',
      '  AgentName, message  — Same as above',
      '              Example: Cheritto, fix the layout bug',
    ].join('\n'),
  };
}

function handleAgents(context: CommandContext): CommandResult {
  const agents = context.registry.getAll();
  if (agents.length === 0) {
    return { handled: true, output: 'No agents registered.' };
  }
  const lines = agents.map(a => {
    const icon = a.status === 'working' ? '🔵' : a.status === 'streaming' ? '🟢' : a.status === 'error' ? '🔴' : '⚪';
    return `  ${icon} ${a.name} (${a.role}) — ${a.status}`;
  });
  return { handled: true, output: `Agents:\n${lines.join('\n')}` };
}
