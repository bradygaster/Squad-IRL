# Decision: Sample Structure — SDK-First Configs

**Date:** 2026-03-07  
**Decided by:** Fenster (implementing Brady's directive)  
**Status:** Implemented in travel-planner rebuild

## Context

The travel-planner sample was initially built as a 900-line standalone TypeScript app that called OpenAI directly with `fetch()` and had functions pretending to be "agents." Brady's feedback: "you literally built around github copilot instead of using it."

## Decision

**All samples in this repo should be Squad SDK configurations, not standalone applications.**

### What This Means

1. **Primary artifact:** `squad.config.ts` using Squad SDK exports (`defineSquad`, `defineAgent`, `defineTeam`, etc.)
2. **No direct LLM calls:** No `fetch()` to OpenAI, no custom agent implementation, no replacement of SDK functionality
3. **Interface:** GitHub Copilot IS the interface — users talk to the squad through Copilot
4. **Purpose:** Demonstrate "here's how you configure a squad to solve [X problem]", not "here's a custom app that does [X]"

### Sample Structure Pattern

```
sample-name/
├── squad.config.ts          # The entire sample — SDK config with rich charters
├── package.json             # Minimal: @bradygaster/squad-sdk + typescript
├── tsconfig.json            # ESNext/bundler mode, includes squad.config.ts
└── README.md                # What the squad does, how to use it via Copilot
```

### Agent Charter Quality

Rich inline charters (50-100 lines per agent) with:
- Domain expertise bullet lists
- Response patterns and structure
- Style guidelines
- Practical "do/don't" sections
- Enough detail that the agent gives genuinely useful advice

### Routing Intelligence

- Specific queries → relevant specialist (tier: 'direct')
- Broad "plan my X" queries → full team collaboration (tier: 'full')
- Patterns should match natural language, not keywords

## Rationale

- **Clarity of purpose:** Samples demonstrate the Squad SDK, not how to build apps without it
- **User value:** Normal people get a configured squad they can talk to, not source code to run
- **SDK validation:** Every sample validates that the SDK can express real-world agent teams
- **Simplicity:** SDK configs are dramatically shorter and clearer than standalone apps

## Impact

- **travel-planner:** Rebuilt from 900 lines → 402 lines, standalone app → SDK config
- **Future samples:** Should follow this pattern from the start
- **Existing samples:** May need similar rebuilds if they're standalone apps

## Related

- Brady's directive: "all these samples should be ways to use the squad sdk to programmatically make a squad to solve a real human problem"
- SDK exports: `defineSquad`, `defineAgent`, `defineTeam`, `defineRouting`, etc.
- Sample philosophy: Show the SDK solving real problems, not alternatives to the SDK
