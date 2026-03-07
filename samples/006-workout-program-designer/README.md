# Workout Program Designer

> Create personalized 12-week training plans based on goals and equipment

## Who This Is For

🏃 Fitness

## The Team

| Agent | Role | What They Do |
|-------|------|-------------|
| Trainer | Writer | Domain expert for workout program designer |
| PhysioGuard | Grader | Domain expert for workout program designer |
| ProgressTracker | Updater | Domain expert for workout program designer |

## How It Works

1. **Write** — Trainer reads `spec.md` and produces the first draft
2. **Grade** — PhysioGuard evaluates the output (1-100 score)
3. **Update** — If score < 90%, ProgressTracker improves the output
4. **Repeat** — Loop continues until quality threshold is met

## See It In Action

Alex has been doing random YouTube workouts for 6 months with zero progress. The agents built him a 12-week hypertrophy program matched to his home gym equipment (barbell, dumbbells, pull-up bar), with progressive overload (+5lbs when hitting top of rep range), deload weeks every 4th week, and realistic expectations: 15 lbs fat loss + 3 lbs muscle gain.

> 📄 **[See the full example output →](examples/sample-output.md)**

## Running This Sample

```bash
npm install
npm start
```

## Output

Results are saved in the `output/` directory.
