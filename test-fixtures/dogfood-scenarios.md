# Dogfood Scenarios — Squad REPL Testing

## Overview
This document describes 8 realistic dogfood scenarios for testing the Squad REPL against real-world project structures. Each scenario represents a common architecture pattern or edge case that users will encounter.

---

## Scenario 1: Small Single-Language Python Project (Flask-like)

**Description:**
A minimal Flask API project with source code, tests, and config files in a flat structure.

**Real-world pattern:**
- Rapid prototyping, hackathons, proof-of-concept APIs
- Developers expect fast REPL startup and instant context discovery
- Typical team size: 1–3 people

**Why it matters:**
Tests that the REPL correctly identifies Python packages, handles `requirements.txt` parsing, and surfaces a minimal but complete team.md without crashes on lightweight projects.

**Expected REPL behavior:**
- Discovers `src/app.py` and `tests/test_app.py` immediately
- Parses `requirements.txt` to understand dependencies (Flask, pytest, etc.)
- Loads `.squad/team.md` with 1–3 agents (e.g., Backend, Tester)
- Responds to `@backend --help` with context about Flask codebase
- Completion/suggestions work for common commands (list, status, ask)

**Edge cases to watch:**
- Empty/missing `tests/` directory
- `requirements.txt` with git URLs or extras notation (`Flask[async]`)
- Team.md with only a single agent
- Python bytecode or `.pyc` files in the tree

**Pass criteria:**
- REPL launches without error
- `list agents` shows 1–3 agents
- `@backend "explain app.py"` returns meaningful context about Flask structure
- No crashes or unhandled exceptions on filesystem traversal

**Fail criteria:**
- REPL hangs on startup
- `list agents` is empty or crashes
- Agent context is empty or generic
- Stack traces in stderr

---

## Scenario 2: Node.js Monorepo with Workspaces (3+ Packages)

**Description:**
A monorepo with `npm workspaces` or `yarn workspaces`, containing 3–5 packages (core lib, CLI tool, web UI) sharing root-level config.

**Real-world pattern:**
- TypeScript monorepos (lerna, nx, turborepo alternatives)
- Shared build config and dependencies across packages
- Requires symlink traversal and workspace boundary understanding
- Typical team size: 5–10 people across specialized roles

**Why it matters:**
Tests that the REPL understands workspace boundaries, correctly maps agent responsibilities to sub-packages, and doesn't duplicate or miss code when traversing deep symlink trees.

**Expected REPL behavior:**
- Discovers all 3+ packages under `packages/*/`
- Respects `package.json` workspace declarations in root
- Surfaces separate agents for "Core" (platform lib) vs. "CLI" vs. "Web"
- `@web "list routes"` understands TypeScript in `packages/web/src/`
- Incremental `--watch` mode refreshes only changed package

**Edge cases to watch:**
- Symlinks in `node_modules/` pointing to workspace packages
- Missing `package.json` in a workspace subdirectory
- `.npmrc` with workspace-specific registry overrides
- Workspaces with different TypeScript versions or `tsconfig.json`
- Deleted package reference still in root `package.json` workspaces field

**Pass criteria:**
- `list agents` shows 3–5 distinct agents, one per package
- `@core "show module exports"` returns exports from `packages/core/`
- `@cli "what command does --version flag run?"` returns CLI logic
- No symlink loops or infinite traversal
- Incremental refresh shows only changed files

**Fail criteria:**
- Some packages missing from agent list
- Agent context is incorrect (e.g., web agent sees core logic)
- Symlink cycles cause hang or infinite traversal
- REPL crashes on workspace boundary crossing

---

## Scenario 3: Go Project with Modules

**Description:**
A typical Go project with `go.mod`, `go.sum`, and code split across `cmd/` and `internal/` directories.

**Real-world pattern:**
- Go services (gRPC, REST APIs, microservices)
- Modular internal packages
- Build config in `Makefile` or shell scripts
- Typical team size: 2–5 people

**Why it matters:**
Tests that the REPL understands Go's module system, doesn't confuse packages with directories, and correctly surfaces agents for CLI and internal service layers.

**Expected REPL behavior:**
- Parses `go.mod` to identify module name and imports
- Recognizes `cmd/main.go` as the entry point
- Surfaces agents for "CLI" (cmd layer) and "Service" (internal)
- `@service "list internal packages"` returns `internal/*` structure
- Build hints understand Makefile targets (test, build, deploy)

**Edge cases to watch:**
- `go.mod` with `replace` directives (local file overrides)
- Deleted `go.sum` entry (broken import)
- Missing `.go` files but references in module
- `internal/` with nested sub-packages (package hierarchy)
- Build-only code in `tools.go` with `//go:build tools`

**Pass criteria:**
- `list agents` identifies CLI and service layers
- `@service "show internal structure"` returns correct package tree
- `go build` or `make` targets appear in context
- No crashes on symlinks or build files

**Fail criteria:**
- Go module parsing errors
- Agent context doesn't distinguish cmd vs. internal
- REPL ignores Makefile hints
- Crashes on complex module graphs

---

## Scenario 4: Mixed-Language Repository (TypeScript + Python)

**Description:**
A repository with separate `backend/` (Python) and `frontend/` (TypeScript) directories, plus shared `docker-compose.yml` and infrastructure config.

**Real-world pattern:**
- Full-stack web applications (Django + React, FastAPI + Next.js)
- Monorepo with language boundaries
- Docker Compose for local dev environment
- Typical team size: 5–15 people (frontend + backend + DevOps)

**Why it matters:**
Tests that the REPL handles language detection, doesn't confuse Python and TypeScript agents, and correctly surfaces shared infrastructure context (Docker, env files).

**Expected REPL behavior:**
- Discovers `backend/` as Python, `frontend/` as TypeScript automatically
- Surfaces separate "Backend" and "Frontend" agents
- Understands `docker-compose.yml` for service boundaries
- `@backend "show database schema"` returns Python ORM code
- `@frontend "list React components"` returns TypeScript/TSX files
- `@devops` (if exists) understands Docker and environment setup

**Edge cases to watch:**
- Shared Python requirements and TypeScript modules at root (confusing language detection)
- `docker-compose.yml` referencing non-existent services
- `.env.example` vs `.env` vs `.env.prod` (multiple environment files)
- Backend/frontend with conflicting names (e.g., both have `src/` at their root)
- Python packages imported by TypeScript build (unusual but possible)

**Pass criteria:**
- `list agents` shows "Backend", "Frontend", and possibly "DevOps" or "Infra"
- `@backend` context excludes TypeScript files
- `@frontend` context excludes Python files
- Docker service names from `docker-compose.yml` are visible in context
- Cross-language navigation works (e.g., asking about backend API from frontend agent)

**Fail criteria:**
- Language detection is wrong (Python files in frontend agent)
- Agents are duplicated or missing
- Docker Compose parsing crashes
- No distinction between `.env` files

---

## Scenario 5: Deeply Nested Project (10+ Directory Levels)

**Description:**
A project with deep directory nesting (10–15 levels from root to deepest source file), simulating enterprise monorepos or legacy codebases with elaborate package hierarchies.

**Real-world pattern:**
- Enterprise Java/C# projects with deep package names
- Legacy codebases with old directory conventions
- Microservices with deep namespace isolation
- Typical team size: 10–30 people

**Why it matters:**
Tests that the REPL's directory traversal doesn't hit performance cliffs, memory limits, or stack depth issues. Also tests that context remains usable (not 100 levels of indentation).

**Expected REPL behavior:**
- Discovers source files at depth 10+
- Traversal completes in <500ms (hardcoded in speed gates)
- Context summaries don't include full path chains (stops at reasonable depth)
- `list agents` appears instantly despite nested structure
- File suggestions don't create UI lag with very long paths

**Edge cases to watch:**
- Symlinks at multiple nesting levels (circular references)
- Hundreds of empty directories between code
- File paths approaching Windows MAX_PATH limit (260 chars)
- Permission denied at a deep directory (traverse must skip gracefully)
- Deeply nested `node_modules/` or `venv/` not properly excluded

**Pass criteria:**
- REPL startup <500ms
- `list agents` completes without lag
- File discovery includes deep files
- Context summaries remain readable (<80 char lines)
- No crashes on Windows MAX_PATH approach

**Fail criteria:**
- REPL hangs (>5s) during traversal
- Stack overflow or memory exhaustion
- Crashes on symlink cycles
- Context output is truncated or illegible

---

## Scenario 6: Minimal/Empty Repository (Just .git, No Code)

**Description:**
A freshly created repository with `.git/`, `.gitignore`, `README.md`, and nothing else—no code, no .squad/ directory.

**Real-world pattern:**
- Repository template just created
- Greenfield project startup
- CI/CD test fixture
- New hire's first PR (empty repo for training)

**Why it matters:**
Tests graceful degradation when there's no actual code to analyze. REPL should show helpful hints ("no agents found, run `squad init`") rather than crash or hang.

**Expected REPL behavior:**
- REPL launches without error
- `list agents` returns empty with helpful hint: "No agents found. Run `squad init` to get started."
- `doctor` or health check shows "No .squad/ directory; this is a fresh repository."
- `squad init` (if supported) offers to create a starter team.md
- User can manually ask `"what files exist?"` without error

**Edge cases to watch:**
- No `.git/` at all (not a repo)
- `.squad/` directory exists but is empty or unreadable
- `.squad/team.md` exists but is completely empty or malformed
- README.md references agents that don't exist
- Hidden files like `.gitignore` only (no visible code)

**Pass criteria:**
- REPL launches and shows prompt
- `list agents` returns empty gracefully (no crash)
- Help messages guide user to `squad init`
- `status` shows "no agents"
- No stack traces or warnings in stderr

**Fail criteria:**
- REPL hangs waiting for code
- `list agents` crashes or times out
- Confusing error: "Cannot read property of undefined"
- No hint about running `squad init`

---

## Scenario 7: Repository with Many Agents (20+ in Team Roster)

**Description:**
A large team with 20–30 agents defined in `.squad/team.md`, each with full charter and metadata. Tests UI/UX at scale.

**Real-world pattern:**
- Large tech organization (50+ engineering team)
- Multi-functional team (backend, frontend, QA, DevOps, data, etc.)
- Specialized roles and on-call rotations
- Typical team size: 50–100+ people (but 20+ agents in squad)

**Why it matters:**
Tests that the REPL's list/search/filter operations remain snappy even with large rosters. Also tests that agent selection and context don't degrade (e.g., scrolling through 20 agents shouldn't be painful).

**Expected REPL behavior:**
- `list agents` completes in <1s (even with 20 agents)
- Agent names are unique and distinguishable
- Search/filter (`@backend*` or `@data-*`) narrows the list instantly
- Autocomplete suggestions work (not showing 20 results at once)
- Each agent's context loads independently (no blocking on others)
- Detailed agent info (`@alice --profile`) doesn't bloat the display

**Edge cases to watch:**
- Agents with identical or near-identical names
- Very long agent descriptions (100+ chars) overflow display
- Agents with special characters in names (emoji, unicode)
- Duplicate agent IDs in roster (malformed team.md)
- Agents with no charter file (.squad/agents/{name}/charter.md missing)

**Pass criteria:**
- `list agents` shows all 20+ agents, sortable/filterable
- `@alice` context loads in <100ms
- Autocomplete narrows to 3–5 suggestions quickly
- Agent roster is readable in single terminal window (paginated if needed)
- No N² or exponential slowdown with agent count

**Fail criteria:**
- `list agents` takes >1s
- Autocomplete shows all 20 agents at once (unusable)
- Agent context loading serialized (slow)
- UI lag or lag spikes when accessing large rosters
- Duplicate agents crash parser

---

## Scenario 8: Corrupt/Partial .squad/ State (Edge Case)

**Description:**
Repository with a broken or partially initialized `.squad/` directory:
- Missing `## Members` header in team.md
- Agent charter files missing for some agents
- Invalid JSON in `.squad/casting-registry.json`
- Symlinks or permission issues on .squad/ files

**Real-world pattern:**
- Accidental delete/merge conflict in team.md
- Incomplete initialization (init script interrupted)
- File permissions changed by CI/deployment tool
- Stale branch merged with outdated .squad/ state
- Developer manually edited team.md and introduced syntax error

**Why it matters:**
Tests that the REPL fails gracefully and provides actionable remediation hints (not just "Cannot read property '0' of undefined").

**Expected REPL behavior:**
- REPL launches but shows warning: "⚠️ Parsing .squad/team.md failed at line 42: missing ## Members header"
- `list agents` returns partial roster (only successfully parsed agents)
- Missing charter files don't crash agent load: "⚠️ Charter for @alice not found, using defaults"
- `status` shows warnings/errors, not silent failure
- User can still interact with REPL (ask questions, etc.) despite broken state
- `doctor` command shows all problems in one place
- Help text includes: "Run `squad fix` or `squad init --repair` to fix .squad/"

**Edge cases to watch:**
- team.md is completely empty
- team.md exists but is not readable (permission denied)
- team.md is valid YAML but parsing contradicts Squad schema
- Casting registry is not valid JSON
- Agent name in charter path doesn't match roster
- Circular symlinks in .squad/agents/

**Pass criteria:**
- REPL does not crash on startup
- Warnings are clear and actionable
- Partial roster is usable (good agents work despite bad ones)
- `doctor` identifies specific problems
- No misleading generic errors like "something went wrong"

**Fail criteria:**
- Unhandled exception on startup
- Silent failure (no warning about corruption)
- `list agents` crashes instead of showing partial list
- Error messages are opaque ("ReferenceError: x is not defined")
- No path to recovery (user doesn't know what to fix)

---

## Summary Table

| Scenario | Category | Why It Matters | Key Risk |
|----------|----------|----------------|----------|
| 1. Python Flask | Single-language | Fast discovery on minimal projects | Dependency parsing, empty dirs |
| 2. Node Monorepo | Workspace boundaries | Symlink traversal, package isolation | Workspace confusion, broken workspaces |
| 3. Go Project | Module system | Go-specific build semantics | Module graph complexity, replace directives |
| 4. Mixed TS+Py | Language detection | Cross-language navigation, agent separation | Language confusion, environment file sprawl |
| 5. Deep nesting | Performance | Traversal latency and memory under scale | MAX_PATH, symlink loops, stack overflow |
| 6. Minimal repo | Graceful degradation | User guidance when no code/agents exist | Confusing errors, hanging on empty dirs |
| 7. Many agents | Scale | List/search performance, context load isolation | N² slowdown, serialized loading, UI lag |
| 8. Corrupt state | Error recovery | Clear warnings and partial recovery | Unhandled exceptions, opaque errors |

---

## Running Dogfood Tests

### Prerequisites
- Node.js ≥20
- All test fixtures created under `test-fixtures/dogfood/`

### Example: Testing Scenario 2 (Node Monorepo)
```bash
cd test-fixtures/dogfood/node-monorepo
node ../../packages/squad-cli/dist/cli-entry.js

# In REPL:
list agents
@core "show module exports"
@cli "what command does --version run?"
status
exit
```

### Acceptance Criteria
- REPL launches without error
- All fixture-specific commands complete in <3s
- No crashes, hangs, or unhandled exceptions
- Context output is meaningful (not generic or empty)
