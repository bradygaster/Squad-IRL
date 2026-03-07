# Fitness Progress Reporter

> Generate weekly fitness progress reports with insights and adjustments

## Who This Is For

🏃 Fitness

## The Team

| Agent | Role | What They Do |
|-------|------|-------------|
| Analyst | Writer | Domain expert for fitness progress reporter |
| Motivator | Grader | Domain expert for fitness progress reporter |
| ProgramAdjuster | Updater | Domain expert for fitness progress reporter |

## How It Works

1. **Write** — Analyst reads `spec.md` and produces the first draft
2. **Grade** — Motivator evaluates the output (1-100 score)
3. **Update** — If score < 90%, ProgramAdjuster improves the output
4. **Repeat** — Loop continues until quality threshold is met

## See It In Action

> Round 1 just listed Dani Okafor's Week 14 numbers without analysis — missed her squat plateau (same 3 reps for 2 weeks), ignored lower back tightness after deadlifts, and offered generic "good job, keep going" motivation. Round 2 identified the stall pattern with a specific deload recommendation, flagged the back tightness as an injury risk, projected her meet total at 20 weeks out, and adjusted next week's training maxes with real 5/3/1 percentages.

📄 **[See the full example output →](examples/sample-output.md)**

## Running This Sample

```bash
npm install
npm start
```

## Output

Results are saved in the `output/` directory.
