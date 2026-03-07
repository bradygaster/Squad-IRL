# Vendor Contract Reviewer

> Review vendor contracts for red flags and missing clauses

## Who This Is For

👰 Event Planners/Business

## The Team

| Agent | Role | What They Do |
|-------|------|-------------|
| Lawyer | Writer | Domain expert for vendor contract reviewer |
| RedFlagSpotter | Grader | Domain expert for vendor contract reviewer |
| NegotiationAdvisor | Updater | Domain expert for vendor contract reviewer |

## How It Works

1. **Write** — Lawyer reads `spec.md` and produces the first draft
2. **Grade** — RedFlagSpotter evaluates the output (1-100 score)
3. **Update** — If score < 90%, NegotiationAdvisor improves the output
4. **Repeat** — Loop continues until quality threshold is met

## See It In Action

> Lawyer's initial review used legal jargon, found only 3 of 9 red flags, and missed the most dangerous clause — an asymmetric cancellation policy forfeiting Priya's entire $2,400 deposit with zero penalty if the photographer cancels. The revised analysis caught all 9 issues with 🔴🟡🟢 severity ratings, provided specific alternative contract language for each, and included a ready-to-send negotiation email to the photographer.

📄 **[See the full example output →](examples/sample-output.md)**

## Running This Sample

```bash
npm install
npm start
```

## Output

Results are saved in the `output/` directory.
