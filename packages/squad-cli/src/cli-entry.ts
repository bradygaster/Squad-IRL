#!/usr/bin/env node

/**
 * Squad CLI — entry point for command-line invocation.
 * Separated from src/index.ts so library consumers can import
 * the SDK without triggering CLI argument parsing or process.exit().
 *
 * SDK library exports live in src/index.ts (dist/index.js).
 */

// Load .env file if present (dev mode)
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const envPath = resolve(process.cwd(), '.env');
if (existsSync(envPath)) {
  for (const line of readFileSync(envPath, 'utf8').split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq > 0) {
      const key = trimmed.slice(0, eq).trim();
      const val = trimmed.slice(eq + 1).trim();
      if (!process.env[key]) process.env[key] = val;
    }
  }
}

import fs from 'node:fs';
import path from 'node:path';
import { fatal, SquadError } from './cli/core/errors.js';
import { BOLD, RESET, DIM, RED } from './cli/core/output.js';
import { runInit } from './cli/core/init.js';
import { resolveSquad, resolveGlobalSquadPath } from '@bradygaster/squad-sdk';
import { runShell } from './cli/shell/index.js';

// Keep VERSION in index.ts (public API); import it here via re-export
import { VERSION } from '@bradygaster/squad-sdk';

/** Debug logger — writes to stderr only when SQUAD_DEBUG=1. */
function debugLog(...args: unknown[]): void {
  if (process.env['SQUAD_DEBUG'] === '1') {
    console.error('[SQUAD_DEBUG]', ...args);
  }
}

async function main(): Promise<void> {
  const args = process.argv.slice(2);
  const hasGlobal = args.includes('--global');
  const rawCmd = args[0];
  const cmd = rawCmd?.trim() || undefined;

  // Empty or whitespace-only args should show help, not launch shell
  if (rawCmd !== undefined && !cmd) {
    console.log(`\n${BOLD}squad${RESET} v${VERSION}`);
    console.log(`Add an AI agent team to any project\n`);
    console.log(`Usage: squad [command] [options]`);
    console.log(`\nRun 'squad help' for full command list.\n`);
    return;
  }

  // --version / -v
  if (cmd === '--version' || cmd === '-v') {
    console.log(VERSION);
    return;
  }

  // --help / -h / help
  if (cmd === '--help' || cmd === '-h' || cmd === 'help') {
    console.log(`\n${BOLD}squad${RESET} v${VERSION}`);
    console.log(`Team of AI agents at your fingertips\n`);
    console.log(`${BOLD}Just type — squad routes your message to the right agent automatically${RESET}`);
    console.log(`  squad                  Start interactive shell`);
    console.log(`  squad --global         Use your personal squad\n`);
    console.log(`Usage: squad [command] [options]\n`);
    console.log(`Commands:`);
    console.log(`  ${BOLD}init${RESET}       Create .squad/ in this repo`);
    console.log(`             --global  Create personal squad directory`);
    console.log(`             --mode remote <path>`);
    console.log(`               Link to a remote team root`);
    console.log(`  ${BOLD}upgrade${RESET}    Update Squad files to latest`);
    console.log(`             Your .squad/ directory is never touched`);
    console.log(`             --global          Upgrade personal squad`);
    console.log(`             --migrate-directory`);
    console.log(`               Rename .ai-team/ → .squad/`);
    console.log(`  ${BOLD}status${RESET}     Show which squad is active`);
    console.log(`  ${BOLD}triage${RESET}     Scan issues and categorize`);
    console.log(`             [--interval <minutes>] (default: 10)`);
    console.log(`  ${BOLD}copilot${RESET}    Add/remove GitHub Copilot agent`);
    console.log(`             [--off] [--auto-assign]`);
    console.log(`  ${BOLD}plugin${RESET}     Manage plugins`);
    console.log(`             marketplace add|remove|list|browse`);
    console.log(`  ${BOLD}export${RESET}     Save squad to JSON`);
    console.log(`             [--out <path>] (default: squad-export.json)`);
    console.log(`  ${BOLD}import${RESET}     Load squad from JSON`);
    console.log(`             <file> [--force]`);
    console.log(`  ${BOLD}scrub-emails${RESET}`);
    console.log(`             Remove email addresses from squad state`);
    console.log(`             [directory] (default: .ai-team/)`);
    console.log(`  ${BOLD}doctor${RESET}     Check your setup`);
    console.log(`  ${BOLD}link${RESET}       Connect to a remote team`);
    console.log(`             <team-repo-path>`);
    console.log(`  ${BOLD}aspire${RESET}     Open Aspire dashboard`);
    console.log(`             --docker  Force Docker`);
    console.log(`             --port <number>  OTLP port`);
    console.log(`  ${BOLD}help${RESET}       Show this message`);
    console.log(`\nFlags:`);
    console.log(`  ${BOLD}--version, -v${RESET}  Print version`);
    console.log(`  ${BOLD}--help, -h${RESET}     Show this help`);
    console.log(`  ${BOLD}--global${RESET}       Use personal squad path`);
    console.log(`\nInstallation:`);
    console.log(`  npm i --save-dev @bradygaster/squad-cli`);
    console.log(`\nInsider channel:`);
    console.log(`  npm i --save-dev @bradygaster/squad-cli@insider\n`);
    return;
  }

  // No args → check if .squad/ exists
  if (!cmd) {
    const squadPath = resolveSquad(process.cwd());
    const globalPath = resolveGlobalSquadPath();
    const globalSquadDir = path.join(globalPath, '.squad');
    const hasSquad = squadPath || fs.existsSync(globalSquadDir);
    
    if (hasSquad) {
      // Squad exists, launch shell
      await runShell();
    } else {
      // No squad found, show helpful message and suggest init
      console.log(`\n${BOLD}squad${RESET} v${VERSION}`);
      console.log(`Add an AI agent team to any project\n`);
      console.log(`No squad found here. Get started with:`);
      console.log(`  ${BOLD}squad init${RESET}       Create .squad/ in this repo`);
      console.log(`  ${BOLD}squad init --global${RESET}  Create personal squad\n`);
      console.log(`Or run ${BOLD}squad help${RESET} for all commands.\n`);
    }
    return;
  }

  // Route subcommands
  if (cmd === 'init') {
    const modeIdx = args.indexOf('--mode');
    const mode = (modeIdx !== -1 && args[modeIdx + 1]) ? args[modeIdx + 1] : 'local';
    const dest = hasGlobal ? resolveGlobalSquadPath() : process.cwd();

    if (mode === 'remote') {
      const { writeRemoteConfig } = await import('./cli/commands/init-remote.js');
      // teamRoot can be provided as the next positional arg after --mode remote
      const teamRootArg = args.find((a, i) => i > 0 && a !== '--mode' && a !== 'remote' && a !== '--global' && a !== 'init');
      if (!teamRootArg) {
        fatal('squad init --mode remote <team-root-path>');
      }
      writeRemoteConfig(dest, teamRootArg);
    }

    await runInit(dest);
    return;
  }

  if (cmd === 'link') {
    const { runLink } = await import('./cli/commands/link.js');
    const linkTarget = args[1];
    if (!linkTarget) {
      fatal('Run: squad link <team-repo-path>');
    }
    runLink(process.cwd(), linkTarget);
    return;
  }

  if (cmd === 'upgrade') {
    const { runUpgrade } = await import('./cli/core/upgrade.js');
    const { migrateDirectory } = await import('./cli/core/migrate-directory.js');
    
    const migrateDir = args.includes('--migrate-directory');
    const selfUpgrade = args.includes('--self');
    const dest = hasGlobal ? resolveGlobalSquadPath() : process.cwd();
    
    // Handle --migrate-directory flag
    if (migrateDir) {
      await migrateDirectory(dest);
      // Continue with regular upgrade after migration
    }
    
    // Run upgrade
    await runUpgrade(dest, { 
      migrateDirectory: migrateDir,
      self: selfUpgrade
    });
    
    return;
  }

  if (cmd === 'triage' || cmd === 'watch') {
    const { runWatch } = await import('./cli/commands/watch.js');
    const intervalIdx = args.indexOf('--interval');
    const intervalMinutes = (intervalIdx !== -1 && args[intervalIdx + 1])
      ? parseInt(args[intervalIdx + 1]!, 10)
      : 10;
    await runWatch(process.cwd(), intervalMinutes);
    return;
  }

  if (cmd === 'export') {
    const { runExport } = await import('./cli/commands/export.js');
    const outIdx = args.indexOf('--out');
    const outPath = (outIdx !== -1 && args[outIdx + 1]) ? args[outIdx + 1] : undefined;
    await runExport(process.cwd(), outPath);
    return;
  }

  if (cmd === 'import') {
    const { runImport } = await import('./cli/commands/import.js');
    const importFile = args[1];
    if (!importFile) {
      fatal('Run: squad import <file> [--force]');
    }
    const hasForce = args.includes('--force');
    await runImport(process.cwd(), importFile, hasForce);
    return;
  }

  if (cmd === 'plugin') {
    const { runPlugin } = await import('./cli/commands/plugin.js');
    await runPlugin(process.cwd(), args.slice(1));
    return;
  }

  if (cmd === 'copilot') {
    const { runCopilot } = await import('./cli/commands/copilot.js');
    const isOff = args.includes('--off');
    const autoAssign = args.includes('--auto-assign');
    await runCopilot(process.cwd(), { off: isOff, autoAssign });
    return;
  }

  if (cmd === 'scrub-emails') {
    const { scrubEmails } = await import('./cli/core/email-scrub.js');
    const targetDir = args[1] || '.ai-team';
    const count = await scrubEmails(targetDir);
    if (count > 0) {
      console.log(`Scrubbed ${count} email${count !== 1 ? 's' : ''}.`);
    } else {
      console.log('No emails found.');
    }
    return;
  }

  if (cmd === 'aspire') {
    const { runAspire } = await import('./cli/commands/aspire.js');
    const useDocker = args.includes('--docker');
    const portIdx = args.indexOf('--port');
    const port = (portIdx !== -1 && args[portIdx + 1]) ? parseInt(args[portIdx + 1]!, 10) : undefined;
    await runAspire({ docker: useDocker, port });
    return;
  }

  if (cmd === 'doctor') {
    const { doctorCommand } = await import('./cli/commands/doctor.js');
    await doctorCommand(process.cwd());
    return;
  }

  if (cmd === 'status') {
    const repoSquad = resolveSquad(process.cwd());
    const globalPath = resolveGlobalSquadPath();
    const globalSquadDir = path.join(globalPath, '.squad');
    const globalExists = fs.existsSync(globalSquadDir);

    console.log(`\n${BOLD}Squad Status${RESET}\n`);

    if (repoSquad) {
      console.log(`  Here:  ${BOLD}repo${RESET} (in .squad/)`);
      console.log(`  Path:  ${repoSquad}`);
    } else if (globalExists) {
      console.log(`  Here:  ${BOLD}personal${RESET} (global)`);
      console.log(`  Path:  ${globalSquadDir}`);
    } else {
      console.log(`  Here:  ${DIM}none${RESET}`);
      console.log(`  Hint:  Run 'squad init' to get started`);
    }

    console.log();
    console.log(`  ${DIM}Repo squad:   ${repoSquad ?? 'not found'}${RESET}`);
    console.log(`  ${DIM}Global:       ${globalPath}${RESET}`);
    console.log();

    return;
  }

  // Unknown command
  fatal(`Unknown command: ${cmd}. Run 'squad help' for commands.`);
}

main().catch(err => {
  debugLog('Fatal CLI error:', err);
  if (err instanceof SquadError) {
    console.error(`${RED}✗${RESET} ${err.message}`);
  } else {
    const msg = err instanceof Error ? err.message : String(err);
    const friendly = msg.replace(/^Error:\s*/i, '');
    console.error(`${RED}✗${RESET} ${friendly}`);
  }
  console.error(`\n${DIM}Tip: Run 'squad doctor' for help. Set SQUAD_DEBUG=1 for details.${RESET}`);
  process.exit(1);
});
