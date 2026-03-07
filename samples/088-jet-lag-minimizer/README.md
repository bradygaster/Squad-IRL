# Jet Lag Minimizer

> Create pre-trip schedules to minimize jet lag with sleep/light exposure timing

## Who This Is For

✈️ Travelers

## The Team

| Agent | Role | What They Do |
|-------|------|-------------|
| SleepScientist | Writer | Domain expert for jet lag minimizer |
| Scheduler | Grader | Domain expert for jet lag minimizer |
| TimezoneCalculator | Updater | Domain expert for jet lag minimizer |

## How It Works

1. **Write** — SleepScientist reads `spec.md` and produces the first draft
2. **Grade** — Scheduler evaluates the output (1-100 score)
3. **Update** — If score < 90%, TimezoneCalculator improves the output
4. **Repeat** — Loop continues until quality threshold is met

## See It In Action

> From generic "try to sleep on the plane" advice to a precision 8-day circadian protocol for Marcus Rivera's SFO → Tokyo trip: 4-day pre-departure sleep shifting with exact bedtimes (moving 1.5 hours earlier each night), calculated light exposure windows for eastward phase advance, hour-by-hour in-flight sleep/wake plan in dual timezones, and a presentation-morning routine ensuring peak alertness at 9:00 AM JST — all grounded in circadian science.

📄 **[See the full example output →](examples/sample-output.md)**

## Running This Sample

```bash
npm install
npm start
```

## Output

Results are saved in the `output/` directory.
