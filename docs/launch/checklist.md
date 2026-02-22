# v0.6.0 Launch Checklist

> ⚠️ **INTERNAL ONLY** — Do not share outside the Squad team.

## Pre-Launch Verification

### Build & Tests
- [ ] All 1400+ tests passing (`npm test`)
- [ ] Build clean on Node 20+ (`npm run build`)
- [ ] TypeScript strict mode — zero errors (`tsc --noEmit`)

### Config & Migration
- [ ] Config migration tested (v0.4 → v0.6)
- [ ] Squad directory structure working (`.squad/`)
- [ ] Export/import roundtrip verified
- [ ] `defineConfig()` helper works in consumer repos

### Security & Validation
- [ ] Security validation rules passing
- [ ] Hook allowlists enforced (`allowedWritePaths`, `blockedCommands`)
- [ ] No secrets in published package

### Manual Testing
- [ ] Manual test script 01 — Init & config load
- [ ] Manual test script 02 — Agent routing
- [ ] Manual test script 03 — Multi-agent casting
- [ ] Manual test script 04 — Legacy migration
- [ ] Manual test script 05 — npm install + build
- [ ] All manual scripts executed by Brady

### Performance
- [ ] Performance benchmarks within targets
- [ ] Config load < 50ms
- [ ] Routing match < 10ms per message

### Documentation & Packaging
- [ ] CHANGELOG updated
- [ ] README updated with v1 instructions
- [ ] npm `package.json` validated for publication
- [ ] GitHub release artifacts ready
- [ ] API documentation generated and reviewed

## Sign-off

| Role          | Name   | Date | Status  |
|---------------|--------|------|---------|
| Lead          | Keaton |      | Pending |
| QA / Manual   | Brady  |      | Pending |
| Prompt Eng.   | Verbal |      | Pending |
