/**
 * Coordinator Orchestrator (PRD 5)
 *
 * The central orchestration engine. Replaces the 32KB squad.agent.md
 * prompt-based coordinator with a TypeScript program that manages
 * agent sessions, routes work, and observes progress via SDK events.
 */

// --- M3-1 Coordinator ---
export {
  SquadCoordinator,
  type SquadCoordinatorOptions,
  type CoordinatorResult,
  type SpawnStrategy,
  type CoordinatorContext,
} from './coordinator.js';

// --- M3-6 Direct Response ---
export {
  DirectResponseHandler,
  type DirectResponseResult,
  type DirectResponseCategory,
  type DirectResponsePattern,
} from './direct-response.js';

// --- M1-10 Fan-Out ---
export {
  spawnParallel,
  aggregateSessionEvents,
  type AgentSpawnConfig,
  type SpawnResult,
  type FanOutDependencies,
} from './fan-out.js';

// --- Legacy types (kept for backwards compat) ---

import type { SquadClient, SquadSessionConfig } from '../client/index.js';
import type { EventBus } from '../client/event-bus.js';
import type { AgentSessionManager, AgentCharter } from '../agents/index.js';
import type { HookPipeline } from '../hooks/index.js';
import type { ToolRegistry } from '../tools/index.js';

// --- Routing Types ---

export type ResponseTier = 'direct' | 'lightweight' | 'standard' | 'full';

export interface RoutingDecision {
  /** Tier of response based on complexity */
  tier: ResponseTier;
  /** Target agent(s) for this request */
  agents: string[];
  /** Whether agents should run in parallel */
  parallel: boolean;
  /** Routing rationale (for observability) */
  rationale: string;
}

export interface CoordinatorConfig {
  /** Path to the team root (.squad/ directory) */
  teamRoot: string;
  /** Default model for routing decisions */
  model?: string;
  /** Enable parallel fan-out for multi-agent tasks */
  enableParallel?: boolean;
}

// --- Coordinator ---

export class Coordinator {
  private client: SquadClient | null = null;
  private eventBus: EventBus | null = null;
  private agentManager: AgentSessionManager | null = null;
  private hookPipeline: HookPipeline | null = null;
  private toolRegistry: ToolRegistry | null = null;
  private config: CoordinatorConfig;

  constructor(config: CoordinatorConfig) {
    this.config = config;
    // TODO: PRD 5 — Accept injected dependencies (client, eventBus, agentManager, hooks, tools)
  }

  /** Initialize the coordinator: connect client, load team, register hooks */
  async initialize(): Promise<void> {
    // TODO: PRD 5 — Initialize SquadClient and connect
    // TODO: PRD 5 — Load all agent charters via CharterCompiler
    // TODO: PRD 5 — Register custom tools via ToolRegistry
    // TODO: PRD 5 — Set up hook pipeline
    // TODO: PRD 5 — Subscribe to EventBus for agent lifecycle events
    // TODO: PRD 5 — Create coordinator's own session for routing logic
  }

  /** Route an incoming user message to the appropriate agent(s) */
  async route(message: string): Promise<RoutingDecision> {
    // TODO: PRD 5 — Determine response tier (direct/lightweight/standard/full)
    // TODO: PRD 5 — Select target agent(s) based on message content and team roster
    // TODO: PRD 5 — Handle parallel fan-out for multi-agent tasks
    throw new Error('Not implemented');
  }

  /** Execute a routing decision: spawn/resume agents and deliver work */
  async execute(decision: RoutingDecision, message: string): Promise<void> {
    // TODO: PRD 5 — Spawn or resume agent sessions per decision
    // TODO: PRD 5 — Deliver message via sendAndWait()
    // TODO: PRD 5 — Monitor progress via event subscriptions
  }

  /** Graceful shutdown */
  async shutdown(): Promise<void> {
    // TODO: PRD 5 — Destroy all agent sessions
    // TODO: PRD 5 — Disconnect client
  }
}
