/**
 * Markdown-to-Config Migration
 *
 * Converts legacy .ai-team/ markdown files (team.md, routing.md, decisions.md)
 * into a typed SquadConfig object, enabling migration from the markdown-driven
 * workflow to the typed squad.config.ts format.
 *
 * @module config/markdown-migration
 */

import { normalizeEol } from '../utils/normalize-eol.js';

import type {
  SquadConfig,
  RoutingConfig,
  RoutingRule,
  ModelSelectionConfig,
} from '../runtime/config.js';
import { DEFAULT_CONFIG } from '../runtime/config.js';

// ============================================================================
// Parsed Markdown Types
// ============================================================================

/**
 * Agent info extracted from team.md.
 */
export interface ParsedAgent {
  /** Agent name (kebab-case) */
  name: string;
  /** Agent role */
  role: string;
  /** Skills / capabilities */
  skills: string[];
  /** Preferred model (if specified) */
  model?: string;
  /** Status */
  status?: string;
  /** Alternative names / aliases */
  aliases?: string[];
  /** Whether this agent is auto-assigned to matching work */
  autoAssign?: boolean;
}

/**
 * Routing rule extracted from routing.md.
 */
export interface ParsedRoutingRule {
  /** Work type or pattern */
  workType: string;
  /** Target agents */
  agents: string[];
  /** Example descriptions */
  examples?: string[];
}

/**
 * Decision extracted from decisions.md.
 */
export interface ParsedDecision {
  /** Decision title */
  title: string;
  /** Decision body / description */
  body: string;
  /** Whether this decision affects configuration */
  configRelevant: boolean;
  /** ISO 8601 date extracted from heading (e.g. "2026-02-21") */
  date?: string;
  /** Author extracted from **By:** lines */
  author?: string;
  /** Heading depth (2 for ##, 3 for ###) */
  headingLevel?: number;
}

/**
 * Complete result of parsing all markdown files.
 */
export interface MarkdownParseResult {
  /** Agents parsed from team.md */
  agents: ParsedAgent[];
  /** Routing rules parsed from routing.md */
  routingRules: ParsedRoutingRule[];
  /** Decisions parsed from decisions.md */
  decisions: ParsedDecision[];
  /** Warnings about unparseable sections */
  warnings: string[];
}

/**
 * Options for markdown migration.
 */
export interface MarkdownMigrationOptions {
  /** Content of team.md (may be undefined if file missing) */
  teamMd?: string;
  /** Content of routing.md (may be undefined if file missing) */
  routingMd?: string;
  /** Content of decisions.md (may be undefined if file missing) */
  decisionsMd?: string;
  /** Base config to merge into (defaults to DEFAULT_CONFIG) */
  baseConfig?: Partial<SquadConfig>;
}

/**
 * Result of a markdown migration.
 */
export interface MarkdownMigrationResult {
  /** Generated SquadConfig */
  config: SquadConfig;
  /** Parse result with all extracted data */
  parsed: MarkdownParseResult;
  /** Sections that were successfully migrated */
  migratedSections: string[];
  /** Sections that were skipped or missing */
  skippedSections: string[];
}

// ============================================================================
// team.md Parsing
// ============================================================================

/**
 * Parses team.md content into agent configurations.
 *
 * Supports two formats:
 * 1. Table format: | Name | Role | Skills | Model |
 * 2. Section format: ## Agent Name \n Role: ... \n Skills: ...
 *
 * @param content - Raw team.md content
 * @returns Array of parsed agents and any warnings
 */
export function parseTeamMarkdown(content: string): { agents: ParsedAgent[]; warnings: string[] } {
  content = normalizeEol(content);
  const agents: ParsedAgent[] = [];
  const warnings: string[] = [];

  if (!content || !content.trim()) {
    return { agents, warnings };
  }

  const lines = content.split('\n');

  // Try table format first
  const tableAgents = parseTeamTable(lines);
  if (tableAgents.length > 0) {
    return { agents: tableAgents, warnings };
  }

  // Fall back to section format
  let currentAgent: Partial<ParsedAgent> | null = null;
  let inRoster = false;

  for (const line of lines) {
    const trimmed = line.trim();

    // Detect roster / team section
    if (/^##\s+(roster|team\s+members?|agents?)/i.test(trimmed)) {
      inRoster = true;
      continue;
    }

    // New section header (not roster-related) — stop
    if (inRoster && /^##\s+/.test(trimmed) && !/roster|team|agent/i.test(trimmed)) {
      if (currentAgent?.name) {
        agents.push(finalizeAgent(currentAgent));
      }
      currentAgent = null;
      inRoster = false;
      continue;
    }

    // Agent header (### Agent Name or **Agent Name**)
    if (inRoster && (/^###\s+/.test(trimmed) || /^\*\*[^*]+\*\*/.test(trimmed))) {
      if (currentAgent?.name) {
        agents.push(finalizeAgent(currentAgent));
      }

      const nameMatch = trimmed.match(/^###\s+(.+)/) || trimmed.match(/^\*\*([^*]+)\*\*/);
      currentAgent = { name: kebabCase(nameMatch?.[1] ?? ''), skills: [] };
      continue;
    }

    // Key-value lines within an agent section
    if (currentAgent) {
      // Match patterns like: - **Role:** Lead, - Role: Lead, * **Skills:** x, y
      const kvMatch = trimmed.match(/^[-*]*\s*\*{0,2}(role|skills?|model|status|preferred\s*model|aliases?|auto[-\s]*assign)\s*:?\s*\*{0,2}\s*:?\s*(.+)/i);
      if (kvMatch) {
        const key = kvMatch[1]!.toLowerCase().replace(/[\s-]+/g, '');
        const value = kvMatch[2]!.replace(/^\*+\s*/, '').trim();

        switch (key) {
          case 'role':
            currentAgent.role = value;
            break;
          case 'skill':
          case 'skills':
            currentAgent.skills = value.split(',').map((s) => s.trim()).filter(Boolean);
            break;
          case 'model':
          case 'preferredmodel':
            currentAgent.model = value;
            break;
          case 'status':
            currentAgent.status = value;
            break;
          case 'alias':
          case 'aliases':
            currentAgent.aliases = value.split(',').map((s) => s.trim()).filter(Boolean);
            break;
          case 'autoassign':
            currentAgent.autoAssign = /^(yes|true|1)$/i.test(value);
            break;
        }
      }
    }
  }

  // Flush last agent
  if (currentAgent?.name) {
    agents.push(finalizeAgent(currentAgent));
  }

  if (agents.length === 0) {
    warnings.push('Could not parse any agents from team.md');
  }

  return { agents, warnings };
}

/**
 * Parses a markdown table for agent rows.
 */
function parseTeamTable(lines: string[]): ParsedAgent[] {
  const agents: ParsedAgent[] = [];
  let headerCols: string[] | null = null;

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed.startsWith('|')) continue;

    const cells = trimmed.split('|').map((c) => c.trim()).filter(Boolean);

    // Detect header row
    if (!headerCols && cells.some((c) => /name/i.test(c))) {
      headerCols = cells.map((c) => c.toLowerCase());
      continue;
    }

    // Skip separator row
    if (cells.every((c) => /^[-:]+$/.test(c))) continue;

    if (headerCols && cells.length >= 2) {
      const get = (key: string) => {
        const idx = headerCols!.findIndex((h) => h.includes(key));
        return idx >= 0 && idx < cells.length ? cells[idx] : undefined;
      };

      const name = get('name');
      if (!name) continue;

      agents.push({
        name: kebabCase(name),
        role: get('role') ?? 'developer',
        skills: (get('skill') ?? '').split(',').map((s) => s.trim()).filter(Boolean),
        model: get('model') || undefined,
        status: get('status') || undefined,
        aliases: get('alias') ? get('alias')!.split(',').map((s) => s.trim()).filter(Boolean) : undefined,
        autoAssign: get('auto') !== undefined ? /^(yes|true|1)$/i.test(get('auto') ?? '') : undefined,
      });
    }
  }

  return agents;
}

// ============================================================================
// routing.md Parsing
// ============================================================================

/**
 * Parses routing.md content into routing rules.
 *
 * Expected table format:
 * | Work Type | Route To | Examples |
 * |-----------|----------|----------|
 * | feature-dev | Lead | New features |
 *
 * @param content - Raw routing.md content
 * @returns Parsed routing rules and warnings
 */
export function parseRoutingRulesMarkdown(
  content: string,
): { rules: ParsedRoutingRule[]; warnings: string[] } {
  content = normalizeEol(content);
  const rules: ParsedRoutingRule[] = [];
  const warnings: string[] = [];

  if (!content || !content.trim()) {
    return { rules, warnings };
  }

  const lines = content.split('\n');
  let inTable = false;
  let headerPassed = false;

  for (const line of lines) {
    const trimmed = line.trim();

    // Detect routing table
    if (/##\s*routing\s*table/i.test(trimmed)) {
      inTable = true;
      headerPassed = false;
      continue;
    }

    // New section ends the table
    if (inTable && /^##\s+/.test(trimmed) && !/routing\s*table/i.test(trimmed)) {
      inTable = false;
      continue;
    }

    if (inTable && trimmed.startsWith('|')) {
      // Header row
      if (/work\s*type|pattern/i.test(trimmed)) {
        headerPassed = true;
        continue;
      }
      // Separator
      if (/^[|:\-\s]+$/.test(trimmed)) continue;

      if (!headerPassed) continue;

      const cells = trimmed.split('|').map((c) => c.trim()).filter(Boolean);
      if (cells.length >= 2) {
        const workType = cells[0];
        const agents = cells[1]!.split(',').map((a) => a.trim()).filter(Boolean);
        const examples =
          cells.length >= 3
            ? cells[2]!.split(',').map((e) => e.trim()).filter(Boolean)
            : undefined;

        if (workType && agents.length > 0) {
          rules.push({ workType, agents, examples });
        }
      }
    }
  }

  if (rules.length === 0) {
    warnings.push('Could not parse any routing rules from routing.md');
  }

  return { rules, warnings };
}

// ============================================================================
// decisions.md Parsing
// ============================================================================

/**
 * Parses decisions.md content to extract config-relevant decisions.
 *
 * Looks for headings that denote individual decisions and checks body text
 * for config-relevant keywords (model, routing, governance, tier, agent).
 *
 * @param content - Raw decisions.md content
 * @returns Parsed decisions and warnings
 */
export function parseDecisionsMarkdown(
  content: string,
): { decisions: ParsedDecision[]; warnings: string[] } {
  content = normalizeEol(content);
  const decisions: ParsedDecision[] = [];
  const warnings: string[] = [];

  if (!content || !content.trim()) {
    return { decisions, warnings };
  }

  const lines = content.split('\n');
  let currentTitle: string | null = null;
  let currentHeadingLevel: number | undefined;
  let currentDate: string | undefined;
  let bodyLines: string[] = [];

  const CONFIG_KEYWORDS = /\b(model|routing|governance|tier|agent|fallback|config|migration)\b/i;
  const DATE_IN_HEADING = /^(\d{4}-\d{2}-\d{2}):\s*(.+)/;
  const AUTHOR_LINE = /^\*\*By:\*\*\s*(.+)/i;

  const flush = () => {
    if (currentTitle) {
      const body = bodyLines.join('\n').trim();
      const configRelevant = CONFIG_KEYWORDS.test(currentTitle) || CONFIG_KEYWORDS.test(body);

      // Extract author from body lines
      let author: string | undefined;
      for (const bl of bodyLines) {
        const authorMatch = bl.trim().match(AUTHOR_LINE);
        if (authorMatch) {
          author = authorMatch[1]!.trim();
          break;
        }
      }

      const decision: ParsedDecision = { title: currentTitle, body, configRelevant };
      if (currentDate) decision.date = currentDate;
      if (author) decision.author = author;
      if (currentHeadingLevel !== undefined) decision.headingLevel = currentHeadingLevel;

      decisions.push(decision);
    }
    currentTitle = null;
    currentDate = undefined;
    currentHeadingLevel = undefined;
    bodyLines = [];
  };

  for (const line of lines) {
    const trimmed = line.trim();

    const headingMatch = trimmed.match(/^(###?)\s+(.+)/);
    if (headingMatch) {
      flush();
      const hashes = headingMatch[1]!;
      let titleText: string = headingMatch[2]!;
      currentHeadingLevel = hashes.length;

      // Extract date from heading like "### 2026-02-21: Title"
      const dateMatch = titleText.match(DATE_IN_HEADING);
      if (dateMatch) {
        currentDate = dateMatch[1];
        titleText = dateMatch[2]!;
      }

      currentTitle = titleText;
      continue;
    }

    if (currentTitle) {
      bodyLines.push(line);
    }
  }

  flush();

  return { decisions, warnings };
}

// ============================================================================
// Config Generation
// ============================================================================

/**
 * Converts parsed markdown data into a typed SquadConfig.
 *
 * @param parsed - Result from parsing all markdown files
 * @param base - Optional base config to merge with
 * @returns Generated SquadConfig
 */
export function generateConfigFromParsed(
  parsed: MarkdownParseResult,
  base?: Partial<SquadConfig>,
): SquadConfig {
  const baseConfig = base ?? {};

  // Build routing rules
  const routingRules: RoutingRule[] = parsed.routingRules.map((r) => ({
    workType: r.workType,
    agents: r.agents.map((a) => (a.startsWith('@') ? a : `@${a.toLowerCase()}`)),
    examples: r.examples,
    confidence: 'high' as const,
  }));

  const routing: RoutingConfig = {
    ...DEFAULT_CONFIG.routing,
    ...baseConfig.routing,
    rules: routingRules.length > 0 ? routingRules : DEFAULT_CONFIG.routing.rules,
  };

  // Build model config with agent overrides from team.md model preferences
  const agentOverrides: Record<string, string> = {};
  for (const agent of parsed.agents) {
    if (agent.model) {
      agentOverrides[agent.name] = agent.model;
    }
  }

  const models: ModelSelectionConfig = {
    ...DEFAULT_CONFIG.models,
    ...baseConfig.models,
  };

  // Apply agent-specific model overrides via roleMapping
  if (Object.keys(agentOverrides).length > 0 && !models.roleMapping) {
    models.roleMapping = parsed.agents
      .filter((a) => a.model)
      .map((a) => ({
        role: a.role as 'lead' | 'developer' | 'tester' | 'designer' | 'scribe' | 'coordinator',
        model: a.model!,
      }));
  }

  const config: SquadConfig = {
    ...DEFAULT_CONFIG,
    ...baseConfig,
    version: baseConfig.version ?? DEFAULT_CONFIG.version,
    models,
    routing,
  };

  return config;
}

// ============================================================================
// Main Migration Entrypoint
// ============================================================================

/**
 * Migrates legacy markdown configuration files to a typed SquadConfig.
 *
 * Handles partial migrations gracefully — any combination of files can be
 * missing and the result will still be a valid SquadConfig.
 *
 * @param options - Markdown file contents and options
 * @returns Migration result with generated config and diagnostics
 */
export function migrateMarkdownToConfig(options: MarkdownMigrationOptions): MarkdownMigrationResult {
  const warnings: string[] = [];
  const migratedSections: string[] = [];
  const skippedSections: string[] = [];

  // Parse team.md
  let agents: ParsedAgent[] = [];
  if (options.teamMd) {
    const teamResult = parseTeamMarkdown(options.teamMd);
    agents = teamResult.agents;
    warnings.push(...teamResult.warnings);
    if (agents.length > 0) {
      migratedSections.push('team');
    } else {
      skippedSections.push('team');
    }
  } else {
    skippedSections.push('team');
  }

  // Parse routing.md
  let routingRules: ParsedRoutingRule[] = [];
  if (options.routingMd) {
    const routingResult = parseRoutingRulesMarkdown(options.routingMd);
    routingRules = routingResult.rules;
    warnings.push(...routingResult.warnings);
    if (routingRules.length > 0) {
      migratedSections.push('routing');
    } else {
      skippedSections.push('routing');
    }
  } else {
    skippedSections.push('routing');
  }

  // Parse decisions.md
  let decisions: ParsedDecision[] = [];
  if (options.decisionsMd) {
    const decResult = parseDecisionsMarkdown(options.decisionsMd);
    decisions = decResult.decisions;
    warnings.push(...decResult.warnings);
    if (decisions.length > 0) {
      migratedSections.push('decisions');
    } else {
      skippedSections.push('decisions');
    }
  } else {
    skippedSections.push('decisions');
  }

  const parsed: MarkdownParseResult = { agents, routingRules, decisions, warnings };

  const config = generateConfigFromParsed(parsed, options.baseConfig);

  return { config, parsed, migratedSections, skippedSections };
}

// ============================================================================
// Helpers
// ============================================================================

function kebabCase(str: string): string {
  return str
    .trim()
    .replace(/([a-z])([A-Z])/g, '$1-$2')
    .replace(/[\s_]+/g, '-')
    .toLowerCase();
}

function finalizeAgent(partial: Partial<ParsedAgent>): ParsedAgent {
  return {
    name: partial.name ?? 'unknown',
    role: partial.role ?? 'developer',
    skills: partial.skills ?? [],
    model: partial.model,
    status: partial.status,
    aliases: partial.aliases,
    autoAssign: partial.autoAssign,
  };
}
