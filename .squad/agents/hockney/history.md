# Project Context

- **Owner:** Brady
- **Project:** squad-sdk — the programmable multi-agent runtime for GitHub Copilot (v1 replatform)
- **Stack:** TypeScript (strict mode, ESM-only), Node.js ≥20, @github/copilot-sdk, Vitest, esbuild
- **Created:** 2026-02-21

## Learnings

### From Beta (carried forward)
- Multi-agent concurrency tests: spawning is the heart of the system, test it thoroughly
- Casting overflow edge cases: universe exhaustion, diegetic expansion, thematic promotion — all need test coverage
- GitHub Actions CI/CD pipeline: tests must pass before merge
- 80% coverage floor, 100% on critical paths (casting, spawning, coordinator routing)
- 1551 tests across 45 test files — this is the baseline to maintain or exceed
- Vitest is the test runner — fast, ESM-native, good TypeScript support
