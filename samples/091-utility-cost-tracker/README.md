# Utility Cost Tracker

> Track utility costs and identify savings opportunities

## Who This Is For

🏠 Homeowners

## The Team

| Agent | Role | What They Do |
|-------|------|-------------|
| Auditor | Writer | Domain expert for utility cost tracker |
| TrendSpotter | Grader | Domain expert for utility cost tracker |
| SavingsHunter | Updater | Domain expert for utility cost tracker |

## How It Works

1. **Write** — Auditor reads `spec.md` and produces the first draft
2. **Grade** — TrendSpotter evaluates the output (1-100 score)
3. **Update** — If score < 90%, SavingsHunter improves the output
4. **Repeat** — Loop continues until quality threshold is met

## See It In Action

> Round 1 listed the Bergstroms' monthly costs in a table and advised "turn off lights." TrendSpotter flagged a completely missed December electricity spike (59% above the previous year), no cost-per-unit analysis, and zero comparison to Naperville averages. The revised report revealed their 15-year-old furnace as the primary cost driver (23% above regional average on gas), calculated ROI on 7 specific upgrades, and built a 12-month savings plan targeting $840–1,100 in annual reductions.

📄 **[See the full example output →](examples/sample-output.md)**

## Running This Sample

```bash
npm install
npm start
```

## Output

Results are saved in the `output/` directory.
