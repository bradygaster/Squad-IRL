# Options Day Trader

A Squad sample that opens TradingView in a real browser, reads live chart signals (VWAP, EMA 9/21, RSI, VIX), and feeds them to a four-agent analysis squad that produces trade recommendations for 0DTE debit spreads. Uses SPX as the default instrument but can be adapted to any options-tradable symbol.

> **⚠️ PAPER TRADE ONLY — This system NEVER places real orders. It produces analysis and recommendations for educational purposes. No broker integration, no order execution, no real money at risk. Always do your own research before trading.**

## How It Works

1. **Browser opens** — Playwright launches Chromium and navigates to the TradingView SPX chart
2. **You take readings** — Press Enter to capture a signal snapshot: SPX price, VWAP, EMAs, RSI, VIX
3. **Collect multiple readings** — Take several readings over time to observe trend development, then type "done"
4. **Squad analyzes** — Four AI specialists evaluate the signals and produce a complete pre-trade review
5. **Recommendation delivered** — The squad outputs a structured trade recommendation with entry, risk, and timing

## Agents

| Agent | Role | What it does |
|-------|------|--------------|
| **Signal Analyst** | Technical Reader | Reads TradingView chart data — VWAP status, EMA 9/21 alignment, RSI zone, VIX regime — and produces a raw signal assessment |
| **Risk Manager** | Position Sizer | Evaluates VIX regime, calculates max risk ($300 cap), stop loss, profit target, position size. Gates whether a trade is allowed. |
| **Trade Advisor** | Decision Maker | Makes the call: ENTER (Bull Call or Bear Put spread), HOLD, or NO TRADE — with strike selection, spread width, and timing reasoning |
| **Session Reporter** | Summary Generator | Produces a scannable terminal report: signal status, trade recommendation, risk parameters, paper P&L tracking |

## Strategy Overview

- **Instrument:** 0DTE options — SPX by default (European-style, cash-settled, no assignment risk)
- **Structure:** Debit spreads only — Bull Call or Bear Put, 5-point wide
- **Entry window:** 2:00–3:15 PM ET
- **Signal requirement:** 2 of 3 — VWAP break/rejection + EMA 9/21 alignment + RSI confirmation
- **VIX regimes:** <16 LOW, 16–25 MODERATE, 25–30 HIGH (half size), >30 EXTREME (no trade)
- **Risk cap:** $300 max per trade, max 1 trade per day
- **Time stop:** Hard close at 3:30 PM ET

## Run

```bash
npm install
npx playwright install chromium
npm start
```

## Prerequisites

- Node.js >= 20
- GitHub Copilot CLI installed and authenticated (`copilot auth login`)

## Demo Mode

If TradingView can't be reached (no internet, not logged in, etc.), the app automatically falls back to **demo mode** with realistic sample data so the Squad analysis always runs.

## ⚠️ Disclaimer

**This is a paper trading analysis tool only.** It does not connect to any brokerage, does not place orders, and does not manage real positions. The recommendations are AI-generated analysis for educational purposes. Options trading involves significant risk of loss. Past performance does not guarantee future results. Always consult a qualified financial advisor before trading.

## Extending Ideas

- Connect to a paper trading API to track simulated P&L over time
- Add TradingView alert webhook integration for automated signal capture
- Build a daily session journal that logs every signal reading and recommendation
- Add options chain data (IV, Greeks) for more precise strike selection
- Implement multi-timeframe analysis (5m, 15m, 1h charts)
- Track win rate statistics across paper trading sessions
