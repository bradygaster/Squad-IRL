/**
 * Marketplace Backend — reference/mock implementation of marketplace API
 * Issue #139 (M5-12)
 */

import type { MarketplaceManifest } from './index.js';
import type {
  MarketplaceEntry,
  MarketplaceSearchQuery,
  MarketplaceSearchResult,
  MarketplaceIndex,
} from './schema.js';
import { searchMarketplace, validateEntry } from './schema.js';

// --- Publish result ---

export interface PublishResult {
  success: boolean;
  url?: string;
  warnings: string[];
  error?: string;
}

// --- Unpublish / Update result ---

export interface OperationResult {
  success: boolean;
  error?: string;
}

// --- MarketplaceBackend (reference/mock) ---

export class MarketplaceBackend {
  private entries: Map<string, MarketplaceEntry> = new Map();
  private packages: Map<string, Buffer> = new Map();

  /** List entries with search/pagination */
  listEntries(query: MarketplaceSearchQuery): MarketplaceSearchResult {
    const index = this.buildIndex();
    return searchMarketplace(index, query);
  }

  /** Get a single entry by ID */
  getEntry(id: string): MarketplaceEntry | null {
    return this.entries.get(id) ?? null;
  }

  /** Publish a new entry */
  publishEntry(manifest: MarketplaceManifest, pkg: Buffer): PublishResult {
    const warnings: string[] = [];
    const id = manifest.name;

    if (this.entries.has(id)) {
      return { success: false, warnings: [], error: `Entry already exists: ${id}` };
    }

    if (!manifest.name || !manifest.version) {
      return { success: false, warnings: [], error: 'name and version are required' };
    }

    if (pkg.length === 0) {
      warnings.push('Package is empty — this may indicate a build issue');
    }

    const now = new Date().toISOString();
    const entry: MarketplaceEntry = {
      id,
      manifest,
      stats: { downloads: 0, rating: 0, reviews: 0 },
      verified: false,
      featured: false,
      publishedAt: now,
      updatedAt: now,
    };

    const validation = validateEntry(entry);
    if (!validation.valid) {
      return { success: false, warnings: [], error: validation.errors.join('; ') };
    }

    this.entries.set(id, entry);
    this.packages.set(id, pkg);

    return {
      success: true,
      url: `https://marketplace.squad.dev/extensions/${id}`,
      warnings,
    };
  }

  /** Unpublish an entry */
  unpublishEntry(id: string): OperationResult {
    if (!this.entries.has(id)) {
      return { success: false, error: `Entry not found: ${id}` };
    }

    this.entries.delete(id);
    this.packages.delete(id);
    return { success: true };
  }

  /** Update an existing entry's manifest */
  updateEntry(id: string, manifest: MarketplaceManifest): OperationResult {
    const existing = this.entries.get(id);
    if (!existing) {
      return { success: false, error: `Entry not found: ${id}` };
    }

    this.entries.set(id, {
      ...existing,
      manifest,
      updatedAt: new Date().toISOString(),
    });

    return { success: true };
  }

  /** Get package buffer */
  getPackage(id: string): Buffer | null {
    return this.packages.get(id) ?? null;
  }

  /** Build a MarketplaceIndex from current entries */
  private buildIndex(): MarketplaceIndex {
    const allEntries = Array.from(this.entries.values());
    const categories = new Set<string>();
    const tags = new Set<string>();

    for (const entry of allEntries) {
      for (const cat of entry.manifest.categories) categories.add(cat);
      for (const tag of entry.manifest.tags) tags.add(tag);
    }

    return {
      entries: allEntries,
      categories: [...categories],
      tags: [...tags],
      lastUpdated: new Date().toISOString(),
    };
  }
}
