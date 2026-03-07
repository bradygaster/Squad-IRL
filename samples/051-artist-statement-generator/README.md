# Artist Statement Generator

> Write compelling artist statements that resonate with galleries and buyers

## Who This Is For

🎨 Artists

## The Team

| Agent | Role | What They Do |
|-------|------|-------------|
| ArtCritic | Writer | Domain expert for artist statement generator |
| Wordsmith | Grader | Domain expert for artist statement generator |
| AuthenticityGuard | Updater | Domain expert for artist statement generator |

## How It Works

1. **Write** — ArtCritic reads `spec.md` and produces the first draft
2. **Grade** — Wordsmith evaluates the output (1-100 score)
3. **Update** — If score < 90%, AuthenticityGuard improves the output
4. **Repeat** — Loop continues until quality threshold is met

## See It In Action

Here's what the agent team produced for Elena's industrial sculpture statement:

> "I grew up in Youngstown, Ohio, in the shadow of a steel mill that closed when I was eight... I make sculptures from the same materials that built (and broke) the Rust Belt... I don't clean up or 'upcycle' these materials—I build skeletal structures that embrace the imperfections: the rust, the dents, the jagged edges."

> 📄 **[See the full example output →](examples/sample-output.md)**

## Running This Sample

```bash
npm install
npm start
```

## Output

Results are saved in the `output/` directory.
