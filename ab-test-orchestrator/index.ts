// ─── A/B Test Orchestrator — Squad Edition ───────────────────────────────────
// Reads an experiment hypothesis (typed or from a brief file) and feeds it to a
// four-agent squad (experiment designer, traffic strategist, metrics analyst,
// results interpreter) for a complete A/B test plan.

import { SquadClient } from '@bradygaster/squad-sdk/client';
import type { SquadSession, SquadSessionConfig } from '@bradygaster/squad-sdk/adapter';
import type { SquadSessionEvent, SquadSessionEventHandler } from '@bradygaster/squad-sdk/adapter';
import squadConfig from './squad.config.js';
import {
  readExperimentFile,
  readExperimentFromStdin,
  formatExperimentForPrompt,
} from './experiment-reader.js';
import type { ExperimentInput } from './experiment-reader.js';
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
  console.log(`${C.cyan}${C.bold}  🧪  A/B Test Orchestrator — Squad Edition${C.reset}`);
  console.log(`${C.dim}  ─────────────────────────────────────────${C.reset}`);
  console.log(`${C.dim}  Turn experiment hypotheses into rigorous A/B test plans.${C.reset}`);
  console.log(`${C.dim}  Four specialists: Designer · Traffic Strategist · Metrics Analyst · Results Interpreter${C.reset}`);
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
  const teamName = config.team?.name ?? 'A/B Test Orchestrator Squad';
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

You are an A/B test planning assistant powered by a squad of experimentation specialists.
When the user provides an experiment hypothesis or brief, coordinate all four specialists to deliver a complete test plan.
For broad requests ("plan this experiment"), engage all specialists: design variants, plan traffic, define metrics, and prepare the analysis framework.
For specific requests ("what sample size do I need?"), route to the right specialist.

Be structured, quantitative, and actionable. Use tables, formulas, and specific numbers.
Never fabricate data — work only with what the user provides.
When presenting the test plan, use a clear structure: hypothesis → variants → traffic plan → metrics → analysis framework.`;
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

  // 1. Read the experiment — from file path (CLI arg) or typed text
  const filePath = process.argv[2];
  let experiment: ExperimentInput;

  if (filePath) {
    console.log(`${C.magenta}  📂 Reading experiment brief from: ${filePath}${C.reset}`);
    try {
      experiment = await readExperimentFile(filePath);
      console.log(`${C.green}  ✓ Loaded ${experiment.wordCount}-word brief from ${experiment.filePath}${C.reset}`);
    } catch (err: any) {
      console.error(`${C.red}${C.bold}  Failed to read experiment brief.${C.reset}`);
      console.error(`${C.dim}  ${err?.message ?? err}${C.reset}`);
      console.error();
      console.error(`${C.yellow}  Usage:${C.reset}`);
      console.error(`${C.dim}    npm start -- experiment-briefs/homepage-cta-test.md${C.reset}`);
      console.error(`${C.dim}    npm start -- /path/to/experiment-brief.md${C.reset}`);
      console.error(`${C.dim}    npm start                                          ${C.reset}${C.dim}(type hypothesis interactively)${C.reset}`);
      process.exit(1);
    }
  } else {
    console.log(`${C.yellow}  No brief file provided. You can type your experiment hypothesis directly.${C.reset}`);
    try {
      experiment = await readExperimentFromStdin();
      console.log(`${C.green}  ✓ Received ${experiment.wordCount}-word hypothesis.${C.reset}`);
    } catch (err: any) {
      console.error(`${C.red}  ${err?.message ?? err}${C.reset}`);
      process.exit(1);
    }
  }

  // 2. Build the experiment prompt
  const experimentPrompt = formatExperimentForPrompt(experiment);

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
  console.log(`${C.magenta}  Connecting to your A/B testing squad...${C.reset}`);

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
    console.log(`${C.green}  ✓ Connected! Your A/B testing squad is ready.${C.reset}`);
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

  // 4. Send the experiment to the squad for planning
  try {
    console.log();
    console.log(`${C.dim}  Sending ${experiment.wordCount}-word brief to the squad for analysis...${C.reset}`);
    await sendAndStream(client, session, experimentPrompt);
  } catch (err: any) {
    console.error(`${C.red}  Error: ${err?.message ?? err}${C.reset}`);
  }

  // Cleanup
  console.log();
  console.log(`${C.green}  ✅ Experiment plan complete!${C.reset}`);
  console.log();
  console.log(`${C.cyan}  💡 Every great product is an experiment. Keep testing, keep learning.${C.reset}`);
  console.log();
  console.log(`${C.dim}     This sample is just the start. You could extend it to:${C.reset}`);
  console.log(`${C.dim}     • Connect to your analytics platform to pull real baseline metrics${C.reset}`);
  console.log(`${C.dim}     • Monitor live experiments and trigger early stopping alerts${C.reset}`);
  console.log(`${C.dim}     • Build an experiment history to track learnings across tests${C.reset}`);
  console.log(`${C.dim}     • Auto-generate feature flag configs for your deployment system${C.reset}`);
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


