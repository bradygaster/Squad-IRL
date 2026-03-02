# Migration Checklist: squad-pr → squad (v0.6.0-preview)

**⚠️ CRITICAL: Do not execute ANY steps until Brady says "banana"**

Print this page and check off as you proceed.

---

## BANANA GATE
- [ ] **Brady explicitly said: "banana"**

If this is NOT checked, STOP. Do not proceed.

---

## Phase 1: Prerequisites & Environment

- [ ] Both repos cloned: `C:\src\squad-pr` and `C:\src\squad`
- [ ] Squad-pr: `git status` shows clean tree
- [ ] Squad (public): `git status` shows clean tree
- [ ] GitHub CLI authenticated: `gh auth status` ✅
- [ ] Both repos accessible: `gh repo view bradygaster/squad-pr` ✅
- [ ] Node.js ≥20: `node --version` shows 20.x+
- [ ] npm ≥10: `npm --version` ✅

---

## Phase 2: Security Scan

- [ ] No `.env` files in git: `git ls-files | grep "\.env"` (empty)
- [ ] No hardcoded secrets: Scanned for token, password, key, secret patterns
- [ ] Scanned .copilot/ for sensitive content — safe
- [ ] No Authorization headers in source code
- [ ] **Result: PASS** (or STOP if secrets found — use BFG)

---

## Phase 3: Version Preparation (squad-pr)

- [ ] Updated `package.json` version → 0.6.0-preview
- [ ] Updated `packages/squad-sdk/package.json` version → 0.6.0-preview
- [ ] Updated `packages/squad-cli/package.json` version → 0.6.0-preview
- [ ] Ran `npm install --package-lock-only`
- [ ] Build passes: `npm run build` (exit code 0)
- [ ] Tests pass: `npm test` (all pass)
- [ ] Commit created: "chore: version bump to 0.6.0-preview for public migration"

---

## Phase 4: Breaking Changes & Beta User Migration

- [ ] Documented breaking changes between v0.5.x and v0.6.0-preview:
  - [ ] TypeScript rewrite of entire codebase
  - [ ] New .squad/ directory format (v0.5.4 format incompatible)
  - [ ] Command structure reorganization
  - [ ] SDK API changes for programmatic integration
- [ ] Created beta user upgrade guide section in `docs/migration-guide-private-to-public.md`
- [ ] Documented two distribution channels (~~GitHub-native~~ removed, npm only)
- [ ] Documented migration path: `npx github:bradygaster/squad` → `npm install -g @bradygaster/squad-cli` or `npx @bradygaster/squad-cli`
- [ ] Documented recommended migration path to npm for version management
- [ ] Added .squad/ directory migration procedure (v0.5.4 → v0.6.0 format)
- [ ] Documented shell script/CI updates needed (GitHub-native → npm)

---

## Phase 5: Test npm Distribution

- [ ] After migration is complete, test npm distribution:
  - [ ] Temporary directory: `mkdir $HOME\squad-test-npm`
  - [ ] Install via npm: `npm install -g @bradygaster/squad-cli@latest`
  - [ ] Expected output: `squad --version` → v0.6.0-preview (or newer)
  - [ ] Verify: `squad doctor` passes
  - [ ] Cleanup: `npm uninstall -g @bradygaster/squad-cli && rm -Recurse -Force $HOME\squad-test-npm`
- [ ] Confirm that `npx @bradygaster/squad-cli` works without global install

---

## Phase 6: Repository Reference Sweep (squad-pr → squad)

- [ ] Searched all files for squad-pr references: `Get-ChildItem -Recurse -Include *.ts,*.tsx,*.md,*.json,*.yml,*.yaml -File | Select-String -Pattern "squad-pr"`
- [ ] Reviewed search results and captured in CSV
- [ ] Replaced all package.json `@bradygaster/squad-pr` → `@bradygaster/squad`
- [ ] Replaced all GitHub URLs: `github.com/bradygaster/squad-pr` → `github.com/bradygaster/squad`
- [ ] Replaced repository fields in package.json files
- [ ] Updated README.md links and references
- [ ] Updated CONTRIBUTING.md links
- [ ] Updated all docs/*.md files
- [ ] Updated .github/workflows/*.yml references
- [ ] Updated product title/header strings in CLI
- [ ] Updated .squad/team.md repository references
- [ ] Verified zero remaining squad-pr references: `Get-ChildItem -Recurse -Include *.ts,*.tsx,*.md,*.json,*.yml,*.yaml -File | Select-String -Pattern "squad-pr" | Measure-Object` returned 0
- [ ] Commit created: "chore: sweep repository references squad-pr → squad"

---

## Phase 7: Migration Branch & Merge

- [ ] Navigated to `C:\src\squad`
- [ ] Squad on main: `git status` shows main branch
- [ ] Verified current remotes: `git remote -v` (only origin shown)
- [ ] Added squad-pr remote: `git remote add squad-pr https://github.com/bradygaster/squad-pr.git`
- [ ] Fetched from squad-pr: `git fetch squad-pr` (no errors)
- [ ] Verified fetch: `git log --oneline squad-pr/main -5` (shows commits)
- [ ] Created migration branch: `git checkout -b migration`
- [ ] Merge command executed: `git merge squad-pr/main --allow-unrelated-histories`
- [ ] Merge paused (expected for unrelated histories)
- [ ] Conflicts identified: Listed all "both modified" files

---

## Phase 8: Conflict Resolution

### package.json files
- [ ] Resolved `package.json` (took squad-pr version: 0.6.0-preview)
- [ ] Resolved `packages/squad-sdk/package.json` (took squad-pr version)
- [ ] Resolved `packages/squad-cli/package.json` (took squad-pr version)
- [ ] All three files added: `git add package.json packages/*/package.json`

### Infrastructure files
- [ ] Resolved `.gitignore` (merged both versions)
- [ ] Resolved `.github/workflows/*` (took squad-pr versions)
- [ ] Files added: `git add .gitignore .github/`

### Documentation
- [ ] Resolved `README.md` (chose squad-pr dev-facing version)
- [ ] Resolved `CHANGELOG.md` (merged both histories)
- [ ] Resolved `docs/**` (merged content)
- [ ] Files added: `git add README.md CHANGELOG.md docs/`

### .squad/ files
- [ ] Verified no conflicts in `.squad/` (union merge driver active)
- [ ] If conflicts: resolved by taking both sides
- [ ] `git add .squad/`

### Other conflicts
- [ ] All remaining conflicts resolved
- [ ] `git status` shows no "both modified" files
- [ ] All modified files staged: `git status` shows clean staging

### Merge commit
- [ ] Merge completed: `git commit` with comprehensive message
- [ ] Merge commit visible: `git log --oneline -1`

---

## Phase 9: Post-Merge Verification

- [ ] Deleted node_modules: `rm -Recurse -Force node_modules`
- [ ] Deleted package-lock.json: `rm package-lock.json`
- [ ] Fresh install: `npm install` (exit code 0, no errors)
- [ ] Build passes: `npm run build` (exit code 0)
- [ ] Tests pass: `npm test` (all pass)
- [ ] Versions verified: All three package.json at 0.6.0-preview
- [ ] CLI version: `node cli.js --version` → 0.6.0-preview
- [ ] Git status clean: `git status` (working tree clean)

---

## Phase 10: Push & PR

- [ ] Pushed migration branch: `git push origin migration`
- [ ] Push verified on GitHub: `gh repo view bradygaster/squad --branch migration`
- [ ] PR created: `gh pr create ...`
- [ ] PR number captured: `PR #___`
- [ ] PR has title: "v0.6.0-preview: Merge squad-pr private development into public"
- [ ] PR has detailed body with:
  - [ ] Overview section
  - [ ] What's New (features from v0.8.6)
  - [ ] Breaking Changes
  - [ ] Migration Notes
  - [ ] Testing results
  - [ ] Reviewer Checklist

---

## Phase 11: CI & Merge

- [ ] Waiting for CI checks...
- [ ] All checks PASSED: `gh pr view $PR_NUMBER --json statusCheckRollup`
- [ ] No failed jobs
- [ ] PR merged to main: `gh pr merge $PR_NUMBER --merge`
- [ ] Merge verified: `git fetch origin && git checkout main && git pull origin main`
- [ ] Merge commit visible in main history

---

## Phase 12: Tag & Release

- [ ] Fetched latest: `git fetch origin`
- [ ] On main branch: `git status` shows main
- [ ] Tag created: `git tag v0.6.0-preview`
- [ ] Tag pushed: `git push origin v0.6.0-preview`
- [ ] Tag verified: `git tag -v v0.6.0-preview` (shows commit)

---

## Phase 13: GitHub Release

- [ ] Release created: `gh release create v0.6.0-preview --prerelease`
- [ ] Release title: "v0.6.0-preview — Public Beta"
- [ ] Release body includes:
  - [ ] What's New section
  - [ ] Breaking Changes (with link to upgrade guide)
  - [ ] Installation instructions (both GitHub-native and npm)
  - [ ] Migration guide for beta users
  - [ ] Testing notes
  - [ ] Known limitations / pre-release warning
- [ ] Release marked as prerelease: ✅
- [ ] Release visible on GitHub Releases page

---

## Phase 14: Post-Release Validation

- [ ] Created test directory: `mkdir $HOME\squad-test-v0.6.0`
- [ ] Installed from npm: `npm install -g @bradygaster/squad-cli@0.6.0-preview`
- [ ] Version shows: `squad --version` → 0.6.0-preview
- [ ] Help works: `squad --help` (no errors)
- [ ] Doctor passes: `squad doctor` (✅)
- [ ] npx works: `npx @bradygaster/squad-cli --version` → 0.6.0-preview
- [ ] Cleaned up: `npm uninstall -g @bradygaster/squad-cli && rm -Recurse -Force $HOME\squad-test-v0.6.0`

---

## Phase 15: Documentation & Closure

- [ ] Decision file created: `.squad/decisions/inbox/kobayashi-beta-upgrade-path.md`
- [ ] Kobayashi history updated: `.squad/agents/kobayashi/history.md` appended with learnings
- [ ] Migration log created: `.squad/log/[timestamp]-migration-execution.md`
- [ ] All rollback procedures documented (verified in place)
- [ ] Post-migration decision made: Keep squad-pr as dev mirror? Archive? (Document here: ___________________)
- [ ] Beta user docs reviewed and linked from Release notes
---

## Final Checklist

- [ ] **All phases completed successfully**
- [ ] **No rollbacks executed**
- [ ] **Public squad repo now at v0.6.0-preview**
- [ ] **Release accessible via GitHub & npx**
- [ ] **Beta ready for external testing**

---

## Troubleshooting Quick Links

If you get stuck, see the corresponding section in `docs/migration-guide-private-to-public.md`:

| Problem | Section |
|---------|---------|
| Secret found in git | Security Scan → If Secrets Found |
| Merge conflicts won't resolve | Conflict Resolution Guide |
| Build fails after merge | Post-Merge Verification |
| CI checks fail on PR | Phase 9: CI & Merge (debug) |
| Need to undo everything | Rollback Plans → Complete Rollback |
| Unclear next step | Re-read current phase section + step description |

---

**Execution Date:** _______________  
**Executed By:** _______________  
**Status:** ✅ COMPLETE / 🛑 FAILED (circle one)  
**Notes:** _______________________________________________________________

---

**Document maintained by:** Kobayashi (Git & Release)
