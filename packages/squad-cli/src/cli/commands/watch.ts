/**
 * Watch command — Ralph's standalone polling process
 */

import fs from 'node:fs';
import path from 'node:path';
import { detectSquadDir } from '../core/detect-squad-dir.js';
import { fatal } from '../core/errors.js';
import { GREEN, RED, DIM, BOLD, RESET, YELLOW } from '../core/output.js';
import { ghAvailable, ghAuthenticated, ghIssueList, ghIssueEdit, type GhIssue } from '../core/gh-cli.js';

interface TeamMember {
  name: string;
  role: string;
  label: string;
}

/**
 * Parse team members from team.md roster
 */
function parseMembers(text: string): TeamMember[] {
  const lines = text.split('\n');
  const members: TeamMember[] = [];
  let inMembersTable = false;
  
  for (const line of lines) {
    if (line.startsWith('## Members')) {
      inMembersTable = true;
      continue;
    }
    if (inMembersTable && line.startsWith('## ')) break;
    if (inMembersTable && line.startsWith('|') && !line.includes('---') && !line.includes('Name')) {
      const cells = line.split('|').map(c => c.trim()).filter(Boolean);
      if (cells.length >= 2 && !['Scribe', 'Ralph'].includes(cells[0])) {
        members.push({
          name: cells[0],
          role: cells[1],
          label: `squad:${cells[0].toLowerCase()}`
        });
      }
    }
  }
  
  return members;
}

/**
 * Auto-triage an issue based on content and team roster
 */
function triageIssue(issue: GhIssue, members: TeamMember[]): { member: TeamMember; reason: string } | null {
  const issueText = issue.title.toLowerCase();
  
  // Domain-based routing
  for (const member of members) {
    const role = member.role.toLowerCase();
    
    // Frontend/UI
    if ((role.includes('frontend') || role.includes('ui')) &&
        (issueText.includes('ui') || issueText.includes('frontend') || issueText.includes('css'))) {
      return { member, reason: 'frontend/UI domain' };
    }
    
    // Backend/API
    if ((role.includes('backend') || role.includes('api') || role.includes('server')) &&
        (issueText.includes('api') || issueText.includes('backend') || issueText.includes('database'))) {
      return { member, reason: 'backend/API domain' };
    }
    
    // Test/QA
    if ((role.includes('test') || role.includes('qa')) &&
        (issueText.includes('test') || issueText.includes('bug') || issueText.includes('fix'))) {
      return { member, reason: 'testing/QA domain' };
    }
  }
  
  // Fall back to Lead if no match
  const lead = members.find(m =>
    m.role.toLowerCase().includes('lead') || m.role.toLowerCase().includes('architect')
  );
  
  if (lead) {
    return { member: lead, reason: 'no domain match — routed to Lead' };
  }
  
  return null;
}

/**
 * Run a single check cycle
 */
async function runCheck(
  members: TeamMember[],
  hasCopilot: boolean,
  autoAssign: boolean
): Promise<void> {
  const timestamp = new Date().toLocaleTimeString();
  
  try {
    // Fetch open issues with squad label
    const issues = await ghIssueList({ label: 'squad', state: 'open', limit: 20 });
    
    // Find untriaged issues (no squad:{member} label)
    const memberLabels = members.map(m => m.label);
    const untriaged = issues.filter(issue => {
      const issueLabels = issue.labels.map(l => l.name);
      return !memberLabels.some(ml => issueLabels.includes(ml));
    });
    
    // Find unassigned squad:copilot issues
    let unassignedCopilot: GhIssue[] = [];
    if (hasCopilot && autoAssign) {
      try {
        const copilotIssues = await ghIssueList({ label: 'squad:copilot', state: 'open', limit: 10 });
        unassignedCopilot = copilotIssues.filter(i => !i.assignees || i.assignees.length === 0);
      } catch {
        // Label may not exist yet
      }
    }
    
    if (untriaged.length === 0 && unassignedCopilot.length === 0) {
      console.log(`${DIM}[${timestamp}]${RESET} 📋 Board is clear — no pending work`);
      return;
    }
    
    // Triage untriaged issues
    for (const issue of untriaged) {
      const triage = triageIssue(issue, members);
      
      if (triage) {
        try {
          await ghIssueEdit(issue.number, { addLabel: triage.member.label });
          console.log(
            `${GREEN}✓${RESET} [${timestamp}] Triaged #${issue.number} "${issue.title}" → ${triage.member.name} (${triage.reason})`
          );
        } catch (e) {
          const err = e as Error;
          console.error(`${RED}✗${RESET} [${timestamp}] Failed to label #${issue.number}: ${err.message}`);
        }
      }
    }
    
    // Assign @copilot to unassigned copilot issues
    for (const issue of unassignedCopilot) {
      try {
        await ghIssueEdit(issue.number, { addAssignee: 'copilot-swe-agent' });
        console.log(`${GREEN}✓${RESET} [${timestamp}] Assigned @copilot to #${issue.number} "${issue.title}"`);
      } catch (e) {
        const err = e as Error;
        console.error(`${RED}✗${RESET} [${timestamp}] Failed to assign @copilot to #${issue.number}: ${err.message}`);
      }
    }
  } catch (e) {
    const err = e as Error;
    console.error(`${RED}✗${RESET} [${timestamp}] Check failed: ${err.message}`);
  }
}

/**
 * Run watch command — Ralph's local polling process
 */
export async function runWatch(dest: string, intervalMinutes: number): Promise<void> {
  // Validate interval
  if (isNaN(intervalMinutes) || intervalMinutes < 1) {
    fatal('--interval must be a positive number of minutes');
  }
  
  // Detect squad directory
  const squadDirInfo = detectSquadDir(dest);
  const teamMd = path.join(squadDirInfo.path, 'team.md');
  
  if (!fs.existsSync(teamMd)) {
    fatal('No squad found — run init first.');
  }
  
  // Verify gh CLI
  if (!(await ghAvailable())) {
    fatal('gh CLI not found — install from https://cli.github.com');
  }
  
  if (!(await ghAuthenticated())) {
    console.error(`${YELLOW}⚠️${RESET} gh CLI not authenticated`);
    console.error(`   Run: ${BOLD}gh auth login${RESET}\n`);
    fatal('gh authentication required');
  }
  
  // Parse team.md
  const content = fs.readFileSync(teamMd, 'utf8');
  const members = parseMembers(content);
  
  if (members.length === 0) {
    fatal('No squad members found in team.md');
  }
  
  const hasCopilot = content.includes('🤖 Coding Agent') || content.includes('@copilot');
  const autoAssign = content.includes('<!-- copilot-auto-assign: true -->');
  
  // Print startup banner
  console.log(`\n${BOLD}🔄 Ralph — Watch Mode${RESET}`);
  console.log(`${DIM}Polling every ${intervalMinutes} minute(s) for squad work. Ctrl+C to stop.${RESET}\n`);
  
  // Run immediately, then on interval
  await runCheck(members, hasCopilot, autoAssign);
  
  return new Promise<void>((resolve) => {
    const intervalId = setInterval(
      async () => {
        await runCheck(members, hasCopilot, autoAssign);
      },
      intervalMinutes * 60 * 1000
    );
    
    // Graceful shutdown
    const shutdown = () => {
      clearInterval(intervalId);
      console.log(`\n${DIM}🔄 Ralph — Watch stopped${RESET}`);
      resolve();
    };
    
    process.on('SIGINT', shutdown);
    process.on('SIGTERM', shutdown);
  });
}
