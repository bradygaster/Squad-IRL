/**
 * Casting History (M3-10, Issue #151)
 *
 * Tracks casting decisions over time and makes them queryable.
 * Each record captures who was cast, when, and from which config.
 */

import type { CastMember, CastingConfig, UniverseId, AgentRole } from './casting-engine.js';

// --- Types ---

export interface CastingRecordMember {
  name: string;
  role: AgentRole;
}

export interface CastingRecord {
  /** When this cast was created */
  timestamp: string;
  /** Universe used for casting */
  universe: UniverseId;
  /** Number of agents cast */
  teamSize: number;
  /** Summary of each member */
  members: CastingRecordMember[];
  /** Snapshot of the config used */
  configSnapshot: CastingConfig;
}

// --- Serialization format for config persistence ---

export interface SerializedCastingHistory {
  version: 1;
  records: CastingRecord[];
}

// --- CastingHistory ---

export class CastingHistory {
  private records: CastingRecord[] = [];

  /**
   * Record a casting decision.
   *
   * @param team - The cast team produced by CastingEngine
   * @param config - The CastingConfig that produced this team
   * @param timestamp - Optional override (defaults to now)
   */
  recordCast(team: CastMember[], config: CastingConfig, timestamp?: Date): CastingRecord {
    const record: CastingRecord = {
      timestamp: (timestamp ?? new Date()).toISOString(),
      universe: config.universe,
      teamSize: team.length,
      members: team.map((m) => ({ name: m.name, role: m.role })),
      configSnapshot: { ...config },
    };
    this.records.push(record);
    return record;
  }

  /** Return all casting records, oldest first. */
  getCastHistory(): CastingRecord[] {
    return [...this.records];
  }

  /**
   * Return casting records that include a specific agent name.
   * Useful for answering "when was Verbal last cast?"
   */
  getAgentHistory(agentName: string): CastingRecord[] {
    return this.records.filter((r) =>
      r.members.some((m) => m.name === agentName),
    );
  }

  /** Number of recorded casts. */
  get size(): number {
    return this.records.length;
  }

  /** Clear all history. */
  clear(): void {
    this.records = [];
  }

  // --- Serialization for config round-trip ---

  /** Serialize history to a plain object suitable for JSON / config persistence. */
  serializeHistory(): SerializedCastingHistory {
    return {
      version: 1,
      records: this.records.map((r) => ({ ...r })),
    };
  }

  /** Restore history from a previously serialized object. Replaces current records. */
  deserializeHistory(data: SerializedCastingHistory): void {
    if (!data || data.version !== 1 || !Array.isArray(data.records)) {
      throw new Error('Invalid casting history data: expected version 1 with records array');
    }
    this.records = data.records.map((r) => ({ ...r }));
  }
}
