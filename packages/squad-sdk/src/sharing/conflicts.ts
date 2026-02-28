/**
 * Conflict Resolution on Import (M5-9, Issue #133)
 */

import type { SquadConfig } from '../config/schema.js';

// --- Types ---

/** Incoming config bundle for conflict detection. */
export interface IncomingBundle {
  version: string;
  config: Partial<SquadConfig>;
  agents?: Array<{ name: string; charter: string }>;
  skills?: Array<{ id: string; content: string }>;
}

export type ConflictType = 'added' | 'modified' | 'removed';

export interface Conflict {
  path: string;
  existingValue: unknown;
  incomingValue: unknown;
  type: ConflictType;
}

export type ConflictStrategy = 'keep-existing' | 'use-incoming' | 'merge' | 'manual';

// --- Detection ---

/** Flatten an object into dotted key paths. */
function flattenObject(
  obj: Record<string, unknown>,
  prefix = '',
): Map<string, unknown> {
  const result = new Map<string, unknown>();
  for (const [key, value] of Object.entries(obj)) {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
      for (const [k, v] of flattenObject(value as Record<string, unknown>, fullKey)) {
        result.set(k, v);
      }
    } else {
      result.set(fullKey, value);
    }
  }
  return result;
}

function valuesEqual(a: unknown, b: unknown): boolean {
  return JSON.stringify(a) === JSON.stringify(b);
}

/** Detect conflicts between an existing config and an incoming bundle. */
export function detectConflicts(
  existing: SquadConfig,
  incoming: IncomingBundle,
): Conflict[] {
  const conflicts: Conflict[] = [];
  const existingFlat = flattenObject(existing as unknown as Record<string, unknown>);
  const incomingFlat = flattenObject(incoming.config as Record<string, unknown>);

  // Check incoming keys against existing
  for (const [path, incomingValue] of incomingFlat) {
    const existingValue = existingFlat.get(path);
    if (existingValue === undefined) {
      conflicts.push({ path, existingValue: undefined, incomingValue, type: 'added' });
    } else if (!valuesEqual(existingValue, incomingValue)) {
      conflicts.push({ path, existingValue, incomingValue, type: 'modified' });
    }
  }

  // Check for keys in existing that are missing from incoming (removed)
  for (const [path, existingValue] of existingFlat) {
    if (!incomingFlat.has(path)) {
      conflicts.push({ path, existingValue, incomingValue: undefined, type: 'removed' });
    }
  }

  return conflicts;
}

// --- Resolution ---

/** Resolve conflicts using the given strategy. Returns a merged SquadConfig. */
export function resolveConflicts(
  existing: SquadConfig,
  conflicts: Conflict[],
  strategy: ConflictStrategy,
): SquadConfig {
  if (strategy === 'keep-existing') {
    return { ...existing };
  }

  if (strategy === 'manual') {
    return { ...existing };
  }

  // Clone via JSON round-trip
  const result = JSON.parse(JSON.stringify(existing)) as Record<string, unknown>;

  for (const conflict of conflicts) {
    if (strategy === 'use-incoming') {
      if (conflict.type === 'removed') {
        deletePath(result, conflict.path);
      } else {
        setPath(result, conflict.path, conflict.incomingValue);
      }
    } else if (strategy === 'merge') {
      if (conflict.type === 'added') {
        setPath(result, conflict.path, conflict.incomingValue);
      }
      // 'modified' keeps existing, 'removed' keeps existing
    }
  }

  return result as unknown as SquadConfig;
}

// --- Report ---

/** Generate a human-readable markdown conflict report. */
export function generateConflictReport(conflicts: Conflict[]): string {
  if (conflicts.length === 0) return '# Conflict Report\n\nNo conflicts detected.\n';

  const lines: string[] = [
    '# Conflict Report',
    '',
    `**${conflicts.length}** conflict(s) detected.`,
    '',
    '| # | Path | Type | Existing | Incoming |',
    '|---|------|------|----------|----------|',
  ];

  let i = 1;
  for (const c of conflicts) {
    const existing = c.existingValue === undefined ? '_(none)_' : `\`${JSON.stringify(c.existingValue)}\``;
    const incoming = c.incomingValue === undefined ? '_(none)_' : `\`${JSON.stringify(c.incomingValue)}\``;
    lines.push(`| ${i++} | \`${c.path}\` | ${c.type} | ${existing} | ${incoming} |`);
  }

  lines.push('');
  return lines.join('\n');
}

// --- Helpers ---

function setPath(obj: Record<string, unknown>, dotPath: string, value: unknown): void {
  const parts = dotPath.split('.');
  let current: Record<string, unknown> = obj;
  for (let i = 0; i < parts.length - 1; i++) {
    const part = parts[i]!;
    if (!(part in current) || typeof current[part] !== 'object') {
      current[part] = {};
    }
    current = current[part] as Record<string, unknown>;
  }
  current[parts[parts.length - 1]!] = value;
}

function deletePath(obj: Record<string, unknown>, dotPath: string): void {
  const parts = dotPath.split('.');
  let current: Record<string, unknown> = obj;
  for (let i = 0; i < parts.length - 1; i++) {
    const part = parts[i]!;
    if (!(part in current) || typeof current[part] !== 'object') {
      return;
    }
    current = current[part] as Record<string, unknown>;
  }
  delete current[parts[parts.length - 1]!];
}
