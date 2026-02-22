/**
 * Init command implementation — zero dependencies
 * Scaffolds a new Squad project with templates, workflows, and directory structure
 */

import fs from 'node:fs/promises';
import fsSync from 'node:fs';
import path from 'node:path';
import { detectSquadDir, type SquadDirInfo } from './detect-squad-dir.js';
import { getTemplatesDir, TEMPLATE_MANIFEST } from './templates.js';
import { success, warn, dim, bold, info, BOLD, RESET, YELLOW, GREEN, DIM } from './output.js';
import { fatal } from './errors.js';
import { detectProjectType } from './project-type.js';
import { getPackageVersion, stampVersion } from './version.js';
import { generateProjectWorkflowStub, PROJECT_TYPE_SENSITIVE_WORKFLOWS } from './workflows.js';

/**
 * Show deprecation warning for .ai-team/ directory
 */
function showDeprecationWarning(): void {
  console.log();
  console.log(`${YELLOW}⚠️  DEPRECATION: .ai-team/ is deprecated and will be removed in v1.0.0${RESET}`);
  console.log(`${YELLOW}    Run 'npx github:bradygaster/squad-sdk upgrade --migrate-directory' to migrate to .squad/${RESET}`);
  console.log(`${YELLOW}    Details: https://github.com/bradygaster/squad/issues/101${RESET}`);
  console.log();
}

/**
 * Recursively copy files from src to target
 */
async function copyRecursive(src: string, target: string): Promise<void> {
  const stat = await fs.stat(src);
  if (stat.isDirectory()) {
    await fs.mkdir(target, { recursive: true });
    const entries = await fs.readdir(src);
    for (const entry of entries) {
      await copyRecursive(path.join(src, entry), path.join(target, entry));
    }
  } else {
    await fs.mkdir(path.dirname(target), { recursive: true });
    await fs.copyFile(src, target);
  }
}

/**
 * Write a workflow file: verbatim copy for npm projects, stub for others
 */
async function writeWorkflowFile(file: string, srcPath: string, destPath: string, projectType: string): Promise<void> {
  if (projectType !== 'npm' && PROJECT_TYPE_SENSITIVE_WORKFLOWS.has(file)) {
    const stub = generateProjectWorkflowStub(file, projectType as any);
    if (stub) {
      await fs.writeFile(destPath, stub);
      return;
    }
  }
  await fs.copyFile(srcPath, destPath);
}

/**
 * Main init command handler
 */
export async function runInit(dest: string): Promise<void> {
  const version = getPackageVersion();

  // Detect project type
  const projectType = detectProjectType(dest);

  // Validate destination is writable
  try {
    await fs.access(dest, fsSync.constants.W_OK);
  } catch {
    fatal(`Cannot write to ${dest} — check directory permissions`);
  }

  // Validate templates exist
  const templatesDir = getTemplatesDir();
  const agentSrc = path.join(templatesDir, 'squad.agent.md');
  try {
    await fs.access(templatesDir);
    await fs.access(agentSrc);
  } catch {
    fatal(`Templates directory missing or corrupted — installation may be corrupted`);
  }

  // Detect squad directory
  const squadInfo = detectSquadDir(dest);

  // Show deprecation warning if using .ai-team/
  if (squadInfo.isLegacy) {
    showDeprecationWarning();
  }

  // Install squad.agent.md
  const agentDest = path.join(dest, '.github', 'agents', 'squad.agent.md');
  if (fsSync.existsSync(agentDest)) {
    console.log(`${DIM}squad.agent.md already exists — skipping (run 'upgrade' to update)${RESET}`);
  } else {
    try {
      await fs.mkdir(path.dirname(agentDest), { recursive: true });
      await fs.copyFile(agentSrc, agentDest);
      stampVersion(agentDest, version);
      success(`.github/agents/squad.agent.md (v${version})`);
    } catch (err: any) {
      fatal(`Failed to create squad.agent.md: ${err.message}`);
    }
  }

  // Create directory structure
  const inboxDir = path.join(squadInfo.path, 'decisions', 'inbox');
  const orchLogDir = path.join(squadInfo.path, 'orchestration-log');
  const castingDir = path.join(squadInfo.path, 'casting');
  const skillsDir = path.join(squadInfo.path, 'skills');
  const pluginsDir = path.join(squadInfo.path, 'plugins');
  const identityDir = path.join(squadInfo.path, 'identity');

  try {
    await fs.mkdir(inboxDir, { recursive: true });
    await fs.mkdir(orchLogDir, { recursive: true });
    await fs.mkdir(castingDir, { recursive: true });
    await fs.mkdir(skillsDir, { recursive: true });
    await fs.mkdir(pluginsDir, { recursive: true });
    await fs.mkdir(identityDir, { recursive: true });
  } catch (err: any) {
    fatal(`Failed to create ${squadInfo.name}/ directories: ${err.message}`);
  }

  // Copy starter skills (skip if any skills already exist)
  const skillsSrc = path.join(templatesDir, 'skills');
  try {
    if (fsSync.existsSync(skillsSrc)) {
      const existingSkills = await fs.readdir(skillsDir);
      if (existingSkills.length === 0) {
        await copyRecursive(skillsSrc, skillsDir);
        success(`${squadInfo.name}/skills/ (starter skills)`);
      }
    }
  } catch {}

  // Scaffold identity files (now.md, wisdom.md)
  const nowMdPath = path.join(identityDir, 'now.md');
  const wisdomMdPath = path.join(identityDir, 'wisdom.md');

  if (!fsSync.existsSync(nowMdPath)) {
    const nowTemplate = `---
updated_at: ${new Date().toISOString()}
focus_area: Initial setup
active_issues: []
---

# What We're Focused On

Getting started. Updated by coordinator at session start.
`;
    await fs.mkdir(identityDir, { recursive: true });
    await fs.writeFile(nowMdPath, nowTemplate);
    success(`${squadInfo.name}/identity/now.md`);
  }

  if (!fsSync.existsSync(wisdomMdPath)) {
    const wisdomTemplate = `---
last_updated: ${new Date().toISOString()}
---

# Team Wisdom

Reusable patterns and heuristics learned through work. NOT transcripts — each entry is a distilled, actionable insight.

## Patterns

<!-- Append entries below. Format: **Pattern:** description. **Context:** when it applies. -->

## Anti-Patterns

<!-- Things we tried that didn't work. **Avoid:** description. **Why:** reason. -->
`;
    await fs.mkdir(identityDir, { recursive: true });
    await fs.writeFile(wisdomMdPath, wisdomTemplate);
    success(`${squadInfo.name}/identity/wisdom.md`);
  }

  // Create sample MCP config (skip if .copilot/mcp-config.json already exists)
  const mcpDir = path.join(dest, '.copilot');
  const mcpConfigPath = path.join(mcpDir, 'mcp-config.json');
  if (!fsSync.existsSync(mcpConfigPath)) {
    try {
      await fs.mkdir(mcpDir, { recursive: true });
      const mcpSample = {
        mcpServers: {
          "EXAMPLE-trello": {
            command: "npx",
            args: ["-y", "@trello/mcp-server"],
            env: {
              TRELLO_API_KEY: "${TRELLO_API_KEY}",
              TRELLO_TOKEN: "${TRELLO_TOKEN}"
            }
          }
        }
      };
      await fs.writeFile(mcpConfigPath, JSON.stringify(mcpSample, null, 2) + '\n');
      success('.copilot/mcp-config.json (MCP sample — rename EXAMPLE-trello to enable)');
    } catch (err) {
      // Non-fatal — MCP config is optional
    }
  } else {
    console.log(`${DIM}mcp-config.json already exists — skipping${RESET}`);
  }

  // Copy default ceremonies config
  const ceremoniesDest = path.join(squadInfo.path, 'ceremonies.md');
  if (!fsSync.existsSync(ceremoniesDest)) {
    const ceremoniesSrc = path.join(templatesDir, 'ceremonies.md');
    await fs.copyFile(ceremoniesSrc, ceremoniesDest);
    success(`${squadInfo.name}/ceremonies.md`);
  } else {
    console.log(`${DIM}ceremonies.md already exists — skipping${RESET}`);
  }

  // Append merge=union rules for append-only squad state files
  const gitattributesPath = path.join(dest, '.gitattributes');
  const unionRules = [
    `${squadInfo.name}/decisions.md merge=union`,
    `${squadInfo.name}/agents/*/history.md merge=union`,
    `${squadInfo.name}/log/** merge=union`,
    `${squadInfo.name}/orchestration-log/** merge=union`,
  ];
  let existing = '';
  try {
    existing = await fs.readFile(gitattributesPath, 'utf8');
  } catch {}
  
  const missing = unionRules.filter(rule => !existing.includes(rule));
  if (missing.length) {
    const block = (existing && !existing.endsWith('\n') ? '\n' : '')
      + '# Squad: union merge for append-only team state files\n'
      + missing.join('\n') + '\n';
    await fs.appendFile(gitattributesPath, block);
    success('.gitattributes (merge=union rules)');
  } else {
    console.log(`${DIM}.gitattributes merge rules already present — skipping${RESET}`);
  }

  // Append .gitignore entries
  const gitignorePath = path.join(dest, '.gitignore');
  const ignoreEntries = [
    `${squadInfo.name}/orchestration-log/`,
    `${squadInfo.name}/log/`,
  ];
  let existingIgnore = '';
  try {
    existingIgnore = await fs.readFile(gitignorePath, 'utf8');
  } catch {}
  
  const missingIgnore = ignoreEntries.filter(entry => !existingIgnore.includes(entry));
  if (missingIgnore.length) {
    const block = (existingIgnore && !existingIgnore.endsWith('\n') ? '\n' : '')
      + '# Squad: ignore generated logs\n'
      + missingIgnore.join('\n') + '\n';
    await fs.appendFile(gitignorePath, block);
    success('.gitignore (log exclusions)');
  }

  // Copy templates directory
  const templatesDestName = squadInfo.isLegacy ? '.ai-team-templates' : '.squad-templates';
  const templatesDest = path.join(dest, templatesDestName);

  if (fsSync.existsSync(templatesDest)) {
    console.log(`${DIM}${templatesDestName}/ already exists — skipping (run 'upgrade' to update)${RESET}`);
  } else {
    await copyRecursive(templatesDir, templatesDest);
    success(`${templatesDestName}/`);
  }

  // Copy workflow templates
  const workflowsSrc = path.join(templatesDir, 'workflows');
  const workflowsDest = path.join(dest, '.github', 'workflows');

  if (fsSync.existsSync(workflowsSrc) && fsSync.statSync(workflowsSrc).isDirectory()) {
    const workflowFiles = (await fs.readdir(workflowsSrc)).filter(f => f.endsWith('.yml'));
    await fs.mkdir(workflowsDest, { recursive: true });
    let copied = 0;
    for (const file of workflowFiles) {
      const destFile = path.join(workflowsDest, file);
      if (fsSync.existsSync(destFile)) {
        console.log(`${DIM}${file} already exists — skipping (run 'upgrade' to update)${RESET}`);
      } else {
        await writeWorkflowFile(file, path.join(workflowsSrc, file), destFile, projectType);
        success(`.github/workflows/${file}`);
        copied++;
      }
    }
    if (copied === 0 && workflowFiles.length > 0) {
      console.log(`${DIM}all squad workflows already exist — skipping${RESET}`);
    }
  }

  // Final output
  console.log();
  console.log(`${BOLD}Squad is ready.${RESET}`);
  console.log();
  if (squadInfo.isLegacy) {
    showDeprecationWarning();
  }
  console.log(`Next steps:`);
  console.log(`  1. Open Copilot:  ${DIM}copilot${RESET}`);
  console.log(`  2. Type ${BOLD}/agent${RESET} (CLI) or ${BOLD}/agents${RESET} (VS Code) and select ${BOLD}Squad${RESET}`);
  console.log(`  3. Tell it what you're building`);
  console.log();
}
