# Expense Categorizer

> Automatically categorize and analyze monthly spending from bank exports

## Who This Is For

💰 Finance/Everyone

## The Team

| Agent | Role | What They Do |
|-------|------|-------------|
| Accountant | Writer | Domain expert for expense categorizer |
| Detective | Grader | Domain expert for expense categorizer |
| Auditor | Updater | Domain expert for expense categorizer |

## How It Works

1. **Write** — Accountant reads `spec.md` and produces the first draft
2. **Grade** — Detective evaluates the output (1-100 score)
3. **Update** — If score < 90%, Auditor improves the output
4. **Repeat** — Loop continues until quality threshold is met

## See It In Action

Marcus spent $7,892 in February but had no idea where it went. The agents found he was spending 3x more on dining out than groceries, paying for a gym he hasn't used in 7 weeks, and bleeding $262/month on subscriptions. They identified exactly $627 in recurring savings — enough for his house down payment goal.

> 📄 **[See the full example output →](examples/sample-output.md)**

## Running This Sample

```bash
npm install
npm start
```

## Output

Results are saved in the `output/` directory.
