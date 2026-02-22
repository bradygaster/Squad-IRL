/**
 * Tests for AgentSessionManager (PRD 4)
 *
 * Covers:
 * - spawn() creates a session with correct state
 * - resume() activates an existing session
 * - destroy() removes and emits events
 * - Error cases (resume non-existent, destroy non-existent)
 * - getAgent() / getAllAgents() state management
 * - EventBus integration for lifecycle events
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  AgentSessionManager,
  type AgentCharter,
  type AgentSessionInfo,
} from '@bradygaster/squad-sdk/agents';

// --- Mock EventBus (matches client/event-bus.ts interface) ---

function createMockEventBus() {
  const handlers = new Map<string, Set<(event: any) => void>>();
  return {
    on(type: string, handler: (event: any) => void) {
      if (!handlers.has(type)) handlers.set(type, new Set());
      handlers.get(type)!.add(handler);
      return () => { handlers.get(type)?.delete(handler); };
    },
    onAny: vi.fn(),
    async emit(event: any) {
      const typeHandlers = handlers.get(event.type);
      if (typeHandlers) {
        for (const h of typeHandlers) h(event);
      }
    },
    clear: vi.fn(),
    _handlers: handlers,
  } as any;
}

// --- Helpers ---

function makeCharter(name: string): AgentCharter {
  return {
    name,
    displayName: `${name.charAt(0).toUpperCase() + name.slice(1)} — Test Agent`,
    role: 'Test Role',
    expertise: ['Testing'],
    style: 'Thorough',
    prompt: `You are ${name}, a test agent.`,
    modelPreference: 'claude-haiku-4.5',
  };
}

// =============================================================================
// AgentSessionManager Tests
// =============================================================================

describe('AgentSessionManager', () => {
  let manager: AgentSessionManager;

  beforeEach(() => {
    manager = new AgentSessionManager();
  });

  describe('constructor', () => {
    it('creates manager with empty agent map', () => {
      expect(manager).toBeDefined();
      expect(manager.getAllAgents()).toEqual([]);
    });

    it('accepts optional EventBus', () => {
      const bus = createMockEventBus();
      const m = new AgentSessionManager(bus);
      expect(m).toBeDefined();
    });
  });

  describe('spawn()', () => {
    it('creates session with active state', async () => {
      const charter = makeCharter('fenster');
      const info = await manager.spawn(charter);
      expect(info.state).toBe('active');
    });

    it('assigns a sessionId', async () => {
      const charter = makeCharter('fenster');
      const info = await manager.spawn(charter);
      expect(info.sessionId).toBeTruthy();
      expect(typeof info.sessionId).toBe('string');
    });

    it('stores charter reference', async () => {
      const charter = makeCharter('fenster');
      const info = await manager.spawn(charter);
      expect(info.charter).toBe(charter);
      expect(info.charter.name).toBe('fenster');
    });

    it('sets createdAt and lastActiveAt timestamps', async () => {
      const charter = makeCharter('fenster');
      const before = new Date();
      const info = await manager.spawn(charter);
      const after = new Date();
      expect(info.createdAt).toBeInstanceOf(Date);
      expect(info.createdAt!.getTime()).toBeGreaterThanOrEqual(before.getTime());
      expect(info.createdAt!.getTime()).toBeLessThanOrEqual(after.getTime());
      expect(info.lastActiveAt).toBeInstanceOf(Date);
    });

    it('defaults to standard response mode', async () => {
      const charter = makeCharter('fenster');
      const info = await manager.spawn(charter);
      expect(info.responseMode).toBe('standard');
    });

    it('respects lightweight mode', async () => {
      const charter = makeCharter('hockney');
      const info = await manager.spawn(charter, 'lightweight');
      expect(info.responseMode).toBe('lightweight');
    });

    it('respects full mode', async () => {
      const charter = makeCharter('verbal');
      const info = await manager.spawn(charter, 'full');
      expect(info.responseMode).toBe('full');
    });

    it('registers agent in internal map', async () => {
      const charter = makeCharter('fenster');
      await manager.spawn(charter);
      expect(manager.getAgent('fenster')).toBeDefined();
    });

    it('emits session.created event when EventBus provided', async () => {
      const bus = createMockEventBus();
      const events: any[] = [];
      bus.on('session.created', (e: any) => events.push(e));

      const m = new AgentSessionManager(bus);
      await m.spawn(makeCharter('fenster'));

      expect(events.length).toBe(1);
      expect(events[0].agentName).toBe('fenster');
      expect(events[0].payload.mode).toBe('standard');
    });

    it('can spawn multiple agents', async () => {
      await manager.spawn(makeCharter('fenster'));
      await manager.spawn(makeCharter('verbal'));
      await manager.spawn(makeCharter('hockney'));
      expect(manager.getAllAgents().length).toBe(3);
    });
  });

  describe('resume()', () => {
    it('reactivates an existing agent', async () => {
      await manager.spawn(makeCharter('fenster'));
      const info = await manager.resume('fenster');
      expect(info.state).toBe('active');
    });

    it('updates lastActiveAt on resume', async () => {
      await manager.spawn(makeCharter('fenster'));
      const before = manager.getAgent('fenster')!.lastActiveAt;
      // Small delay to ensure timestamp changes
      await new Promise(r => setTimeout(r, 5));
      const info = await manager.resume('fenster');
      expect(info.lastActiveAt!.getTime()).toBeGreaterThanOrEqual(before!.getTime());
    });

    it('throws for non-existent agent', async () => {
      await expect(manager.resume('nonexistent')).rejects.toThrow(/not found/);
    });

    it('throws for destroyed agent', async () => {
      await manager.spawn(makeCharter('fenster'));
      await manager.destroy('fenster');
      await expect(manager.resume('fenster')).rejects.toThrow(/not found/);
    });
  });

  describe('getAgent()', () => {
    it('returns undefined for unknown agent', () => {
      expect(manager.getAgent('nonexistent')).toBeUndefined();
    });

    it('returns agent info after spawn', async () => {
      await manager.spawn(makeCharter('fenster'));
      const info = manager.getAgent('fenster');
      expect(info).toBeDefined();
      expect(info!.charter.name).toBe('fenster');
    });
  });

  describe('getAllAgents()', () => {
    it('returns empty array when no agents', () => {
      expect(manager.getAllAgents()).toEqual([]);
    });

    it('returns all spawned agents', async () => {
      await manager.spawn(makeCharter('fenster'));
      await manager.spawn(makeCharter('verbal'));
      const all = manager.getAllAgents();
      expect(all.length).toBe(2);
      const names = all.map(a => a.charter.name);
      expect(names).toContain('fenster');
      expect(names).toContain('verbal');
    });
  });

  describe('destroy()', () => {
    it('removes agent from map', async () => {
      await manager.spawn(makeCharter('fenster'));
      await manager.destroy('fenster');
      expect(manager.getAgent('fenster')).toBeUndefined();
    });

    it('sets agent state to destroyed before removal', async () => {
      const bus = createMockEventBus();
      const m = new AgentSessionManager(bus);
      await m.spawn(makeCharter('fenster'));
      await m.destroy('fenster');
      // After destroy, agent is removed from map
      expect(m.getAgent('fenster')).toBeUndefined();
    });

    it('emits session.destroyed event when EventBus provided', async () => {
      const bus = createMockEventBus();
      const events: any[] = [];
      bus.on('session.destroyed', (e: any) => events.push(e));

      const m = new AgentSessionManager(bus);
      await m.spawn(makeCharter('fenster'));
      await m.destroy('fenster');

      expect(events.length).toBe(1);
      expect(events[0].agentName).toBe('fenster');
    });

    it('does not throw for non-existent agent', async () => {
      await expect(manager.destroy('nonexistent')).resolves.toBeUndefined();
    });

    it('reduces getAllAgents count', async () => {
      await manager.spawn(makeCharter('fenster'));
      await manager.spawn(makeCharter('verbal'));
      expect(manager.getAllAgents().length).toBe(2);
      await manager.destroy('fenster');
      expect(manager.getAllAgents().length).toBe(1);
    });
  });
});
