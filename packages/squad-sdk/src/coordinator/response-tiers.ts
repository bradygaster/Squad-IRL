/**
 * Response Tier Selection (M3-4, Issue #143)
 *
 * Not all tasks need the same level of agent involvement. This module
 * selects one of four response tiers based on message complexity,
 * keyword patterns, config overrides, and history hints.
 *
 * Tiers:
 *   Direct      — Answer inline, no agent spawn
 *   Lightweight — Single fast-model agent
 *   Standard    — Single standard-model agent
 *   Full        — Multi-agent fan-out (premium models)
 */

import type { SquadConfig } from '../config/schema.js';

// --- Types ---

export type TierName = 'direct' | 'lightweight' | 'standard' | 'full';

export type ModelTierSuggestion = 'none' | 'fast' | 'standard' | 'premium';

export interface ResponseTier {
  /** Tier identifier */
  tier: TierName;
  /** Suggested model tier */
  modelTier: ModelTierSuggestion;
  /** Maximum agents to spawn */
  maxAgents: number;
  /** Per-agent timeout in seconds */
  timeout: number;
}

export interface TierContext {
  /** Recent conversation history (summaries) */
  recentHistory?: string[];
  /** Names of currently available agents */
  agentAvailability?: string[];
  /** Number of currently active sessions */
  currentLoad?: number;
}

// --- Tier Definitions ---

const TIER_DIRECT: ResponseTier = {
  tier: 'direct',
  modelTier: 'none',
  maxAgents: 0,
  timeout: 0,
};

const TIER_LIGHTWEIGHT: ResponseTier = {
  tier: 'lightweight',
  modelTier: 'fast',
  maxAgents: 1,
  timeout: 30,
};

const TIER_STANDARD: ResponseTier = {
  tier: 'standard',
  modelTier: 'standard',
  maxAgents: 1,
  timeout: 120,
};

const TIER_FULL: ResponseTier = {
  tier: 'full',
  modelTier: 'premium',
  maxAgents: 5,
  timeout: 300,
};

const TIERS: Record<TierName, ResponseTier> = {
  direct: TIER_DIRECT,
  lightweight: TIER_LIGHTWEIGHT,
  standard: TIER_STANDARD,
  full: TIER_FULL,
};

/** Get a tier definition by name. */
export function getTier(name: TierName): ResponseTier {
  return { ...TIERS[name] };
}

// --- Keyword Patterns ---

/** Patterns that suggest a direct (no-spawn) response. */
const DIRECT_PATTERNS = [
  /^(hi|hello|hey|thanks|thank you|ok|okay)\b/i,
  /^what('s| is) (your|the) (name|version|status)\b/i,
  /^(help|usage|how do I use)\b/i,
  /\?$/,
];

/** Patterns that suggest lightweight (quick lookup / simple task). */
const LIGHTWEIGHT_PATTERNS = [
  /\b(list|show|display|get|find|search|where is)\b/i,
  /\b(status|info|check)\b/i,
  /\b(rename|move|delete|remove)\s+\w+/i,
];

/** Patterns that suggest full multi-agent fan-out. */
const FULL_PATTERNS = [
  /\b(refactor|redesign|migrate|rewrite)\b.*\b(entire|all|whole|system|codebase)\b/i,
  /\b(implement|build|create)\b.*\b(feature|module|system|service)\b/i,
  /\bmulti[- ]?(agent|step|file)\b/i,
  /\b(security audit|pen\s?test|vulnerability scan)\b/i,
  /\bfull\s+(review|analysis|sweep)\b/i,
];

// --- Selection Logic ---

/**
 * Select the appropriate response tier for an incoming message.
 *
 * Priority order:
 *  1. Config routing-rule tier overrides
 *  2. Full-tier keyword patterns
 *  3. Direct-tier keyword patterns (short / simple)
 *  4. Lightweight keyword patterns
 *  5. Context-based adjustments (load, history)
 *  6. Default → standard
 */
export function selectResponseTier(
  message: string,
  config: SquadConfig,
  context: TierContext = {},
): ResponseTier {
  const trimmed = message.trim();

  // 1. Config override: check routing rules for explicit tier
  const configTier = matchConfigTier(trimmed, config);
  if (configTier) return getTier(configTier);

  // 2. Full patterns (checked first — they are most impactful)
  if (FULL_PATTERNS.some((p) => p.test(trimmed))) {
    return applyLoadAdjustment(getTier('full'), context);
  }

  // 3. Very short messages are usually direct
  if (trimmed.length < 20 && !trimmed.includes('\n')) {
    if (DIRECT_PATTERNS.some((p) => p.test(trimmed))) {
      return getTier('direct');
    }
  }

  // 4. Direct patterns (greetings, simple questions)
  if (DIRECT_PATTERNS.some((p) => p.test(trimmed))) {
    return getTier('direct');
  }

  // 5. Lightweight patterns
  if (LIGHTWEIGHT_PATTERNS.some((p) => p.test(trimmed))) {
    return applyLoadAdjustment(getTier('lightweight'), context);
  }

  // 6. History hint: if recent history contains multi-file changes → standard+
  if (context.recentHistory && context.recentHistory.length > 3) {
    return applyLoadAdjustment(getTier('standard'), context);
  }

  // Default: standard
  return applyLoadAdjustment(getTier('standard'), context);
}

// --- Helpers ---

function matchConfigTier(message: string, config: SquadConfig): TierName | undefined {
  if (!config.routing?.rules) return undefined;

  const lower = message.toLowerCase();
  for (const rule of config.routing.rules) {
    if (!rule.tier) continue;

    // Simple pattern match against the rule pattern
    const words = rule.pattern
      .toLowerCase()
      .split(/[-_\s]+/)
      .filter((w) => w.length > 2);

    if (words.length > 0 && words.every((w) => lower.includes(w))) {
      return rule.tier as TierName;
    }
  }

  return undefined;
}

/**
 * Downgrade tier when load is high to conserve resources.
 */
function applyLoadAdjustment(tier: ResponseTier, context: TierContext): ResponseTier {
  if (context.currentLoad === undefined) return tier;

  // If load is ≥ 4 active sessions, cap at standard
  if (context.currentLoad >= 4 && tier.tier === 'full') {
    return getTier('standard');
  }

  // If load is ≥ 6, cap at lightweight
  if (context.currentLoad >= 6 && tier.tier === 'standard') {
    return getTier('lightweight');
  }

  return tier;
}
