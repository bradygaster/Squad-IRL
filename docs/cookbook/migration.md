# Migration & Troubleshooting

> ⚠️ **Experimental** — Squad is alpha software. APIs, commands, and behavior may change between releases.


Upgrade paths, beta-to-v1 migration, npm migration, and common fixes.

---

## Version Upgrade Path

### Upgrading Squad

Run from your repo root:

```bash
squad upgrade
```

Squad updates only Squad-owned files. **Your `.squad/` directory is never touched.**

| File | Updated? |
|------|:--------:|
| `.github/agents/squad.agent.md` | ✅ Yes |
| `.squad-templates/` | ✅ Yes |
| `.github/workflows/squad-*.yml` | ✅ Yes |
| `.squad/` (team state) | ❌ Never |

Migrations are **additive** and **idempotent** — safe to re-run.

### Checking Your Version

```bash
squad --version
```

### Pinning a Version

```bash
npm install -g @bradygaster/squad-cli@1.2.3
```

---

## Migrating from GitHub-Native to npm

### Before (GitHub-native)

```bash
npx github:bradygaster/squad
```

### After (npm)

```bash
npm install -g @bradygaster/squad-cli   # Global install
npx @bradygaster/squad-cli init          # Or one-off
npm install @bradygaster/squad-sdk       # SDK for programmatic use
```

**Why migrate?** Faster installs (npm cache), standard semver, insider/stable channels, works with yarn/pnpm.

| Aspect | GitHub-native | npm |
|--------|:------------:|:---:|
| Speed | Clone on every run | Cached, fast |
| Versioning | Always latest commit | Explicit semver |
| Channels | N/A | `latest`, `insider` |

---

## Migrating from Beta to v1

### What Changed

| Area | Beta | v1 |
|------|------|-----|
| **Directory** | `.squad/` | `.squad/` (standard) |
| **CLI** | `npx squad init` | `squad init` (global) |
| **Config** | 32KB markdown prompt | `squad.config.ts` (optional, Zod-validated) |
| **Routing** | Implicit | Compiled regex-based dispatch |
| **Observability** | None | OpenTelemetry traces + metrics |
| **Packages** | Monolithic SDK | `@bradygaster/squad-sdk` + `@bradygaster/squad-cli` |

### Step-by-Step

1. **Backup:** `squad export --output squad-backup.json`

2. **Install v1 CLI:**
   ```bash
   npm install -g @bradygaster/squad-cli@latest
   ```

3. **Migrate directory (if needed):**
   ```bash
   squad upgrade --migrate-directory
   ```

4. **Upgrade Squad files:**
   ```bash
   squad upgrade
   ```

5. **Test the team:**
   ```bash
   squad
   > @{agent-name}
   ```

6. **Update SDK imports (if using programmatically):**
   ```bash
   npm install @bradygaster/squad-sdk
   ```

7. **Update scripts:**
   ```bash
   # Before: npx squad init
   # After:  squad init
   ```

8. **Commit:**
   ```bash
   git add .squad/ .gitignore
   git commit -m "chore: migrate to Squad v1"
   ```

### What's New in v1

- **Deterministic routing** — compiled dispatch replaces prompt-based coordination
- **OTel observability** — export traces to Aspire, Jaeger, etc.
- **Upstream inheritance** — share skills across teams
- **Response tiers** — `direct`, `lightweight`, `standard`, `full`
- **Independent versioning** — update CLI and SDK separately

---

## Migrating v0.5.1 → v0.6.0

For projects on the typed SDK beta:

```typescript
// Step 1: Generate typed config from existing markdown
import { migrateMarkdownToConfig } from '@squad/sdk';
const config = await migrateMarkdownToConfig('.squad/');

// Step 2: Migrate agent docs
import { parseAgentDoc, syncDocToConfig } from '@squad/sdk';

// Step 3: Run version migrations
import { MigrationRegistry } from '@squad/sdk';
const registry = new MigrationRegistry();
await registry.migrate(config, '0.5.1', '0.6.0');

// Step 4: Validate
import { loadConfig } from '@squad/sdk';
await loadConfig(); // Throws ConfigurationError if invalid
```

---

## Common Issues & Fixes

### `squad` appears to hang

**Cause:** npm resolves `github:` specifiers via SSH. If no SSH agent is running, git prompts invisibly.

**Fix (pick one):**
```bash
# Start SSH agent
eval "$(ssh-agent -s)" && ssh-add

# Or disable npm spinner
npx --progress=false github:bradygaster/squad

# Or use HTTPS
git config --global url."https://github.com/".insteadOf git@github.com:
```

### `squad: command not found`

**Fix:**
```bash
npm install -g @bradygaster/squad-cli
# Or use npx:
npx @bradygaster/squad-cli init
```

### `Cannot find .squad/ directory`

**Fix:**
```bash
squad init              # Create in current directory
squad init --global     # Or create at ~/.squad/
```

### `gh` CLI not authenticated

**Fix:**
```bash
gh auth login
gh auth refresh -s project   # If using Project Boards
gh auth status               # Verify
```

### Node.js version too old

Squad requires Node.js 22+.

```bash
node --version
nvm install 22 && nvm use 22   # If using nvm
```

### Squad agent not appearing in Copilot

1. Verify file exists: `ls .github/agents/squad.agent.md`
2. If missing, re-run `squad`
3. Restart your Copilot session

### Upgrade doesn't change anything

You may already be on the latest. Clear cache and retry:

```bash
squad upgrade
```

### Windows-specific path errors

- Use PowerShell or Git Bash (not cmd.exe)
- Ensure `git` and `gh` are in your PATH
- Squad uses `path.join()` internally — it's Windows-safe

### Agent won't load after migration

```bash
cat .squad/agents/{name}/charter.md   # Check charter exists
cat .squad/agents/{name}/history.md   # Check history exists
squad import squad-backup.json         # Restore from backup
```

### "Model unavailable" errors

```bash
squad status   # Check available models
```

Update model references in agent charters or `squad.config.ts` to match the [model catalog](../scenarios/switching-models.md).

---

## FAQ

**Q: Do I need to recreate my agents after migrating?**
No. Agents carry over. Just run `squad upgrade --migrate-directory`.

**Q: Will my scripts break?**
Only if they use `npx squad` — update to `squad` (global) or `npx @bradygaster/squad-cli`.

**Q: Can I run beta and v1 side-by-side?**
No. Upgrade one project at a time.

**Q: Is there a rollback plan?**
Yes. Migration creates backups. Rename `.squad/` back and reinstall v0.x if needed.

**Q: When does beta support end?**
Beta is no longer maintained. Migrate for bug fixes, new features, and observability.

**Q: My `.squad/` keeps getting committed to protected branches.**
```bash
git rm --cached -r .squad/
echo ".squad/" >> .gitignore
git commit -m "chore: ensure .squad/ is untracked on this branch"
```

---

## See Also

- [CLI Reference](../reference/cli.md) — Commands and config
- [SDK Reference](../reference/sdk.md) — Programmatic API
- [Recipes & Advanced Scenarios](./recipes.md) — Prompt-driven cookbook
- [Upgrading Squad](../scenarios/upgrading.md) — Detailed upgrade walkthrough
