# Carbon Footprint Tracker

> Calculate personal carbon footprint and suggest highest-impact reductions

## Who This Is For

🌱 Environmental

## The Team

| Agent | Role | What They Do |
|-------|------|-------------|
| Calculator | Writer | Domain expert for carbon footprint tracker |
| Researcher | Grader | Domain expert for carbon footprint tracker |
| ActionPlanner | Updater | Domain expert for carbon footprint tracker |

## How It Works

1. **Write** — Calculator reads `spec.md` and produces the first draft
2. **Grade** — Researcher evaluates the output (1-100 score)
3. **Update** — If score < 90%, ActionPlanner improves the output
4. **Repeat** — Loop continues until quality threshold is met

## See It In Action

David's 18.2-ton carbon footprint breaks down to 29% air travel and 22.7% driving. The agents built a 6-action plan that exceeds his 30% reduction goal, saves $2,026/year, and hits the target by Month 2 — with one phone call to enroll in renewable energy and a 4°F thermostat adjustment.

> 📄 **[See the full example output →](examples/sample-output.md)**

## Running This Sample

```bash
npm install
npm start
```

## Output

Results are saved in the `output/` directory.
