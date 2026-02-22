/**
 * Marketplace Schema — types and utilities for marketplace entries
 * Issue #134 (M5-10)
 */

import type { SquadConfig } from '../config/schema.js';
import type { MarketplaceManifest } from './index.js';
import { ManifestCategory } from './index.js';

// --- MarketplaceEntry ---

export interface MarketplaceEntryStats {
  downloads: number;
  rating: number;
  reviews: number;
}

export interface MarketplaceEntry {
  id: string;
  manifest: MarketplaceManifest;
  stats: MarketplaceEntryStats;
  verified: boolean;
  featured: boolean;
  publishedAt: string;
  updatedAt: string;
}

// --- MarketplaceIndex ---

export interface MarketplaceIndex {
  entries: MarketplaceEntry[];
  categories: string[];
  tags: string[];
  lastUpdated: string;
}

// --- MarketplaceSearchQuery ---

export type MarketplaceSortField = 'downloads' | 'rating' | 'name' | 'recent';

export interface MarketplaceSearchQuery {
  query?: string;
  category?: string;
  tags?: string[];
  sort?: MarketplaceSortField;
  page?: number;
  perPage?: number;
}

// --- Search result ---

export interface MarketplaceSearchResult {
  entries: MarketplaceEntry[];
  total: number;
  page: number;
  perPage: number;
  totalPages: number;
}

// --- Search ---

export function searchMarketplace(
  index: MarketplaceIndex,
  query: MarketplaceSearchQuery,
): MarketplaceSearchResult {
  let filtered = [...index.entries];

  // Text search
  if (query.query) {
    const q = query.query.toLowerCase();
    filtered = filtered.filter(
      (e) =>
        e.manifest.name.toLowerCase().includes(q) ||
        e.manifest.description.toLowerCase().includes(q) ||
        e.manifest.tags.some((t) => t.toLowerCase().includes(q)),
    );
  }

  // Category filter
  if (query.category) {
    const cat = query.category.toLowerCase();
    filtered = filtered.filter((e) =>
      e.manifest.categories.some((c) => c.toLowerCase() === cat),
    );
  }

  // Tags filter
  if (query.tags && query.tags.length > 0) {
    const queryTags = query.tags.map((t) => t.toLowerCase());
    filtered = filtered.filter((e) =>
      queryTags.every((qt) =>
        e.manifest.tags.some((t) => t.toLowerCase() === qt),
      ),
    );
  }

  // Sort
  const sort = query.sort ?? 'downloads';
  filtered.sort((a, b) => {
    switch (sort) {
      case 'downloads':
        return b.stats.downloads - a.stats.downloads;
      case 'rating':
        return b.stats.rating - a.stats.rating;
      case 'name':
        return a.manifest.name.localeCompare(b.manifest.name);
      case 'recent':
        return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
      default:
        return 0;
    }
  });

  // Pagination
  const page = Math.max(1, query.page ?? 1);
  const perPage = Math.max(1, Math.min(100, query.perPage ?? 20));
  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / perPage));
  const start = (page - 1) * perPage;
  const paged = filtered.slice(start, start + perPage);

  return { entries: paged, total, page, perPage, totalPages };
}

// --- Validation ---

export interface EntryValidationResult {
  valid: boolean;
  errors: string[];
}

export function validateEntry(entry: MarketplaceEntry): EntryValidationResult {
  const errors: string[] = [];

  if (!entry.id || typeof entry.id !== 'string') {
    errors.push('id is required and must be a string');
  }

  if (!entry.manifest) {
    errors.push('manifest is required');
  } else {
    if (!entry.manifest.name) errors.push('manifest.name is required');
    if (!entry.manifest.version) errors.push('manifest.version is required');
    if (!entry.manifest.description) errors.push('manifest.description is required');
  }

  if (!entry.stats || typeof entry.stats !== 'object') {
    errors.push('stats is required');
  } else {
    if (typeof entry.stats.downloads !== 'number' || entry.stats.downloads < 0) {
      errors.push('stats.downloads must be a non-negative number');
    }
    if (typeof entry.stats.rating !== 'number' || entry.stats.rating < 0 || entry.stats.rating > 5) {
      errors.push('stats.rating must be between 0 and 5');
    }
    if (typeof entry.stats.reviews !== 'number' || entry.stats.reviews < 0) {
      errors.push('stats.reviews must be a non-negative number');
    }
  }

  if (typeof entry.verified !== 'boolean') {
    errors.push('verified must be a boolean');
  }
  if (typeof entry.featured !== 'boolean') {
    errors.push('featured must be a boolean');
  }

  return { valid: errors.length === 0, errors };
}

// --- Generate entry from config ---

export function generateEntryFromConfig(config: SquadConfig): MarketplaceEntry {
  const name = slugify(config.team.name);
  const now = new Date().toISOString();

  return {
    id: name,
    manifest: {
      name,
      version: config.version,
      description: config.team.description ?? `${config.team.name} — Squad-powered Copilot extension`,
      author: '',
      repository: '',
      categories: [ManifestCategory.Development],
      tags: config.agents.map((a) => a.role),
      icon: 'icon.png',
      screenshots: [],
      pricing: { model: 'free' },
    },
    stats: { downloads: 0, rating: 0, reviews: 0 },
    verified: false,
    featured: false,
    publishedAt: now,
    updatedAt: now,
  };
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}
