/**
 * Tests for Coordinator class routing logic (PRD 5)
 *
 * Covers:
 * - route() returns correct tier for different message patterns
 * - Direct-response detection (status queries)
 * - Agent name mention routing (@fenster, @verbal)
 * - "team" keyword triggers full fan-out
 * - Default routing to lead agent
 * - initialize() / shutdown() lifecycle
 * - execute() emits events
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  Coordinator,
  type CoordinatorConfig,
  type RoutingDecision,
} from '@bradygaster/squad-sdk/coordinator';
import { EventBus } from '@bradygaster/squad-sdk/runtime/event-bus';

// --- Helpers ---

function makeConfig(overrides: Partial<CoordinatorConfig> = {}): CoordinatorConfig {
  return {
    teamRoot: '/test/team',
    ...overrides,
  };
}

// =============================================================================
// Coordinator.route() Tests
// =============================================================================

describe('Coordinator', () => {
  let coordinator: Coordinator;

  beforeEach(() => {
    coordinator = new Coordinator(makeConfig());
  });

  afterEach(async () => {
    await coordinator.shutdown();
  });

  // --- Direct response tier ---

  describe('route() — direct responses', () => {
    it('returns direct tier for "status"', async () => {
      const result = await coordinator.route('status');
      expect(result.tier).toBe('direct');
      expect(result.agents).toEqual([]);
      expect(result.parallel).toBe(false);
    });

    it('returns direct tier for "help"', async () => {
      const result = await coordinator.route('help');
      expect(result.tier).toBe('direct');
    });

    it('returns direct tier for "what is..."', async () => {
      const result = await coordinator.route('what is the current build status?');
      expect(result.tier).toBe('direct');
    });

    it('returns direct tier for "who is..."', async () => {
      const result = await coordinator.route('who is working on the parser?');
      expect(result.tier).toBe('direct');
    });

    it('returns direct tier for "how many agents?"', async () => {
      const result = await coordinator.route('how many agents are running?');
      expect(result.tier).toBe('direct');
    });

    it('returns direct tier for "show config"', async () => {
      const result = await coordinator.route('show config');
      expect(result.tier).toBe('direct');
    });

    it('returns direct tier for "list agents"', async () => {
      const result = await coordinator.route('list agents');
      expect(result.tier).toBe('direct');
    });

    it('includes rationale for direct responses', async () => {
      const result = await coordinator.route('status');
      expect(result.rationale).toContain('Direct response');
    });
  });

  // --- Agent name mention routing ---

  describe('route() — agent name mentions', () => {
    it('routes @fenster to fenster', async () => {
      const result = await coordinator.route('@fenster implement the auth module');
      expect(result.tier).toBe('standard');
      expect(result.agents).toEqual(['fenster']);
      expect(result.parallel).toBe(false);
    });

    it('routes @verbal to verbal', async () => {
      const result = await coordinator.route('@verbal write the API docs');
      expect(result.tier).toBe('standard');
      expect(result.agents).toEqual(['verbal']);
    });

    it('routes @hockney to hockney', async () => {
      const result = await coordinator.route('@hockney create tests for the parser');
      expect(result.agents).toEqual(['hockney']);
    });

    it('includes rationale with mentioned agent name', async () => {
      const result = await coordinator.route('@fenster do the thing');
      expect(result.rationale).toContain('fenster');
    });

    it('is case-insensitive for mentions', async () => {
      const result = await coordinator.route('@FENSTER fix the bug');
      expect(result.agents).toEqual(['fenster']);
    });
  });

  // --- Team keyword fan-out ---

  describe('route() — team keyword', () => {
    it('returns full tier for "team" keyword', async () => {
      const result = await coordinator.route('the team should review this');
      expect(result.tier).toBe('full');
      expect(result.agents).toEqual(['all']);
      expect(result.parallel).toBe(true);
    });

    it('detects team keyword mid-sentence', async () => {
      const result = await coordinator.route('ask the team to review this PR');
      expect(result.tier).toBe('full');
    });

    it('includes fan-out rationale', async () => {
      const result = await coordinator.route('team review needed');
      expect(result.rationale).toContain('fan-out');
    });
  });

  // --- Default routing ---

  describe('route() — default routing', () => {
    it('routes unknown messages to lead agent', async () => {
      const result = await coordinator.route('fix the authentication bug');
      expect(result.tier).toBe('standard');
      expect(result.agents).toEqual(['lead']);
      expect(result.parallel).toBe(false);
    });

    it('routes ambiguous messages to lead', async () => {
      const result = await coordinator.route('refactor the parser module');
      expect(result.agents).toEqual(['lead']);
    });

    it('includes default routing rationale', async () => {
      const result = await coordinator.route('do something');
      expect(result.rationale).toContain('Default');
    });
  });

  // --- Priority: @mention wins over "team" keyword ---

  describe('route() — priority ordering', () => {
    it('@mention takes priority over team keyword', async () => {
      const result = await coordinator.route('@fenster tell the team');
      // @mention is checked before "team" keyword
      expect(result.agents).toEqual(['fenster']);
      expect(result.tier).toBe('standard');
    });

    it('direct pattern takes priority over @mention', async () => {
      // "status @fenster" starts with "status" which matches direct pattern
      const result = await coordinator.route('status @fenster');
      expect(result.tier).toBe('direct');
    });
  });

  // --- Lifecycle ---

  describe('initialize()', () => {
    it('completes without error when no deps', async () => {
      await expect(coordinator.initialize()).resolves.toBeUndefined();
    });

    it('subscribes to EventBus events when provided', async () => {
      const eventBus = new EventBus();
      const coord = new Coordinator(makeConfig(), { eventBus });
      await coord.initialize();

      // Emit a session:created event — should not throw
      await eventBus.emit({
        type: 'session:created',
        sessionId: 'test-1',
        payload: {},
        timestamp: new Date(),
      });

      await coord.shutdown();
    });
  });

  describe('execute()', () => {
    it('emits coordinator:routing event on EventBus', async () => {
      const eventBus = new EventBus();
      const events: any[] = [];
      eventBus.subscribe('coordinator:routing', (e) => events.push(e));

      const coord = new Coordinator(makeConfig(), { eventBus });

      const decision: RoutingDecision = {
        tier: 'standard',
        agents: ['fenster'],
        parallel: false,
        rationale: 'Test routing',
      };

      await coord.execute(decision, 'test message');

      expect(events.length).toBe(1);
      expect(events[0].payload.decision).toEqual(decision);
      expect(events[0].payload.message).toBe('test message');

      await coord.shutdown();
    });

    it('does not throw when no EventBus', async () => {
      const decision: RoutingDecision = {
        tier: 'direct',
        agents: [],
        parallel: false,
        rationale: 'No bus',
      };

      await expect(coordinator.execute(decision, 'msg')).resolves.toBeUndefined();
    });
  });

  describe('shutdown()', () => {
    it('can be called multiple times safely', async () => {
      await coordinator.shutdown();
      await expect(coordinator.shutdown()).resolves.toBeUndefined();
    });

    it('unsubscribes from EventBus', async () => {
      const eventBus = new EventBus();
      const coord = new Coordinator(makeConfig(), { eventBus });
      await coord.initialize();
      await coord.shutdown();

      // After shutdown, events should not be processed (no console log)
      // Verifying no throw is sufficient
      await eventBus.emit({
        type: 'session:created',
        sessionId: 'after-shutdown',
        payload: {},
        timestamp: new Date(),
      });
    });
  });
});
