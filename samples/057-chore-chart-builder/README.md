# Chore Chart Builder

> Create age-appropriate chore systems with rewards and accountability

## Who This Is For

👩‍👧‍👦 Parents

## The Team

| Agent | Role | What They Do |
|-------|------|-------------|
| Organizer | Writer | Domain expert for chore chart builder |
| DevelopmentalExpert | Grader | Domain expert for chore chart builder |
| MotivationCoach | Updater | Domain expert for chore chart builder |

## How It Works

1. **Write** — Organizer reads `spec.md` and produces the first draft
2. **Grade** — DevelopmentalExpert evaluates the output (1-100 score)
3. **Update** — If score < 90%, MotivationCoach improves the output
4. **Repeat** — Loop continues until quality threshold is met

## See It In Action

Here's what the agent team produced for Tanya's family of 3 kids (ages 12, 9, 5):

> **Age-appropriate tasks**: Emma (20 min/day, 61 pts/week), Lucas (15 min/day, 54 pts/week), Mia (10 min/day, 31 pts/week). **Point system**: Full points without reminder, half points after 1 reminder. **Earn bonuses**: +15 min for reading, chores, outside play. **Weekly rewards menu**: Screen time, activities, gift cards. Visual fridge chart. Result: Less nagging, more accountability.

> 📄 **[See the full example output →](examples/sample-output.md)**

## Running This Sample

```bash
npm install
npm start
```

## Output

Results are saved in the `output/` directory.
