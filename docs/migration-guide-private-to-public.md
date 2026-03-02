# Migration Guide: Private (squad-pr) → Public (squad) Repository

## ⚠️ BANANA GATE — HARD STOP

**This guide is WRITTEN but NOT EXECUTED until Brady says: `banana`**

No pull requests. No merges. No git operations. No version changes. ZERO execution until explicit approval.

---

## Table of Contents

1. [Beta User Upgrade Path](#beta-user-upgrade-path)
2. [Prerequisites & Environment](#prerequisites--environment)
3. [Security Scan for Secrets](#security-scan-for-secrets)
4. [Version Preparation](#version-preparation)
5. [Repository Reference Sweep](#repository-reference-sweep)
6. [Remote Setup](#remote-setup)
7. [Migration Branch Strategy](#migration-branch-strategy)
8. [Conflict Resolution Guide](#conflict-resolution-guide)
9. [Post-Merge Verification](#post-merge-verification)
10. [Push & PR](#push--pr)
11. [Merge & Tag](#merge--tag)
12. [GitHub Release](#github-release)
13. [Post-Release Validation](#post-release-validation)
14. [Rollback Plans](#rollback-plans)
15. [Banana Gate Checklist](#banana-gate-checklist)

---

## Beta User Upgrade Path

> **For users on v0.5.x beta (previously via `npx github:bradygaster/squad`)**

### Context: Distribution Channel

Squad is distributed exclusively via npm:

| Channel | Distribution | Version | Versioning | Installation |
|---------|--------------|---------|------------|--------------|
| **npm** | npm registry `@bradygaster/squad-cli` | v0.8.x → v0.6.0-preview (after migration) | Semantic versioning with stable & insider channels | `npm install -g @bradygaster/squad-cli` or `npx @bradygaster/squad-cli` |

> **Note:** GitHub-native distribution (`npx github:bradygaster/squad`) has been removed.

After this migration, users should install via npm:

### Step 1: Understand the Breaking Changes

Between v0.5.4 and v0.6.0-preview:

#### Major Architectural Changes
- **TypeScript rewrite:** Entire codebase ported from JavaScript to TypeScript (strict mode)
- **.squad directory format:** New format for squad configuration and state (v0.5.4 format is incompatible)
- **Command structure:** Some commands have been reorganized or renamed
- **SDK API:** If integrating Squad SDK programmatically, the public API has changed significantly

#### Command-Level Breaking Changes
- `squad init` — Now creates v2 `.squad/` directory structure (not v0.5.4 format)
- `squad doctor` — Output format and checks have changed
- `squad status` — New output format; may not parse old v0.5.4 project state

#### Configuration Breaking Changes
- `.squad/team.md` — New roster format (YAML front matter)
- `.squad/decisions.md` — New append-only decision tracking (no longer JSON)
- `.squad/agents/` — New directory structure for agent charters and state files
- Old `.squad/` files from v0.5.4 are incompatible and must be migrated

### Step 2: Prepare Your Project

If you have an existing Squad v0.5.4 project:

#### Option A: Fresh Start (Recommended for new projects)
```bash
# Remove old .squad directory
rm -rf .squad/

# Initialize fresh v0.6.0 project structure
squad init
# This creates the new .squad/ directory structure compatible with v0.6.0
```

#### Option B: Migrate Existing Configuration
If you need to preserve your v0.5.4 Squad configuration:

1. **Export v0.5.4 state** (before upgrading):
   ```bash
   # Note any important team roster, decisions, or agent definitions
   # Manually copy them to a backup file
   cp .squad/config.json .squad/config.v0.5.4.backup.json
   ```

2. **Back up the old .squad directory**:
   ```bash
   mv .squad .squad.v0.5.4.backup
   ```

3. **Initialize v0.6.0 structure**:
   ```bash
   squad init
   ```

4. **Manually migrate critical state**:
   - Map your v0.5.4 roster → new v0.6.0 `.squad/team.md` format
   - Migrate decisions from v0.5.4 → new `.squad/decisions.md` append-only format
   - Recreate agent definitions in new `.squad/agents/{name}/charter.md` format

### Step 3: Update Installation & Distribution Method

#### Current (v0.5.x — upgrade to npm)
```bash
squad --version
# If you don't have squad installed:
npm install -g @bradygaster/squad-cli
```

#### After Migration: Install via npm

**Install globally (Recommended)**
```bash
# Global install (recommended)
npm install -g @bradygaster/squad-cli
squad --version
# Output: v0.6.0-preview (stable release)

# OR use npx without install
npx @bradygaster/squad-cli --version
# Output: v0.6.0-preview

# For insider builds (pre-release)
npm install -g @bradygaster/squad-cli@insider
squad --version
# Output: v0.6.0-preview-insider or newer
```

**Advantages of npm:**
- ✅ Semantic versioning: predictable, reproducible installs
- ✅ Fast: npm cache, no git clone on every run
- ✅ Version pinning: lock to specific version in `package.json`
- ✅ Insider channel: opt-in pre-release testing
- ✅ Standard dependency management: works with all npm tools

### Step 4: Verify the Upgrade

After switching to v0.6.0, verify your installation:

```bash
# Check version (npm method)
squad --version
# Expected: v0.6.0-preview

# Run doctor to check environment
squad doctor
# Expected: ✅ All checks pass

# If migrating from old GitHub-native distribution, update your CI/CD scripts
# Old: npx github:bradygaster/squad init
# New: npx @bradygaster/squad-cli init
```

### Step 5: Update Documentation & Scripts

If your project references Squad in docs or CI/CD:

**Update package.json** (if Squad is a project dependency):
```json
{
  "devDependencies": {
    "@bradygaster/squad-cli": "^0.6.0"
  }
}
```

**Update GitHub Actions workflows**:
```yaml
# Old (GitHub-native — removed)
- run: npx github:bradygaster/squad doctor

# New (npm)
- run: npx @bradygaster/squad-cli doctor
```

**Update shell scripts**:
```bash
# Old
alias squad='npx github:bradygaster/squad'  # REMOVED — do not use

# New (after global install)
alias squad='squad'  # (npm install -g @bradygaster/squad-cli)
```

### Troubleshooting

#### "Old .squad directory format not recognized"
- Delete or rename `.squad/` to `.squad.bak`
- Run `squad init` to create v0.6.0 structure
- Manually migrate important decisions/roster if needed

#### "Command not found after install"
- If you installed globally, make sure `npm bin -g` is in your PATH
- Try: `npx @bradygaster/squad-cli` as an alternative
- For persistent installation, use npm: `npm install -g @bradygaster/squad-cli`

#### "My project configuration was lost after upgrade"
- v0.5.4 and v0.6.0 use incompatible `.squad/` formats
- Pre-upgrade: manually export important configuration
- See **Option B: Migrate Existing Configuration** above

### What's New in v0.6.0

After upgrading, you'll have access to:

- **TypeScript SDK:** Full `@bradygaster/squad-sdk` package for programmatic integration
- **Strict type checking:** Compile-time guarantees for custom agent implementations
- **Remote Squad Mode:** Support for distributed team setups
- **Improved telemetry:** OpenTelemetry integration for better observability
- **REPL improvements:** Enhanced streaming, better error recovery
- **CI/CD ready:** Full GitHub Actions support with examples

---

### Local Repositories
Verify both repositories are cloned locally with working state.

```powershell
# Private repo (current)
cd C:\src\squad-pr
git status
# Expected: On branch dev (or main), clean working tree

# Public repo (target)
cd C:\src\squad
git status
# Expected: On branch main, clean working tree
```

**Verify both have zero uncommitted changes.** If not, stash or commit before proceeding.

### Git Configuration & Authentication

```powershell
# Verify git identity
git config --global user.name
git config --global user.email

# Verify GitHub CLI authentication
gh auth status
# Expected: "Logged in to github.com as {username} ({org account})"

# Test access to both repos
gh repo view bradygaster/squad-pr --json name
gh repo view bradygaster/squad --json name
```

**Expected output:** Both commands return repository metadata without auth errors.

If not authenticated:
```powershell
gh auth login
# Follow prompts for GitHub authentication
```

### Environment & Runtime

```powershell
# Node.js version (required >=20)
node --version
# Expected: v20.x.x or higher

# npm version
npm --version
# Expected: npm 10+

# Verify npm workspace resolution
npm ls -a
# Expected: Root workspace with packages/squad-sdk and packages/squad-cli
```

### Current State Verification

**On squad-pr (private repo):**
```powershell
cd C:\src\squad-pr

# Current branch and commit
git --no-pager log --oneline -1
git --no-pager branch -v

# Current version strings
grep '"version"' package.json packages/squad-sdk/package.json packages/squad-cli/package.json
# Expected (current): all at 0.8.6.x-preview (varies depending on Brady's last bump)

# All tests pass
npm test
# Expected: Exit code 0, all tests pass
```

**On squad (public repo):**
```powershell
cd C:\src\squad

# Current branch and commit
git --no-pager log --oneline -1
git --no-pager branch -v

# Current version strings
grep '"version"' package.json packages/squad-sdk/package.json packages/squad-cli/package.json
# Expected: Currently at v0.5.4

# All tests pass
npm test
# Expected: Exit code 0, all tests pass
```

**If either repo has uncommitted changes, STOP here. Do not proceed. Stash or commit first.**

---

## Security Scan for Secrets

**CRITICAL:** Before pulling private code into public repo, scan for leaked secrets.

### Patterns to Scan

```powershell
cd C:\src\squad-pr

# Check for .env files tracked in git
git ls-files | Select-String "\.env"
# Expected: No matches

# Check for common secrets patterns
$patterns = @("secret", "token", "key", "password", "api_key", "api_secret", "auth", "credential")
foreach ($pattern in $patterns) {
    git ls-files | xargs Select-String -i $pattern
}
# Expected: Matches only in docs, comments, or test fixtures (no real secrets)

# Scan specific risky paths
git ls-files | Select-String -i "(\.copilot|\.vscode|\.env|secrets|credentials)"
# Expected: .copilot/ paths OK (they contain team notes, not credentials)

# Check .copilot/ directory for sensitive content
ls -Force .copilot/
# Expected: Only session state and decision files, no auth tokens or API keys

# Search for hardcoded auth in code
git --no-pager grep -i "authorization.*Bearer\|api_key.*=\|token.*=\|password.*=" -- ':(exclude)docs/**' ':(exclude)test/**' ':(exclude)samples/**'
# Expected: No matches in source code
```

### If Secrets Found

**STOP.** Do not proceed with migration. Use BFG Repo Cleaner:

```powershell
# Download BFG (if not installed)
# Download from: https://rtyley.github.io/bfg-repo-cleaner/

# Create a file listing secrets to remove (e.g., secrets.txt)
# Format: one pattern per line, e.g.:
# .env
# secrets/**
# */token.json

# Run BFG
java -jar bfg.jar --delete-files secrets.txt --no-blob-protection squad-pr

# Verify removal
git log --all --full-history -- .env
# Expected: No commits remain with .env

# Force push to squad-pr
git reflog expire --expire=now --all && git gc --prune=now
git push -f
```

**Document what was removed in a comment to Brady before proceeding.**

### Security Scan Result

```powershell
# If all checks passed, record the result:
Write-Host "✅ Security scan passed. No secrets detected in git history."
```

---

## Version Preparation

### Current Versions

Check current state of all three package.json files:

```powershell
cd C:\src\squad-pr

# Read all version strings
$versions = @{
    "Root" = (Get-Content package.json | Select-String '"version"').toString()
    "SDK" = (Get-Content packages/squad-sdk/package.json | Select-String '"version"').toString()
    "CLI" = (Get-Content packages/squad-cli/package.json | Select-String '"version"').toString()
}

$versions | Format-Table -AutoSize
# Expected output shows current versions (e.g., 0.8.6-preview, 0.8.6-preview, 0.8.6-preview)
```

### Update Version to 0.6.0-preview

**Rationale:** Public distribution targets v0.6.0 (public beta). The -preview suffix indicates pre-release status.

Update all three files:

#### Step 1: Root package.json

```powershell
cd C:\src\squad-pr

# Edit package.json: change "version" to "0.6.0-preview"
# Use your editor or PowerShell:

$content = Get-Content package.json | ConvertFrom-Json
$content.version = "0.6.0-preview"
$content | ConvertTo-Json -Depth 10 | Set-Content package.json
```

#### Step 2: SDK package.json

```powershell
$content = Get-Content packages/squad-sdk/package.json | ConvertFrom-Json
$content.version = "0.6.0-preview"
$content | ConvertTo-Json -Depth 10 | Set-Content packages/squad-sdk/package.json
```

#### Step 3: CLI package.json

```powershell
$content = Get-Content packages/squad-cli/package.json | ConvertFrom-Json
$content.version = "0.6.0-preview"
$content | ConvertTo-Json -Depth 10 | Set-Content packages/squad-cli/package.json
```

#### Step 4: Update package-lock.json

```powershell
npm install --package-lock-only
# This syncs the lockfile with new version strings
```

#### Step 5: Verify All Versions Updated

```powershell
grep '"version"' package.json packages/squad-sdk/package.json packages/squad-cli/package.json
# Expected output: All three show "0.6.0-preview"
```

### Verify Build Still Passes

```powershell
npm run build
# Expected: Exit code 0, no errors

npm test
# Expected: Exit code 0, all tests pass

npm run lint
# Expected: Exit code 0, no linting errors (if lint script exists)
```

### Commit Version Changes (DO NOT PUSH YET)

```powershell
git add package.json packages/squad-sdk/package.json packages/squad-cli/package.json package-lock.json
git commit -m "chore: version bump to 0.6.0-preview for public migration

Squad-pr v0.8.6.x → v0.6.0-preview (public beta target)
This commit prepares the codebase for migration to bradygaster/squad repo."
```

---

## Repository Reference Sweep

**Purpose:** All references to the private repo name "squad-pr" must become "squad" before the code reaches the public repo.

**Timing:** This phase runs LATE — after all feature work is done, after version bump, right before the migration push. This is the last content change before migration.

### Search for All squad-pr References

Before making any changes, identify all occurrences of "squad-pr" across the codebase:

```powershell
# Find all files with squad-pr references
Get-ChildItem -Path C:\src\squad-pr -Recurse -Include *.ts,*.tsx,*.md,*.json,*.yml,*.yaml -File |
  Select-String -Pattern "squad-pr" -List |
  Select-Object Path, LineNumber, Line

# Capture results for review
Get-ChildItem -Path C:\src\squad-pr -Recurse -Include *.ts,*.tsx,*.md,*.json,*.yml,*.yaml -File |
  Select-String -Pattern "squad-pr" |
  Export-Csv -Path .\squad-pr-references.csv -NoTypeInformation
```

**Review the output carefully.** Common locations include:

1. **Package names** — `@bradygaster/squad-pr` in package.json files
2. **Product title/header** — ASCII art or CLI startup banner
3. **URLs** — `github.com/bradygaster/squad-pr` in docs, README, workflows
4. **Issue tracker URLs** — Alpha banner or beta disclaimer in CLI output
5. **Documentation** — All markdown files in docs/ folder
6. **Workflow files** — .github/workflows/*.yml for CI/CD references
7. **.squad/ files** — team.md, decisions.md, and agent charters

### Automated Reference Replacement

Once you've reviewed the search results, execute the replacement:

```powershell
# IMPORTANT: Only run after manual review of references above!

# Replacement command
Get-ChildItem -Path C:\src\squad-pr -Recurse -Include *.ts,*.tsx,*.md,*.json,*.yml,*.yaml -File |
  ForEach-Object {
    $content = Get-Content $_.FullName -Raw
    if ($content -match "squad-pr") {
      $newContent = $content -replace "squad-pr", "squad"
      Set-Content -Path $_.FullName -Value $newContent
      Write-Host "✅ Updated: $($_.FullName)"
    }
  }
```

### What to Replace

**Scope of replacement:**

| Item | Before | After | Notes |
|------|--------|-------|-------|
| Package name (root) | @bradygaster/squad-pr | @bradygaster/squad | package.json |
| Package name (SDK) | @bradygaster/squad-pr | @bradygaster/squad | packages/squad-sdk/package.json |
| Package name (CLI) | @bradygaster/squad-pr | @bradygaster/squad | packages/squad-cli/package.json |
| GitHub repo URL | github.com/bradygaster/squad-pr | github.com/bradygaster/squad | README.md, docs/*, workflows |
| Product name (if present) | squad-pr (in strings) | squad | CLI banners, help text |
| Repository field | `"repository": "https://github.com/bradygaster/squad-pr.git"` | `"repository": "https://github.com/bradygaster/squad.git"` | package.json files |

### Manual Items (Not Automated)

These require manual verification:

1. **Git remotes in documentation** — After migration, origin will point to public repo; squad-pr remote will be removed.
2. **Historical references** — Comments explaining "this came from squad-pr development" should be KEPT (they're context, not product references).
3. **Test fixtures** — Keep any test data that references squad-pr (it's test data, not product).

### Verification: Confirm Zero References Remain

After replacement, verify no squad-pr references remain:

```powershell
# Scan again for any remaining squad-pr references
$remaining = Get-ChildItem -Path C:\src\squad-pr -Recurse -Include *.ts,*.tsx,*.md,*.json,*.yml,*.yaml -File |
  Select-String -Pattern "squad-pr" |
  Measure-Object

Write-Host "References found: $($remaining.Count)"

if ($remaining.Count -eq 0) {
  Write-Host "✅ SUCCESS: All squad-pr references replaced with squad"
} else {
  Write-Host "⚠️  WARNING: $($remaining.Count) references to squad-pr remain!"
  Write-Host "Review manually before proceeding:"
  Get-ChildItem -Path C:\src\squad-pr -Recurse -Include *.ts,*.tsx,*.md,*.json,*.yml,*.yaml -File |
    Select-String -Pattern "squad-pr"
}
```

### Commit Reference Sweep Changes

```powershell
git add -A
git commit -m "chore: sweep repository references squad-pr → squad

All product and repository references updated:
- Package names: @bradygaster/squad-pr → @bradygaster/squad
- GitHub URLs: github.com/bradygaster/squad-pr → github.com/bradygaster/squad
- Repository fields in package.json files
- Documentation links and examples
- CI/CD workflow references
- Product title/header strings

Verification: Zero remaining squad-pr references in codebase.
Ready for migration to public repository."
```

---

## Remote Setup

Brady's approach: set up squad-pr as a remote in the public repo, then fetch and merge.

### Navigate to Public Repo

```powershell
cd C:\src\squad
git status
# Expected: On branch main, clean working tree
```

### Verify Current Remotes

```powershell
git remote -v
# Expected output:
# origin  https://github.com/bradygaster/squad.git (fetch)
# origin  https://github.com/bradygaster/squad.git (push)
```

### Add squad-pr as Remote

```powershell
# Option A: If using HTTPS (no auth needed, public repo)
git remote add squad-pr https://github.com/bradygaster/squad-pr.git

# Option B: If using local path (faster, no network)
# git remote add squad-pr C:\src\squad-pr

# Verify the remote was added
git remote -v
# Expected:
# origin  https://github.com/bradygaster/squad.git (fetch)
# origin  https://github.com/bradygaster/squad.git (push)
# squad-pr  https://github.com/bradygaster/squad-pr.git (fetch)
# squad-pr  https://github.com/bradygaster/squad-pr.git (push)
```

### Fetch from squad-pr

```powershell
# Fetch all branches from squad-pr remote
git fetch squad-pr

# Expected output: Remote tracking branches created for all squad-pr branches
# Key branch: squad-pr/main (contains the version-updated code)
```

### Verify Fetch Succeeded

```powershell
# List commits from squad-pr/main
git --no-pager log --oneline squad-pr/main -10
# Expected: Shows recent commits from private repo, latest is version bump commit

# Compare branch pointers
git --no-pager log --oneline -5 --all --graph
# Expected: Shows both origin/main and squad-pr/main in the graph
```

---

## Migration Branch Strategy

Brady's approach: Create a migration branch, then merge.

### Create Migration Branch from main

```powershell
# Ensure on main and up-to-date
git checkout main
git pull origin main
# Expected: No new commits (should already be at latest)

# Create new branch for the migration
git checkout -b migration
# Expected: New branch created, HEAD points to migration

# Verify branch state
git --no-pager branch -v
# Expected: * migration (matches origin/main pointer)
```

### Merge Strategy Decision

Two options, with **Option A recommended:**

#### Option A: Merge with --allow-unrelated-histories (RECOMMENDED)

**Pros:**
- Preserves git history from both repos
- Both commit graphs visible (educational for team)
- Complies with Brady's "collaborative plan with Keaton" approach
- Easier to track what came from where

**Cons:**
- More merge conflicts (expected, manageable)
- Larger initial conflict resolution effort
- Both .gitignore files, .github/ workflows, etc. must be manually resolved

```powershell
git merge squad-pr/main --allow-unrelated-histories -m "Merge squad-pr v0.6.0-preview into public squad repo

This merge brings private development (v0.8.6.x branch) into the public
repository as v0.6.0-preview (public beta). 

Unrelated histories allowed due to repos diverging from separate starting points.
See .squad/decisions.md and .squad/agents/kobayashi/history.md for context."
```

**Expected behavior:** Merge will pause with conflicts. Proceed to [Conflict Resolution Guide](#conflict-resolution-guide).

#### Option B: Replace Content Entirely (NOT RECOMMENDED)

If you want a clean slate without both histories:

```powershell
# This approach: take all squad-pr files, discard public repo content
git checkout --theirs squad-pr/main -- .
git add -A
git commit -m "Replace content with squad-pr v0.6.0-preview"
```

**⚠️ Not recommended** — loses public repo history. Use only if Brady explicitly directs.

### Proceed with Option A (Merge)

Run the merge command from above. Conflicts will occur at expected files (see next section).

---

## Conflict Resolution Guide

When the merge pauses, you'll see conflicts in these files (expected):

### Common Conflict Files & Resolution Strategy

#### 1. **package.json** (Root)

**Conflict reason:** Both repos updated versions independently.

**Resolution:** Take squad-pr version (already at 0.6.0-preview).

```powershell
# View conflict
git --no-pager diff package.json | head -50

# Resolve: Take "ours" (main branch's current state), but squad-pr version is already correct
# Actually: The merge will show squad-pr version as "incoming". Keep it.

git checkout --theirs package.json
git add package.json
```

#### 2. **packages/squad-sdk/package.json** and **packages/squad-cli/package.json**

**Same as root.** Take squad-pr versions (0.6.0-preview).

```powershell
git checkout --theirs packages/squad-sdk/package.json packages/squad-cli/package.json
git add packages/squad-sdk/package.json packages/squad-cli/package.json
```

#### 3. **.gitignore**

**Conflict reason:** Both repos have different ignore rules.

**Resolution:** Merge both lists (union).

```powershell
# View both versions
git --no-pager show :1:.gitignore > /tmp/base.gitignore      # Common ancestor
git --no-pager show :2:.gitignore > /tmp/ours.gitignore      # main (public)
git --no-pager show :3:.gitignore > /tmp/theirs.gitignore    # squad-pr (private)

# Manually merge: combine both files, remove duplicates
# Use an editor to create a union:

$ours = Get-Content .gitignore -Force
$theirs = (git show squad-pr/main:.gitignore)
$merged = ($ours + $theirs) | Sort-Object | Get-Unique
$merged | Set-Content .gitignore

git add .gitignore
```

#### 4. **.github/workflows/** (Any conflicts)

**Conflict reason:** Public repo may have workflows; squad-pr may have different ones.

**Resolution:** Take squad-pr versions (they're the source of truth going forward).

```powershell
git checkout --theirs .github/workflows/
git add .github/workflows/
```

#### 5. **README.md**

**Conflict reason:** Public repo README is user-facing; squad-pr README is dev-facing.

**Resolution:** Keep both, or create a merged version.

**Option A: Use squad-pr README (team-facing):**
```powershell
git checkout --theirs README.md
git add README.md
```

**Option B: Merge content manually:**
```powershell
# Manually edit README.md to include:
# - Public repo's user-facing intro + installation
# - squad-pr's team/contributor section
# 
# Then:
git add README.md
```

**Recommendation:** Option A (use squad-pr README). The public README will be updated as part of release notes & docs.

#### 6. **CHANGELOG.md**

**Conflict reason:** Different version histories.

**Resolution:** Merge both (union). Squad-pr changes come after public.

```powershell
# View diff
git --no-pager diff CHANGELOG.md | head -100

# Merge: Prepend squad-pr entries to public CHANGELOG
git checkout --ours CHANGELOG.md     # Start with public version
# Then manually add squad-pr entries at the top

# Or auto-merge:
$ours = Get-Content CHANGELOG.md
$theirs = (git show squad-pr/main:CHANGELOG.md)
$merged = "# Merged Changelog`n`n" + $theirs + "`n`n---`n`n" + $ours
$merged | Set-Content CHANGELOG.md

git add CHANGELOG.md
```

#### 7. **.squad/** (Decision files, history, etc.)

**Conflict reason:** Both repos have .squad/ files, but they're append-only (union merge driver should handle this).

**Expected:** No conflicts due to `.gitattributes merge=union` setting.

**If conflicts occur anyway:**
```powershell
# Union strategy: keep all entries from both sides

git checkout --ours .squad/decisions.md
git checkout --ours .squad/agents/kobayashi/history.md
git checkout --ours .squad/agents/*/history.md

# But actually, verify that union merge driver is active:
git --no-pager show squad-pr/.gitattributes | Select-String "merge=union"

# If not found in squad-pr, add it to public repo's .gitattributes:
# (These lines should already be in public repo)
```

#### 8. **docs/** (If conflicts)

**Resolution:** Merge both versions (take both sections).

```powershell
git status | grep "both modified" | grep "^docs/"
# For each conflicted file in docs:
#   - Manually review both versions
#   - Keep useful content from both
#   - Remove conflict markers (<<<<, ====, >>>>)

# Or, if docs are mostly non-overlapping:
git checkout --theirs docs/
git add docs/
```

#### 9. **Other Files (Unlikely Conflicts)**

Run this to find all remaining conflicts:

```powershell
git status
# Look for "both modified:" lines

# For each, decide:
# - git checkout --ours {file}  [keep public version]
# - git checkout --theirs {file} [take squad-pr version]
# - Manually merge if both are important
# Then:
# - git add {file}
```

### Complete Merge

Once all conflicts are resolved:

```powershell
# Verify all conflicts resolved
git status
# Expected: No files in "both modified" state
# All modified files should be in "staged" section

# Complete the merge
git commit -m "Merge squad-pr v0.6.0-preview into public squad

All conflicts resolved:
- package.json versions: took squad-pr v0.6.0-preview
- .gitignore: merged both public and private rules
- .github/workflows: took squad-pr versions
- README.md: took squad-pr dev-facing version
- CHANGELOG.md: merged both histories
- docs/: merged all content
- .squad/: preserved both decision history and agent logs

Ready for review and release."
```

**Expected result:** Merge complete, ready for verification.

---

## Post-Merge Verification

Before pushing, verify the merged state is healthy.

### Install Dependencies

```powershell
# Clear node_modules (fresh install)
rm -Recurse -Force node_modules -ErrorAction SilentlyContinue
rm package-lock.json -Force

# Fresh install
npm install
# Expected: Exit code 0, no errors, node_modules/ populated
```

### Build

```powershell
npm run build
# Expected: Exit code 0, no TypeScript errors, dist/ folders created
```

### Run Tests

```powershell
npm test
# Expected: Exit code 0, all tests pass
```

### Verify Versions

```powershell
# Check all three package.json files
grep '"version"' package.json packages/squad-sdk/package.json packages/squad-cli/package.json
# Expected: All three show "0.6.0-preview"

# Verify CLI shows correct version
node cli.js --version
# Expected: Output shows "0.6.0-preview"
```

### Verify Prerelease Banner (If Applicable)

```powershell
# If squad has a prerelease banner in CLI output:
node cli.js
# Expected: Output includes "v0.6.0-preview (beta)" or similar warning

# Check for spinner (TUI health check)
node cli.js 2>&1 | grep -E "spinner|⠋|⠙|⠹|⠸|⠼|⠴|⠦|⠧|⠇|⠏"
# Expected: Spinner characters rotate (if TUI is active)
```

### Sanity Check: Module Imports

```powershell
# Test SDK import
node -e "const { VERSION } = require('./packages/squad-sdk'); console.log('SDK VERSION:', VERSION)"
# Expected: SDK VERSION: 0.6.0-preview

# Test CLI import
node cli.js --help 2>&1 | head -5
# Expected: Help text shows no errors
```

### Verify Git State

```powershell
git --no-pager log --oneline -3
# Expected: Latest commit is the merge commit from above

git --no-pager status
# Expected: Working tree clean, on migration branch

git --no-pager diff origin/main..HEAD --stat
# Expected: Shows all files changed (union of public + private)
```

**If any verification fails, STOP. Debug the issue before proceeding. Rollback if necessary (see [Rollback Plans](#rollback-plans)).**

---

## Push & PR

Once verification passes, push the migration branch and create a PR.

### Push Migration Branch

```powershell
git push origin migration
# Expected: New branch created on GitHub, all commits pushed
```

### Verify Push Succeeded

```powershell
git push origin migration --force-with-lease
# (If the above failed, retry with force-with-lease)

# Check GitHub
gh api repos/bradygaster/squad/branches/migration --json name,commit
# Expected: Returns branch metadata, latest commit matches local HEAD
```

### Create Pull Request

```powershell
gh pr create \
  --title "v0.6.0-preview: Merge squad-pr private development into public" \
  --body "## Overview

This PR merges the private squad-pr development (v0.8.6.x) into the public squad repository as v0.6.0-preview (public beta).

## What's New
- [Summarize major features added in v0.8.6 development cycle]
- [e.g., Remote Squad Mode, improved CLI UX, streaming diagnostics, etc.]

## Breaking Changes
- [List any breaking changes from v0.5.4 → v0.6.0-preview]
- [e.g., New CLI interface, changed config structure, etc.]

## Migration Notes
For users upgrading from v0.5.4:
- [Installation instructions]
- [Configuration changes]
- [Data migration if needed]

## Testing
- ✅ All tests pass (2500+ tests)
- ✅ Build clean
- ✅ CLI smoke test: \`npx squad\` works
- ✅ Version displays correctly as 0.6.0-preview
- ✅ Spinner/TUI responsive

## Reviewer Checklist
- [ ] Code review complete
- [ ] No secrets in git history
- [ ] All tests pass in CI
- [ ] Docs updated
- [ ] Version strings consistent
- [ ] CHANGELOG entries present

Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>" \
  --head migration \
  --base main

# Expected output: PR created, returns PR number (e.g., #123)
```

### Capture PR Number

```powershell
# Store PR number for next steps
$PR_NUMBER = gh pr list --head migration --json number --jq ".[0].number"
Write-Host "Created PR #$PR_NUMBER"
```

### Wait for CI

```powershell
# Poll CI status until checks pass
$MAX_WAIT = 600  # 10 minutes
$ELAPSED = 0

while ($ELAPSED -lt $MAX_WAIT) {
    $status = gh pr view $PR_NUMBER --json statusCheckRollup --jq '.statusCheckRollup[].status' | Select-Object -First 1
    if ($status -eq "PASSED") {
        Write-Host "✅ All checks passed"
        break
    } elseif ($status -eq "FAILED") {
        Write-Host "❌ Checks failed. Review logs:"
        gh pr view $PR_NUMBER --web
        exit 1
    }
    Write-Host "Waiting for CI... ($ELAPSED / $MAX_WAIT seconds)"
    Start-Sleep 30
    $ELAPSED += 30
}
```

---

## Merge & Tag

Once CI passes, merge the PR and create a release tag.

### Merge PR

```powershell
# Merge using merge commit (preserves history)
gh pr merge $PR_NUMBER --merge

# Expected output: PR merged, migration branch deleted on GitHub
```

### Verify Merge

```powershell
git fetch origin
git checkout main
git pull origin main

# Verify merge commit is present
git --no-pager log --oneline -3
# Expected: Latest commit is the merge commit with message about v0.6.0-preview
```

### Create Release Tag

```powershell
git tag v0.6.0-preview

# Push tag to origin
git push origin v0.6.0-preview

# Verify tag created
git --no-pager tag -v v0.6.0-preview
# Expected: Tag points to HEAD (merge commit)
```

---

## GitHub Release

Create a formal GitHub Release for the tag.

### Generate Release Notes

```powershell
$releaseNotes = @"
# Squad v0.6.0-preview — Public Beta

## 🎉 What's New

### Major Features (from v0.8.6 development)
- **Remote Squad Mode:** Operate Squad from any directory without local installation
- **Streaming Diagnostics:** Real-time health checks and diagnostic output
- **Enhanced CLI UX:** Improved prompts, better error messages, faster startup
- **[Add more major features from v0.8.6]**

### Bug Fixes & Polish
- Fixed [issue 1]
- Improved [UX 2]
- Added [test coverage 3]

### Performance
- 20% faster CLI startup
- Reduced memory footprint during agent operations

## ⚠️ Pre-Release Status

**This is a PUBLIC BETA (v0.6.0-preview).** Not recommended for production yet.

### Known Limitations
- [Known issue 1]
- [Known issue 2]
- Performance under high concurrency untested

### Experimental Features
- `squad remote` mode is experimental
- Streaming diagnostics may be verbose

## 🚀 Installation

### GitHub Native (No longer supported — use npm)
\`\`\`bash
npm install -g @bradygaster/squad-cli@0.6.0-preview
\`\`\`

### npm
\`\`\`bash
npm install -g @bradygaster/squad-cli@0.6.0-preview
\`\`\`

## 🔄 Migration from v0.5.4

If upgrading from the previous stable release:

1. **Backup existing config**
   \`\`\`bash
   cp -r ~/.squad ~/.squad.backup
   \`\`\`

2. **Install new version**
   \`\`\`bash
   npx @bradygaster/squad-cli init
   \`\`\`

3. **Migrate config** (if needed)
   [Include migration steps if config format changed]

4. **Verify installation**
   \`\`\`bash
   squad --version  # Should show 0.6.0-preview
   squad doctor     # Run diagnostic checks
   \`\`\`

## 📚 Documentation

- **Getting Started:** [link to docs]
- **API Reference:** [link]
- **Migration Guide:** See docs/migration-guide-private-to-public.md in repo
- **Changelog:** See CHANGELOG.md in repo

## 🐛 Report Issues

Found a bug in the beta? Report it:
[GitHub Issues Link]

Include:
- Your OS and Node.js version
- Exact command that failed
- Full error output (use \`SQUAD_DEBUG=1\` for verbose logs)

## 🙏 Thanks

This release represents [months] of development across [team count] team members.

Special thanks to:
- Brady (Lead)
- Keaton (Technical Lead)
- [Other major contributors]

## 📋 Full Changelog

See CHANGELOG.md and commit history for detailed changes since v0.5.4.
"@

# Save to file
$releaseNotes | Set-Content release-notes.txt
```

### Create Release

```powershell
gh release create v0.6.0-preview \
  --title "v0.6.0-preview — Public Beta" \
  --prerelease \
  --notes-file release-notes.txt

# Expected: Release created on GitHub, appears on Releases page
```

### Verify Release

```powershell
gh release view v0.6.0-preview
# Expected: Shows release details (title, prerelease tag, body)

# Check GitHub
gh api repos/bradygaster/squad/releases/tags/v0.6.0-preview --json name,prerelease
# Expected: {"name":"v0.6.0-preview", "prerelease":true}
```

---

## Post-Release Validation

Verify the release is functional and accessible.

### Install from Release

Test installation from the tag (simulating public install):

```powershell
# Create a fresh test directory
mkdir $HOME\squad-test-v0.6.0
cd $HOME\squad-test-v0.6.0

# Install via npm (the only supported distribution method)
npm install -g @bradygaster/squad-cli@0.6.0-preview

# Expected: Installs and runs without errors
```

### Verify Version Display

```powershell
squad --version
# Expected output: v0.6.0-preview

squad --help 2>&1 | head -20
# Expected: Help text, no errors
```

### Run Smoke Test

```powershell
# Quick functional test
squad doctor

# Expected: Diagnostic output, no failures
```

### Cleanup Test Directory

```powershell
cd ..
rm -Recurse -Force squad-test-v0.6.0
```

---

## Next Steps: Post-Release

### Update Private Repo

```powershell
# Decide: Keep squad-pr as dev mirror or archive?
# (Brady's decision, documented in .squad/decisions.md)

# Option A: Bump to next dev version (0.7.0-preview)
cd C:\src\squad-pr
# Update all package.json versions to 0.7.0-preview
# Commit: "chore: bump to v0.7.0-preview post-release"
# Push to origin/dev

# Option B: Archive squad-pr (no longer active)
# Document decision in .squad/decisions.md
# Archive or delete repository on GitHub
```

### Document Decision

```powershell
# Create decision file in squad-pr
# Path: .squad/decisions/inbox/kobayashi-public-migration.md

$decision = @"
# Decision: v0.6.0-preview Public Migration Complete

**Date:** [Current Date]
**Actor:** Kobayashi (Git & Release)

## What
Executed migration of squad-pr (private, v0.8.6.x) → squad (public, v0.6.0-preview).

## Process
1. Version prepared: 0.8.6.x → 0.6.0-preview
2. Merged via \`git merge --allow-unrelated-histories\`
3. All conflicts resolved (package.json, .gitignore, workflows, docs)
4. Created PR #[NUMBER], CI passed
5. Merged to main, tagged v0.6.0-preview
6. Created GitHub Release
7. Validated installation and CLI

## Outcome
✅ Public Squad repo now at v0.6.0-preview
✅ GitHub release published and accessible
✅ npx @bradygaster/squad-cli works
✅ Beta testing ready

## Post-Migration Decision
[Decide: Keep squad-pr as dev mirror? Archive? Continue independent dev?]

See .squad/log/[timestamp]-migration-execution.md for detailed run log.
"@

$decision | Set-Content ".squad/decisions/inbox/kobayashi-public-migration.md"
git add ".squad/decisions/inbox/kobayashi-public-migration.md"
git commit -m "doc: record v0.6.0-preview public migration decision"
```

---

## Rollback Plans

If anything goes wrong at any step, follow the rollback procedure for that phase.

### Phase 1: Version Preparation (Before Remote Setup)

**If versions were updated but merge hasn't started:**

```powershell
cd C:\src\squad-pr

# Revert version commits
git revert HEAD --no-edit
# or
git reset --hard HEAD~1   # If not yet pushed

# Verify
grep '"version"' package.json
# Expected: Back to original version

# No push needed (versions were local-only)
```

### Phase 2: Remote Setup & Fetch (Before Merge)

**If remote was added but merge hasn't started:**

```powershell
cd C:\src\squad

# Remove the squad-pr remote
git remote remove squad-pr

# Verify
git remote -v
# Expected: Only origin remains

# No impact on main or public repo (fetch is read-only)
```

### Phase 3: Merge Conflicts (During Merge)

**If merge started but conflicts are unsolvable:**

```powershell
# Abort the merge
git merge --abort

# Verify
git status
# Expected: On migration branch, no conflicts, clean working tree

# Delete the migration branch locally
git checkout main
git branch -D migration

# No push needed (branch was local-only)
```

### Phase 4: Before Push (Post-Merge, Pre-Push)

**If merge is complete and verified, but you want to abort before pushing:**

```powershell
# Delete the local migration branch
git checkout main
git branch -D migration

# No impact on GitHub (branch not yet pushed)
# Pull latest main
git pull origin main
```

### Phase 5: After Push, Before PR Merge

**If migration branch is pushed but PR not yet merged:**

```powershell
# Delete the remote branch
git push origin --delete migration

# Delete PR (via GitHub UI or gh)
gh pr close $PR_NUMBER --delete-branch

# Public repo remains on main (unchanged)
```

### Phase 6: After PR Merge, Before Tag Creation

**If PR was merged but tag not yet created:**

```powershell
# Revert the merge commit
git revert -m 1 HEAD

# Push revert
git push origin main

# Verify main is back to pre-merge state
git log --oneline -3
```

### Phase 7: After Tag, Before Release

**If tag was created but release not yet published:**

```powershell
# Delete local tag
git tag -d v0.6.0-preview

# Delete remote tag
git push origin --delete v0.6.0-preview

# Verify
git tag -l
# Expected: v0.6.0-preview not listed
```

### Phase 8: After Release Published

**If release was published but needs to be redone:**

```powershell
# Delete release on GitHub (via web UI)
# or via CLI:
gh release delete v0.6.0-preview

# Delete tag
git tag -d v0.6.0-preview
git push origin --delete v0.6.0-preview

# Restart from Phase 6 if needed
```

### Complete Rollback (Nuclear Option)

**To completely undo the migration as if it never happened:**

```powershell
cd C:\src\squad

# Reset main to origin/main (pre-migration state)
git fetch origin
git reset --hard origin/main

# Delete all migration artifacts
git push origin --delete migration 2>/dev/null
git tag -d v0.6.0-preview 2>/dev/null
git push origin --delete v0.6.0-preview 2>/dev/null

# Delete release on GitHub (manual via web)

# Verify
git log --oneline -1
# Expected: Shows original main (pre-migration)
```

---

## Banana Gate Checklist

**⚠️ DO NOT PROCEED UNTIL BRADY SAYS "banana"**

Print this checklist. Brady must explicitly say the word "banana" before executing any steps.

### Pre-Flight Checklist (Before Starting Execution)

- [ ] **Brady has said "banana"** (hard stop otherwise)
- [ ] Both repos (squad-pr and squad) are cloned locally
- [ ] Working trees are clean (no uncommitted changes)
- [ ] Git and GitHub CLI are authenticated (`gh auth status` works)
- [ ] Node.js ≥20 is installed (`node --version` shows 20.x+)
- [ ] Security scan passed (no secrets found in git history)
- [ ] All tests pass in squad-pr before changes (`npm test`)
- [ ] All tests pass in squad before changes (`npm test`)

### Pre-Merge Checklist

- [ ] Version strings updated to 0.6.0-preview in all three package.json files
- [ ] `npm install --package-lock-only` executed
- [ ] Build passes (`npm run build` exits 0)
- [ ] Tests pass (`npm test` exits 0)
- [ ] Version commit created in squad-pr
- [ ] squad-pr remote added to squad repo (`git remote -v` shows squad-pr)
- [ ] Fetch from squad-pr completed (`git fetch squad-pr`)
- [ ] Migration branch created (`git checkout -b migration`)

### Pre-Conflict-Resolution Checklist

- [ ] Merge command executed (`git merge squad-pr/main --allow-unrelated-histories`)
- [ ] Conflicts are visible (`git status` shows conflicted files)
- [ ] Conflict resolution strategy understood for each file

### Post-Merge Checklist

- [ ] All conflicts resolved (no more "both modified" files)
- [ ] Merge commit created with descriptive message
- [ ] Fresh `npm install` executed
- [ ] Build passes
- [ ] Tests pass
- [ ] All version strings are 0.6.0-preview
- [ ] CLI shows correct version (`node cli.js --version`)

### Pre-Push Checklist

- [ ] Migration branch pushed to origin (`git push origin migration`)
- [ ] PR created (`gh pr create ...`)
- [ ] PR has descriptive title and body
- [ ] Reviewer checklist included in PR

### CI & Merge Checklist

- [ ] Wait for CI checks to pass (all green)
- [ ] PR reviewed (at least one approval if required)
- [ ] PR merged to main (`gh pr merge ...`)
- [ ] Migration branch deleted on GitHub

### Release Checklist

- [ ] Tag created (`git tag v0.6.0-preview`)
- [ ] Tag pushed to origin (`git push origin v0.6.0-preview`)
- [ ] GitHub Release created with comprehensive notes
- [ ] Release marked as pre-release (prerelease: true)
- [ ] Release notes include what's new, breaking changes, migration guide

### Post-Release Checklist

- [ ] Smoke test: Installation works (`npm install -g @bradygaster/squad-cli@0.6.0-preview`)
- [ ] CLI shows correct version in new install
- [ ] Doctor command runs successfully
- [ ] Release is visible on GitHub Releases page
- [ ] Clean up release notes file (`rm release-notes.txt`)

### Decision & Documentation Checklist

- [ ] Decision file written (.squad/decisions/inbox/kobayashi-public-migration.md)
- [ ] Kobayashi history updated with learnings
- [ ] Migration log created (.squad/log/[timestamp]-migration-execution.md)
- [ ] All rollback procedures verified (in place but untested)

### Go/No-Go Decision Tree

| Condition | Decision |
|-----------|----------|
| Brady said "banana" AND all pre-flight items checked | ✅ **GO** |
| Brady said "banana" BUT any pre-flight item unchecked | 🛑 **NO-GO** — Fix that item first |
| Brady did NOT say "banana" | 🛑 **HARD STOP** — Do not execute |
| Any step fails during execution | 🛑 **STOP** — Rollback and investigate before retry |
| Secrets found during scan | 🛑 **HARD STOP** — Remediate with BFG before continuing |

---

## Conclusion

This migration brings v0.8.6.x development (squad-pr) into the public repository as v0.6.0-preview (public beta). The approach follows Brady's direction: set up remote, create migration branch, merge with conflict resolution, push PR, merge and tag, create release.

**Key principles:**
- Zero execution until Brady says "banana"
- Comprehensive conflict resolution for each file type
- Verification at each phase
- Rollback procedures for each step
- Complete documentation for team knowledge

**Estimated time:** 2–4 hours total (including CI wait time and conflict resolution)

**Support:** If any step is unclear or fails, contact Brady or Keaton for guidance. This document is a reference; adapt as needed for actual execution.

---

**Document maintained by:** Kobayashi (Git & Release)  
**Last updated:** [Current Date]  
**Status:** WRITTEN — AWAITING BANANA GATE
