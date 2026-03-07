# Negotiation Script Preparer

> Prepare for salary/price negotiations with scripts and counterargument prep

## Who This Is For

Everyone

## The Team

| Agent | Role | What They Do |
|-------|------|-------------|
| Negotiator | Writer | Domain expert for negotiation script preparer |
| ResearchBot | Grader | Domain expert for negotiation script preparer |
| ConfidenceBuilder | Updater | Domain expert for negotiation script preparer |

## How It Works

1. **Write** — Negotiator reads `spec.md` and produces the first draft
2. **Grade** — ResearchBot evaluates the output (1-100 score)
3. **Update** — If score < 90%, ConfidenceBuilder improves the output
4. **Repeat** — Loop continues until quality threshold is met

## See It In Action

Here's what the agent team produced for Priya's $145K tech offer negotiation:

> **Market data**: Levels.fyi median for Senior SWE II at TechCorp is $168K (your $145K offer is 15th percentile). **Target ask**: $165K base. **5 scripted responses** to common objections. **7 non-monetary alternatives** if base is fixed. **Walk-away number**: $158K total comp. Estimated success probability: 80% for getting to $160-165K range.

> 📄 **[See the full example output →](examples/sample-output.md)**

## Running This Sample

```bash
npm install
npm start
```

## Output

Results are saved in the `output/` directory.
