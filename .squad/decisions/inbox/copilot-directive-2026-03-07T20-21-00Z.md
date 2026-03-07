### 2026-03-07T20:21:00Z: User directive — samples must use Squad SDK
**By:** Brady (via Copilot)
**What:** "All these samples should be ways to use the squad sdk to programmatically make a squad to solve a real human problem. You're trying to show normal people how squad can benefit them, not just developers."
**Why:** User request — captured for team memory. This supersedes the previous directive about using LLM APIs with fetch(). The correct approach is to use `@bradygaster/squad-sdk` with `defineSquad`, `defineAgent`, etc. Each sample is a `squad.config.ts` that creates a domain-specific squad. No standalone TypeScript apps pretending to be agent systems.
