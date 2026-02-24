# Next-Wave PRD: 4-Wave Execution Plan

**Date:** 2026-02-24  
**Status:** Ready for Wave A execution  
**Framework:** 4 sequential waves, all work through PRs with squad member review before merge

## Wave A: Polish & Consistency (17 items)

Focus: Visual refinement, UX polish, consistency across all surfaces.

### Phase 1: Text-over-emoji convention
- [ ] #340: P2 UX Polish — Text over Emoji, Simplicity over Fidget
  - Remove "you:" from user messages
  - Unify separators to ASCII `-` (not `─` or `┄`)
  - Static "Thinking..." (not carousel)
  - Text status labels in `/agents` (`[WORK]`, `[STREAM]`, `[ERR]`, `[IDLE]`)
  - Single-space indent for status lines
  - Replace ornamental emoji with text

### Phase 2: First-run experience
- [ ] #341: First-run wow moment architecture
  - Init ceremony (typewriter + staggered reveal)
  - First-launch detection via `.squad/.first-run` marker
  - NO_COLOR respect in init animations

### Phase 3: Help text structure
- [ ] #419–#423, #426: First-30-second pain points
  - Help text structure (P0)
  - SDK connection feedback (P0)
  - Spinner context (P0)
  - Default behavior clarity (P0)
  - Welcome animation speed (P1)
  - Tagline consistency (P1)

### Phase 4: ASCII-only separators
- [ ] #405, #404, #407: ASCII-only separators and NO_COLOR exit message
  - All banners use ASCII `-` instead of `·` or `—`
  - Exit message uses `--` instead of `◆`

### Phase 5: Version format
- [ ] #431, #429: Bare semver canonical standard
  - All version commands output bare semver (e.g., `0.8.5.1`)
  - Display contexts (help, banner) use `squad v{VERSION}` for branding

---

## Wave B: Reliability (TBD)

Focus: Bug fixes, timeout handling, error recovery, input buffering.

Related: REPL Experience Audit findings (#418, #425, #428, #430, #432, #433, #434)

---

## Wave C: Testing (TBD)

Focus: E2E test harness, integration test coverage, speed gates.

Related: Missing E2E integration tests (#433), Speed gate enforcement

---

## Wave D: Delight (TBD)

Focus: Polish beyond MVP, performance optimizations, wow moments.

---

## Process Directive

**All work flows through PRs with squad member review before merge.**

1. Assign issues to squad members
2. Create PR for each issue (or group related issues)
3. Require squad member review (assign reviewer in PR template)
4. Merge only after approval
5. Log PRs to session log upon merge

---

## Success Metrics

- **Wave A completion:** All 17 polish items in main branch, users report "feels polished"
- **No regressions:** Speed gate tests pass, all P0 tests green
- **Team velocity:** 4-5 PRs per day, mean review time <1 hour
