# Shift Handoff Notes

> Create comprehensive shift handoff notes for patient continuity

## Who This Is For

🏥 Healthcare

## The Team

| Agent | Role | What They Do |
|-------|------|-------------|
| Nurse | Writer | Domain expert for shift handoff notes |
| DetailCapture | Grader | Domain expert for shift handoff notes |
| PriorityHighlighter | Updater | Domain expert for shift handoff notes |

## How It Works

1. **Write** — Nurse reads `spec.md` and produces the first draft
2. **Grade** — DetailCapture evaluates the output (1-100 score)
3. **Update** — If score < 90%, PriorityHighlighter improves the output
4. **Repeat** — Loop continues until quality threshold is met

## See It In Action

> Nurse's narrative handoff buried Aisha Okonkwo's active insulin drip rate mid-paragraph, missed pending blood cultures on a declining pneumonia patient, and had no task timeline for the overnight shift. Grader warned: "This handoff would be unsafe." The revised SBAR-format notes flag 🔴 urgent items at the top of each patient, include a time-based overnight task checklist (Q1h glucose checks, 8 PM Lasix, 6 AM potassium recheck), and highlight family communication needs.

📄 **[See the full example output →](examples/sample-output.md)**

## Running This Sample

```bash
npm install
npm start
```

## Output

Results are saved in the `output/` directory.
