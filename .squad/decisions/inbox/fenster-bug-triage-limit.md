# Decision: Cap bug-triage issue fetch at 5

**Author:** Fenster (Core Dev)
**Date:** 2025-07-15
**Status:** Accepted

## Context

The bug-triage sample was crashing when run against repos with many open issues. The default fetch limit was 30, which produced prompts too large for reliable processing and caused timeouts or failures in the triage squad.

## Decision

Reduced the default issue fetch limit from 30 to 5. This keeps the sample fast, focused, and crash-free while still demonstrating the full triage pipeline (classification, duplicate detection, triage actions, summary dashboard).

## Changes

- `issue-fetcher.ts`: Default `limit` parameter changed from 30 → 5
- `index.ts`: User-facing fetch message now says "5 most recent open issues"
- `squad.config.ts`: Project context updated to mention the 5-issue-per-run cap
- `README.md`: Updated to reflect the 5-issue fetch limit

## Trade-offs

- Users who want more issues can still pass a higher limit programmatically via `fetchIssues(repo, N)`
- 5 is enough to demonstrate all four agents meaningfully (classification, duplicate detection across pairs, triage actions, summary dashboard)
- If the sample grows a CLI flag for `--limit`, the default stays at 5
