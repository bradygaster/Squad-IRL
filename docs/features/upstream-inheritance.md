# Upstream Inheritance

> ⚠️ **Experimental** — Squad is alpha software. APIs, commands, and behavior may change between releases.


Upstream inheritance allows you to declare external Squad sources—from other repositories, local directories, or exports—and automatically inherit their context (skills, decisions, wisdom, casting policy, routing) at session start. This enables knowledge sharing across teams, organizations, and projects without duplicating Squad configuration.

## Why Upstream Inheritance Matters

When you have multiple teams using Squad in an organization, you need a way to share common practices, agent definitions, and decision-making frameworks. Upstream inheritance solves this without creating dependency trees:

- **Org-level guidance** flows down to team repos and individual projects
- **Platform team standards** propagate to all consuming teams
- **Shared methodologies** scale across client projects or service offerings
- **Domain models** stay consistent across multiple services

Instead of copying configuration, you point to it—and at session start, the coordinator reads all declared upstreams and makes their context available to every spawned agent.

## Core Concepts

### Three Source Types

Upstreams can come from three places:

| Type | Example | Use Case |
|------|---------|----------|
| **local** | `../org-practices/.squad/` | Sibling repo on disk, shared drive, monorepo package |
| **git** | `https://github.com/acme/platform-squad.git` | Public org repository or private team repo (with proper credentials) |
| **export** | `./exports/squad-export.json` | Snapshot for offline use or version pinning |

### Hierarchy and Resolution

Squad follows a **closest-wins** principle:

```
Org-level upstream
    ↓
Team-level upstream
    ↓
Repository config (local upstream.json)
    ↓
My agent instance
```

The resolver reads upstreams in the order they appear in `upstream.json`, and **later entries override earlier ones** for the same content type. This means you can layer upstreams from org → team → repo, with each level adding or overriding as needed.

### What Gets Inherited

When you add an upstream, the coordinator reads all of these from its `.squad/` directory:

- **Skills** — all `.squad/skills/*/SKILL.md` files
- **Decisions** — `.squad/decisions.md`
- **Wisdom** — `.squad/identity/wisdom.md`
- **Casting Policy** — `.squad/casting/policy.json`
- **Routing** — `.squad/routing.md`

If a resource doesn't exist in an upstream, it's skipped (no error). This allows upstreams to provide partial context.

## Getting Started

### Quick Start: Local Upstream

If you have a sibling repository with Squad configuration:

```bash
# Add a local upstream from a nearby directory
squad upstream add ../org-practices/.squad

# The coordinator infers the name: "org-practices"
```

Check it:

```bash
squad upstream list
# Output:
#   org-practices  →  local: /path/to/org-practices/.squad  (never synced)
```

The coordinator reads from this path **live** at session start—no sync needed.

### Quick Start: Git Upstream

For a remote repository:

```bash
# Add from a public GitHub repo
squad upstream add https://github.com/acme/platform-squad.git --name platform

# Or specify a branch
squad upstream add https://github.com/acme/platform-squad.git --name platform --ref develop
```

On first add, Squad clones the repo to `.squad/_upstream_repos/platform`. Keep this directory in `.gitignore`:

```bash
# Already done by squad upstream add
cat .gitignore
# .squad/_upstream_repos/
```

Update it later:

```bash
squad upstream sync platform
```

Or sync all:

```bash
squad upstream sync
```

### Quick Start: Export Snapshot

For offline or pinned versions:

```bash
# Export an existing Squad config
squad export-config --output ./exports/snapshot.json

# Add it as an upstream
squad upstream add ./exports/snapshot.json --name snapshot
```

## CLI Reference

### `squad upstream add <source>`

Add a new upstream source.

**Signature:**
```
squad upstream add <source> [--name <name>] [--ref <branch>]
```

**Arguments:**
- `<source>` — File path, git URL, or export JSON file. Squad auto-detects the type.

**Options:**
- `--name <name>` — Display name (optional; defaults to repo/dir name)
- `--ref <branch>` — Git branch/tag (only for git sources; defaults to `main`)

**Examples:**

Local directory:
```bash
squad upstream add ../shared-squad --name shared
```

Git repository:
```bash
squad upstream add https://github.com/acme/platform-squad.git --name platform --ref main
```

Export file:
```bash
squad upstream add ./exports/org-snapshot.json --name org-snapshot
```

**What happens:**
- Reads `upstream.json` from `.squad/`
- Detects source type (local, git, export)
- For git sources: auto-clones to `.squad/_upstream_repos/{name}`
- Adds entry to `.squad/upstream.json`
- For local/export: coordinator reads live at session start (no sync needed)

### `squad upstream remove <name>`

Remove an upstream by name.

**Signature:**
```
squad upstream remove <name>
```

**Examples:**
```bash
squad upstream remove platform
```

**What happens:**
- Removes entry from `.squad/upstream.json`
- Deletes cached clone from `.squad/_upstream_repos/{name}` if it exists

### `squad upstream list`

Show all configured upstreams.

**Signature:**
```
squad upstream list
```

**Output example:**
```
Configured upstreams:

  platform  →  git: https://github.com/acme/platform-squad.git (ref: main)  (synced 2026-02-22)
  shared    →  local: /home/alice/shared-squad  (never synced)
  snapshot  →  export: ./exports/org-snapshot.json  (synced 2026-02-22)
```

### `squad upstream sync [name]`

Update cached clones for git upstreams, or validate paths for local/export upstreams.

**Signature:**
```
squad upstream sync [name]
```

**Examples:**

Sync all:
```bash
squad upstream sync
```

Sync one:
```bash
squad upstream sync platform
```

**What happens:**
- For **git** sources: `git pull --ff-only` on the cached clone, or re-clones if needed
- For **local** sources: validates that the path exists
- For **export** sources: validates that the file exists
- Updates `last_synced` timestamp in `upstream.json`

## SDK API Reference

The upstream module provides resolver functions for programmatic use.

### Types

#### `UpstreamType`

```typescript
type UpstreamType = 'local' | 'git' | 'export';
```

#### `UpstreamSource`

A declared upstream from `upstream.json`:

```typescript
interface UpstreamSource {
  name: string;           // Display name (e.g., "platform")
  type: UpstreamType;     // How to access it
  source: string;         // Path, URL, or export file location
  ref?: string;           // Git ref (only for type: "git")
  added_at: string;       // ISO timestamp
  last_synced: string | null;  // Last successful sync
}
```

#### `UpstreamConfig`

The `upstream.json` file format:

```typescript
interface UpstreamConfig {
  upstreams: UpstreamSource[];
}
```

#### `ResolvedUpstream`

Resolved content from a single upstream:

```typescript
interface ResolvedUpstream {
  name: string;
  type: UpstreamType;
  skills: Array<{ name: string; content: string }>;
  decisions: string | null;
  wisdom: string | null;
  castingPolicy: Record<string, unknown> | null;
  routing: string | null;
}
```

#### `UpstreamResolution`

Result of resolving all upstreams:

```typescript
interface UpstreamResolution {
  upstreams: ResolvedUpstream[];
}
```

### Functions

#### `readUpstreamConfig(squadDir: string): UpstreamConfig | null`

Read and parse `upstream.json` from a squad directory.

**Returns:** `null` if file doesn't exist or is invalid.

**Example:**
```typescript
import { readUpstreamConfig } from '@bradygaster/squad-sdk';

const config = readUpstreamConfig('.squad');
if (config) {
  console.log(`Found ${config.upstreams.length} upstreams`);
}
```

#### `resolveUpstreams(squadDir: string): UpstreamResolution | null`

Resolve all upstream sources declared in `upstream.json`.

For each upstream:
- **local**: reads directly from the source's `.squad/`
- **git**: reads from `.squad/_upstream_repos/{name}/` (must be cloned first)
- **export**: reads from the JSON file

**Returns:** `null` if no `upstream.json` exists. If a source can't be reached, that upstream is included with empty content (no error thrown).

**Example:**
```typescript
import { resolveUpstreams } from '@bradygaster/squad-sdk';

const resolution = resolveUpstreams('.squad');
if (resolution) {
  for (const upstream of resolution.upstreams) {
    console.log(`${upstream.name}: ${upstream.skills.length} skills`);
  }
}
```

#### `buildInheritedContextBlock(resolution: UpstreamResolution | null): string`

Build a text block summarizing inherited context (for agent prompts).

**Returns:** Empty string if no resolution or upstreams.

**Example output:**
```
INHERITED CONTEXT:
  platform: skills (3), decisions ✓, casting ✓
  shared: skills (5), routing ✓
  snapshot: (empty)
```

**Usage:** The coordinator includes this in agent spawn prompts to signal what context is available.

#### `buildSessionDisplay(resolution: UpstreamResolution | null): string`

Build a user-facing display for session start greeting.

**Returns:** Empty string if no resolution or upstreams.

**Example output:**
```
📡 Inherited context:
  platform (git) — 3 skills, decisions, casting
  shared (local) — 5 skills, routing
  ⚠️ snapshot (export) — source not reachable
```

**Usage:** Shown in the session greeting to confirm what upstreams are available.

## End-to-End Scenarios

### Scenario 1: Platform Team at Scale

**Setting:** Your organization has a platform team that defines shared agent definitions, decisions, and casting policy for all product teams.

**Structure:**
```
acme/
  platform-squad (platform team repo)
    .squad/
      decisions.md (org-level decisions)
      casting/policy.json (standard casting)
      skills/
        platform-engineer/SKILL.md
        backend-engineer/SKILL.md
  product-a (product team repo)
    .squad/
      upstream.json
    [other files]
  product-b (product team repo)
    .squad/
      upstream.json
    [other files]
```

**Setup in product-a:**

```bash
cd product-a

# Add platform team's Squad as upstream
squad upstream add https://github.com/acme/platform-squad.git \
  --name platform \
  --ref main

# Optionally add product-specific decisions
# (platform decisions are already inherited)
```

**What happens at session start:**
1. Coordinator reads `.squad/upstream.json` in product-a
2. Resolves `platform` → clones/pulls from GitHub
3. Loads platform's decisions, casting policy, and skills
4. When an agent spawns, it has access to platform's casting rules and decision framework
5. Product team can override by adding their own skills or decisions

**Benefit:** The platform team updates their practices in one place; all product teams see the changes at their next session start (after `squad upstream sync`).

### Scenario 2: Open-Source Framework with Community Plugins

**Setting:** You maintain an open-source framework. Community members contribute agent skills and methodologies. You want them to inherit your framework's core practices without forking.

**Structure:**
```
acme-framework (public repo)
  .squad/
    decisions.md (framework principles)
    skills/
      framework-engineer/SKILL.md
    wisdom.md (philosophy)
    routing.md (traffic rules)

community-plugin-a (contributor repo)
  .squad/
    upstream.json (points to acme-framework)
    skills/
      plugin-specialization/SKILL.md
    [other files]

community-plugin-b (contributor repo)
  .squad/
    upstream.json (points to acme-framework)
    skills/
      plugin-other/SKILL.md
    [other files]
```

**Setup in community-plugin-a:**

```bash
squad upstream add https://github.com/acme/acme-framework.git \
  --name framework
```

**What happens:**
1. Plugin developers inherit framework's decisions, wisdom, and core skills
2. Their own skills layer on top
3. When the framework publishes new principles, plugins see them at next sync
4. Plugins can add or override routing without touching the framework

**Benefit:** Framework governance scales across a community; contributors stay aligned without central control.

### Scenario 3: Consultancy Methodology Across Client Projects

**Setting:** You're a consultancy. All client projects should follow your engagement methodology (decisions, casting, methodologies). Each project has unique domain skills.

**Structure:**
```
consultancy-methodology (internal repo)
  .squad/
    decisions.md (client engagement decision framework)
    casting/policy.json (role definitions)
    wisdom.md (consulting philosophy)
    routing.md (internal routing rules)

client-a-project (client repo)
  .squad/
    upstream.json (points to methodology)
    skills/
      client-a-domain-expert/SKILL.md
    [other files]

client-b-project (client repo)
  .squad/
    upstream.json (points to methodology)
    skills/
      client-b-domain-expert/SKILL.md
    [other files]
```

**Setup in client-a-project:**

```bash
squad upstream add https://github.internal/consultancy/methodology.git \
  --name consultancy \
  --ref main
```

(Or use SSH/PAT for private repos.)

**What happens:**
1. Every agent spawned in the client project inherits consultancy's methodology
2. Client-specific skills (domain expertise) are layered on top
3. Consultancy updates methodology; all active projects pull at next sync
4. Each client project remains independent (no shared git history)

**Benefit:** Quality control at scale; consistent methodology; easy knowledge transfer.

### Scenario 4: Multi-Team Shared Domain Model

**Setting:** Three teams work on different services that share a domain model (e.g., user, order, payment). You want a single source of truth for how to work with that model.

**Structure:**
```
shared-domain (shared repo, not a full product)
  .squad/
    skills/
      domain-modeler/SKILL.md (DDD practices)
      database-engineer/SKILL.md (schema design)
    decisions.md (data governance)
    routing.md (domain event routing)

user-service (team repo)
  .squad/
    upstream.json (points to shared-domain)
  [business logic]

order-service (team repo)
  .squad/
    upstream.json (points to shared-domain)
  [business logic]

payment-service (team repo)
  .squad/
    upstream.json (points to shared-domain)
  [business logic]
```

**Setup in user-service:**

```bash
squad upstream add https://github.com/acme/shared-domain.git --name domain
```

**What happens:**
1. All agents spawned across the three services have access to shared domain skills
2. If domain conventions change, the shared-domain repo is updated once
3. Each team pulls the change independently
4. Services stay decoupled (no cross-repo deployments)

**Benefit:** DDD governance; single source of truth; isolation with consistency.

### Scenario 5: Post-Acquisition Engineering Convergence

**Setting:** After acquiring another company, you need to converge engineering practices across two organizations. They have different frameworks, but you want a unified way forward without forcing a rewrite.

**Structure:**
```
acme-unified-practices (new shared repo)
  .squad/
    decisions.md (merged decision framework)
    casting/policy.json (unified roles)
    skills/
      acme-engineer/SKILL.md (original practices)
      acquired-engineer/SKILL.md (acquired practices)
    routing.md (unified routing)

acme-product (original product repo)
  .squad/
    upstream.json (points to unified-practices)
  [business logic]

acquired-product (acquired product repo)
  .squad/
    upstream.json (points to unified-practices)
  [business logic]
```

**Setup in acquired-product:**

```bash
squad upstream add https://github.com/acme/acme-unified-practices.git --name unified
```

**What happens:**
1. Both products inherit the merged practices
2. Agents understand both organizations' traditions (skills for both)
3. Decisions reflect the merged framework
4. Teams can work independently while being culturally aligned

**Benefit:** Smooth integration without painful rewrites; shared culture; gradual convergence.

### Scenario 6: Enterprise Application Modernization

**Setting:** You're migrating a monolith to microservices. You want to maintain architectural consistency across new services while honoring legacy patterns.

**Structure:**
```
modernization-playbook (central guidance repo)
  .squad/
    decisions.md (architecture decisions, API patterns)
    skills/
      microservice-engineer/SKILL.md (cloud-native practices)
      legacy-translator/SKILL.md (backward compatibility)
    wisdom.md (migration philosophy)
    routing.md (inter-service routing)

legacy-monolith (old codebase)
  .squad/
    upstream.json (points to playbook)
  [monolith code]

billing-service (new microservice)
  .squad/
    upstream.json (points to playbook)
  [business logic]

inventory-service (new microservice)
  .squad/
    upstream.json (points to playbook)
  [business logic]

shipping-service (new microservice)
  .squad/
    upstream.json (points to playbook)
  [business logic]
```

**Setup in billing-service:**

```bash
squad upstream add https://github.com/acme/modernization-playbook.git \
  --name playbook
```

**What happens:**
1. All new services inherit architectural guidance
2. The legacy monolith inherits it too (preparing for extraction)
3. Playbook defines how services communicate, handle transactions, manage state
4. When a pattern is learned, it goes into the playbook once; all services benefit

**Benefit:** Architectural coherence; faster service extraction; knowledge base grows with the migration.

## Troubleshooting

### Git Clone or Sync Fails

**Problem:** `git clone` times out or fails with authentication errors.

**Solutions:**
- Ensure the URL is correct: `https://github.com/owner/repo.git`
- For private repos, use SSH (`git@github.com:owner/repo.git`) and ensure your SSH key is in ssh-agent
- Or use a GitHub PAT with `https://[PAT]@github.com/owner/repo.git` (less secure; prefer SSH)
- Check network: `git clone --depth 1 --branch main <url>` from the command line first
- If `squad upstream sync` fails, cached clone is stale; run again later

### Local Upstream Not Found

**Problem:** `squad upstream add ../shared/.squad` fails with "Cannot determine source type".

**Solutions:**
- Ensure the path exists: `ls -la ../shared/.squad`
- Ensure it contains a `.squad/` directory (not a `.squad` file)
- Use absolute path if relative paths are ambiguous: `squad upstream add /full/path/to/shared/.squad`
- Verify the other repo is actually a Squad repo (has `.squad/` directory)

### Export File Invalid

**Problem:** `squad upstream add ./export.json` fails or doesn't load skills.

**Solutions:**
- Verify the file is valid JSON: `jq . ./export.json`
- Ensure it was created by `squad export-config` (has the right schema)
- Check that skills array is present: `jq .skills ./export.json`
- If manually created, the structure should be:
  ```json
  {
    "version": "1.0",
    "skills": ["<skill content 1>", "<skill content 2>", ...],
    "casting": { "policy": { ... } }
  }
  ```

### Agents Don't See Inherited Context

**Problem:** Spawned agents don't have access to upstream skills/decisions.

**Solutions:**
- Verify upstreams are configured: `squad upstream list`
- Verify sources are reachable: `squad upstream sync` (should not warn)
- Check the session display when you start the session (should show `📡 Inherited context:`)
- For git upstreams, ensure they've been cloned: check `.squad/_upstream_repos/{name}`
- For local upstreams, ensure the path still exists
- Restart your session (upstream resolution happens at session start)

### Cached Clone Gets Out of Date

**Problem:** You know the upstream repo changed, but agents still see old content.

**Solution:**
```bash
squad upstream sync <name>
```

For all upstreams:
```bash
squad upstream sync
```

This updates git clones and validates local/export paths. Then start a new session.

### Order Matters

**Problem:** Upstream A and Upstream B define conflicting decisions or skills.

**Note:** Later entries in `upstream.json` override earlier ones. The resolver reads in order and the last definition wins.

**Solution:**
Order matters. Check `squad upstream list` to see the order, and use `remove` + `add` to reorder if needed.

---

## Next Steps

- **Read more:** See `docs/guide/casting.md` for how inherited casting policy shapes agent behavior
- **Set up**: Run `squad upstream add <source>` to add your first upstream
- **Share:** Export your Squad config with `squad export-config` for others to inherit
- **Iterate:** Update your upstream and run `squad upstream sync` to pull changes across all consuming projects
