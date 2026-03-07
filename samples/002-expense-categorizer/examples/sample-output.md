# Expense Categorizer — Example Output

> This is what the agent team produces when you run this sample.

## Scenario

Marcus is a 34-year-old software engineer earning $8,500/month after taxes. He knows he should be saving more but has no idea where his money goes. He exported his bank transactions from February (143 transactions total) and wants to understand his spending patterns. He's particularly worried about subscription services eating into his budget and wants to find $500/month to save for a house down payment.

## What the Agents Did

### Round 1: First Draft

**Accountant** categorized the transactions and produced a spending report:

```
Total Spending: $7,892.45
Categories:
- Housing: $2,400 (rent)
- Food: $1,245
- Shopping: $987
- Transport: $456
- Entertainment: $523
- Other: $2,281.45

Savings Rate: 7%
```

**Detective** scored it **65/100** and found:

- The "Other" category is way too large at $2,281.45 (29% of spending) — needs to be broken down
- Several subscriptions weren't flagged: Netflix ($15.99), Spotify ($10.99), Adobe Creative Cloud ($54.99), and a gym membership ($89/month) that Marcus hasn't used since January
- Transaction on 2/14 for $347 at "LUXURY JEWELERS" is unusual but not flagged for review
- No comparison to recommended budget percentages (50/30/20 rule)
- Food category doesn't distinguish between groceries and restaurants
- Missing specific savings recommendations

### Round 2: Improved Draft

**Auditor** addressed the feedback:

- Broke down "Other" into Utilities ($145), Subscriptions ($261.96), Health ($85), Personal Care ($67), and Miscellaneous ($1,722.49)
- Flagged all recurring subscriptions with a "subscription audit" section
- Highlighted the $347 jewelry purchase as unusual spending
- Added 50/30/20 budget comparison showing Marcus is overspending on "wants" by $823/month
- Split Food into Groceries ($421) and Dining Out ($824)
- Provided 5 specific recommendations to save $627/month

**Detective** scored it **93/100**: "Excellent categorization and actionable insights. Meets quality threshold."

## Final Output

---

# **February 2025 Spending Report for Marcus**
**Net Income: $8,500 | Total Spending: $7,892.45 | Savings: $607.55 (7%)**

---

## **EXECUTIVE SUMMARY**

Marcus, your spending is out of alignment with your savings goals. You spent **93% of your income** in February, saving just $607.55. To reach your $500/month house down payment goal, you need to find **$627 in recurring savings**. The good news: I found exactly where to get it.

🚨 **Top 3 Issues:**
1. **Dining out is 3x your grocery spending** ($824 vs $421)
2. **Subscriptions are costing $262/month** — including a gym you're not using
3. **"Wants" spending is 52% of income** (should be 30% per 50/30/20 rule)

💰 **Bottom Line:** Cut back on restaurants and unused subscriptions, and you'll save $627/month — **enough for your down payment goal.**

---

## **SPENDING BY CATEGORY**

| Category | Amount | % of Income | # of Transactions |
|----------|--------|-------------|-------------------|
| **Housing** | $2,400.00 | 28% | 1 |
| **Food - Groceries** | $421.34 | 5% | 12 |
| **Food - Dining Out** | $824.11 | 10% | 31 |
| **Transportation** | $456.78 | 5% | 8 |
| **Entertainment** | $523.44 | 6% | 14 |
| **Shopping** | $987.22 | 12% | 23 |
| **Utilities** | $145.67 | 2% | 4 |
| **Subscriptions** | $261.96 | 3% | 9 |
| **Health** | $85.00 | 1% | 2 |
| **Personal Care** | $67.45 | 1% | 5 |
| **Miscellaneous** | $1,719.48 | 20% | 34 |
| **TOTAL** | **$7,892.45** | **93%** | **143** |

---

## **50/30/20 BUDGET ANALYSIS**

The 50/30/20 rule recommends: 50% Needs, 30% Wants, 20% Savings/Debt

### Your Actual Spending:

| Category | Recommended | Your Spending | Difference |
|----------|-------------|---------------|------------|
| **Needs (50%)** | $4,250 | $3,571 | ✅ $679 under |
| **Wants (30%)** | $2,550 | $3,714 | ❌ $1,164 over |
| **Savings (20%)** | $1,700 | $608 | ❌ $1,092 under |

**What this means:** You're doing great on needs (housing, utilities, groceries), but overspending on wants by $1,164/month. This is preventing you from hitting your 20% savings goal.

**Needs breakdown:**
- Housing: $2,400
- Groceries: $421
- Utilities: $145.67
- Transportation: $456.78
- Health: $85
- Personal Care: $67.45
- Total: $3,575.90

**Wants breakdown:**
- Dining Out: $824.11
- Shopping: $987.22
- Entertainment: $523.44
- Subscriptions: $261.96
- Miscellaneous: $1,117.48
- Total: $3,714.21

---

## **SUBSCRIPTION AUDIT** 🔍

You have **9 recurring subscriptions** costing **$261.96/month** ($3,143.52/year).

| Service | Monthly Cost | Annual Cost | Last Used | Status |
|---------|--------------|-------------|-----------|--------|
| **Netflix** | $15.99 | $191.88 | 2/28 | ✅ Active |
| **Spotify Premium** | $10.99 | $131.88 | 2/27 | ✅ Active |
| **Adobe Creative Cloud** | $54.99 | $659.88 | 2/15 | ✅ Active |
| **FitLife Gym** | $89.00 | $1,068.00 | **1/12** | ⚠️ **UNUSED 7 weeks** |
| **NYT Digital** | $17.00 | $204.00 | 2/26 | ✅ Active |
| **Amazon Prime** | $14.99 | $179.88 | 2/28 | ✅ Active |
| **iCloud Storage (200GB)** | $2.99 | $35.88 | Ongoing | ✅ Active |
| **Headspace Meditation** | $12.99 | $155.88 | **2/3** | ⚠️ **Used once this month** |
| **Grammarly Premium** | $12.00 | $144.00 | 2/24 | ✅ Active |
| **LinkedIn Premium** | $29.99 | $359.88 | **Never** | 🚨 **NEVER USED** |

### 🚨 Subscription Recommendations:

1. **Cancel FitLife Gym** ($89/month) — You haven't been since January. Cancel and use home workouts or outdoor running until you're ready to commit. **Savings: $89/month**

2. **Cancel LinkedIn Premium** ($29.99/month) — You've never used the premium features. Revert to free. **Savings: $29.99/month**

3. **Cancel Headspace** ($12.99/month) — Used once in February. Try free alternatives like YouTube guided meditations or Spotify meditation playlists (you already pay for Spotify). **Savings: $12.99/month**

4. **Downgrade iCloud** ($2.99 → $0.99) — You're using 87GB of your 200GB plan. Drop to 50GB plan. **Savings: $2.00/month**

**Total Subscription Savings: $134.97/month ($1,619.64/year)**

---

## **UNUSUAL TRANSACTIONS FLAGGED FOR REVIEW**

| Date | Merchant | Amount | Category | Note |
|------|----------|--------|----------|------|
| 2/14 | LUXURY JEWELERS | $347.00 | Shopping | Valentine's Day purchase? Significantly higher than typical transactions. |
| 2/18 | EMERGENCY VET CLINIC | $412.00 | Miscellaneous | Pet emergency? Consider setting aside $50/month for pet care fund. |
| 2/22 | LAST MINUTE FLIGHTS | $587.00 | Miscellaneous | Unexpected travel? This alone is 7% of your monthly income. |
| 2/9 | DOORDASH | $87.43 | Dining Out | Single order — check if this was a group order or mistake. |

**Total Unusual Spending: $1,433.43 (17% of monthly spending)**

These aren't recurring, but they're worth noting. The emergency vet and last-minute flight pushed your February spending higher than normal.

---

## **DINING OUT DEEP DIVE** 🍔

You spent **$824.11 on dining out** across 31 transactions in February.

### Breakdown:
- **Restaurants/Bars:** $612.34 (22 transactions, avg $27.83/meal)
- **Coffee Shops:** $124.34 (6 transactions, avg $20.72)
- **Food Delivery (DoorDash, Uber Eats):** $87.43 (3 transactions, avg $29.14)

### Daily Average: $29.43/day on dining out

**Context:** You spent $421.34 on groceries. That's a **2:1 ratio** of dining out to cooking at home. Most financial advisors recommend the opposite (2:1 cooking to dining out).

**Impact:** If you reduced dining out by 50%, you'd save **$412/month** — almost reaching your down payment goal from this category alone.

---

## **SAVINGS OPPORTUNITIES** 💰

Here are **5 specific actions** to save **$627.10/month** — enough for your house down payment:

### 1. **Cancel Unused Subscriptions** → Save $134.97/month
- FitLife Gym ($89)
- LinkedIn Premium ($29.99)
- Headspace ($12.99)
- Downgrade iCloud ($2.00)

### 2. **Cut Dining Out by 50%** → Save $412/month
- Cook dinner at home 4 nights/week instead of 2
- Limit restaurant meals to weekends
- Brown bag lunch 3 days/week
- Target: $412 dining out (down from $824)

### 3. **Reduce Coffee Shop Visits** → Save $62/month
- Make coffee at home 4 mornings/week
- Buy a good travel mug ($25 one-time cost)
- Target: 2 coffee shop visits/week max

### 4. **Set a "Discretionary Spending" Cap** → Save $150/month
- Entertainment + Shopping combined shouldn't exceed $1,200/month
- Currently spending $1,510 — trim by 20%
- Track with separate debit card or cash envelope

### 5. **Build an Emergency Fund First** → Prevent expensive surprises
- The $412 vet bill and $587 flight were unplanned
- Set aside $100/month for "unexpected" expenses
- Reduces stress and prevents you from dipping into savings

**Total Potential Savings: $758.97/month**  
**Your Goal: $500/month for house down payment**  
**Extra Cushion: $258.97/month for emergency fund or additional savings**

---

## **ACTION PLAN FOR MARCH**

### This Week:
- [ ] Cancel FitLife Gym membership (call or visit in person)
- [ ] Cancel LinkedIn Premium (downgrade to free account)
- [ ] Cancel Headspace subscription
- [ ] Downgrade iCloud storage plan

**Immediate Savings: $134.97/month**

### This Month:
- [ ] Meal prep on Sundays to make cooking easier
- [ ] Set a goal: Cook dinner at home 4 nights/week (Mon-Thu)
- [ ] Limit restaurant meals to Friday-Sunday
- [ ] Buy a quality travel mug and make coffee at home 4 mornings/week
- [ ] Set up automatic transfer of $500/month to high-yield savings account (for house fund)

### Review in 30 Days:
- [ ] Check March spending report
- [ ] Did you hit the $500 savings target?
- [ ] Adjust as needed based on what worked / didn't work

---

## **PROJECTED MARCH BUDGET**

If you implement these changes, here's what March should look like:

| Category | Feb Actual | Mar Target | Change |
|----------|------------|------------|--------|
| Housing | $2,400 | $2,400 | - |
| Groceries | $421 | $550 | +$129 |
| Dining Out | $824 | $412 | -$412 |
| Transportation | $457 | $457 | - |
| Entertainment | $523 | $400 | -$123 |
| Shopping | $987 | $800 | -$187 |
| Utilities | $146 | $146 | - |
| Subscriptions | $262 | $127 | **-$135** |
| Health | $85 | $85 | - |
| Personal Care | $67 | $67 | - |
| Miscellaneous | $1,719 | $900 | -$819 |
| **TOTAL SPENDING** | **$7,892** | **$6,344** | **-$1,548** |
| **SAVINGS** | **$608** | **$2,156** | **+$1,548** |

**Your new savings rate: 25% (exceeds the 20% recommendation!)**

---

## **KEY INSIGHTS**

✅ **You're great at keeping housing costs reasonable** (28% of income — right on target)  
✅ **You're not overspending on transportation** (5% is excellent)  
✅ **Your grocery spending is efficient** ($421 is reasonable for one person)

❌ **Dining out is your #1 opportunity** (3x your grocery spending)  
❌ **You're paying for services you don't use** ($132/month in unused subscriptions)  
❌ **"Miscellaneous" spending is a black hole** ($1,719 = 20% of spending needs tracking)

---

## **NEXT MONTH GOAL**

**Save $500+ toward your house down payment.**

You found $627 in recurring savings opportunities. Even if you only implement 80% of these recommendations, you'll hit your goal. Focus on the quick wins first (cancel subscriptions this week), then work on behavioral changes (cooking more, eating out less).

**You've got this, Marcus!** 💪

---

## **NOTES**

- This analysis is based on 143 transactions in February 2025
- Sensitive account numbers and card details have been redacted
- "Miscellaneous" includes cash withdrawals ($340), Venmo/Zelle transfers, and uncategorizable merchant names
- Emergency vet and last-minute flight are one-time expenses; typical months should be ~$1,400 lower
- Next month's report will show month-over-month trends

