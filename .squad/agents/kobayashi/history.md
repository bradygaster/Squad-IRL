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
