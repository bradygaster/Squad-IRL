/**
 * Agent Session Lifecycle (PRD 4)
 *
 * Manages the full agent lifecycle: spawn → active → idle → cleanup.
 * Compiles charter.md files into SDK CustomAgentConfig objects.
 * Injects dynamic context via session hooks instead of string templates.
 */

// --- M1-8 Charter Compilation + M2-9 Config-driven ---
export { 
  compileCharter, 
  compileCharterFull, 
  parseCharterMarkdown,
  type CharterCompileOptions, 
  type CharterConfigOverrides, 
  type ParsedCharter,
  type CompiledCharter,
} from './charter-compiler.js';

// --- M1-9 Model Selection + M3-5 Model Fallback ---
export { 
  resolveModel,
  inferTierFromModel,
  isTierFallbackAllowed,
  ModelFallbackExecutor,
  type ModelResolutionOptions, 
  type ResolvedModel,
  type TaskType,
  type ModelTier,
  type ModelResolutionSource,
  type FallbackExecutorConfig,
  type FallbackAttempt,
  type FallbackResult,
} from './model-selector.js';

// --- M1-7 Agent Lifecycle ---
export {
  AgentLifecycleManager,
  type AgentHandle,
  type AgentStatus,
  type SpawnAgentOptions,
  type LifecycleManagerConfig,
} from './lifecycle.js';

// --- M1-11 History Shadows ---
export {
  createHistoryShadow,
  appendToHistory,
  readHistory,
  shadowExists,
  deleteHistoryShadow,
  type HistorySection,
  type ParsedHistory,
} from './history-shadow.js';

// --- Charter Types ---

export interface AgentCharter {
  /** Agent name (e.g., 'fenster', 'verbal') */
  name: string;

  /** Display name (e.g., 'Fenster — Core Dev') */
  displayName: string;

  /** Role description */
  role: string;

  /** Expertise areas */
  expertise: string[];

  /** Working style */
  style: string;

  /** Full charter prompt content */
  prompt: string;

  /** Allowed tools for this agent */
  allowedTools?: string[];

  /** Excluded tools for this agent */
  excludedTools?: string[];

  /** Model preference from charter */
  modelPreference?: string;
}

export type AgentLifecycleState = 'pending' | 'spawning' | 'active' | 'idle' | 'error' | 'destroyed';

export interface AgentSessionInfo {
  charter: AgentCharter;
  sessionId: string | null;
  state: AgentLifecycleState;
  createdAt: Date | null;
  lastActiveAt: Date | null;
  /** Response mode: lightweight (no history), standard, full */
  responseMode: 'lightweight' | 'standard' | 'full';
}

// --- Charter Compiler ---

export class CharterCompiler {
  /**
   * Load and compile a charter.md file into an AgentCharter.
   * Parses frontmatter and prompt content from markdown.
   */
  async compile(charterPath: string): Promise<AgentCharter> {
    // TODO: PRD 4 — Read charter.md from filesystem
    // TODO: PRD 4 — Parse YAML frontmatter (name, role, expertise, style)
    // TODO: PRD 4 — Extract prompt body
    // TODO: PRD 4 — Map to CustomAgentConfig for SDK registration
    throw new Error('Not implemented');
  }

  /**
   * Load all charters from the team directory.
   * Scans .squad/agents/{name}/charter.md
   */
  async compileAll(teamRoot: string): Promise<AgentCharter[]> {
    // TODO: PRD 4 — Glob for charter.md files
    // TODO: PRD 4 — Compile each charter
    throw new Error('Not implemented');
  }
}

// --- Agent Session Manager ---

export class AgentSessionManager {
  private agents: Map<string, AgentSessionInfo> = new Map();

  constructor() {
    // TODO: PRD 4 — Accept SquadClient and SessionPool references
  }

  /** Spawn a new agent session from a charter */
  async spawn(charter: AgentCharter, mode: 'lightweight' | 'standard' | 'full' = 'standard'): Promise<AgentSessionInfo> {
    // TODO: PRD 4 — Create SDK session with compiled charter config
    // TODO: PRD 4 — Inject history.md and decisions.md via onSessionStart
    // TODO: PRD 4 — Register in session pool
    // TODO: PRD 4 — Emit lifecycle events
    throw new Error('Not implemented');
  }

  /** Resume an existing agent session */
  async resume(agentName: string): Promise<AgentSessionInfo> {
    // TODO: PRD 4 — Call SquadClient.resumeSession()
    // TODO: PRD 4 — Restore context and state
    throw new Error('Not implemented');
  }

  /** Get info about a specific agent */
  getAgent(name: string): AgentSessionInfo | undefined {
    return this.agents.get(name);
  }

  /** Get all agent session info */
  getAllAgents(): AgentSessionInfo[] {
    return Array.from(this.agents.values());
  }

  /** Destroy an agent session */
  async destroy(agentName: string): Promise<void> {
    // TODO: PRD 4 — Graceful shutdown with onSessionEnd hook
    // TODO: PRD 4 — Persist final state to history.md
    this.agents.delete(agentName);
  }
}
