# Restaurant Review Aggregator

> Summarize restaurant reviews into decision-making guides

## Who This Is For

🍳 Foodies

## The Team

| Agent | Role | What They Do |
|-------|------|-------------|
| ReviewReader | Writer | Domain expert for restaurant review aggregator |
| TrendSpotter | Grader | Domain expert for restaurant review aggregator |
| RecommendationEngine | Updater | Domain expert for restaurant review aggregator |

## How It Works

1. **Write** — ReviewReader reads `spec.md` and produces the first draft
2. **Grade** — TrendSpotter evaluates the output (1-100 score)
3. **Update** — If score < 90%, RecommendationEngine improves the output
4. **Repeat** — Loop continues until quality threshold is met

## See It In Action

> Turns 6,000+ reviews of Prince's Hot Chicken into an actionable 8.5/10 verdict: order the dark meat quarter at MEDIUM heat (not mild!), arrive at 11am to avoid the 60-minute lunch rush, skip the breast meat (too dry per 72% of reviews), and pair with mac & cheese. With spice level decoder, timing strategy for a 90-minute window, and recent vs. old review analysis showing 2023 kitchen improvements.

📄 **[See the full example output →](examples/sample-output.md)**

## Running This Sample

```bash
npm install
npm start
```

## Output

Results are saved in the `output/` directory.
