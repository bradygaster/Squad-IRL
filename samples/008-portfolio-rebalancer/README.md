# Portfolio Rebalancer

> Analyze current holdings and suggest trades to reach target allocation

## Who This Is For

💰 Finance

## The Team

| Agent | Role | What They Do |
|-------|------|-------------|
| Analyst | Writer | Domain expert for portfolio rebalancer |
| RiskManager | Grader | Domain expert for portfolio rebalancer |
| TaxOptimizer | Updater | Domain expert for portfolio rebalancer |

## How It Works

1. **Write** — Analyst reads `spec.md` and produces the first draft
2. **Grade** — RiskManager evaluates the output (1-100 score)
3. **Update** — If score < 90%, TaxOptimizer improves the output
4. **Repeat** — Loop continues until quality threshold is met

## See It In Action

Lisa's portfolio drifted to 72% stocks after the bull market (target: 60%). The first rebalance plan would've triggered $4,200 in unnecessary capital gains taxes. The agents rebuilt it to harvest $12,000 in tax losses (saving $3,000 in taxes), avoid wash sale violations, and hit her targets: 60.2% stocks / 29.8% bonds / 10.0% cash.

> 📄 **[See the full example output →](examples/sample-output.md)**

## Running This Sample

```bash
npm install
npm start
```

## Output

Results are saved in the `output/` directory.
