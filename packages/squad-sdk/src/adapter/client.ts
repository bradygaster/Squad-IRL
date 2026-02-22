/**
 * Squad SDK Client Adapter
 * 
 * Wraps CopilotClient to provide connection lifecycle management, error recovery,
 * automatic reconnection, and protocol version validation.
 * 
 * @module adapter/client
 */

import { CopilotClient } from "@github/copilot-sdk";
import type { 
  SquadSessionConfig, 
  SquadSession,
  SquadSessionEvent,
  SquadSessionEventHandler,
  SquadSessionEventType,
  SquadSessionMetadata,
  SquadGetAuthStatusResponse,
  SquadGetStatusResponse,
  SquadModelInfo,
} from "./types.js";

/**
 * Connection state for SquadClient.
 */
export type SquadConnectionState = "disconnected" | "connecting" | "connected" | "reconnecting" | "error";

/**
 * Options for creating a SquadClient.
 */
export interface SquadClientOptions {
  /**
   * Path to the Copilot CLI executable.
   * Defaults to bundled CLI from @github/copilot package.
   */
  cliPath?: string;

  /**
   * Additional arguments to pass to the CLI process.
   */
  cliArgs?: string[];

  /**
   * Working directory for the CLI process.
   * @default process.cwd()
   */
  cwd?: string;

  /**
   * Port to bind the CLI server (TCP mode).
   * Set to 0 for random port, or undefined to use stdio mode.
   */
  port?: number;

  /**
   * Use stdio transport instead of TCP.
   * @default true
   */
  useStdio?: boolean;

  /**
   * URL of an external CLI server to connect to.
   * Mutually exclusive with useStdio and cliPath.
   */
  cliUrl?: string;

  /**
   * Log level for the CLI process.
   * @default "debug"
   */
  logLevel?: "error" | "warning" | "info" | "debug" | "all" | "none";

  /**
   * Automatically start the connection when creating a session.
   * @default true
   */
  autoStart?: boolean;

  /**
   * Automatically reconnect on transient failures.
   * @default true
   */
  autoReconnect?: boolean;

  /**
   * Environment variables to pass to the CLI process.
   * @default process.env
   */
  env?: Record<string, string>;

  /**
   * GitHub token for authentication.
   * If not provided, uses logged-in user credentials.
   */
  githubToken?: string;

  /**
   * Use logged-in user credentials for authentication.
   * @default true (false if githubToken is provided)
   */
  useLoggedInUser?: boolean;

  /**
   * Maximum number of reconnection attempts before giving up.
   * @default 3
   */
  maxReconnectAttempts?: number;

  /**
   * Initial delay in milliseconds before first reconnection attempt.
   * Subsequent attempts use exponential backoff.
   * @default 1000
   */
  reconnectDelayMs?: number;
}

/**
 * SquadClient wraps CopilotClient with enhanced lifecycle management.
 * 
 * Features:
 * - Connection state tracking
 * - Automatic reconnection with exponential backoff
 * - Protocol version validation
 * - Error recovery
 * - Session lifecycle event handling
 * 
 * @example
 * ```typescript
 * const client = new SquadClient();
 * await client.connect();
 * 
 * const session = await client.createSession({
 *   model: "claude-sonnet-4.5"
 * });
 * 
 * await client.disconnect();
 * ```
 */
export class SquadClient {
  private client: CopilotClient;
  private state: SquadConnectionState = "disconnected";
  private reconnectAttempts: number = 0;
  private reconnectTimer: NodeJS.Timeout | null = null;
  private options: Required<Omit<SquadClientOptions, "cliUrl" | "githubToken" | "useLoggedInUser" | "cliPath" | "cliArgs">> & {
    cliUrl?: string;
    githubToken?: string;
    useLoggedInUser?: boolean;
    cliPath?: string;
    cliArgs: string[];
  };
  private manualDisconnect: boolean = false;

  /**
   * Creates a new SquadClient instance.
   * 
   * @param options - Configuration options
   * @throws Error if mutually exclusive options are provided
   */
  constructor(options: SquadClientOptions = {}) {
    this.options = {
      cliPath: options.cliPath,
      cliArgs: options.cliArgs ?? [],
      cwd: options.cwd ?? process.cwd(),
      port: options.port ?? 0,
      useStdio: options.useStdio ?? true,
      cliUrl: options.cliUrl,
      logLevel: options.logLevel ?? "debug",
      autoStart: options.autoStart ?? true,
      autoReconnect: options.autoReconnect ?? true,
      env: options.env ?? (process.env as Record<string, string>),
      githubToken: options.githubToken,
      useLoggedInUser: options.useLoggedInUser ?? (options.githubToken ? false : true),
      maxReconnectAttempts: options.maxReconnectAttempts ?? 3,
      reconnectDelayMs: options.reconnectDelayMs ?? 1000,
    };

    this.client = new CopilotClient({
      cliPath: this.options.cliPath,
      cliArgs: this.options.cliArgs,
      cwd: this.options.cwd,
      port: this.options.port,
      useStdio: this.options.useStdio,
      cliUrl: this.options.cliUrl,
      logLevel: this.options.logLevel,
      autoStart: false, // We manage connection lifecycle
      autoRestart: false, // We handle reconnection ourselves
      env: this.options.env,
      githubToken: this.options.githubToken,
      useLoggedInUser: this.options.useLoggedInUser,
    });
  }

  /**
   * Get the current connection state.
   */
  getState(): SquadConnectionState {
    return this.state;
  }

  /**
   * Check if the client is connected.
   */
  isConnected(): boolean {
    return this.state === "connected";
  }

  /**
   * Establish connection to the Copilot CLI server.
   * 
   * This method:
   * 1. Spawns or connects to the CLI server
   * 2. Validates protocol version compatibility
   * 3. Sets up automatic reconnection handlers
   * 
   * @returns Promise that resolves when connection is established
   * @throws Error if connection fails or protocol version is incompatible
   */
  async connect(): Promise<void> {
    if (this.state === "connected") {
      return;
    }

    if (this.state === "connecting") {
      throw new Error("Connection already in progress");
    }

    this.state = "connecting";
    this.manualDisconnect = false;

    const startTime = Date.now();

    try {
      await this.client.start();
      const elapsed = Date.now() - startTime;
      
      this.state = "connected";
      this.reconnectAttempts = 0;

      if (elapsed > 2000) {
        console.warn(`SquadClient connection took ${elapsed}ms (> 2s threshold)`);
      }
    } catch (error) {
      this.state = "error";
      throw new Error(
        `Failed to connect to Copilot CLI: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  /**
   * Disconnect from the Copilot CLI server.
   * 
   * Performs graceful cleanup:
   * 1. Destroys all active sessions
   * 2. Closes the connection
   * 3. Terminates the CLI process (if spawned)
   * 
   * @returns Promise that resolves with any errors encountered during cleanup
   */
  async disconnect(): Promise<Error[]> {
    this.manualDisconnect = true;

    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }

    const errors = await this.client.stop();
    this.state = "disconnected";
    this.reconnectAttempts = 0;

    return errors;
  }

  /**
   * Force disconnect without graceful cleanup.
   * Use only when disconnect() fails or hangs.
   */
  async forceDisconnect(): Promise<void> {
    this.manualDisconnect = true;

    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }

    await this.client.forceStop();
    this.state = "disconnected";
    this.reconnectAttempts = 0;
  }

  /**
   * Create a new Squad session.
   * 
   * If autoStart is enabled and the client is not connected, this will
   * automatically establish the connection.
   * 
   * @param config - Session configuration
   * @returns Promise that resolves with the created session
   */
  async createSession(config: SquadSessionConfig = {}): Promise<SquadSession> {
    if (!this.isConnected() && this.options.autoStart) {
      await this.connect();
    }

    if (!this.isConnected()) {
      throw new Error("Client not connected. Call connect() first.");
    }

    try {
      const session = await this.client.createSession(config);
      return session as unknown as SquadSession;
    } catch (error) {
      if (this.shouldAttemptReconnect(error)) {
        await this.attemptReconnection();
        return this.createSession(config);
      }
      throw error;
    }
  }

  /**
   * Resume an existing Squad session by ID.
   * 
   * @param sessionId - ID of the session to resume
   * @param config - Optional configuration overrides
   * @returns Promise that resolves with the resumed session
   */
  async resumeSession(sessionId: string, config: SquadSessionConfig = {}): Promise<SquadSession> {
    if (!this.isConnected() && this.options.autoStart) {
      await this.connect();
    }

    if (!this.isConnected()) {
      throw new Error("Client not connected. Call connect() first.");
    }

    try {
      const session = await this.client.resumeSession(sessionId, config);
      return session as unknown as SquadSession;
    } catch (error) {
      if (this.shouldAttemptReconnect(error)) {
        await this.attemptReconnection();
        return this.resumeSession(sessionId, config);
      }
      throw error;
    }
  }

  /**
   * List all available sessions.
   */
  async listSessions(): Promise<SquadSessionMetadata[]> {
    if (!this.isConnected()) {
      throw new Error("Client not connected");
    }

    try {
      const sessions = await this.client.listSessions();
      return sessions as unknown as SquadSessionMetadata[];
    } catch (error) {
      if (this.shouldAttemptReconnect(error)) {
        await this.attemptReconnection();
        return this.listSessions();
      }
      throw error;
    }
  }

  /**
   * Delete a session by ID.
   */
  async deleteSession(sessionId: string): Promise<void> {
    if (!this.isConnected()) {
      throw new Error("Client not connected");
    }

    try {
      await this.client.deleteSession(sessionId);
    } catch (error) {
      if (this.shouldAttemptReconnect(error)) {
        await this.attemptReconnection();
        return this.deleteSession(sessionId);
      }
      throw error;
    }
  }

  /**
   * Get the ID of the last updated session.
   */
  async getLastSessionId(): Promise<string | undefined> {
    if (!this.isConnected()) {
      throw new Error("Client not connected");
    }

    try {
      return await this.client.getLastSessionId();
    } catch (error) {
      if (this.shouldAttemptReconnect(error)) {
        await this.attemptReconnection();
        return this.getLastSessionId();
      }
      throw error;
    }
  }

  /**
   * Send a ping to verify connectivity.
   */
  async ping(message?: string): Promise<{ message: string; timestamp: number; protocolVersion?: number }> {
    if (!this.isConnected()) {
      throw new Error("Client not connected");
    }

    try {
      return await this.client.ping(message);
    } catch (error) {
      if (this.shouldAttemptReconnect(error)) {
        await this.attemptReconnection();
        return this.ping(message);
      }
      throw error;
    }
  }

  /**
   * Get CLI status information.
   */
  async getStatus(): Promise<SquadGetStatusResponse> {
    if (!this.isConnected()) {
      throw new Error("Client not connected");
    }

    try {
      return await this.client.getStatus();
    } catch (error) {
      if (this.shouldAttemptReconnect(error)) {
        await this.attemptReconnection();
        return this.getStatus();
      }
      throw error;
    }
  }

  /**
   * Get authentication status.
   */
  async getAuthStatus(): Promise<SquadGetAuthStatusResponse> {
    if (!this.isConnected()) {
      throw new Error("Client not connected");
    }

    try {
      return await this.client.getAuthStatus();
    } catch (error) {
      if (this.shouldAttemptReconnect(error)) {
        await this.attemptReconnection();
        return this.getAuthStatus();
      }
      throw error;
    }
  }

  /**
   * List available models.
   */
  async listModels(): Promise<SquadModelInfo[]> {
    if (!this.isConnected()) {
      throw new Error("Client not connected");
    }

    try {
      return await this.client.listModels();
    } catch (error) {
      if (this.shouldAttemptReconnect(error)) {
        await this.attemptReconnection();
        return this.listModels();
      }
      throw error;
    }
  }

  /**
   * Subscribe to session lifecycle events.
   */
  on(eventType: SquadSessionEventType, handler: SquadSessionEventHandler): () => void;
  on(handler: SquadSessionEventHandler): () => void;
  on(
    eventTypeOrHandler: SquadSessionEventType | SquadSessionEventHandler,
    handler?: SquadSessionEventHandler
  ): () => void {
    if (typeof eventTypeOrHandler === "string" && handler) {
      return this.client.on(eventTypeOrHandler as any, handler as any);
    } else {
      return this.client.on(eventTypeOrHandler as any);
    }
  }

  /**
   * Determine if an error is recoverable via reconnection.
   */
  private shouldAttemptReconnect(error: unknown): boolean {
    if (!this.options.autoReconnect) {
      return false;
    }

    if (this.manualDisconnect) {
      return false;
    }

    if (this.reconnectAttempts >= this.options.maxReconnectAttempts) {
      return false;
    }

    const message = error instanceof Error ? error.message : String(error);
    
    // Transient connection errors
    if (
      message.includes("ECONNREFUSED") ||
      message.includes("ECONNRESET") ||
      message.includes("EPIPE") ||
      message.includes("Client not connected") ||
      message.includes("Connection closed")
    ) {
      return true;
    }

    return false;
  }

  /**
   * Attempt to reconnect with exponential backoff.
   */
  private async attemptReconnection(): Promise<void> {
    if (this.state === "reconnecting") {
      throw new Error("Reconnection already in progress");
    }

    this.state = "reconnecting";
    this.reconnectAttempts++;

    const delay = this.options.reconnectDelayMs * Math.pow(2, this.reconnectAttempts - 1);

    await new Promise((resolve) => {
      this.reconnectTimer = setTimeout(resolve, delay);
    });

    try {
      await this.client.stop();
      await this.client.start();
      this.state = "connected";
      this.reconnectAttempts = 0;
    } catch (error) {
      this.state = "error";
      throw new Error(
        `Reconnection attempt ${this.reconnectAttempts} failed: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }
}
