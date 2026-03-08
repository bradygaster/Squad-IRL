// ─── Meeting Recap & Action Item Generator ──────────────────────────────────
// Paste meeting notes or point to a transcript file. A four-agent squad
// extracts an executive summary, action items, decisions, and follow-ups.

import { createInterface } from 'node:readline/promises';
import { stdin, stdout } from 'node:process';
import { readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { SquadClient } from '@bradygaster/squad-sdk/client';
import type { SquadSession, SquadSessionConfig } from '@bradygaster/squad-sdk/adapter';
import type { SquadSessionEvent, SquadSessionEventHandler } from '@bradygaster/squad-sdk/adapter';
import squadConfig from './squad.config.js';
import { initSquadTelemetry, RuntimeEventBus as EventBus, CostTracker, recordTokenUsage } from '@bradygaster/squad-sdk';

// Model pricing (USD per 1M tokens) — used instead of SDK-reported cost
const MODEL_PRICING: Record<string, { input: number; output: number }> = {
  'claude-sonnet-4.5': { input: 3, output: 15 },
  'claude-haiku-4.5': { input: 0.80, output: 4 },
  'claude-opus-4.5': { input: 15, output: 75 },
  'gpt-4o': { input: 2.50, output: 10 },
};

function estimateCost(model: string, inputTokens: number, outputTokens: number): number {
  const pricing = MODEL_PRICING[model] ?? MODEL_PRICING['claude-sonnet-4.5'];
  return (inputTokens * pricing.input + outputTokens * pricing.output) / 1_000_000;
}

// Initialize telemetry pipeline: EventBus → OTel spans + metrics + CostTracker
const eventBus = new EventBus();
const telemetry = initSquadTelemetry({ eventBus });
const costTracker = new CostTracker();
costTracker.wireToEventBus(eventBus);

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
  console.log(`${C.cyan}${C.bold}  📋  Meeting Recap & Action Item Generator${C.reset}`);
  console.log(`${C.dim}  ─────────────────────────────────────────────${C.reset}`);
  console.log(`${C.dim}  Paste meeting notes or provide a transcript file.${C.reset}`);
  console.log(`${C.dim}  Four specialists: Summarizer · Action Tracker · Decision Logger · Follow-Up Coordinator${C.reset}`);
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

  if (obj.data?.content && typeof obj.data.content === 'string') {
    return obj.data.content;
  }

  if (obj.content && typeof obj.content === 'string') {
    return obj.content;
  }

  if (obj.message && typeof obj.message === 'string') {
    return obj.message;
  }

  return null;
}

// ═══════════════════════════════════════════════════════════════════════════════
// Input: paste notes or read from a file
// ═══════════════════════════════════════════════════════════════════════════════

async function getMeetingContent(rl: ReturnType<typeof createInterface>): Promise<string> {
  console.log(`${C.yellow}  How would you like to provide meeting notes?${C.reset}`);
  console.log(`${C.dim}    1. Paste notes directly (type "paste")${C.reset}`);
  console.log(`${C.dim}    2. Provide a file path (type a path, e.g. ./sample-transcripts/sprint-planning.md)${C.reset}`);
  console.log();

  const answer = await rl.question(`${C.cyan}  Your choice: ${C.reset}`);
  const trimmed = answer.trim();

  if (trimmed.toLowerCase() === 'paste') {
    console.log();
    console.log(`${C.yellow}  Paste your meeting notes below.${C.reset}`);
    console.log(`${C.dim}  When done, type "END" on a new line and press Enter.${C.reset}`);
    console.log();

    const lines: string[] = [];
    while (true) {
      const line = await rl.question('');
      if (line.trim().toUpperCase() === 'END') break;
      lines.push(line);
    }

    const content = lines.join('\n').trim();
    if (!content) {
      console.log(`${C.red}  No content provided. Exiting.${C.reset}`);
      process.exit(1);
    }
    return content;
  }

  // Treat the input as a file path
  const filePath = resolve(trimmed);
  if (!existsSync(filePath)) {
    console.error(`${C.red}  File not found: ${filePath}${C.reset}`);
    process.exit(1);
  }

  const content = readFileSync(filePath, 'utf-8').trim();
  if (!content) {
    console.error(`${C.red}  File is empty: ${filePath}${C.reset}`);
    process.exit(1);
  }

  console.log(`${C.green}  ✓ Loaded transcript from ${trimmed} (${content.length} characters)${C.reset}`);
  return content;
}

// ═══════════════════════════════════════════════════════════════════════════════
// Build system prompt from squad config
// ═══════════════════════════════════════════════════════════════════════════════

function buildSystemPrompt(): string {
  const config = squadConfig;
  const teamName = config.team?.name ?? 'Meeting Recap Squad';
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

You are a meeting recap assistant powered by a squad of specialists.
When the user provides meeting notes or a transcript, coordinate all four specialists to deliver a complete post-meeting package:
1. **Executive Summary** (Summarizer): Overview, key topics, attendees, notable quotes
2. **Action Items** (Action Tracker): Every commitment with owner, deadline, priority, and dependencies
3. **Decisions** (Decision Logger): Every decision made with context, impact, and status
4. **Follow-Ups** (Follow-Up Coordinator): Open questions, deferred topics, communication plan, check-in schedule

Present the recap in a clear, structured format with distinct sections.
Be thorough — nothing should fall through the cracks.
Never invent content — only work with what the transcript contains.
Attribute statements to speakers when identifiable.`;
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
  console.log(`${C.dim}  ─────────────────────────────────────────────${C.reset}`);

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
      const result = await session.sendAndWait({ prompt }, 600_000);
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
        setTimeout(resolve, 600_000);
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

  // 1. Get meeting content from the user
  const meetingContent = await getMeetingContent(rl);

  // 2. Build the prompt
  const triagePrompt = `Please provide a complete meeting recap for the following transcript. Engage all specialists — I need the executive summary, all action items, all decisions, and the follow-up plan.\n\n---\n\n${meetingContent}`;

  // Suppress noisy CLI subprocess warnings
  const origStderrWrite = process.stderr.write.bind(process.stderr);
  process.stderr.write = (chunk: any, ...args: any[]) => {
    const str = typeof chunk === 'string' ? chunk : chunk.toString();
    if (str.includes('[CLI subprocess]') || str.includes('ExperimentalWarning')) {
      return true;
    }
    return origStderrWrite(chunk, ...args);
  };

  // 3. Connect to the Squad
  console.log();
  console.log(`${C.magenta}  Connecting to your meeting recap squad...${C.reset}`);

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

    // Forward session usage events to the EventBus for cost tracking + OTel spans
    session.on('usage', ((event: any) => {
      const inputTokens = typeof event.inputTokens === 'number' ? event.inputTokens : 0;
      const outputTokens = typeof event.outputTokens === 'number' ? event.outputTokens : 0;
      const model = event.model ?? 'unknown';
      const cost = estimateCost(model, inputTokens, outputTokens);

      // Fire OTel metric counters (squad.tokens.input, .output, .cost)
      recordTokenUsage({
        type: 'usage',
        sessionId: session.sessionId,
        model,
        inputTokens,
        outputTokens,
        estimatedCost: cost,
        timestamp: new Date(),
      });

      // Forward to EventBus → CostTracker + OTel spans
      eventBus.emit({
        type: 'session:message',
        sessionId: session.sessionId,
        payload: { inputTokens, outputTokens, model, estimatedCost: cost },
        timestamp: new Date(),
      });
    }) as SquadSessionEventHandler);
    console.log(`${C.green}  ✓ Connected! Your meeting recap squad is ready.${C.reset}`);
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

  // 4. Send the meeting notes to the squad
  try {
    console.log();
    console.log(`${C.dim}  Processing meeting transcript...${C.reset}`);
    await sendAndStream(client, session, triagePrompt);
  } catch (err: any) {
    console.error(`${C.red}  Error: ${err?.message ?? err}${C.reset}`);
  }

  // Cleanup
  console.log();
  console.log(`${C.green}  ✅ Meeting recap complete!${C.reset}`);
  console.log();
  console.log(`${C.cyan}  💡 Every meeting deserves a paper trail. Now nothing falls through the cracks.${C.reset}`);
  console.log(`${C.dim}     Share the recap, assign the action items, and move forward with clarity.${C.reset}`);
  console.log();

  // Cost summary
  const summary = costTracker.getSummary();
  if (summary.totalInputTokens > 0 || summary.totalOutputTokens > 0) {
    console.log(`${C.cyan}${C.bold}  📊 Token & Cost Summary${C.reset}`);
    console.log(`${C.dim}  ─────────────────────────────────────────────${C.reset}`);
    console.log(`${C.white}  ${costTracker.formatSummary().split('\n').join(`\n  `)}${C.reset}`);
    console.log();
  }

  await telemetry.shutdown();

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


