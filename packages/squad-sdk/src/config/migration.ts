/**
 * Migration Registry
 *
 * Provides versioned configuration upgrades with forward and rollback support.
 * Versions follow semver-like major.minor.patch ordering.
 *
 * @module config/migration
 */

/**
 * Parsed semver version.
 */
export interface SemVer {
  major: number;
  minor: number;
  patch: number;
  raw: string;
}

/**
 * A single migration step between two versions.
 */
export interface Migration {
  /** Version to migrate from */
  fromVersion: string;
  /** Version to migrate to */
  toVersion: string;
  /** Forward migration function */
  migrate(config: Record<string, unknown>): Record<string, unknown>;
  /** Optional reverse migration function */
  rollback?(config: Record<string, unknown>): Record<string, unknown>;
  /** Human-readable description */
  description?: string;
}

/**
 * Result of running a migration chain.
 */
export interface MigrationResult {
  /** Final config after migrations */
  config: Record<string, unknown>;
  /** Starting version */
  fromVersion: string;
  /** Ending version */
  toVersion: string;
  /** Migrations that were applied (in order) */
  applied: Migration[];
  /** Whether rollback was used (reverse direction) */
  rolledBack: boolean;
}

/**
 * Parses a semver string into its components.
 *
 * @param version - Version string (e.g. "1.2.3")
 * @returns Parsed SemVer object
 * @throws If the version string is invalid
 */
export function parseSemVer(version: string): SemVer {
  const match = version.match(/^(\d+)\.(\d+)\.(\d+)$/);
  if (!match) {
    throw new Error(`Invalid version format: "${version}" (expected major.minor.patch)`);
  }
  return {
    major: parseInt(match[1]!, 10),
    minor: parseInt(match[2]!, 10),
    patch: parseInt(match[3]!, 10),
    raw: version,
  };
}

/**
 * Compares two semver versions.
 *
 * @returns negative if a < b, 0 if equal, positive if a > b
 */
export function compareSemVer(a: string, b: string): number {
  const va = parseSemVer(a);
  const vb = parseSemVer(b);

  if (va.major !== vb.major) return va.major - vb.major;
  if (va.minor !== vb.minor) return va.minor - vb.minor;
  return va.patch - vb.patch;
}

/**
 * Registry for versioned configuration migrations.
 *
 * Migrations are stored as directed edges in a version graph.
 * `runMigrations` finds a path from source to target version
 * and chains the transforms in order.
 */
export class MigrationRegistry {
  private migrations: Migration[] = [];

  /**
   * Registers a migration.
   *
   * @param migration - Migration to register
   * @throws If a migration with the same from/to already exists
   */
  register(migration: Migration): void {
    const existing = this.migrations.find(
      (m) => m.fromVersion === migration.fromVersion && m.toVersion === migration.toVersion,
    );
    if (existing) {
      throw new Error(
        `Migration from ${migration.fromVersion} to ${migration.toVersion} is already registered`,
      );
    }
    // Validate version strings
    parseSemVer(migration.fromVersion);
    parseSemVer(migration.toVersion);
    this.migrations.push(migration);
  }

  /**
   * Unregisters a migration.
   *
   * @returns true if a migration was removed
   */
  unregister(fromVersion: string, toVersion: string): boolean {
    const idx = this.migrations.findIndex(
      (m) => m.fromVersion === fromVersion && m.toVersion === toVersion,
    );
    if (idx === -1) return false;
    this.migrations.splice(idx, 1);
    return true;
  }

  /**
   * Returns all registered migrations sorted by fromVersion.
   */
  list(): ReadonlyArray<Migration> {
    return [...this.migrations].sort((a, b) => compareSemVer(a.fromVersion, b.fromVersion));
  }

  /**
   * Checks whether a complete migration path exists between two versions.
   */
  hasPath(fromVersion: string, toVersion: string): boolean {
    try {
      this.findPath(fromVersion, toVersion);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Detects gaps in the migration chain between two versions.
   *
   * @returns Array of missing migration edges (fromVersion → toVersion pairs)
   */
  detectGaps(fromVersion: string, toVersion: string): Array<{ from: string; to: string }> {
    const cmp = compareSemVer(fromVersion, toVersion);
    if (cmp === 0) return [];

    const forward = cmp < 0;
    const sorted = this.getSortedMigrations(forward);

    // Collect versions that appear in migrations between from and to
    const relevantVersions = new Set<string>();
    relevantVersions.add(fromVersion);
    relevantVersions.add(toVersion);

    for (const m of sorted) {
      const src = forward ? m.fromVersion : m.toVersion;
      const dst = forward ? m.toVersion : m.fromVersion;
      const inRange =
        forward
          ? compareSemVer(src, fromVersion) >= 0 && compareSemVer(dst, toVersion) <= 0
          : compareSemVer(src, toVersion) >= 0 && compareSemVer(dst, fromVersion) <= 0;
      if (inRange) {
        relevantVersions.add(m.fromVersion);
        relevantVersions.add(m.toVersion);
      }
    }

    // Sort versions in traversal order
    const versions = [...relevantVersions].sort((a, b) =>
      forward ? compareSemVer(a, b) : compareSemVer(b, a),
    );

    const gaps: Array<{ from: string; to: string }> = [];
    for (let i = 0; i < versions.length - 1; i++) {
      const src = versions[i]!;
      const dst = versions[i + 1]!;
      const edgeFrom = forward ? src : dst;
      const edgeTo = forward ? dst : src;

      const hasMigration = this.migrations.some(
        (m) => m.fromVersion === edgeFrom && m.toVersion === edgeTo,
      );

      if (!hasMigration) {
        if (forward) {
          const hasRollback = this.migrations.some(
            (m) => m.fromVersion === edgeTo && m.toVersion === edgeFrom && m.rollback,
          );
          if (!hasRollback) gaps.push({ from: src, to: dst });
        } else {
          const hasRollback = this.migrations.some(
            (m) => m.fromVersion === edgeTo && m.toVersion === edgeFrom && m.rollback,
          );
          if (!hasRollback) gaps.push({ from: src, to: dst });
        }
      }
    }

    return gaps;
  }

  /**
   * Runs migrations to transform config from one version to another.
   *
   * For forward migrations (from < to), chains migrate() calls.
   * For rollback (from > to), chains rollback() calls in reverse order.
   *
   * @param config - Current configuration object
   * @param fromVersion - Current version
   * @param toVersion - Target version
   * @returns Migration result with transformed config
   * @throws If no migration path exists or rollback is not supported
   */
  runMigrations(
    config: Record<string, unknown>,
    fromVersion: string,
    toVersion: string,
  ): MigrationResult {
    const cmp = compareSemVer(fromVersion, toVersion);

    if (cmp === 0) {
      return {
        config: { ...config },
        fromVersion,
        toVersion,
        applied: [],
        rolledBack: false,
      };
    }

    const forward = cmp < 0;
    const path = this.findPath(fromVersion, toVersion);

    let current = { ...config };
    const applied: Migration[] = [];

    if (forward) {
      for (const migration of path) {
        current = migration.migrate(current);
        applied.push(migration);
      }
    } else {
      // Reverse: path is already in rollback order
      for (const migration of path) {
        if (!migration.rollback) {
          throw new Error(
            `Migration from ${migration.fromVersion} to ${migration.toVersion} does not support rollback`,
          );
        }
        current = migration.rollback(current);
        applied.push(migration);
      }
    }

    return {
      config: current,
      fromVersion,
      toVersion,
      applied,
      rolledBack: !forward,
    };
  }

  /**
   * Finds an ordered migration path between two versions.
   * @internal
   */
  private findPath(fromVersion: string, toVersion: string): Migration[] {
    const cmp = compareSemVer(fromVersion, toVersion);
    if (cmp === 0) return [];

    const forward = cmp < 0;

    if (forward) {
      return this.findForwardPath(fromVersion, toVersion);
    } else {
      return this.findRollbackPath(fromVersion, toVersion);
    }
  }

  private findForwardPath(fromVersion: string, toVersion: string): Migration[] {
    // BFS to find shortest path
    const queue: Array<{ version: string; path: Migration[] }> = [
      { version: fromVersion, path: [] },
    ];
    const visited = new Set<string>();
    visited.add(fromVersion);

    while (queue.length > 0) {
      const { version, path } = queue.shift()!;

      // Find all migrations from this version
      for (const m of this.migrations) {
        if (m.fromVersion === version && !visited.has(m.toVersion)) {
          const newPath = [...path, m];

          if (m.toVersion === toVersion) {
            return newPath;
          }

          // Only follow edges that move toward the target
          if (compareSemVer(m.toVersion, toVersion) <= 0) {
            visited.add(m.toVersion);
            queue.push({ version: m.toVersion, path: newPath });
          }
        }
      }
    }

    throw new Error(
      `No migration path found from ${fromVersion} to ${toVersion}`,
    );
  }

  private findRollbackPath(fromVersion: string, toVersion: string): Migration[] {
    // For rollback, we need migrations whose rollback() we can call
    // We traverse forward migrations in reverse
    const queue: Array<{ version: string; path: Migration[] }> = [
      { version: fromVersion, path: [] },
    ];
    const visited = new Set<string>();
    visited.add(fromVersion);

    while (queue.length > 0) {
      const { version, path } = queue.shift()!;

      // Find migrations that end at this version and have rollback
      for (const m of this.migrations) {
        if (m.toVersion === version && m.rollback && !visited.has(m.fromVersion)) {
          const newPath = [...path, m];

          if (m.fromVersion === toVersion) {
            return newPath;
          }

          // Only follow edges that move toward the target (downward)
          if (compareSemVer(m.fromVersion, toVersion) >= 0) {
            visited.add(m.fromVersion);
            queue.push({ version: m.fromVersion, path: newPath });
          }
        }
      }
    }

    throw new Error(
      `No rollback path found from ${fromVersion} to ${toVersion}`,
    );
  }

  private getSortedMigrations(ascending: boolean): Migration[] {
    return [...this.migrations].sort((a, b) =>
      ascending
        ? compareSemVer(a.fromVersion, b.fromVersion)
        : compareSemVer(b.fromVersion, a.fromVersion),
    );
  }
}
