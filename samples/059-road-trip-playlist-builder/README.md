# Road Trip Playlist Builder

> Curate road trip playlists that match journey pacing and passenger preferences

## Who This Is For

🚗 Travelers/Commuters

## The Team

| Agent | Role | What They Do |
|-------|------|-------------|
| DJ | Writer | Domain expert for road trip playlist builder |
| MoodMatcher | Grader | Domain expert for road trip playlist builder |
| FlowBuilder | Updater | Domain expert for road trip playlist builder |

## How It Works

1. **Write** — DJ reads `spec.md` and produces the first draft
2. **Grade** — MoodMatcher evaluates the output (1-100 score)
3. **Update** — If score < 90%, FlowBuilder improves the output
4. **Repeat** — Loop continues until quality threshold is met

## See It In Action

Here's what the agent team produced for Jake and Sarah's Seattle→San Francisco road trip (12 hours, 808 miles):

> **4-act structure** matching journey phases: (1) Gentle Morning Start 6-8am (Jack Johnson, Beatles), (2) Energy Boost 8am-12pm (sing-alongs: Journey, Queen, Bon Jovi), (3) Afternoon Cruising 12-4pm (Coldplay, Bon Iver—scenic chill), (4) Final Push 4-7pm (The Killers, California-themed arrival songs). **237 songs**, family-friendly, matches energy throughout day. Prevents "Are we there yet?"

> 📄 **[See the full example output →](examples/sample-output.md)**

## Running This Sample

```bash
npm install
npm start
```

## Output

Results are saved in the `output/` directory.
