# Medication Reminder System

> Organize medication schedules with reminders and refill tracking

## Who This Is For

👵 Seniors/Health

## The Team

| Agent | Role | What They Do |
|-------|------|-------------|
| MedOrganizer | Writer | Domain expert for medication reminder system |
| ReminderBot | Grader | Domain expert for medication reminder system |
| RefillTracker | Updater | Domain expert for medication reminder system |

## How It Works

1. **Write** — MedOrganizer reads `spec.md` and produces the first draft
2. **Grade** — ReminderBot evaluates the output (1-100 score)
3. **Update** — If score < 90%, RefillTracker improves the output
4. **Repeat** — Loop continues until quality threshold is met

## See It In Action

> MedOrganizer listed Bob Jameson's 7 medications with "Daily" frequency and recommended a smartphone app — but Bob uses a flip phone and was just hospitalized after confusing his morning and evening blood pressure pills (BP dropped to 78/42). Scored 38/100. The revised system uses color-coded time-of-day scheduling (🟡 morning, 🔵 evening, 🟣 bedtime), arthritis-friendly pill organizers, flip phone alarms, a printable wallet card for emergencies, and daughter Karen's remote weekly check-in protocol.

📄 **[See the full example output →](examples/sample-output.md)**

## Running This Sample

```bash
npm install
npm start
```

## Output

Results are saved in the `output/` directory.
