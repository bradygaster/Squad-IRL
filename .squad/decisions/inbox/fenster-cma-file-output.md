# Decision: CMA output saved to file alongside streaming

**By:** Fenster
**Date:** 2026-03-08
**Context:** Brady reported CMA output was only streamed to console with no file saved.

**Decision:**
- `sendAndStream` accumulates content in a buffer while streaming, then returns it.
- Caller writes the buffer to `files/{sanitized_area}_CMA_Package.md` after streaming completes.
- This pattern (buffer + return) is reusable for any sample that needs to persist streamed output.

**Why not write during streaming?**
- Writing on every delta would thrash the filesystem and risk partial files on error.
- Post-stream write is simpler, atomic, and consistent with the existing error handling flow.
