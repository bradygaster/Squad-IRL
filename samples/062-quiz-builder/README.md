# Quiz Builder

> Generate quizzes from lesson content with varied question types

## Who This Is For

🏫 Teachers

## The Team

| Agent | Role | What They Do |
|-------|------|-------------|
| Quizmaster | Writer | Domain expert for quiz builder |
| BloomsTaxonomyExpert | Grader | Domain expert for quiz builder |
| AnswerKeyMaker | Updater | Domain expert for quiz builder |

## How It Works

1. **Write** — Quizmaster reads `spec.md` and produces the first draft
2. **Grade** — BloomsTaxonomyExpert evaluates the output (1-100 score)
3. **Update** — If score < 90%, AnswerKeyMaker improves the output
4. **Repeat** — Loop continues until quality threshold is met

## See It In Action

See a photosynthesis quiz evolve from basic recall questions to a 15-question assessment spanning all Bloom's Taxonomy levels—complete with scenario-based problems, graph analysis, detailed answer key with explanations, and perfect alignment to learning objectives.

> 📄 **[See the full example output →](examples/sample-output.md)**

## Running This Sample

```bash
npm install
npm start
```

## Output

Results are saved in the `output/` directory.
