# Migration Guide: GitHub-native to npm

> ⚠️ **Experimental** — Squad is alpha software. APIs, commands, and behavior may change between releases.


## Why Migrate?

The Squad SDK has moved from GitHub-native distribution to npm packages. Benefits:
- Faster installs (npm cache, no git clone)
- Standard dependency management
- Semantic versioning with insider/stable channels
- Works with all npm-compatible package managers (npm, yarn, pnpm)

## Before (GitHub-native)

```bash
npx github:bradygaster/squad
```

## After (npm)

### Install the CLI globally
```bash
npm install -g @bradygaster/squad-cli
```

### Or use npx (no install)
```bash
npx @bradygaster/squad-cli
```

### For SDK integration
```bash
npm install @bradygaster/squad-sdk
```

## Insider Channel

To use the bleeding-edge insider builds:
```bash
npm install @bradygaster/squad-cli@insider
npm install @bradygaster/squad-sdk@insider
```

## What Changed

| Aspect | GitHub-native | npm |
|--------|--------------|-----|
| Install | `npx github:bradygaster/squad` | `npm i -g @bradygaster/squad-cli` |
| SDK | bundled | `@bradygaster/squad-sdk` (separate) |
| Updates | always latest commit | semver, explicit upgrade |
| Channels | N/A | `latest`, `insider` |
| Speed | clone on every run | cached, fast |

## Troubleshooting

### "command not found: squad"
Run `npm install -g @bradygaster/squad-cli` to install globally.

### Using the old GitHub URL
The GitHub-native distribution will be deprecated. Update your scripts and docs.
