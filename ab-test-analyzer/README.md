# A/B Test Analyzer — Squad Sample

A single-file TypeScript demo that simulates a **6-agent Squad** analyzing three A/B tests with real statistical rigor. No external dependencies beyond the TypeScript runner.

## Quick Start

```bash
npm install
npm start
```

## What It Does

The program generates progressive terminal output showing six specialist agents collaborating to evaluate three realistic A/B experiments (clear winner, inconclusive, and negative result).

## The 6 Agents

| # | Agent | Role |
|---|-------|------|
| 1 | 🔍 **Data Validator** | Checks sample sizes, allocation ratios, Simpson's paradox, randomization quality |
| 2 | 📊 **Stats Engine** | Runs z-tests for proportions, computes CIs, p-values, and power — shows every formula step |
| 3 | 📈 **Segment Analyzer** | Breaks results down by Mobile/Desktop, New/Returning, and Region with an ASCII heatmap |
| 4 | 💰 **Revenue Calculator** | Projects annualized revenue impact with confidence bands for each test |
| 5 | ⚠️ **Risk Assessor** | Scores novelty effects, peeking bias, seasonality, and external validity per test |
| 6 | 🎯 **Decision Maker** | Synthesizes all evidence into SHIP / DON'T SHIP / EXTEND with a weighted scorecard |

## Statistical Methods

- **Two-proportion z-test** for conversion rate differences
- **Abramowitz & Stegun** approximation for the standard normal CDF
- **Rational approximation** for the inverse normal CDF
- **Wald confidence intervals** for proportion differences
- **Chi-squared sample-ratio mismatch** test
- **Power analysis** and minimum sample-size calculation using  
  `n = (Z_α/2 + Z_β)² × (p₁(1−p₁) + p₂(1−p₂)) / (p₁ − p₂)²`
- **Simpson's paradox** detection (segment-vs-overall sign disagreement)

## Project Structure

```
ab-test-analyzer/
├── index.ts        # All code — agents, stats, data, display
├── package.json
├── tsconfig.json
└── README.md
```
