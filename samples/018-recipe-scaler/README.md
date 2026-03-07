# Recipe Scaler

> Scale recipes up/down and adjust cooking times/temps accordingly

## Who This Is For

🍳 Foodies

## The Team

| Agent | Role | What They Do |
|-------|------|-------------|
| Chef | Writer | Domain expert for recipe scaler |
| MathWiz | Grader | Domain expert for recipe scaler |
| TimingExpert | Updater | Domain expert for recipe scaler |

## How It Works

1. **Write** — Chef reads `spec.md` and produces the first draft
2. **Grade** — MathWiz evaluates the output (1-100 score)
3. **Update** — If score < 90%, TimingExpert improves the output
4. **Repeat** — Loop continues until quality threshold is met

## See It In Action

Nina's grandma's lasagna serves 8, but she's hosting 24 for Thanksgiving (needs to triple it). First version just tripled ingredients but ignored logistics. The agents figured out: 3 pans fit in her oven (2 top, 1 bottom, rotate halfway), baking time increases to 55-60 min, brown 3 lbs meat in batches (don't overcrowd), assemble morning of. Result: Perfect lasagna for 24, everyone asked for the recipe.

> 📄 **[See the full example output →](examples/sample-output.md)**

## Running This Sample

```bash
npm install
npm start
```

## Output

Results are saved in the `output/` directory.
