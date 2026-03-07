# Screen Time Negotiator

> Create fair screen time agreements with kids that both sides accept

## Who This Is For

👩‍👧‍👦 Parents

## The Team

| Agent | Role | What They Do |
|-------|------|-------------|
| Mediator | Writer | Domain expert for screen time negotiator |
| FairnessJudge | Grader | Domain expert for screen time negotiator |
| ContractWriter | Updater | Domain expert for screen time negotiator |

## How It Works

1. **Write** — Mediator reads `spec.md` and produces the first draft
2. **Grade** — FairnessJudge evaluates the output (1-100 score)
3. **Update** — If score < 90%, ContractWriter improves the output
4. **Repeat** — Loop continues until quality threshold is met

## See It In Action

Here's what the agent team produced for Jennifer and 10-year-old Kai's screen time battles:

> **Agreement**: 90 min school nights, 3 hours weekends. Kai can EARN extra time (+15 min for reading, chores, outside play). **Special exceptions**: Family movie night, sick days, gaming tournaments (2/month). **Both sides accountable**: If Mom breaks a rule, Kai earns bonus minutes. Consequences reset weekly. Result: No more daily fights.

> 📄 **[See the full example output →](examples/sample-output.md)**

## Running This Sample

```bash
npm install
npm start
```

## Output

Results are saved in the `output/` directory.
