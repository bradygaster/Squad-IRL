# Room Redesign Planner

> Create room makeover plans with furniture layout, color schemes, and shopping list

## Who This Is For

🏠 Homeowners

## The Team

| Agent | Role | What They Do |
|-------|------|-------------|
| Designer | Writer | Domain expert for room redesign planner |
| SpacePlanner | Grader | Domain expert for room redesign planner |
| BudgetKeeper | Updater | Domain expert for room redesign planner |

## How It Works

1. **Write** — Designer reads `spec.md` and produces the first draft
2. **Grade** — SpacePlanner evaluates the output (1-100 score)
3. **Update** — If score < 90%, BudgetKeeper improves the output
4. **Repeat** — Loop continues until quality threshold is met

## See It In Action

Marcus has a dark 11×12 bedroom with a mattress on the floor and a folding table for a desk. The agents transformed it into a bright Scandinavian-style bedroom/office with a dimensioned floor plan, three-layer lighting system, and an itemized shopping list totaling $2,143 — leaving $357 for an optional mattress upgrade.

> 📄 **[See the full example output →](examples/sample-output.md)**

## Running This Sample

```bash
npm install
npm start
```

## Output

Results are saved in the `output/` directory.
