# Contract Reviewer — Squad Multi-Agent Demo

A standalone TypeScript simulation demonstrating how a **Squad** of five specialized AI agents collaborates to review a 15-clause SaaS contract. No external AI APIs are called — all analysis logic is deterministic and hardcoded to showcase the multi-agent orchestration pattern.

## What It Does

The demo feeds a realistic (and intentionally vendor-favorable) SaaS contract through a pipeline of five agents, each with a distinct role:

| Agent | Role |
|---|---|
| 📄 **Parser** | Extracts clause type, key terms, numeric values, and obligated party from each clause |
| 🔍 **Risk Analyzer** | Scores every clause 1–10 by comparing extracted values against company-policy thresholds |
| 📊 **Comparator** | Benchmarks each clause against industry-standard terms and calculates deviation percentages |
| 💡 **Negotiation Advisor** | Drafts alternative language and prioritizes changes for high-risk clauses (score ≥ 7) |
| 📋 **Summary Writer** | Produces an executive dashboard with traffic-light grid, top concerns, and a sign/negotiate/walk recommendation |

## Risk Scoring Algorithm

Each clause is evaluated against a set of predefined thresholds:

- **Payment terms** — Net 30 is standard; anything beyond 45 days elevates risk
- **Auto-renewal duration** — Acceptable up to 1 year; 2-year locks score high
- **Liability cap** — Must cover at least 12 months of fees; shorter caps are penalized
- **SLA uptime** — 99.9 % is the industry floor; 99.5 % or below is a red flag
- **Price escalation** — Increases above 5 % per year are flagged as high risk
- **Termination asymmetry** — Unequal notice periods between customer and vendor raise the score

Risk scores are integers from 1 (benign) to 10 (walk-away). The final contract score is a weighted average that emphasizes liability, data, and IP clauses.

## Benchmark Comparison

For every clause the Comparator agent holds an "industry standard" value (e.g., Net 30 payment, 99.9 % SLA, 12-month liability cap). It computes a deviation percentage:

```
deviation = ((actual - standard) / standard) * 100
```

Clauses deviating more than 50 % worse than the benchmark are flagged for negotiation.

## Running

```bash
npm install
npm start
```

Output is a richly formatted terminal report (ANSI colors, box-drawing characters, traffic-light emojis) designed to run in any modern terminal emulator.

## Project Structure

```
contract-reviewer/
├── index.ts        # All agent logic, contract data, and rendering
├── package.json
├── tsconfig.json
└── README.md
```

## Why This Matters

Contract review is a high-stakes, multi-perspective task — exactly the kind of work where a squad of focused agents outperforms a single generalist. This demo shows the pattern: parse → analyze → compare → advise → summarize, with each agent adding a distinct layer of insight.
