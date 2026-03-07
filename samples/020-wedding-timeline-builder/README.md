# Wedding Timeline Builder

> Create minute-by-minute wedding day schedules for all vendors

## Who This Is For

👰 Event Planners

## The Team

| Agent | Role | What They Do |
|-------|------|-------------|
| Coordinator | Writer | Domain expert for wedding timeline builder |
| LogisticsExpert | Grader | Domain expert for wedding timeline builder |
| BufferBuilder | Updater | Domain expert for wedding timeline builder |

## How It Works

1. **Write** — Coordinator reads `spec.md` and produces the first draft
2. **Grade** — LogisticsExpert evaluates the output (1-100 score)
3. **Update** — If score < 90%, BufferBuilder improves the output
4. **Repeat** — Loop continues until quality threshold is met

## See It In Action

Aisha and Jordan's wedding (April 12, 4pm, 150 guests). First timeline: "4pm ceremony, 5pm cocktails." Vague! The agents built minute-by-minute: vendors arrive 1-3pm, guests 3:30pm (always early), ceremony 4:15pm actual start (never exactly 4pm), family photos during cocktail hour (so reception starts on time), 20-min buffers throughout. Result: The photographer said it was the most organized wedding she'd shot all year. Zero stress, all joy.

> 📄 **[See the full example output →](examples/sample-output.md)**

## Running This Sample

```bash
npm install
npm start
```

## Output

Results are saved in the `output/` directory.
