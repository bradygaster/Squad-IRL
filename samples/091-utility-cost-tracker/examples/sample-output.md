# Utility Cost Tracker — Example Output

> This is what the agent team produces when you run this sample.

---

## Scenario

**Homeowners:** Tom and Linda Bergstrom
**Property:** 3-bedroom, 1,800 sq ft colonial — Naperville, Illinois
**Utility providers:** ComEd (electricity), Nicor Gas (natural gas), City of Naperville (water/sewer)
**Analysis period:** July 2023 – June 2024

Tom and Linda have noticed their utility bills creeping up over the past year and want to understand why. They have 12 months of bills and are looking for actionable recommendations. Their home has a newer AC unit (installed 2021), a 15-year-old furnace, and original windows from 1998.

---

## What the Agents Did

### 🔴 Round 1 — Auditor Draft (scored ~45/100 by TrendSpotter)

The **Auditor** agent produced an initial report that simply listed monthly costs in a table:

> **Auditor's first attempt (excerpt):**
>
> | Month | Electric | Gas | Water |
> |-------|----------|-----|-------|
> | Jul 2023 | $247 | $42 | $64 |
> | Aug 2023 | $231 | $45 | $66 |
> | ... | ... | ... | ... |
>
> Total annual utilities: $4,083.
>
> **Recommendations:** Consider using less energy. Turn off lights when not in use.
> Unplug devices you aren't using. Keep your thermostat at a reasonable temperature.

**TrendSpotter graded this 45/100 with the following feedback:**

- ❌ **No cost-per-unit analysis.** Raw dollar amounts are meaningless without kWh and therm breakdowns. Were costs up because of rate hikes or usage increases? The report doesn't say.
- ❌ **December anomaly completely missed.** Electricity jumped to $178 in December vs. $112 the previous December — a 59% year-over-year increase. This demands investigation.
- ❌ **No regional benchmarking.** How do the Bergstroms compare to other Naperville households? Without context, the numbers are just numbers.
- ❌ **Generic recommendations.** "Use less energy" is not actionable. Where specifically are they overspending? What upgrades would have the best ROI?
- ❌ **No seasonal pattern analysis.** Summer and winter peaks should be broken out and analyzed separately.
- ❌ **No ROI calculations.** If you recommend a furnace upgrade, show the math — cost, savings, payback period.
- ❌ **Missing water/sewer analysis.** Water was basically ignored beyond listing it in the table.

### 🟢 Round 2 — SavingsHunter Revision (scored ~92/100)

The **SavingsHunter** agent rewrote the report from scratch, incorporating all of TrendSpotter's feedback:

- ✅ Calculated $/kWh trends month-over-month and identified that ComEd rates increased from $0.0823/kWh to $0.0891/kWh mid-year, accounting for ~$74 of the annual increase
- ✅ Spotted the December electricity anomaly and investigated likely causes (holiday lighting, space heater use during a cold snap)
- ✅ Compared all utilities against Naperville DuPage County averages — the Bergstroms are 23% above average on gas
- ✅ Identified the aging furnace (82% AFUE vs. modern 96% AFUE) as the primary cost driver
- ✅ Provided 7 specific, prioritized savings recommendations with ROI calculations
- ✅ Ranked by payback period so the Bergstroms know what to tackle first
- ✅ Estimated total potential annual savings of $840–$1,100

**TrendSpotter approved at 92/100**, noting: *"Comprehensive, data-driven, locally relevant. Minor deduction: could include a visual spending timeline and more detail on the rate plan comparison. Otherwise, this is ready for delivery."*

---

## Final Output

---

# 🏠 Bergstrom Household — Utility Cost Analysis

**Prepared for:** Tom & Linda Bergstrom
**Address:** Naperville, IL 60540
**Home:** 3 BR / 2 BA Colonial, 1,800 sq ft, built 1998
**Analysis period:** July 2023 – June 2024
**Total annual utility cost:** $4,083

---

## 📊 Annual Utility Summary

### Monthly Cost Breakdown

| Month | Electricity | Gas | Water/Sewer | **Monthly Total** |
|:------|------------:|--------:|------------:|------------------:|
| Jul 2023 | $247 | $42 | $64 | **$353** |
| Aug 2023 | $231 | $45 | $66 | **$342** |
| Sep 2023 | $156 | $58 | $65 | **$279** |
| Oct 2023 | $112 | $97 | $63 | **$272** |
| Nov 2023 | $104 | $142 | $64 | **$310** |
| Dec 2023 | $178 | $198 | $66 | **$442** |
| Jan 2024 | $121 | $218 | $65 | **$404** |
| Feb 2024 | $108 | $196 | $64 | **$368** |
| Mar 2024 | $98 | $148 | $65 | **$311** |
| Apr 2024 | $89 | $82 | $66 | **$237** |
| May 2024 | $102 | $61 | $67 | **$230** |
| Jun 2024 | $201 | $69 | $65 | **$335** |
| | | | | |
| **Annual** | **$1,847** | **$1,456** | **$780** | **$4,083** |

### Spending by Category

| Utility | Annual Cost | % of Total | Avg Monthly |
|:--------|------------:|-----------:|------------:|
| Electricity (ComEd) | $1,847 | 45.2% | $153.92 |
| Natural Gas (Nicor) | $1,456 | 35.7% | $121.33 |
| Water/Sewer (City) | $780 | 19.1% | $65.00 |

### Usage Breakdown (Estimated from Billing)

| Utility | Annual Usage | Avg Rate | Rate Trend |
|:--------|-------------:|---------:|:-----------|
| Electricity | ~20,730 kWh | $0.0891/kWh | ↑ 8.3% vs. prior year ($0.0823 → $0.0891) |
| Natural Gas | ~1,520 therms | $0.958/therm | ↑ 4.1% vs. prior year ($0.920 → $0.958) |
| Water/Sewer | ~7,200 gal/mo | $9.03/1,000 gal | Stable (no rate change) |

> **Key finding:** Approximately $74 of your electricity cost increase and $58 of your gas increase came from rate hikes alone — not from using more energy. But usage *also* increased, particularly in December and summer months.

---

## 📈 Trend Analysis

### Electricity (ComEd)

Your electricity usage follows a clear **dual-peak pattern** — high in summer (AC) and a secondary bump in winter:

| Season | Avg Monthly Cost | Avg Monthly kWh | Primary Drivers |
|:-------|-----------------:|----------------:|:----------------|
| Summer (Jun–Aug) | $226.33 | ~2,540 kWh | Central AC (2021 unit, 16 SEER) |
| Fall (Sep–Nov) | $124.00 | ~1,390 kWh | Baseline + transition |
| Winter (Dec–Feb) | $135.67 | ~1,520 kWh | Heating auxiliaries, holiday use |
| Spring (Mar–May) | $96.33 | ~1,080 kWh | Lowest usage period |

**Summer performance is actually solid.** Your 2021 AC unit (16 SEER) is relatively efficient. Summer costs are high simply because of Naperville's hot, humid July/August weather. At ~2,540 kWh/month for 1,800 sq ft, you're within the expected range for a home with original 1998 windows (which reduce AC efficiency through solar heat gain).

**Winter electricity is the concern.** December's $178 bill represents 1,997 kWh — far above the fall baseline of ~1,390 kWh. This anomaly is analyzed in detail below.

ComEd's residential rate increased from $0.0823/kWh to $0.0891/kWh effective September 2023 (the standard annual procurement adjustment). This added roughly $6.13/month to your bill even at flat usage.

### Natural Gas (Nicor Gas)

Gas usage is **heavily seasonal**, as expected for a gas-heated home in northern Illinois:

| Season | Avg Monthly Cost | Avg Monthly Therms | Notes |
|:-------|-----------------:|-------------------:|:------|
| Summer (Jun–Aug) | $52.00 | ~54 therms | Water heater + cooking only |
| Fall (Sep–Nov) | $99.00 | ~103 therms | Heating ramp-up |
| Winter (Dec–Feb) | $204.00 | ~213 therms | Full heating season |
| Spring (Mar–May) | $97.00 | ~101 therms | Heating wind-down |

**Your winter gas costs are 23% above the Naperville average** for a similarly sized home. The primary driver is your furnace — a 15-year-old unit likely rated at ~82% AFUE (Annual Fuel Utilization Efficiency). Modern high-efficiency furnaces run at 96–97% AFUE. That means for every dollar of gas you burn, you're losing roughly 18 cents up the exhaust flue.

Nicor Gas's residential rate for the analysis period averaged $0.958/therm (commodity + delivery), up from $0.920/therm the prior year. Nicor's delivery charge alone is $0.3568/therm; the commodity portion fluctuated with market prices.

**Summer baseline is reasonable.** At ~54 therms/month in summer, you're running a gas water heater and possibly a gas range/oven. This is normal for a 4-person household (assuming standard occupancy).

### Water / Sewer

| Metric | Value |
|:-------|:------|
| Monthly average | $65.00 |
| Monthly range | $63 – $67 |
| Estimated usage | ~7,200 gallons/month |
| Naperville rate | $5.58/1,000 gal (water) + $3.45/1,000 gal (sewer) |

Your water usage is **remarkably consistent** — a sign that you don't have leaks and your irrigation (if any) is minimal. The City of Naperville's combined water/sewer rate of $9.03/1,000 gallons means you're using about 240 gallons/day, which is average for a 2-person household with efficient fixtures.

**No action needed here.** Water costs are stable, within normal range, and show no anomalies.

---

## 🔍 Anomaly Detection

### ⚡ December 2023 Electricity Spike — FLAGGED

| Metric | December 2023 | December 2022 | Change |
|:-------|---------------:|---------------:|-------:|
| Cost | $178 | $112 | **+$66 (+59%)** |
| Est. kWh | ~1,997 | ~1,361 | **+636 kWh (+47%)** |

After accounting for the ComEd rate increase ($0.0823 → $0.0891/kWh), the rate change explains only ~$11 of the $66 increase. That leaves approximately **$55 in unexplained usage increase** — roughly 617 additional kWh.

**Most likely causes (in order of probability):**

1. **Holiday lighting:** Outdoor and indoor holiday displays are common in Naperville. A moderate display (e.g., 10 strings of incandescent C9 lights running 6 hours/day for 30 days) consumes ~216 kWh (~$19). If the Bergstroms used incandescent lights extensively, this could account for $20–$35.

2. **Space heater usage:** December 2023 had a cold snap in Naperville (several days below 5°F during the week of Dec 18–24). A 1,500W space heater running 8 hours/day for 15 days consumes 180 kWh (~$16). Two heaters would double that.

3. **Holiday gatherings / cooking:** Extended oven use, extra laundry, and guests increase baseline consumption. Estimated impact: 50–100 kWh (~$4–$9).

4. **Furnace blower overtime:** During extreme cold, the furnace blower motor runs nearly continuously. At 500W, running 18 hours/day (vs. a normal 10 hours) for 15 cold days adds ~60 kWh (~$5).

**Combined estimate:** These factors plausibly explain $44–$65 of the $55 unexplained increase. **Recommendation:** Switch to LED holiday lights (saves ~80% on holiday lighting costs) and avoid portable space heaters — they're extremely expensive to run. Address the root cause (cold rooms) with weatherstripping instead.

### 🔥 January 2024 Gas Peak — Expected but High

January's $218 gas bill (est. ~228 therms) is the annual peak. While expected, it's elevated:

- **Naperville average** for a 1,800 sq ft home in January: ~185 therms ($177)
- **Your usage:** ~228 therms ($218)
- **Overage:** ~43 therms, or **$41 above average**

This directly correlates with furnace efficiency. At 82% AFUE, your furnace needs ~23% more gas input to deliver the same heat as a 96% AFUE unit. On a $218 bill, that inefficiency costs you roughly **$35–$42/month** during peak heating.

### Other Observations

- **No gas leak indicators.** Summer baseline gas usage is normal — no sign of a gas leak or malfunctioning appliance.
- **No water anomalies.** Flat water usage with no seasonal spikes rules out irrigation waste or hidden leaks.
- **AC efficiency looks good.** Summer electricity costs are within expected range for a 16 SEER unit in a 1,800 sq ft home, confirming the 2021 AC replacement is performing well.

---

## 📏 How You Compare

### vs. Naperville Averages (1,800 sq ft single-family home)

| Utility | Your Annual | Naperville Avg | Difference | Rating |
|:--------|------------:|---------------:|-----------:|:-------|
| Electricity | $1,847 | $1,680 | +$167 (+10%) | ⚠️ Above average |
| Natural Gas | $1,456 | $1,183 | +$273 (+23%) | 🔴 Well above average |
| Water/Sewer | $780 | $810 | −$30 (−4%) | ✅ Below average |
| **Total** | **$4,083** | **$3,673** | **+$410 (+11%)** | ⚠️ Above average |

### vs. Similar Homes in Your Neighborhood

Based on DuPage County energy benchmarking data for colonials built 1995–2000 with ~1,800 sq ft:

| Factor | Your Home | Comparable Homes | Insight |
|:-------|:----------|:-----------------|:--------|
| Gas usage per sq ft | 0.844 therms/sq ft/yr | 0.656 therms/sq ft/yr | Furnace + windows driving overage |
| Electric usage per sq ft | 11.5 kWh/sq ft/yr | 10.8 kWh/sq ft/yr | Slightly high; December anomaly inflates |
| Heating degree day efficiency | 7.2 therms/HDD per 1,000 sq ft | 5.8 therms/HDD per 1,000 sq ft | Confirms furnace inefficiency |

> **Bottom line:** Your gas spending is the primary outlier. Electricity is slightly above average but explainable. Water is great. The $410 annual overage vs. the Naperville average is almost entirely attributable to gas heating inefficiency.

---

## 💡 Savings Opportunities

Ranked by **payback period** (fastest return on investment first):

### 1. Smart Thermostat — Estimated Savings: $145–$190/year

| Detail | Value |
|:-------|:------|
| Cost | $130–$250 (Nest, Ecobee) |
| Installation | DIY (1 hour) or pro install ~$75 |
| Payback period | **6–14 months** |
| How it saves | Learning schedule reduces heating/cooling 10–15% |
| Naperville rebate | ComEd offers $25 rebate; Nicor offers $50 rebate |

Your current manual thermostat means the furnace and AC run on a fixed schedule regardless of occupancy. A smart thermostat with geofencing and learning capability would reduce runtime by an estimated 12%, saving ~$175/year on gas and ~$55/year on electricity. Net cost after rebates: as low as $55.

### 2. LED Holiday Lighting — Estimated Savings: $25–$35/year

| Detail | Value |
|:-------|:------|
| Cost | $40–$80 (replace all incandescent strings) |
| Payback period | **1–2 seasons** |
| How it saves | 80–90% less energy than incandescent strings |

This directly addresses the December anomaly. LED C9 strings use ~0.6W per bulb vs. 7W for incandescent. A full outdoor display drops from ~$30/season to ~$4/season.

### 3. Weatherstripping & Caulking (Windows/Doors) — Estimated Savings: $95–$140/year

| Detail | Value |
|:-------|:------|
| Cost | $60–$120 (DIY materials from Menards on Ogden Ave or Home Depot on Route 59) |
| Payback period | **5–12 months** |
| How it saves | Seals air leaks around original 1998 windows and doors |

Your 1998 windows likely have degraded weatherstripping and dried-out caulk. You don't need to replace the windows yet — just reseal them. Focus on the north and west-facing windows first (greatest wind exposure in Naperville). Use V-strip weatherstripping for double-hung windows and silicone caulk for fixed frames.

### 4. Phantom Load Elimination — Estimated Savings: $50–$75/year

| Detail | Value |
|:-------|:------|
| Cost | $25–$50 (smart power strips) |
| Payback period | **4–8 months** |
| How it saves | Eliminates standby power draw from electronics |

The average American home loses $100+/year to phantom loads (TVs, game consoles, chargers, cable boxes drawing power while "off"). Smart power strips with auto-shutoff for your entertainment center and home office can cut this by 50–75%. At $0.0891/kWh, eliminating 600–850 kWh/year of phantom load saves $50–$75.

### 5. Water Heater Insulation Blanket — Estimated Savings: $30–$45/year

| Detail | Value |
|:-------|:------|
| Cost | $25–$35 |
| Payback period | **7–12 months** |
| How it saves | Reduces standby heat loss from water heater tank |

If your gas water heater is more than 5 years old and lacks built-in insulation, an R-8 insulation blanket reduces standby heat loss by 25–45%. This saves roughly 30–45 therms/year at current Nicor rates.

### 6. Furnace Replacement (High-Efficiency) — Estimated Savings: $340–$420/year

| Detail | Value |
|:-------|:------|
| Cost | $3,800–$5,500 installed (96% AFUE two-stage) |
| Payback period | **9–14 years** |
| How it saves | 96% AFUE vs. your current ~82% AFUE = 17% less gas |
| Available rebates | Nicor Gas: up to $300; Federal 25C tax credit: up to $600 |
| Net cost after rebates | **$2,900–$4,600** |

This is your **biggest single savings opportunity** but has a longer payback. Your 15-year-old furnace is approaching end of life (typical lifespan: 15–20 years). At 82% AFUE, you're losing $0.18 of every gas dollar. Upgrading to a 96% AFUE two-stage furnace would save an estimated $340–$420/year in gas costs.

**When to pull the trigger:** If your furnace needs a major repair (heat exchanger, blower motor replacement), the repair cost often exceeds $800–$1,200. At that point, investing in a new unit makes more financial sense than repairing. Get quotes from local contractors:

- Energy Experts (Naperville, IL) — Carrier/Bryant dealer
- Dupage Heating & Air — Lennox dealer, serves Naperville
- Four Seasons Heating — frequently runs Nicor rebate promotions

### 7. ComEd Rate Plan Optimization — Estimated Savings: $40–$80/year

| Detail | Value |
|:-------|:------|
| Cost | Free |
| Payback period | **Immediate** |
| How it saves | Time-of-use rate shifting or alternative supplier |

ComEd offers several rate options:

- **Standard residential rate (BES):** Flat rate, currently $0.0891/kWh. This is what you're likely on.
- **Hourly pricing (RRTP):** Real-time pricing through ComEd's hourly program. If you can shift usage to off-peak hours (laundry, dishwasher, EV charging after 9 PM), you can save 15–25% on the supply portion of your bill.
- **Alternative retail electric supplier (ARES):** Illinois's deregulated market lets you shop for supply rates. Check the ICC's Plug In Illinois website for current offers — rates as low as $0.065/kWh have been available.

**Caution:** Variable-rate supplier contracts can backfire. Lock in a fixed rate if you go the ARES route.

### Summary: Total Potential Savings

| Priority | Action | Annual Savings | Upfront Cost | Payback |
|:---------|:-------|---------------:|-------------:|:--------|
| 1 | Smart thermostat | $145–$190 | $55–$250 | 6–14 mo |
| 2 | LED holiday lights | $25–$35 | $40–$80 | 1–2 seasons |
| 3 | Weatherstripping | $95–$140 | $60–$120 | 5–12 mo |
| 4 | Phantom load strips | $50–$75 | $25–$50 | 4–8 mo |
| 5 | Water heater blanket | $30–$45 | $25–$35 | 7–12 mo |
| 6 | Furnace replacement | $340–$420 | $2,900–$4,600 | 9–14 yr |
| 7 | Rate plan optimization | $40–$80 | $0 | Immediate |
| | | | | |
| | **TOTAL** | **$725–$985** | | |

> With all measures implemented (including the furnace over time), the Bergstroms can realistically expect **$840–$1,100 in annual savings** when including the compounding effect of reduced baseline usage and rate plan optimization. The quick wins alone (items 1–5 and 7) deliver **$385–$565/year** with a combined investment under $500.

---

## 🏠 Upgrade Recommendations

### Immediate (This Month) — Under $150 Total

| Action | Where to Buy | Cost | Time |
|:-------|:-------------|-----:|:-----|
| Smart power strips (×3) | Amazon or Best Buy (Naperville, Route 59) | $25–$50 | 30 min to set up |
| Weatherstripping kit | Menards (Ogden Ave, Naperville) or Home Depot (Route 59) | $60–$120 | Weekend project |
| Water heater blanket | Home Depot or Menards | $25–$35 | 1 hour |

### Next 1–3 Months — Under $350 Total

| Action | Where to Buy | Cost | Time |
|:-------|:-------------|-----:|:-----|
| Smart thermostat (Ecobee Premium or Nest Learning) | Best Buy, Costco, or ComEd marketplace (rebate applied at checkout) | $130–$250 | 1–2 hours (DIY) |
| LED holiday light strings (replace all incandescent) | Costco (pre-season) or Home Depot | $40–$80 | Before December |
| ComEd rate evaluation | ComEd.com → "My Account" → "Rate Options" | Free | 30 min |

### Within 1–3 Years — Plan Ahead

| Action | Get Quotes From | Est. Cost | When to Act |
|:-------|:----------------|----------:|:------------|
| High-efficiency furnace (96% AFUE) | Energy Experts, Dupage Heating, Four Seasons | $3,800–$5,500 | When current unit needs major repair or at age 18–20 |
| Window replacement (if budget allows) | Naperville Window & Door, Pella (showroom on Ogden) | $8,000–$15,000 | Optional; weatherstripping bridges the gap for now |

---

## 📅 Seasonal Strategy

### 🌸 Spring (March – May)
- [ ] Schedule annual AC tune-up ($80–$120) — your 2021 unit is still under warranty; confirm with installer
- [ ] Check and replace weatherstripping damaged over winter
- [ ] Switch ComEd hourly pricing on (if enrolled) — spring rates are lowest
- [ ] Open windows when temps are 65–75°F to reduce AC usage

### ☀️ Summer (June – August)
- [ ] Set smart thermostat to 76°F when home, 82°F when away
- [ ] Run dishwasher and laundry after 9 PM (off-peak ComEd hours)
- [ ] Close blinds on south and west windows during afternoon
- [ ] Check AC filter monthly — dirty filters increase costs 5–15%

### 🍂 Fall (September – November)
- [ ] Schedule furnace inspection before heating season ($80–$100 tune-up)
- [ ] Replace furnace filter (do this every 60–90 days through winter)
- [ ] Reverse ceiling fans to clockwise (pushes warm air down)
- [ ] Apply fresh caulk around any windows with visible gaps
- [ ] Buy LED holiday lights *before* the season (better selection, lower prices)

### ❄️ Winter (December – February)
- [ ] Set smart thermostat to 68°F when home, 62°F overnight, 58°F when away
- [ ] Use LED holiday lights exclusively — set timer for 5 PM – 10 PM
- [ ] Avoid space heaters — address cold rooms with weatherstripping instead
- [ ] Keep garage door closed (shared wall loses heat rapidly)
- [ ] Monitor December bill specifically — compare to this year's $178 baseline

---

## ⚠️ Billing Alerts

Set up the following alerts to catch problems early:

| Alert | Threshold | How to Set Up | Why It Matters |
|:------|:----------|:--------------|:---------------|
| ComEd high usage | >2,200 kWh/month | ComEd app → Alerts → Usage threshold | Catches AC problems, unusual appliance draw |
| Nicor high usage | >200 therms/month | Nicor Gas app → My Account → Alerts | Catches furnace issues, gas leaks |
| Water spike | >9,000 gal/month | City of Naperville utility portal | Catches hidden leaks (toilet, irrigation) |
| ComEd rate change | Any change | ComEd email alerts | Lets you re-evaluate ARES options |
| Bill vs. budget | >$400/month total | Manual check or Mint/YNAB budget alert | Overall spending guardrail |

**Critical alert:** If your gas bill exceeds $250 in any month, or your summer gas baseline exceeds $70/month, contact Nicor to schedule a **free gas leak inspection**. Elevated summer gas (when heating is off) can indicate a leak in supply lines.

---

## 🎯 Your 12-Month Savings Plan

Here's a month-by-month action plan starting from the current date:

| Month | Action | Est. Cost | Cumulative Savings |
|:------|:-------|----------:|-------------------:|
| **Month 1** | Install smart power strips (3 units) | $35 | — |
| **Month 1** | Apply weatherstripping to all windows and doors | $90 | — |
| **Month 1** | Install water heater insulation blanket | $30 | — |
| **Month 1** | Evaluate ComEd rate plan; switch if beneficial | $0 | — |
| **Month 2** | Purchase and install smart thermostat | $180 | ~$30 saved |
| **Month 3** | Purchase LED holiday light replacements | $60 | ~$75 saved |
| **Month 4** | First full month with all quick wins active | — | ~$120 saved |
| **Month 6** | Mid-year check: compare bills to this analysis | — | ~$250 saved |
| **Month 6** | Get 3 quotes for furnace replacement (planning) | $0 | — |
| **Month 9** | Review heating season bills vs. last year | — | ~$420 saved |
| **Month 12** | Full-year review; decide on furnace timeline | — | **~$580 saved** |

**Total first-year investment:** ~$395
**Projected first-year savings:** $500–$650 (without furnace replacement)
**Projected annual savings (year 2+):** $725–$985 (without furnace) or $840–$1,100 (with furnace)

---

> **Note:** All costs and rates are based on ComEd and Nicor Gas published residential tariffs for the Naperville, IL service area as of the analysis period (July 2023 – June 2024). Actual savings will vary based on weather, occupancy patterns, and future rate changes. Rebate availability is subject to change — verify at [ComEd.com/rebates](https://comed.com/rebates) and [Nicor Gas rebates](https://www.nicorgas.com/residential/rebates-and-energy-savings.html) before purchasing.
