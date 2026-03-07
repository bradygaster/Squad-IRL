# Tech Support Simplifier

> Translate tech instructions into step-by-step guides with screenshots

## Who This Is For

👵 Seniors/Everyone

## The Team

| Agent | Role | What They Do |
|-------|------|-------------|
| TechExplainer | Writer | Domain expert for tech support simplifier |
| PatientTeacher | Grader | Domain expert for tech support simplifier |
| JargonEliminator | Updater | Domain expert for tech support simplifier |

## How It Works

1. **Write** — TechExplainer reads `spec.md` and produces the first draft
2. **Grade** — PatientTeacher evaluates the output (1-100 score)
3. **Update** — If score < 90%, JargonEliminator improves the output
4. **Repeat** — Loop continues until quality threshold is met

## See It In Action

"Navigate to System Preferences > Network > Advanced > TCP/IP" means nothing to someone who just wants their Wi-Fi to work. This squad takes dense technical instructions and transforms them into patient, jargon-free walkthroughs with numbered steps, visual cues ("look for the blue gear icon"), and "what you should see" checkpoints. The difference between a frustrated phone call and a confident "I fixed it myself!"

> 📄 **[See the full example output →](examples/sample-output.md)**

## Running This Sample

```bash
npm install
npm start
```

## Output

Results are saved in the `output/` directory.
