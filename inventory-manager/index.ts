// ─── Inventory Analysis — Squad Edition ──────────────────────────────────────
// Reads a CSV inventory file and feeds it to a four-agent analysis squad
// (stock analyst, demand predictor, reorder optimizer, action reporter)
// for an actionable restock plan.

import { resolve } from 'node:path';
import { SquadClient } from '@bradygaster/squad-sdk/client';
import type { SquadSession, SquadSessionConfig } from '@bradygaster/squad-sdk/adapter';
import type { SquadSessionEvent, SquadSessionEventHandler } from '@bradygaster/squad-sdk/adapter';
import squadConfig from './squad.config.js';
import { readInventoryFile, formatInventoryForPrompt } from './inventory-reader.js';
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
  console.log(`${C.cyan}${C.bold}  📦  Inventory Analysis — Squad Edition${C.reset}`);
  console.log(`${C.dim}  ─────────────────────────────────────────${C.reset}`);
  console.log(`${C.dim}  Reads your inventory CSV and analyses it with AI.${C.reset}`);
  console.log(`${C.dim}  Four specialists: Stock Analyst · Demand Predictor · Reorder Optimizer · Action Reporter${C.reset}`);
  console.log();
}

/**
 * Extract the human-readable content from a squad response.
 * The response may be a string, or an event object with data.content.
 */
function extractContent(result: unknown): string | null {
  if (typeof result === 'string') return result;
  if (!result || typeof result !== 'object') return null;

  const obj = result as Record<string, unknown>;

  const data = obj['data'];
  if (data && typeof data === 'object') {
    const dataContent = (data as Record<string, unknown>)['content'];
    if (typeof dataContent === 'string') return dataContent;
  }

  if (typeof obj['content'] === 'string') return obj['content'];
  if (typeof obj['message'] === 'string') return obj['message'];

  return null;
}

// ═══════════════════════════════════════════════════════════════════════════════
// Build system prompt from squad config
// ═══════════════════════════════════════════════════════════════════════════════

function buildSystemPrompt(): string {
  const config = squadConfig;
  const teamName = config.team?.name ?? 'Inventory Analysis Squad';
  const teamDesc = config.team?.description ?? '';
  const projectCtx = config.team?.projectContext ?? '';

  const agentDescriptions = (config.agents ?? []).map((a) => {
    const name = a.name ?? 'agent';
    const role = a.role ?? '';
    const charter = (a.charter ?? '').trim();
    return `### ${name} — ${role}\n${charter}`;
  }).join('\n\n');

  const routingRules = (config.routing?.rules ?? []).map((r) => {
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

You are an inventory analysis assistant powered by a squad of specialists.
When the user provides inventory data, coordinate your specialists to provide a complete analysis.
For broad requests ("analyse my inventory"), engage all specialists: evaluate stock, predict demand, optimise reorders, and build an action plan.
For specific requests ("which items should I reorder from TechParts?"), route to the right specialist.

Be organised, quantitative, and actionable. Use clear sections and visual hierarchy.
Never modify inventory files — you are read-only.
When presenting analysis results, use a structured format: stock health → demand forecast → reorder recommendations → action plan.`;
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
    const ev = event as Record<string, unknown>;
    const content = (ev['content'] as string)
      ?? ((ev['data'] as Record<string, unknown> | undefined)?.['content'] as string)
      ?? '';
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
  } catch (err: unknown) {
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

  // 1. Resolve the inventory file path
  const csvArg = process.argv[2] ?? './sample-inventory.csv';
  const csvPath = resolve(csvArg);

  console.log(`${C.magenta}  📂 Reading inventory from: ${csvPath}${C.reset}`);

  // 2. Read and parse the CSV
  let items: Awaited<ReturnType<typeof readInventoryFile>>;
  try {
    items = await readInventoryFile(csvPath);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error();
    console.error(`${C.red}${C.bold}  Failed to read inventory file.${C.reset}`);
    console.error(`${C.yellow}  ${msg}${C.reset}`);
    console.error(`${C.dim}  Usage: npm start                          (uses sample-inventory.csv)${C.reset}`);
    console.error(`${C.dim}         npm start -- /path/to/inventory.csv${C.reset}`);
    process.exit(1);
  }

  console.log(`${C.green}  ✓ Loaded ${items.length} products from CSV.${C.reset}`);

  // 3. Format the inventory data for the squad
  const inventoryPrompt = formatInventoryForPrompt(items);

  // Suppress noisy CLI subprocess warnings
  const origStderrWrite = process.stderr.write.bind(process.stderr);
  process.stderr.write = (chunk: string | Uint8Array, ...args: unknown[]) => {
    const str = typeof chunk === 'string' ? chunk : new TextDecoder().decode(chunk);
    if (str.includes('[CLI subprocess]') || str.includes('ExperimentalWarning')) {
      return true;
    }
    return (origStderrWrite as (...a: unknown[]) => boolean)(chunk, ...args);
  };

  // 4. Connect to the Squad
  console.log();
  console.log(`${C.magenta}  Connecting to your inventory analysis squad...${C.reset}`);

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
    console.log(`${C.green}  ✓ Connected! Your analysis squad is ready.${C.reset}`);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);

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

    process.exit(1);
  }

  // 5. Send the inventory data to the squad for analysis
  try {
    console.log();
    console.log(`${C.dim}  Sending ${items.length} products to the squad for analysis...${C.reset}`);
    const prompt = `Please analyse this inventory data. Evaluate stock health, predict demand trends, optimise reorder quantities, and produce a prioritised action plan.\n\n${inventoryPrompt}`;
    await sendAndStream(client, session, prompt);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error(`${C.red}  Error: ${msg}${C.reset}`);
  }

  // Cleanup
  console.log();
  console.log(`${C.green}  ✅ Inventory analysis complete!${C.reset}`);
  console.log();
  console.log(`${C.cyan}  💡 This sample is just the beginning. You could extend it to:${C.reset}`);
  console.log(`${C.dim}     • Connect to Shopify or Square for live inventory data${C.reset}`);
  console.log(`${C.dim}     • Auto-generate purchase orders from the restock plan${C.reset}`);
  console.log(`${C.dim}     • Track inventory trends over time with periodic snapshots${C.reset}`);
  console.log(`${C.dim}     • Add supplier lead-time lookups for smarter reorder timing${C.reset}`);
  console.log();
  console.log(`${C.white}  The Squad SDK makes it easy to add tools that take real action.${C.reset}`);
  console.log(`${C.white}  See the README for ideas, or just start hacking!${C.reset}`);
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
}

main().catch((err: unknown) => {
  const msg = err instanceof Error ? err.message : String(err);
  console.error(`${C.red}  Fatal error: ${msg}${C.reset}`);
  process.exit(1);
});


