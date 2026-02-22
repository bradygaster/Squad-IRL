/**
 * Offline Mode — graceful degradation when connectivity is unavailable
 * Issue #142 (M5-14)
 */

// --- Connectivity status ---

export type ConnectivityStatus = 'online' | 'offline' | 'degraded';

// --- PendingOperation ---

export interface PendingOperation {
  id: string;
  type: string;
  payload: Record<string, unknown>;
  timestamp: string;
  retries: number;
}

// --- Offline capabilities ---

export interface OfflineCapabilities {
  localAgents: boolean;
  cachedSkills: boolean;
  configEditing: boolean;
  marketplaceBrowse: boolean;
  publishing: boolean;
  remoteAgents: boolean;
}

// --- Offline status ---

export interface OfflineStatus {
  connectivity: ConnectivityStatus;
  pendingOps: number;
  lastSync: string | null;
  cachedAgents: string[];
}

// --- Detect connectivity ---

export function detectConnectivity(
  checker?: () => Promise<boolean>,
): Promise<ConnectivityStatus> {
  if (!checker) {
    return Promise.resolve('online');
  }

  return checker()
    .then((ok) => (ok ? 'online' : 'offline') as ConnectivityStatus)
    .catch(() => 'offline' as ConnectivityStatus);
}

// --- OfflineManager ---

export class OfflineManager {
  private connectivity: ConnectivityStatus = 'online';
  private pendingQueue: PendingOperation[] = [];
  private lastSyncTime: string | null = null;
  private cachedAgentNames: string[] = [];
  private connectivityChecker?: () => Promise<boolean>;
  private syncHandler?: (op: PendingOperation) => Promise<boolean>;

  constructor(options?: {
    connectivityChecker?: () => Promise<boolean>;
    syncHandler?: (op: PendingOperation) => Promise<boolean>;
    cachedAgents?: string[];
  }) {
    this.connectivityChecker = options?.connectivityChecker;
    this.syncHandler = options?.syncHandler;
    this.cachedAgentNames = options?.cachedAgents ?? [];
  }

  /** Get what works offline */
  getOfflineCapabilities(): OfflineCapabilities {
    const isOnline = this.connectivity === 'online';
    return {
      localAgents: true,
      cachedSkills: true,
      configEditing: true,
      marketplaceBrowse: isOnline || this.connectivity === 'degraded',
      publishing: isOnline,
      remoteAgents: isOnline,
    };
  }

  /** Queue an operation for later sync */
  queueForSync(operation: PendingOperation): void {
    this.pendingQueue.push({ ...operation });
  }

  /** Replay queued operations */
  async syncPending(): Promise<SyncResult> {
    if (this.connectivity === 'offline') {
      return { synced: 0, failed: 0, remaining: this.pendingQueue.length };
    }

    let synced = 0;
    let failed = 0;
    const remaining: PendingOperation[] = [];

    for (const op of this.pendingQueue) {
      try {
        const success = this.syncHandler
          ? await this.syncHandler(op)
          : true;
        if (success) {
          synced++;
        } else {
          op.retries++;
          remaining.push(op);
          failed++;
        }
      } catch {
        op.retries++;
        remaining.push(op);
        failed++;
      }
    }

    this.pendingQueue = remaining;
    this.lastSyncTime = new Date().toISOString();

    return { synced, failed, remaining: remaining.length };
  }

  /** Get current offline status */
  getOfflineStatus(): OfflineStatus {
    return {
      connectivity: this.connectivity,
      pendingOps: this.pendingQueue.length,
      lastSync: this.lastSyncTime,
      cachedAgents: [...this.cachedAgentNames],
    };
  }

  /** Update connectivity status */
  async refreshConnectivity(): Promise<ConnectivityStatus> {
    this.connectivity = await detectConnectivity(this.connectivityChecker);
    return this.connectivity;
  }

  /** Set connectivity directly (useful for testing) */
  setConnectivity(status: ConnectivityStatus): void {
    this.connectivity = status;
  }

  /** Add a cached agent name */
  addCachedAgent(name: string): void {
    if (!this.cachedAgentNames.includes(name)) {
      this.cachedAgentNames.push(name);
    }
  }

  /** Get pending operations */
  getPendingOperations(): PendingOperation[] {
    return [...this.pendingQueue];
  }

  /** Clear all pending operations */
  clearPending(): void {
    this.pendingQueue = [];
  }
}

// --- Sync result ---

export interface SyncResult {
  synced: number;
  failed: number;
  remaining: number;
}
