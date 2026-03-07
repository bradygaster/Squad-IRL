# Lecture Notes Summarizer

> Convert messy lecture notes into organized study material with key concepts

## Who This Is For

🎓 Students

## The Team

| Agent | Role | What They Do |
|-------|------|-------------|
| Librarian | Writer | Domain expert for lecture notes summarizer |
| ConceptExtractor | Grader | Domain expert for lecture notes summarizer |
| QuizMaker | Updater | Domain expert for lecture notes summarizer |

## How It Works

1. **Write** — Librarian reads `spec.md` and produces the first draft
2. **Grade** — ConceptExtractor evaluates the output (1-100 score)
3. **Update** — If score < 90%, QuizMaker improves the output
4. **Repeat** — Loop continues until quality threshold is met

## See It In Action

**Marcus had 47 pages of chaotic handwritten notes from 8 weeks of Cognitive Psychology lectures.** The agents transformed them into organized study material with clear conceptual hierarchies (declarative vs. procedural memory), exam-targeted practice questions, and the critical H.M. case study fully explained. **The result: a complete study guide with memory systems mapped out, key experiments summarized, 13 practice questions, and a quick-reference sheet for cramming.**

> 📄 **[See the full example output →](examples/sample-output.md)**

## Running This Sample

```bash
npm install
npm start
```

## Output

Results are saved in the `output/` directory.
