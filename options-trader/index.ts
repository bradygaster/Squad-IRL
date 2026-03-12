// ─── Options Day Trader ─────────────────────────────────────────────────────
// Opens TradingView, captures chart signals (VWAP, EMA, RSI, VIX), and sends
// them to a Squad of 4 AI specialists for pre-trade analysis on 0DTE
// debit spreads. Uses SPX by default.
//
// ⚠️ PAPER TRADE ONLY — This system NEVER places real orders.

import { createInterface } from 'node:readline/promises';
import { stdin, stdout } from 'node:process';
import { SquadClient } from '@bradygaster/squad-sdk/client';
import type { SquadSession, SquadSessionConfig } from '@bradygaster/squad-sdk/adapter';
import type { SquadSessionEvent, SquadSessionEventHandler } from '@bradygaster/squad-sdk/adapter';
import squadConfig from './squad.config.js';
import {
  launchBrowser,
  navigateToSPX,
  readChartSignals,
  formatSignalsForPrompt,
  closeBrowser,
  getDemoSignals,
  type ChartSignals,
} from './chart-reader.js';
import { initSquadTelemetry, RuntimeEventBus as EventBus, CostTracker, recordTokenUsage } from '@bradygaster/squad-sdk';

// Model pricing (USD per 1M tokens) — for cost estimation
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

// Initialize telemetry: EventBus → OTel spans + metrics + CostTracker
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
  console.log(`${C.cyan}${C.bold}  📊  Options Day Trader${C.reset}`);
  console.log(`${C.dim}  ─────────────────────────────────────────${C.reset}`);
  console.log(`${C.dim}  Opens TradingView, reads chart signals, and analyzes 0DTE debit spread opportunities.${C.reset}`);
  console.log(`${C.dim}  Signal Analyst · Risk Manager · Trade Advisor · Session Reporter${C.reset}`);
  console.log();
  console.log(`${C.red}${C.bold}  ⚠️  PAPER TRADE ONLY — No real orders are ever placed.${C.reset}`);
  console.log();
}

/**
 * Extract readable content from a Squad response.
 */
function extractContent(result: unknown): string | null {
  if (typeof result === 'string') return result;
  if (!result || typeof result !== 'object') return null;

  const obj = result as Record<string, any>;
  if (obj.data?.content && typeof obj.data.content === 'string') return obj.data.content;
  if (obj.content && typeof obj.content === 'string') return obj.content;
  if (obj.message && typeof obj.message === 'string') return obj.message;
  return null;
}

/**
 * Display a signal reading in the terminal.
 */
function displaySignal(signals: ChartSignals, index: number): void {
  const vwapIcon = signals.vwapStatus === 'ABOVE' ? '🟢' : signals.vwapStatus === 'BELOW' ? '🔴' : '🟡';
  const emaIcon = signals.emaAlignment === 'BULLISH' ? '🟢' : signals.emaAlignment === 'BEARISH' ? '🔴' : '🟡';
  const rsiIcon = signals.rsiZone === 'BULLISH' ? '🟢' : signals.rsiZone === 'BEARISH' || signals.rsiZone === 'OVERSOLD' ? '🔴' : '🟡';
  const vixIcon = signals.vixRegime === 'LOW' ? '🟢' : signals.vixRegime === 'EXTREME' ? '🔴' : '🟡';

  console.log(`${C.green}  ✓ Reading #${index}${C.reset}`);
  console.log(`${C.white}    SPX: $${signals.spxPrice.toLocaleString('en-US', { minimumFractionDigits: 2 })}${C.reset}`);
  console.log(`${C.white}    ${vwapIcon} VWAP: ${signals.vwapStatus}  ${emaIcon} EMA: ${signals.emaAlignment}  ${rsiIcon} RSI: ${signals.rsi.toFixed(1)} (${signals.rsiZone})  ${vixIcon} VIX: ${signals.vixLevel.toFixed(1)} (${signals.vixRegime})${C.reset}`);
}

// ═══════════════════════════════════════════════════════════════════════════════
// Build system prompt from squad config
// ═══════════════════════════════════════════════════════════════════════════════

function buildSystemPrompt(): string {
  const config = squadConfig;
  const teamName = config.team?.name ?? 'Options Day Trader';
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

You are a pre-trade analysis assistant powered by a squad of four specialists.
When the user provides chart signal data captured from TradingView, coordinate your specialists to produce a complete analysis.
For full analysis requests, engage all specialists: read signals, evaluate risk, make the trade call, and produce a session report.
For specific questions, route to the appropriate specialist.

CRITICAL: This is a PAPER TRADE analysis tool ONLY. Never suggest placing real orders or connecting to a broker.
All recommendations are simulated. Always include a paper trade disclaimer.

When presenting analysis, follow this order: signal assessment → risk evaluation → trade decision → session report.
Be structured, decisive, and actionable. Use tables and clear formatting.`;
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
  let demoMode = false;
  let page: Awaited<ReturnType<typeof launchBrowser>>['page'] | null = null;

  // 1. Launch browser and navigate to TradingView SPX chart
  console.log(`${C.magenta}  🌐 Launching browser → TradingView SPX chart...${C.reset}`);

  try {
    const result = await launchBrowser();
    page = result.page;
    await navigateToSPX(page);
    console.log(`${C.green}  ✓ TradingView SPX chart loaded.${C.reset}`);
  } catch (err: any) {
    console.log();
    console.log(`${C.yellow}  ⚠️  Could not open TradingView — switching to DEMO MODE.${C.reset}`);
    console.log(`${C.dim}     (${err?.message ?? 'Browser launch failed'})${C.reset}`);
    console.log(`${C.dim}     Demo mode uses realistic sample data so the Squad analysis still runs.${C.reset}`);
    demoMode = true;
  }

  // 2. Signal reading loop
  console.log();
  if (demoMode) {
    console.log(`${C.cyan}  📡 DEMO MODE — Press Enter to capture a simulated signal reading.${C.reset}`);
  } else {
    console.log(`${C.cyan}  📡 Press Enter to capture a signal reading from the chart.${C.reset}`);
  }
  console.log(`${C.dim}  Take multiple readings to observe trend development.${C.reset}`);
  console.log(`${C.dim}  Type "done" when ready for the Squad to analyze.${C.reset}`);
  console.log();

  const allSignals: ChartSignals[] = [];
  let readingCount = 0;

  while (true) {
    const input = await rl.question(
      `${C.cyan}  [Reading ${readingCount + 1}] Press Enter to capture${demoMode ? ' (demo)' : ''} or type "done": ${C.reset}`
    );

    if (input.trim().toLowerCase() === 'done') {
      break;
    }

    try {
      let signals: ChartSignals;

      if (demoMode) {
        signals = getDemoSignals();
      } else {
        console.log(`${C.magenta}  📡 Reading chart signals...${C.reset}`);
        signals = await readChartSignals(page!);
      }

      readingCount++;
      allSignals.push(signals);
      displaySignal(signals, readingCount);
      console.log(`${C.dim}    Total readings: ${allSignals.length}${C.reset}`);
      console.log();
    } catch (err: any) {
      console.log(`${C.yellow}  ⚠️  Failed to read signals: ${err?.message ?? err}${C.reset}`);

      if (!demoMode) {
        console.log(`${C.dim}     Switching to demo mode for remaining readings.${C.reset}`);
        demoMode = true;
      }
    }
  }

  if (allSignals.length === 0) {
    console.log(`${C.yellow}  No signal readings captured. Nothing to analyze.${C.reset}`);
    if (page) {
      console.log(`${C.dim}  Closing browser...${C.reset}`);
      await closeBrowser(page);
    }
    rl.close();
    return;
  }

  // 3. Close browser — we have what we need
  if (page) {
    console.log(`${C.dim}  Closing browser...${C.reset}`);
    await closeBrowser(page);
  }

  // 4. Build the analysis prompt
  const analysisPrompt = formatSignalsForPrompt(allSignals);

  // Suppress noisy CLI subprocess warnings
  const origStderrWrite = process.stderr.write.bind(process.stderr);
  process.stderr.write = (chunk: any, ...args: any[]) => {
    const str = typeof chunk === 'string' ? chunk : chunk.toString();
    if (str.includes('[CLI subprocess]') || str.includes('ExperimentalWarning')) {
      return true;
    }
    return origStderrWrite(chunk, ...args);
  };

  // 5. Connect to the Squad
  console.log();
  console.log(`${C.magenta}  🤖 Connecting to your trading analysis squad...${C.reset}`);

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

    // Forward session usage events for cost tracking + OTel
    session.on('usage', ((event: any) => {
      const inputTokens = typeof event.inputTokens === 'number' ? event.inputTokens : 0;
      const outputTokens = typeof event.outputTokens === 'number' ? event.outputTokens : 0;
      const model = event.model ?? 'unknown';
      const cost = estimateCost(model, inputTokens, outputTokens);

      recordTokenUsage({
        type: 'usage',
        sessionId: session.sessionId,
        model,
        inputTokens,
        outputTokens,
        estimatedCost: cost,
        timestamp: new Date(),
      });

      eventBus.emit({
        type: 'session:message',
        sessionId: session.sessionId,
        payload: { inputTokens, outputTokens, model, estimatedCost: cost },
        timestamp: new Date(),
      });
    }) as SquadSessionEventHandler);

    console.log(`${C.green}  ✓ Connected! Your trading analysis squad is ready.${C.reset}`);
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

  // 6. Send signal data to the Squad for analysis
  try {
    console.log();
    console.log(`${C.dim}  Sending ${allSignals.length} signal reading(s) to the squad for pre-trade analysis...${C.reset}`);
    await sendAndStream(client, session, analysisPrompt);
  } catch (err: any) {
    console.error(`${C.red}  Error: ${err?.message ?? err}${C.reset}`);
  }

  // 7. Cleanup and summary
  console.log();
  console.log(`${C.green}  ✅ Analysis complete!${C.reset}`);
  console.log();
  console.log(`${C.red}${C.bold}  ⚠️  PAPER TRADE ONLY — No real orders were placed.${C.reset}`);
  console.log();
  console.log(`${C.cyan}  💡 This sample is just the beginning. You could extend it to:${C.reset}`);
  console.log(`${C.dim}     • Connect to a paper trading API to track simulated P&L${C.reset}`);
  console.log(`${C.dim}     • Add TradingView alert webhooks for automated signal capture${C.reset}`);
  console.log(`${C.dim}     • Build a daily session journal with win rate statistics${C.reset}`);
  console.log(`${C.dim}     • Add options chain data (IV, Greeks) for strike selection${C.reset}`);
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

  rl.close();
}

main().catch((err) => {
  console.error(`${C.red}  Fatal error: ${err?.message ?? err}${C.reset}`);
  process.exit(1);
});
