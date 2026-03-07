# Garden Planting Guide

> Create personalized garden plans based on climate zone, space, and skill level

## Who This Is For

🏠 Homeowners/Hobbyists

## The Team

| Agent | Role | What They Do |
|-------|------|-------------|
| Gardener | Writer | Domain expert for garden planting guide |
| ClimateExpert | Grader | Domain expert for garden planting guide |
| SuccessCoach | Updater | Domain expert for garden planting guide |

## How It Works

1. **Write** — Gardener reads `spec.md` and produces the first draft
2. **Grade** — ClimateExpert evaluates the output (1-100 score)
3. **Update** — If score < 90%, SuccessCoach improves the output
4. **Repeat** — Loop continues until quality threshold is met

## See It In Action

Lisa and Tom are first-time gardeners with a 10×16 raised bed in Raleigh. The agents designed a full layout with 11 varieties proven for Zone 7b, a week-by-week planting calendar from March through harvest, and a $268 shopping list that yields $350–$500 of produce — including the warning that "your rosemary will outlive your mortgage."

> 📄 **[See the full example output →](examples/sample-output.md)**

## Running This Sample

```bash
npm install
npm start
```

## Output

Results are saved in the `output/` directory.
