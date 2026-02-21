#!/usr/bin/env node

/**
 * Squad SDK — CLI entry point and exports
 * Programmable multi-agent runtime for GitHub Copilot
 */

const VERSION = '0.6.0-alpha.0';

// Export public API
export * from './config/index.js';
export * from './agents/onboarding.js';
export * from './casting/index.js';
export * from './skills/index.js';
export { selectResponseTier, getTier } from './coordinator/response-tiers.js';
export type { ResponseTier, TierName, TierContext, ModelTierSuggestion } from './coordinator/response-tiers.js';
export { loadConfig, loadConfigSync } from './runtime/config.js';
export type { ConfigLoadResult, ConfigValidationError } from './runtime/config.js';
export * from './runtime/streaming.js';
export * from './runtime/cost-tracker.js';
export * from './runtime/telemetry.js';
export * from './runtime/offline.js';
export * from './runtime/i18n.js';
export * from './runtime/benchmarks.js';
export * from './cli/index.js';
export * from './marketplace/index.js';
export * from './build/index.js';
export * from './sharing/index.js';

import { fatal } from './cli/core/errors.js';
import { BOLD, RESET } from './cli/core/output.js';

function main(): void {
  const args = process.argv.slice(2);
  const cmd = args[0];

  // --version / -v
  if (cmd === '--version' || cmd === '-v') {
    console.log(`squad ${VERSION}`);
    process.exit(0);
  }

  // --help / -h / help
  if (cmd === '--help' || cmd === '-h' || cmd === 'help') {
    console.log(`\n${BOLD}squad${RESET} v${VERSION} — Add an AI agent team to any project\n`);
    console.log(`Usage: npx github:bradygaster/squad-sdk [command]\n`);
    console.log(`Commands:`);
    console.log(`  ${BOLD}(default)${RESET}  Initialize Squad (skip files that already exist)`);
    console.log(`  ${BOLD}upgrade${RESET}    Update Squad-owned files to latest version`);
    console.log(`             Overwrites: squad.agent.md, templates dir (.squad-templates/ or .ai-team-templates/)`);
    console.log(`             Never touches: .squad/ or .ai-team/ (your team state)`);
    console.log(`             Flags: --migrate-directory (rename .ai-team/ → .squad/)`);
    console.log(`  ${BOLD}copilot${RESET}    Add/remove the Copilot coding agent (@copilot)`);
    console.log(`             Usage: copilot [--off] [--auto-assign]`);
    console.log(`  ${BOLD}watch${RESET}      Run Ralph's work monitor as a local polling process`);
    console.log(`             Usage: watch [--interval <minutes>]`);
    console.log(`             Default: checks every 10 minutes (Ctrl+C to stop)`);
    console.log(`  ${BOLD}plugin${RESET}     Manage plugin marketplaces`);
    console.log(`             Usage: plugin marketplace add|remove|list|browse`);
    console.log(`  ${BOLD}export${RESET}     Export squad to a portable JSON snapshot`);
    console.log(`             Default: squad-export.json (use --out <path> to override)`);
    console.log(`  ${BOLD}import${RESET}     Import squad from an export file`);
    console.log(`             Usage: import <file> [--force]`);
    console.log(`  ${BOLD}scrub-emails${RESET}  Remove email addresses from Squad state files`);
    console.log(`             Usage: scrub-emails [directory] (default: .ai-team/)`);
    console.log(`  ${BOLD}help${RESET}       Show this help message`);
    console.log(`\nFlags:`);
    console.log(`  ${BOLD}--version, -v${RESET}  Print version`);
    console.log(`  ${BOLD}--help, -h${RESET}     Show help`);
    console.log(`\nInsider channel: npx github:bradygaster/squad-sdk#insider\n`);
    process.exit(0);
  }

  // Route subcommands
  if (!cmd || cmd === 'init') {
    console.log(`⚠️  'init' is not yet implemented. Coming in PRD 16. See: https://github.com/bradygaster/squad-sdk/issues/164`);
    process.exit(1);
  }

  if (cmd === 'upgrade') {
    console.log(`⚠️  'upgrade' is not yet implemented. Coming in PRD 17. See: https://github.com/bradygaster/squad-sdk/issues/164`);
    process.exit(1);
  }

  if (cmd === 'watch') {
    console.log(`⚠️  'watch' is not yet implemented. Coming in PRD 18. See: https://github.com/bradygaster/squad-sdk/issues/164`);
    process.exit(1);
  }

  if (cmd === 'export') {
    console.log(`⚠️  'export' is not yet implemented. Coming in PRD 19. See: https://github.com/bradygaster/squad-sdk/issues/164`);
    process.exit(1);
  }

  if (cmd === 'import') {
    console.log(`⚠️  'import' is not yet implemented. Coming in PRD 19. See: https://github.com/bradygaster/squad-sdk/issues/164`);
    process.exit(1);
  }

  if (cmd === 'plugin') {
    console.log(`⚠️  'plugin' is not yet implemented. Coming in PRD 20. See: https://github.com/bradygaster/squad-sdk/issues/164`);
    process.exit(1);
  }

  if (cmd === 'copilot') {
    console.log(`⚠️  'copilot' is not yet implemented. Coming in PRD 21. See: https://github.com/bradygaster/squad-sdk/issues/164`);
    process.exit(1);
  }

  if (cmd === 'scrub-emails') {
    console.log(`⚠️  'scrub-emails' is not yet implemented. Coming in PRD 21. See: https://github.com/bradygaster/squad-sdk/issues/164`);
    process.exit(1);
  }

  // Unknown command
  fatal(`Unknown command: ${cmd}\n       Run 'squad help' for usage information.`);
}

main();
