// ─── GitHub Issue Fetcher ────────────────────────────────────────────────────
// Uses the `gh` CLI to fetch open issues from a GitHub repository.
// Read-only — never modifies issues.

import { execSync } from 'node:child_process';

export interface GitHubIssue {
  number: number;
  title: string;
  body: string;
  labels: Array<{ name: string }>;
  assignees: Array<{ login: string }>;
  createdAt: string;
}

/**
 * Check whether the `gh` CLI is installed and authenticated.
 * Returns an error message string on failure, or null on success.
 */
export function checkGhCli(): string | null {
  try {
    execSync('gh --version', { stdio: 'pipe' });
  } catch {
    return 'The GitHub CLI (`gh`) is not installed. Install it from https://cli.github.com';
  }

  try {
    execSync('gh auth status', { stdio: 'pipe' });
  } catch {
    return 'The GitHub CLI is not authenticated. Run: gh auth login';
  }

  return null;
}

/**
 * Try to detect the current repo from the git remote.
 * Returns "owner/repo" or null.
 */
export function detectRepoFromGit(): string | null {
  try {
    const remote = execSync('git remote get-url origin', { stdio: 'pipe', encoding: 'utf-8' }).trim();
    // SSH: git@github.com:owner/repo.git
    const sshMatch = remote.match(/github\.com[:/]([^/]+\/[^/.]+)/);
    if (sshMatch) return sshMatch[1];
    // HTTPS: https://github.com/owner/repo.git
    const httpsMatch = remote.match(/github\.com\/([^/]+\/[^/.]+)/);
    if (httpsMatch) return httpsMatch[1];
  } catch { /* not a git repo or no remote */ }
  return null;
}

/**
 * Fetch open issues from a GitHub repository using the `gh` CLI.
 */
export function fetchIssues(repo: string, limit = 5): GitHubIssue[] {
  const cmd = `gh issue list --repo ${repo} --state open --json number,title,body,labels,assignees,createdAt --limit ${limit}`;

  const raw = execSync(cmd, { encoding: 'utf-8', stdio: ['pipe', 'pipe', 'pipe'] });
  const issues: GitHubIssue[] = JSON.parse(raw);
  return issues;
}

/**
 * Format fetched issues into a prompt for the triage squad.
 */
export function formatIssuesForPrompt(issues: GitHubIssue[], repo: string): string {
  const header = `Here are ${issues.length} open issue(s) from **${repo}** that need triage.\n\nPlease coordinate your full triage squad: classify each issue by type and severity, detect any duplicates, recommend triage actions and assignees, and produce a priority-ranked summary dashboard.\n\n---\n`;

  const formatted = issues.map((issue) => {
    const labels = issue.labels.map((l) => l.name).join(', ') || 'none';
    const assignees = issue.assignees.map((a) => a.login).join(', ') || 'unassigned';
    const body = (issue.body ?? '').slice(0, 800) || '(no description)';
    const created = new Date(issue.createdAt).toLocaleDateString();

    return `### Issue #${issue.number}: ${issue.title}
- **Labels:** ${labels}
- **Assignees:** ${assignees}
- **Created:** ${created}
- **Body:**
${body}`;
  }).join('\n\n');

  return header + formatted;
}
