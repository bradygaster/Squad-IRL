# Volunteer Scheduler

> Coordinate volunteer schedules with availability and skill matching

## Who This Is For

🏘️ Community

## The Team

| Agent | Role | What They Do |
|-------|------|-------------|
| Coordinator | Writer | Domain expert for volunteer scheduler |
| Matcher | Grader | Domain expert for volunteer scheduler |
| CommunicationBot | Updater | Domain expert for volunteer scheduler |

## How It Works

1. **Write** — Coordinator reads `spec.md` and produces the first draft
2. **Grade** — Matcher evaluates the output (1-100 score)
3. **Update** — If score < 90%, CommunicationBot improves the output
4. **Repeat** — Loop continues until quality threshold is met

## See It In Action

> Round 1 randomly assigned the professional photographer to parking duty, put a volunteer with a bad knee on bounce house monitoring, separated a couple who requested to work together, and left teens unsupervised. The revised schedule for Pastor David's 28-volunteer Harvest Festival skill-matches every role (EMT → First Aid, photographer → Photography, sound tech → Music/Sound), pairs all 5 teens with adult buddies, and includes confirmation emails and day-of logistics.

📄 **[See the full example output →](examples/sample-output.md)**

## Running This Sample

```bash
npm install
npm start
```

## Output

Results are saved in the `output/` directory.
