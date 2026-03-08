# Bug Triage — GitHub Issues Edition

A Squad-powered GitHub issue triage system — fetches real open issues from any repo using the `gh` CLI and triages them with a team of AI specialists.

## What It Does

| Agent | Role | What It Does |
|-------|------|-------------|
| **Issue Classifier** | Categorisation | Bug / Feature Request / Question / Enhancement / Documentation. Severity: Critical / High / Medium / Low |
| **Duplicate Detector** | Deduplication | Compares issues to each other, flags likely duplicates with evidence |
| **Triage Advisor** | Action Planner | Recommends: Fix Now / Schedule / Needs Info / Close as Duplicate / Won't Fix. Suggests team routing |
| **Summary Reporter** | Dashboard | Severity counts, duplicate pairs, top-5 priority list, trend analysis |

## Prerequisites

1. **Node.js ≥ 20**
2. **GitHub CLI (`gh`)** — [Install](https://cli.github.com), then authenticate:
   ```bash
   gh auth login
   ```
3. **GitHub Copilot** — installed and authenticated:
   ```bash
   npm install -g @github/copilot
   copilot auth login
   ```

## Running

```bash
npm install
npm start        # runs: npx tsx index.ts
```

The app will:
1. Check that `gh` is installed and authenticated
2. Ask which repo to triage (auto-detects from git remote)
3. Fetch the 5 most recent open issues using `gh issue list`
4. Send them to the four-agent triage squad
5. Stream back a complete triage with classification, duplicates, action plan, and dashboard

## Read-Only

This sample **never modifies issues** — it only reads and analyses. Safe to run against any repo you have access to.

## Extension Ideas

- **Auto-label issues** based on classification results
- **Comment triage notes** directly on each issue via `gh issue comment`
- **Assign issues** based on code ownership (CODEOWNERS file)
- **Run on a schedule** to triage new issues every morning
- **Track triage history** to measure backlog health over time

## How It Works

The app uses the Squad SDK (`@bradygaster/squad-sdk`) to connect to GitHub Copilot with a multi-agent configuration defined in `squad.config.ts`. The `gh` CLI handles all GitHub API communication — no tokens or API keys needed beyond your existing `gh` authentication.

### Files

| File | Purpose |
|------|---------|
| `index.ts` | Main orchestration — banner, repo detection, issue fetch, squad session |
| `squad.config.ts` | Four agent definitions with detailed charters, routing rules, ceremonies |
| `issue-fetcher.ts` | GitHub CLI integration — `gh` validation, repo detection, issue fetching |
| `package.json` | Dependencies: squad-sdk, tsx, typescript |
