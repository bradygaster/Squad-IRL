// ─── Travel Planner — Interactive Squad CLI ─────────────────────────────────
// Connect to your travel planning squad and get real advice.
// Five agents (research, flights, lodging, activities, budget) collaborate
// to plan your perfect trip based on your preferences.

import { createInterface } from 'node:readline/promises';
import { stdin, stdout } from 'node:process';
import { SquadClient } from '@bradygaster/squad-sdk/client';
import type { SquadSession, SquadSessionConfig } from '@bradygaster/squad-sdk/adapter';
import type { SquadSessionEvent, SquadSessionEventHandler } from '@bradygaster/squad-sdk/adapter';
import squadConfig from './squad.config.js';

// ═══════════════════════════════════════════════════════════════════════════════
// ANSI helpers
// ═══════════════════════════════════════════════════════════════════════════════

const C = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  dim: '\x1b[2m',
  cyan: '\x1b[36m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  magenta: '\x1b[35m',
  red: '\x1b[31m',
  white: '\x1b[37m',
};

function banner(): void {
  console.log();
  console.log(`${C.cyan}${C.bold}  ✈  Travel Planning Squad${C.reset}`);
  console.log(`${C.dim}  ─────────────────────────────────────────${C.reset}`);
  console.log(`${C.dim}  Five travel specialists ready to help you plan.${C.reset}`);
  console.log(`${C.dim}  Type your travel questions, or "quit" to exit.${C.reset}`);
  console.log();
}

/**
 * Extract the human-readable content from a squad response.
 * The response may be a string, or an event object with data.content.
 */
function extractContent(result: unknown): string | null {
  if (typeof result === 'string') return result;
  if (!result || typeof result !== 'object') return null;

  const obj = result as Record<string, any>;

  // Event shape: { data: { content: "..." } }
  if (obj.data?.content && typeof obj.data.content === 'string') {
    return obj.data.content;
  }

  // Direct content shape: { content: "..." }
  if (obj.content && typeof obj.content === 'string') {
    return obj.content;
  }

  // Message shape: { message: "..." }
  if (obj.message && typeof obj.message === 'string') {
    return obj.message;
  }

  return null;
}

// ═══════════════════════════════════════════════════════════════════════════════
// Build system prompt from squad config
// ═══════════════════════════════════════════════════════════════════════════════

function buildSystemPrompt(): string {
  const config = squadConfig;
  const teamName = config.team?.name ?? 'Travel Planning Squad';
  const teamDesc = config.team?.description ?? '';
  const projectCtx = config.team?.projectContext ?? '';

  const agentDescriptions = (config.agents ?? []).map((a: any) => {
    const name = a.name ?? 'agent';
    const role = a.role ?? '';
    const charter = (a.charter ?? '').trim();
    return `### ${name} — ${role}\n${charter}`;
  }).join('\n\n');

  const routingRules = (config.routing?.rules ?? []).map((r: any) => {
    const agents = (r.agents ?? []).join(', ');
    return `- Pattern: "${r.pattern}" → ${agents} (${r.description ?? ''})`;
  }).join('\n');

  return `You are the **${teamName}**.

${teamDesc}

${projectCtx}

## Your Agents

${agentDescriptions}

## Routing Rules

${routingRules}

## Instructions

You are an interactive travel planning assistant powered by a squad of specialists.
When the user describes a trip, coordinate your specialists to provide comprehensive advice.
For broad questions ("plan my trip to Tokyo"), engage all relevant specialists.
For specific questions ("what flights to Barcelona?"), route to the right specialist.

Be warm, practical, and organized. Use clear sections. Give real, actionable advice.
Always consider the user's budget, interests, and travel style.`;
}

// ═══════════════════════════════════════════════════════════════════════════════
// Gather trip details interactively
// ═══════════════════════════════════════════════════════════════════════════════

async function gatherTripDetails(rl: ReturnType<typeof createInterface>): Promise<string> {
  console.log(`${C.green}${C.bold}  Let's plan your trip!${C.reset}`);
  console.log();

  const destination = await rl.question(`${C.cyan}  Where are you going? ${C.reset}`);
  if (!destination.trim()) {
    return '';
  }

  const duration = await rl.question(`${C.cyan}  How long is your trip? ${C.dim}(e.g., "5 days", "2 weeks") ${C.reset}`);
  const budget = await rl.question(`${C.cyan}  What's your budget? ${C.dim}(e.g., "$3000", "mid-range", or just press Enter) ${C.reset}`);
  const interests = await rl.question(`${C.cyan}  What are you into? ${C.dim}(e.g., "food, history, nightlife", or press Enter) ${C.reset}`);

  let prompt = `Plan my trip to ${destination.trim()}`;
  if (duration.trim()) prompt += ` for ${duration.trim()}`;
  if (budget.trim()) prompt += ` with a budget of ${budget.trim()}`;
  if (interests.trim()) prompt += `. I'm interested in: ${interests.trim()}`;
  prompt += '.';

  return prompt;
}

// ═══════════════════════════════════════════════════════════════════════════════
// Send a message and stream the response
// ═══════════════════════════════════════════════════════════════════════════════

async function sendAndStream(
  client: SquadClient,
  session: SquadSession,
  prompt: string,
): Promise<void> {
  console.log();
  console.log(`${C.dim}  ─────────────────────────────────────────${C.reset}`);

  // Try streaming first for real-time UX
  let receivedContent = false;

  const deltaHandler: SquadSessionEventHandler = (event: SquadSessionEvent) => {
    const content = (event as any).content ?? (event as any).data?.content ?? '';
    if (content) {
      if (!receivedContent) process.stdout.write(`${C.white}`);
      receivedContent = true;
      process.stdout.write(content);
    }
  };

  session.on('message_delta', deltaHandler);

  try {
    // Use sendAndWait if available (returns final response)
    if (session.sendAndWait) {
      const result = await session.sendAndWait({ prompt }, 300_000);
      session.off('message_delta', deltaHandler);

      if (receivedContent) {
        // Streaming worked — response already printed
        process.stdout.write(`${C.reset}\n`);
      } else if (result) {
        // No streaming, but got a result — extract the content
        const text = extractContent(result);
        if (text) {
          console.log(`${C.white}${text}${C.reset}`);
        } else {
          console.log(`${C.yellow}  (Received a response but couldn't parse it.)${C.reset}`);
        }
      } else {
        console.log(`${C.yellow}  (No response — the squad may still be thinking.)${C.reset}`);
      }
    } else {
      // Fallback: fire sendMessage and wait for idle
      await client.sendMessage(session, { prompt });

      // Give it time to stream
      await new Promise<void>((resolve) => {
        const check = () => {
          session.off('idle', check);
          session.off('turn_end', check);
          resolve();
        };
        session.on('idle', check);
        session.on('turn_end', check);
        setTimeout(resolve, 300_000);
      });

      session.off('message_delta', deltaHandler);
      if (receivedContent) {
        process.stdout.write(`${C.reset}\n`);
      } else {
        console.log(`${C.yellow}  (No response received.)${C.reset}`);
      }
    }
  } catch (err: any) {
    session.off('message_delta', deltaHandler);
    if (receivedContent) process.stdout.write(`${C.reset}\n`);
    throw err;
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// Main
// ═══════════════════════════════════════════════════════════════════════════════

async function main(): Promise<void> {
  banner();

  const rl = createInterface({ input: stdin, output: stdout });

  // Gather trip details
  const initialPrompt = await gatherTripDetails(rl);
  if (!initialPrompt) {
    console.log(`${C.yellow}  No destination provided. Goodbye!${C.reset}`);
    rl.close();
    return;
  }

  // Suppress noisy CLI subprocess warnings (e.g., Node.js experimental SQLite)
  const origStderrWrite = process.stderr.write.bind(process.stderr);
  process.stderr.write = (chunk: any, ...args: any[]) => {
    const str = typeof chunk === 'string' ? chunk : chunk.toString();
    if (str.includes('[CLI subprocess]') || str.includes('ExperimentalWarning')) {
      return true;
    }
    return origStderrWrite(chunk, ...args);
  };

  console.log();
  console.log(`${C.magenta}  Connecting to your travel squad...${C.reset}`);

  let client: SquadClient;
  let session: SquadSession;

  try {
    client = new SquadClient({
      cwd: process.cwd(),
      autoReconnect: true,
    });

    await client.connect();

    const sessionConfig: SquadSessionConfig = {
      model: 'claude-sonnet-4.5',
      streaming: true,
      systemMessage: {
        mode: 'append' as const,
        content: buildSystemPrompt(),
      },
      onPermissionRequest: () => ({ kind: 'approved' as const }),
    };

    session = await client.createSession(sessionConfig);
    console.log(`${C.green}  ✓ Connected! Your squad is ready.${C.reset}`);
  } catch (err: any) {
    const msg = err?.message ?? String(err);

    if (msg.includes('ECONNREFUSED') || msg.includes('spawn') || msg.includes('not found') || msg.includes('ENOENT')) {
      console.error();
      console.error(`${C.red}${C.bold}  Could not connect to the Copilot CLI.${C.reset}`);
      console.error(`${C.yellow}  Make sure GitHub Copilot is installed and running:${C.reset}`);
      console.error(`${C.dim}    1. Install: npm install -g @github/copilot${C.reset}`);
      console.error(`${C.dim}    2. Authenticate: copilot auth login${C.reset}`);
      console.error(`${C.dim}    3. Try again: npm start${C.reset}`);
    } else {
      console.error();
      console.error(`${C.red}  Connection failed: ${msg}${C.reset}`);
    }

    rl.close();
    process.exit(1);
  }

  // Send the initial travel request
  try {
    console.log();
    console.log(`${C.dim}  Asking the squad about: ${initialPrompt}${C.reset}`);
    await sendAndStream(client, session, initialPrompt);
  } catch (err: any) {
    console.error(`${C.red}  Error: ${err?.message ?? err}${C.reset}`);
  }

  // Conversation loop for follow-up questions
  while (true) {
    console.log();
    const followUp = await rl.question(`${C.cyan}  Follow-up question ${C.dim}(or "quit")${C.cyan}: ${C.reset}`);

    const trimmed = followUp.trim().toLowerCase();
    if (!trimmed || trimmed === 'quit' || trimmed === 'exit' || trimmed === 'q') {
      break;
    }

    try {
      await sendAndStream(client, session, followUp.trim());
    } catch (err: any) {
      console.error(`${C.red}  Error: ${err?.message ?? err}${C.reset}`);
    }
  }

  // Cleanup
  console.log();
  console.log(`${C.green}  Thanks for planning with us! Safe travels. ✈${C.reset}`);
  console.log();

  try {
    await session.close();
  } catch { /* session may already be closed */ }

  try {
    await client.disconnect();
  } catch { /* best effort */ }

  rl.close();
}

main().catch((err) => {
  console.error(`${C.red}  Fatal error: ${err?.message ?? err}${C.reset}`);
  process.exit(1);
});
