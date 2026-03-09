---
name: dynamic-json-guardrails
description: Validate model JSON responses with strict schema checks and deterministic fallback
domain: sample-runtime, reliability
confidence: high
source: earned (mood-playlist-builder dynamic upgrade)
---

## Context
When model output drives user-facing flows, malformed JSON or partial objects can break demos and produce silent failures.

## Pattern
- Prompt for a strict JSON schema with explicit required keys and limits.
- Validate response shape aggressively: object type, required fields, array bounds, per-item required string fields.
- Reject (not partially accept) responses that exceed max item constraints.
- On validation/runtime failure, switch to deterministic fallback logic and log a user-visible warning.

## Example
- `mood-playlist-builder/index.ts`: dynamic playlist generation via Squad SDK with warning-backed fallback.
- `mood-playlist-builder/mood-logic.ts`: strict output validation and deterministic fallback resolver.

## Anti-Patterns
- Silently dropping malformed entries and pretending the model response was valid.
- Accepting oversized arrays and truncating without signaling validation failure.
- Hiding model connectivity failures from users.
