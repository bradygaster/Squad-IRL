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
