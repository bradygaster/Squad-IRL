/**
 * Agent Repository Configuration (M5-7, Issue #131)
 */

import type { AgentDefinition, AgentManifest, GitHubFetcher } from '../config/agent-source.js';
import { parseCharterMetadata } from '../config/agent-source.js';

// --- Types ---

export interface AgentRepoConfig {
  owner: string;
  repo: string;
  branch?: string;
  path?: string;
  authentication?: {
    type: 'token' | 'app';
    token?: string;
  };
}

export interface PushResult {
  success: boolean;
  sha?: string;
  errors: string[];
}

/**
 * Abstracted GitHub operations for agent repo management.
 */
export interface AgentRepoOperations extends GitHubFetcher {
  /** Push a file to a repo (create or update). */
  pushFile(
    owner: string,
    repo: string,
    path: string,
    content: string,
    message: string,
    branch?: string,
  ): Promise<{ sha: string }>;
}

// --- Validation ---

export function configureAgentRepo(config: AgentRepoConfig): AgentRepoConfig {
  if (!config.owner || typeof config.owner !== 'string') {
    throw new Error('owner is required');
  }
  if (!config.repo || typeof config.repo !== 'string') {
    throw new Error('repo is required');
  }
  return {
    owner: config.owner,
    repo: config.repo,
    branch: config.branch ?? 'main',
    path: config.path ?? '.squad/agents',
    authentication: config.authentication,
  };
}

// --- List agents ---

export async function listRepoAgents(
  config: AgentRepoConfig,
  ops: AgentRepoOperations,
): Promise<AgentManifest[]> {
  const agentPath = config.path ?? '.squad/agents';
  const entries = await ops.listDirectory(config.owner, config.repo, agentPath, config.branch);
  const dirs = entries.filter(e => e.type === 'dir');
  const manifests: AgentManifest[] = [];

  for (const dir of dirs) {
    const charterPath = `${agentPath}/${dir.name}/charter.md`;
    const content = await ops.getFileContent(config.owner, config.repo, charterPath, config.branch);
    if (!content) continue;
    const meta = parseCharterMetadata(content);
    manifests.push({
      name: meta.name || dir.name,
      role: meta.role || 'agent',
      source: `github:${config.owner}/${config.repo}`,
    });
  }

  return manifests;
}

// --- Pull agent ---

export async function pullAgent(
  config: AgentRepoConfig,
  agentId: string,
  ops: AgentRepoOperations,
): Promise<AgentDefinition | null> {
  const agentPath = config.path ?? '.squad/agents';
  const charterPath = `${agentPath}/${agentId}/charter.md`;
  const charter = await ops.getFileContent(config.owner, config.repo, charterPath, config.branch);
  if (!charter) return null;

  const meta = parseCharterMetadata(charter);

  let history: string | undefined;
  const historyPath = `${agentPath}/${agentId}/history.md`;
  const historyContent = await ops.getFileContent(config.owner, config.repo, historyPath, config.branch);
  if (historyContent) history = historyContent;

  return {
    name: meta.name || agentId,
    role: meta.role || 'agent',
    source: `github:${config.owner}/${config.repo}`,
    charter,
    model: meta.model,
    tools: meta.tools,
    skills: meta.skills,
    history,
  };
}

// --- Push agent ---

export async function pushAgent(
  config: AgentRepoConfig,
  agent: AgentDefinition,
  ops: AgentRepoOperations,
): Promise<PushResult> {
  const agentPath = config.path ?? '.squad/agents';
  const charterPath = `${agentPath}/${agent.name}/charter.md`;
  const errors: string[] = [];

  try {
    const result = await ops.pushFile(
      config.owner,
      config.repo,
      charterPath,
      agent.charter,
      `Update agent ${agent.name}`,
      config.branch,
    );
    return { success: true, sha: result.sha, errors };
  } catch (err) {
    errors.push(err instanceof Error ? err.message : String(err));
    return { success: false, errors };
  }
}
