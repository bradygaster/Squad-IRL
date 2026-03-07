# Dashboard Designer — Example Output

> This is what the agent team produces when you run this sample.

## Scenario

Alex is a product manager at a SaaS startup. The exec team wants a "dashboard that shows how the product is doing," but they keep getting lost in spreadsheets with 47 metrics. Alex needs to design a focused dashboard that tells the story of product health in one glance—highlighting what matters, making trends obvious, and driving action.

## What the Agents Did

### Round 1: First Draft

**Designer** produced a layout with 12 metrics in a grid: MRR, churn, active users, signups, NPS, support tickets, page views, API calls, conversion rate, LTV, CAC, and retention.

**DataStoryteller** scored it **67/100**: Too many metrics (information overload), no visual hierarchy (everything looks equally important), missing context (are numbers good or bad?), no narrative flow (doesn't tell a story), lacks actionable insights.

### Round 2: Improved Draft

**UXExpert** restructured around 3 key questions execs actually care about: (1) Are we growing? (2) Are customers happy? (3) Are we profitable? Reduced to 6 core metrics with clear visual hierarchy, added context with targets and sparklines, designed for progressive disclosure (overview → drill-down), and included actionable alerts that highlight what needs attention.

**DataStoryteller** scored it **91/100**: "Focused, actionable, tells a clear story."

## Final Output

# Product Health Dashboard - Design Spec

**Purpose**: Give execs a 30-second view of product health that answers: Are we growing? Are customers happy? Is the business sustainable?

**Audience**: CEO, VP Product, VP Sales, VP Customer Success

**Update Frequency**: Real-time (refreshes every 15 minutes)

---

## Dashboard Structure (3-Section Layout)

### SECTION 1: Growth (Top Left - Primary Focus)

**Question Answered**: "Are we growing?"

#### Primary Metric: Monthly Recurring Revenue (MRR)
- **Display**: Large number, prominent  
- **Current Value**: $847K  
- **vs. Last Month**: +$54K (+6.8%) 🟢  
- **vs. Target**: $850K target (99.6%, on track)  
- **Visualization**: 12-month trend line (sparkline)

**Why MRR is primary**: It's the single best indicator of business health for SaaS. Everything else supports or explains this number.

#### Supporting Metrics (Smaller, below MRR):

**Net New MRR**:  
- $54K this month  
- Breakdown: +$68K new, -$14K churn  
- Visual: Stacked bar (green for new, red for churn)

**Active Customers**:  
- 1,247 customers (up 42 from last month)  
- 90-day trend: ↗️ steady growth

---

### SECTION 2: Customer Health (Top Right)

**Question Answered**: "Are customers happy and staying?"

#### Primary Metric: Net Revenue Retention (NRR)
- **Current Value**: 112%  
- **vs. Last Quarter**: 108% (↑ 4pp improvement) 🟢  
- **Benchmark**: >110% is excellent for SaaS  
- **Visualization**: Quarterly trend

**Why NRR**: Shows if existing customers are expanding (upsells, cross-sells) or contracting (downgrades, churn). Above 100% = growth without new customers.

#### Supporting Metrics:

**Churn Rate**:  
- 2.1% monthly (GOOD—target is <3%)  
- 90-day average: 2.3%  
- Alert: No action needed (green status)

**Net Promoter Score (NPS)**:  
- 42 (industry average is 30-40)  
- Recent trend: flat (no concerns)

---

### SECTION 3: Efficiency (Bottom, Full Width)

**Question Answered**: "Are we profitable / sustainable?"

#### Primary Metrics (Side-by-Side):

**Customer Acquisition Cost (CAC)**:  
- $1,240 per customer  
- vs. Last Quarter: $1,180 (↑ 5% - watch this) 🟡  
- Trend: Rising slightly (investigate why)

**Lifetime Value (LTV)**:  
- $8,960 per customer  
- vs. Last Quarter: $8,200 (↑ 9% - great!) 🟢  

**LTV/CAC Ratio**:  
- 7.2x (EXCELLENT—target is >3x)  
- Interpretation: For every $1 spent acquiring a customer, we make $7.20 back  
- Status: Healthy unit economics 🟢

---

## Visual Design Principles

### Color-Coded Status System

🟢 **Green**: Metric is healthy, no action needed  
🟡 **Yellow**: Watch closely, potential concern  
🔴 **Red**: Urgent, requires immediate attention  
⚪ **Gray**: Neutral, informational only

**Example in use**:
- MRR +6.8% → 🟢 Green (on track)  
- CAC rising 5% → 🟡 Yellow (monitor)  
- If churn spiked to 5% → 🔴 Red (alert!)

---

### Progressive Disclosure (Click to Drill Down)

**Dashboard shows high-level** → **Click a metric** → **See detailed breakdown**

**Example**:  
- **Dashboard view**: "MRR: $847K (+6.8%)"  
- **Click MRR** → Drill-down shows:
  - MRR by customer segment (Enterprise vs. SMB)  
  - MRR by product tier (Basic, Pro, Enterprise)  
  - Cohort analysis (which cohorts are growing/shrinking)  
  - Top 10 customers by MRR

**Why this works**: Execs get the summary view they need; analysts can dig deeper without cluttering the main dashboard.

---

### Contextual Targets & Benchmarks

Every metric shows:
- ✅ **Current value**  
- ✅ **Comparison** (vs. last month/quarter)  
- ✅ **Target or benchmark** (is this good?)  
- ✅ **Trend** (90-day sparkline)

**Example**:
```
Churn Rate: 2.1%
vs. Last Month: 1.9% (↑ 0.2pp)
Target: <3% ✅ (meeting goal)
Trend: [___/‾‾\_] (sparkline shows slight uptick but within range)
```

**Why this matters**: A number without context is useless. "Churn is 2.1%" means nothing unless you know if that's good or bad.

---

## Dashboard Layout (Wireframe)

```
┌─────────────────────────────────────────────────────────────┐
│  PRODUCT HEALTH DASHBOARD           Last Updated: 2:14pm    │
├──────────────────────────────────┬──────────────────────────┤
│                                  │                          │
│  🟢 GROWTH                        │  🟢 CUSTOMER HEALTH      │
│                                  │                          │
│  MRR: $847K (+6.8%) 🟢           │  NRR: 112% 🟢            │
│  [12-month trend line]           │  [Quarterly trend]       │
│  Target: $850K (99.6%)           │  Benchmark: >110% ✅     │
│                                  │                          │
│  Net New MRR: +$54K              │  Churn: 2.1% 🟢          │
│  [+$68K new | -$14K churn]       │  (Target: <3%)           │
│                                  │                          │
│  Active Customers: 1,247         │  NPS: 42                 │
│  (+42 from last month)           │  (Industry avg: 30-40)   │
│                                  │                          │
├──────────────────────────────────┴──────────────────────────┤
│                                                              │
│  🟢 EFFICIENCY & UNIT ECONOMICS                              │
│                                                              │
│  CAC: $1,240 🟡  |  LTV: $8,960 🟢  |  LTV/CAC: 7.2x 🟢     │
│  (+5% QoQ)       |  (+9% QoQ)        |  (Target: >3x)       │
│  [trend]         |  [trend]          |  [trend]             │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

---

## What Makes This Dashboard Great

✅ **Focused**: 6 core metrics, not 47 (execs can process this in 30 seconds)  
✅ **Story-Driven**: Answers 3 key questions (growth, health, sustainability)  
✅ **Actionable**: Color-coded alerts show what needs attention  
✅ **Contextual**: Every number has a comparison, target, or benchmark  
✅ **Scannable**: Visual hierarchy guides the eye (big numbers for important stuff)  
✅ **Truthful**: Doesn't hide bad news; makes problems obvious  

---

## Implementation Notes

**Tech Stack**:
- **Visualization**: Tableau, Looker, or Metabase  
- **Data Source**: Pull from Stripe (MRR), Mixpanel (active users), ChurnKey (churn), Delighted (NPS)  
- **Refresh Rate**: Every 15 minutes (near real-time without overloading systems)

**Access Control**:
- Exec team: Full access  
- Department leads: Access to their relevant sections (e.g., Customer Success sees churn details)  
- Company-wide: Optional high-level view (transparency builds trust)

---

## Dashboard Maintenance

**Monthly Review**: First Monday of each month, product team reviews:
- Are these still the right metrics?  
- Do targets need adjusting?  
- Any new questions we need to answer?

**Annual Refresh**: Once per year, redesign if business priorities shift (e.g., if you pivot from growth to profitability, CAC becomes more important than MRR growth rate).

---

**Dashboard Quality**: 91/100 (DataStoryteller)  
**Clarity**: High (tells a clear story)  
**Actionability**: Strong (color-coded alerts)  
**Focus**: Excellent (6 metrics, not 47)  
**Executive Readiness**: Very high (designed for busy execs)
