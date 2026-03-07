# Running Training Plan

> Personalized marathon/race training plans with injury prevention

## Who This Is For

🏃 Fitness

## The Team

| Agent | Role | What They Do |
|-------|------|-------------|
| RunCoach | Writer | Domain expert for running training plan |
| PhysioGuard | Grader | Domain expert for running training plan |
| PaceCalculator | Updater | Domain expert for running training plan |

## How It Works

1. **Write** — RunCoach reads `spec.md` and produces the first draft
2. **Grade** — PhysioGuard evaluates the output (1-100 score)
3. **Update** — If score < 90%, PaceCalculator improves the output
4. **Repeat** — Loop continues until quality threshold is met

## See It In Action

Cookie-cutter marathon plans ignore your injury history, current fitness, and schedule constraints. This squad builds a week-by-week training program with pace targets calibrated to your goal time, rest days that account for your life, and injury-prevention cues based on your weak points. The difference between a generic "run 5 miles Tuesday" and a plan that actually gets you to the finish line healthy.

> 📄 **[See the full example output →](examples/sample-output.md)**

## Running This Sample

```bash
npm install
npm start
```

## Output

Results are saved in the `output/` directory.
