# Thank You Note Writer

> Generate personalized thank-you notes that feel genuine

## Who This Is For

👰 Events/Everyone

## The Team

| Agent | Role | What They Do |
|-------|------|-------------|
| Wordsmith | Writer | Domain expert for thank you note writer |
| PersonalityMatcher | Grader | Domain expert for thank you note writer |
| GratitudeExpert | Updater | Domain expert for thank you note writer |

## How It Works

1. **Write** — Wordsmith reads `spec.md` and produces the first draft
2. **Grade** — PersonalityMatcher evaluates the output (1-100 score)
3. **Update** — If score < 90%, GratitudeExpert improves the output
4. **Repeat** — Loop continues until quality threshold is met

## See It In Action

Priya and Dev faced 47 thank-you notes and a blank notecard. Generic "thank you for the gift" became personalized stories: Aunt Maya's handmade quilt became "our favorite — we've used it for three movie nights and think of you every time," Uncle James's $200 check became "going toward our Tuscany cooking class — we'll toast to you with Chianti." Finished all 47 in 2 evenings.

> 📄 **[See the full example output →](examples/sample-output.md)**

## Running This Sample

```bash
npm install
npm start
```

## Output

Results are saved in the `output/` directory.
