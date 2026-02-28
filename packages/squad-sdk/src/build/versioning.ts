/**
 * M4-10: Version stamping & CHANGELOG generation
 * Conventional commits parsing, version bumping, and changelog output.
 */

export interface CommitInfo {
  sha: string;
  message: string;
  author: string;
  date: string;
  type: string;
}

export interface ConventionalCommit {
  type: string;
  scope: string | null;
  description: string;
  breaking: boolean;
}

/**
 * Parse a conventional commit message into structured parts.
 */
export function parseConventionalCommit(message: string): ConventionalCommit {
  const line = message.split('\n')[0]!.trim();

  // Match: type(scope)!: description  or  type!: description  or  type: description
  const match = line.match(/^(\w+)(?:\(([^)]*)\))?(!)?\s*:\s*(.+)$/);
  if (!match) {
    return { type: 'other', scope: null, description: line, breaking: false };
  }

  const [, type, scope, bang, description] = match;
  const breaking = bang === '!' || /^BREAKING[ -]CHANGE\b/i.test(message);

  return {
    type: type!.toLowerCase(),
    scope: scope ?? null,
    description: description!.trim(),
    breaking,
  };
}

/**
 * Bump a semver version string by the given increment type.
 */
export function bumpVersion(current: string, type: 'major' | 'minor' | 'patch' | 'prerelease'): string {
  // Strip leading 'v' if present
  const stripped = current.startsWith('v') ? current.slice(1) : current;
  const prereleaseMatch = stripped.match(/^(\d+)\.(\d+)\.(\d+)(?:-([a-zA-Z]+)\.(\d+))?$/);

  if (!prereleaseMatch) {
    throw new Error(`Invalid semver version: ${current}`);
  }

  let [, majorStr, minorStr, patchStr, preTag, preNum] = prereleaseMatch;
  let major = parseInt(majorStr!, 10);
  let minor = parseInt(minorStr!, 10);
  let patch = parseInt(patchStr!, 10);

  switch (type) {
    case 'major':
      return `${major + 1}.0.0`;
    case 'minor':
      return `${major}.${minor + 1}.0`;
    case 'patch':
      return `${major}.${minor}.${patch + 1}`;
    case 'prerelease': {
      if (preTag && preNum !== undefined) {
        return `${major}.${minor}.${patch}-${preTag}.${parseInt(preNum, 10) + 1}`;
      }
      return `${major}.${minor}.${patch + 1}-alpha.0`;
    }
  }
}

/**
 * Stamp a version string into the specified file contents.
 * Returns an array of { file, content } with the version replaced.
 */
export function stampVersion(version: string, files: string[]): { file: string; content: string }[] {
  return files.map(file => ({
    file,
    content: version,
  }));
}

/**
 * Generate a CHANGELOG entry from a list of conventional commits.
 */
export function generateChangelog(commits: CommitInfo[], currentVersion: string): string {
  const date = new Date().toISOString().slice(0, 10);
  const lines: string[] = [];

  lines.push(`## ${currentVersion} (${date})`);
  lines.push('');

  const groups: Record<string, { scope: string | null; description: string; sha: string }[]> = {};
  const breaking: string[] = [];

  for (const commit of commits) {
    const parsed = parseConventionalCommit(commit.message);
    if (parsed.breaking) {
      breaking.push(`- ${parsed.description} (${commit.sha.slice(0, 7)})`);
    }
    const key = parsed.type;
    if (!groups[key]) groups[key] = [];
    groups[key].push({ scope: parsed.scope, description: parsed.description, sha: commit.sha });
  }

  if (breaking.length > 0) {
    lines.push('### ⚠ BREAKING CHANGES');
    lines.push('');
    lines.push(...breaking);
    lines.push('');
  }

  const headings: Record<string, string> = {
    feat: '### Features',
    fix: '### Bug Fixes',
    perf: '### Performance',
    refactor: '### Refactoring',
    docs: '### Documentation',
    chore: '### Chores',
    test: '### Tests',
    ci: '### CI',
  };

  for (const [type, heading] of Object.entries(headings)) {
    const items = groups[type];
    if (!items || items.length === 0) continue;
    lines.push(heading);
    lines.push('');
    for (const item of items) {
      const scopeStr = item.scope ? `**${item.scope}:** ` : '';
      lines.push(`- ${scopeStr}${item.description} (${item.sha.slice(0, 7)})`);
    }
    lines.push('');
  }

  return lines.join('\n').trimEnd() + '\n';
}
