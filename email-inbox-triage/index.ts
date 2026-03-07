// ─── Email Inbox Triage — Interactive Squad CLI ─────────────────────────────
// Connect to your email triage squad and get real, AI-powered inbox advice.
// Four agents (classifier, summarizer, action advisor, priority ranker)
// collaborate to triage your emails based on what YOU provide.

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
  console.log(`${C.cyan}${C.bold}  📧  Email Inbox Triage Squad${C.reset}`);
  console.log(`${C.dim}  ─────────────────────────────────────────${C.reset}`);
  console.log(`${C.dim}  Four specialists ready to triage your inbox.${C.reset}`);
  console.log(`${C.dim}  Paste email subjects, describe your inbox, or ask for help.${C.reset}`);
  console.log(`${C.dim}  Type "quit" to exit.${C.reset}`);
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
  const teamName = config.team?.name ?? 'Email Inbox Triage Squad';
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

You are an interactive email triage assistant powered by a squad of specialists.
When the user pastes email subjects or describes their inbox, coordinate your specialists to provide a complete triage.
For broad requests ("triage my inbox"), engage all specialists: classify, summarise, recommend actions, and rank by priority.
For specific requests ("draft a reply to the budget email"), route to the right specialist.

Be organised, decisive, and actionable. Use clear sections and visual hierarchy.
Never make up emails — only work with what the user provides.
When presenting triage results, use a structured format: classification → summary → action → priority order.`;
}

// ═══════════════════════════════════════════════════════════════════════════════
// Gather inbox details interactively
// ═══════════════════════════════════════════════════════════════════════════════

async function gatherInboxDetails(rl: ReturnType<typeof createInterface>): Promise<string> {
  console.log(`${C.green}${C.bold}  Let's triage your inbox!${C.reset}`);
  console.log();
  console.log(`${C.dim}  You can:${C.reset}`);
  console.log(`${C.dim}    • Paste a list of email subject lines${C.reset}`);
  console.log(`${C.dim}    • Describe what's in your inbox${C.reset}`);
  console.log(`${C.dim}    • Copy-paste full email headers or snippets${C.reset}`);
  console.log();

  const inbox = await rl.question(`${C.cyan}  Describe your inbox or paste email subjects: ${C.reset}`);
  if (!inbox.trim()) {
    return '';
  }

  const context = await rl.question(`${C.cyan}  Any context? ${C.dim}(e.g., "I'm a PM with a meeting in 1 hour", or press Enter) ${C.reset}`);

  let prompt = `Triage these emails for me:\n\n${inbox.trim()}`;
  if (context.trim()) {
    prompt += `\n\nContext about me: ${context.trim()}`;
  }

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
    if (session.sendAndWait) {
      const result = await session.sendAndWait({ prompt }, 300_000);
      session.off('message_delta', deltaHandler);

      if (receivedContent) {
        process.stdout.write(`${C.reset}\n`);
      } else if (result) {
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
      await client.sendMessage(session, { prompt });

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

  const initialPrompt = await gatherInboxDetails(rl);
  if (!initialPrompt) {
    console.log(`${C.yellow}  No emails provided. Goodbye!${C.reset}`);
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
  console.log(`${C.magenta}  Connecting to your triage squad...${C.reset}`);

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
    console.log(`${C.green}  ✓ Connected! Your triage squad is ready.${C.reset}`);
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

  // Send the initial triage request
  try {
    console.log();
    console.log(`${C.dim}  Sending to the squad for triage...${C.reset}`);
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
  console.log(`${C.green}  Inbox triaged! Go get 'em. 📧${C.reset}`);
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
