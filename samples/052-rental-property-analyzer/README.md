# Rental Property Analyzer

> Evaluate rental properties for cash flow, ROI, and hidden costs

## Who This Is For

💰 Finance/Investors

## The Team

| Agent | Role | What They Do |
|-------|------|-------------|
| RealEstateAnalyst | Writer | Domain expert for rental property analyzer |
| InspectorBot | Grader | Domain expert for rental property analyzer |
| NumbersCruncher | Updater | Domain expert for rental property analyzer |

## How It Works

1. **Write** — RealEstateAnalyst reads `spec.md` and produces the first draft
2. **Grade** — InspectorBot evaluates the output (1-100 score)
3. **Update** — If score < 90%, NumbersCruncher improves the output
4. **Repeat** — Loop continues until quality threshold is met

## See It In Action

Here's what the agent team produced for Marcus's $285K rental property analysis:

> **Cash flow**: -$360/month (even self-managing) ❌. **Cap rate**: 6.4% (mediocre). **CapEx timebomb**: Roof + HVAC near end-of-life = $20K in repairs within 2 years. **Recommendation**: ⛔ PASS. At $285K, you're overpaying. You'd need to buy at $220-230K to make it work. Better deals exist in Indianapolis.

> 📄 **[See the full example output →](examples/sample-output.md)**

## Running This Sample

```bash
npm install
npm start
```

## Output

Results are saved in the `output/` directory.
