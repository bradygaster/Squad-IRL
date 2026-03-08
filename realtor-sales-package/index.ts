// ─── Realtor Home Sales Package Builder ──────────────────────────────────────
// Opens Redfin and Zillow in a browser, scrapes property listings for a target
// area, and feeds them to a four-agent squad that builds a client-ready
// Comparative Market Analysis (CMA) and sales package.

import { createInterface } from 'node:readline/promises';
import { stdin, stdout } from 'node:process';
import { writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { SquadClient } from '@bradygaster/squad-sdk/client';
import type { SquadSession, SquadSessionConfig } from '@bradygaster/squad-sdk/adapter';
import type { SquadSessionEvent, SquadSessionEventHandler } from '@bradygaster/squad-sdk/adapter';
import squadConfig from './squad.config.js';
import {
  launchBrowser,
  navigateToRedfin,
  navigateToZillow,
  scrapeRedfin,
  scrapeZillow,
  formatPropertiesForPrompt,
  closeBrowser,
} from './realtor-scraper.js';
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
  console.log(`${C.cyan}${C.bold}  🏡  Realtor Home Sales Package Builder${C.reset}`);
  console.log(`${C.dim}  ─────────────────────────────────────────${C.reset}`);
  console.log(`${C.dim}  Scrapes Redfin & Zillow, then builds a client-ready CMA package with AI.${C.reset}`);
  console.log(`${C.dim}  Four specialists: Market Scanner · Comp Analyst · Presentation Builder · Neighborhood Profiler${C.reset}`);
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
  const teamName = config.team?.name ?? 'Realtor Sales Package Builder Squad';
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

You are a CMA (Comparative Market Analysis) builder powered by a squad of real estate specialists.
When the user provides scraped property listings from Redfin and Zillow, coordinate your specialists to build a complete, client-ready sales package.
For broad requests ("build my CMA"), engage all specialists: scan the market, analyze comps, profile the neighborhood, and assemble the presentation.
For specific requests ("adjust the comp for the corner lot"), route to the right specialist.

Be professional, data-driven, and presentation-ready. Use clear sections and visual hierarchy.
Never fabricate listings — only work with what the user provides.
When presenting the CMA, use the standard structure: market overview → comparable analysis → neighborhood profile → pricing recommendation.
This tool produces analysis and presentations — never suggest submitting offers or contacting clients through this system.`;
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
      contentBuffer += content;
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
          contentBuffer = text;
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

  return contentBuffer;
}

// ═══════════════════════════════════════════════════════════════════════════════
// Main
// ═══════════════════════════════════════════════════════════════════════════════

async function main(): Promise<void> {
  banner();

  const rl = createInterface({ input: stdin, output: stdout });

  // 1. Ask for the target area
  const targetArea = await rl.question(
    `${C.cyan}  Enter the target area (city, zip, or neighborhood): ${C.reset}`
  );

  if (!targetArea.trim()) {
    console.log(`${C.yellow}  No area entered. Exiting.${C.reset}`);
    rl.close();
    return;
  }

  // 2. Launch Playwright browser and open Redfin
  console.log();
  console.log(`${C.magenta}  🌐 Launching browser and opening Redfin...${C.reset}`);

  let redfinPage: Awaited<ReturnType<typeof launchBrowser>>['page'];
  try {
    const result = await launchBrowser();
    redfinPage = result.page;
    await navigateToRedfin(redfinPage, targetArea.trim());
  } catch (err: any) {
    console.error();
    console.error(`${C.red}${C.bold}  Failed to launch browser.${C.reset}`);
    console.error(`${C.yellow}  Make sure Playwright is installed:${C.reset}`);
    console.error(`${C.dim}    npm install${C.reset}`);
    console.error(`${C.dim}    npx playwright install chromium${C.reset}`);
    console.error(`${C.dim}  Error: ${err?.message ?? err}${C.reset}`);
    rl.close();
    process.exit(1);
  }

  // 3. User searches on Redfin
  console.log();
  console.log(`${C.green}  🔍 Redfin is open — auto-searched for "${targetArea}".${C.reset}`);
  console.log(`${C.dim}  Adjust filters if needed (e.g. recently sold, last 6 months).${C.reset}`);
  await rl.question(`${C.cyan}  Press Enter when Redfin results look good... ${C.reset}`);

  // 4. Scrape Redfin
  console.log();
  console.log(`${C.magenta}  🔍 Scraping Redfin listings...${C.reset}`);
  const redfinListings = await scrapeRedfin(redfinPage);
  console.log(`${C.green}  ✓ Found ${redfinListings.length} listing(s) on Redfin.${C.reset}`);

  // 5. Open Zillow tab
  console.log();
  console.log(`${C.magenta}  🌐 Opening Zillow in a new tab...${C.reset}`);

  let zillowPage: Awaited<ReturnType<typeof navigateToZillow>>;
  try {
    zillowPage = await navigateToZillow(redfinPage, targetArea.trim());
  } catch (err: any) {
    console.error(`${C.yellow}  Could not open Zillow: ${err?.message ?? err}${C.reset}`);
    console.log(`${C.dim}  Continuing with Redfin data only.${C.reset}`);
    zillowPage = null as any;
  }

  let zillowListings: Awaited<ReturnType<typeof scrapeZillow>> = [];

  if (zillowPage) {
    // 6. User searches on Zillow
    console.log();
    console.log(`${C.green}  🔍 Zillow is open — auto-searched for "${targetArea}".${C.reset}`);
    console.log(`${C.dim}  Adjust filters if needed (e.g. recently sold).${C.reset}`);
    await rl.question(`${C.cyan}  Press Enter when Zillow results look good... ${C.reset}`);

    // 7. Scrape Zillow
    console.log();
    console.log(`${C.magenta}  🔍 Scraping Zillow listings...${C.reset}`);
    zillowListings = await scrapeZillow(zillowPage);
    console.log(`${C.green}  ✓ Found ${zillowListings.length} listing(s) on Zillow.${C.reset}`);
  }

  const totalListings = redfinListings.length + zillowListings.length;

  if (totalListings === 0) {
    console.log(`${C.yellow}  No listings could be scraped from either site.${C.reset}`);
    console.log(`${C.dim}  Try navigating to search results with visible listing cards and run again.${C.reset}`);
    console.log(`${C.dim}  Closing browser...${C.reset}`);
    await closeBrowser(redfinPage);
    rl.close();
    return;
  }

  // Close the browser — we have what we need
  console.log();
  console.log(`${C.dim}  Closing browser...${C.reset}`);
  await closeBrowser(redfinPage);

  // 8. Build the CMA prompt
  const initialPrompt = formatPropertiesForPrompt(redfinListings, zillowListings, targetArea.trim());

  // Suppress noisy CLI subprocess warnings
  const origStderrWrite = process.stderr.write.bind(process.stderr);
  process.stderr.write = (chunk: any, ...args: any[]) => {
    const str = typeof chunk === 'string' ? chunk : chunk.toString();
    if (str.includes('[CLI subprocess]') || str.includes('ExperimentalWarning')) {
      return true;
    }
    return origStderrWrite(chunk, ...args);
  };

  // 9. Connect to the Squad
  console.log();
  console.log(`${C.magenta}  Connecting to your CMA squad...${C.reset}`);

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
    console.log(`${C.green}  ✓ Connected! Your CMA squad is ready.${C.reset}`);
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

  // 10. Send the scraped data to the squad
  try {
    console.log();
    console.log(`${C.dim}  Sending ${totalListings} listing(s) from Redfin & Zillow to the squad...${C.reset}`);
    const cmaContent = await sendAndStream(client, session, initialPrompt);

    // Save CMA output to a markdown file
    if (cmaContent) {
      const sanitized = targetArea.trim().replace(/[^a-zA-Z0-9]+/g, '_').replace(/_+$/, '');
      const fileName = `${sanitized}_CMA_Package.md`;
      const filesDir = join(import.meta.dirname ?? process.cwd(), 'files');
      mkdirSync(filesDir, { recursive: true });
      const filePath = join(filesDir, fileName);
      writeFileSync(filePath, cmaContent, 'utf-8');
      console.log();
      console.log(`${C.green}  📄 Saved: files/${fileName}${C.reset}`);
    }
  } catch (err: any) {
    console.error(`${C.red}  Error: ${err?.message ?? err}${C.reset}`);
  }

  // Cleanup
  console.log();
  console.log(`${C.green}  ✅ Sales package assembled!${C.reset}`);
  console.log();
  console.log(`${C.cyan}  💡 Your CMA is ready to present to clients. You could extend this to:${C.reset}`);
  console.log(`${C.dim}     • Generate a PDF version of the sales package for print or email${C.reset}`);
  console.log(`${C.dim}     • Track pricing trends over time by running weekly scans${C.reset}`);
  console.log(`${C.dim}     • Add MLS data integration for more accurate comparable sales${C.reset}`);
  console.log(`${C.dim}     • Auto-populate a listing presentation template with the analysis${C.reset}`);
  console.log();
  console.log(`${C.white}  Great listings don't sell themselves — great agents with great data do.${C.reset}`);
  console.log(`${C.white}  The Squad SDK makes it easy to build the tools that set you apart.${C.reset}`);
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


