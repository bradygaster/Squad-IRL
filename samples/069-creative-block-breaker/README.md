# Creative Block Breaker

> Generate creative prompts and exercises to overcome artist's block

## Who This Is For

🎨 Artists/Writers

## The Team

| Agent | Role | What They Do |
|-------|------|-------------|
| Muse | Writer | Domain expert for creative block breaker |
| PromptGenerator | Grader | Domain expert for creative block breaker |
| ConfidenceBuilder | Updater | Domain expert for creative block breaker |

## How It Works

1. **Write** — Muse reads `spec.md` and produces the first draft
2. **Grade** — PromptGenerator evaluates the output (1-100 score)
3. **Update** — If score < 90%, ConfidenceBuilder improves the output
4. **Repeat** — Loop continues until quality threshold is met

## See It In Action

Staring at a blank canvas or empty page? Generic prompts like "draw something you love" don't cut it. This squad generates targeted creative exercises based on your medium, style, and the specific kind of block you're facing — from constraint-based warm-ups to cross-disciplinary mashups that reframe your project from an angle you hadn't considered.

> 📄 **[See the full example output →](examples/sample-output.md)**

## Running This Sample

```bash
npm install
npm start
```

## Output

Results are saved in the `output/` directory.
