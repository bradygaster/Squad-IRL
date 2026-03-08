// ─── Bug Triage — GitHub Issues Edition ──────────────────────────────────────
// Fetches real open issues from a GitHub repo using the `gh` CLI, then feeds
// them to a four-agent triage squad (classifier, duplicate detector, triage
// advisor, summary reporter) for actionable triage results.

import { createInterface } from 'node:readline/promises';
import { stdin, stdout } from 'node:process';
import { SquadClient } from '@bradygaster/squad-sdk/client';
import type { SquadSession, SquadSessionConfig } from '@bradygaster/squad-sdk/adapter';
import type { SquadSessionEvent, SquadSessionEventHandler } from '@bradygaster/squad-sdk/adapter';
import squadConfig from './squad.config.js';
import {
  checkGhCli,
  detectRepoFromGit,
  fetchIssues,
  formatIssuesForPrompt,
} from './issue-fetcher.js';

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
  console.log(`${C.cyan}${C.bold}  🐛  Bug Triage — GitHub Issues Edition${C.reset}`);
  console.log(`${C.dim}  ─────────────────────────────────────────${C.reset}`);
  console.log(`${C.dim}  Fetches open issues from a GitHub repo and triages them with AI.${C.reset}`);
  console.log(`${C.dim}  Four specialists: Classifier · Duplicate Detector · Triage Advisor · Summary Reporter${C.reset}`);
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
// Build system prompt from squad config
// ═══════════════════════════════════════════════════════════════════════════════

function buildSystemPrompt(): string {
  const config = squadConfig;
  const teamName = config.team?.name ?? 'Bug Triage Squad';
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

You are an interactive GitHub issue triage assistant powered by a squad of specialists.
When the user provides GitHub issues, coordinate your specialists to provide a complete triage.
For broad requests ("triage these issues"), engage all specialists: classify, detect duplicates, recommend actions, and produce a summary dashboard.
For specific requests ("which are duplicates?" or "what should we fix first?"), route to the right specialist.

Be organised, decisive, and actionable. Use clear sections and visual hierarchy.
Never make up issues — only work with what the user provides.
When presenting triage results, use a structured format: classification → duplicates → triage actions → priority summary.`;
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

  // 1. Check gh CLI is installed and authenticated
  const ghError = checkGhCli();
  if (ghError) {
    console.error(`${C.red}${C.bold}  ${ghError}${C.reset}`);
    console.error(`${C.dim}  The gh CLI is required to fetch GitHub issues.${C.reset}`);
    console.error(`${C.dim}  Install: https://cli.github.com${C.reset}`);
    console.error(`${C.dim}  Then:    gh auth login${C.reset}`);
    rl.close();
    process.exit(1);
  }

  console.log(`${C.green}  ✓ GitHub CLI detected and authenticated.${C.reset}`);

  // 2. Determine which repo to triage
  const detected = detectRepoFromGit();
  let repo: string;

  if (detected) {
    console.log(`${C.dim}  Detected repo from git remote: ${detected}${C.reset}`);
    const answer = await rl.question(`${C.cyan}  Use ${detected}? (Y/n or enter owner/repo): ${C.reset}`);
    const trimmed = answer.trim();
    if (!trimmed || trimmed.toLowerCase() === 'y' || trimmed.toLowerCase() === 'yes') {
      repo = detected;
    } else {
      repo = trimmed;
    }
  } else {
    const answer = await rl.question(`${C.cyan}  Enter the GitHub repo to triage (owner/repo): ${C.reset}`);
    repo = answer.trim();
  }

  if (!repo || !repo.includes('/')) {
    console.error(`${C.red}  Invalid repo format. Expected: owner/repo${C.reset}`);
    rl.close();
    process.exit(1);
  }

  // 3. Fetch open issues
  console.log();
  console.log(`${C.magenta}  🔍 Fetching the 5 most recent open issues from ${repo}...${C.reset}`);

  let issues: ReturnType<typeof fetchIssues>;
  try {
    issues = fetchIssues(repo);
    console.log(`${C.green}  ✓ Found ${issues.length} open issue(s).${C.reset}`);
  } catch (err: any) {
    console.error(`${C.red}  Failed to fetch issues: ${err?.message ?? err}${C.reset}`);
    console.error(`${C.dim}  Make sure the repo exists and you have access.${C.reset}`);
    rl.close();
    process.exit(1);
  }

  if (issues.length === 0) {
    console.log(`${C.yellow}  No open issues found in ${repo}. Nothing to triage!${C.reset}`);
    rl.close();
    return;
  }

  // 4. Build the triage prompt
  const initialPrompt = formatIssuesForPrompt(issues, repo);

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

  // 6. Send the issues to the squad for triage
  try {
    console.log();
    console.log(`${C.dim}  Sending ${issues.length} issue(s) to the squad for triage...${C.reset}`);
    await sendAndStream(client, session, initialPrompt);
  } catch (err: any) {
    console.error(`${C.red}  Error: ${err?.message ?? err}${C.reset}`);
  }

  // Cleanup
  console.log();
  console.log(`${C.green}  ✅ Issues triaged!${C.reset}`);
  console.log();
  console.log(`${C.cyan}  💡 This sample is just the beginning. You could extend it to:${C.reset}`);
  console.log(`${C.dim}     • Auto-label issues based on classification results${C.reset}`);
  console.log(`${C.dim}     • Comment triage notes directly on each issue${C.reset}`);
  console.log(`${C.dim}     • Assign issues based on code ownership (CODEOWNERS)${C.reset}`);
  console.log(`${C.dim}     • Run on a schedule to triage new issues every morning${C.reset}`);
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

  rl.close();
}

main().catch((err) => {
  console.error(`${C.red}  Fatal error: ${err?.message ?? err}${C.reset}`);
  process.exit(1);
});