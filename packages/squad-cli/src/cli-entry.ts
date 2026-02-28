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
import { loadWelcomeData } from './cli/shell/lifecycle.js';

// Keep VERSION in index.ts (public API); import it here via re-export
import { VERSION } from '@bradygaster/squad-sdk';

/** Debug logger — writes to stderr only when SQUAD_DEBUG=1. */
function debugLog(...args: unknown[]): void {
  if (process.env['SQUAD_DEBUG'] === '1') {
    console.error('[SQUAD_DEBUG]', ...args);
  }
}

/** Check if --help or -h appears in args after the subcommand. */
function hasHelpFlag(args: string[]): boolean {
  return args.slice(1).includes('--help') || args.slice(1).includes('-h');
}

/** Per-command help text. Returns undefined for unknown commands. */
function getCommandHelp(cmd: string): string | undefined {
  const help: Record<string, string> = {
    init: `
${BOLD}squad init${RESET} — Initialize Squad

${BOLD}USAGE${RESET}
  squad init [--global] [--mode remote <path>]

${BOLD}DESCRIPTION${RESET}
  Creates the .squad/ directory structure in your project or personal directory.
  Detects your project type and scaffolds appropriate workflows and templates.

${BOLD}OPTIONS${RESET}
  --global              Create personal squad at ~/.squad/
  --mode remote <path>  Link to a remote team root (dual-root mode)

${BOLD}EXAMPLES${RESET}
  ${DIM}# Initialize Squad in current repo${RESET}
  squad init

  ${DIM}# Create personal squad${RESET}
  squad init --global

  ${DIM}# Link to shared team in parent directory${RESET}
  squad init --mode remote ../team-repo
`,
    upgrade: `
${BOLD}squad upgrade${RESET} — Update Squad Files

${BOLD}USAGE${RESET}
  squad upgrade [--global] [--migrate-directory]

${BOLD}DESCRIPTION${RESET}
  Updates Squad-owned files to the latest version. Your team state
  (team.md, decisions.md, agent history) is never modified.

${BOLD}OPTIONS${RESET}
  --global              Upgrade personal squad at ~/.squad/
  --migrate-directory   Rename .ai-team/ to .squad/ (legacy migration)

${BOLD}EXAMPLES${RESET}
  ${DIM}# Upgrade current repo's Squad files${RESET}
  squad upgrade

  ${DIM}# Upgrade personal squad${RESET}
  squad upgrade --global

  ${DIM}# Migrate from legacy .ai-team/ directory${RESET}
  squad upgrade --migrate-directory
`,
    status: `
${BOLD}squad status${RESET} — Show Active Squad

${BOLD}USAGE${RESET}
  squad status

${BOLD}DESCRIPTION${RESET}
  Displays which squad is currently active and where it's located.
  Shows repo squad, personal squad path, and resolution order.

${BOLD}EXAMPLES${RESET}
  ${DIM}# Check active squad${RESET}
  squad status
`,
    triage: `
${BOLD}squad triage${RESET} — Auto-Triage Issues

${BOLD}USAGE${RESET}
  squad triage [--interval <minutes>]
  squad watch [--interval <minutes>]    ${DIM}(alias)${RESET}

${BOLD}DESCRIPTION${RESET}
  Ralph's work monitor. Continuously polls GitHub issues and automatically
  assigns them to the right team member based on content and expertise.

${BOLD}OPTIONS${RESET}
  --interval <minutes>    Polling frequency (default: 10)

${BOLD}EXAMPLES${RESET}
  ${DIM}# Start triage with default 10-minute interval${RESET}
  squad triage

  ${DIM}# Poll every 5 minutes${RESET}
  squad triage --interval 5
`,
    copilot: `
${BOLD}squad copilot${RESET} — Manage Copilot Coding Agent

${BOLD}USAGE${RESET}
  squad copilot [--off] [--auto-assign]

${BOLD}DESCRIPTION${RESET}
  Add or remove the GitHub Copilot coding agent (@copilot) from your team.
  When enabled, @copilot can pick up issues labeled 'squad:copilot'.

${BOLD}OPTIONS${RESET}
  --off            Remove @copilot from the team
  --auto-assign    Enable automatic issue assignment for @copilot

${BOLD}EXAMPLES${RESET}
  ${DIM}# Add @copilot to the team${RESET}
  squad copilot

  ${DIM}# Add @copilot with auto-assignment enabled${RESET}
  squad copilot --auto-assign

  ${DIM}# Remove @copilot from the team${RESET}
  squad copilot --off
`,
    plugin: `
${BOLD}squad plugin${RESET} — Manage Plugin Marketplaces

${BOLD}USAGE${RESET}
  squad plugin marketplace add <owner/repo>
  squad plugin marketplace remove <name>
  squad plugin marketplace list
  squad plugin marketplace browse <name>

${BOLD}DESCRIPTION${RESET}
  Manage plugin marketplaces — registries of Squad extensions, skills,
  and agent templates.

${BOLD}EXAMPLES${RESET}
  ${DIM}# Add official Squad plugins marketplace${RESET}
  squad plugin marketplace add bradygaster/squad-plugins

  ${DIM}# List all registered marketplaces${RESET}
  squad plugin marketplace list
`,
    export: `
${BOLD}squad export${RESET} — Export Squad to JSON

${BOLD}USAGE${RESET}
  squad export [--out <path>]

${BOLD}DESCRIPTION${RESET}
  Creates a portable JSON snapshot of your entire squad — casting state,
  agent charters, accumulated history, and skills.

${BOLD}OPTIONS${RESET}
  --out <path>    Custom output path (default: squad-export.json)

${BOLD}EXAMPLES${RESET}
  ${DIM}# Export to default file${RESET}
  squad export

  ${DIM}# Export to custom location${RESET}
  squad export --out ./backups/team-backup.json
`,
    import: `
${BOLD}squad import${RESET} — Import Squad from JSON

${BOLD}USAGE${RESET}
  squad import <file> [--force]

${BOLD}DESCRIPTION${RESET}
  Restores a squad from a JSON export file. Creates .squad/ directory
  and populates it with casting state, agents, skills, and history.

${BOLD}OPTIONS${RESET}
  --force    Overwrite existing squad (archives old .squad/ first)

${BOLD}EXAMPLES${RESET}
  ${DIM}# Import into current directory${RESET}
  squad import squad-export.json

  ${DIM}# Import and overwrite existing squad${RESET}
  squad import squad-export.json --force
`,
    'scrub-emails': `
${BOLD}squad scrub-emails${RESET} — Remove Email Addresses

${BOLD}USAGE${RESET}
  squad scrub-emails [directory]

${BOLD}DESCRIPTION${RESET}
  Removes email addresses (PII) from Squad state files. Useful before
  committing to public repos or sharing exports.

${BOLD}OPTIONS${RESET}
  [directory]    Target directory (default: .squad)

${BOLD}EXAMPLES${RESET}
  ${DIM}# Scrub current squad${RESET}
  squad scrub-emails .squad

  ${DIM}# Scrub legacy .ai-team directory${RESET}
  squad scrub-emails
`,
    doctor: `
${BOLD}squad doctor${RESET} — Validate Squad Setup

${BOLD}USAGE${RESET}
  squad doctor

${BOLD}DESCRIPTION${RESET}
  Runs a 9-check diagnostic on your squad setup. Reports health of
  expected files, conventions, and directory structure.

${BOLD}EXAMPLES${RESET}
  ${DIM}# Check current squad setup${RESET}
  squad doctor
`,
    link: `
${BOLD}squad link${RESET} — Link to Remote Team

${BOLD}USAGE${RESET}
  squad link <team-repo-path>

${BOLD}DESCRIPTION${RESET}
  Links the current project to a remote team root. Enables dual-root mode
  where project-specific state lives in .squad/ and team identity lives
  in a shared location.

${BOLD}EXAMPLES${RESET}
  ${DIM}# Link to parent directory's team${RESET}
  squad link ../team-repo

  ${DIM}# Link to absolute path${RESET}
  squad link /Users/org/shared-squad
`,
    aspire: `
${BOLD}squad aspire${RESET} — Launch Aspire Dashboard

${BOLD}USAGE${RESET}
  squad aspire [--docker] [--port <number>]

${BOLD}DESCRIPTION${RESET}
  Launches the .NET Aspire dashboard for observability. Squad exports
  OpenTelemetry traces and metrics to the dashboard for real-time visibility.

${BOLD}OPTIONS${RESET}
  --docker         Force Docker mode
  --port <number>  OTLP port (default: 4317)

${BOLD}EXAMPLES${RESET}
  ${DIM}# Launch Aspire dashboard (auto-detect runtime)${RESET}
  squad aspire

  ${DIM}# Force Docker mode${RESET}
  squad aspire --docker
`,
    upstream: `
${BOLD}squad upstream${RESET} — Manage Upstream Squad Sources

${BOLD}USAGE${RESET}
  squad upstream add <source> [--name <name>] [--ref <branch>]
  squad upstream remove <name>
  squad upstream list
  squad upstream sync [name]

${BOLD}DESCRIPTION${RESET}
  Manage upstream Squad sources — external configurations from local
  directories, git repositories, or export files that can be synced
  into your squad.

${BOLD}OPTIONS${RESET}
  add <source>          Add an upstream (path, git URL, or .json export)
    --name <name>       Custom name (auto-derived if omitted)
    --ref <branch>      Git branch/tag (default: main)
  remove <name>         Remove an upstream by name
  list                  Show all configured upstreams
  sync [name]           Sync all or a specific upstream

${BOLD}EXAMPLES${RESET}
  ${DIM}# Add a git upstream${RESET}
  squad upstream add https://github.com/org/squad-config.git

  ${DIM}# Add a local upstream with custom name${RESET}
  squad upstream add ../shared-squad --name shared

  ${DIM}# Sync all upstreams${RESET}
  squad upstream sync
`,
    shell: `
${BOLD}squad shell${RESET} — Launch Interactive Shell

${BOLD}USAGE${RESET}
  squad shell [--preview] [--timeout <seconds>]

${BOLD}DESCRIPTION${RESET}
  Starts the interactive Squad REPL. Messages are routed to the
  right agent automatically based on content and team expertise.

${BOLD}OPTIONS${RESET}
  --preview              Show team summary without launching shell
  --timeout <seconds>    Set REPL inactivity timeout (default: 600)

${BOLD}EXAMPLES${RESET}
  ${DIM}# Start interactive shell${RESET}
  squad shell

  ${DIM}# Preview team before launching${RESET}
  squad shell --preview
`,
  };

  // Handle aliases
  const aliases: Record<string, string> = {
    watch: 'triage',
    loop: 'triage',
    hire: 'init',
    heartbeat: 'doctor',
  };
  const key = aliases[cmd] ?? cmd;
  return help[key];
}

async function main(): Promise<void> {
  const args = process.argv.slice(2);
  const hasGlobal = args.includes('--global');
  const rawCmd = args[0];
  const cmd = rawCmd?.trim() || undefined;

  // --timeout <seconds> → set SQUAD_REPL_TIMEOUT env var for shell
  const timeoutIdx = args.indexOf('--timeout');
  if (timeoutIdx >= 0 && args[timeoutIdx + 1]) {
    process.env['SQUAD_REPL_TIMEOUT'] = args[timeoutIdx + 1];
  }

  // Empty or whitespace-only args should show help, not launch shell
  if (rawCmd !== undefined && !cmd) {
    console.log(`\n${BOLD}squad${RESET} v${VERSION}`);
    console.log(`Your AI agent team\n`);
    console.log(`Usage: squad [command] [options]`);
    console.log(`\nRun 'squad help' for full command list.\n`);
    return;
  }

  // --version / -v / version — canonical format: bare semver
  if (cmd === '--version' || cmd === '-v' || cmd === 'version') {
    console.log(VERSION);
    return;
  }

  // --help / -h / help
  if (cmd === '--help' || cmd === '-h' || cmd === 'help') {
    console.log(`\n${BOLD}squad${RESET} v${VERSION}`);
    console.log(`Your AI agent team\n`);
    console.log(`${BOLD}Just type — squad routes your message to the right agent automatically${RESET}`);
    console.log(`  squad                  Start interactive shell`);
    console.log(`  squad --global         Use your personal squad\n`);
    console.log(`Usage: squad [command] [options]\n`);

    console.log(`${BOLD}Getting Started${RESET}`);
    console.log(`  ${BOLD}init${RESET}           Create .squad/ in this repo ${DIM}(alias: hire)${RESET}`);
    console.log(`                 --global             Create personal squad directory`);
    console.log(`                 --mode remote <path>  Link to a remote team root`);
    console.log(`  ${BOLD}upgrade${RESET}        Update Squad files to latest`);
    console.log(`                 --global             Upgrade personal squad`);
    console.log(`                 --migrate-directory  Rename .ai-team/ → .squad/`);
    console.log(`  ${BOLD}status${RESET}         Show which squad is active`);
    console.log(`  ${BOLD}doctor${RESET}         Check your setup ${DIM}(alias: heartbeat)${RESET}`);

    console.log(`\n${BOLD}Development${RESET}`);
    console.log(`  ${BOLD}shell${RESET}          Launch interactive shell`);

    console.log(`\n${BOLD}Team Management${RESET}`);
    console.log(`  ${BOLD}triage${RESET}         Watch issues and auto-triage ${DIM}(alias: watch, loop)${RESET}`);
    console.log(`                 --interval <minutes>  Polling frequency (default: 10)`);
    console.log(`  ${BOLD}copilot${RESET}        Add/remove GitHub Copilot agent`);
    console.log(`                 --off                Remove @copilot`);
    console.log(`                 --auto-assign        Enable auto-assignment`);
    console.log(`  ${BOLD}link${RESET}           Connect to a remote team`);
    console.log(`                 <team-repo-path>`);
    console.log(`  ${BOLD}upstream${RESET}       Manage upstream Squad sources`);
    console.log(`                 add|remove|list|sync`);

    console.log(`\n${BOLD}Utilities${RESET}`);
    console.log(`  ${BOLD}export${RESET}         Save squad to JSON`);
    console.log(`                 --out <path>         Output path (default: squad-export.json)`);
    console.log(`  ${BOLD}import${RESET}         Load squad from JSON`);
    console.log(`                 <file> [--force]`);
    console.log(`  ${BOLD}plugin${RESET}         Manage plugins`);
    console.log(`                 marketplace add|remove|list|browse`);
    console.log(`  ${BOLD}aspire${RESET}         Open Aspire dashboard`);
    console.log(`                 --docker             Force Docker mode`);
    console.log(`                 --port <number>      OTLP port (default: 4317)`);
    console.log(`  ${BOLD}scrub-emails${RESET}   Remove email addresses from squad state`);
    console.log(`                 [directory]          Target directory (default: .squad/)`);

    console.log(`\n${BOLD}Flags${RESET}`);
    console.log(`  --version, -v            Print version`);
    console.log(`  --help, -h               Show this help`);
    console.log(`  --preview                Show team summary without launching shell`);
    console.log(`  --global                 Use personal squad path`);
    console.log(`  --timeout <seconds>      Set REPL inactivity timeout (default: 600)`);

    console.log(`\n${BOLD}Examples${RESET}`);
    console.log(`  ${DIM}$ squad init${RESET}                          Set up a squad in this repo`);
    console.log(`  ${DIM}$ squad triage --interval 5${RESET}           Poll issues every 5 minutes`);
    console.log(`  ${DIM}$ squad export --out ./backups/team.json${RESET}`);
    console.log(`                                        Save squad snapshot`);
    console.log(`  ${DIM}$ squad copilot --auto-assign${RESET}         Add @copilot with auto-assignment`);
    console.log(`  ${DIM}$ squad doctor${RESET}                        Diagnose setup issues`);

    console.log(`\nInstallation:`);
    console.log(`  npm i --save-dev @bradygaster/squad-cli`);
    console.log(`\nInsider channel:`);
    console.log(`  npm i --save-dev @bradygaster/squad-cli@insider`);
    console.log(`\nRun 'squad <command> --help' for details.\n`);
    return;
  }

  // --preview / --dry-run — show team summary without launching the interactive shell
  if (cmd === '--preview' || cmd === '--dry-run' || (!cmd && args.includes('--preview')) || (cmd === 'shell' && args.includes('--preview'))) {
    const squadDir = resolveSquad(process.cwd());
    const globalPath = resolveGlobalSquadPath();
    const globalSquadDir = path.join(globalPath, '.squad');
    const teamRoot = squadDir ? path.dirname(squadDir) : fs.existsSync(globalSquadDir) ? globalPath : null;

    if (!teamRoot) {
      console.log(`${RED}✗${RESET} No squad found. Run 'squad init' first.`);
      process.exit(1);
    }

    const data = loadWelcomeData(teamRoot);
    if (!data) {
      console.log(`${RED}✗${RESET} Could not read team configuration.`);
      process.exit(1);
    }

    console.log(`\n${BOLD}Squad Preview${RESET}`);
    console.log(`${'─'.repeat(40)}`);
    console.log(`  Team:   ${data.projectName}`);
    console.log(`  Agents: ${data.agents.length}`);
    if (data.description) console.log(`  About:  ${data.description}`);
    if (data.focus) console.log(`  Focus:  ${data.focus}`);

    console.log(`\n${BOLD}Agents${RESET}`);
    for (const a of data.agents) {
      console.log(`  ${a.emoji} ${BOLD}${a.name}${RESET} — ${a.role}`);
    }

    console.log(`\n${BOLD}Shell Commands${RESET}`);
    console.log(`  /status    — Check your team & what's happening`);
    console.log(`  /history   — See recent messages`);
    console.log(`  /agents    — List all team members`);
    console.log(`  /sessions  — List saved sessions`);
    console.log(`  /resume    — Restore a past session`);
    console.log(`  /clear     — Clear the screen`);
    console.log(`  /quit      — Exit`);

    console.log(`\n${DIM}Run 'squad' to start the interactive shell.${RESET}\n`);
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
      // First run — no squad found. Welcome the user.
      console.log(`\n${BOLD}Welcome to Squad${RESET} v${VERSION}`);
      console.log(`Your AI agent team\n`);
      console.log(`Squad adds a team of AI agents to your project. Each agent`);
      console.log(`has a role — architect, tester, security reviewer — and they`);
      console.log(`collaborate to help you build, review, and ship code.\n`);
      console.log(`${BOLD}Get started:${RESET}`);
      console.log(`  ${BOLD}squad init${RESET}             Set up a squad in this repo`);
      console.log(`  ${BOLD}squad init --global${RESET}    Create a personal squad\n`);
      console.log(`${DIM}After init, just run ${BOLD}squad${RESET}${DIM} to start talking to your team.${RESET}`);
      console.log(`${DIM}Run ${BOLD}squad help${RESET}${DIM} for all commands.${RESET}\n`);
    }
    return;
  }

  // Per-command --help/-h: intercept before dispatching (fixes #511, #512)
  if (hasHelpFlag(args)) {
    const helpText = getCommandHelp(cmd!);
    if (helpText) {
      console.log(helpText);
      return;
    }
  }

  // Route subcommands
  // hire → alias for init (#501)
  if (cmd === 'init' || cmd === 'hire') {
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
    const dest = hasGlobal ? resolveGlobalSquadPath() : process.cwd();
    
    // Handle --migrate-directory flag
    if (migrateDir) {
      await migrateDirectory(dest);
      // Continue with regular upgrade after migration
    }
    
    // Run upgrade
    await runUpgrade(dest, { 
      migrateDirectory: migrateDir,
    });
    
    return;
  }

  // loop → alias for triage (#509)
  if (cmd === 'triage' || cmd === 'watch' || cmd === 'loop') {
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
    const targetDir = args[1] || '.squad';
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

  if (cmd === 'upstream') {
    const { upstreamCommand } = await import('./cli/commands/upstream.js');
    await upstreamCommand(args.slice(1));
    return;
  }

  // heartbeat → alias for doctor (#503)
  if (cmd === 'doctor' || cmd === 'heartbeat') {
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

  // shell → explicit REPL launch (#507)
  if (cmd === 'shell') {
    await runShell();
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
    // Show stack trace only when SQUAD_DEBUG is enabled
    if (process.env['SQUAD_DEBUG'] === '1' && err instanceof Error && err.stack) {
      console.error(`\n${DIM}${err.stack}${RESET}`);
    }
  }
  console.error(`\n${DIM}Tip: Run 'squad doctor' for help. Set SQUAD_DEBUG=1 for details.${RESET}`);
  process.exit(1);
});
