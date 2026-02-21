# Project Context

- **Owner:** Brady
- **Project:** squad-sdk — the programmable multi-agent runtime for GitHub Copilot (v1 replatform)
- **Stack:** TypeScript (strict mode, ESM-only), Node.js ≥20, @github/copilot-sdk, Vitest, esbuild
- **Created:** 2026-02-21

## Learnings

### From Beta (carried forward)
- Strict mode non-negotiable: strict: true, noUncheckedIndexedAccess: true, no @ts-ignore
- Declaration files are public API — treat .d.ts as contracts
- Generics over unions for recurring patterns
- ESM-only: no CJS shims, no dual-package hazards
- Build pipeline: esbuild for bundling, tsc for type checking
- Public API: src/index.ts exports everything — this is the contract surface
