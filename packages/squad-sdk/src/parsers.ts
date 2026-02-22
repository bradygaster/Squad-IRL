/**
 * Parsers barrel — re-exports all parser functions and their result types.
 * Zero runtime code, just re-exports.
 *
 * @module parsers
 */

// --- config/markdown-migration.ts ---
export {
  parseTeamMarkdown,
  parseRoutingRulesMarkdown,
  parseDecisionsMarkdown,
  generateConfigFromParsed,
  migrateMarkdownToConfig,
} from './config/markdown-migration.js';

export type {
  ParsedAgent,
  ParsedRoutingRule,
  ParsedDecision,
  MarkdownParseResult,
  MarkdownMigrationOptions,
  MarkdownMigrationResult,
} from './config/markdown-migration.js';

// --- config/routing.ts ---
export {
  parseRoutingMarkdown,
  compileRoutingRules,
  matchRoute,
  matchIssueLabels,
} from './config/routing.js';

export type {
  CompiledRouter,
  CompiledWorkTypeRule,
  CompiledIssueRule,
  RoutingMatch,
} from './config/routing.js';

// --- agents/charter-compiler.ts ---
export {
  parseCharterMarkdown,
  compileCharter,
  compileCharterFull,
} from './agents/charter-compiler.js';

export type {
  ParsedCharter,
  CharterCompileOptions,
  CharterConfigOverrides,
  CompiledCharter,
} from './agents/charter-compiler.js';

// --- skills/skill-loader.ts ---
export {
  parseFrontmatter,
  parseSkillFile,
  loadSkillsFromDirectory,
} from './skills/skill-loader.js';

export type { SkillDefinition } from './skills/skill-loader.js';
