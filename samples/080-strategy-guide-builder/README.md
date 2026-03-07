# Strategy Guide Builder

> Create comprehensive game strategy guides with tips and tactics

## Who This Is For

🎮 Gamers

## The Team

| Agent | Role | What They Do |
|-------|------|-------------|
| ProGamer | Writer | Domain expert for strategy guide builder |
| Researcher | Grader | Domain expert for strategy guide builder |
| GuideWriter | Updater | Domain expert for strategy guide builder |

## How It Works

1. **Write** — ProGamer reads `spec.md` and produces the first draft
2. **Grade** — Researcher evaluates the output (1-100 score)
3. **Update** — If score < 90%, GuideWriter improves the output
4. **Repeat** — Loop continues until quality threshold is met

## See It In Action

Most game guides are either a wall of text nobody reads or a bare-bones wiki stub. This squad produces a structured strategy guide with beginner-friendly fundamentals, advanced tactics for each phase of play, matchup-specific tips, and common mistake callouts — organized so you can find exactly what you need mid-session. Think less "generic tips list" and more "the guide your favorite streamer would write."

> 📄 **[See the full example output →](examples/sample-output.md)**

## Running This Sample

```bash
npm install
npm start
```

## Output

Results are saved in the `output/` directory.
