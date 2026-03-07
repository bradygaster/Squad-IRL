# Rental Property Analyzer — Example Output

> This is what the agent team produces when you run this sample.

## Scenario

Marcus is a 35-year-old software engineer considering his first rental property investment. He found a 3-bedroom, 2-bath single-family home listed at $285,000 in a decent neighborhood. The listing says "great investment opportunity!" but Marcus has no idea how to evaluate if the numbers actually work. He needs to understand: cash flow, ROI, hidden costs, and whether this is actually a good deal or a money pit.

## What the Agents Did

### Round 1: First Draft

**RealEstateAnalyst** produced:

**Purchase Price**: $285,000  
**Estimated Rent**: $2,200/month  
**Mortgage Payment**: ~$1,800/month

**Analysis**: The rent covers the mortgage with $400 left over. This looks like a good investment!

**Recommendation**: Buy it.

**InspectorBot** scored it **64/100** and found:

- Missing ALL the hidden costs (property tax, insurance, maintenance, vacancy, CapEx)
- No ROI calculation or cash-on-cash return
- Doesn't analyze whether $2,200/month rent is realistic for this market
- No down payment amount specified—affects cash flow dramatically
- Ignores closing costs, inspection, potential repairs
- "Buy it" is reckless without deeper analysis

### Round 2: Improved Draft

**NumbersCruncher** addressed the feedback:

Created full pro forma with ALL costs itemized (PITI + maintenance + vacancy + CapEx + property management), researched comparable rents ($2,100-2,300 range, used conservative $2,100), calculated multiple ROI metrics (cash-on-cash return, cap rate, total ROI including appreciation), identified red flags from listing photos (roof looks old, HVAC age unknown), estimated repair costs, ran break-even analysis, and provided clear BUY/PASS recommendation with reasoning.

**InspectorBot** scored it **91/100**: "Meets quality threshold. Thorough financial analysis with realistic assumptions."

## Final Output

# Rental Property Analysis: 1247 Oak Street

**Property**: 3BR/2BA Single-Family Home  
**List Price**: $285,000  
**Location**: Riverside neighborhood, Indianapolis, IN  
**Year Built**: 1998 (26 years old)  
**Square Footage**: 1,650 sq ft  
**Lot Size**: 0.18 acres  

---

## Deal Structure

**Purchase Price**: $285,000  
**Down Payment (20%)**: $57,000  
**Loan Amount**: $228,000  
**Interest Rate**: 7.25% (current 30-year fixed rate)  
**Loan Term**: 30 years  

**Closing Costs** (estimated 3%): $8,550  
**Initial Repairs** (see below): $12,000  
**Total Cash Needed at Close**: **$77,550**

---

## Monthly Income

**Market Rent Analysis**:
- Comparable rentals in Riverside neighborhood:
  - 1243 Oak St (3BR/2BA, similar): $2,250/month  
  - 892 Maple Ave (3BR/2BA): $2,100/month  
  - 456 Elm St (3BR/2.5BA, nicer): $2,400/month

**Conservative Rent Estimate**: **$2,100/month** ($25,200/year)

---

## Monthly Expenses

### Fixed Costs

**Principal & Interest (P&I)**: $1,559/month  
- Calculated using 7.25% interest on $228,000 loan  

**Property Tax**: $285/month ($3,420/year)  
- Based on Marion County rate: 1.2% of assessed value  
- Assessed value: $285,000 × 0.012 = $3,420/year

**Homeowners Insurance**: $120/month ($1,440/year)  
- Quote from State Farm for rental property coverage

**HOA Fees**: $0/month  
- No HOA in this neighborhood (verified)

**Total PITI**: **$1,964/month**

---

### Variable Costs (Reserves)

**Maintenance & Repairs**: $175/month ($2,100/year)  
- Industry standard: 1% of property value annually  
- $285,000 × 0.01 = $2,850/year, using conservative $2,100

**Vacancy**: $175/month ($2,100/year)  
- Assuming 1 month vacancy every 12 months (8.3% vacancy rate)  
- $2,100 × 1 month = $2,100/year

**Capital Expenditures (CapEx)**: $146/month ($1,750/year)  
- Big-ticket replacements: roof, HVAC, water heater, appliances  
- See CapEx analysis below

**Property Management**: $210/month ($2,520/year)  
- 10% of gross rent (industry standard if you hire a PM)  
- OR: $0 if you self-manage (but factor in your time)

**Total Variable Costs**: **$706/month** (if using property manager)  
**Total Variable Costs**: **$496/month** (if self-managing)

---

## Cash Flow Analysis

### Scenario 1: With Property Manager

**Gross Monthly Rent**: $2,100  
**Total Monthly Expenses**: $2,670 ($1,964 PITI + $706 reserves)  
**Monthly Cash Flow**: **-$570 per month** ❌  
**Annual Cash Flow**: **-$6,840 per year** ❌

**Verdict**: NEGATIVE cash flow. This is a bad deal if hiring a property manager.

---

### Scenario 2: Self-Managing

**Gross Monthly Rent**: $2,100  
**Total Monthly Expenses**: $2,460 ($1,964 PITI + $496 reserves)  
**Monthly Cash Flow**: **-$360 per month** ❌  
**Annual Cash Flow**: **-$4,320 per year** ❌

**Verdict**: STILL negative cash flow, even self-managing. Not good.

---

## ROI Metrics

### Cash-on-Cash Return (Year 1)

**Cash Invested**: $77,550 (down payment + closing + repairs)  
**Annual Cash Flow**: -$4,320 (self-managing scenario)  

**Cash-on-Cash Return**: -$4,320 / $77,550 = **-5.6%** ❌

**What this means**: You're LOSING 5.6% of your invested cash annually. This is terrible.

---

### Cap Rate (Capitalization Rate)

**Net Operating Income (NOI)**: $18,180/year  
- Gross rent: $25,200  
- Operating expenses: $7,020 (no mortgage, just taxes, insurance, maintenance, vacancy, CapEx)  

**Cap Rate**: $18,180 / $285,000 = **6.4%**

**What this means**: The property generates 6.4% return on the purchase price, ignoring financing. This is mediocre for Indianapolis (good deals are 8-10%+ cap rate).

---

### Total ROI (5-Year Projection with Appreciation)

**Assumptions**:
- Home appreciates 3% annually (Indianapolis historical average)  
- Rent increases 2.5% annually  
- You hold for 5 years, then sell

**Year 5 Property Value**: $330,460 (3% annual appreciation)  
**Remaining Loan Balance**: $213,680  
**Equity**: $116,780  
**Total Invested**: $77,550  
**5-Year Cash Flow**: -$21,600 (negative cash flow accumulates)  
**Net Profit at Sale**: $116,780 equity - $21,600 cash flow loss - $19,800 selling costs (6%) = **$75,380**

**5-Year Total ROI**: $75,380 / $77,550 = **97.2%** over 5 years = **19.4% annualized**

**What this means**: If you can stomach the negative cash flow for 5 years and the property appreciates, you'll make money on the sale. But you're betting on appreciation, which is risky.

---

## Capital Expenditures (CapEx) Analysis

**CapEx** = Big-ticket items that need replacement every 10-30 years. Here's what this property will need:

| Item | Lifespan | Replacement Cost | Annual Reserve |
|------|----------|------------------|----------------|
| Roof | 20 years | $12,000 | $600/year |
| HVAC | 15 years | $8,000 | $533/year |
| Water Heater | 10 years | $1,200 | $120/year |
| Appliances | 10 years | $2,500 | $250/year |
| Paint/Flooring | 7 years | $5,000 | $714/year (interior refresh) |

**Total Annual CapEx**: $2,217/year = **$185/month**

**Current CapEx Risk Assessment**:
- **Roof**: Listing photos show dark shingles with visible curling. Age unknown, but given home is 26 years old, likely original. **HIGH RISK** - may need replacement within 2-5 years ($12K).
- **HVAC**: Seller disclosure says "AC works fine" but doesn't list age. If original (26 years old), it's WAY past lifespan. **HIGH RISK** - budget $8K replacement soon.
- **Water Heater**: Unknown age, assume mid-life.
- **Appliances**: Listing photos show dated appliances (likely 10-15 years old). **MEDIUM RISK**.

**IMMEDIATE CONCERN**: You may need to replace roof ($12K) and HVAC ($8K) within 1-2 years = $20K additional cash outlay.

---

## Initial Repairs Needed (Estimated)

Based on listing photos and typical issues in 1998-built homes:

1. **Roof inspection & minor repairs**: $2,000 (or $12K full replacement if needed)  
2. **HVAC tune-up/inspection**: $500 (or $8K replacement if shot)  
3. **Interior paint** (looks dated in photos): $3,500  
4. **Carpet replacement** (main living areas): $2,500  
5. **Exterior landscaping/curb appeal**: $1,000  
6. **Minor plumbing fixes** (older homes always have leaks): $1,000  
7. **Electrical inspection** (26-year-old wiring): $500  

**Total Immediate Repairs**: **~$12,000** (conservative, assuming roof/HVAC don't need full replacement yet)

---

## Red Flags

🚩 **Negative Cash Flow**: Even self-managing, you lose $360/month. You'll need reserves to cover this.

🚩 **Low Cap Rate**: 6.4% is below Indianapolis market average (good deals are 8-10%). Overpaying for the property.

🚩 **CapEx Timebomb**: Roof and HVAC are likely near end-of-life. Budget $20K in next 2 years.

🚩 **Listing Language**: "Great investment opportunity!" is realtor code for "this property has been sitting on the market." Check days-on-market (DOM).

🚩 **1998 Build**: Homes from this era often have builder-grade materials that wear out simultaneously (roof, HVAC, water heater, appliances all failing within a few years of each other).

---

## Comparable Sales Analysis

**Recent Sales in Riverside Neighborhood**:
- 1205 Oak St (3BR/2BA, similar): Sold $272,000 (Feb 2024)  
- 889 Maple Ave (3BR/2BA, updated): Sold $295,000 (Jan 2024)  
- 1400 Pine St (3BR/2BA, needs work): Sold $265,000 (Dec 2023)

**Market Assessment**: At $285K, this property is priced at market value, maybe slightly high. It's not a deal.

---

## What Would Make This a Good Deal?

**To achieve positive cash flow of $200/month (self-managing):**

**Required Purchase Price**: ~$235,000 (18% below asking)

**Math**:
- Target monthly expenses: $1,900 (to leave $200 cash flow from $2,100 rent)  
- New loan amount: $188,000 (80% LTV on $235K)  
- New P&I: $1,285/month (vs. current $1,559)  
- Total expenses: $1,285 P&I + $285 tax + $120 insurance + $496 reserves = $2,186  
- Cash flow: $2,100 - $2,186 = -$86/month (still tight, but closer)

**Realistically**: You'd need to buy this for $220,000-230,000 to make it work as a cash-flowing rental. At $285K, it's overpriced for an investor.

---

## Recommendation: ⛔ PASS (Do Not Buy)

### Why You Should Pass:

1. **Negative cash flow**: You'll lose $4,000-7,000 per year depending on management. Real estate investing shouldn't require you to feed a property every month.

2. **Low returns**: 6.4% cap rate is mediocre. Your money works harder in index funds (historically 10% annually) with zero effort.

3. **High risk**: Roof and HVAC are ticking time bombs. You could be hit with $20K in unexpected repairs within 2 years.

4. **Appreciation bet**: Your only path to profit is hoping for 3%+ appreciation. That's speculation, not investing.

5. **Better opportunities exist**: At $285K in Indianapolis, you can find properties with 8-10% cap rates that cash flow $300-500/month. Keep looking.

### If You Really Want This Property:

**Make a lower offer**: $230,000 (19% below asking). Justify it with:
- "Property needs new roof ($12K)"  
- "HVAC is at end of life ($8K)"  
- "Cash flow analysis shows it doesn't work at asking price"  

Seller will probably reject it, but if they counter at $250K, you might have a marginal deal.

---

## Better Investment Alternatives

1. **Keep looking in Indianapolis**: Focus on properties $200-250K range that rent for $1,800-2,000. Better cash flow potential.

2. **Consider turnkey rentals**: Companies like Roofstock sell properties that are already renovated, tenanted, and cash-flowing. Higher price, but less risk.

3. **Out-of-state investing**: Markets like Cleveland, Memphis, or Birmingham have better cash-on-cash returns (10-15%). Work with a property manager.

4. **House hacking**: Buy a duplex, live in one unit, rent the other. Your tenant pays your mortgage. This is how many investors start.

---

**Analysis Quality**: 91/100 (InspectorBot)  
**Recommendation Confidence**: High - the numbers clearly don't work  
**Risk Level**: High (negative cash flow + CapEx risk)  
**Time Saved**: You avoided losing $4,000+/year on a bad investment
