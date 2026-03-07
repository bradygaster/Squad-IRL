# Visa Requirement Checker

> Research visa requirements and application checklists for travel

## Who This Is For

✈️ Travelers

## The Team

| Agent | Role | What They Do |
|-------|------|-------------|
| TravelExpert | Writer | Domain expert for visa requirement checker |
| DocumentChecker | Grader | Domain expert for visa requirement checker |
| TimelineBuilder | Updater | Domain expert for visa requirement checker |

## How It Works

1. **Write** — TravelExpert reads `spec.md` and produces the first draft
2. **Grade** — DocumentChecker evaluates the output (1-100 score)
3. **Update** — If score < 90%, TimelineBuilder improves the output
4. **Repeat** — Loop continues until quality threshold is met

## See It In Action

> TravelExpert's draft falsely claimed "Americans don't need a visa for Vietnam" and completely missed that Amara Osei's passport (expiring March 15, 2025) falls short of Vietnam's 6-month validity requirement — she'd be denied entry at immigration. The revised guide flags urgent passport renewal as a blocker, walks through the e-visa application step by step, builds a reverse timeline from her October 5 departure, and adds a remote-work legal advisory since she freelances.

📄 **[See the full example output →](examples/sample-output.md)**

## Running This Sample

```bash
npm install
npm start
```

## Output

Results are saved in the `output/` directory.
