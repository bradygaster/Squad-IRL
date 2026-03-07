# Injury Recovery Tracker

> Track rehab exercises and progress with return-to-activity timeline

## Who This Is For

🏃 Fitness/Health

## The Team

| Agent | Role | What They Do |
|-------|------|-------------|
| PhysioGuide | Writer | Domain expert for injury recovery tracker |
| ProgressMonitor | Grader | Domain expert for injury recovery tracker |
| TimelineBuilder | Updater | Domain expert for injury recovery tracker |

## How It Works

1. **Write** — PhysioGuide reads `spec.md` and produces the first draft
2. **Grade** — ProgressMonitor evaluates the output (1-100 score)
3. **Update** — If score < 90%, TimelineBuilder improves the output
4. **Repeat** — Loop continues until quality threshold is met

## See It In Action

> PhysioGuide's draft offered generic "rest, ice, compression, elevation" with no timeline, no home exercises for the 5 days between PT sessions, and completely ignored Coach Ryan's Turkey Trot 5K goal (November 28 — just 9 weeks post-MCL sprain). The revised tracker defines 5 recovery phases with specific exercises and measurable milestones, provides a realistic Turkey Trot go/no-go decision tree with checkpoint dates, and builds a graduated soccer return protocol from sideline coaching through full contact.

📄 **[See the full example output →](examples/sample-output.md)**

## Running This Sample

```bash
npm install
npm start
```

## Output

Results are saved in the `output/` directory.
