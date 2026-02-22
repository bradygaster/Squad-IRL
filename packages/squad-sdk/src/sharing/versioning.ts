/**
 * Agent Versioning — commit SHA pinning (M5-6, Issue #129)
 */

import type { AgentDefinition } from '../config/agent-source.js';

// --- Types ---

export interface VersionPin {
  agentId: string;
  sha: string;
  timestamp: number;
  source: 'local' | 'github';
}

export interface VersionDiff {
  agentId: string;
  from: VersionPin;
  to: VersionPin;
  fields: string[];
}

/** Resolver callback: given agentId + SHA, return the agent at that version. */
export type AgentVersionResolver = (agentId: string, sha: string) => Promise<AgentDefinition | null>;

// --- In-memory version store ---

const versionStore = new Map<string, VersionPin[]>();

// --- Public API ---

/** Pin an agent to a specific commit SHA. */
export function pinAgentVersion(
  agentId: string,
  sha: string,
  source: 'local' | 'github' = 'local',
): VersionPin {
  const pin: VersionPin = {
    agentId,
    sha,
    timestamp: Date.now(),
    source,
  };
  const existing = versionStore.get(agentId) ?? [];
  existing.push(pin);
  versionStore.set(agentId, existing);
  return pin;
}

/**
 * Resolve a version pin to an agent definition.
 * "latest" SHA resolves via the headResolver callback.
 */
export async function resolveVersion(
  pin: VersionPin,
  resolver: AgentVersionResolver,
  headResolver?: (agentId: string) => Promise<string>,
): Promise<AgentDefinition | null> {
  let sha = pin.sha;
  if (sha === 'latest') {
    if (!headResolver) return null;
    sha = await headResolver(pin.agentId);
  }
  return resolver(pin.agentId, sha);
}

/** Compare two version pins and return a diff summary. */
export async function compareAgentVersions(
  a: VersionPin,
  b: VersionPin,
  resolver: AgentVersionResolver,
): Promise<VersionDiff> {
  const agentA = await resolver(a.agentId, a.sha);
  const agentB = await resolver(b.agentId, b.sha);

  const fields: string[] = [];
  if (agentA && agentB) {
    const keys: (keyof AgentDefinition)[] = ['name', 'role', 'charter', 'model', 'source'];
    for (const key of keys) {
      if (agentA[key] !== agentB[key]) fields.push(key);
    }
    if (JSON.stringify(agentA.tools) !== JSON.stringify(agentB.tools)) fields.push('tools');
    if (JSON.stringify(agentA.skills) !== JSON.stringify(agentB.skills)) fields.push('skills');
    if (agentA.history !== agentB.history) fields.push('history');
  } else {
    fields.push('__unresolvable__');
  }

  return { agentId: a.agentId, from: a, to: b, fields };
}

/** Get the full version history for an agent. */
export function getVersionHistory(agentId: string): VersionPin[] {
  return [...(versionStore.get(agentId) ?? [])];
}

/** Clear all stored version pins (useful in tests). */
export function clearVersionStore(): void {
  versionStore.clear();
}
