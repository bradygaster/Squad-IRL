/**
 * Session Pool Manager (PRD 1)
 *
 * Manages the lifecycle of multiple concurrent agent sessions.
 * Tracks session state, enforces concurrency limits, and handles
 * cleanup of idle/errored sessions.
 */

export type SessionStatus = 'creating' | 'active' | 'idle' | 'error' | 'destroyed';

export interface SquadSession {
  id: string;
  agentName: string;
  status: SessionStatus;
  createdAt: Date;
}

// --- Pool Configuration ---

export interface SessionPoolConfig {
  /** Maximum concurrent sessions */
  maxConcurrent: number;

  /** Idle timeout before auto-cleanup (ms) */
  idleTimeout: number;

  /** Health check interval (ms) */
  healthCheckInterval: number;
}

export const DEFAULT_POOL_CONFIG: SessionPoolConfig = {
  maxConcurrent: 10,
  idleTimeout: 300_000, // 5 minutes
  healthCheckInterval: 30_000, // 30 seconds
};

// --- Pool Events ---

export type PoolEventType =
  | 'session.added'
  | 'session.removed'
  | 'session.status_changed'
  | 'pool.at_capacity'
  | 'pool.health_check';

export interface PoolEvent {
  type: PoolEventType;
  sessionId?: string;
  oldStatus?: SessionStatus;
  newStatus?: SessionStatus;
  timestamp: Date;
}

// --- Session Pool ---

export class SessionPool {
  private config: SessionPoolConfig;
  private sessions: Map<string, SquadSession> = new Map();
  private healthCheckTimer: NodeJS.Timeout | null = null;
  private cleanupTimer: NodeJS.Timeout | null = null;
  private listeners: Array<(event: PoolEvent) => void> = [];

  constructor(config: Partial<SessionPoolConfig> = {}) {
    this.config = { ...DEFAULT_POOL_CONFIG, ...config };
    this.startHealthCheckTimer();
    this.startCleanupTimer();
  }

  /** Add a session to the pool */
  add(session: SquadSession): void {
    if (this.atCapacity) {
      this.emitEvent({
        type: 'pool.at_capacity',
        timestamp: new Date(),
      });
      throw new Error(`SessionPool at capacity (${this.config.maxConcurrent})`);
    }
    this.sessions.set(session.id, session);
    this.emitEvent({
      type: 'session.added',
      sessionId: session.id,
      timestamp: new Date(),
    });
  }

  /** Remove a session from the pool */
  remove(sessionId: string): boolean {
    const existed = this.sessions.delete(sessionId);
    if (existed) {
      this.emitEvent({
        type: 'session.removed',
        sessionId,
        timestamp: new Date(),
      });
    }
    return existed;
  }

  /** Get a session by ID */
  get(sessionId: string): SquadSession | undefined {
    return this.sessions.get(sessionId);
  }

  /** Find a session by agent name */
  findByAgent(agentName: string): SquadSession | undefined {
    for (const session of this.sessions.values()) {
      if (session.agentName === agentName) return session;
    }
    return undefined;
  }

  /** Get all active sessions */
  active(): SquadSession[] {
    return Array.from(this.sessions.values()).filter(s => s.status === 'active');
  }

  /** Update session status and emit event */
  updateStatus(sessionId: string, newStatus: SessionStatus): void {
    const session = this.sessions.get(sessionId);
    if (!session) return;
    
    const oldStatus = session.status;
    if (oldStatus !== newStatus) {
      session.status = newStatus;
      this.emitEvent({
        type: 'session.status_changed',
        sessionId,
        oldStatus,
        newStatus,
        timestamp: new Date(),
      });
    }
  }

  /** Current pool size */
  get size(): number {
    return this.sessions.size;
  }

  /** Whether the pool is at capacity */
  get atCapacity(): boolean {
    return this.sessions.size >= this.config.maxConcurrent;
  }

  /** Destroy all sessions and stop timers */
  async shutdown(): Promise<void> {
    if (this.healthCheckTimer) {
      clearInterval(this.healthCheckTimer);
      this.healthCheckTimer = null;
    }
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
      this.cleanupTimer = null;
    }
    this.sessions.clear();
  }

  /** Subscribe to pool events */
  on(handler: (event: PoolEvent) => void): () => void {
    this.listeners.push(handler);
    return () => {
      const index = this.listeners.indexOf(handler);
      if (index !== -1) this.listeners.splice(index, 1);
    };
  }

  /** Emit a pool event to all listeners */
  private emitEvent(event: PoolEvent): void {
    for (const listener of this.listeners) {
      listener(event);
    }
  }

  /** Start the health check timer */
  private startHealthCheckTimer(): void {
    this.healthCheckTimer = setInterval(() => {
      this.emitEvent({
        type: 'pool.health_check',
        timestamp: new Date(),
      });
    }, this.config.healthCheckInterval);
  }

  /** Start the idle session cleanup timer */
  private startCleanupTimer(): void {
    this.cleanupTimer = setInterval(() => {
      const now = Date.now();
      for (const session of this.sessions.values()) {
        if (session.status === 'idle') {
          const idleTime = now - session.createdAt.getTime();
          if (idleTime > this.config.idleTimeout) {
            this.remove(session.id);
          }
        }
      }
    }, this.config.idleTimeout);
  }
}
