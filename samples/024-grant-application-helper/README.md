# Grant Application Helper

> Write compelling grant applications that align with funder priorities

## Who This Is For

🎨 Artists/Nonprofits

## The Team

| Agent | Role | What They Do |
|-------|------|-------------|
| GrantWriter | Writer | Domain expert for grant application helper |
| AlignmentChecker | Grader | Domain expert for grant application helper |
| ImpactStoryteller | Updater | Domain expert for grant application helper |

## How It Works

1. **Write** — GrantWriter reads `spec.md` and produces the first draft
2. **Grade** — AlignmentChecker evaluates the output (1-100 score)
3. **Update** — If score < 90%, ImpactStoryteller improves the output
4. **Repeat** — Loop continues until quality threshold is met

## See It In Action

**Maria runs a coding program for low-income Oakland teens in a church basement with 8 ancient laptops.** The agents transformed "we teach kids to code" into a compelling Knight Foundation grant application. They added hard data (92% students of color, 5:1 computer ratio, 10% college CS placement despite $0 budget), showcased student success (Jamal built an app for his grandmother's diabetes meds, now employed at a startup), and aligned perfectly with Knight's priorities. **The result: a $50,000 grant application that tells a story funders can't resist.**

> 📄 **[See the full example output →](examples/sample-output.md)**

## Running This Sample

```bash
npm install
npm start
```

## Output

Results are saved in the `output/` directory.
