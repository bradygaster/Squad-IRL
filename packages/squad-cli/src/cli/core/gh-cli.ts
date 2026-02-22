/**
 * GitHub CLI wrapper utilities — zero dependencies
 */

import { execFile } from 'node:child_process';
import { promisify } from 'node:util';

const execFileAsync = promisify(execFile);

export interface GhIssue {
  number: number;
  title: string;
  labels: Array<{ name: string }>;
  assignees: Array<{ login: string }>;
}

export interface GhListOptions {
  label?: string;
  state?: 'open' | 'closed' | 'all';
  limit?: number;
}

export interface GhEditOptions {
  addLabel?: string;
  removeLabel?: string;
  addAssignee?: string;
  removeAssignee?: string;
}

/**
 * Check if gh CLI is available
 */
export async function ghAvailable(): Promise<boolean> {
  try {
    await execFileAsync('gh', ['--version']);
    return true;
  } catch {
    return false;
  }
}

/**
 * Check if gh CLI is authenticated
 */
export async function ghAuthenticated(): Promise<boolean> {
  try {
    await execFileAsync('gh', ['auth', 'status']);
    return true;
  } catch {
    return false;
  }
}

/**
 * List issues with optional filters
 */
export async function ghIssueList(options: GhListOptions = {}): Promise<GhIssue[]> {
  const args = ['issue', 'list', '--json', 'number,title,labels,assignees'];
  
  if (options.label) {
    args.push('--label', options.label);
  }
  if (options.state) {
    args.push('--state', options.state);
  }
  if (options.limit) {
    args.push('--limit', String(options.limit));
  }
  
  const { stdout } = await execFileAsync('gh', args);
  return JSON.parse(stdout || '[]');
}

/**
 * Edit an issue (add/remove labels or assignees)
 */
export async function ghIssueEdit(issueNumber: number, options: GhEditOptions): Promise<void> {
  const args = ['issue', 'edit', String(issueNumber)];
  
  if (options.addLabel) {
    args.push('--add-label', options.addLabel);
  }
  if (options.removeLabel) {
    args.push('--remove-label', options.removeLabel);
  }
  if (options.addAssignee) {
    args.push('--add-assignee', options.addAssignee);
  }
  if (options.removeAssignee) {
    args.push('--remove-assignee', options.removeAssignee);
  }
  
  await execFileAsync('gh', args);
}
