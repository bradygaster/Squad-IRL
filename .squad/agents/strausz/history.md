# Project Context

- **Owner:** Brady
- **Project:** squad-sdk — the programmable multi-agent runtime for GitHub Copilot (v1 replatform)
- **Stack:** TypeScript (strict mode, ESM-only), Node.js ≥20, @github/copilot-sdk, Vitest, esbuild
- **Created:** 2026-02-21

## Learnings

### From Beta (carried forward)
- VS Code runSubagent spawn patterns: different from CLI task tool — no agent_type, mode, model params
- Model selection gap: CLI has per-spawn model control, VS Code uses session model only
- Platform parity strategies: what works on CLI must work in VS Code
- SQL tool is CLI-only: never depend on it in cross-platform code paths
- Multiple subagents in one turn run concurrently on VS Code (equivalent to background mode)
