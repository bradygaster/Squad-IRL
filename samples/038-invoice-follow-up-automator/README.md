# Invoice Follow Up Automator

> Draft polite but firm invoice follow-up emails escalating appropriately

## Who This Is For

🏪 Small Business

## The Team

| Agent | Role | What They Do |
|-------|------|-------------|
| Collector | Writer | Domain expert for invoice follow up automator |
| DiplomatBot | Grader | Domain expert for invoice follow up automator |
| EscalationExpert | Updater | Domain expert for invoice follow up automator |

## How It Works

1. **Write** — Collector reads `spec.md` and produces the first draft
2. **Grade** — DiplomatBot evaluates the output (1-100 score)
3. **Update** — If score < 90%, EscalationExpert improves the output
4. **Repeat** — Loop continues until quality threshold is met

## See It In Action

Sarah's $4,750 invoice is 60 days overdue with no response. The agents built a 4-step escalation sequence — from a warm "Happy New Year" email to a certified final demand letter — with a phone call script, three payment options at every step, and a decision tree for when to file in small claims court.

> 📄 **[See the full example output →](examples/sample-output.md)**

## Running This Sample

```bash
npm install
npm start
```

## Output

Results are saved in the `output/` directory.
