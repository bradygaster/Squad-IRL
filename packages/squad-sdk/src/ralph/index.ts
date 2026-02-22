/**
 * Ralph — Work Monitor (PRD 8)
 *
 * Persistent SDK session that monitors agent work in real time.
 * Replaces ephemeral polling spawns with an event-driven observer
 * that accumulates knowledge across monitoring cycles.
 *
 * Three monitoring layers:
 *   1. In-session: Event subscriptions via EventBus
 *   2. Watchdog: Periodic health checks on session pool
 *   3. Cloud heartbeat: External health signal (future)
 */

import type { EventBus, SquadEvent } from '../client/event-bus.js';

// --- Monitor Types ---

export interface MonitorConfig {
  /** Team root directory */
  teamRoot: string;

  /** Health check interval (ms, default: 30000) */
  healthCheckInterval?: number;

  /** Stale session threshold (ms, default: 300000) */
  staleSessionThreshold?: number;

  /** Path to persist monitor state for crash recovery */
  statePath?: string;
}

export interface AgentWorkStatus {
  agentName: string;
  sessionId: string;
  status: 'working' | 'idle' | 'stale' | 'error';
  lastActivity: Date;
  currentTask?: string;
  milestones: string[];
}

export interface MonitorState {
  /** Timestamp of last health check */
  lastHealthCheck: Date | null;
  /** Per-agent work status */
  agents: Map<string, AgentWorkStatus>;
  /** Accumulated observations across cycles */
  observations: string[];
}

// --- Ralph Monitor ---

export class RalphMonitor {
  private config: MonitorConfig;
  private state: MonitorState;
  private eventBus: EventBus | null = null;

  constructor(config: MonitorConfig) {
    this.config = config;
    this.state = {
      lastHealthCheck: null,
      agents: new Map(),
      observations: [],
    };
    // TODO: PRD 8 — Load persisted state from statePath if exists
    // TODO: PRD 8 — Initialize as persistent SDK session via resumeSession('squad-ralph')
  }

  /** Start monitoring — subscribe to EventBus and begin health checks */
  async start(eventBus: EventBus): Promise<void> {
    this.eventBus = eventBus;
    // TODO: PRD 8 — Subscribe to session lifecycle events
    // TODO: PRD 8 — Subscribe to agent.milestone events
    // TODO: PRD 8 — Start periodic health check timer
    // TODO: PRD 8 — Register onSessionStart hook to track new agents
  }

  /** Handle an incoming event from the EventBus */
  private handleEvent(event: SquadEvent): void {
    // TODO: PRD 8 — Update agent work status based on event type
    // TODO: PRD 8 — Extract [MILESTONE] markers from agent output
    // TODO: PRD 8 — Detect stale sessions and flag for coordinator
  }

  /** Run a health check across all tracked agent sessions */
  async healthCheck(): Promise<AgentWorkStatus[]> {
    // TODO: PRD 8 — Check each session's last activity timestamp
    // TODO: PRD 8 — Mark stale sessions (no activity > threshold)
    // TODO: PRD 8 — Persist state to statePath for crash recovery
    this.state.lastHealthCheck = new Date();
    return Array.from(this.state.agents.values());
  }

  /** Get current work status for all agents */
  getStatus(): AgentWorkStatus[] {
    return Array.from(this.state.agents.values());
  }

  /** Stop monitoring and persist final state */
  async stop(): Promise<void> {
    // TODO: PRD 8 — Unsubscribe from EventBus
    // TODO: PRD 8 — Stop health check timer
    // TODO: PRD 8 — Persist final state to statePath
  }
}
