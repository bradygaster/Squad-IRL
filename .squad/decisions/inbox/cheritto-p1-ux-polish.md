### 2026-02-25: P1 UX polish — visual language standardization
**By:** Cheritto (TUI Engineer)
**PR:** #356 (branch `squad/330-p1-ux-polish`)
**What:** Standardized 8 visual/interaction patterns across the shell:
- System prefix is now `▸` (small triangle) — team should use this for all system-level messages
- Separators are terminal-width-aware via `process.stdout.columns` (capped at 120) — no more hardcoded widths
- Prompt stays cyan in all states (active + disabled) — yellow is reserved for warnings/processing indicators only
- Focus indicator uses text label `▶ Active` alongside pulsing dot — accessibility over decoration
- @-addressing is reinforced in placeholder text — key interaction model should be visible at all times
**Why:** Marquez audit identified 8 P1 inconsistencies. Standardizing now prevents divergence as we add features.
**Impact:** Any new components rendering separators or system messages should follow these patterns.
