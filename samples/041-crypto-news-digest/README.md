# Crypto News Digest

> Daily crypto news summary filtering signal from noise

## Who This Is For

💰 Finance

## The Team

| Agent | Role | What They Do |
|-------|------|-------------|
| Reporter | Writer | Domain expert for crypto news digest |
| BSDetector | Grader | Domain expert for crypto news digest |
| TrendSpotter | Updater | Domain expert for crypto news digest |

## How It Works

1. **Write** — Reporter reads `spec.md` and produces the first draft
2. **Grade** — BSDetector evaluates the output (1-100 score)
3. **Update** — If score < 90%, TrendSpotter improves the output
4. **Repeat** — Loop continues until quality threshold is met

## See It In Action

Here's what the agent team produced for Marcus, who needed signal-vs-noise filtering:

> **🚨 High Signal: Bitcoin Spot ETF Inflows Hit $2.1B in Single Week**  
> BlackRock's IBIT saw $892M in net inflows, marking the largest weekly inflow since January. Total spot ETF holdings now exceed 840,000 BTC. On-chain verification: Exchange reserves decreased by 27,000 BTC this week, confirming capital migration to ETF custodians.

> 📄 **[See the full example output →](examples/sample-output.md)**

## Running This Sample

```bash
npm install
npm start
```

## Output

Results are saved in the `output/` directory.
