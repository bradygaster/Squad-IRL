# Ab Test Analyzer

> Analyze A/B test results and recommend decisions with statistical rigor

## Who This Is For

📊 Data/Business

## The Team

| Agent | Role | What They Do |
|-------|------|-------------|
| Statistician | Writer | Domain expert for ab test analyzer |
| Interpreter | Grader | Domain expert for ab test analyzer |
| DecisionAdvisor | Updater | Domain expert for ab test analyzer |

## How It Works

1. **Write** — Statistician reads `spec.md` and produces the first draft
2. **Grade** — Interpreter evaluates the output (1-100 score)
3. **Update** — If score < 90%, DecisionAdvisor improves the output
4. **Repeat** — Loop continues until quality threshold is met

## See It In Action

Here's what the agent team produced for Marcus's checkout flow redesign test:

> **Results**: Treatment lifted conversion +2.48% (p=0.031, statistically significant). **Red flag**: Desktop users showed -0.8pp decrease. **Revenue impact**: $4.59M annually for mobile. **Recommendation**: 🚀 Ship to mobile only. Run separate desktop test. **Why**: Mobile drives the win (+7.1% lift), desktop needs modified treatment.

> 📄 **[See the full example output →](examples/sample-output.md)**

## Running This Sample

```bash
npm install
npm start
```

## Output

Results are saved in the `output/` directory.
