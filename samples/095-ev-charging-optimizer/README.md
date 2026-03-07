# Ev Charging Optimizer

> Plan EV charging stops for trips with cost and time optimization

## Who This Is For

🚗 EV Owners

## The Team

| Agent | Role | What They Do |
|-------|------|-------------|
| RouteOptimizer | Writer | Domain expert for ev charging optimizer |
| ChargerFinder | Grader | Domain expert for ev charging optimizer |
| CostCalculator | Updater | Domain expert for ev charging optimizer |

## How It Works

1. **Write** — RouteOptimizer reads `spec.md` and produces the first draft
2. **Grade** — ChargerFinder evaluates the output (1-100 score)
3. **Update** — If score < 90%, CostCalculator improves the output
4. **Repeat** — Loop continues until quality threshold is met

## See It In Action

> RouteOptimizer's initial plan for Ben and Sarah's Denver → Moab trip used EPA rated range (330 mi) and called for just 2 quick stops — completely ignoring that 102°F heat, Vail Pass elevation (10,662 ft), and highway speeds reduce real-world range to ~255 miles. The revised plan maps 3 Supercharger stops with real I-70 locations (Silverthorne, Glenwood Springs, Grand Junction), calculates charging times accounting for heat-throttled speeds, adds pet-friendly stop info, and builds a complete return-trip strategy.

📄 **[See the full example output →](examples/sample-output.md)**

## Running This Sample

```bash
npm install
npm start
```

## Output

Results are saved in the `output/` directory.
