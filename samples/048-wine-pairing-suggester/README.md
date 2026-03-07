# Wine Pairing Suggester

> Suggest wine pairings for meals with educational tasting notes

## Who This Is For

🍳 Foodies

## The Team

| Agent | Role | What They Do |
|-------|------|-------------|
| Sommelier | Writer | Domain expert for wine pairing suggester |
| Educator | Grader | Domain expert for wine pairing suggester |
| BudgetAdvisor | Updater | Domain expert for wine pairing suggester |

## How It Works

1. **Write** — Sommelier reads `spec.md` and produces the first draft
2. **Grade** — Educator evaluates the output (1-100 score)
3. **Update** — If score < 90%, BudgetAdvisor improves the output
4. **Repeat** — Loop continues until quality threshold is met

## See It In Action

Here's what the agent team produced for Maria's salmon dinner party:

> **Primary pairing**: Chablis (unoaked Chardonnay) - $28. High acidity cuts through fatty salmon and butter sauce while citrus notes echo the lemon. **Why it works**: Complement + contrast principles. Alternatives at $14 (Albariño) and $50 (Premier Cru). Includes wine shop script so you don't feel intimidated: "Hi! I'm making pan-seared salmon..."

> 📄 **[See the full example output →](examples/sample-output.md)**

## Running This Sample

```bash
npm install
npm start
```

## Output

Results are saved in the `output/` directory.
