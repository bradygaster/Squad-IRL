# Grocery Deals Finder

> Match weekly grocery needs to local store deals and coupons

## Who This Is For

🍳 Foodies/Budgeting

## The Team

| Agent | Role | What They Do |
|-------|------|-------------|
| DealHunter | Writer | Domain expert for grocery deals finder |
| MealPlanner | Grader | Domain expert for grocery deals finder |
| SavingsMaximizer | Updater | Domain expert for grocery deals finder |

## How It Works

1. **Write** — DealHunter reads `spec.md` and produces the first draft
2. **Grade** — MealPlanner evaluates the output (1-100 score)
3. **Update** — If score < 90%, SavingsMaximizer improves the output
4. **Repeat** — Loop continues until quality threshold is met

## See It In Action

Clipping coupons and cross-referencing three store flyers while meal planning is exhausting. This squad takes your weekly meal plan, matches ingredients to current store deals and stackable coupons, and builds an optimized shopping list sorted by store and aisle. Watch a $180 grocery run shrink to $120 with zero extra effort — complete with substitution suggestions when a deal makes swapping brands worthwhile.

> 📄 **[See the full example output →](examples/sample-output.md)**

## Running This Sample

```bash
npm install
npm start
```

## Output

Results are saved in the `output/` directory.
