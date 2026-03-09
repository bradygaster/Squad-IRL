---
name: markdown-playlist-archive
description: Build append-only markdown table archives with daily file partitioning and replay-friendly history surfacing
domain: sample-runtime, persistence
confidence: high
source: earned (mood-playlist-builder sample)
---

## Context

Some samples need lightweight persistence without introducing databases. Markdown tables are human-readable, git-friendly, and easy to inspect, but they need careful append semantics to avoid duplicate headers or accidental overwrites.

## Patterns

### Append-Only Table Writer

- Use one helper that:
  - creates parent directories (`mkdirSync(..., { recursive: true })`)
  - creates file + header + divider on first write
  - appends rows on subsequent writes
  - only re-inserts headers if a legacy file exists without the expected header
- Escape pipe characters in cell content before writing markdown rows.

### Daily Partitioning + Long-Term Archive

- Daily activity file: `folder/playlist-YYYY-MM-DD.md` for batch-specific rows.
- Global longitudinal file: `mood-archive.md` with timestamped minimal entries.
- On startup, read archive and surface recent + frequent values to guide new runs.

### External Link Resolution with Graceful Fallback

- Resolve external links (e.g., YouTube) to canonical URLs when possible.
- Extract validated IDs (`v` query, 11-char pattern) for aggregate actions.
- When resolution fails, store a deterministic search URL so the row still remains actionable.

## Examples

- `mood-playlist-builder/mood-logic.ts`
  - `appendMarkdownRow(...)`
  - `readMoodArchive(...)`
  - `extractYouTubeVideoId(...)`
  - `buildYouTubePlaylistUrl(...)`
- `mood-playlist-builder/index.ts`
  - startup archive surfacing
  - daily playlist + archive append
  - browser launch from aggregated video IDs

## Anti-Patterns

- Rewriting the entire markdown file every run (destroys history).
- Duplicating headers for every appended row.
- Building aggregate playback URLs from unvalidated IDs.
- Persisting only normalized values and losing the user’s original raw input.
