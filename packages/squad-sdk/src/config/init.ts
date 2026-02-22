/**
 * Squad Initialization Module (M2-6, PRD #98)
 * 
 * Creates new Squad projects with typed configuration.
 * Generates squad.config.ts or squad.config.json with agent definitions.
 * 
 * @module config/init
 */

import { mkdir, writeFile } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';
import type { SquadConfig, ModelSelectionConfig, RoutingConfig } from '../runtime/config.js';

// ============================================================================
// Initialization Types
// ============================================================================

/**
 * Agent specification for initialization.
 */
export interface InitAgentSpec {
  /** Agent name (kebab-case) */
  name: string;
  /** Agent role identifier */
  role: string;
  /** Display name (optional, defaults to titlecased name) */
  displayName?: string;
}

/**
 * Initialization options.
 */
export interface InitOptions {
  /** Root directory for Squad team files */
  teamRoot: string;
  /** Project name */
  projectName: string;
  /** Project description (optional) */
  projectDescription?: string;
  /** Agents to create */
  agents: InitAgentSpec[];
  /** Config format (typescript or json) */
  configFormat?: 'typescript' | 'json';
  /** User name for initial history entries */
  userName?: string;
}

/**
 * Initialization result.
 */
export interface InitResult {
  /** List of created file paths */
  createdFiles: string[];
  /** Configuration file path */
  configPath: string;
  /** Agent directory paths */
  agentDirs: string[];
}

// ============================================================================
// Default Agent Templates
// ============================================================================

/**
 * Default agent templates for common roles.
 */
const AGENT_TEMPLATES: Record<string, { displayName: string; description: string }> = {
  'lead': {
    displayName: 'Lead',
    description: 'Technical lead responsible for architecture, delegation, and project coordination.'
  },
  'developer': {
    displayName: 'Developer',
    description: 'Software developer focused on feature implementation and code quality.'
  },
  'tester': {
    displayName: 'Tester',
    description: 'Quality assurance specialist responsible for test coverage and validation.'
  },
  'scribe': {
    displayName: 'Scribe',
    description: 'Documentation specialist maintaining history, decisions, and technical records.'
  },
  'ralph': {
    displayName: 'Ralph',
    description: 'Persistent memory agent that maintains context across sessions.'
  }
};

// ============================================================================
// Configuration Templates
// ============================================================================

/**
 * Generate TypeScript config file content.
 */
function generateTypeScriptConfig(options: InitOptions): string {
  const { projectName, projectDescription, agents } = options;
  
  return `import type { SquadConfig } from '@bradygaster/squad';

/**
 * Squad Configuration for ${projectName}
 * ${projectDescription ? `\n * ${projectDescription}` : ''}
 */
const config: SquadConfig = {
  version: '1.0.0',
  
  models: {
    defaultModel: 'claude-sonnet-4.5',
    defaultTier: 'standard',
    fallbackChains: {
      premium: ['claude-opus-4.6', 'claude-opus-4.5', 'gpt-5.2'],
      standard: ['claude-sonnet-4.5', 'gpt-5.1-codex', 'claude-sonnet-4'],
      fast: ['claude-haiku-4.5', 'gpt-5-mini', 'gpt-4.1']
    },
    preferSameProvider: true,
    respectTierCeiling: true,
    nuclearFallback: {
      enabled: false,
      model: 'claude-haiku-4.5',
      maxRetriesBeforeNuclear: 3
    }
  },
  
  routing: {
    rules: [
      {
        workType: 'feature-dev',
        agents: ['@${agents[0]?.name || 'coordinator'}'],
        confidence: 'high'
      },
      {
        workType: 'bug-fix',
        agents: ['@${agents.find(a => a.role === 'developer')?.name || agents[0]?.name || 'coordinator'}'],
        confidence: 'high'
      },
      {
        workType: 'testing',
        agents: ['@${agents.find(a => a.role === 'tester')?.name || agents[0]?.name || 'coordinator'}'],
        confidence: 'high'
      },
      {
        workType: 'documentation',
        agents: ['@${agents.find(a => a.role === 'scribe')?.name || agents[0]?.name || 'coordinator'}'],
        confidence: 'high'
      }
    ],
    governance: {
      eagerByDefault: true,
      scribeAutoRuns: false,
      allowRecursiveSpawn: false
    }
  },
  
  casting: {
    allowlistUniverses: [
      'The Usual Suspects',
      'Breaking Bad',
      'The Wire',
      'Firefly'
    ],
    overflowStrategy: 'generic',
    universeCapacity: {}
  },
  
  platforms: {
    vscode: {
      disableModelSelection: false,
      scribeMode: 'sync'
    }
  }
};

export default config;
`;
}

/**
 * Generate JSON config file content.
 */
function generateJsonConfig(options: InitOptions): string {
  const { agents } = options;
  
  const config: SquadConfig = {
    version: '1.0.0',
    models: {
      defaultModel: 'claude-sonnet-4.5',
      defaultTier: 'standard',
      fallbackChains: {
        premium: ['claude-opus-4.6', 'claude-opus-4.5', 'gpt-5.2'],
        standard: ['claude-sonnet-4.5', 'gpt-5.1-codex', 'claude-sonnet-4'],
        fast: ['claude-haiku-4.5', 'gpt-5-mini', 'gpt-4.1']
      },
      preferSameProvider: true,
      respectTierCeiling: true,
      nuclearFallback: {
        enabled: false,
        model: 'claude-haiku-4.5',
        maxRetriesBeforeNuclear: 3
      }
    },
    routing: {
      rules: [
        {
          workType: 'feature-dev',
          agents: [`@${agents[0]?.name || 'coordinator'}`],
          confidence: 'high'
        },
        {
          workType: 'bug-fix',
          agents: [`@${agents.find(a => a.role === 'developer')?.name || agents[0]?.name || 'coordinator'}`],
          confidence: 'high'
        },
        {
          workType: 'testing',
          agents: [`@${agents.find(a => a.role === 'tester')?.name || agents[0]?.name || 'coordinator'}`],
          confidence: 'high'
        },
        {
          workType: 'documentation',
          agents: [`@${agents.find(a => a.role === 'scribe')?.name || agents[0]?.name || 'coordinator'}`],
          confidence: 'high'
        }
      ],
      governance: {
        eagerByDefault: true,
        scribeAutoRuns: false,
        allowRecursiveSpawn: false
      }
    },
    casting: {
      allowlistUniverses: [
        'The Usual Suspects',
        'Breaking Bad',
        'The Wire',
        'Firefly'
      ],
      overflowStrategy: 'generic',
      universeCapacity: {}
    },
    platforms: {
      vscode: {
        disableModelSelection: false,
        scribeMode: 'sync'
      }
    }
  };
  
  return JSON.stringify(config, null, 2);
}

// ============================================================================
// Agent Template Generation
// ============================================================================

/**
 * Generate charter.md content for an agent.
 */
function generateCharter(agent: InitAgentSpec, projectName: string, projectDescription?: string): string {
  const template = AGENT_TEMPLATES[agent.role];
  const displayName = agent.displayName || template?.displayName || titleCase(agent.name);
  const description = template?.description || 'Team member focused on their assigned responsibilities.';
  
  return `# ${displayName} — ${titleCase(agent.role)}

${description}

## Project Context

**Project:** ${projectName}
${projectDescription ? `**Description:** ${projectDescription}\n` : ''}

## Responsibilities

- Collaborate with team members on assigned work
- Maintain code quality and project standards
- Document decisions and progress in history

## Work Style

- Read project context and team decisions before starting work
- Communicate clearly with team members
- Follow established patterns and conventions
`;
}

/**
 * Generate initial history.md content for an agent.
 */
function generateInitialHistory(
  agent: InitAgentSpec,
  projectName: string,
  projectDescription?: string,
  userName?: string
): string {
  const displayName = agent.displayName || AGENT_TEMPLATES[agent.role]?.displayName || titleCase(agent.name);
  const now = new Date().toISOString().split('T')[0];
  
  return `# Project Context

${userName ? `- **Owner:** ${userName}\n` : ''}- **Project:** ${projectName}
${projectDescription ? `- **Description:** ${projectDescription}\n` : ''}- **Created:** ${now}

## Core Context

Agent ${displayName} initialized and ready for work.

## Recent Updates

📌 Team initialized on ${now}

## Learnings

Initial setup complete.
`;
}

/**
 * Convert kebab-case or snake_case to Title Case.
 */
function titleCase(str: string): string {
  return str
    .split(/[-_]/)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

// ============================================================================
// Initialization Functions
// ============================================================================

/**
 * Initialize a new Squad project.
 * 
 * Creates:
 * - .squad/ directory structure
 * - squad.config.ts or squad.config.json
 * - Agent directories with charter.md and history.md
 * - .gitattributes for merge drivers
 * 
 * @param options - Initialization options
 * @returns Result with created file paths
 */
export async function initSquad(options: InitOptions): Promise<InitResult> {
  const {
    teamRoot,
    projectName,
    projectDescription,
    agents,
    configFormat = 'typescript',
    userName
  } = options;
  
  const createdFiles: string[] = [];
  const agentDirs: string[] = [];
  
  // Validate inputs
  if (!teamRoot) {
    throw new Error('teamRoot is required');
  }
  if (!projectName) {
    throw new Error('projectName is required');
  }
  if (!agents || agents.length === 0) {
    throw new Error('At least one agent is required');
  }
  
  // Create .squad directory
  const squadDir = join(teamRoot, '.squad');
  if (!existsSync(squadDir)) {
    await mkdir(squadDir, { recursive: true });
  }
  
  // Create agents directory
  const agentsDir = join(squadDir, 'agents');
  if (!existsSync(agentsDir)) {
    await mkdir(agentsDir, { recursive: true });
  }
  
  // Create casting directory (for future casting system)
  const castingDir = join(squadDir, 'casting');
  if (!existsSync(castingDir)) {
    await mkdir(castingDir, { recursive: true });
  }
  
  // Create decisions directory
  const decisionsDir = join(squadDir, 'decisions');
  if (!existsSync(decisionsDir)) {
    await mkdir(decisionsDir, { recursive: true });
  }
  
  // Create skills directory
  const skillsDir = join(squadDir, 'skills');
  if (!existsSync(skillsDir)) {
    await mkdir(skillsDir, { recursive: true });
  }
  
  // Generate configuration file
  const configFileName = configFormat === 'typescript' ? 'squad.config.ts' : 'squad.config.json';
  const configPath = join(teamRoot, configFileName);
  const configContent = configFormat === 'typescript'
    ? generateTypeScriptConfig(options)
    : generateJsonConfig(options);
  
  await writeFile(configPath, configContent, 'utf-8');
  createdFiles.push(configPath);
  
  // Create agent directories and files
  for (const agent of agents) {
    const agentDir = join(agentsDir, agent.name);
    await mkdir(agentDir, { recursive: true });
    agentDirs.push(agentDir);
    
    // Create charter.md
    const charterPath = join(agentDir, 'charter.md');
    const charterContent = generateCharter(agent, projectName, projectDescription);
    await writeFile(charterPath, charterContent, 'utf-8');
    createdFiles.push(charterPath);
    
    // Create history.md
    const historyPath = join(agentDir, 'history.md');
    const historyContent = generateInitialHistory(agent, projectName, projectDescription, userName);
    await writeFile(historyPath, historyContent, 'utf-8');
    createdFiles.push(historyPath);
  }
  
  // Create .gitattributes for merge drivers
  const gitattributesPath = join(teamRoot, '.gitattributes');
  const gitattributesContent = `.squad/agents/*/history.md merge=union
.squad/decisions/*.md merge=union
`;
  
  await writeFile(gitattributesPath, gitattributesContent, 'utf-8');
  createdFiles.push(gitattributesPath);
  
  // Create initial decisions.md
  const decisionsPath = join(decisionsDir, 'decisions.md');
  const decisionsContent = `# Squad Decisions

## Active Decisions

No decisions recorded yet.

## Governance

- All meaningful changes require team consensus
- Document architectural decisions here
- Keep history focused on work, decisions focused on direction
`;
  
  await writeFile(decisionsPath, decisionsContent, 'utf-8');
  createdFiles.push(decisionsPath);
  
  return {
    createdFiles,
    configPath,
    agentDirs
  };
}
