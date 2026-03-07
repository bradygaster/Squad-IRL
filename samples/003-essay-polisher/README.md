# Essay Polisher

> Transform rough drafts into polished essays that meet rubric requirements

## Who This Is For

🎓 Students

## The Team

| Agent | Role | What They Do |
|-------|------|-------------|
| Editor | Writer | Domain expert for essay polisher |
| CriticBot | Grader | Domain expert for essay polisher |
| StyleGuide | Updater | Domain expert for essay polisher |

## How It Works

1. **Write** — Editor reads `spec.md` and produces the first draft
2. **Grade** — CriticBot evaluates the output (1-100 score)
3. **Update** — If score < 90%, StyleGuide improves the output
4. **Repeat** — Loop continues until quality threshold is met

## See It In Action

Jasmine's rough draft on climate change had a weak thesis ("Climate change is bad"), mixed citation formats, and used the word "things" four times. The agents transformed it into a college-level persuasive essay with a sophisticated thesis, proper MLA citations, and evidence-backed arguments — earning a 94/100 on the rubric.

> 📄 **[See the full example output →](examples/sample-output.md)**

## Running This Sample

```bash
npm install
npm start
```

## Output

Results are saved in the `output/` directory.
