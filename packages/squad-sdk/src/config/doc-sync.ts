/**
 * Doc ↔ Config Synchronisation (M2-12)
 *
 * Keeps agent documentation (.agent.md) in sync with typed SquadConfig.
 * The .agent.md file is the *reference* document; SquadConfig is the
 * *runtime* source of truth.  This module bridges the two.
 *
 * @module config/doc-sync
 */

import type { AgentDocMetadata } from './agent-doc.js';
import type { SquadConfig, AgentConfig } from './schema.js';
import { normalizeEol } from '../utils/normalize-eol.js';

/**
 * A single mismatch between the agent doc and the typed config.
 */
export interface DriftEntry {
  /** Which field differs */
  field: string;
  /** Value found in the agent doc */
  docValue: unknown;
  /** Value found in the typed config */
  configValue: unknown;
  /** Human-readable summary */
  message: string;
}

/**
 * Result of a drift-detection run.
 */
export interface DriftReport {
  /** True when doc and config are perfectly aligned */
  inSync: boolean;
  /** Individual mismatches */
  entries: DriftEntry[];
}

// ---------------------------------------------------------------------------
// doc → config
// ---------------------------------------------------------------------------

/**
 * Merge metadata extracted from an agent doc into an existing SquadConfig.
 *
 * Only fields present in the doc metadata will overwrite config values;
 * everything else is left untouched.
 *
 * @param doc    - Metadata parsed from the .agent.md file
 * @param config - Current typed configuration (mutated in-place *and* returned)
 * @returns The updated config
 */
export function syncDocToConfig(
  doc: AgentDocMetadata,
  config: SquadConfig,
): SquadConfig {
  // --- Team-level fields ---
  if (doc.name) {
    config.team.name = doc.name;
  }
  if (doc.description) {
    config.team.description = doc.description;
  }

  // --- Model preferences → models.default ---
  if (doc.modelPreferences.length > 0) {
    config.models.default = doc.modelPreferences[0];
  }

  // --- Routing hints → routing rules ---
  if (doc.routingHints.length > 0) {
    // Merge routing hints as rules (additive – don't drop existing rules)
    const existingPatterns = new Set(
      config.routing.rules.map((r) => r.pattern),
    );
    for (const hint of doc.routingHints) {
      if (!existingPatterns.has(hint)) {
        config.routing.rules.push({ pattern: hint, agents: [] });
      }
    }
  }

  // --- Capabilities / tools → first agent entry (if any) ---
  if (config.agents.length > 0) {
    const agent = config.agents[0];
    if (doc.tools.length > 0) {
      agent.tools = doc.tools;
    }
    if (doc.capabilities.length > 0) {
      agent.charter = doc.capabilities.join('\n');
    }
  } else if (doc.name) {
    // Create a stub agent from the doc
    const agent: AgentConfig = {
      name: doc.name,
      role: doc.description ?? 'agent',
    };
    if (doc.tools.length > 0) agent.tools = doc.tools;
    if (doc.capabilities.length > 0) agent.charter = doc.capabilities.join('\n');
    if (doc.modelPreferences.length > 0) agent.model = doc.modelPreferences[0];
    config.agents.push(agent);
  }

  return config;
}

// ---------------------------------------------------------------------------
// config → doc
// ---------------------------------------------------------------------------

/**
 * Generate (or update) an agent doc from a typed SquadConfig.
 *
 * If a `template` is provided the function replaces recognised section
 * placeholders (`{{IDENTITY}}`, `{{CAPABILITIES}}`, etc.) with values
 * from the config.  If no template is given a minimal markdown document
 * is produced from scratch.
 *
 * @param config   - The typed configuration
 * @param template - Optional markdown template with `{{SECTION}}` placeholders
 * @returns Generated markdown string
 */
export function syncConfigToDoc(
  config: SquadConfig,
  template?: string,
): string {
  const identity = buildIdentityBlock(config);
  const capabilities = buildCapabilitiesBlock(config);
  const routing = buildRoutingBlock(config);
  const constraints = buildConstraintsBlock(config);
  const tools = buildToolsBlock(config);

  if (template) {
    let result = template;
    result = result.replace('{{IDENTITY}}', identity);
    result = result.replace('{{CAPABILITIES}}', capabilities);
    result = result.replace('{{ROUTING}}', routing);
    result = result.replace('{{CONSTRAINTS}}', constraints);
    result = result.replace('{{TOOLS}}', tools);
    return result;
  }

  // Build from scratch
  const parts: string[] = [
    `# ${config.team.name}`,
    '',
    '## Identity',
    '',
    identity,
    '',
    '## Capabilities',
    '',
    capabilities,
    '',
    '## Routing',
    '',
    routing,
    '',
    '## Constraints',
    '',
    constraints,
    '',
    '## Tools',
    '',
    tools,
    '',
  ];
  return parts.join('\n');
}

// ---------------------------------------------------------------------------
// drift detection
// ---------------------------------------------------------------------------

/**
 * Detect mismatches between an agent doc and a typed config.
 *
 * @param doc    - Metadata parsed from the .agent.md file
 * @param config - Current typed configuration
 * @returns A drift report listing every mismatch found
 */
export function detectDrift(
  doc: AgentDocMetadata,
  config: SquadConfig,
): DriftReport {
  const entries: DriftEntry[] = [];

  // --- Team name ---
  if (doc.name && doc.name !== config.team.name) {
    entries.push({
      field: 'team.name',
      docValue: doc.name,
      configValue: config.team.name,
      message: `Team name differs: doc="${doc.name}", config="${config.team.name}"`,
    });
  }

  // --- Description ---
  if (doc.description && doc.description !== config.team.description) {
    entries.push({
      field: 'team.description',
      docValue: doc.description,
      configValue: config.team.description,
      message: `Description differs: doc="${doc.description}", config="${config.team.description ?? '(none)'}"`,
    });
  }

  // --- Default model ---
  if (
    doc.modelPreferences.length > 0 &&
    doc.modelPreferences[0] !== config.models.default
  ) {
    entries.push({
      field: 'models.default',
      docValue: doc.modelPreferences[0],
      configValue: config.models.default,
      message: `Default model differs: doc="${doc.modelPreferences[0]}", config="${config.models.default}"`,
    });
  }

  // --- Routing hints vs rules ---
  const rulePatterns = new Set(config.routing.rules.map((r) => r.pattern));
  for (const hint of doc.routingHints) {
    if (!rulePatterns.has(hint)) {
      entries.push({
        field: 'routing.rules',
        docValue: hint,
        configValue: undefined,
        message: `Routing hint "${hint}" in doc but not in config rules`,
      });
    }
  }

  // --- Tools ---
  if (config.agents.length > 0) {
    const agentTools = config.agents[0].tools ?? [];
    const docToolSet = new Set(doc.tools);
    const configToolSet = new Set(agentTools);

    for (const t of doc.tools) {
      if (!configToolSet.has(t)) {
        entries.push({
          field: 'agents[0].tools',
          docValue: t,
          configValue: undefined,
          message: `Tool "${t}" in doc but not in config`,
        });
      }
    }
    for (const t of agentTools) {
      if (!docToolSet.has(t)) {
        entries.push({
          field: 'agents[0].tools',
          docValue: undefined,
          configValue: t,
          message: `Tool "${t}" in config but not in doc`,
        });
      }
    }
  }

  return {
    inSync: entries.length === 0,
    entries,
  };
}

// ---------------------------------------------------------------------------
// Block builders (config → markdown fragments)
// ---------------------------------------------------------------------------

function buildIdentityBlock(config: SquadConfig): string {
  const lines: string[] = [];
  lines.push(`**Name:** ${config.team.name}`);
  if (config.team.description) {
    lines.push(`**Description:** ${config.team.description}`);
  }
  if (config.models.default) {
    lines.push(`**Model:** ${config.models.default}`);
  }
  return lines.join('\n');
}

function buildCapabilitiesBlock(config: SquadConfig): string {
  if (config.agents.length === 0) return '_No capabilities defined._';
  const caps: string[] = [];
  for (const agent of config.agents) {
    if (agent.charter) {
      const charter = normalizeEol(agent.charter);
      for (const line of charter.split('\n')) {
        caps.push(`- ${line}`);
      }
    } else {
      caps.push(`- ${agent.role} (${agent.name})`);
    }
  }
  return caps.join('\n');
}

function buildRoutingBlock(config: SquadConfig): string {
  if (config.routing.rules.length === 0) return '_No routing rules defined._';
  const lines: string[] = [];
  for (const rule of config.routing.rules) {
    const agents = rule.agents.length > 0 ? rule.agents.join(', ') : '(unassigned)';
    lines.push(`- ${rule.pattern} → ${agents}`);
  }
  return lines.join('\n');
}

function buildConstraintsBlock(_config: SquadConfig): string {
  // Constraints aren't first-class in SquadConfig yet – placeholder
  return '_No constraints defined._';
}

function buildToolsBlock(config: SquadConfig): string {
  const allTools = new Set<string>();
  for (const agent of config.agents) {
    for (const t of agent.tools ?? []) {
      allTools.add(t);
    }
  }
  if (allTools.size === 0) return '_No tools defined._';
  return Array.from(allTools)
    .map((t) => `- ${t}`)
    .join('\n');
}
