# Stream Highlight Clipper

> Identify and caption highlight-worthy moments from gaming streams

## Who This Is For

🎮 Gamers/Streamers

## The Team

| Agent | Role | What They Do |
|-------|------|-------------|
| ClipSpotter | Writer | Domain expert for stream highlight clipper |
| Editor | Grader | Domain expert for stream highlight clipper |
| TitleWriter | Updater | Domain expert for stream highlight clipper |

## How It Works

1. **Write** — ClipSpotter reads `spec.md` and produces the first draft
2. **Grade** — Editor evaluates the output (1-100 score)
3. **Update** — If score < 90%, TitleWriter improves the output
4. **Repeat** — Loop continues until quality threshold is met

## See It In Action

Here's what the agent team produced for Jake's 4-hour Apex stream:

> **Top Clip**: 1v3 clutch with 1 HP (1:23:42-1:24:18, 36 sec). Viral potential: 🔥🔥🔥🔥🔥. **Title**: "1v3 CLUTCH WITH 1 HP IN DIAMOND (I SCREAMED)". **7 clips identified**, ranked by viral potential, with exact timestamps, platform optimization, thumbnail frames, and hashtag strategies. Estimated editing time: 2-3 hours for all clips.

> 📄 **[See the full example output →](examples/sample-output.md)**

## Running This Sample

```bash
npm install
npm start
```

## Output

Results are saved in the `output/` directory.
