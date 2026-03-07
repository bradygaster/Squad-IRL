# Birthday Party Planner

> Plan kids' birthday parties with themes, activities, shopping lists, and timeline

## Who This Is For

👩‍👧‍👦 Parents

## The Team

| Agent | Role | What They Do |
|-------|------|-------------|
| PartyPlanner | Writer | Domain expert for birthday party planner |
| ActivityExpert | Grader | Domain expert for birthday party planner |
| BudgetBoss | Updater | Domain expert for birthday party planner |

## How It Works

1. **Write** — PartyPlanner reads `spec.md` and produces the first draft
2. **Grade** — ActivityExpert evaluates the output (1-100 score)
3. **Update** — If score < 90%, BudgetBoss improves the output
4. **Repeat** — Loop continues until quality threshold is met

## See It In Action

Here's what the agent team produced for Lily's 7th birthday unicorn party:

> **3-hour timeline** (2-5pm): Unicorn treasure hunt (30 min), craft station (30 min), freeze dance + pin-the-horn (25 min), pizza/cake (30 min), free play (35 min). **Complete shopping list**: $387 total (under $400 budget). **Day-before & day-of checklists**. Includes "what could go wrong" troubleshooting. Result: Zero stress, maximum fun.

> 📄 **[See the full example output →](examples/sample-output.md)**

## Running This Sample

```bash
npm install
npm start
```

## Output

Results are saved in the `output/` directory.
