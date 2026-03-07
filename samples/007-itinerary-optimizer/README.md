# Itinerary Optimizer

> Build day-by-day travel plans that maximize experiences and minimize logistics

## Who This Is For

✈️ Travelers

## The Team

| Agent | Role | What They Do |
|-------|------|-------------|
| Scout | Writer | Domain expert for itinerary optimizer |
| TimeBoss | Grader | Domain expert for itinerary optimizer |
| LocalExpert | Updater | Domain expert for itinerary optimizer |
| Budgeteer | Specialist | Domain expert for itinerary optimizer |

## How It Works

1. **Write** — Scout reads `spec.md` and produces the first draft
2. **Grade** — TimeBoss evaluates the output (1-100 score)
3. **Update** — If score < 90%, LocalExpert improves the output
4. **Repeat** — Loop continues until quality threshold is met

## See It In Action

Mia and Jake's original Tokyo itinerary started at 8am (they hate mornings), zigzagged across the city wasting 4 hours on Day 2, and ignored Mia's shellfish allergy. The agents rebuilt it with 10-11am start times, geographically clustered activities, shellfish-safe restaurants, indoor backup for the rainy day, and 2-3 hour daily buffer time — all for $610 of their $2,000 budget.

> 📄 **[See the full example output →](examples/sample-output.md)**

## Running This Sample

```bash
npm install
npm start
```

## Output

Results are saved in the `output/` directory.
