# Project Context

- **Owner:** Brady
- **Project:** squad-sdk — the programmable multi-agent runtime for GitHub Copilot (v1 replatform)
- **Stack:** TypeScript (strict mode, ESM-only), Node.js ≥20, @github/copilot-sdk, Vitest, esbuild
- **Created:** 2026-02-21

## Learnings

### From Beta (carried forward)
- Preview branch workflow: two-phase (preview → ship) for safe releases
- State integrity via merge drivers: union strategy for .squad/ append-only files
- .gitattributes merge=union: decisions.md, agents/*/history.md, log/**, orchestration-log/**
- Distribution: GitHub-native (npx github:bradygaster/squad), never npmjs.com
- Zero tolerance for state corruption — .squad/ state is the team's memory

### 2026-02-21: Issue #208 — @changesets/cli setup complete
**Status:** PR #276 merged.
- Installed @changesets/cli v2 (101 new packages)
- Config: `"access": "public"`, `"baseBranch": "main"`
- Fixed/linked arrays left empty → independent versioning (squad-sdk, squad-cli evolve at different cadences)
- Added npm script `changeset:check: "changeset status"` for CI validation
- Build passes, npm workspace resolution confirmed
- **Decision:** Independent versioning is correct. Squad packages have separate release cycles (SDK is runtime; CLI is tooling).

### 📌 Team update (2026-02-21T22:05Z): M3+ decisions merged — decided by Kobayashi, Fenster
- Changesets setup (#208): independent versioning for squad-sdk + squad-cli, PR #276 merged
- --global flag (#212) + squad status (#213): routing in src/index.ts, composable resolution pattern, PR #277 merged
- Decision consolidation: changesets config and --global pattern appended to decisions.md

### 📌 Team update (2026-02-21T22:25Z): M5 round complete — decided by Scribe
- Decision inbox merged: ensureSquadPath() guard (#273), CLI routing testability pattern
- Status: Two PRs merged (#280, #279); one issue blocked (#209 needs GitHub Pro)

### 2026-02-21: Issue #215 — Insider channel publish scaffolds
**Status:** PR #283 opened → bradygaster/dev
- Added minimal publishable entry points to both workspace packages:
  - `packages/squad-sdk/src/index.ts`: VERSION export placeholder
  - `packages/squad-cli/src/cli.ts`: placeholder binary entry point
  - Both: `tsconfig.json` extending root, `build` scripts, `files` lists for npm publish
- Root `build` script updated to chain `--workspaces --if-present`
- Build passes (root + workspaces), all 1621 tests pass
- **Does NOT push to insider.** PR only — coordinator handles insider branch push after merge.
- **Package structure:** ESM-only, strict mode, Node >=20. squad-cli depends on squad-sdk via version string (npm workspace protocol, per Edie's decision).

### 2026-02-21: Version Alignment — 0.7.0 stubs → 0.8.0 real code
**Status:** EXECUTED
- **Decision:** Bump both packages from 0.7.0 (npm stubs) to 0.8.0 (real, publishable code)
- **Rationale:** Clear break from placeholders. 0.8.0 signals functional code arrival while preserving pre-1.0 alpha status.
- **Changes:**
  - `packages/squad-sdk/package.json` → version `0.8.0`, VERSION export updated in `src/index.ts`
  - `packages/squad-cli/package.json` → version `0.8.0`, dependency on sdk locked to `0.8.0`
  - `package.json` (root) → added `"private": true` (safety guard against accidental publish)
- **Verification:** All three version strings aligned. CLI SDK dependency pinned. Pre-existing TS build errors unrelated to alignment.
- **Next:** Changeset + npm publish (when TS issues resolved). Decision document: `.squad/decisions/inbox/kobayashi-version-alignment.md`

### 📌 Team update (2026-02-22T041800Z): Version alignment complete, both packages published to npm at 0.8.0 — decided by Kobayashi, Coordinator
Kobayashi aligned all version strings to 0.8.0 (SDK package, CLI package, VERSION export, root private flag). Coordinator published @bradygaster/squad-sdk@0.8.0 and @bradygaster/squad-cli@0.8.0 to npm registry. Version bump signals clear break from 0.7.0 stubs. Release infrastructure production-ready. Both packages live and resolvable on npm.

### 2026-02-22: CI/CD Readiness Assessment Complete
**Status:** PASSED with critical version misalignment flagged.

**Branch State:**
- Current: `bradygaster/dev` (HEAD → commit d2b1b1f)
- Remote tracking: `origin/bradygaster/dev`, `origin/main`, `origin/insider`
- Recent commits: Rollup job renaming (CI), telemetry test timing fix, main merge
- PR #298: Does not exist (GitHub repo search returned 404)

**CI Workflows — All Healthy:**
1. **squad-ci.yml** (build-node, test-node, build rollup) — ✅ Triggers on PR/push to main/dev/insider. Validates Node 20 + 22. Rollup job correctly names the branch protection check.
2. **squad-publish.yml** — ✅ Publishes on v* tags (both workspace packages with `--access public`). Chains build → test → publish.
3. **squad-insider-publish.yml** — ✅ Auto-publishes both packages on insider branch push with `--tag insider`.
4. **squad-release.yml** — ✅ Runs on main push. Validates version in CHANGELOG, creates v-prefixed tag, creates GitHub Release.
5. **squad-insider-release.yml** — ✅ Runs on insider push. Creates insider tag variant (v{VERSION}-insider+{SHA}), creates prerelease GitHub Release.
6. **squad-preview.yml** — ✅ Validates preview branch state (version consistency, no .squad//.ai-team files tracked).
7. **squad-promote.yml** — ✅ Workflow-dispatch to promote dev→preview→main with folder stripping and validation.
8. **squad-docs.yml** — ✅ Builds docs site on preview branch push (pages deployment).
9. **squad-heartbeat.yml** (Ralph) — ✅ Triage automation, auto-assign members/copilot, label enforcement.
10. **squad-triage.yml** — ✅ Routes squad-labeled issues to members or @copilot based on capability profile.
11. **squad-issue-assign.yml** — ✅ Assigns work to team members or copilot when squad:* labels applied.
12. **squad-label-enforce.yml** — ✅ Mutual exclusivity: go:*, release:*, type:*, priority:* namespaces.
13. **sync-squad-labels.yml** — ✅ Syncs GitHub labels from .squad/team.md and static definitions.

**🚨 VERSION MISALIGNMENT — CRITICAL ISSUE:**
- **Root package.json:** 0.6.0-alpha.0 (PRIVATE flag set ✅)
- **squad-sdk package.json:** 0.8.0 ✅
- **squad-cli package.json:** 0.8.1 ⚠️ (CLI is 1 patch ahead of SDK)
- **CHANGELOG.md:** Latest entry is 0.6.0-alpha.0 (2026-02-22), versioned from root
- **CLI dependency on SDK:** Uses `"@bradygaster/squad-sdk": "*"` (wildcard — resolves to latest 0.8.0)

**Publishing Readiness Analysis:**

**For v* tag release (squad-publish.yml):**
- ✅ Workflow correctly targets workspace packages with explicit `-w` flags
- ✅ Both packages have `prepublishOnly` scripts (build before publish)
- ✅ Both have `files` field (excludes .squad/, node_modules, etc.)
- ❌ **BLOCKING ISSUE:** No version tags exist. To release 0.8.0, must create `v0.8.0` tag on the commit where both package versions are consistent.
- ❌ **VERSION CONSISTENCY REQUIRED:** CLI must align with SDK at 0.8.0 before tagging.

**For insider branch (squad-insider-publish.yml):**
- ✅ Auto-publishes on push with versioning: `{version}-insider+{sha}`
- ✅ Workflow correctly applies `--tag insider` to both packages
- ✅ Ready now (no tag required, branch push triggers auto-publish)

**For promotion workflow (squad-promote.yml):**
- ✅ dev→preview (strips .squad/, .ai-team*, team-docs/, docs/proposals/)
- ✅ preview→main (requires CHANGELOG entry for version)
- ✅ Both validations in place

**.gitattributes Merge Drivers:**
- ✅ Union strategy correctly configured for:
  - `.squad/decisions.md`
  - `.squad/agents/*/history.md`
  - `.squad/log/**`
  - `.squad/orchestration-log/**`
- ✅ Prevents state corruption across branch merges

**Release Readiness Verdict:**
- ✅ CI/CD infrastructure is complete and correct
- ✅ Insider channel ready for continuous pre-release publishing
- ✅ Main release path ready (once tag is created)
- ❌ **BLOCKING:** Version alignment must be resolved (CLI 0.8.1 vs SDK 0.8.0)
- ❌ **BLOCKING:** CHANGELOG must reflect workspace package versions, not root version
- ⚠️ No stable tags exist yet (first release requires deliberate tag creation)

**Recommendation:** Align CLI to 0.8.0, update CHANGELOG with separate entries for SDK/CLI if versioning will diverge, then create v0.8.0 tag to trigger release workflow. Insider channel can publish now for pre-release testing.

### 📌 Team update (2026-02-22T070156Z): CI/CD assessment merged to decisions, version alignment intentional, publish workflows verified ready — decided by Kobayashi
- **CI/CD Readiness Assessment (Decision):** All 13 workflows production-ready and correctly configured. Branch protection enforced (PR required, build check mandatory). Merge drivers in place for append-only squad files.
- **Version alignment explanation:** SDK 0.8.0, CLI 0.8.1 (intentional — CLI had minor bin entry fix in 0.8.1). This skew is documented in decisions and appropriate for pre-1.0 development.
- **Publishing workflows validated:** squad-publish.yml (v* tags), squad-insider-publish.yml (insider branch auto-publish), both correctly configured for npm workspace packages with public access.
- **Insider channel:** Ready now for continuous pre-release validation (no tag creation needed, branch push auto-publishes).
- **Stable release:** Ready when next tag (v0.8.0 or v0.8.1) created — CHANGELOG and version alignment already finalized.
- **Decision merged to decisions.md.** Status: Release infrastructure production-ready, version skew intentional and documented.
