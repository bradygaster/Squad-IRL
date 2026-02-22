/**
 * Session History Shadows (M1-11)
 * 
 * When importing/spawning remote agents, creates local history shadows that
 * capture project-specific learnings separate from the portable agent definition.
 * 
 * Shadows live at: .squad/agents/{name}/history.md
 */

import * as fs from 'fs/promises';
import * as path from 'path';
import { ConfigurationError } from '../adapter/errors.js';

/**
 * Standard history sections that agents maintain.
 */
export type HistorySection =
  | 'Context'
  | 'Learnings'
  | 'Decisions'
  | 'Patterns'
  | 'Issues'
  | 'References';

/**
 * Parsed history content by section.
 */
export interface ParsedHistory {
  /** Context section: project-specific background */
  context?: string;
  /** Learnings section: what the agent has learned */
  learnings?: string;
  /** Decisions section: key decisions made */
  decisions?: string;
  /** Patterns section: recurring patterns observed */
  patterns?: string;
  /** Issues section: problems encountered */
  issues?: string;
  /** References section: important files/links */
  references?: string;
  /** Full raw content */
  fullContent: string;
}

/**
 * Create a history shadow for an agent.
 * 
 * Initializes the shadow file at `.squad/agents/{name}/history.md` with
 * project-specific context. This is separate from the agent's portable
 * charter and captures session-specific learnings.
 * 
 * @param teamRoot - Path to team root directory
 * @param agentName - Name of the agent
 * @param initialContext - Initial context to seed the history
 * @returns Path to created history shadow
 */
export async function createHistoryShadow(
  teamRoot: string,
  agentName: string,
  initialContext?: string
): Promise<string> {
  try {
    const shadowDir = path.join(teamRoot, '.squad', 'agents', agentName);
    const shadowPath = path.join(shadowDir, 'history.md');
    
    // Ensure directory exists
    await fs.mkdir(shadowDir, { recursive: true });
    
    // Check if shadow already exists
    try {
      await fs.access(shadowPath);
      // Shadow exists, return path without overwriting
      return shadowPath;
    } catch {
      // Shadow doesn't exist, create it
    }
    
    // Create initial shadow content
    const timestamp = new Date().toISOString();
    const initialContent = `# ${capitalize(agentName)} — Session History

> **Shadow History**: Project-specific learnings for ${agentName} in this repository.
> This file is separate from the agent's portable charter and captures session context.

**Created:** ${timestamp}

## Context

${initialContext || 'No initial context provided.'}

## Learnings

<!-- Add project-specific learnings here -->

## Decisions

<!-- Record key decisions made by this agent -->

## Patterns

<!-- Note recurring patterns observed -->

## Issues

<!-- Track problems encountered and resolutions -->

## References

<!-- Important files, documentation, or external resources -->
`;
    
    await fs.writeFile(shadowPath, initialContent, 'utf-8');
    
    return shadowPath;
    
  } catch (error) {
    throw new ConfigurationError(
      `Failed to create history shadow for agent '${agentName}': ${error instanceof Error ? error.message : String(error)}`,
      {
        agentName,
        operation: 'createHistoryShadow',
        timestamp: new Date(),
        metadata: { teamRoot },
      },
      error instanceof Error ? error : undefined
    );
  }
}

/**
 * Append content to a specific section of an agent's history shadow.
 * 
 * If the section doesn't exist, it will be created.
 * Content is appended with a timestamp.
 * 
 * @param teamRoot - Path to team root directory
 * @param agentName - Name of the agent
 * @param section - Section to append to
 * @param content - Content to append
 */
export async function appendToHistory(
  teamRoot: string,
  agentName: string,
  section: HistorySection,
  content: string
): Promise<void> {
  try {
    const shadowPath = path.join(teamRoot, '.squad', 'agents', agentName, 'history.md');
    
    // Read existing history
    let historyContent: string;
    try {
      historyContent = await fs.readFile(shadowPath, 'utf-8');
    } catch (error) {
      throw new ConfigurationError(
        `History shadow not found for agent '${agentName}'. Create it first with createHistoryShadow().`,
        {
          agentName,
          operation: 'appendToHistory',
          timestamp: new Date(),
          metadata: { shadowPath },
        },
        error instanceof Error ? error : undefined
      );
    }
    
    // Find section or create it
    const sectionHeader = `## ${section}`;
    const sectionRegex = new RegExp(`^${sectionHeader}\\s*$([\\s\\S]*?)(?=^##\\s|\\Z)`, 'm');
    const match = historyContent.match(sectionRegex);
    
    const timestamp = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    const entry = `\n### ${timestamp}\n\n${content}\n`;
    
    let updatedContent: string;
    
    if (match) {
      // Section exists, append to it
      const fullMatch = match[0];
      const sectionContent = match[1];
      const updatedSection = `${sectionHeader}\n${sectionContent.trimEnd()}${entry}`;
      updatedContent = historyContent.replace(fullMatch, updatedSection);
    } else {
      // Section doesn't exist, create it at the end
      updatedContent = historyContent.trimEnd() + `\n\n${sectionHeader}${entry}`;
    }
    
    await fs.writeFile(shadowPath, updatedContent, 'utf-8');
    
  } catch (error) {
    if (error instanceof ConfigurationError) {
      throw error;
    }
    
    throw new ConfigurationError(
      `Failed to append to history for agent '${agentName}': ${error instanceof Error ? error.message : String(error)}`,
      {
        agentName,
        operation: 'appendToHistory',
        timestamp: new Date(),
        metadata: { section, teamRoot },
      },
      error instanceof Error ? error : undefined
    );
  }
}

/**
 * Read and parse an agent's history shadow.
 * 
 * @param teamRoot - Path to team root directory
 * @param agentName - Name of the agent
 * @returns Parsed history with sections
 */
export async function readHistory(
  teamRoot: string,
  agentName: string
): Promise<ParsedHistory> {
  try {
    const shadowPath = path.join(teamRoot, '.squad', 'agents', agentName, 'history.md');
    
    let historyContent: string;
    try {
      historyContent = await fs.readFile(shadowPath, 'utf-8');
    } catch (error) {
      // Shadow doesn't exist yet, return empty
      return {
        fullContent: '',
      };
    }
    
    const parsed: ParsedHistory = {
      fullContent: historyContent,
    };
    
    // Extract sections
    const sections: Record<string, keyof ParsedHistory> = {
      'Context': 'context',
      'Learnings': 'learnings',
      'Decisions': 'decisions',
      'Patterns': 'patterns',
      'Issues': 'issues',
      'References': 'references',
    };
    
    for (const [sectionName, key] of Object.entries(sections)) {
      const sectionRegex = new RegExp(`^##\\s+${sectionName}\\s*$([\\s\\S]*?)(?=^##\\s|\\Z)`, 'm');
      const match = historyContent.match(sectionRegex);
      
      if (match) {
        parsed[key] = match[1].trim();
      }
    }
    
    return parsed;
    
  } catch (error) {
    throw new ConfigurationError(
      `Failed to read history for agent '${agentName}': ${error instanceof Error ? error.message : String(error)}`,
      {
        agentName,
        operation: 'readHistory',
        timestamp: new Date(),
        metadata: { teamRoot },
      },
      error instanceof Error ? error : undefined
    );
  }
}

/**
 * Check if a history shadow exists for an agent.
 * 
 * @param teamRoot - Path to team root directory
 * @param agentName - Name of the agent
 * @returns True if shadow exists
 */
export async function shadowExists(
  teamRoot: string,
  agentName: string
): Promise<boolean> {
  try {
    const shadowPath = path.join(teamRoot, '.squad', 'agents', agentName, 'history.md');
    await fs.access(shadowPath);
    return true;
  } catch {
    return false;
  }
}

/**
 * Delete a history shadow for an agent.
 * 
 * @param teamRoot - Path to team root directory
 * @param agentName - Name of the agent
 */
export async function deleteHistoryShadow(
  teamRoot: string,
  agentName: string
): Promise<void> {
  try {
    const shadowPath = path.join(teamRoot, '.squad', 'agents', agentName, 'history.md');
    await fs.unlink(shadowPath);
  } catch (error) {
    throw new ConfigurationError(
      `Failed to delete history shadow for agent '${agentName}': ${error instanceof Error ? error.message : String(error)}`,
      {
        agentName,
        operation: 'deleteHistoryShadow',
        timestamp: new Date(),
        metadata: { teamRoot },
      },
      error instanceof Error ? error : undefined
    );
  }
}

/**
 * Capitalize first letter of a string.
 * @private
 */
function capitalize(str: string): string {
  if (!str) return str;
  return str.charAt(0).toUpperCase() + str.slice(1);
}
