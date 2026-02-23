# Decision: Rich Progress Indicators (#335)

**Author:** Cheritto (TUI Engineer)
**Date:** 2026-02-23
**Status:** Proposed

## Context
Users couldn't tell what agents were doing during long operations. The ThinkingIndicator (#331) handles the "thinking" phase, but once agents start working on tools, there was no per-agent visibility.

## Decision
Two complementary progress surfaces:

1. **AgentPanel status line** — `Name (working, 12s) — Reading file`
   - Uses existing `AgentSession` type extended with `activityHint?: string`
   - SessionRegistry manages hints alongside status

2. **MessageStream activity feed** — `📋 Keaton is reading file...`
   - New `agentActivities` Map prop on MessageStream
   - Renders between message list and ThinkingIndicator
   - Backward compatible (no prop = no feed)

## Alternatives Considered
- **Single global hint only:** Already had this via `activityHint` prop. Not enough for multi-agent.
- **Toast/notification system:** Too heavy for this use case. Activity feed is simpler and scans well.
- **Inline in ThinkingIndicator:** Would overload that component's responsibility.

## Consequences
- `AgentSession` type gains one optional field — no breaking change
- `SessionRegistry` gains `updateActivityHint()` — additive
- `ShellApi` gains `setAgentActivity()` — additive
- All existing tests continue to pass (11 new tests added)
