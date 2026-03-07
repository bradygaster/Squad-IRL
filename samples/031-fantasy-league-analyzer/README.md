# Fantasy League Analyzer

> Weekly fantasy team analysis with trade suggestions and lineup optimization

## Who This Is For

🎮 Gamers/Sports

## The Team

| Agent | Role | What They Do |
|-------|------|-------------|
| Scout | Writer | Domain expert for fantasy league analyzer |
| StatNerd | Grader | Domain expert for fantasy league analyzer |
| MatchupExpert | Updater | Domain expert for fantasy league analyzer |

## How It Works

1. **Write** — Scout reads `spec.md` and produces the first draft
2. **Grade** — StatNerd evaluates the output (1-100 score)
3. **Update** — If score < 90%, MatchupExpert improves the output
4. **Repeat** — Loop continues until quality threshold is met

## See It In Action

Derek's 3-4 fantasy team is bleeding 5 points/week at TE and has no bench depth. The agents produced a full roster audit, three specific trade proposals with opening messages to send, a waiver wire priority list with FAAB bids, and an optimized Week 9 lineup projected at 120.3 points.

> 📄 **[See the full example output →](examples/sample-output.md)**

## Running This Sample

```bash
npm install
npm start
```

## Output

Results are saved in the `output/` directory.
