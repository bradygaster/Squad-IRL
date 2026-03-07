# Stock Pitch Generator

> Research and write investment thesis documents for potential stock picks

## Who This Is For

💰 Finance

## The Team

| Agent | Role | What They Do |
|-------|------|-------------|
| Analyst | Writer | Domain expert for stock pitch generator |
| Skeptic | Grader | Domain expert for stock pitch generator |
| Reporter | Updater | Domain expert for stock pitch generator |

## How It Works

1. **Write** — Analyst reads `spec.md` and produces the first draft
2. **Grade** — Skeptic evaluates the output (1-100 score)
3. **Update** — If score < 90%, Reporter improves the output
4. **Repeat** — Loop continues until quality threshold is met

## See It In Action

**Jake's investment club is considering Axon Devices (AXND), a semiconductor stock down 35% this year.** The agents built a complete investment thesis with specific financials (gross margin expanding to 48% despite revenue decline), a clear catalyst (Orion-3 AI chip launching Q4 with major cloud provider design-in), and honest risk assessment. **The result: BUY recommendation at $42 with $58 target (+38% upside), backed by bottom-up valuation and three probability-weighted scenarios.**

> 📄 **[See the full example output →](examples/sample-output.md)**

## Running This Sample

```bash
npm install
npm start
```

## Output

Results are saved in the `output/` directory.
