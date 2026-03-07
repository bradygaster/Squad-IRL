# Carpooling Coordinator

> Organize carpool schedules that balance fairness and logistics

## Who This Is For

🚗 Commuters/Parents

## The Team

| Agent | Role | What They Do |
|-------|------|-------------|
| Scheduler | Writer | Domain expert for carpooling coordinator |
| RouteOptimizer | Grader | Domain expert for carpooling coordinator |
| FairnessJudge | Updater | Domain expert for carpooling coordinator |

## How It Works

1. **Write** — Scheduler reads `spec.md` and produces the first draft
2. **Grade** — RouteOptimizer evaluates the output (1-100 score)
3. **Update** — If score < 90%, FairnessJudge improves the output
4. **Repeat** — Loop continues until quality threshold is met

## See It In Action

Coordinating a carpool via a 47-message group chat is chaos — someone always gets forgotten or stuck driving three days in a row. This squad builds a rotating schedule that balances driving duties fairly, optimizes pickup routes to minimize total drive time, and handles constraints like "I can't drive Fridays." Get a printable weekly schedule where every parent knows exactly when they drive and when they ride.

> 📄 **[See the full example output →](examples/sample-output.md)**

## Running This Sample

```bash
npm install
npm start
```

## Output

Results are saved in the `output/` directory.
