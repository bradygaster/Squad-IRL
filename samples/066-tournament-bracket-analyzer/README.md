# Tournament Bracket Analyzer

> Analyze tournament matchups and predict outcomes with confidence levels

## Who This Is For

🎮 Gamers/Sports

## The Team

| Agent | Role | What They Do |
|-------|------|-------------|
| Scout | Writer | Domain expert for tournament bracket analyzer |
| StatAnalyst | Grader | Domain expert for tournament bracket analyzer |
| OddsCalculator | Updater | Domain expert for tournament bracket analyzer |

## How It Works

1. **Write** — Scout reads `spec.md` and produces the first draft
2. **Grade** — StatAnalyst evaluates the output (1-100 score)
3. **Update** — If score < 90%, OddsCalculator improves the output
4. **Repeat** — Loop continues until quality threshold is met

## See It In Action

A basic bracket predictor just picks higher seeds. This squad dissects head-to-head histories, analyzes play-style matchups, and assigns calibrated confidence levels — turning a 16-team tournament into a round-by-round breakdown with upset alerts and Cinderella storylines you'd actually bet on.

> 📄 **[See the full example output →](examples/sample-output.md)**

## Running This Sample

```bash
npm install
npm start
```

## Output

Results are saved in the `output/` directory.
