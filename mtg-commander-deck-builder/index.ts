// ─── MTG Commander Deck Builder ──────────────────────────────────────────────
// Launches EDHREC in a browser, scrapes card recommendations, then hands them
// to a four-agent squad (Card Scout, Deck Architect, Synergy Analyst, Budget
// Advisor) to build a complete 100-card Commander deck. Supports follow-up
// modifications in a conversation loop.

import { createInterface } from 'node:readline/promises';
import { stdin, stdout } from 'node:process';
import { SquadClient } from '@bradygaster/squad-sdk/client';
import type { SquadSession, SquadSessionConfig } from '@bradygaster/squad-sdk/adapter';
import type { SquadSessionEvent, SquadSessionEventHandler } from '@bradygaster/squad-sdk/adapter';
import squadConfig from './squad.config.js';
import {
  launchBrowser,
  navigateToEDHREC,
  navigateToEDHRECTheme,
  scrapeRecommendedCards,
  scrapePricing,
  formatCardsForPrompt,
  closeBrowser,
} from './card-scraper.js';
import {
  saveDeck,
  loadDeck,
  formatDeckForPrompt,
  parseDeckFromResponse,
} from './deck-manager.js';
import type { DeckMetadata } from './deck-manager.js';
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
  console.log(`${C.cyan}${C.bold}  🃏  MTG Commander Deck Builder${C.reset}`);
  console.log(`${C.dim}  ─────────────────────────────────────────${C.reset}`);
  console.log(`${C.dim}  Build your dream Commander deck with AI assistance.${C.reset}`);
  console.log(`${C.dim}  Four specialists: Card Scout · Deck Architect · Synergy Analyst · Budget Advisor${C.reset}`);
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
  const teamName = config.team?.name ?? 'MTG Commander Deck Builder Squad';
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

You are an interactive MTG Commander deck building assistant powered by a squad of specialists.
When the user provides a commander name, theme, or deck concept, coordinate your specialists to build a complete 100-card Commander deck.
For broad requests ("build me a dragon deck"), engage all specialists: scout cards, architect the mana curve, analyze synergies, and advise on budget.
For specific requests ("swap out 3 expensive cards for budget alternatives"), route to the right specialist.

When building or modifying a deck, ALWAYS output the COMPLETE deck list in this structured format:

=== COMMANDER ===
1x [Commander Name]

=== CREATURES (N) ===
1x Card Name

=== INSTANTS (N) ===
1x Card Name

=== SORCERIES (N) ===
1x Card Name

=== ARTIFACTS (N) ===
1x Card Name

=== ENCHANTMENTS (N) ===
1x Card Name

=== PLANESWALKERS (N) ===
1x Card Name

=== LANDS (N) ===
1x Card Name

The deck MUST total exactly 100 cards (including the commander).
Use "1x" quantity for all cards except basic lands (which may have higher quantities).
Be organised, decisive, and explain key card choices. Use clear sections and visual hierarchy.
Never make up card names — only use real Magic: The Gathering cards.`;
}

// ═══════════════════════════════════════════════════════════════════════════════
// Send a message and stream the response, capturing full text
// ═══════════════════════════════════════════════════════════════════════════════

async function sendAndStream(
  client: SquadClient,
  session: SquadSession,
  prompt: string,
): Promise<string> {
  console.log();
  console.log(`${C.dim}  ─────────────────────────────────────────${C.reset}`);

  let receivedContent = false;
  let fullResponse = '';

  const deltaHandler: SquadSessionEventHandler = (event: SquadSessionEvent) => {
    const content = (event as any).content ?? (event as any).data?.content ?? '';
    if (content) {
      if (!receivedContent) process.stdout.write(`${C.white}`);
      receivedContent = true;
      process.stdout.write(content);
      fullResponse += content;
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
          fullResponse = text;
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

  return fullResponse;
}

// ═══════════════════════════════════════════════════════════════════════════════
// Input parsing — detect commander name vs. theme description
// ═══════════════════════════════════════════════════════════════════════════════

function parseUserInput(input: string): { type: 'commander' | 'theme'; value: string } {
  const trimmed = input.trim();

  // If input contains commas (like "Atraxa, Praetors' Voice") or is short
  // and capitalized like a proper noun, treat it as a commander name
  const looksLikeCardName =
    /^[A-Z][a-z]+(?:[,\s]+[A-Z][a-z']+)*(?:\s+(?:the|of|and)\s+[A-Z][a-z']+)*$/.test(trimmed) ||
    trimmed.includes(',');

  if (looksLikeCardName && trimmed.split(/\s+/).length <= 6) {
    return { type: 'commander', value: trimmed };
  }

  return { type: 'theme', value: trimmed };
}

// ═══════════════════════════════════════════════════════════════════════════════
// Main
// ═══════════════════════════════════════════════════════════════════════════════

async function main(): Promise<void> {
  banner();

  const rl = createInterface({ input: stdin, output: stdout });

  // 1. Ask for deck concept
  const userInput = await rl.question(
    `${C.cyan}  Describe your deck idea, or name a Commander: ${C.reset}`,
  );

  if (!userInput.trim()) {
    console.log(`${C.yellow}  No input provided. Exiting.${C.reset}`);
    rl.close();
    return;
  }

  const parsed = parseUserInput(userInput);

  // 2. Launch Playwright → navigate to EDHREC → scrape
  console.log();
  console.log(`${C.magenta}  🌐 Launching browser and opening EDHREC...${C.reset}`);

  let scrapedCards: Awaited<ReturnType<typeof scrapeRecommendedCards>> = [];
  let page: Awaited<ReturnType<typeof launchBrowser>>['page'] | null = null;

  try {
    const result = await launchBrowser();
    page = result.page;

    if (parsed.type === 'commander') {
      console.log(`${C.dim}  Navigating to commander page: ${parsed.value}${C.reset}`);
      await navigateToEDHREC(page, parsed.value);
    } else {
      console.log(`${C.dim}  Navigating to theme page: ${parsed.value}${C.reset}`);
      await navigateToEDHRECTheme(page, parsed.value);
    }

    console.log(`${C.magenta}  🔍 Scraping card recommendations...${C.reset}`);
    scrapedCards = await scrapeRecommendedCards(page);

    // Try to grab pricing data too
    const pricing = await scrapePricing(page);
    for (const card of scrapedCards) {
      const price = pricing.get(card.name);
      if (price && !card.price) card.price = price;
    }

    console.log(`${C.green}  ✓ Found ${scrapedCards.length} recommended card(s) on EDHREC.${C.reset}`);
  } catch (err: any) {
    console.error();
    console.error(`${C.red}${C.bold}  Failed to scrape EDHREC.${C.reset}`);
    console.error(`${C.yellow}  Make sure Playwright is installed:${C.reset}`);
    console.error(`${C.dim}    npm install${C.reset}`);
    console.error(`${C.dim}    npx playwright install chromium${C.reset}`);
    console.error(`${C.dim}  Error: ${err?.message ?? err}${C.reset}`);
    console.log();
    console.log(`${C.yellow}  Continuing without EDHREC data — the squad will use its own knowledge.${C.reset}`);
  }

  // 3. Close browser before starting squad session
  if (page) {
    console.log(`${C.dim}  Closing browser...${C.reset}`);
    await closeBrowser(page);
  }

  // 4. Build prompt from scraped data
  const initialPrompt = formatCardsForPrompt(scrapedCards, userInput);

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
  console.log(`${C.magenta}  Connecting to your deck-building squad...${C.reset}`);

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
    console.log(`${C.green}  ✓ Connected! Your deck-building squad is ready.${C.reset}`);
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

  // 6. Send scraped cards + user request to squad
  let currentDeckName = '';

  try {
    console.log();
    console.log(`${C.dim}  Sending ${scrapedCards.length} card recommendation(s) to the squad...${C.reset}`);
    const response = await sendAndStream(client, session, initialPrompt);

    // 7. Parse deck from response and save to disk
    const { cards, commander, theme, colors } = parseDeckFromResponse(response);

    if (cards.length > 0) {
      currentDeckName = commander || parsed.value;
      const metadata: DeckMetadata = {
        commander: commander || parsed.value,
        theme: theme || userInput,
        colors: colors.length > 0 ? colors : ['?'],
        createdAt: new Date().toISOString(),
        lastModified: new Date().toISOString(),
        totalCards: cards.reduce((sum, c) => sum + c.quantity, 0),
      };

      const { jsonPath, txtPath } = await saveDeck(currentDeckName, cards, metadata);
      console.log();
      console.log(`${C.green}  ✅ Deck saved to ${jsonPath}${C.reset}`);
      console.log(`${C.green}     and ${txtPath}${C.reset}`);
    } else {
      console.log();
      console.log(`${C.yellow}  Could not parse a deck from the response. You can try modifying below.${C.reset}`);
      currentDeckName = parsed.value;
    }
  } catch (err: any) {
    console.error(`${C.red}  Error: ${err?.message ?? err}${C.reset}`);
    currentDeckName = parsed.value;
  }

  // 8. Conversation loop for modifications
  console.log();
  console.log(`${C.dim}  ─────────────────────────────────────────${C.reset}`);
  console.log(`${C.cyan}  You can now modify your deck. Type 'done' to exit.${C.reset}`);

  while (true) {
    console.log();
    const modInput = await rl.question(
      `${C.cyan}  Modify your deck, or type 'done' to exit: ${C.reset}`,
    );

    const trimmed = modInput.trim().toLowerCase();
    if (trimmed === 'done' || trimmed === 'quit' || trimmed === 'exit') {
      break;
    }

    if (!modInput.trim()) continue;

    try {
      // Load current deck from disk
      let deckContext = '';
      try {
        const deck = await loadDeck(currentDeckName);
        deckContext = formatDeckForPrompt(deck);
      } catch {
        deckContext = '(No saved deck found — building from scratch)';
      }

      const modPrompt = `Here is my current deck:\n\n${deckContext}\n\nPlease make this modification: ${modInput}\n\nOutput the COMPLETE updated deck list in the structured format with all 100 cards.`;

      console.log(`${C.dim}  Sending modification request to the squad...${C.reset}`);
      const response = await sendAndStream(client, session, modPrompt);

      // Parse and save updated deck
      let existingCards: Awaited<ReturnType<typeof parseDeckFromResponse>>['cards'] | undefined;
      try {
        const existing = await loadDeck(currentDeckName);
        existingCards = existing.cards;
      } catch {
        // no existing deck
      }

      const { cards, commander, theme, colors } = parseDeckFromResponse(response, existingCards);

      if (cards.length > 0) {
        const metadata: DeckMetadata = {
          commander: commander || currentDeckName,
          theme: theme || userInput,
          colors: colors.length > 0 ? colors : ['?'],
          createdAt: new Date().toISOString(),
          lastModified: new Date().toISOString(),
          totalCards: cards.reduce((sum, c) => sum + c.quantity, 0),
        };

        await saveDeck(currentDeckName, cards, metadata);
        console.log();
        console.log(`${C.green}  ✅ Deck updated!${C.reset}`);
      } else {
        console.log();
        console.log(`${C.yellow}  Could not parse the updated deck. The response may not have included a full deck list.${C.reset}`);
      }
    } catch (err: any) {
      console.error(`${C.red}  Error: ${err?.message ?? err}${C.reset}`);
    }
  }

  // 9. Closing
  console.log();
  console.log(`${C.green}  ✅ Deck building complete!${C.reset}`);
  console.log();
  console.log(`${C.cyan}  💡 This sample is just the beginning. You could extend it to:${C.reset}`);
  console.log(`${C.dim}     • Connect to TCGPlayer API for real-time pricing${C.reset}`);
  console.log(`${C.dim}     • Export decks to Moxfield, Archidekt, or TappedOut format${C.reset}`);
  console.log(`${C.dim}     • Add playtest simulation to test opening hands${C.reset}`);
  console.log(`${C.dim}     • Track your collection and suggest decks from cards you own${C.reset}`);
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

  rl.close();
}

main().catch((err) => {
  console.error(`${C.red}  Fatal error: ${err?.message ?? err}${C.reset}`);
  process.exit(1);
});


