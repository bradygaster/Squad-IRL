/**
 * Squad Client — High-Level API with Session Pool Management (PRD 1)
 * 
 * This module provides the main Squad client API that combines:
 * - SquadClient adapter (from adapter/client.ts) for connection management
 * - SessionPool for multi-session lifecycle management
 * - EventBus for cross-session event handling
 * 
 * Applications should import from this module, not from adapter/ directly.
 */

// Re-export core types and classes from adapter layer
export {
  SquadClient,
  type SquadClientOptions,
  type SquadConnectionState,
} from '../adapter/client.js';

export type {
  SquadSession,
  SquadSessionConfig,
  SquadSessionMetadata,
  SquadGetStatusResponse,
  SquadGetAuthStatusResponse,
  SquadModelInfo,
} from '../adapter/types.js';

// Session status type for pool management
export type SessionStatus = 'creating' | 'active' | 'idle' | 'error' | 'destroyed';

// Re-export pool and event bus
export { SessionPool, type SessionPoolConfig, type PoolEvent, DEFAULT_POOL_CONFIG } from './session-pool.js';
export { EventBus, type SquadEvent, type SquadEventType } from './event-bus.js';

// --- High-Level Client with Pool Management ---

import { SquadClient as BaseSquadClient, type SquadClientOptions } from '../adapter/client.js';
import type { SquadSession, SquadSessionConfig } from '../adapter/types.js';
import { SessionPool, type SessionPoolConfig } from './session-pool.js';
import { EventBus } from './event-bus.js';

export interface SquadClientWithPoolConfig extends SquadClientOptions {
  /** Session pool configuration */
  pool?: Partial<SessionPoolConfig>;
}

/**
 * Squad Client with integrated session pool management.
 * 
 * This is the recommended client for applications that need to manage
 * multiple concurrent agent sessions. It provides:
 * - Connection lifecycle management (from SquadClient)
 * - Session pool with capacity limits and health checks
 * - Event bus for cross-session event handling
 * 
 * @example
 * ```typescript
 * const client = new SquadClientWithPool({
 *   pool: { maxConcurrent: 5 }
 * });
 * 
 * await client.connect();
 * 
 * const session1 = await client.createSession({ model: 'claude-sonnet-4.5' });
 * const session2 = await client.createSession({ model: 'claude-haiku-4.5' });
 * 
 * client.eventBus.on('session.created', (event) => {
 *   console.log('New session:', event.sessionId);
 * });
 * 
 * await client.shutdown();
 * ```
 */
export class SquadClientWithPool {
  private baseClient: BaseSquadClient;
  public readonly pool: SessionPool;
  public readonly eventBus: EventBus;
  
  constructor(config: SquadClientWithPoolConfig = {}) {
    this.baseClient = new BaseSquadClient(config);
    this.pool = new SessionPool(config.pool);
    this.eventBus = new EventBus();
    
    // Wire pool events to event bus
    this.pool.on((event) => {
      this.eventBus.emit({
        type: event.type as any,
        sessionId: event.sessionId,
        payload: event,
        timestamp: event.timestamp,
      });
    });
  }
  
  /** Connect to the Copilot CLI server */
  async connect(): Promise<void> {
    return this.baseClient.connect();
  }
  
  /** Disconnect from the Copilot CLI server */
  async disconnect(): Promise<Error[]> {
    await this.pool.shutdown();
    return this.baseClient.disconnect();
  }
  
  /** Force disconnect without graceful cleanup */
  async forceDisconnect(): Promise<void> {
    await this.pool.shutdown();
    return this.baseClient.forceDisconnect();
  }
  
  /** Get current connection state */
  getState() {
    return this.baseClient.getState();
  }
  
  /** Check if connected */
  isConnected(): boolean {
    return this.baseClient.isConnected();
  }
  
  /**
   * Create a new session and add it to the pool.
   * Throws if the pool is at capacity.
   */
  async createSession(config: SquadSessionConfig = {}): Promise<SquadSession> {
    const session = await this.baseClient.createSession(config);
    
    // Convert to pool-compatible session format
    const poolSession = {
      id: session.sessionId,
      agentName: config.model ?? 'default',
      status: 'active' as const,
      createdAt: new Date(),
    };
    
    this.pool.add(poolSession);
    
    await this.eventBus.emit({
      type: 'session.created',
      sessionId: session.sessionId,
      payload: { session },
      timestamp: new Date(),
    });
    
    return session;
  }
  
  /**
   * Resume an existing session and add it to the pool if not present.
   */
  async resumeSession(sessionId: string, config: SquadSessionConfig = {}): Promise<SquadSession> {
    const session = await this.baseClient.resumeSession(sessionId, config);
    
    if (!this.pool.get(sessionId)) {
      const poolSession = {
        id: session.sessionId,
        agentName: config.model ?? 'resumed',
        status: 'active' as const,
        createdAt: new Date(),
      };
      this.pool.add(poolSession);
    }
    
    return session;
  }
  
  /**
   * Delete a session and remove it from the pool.
   */
  async deleteSession(sessionId: string): Promise<void> {
    await this.baseClient.deleteSession(sessionId);
    this.pool.remove(sessionId);
    
    await this.eventBus.emit({
      type: 'session.destroyed',
      sessionId,
      payload: null,
      timestamp: new Date(),
    });
  }
  
  /** List all sessions from the base client */
  async listSessions() {
    return this.baseClient.listSessions();
  }
  
  /** Send a ping to verify connectivity */
  async ping(message?: string) {
    return this.baseClient.ping(message);
  }
  
  /** Get CLI status information */
  async getStatus() {
    return this.baseClient.getStatus();
  }
  
  /** Get authentication status */
  async getAuthStatus() {
    return this.baseClient.getAuthStatus();
  }
  
  /** List available models */
  async listModels() {
    return this.baseClient.listModels();
  }
  
  /** Subscribe to session lifecycle events */
  on(eventType: any, handler: any) {
    return this.baseClient.on(eventType, handler);
  }
  
  /**
   * Graceful shutdown — destroy all sessions and disconnect.
   */
  async shutdown(): Promise<void> {
    await this.pool.shutdown();
    await this.baseClient.disconnect();
  }
}

