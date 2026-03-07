# Price Monitor & Deal Finder

A Squad sample project demonstrating 4 AI agents working together to track prices, analyze trends, and surface the best deals.

## Agents

| Agent | Role | What it does |
|-------|------|--------------|
| **Monitor** | Price Fetcher | Scans 4 stores for current prices, detects out-of-stock, computes daily changes |
| **Comparator** | Cross-Store Analyzer | Compares prices across stores, computes 30-day stats, trend via linear regression |
| **Deal Scorer** | Value Calculator | Scores deals 0–100 using discount, historical position, trend, volatility, and stock factors |
| **Alert Generator** | Recommendation Engine | Issues BUY NOW / WAIT / SKIP / FLASH DEAL alerts with reasoning |

## Data

- **5 products** — Sony WH-1000XM5, iPad Air M2, Samsung 4K Monitor, Logitech MX Master 3S, Keychron Q1 Pro
- **4 stores** — Amazon, Best Buy, Walmart, B&H Photo
- **30-day price history** per product×store with realistic patterns (trends, flash dips, stability, out-of-stock)

## Run

```bash
npm install && npm start
```

No external APIs required — all data is generated internally with deterministic seeds.
