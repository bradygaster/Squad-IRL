---
updated_at: 2026-03-03T00:00:00Z
focus_area: Migration to Public Repo + SDK Samples
issues_open: []
issues_closed_prd: 30
tests_passing: 2944
prd_location: .squad/identity/prd-next-waves.md
current_phase: Migration v0.6.0 + SDK Samples
process: All work through PRs with squad member review before merge
---

# What We're Focused On

**Status:** Migration planning complete. Target: public repo v0.6.0 (clean minor bump from v0.5.4). On `migration` branch. Two new SDK samples shipped (knock-knock, rock-paper-scissors). Banana gate still active for git operations.

## Public Readiness Assessment (2026-02-24)

Full team fan-out: Keaton, Fenster, Hockney, McManus, Rabin, Baer, Edie all assessed their domains.

**Consensus: 🟡 READY WITH CAVEATS** — unanimous.

### Must-Fix Blockers (ALL RESOLVED ✅)
1. ✅ **LICENSE file** — MIT LICENSE created at repo root
2. ✅ **CI workflow broken** — Fixed `squad-ci.yml` to use `npm ci` → `npm run build` → `npm test` (vitest)
3. ✅ **Debug console.logs** — 3 debug logs in coordinator/index.ts replaced with OTel spans

### Experimental Messaging (DONE ✅)
- ⚠️ banners added to all CLI docs (installation.md, shell.md, vscode.md)
- README Status section changed from "Production" to "Experimental alpha"
- Broken CONTRIBUTING link fixed

### Should-Fix (Post-Ship Polish)
- Add `homepage` and `bugs` fields to package.json
- Document alpha→v1.0 breaking change policy in README
- Close #324 (dogfood testing)

### Post-M1 Backlog
- Add `noUncheckedIndexedAccess` to tsconfig
- Tighten ~26 `any` types in SDK
- Add architecture overview doc
- One real Copilot SDK integration test
- `npm audit fix` for dev-dependency ReDoS warnings

## Waves A–D: COMPLETE

All 30 PRD-referenced issues are closed.

### Open Issue: #324 — Dogfood CLI with real repos (P0)
- Status: OPEN — remaining blocker for full confidence
- Assignees: Keaton, Waingro

### Next Steps
1. **Ship public alpha** — All blockers resolved, experimental messaging in place
2. **Complete #324 dogfood** — Test against real repos
3. **Plan Wave E** — Based on dogfood + public feedback

## Process

All work flows through PRs with squad member review before merge.

---

## Archive: Earlier Phases

Epic #323 — CLI Quality & UX (Phases 1–3: Testing Wave → Improvement → Breathtaking)
- Phase 1: 7 P0 blockers fixed (#365–#371)
- Phase 2: 6 Wave D items shipped (#488–#493)
- Phase 3: Wave A–C polish delivered (30 issues closed)
