# Customer Review Responder

> Draft thoughtful responses to customer reviews (positive and negative)

## Who This Is For

🏪 Small Business

## The Team

| Agent | Role | What They Do |
|-------|------|-------------|
| CustomerService | Writer | Domain expert for customer review responder |
| ToneManager | Grader | Domain expert for customer review responder |
| ProblemSolver | Updater | Domain expert for customer review responder |

## How It Works

1. **Write** — CustomerService reads `spec.md` and produces the first draft
2. **Grade** — ToneManager evaluates the output (1-100 score)
3. **Update** — If score < 90%, ProblemSolver improves the output
4. **Repeat** — Loop continues until quality threshold is met

## See It In Action

A family restaurant gets a brutal 1-star review: cold food, 45-minute wait, a dismissive manager. The agents craft a response where the owner admits *he* was that manager, addresses every complaint by name, explains what he's changed, and offers a complimentary dinner — turning the review into a trust-building moment for future customers.

> 📄 **[See the full example output →](examples/sample-output.md)**

## Running This Sample

```bash
npm install
npm start
```

## Output

Results are saved in the `output/` directory.
