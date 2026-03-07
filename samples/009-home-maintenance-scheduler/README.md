# Home Maintenance Scheduler

> Generate yearly home maintenance calendar with seasonal tasks

## Who This Is For

🏠 Homeowners

## The Team

| Agent | Role | What They Do |
|-------|------|-------------|
| Handyman | Writer | Domain expert for home maintenance scheduler |
| Inspector | Grader | Domain expert for home maintenance scheduler |
| Planner | Updater | Domain expert for home maintenance scheduler |

## How It Works

1. **Write** — Handyman reads `spec.md` and produces the first draft
2. **Grade** — Inspector evaluates the output (1-100 score)
3. **Update** — If score < 90%, Planner improves the output
4. **Repeat** — Loop continues until quality threshold is met

## See It In Action

Tom and Rachel's first home maintenance plan scheduled roof inspection in 115°F July heat and missed critical Arizona tasks like monsoon prep. The agents rebuilt it with Phoenix-specific scheduling (HVAC filters every 30 days for dust, AC tune-up before summer, monsoon prep in March), DIY vs. professional guidance, and a $2,847 annual budget that protects their $380K investment for $237/month.

> 📄 **[See the full example output →](examples/sample-output.md)**

## Running This Sample

```bash
npm install
npm start
```

## Output

Results are saved in the `output/` directory.
