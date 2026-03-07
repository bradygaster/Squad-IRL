# Real Estate Investment Analyzer

A Squad sample project demonstrating 6 AI agents working together to evaluate rental properties and identify the best investment opportunity.

## Agents

| Agent | Role | What it does |
|-------|------|--------------|
| **Data Agent** | Property Researcher | Presents each property's details — beds, baths, sqft, price/sqft, features, condition |
| **Comp Agent** | Market Comparator | Generates 3 comparable sales per property, estimates market value, flags over/undervaluation |
| **Rental Agent** | Rent Estimator | Produces rental comps, estimates monthly rent, gross rent multiplier, vacancy rate |
| **Financial Agent** | Investment Modeler | Calculates mortgage payments, cap rate, cash-on-cash return, and 30-year NPV with full math |
| **Neighborhood Agent** | Area Scorer | Scores each neighborhood on schools, transit, safety, job growth, walkability, population trend |
| **Risk Agent** | Risk Assessor | Identifies flood zone, market trend, vacancy, maintenance, environmental, and insurance risks |

## Financial Formulas

### Mortgage Payment

```
M = P × [r(1+r)^n] / [(1+r)^n − 1]
P = purchase price × 0.75 (25% down payment)
r = annual rate / 12
n = 360 months (30-year fixed)
```

### Cap Rate

```
Cap Rate = (NOI / Purchase Price) × 100
NOI = Annual Rent − Vacancy − Taxes − Insurance − Maintenance − HOA
```

### Cash-on-Cash Return

```
CoC = (Annual Pre-Tax Cash Flow / Total Cash Invested) × 100
Cash Flow = Monthly Rent − Mortgage − Taxes/12 − Insurance/12 − HOA − Maintenance/12
Cash Invested = Down Payment + Closing Costs (3% of price)
```

### 30-Year Net Present Value

```
NPV = Σ(t=1→30) [Cash Flow_t / (1 + d)^t] − Initial Investment
```

Calculated at discount rates of 6%, 8%, and 10%.

## Data

- **5 properties** — Oak Park ranch, Downtown condo, Riverside colonial, Westside duplex, Lakewood townhouse
- **15 comparable sales** (3 per property) with addresses, prices, and dates
- **15 rental comps** (3 per property) with monthly rents and sqft
- **Neighborhood scores** across 6 dimensions per area
- **Risk profiles** with 6 risk factors per property

## Run

```bash
npm install && npm start
```

No external APIs required — all data is embedded in the source.
