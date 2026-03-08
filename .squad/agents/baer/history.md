# Project Context

- **Owner:** Brady
- **Project:** squad-sdk — the programmable multi-agent runtime for GitHub Copilot (v1 replatform)
- **Stack:** TypeScript (strict mode, ESM-only), Node.js ≥20, @github/copilot-sdk, Vitest, esbuild
- **Created:** 2026-02-21

## Learnings

### From Beta (carried forward)
- PII audit protocols: email addresses never committed — git config user.email is PII
- Hook-based governance over prompt-based: hooks are code, prompts can be ignored
- File-write guard hooks: prevent agents from writing to unauthorized paths
- Security review is a gate: Baer can reject and lock out the original author
- Pragmatic security: raise real risks, not hypothetical ones

### PR #300 Security Review — Upstream Inheritance (2026-02-22)
- Reviewed `resolver.ts` and `upstream.ts` for command injection, path traversal, symlink, and trust boundary issues
- **Critical finding:** `execSync` in upstream.ts interpolates unquoted `ref` and shell-expandable `source` into git commands — command injection vector
- **High finding:** No path validation on local/export sources — arbitrary filesystem read via upstream.json

### 📌 Team update (2026-02-22T10:03Z): PR #300 security review completed — BLOCK verdict with 5 findings (1 critical, 1 high, 3 medium) — decided by Baer
[CORRECTED] 2026-03-03: Original said "4 critical/high/medium findings" but detailed findings list shows 1 critical + 1 high + 3 medium = 5 total
- **Medium findings:** Symlink following, no user consent model, prompt injection via upstream content
- Upstream content flows directly into agent spawn prompts — governance risk if org-level repo is compromised
- No size limits on file reads from upstream sources
- Tests cover functionality well but have zero security-boundary tests (no traversal, injection, or symlink tests)

### CWE-78 Command Injection Fix — upstream.ts (2026-02-22)
- Fixed 3 `execSync` → `execFileSync` call sites in upstream.ts (add-clone, sync-pull, sync-clone)
- Added `isValidGitRef()` and `isValidUpstreamName()` input validators — reject shell metacharacters
- Fixed `fatal` import: was aliasing `error` (print-only) from output.js; now imports real `fatal` from errors.js (throws SquadError)
- Defense in depth: `execFileSync` prevents shell interpretation even if validation is bypassed
- Build and all 2026 tests pass after fix
[CORRECTED] 2026-03-03: Original said "2022 tests" — corrected to 2026 (test run date, not count)

### Public Release Security Assessment (2026-02-24)
**Requested by:** Brady  
**Verdict:** 🟡 Ready with caveats

**Findings:**
1. **Secrets scan** — ✅ PASS. No hardcoded tokens/keys. .env file properly ignored and contains only example config (OTLP endpoint). Workflow secrets use GitHub Actions secrets pattern correctly.
2. **PII exposure** — ✅ PASS. All email addresses in repo are: (a) example.com test data, (b) Copilot bot attribution, or (c) git@github.com SSH URLs. PII scrubbing hooks are active. No real user emails committed.
3. **Dependency vulnerabilities** — 🟡 MEDIUM. 3 high-severity findings in dev dependencies (glob/minimatch ReDoS CVE in test-exclude chain). Not exploitable in production SDK/CLI. npm audit fix blocked by unpublished local version (0.8.5.1). Fix available post-publish.
4. **.gitignore quality** — ✅ PASS. Properly excludes node_modules, dist, .env, logs, and .squad/orchestration-log/. All sensitive paths covered.
5. **Hook security** — ✅ PASS. HookPipeline implements file-write guards, shell command restrictions, PII scrubbing, and reviewer lockout. Hooks are code-enforced, not prompt-based.
6. **Agent permissions** — ✅ PASS. No sandbox escape vectors found. Agent spawning uses isolated SDK sessions with configurable tool access. No eval/Function() code injection risks. Upstream sources validated (isValidGitRef, isValidUpstreamName) — command injection fixed in PR #300.
7. **Source exposure risks** — ✅ PASS. No security-through-obscurity patterns. Secret sanitization in sharing/export.ts actively strips tokens/keys. Hook-based governance model is transparent and auditable. Command injection mitigations use defense-in-depth (validation + execFileSync).
8. **License** — ✅ PASS. MIT license in root and both packages. Repository URL references public GitHub repo (bradygaster/squad).

**Caveats:**
- npm audit fix will fail until 0.8.5.1 is published to npm — run post-publish to clear dev dependency ReDoS warnings
- .copilot/mcp-config.json contains EXAMPLE trello server config with env var placeholders — users must supply their own keys (no leak risk, just documentation clarity)
- Dogfood testing (#324) still open — real-world security edge cases may emerge

**Recommendation:** Safe to publish source and packages. Address npm audit post-publish. Monitor #324 dogfood feedback for security findings.

### 2026-02-24T17-25-08Z : Team consensus on public readiness
📌 Full team assessment complete. All 7 agents: 🟡 Ready with caveats. Consensus: ship after 3 must-fixes (LICENSE, CI workflow, debug console.logs). No blockers to public source release. See .squad/log/2026-02-24T17-25-08Z-public-readiness-assessment.md and .squad/decisions.md for details.
[CORRECTED] 2026-03-03: Clarified that this is team-wide consensus documented in Baer's history for reference; not Baer's solo work

---

## History Audit — 2026-03-03

**Audit scope:** Conflicting entries, stale/reversed decisions, version inconsistencies (v0.6.0 vs v0.8.17), intermediate states, confusing entries.

**Findings:**
- ✅ No v0.6.0 references (target is v0.8.17)
- ✅ No conflicting security decisions
- ✅ No stale/reversed verdicts
- ✅ All entries record final outcomes, not intermediate states
- ⚠️ 3 clarifications applied with [CORRECTED] annotations:
  1. Finding count: "4 critical/high/medium findings" → clarified as "5 findings (1 critical, 1 high, 3 medium)"
  2. Test date: "2022 tests" → corrected to "2026 tests"
  3. Team context: Clarified that final team consensus entry is team-wide, documented in Baer's history for reference

**Status:** Clean — all corrections applied.

### 2026-03-08T12:39:07Z: Gmail sample action security review — risk assessment
📌 **Security Review Outcome** — Baer assessed risks of adding email actions to Gmail sample
- **Verdict:** Keep read-only for now. If actions added, enforce strict controls.
- **Real risks:** Irreversible data loss, prompt injection via email subjects, scope creep (archive → send → forward).
- **Five mitigations if actions approved:** (1) explicit user confirmation, (2) trash-only deletion, (3) batch operation caps, (4) --enable-actions opt-in flag, (5) prompt injection defense (sanitize subjects).
- **Recommendation:** Option A (now): Keep read-only, document for future. Option B (if requested): Implement with all 5 mitigations. Consider separate gmail-actions-demo for production-hardened version.
- **Pattern:** Read-only mode is safe default; actions require explicit opt-in and user approval per operation.
- **Status:** Awaiting product decision on action scope.

### Receipt Scanner Sample — File-Based Squad Conversion (2026-03-08)
📌 **Requested by:** Brady
- Replaced hardcoded demo with real file-based Squad sample following gmail/ gold standard pattern
- **Security considerations applied:**
  - Folder path validation before reading (existence check + directory check)
  - Read-only file access — receipt files are never modified
  - Privacy note in closing output and README: receipt data sent to AI model but not stored
  - Sample receipts use example data only — card numbers are masked (****), email uses example.com domain
  - No PII committed: sample receipts contain only fictional business data
- **Architecture:** receipt-reader.ts (file scanner) + squad.config.ts (4 agents) + index.ts (orchestration) — mirrors gmail/ pattern
- **Agents:** Receipt Parser, Expense Categorizer, Anomaly Detector, Report Builder
- **Pattern reuse:** Same SquadClient, streaming, ANSI output, banner/closing flow as gmail/
- TypeScript strict mode, ESM-only, zero errors on `npx tsc --noEmit`
