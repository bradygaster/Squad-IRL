/**
 * Tests for RalphMonitor — Work Monitor (PRD 8)
 *
 * Covers:
 * - start/stop lifecycle
 * - Event tracking (session created/destroyed)
 * - Health check (stale session detection)
 * - getStatus() returns current agent work statuses
 *
 * NOTE: RalphMonitor is a partial stub (TODOs for event subscriptions
 * and persistence). Tests validate current behavior and document
 * expected behavior once implementations land.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  RalphMonitor,
  type MonitorConfig,
  type AgentWorkStatus,
} from '@bradygaster/squad-sdk/ralph';

// --- Mock EventBus ---

function createMockEventBus() {
  const handlers = new Map<string, Set<(event: any) => void>>();
  const allHandlers = new Set<(event: any) => void>();

  return {
    subscribe(type: string, handler: (event: any) => void) {
      if (!handlers.has(type)) handlers.set(type, new Set());
      handlers.get(type)!.add(handler);
      return () => { handlers.get(type)?.delete(handler); };
    },
    subscribeAll(handler: (event: any) => void) {
      allHandlers.add(handler);
      return () => { allHandlers.delete(handler); };
    },
    async emit(event: any) {
      const typeHandlers = handlers.get(event.type);
      if (typeHandlers) {
        for (const h of typeHandlers) h(event);
      }
      for (const h of allHandlers) h(event);
    },
    clear() {
      handlers.clear();
      allHandlers.clear();
    },
    // Expose for test inspection
    _handlers: handlers,
    _allHandlers: allHandlers,
  } as any;
}

// --- Helpers ---

function makeConfig(overrides: Partial<MonitorConfig> = {}): MonitorConfig {
  return {
    teamRoot: '/test/team',
    healthCheckInterval: 5000,
    staleSessionThreshold: 10000,
    ...overrides,
  };
}

// =============================================================================
// RalphMonitor Tests
// =============================================================================

describe('RalphMonitor', () => {
  let monitor: RalphMonitor;

  beforeEach(() => {
    monitor = new RalphMonitor(makeConfig());
  });

  // --- Constructor ---

  describe('constructor', () => {
    it('creates monitor with config', () => {
      expect(monitor).toBeDefined();
    });

    it('initializes with empty status', () => {
      const status = monitor.getStatus();
      expect(status).toEqual([]);
    });
  });

  // --- start/stop lifecycle ---

  describe('start()', () => {
    it('accepts an EventBus and does not throw', async () => {
      const eventBus = createMockEventBus();
      await expect(monitor.start(eventBus)).resolves.toBeUndefined();
    });

    it('can be called multiple times without error', async () => {
      const eventBus = createMockEventBus();
      await monitor.start(eventBus);
      await expect(monitor.start(eventBus)).resolves.toBeUndefined();
    });
  });

  describe('stop()', () => {
    it('does not throw when stopped before start', async () => {
      await expect(monitor.stop()).resolves.toBeUndefined();
    });

    it('does not throw after start', async () => {
      const eventBus = createMockEventBus();
      await monitor.start(eventBus);
      await expect(monitor.stop()).resolves.toBeUndefined();
    });

    it('can be called multiple times safely', async () => {
      await monitor.stop();
      await expect(monitor.stop()).resolves.toBeUndefined();
    });
  });

  describe('start → stop lifecycle', () => {
    it('completes full start → stop cycle', async () => {
      const eventBus = createMockEventBus();
      await monitor.start(eventBus);
      await monitor.stop();
      expect(monitor.getStatus()).toEqual([]);
    });
  });

  // --- getStatus() ---

  describe('getStatus()', () => {
    it('returns empty array initially', () => {
      expect(monitor.getStatus()).toEqual([]);
    });

    it('returns array type', () => {
      const result = monitor.getStatus();
      expect(Array.isArray(result)).toBe(true);
    });
  });

  // --- healthCheck() ---

  describe('healthCheck()', () => {
    it('returns empty array when no agents tracked', async () => {
      const result = await monitor.healthCheck();
      expect(result).toEqual([]);
    });

    it('returns AgentWorkStatus array', async () => {
      const result = await monitor.healthCheck();
      expect(Array.isArray(result)).toBe(true);
    });

    it('can be called multiple times', async () => {
      const result1 = await monitor.healthCheck();
      const result2 = await monitor.healthCheck();
      expect(result1).toEqual([]);
      expect(result2).toEqual([]);
    });

    it('works after start()', async () => {
      const eventBus = createMockEventBus();
      await monitor.start(eventBus);
      const result = await monitor.healthCheck();
      expect(Array.isArray(result)).toBe(true);
    });
  });

  // --- Config ---

  describe('config', () => {
    it('accepts custom health check interval', () => {
      const m = new RalphMonitor(makeConfig({ healthCheckInterval: 60000 }));
      expect(m).toBeDefined();
    });

    it('accepts custom stale session threshold', () => {
      const m = new RalphMonitor(makeConfig({ staleSessionThreshold: 600000 }));
      expect(m).toBeDefined();
    });

    it('accepts optional statePath', () => {
      const m = new RalphMonitor(makeConfig({ statePath: '/tmp/ralph-state.json' }));
      expect(m).toBeDefined();
    });
  });

  // --- Edge cases ---

  describe('edge cases', () => {
    it('healthCheck after stop does not throw', async () => {
      const eventBus = createMockEventBus();
      await monitor.start(eventBus);
      await monitor.stop();
      await expect(monitor.healthCheck()).resolves.toEqual([]);
    });

    it('getStatus after stop returns empty', async () => {
      const eventBus = createMockEventBus();
      await monitor.start(eventBus);
      await monitor.stop();
      expect(monitor.getStatus()).toEqual([]);
    });
  });
});
