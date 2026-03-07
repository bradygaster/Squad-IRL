# Composting Guide Generator

> Create personalized composting guides for space, climate, and goals

## Who This Is For

🌱 Environmental

## The Team

| Agent | Role | What They Do |
|-------|------|-------------|
| CompostExpert | Writer | Domain expert for composting guide generator |
| SetupAdvisor | Grader | Domain expert for composting guide generator |
| TroubleshootBot | Updater | Domain expert for composting guide generator |

## How It Works

1. **Write** — CompostExpert reads `spec.md` and produces the first draft
2. **Grade** — SetupAdvisor evaluates the output (1-100 score)
3. **Update** — If score < 90%, TroubleshootBot improves the output
4. **Repeat** — Loop continues until quality threshold is met

## See It In Action

> CompostExpert recommended a $150+ backyard tumbler for Mei-Lin Torres — who lives in a second-floor apartment with only a 4'×8' balcony. The revised guide switches to indoor vermicomposting ($60 setup), explains exactly why her previous bucket attempt went moldy (no aeration, wrong carbon-to-nitrogen ratio, no drainage), makes smell prevention a core design element, and includes kid-friendly worm-feeding activities for her 5-year-old daughter.

📄 **[See the full example output →](examples/sample-output.md)**

## Running This Sample

```bash
npm install
npm start
```

## Output

Results are saved in the `output/` directory.
