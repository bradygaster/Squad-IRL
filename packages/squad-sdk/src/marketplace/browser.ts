/**
 * Marketplace Browser — CLI interface for browsing the marketplace
 * Issue #136 (M5-11)
 */

import type {
  MarketplaceEntry,
  MarketplaceIndex,
  MarketplaceSearchQuery,
  MarketplaceSearchResult,
} from './schema.js';
import { searchMarketplace } from './schema.js';

// --- Pluggable fetcher ---

export interface MarketplaceFetcher {
  fetchIndex(): Promise<MarketplaceIndex>;
  fetchEntry(id: string): Promise<MarketplaceEntry | null>;
  fetchPackage(id: string): Promise<Buffer>;
}

// --- MarketplaceBrowser ---

export class MarketplaceBrowser {
  private fetcher: MarketplaceFetcher;

  constructor(fetcher: MarketplaceFetcher) {
    this.fetcher = fetcher;
  }

  /** Browse marketplace with optional search query */
  async browse(query?: string): Promise<string> {
    const index = await this.fetcher.fetchIndex();
    const searchQuery: MarketplaceSearchQuery = query ? { query } : {};
    const results = searchMarketplace(index, searchQuery);
    return formatEntryList(results.entries);
  }

  /** Get detailed view of a specific entry */
  async getDetails(entryId: string): Promise<string> {
    const entry = await this.fetcher.fetchEntry(entryId);
    if (!entry) {
      return `Entry not found: ${entryId}`;
    }
    return formatEntryDetails(entry);
  }

  /** Install an agent/skill from marketplace */
  async install(entryId: string, targetDir: string): Promise<InstallResult> {
    const entry = await this.fetcher.fetchEntry(entryId);
    if (!entry) {
      return { success: false, error: `Entry not found: ${entryId}` };
    }

    try {
      const pkg = await this.fetcher.fetchPackage(entryId);
      return {
        success: true,
        entryId,
        version: entry.manifest.version,
        targetDir,
        size: pkg.length,
      };
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      return { success: false, error: `Install failed: ${message}` };
    }
  }

  /** Search with full query options */
  async search(query: MarketplaceSearchQuery): Promise<MarketplaceSearchResult> {
    const index = await this.fetcher.fetchIndex();
    return searchMarketplace(index, query);
  }
}

// --- Install result ---

export interface InstallResult {
  success: boolean;
  entryId?: string;
  version?: string;
  targetDir?: string;
  size?: number;
  error?: string;
}

// --- Formatting ---

export function formatEntryList(entries: MarketplaceEntry[]): string {
  if (entries.length === 0) {
    return 'No marketplace entries found.';
  }

  const lines: string[] = [];
  lines.push('Marketplace Entries');
  lines.push('─'.repeat(60));

  for (const entry of entries) {
    const verified = entry.verified ? ' ✓' : '';
    const featured = entry.featured ? ' ★' : '';
    lines.push(
      `  ${entry.manifest.name}@${entry.manifest.version}${verified}${featured}`,
    );
    lines.push(`    ${entry.manifest.description}`);
    lines.push(
      `    ↓ ${entry.stats.downloads}  ★ ${entry.stats.rating.toFixed(1)}  💬 ${entry.stats.reviews}`,
    );
    lines.push('');
  }

  return lines.join('\n');
}

export function formatEntryDetails(entry: MarketplaceEntry): string {
  const lines: string[] = [];
  const verified = entry.verified ? ' [Verified]' : '';
  const featured = entry.featured ? ' [Featured]' : '';

  lines.push(`${entry.manifest.name}@${entry.manifest.version}${verified}${featured}`);
  lines.push('═'.repeat(60));
  lines.push('');
  lines.push(entry.manifest.description);
  lines.push('');
  lines.push(`Author:      ${entry.manifest.author || '(unknown)'}`);
  lines.push(`Repository:  ${entry.manifest.repository || '(none)'}`);
  lines.push(`Categories:  ${entry.manifest.categories.join(', ')}`);
  lines.push(`Tags:        ${entry.manifest.tags.join(', ') || '(none)'}`);
  lines.push(`Pricing:     ${entry.manifest.pricing.model}`);
  lines.push('');
  lines.push('Statistics');
  lines.push('─'.repeat(30));
  lines.push(`  Downloads: ${entry.stats.downloads}`);
  lines.push(`  Rating:    ${entry.stats.rating.toFixed(1)} / 5.0`);
  lines.push(`  Reviews:   ${entry.stats.reviews}`);
  lines.push('');
  lines.push(`Published: ${entry.publishedAt}`);
  lines.push(`Updated:   ${entry.updatedAt}`);

  return lines.join('\n');
}
