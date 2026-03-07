# Diy Project Sequencer

> Break DIY projects into steps with tools, materials, and time estimates

## Who This Is For

🏠 Homeowners

## The Team

| Agent | Role | What They Do |
|-------|------|-------------|
| Handyman | Writer | Domain expert for diy project sequencer |
| Sequencer | Grader | Domain expert for diy project sequencer |
| SafetyOfficer | Updater | Domain expert for diy project sequencer |

## How It Works

1. **Write** — Handyman reads `spec.md` and produces the first draft
2. **Grade** — Sequencer evaluates the output (1-100 score)
3. **Update** — If score < 90%, SafetyOfficer improves the output
4. **Repeat** — Loop continues until quality threshold is met

## See It In Action

> First draft suggested hanging drywall before running electrical, missed Portland's mandatory permits for garage-to-living-space conversion, and estimated "2 hours" for 240 sq ft of drywall. The revised plan for Rachel Kowalski's $3,500 garage-to-office project sequences 6 weekends with correct dependencies, itemized materials ($3,187 at Home Depot), safety protocols, and clear guidance on when to call a licensed electrician vs. DIY.

📄 **[See the full example output →](examples/sample-output.md)**

## Running This Sample

```bash
npm install
npm start
```

## Output

Results are saved in the `output/` directory.
