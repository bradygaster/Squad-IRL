/**
 * M5-3: History splitting logic
 * Separates shareable history from private data for safe export.
 */

export interface HistoryEntry {
  id: string;
  timestamp: string;
  type: 'decision' | 'pattern' | 'interaction' | 'error';
  content: string;
  agent?: string;
  metadata?: Record<string, unknown>;
}

export interface AgentHistory {
  entries: HistoryEntry[];
  source?: string;
}

export interface SplitOptions {
  maxAge?: number; // days
  excludePatterns?: string[];
  anonymize?: boolean;
}

export interface SplitResult {
  exportable: AgentHistory;
  private: AgentHistory;
}

const PRIVATE_PATTERNS = [
  /[\w.+-]+@[\w.-]+\.\w{2,}/g,          // emails
  /https?:\/\/[^\s)]+/g,                  // URLs
  /ghp_[A-Za-z0-9]{36}/g,                // GitHub PATs
  /gho_[A-Za-z0-9]{36}/g,
  /github_pat_[A-Za-z0-9_]{82}/g,
  /[A-Z]:\\(?:[\w.-]+\\){2,}[\w.-]*/gi,  // Windows paths
  /(?:\/[\w.-]+){3,}/g,                   // Unix paths
];

/**
 * Anonymize a single history entry's content.
 */
function anonymizeEntry(entry: HistoryEntry): HistoryEntry {
  let content = entry.content;
  for (const pattern of PRIVATE_PATTERNS) {
    content = content.replace(pattern, '[REDACTED]');
  }
  return {
    ...entry,
    content,
    agent: entry.agent,
    metadata: undefined, // strip metadata which may contain PII
  };
}

function isExpired(entry: HistoryEntry, maxAgeDays: number): boolean {
  const entryDate = new Date(entry.timestamp);
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - maxAgeDays);
  return entryDate < cutoff;
}

function matchesExclude(entry: HistoryEntry, patterns: string[]): boolean {
  return patterns.some(p => {
    const re = new RegExp(p, 'i');
    return re.test(entry.content) || (entry.agent && re.test(entry.agent));
  });
}

/**
 * Split history into exportable (shareable) and private portions.
 */
export function splitHistory(history: AgentHistory, options?: SplitOptions): SplitResult {
  const opts: Required<SplitOptions> = {
    maxAge: options?.maxAge ?? 365,
    excludePatterns: options?.excludePatterns ?? [],
    anonymize: options?.anonymize ?? false,
  };

  const exportable: HistoryEntry[] = [];
  const privateEntries: HistoryEntry[] = [];

  for (const entry of history.entries) {
    // Expired entries go to private
    if (isExpired(entry, opts.maxAge)) {
      privateEntries.push(entry);
      continue;
    }

    // Excluded entries go to private
    if (matchesExclude(entry, opts.excludePatterns)) {
      privateEntries.push(entry);
      continue;
    }

    // Interaction and error types are private by default
    if (entry.type === 'interaction' || entry.type === 'error') {
      privateEntries.push(entry);
      continue;
    }

    // Decision and pattern types are exportable
    const processed = opts.anonymize ? anonymizeEntry(entry) : entry;
    exportable.push(processed);
  }

  return {
    exportable: { entries: exportable },
    private: { entries: privateEntries },
  };
}

/**
 * Merge imported history with existing history, deduplicating by id.
 */
export function mergeHistory(existing: AgentHistory, imported: AgentHistory): AgentHistory {
  const seen = new Set<string>();
  const merged: HistoryEntry[] = [];

  // Existing entries take precedence
  for (const entry of existing.entries) {
    if (!seen.has(entry.id)) {
      seen.add(entry.id);
      merged.push(entry);
    }
  }

  // Add imported entries that don't already exist
  for (const entry of imported.entries) {
    if (!seen.has(entry.id)) {
      seen.add(entry.id);
      merged.push(entry);
    }
  }

  // Sort by timestamp
  merged.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

  return { entries: merged, source: existing.source ?? imported.source };
}
