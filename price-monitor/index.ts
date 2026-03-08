// ─── Price Monitor & Deal Finder ──────────────────────────────────────────────
// Opens a browser, user navigates to any shopping page (Amazon wishlist,
// Best Buy deals, etc.), presses Enter, and the app scrapes product names
// + prices. A squad of 4 agents then analyzes the deals.

import { createInterface } from 'node:readline/promises';
import { stdin, stdout } from 'node:process';
import { SquadClient } from '@bradygaster/squad-sdk/client';
import type { SquadSession, SquadSessionConfig } from '@bradygaster/squad-sdk/adapter';
import type { SquadSessionEvent, SquadSessionEventHandler } from '@bradygaster/squad-sdk/adapter';
import squadConfig from './squad.config.js';
import {
  launchBrowser,
  navigateToStore,
  scrapeProducts,
  formatProductsForPrompt,
  closeBrowser,
  type ScrapedProduct,
} from './price-scraper.js';
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
  console.log(`${C.cyan}${C.bold}  💰  Price Monitor & Deal Finder${C.reset}`);
  console.log(`${C.dim}  ─────────────────────────────────────────${C.reset}`);
  console.log(`${C.dim}  Opens a browser, scrapes product prices, and analyzes deals with AI.${C.reset}`);
  console.log(`${C.dim}  Four specialists: Price Analyst · Deal Scorer · Purchase Advisor · Summary Reporter${C.reset}`);
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
  const teamName = config.team?.name ?? 'Price Monitor Squad';
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

You are an interactive deal analysis assistant powered by a squad of specialists.
When the user provides scraped product data from a shopping page, coordinate your specialists to provide a complete deal analysis.
For broad requests ("analyze these deals"), engage all specialists: assess prices, score deals, recommend buy/wait/skip, and produce a summary.
For specific requests ("is this headphone deal any good?"), route to the right specialist.

CRITICAL: You are READ-ONLY. Never suggest making purchases, adding to cart, or taking any action on shopping sites.
Only analyze prices and advise. Be organised, decisive, and actionable. Use clear sections and visual hierarchy.
Never make up products — only work with what the user provides.
When presenting analysis, use a structured format: price assessment → deal score → recommendation → summary report.`;
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

  // 1. Launch Playwright browser
  console.log();
  console.log(`${C.magenta}  �� Launching browser...${C.reset}`);

  let page: Awaited<ReturnType<typeof launchBrowser>>['page'];
  try {
    const result = await launchBrowser();
    page = result.page;
    await navigateToStore(page);
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

  // 2. Scrape loop — user navigates to pages and presses Enter to scrape
  console.log();
  console.log(`${C.green}  🛒 Browser is open.${C.reset}`);
  console.log(`${C.dim}  Navigate to any shopping page (Amazon wishlist, Best Buy deals, etc.)${C.reset}`);
  console.log(`${C.dim}  Press Enter to scrape the current page. Type "done" when finished.${C.reset}`);
  console.log();

  const allProducts: ScrapedProduct[] = [];
  let pageCount = 0;

  while (true) {
    const input = await rl.question(`${C.cyan}  [Page ${pageCount + 1}] Press Enter to scrape (or type "done"): ${C.reset}`);

    if (input.trim().toLowerCase() === 'done') {
      break;
    }

    console.log(`${C.magenta}  🔍 Scraping products from current page...${C.reset}`);

    const pageUrl = page.url();
    const products = await scrapeProducts(page);
    pageCount++;

    if (products.length === 0) {
      console.log(`${C.yellow}  No products found on this page. Try navigating to a product listing.${C.reset}`);
      console.log(`${C.dim}  Navigate to another page and press Enter, or type "done".${C.reset}`);
      continue;
    }

    console.log(`${C.green}  ✓ Found ${products.length} product(s) on page ${pageCount}.${C.reset}`);
    for (const p of products) {
      allProducts.push(p);
    }

    console.log(`${C.dim}  Total products so far: ${allProducts.length}${C.reset}`);
    console.log(`${C.dim}  Navigate to another page and press Enter, or type "done".${C.reset}`);
  }

  if (allProducts.length === 0) {
    console.log(`${C.yellow}  No products were scraped. Nothing to analyze.${C.reset}`);
    console.log(`${C.dim}  Closing browser...${C.reset}`);
    await closeBrowser(page);
    rl.close();
    return;
  }

  // 3. Close browser — we have what we need
  const lastPageUrl = page.url();
  console.log(`${C.dim}  Closing browser...${C.reset}`);
  await closeBrowser(page);

  // 4. Build the analysis prompt
  const initialPrompt = formatProductsForPrompt(allProducts, lastPageUrl);

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
  console.log(`${C.magenta}  Connecting to your deal analysis squad...${C.reset}`);

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
    console.log(`${C.green}  ✓ Connected! Your deal analysis squad is ready.${C.reset}`);
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

  // 6. Send the scraped products to the squad for analysis
  try {
    console.log();
    console.log(`${C.dim}  Sending ${allProducts.length} product(s) to the squad for deal analysis...${C.reset}`);
    await sendAndStream(client, session, initialPrompt);
  } catch (err: any) {
    console.error(`${C.red}  Error: ${err?.message ?? err}${C.reset}`);
  }

  // Cleanup
  console.log();
  console.log(`${C.green}  ✅ Deal analysis complete!${C.reset}`);
  console.log();
  console.log(`${C.cyan}  💡 This sample is just the beginning. You could extend it to:${C.reset}`);
  console.log(`${C.dim}     • Track prices over time and alert on drops${C.reset}`);
  console.log(`${C.dim}     • Compare the same product across multiple retailer tabs${C.reset}`);
  console.log(`${C.dim}     • Set a budget and get the best combination of items within it${C.reset}`);
  console.log(`${C.dim}     • Run on a schedule to catch flash deals automatically${C.reset}`);
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

