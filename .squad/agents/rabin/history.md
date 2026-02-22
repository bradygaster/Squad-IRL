# Project Context

- **Owner:** Brady
- **Project:** squad-sdk — the programmable multi-agent runtime for GitHub Copilot (v1 replatform)
- **Stack:** TypeScript (strict mode, ESM-only), Node.js ≥20, @github/copilot-sdk, Vitest, esbuild
- **Created:** 2026-02-21

## Learnings

### From Beta (carried forward)
- Zero-dependency scaffolding preserved: cli.js vs runtime separation
- Bundle size vigilance: every dependency is a cost, every KB matters
- Distribution: GitHub-native (npx github:bradygaster/squad), NEVER npmjs.com
- esbuild for bundling, tsc for type checking — separate concerns
- Marketplace prep: packaging for distribution, not just local use

### 📌 Team update (2026-02-22T041800Z): Publish workflows verified ready, versions aligned to 0.8.0, both packages published to npm — decided by Rabin, Kobayashi, Coordinator
Rabin verified existing publish workflows already correct — no changes needed. Both SDK and CLI workflows properly configured for npm. Kobayashi aligned all versions to 0.8.0. Coordinator published @bradygaster/squad-sdk@0.8.0 and @bradygaster/squad-cli@0.8.0 to npm registry. Distribution infrastructure production-ready. Release workflows validated end-to-end.

### 📌 Fix (2026-02-22): npx bin resolution — squad-cli 0.8.1 published
Root cause: `npx @bradygaster/squad-cli` resolves the bin by unscoped package name (`squad-cli`), but the only bin entry was named `squad`. This caused npx to fall back to running the package as a script, which hit the orphaned placeholder `dist/cli.js` ("squad-cli placeholder — full CLI coming soon").
Fix: Added `"squad-cli": "./dist/cli-entry.js"` as a second bin entry alongside the existing `squad` entry. Replaced the placeholder `dist/cli.js` with a redirect to `cli-entry.js`. Bumped version to 0.8.1 (can't overwrite 0.8.0). Published and verified: `npx @bradygaster/squad-cli@0.8.1 --version` → `squad 0.8.0` (VERSION from SDK, correct).

### 📌 Assessment (2026-02-22): npm distribution status audit complete
**Published versions:** squad-sdk@0.8.0 (6 versions total), squad-cli@0.8.1 (7 versions total) on npm registry.
**Package contents:** SDK exports 26 public entry points (main, parsers, types, config, skills, agents, adapter, client, coordinator, hooks, tools, runtime + streaming/event-bus/benchmarks/i18n/telemetry/offline/cost-tracker, marketplace, build, sharing, ralph, casting, resolution). Files: dist + README. CLI exports 14 public entry points (main, upgrade, copilot-install, shell/*, core/*, commands/*). Files: dist, templates, README. Both have `prepublishOnly` scripts enforcing build before publish.
**Install paths:** (1) npm: `npm install -g @bradygaster/squad-cli` + `npx squad init` works correctly; squad-cli@0.8.1 has both bin entries (squad, squad-cli). (2) GitHub-native (npx github:bradygaster/squad) referenced in README as legacy/alternative path but npm is now recommended. Root package.json version is 0.6.0-alpha.0 (private workspace marker, not published).
**Publish workflows:** Both squad-publish.yml (on tags) and squad-insider-publish.yml (on insider branch) correctly configured — build → test → publish with public access. No missing steps or auth issues.
**Distribution gaps:** None. Distribution infrastructure production-ready. Version skew is intentional: SDK 0.8.0, CLI 0.8.1 (CLI had minor bin entry fix). README accurately reflects npm as primary install method.

### 📌 Team update (2026-02-22T070156Z): npx bin resolution fix merged to decisions, npm distribution fully operational — decided by Rabin
- **npx bin resolution decision:** Fixed `npx @bradygaster/squad-cli` by adding second bin entry `"squad-cli": "./dist/cli-entry.js"` alongside existing `"squad"` entry. npx resolves by unscoped package name, not custom bin names.
- **Version bump to 0.8.1:** 0.8.0 immutable on npm; bin fix required patch release.
- **Both bin entries active:** `squad` works for global installs, `squad-cli` works for npx resolution. Future releases must maintain both.
- **Distribution status:** Both packages published and verified on npm. SDK@0.8.0, CLI@0.8.1 (intentional skew). Install paths working correctly.
- **Decision merged to decisions.md.** Status: npm distribution production-ready, all package metadata and bin entries validated.
