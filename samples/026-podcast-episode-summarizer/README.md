# Podcast Episode Summarizer

> Listen to podcasts and generate actionable summaries with timestamps

## Who This Is For

📱 Content/Everyone

## The Team

| Agent | Role | What They Do |
|-------|------|-------------|
| Listener | Writer | Domain expert for podcast episode summarizer |
| KeyPointExtractor | Grader | Domain expert for podcast episode summarizer |
| ActionItemFinder | Updater | Domain expert for podcast episode summarizer |

## How It Works

1. **Write** — Listener reads `spec.md` and produces the first draft
2. **Grade** — KeyPointExtractor evaluates the output (1-100 score)
3. **Update** — If score < 90%, ActionItemFinder improves the output
4. **Repeat** — Loop continues until quality threshold is met

## See It In Action

**Alex listened to a 2-hour Tim Ferriss episode with Andrew Huberman about sleep optimization but couldn't remember the details.** The agents created a comprehensive summary with full timestamps, specific protocols (10-30 min morning sunlight, delay coffee 90-120 min, bedroom at 65-68°F), and actionable steps. **The result: jump directly to any topic via timestamp, plus a "Tonight's Protocol" checklist with 5 things to do immediately.**

> 📄 **[See the full example output →](examples/sample-output.md)**

## Running This Sample

```bash
npm install
npm start
```

## Output

Results are saved in the `output/` directory.
