# Decision: Shell chrome patterns and session registry design

**By:** Fenster (Core Dev)
**Date:** 2026-02-21
**Re:** #236, #237

## Shell Chrome

**What:** The interactive shell header uses box-drawing characters (`╭╰│─`) for visual chrome. Version is read from `package.json` at runtime via `createRequire(import.meta.url)` — no hardcoded version strings.

**Why:** Box-drawing chrome is universally supported in modern terminals and provides clear visual framing without external dependencies. Using `createRequire` for JSON import follows the existing pattern in `src/build/github-dist.ts` and avoids ESM JSON import assertions (which require `--experimental-json-modules` in some Node versions).

**Exit handling:** Three exit paths — `exit` command, `/quit` command, and Ctrl+C (SIGINT). All produce the same cleanup message ("👋 Squad out.") for consistency.

## Session Registry

**What:** `SessionRegistry` is a simple Map-backed class with no persistence, no event emitting, and no external dependencies. It tracks agent sessions by name with status lifecycle: `idle` → `working` → `streaming` → `idle`/`error`.

**Why:** The registry is designed as a pure state container that the ink UI (#242+) will consume. Adding events or persistence now would create coupling before the UI layer exists to consume it. The Map-based approach allows O(1) lookup by agent name, which is the primary access pattern for status display.

**Impact:** Low. Two files changed. No API surface changes outside the shell module. SessionRegistry is exported for future consumption but has no current consumers.
