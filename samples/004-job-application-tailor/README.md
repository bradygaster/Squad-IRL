# Job Application Tailor

> Customize resume and cover letter for each job posting

## Who This Is For

🎓 Students/Everyone

## The Team

| Agent | Role | What They Do |
|-------|------|-------------|
| Recruiter | Writer | Domain expert for job application tailor |
| Matcher | Grader | Domain expert for job application tailor |
| Wordsmith | Updater | Domain expert for job application tailor |

## How It Works

1. **Write** — Recruiter reads `spec.md` and produces the first draft
2. **Grade** — Matcher evaluates the output (1-100 score)
3. **Update** — If score < 90%, Wordsmith improves the output
4. **Repeat** — Loop continues until quality threshold is met

## See It In Action

David's a restaurant manager trying to pivot into tech PM. His original resume screamed "food service" with phrases like "front-of-house operations." The agents rewrote it with tech keywords (Agile, stakeholder management, cross-functional), quantified achievements (reduced costs 18%, improved retention 40%), and produced an ATS-friendly format that scored 92% keyword match with the job posting.

> 📄 **[See the full example output →](examples/sample-output.md)**

## Running This Sample

```bash
npm install
npm start
```

## Output

Results are saved in the `output/` directory.
