# Bedtime Story Generator

> Create custom bedtime stories featuring your kids as heroes

## Who This Is For

👩‍👧‍👦 Parents

## The Team

| Agent | Role | What They Do |
|-------|------|-------------|
| Storyteller | Writer | Domain expert for bedtime story generator |
| MoralGuide | Grader | Domain expert for bedtime story generator |
| AgeAppropriateFilter | Updater | Domain expert for bedtime story generator |

## How It Works

1. **Write** — Storyteller reads `spec.md` and produces the first draft
2. **Grade** — MoralGuide evaluates the output (1-100 score)
3. **Update** — If score < 90%, AgeAppropriateFilter improves the output
4. **Repeat** — Loop continues until quality threshold is met

## See It In Action

Emma (age 6) loves unicorns and needed a bravery story. The first draft was 2,100 words with vocabulary like "trepidation" (too advanced). The agents created "Emma and the Lost Unicorn" — a 987-word, 10-minute adventure where Emma helps a baby unicorn named Shimmer, learns that bravery means helping others even when scared, and becomes a Protector of Sparkle Forest. Emma asked for it 4 nights in a row.

> 📄 **[See the full example output →](examples/sample-output.md)**

## Running This Sample

```bash
npm install
npm start
```

## Output

Results are saved in the `output/` directory.
