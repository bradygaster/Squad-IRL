/**
 * Concrete Migration Definitions
 *
 * Registers real migration functions for known Squad version transitions.
 * Each migration transforms a config object from the old shape to the new.
 *
 * @module config/migrations
 */

import { MigrationRegistry, type Migration } from '../migration.js';

// ============================================================================
// 0.4.x → 0.5.x: Directory rename + team.md → squad.config.ts
// ============================================================================

/**
 * Migrate from 0.4.x to 0.5.0.
 *
 * Changes:
 * - Renames `.ai-team/` directory references to `.squad/`
 * - Converts team.md-style flat config to squad.config.ts typed format
 * - Normalises agent names to lowercase with `@` prefix
 */
export const migration_0_4_to_0_5: Migration = {
  fromVersion: '0.4.0',
  toVersion: '0.5.0',
  description: '.ai-team/ → .squad/ directory rename, team.md → squad.config.ts',

  migrate(config: Record<string, unknown>): Record<string, unknown> {
    const result = { ...config };

    // Update version
    result.version = '0.5.0';

    // Rename directory references
    if (typeof result.configDir === 'string') {
      result.configDir = (result.configDir as string).replace(/\.ai-team/g, '.squad');
    }

    // Migrate team format: flat team.md → typed agents array
    if (result.teamMembers && Array.isArray(result.teamMembers)) {
      const agents = (result.teamMembers as Array<Record<string, unknown>>).map((member) => ({
        name: normaliseAgentName(String(member.name ?? '')),
        role: String(member.role ?? 'agent'),
        displayName: member.displayName ?? member.name,
        model: member.model,
        tools: member.tools,
        status: 'active' as const,
      }));
      result.agents = agents;
      delete result.teamMembers;
    }

    // Rename any path references
    if (typeof result.agentDir === 'string') {
      result.agentDir = (result.agentDir as string).replace(/\.ai-team/g, '.squad');
    }

    // Mark config format
    result.configFormat = 'squad.config.ts';

    return result;
  },

  rollback(config: Record<string, unknown>): Record<string, unknown> {
    const result = { ...config };
    result.version = '0.4.0';

    // Reverse directory references
    if (typeof result.configDir === 'string') {
      result.configDir = (result.configDir as string).replace(/\.squad/g, '.ai-team');
    }

    // Reverse agents array → teamMembers
    if (result.agents && Array.isArray(result.agents)) {
      const teamMembers = (result.agents as Array<Record<string, unknown>>).map((agent) => ({
        name: String(agent.displayName ?? agent.name ?? '').replace(/^@/, ''),
        role: agent.role,
        displayName: agent.displayName,
        model: agent.model,
        tools: agent.tools,
      }));
      result.teamMembers = teamMembers;
      delete result.agents;
    }

    if (typeof result.agentDir === 'string') {
      result.agentDir = (result.agentDir as string).replace(/\.squad/g, '.ai-team');
    }

    delete result.configFormat;

    return result;
  },
};

// ============================================================================
// 0.5.x → 0.6.x: Typed routing, model registry, agent sources
// ============================================================================

/**
 * Migrate from 0.5.0 to 0.6.0.
 *
 * Changes:
 * - Converts simple routing rules to typed RoutingConfig with patterns and tiers
 * - Adds model registry with tier system (premium/standard/fast)
 * - Adds agent source configuration for pluggable discovery
 */
export const migration_0_5_to_0_6: Migration = {
  fromVersion: '0.5.0',
  toVersion: '0.6.0',
  description: 'Add typed routing, model registry, agent sources',

  migrate(config: Record<string, unknown>): Record<string, unknown> {
    const result = { ...config };
    result.version = '0.6.0';

    // Upgrade routing: simple string rules → typed RoutingRule objects
    if (result.routing && typeof result.routing === 'object') {
      const routing = result.routing as Record<string, unknown>;
      if (Array.isArray(routing.rules)) {
        routing.rules = (routing.rules as Array<unknown>).map((rule) => {
          if (typeof rule === 'string') {
            // Simple string format "pattern → agent" → typed rule
            const [pattern, agent] = (rule as string).split('→').map((s) => s.trim());
            return {
              pattern: pattern ?? rule,
              agents: agent ? [normaliseAgentName(agent)] : [],
              tier: 'standard' as const,
            };
          }
          // Already an object — ensure it has a tier
          const ruleObj = rule as Record<string, unknown>;
          if (!ruleObj.tier) {
            ruleObj.tier = 'standard';
          }
          return ruleObj;
        });
      }
      if (!routing.fallbackBehavior) {
        routing.fallbackBehavior = 'coordinator';
      }
      result.routing = routing;
    } else {
      result.routing = {
        rules: [],
        fallbackBehavior: 'coordinator',
      };
    }

    // Add model registry with tier system
    if (!result.models || typeof result.models !== 'object') {
      result.models = {
        default: 'claude-sonnet-4',
        defaultTier: 'standard',
        tiers: {
          premium: ['claude-opus-4', 'claude-opus-4.5'],
          standard: ['claude-sonnet-4', 'claude-sonnet-4.5', 'gpt-5.1-codex'],
          fast: ['claude-haiku-4.5', 'gpt-5.1-codex-mini'],
        },
      };
    } else {
      const models = result.models as Record<string, unknown>;
      if (!models.defaultTier) {
        models.defaultTier = 'standard';
      }
      if (!models.tiers) {
        models.tiers = {
          premium: ['claude-opus-4', 'claude-opus-4.5'],
          standard: ['claude-sonnet-4', 'claude-sonnet-4.5', 'gpt-5.1-codex'],
          fast: ['claude-haiku-4.5', 'gpt-5.1-codex-mini'],
        };
      }
    }

    // Add agent sources configuration
    if (!result.agentSources) {
      result.agentSources = [{ type: 'local', name: 'local', path: '.squad/agents' }];
    }

    return result;
  },

  rollback(config: Record<string, unknown>): Record<string, unknown> {
    const result = { ...config };
    result.version = '0.5.0';

    // Downgrade typed routing rules back to simple format
    if (result.routing && typeof result.routing === 'object') {
      const routing = result.routing as Record<string, unknown>;
      if (Array.isArray(routing.rules)) {
        routing.rules = (routing.rules as Array<Record<string, unknown>>).map((rule) => {
          if (rule.pattern && Array.isArray(rule.agents) && (rule.agents as string[]).length > 0) {
            return `${rule.pattern} → ${(rule.agents as string[])[0]}`;
          }
          return rule.pattern ?? rule;
        });
      }
      delete routing.fallbackBehavior;
      result.routing = routing;
    }

    // Remove model tier system
    if (result.models && typeof result.models === 'object') {
      const models = result.models as Record<string, unknown>;
      delete models.defaultTier;
      delete models.tiers;
    }

    // Remove agent sources
    delete result.agentSources;

    return result;
  },
};

// ============================================================================
// Public API
// ============================================================================

/**
 * Returns all registered concrete migrations in version order.
 */
export function getRegisteredMigrations(): ReadonlyArray<Migration> {
  return [migration_0_4_to_0_5, migration_0_5_to_0_6];
}

/**
 * Creates a MigrationRegistry pre-loaded with all known migrations.
 */
export function createDefaultRegistry(): MigrationRegistry {
  const registry = new MigrationRegistry();
  for (const migration of getRegisteredMigrations()) {
    registry.register(migration);
  }
  return registry;
}

// ============================================================================
// Helpers
// ============================================================================

function normaliseAgentName(name: string): string {
  const lower = name.toLowerCase().trim();
  return lower.startsWith('@') ? lower : `@${lower}`;
}
