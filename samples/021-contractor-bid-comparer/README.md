# Contractor Bid Comparer

> Analyze multiple contractor quotes and flag red flags or missing items

## Who This Is For

🏠 Homeowners

## The Team

| Agent | Role | What They Do |
|-------|------|-------------|
| Inspector | Writer | Domain expert for contractor bid comparer |
| PriceAnalyst | Grader | Domain expert for contractor bid comparer |
| RedFlagDetector | Updater | Domain expert for contractor bid comparer |

## How It Works

1. **Write** — Inspector reads `spec.md` and produces the first draft
2. **Grade** — PriceAnalyst evaluates the output (1-100 score)
3. **Update** — If score < 90%, RedFlagDetector improves the output
4. **Repeat** — Loop continues until quality threshold is met

## See It In Action

**Sarah got 3 quotes for sewer line replacement: $8,500, $12,800, and $18,000.** The agents caught that the cheapest bid omitted permit costs ($450), demanded 50% upfront payment (red flag), and used vague "contractor-grade" materials. The analysis revealed Bid #1's true cost was $8,950 with serious red flags, Bid #2 at $12,800 was fair market value with proper licensing, and Bid #3 was overpriced by 40%. **Bottom line: avoid Bid #1, sign with Bid #2, skip Bid #3.**

> 📄 **[See the full example output →](examples/sample-output.md)**

## Running This Sample

```bash
npm install
npm start
```

## Output

Results are saved in the `output/` directory.
