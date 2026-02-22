---
updated_at: 2026-02-22T11:30:00Z
focus_area: Wave 2 — REPL polish, security fix, config extraction, shell integration
active_issues: [307, 308, 265, 266, 267, 268, 302, 303, 304, 305]
wave: 2
---

# What We're Focused On

**Status:** Wave 2 launched (PR #307, #308 merged; Issues #265–305 closed)

**⚠️ Repo: bradygaster/squad-pr ONLY — not bradygaster/squad.**

## Wave 2 (now)
**Agent assignments:**
- Fortier → REPL polish (hero task: App.tsx, AgentPanel, MessageStream, InputPrompt)
- Baer → CWE-78 fix in upstream.ts (command injection security)
- Edie → Config extraction (models.ts, constants.ts, roles.ts)
- Hockney → Shell integration + health monitor tests
- Fenster → Wire spawn.ts to CopilotClient + error handling

## Completed (Wave 1)
- OTel Phase 4: #265, #266, #267, #268 ✓
- Wave 1 remaining: #302, #303, #304, #305 ✓
- Branch: bradygaster/dev updated to match main

## Context
- 1940 tests passing post-Wave 1
- SquadOffice expects colon-separated EventBus events (session:*, agent:milestone, coordinator:routing, pool:health)
- Docs epic (#182) deferred — last priority
