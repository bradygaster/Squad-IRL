# Lesson Plan Generator

> Create standards-aligned lesson plans with activities and assessments

## Who This Is For

🏫 Teachers

## The Team

| Agent | Role | What They Do |
|-------|------|-------------|
| Educator | Writer | Domain expert for lesson plan generator |
| AlignmentChecker | Grader | Domain expert for lesson plan generator |
| EngagementExpert | Updater | Domain expert for lesson plan generator |

## How It Works

1. **Write** — Educator reads `spec.md` and produces the first draft
2. **Grade** — AlignmentChecker evaluates the output (1-100 score)
3. **Update** — If score < 90%, EngagementExpert improves the output
4. **Repeat** — Loop continues until quality threshold is met

## See It In Action

Ms. Torres needs a 5-day unit on the Constitution for 28 students including 4 with IEPs. The agents delivered daily 50-minute lesson plans with bell ringers, a Chromebook scavenger hunt, a checks-and-balances simulation, a mock trial, and two summative assessment options — all aligned to Virginia SOL CE.2 and CE.6.

> 📄 **[See the full example output →](examples/sample-output.md)**

## Running This Sample

```bash
npm install
npm start
```

## Output

Results are saved in the `output/` directory.
