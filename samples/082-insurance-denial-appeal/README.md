# Insurance Denial Appeal

> Draft medical insurance denial appeals with supporting documentation

## Who This Is For

🏥 Healthcare/Everyone

## The Team

| Agent | Role | What They Do |
|-------|------|-------------|
| AdvocateBot | Writer | Domain expert for insurance denial appeal |
| PolicyExpert | Grader | Domain expert for insurance denial appeal |
| AppealWriter | Updater | Domain expert for insurance denial appeal |

## How It Works

1. **Write** — AdvocateBot reads `spec.md` and produces the first draft
2. **Grade** — PolicyExpert evaluates the output (1-100 score)
3. **Update** — If score < 90%, AppealWriter improves the output
4. **Repeat** — Loop continues until quality threshold is met

## See It In Action

> From "My doctor prescribed this because I need it" to a comprehensive 5-page appeal with specific policy citations (HF-2847392, Section 5.3), clinical data (AHI 38, 90-day CPAP failure), Medicare LCD guidelines, Oregon insurance law, and an 8-exhibit documentation checklist ready to submit.

📄 **[See the full example output →](examples/sample-output.md)**

## Running This Sample

```bash
npm install
npm start
```

## Output

Results are saved in the `output/` directory.
