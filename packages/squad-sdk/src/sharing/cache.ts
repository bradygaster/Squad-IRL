/**
 * Caching Strategy for Remote Agents (M5-8, Issue #132)
 */

import type { AgentDefinition } from '../config/agent-source.js';

// --- Types ---

export interface CacheEntry<T = AgentDefinition> {
  value: T;
  timestamp: number;
  ttl: number;
  source: string;
}

export interface CacheStats {
  hits: number;
  misses: number;
  evictions: number;
  size: number;
}

// --- Constants ---

/** Default TTL: 1 hour for agent definitions. */
export const DEFAULT_AGENT_TTL = 60 * 60 * 1000;

/** Default TTL: 5 minutes for skill content. */
export const DEFAULT_SKILL_TTL = 5 * 60 * 1000;

// --- AgentCache class ---

export class AgentCache<T = AgentDefinition> {
  private cache = new Map<string, CacheEntry<T>>();
  private stats: CacheStats = { hits: 0, misses: 0, evictions: 0, size: 0 };
  private defaultTtl: number;

  constructor(defaultTtl: number = DEFAULT_AGENT_TTL) {
    this.defaultTtl = defaultTtl;
  }

  get(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) {
      this.stats.misses++;
      return null;
    }
    if (this.isExpired(entry)) {
      this.cache.delete(key);
      this.stats.evictions++;
      this.stats.size = this.cache.size;
      this.stats.misses++;
      return null;
    }
    this.stats.hits++;
    return entry.value;
  }

  set(key: string, value: T, ttl?: number, source = 'unknown'): void {
    this.cache.set(key, {
      value,
      timestamp: Date.now(),
      ttl: ttl ?? this.defaultTtl,
      source,
    });
    this.stats.size = this.cache.size;
  }

  invalidate(key: string): boolean {
    const deleted = this.cache.delete(key);
    if (deleted) {
      this.stats.evictions++;
      this.stats.size = this.cache.size;
    }
    return deleted;
  }

  clear(): void {
    const size = this.cache.size;
    this.cache.clear();
    this.stats.evictions += size;
    this.stats.size = 0;
  }

  has(key: string): boolean {
    const entry = this.cache.get(key);
    if (!entry) return false;
    if (this.isExpired(entry)) {
      this.cache.delete(key);
      this.stats.evictions++;
      this.stats.size = this.cache.size;
      return false;
    }
    return true;
  }

  getStats(): CacheStats {
    return { ...this.stats };
  }

  /** Return all non-expired entries. */
  entries(): Array<[string, CacheEntry<T>]> {
    const result: Array<[string, CacheEntry<T>]> = [];
    for (const [key, entry] of this.cache) {
      if (!this.isExpired(entry)) {
        result.push([key, entry]);
      }
    }
    return result;
  }

  private isExpired(entry: CacheEntry<T>): boolean {
    return Date.now() - entry.timestamp > entry.ttl;
  }
}
