/**
 * REPL Dogfood Tests — realistic repository structures, no mocks, no network.
 *
 * Tests the shell modules (ShellLifecycle, parseInput, executeCommand,
 * parseCoordinatorResponse, loadWelcomeData, SessionRegistry) against
 * locally-scaffolded fixtures that simulate real-world repositories.
 *
 * Fixtures:
 *   1. Small Python project (src/, tests/, setup.py, README, nested dirs)
 *   2. Node.js monorepo (packages/, workspaces, multiple tsconfig)
 *   3. Large mixed-language (Go + Python + TypeScript, deep nesting)
 *   4. Edge cases (deep dirs, large files, many agents, minimal repos)
 *
 * @see https://github.com/bradygaster/squad-pr/issues/532
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import {
  mkdtempSync,
  mkdirSync,
  writeFileSync,
  symlinkSync,
  existsSync,
} from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { rm } from 'node:fs/promises';

import { ShellLifecycle } from '../packages/squad-cli/src/cli/shell/lifecycle.js';
import { loadWelcomeData } from '../packages/squad-cli/src/cli/shell/lifecycle.js';
import { parseInput } from '../packages/squad-cli/src/cli/shell/router.js';
import { executeCommand } from '../packages/squad-cli/src/cli/shell/commands.js';
import { parseCoordinatorResponse } from '../packages/squad-cli/src/cli/shell/coordinator.js';
import { SessionRegistry } from '../packages/squad-cli/src/cli/shell/sessions.js';
import { ShellRenderer } from '../packages/squad-cli/src/cli/shell/render.js';
import type { ShellMessage } from '../packages/squad-cli/src/cli/shell/types.js';

// ============================================================================
// Helpers
// ============================================================================

function makeTempDir(prefix: string): string {
  return mkdtempSync(join(tmpdir(), prefix));
}

function makeTeamMd(
  projectName: string,
  description: string,
  agents: Array<{ name: string; role: string; status?: string }>,
): string {
  const rows = agents
    .map(
      (a) =>
        `| ${a.name} | ${a.role} | \`.squad/agents/${a.name.toLowerCase()}/charter.md\` | ✅ ${a.status ?? 'Active'} |`,
    )
    .join('\n');
  return `# Squad Team — ${projectName}

> ${description}

## Members

| Name | Role | Charter | Status |
|------|------|---------|--------|
${rows}

## Project Context

- **Stack:** Various
`;
}

function scaffoldSquad(
  root: string,
  opts: {
    projectName: string;
    description: string;
    agents: Array<{ name: string; role: string; status?: string }>;
    focus?: string;
    routingMd?: string;
    firstRun?: boolean;
  },
): void {
  const squadDir = join(root, '.squad');
  const agentsDir = join(squadDir, 'agents');
  const identityDir = join(squadDir, 'identity');
  mkdirSync(agentsDir, { recursive: true });
  mkdirSync(identityDir, { recursive: true });

  writeFileSync(
    join(squadDir, 'team.md'),
    makeTeamMd(opts.projectName, opts.description, opts.agents),
  );

  // Create agent charter stubs
  for (const agent of opts.agents) {
    const agentDir = join(agentsDir, agent.name.toLowerCase());
    mkdirSync(agentDir, { recursive: true });
    writeFileSync(
      join(agentDir, 'charter.md'),
      `# ${agent.name} — ${agent.role}\n\nCharter for ${agent.name}.\n`,
    );
  }

  if (opts.focus) {
    writeFileSync(
      join(identityDir, 'now.md'),
      `---\nupdated_at: 2025-01-01T00:00:00.000Z\nfocus_area: ${opts.focus}\nactive_issues: []\n---\n\n# Focus\n\n${opts.focus}\n`,
    );
  }

  if (opts.routingMd) {
    writeFileSync(join(squadDir, 'routing.md'), opts.routingMd);
  }

  if (opts.firstRun) {
    writeFileSync(join(squadDir, '.first-run'), new Date().toISOString() + '\n');
  }
}

function makeLifecycle(teamRoot: string): {
  lifecycle: ShellLifecycle;
  registry: SessionRegistry;
} {
  const registry = new SessionRegistry();
  const lifecycle = new ShellLifecycle({
    teamRoot,
    renderer: new ShellRenderer(),
    registry,
  });
  return { lifecycle, registry };
}

function makeCommandContext(teamRoot: string, registry: SessionRegistry) {
  return {
    registry,
    renderer: new ShellRenderer(),
    messageHistory: [] as ShellMessage[],
    teamRoot,
  };
}

// ============================================================================
// Fixture Builders
// ============================================================================

/** Small Python project: src/, tests/, setup.py, README, nested dirs */
function buildPythonFixture(root: string): void {
  // Python source tree
  mkdirSync(join(root, 'src', 'mypackage', 'utils'), { recursive: true });
  mkdirSync(join(root, 'tests', 'unit'), { recursive: true });
  mkdirSync(join(root, 'tests', 'integration'), { recursive: true });
  mkdirSync(join(root, 'docs'), { recursive: true });

  writeFileSync(join(root, 'setup.py'), `from setuptools import setup\nsetup(name='mypackage', version='1.0.0')\n`);
  writeFileSync(join(root, 'README.md'), '# My Python Package\n\nA sample Python project.\n');
  writeFileSync(join(root, 'requirements.txt'), 'flask>=2.0\nrequests>=2.28\npytest>=7.0\n');
  writeFileSync(join(root, '.gitignore'), '__pycache__/\n*.pyc\n.venv/\ndist/\n');
  writeFileSync(join(root, 'src', 'mypackage', '__init__.py'), '"""My package."""\n__version__ = "1.0.0"\n');
  writeFileSync(join(root, 'src', 'mypackage', 'app.py'), 'from flask import Flask\napp = Flask(__name__)\n');
  writeFileSync(join(root, 'src', 'mypackage', 'utils', '__init__.py'), '');
  writeFileSync(join(root, 'src', 'mypackage', 'utils', 'helpers.py'), 'def greet(name: str) -> str:\n    return f"Hello, {name}!"\n');
  writeFileSync(join(root, 'tests', 'unit', 'test_helpers.py'), 'from mypackage.utils.helpers import greet\n\ndef test_greet():\n    assert greet("World") == "Hello, World!"\n');
  writeFileSync(join(root, 'tests', 'integration', 'test_app.py'), '# Integration tests for the Flask app\n');

  scaffoldSquad(root, {
    projectName: 'my-python-pkg',
    description: 'A small Python web service with Flask.',
    agents: [
      { name: 'Alice', role: 'Lead' },
      { name: 'Bob', role: 'Core Dev' },
      { name: 'Carol', role: 'Tester' },
    ],
    focus: 'Flask API endpoint coverage',
  });
}

/** Node.js monorepo: packages/, workspaces, multiple tsconfigs */
function buildMonorepoFixture(root: string): void {
  // Root config
  writeFileSync(
    join(root, 'package.json'),
    JSON.stringify(
      {
        name: 'my-monorepo',
        private: true,
        workspaces: ['packages/*'],
        devDependencies: { typescript: '^5.0.0', vitest: '^1.0.0' },
      },
      null,
      2,
    ),
  );
  writeFileSync(join(root, 'tsconfig.json'), JSON.stringify({ compilerOptions: { strict: true, target: 'ES2022', module: 'Node16' } }, null, 2));
  writeFileSync(join(root, 'README.md'), '# My Monorepo\n\nA multi-package TypeScript workspace.\n');

  // Package A — SDK
  const pkgA = join(root, 'packages', 'sdk', 'src');
  mkdirSync(pkgA, { recursive: true });
  mkdirSync(join(root, 'packages', 'sdk', 'test'), { recursive: true });
  writeFileSync(
    join(root, 'packages', 'sdk', 'package.json'),
    JSON.stringify({ name: '@myorg/sdk', version: '2.0.0', main: 'dist/index.js' }, null, 2),
  );
  writeFileSync(join(root, 'packages', 'sdk', 'tsconfig.json'), JSON.stringify({ extends: '../../tsconfig.json', include: ['src'] }, null, 2));
  writeFileSync(join(pkgA, 'index.ts'), 'export function createClient() { return {}; }\n');
  writeFileSync(join(pkgA, 'types.ts'), 'export interface Config { apiKey: string; }\n');
  writeFileSync(join(root, 'packages', 'sdk', 'test', 'index.test.ts'), 'import { createClient } from "../src/index";\n');

  // Package B — CLI
  const pkgB = join(root, 'packages', 'cli', 'src');
  mkdirSync(pkgB, { recursive: true });
  writeFileSync(
    join(root, 'packages', 'cli', 'package.json'),
    JSON.stringify({ name: '@myorg/cli', version: '2.0.0', bin: { mycli: './dist/index.js' } }, null, 2),
  );
  writeFileSync(join(root, 'packages', 'cli', 'tsconfig.json'), JSON.stringify({ extends: '../../tsconfig.json', include: ['src'] }, null, 2));
  writeFileSync(join(pkgB, 'index.ts'), '#!/usr/bin/env node\nconsole.log("hello");\n');

  // Package C — shared utilities
  const pkgC = join(root, 'packages', 'shared', 'src');
  mkdirSync(pkgC, { recursive: true });
  writeFileSync(
    join(root, 'packages', 'shared', 'package.json'),
    JSON.stringify({ name: '@myorg/shared', version: '1.0.0' }, null, 2),
  );
  writeFileSync(join(pkgC, 'utils.ts'), 'export const VERSION = "1.0.0";\n');

  scaffoldSquad(root, {
    projectName: 'my-monorepo',
    description: 'A multi-package TypeScript workspace with SDK, CLI, and shared utils.',
    agents: [
      { name: 'Keaton', role: 'Lead' },
      { name: 'Fenster', role: 'Core Dev' },
      { name: 'Hockney', role: 'Tester' },
      { name: 'Verbal', role: 'Prompt Engineer' },
      { name: 'McManus', role: 'DevRel' },
    ],
    focus: 'SDK v2 migration and CLI improvements',
    routingMd: `# Routing Rules\n\n- SDK changes → Fenster\n- CLI changes → Keaton\n- Test coverage → Hockney\n- Docs → McManus\n`,
  });
}

/** Large mixed-language: Go + Python + TypeScript, deep nesting */
function buildMixedLanguageFixture(root: string): void {
  // Go service
  const goSvc = join(root, 'services', 'api', 'internal', 'handlers');
  mkdirSync(goSvc, { recursive: true });
  mkdirSync(join(root, 'services', 'api', 'cmd'), { recursive: true });
  writeFileSync(join(root, 'services', 'api', 'go.mod'), 'module github.com/example/api\n\ngo 1.21\n');
  writeFileSync(join(root, 'services', 'api', 'cmd', 'main.go'), 'package main\n\nfunc main() {}\n');
  writeFileSync(join(goSvc, 'health.go'), 'package handlers\n\nfunc HealthCheck() string { return "ok" }\n');

  // Python ML pipeline
  const pyML = join(root, 'ml', 'pipelines', 'training');
  mkdirSync(pyML, { recursive: true });
  mkdirSync(join(root, 'ml', 'models'), { recursive: true });
  writeFileSync(join(root, 'ml', 'requirements.txt'), 'torch>=2.0\nnumpy>=1.24\n');
  writeFileSync(join(pyML, 'train.py'), 'import torch\n\ndef train(): pass\n');
  writeFileSync(join(root, 'ml', 'models', 'config.yaml'), 'model:\n  name: transformer\n  layers: 12\n');

  // TypeScript frontend
  const tsFE = join(root, 'frontend', 'src', 'components');
  mkdirSync(tsFE, { recursive: true });
  mkdirSync(join(root, 'frontend', 'src', 'hooks'), { recursive: true });
  writeFileSync(join(root, 'frontend', 'package.json'), JSON.stringify({ name: '@example/frontend', dependencies: { react: '^18.0.0' } }, null, 2));
  writeFileSync(join(root, 'frontend', 'tsconfig.json'), JSON.stringify({ compilerOptions: { jsx: 'react-jsx' } }, null, 2));
  writeFileSync(join(tsFE, 'App.tsx'), 'export default function App() { return <div>Hello</div>; }\n');
  writeFileSync(join(root, 'frontend', 'src', 'hooks', 'useAuth.ts'), 'export function useAuth() { return { user: null }; }\n');

  // Deep nested config (simulating Kubernetes / infra)
  const k8s = join(root, 'infra', 'k8s', 'overlays', 'production', 'patches');
  mkdirSync(k8s, { recursive: true });
  writeFileSync(join(k8s, 'deployment.yaml'), 'apiVersion: apps/v1\nkind: Deployment\n');

  writeFileSync(join(root, 'README.md'), '# Mixed Language Platform\n\nGo API, Python ML, TypeScript Frontend.\n');

  scaffoldSquad(root, {
    projectName: 'platform',
    description: 'Full-stack platform with Go microservices, Python ML pipelines, and TypeScript frontend.',
    agents: [
      { name: 'GoLead', role: 'Core Dev' },
      { name: 'PyExpert', role: 'Core Dev' },
      { name: 'TSWizard', role: 'TypeScript Engineer' },
      { name: 'Infra', role: 'Core Dev' },
      { name: 'QA', role: 'Tester' },
      { name: 'PM', role: 'Lead' },
      { name: 'Docs', role: 'DevRel' },
    ],
    focus: 'API v2 launch with ML integration',
    routingMd: `# Routing\n\n- Go services → GoLead\n- ML pipeline → PyExpert\n- Frontend → TSWizard\n- Infrastructure → Infra\n- Test coverage → QA\n`,
  });
}

/** Edge case: deep nesting, large team.md, many agents, empty dirs */
function buildEdgeCaseFixture(root: string): void {
  // 50-level deep nesting
  let deepPath = root;
  for (let i = 0; i < 50; i++) {
    deepPath = join(deepPath, `level${i}`);
  }
  mkdirSync(deepPath, { recursive: true });
  writeFileSync(join(deepPath, 'deep-file.txt'), 'I am 50 levels deep.\n');

  // Large file (100KB of content)
  const largeContent = 'x'.repeat(100 * 1024) + '\n';
  mkdirSync(join(root, 'data'), { recursive: true });
  writeFileSync(join(root, 'data', 'large-file.txt'), largeContent);

  // Many empty directories
  for (let i = 0; i < 30; i++) {
    mkdirSync(join(root, 'empty-dirs', `dir-${i}`), { recursive: true });
  }

  // Filename with spaces and special chars (safe cross-platform subset)
  mkdirSync(join(root, 'special-names'), { recursive: true });
  writeFileSync(join(root, 'special-names', 'file with spaces.txt'), 'spaces\n');
  writeFileSync(join(root, 'special-names', 'file-with-dashes.txt'), 'dashes\n');
  writeFileSync(join(root, 'special-names', 'file_underscores.txt'), 'underscores\n');
  writeFileSync(join(root, 'special-names', 'CamelCase.TXT'), 'mixed case\n');

  // Symlink (non-Windows only) — we'll test separately
  if (process.platform !== 'win32') {
    try {
      writeFileSync(join(root, 'real-target.txt'), 'symlink target\n');
      symlinkSync(join(root, 'real-target.txt'), join(root, 'symlinked.txt'));
    } catch {
      // Symlinks may fail even on non-Windows (permissions)
    }
  }

  // Generate 20+ agents
  const manyAgents = Array.from({ length: 22 }, (_, i) => ({
    name: `Agent${String(i + 1).padStart(2, '0')}`,
    role: i % 5 === 0 ? 'Lead' : i % 5 === 1 ? 'Core Dev' : i % 5 === 2 ? 'Tester' : i % 5 === 3 ? 'DevRel' : 'TypeScript Engineer',
  }));

  scaffoldSquad(root, {
    projectName: 'edge-case-repo',
    description: 'Repository with extreme edge cases for dogfood testing.',
    agents: manyAgents,
    focus: 'Stress testing the REPL',
  });
}

/** Minimal repo: .squad/ with team.md only, nothing else */
function buildMinimalFixture(root: string): void {
  scaffoldSquad(root, {
    projectName: 'minimal',
    description: 'A bare-bones project.',
    agents: [{ name: 'Solo', role: 'Lead' }],
  });
}

// ============================================================================
// 1. Small Python project
// ============================================================================

describe('Dogfood: Small Python project', () => {
  let root: string;

  beforeEach(() => {
    root = makeTempDir('dogfood-python-');
    buildPythonFixture(root);
  });

  afterEach(async () => {
    await rm(root, { recursive: true, force: true });
  });

  describe('ShellLifecycle.initialize()', () => {
    it('discovers 3 agents (Alice, Bob, Carol)', async () => {
      const { lifecycle } = makeLifecycle(root);
      await lifecycle.initialize();
      const agents = lifecycle.getDiscoveredAgents();
      expect(agents).toHaveLength(3);
      expect(agents.map((a) => a.name)).toEqual(['Alice', 'Bob', 'Carol']);
    });

    it('sets state to ready', async () => {
      const { lifecycle } = makeLifecycle(root);
      await lifecycle.initialize();
      expect(lifecycle.getState().status).toBe('ready');
    });

    it('registers active agents in SessionRegistry', async () => {
      const { lifecycle, registry } = makeLifecycle(root);
      await lifecycle.initialize();
      expect(registry.get('Alice')).toBeDefined();
      expect(registry.get('Alice')?.role).toBe('Lead');
      expect(registry.get('Bob')?.role).toBe('Core Dev');
      expect(registry.get('Carol')?.role).toBe('Tester');
    });
  });

  describe('loadWelcomeData()', () => {
    it('returns correct project name and description', () => {
      const data = loadWelcomeData(root);
      expect(data).not.toBeNull();
      expect(data!.projectName).toBe('my-python-pkg');
      expect(data!.description).toContain('Flask');
    });

    it('lists active agents with roles', () => {
      const data = loadWelcomeData(root);
      expect(data!.agents).toHaveLength(3);
      expect(data!.agents.map((a) => a.name)).toEqual(['Alice', 'Bob', 'Carol']);
      expect(data!.agents[0]!.role).toBe('Lead');
    });

    it('reads focus area from identity/now.md', () => {
      const data = loadWelcomeData(root);
      expect(data!.focus).toBe('Flask API endpoint coverage');
    });
  });

  describe('parseInput — realistic Python queries', () => {
    const knownAgents = ['Alice', 'Bob', 'Carol'];

    it('"run the pytest suite" → coordinator', () => {
      const result = parseInput('run the pytest suite', knownAgents);
      expect(result.type).toBe('coordinator');
      expect(result.content).toBe('run the pytest suite');
    });

    it('"@Bob fix the import error in helpers.py" → direct_agent', () => {
      const result = parseInput('@Bob fix the import error in helpers.py', knownAgents);
      expect(result.type).toBe('direct_agent');
      expect(result.agentName).toBe('Bob');
      expect(result.content).toContain('import error');
    });

    it('"/status" → slash_command', () => {
      const result = parseInput('/status', knownAgents);
      expect(result.type).toBe('slash_command');
      expect(result.command).toBe('status');
    });

    it('"Carol, write tests for the Flask routes" → direct_agent comma syntax', () => {
      const result = parseInput('Carol, write tests for the Flask routes', knownAgents);
      expect(result.type).toBe('direct_agent');
      expect(result.agentName).toBe('Carol');
      expect(result.content).toContain('Flask routes');
    });
  });

  describe('executeCommand', () => {
    it('/status shows 3 agents', async () => {
      const { lifecycle, registry } = makeLifecycle(root);
      await lifecycle.initialize();
      const ctx = makeCommandContext(root, registry);
      const result = executeCommand('status', [], ctx);
      expect(result.handled).toBe(true);
      expect(result.output).toContain('3 agent');
    });

    it('/help outputs command list', async () => {
      const { lifecycle, registry } = makeLifecycle(root);
      await lifecycle.initialize();
      const ctx = makeCommandContext(root, registry);
      const result = executeCommand('help', [], ctx);
      expect(result.handled).toBe(true);
      expect(result.output).toContain('/status');
      expect(result.output).toContain('/quit');
    });

    it('/agents lists all team members', async () => {
      const { lifecycle, registry } = makeLifecycle(root);
      await lifecycle.initialize();
      const ctx = makeCommandContext(root, registry);
      const result = executeCommand('agents', [], ctx);
      expect(result.handled).toBe(true);
      expect(result.output).toContain('Alice');
      expect(result.output).toContain('Bob');
      expect(result.output).toContain('Carol');
    });
  });
});

// ============================================================================
// 2. Node.js monorepo
// ============================================================================

describe('Dogfood: Node.js monorepo', () => {
  let root: string;

  beforeEach(() => {
    root = makeTempDir('dogfood-monorepo-');
    buildMonorepoFixture(root);
  });

  afterEach(async () => {
    await rm(root, { recursive: true, force: true });
  });

  describe('ShellLifecycle.initialize()', () => {
    it('discovers 5 agents', async () => {
      const { lifecycle } = makeLifecycle(root);
      await lifecycle.initialize();
      expect(lifecycle.getDiscoveredAgents()).toHaveLength(5);
    });

    it('agent names match team.md roster', async () => {
      const { lifecycle } = makeLifecycle(root);
      await lifecycle.initialize();
      const names = lifecycle.getDiscoveredAgents().map((a) => a.name);
      expect(names).toContain('Keaton');
      expect(names).toContain('Fenster');
      expect(names).toContain('Hockney');
      expect(names).toContain('Verbal');
      expect(names).toContain('McManus');
    });
  });

  describe('loadWelcomeData()', () => {
    it('returns monorepo project name', () => {
      const data = loadWelcomeData(root);
      expect(data!.projectName).toBe('my-monorepo');
    });

    it('description mentions TypeScript workspace', () => {
      const data = loadWelcomeData(root);
      expect(data!.description).toContain('TypeScript');
    });

    it('focus reflects SDK migration', () => {
      const data = loadWelcomeData(root);
      expect(data!.focus).toBe('SDK v2 migration and CLI improvements');
    });
  });

  describe('parseInput — monorepo queries', () => {
    const knownAgents = ['Keaton', 'Fenster', 'Hockney', 'Verbal', 'McManus'];

    it('"add a new workspace package for auth" → coordinator', () => {
      const result = parseInput('add a new workspace package for auth', knownAgents);
      expect(result.type).toBe('coordinator');
    });

    it('"@Fenster fix the SDK build error in packages/sdk" → direct_agent', () => {
      const result = parseInput('@Fenster fix the SDK build error in packages/sdk', knownAgents);
      expect(result.type).toBe('direct_agent');
      expect(result.agentName).toBe('Fenster');
    });

    it('"@Hockney add test coverage for the CLI package" → direct_agent', () => {
      const result = parseInput('@Hockney add test coverage for the CLI package', knownAgents);
      expect(result.type).toBe('direct_agent');
      expect(result.agentName).toBe('Hockney');
    });

    it('"/who" → slash_command (unknown command, handled gracefully)', () => {
      const result = parseInput('/who', knownAgents);
      expect(result.type).toBe('slash_command');
      expect(result.command).toBe('who');
    });
  });

  describe('executeCommand', () => {
    it('/status shows correct agent count', async () => {
      const { lifecycle, registry } = makeLifecycle(root);
      await lifecycle.initialize();
      const ctx = makeCommandContext(root, registry);
      const result = executeCommand('status', [], ctx);
      expect(result.output).toContain('5 agent');
    });

    it('unknown command returns helpful message', async () => {
      const { lifecycle, registry } = makeLifecycle(root);
      await lifecycle.initialize();
      const ctx = makeCommandContext(root, registry);
      const result = executeCommand('who', [], ctx);
      expect(result.handled).toBe(false);
      expect(result.output).toContain('/help');
    });

    it('/exit signals exit', () => {
      const registry = new SessionRegistry();
      const ctx = makeCommandContext(root, registry);
      const result = executeCommand('exit', [], ctx);
      expect(result.handled).toBe(true);
      expect(result.exit).toBe(true);
    });
  });

  describe('parseCoordinatorResponse — monorepo routing', () => {
    it('routes SDK work to Fenster', () => {
      const resp = `ROUTE: Fenster\nTASK: Fix the type error in packages/sdk/src/index.ts\nCONTEXT: Build is failing on CI`;
      const decision = parseCoordinatorResponse(resp);
      expect(decision.type).toBe('route');
      expect(decision.routes![0]!.agent).toBe('Fenster');
      expect(decision.routes![0]!.task).toContain('type error');
    });

    it('multi-agent routing for cross-package work', () => {
      const resp = `MULTI:\n- Fenster: Update SDK types for the new auth flow\n- Keaton: Wire the CLI to use the new auth client`;
      const decision = parseCoordinatorResponse(resp);
      expect(decision.type).toBe('multi');
      expect(decision.routes).toHaveLength(2);
      expect(decision.routes![0]!.agent).toBe('Fenster');
      expect(decision.routes![1]!.agent).toBe('Keaton');
    });

    it('direct answer for factual team query', () => {
      const resp = 'DIRECT: The monorepo has 3 packages: @myorg/sdk, @myorg/cli, and @myorg/shared.';
      const decision = parseCoordinatorResponse(resp);
      expect(decision.type).toBe('direct');
      expect(decision.directAnswer).toContain('3 packages');
    });
  });
});

// ============================================================================
// 3. Large mixed-language
// ============================================================================

describe('Dogfood: Large mixed-language project', () => {
  let root: string;

  beforeEach(() => {
    root = makeTempDir('dogfood-mixed-');
    buildMixedLanguageFixture(root);
  });

  afterEach(async () => {
    await rm(root, { recursive: true, force: true });
  });

  describe('ShellLifecycle.initialize()', () => {
    it('discovers 7 agents across all domains', async () => {
      const { lifecycle } = makeLifecycle(root);
      await lifecycle.initialize();
      expect(lifecycle.getDiscoveredAgents()).toHaveLength(7);
    });

    it('agents span Go, Python, TypeScript, and Infra roles', async () => {
      const { lifecycle } = makeLifecycle(root);
      await lifecycle.initialize();
      const roles = lifecycle.getDiscoveredAgents().map((a) => a.role);
      expect(roles).toContain('Core Dev');
      expect(roles).toContain('TypeScript Engineer');
      expect(roles).toContain('Tester');
      expect(roles).toContain('Lead');
    });
  });

  describe('loadWelcomeData()', () => {
    it('description mentions all three languages', () => {
      const data = loadWelcomeData(root);
      expect(data!.description).toContain('Go');
      expect(data!.description).toContain('Python');
      expect(data!.description).toContain('TypeScript');
    });

    it('agent list has correct size', () => {
      const data = loadWelcomeData(root);
      expect(data!.agents).toHaveLength(7);
    });
  });

  describe('parseInput — cross-language queries', () => {
    const knownAgents = ['GoLead', 'PyExpert', 'TSWizard', 'Infra', 'QA', 'PM', 'Docs'];

    it('"deploy the Go API to staging" → coordinator', () => {
      const result = parseInput('deploy the Go API to staging', knownAgents);
      expect(result.type).toBe('coordinator');
    });

    it('"@GoLead add health check endpoint" → direct_agent', () => {
      const result = parseInput('@GoLead add health check endpoint', knownAgents);
      expect(result.type).toBe('direct_agent');
      expect(result.agentName).toBe('GoLead');
    });

    it('"@TSWizard the React component has a hydration error" → direct_agent', () => {
      const result = parseInput('@TSWizard the React component has a hydration error', knownAgents);
      expect(result.type).toBe('direct_agent');
      expect(result.agentName).toBe('TSWizard');
    });

    it('"@PyExpert retrain the model with the new dataset" → direct_agent', () => {
      const result = parseInput('@PyExpert retrain the model with the new dataset', knownAgents);
      expect(result.type).toBe('direct_agent');
      expect(result.agentName).toBe('PyExpert');
    });

    it('"Infra, scale the k8s deployment to 5 replicas" → comma syntax', () => {
      const result = parseInput('Infra, scale the k8s deployment to 5 replicas', knownAgents);
      expect(result.type).toBe('direct_agent');
      expect(result.agentName).toBe('Infra');
    });
  });

  describe('executeCommand', () => {
    it('/status shows 7 agents', async () => {
      const { lifecycle, registry } = makeLifecycle(root);
      await lifecycle.initialize();
      const ctx = makeCommandContext(root, registry);
      const result = executeCommand('status', [], ctx);
      expect(result.output).toContain('7 agent');
    });

    it('/agents lists mixed-language team', async () => {
      const { lifecycle, registry } = makeLifecycle(root);
      await lifecycle.initialize();
      const ctx = makeCommandContext(root, registry);
      const result = executeCommand('agents', [], ctx);
      expect(result.output).toContain('GoLead');
      expect(result.output).toContain('PyExpert');
      expect(result.output).toContain('TSWizard');
    });
  });
});

// ============================================================================
// 4. Edge cases
// ============================================================================

describe('Dogfood: Edge cases', () => {
  let root: string;

  beforeEach(() => {
    root = makeTempDir('dogfood-edge-');
    buildEdgeCaseFixture(root);
  });

  afterEach(async () => {
    await rm(root, { recursive: true, force: true });
  });

  describe('Deep nesting (50 levels)', () => {
    it('ShellLifecycle initializes despite 50-level nesting in the repo', async () => {
      const { lifecycle } = makeLifecycle(root);
      await lifecycle.initialize();
      expect(lifecycle.getState().status).toBe('ready');
    });

    it('deep-file.txt exists at level 50', () => {
      let deepPath = root;
      for (let i = 0; i < 50; i++) {
        deepPath = join(deepPath, `level${i}`);
      }
      expect(existsSync(join(deepPath, 'deep-file.txt'))).toBe(true);
    });
  });

  describe('Many agents (22)', () => {
    it('discovers all 22 agents', async () => {
      const { lifecycle } = makeLifecycle(root);
      await lifecycle.initialize();
      expect(lifecycle.getDiscoveredAgents()).toHaveLength(22);
    });

    it('registers all 22 agents in SessionRegistry', async () => {
      const { lifecycle, registry } = makeLifecycle(root);
      await lifecycle.initialize();
      expect(registry.getAll()).toHaveLength(22);
    });

    it('loadWelcomeData returns all 22 agents', () => {
      const data = loadWelcomeData(root);
      expect(data!.agents).toHaveLength(22);
    });

    it('/status shows 22 agents', async () => {
      const { lifecycle, registry } = makeLifecycle(root);
      await lifecycle.initialize();
      const ctx = makeCommandContext(root, registry);
      const result = executeCommand('status', [], ctx);
      expect(result.output).toContain('22 agent');
    });

    it('/agents lists all 22 team members', async () => {
      const { lifecycle, registry } = makeLifecycle(root);
      await lifecycle.initialize();
      const ctx = makeCommandContext(root, registry);
      const result = executeCommand('agents', [], ctx);
      expect(result.handled).toBe(true);
      // Spot-check first and last
      expect(result.output).toContain('Agent01');
      expect(result.output).toContain('Agent22');
    });

    it('parseInput correctly routes to any of the 22 agents', () => {
      const agentNames = Array.from({ length: 22 }, (_, i) => `Agent${String(i + 1).padStart(2, '0')}`);
      const result = parseInput('@Agent15 fix the edge case', agentNames);
      expect(result.type).toBe('direct_agent');
      expect(result.agentName).toBe('Agent15');
    });
  });

  describe('Large team.md', () => {
    it('loadWelcomeData handles the 22-agent manifest', () => {
      const data = loadWelcomeData(root);
      expect(data).not.toBeNull();
      expect(data!.projectName).toBe('edge-case-repo');
    });
  });

  describe('Symlinks (non-Windows)', () => {
    it('ShellLifecycle initializes in presence of symlinks', async () => {
      // On Windows, symlinks are skipped; lifecycle should still work
      const { lifecycle } = makeLifecycle(root);
      await lifecycle.initialize();
      expect(lifecycle.getState().status).toBe('ready');
    });
  });
});

// ============================================================================
// 5. Minimal / empty repos
// ============================================================================

describe('Dogfood: Minimal repo', () => {
  let root: string;

  beforeEach(() => {
    root = makeTempDir('dogfood-minimal-');
    buildMinimalFixture(root);
  });

  afterEach(async () => {
    await rm(root, { recursive: true, force: true });
  });

  it('ShellLifecycle initializes with 1 agent', async () => {
    const { lifecycle } = makeLifecycle(root);
    await lifecycle.initialize();
    expect(lifecycle.getDiscoveredAgents()).toHaveLength(1);
    expect(lifecycle.getDiscoveredAgents()[0]!.name).toBe('Solo');
  });

  it('loadWelcomeData returns data with 1 agent', () => {
    const data = loadWelcomeData(root);
    expect(data).not.toBeNull();
    expect(data!.agents).toHaveLength(1);
    expect(data!.agents[0]!.name).toBe('Solo');
  });

  it('loadWelcomeData returns null focus when no identity/now.md', () => {
    const data = loadWelcomeData(root);
    // Minimal fixture has no focus set (no identity/now.md with focus_area)
    // Our scaffoldSquad creates identity/now.md only when opts.focus is set
    expect(data!.focus).toBeNull();
  });

  it('/status shows 1 agent', async () => {
    const { lifecycle, registry } = makeLifecycle(root);
    await lifecycle.initialize();
    const ctx = makeCommandContext(root, registry);
    const result = executeCommand('status', [], ctx);
    expect(result.output).toContain('1 agent');
  });

  it('/history shows no messages initially', async () => {
    const { lifecycle, registry } = makeLifecycle(root);
    await lifecycle.initialize();
    const ctx = makeCommandContext(root, registry);
    const result = executeCommand('history', [], ctx);
    expect(result.output).toContain('No messages');
  });
});

describe('Dogfood: No .squad/ directory', () => {
  let root: string;

  beforeEach(() => {
    root = makeTempDir('dogfood-nosquad-');
  });

  afterEach(async () => {
    await rm(root, { recursive: true, force: true });
  });

  it('ShellLifecycle.initialize() throws "No team found"', async () => {
    const { lifecycle } = makeLifecycle(root);
    await expect(lifecycle.initialize()).rejects.toThrow('No team found');
  });

  it('loadWelcomeData returns null', () => {
    const data = loadWelcomeData(root);
    expect(data).toBeNull();
  });
});

// ============================================================================
// 6. Performance — initialization must be fast
// ============================================================================

describe('Dogfood: Performance gates', () => {
  let roots: string[];

  beforeEach(() => {
    roots = [];
    // Build each fixture
    const fixtures = [
      { name: 'python', build: buildPythonFixture },
      { name: 'monorepo', build: buildMonorepoFixture },
      { name: 'mixed', build: buildMixedLanguageFixture },
      { name: 'edge', build: buildEdgeCaseFixture },
      { name: 'minimal', build: buildMinimalFixture },
    ];
    for (const f of fixtures) {
      const r = makeTempDir(`dogfood-perf-${f.name}-`);
      f.build(r);
      roots.push(r);
    }
  });

  afterEach(async () => {
    await Promise.all(roots.map((r) => rm(r, { recursive: true, force: true })));
  });

  it('ShellLifecycle.initialize() completes in <2s for Python fixture', async () => {
    const start = performance.now();
    const { lifecycle } = makeLifecycle(roots[0]!);
    await lifecycle.initialize();
    const elapsed = performance.now() - start;
    expect(elapsed).toBeLessThan(2000);
  });

  it('ShellLifecycle.initialize() completes in <2s for monorepo fixture', async () => {
    const start = performance.now();
    const { lifecycle } = makeLifecycle(roots[1]!);
    await lifecycle.initialize();
    const elapsed = performance.now() - start;
    expect(elapsed).toBeLessThan(2000);
  });

  it('ShellLifecycle.initialize() completes in <2s for mixed-language fixture', async () => {
    const start = performance.now();
    const { lifecycle } = makeLifecycle(roots[2]!);
    await lifecycle.initialize();
    const elapsed = performance.now() - start;
    expect(elapsed).toBeLessThan(2000);
  });

  it('ShellLifecycle.initialize() completes in <2s for edge-case fixture (22 agents, deep nesting)', async () => {
    const start = performance.now();
    const { lifecycle } = makeLifecycle(roots[3]!);
    await lifecycle.initialize();
    const elapsed = performance.now() - start;
    expect(elapsed).toBeLessThan(2000);
  });

  it('ShellLifecycle.initialize() completes in <2s for minimal fixture', async () => {
    const start = performance.now();
    const { lifecycle } = makeLifecycle(roots[4]!);
    await lifecycle.initialize();
    const elapsed = performance.now() - start;
    expect(elapsed).toBeLessThan(2000);
  });

  it('loadWelcomeData is fast (<500ms) for 22-agent team', () => {
    const start = performance.now();
    const data = loadWelcomeData(roots[3]!);
    const elapsed = performance.now() - start;
    expect(data).not.toBeNull();
    expect(elapsed).toBeLessThan(500);
  });
});

// ============================================================================
// 7. SessionRegistry cross-fixture consistency
// ============================================================================

describe('Dogfood: SessionRegistry behavior across fixtures', () => {
  let root: string;

  afterEach(async () => {
    await rm(root, { recursive: true, force: true });
  });

  it('registry starts empty, populates on init, clears on shutdown', async () => {
    root = makeTempDir('dogfood-registry-');
    buildMonorepoFixture(root);
    const { lifecycle, registry } = makeLifecycle(root);

    // Before init: empty
    expect(registry.getAll()).toHaveLength(0);

    // After init: populated
    await lifecycle.initialize();
    expect(registry.getAll()).toHaveLength(5);
    expect(registry.getActive()).toHaveLength(0); // all idle

    // After shutdown: empty
    await lifecycle.shutdown();
    expect(registry.getAll()).toHaveLength(0);
  });

  it('status transitions work correctly', async () => {
    root = makeTempDir('dogfood-status-');
    buildPythonFixture(root);
    const { lifecycle, registry } = makeLifecycle(root);
    await lifecycle.initialize();

    // Set an agent to working
    registry.updateStatus('Bob', 'working');
    registry.updateActivityHint('Bob', 'Fixing helpers.py');
    expect(registry.get('Bob')?.status).toBe('working');
    expect(registry.get('Bob')?.activityHint).toBe('Fixing helpers.py');
    expect(registry.getActive()).toHaveLength(1);

    // Complete the work
    registry.updateStatus('Bob', 'idle');
    expect(registry.get('Bob')?.activityHint).toBeUndefined();
    expect(registry.getActive()).toHaveLength(0);
  });

  it('message history tracks across add/get cycle', async () => {
    root = makeTempDir('dogfood-history-');
    buildMixedLanguageFixture(root);
    const { lifecycle } = makeLifecycle(root);
    await lifecycle.initialize();

    lifecycle.addUserMessage('fix the Go API');
    lifecycle.addAgentMessage('GoLead', 'On it — fixing the health check handler.');
    lifecycle.addSystemMessage('GoLead session started');

    const history = lifecycle.getHistory();
    expect(history).toHaveLength(3);
    expect(history[0]!.role).toBe('user');
    expect(history[1]!.role).toBe('agent');
    expect(history[1]!.agentName).toBe('GoLead');
    expect(history[2]!.role).toBe('system');

    // Filter by agent
    const goHistory = lifecycle.getHistory('GoLead');
    expect(goHistory).toHaveLength(1);
    expect(goHistory[0]!.content).toContain('health check');
  });
});

// ============================================================================
// 8. First-run detection
// ============================================================================

describe('Dogfood: First-run ceremony detection', () => {
  let root: string;

  beforeEach(() => {
    root = makeTempDir('dogfood-firstrun-');
  });

  afterEach(async () => {
    await rm(root, { recursive: true, force: true });
  });

  it('detects first-run marker and consumes it', () => {
    scaffoldSquad(root, {
      projectName: 'first-run-test',
      description: 'Testing first-run detection.',
      agents: [{ name: 'Keaton', role: 'Lead' }],
      firstRun: true,
    });

    // First call detects it
    const data1 = loadWelcomeData(root);
    expect(data1!.isFirstRun).toBe(true);

    // Second call — marker consumed
    const data2 = loadWelcomeData(root);
    expect(data2!.isFirstRun).toBe(false);
  });

  it('non-first-run projects have isFirstRun=false', () => {
    buildMonorepoFixture(root);
    const data = loadWelcomeData(root);
    expect(data!.isFirstRun).toBe(false);
  });
});

// ============================================================================
// 9. parseCoordinatorResponse — realistic multi-scenario
// ============================================================================

describe('Dogfood: parseCoordinatorResponse — realistic scenarios', () => {
  it('routes Python test failure to the tester', () => {
    const resp = `ROUTE: Carol\nTASK: Investigate and fix the failing test in tests/unit/test_helpers.py\nCONTEXT: pytest reports AssertionError on test_greet`;
    const decision = parseCoordinatorResponse(resp);
    expect(decision.type).toBe('route');
    expect(decision.routes![0]!.agent).toBe('Carol');
  });

  it('handles freeform LLM response as direct answer', () => {
    const resp = 'The project uses Flask for the web framework and pytest for testing. There are 3 team members.';
    const decision = parseCoordinatorResponse(resp);
    expect(decision.type).toBe('direct');
    expect(decision.directAnswer).toContain('Flask');
  });

  it('multi-route for cross-team infrastructure change', () => {
    const resp = `MULTI:\n- Infra: Update the Kubernetes deployment to use the new Go binary\n- GoLead: Tag a new release for the API service\n- QA: Run the integration test suite against staging`;
    const decision = parseCoordinatorResponse(resp);
    expect(decision.type).toBe('multi');
    expect(decision.routes).toHaveLength(3);
    expect(decision.routes!.map((r) => r.agent)).toEqual(['Infra', 'GoLead', 'QA']);
  });

  it('ROUTE without CONTEXT still works', () => {
    const resp = `ROUTE: TSWizard\nTASK: Fix the hydration mismatch in App.tsx`;
    const decision = parseCoordinatorResponse(resp);
    expect(decision.type).toBe('route');
    expect(decision.routes![0]!.context).toBeUndefined();
  });

  it('empty response falls back to direct', () => {
    const decision = parseCoordinatorResponse('');
    expect(decision.type).toBe('direct');
    expect(decision.directAnswer).toBe('');
  });
});
