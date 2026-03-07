# Supplement Stack Optimizer

> Research and optimize supplement regimens for goals and safety

## Who This Is For

🏃 Fitness/Health

## The Team

| Agent | Role | What They Do |
|-------|------|-------------|
| NutritionistBot | Writer | Domain expert for supplement stack optimizer |
| ResearcherBot | Grader | Domain expert for supplement stack optimizer |
| InteractionChecker | Updater | Domain expert for supplement stack optimizer |

## How It Works

1. **Write** — NutritionistBot reads `spec.md` and produces the first draft
2. **Grade** — ResearcherBot evaluates the output (1-100 score)
3. **Update** — If score < 90%, InteractionChecker improves the output
4. **Repeat** — Loop continues until quality threshold is met

## See It In Action

Throwing random supplements into a cart based on influencer ads is expensive and potentially risky. This squad evaluates your current stack against your health goals, flags dangerous interactions (like blood-thinning combos), identifies redundancies, and suggests evidence-backed alternatives with optimal timing and dosage. Go from a $150/month grab-bag to a focused regimen that actually makes sense for your body.

> 📄 **[See the full example output →](examples/sample-output.md)**

## Running This Sample

```bash
npm install
npm start
```

## Output

Results are saved in the `output/` directory.
