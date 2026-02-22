# Migration Guide: Beta to v1

> **⚠️ INTERNAL ONLY — DO NOT PUBLISH**

Squad v1 is a replatform from the monolithic Agent framework to a programmable SDK with independent versioning. This guide walks you through migrating from beta (`@bradygaster/squad-sdk` v0.x) to v1.

## What Changed

### 1. Directory Structure: `.ai-team/` → `.squad/`

**Beta:** `.ai-team/` directory for all team state
**v1:** `.squad/` directory (required)

**Why:** "Squad" is the product name. Clearer, more memorable.

### 2. Package Names

| Beta | v1 | Installs |
|------|----|----|
| `@bradygaster/squad-sdk` (monolithic) | `@bradygaster/squad-sdk` (new SDK) | `npm install @bradygaster/squad-sdk` |
| CLI baked into SDK | `@bradygaster/squad-cli` (separate) | `npm install -g @bradygaster/squad-cli` |
| Agent framework on Copilot | No change; uses both SDKs | Already configured in VS Code/CLI |

**New install:**
```bash
npm install @bradygaster/squad-sdk    # Core runtime (library)
npm install -g @bradygaster/squad-cli # Global CLI (binary)
```

### 3. CLI Commands

| Beta | v1 | Status |
|------|----|----|
| `npx squad init` | `squad init` | ✅ Same, now global |
| `npx squad upgrade` | `squad upgrade` | ✅ Same, now global |
| `npx squad status` | `squad status` | ✅ Same, now global |
| `npx squad watch` | `squad watch` | ✅ Same, now global |
| `.ai-team/` auto-creation | `squad init --global` | ✅ New: personal squad flag |
| Legacy path `.ai-team/` | Rename with `squad upgrade --migrate-directory` | ✅ Automated migration |

### 4. Configuration Files

#### Beta Config (`.ai-team/squad.agent.md`)

```markdown
# squad.agent.md — 32KB monolithic coordinator prompt
[Long unstructured prompt]
```

#### v1 Config (no longer needed for basic setup)

Team state still lives in `.squad/agents/`, but you can add a `squad.config.ts` at project root (optional):

```typescript
import { defineConfig } from '@bradygaster/squad-sdk';

export default defineConfig({
  team: {
    name: 'my-squad',
    root: '.squad',
  },
  routing: {
    workTypes: [
      { pattern: /\bAPI\b/i, targets: ['backend'], tier: 'standard' },
    ],
  },
});
```

**Key difference:** v1 uses **programmatic configuration** (Zod-validated) instead of markdown-based coordination. The 32KB prompt is gone; routing and agent selection are deterministic.

### 5. Agent Charter Format

**Beta:** `.ai-team/agents/{name}/charter.md` (freeform)

**v1:** `.squad/agents/{name}/charter.md` (structured)

Both still use markdown, but v1 enforces sections:

```markdown
# {Name} — {Role}

## Identity
- Name: {name}
- Role: {role}
- Expertise: {...}

## Knowledge
[What this agent knows]

## Tools
[Allowed tools]

## Collaboration
[How this agent works with others]
```

**Migration:** Your beta charters still work (backward compatible), but new agents onboarded via `squad init` use the v1 structure.

### 6. Package Distribution

**Beta:** GitHub-native only
```bash
npx github:bradygaster/squad-sdk init
```

**v1:** npm-first with GitHub fallback
```bash
npm install -g @bradygaster/squad-cli
squad init

# Or legacy:
npx github:bradygaster/squad init
```

**Recommendation:** Use npm for faster installs and better dependency management.

## Step-by-Step Migration Checklist

### ✅ Prerequisites

- Node.js ≥ 20
- GitHub auth (for Issues, PRs): `gh auth login`
- Existing squad in `.ai-team/` (beta)

### 1. Backup Your Team

```bash
# Export current squad state (snapshot)
squad export --output squad-backup.json
# (or use git commit)
```

### 2. Install v1 CLI

```bash
npm install -g @bradygaster/squad-cli@latest
# Verify
squad --version
```

### 3. Rename Directory (Automated)

```bash
# From your project root:
squad upgrade --migrate-directory
# This renames .ai-team/ → .squad/
```

**What it does:**
- Moves `.ai-team/agents/` → `.squad/agents/`
- Moves `.ai-team/casting/` → `.squad/casting/`
- Moves `.ai-team/skills/` → `.squad/skills/`
- Moves `.ai-team/decisions/` → `.squad/decisions/`
- Keeps `.ai-team-templates/` for rollback reference
- Updates `.gitignore` to ignore `.squad/` instead

**If something goes wrong:**
```bash
# Rollback: directory was renamed; old .ai-team/ backed up
rm -rf .squad/
mv .ai-team-backup/ .ai-team/  # if command created a backup
```

### 4. Upgrade Squad Files

```bash
squad upgrade
# Updates: .squad-templates/, squad.agent.md (if present)
# Never touches: .squad/agents/, .squad/decisions/, etc. (your state)
```

### 5. Test the Team

```bash
# Launch shell and verify agents load
squad
# (in shell)
> @{agent-name}  (try mentioning an agent)
```

If agents load and respond, you're good.

### 6. Update Your Imports (If Using SDK Directly)

If you wrote code that imports `@bradygaster/squad-sdk` in beta, update the imports:

**Beta:**
```typescript
import { SquadCoordinator, loadConfig, VERSION } from '@bradygaster/squad-sdk';
```

**v1:** (same API, just verify it's installed)
```bash
npm install @bradygaster/squad-sdk
```

```typescript
import { SquadCoordinator, loadConfig, VERSION } from '@bradygaster/squad-sdk';
// Same API, should work as-is
```

### 7. Update Scripts (If Needed)

If you have scripts that invoke squad CLI:

**Beta:**
```bash
npx squad init
npx squad watch
```

**v1:**
```bash
squad init      # Works if installed globally
squad watch
# Or with npx:
npx @bradygaster/squad-cli init
npx @bradygaster/squad-cli watch
```

### 8. Verify Agent History

Your agent history files (`.squad/agents/{name}/history.md`) carry over as-is. Learnings are preserved.

### 9. Verify Decisions

Decisions in `.squad/decisions/` are preserved. The decision format hasn't changed.

### 10. Commit Changes

```bash
git add .squad/ .gitignore
git commit -m "chore: migrate beta squad to v1 (.ai-team → .squad)"
```

## What's New in v1

### Deterministic Routing

v1 replaces the 32KB `squad.agent.md` prompt-based coordinator with programmatic routing. Responses are faster and more predictable.

### OTel Observability

Export traces to Aspire dashboard:

```typescript
import { initSquadTelemetry } from '@bradygaster/squad-sdk';

const telemetry = await initSquadTelemetry({
  endpoint: 'http://localhost:4318',
});

// Run your agents... traces flow to Aspire

await telemetry.shutdown();
```

### Upstream Inheritance

Share practices across teams:

```bash
squad upstream add https://github.com/acme/platform-squad.git --name platform
# Now all agents inherit skills, decisions, and routing from platform
```

### Response Tiers

Control complexity based on task:

```typescript
import { selectResponseTier } from '@bradygaster/squad-sdk';

const tier = selectResponseTier({ complexity: 'high', budget: 10 });
// tier: 'standard' or 'full' → use multi-agent orchestration
```

### Independent Versioning

- `@bradygaster/squad-sdk` and `@bradygaster/squad-cli` have separate semver
- Update CLI without updating SDK and vice versa
- Backward compatibility maintained across minor versions

## Troubleshooting

### "squad: command not found"

**Cause:** CLI not installed globally

**Fix:**
```bash
npm install -g @bradygaster/squad-cli
# Or use npx:
npx @bradygaster/squad-cli init
```

### "Cannot find .squad/ directory"

**Cause:** Migration didn't complete

**Fix:**
```bash
# Check if .ai-team/ still exists
ls -la | grep -E '\.ai-team|\.squad'

# If .ai-team/ exists, retry migration
squad upgrade --migrate-directory

# If both exist, manually rename (careful!):
mv .ai-team/ .squad/
```

### Agent won't load after migration

**Cause:** Agent files got corrupted in rename

**Fix:**
1. Check charter exists: `cat .squad/agents/{name}/charter.md`
2. Check history exists: `cat .squad/agents/{name}/history.md`
3. If missing, restore from backup: `squad import squad-backup.json`
4. If backup missing, re-init that agent: `squad init`

### "Model unavailable" errors

**Cause:** v1 has different model defaults

**Fix:**
1. Check `squad status` output for available models
2. Update `.squad/agents/{name}/charter.md` model field if needed
3. Or use `squad.config.ts` to override model selection globally

### Old imports still work but deprecated warnings

**Cause:** Some beta APIs re-exported for compatibility

**Fix:**
- No action needed; they'll be removed in v1.1
- Silence warnings by updating imports to import from specific modules instead of barrel exports

## FAQ

**Q: Do I need to recreate my agents?**
A: No. Agents in `.ai-team/agents/` carry over to `.squad/agents/`. Just run `squad upgrade --migrate-directory`.

**Q: Will my scripts break?**
A: If you call `squad` commands, just make sure to install the CLI globally or use `npx @bradygaster/squad-cli`. SDK API is the same.

**Q: Can I run beta and v1 side-by-side?**
A: No. They both use `@bradygaster/squad-sdk` and `@bradygaster/squad-cli`. Upgrade one project at a time.

**Q: What about the old Agent framework?**
A: It still powers agent execution in Copilot. v1 is a new SDK wrapper + CLI + observability. The framework itself is unchanged.

**Q: Is there a rollback plan?**
A: Yes. The migration command creates a `.ai-team-templates/` backup. You can manually rename `.squad/` back to `.ai-team/` and reinstall v0.x if needed.

**Q: When does beta support end?**
A: Beta is no longer maintained. Migrate to v1 for bug fixes, new features, and OTel observability.
