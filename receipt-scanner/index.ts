// ─── Receipt Scanner & Expense Analyzer ─────────────────────────────────────
// Reads receipt files from a folder and processes them with a four-agent
// financial squad (parser, categorizer, anomaly detector, report builder)
// for a complete expense analysis.

import { SquadClient } from '@bradygaster/squad-sdk/client';
import type { SquadSession, SquadSessionConfig } from '@bradygaster/squad-sdk/adapter';
import type { SquadSessionEvent, SquadSessionEventHandler } from '@bradygaster/squad-sdk/adapter';
import { writeFile } from 'node:fs/promises';
import squadConfig from './squad.config.js';
import { scanReceipts, formatReceiptsForPrompt } from './receipt-reader.js';
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
  console.log(`${C.cyan}${C.bold}  🧾  Receipt Scanner & Expense Analyzer${C.reset}`);
  console.log(`${C.dim}  ─────────────────────────────────────────${C.reset}`);
  console.log(`${C.dim}  Reads receipt files from a folder and analyzes them with AI.${C.reset}`);
  console.log(`${C.dim}  Four specialists: Parser · Categorizer · Anomaly Detector · Report Builder${C.reset}`);
  console.log();
}

/**
 * Extract the human-readable content from a squad response.
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
// Build system prompt from squad config
// ═══════════════════════════════════════════════════════════════════════════════

function buildSystemPrompt(): string {
  const config = squadConfig;
  const teamName = config.team?.name ?? 'Receipt Scanner & Expense Analyzer Squad';
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

You are a receipt analysis assistant powered by a squad of financial specialists.
When the user provides receipt data, coordinate your specialists to provide a complete expense analysis.
For broad requests ("analyze my receipts"), engage all specialists: parse, categorize, detect anomalies, and build a report.
For specific requests ("categorize the restaurant receipt"), route to the right specialist.

Be organized, precise with numbers, and actionable. Use clear sections and visual hierarchy.
Never fabricate receipt data — only work with what the user provides.
When presenting results, follow the pipeline: parsing → categorization → anomaly detection → summary report.`;
}

// ═══════════════════════════════════════════════════════════════════════════════
// Send a message and stream the response
// ═══════════════════════════════════════════════════════════════════════════════

async function sendAndStream(
  client: SquadClient,
  session: SquadSession,
  prompt: string,
): Promise<string> {
  console.log();
  console.log(`${C.dim}  ─────────────────────────────────────────${C.reset}`);

  let receivedContent = false;
  let contentBuffer = '';

  const deltaHandler: SquadSessionEventHandler = (event: SquadSessionEvent) => {
    const content = (event as any).content ?? (event as any).data?.content ?? '';
    if (content) {
      if (!receivedContent) process.stdout.write(`${C.white}`);
      receivedContent = true;
      process.stdout.write(content);
      contentBuffer += content;
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
          contentBuffer = text;
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

  return contentBuffer;
}

// ═══════════════════════════════════════════════════════════════════════════════
// Main
// ═══════════════════════════════════════════════════════════════════════════════

async function main(): Promise<void> {
  banner();

  // Determine receipt folder: CLI arg or default to ./sample-receipts/
  const folderArg = process.argv[2];
  const receiptFolder = folderArg ?? './sample-receipts/';

  console.log(`${C.dim}  📂 Scanning folder: ${receiptFolder}${C.reset}`);

  // Read receipt files
  let receipts;
  try {
    receipts = await scanReceipts(receiptFolder);
  } catch (err: any) {
    console.error();
    console.error(`${C.red}${C.bold}  Failed to read receipts.${C.reset}`);
    console.error(`${C.yellow}  ${err?.message ?? err}${C.reset}`);
    console.error(`${C.dim}  Usage: npm start                    (uses ./sample-receipts/)${C.reset}`);
    console.error(`${C.dim}         npm start -- /path/to/receipts${C.reset}`);
    process.exit(1);
  }

  console.log(`${C.green}  ✓ Found ${receipts.length} receipt file(s): ${receipts.map(r => r.filename).join(', ')}${C.reset}`);

  if (receipts.length === 0) {
    console.log(`${C.yellow}  No receipt files found (.txt, .md, .csv, .jpg, .jpeg, .png, .gif, .bmp). Add some and try again.${C.reset}`);
    return;
  }

  // Build the analysis prompt from receipt contents
  const analysisPrompt = formatReceiptsForPrompt(receipts);

  // Suppress noisy CLI subprocess warnings
  const origStderrWrite = process.stderr.write.bind(process.stderr);
  process.stderr.write = (chunk: any, ...args: any[]) => {
    const str = typeof chunk === 'string' ? chunk : chunk.toString();
    if (str.includes('[CLI subprocess]') || str.includes('ExperimentalWarning')) {
      return true;
    }
    return origStderrWrite(chunk, ...args);
  };

  // Connect to the Squad
  console.log();
  console.log(`${C.magenta}  Connecting to your expense analysis squad...${C.reset}`);

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
    console.log(`${C.green}  ✓ Connected! Your expense analysis squad is ready.${C.reset}`);
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

    process.exit(1);
  }

  // Send receipts to the squad for analysis
  let reportContent = '';
  try {
    console.log();
    console.log(`${C.dim}  Sending ${receipts.length} receipt(s) to the squad for analysis...${C.reset}`);
    reportContent = await sendAndStream(client, session, analysisPrompt);
  } catch (err: any) {
    console.error(`${C.red}  Error: ${err?.message ?? err}${C.reset}`);
  }

  // Write markdown report to disk
  if (reportContent.length > 0) {
    try {
      await writeFile('expense-report.md', reportContent, 'utf-8');
      console.log();
      console.log(`${C.green}  📄 Report saved to expense-report.md${C.reset}`);
    } catch (err: any) {
      console.error(`${C.yellow}  ⚠️  Could not save report: ${err?.message ?? err}${C.reset}`);
    }
  }

  // Closing
  console.log();
  console.log(`${C.green}  ✅ Expense analysis complete!${C.reset}`);
  console.log();
  console.log(`${C.cyan}  💡 This sample is just the beginning. You could extend it to:${C.reset}`);
  console.log(`${C.dim}     • Connect to your bank's CSV export for automatic categorization${C.reset}`);
  console.log(`${C.dim}     • Auto-generate expense reports for accounting software${C.reset}`);
  console.log(`${C.dim}     • Track spending trends over time with scheduled runs${C.reset}`);
  console.log(`${C.dim}     • Scan paper receipts with OCR (already built in via tesseract.js!)${C.reset}`);
  console.log(`${C.dim}     • Break down multi-day hotel folios by day and category${C.reset}`);
  console.log();
  console.log(`${C.yellow}  🔒 Privacy note: Receipt data was sent to the AI model for analysis${C.reset}`);
  console.log(`${C.yellow}     but is not stored by this application. Your files were read-only.${C.reset}`);
  console.log();
  console.log(`${C.white}  The Squad SDK makes it easy to add tools that take real action.${C.reset}`);
  console.log(`${C.white}  See the README for ideas, or just start hacking!${C.reset}`);
  console.log();

  try {
    await session.close();
  } catch { /* session may already be closed */ }

  try {
    await client.disconnect();
  } catch { /* best effort */ }

  // Cost summary
  const summary = costTracker.getSummary();
  if (summary.totalInputTokens > 0 || summary.totalOutputTokens > 0) {
    console.log(`${C.cyan}${C.bold}  📊 Token & Cost Summary${C.reset}`);
    console.log(`${C.dim}  ─────────────────────────────────────────────${C.reset}`);
    console.log(`${C.white}  ${costTracker.formatSummary().split('\n').join(`\n  `)}${C.reset}`);
    console.log();
  }

  await telemetry.shutdown();
}

main().catch((err) => {
  console.error(`${C.red}  Fatal error: ${err?.message ?? err}${C.reset}`);
  process.exit(1);
});


