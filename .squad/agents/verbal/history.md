# Project Context

- **Owner:** Brady
- **Project:** squad-sdk — the programmable multi-agent runtime for GitHub Copilot (v1 replatform)
- **Stack:** TypeScript (strict mode, ESM-only), Node.js ≥20, @github/copilot-sdk, Vitest, esbuild
- **Created:** 2026-02-21

## Learnings

### From Beta (carried forward)
- Tiered response modes (Direct/Lightweight/Standard/Full) — spawn templates vary by complexity
- Silent success detection: 6-line RESPONSE ORDER block prevents ~7-10% of background spawns from returning no text
- Skills system architecture: SKILL.md lifecycle with confidence progression (low → medium → high)
- Spawn template design: charter inline, history read, decisions read — ceremony varies by tier
- Coordinator prompt structure: squad.agent.md is the authoritative governance file
- respawn-prompt.md is the team DNA — owned by Verbal, reviewed by Keaton
