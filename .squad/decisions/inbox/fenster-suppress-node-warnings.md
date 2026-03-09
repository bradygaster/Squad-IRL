# 2026-03-10: Scope Node warning suppression to Squad subprocess startup in mood-playlist-builder

**Context:** `mood-playlist-builder` displayed Node experimental SQLite warnings from the Copilot CLI subprocess during Squad startup, which obscured visible stage progress lines.

**Decision:** For dynamic playlist generation startup, set both `NODE_NO_WARNINGS=1` and `NODE_OPTIONS=--no-warnings` immediately before connecting `SquadClient`, then restore prior env values in `finally` after disconnect.

**Why:** Environment inheritance is the reliable way to suppress warnings emitted by child Node processes spawned by SDK/CLI internals. Scoped restore keeps suppression targeted to the Squad subprocess window instead of muting warnings for the remainder of the host process lifecycle.

**Impact:** Startup warning noise is hidden while preserving all existing progress/status console output and fallback messaging.
