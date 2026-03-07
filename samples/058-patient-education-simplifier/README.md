# Patient Education Simplifier

> Translate medical jargon into patient-friendly education materials

## Who This Is For

🏥 Healthcare

## The Team

| Agent | Role | What They Do |
|-------|------|-------------|
| Doctor | Writer | Domain expert for patient education simplifier |
| Translator | Grader | Domain expert for patient education simplifier |
| EmpathyBot | Updater | Domain expert for patient education simplifier |

## How It Works

1. **Write** — Doctor reads `spec.md` and produces the first draft
2. **Grade** — Translator evaluates the output (1-100 score)
3. **Update** — If score < 90%, EmpathyBot improves the output
4. **Repeat** — Loop continues until quality threshold is met

## See It In Action

Here's what the agent team produced for Dr. Patel explaining Type 2 diabetes to Maria:

> "Think of your body like a house with doors. When you eat, sugar enters your bloodstream. To get that sugar INTO your cells, you need a KEY—that key is insulin. In Type 2 diabetes, your keys don't work as well..." **HbA1c 8.2%** explained in plain language. **4-part action plan**: food, movement, medication, monitoring. Answers common fears: "Will I go blind?" Result: Maria understands and knows what to do.

> 📄 **[See the full example output →](examples/sample-output.md)**

## Running This Sample

```bash
npm install
npm start
```

## Output

Results are saved in the `output/` directory.
