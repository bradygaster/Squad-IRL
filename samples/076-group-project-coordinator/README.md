# Group Project Coordinator

> Manage group projects with task delegation and deadline tracking

## Who This Is For

🎓 Students

## The Team

| Agent | Role | What They Do |
|-------|------|-------------|
| ProjectManager | Writer | Domain expert for group project coordinator |
| FairnessJudge | Grader | Domain expert for group project coordinator |
| CommunicationHub | Updater | Domain expert for group project coordinator |

## How It Works

1. **Write** — ProjectManager reads `spec.md` and produces the first draft
2. **Grade** — FairnessJudge evaluates the output (1-100 score)
3. **Update** — If score < 90%, CommunicationHub improves the output
4. **Repeat** — Loop continues until quality threshold is met

## See It In Action

Every group project has the same problem: vague roles, uneven workloads, and that one person who vanishes until the night before. This squad breaks the project into concrete tasks matched to each member's strengths, sets milestone deadlines with buffer time, and generates accountability check-in templates. Transform "we should probably start soon" into a plan where everyone knows exactly what they own and when it's due.

> 📄 **[See the full example output →](examples/sample-output.md)**

## Running This Sample

```bash
npm install
npm start
```

## Output

Results are saved in the `output/` directory.
