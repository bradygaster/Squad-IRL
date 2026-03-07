# Pet Health Tracker

> Track vet visits, medications, and generate vet appointment prep notes

## Who This Is For

🐕 Pet Owners

## The Team

| Agent | Role | What They Do |
|-------|------|-------------|
| VetTech | Writer | Domain expert for pet health tracker |
| Historian | Grader | Domain expert for pet health tracker |
| QuestionGenerator | Updater | Domain expert for pet health tracker |

## How It Works

1. **Write** — VetTech reads `spec.md` and produces the first draft
2. **Grade** — Historian evaluates the output (1-100 score)
3. **Update** — If score < 90%, QuestionGenerator improves the output
4. **Repeat** — Loop continues until quality threshold is met

## See It In Action

Bella (7-year-old golden retriever) had recurring ear infections but the pattern wasn't clear. The agents analyzed her history and found: 4 infections in 18 months, all in summer (seasonal allergies), 11 lb weight gain, and overdue dental cleaning. Generated 8 specific vet questions. Result: Vet confirmed allergies, prescribed new diet. Bella's back to healthy weight.

> 📄 **[See the full example output →](examples/sample-output.md)**

## Running This Sample

```bash
npm install
npm start
```

## Output

Results are saved in the `output/` directory.
