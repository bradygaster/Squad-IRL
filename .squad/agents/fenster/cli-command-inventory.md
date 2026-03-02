# Squad CLI Command Inventory
**Date:** 2025-06-XX  
**Author:** Fenster (Core Dev)  
**Purpose:** Ground truth for every CLI command — what exists, what's implemented, what's documented

---

## Executive Summary

**Total Commands Implemented:** 13 core commands + 1 interactive shell  
**Ghost Commands (in docs, not code):** 4 (`hire`, `heartbeat`, `loop`, `shell`)  
**Orphaned Commands (in code, not docs):** 1 (`upstream`)  
**Help Coverage:** 10/13 commands have --help via main help text, 0/13 have dedicated --help handlers  
**Example Coverage:** 0/13 commands have built-in examples in help output

---

## Command Inventory Table

| Command | Aliases | Status | --help | Examples | Flags/Options | Notes |
|---------|---------|--------|--------|----------|---------------|-------|
| `squad` (no args) | - | ✅ Implemented | ✅ Via main help | ❌ | `--global` | Launches interactive shell if .squad/ exists, else shows init help |
| `squad init` | - | ✅ Implemented | ✅ Via main help | ❌ | `--global`, `--mode remote <path>` | Creates .squad/ directory structure from templates |
| `squad upgrade` | - | ✅ Implemented | ✅ Via main help | ❌ | `--global`, `--migrate-directory`, `--self` | Updates Squad-owned files, never touches team state |
| `squad status` | - | ✅ Implemented | ✅ Via main help | ❌ | - | Shows active squad (repo vs global) and paths |
| `squad triage` | `watch` | ✅ Implemented | ✅ Via main help | ❌ | `--interval <minutes>` | Ralph's work monitor — polls GitHub issues, auto-triages to agents |
| `squad copilot` | - | ✅ Implemented | ✅ Via main help | ❌ | `--off`, `--auto-assign` | Add/remove @copilot coding agent from team |
| `squad plugin` | - | ✅ Implemented | ✅ Via main help | ❌ | `marketplace add\|remove\|list\|browse` | Manage plugin marketplaces |
| `squad export` | - | ✅ Implemented | ✅ Via main help | ❌ | `--out <path>` | Export squad to JSON (default: squad-export.json) |
| `squad import` | - | ✅ Implemented | ✅ Via main help | ❌ | `<file>`, `--force` | Import squad from export file |
| `squad scrub-emails` | - | ✅ Implemented | ✅ Via main help | ❌ | `[directory]` | Remove PII (email addresses) from Squad state files |
| `squad doctor` | - | ✅ Implemented | ✅ Via main help | ❌ | - | 9-check diagnostic for squad setup validation |
| `squad link` | - | ✅ Implemented | ✅ Via main help | ❌ | `<team-repo-path>` | Link project to remote team root (dual-root mode) |
| `squad aspire` | - | ✅ Implemented | ✅ Via main help | ❌ | `--docker`, `--port <number>` | Launch .NET Aspire dashboard for observability |
| `squad upstream` | - | ✅ Implemented | ❌ Not in main help | ❌ | `add\|remove\|list\|sync` | **ORPHANED** — Manage upstream Squad sources for inheritance |
| `squad hire` | - | 👻 Ghost | ❌ | ❌ | `--name <name>`, `--role <role>` | **GHOST** — Mentioned in docs, not implemented |
| `squad heartbeat` | - | 👻 Ghost | ❌ | ❌ | `--dry-run` | **GHOST** — Mentioned in docs, not implemented |
| `squad loop` | - | 👻 Ghost | ❌ | ❌ | `--filter <label>`, `--interval <seconds>` | **GHOST** — Mentioned in docs, not implemented |
| `squad shell` | - | 👻 Ghost | ❌ | ❌ | - | **GHOST** — Mentioned in docs, but `squad` (no args) already does this |
| `squad run` | - | 👻 Ghost | ❌ | ❌ | `<prompt>` | **GHOST** — Mentioned in docs/scenarios/aspire-dashboard.md, not implemented |

---

## Interactive Shell Commands

**Entry:** `squad` (no args when .squad/ exists)  
**Exit:** `/quit`, `/exit`, or `Ctrl+C`

| Command | Status | --help | Examples | What it does |
|---------|--------|--------|----------|--------------|
| `/status` | ✅ Implemented | ✅ Via `/help` | ❌ | Show active agents, sessions, message count, and current activity |
| `/history` | ✅ Implemented | ✅ Via `/help` | ❌ | View session log — recent messages (default: last 10) |
| `/agents` | ✅ Implemented | ✅ Via `/help` | ❌ | List team members with roles and current status |
| `/clear` | ✅ Implemented | ✅ Via `/help` | ❌ | Clear terminal screen (sends ANSI escape code) |
| `/help` | ✅ Implemented | ✅ Self-documenting | ❌ | Show shell command reference. `/help full` for complete docs |
| `/quit` | ✅ Implemented | ✅ Via `/help` | ❌ | Exit the shell |
| `/exit` | ✅ Implemented | ✅ Via `/help` | ❌ | Alias for `/quit` |
| `/sessions` | ✅ Implemented | ✅ Via `/help` | ❌ | List saved sessions with timestamps and message counts |
| `/resume` | ✅ Implemented | ✅ Via `/help` | ❌ | Restore a previous session by ID prefix |
| `/version` | ✅ Implemented | ❌ Not in help | ❌ | Show Squad CLI version |

---

## Command Details & Missing Help

### 1. `squad` (no args)
**What it does:**
- If `.squad/` exists (local or global): launches interactive shell
- If no squad found: shows init suggestion message

**Missing --help:** No dedicated handler. Blank input shows mini-help.

**Missing Examples:** None.

**Draft Help Output:**
```
squad — Launch Interactive Shell

USAGE
  squad [--global]

DESCRIPTION
  Starts the Squad interactive shell, connecting you to your AI team.
  Automatically detects local (.squad/) or personal (~/.squad/) squads.

OPTIONS
  --global    Force use of personal squad at ~/.squad/

EXAMPLES
  # Launch shell in current repo
  squad

  # Launch shell using personal squad
  squad --global

SHELL COMMANDS
  /status     Show team status and active agents
  /history    View recent messages
  /agents     List all team members
  /clear      Clear terminal screen
  /quit       Exit shell
  /help       Show all shell commands
```

---

### 2. `squad init`
**What it does:**
- Scaffolds `.squad/` directory from templates
- Detects project type (Node, Python, .NET, etc.)
- Creates team.md, routing.md, decisions.md, agents/, skills/, etc.
- `--global`: creates at `~/.squad/` instead
- `--mode remote <path>`: links to remote team root

**Missing --help:** No dedicated handler. Included in main help.

**Missing Examples:** None.

**Draft Help Output:**
```
squad init — Initialize Squad

USAGE
  squad init [--global] [--mode remote <path>]

DESCRIPTION
  Creates the .squad/ directory structure in your project or personal directory.
  Detects your project type and scaffolds appropriate workflows and templates.

OPTIONS
  --global              Create personal squad at ~/.squad/
  --mode remote <path>  Link to a remote team root (dual-root mode)

EXAMPLES
  # Initialize Squad in current repo
  squad init

  # Create personal squad
  squad init --global

  # Link to shared team in parent directory
  squad init --mode remote ../team-repo

WHAT GETS CREATED
  .squad/
  ├── team.md              Team roster
  ├── routing.md           Work routing rules
  ├── decisions.md         Architectural decisions log
  ├── casting/             Name registry and policy
  ├── agents/              Agent charters and history
  ├── skills/              Reusable knowledge
  └── identity/            Team focus and wisdom
```

---

### 3. `squad upgrade`
**What it does:**
- Updates Squad-owned files (workflows, templates, squad.agent.md)
- Never touches team state (team.md, decisions.md, history.md)
- Runs migrations if needed
- `--migrate-directory`: renames `.ai-team/` → `.squad/`
- `--self`: (undocumented internal flag for upgrading CLI itself)

**Missing --help:** No dedicated handler. Included in main help.

**Missing Examples:** None.

**Draft Help Output:**
```
squad upgrade — Update Squad Files

USAGE
  squad upgrade [--global] [--migrate-directory]

DESCRIPTION
  Updates Squad-owned files to the latest version. Your team state
  (team.md, decisions.md, agent history) is never modified.

OPTIONS
  --global              Upgrade personal squad at ~/.squad/
  --migrate-directory   Rename .ai-team/ to .squad/ (legacy migration)

EXAMPLES
  # Upgrade current repo's Squad files
  squad upgrade

  # Upgrade personal squad
  squad upgrade --global

  # Migrate from legacy .ai-team/ directory
  squad upgrade --migrate-directory

WHAT GETS UPDATED
  - Workflow files in .github/workflows/
  - Template files (prompts, charters)
  - squad.agent.md (Copilot agent definition)
  - Version stamps in metadata

WHAT NEVER CHANGES
  - team.md (your roster)
  - decisions.md (your decisions)
  - agents/*/history.md (accumulated knowledge)
  - routing.md (your rules)
```

---

### 4. `squad status`
**What it does:**
- Shows which squad is active (repo vs personal)
- Displays paths for repo squad, global path
- Indicates if no squad exists

**Missing --help:** No dedicated handler. Included in main help.

**Missing Examples:** None.

**Draft Help Output:**
```
squad status — Show Active Squad

USAGE
  squad status

DESCRIPTION
  Displays which squad is currently active and where it's located.
  Shows repo squad, personal squad path, and resolution order.

EXAMPLES
  # Check active squad
  squad status

EXAMPLE OUTPUT
  Squad Status

    Here:  repo (in .squad/)
    Path:  /Users/you/project/.squad

    Repo squad:   /Users/you/project/.squad
    Global:       /Users/you/.squad
```

---

### 5. `squad triage` / `squad watch`
**What it does:**
- Ralph's work monitor — polls GitHub issues
- Auto-triages issues to team members based on content/labels
- Adds `squad:AgentName` labels to issues
- `--interval <minutes>`: polling frequency (default: 10 min)

**Missing --help:** No dedicated handler. Included in main help.

**Missing Examples:** None.

**Draft Help Output:**
```
squad triage — Auto-Triage Issues

USAGE
  squad triage [--interval <minutes>]
  squad watch [--interval <minutes>]    (alias)

DESCRIPTION
  Ralph's work monitor. Continuously polls GitHub issues and automatically
  assigns them to the right team member based on content and expertise.

OPTIONS
  --interval <minutes>    Polling frequency (default: 10)

EXAMPLES
  # Start triage with default 10-minute interval
  squad triage

  # Poll every 5 minutes
  squad triage --interval 5

  # One-shot triage (use interval 0 or Ctrl+C after first run)
  squad triage --interval 1

HOW IT WORKS
  1. Fetches open issues from GitHub (requires 'gh auth login')
  2. Analyzes issue title and body
  3. Matches to team member expertise (from team.md)
  4. Adds 'squad:AgentName' label
  5. Agent picks up work on next shell invocation
```

---

### 6. `squad copilot`
**What it does:**
- Adds the @copilot coding agent to team.md roster
- `--off`: removes @copilot from roster
- `--auto-assign`: enables auto-assignment for @copilot

**Missing --help:** No dedicated handler. Included in main help.

**Missing Examples:** None.

**Draft Help Output:**
```
squad copilot — Manage Copilot Coding Agent

USAGE
  squad copilot [--off] [--auto-assign]

DESCRIPTION
  Add or remove the GitHub Copilot coding agent (@copilot) from your team.
  When enabled, @copilot can pick up issues labeled 'squad:copilot'.

OPTIONS
  --off            Remove @copilot from the team
  --auto-assign    Enable automatic issue assignment for @copilot

EXAMPLES
  # Add @copilot to the team
  squad copilot

  # Add @copilot with auto-assignment enabled
  squad copilot --auto-assign

  # Remove @copilot from the team
  squad copilot --off

NOTES
  - @copilot is a special agent that runs in GitHub Copilot CLI context
  - When auto-assign is enabled, Ralph assigns issues to @copilot automatically
  - @copilot picks up work labeled 'squad:copilot'
```

---

### 7. `squad plugin`
**What it does:**
- Manages plugin marketplaces (registries of Squad extensions)
- Subcommands: `marketplace add|remove|list|browse`
- Stores marketplace config in `.squad/plugins/marketplaces.json`

**Missing --help:** No dedicated handler. Included in main help.

**Missing Examples:** None.

**Draft Help Output:**
```
squad plugin — Manage Plugin Marketplaces

USAGE
  squad plugin marketplace add <owner/repo>
  squad plugin marketplace remove <name>
  squad plugin marketplace list
  squad plugin marketplace browse <name>

DESCRIPTION
  Manage plugin marketplaces — registries of Squad extensions, skills,
  and agent templates. Marketplaces are GitHub repos with structured content.

COMMANDS
  add <owner/repo>    Register a new marketplace
  remove <name>       Unregister a marketplace
  list                Show all registered marketplaces
  browse <name>       Open marketplace in browser

EXAMPLES
  # Add official Squad plugins marketplace
  squad plugin marketplace add bradygaster/squad-plugins

  # List all registered marketplaces
  squad plugin marketplace list

  # Remove a marketplace
  squad plugin marketplace remove squad-plugins

  # Browse marketplace in web browser
  squad plugin marketplace browse squad-plugins

FILES
  .squad/plugins/marketplaces.json    Registered marketplaces
```

---

### 8. `squad export`
**What it does:**
- Exports squad to portable JSON snapshot (squad-export.json)
- Includes casting state, agent charters/history, skills
- `--out <path>`: custom output path

**Missing --help:** No dedicated handler. Included in main help.

**Missing Examples:** None.

**Draft Help Output:**
```
squad export — Export Squad to JSON

USAGE
  squad export [--out <path>]

DESCRIPTION
  Creates a portable JSON snapshot of your entire squad — casting state,
  agent charters, accumulated history, and skills. Use 'squad import'
  to restore or clone to another project.

OPTIONS
  --out <path>    Custom output path (default: squad-export.json)

EXAMPLES
  # Export to default file
  squad export

  # Export to custom location
  squad export --out ./backups/team-2025-01-15.json

  # Export personal squad
  squad export --global --out ~/squad-backup.json

WHAT GETS EXPORTED
  - Casting policy and name registry
  - Agent charters and history
  - Skills and accumulated knowledge
  - Team metadata

WHAT DOESN'T GET EXPORTED
  - Session logs (too large)
  - Local file paths (non-portable)
  - GitHub tokens or secrets
```

---

### 9. `squad import`
**What it does:**
- Imports squad from export JSON file
- Validates export format (version 1.0 expected)
- `--force`: overwrites existing squad (archives old one first)

**Missing --help:** No dedicated handler. Included in main help.

**Missing Examples:** None.

**Draft Help Output:**
```
squad import — Import Squad from JSON

USAGE
  squad import <file> [--force]

DESCRIPTION
  Restores a squad from a JSON export file. Creates .squad/ directory
  and populates it with casting state, agents, skills, and history.

OPTIONS
  --force    Overwrite existing squad (archives old .squad/ first)

EXAMPLES
  # Import into current directory
  squad import squad-export.json

  # Import and overwrite existing squad
  squad import squad-export.json --force

  # Import into personal squad
  squad import squad-export.json --global --force

SAFETY
  - Validates export format before writing anything
  - Archives existing .squad/ as .squad-backup-<timestamp>/ when using --force
  - Fails if .squad/ exists without --force
```

---

### 10. `squad scrub-emails`
**What it does:**
- Removes PII (email addresses) from Squad state files
- Scrubs: team.md, decisions.md, routing.md, ceremonies.md, agent history
- Returns count of files modified

**Missing --help:** No dedicated handler. Included in main help.

**Missing Examples:** None.

**Draft Help Output:**
```
squad scrub-emails — Remove Email Addresses

USAGE
  squad scrub-emails [directory]

DESCRIPTION
  Removes email addresses (PII) from Squad state files. Useful before
  committing to public repos or sharing exports.

OPTIONS
  [directory]    Target directory (default: .ai-team for legacy compat)

EXAMPLES
  # Scrub current squad
  squad scrub-emails .squad

  # Scrub legacy .ai-team directory
  squad scrub-emails

FILES SCRUBBED
  - team.md
  - decisions.md
  - routing.md
  - ceremonies.md
  - agents/*/history.md

PATTERNS REMOVED
  - user@example.com
  - Name (user@example.com)

NOTES
  - Does NOT scrub session logs (too large to parse safely)
  - Does NOT scrub .git history (use BFG Repo-Cleaner for that)
```

---

### 11. `squad doctor`
**What it does:**
- 9-check diagnostic for squad setup validation
- Checks: mode detection, .squad/ existence, team.md, routing.md, agents/, casting/, skills/, config.json
- Always exits 0 (diagnostic tool, not a gate)

**Missing --help:** No dedicated handler. Included in main help.

**Missing Examples:** None.

**Draft Help Output:**
```
squad doctor — Validate Squad Setup

USAGE
  squad doctor

DESCRIPTION
  Runs a 9-check diagnostic on your squad setup. Reports health of
  expected files, conventions, and directory structure. Always exits 0
  (this is a diagnostic tool, not a gate).

EXAMPLES
  # Check current squad setup
  squad doctor

CHECKS PERFORMED
  1. Mode detection (local, remote, hub)
  2. .squad/ directory exists
  3. team.md roster file exists and is valid
  4. routing.md rules file exists
  5. agents/ directory exists with at least one agent
  6. casting/ state directory exists
  7. skills/ directory exists
  8. config.json valid (remote mode only)
  9. Linked team root accessible (remote mode only)

OUTPUT CODES
  ✅ PASS    Check succeeded
  ⚠️  WARN    Check passed with warnings
  ❌ FAIL    Check failed
```

---

### 12. `squad link`
**What it does:**
- Links project to remote team root (dual-root mode)
- Writes `.squad/config.json` with `teamRoot` path
- Validates target directory contains `.squad/` or `.ai-team/`

**Missing --help:** No dedicated handler. Included in main help.

**Missing Examples:** None.

**Draft Help Output:**
```
squad link — Link to Remote Team

USAGE
  squad link <team-repo-path>

DESCRIPTION
  Links the current project to a remote team root. Enables dual-root mode
  where project-specific state lives in .squad/ and team identity lives
  in a shared location.

EXAMPLES
  # Link to parent directory's team
  squad link ../team-repo

  # Link to absolute path
  squad link /Users/org/shared-squad

  # Link to sibling project
  squad link ../another-project

HOW IT WORKS
  1. Validates target path exists and contains .squad/ or .ai-team/
  2. Computes relative path from project to team root
  3. Writes .squad/config.json with teamRoot reference
  4. Squad now reads team identity from remote, state from local

FILES CREATED
  .squad/config.json    { "version": 1, "teamRoot": "../team-repo" }

USE CASES
  - Monorepo with shared team identity across projects
  - Org-wide squad that multiple repos inherit from
  - Personal squad linked from multiple projects
```

---

### 13. `squad aspire`
**What it does:**
- Launches .NET Aspire dashboard for observability
- Auto-detects: Docker, Podman, or native .NET Aspire workload
- Configures OTLP export so Squad traces/metrics flow to dashboard
- `--docker`: force Docker mode
- `--port <number>`: custom OTLP port (default: 4317)

**Missing --help:** No dedicated handler. Included in main help.

**Missing Examples:** None.

**Draft Help Output:**
```
squad aspire — Launch Aspire Dashboard

USAGE
  squad aspire [--docker] [--port <number>]

DESCRIPTION
  Launches the .NET Aspire dashboard for observability. Squad automatically
  exports OpenTelemetry traces and metrics to the dashboard, giving you
  real-time visibility into agent activity, tool calls, and session flow.

OPTIONS
  --docker         Force Docker mode
  --port <number>  OTLP port (default: 4317)

EXAMPLES
  # Launch Aspire dashboard (auto-detect runtime)
  squad aspire

  # Force Docker mode
  squad aspire --docker

  # Use custom OTLP port
  squad aspire --port 5000

DASHBOARD URL
  http://localhost:18888

WHAT YOU'LL SEE
  - Agent spans (session start/end, tool calls)
  - Coordinator routing decisions
  - Session lifecycle and checkpoints
  - Tool execution timings
  - Error traces and retries

REQUIREMENTS
  One of:
    - Docker or Podman installed
    - .NET SDK with Aspire workload ('dotnet workload install aspire')
```

---

### 14. `squad upstream` (ORPHANED)
**What it does:**
- Manages upstream Squad sources for inheritance
- Subcommands: `add|remove|list|sync`
- Upstream types: local path, git URL, export JSON
- Stores config in `.squad/upstream.json`

**Missing --help:** NOT in main help output. Command exists but not advertised.

**Missing Examples:** None.

**Draft Help Output:**
```
squad upstream — Manage Upstream Sources

USAGE
  squad upstream add <source> [--name <name>] [--ref <branch>]
  squad upstream remove <name>
  squad upstream list
  squad upstream sync [name]

DESCRIPTION
  Inherit skills, decisions, and wisdom from another squad. Upstreams can
  be local directories, git repos, or export JSON files. Changes are pulled
  via 'squad upstream sync'.

COMMANDS
  add <source>    Register an upstream source
  remove <name>   Unregister an upstream
  list            Show all registered upstreams
  sync [name]     Pull changes from upstream(s)

OPTIONS (add command)
  --name <name>     Custom name (auto-derived if omitted)
  --ref <branch>    Git branch/tag (default: main)

EXAMPLES
  # Add local upstream
  squad upstream add ../org-practices/.squad --name org

  # Add git upstream
  squad upstream add https://github.com/acme/platform-squad.git --name platform

  # Add export snapshot
  squad upstream add ./exports/snapshot.json --name snapshot

  # Sync all upstreams
  squad upstream sync

  # Sync specific upstream
  squad upstream sync platform

FILES
  .squad/upstream.json    Upstream registry
```

---

## Ghost Commands (In Docs, Not Implemented)

### 1. `squad hire` 👻
**Mentioned in:** `docs/reference/cli.md`, `packages/squad-cli/README.md`  
**Status:** Not implemented in cli-entry.ts  
**Expected behavior:** Team creation wizard or add specific agent  
**Flags:** `--name <name>`, `--role <role>`

**Why it's a ghost:** Docs describe it, but no routing exists in CLI code. May be planned future feature or stale docs.

---

### 2. `squad heartbeat` 👻
**Mentioned in:** `docs/scenarios/ci-cd-integration.md`, `docs/reference/cli.md`  
**Status:** Not implemented in cli-entry.ts  
**Expected behavior:** Run Ralph's triage cycle manually (one-shot)  
**Flags:** `--dry-run`

**Why it's a ghost:** Docs show CI examples using it. Likely intended as sync wrapper around `squad watch` (which polls continuously).

---

### 3. `squad loop` 👻
**Mentioned in:** `docs/reference/cli.md`, `packages/squad-cli/README.md`  
**Status:** Not implemented in cli-entry.ts  
**Expected behavior:** Continuous work loop (Ralph mode)  
**Flags:** `--filter <label>`, `--interval <seconds>`

**Why it's a ghost:** Described as continuous work loop. May overlap with `squad watch` functionality.

---

### 4. `squad shell` 👻
**Mentioned in:** `docs/reference/cli.md`  
**Status:** Not implemented as explicit command  
**Why it's a ghost:** `squad` (no args) already launches shell. Explicit `squad shell` may have been planned for clarity but isn't wired.

---

### 5. `squad run` 👻
**Mentioned in:** `docs/scenarios/aspire-dashboard.md`  
**Status:** Not implemented in cli-entry.ts  
**Expected behavior:** Run a prompt directly without entering shell  
**Usage:** `squad run "your prompt here"`

**Why it's a ghost:** Docs show one-shot prompt execution. Not wired in CLI routing.

---

## Recommendations

### 1. Fix Ghost Commands
**Priority:** High  
**Impact:** Docs promise features that don't exist — confusing for users

**Action items:**
- **Option A (Implement):** Wire `hire`, `heartbeat`, `loop`, `run` into cli-entry.ts
- **Option B (Document):** Mark as "Planned" in docs or remove entirely
- **Option C (Alias):** Map `squad shell` → `squad` (no-op alias), `squad heartbeat` → `squad triage --once`

---

### 2. Unhide Orphaned Command
**Priority:** Medium  
**Impact:** `squad upstream` is implemented but invisible to users

**Action items:**
- Add `squad upstream` to main help text (lines 92-93 in cli-entry.ts)
- Add to README.md command table
- Document in docs/reference/cli.md

---

### 3. Add Dedicated --help Handlers
**Priority:** Low  
**Impact:** All commands show main help instead of command-specific help

**Action items:**
- Detect `squad <cmd> --help` and show command-specific help
- Example: `squad export --help` → dedicated export help, not generic help

**Code location:** cli-entry.ts around line 70 (help handler)

---

### 4. Add Examples to Help Output
**Priority:** Low  
**Impact:** Users have to guess command syntax

**Action items:**
- Add EXAMPLES section to each command's help output
- Follow pattern: basic usage, common flags, edge cases
- See draft help outputs above for examples

---

## Files to Update

### Priority 1: Fix Ghosts
1. **cli-entry.ts** — Add routing for `hire`, `heartbeat`, `loop`, `run` OR remove from docs
2. **README.md** — Remove ghost commands or mark as "Coming Soon"
3. **docs/reference/cli.md** — Align command table with implemented commands

### Priority 2: Unhide Orphan
1. **cli-entry.ts** — Add `upstream` to main help text
2. **README.md** — Add `upstream` to command table
3. **docs/reference/cli.md** — Document `upstream` command

### Priority 3: Improve Help
1. **cli-entry.ts** — Add dedicated --help handlers per command
2. **packages/squad-cli/src/cli/commands/*.ts** — Add help text to each command module

---

## Command Implementation Status by File

| File | Commands | Status |
|------|----------|--------|
| `cli-entry.ts` | `init`, `upgrade`, `triage`, `watch`, `export`, `import`, `plugin`, `copilot`, `scrub-emails`, `aspire`, `doctor`, `status`, `link` | ✅ All wired |
| `shell/index.ts` | Interactive shell entry | ✅ Wired |
| `shell/commands.ts` | `/status`, `/history`, `/agents`, `/clear`, `/help`, `/quit`, `/sessions`, `/resume`, `/version` | ✅ All wired |
| `commands/watch.ts` | `triage`/`watch` impl | ✅ Implemented |
| `commands/plugin.ts` | `plugin marketplace` impl | ✅ Implemented |
| `commands/export.ts` | `export` impl | ✅ Implemented |
| `commands/import.ts` | `import` impl | ✅ Implemented |
| `commands/copilot.ts` | `copilot` impl | ✅ Implemented |
| `commands/doctor.ts` | `doctor` impl | ✅ Implemented |
| `commands/aspire.ts` | `aspire` impl | ✅ Implemented |
| `commands/link.ts` | `link` impl | ✅ Implemented |
| `commands/upstream.ts` | `upstream` impl | ✅ Implemented but hidden |
| `commands/init-remote.ts` | `init --mode remote` impl | ✅ Implemented |
| `core/upgrade.ts` | `upgrade` impl | ✅ Implemented |
| `core/init.ts` | `init` impl | ✅ Implemented |
| `core/email-scrub.ts` | `scrub-emails` impl | ✅ Implemented |

---

## Zero-Dependency Entry Point (cli.js)

**Location:** `C:\src\squad-pr\cli.js` (repo root)  
**Purpose:** Bundled zero-dep shim for legacy distribution  
**Status:** ⚠️ Deprecated (shows deprecation notice directing users to `npm install -g @bradygaster/squad-cli`)

**Commands in cli.js:** Same as cli-entry.ts (built from same source)

**Note:** Shows deprecation warning pointing users to npm install method.

---

## Next Steps for McManus (Docs)

1. **Reconcile ghost commands** — decide keep/remove/implement
2. **Document `upstream` command** — currently hidden gem
3. **Add command reference page** — detailed help for each command
4. **Create examples page** — cookbook-style usage patterns

---

## Next Steps for Fenster (CLI)

1. **Wire ghost commands or remove from docs** (Priority 1)
2. **Add `upstream` to main help** (Priority 2)
3. **Add dedicated --help handlers** (Priority 3)
4. **Add EXAMPLES sections to help output** (Priority 3)

---

**End of Inventory**
