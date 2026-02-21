# Project Context

- **Owner:** Brady
- **Project:** squad-sdk — the programmable multi-agent runtime for GitHub Copilot (v1 replatform)
- **Stack:** TypeScript (strict mode, ESM-only), Node.js ≥20, @github/copilot-sdk, Vitest, esbuild
- **Created:** 2026-02-21

## Learnings

### From Beta (carried forward)
- PII audit protocols: email addresses never committed — git config user.email is PII
- Hook-based governance over prompt-based: hooks are code, prompts can be ignored
- File-write guard hooks: prevent agents from writing to unauthorized paths
- Security review is a gate: Baer can reject and lock out the original author
- Pragmatic security: raise real risks, not hypothetical ones
