/**
 * Casting System (PRD 11 + M3-2)
 *
 * Runtime casting engine that generates agent personas from universe themes.
 * Typed config replaces static markdown definitions.
 *
 * v1 API (M3-2):  CastingEngine.castTeam(config) → CastMember[]
 * Legacy API:     CastingRegistry (filesystem-backed, stub)
 */

import * as fs from 'node:fs';
import * as path from 'node:path';
export {
  CastingEngine,
  type CastMember,
  type CastingConfig,
  type AgentRole,
  type UniverseId,
} from './casting-engine.js';

// Re-export casting history (M3-10)
export {
  CastingHistory,
  type CastingRecord,
  type CastingRecordMember,
  type SerializedCastingHistory,
} from './casting-history.js';

// --- Legacy Types (kept for backward compat) ---

export interface CastingUniverse {
  /** Universe name (e.g., 'The Wire', 'Seinfeld') */
  name: string;
  /** Available character names */
  characters: string[];
  /** Universe-specific constraints */
  constraints?: string[];
}

export interface CastingEntry {
  /** Agent role name (e.g., 'core-dev', 'lead') */
  role: string;
  /** Cast character name */
  characterName: string;
  /** Universe the character is from */
  universe: string;
  /** Display name (e.g., 'Fenster — Core Dev') */
  displayName: string;
}

export interface CastingRegistryConfig {
  /** Path to .squad/casting/ directory */
  castingDir: string;
  /** Active universe name */
  activeUniverse?: string;
}

// --- Legacy Casting Registry ---

export class CastingRegistry {
  private entries: Map<string, CastingEntry> = new Map();
  private config: CastingRegistryConfig;

  constructor(config: CastingRegistryConfig) {
    this.config = config;
  }

  async load(): Promise<void> {
    const registryPath = path.join(this.config.castingDir, 'registry.json');
    if (!fs.existsSync(registryPath)) return;

    const raw = fs.readFileSync(registryPath, 'utf-8');
    const entries = JSON.parse(raw) as CastingEntry[];
    for (const entry of entries) {
      this.entries.set(entry.role, entry);
    }
  }

  getByRole(role: string): CastingEntry | undefined {
    return this.entries.get(role);
  }

  getAllEntries(): CastingEntry[] {
    return Array.from(this.entries.values());
  }

  async cast(role: string, _universe?: string): Promise<CastingEntry> {
    throw new Error('Not implemented');
  }

  async recast(_universe: string): Promise<CastingEntry[]> {
    throw new Error('Not implemented');
  }
}
