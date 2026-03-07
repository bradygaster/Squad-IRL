# Meal Macro Calculator

> Calculate macros for meals and suggest adjustments to hit daily targets

## Who This Is For

🏃 Fitness

## The Team

| Agent | Role | What They Do |
|-------|------|-------------|
| Nutritionist | Writer | Domain expert for meal macro calculator |
| MathBot | Grader | Domain expert for meal macro calculator |
| SwapSuggester | Updater | Domain expert for meal macro calculator |

## How It Works

1. **Write** — Nutritionist reads `spec.md` and produces the first draft
2. **Grade** — MathBot evaluates the output (1-100 score)
3. **Update** — If score < 90%, SwapSuggester improves the output
4. **Repeat** — Loop continues until quality threshold is met

## See It In Action

Here's what the agent team produced for Tyler's muscle-building meal analysis:

> **Current intake**: 155g protein, 2,265 calories ❌ (short by 40g protein, 335 cal). **Target**: 195g protein, 2,600 cal for lean bulk. **3 simple swaps**: Add 3 eggs to breakfast (+18g protein), upgrade lunch to 8oz chicken (+24g), swap protein bar for Greek yogurt + granola (+3g, +80 cal). **New totals**: 200g protein ✅, 2,685 cal ✅. Now you're in muscle-building territory.

> 📄 **[See the full example output →](examples/sample-output.md)**

## Running This Sample

```bash
npm install
npm start
```

## Output

Results are saved in the `output/` directory.
