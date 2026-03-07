# Portfolio Rebalancer — Example Output

> This is what the agent team produces when you run this sample.

## Scenario

Lisa has a \,000 investment portfolio across Vanguard and Fidelity accounts. Her target allocation is 60% stocks / 30% bonds / 10% cash, but after a strong bull market, she's now at 72% stocks / 22% bonds / 6% cash. She needs to rebalance before year-end and has \,000 in unrealized losses in her tech holdings that could be harvested for taxes.

## What the Agents Did

### Round 1: Rebalance Plan

**Analyst** recommended selling \,000 of stock funds and buying \,000 bonds + \,000 cash equivalents.

**RiskManager** scored it **68/100** and found:

- Recommended selling VTEB (tax-exempt bonds) at a \,200 gain, triggering unnecessary capital gains taxes
- Failed to identify tax-loss harvesting opportunity in VXUS (down \,000)
- Didn't check wash sale rule violations (recommended selling and rebuying similar funds within 30 days)
- Trade sizes don't account for Vanguard's \,000 minimum for some funds
- Missing post-rebalance allocation breakdown

### Round 2: Tax-Optimized Rebalance

**TaxOptimizer** addressed all issues and produced a complete rebalancing plan with \,000 in tax-loss harvesting, no wash sale violations, and precise post-rebalance allocations within 0.5% of targets.

**RiskManager** scored it **94/100**: "Tax-efficient, wash-sale compliant, achieves targets."

## Final Output

See full rebalancing plan with specific trades, tax impact analysis (\ in losses harvested = \ tax savings), and projected allocation: 60.2% stocks / 29.8% bonds / 10.0% cash.

**Actionable trades ready to execute, with tax savings that pay for 3 years of advisory fees.**
