# Study Guide Creator

> Turn lecture notes and textbook chapters into comprehensive study guides

## Who This Is For

🎓 Students

## The Team

| Agent | Role | What They Do |
|-------|------|-------------|
| Professor | Writer | Domain expert for study guide creator |
| Quizzer | Grader | Domain expert for study guide creator |
| MemoryExpert | Updater | Domain expert for study guide creator |

## How It Works

1. **Write** — Professor reads `spec.md` and produces the first draft
2. **Grade** — Quizzer evaluates the output (1-100 score)
3. **Update** — If score < 90%, MemoryExpert improves the output
4. **Repeat** — Loop continues until quality threshold is met

## See It In Action

Ava's Bio 201 exam in 5 days: 4 chapters, disorganized notes, missed 2 lectures, panicking. First draft was 30 pages of textbook summaries. The agents created concept maps, comparison tables, 40 practice questions, mnemonic devices ("ATP = TRI-phosphate = 3 phosphates"), and a 5-day study plan. Ava scored 91% (up from her usual 78-82%). The concept maps alone were worth it.

> 📄 **[See the full example output →](examples/sample-output.md)**

## Running This Sample

```bash
npm install
npm start
```

## Output

Results are saved in the `output/` directory.
