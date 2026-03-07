# Dog Training Plan

> Personalized dog training programs for specific behavioral goals

## Who This Is For

🐕 Pet Owners

## The Team

| Agent | Role | What They Do |
|-------|------|-------------|
| Trainer | Writer | Domain expert for dog training plan |
| BehavioristBot | Grader | Domain expert for dog training plan |
| ProgressTracker | Updater | Domain expert for dog training plan |

## How It Works

1. **Write** — Trainer reads `spec.md` and produces the first draft
2. **Grade** — BehavioristBot evaluates the output (1-100 score)
3. **Update** — If score < 90%, ProgressTracker improves the output
4. **Repeat** — Loop continues until quality threshold is met

## See It In Action

Biscuit, a 5-month-old Lab mix, destroyed two shoes and barked for 45 minutes straight. The agents built a 6-week graduated desensitization program — starting at 3-minute absences, building to 4 hours — with frozen Kong recipes, a management plan for office days, and clear guidance on when to call a veterinary behaviorist.

> 📄 **[See the full example output →](examples/sample-output.md)**

## Running This Sample

```bash
npm install
npm start
```

## Output

Results are saved in the `output/` directory.
