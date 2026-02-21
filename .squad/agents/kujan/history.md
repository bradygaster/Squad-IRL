# Project Context

- **Owner:** Brady
- **Project:** squad-sdk — the programmable multi-agent runtime for GitHub Copilot (v1 replatform)
- **Stack:** TypeScript (strict mode, ESM-only), Node.js ≥20, @github/copilot-sdk, Vitest, esbuild
- **Created:** 2026-02-21

## Learnings

### From Beta (carried forward)
- Copilot CLI vs. Copilot SDK boundary awareness: know which surface you're on
- Model selection fallback chains: Premium → Standard → Fast → nuclear (omit model param)
- Platform detection: CLI has task tool, VS Code has runSubagent, fallback works inline
- SQL tool is CLI-only — does not exist on VS Code, JetBrains, or GitHub.com
- Client compatibility matrix: spawning behavior varies by platform
