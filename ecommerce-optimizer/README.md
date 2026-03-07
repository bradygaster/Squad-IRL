# E-Commerce Optimizer — Squad Multi-Agent Simulation

A standalone TypeScript demo that simulates **6 AI agents** collaborating to optimize an e-commerce store with 15 products, 50+ customers, and realistic market data.

## Quick Start

```bash
npm install
npm start
```

## The 6 Agents

| # | Agent | Role | Algorithm |
|---|-------|------|-----------|
| 1 | 📦 Catalog Analyst | Scores products by margin, velocity, and rating; builds an ASCII scatter plot; classifies into BCG quadrants | Weighted composite scoring |
| 2 | 💲 Pricing Engine | Models demand curves and finds the profit-maximizing price for every product | Price elasticity of demand: `Q = Q₀·(P/P₀)^ε`, optimal `P* = cost·ε/(ε+1)` |
| 3 | 🎁 Bundle Creator | Discovers complementary products and designs profitable bundles | Association rules — support, confidence, lift (market-basket analysis) |
| 4 | 🔄 Conversion Optimizer | Visualizes the purchase funnel, identifies drop-off points, and quantifies the revenue impact of improvements | Funnel analysis with impact × effort prioritization |
| 5 | 👥 Customer Segmenter | Segments 50+ customers by purchase behavior and recommends actions per segment | RFM (Recency, Frequency, Monetary) scoring with quintile binning |
| 6 | 📈 Revenue Forecaster | Runs 1,000 Monte Carlo iterations to project 90-day revenue with and without optimizations | Seeded PRNG Monte Carlo simulation with percentile confidence intervals |

## What You'll See

Progressive terminal output with ANSI color, ASCII charts, and step-by-step reasoning from each agent — culminating in a confidence-interval forecast that ties every recommendation together.

## Requirements

- Node.js ≥ 18
- No external runtime dependencies (only `tsx` and `typescript` as dev tools)
