/**
 * Squad directory resolution — walk-up and global path algorithms.
 *
 * resolveSquad()            — find .squad/ by walking up from startDir to .git boundary
 * resolveGlobalSquadPath()  — platform-specific global config directory
 *
 * @module resolution
 */

import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';

/**
 * Walk up the directory tree from `startDir` looking for a `.squad/` directory.
 *
 * Stops at the repository root (the directory containing `.git`).
 * Returns the **absolute path** to the `.squad/` directory, or `null` if none is found.
 *
 * Handles nested repos, worktrees (`.git` file pointing elsewhere), and symlinks.
 *
 * @param startDir - Directory to start searching from. Defaults to `process.cwd()`.
 * @returns Absolute path to `.squad/` or `null`.
 */
export function resolveSquad(startDir?: string): string | null {
  let current = path.resolve(startDir ?? process.cwd());

  // eslint-disable-next-line no-constant-condition
  while (true) {
    const candidate = path.join(current, '.squad');

    if (fs.existsSync(candidate) && fs.statSync(candidate).isDirectory()) {
      return candidate;
    }

    // Stop if we hit a .git boundary (directory or worktree file)
    const gitMarker = path.join(current, '.git');
    if (fs.existsSync(gitMarker)) {
      // We've reached the repo root — don't walk higher
      return null;
    }

    const parent = path.dirname(current);

    // Filesystem root reached — nowhere left to walk
    if (parent === current) {
      return null;
    }

    current = parent;
  }
}

/**
 * Return the platform-specific global Squad configuration directory.
 *
 * | Platform | Path                                       |
 * |----------|--------------------------------------------|
 * | Windows  | `%APPDATA%/squad/`                         |
 * | macOS    | `~/Library/Application Support/squad/`      |
 * | Linux    | `$XDG_CONFIG_HOME/squad/` (default `~/.config/squad/`) |
 *
 * The directory is created (recursively) if it does not already exist.
 *
 * @returns Absolute path to the global squad config directory.
 */
export function resolveGlobalSquadPath(): string {
  const platform = process.platform;
  let base: string;

  if (platform === 'win32') {
    // %APPDATA% is always set on Windows; fall back to %LOCALAPPDATA%, then homedir
    base = process.env['APPDATA']
      ?? process.env['LOCALAPPDATA']
      ?? path.join(os.homedir(), 'AppData', 'Roaming');
  } else if (platform === 'darwin') {
    base = path.join(os.homedir(), 'Library', 'Application Support');
  } else {
    // Linux / other POSIX — respect XDG_CONFIG_HOME
    base = process.env['XDG_CONFIG_HOME'] ?? path.join(os.homedir(), '.config');
  }

  const globalDir = path.join(base, 'squad');

  if (!fs.existsSync(globalDir)) {
    fs.mkdirSync(globalDir, { recursive: true });
  }

  return globalDir;
}

/**
 * Validate that a file path is within `.squad/` or the system temp directory.
 *
 * Use this guard before writing any scratch/temp/state files to ensure Squad
 * never clutters the repo root or arbitrary filesystem locations.
 *
 * @param filePath  - Absolute path to validate.
 * @param squadRoot - Absolute path to the `.squad/` directory (e.g. from `resolveSquad()`).
 * @returns The resolved absolute `filePath` if it is safe.
 * @throws If `filePath` is outside `.squad/` and not in the system temp directory.
 */
export function ensureSquadPath(filePath: string, squadRoot: string): string {
  const resolved = path.resolve(filePath);
  const resolvedSquad = path.resolve(squadRoot);
  const resolvedTmp = path.resolve(os.tmpdir());

  // Allow paths inside the .squad/ directory
  if (resolved === resolvedSquad || resolved.startsWith(resolvedSquad + path.sep)) {
    return resolved;
  }

  // Allow paths inside the system temp directory
  if (resolved === resolvedTmp || resolved.startsWith(resolvedTmp + path.sep)) {
    return resolved;
  }

  throw new Error(
    `Path "${resolved}" is outside the .squad/ directory ("${resolvedSquad}"). ` +
    'All squad scratch/temp/state files must be written inside .squad/ or the system temp directory.'
  );
}
