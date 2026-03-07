# EV Charging Optimizer — Example Output

> This is what the agent team produces when you run this sample.

---

## Scenario

**Travelers:** Ben and Sarah Nakamura
**Vehicle:** 2023 Tesla Model Y Long Range (CCS + NACS compatible)
**Route:** Denver, CO → Moab, UT (Sun Outdoors Arches Gateway campground)
**Distance:** ~350 miles via I-70 West
**Date:** Friday, August 9, 2024 — departure 5:00 PM MDT
**Return:** Sunday evening, August 11, 2024
**Starting charge:** 92% (EPA-estimated 300 miles at highway speed)
**Key constraints:**
- Campground has **no charging**
- Traveling with a dog — stops must be pet-friendly or quick
- Mountain driving: Vail Pass at 10,662 ft, significant elevation changes
- Temperature: 95°F Denver, 102°F Moab (extreme heat)
- Minimize total charging time, but never risk running out
- Need a complete round-trip strategy (can't strand in Moab)

---

## What the Agents Did

### 🔴 Round 1 — RouteOptimizer Draft (Score: 41/100)

RouteOptimizer produced an initial charging plan:

```
ROUND 1 DRAFT (RouteOptimizer)
──────────────────────────────
Route: Denver → Moab via I-70 W
Distance: 351 miles
Starting charge: 92% (300 miles EPA range)

Charging Plan:
  Stop 1: Silverthorne Supercharger (mile 68) — charge to 80%, ~15 min
  Stop 2: Grand Junction Supercharger (mile 246) — charge to 90%, ~25 min
  Arrive Moab with ~35% charge.

Total charging time: ~40 minutes
Estimated arrival: 10:15 PM
```

**ChargerFinder Grader Feedback (41/100):**

| Category | Score | Issue |
|---|---|---|
| Range accuracy | 2/20 | Used EPA rated range (330 mi) — not real-world highway range. At 75 mph with AC blasting in 95–102°F heat climbing mountain passes, real range drops dramatically. This plan will leave them stranded. |
| Route completeness | 3/20 | Only covers outbound trip. They're camping with NO CHARGING at the campground. How do they get home? This is a critical failure. |
| Charger coverage | 5/20 | Only listed Tesla Superchargers. No backup options if stalls are full on a Friday evening in August (peak travel). |
| Safety margin | 4/20 | With realistic range, the gap between Silverthorne and Grand Junction (178 miles through mountains in extreme heat) is dangerously far with no backup plan. |
| Amenity info | 2/10 | Zero information about pet-friendliness, food, restrooms. They have a dog! |
| Cost estimate | 0/10 | No cost information at all. |

**Key failures identified:**
1. **Range fantasy:** EPA rates the Model Y LR at 330 miles. At 75 mph highway, 95–102°F heat with AC, and 10,000+ ft elevation changes, real-world range is closer to 245–260 miles. The plan assumes range that doesn't exist.
2. **No return trip:** Complete omission. If they arrive in Moab at 35% (~115 mi EPA, ~85 mi real), they can't get to the nearest Supercharger in Grand Junction (112 miles away) on the return — especially climbing out of Moab.
3. **No backup chargers:** Friday evening in August is peak Supercharger traffic along the I-70 ski/recreation corridor. Every Supercharger could have a wait.
4. **Pet needs ignored:** Dog requires shade, water, grass. No stop amenities mentioned.
5. **No timing detail:** "~10:15 PM" with no breakdown. They need to know if they'll be setting up camp in the dark.

---

### 🟢 Round 2 — CostCalculator Revision (Score: 93/100)

CostCalculator rebuilt the plan from scratch with real-world physics, a complete round-trip strategy, and practical travel details. The revised plan follows below.

**ChargerFinder Grader Feedback (93/100):**

| Category | Score | Notes |
|---|---|---|
| Range accuracy | 19/20 | Excellent real-world range model accounting for speed, elevation, temperature, and AC load. Minor: could include headwind factor. |
| Route completeness | 20/20 | Full outbound + Moab charging + return trip. Every leg accounted for. |
| Charger coverage | 18/20 | Primary + backup at every stop. Could add one more L2 backup near Rifle. |
| Safety margin | 18/20 | Conservative targets with 15–20% buffer at each arrival. Well done. |
| Amenity info | 9/10 | Pet-friendly details at every stop. Could add water bowl availability. |
| Cost estimate | 9/10 | Per-stop and total costs. Could break out $/kWh more precisely by time-of-day pricing. |

**Improvement summary:** Addressed every critical failure. Real-world range model is sound. Return trip strategy is complete. Backup chargers and pet info included throughout. This plan is safe, practical, and actionable.

---

## Final Output

---

# ⚡ EV Charging Plan: Denver → Moab Round Trip

**Prepared for:** Ben & Sarah Nakamura
**Date:** August 9–11, 2024
**Vehicle:** 2023 Tesla Model Y Long Range (82 kWh usable battery)

---

## 🚗 Trip Overview

| Detail | Value |
|---|---|
| **Route** | Denver, CO → Moab, UT via I-70 West / US-191 South |
| **One-way distance** | ~351 miles |
| **Round-trip distance** | ~702 miles |
| **Elevation range** | 5,280 ft (Denver) → 10,662 ft (Vail Pass) → 4,026 ft (Moab) |
| **Weather** | 95°F Denver, 88°F mountains, 102°F Moab — AC required entire trip |
| **Passengers** | 2 adults + 1 dog |
| **Cargo** | Camping gear (~150 lbs estimated) |
| **Campground** | Sun Outdoors Arches Gateway, Moab — **no EV charging on-site** |
| **Charger compatibility** | Tesla Supercharger (NACS native) + CCS via adapter |

---

## ⚡ Range Reality Check

**Why EPA range is fiction for this trip:**

| Factor | EPA Assumption | Your Reality | Range Impact |
|---|---|---|---|
| **Speed** | 55–65 mph mixed | 75 mph sustained highway | −12% to −18% |
| **Temperature** | 70°F ideal | 95–102°F extreme heat | −8% to −15% |
| **AC usage** | Minimal | Full blast, 4+ hours | −5% to −8% |
| **Elevation** | Flat terrain | +5,382 ft climb to Vail Pass | −10% to −15% on climb legs |
| **Cargo weight** | Empty vehicle | ~150 lbs camping gear | −2% to −3% |
| **Tire condition** | New OEM tires | Assumed adequate | — |

**Adjusted range calculation:**

```
EPA rated range (100% charge):           330 miles
Highway speed correction (75 mph):       −54 miles (−16%)
Heat + AC correction (95–102°F):         −36 miles (−11%)
Elevation change penalty (averaged):     −20 miles (−6%)
Cargo penalty:                            −8 miles (−2%)
                                         ─────────
Realistic full-charge range:              ~212 miles (flat) to ~260 miles (downhill net)
Conservative planning range:              ~245 miles (100% → ~5%)

Your starting range at 92%:              ~225 miles realistic
```

> **Bottom line:** Your 92% charge gets you roughly 225 real-world miles — not the 300 the dashboard says. Plan accordingly.

**Elevation profile impact by leg (outbound):**

| Leg | Start Elev. | End Elev. | Net Change | Effect |
|---|---|---|---|---|
| Denver → Silverthorne | 5,280 ft | 9,035 ft | +3,755 ft | Heavy drain — climbing |
| Silverthorne → Vail Pass | 9,035 ft | 10,662 ft | +1,627 ft | Continued climb |
| Vail Pass → Glenwood Springs | 10,662 ft | 5,761 ft | −4,901 ft | Regen recovery — net energy gain |
| Glenwood Springs → Grand Junction | 5,761 ft | 4,586 ft | −1,175 ft | Slight regen benefit |
| Grand Junction → Moab | 4,586 ft | 4,026 ft | −560 ft | Mostly flat desert, slight net downhill |

---

## 🗺️ Outbound Route: Denver → Moab (Friday Evening)

### Leg 1: Denver → Silverthorne Supercharger

| Detail | Value |
|---|---|
| **Distance** | 68 miles via I-70 West |
| **Elevation change** | +3,755 ft (heavy climb through Eisenhower Tunnel) |
| **Estimated energy use** | ~38% of battery (extreme — steep climb + heat) |
| **Depart** | 5:00 PM MDT at 92% charge |
| **Arrive** | ~6:15 PM at ~54% charge |

**⚡ Primary Charger: Silverthorne Supercharger**

| Detail | Value |
|---|---|
| **Location** | 246 Rainbow Dr, Silverthorne, CO 80498 (Outlets at Silverthorne) |
| **Type** | Tesla Supercharger V3 (250 kW) |
| **Stalls** | 8 |
| **Charge target** | 54% → 88% |
| **Estimated charge time** | ~18 minutes |
| **Cost** | ~$5.40 (28 kWh × $0.19/kWh off-peak estimate) |
| **Amenities** | Outlet mall with restaurants (Chipotle, Starbucks, Jimmy John's), restrooms, outdoor walkways |
| **🐕 Dog-friendly** | ✅ Outdoor outlet mall — dog can walk on leash between stores. Grassy areas nearby. |

**🔄 Backup Charger:**
- **ChargePoint L2** at Silverthorne Town Hall (0.3 mi away) — slower but available if Supercharger is full
- **Frisco Supercharger** (8 miles further west on I-70) — 8 V3 stalls, next resort town

> **⏱️ Depart Silverthorne:** ~6:35 PM at 88%

---

### Leg 2: Silverthorne → Glenwood Springs Supercharger

| Detail | Value |
|---|---|
| **Distance** | 104 miles via I-70 West |
| **Elevation change** | +1,627 ft up to Vail Pass, then −4,901 ft down to Glenwood — **net downhill** |
| **Estimated energy use** | ~30% of battery (climb to Vail Pass then significant regen descent) |
| **Depart** | ~6:35 PM at 88% |
| **Arrive** | ~8:05 PM at ~58% |

> **Note:** This leg crosses Vail Pass (10,662 ft). Expect heavier energy consumption on the climb, but substantial regenerative braking recovery on the long descent to Glenwood Springs. Net energy use is moderate.

**⚡ Primary Charger: Glenwood Springs Supercharger**

| Detail | Value |
|---|---|
| **Location** | 51241 US-6, Glenwood Springs, CO 81601 (Glenwood Meadows) |
| **Type** | Tesla Supercharger V3 (250 kW) |
| **Stalls** | 12 |
| **Charge target** | 58% → 90% |
| **Estimated charge time** | ~20 minutes |
| **Cost** | ~$6.10 (32 kWh × $0.19/kWh) |
| **Amenities** | Target shopping center — Target, Chick-fil-A, MOD Pizza, Starbucks, King Soopers grocery |
| **🐕 Dog-friendly** | ✅ Large parking lot with grassy borders. Pet relief area near King Soopers. Quick walk along the Colorado River trail (0.2 mi). |

**Why stop here instead of pushing to Grand Junction?**
Grand Junction is 89 miles further. At 58% you'd have ~142 miles of real-world range — enough mathematically, but that's only a ~12% buffer through Glenwood Canyon (no charging, no cell service in parts, no safe pulloff). Too risky with a dog in 90°F+ heat.

**🔄 Backup Charger:**
- **Electrify America CCS** at Walmart Glenwood Springs (0.5 mi) — 150 kW, 4 stalls
- **Rifle Supercharger** (27 miles further west) — 8 V3 stalls, in case Glenwood is packed

> **⏱️ Depart Glenwood Springs:** ~8:25 PM at 90%

---

### Leg 3: Glenwood Springs → Grand Junction Supercharger

| Detail | Value |
|---|---|
| **Distance** | 89 miles via I-70 West |
| **Elevation change** | −1,175 ft (gradual downhill) |
| **Estimated energy use** | ~22% of battery (downhill, but still hot — 98°F evening) |
| **Depart** | ~8:25 PM at 90% |
| **Arrive** | ~9:35 PM at ~68% |

**⚡ Primary Charger: Grand Junction Supercharger**

| Detail | Value |
|---|---|
| **Location** | 718 Horizon Dr, Grand Junction, CO 81506 (near Horizon Dr shopping) |
| **Type** | Tesla Supercharger V3 (250 kW) |
| **Stalls** | 12 |
| **Charge target** | 68% → 95% |
| **Estimated charge time** | ~22 minutes (slower above 80% — tapering) |
| **Cost** | ~$5.10 (27 kWh × $0.19/kWh) |
| **Amenities** | Adjacent to restaurants, fast food, gas stations. Walmart 0.3 mi. |
| **🐕 Dog-friendly** | ✅ Grassy strip along Horizon Dr. It's after dark by now — cooler for the dog. Quick walk area behind the charger lot. |

**Why charge to 95% here?**
This is the **last Supercharger before Moab** (112 miles). You need to arrive in Moab with enough charge to also get back to Grand Junction on Sunday. Charging high here is critical.

**🔄 Backup Charger:**
- **Electrify America CCS** at Walmart Grand Junction (2442 US-6 & 50, 1.2 mi) — 350 kW, 4 stalls
- **ChargePoint L2** at Mesa Mall (0.8 mi) — emergency only, slow

> **⏱️ Depart Grand Junction:** ~9:57 PM at 95%

---

### Leg 4: Grand Junction → Moab (Sun Outdoors Arches Gateway)

| Detail | Value |
|---|---|
| **Distance** | 112 miles via I-70 W to US-191 S |
| **Elevation change** | −560 ft net (rolling desert terrain) |
| **Estimated energy use** | ~38% of battery (flat desert but 90°F+ even at night, AC still running) |
| **Depart** | ~9:57 PM at 95% |
| **Arrive** | ~11:30 PM at ~57% |

**No charging on this leg.** The stretch from Grand Junction to Moab has zero DC fast chargers. Commit to this leg fully charged.

> **🏁 Arrive Sun Outdoors Arches Gateway:** ~11:30 PM at **~57% charge (~140 miles real-world range)**

---

## 🏕️ While in Moab — Charging Options

Your campground has no charging, but you need enough charge for the 112-mile return leg to Grand Junction (plus buffer for the climb back up). Topping off in town is strongly recommended.

| Charger | Location | Type | Speed | Cost | Notes |
|---|---|---|---|---|---|
| **Moab Supercharger** | 1491 N US-191, Moab, UT 84532 | Tesla V3, 250 kW | ~15 min to add 30% | ~$4.50 | At Moab Valley Inn. **Best option.** 8 stalls. |
| **Electrify America** | 400 E Center St (City Market) | CCS, 150 kW | ~20 min to add 30% | ~$6.00 | In town, near groceries. |
| **Moab Level 2 (free)** | Moab Information Center, 25 E Center St | J-1772, 7.2 kW | ~4 hrs for 20% | Free | Park and explore Main St. Great for daytime. |
| **Dead Horse Point State Park** | State park entrance | L2, 7.2 kW | Slow | Free | If visiting the park, plug in while hiking. |

**Recommended Moab charging strategy:**
1. **Saturday morning** — Drive into town for breakfast. Supercharge at Moab Supercharger while grabbing coffee. 57% → 90% in ~20 min. Cost: ~$6.30.
2. This gives you **~90% for Saturday adventures** and enough to top off again before departure.
3. **Sunday before departure** — Supercharge to 95% before heading back. 15–20 min. Cost: ~$4.50.

---

## 🗺️ Return Route: Moab → Denver (Sunday Evening)

> **Important:** The return trip is harder. You're climbing **net +1,254 ft** back to Denver, and the biggest challenge is the long climb from Glenwood Springs back over Vail Pass (+4,901 ft). Budget more charging on the return.

**Depart Moab:** 3:00 PM MDT at 95% (after Supercharging)

### Return Leg 1: Moab → Grand Junction Supercharger

| Detail | Value |
|---|---|
| **Distance** | 112 miles via US-191 N to I-70 E |
| **Elevation change** | +560 ft (slight uphill) |
| **Estimated energy use** | ~42% (uphill + peak afternoon heat 102°F + AC) |
| **Arrive** | ~4:45 PM at ~53% |
| **Charge to** | 95% (~30 min, tapering above 80%) |
| **Cost** | ~$8.00 |

**🐕 Dog break:** Walk along the canal path behind the Horizon Dr shopping area. Shaded in late afternoon.

> **Depart Grand Junction:** ~5:15 PM at 95%

### Return Leg 2: Grand Junction → Glenwood Springs Supercharger

| Detail | Value |
|---|---|
| **Distance** | 89 miles via I-70 East |
| **Elevation change** | +1,175 ft (gradual uphill) |
| **Estimated energy use** | ~28% |
| **Arrive** | ~6:30 PM at ~67% |
| **Charge to** | 95% (~22 min) |
| **Cost** | ~$5.30 |

**Why charge to 95% here?**
The next leg includes the brutal 4,901-ft climb from Glenwood Springs to Vail Pass. This is the most energy-intensive segment of the entire round trip. Top off fully.

**🐕 Dog break:** Evening walk along the Glenwood Springs river trail. Beautiful spot, cooler air. Bring water for the dog — still 85°F+.

> **Depart Glenwood Springs:** ~6:52 PM at 95%

### Return Leg 3: Glenwood Springs → Silverthorne Supercharger

| Detail | Value |
|---|---|
| **Distance** | 104 miles via I-70 East |
| **Elevation change** | +4,901 ft to Vail Pass, then −1,627 ft to Silverthorne — **net +3,274 ft** |
| **Estimated energy use** | ~42% (the hardest leg — sustained mountain climb) |
| **Arrive** | ~8:25 PM at ~53% |
| **Charge to** | 75% (~12 min — only need enough for the downhill run to Denver) |
| **Cost** | ~$4.00 |

**🐕 Dog break:** Quick walk at the outlet mall. It's cooling down — mid 70s°F by now. Grassy area near the parking lot.

> **Depart Silverthorne:** ~8:37 PM at 75%

### Return Leg 4: Silverthorne → Denver (Home)

| Detail | Value |
|---|---|
| **Distance** | 68 miles via I-70 East |
| **Elevation change** | −3,755 ft (all downhill through the Eisenhower Tunnel) |
| **Estimated energy use** | ~15% (significant regen braking on descent) |
| **Arrive** | ~9:35 PM at ~60% |

> **🏁 Arrive home in Denver:** ~9:35 PM Sunday with **~60% charge** — plenty of buffer.

---

## 💰 Total Charging Costs

### Outbound (Friday)

| Stop | kWh Added | Cost |
|---|---|---|
| Silverthorne Supercharger | ~28 kWh | $5.40 |
| Glenwood Springs Supercharger | ~32 kWh | $6.10 |
| Grand Junction Supercharger | ~27 kWh | $5.10 |
| **Outbound subtotal** | **~87 kWh** | **$16.60** |

### Moab (Saturday–Sunday)

| Stop | kWh Added | Cost |
|---|---|---|
| Saturday morning Supercharge | ~27 kWh | $6.30 |
| Sunday pre-departure Supercharge | ~19 kWh | $4.50 |
| **Moab subtotal** | **~46 kWh** | **$10.80** |

### Return (Sunday)

| Stop | kWh Added | Cost |
|---|---|---|
| Grand Junction Supercharger | ~34 kWh | $8.00 |
| Glenwood Springs Supercharger | ~23 kWh | $5.30 |
| Silverthorne Supercharger | ~18 kWh | $4.00 |
| **Return subtotal** | **~75 kWh** | **$17.30** |

### Total

| | kWh | Cost |
|---|---|---|
| **Entire round trip** | **~208 kWh** | **$44.70** |
| Equivalent gas cost (Model Y = ~28 MPG equivalent ICE SUV, $3.89/gal Colorado avg) | — | ~$97.50 |
| **EV savings** | — | **~$52.80 (54% less than gas)** |

---

## ⏱️ Trip Timeline

### Friday, August 9 (Outbound)

| Time | Event | Battery |
|---|---|---|
| 5:00 PM | Depart Denver | 92% |
| 6:15 PM | Arrive Silverthorne Supercharger | 54% |
| 6:15–6:33 PM | ⚡ Charge + dog walk at outlets | 54% → 88% |
| 8:03 PM | Arrive Glenwood Springs Supercharger | 58% |
| 8:03–8:23 PM | ⚡ Charge + grab dinner | 58% → 90% |
| 9:33 PM | Arrive Grand Junction Supercharger | 68% |
| 9:33–9:55 PM | ⚡ Charge (critical top-off) | 68% → 95% |
| 11:28 PM | **Arrive Moab campground** 🏕️ | 57% |

**Total drive time:** ~5 hrs 15 min
**Total charge time:** ~53 min
**Total trip time:** ~6 hrs 28 min

### Saturday, August 10 (Moab)

| Time | Event | Battery |
|---|---|---|
| 8:30 AM | Drive to town, Supercharge while getting coffee | 52% → 90% |
| All day | Explore Arches, hike, enjoy Moab | Parked |

### Sunday, August 11 (Return)

| Time | Event | Battery |
|---|---|---|
| 2:30 PM | Supercharge in Moab before departure | 70% → 95% |
| 3:00 PM | Depart Moab | 95% |
| 4:45 PM | Arrive Grand Junction — charge 30 min | 53% → 95% |
| 5:15 PM | Depart Grand Junction | 95% |
| 6:30 PM | Arrive Glenwood Springs — charge 22 min | 67% → 95% |
| 6:52 PM | Depart Glenwood Springs | 95% |
| 8:25 PM | Arrive Silverthorne — charge 12 min | 53% → 75% |
| 8:37 PM | Depart Silverthorne | 75% |
| **9:35 PM** | **Arrive Denver** 🏠 | **60%** |

**Return drive time:** ~5 hrs 20 min
**Return charge time:** ~1 hr 24 min (more charging due to uphill)
**Return trip time:** ~6 hrs 35 min

---

## 🐕 Pet-Friendly Stop Guide

| Stop | Dog Suitability | Details |
|---|---|---|
| **Silverthorne** | ⭐⭐⭐⭐ | Outlet mall is outdoor — walk between stores on leash. Grassy areas at the east end of the parking lot. Water fountain near the food court patio. Shade from buildings. |
| **Glenwood Springs** | ⭐⭐⭐⭐⭐ | Best dog stop on the route. Colorado River trail is 0.2 mi from charger — beautiful evening walk. Grassy park areas. Cooler mountain air. Bring water bowl. |
| **Grand Junction** | ⭐⭐⭐ | Commercial area — less scenic but functional. Grassy strip along Horizon Dr. Walk behind the shopping center for a quieter area. Late evening = cooler temps. |
| **Moab town** | ⭐⭐⭐⭐ | Moab is very dog-friendly. Main Street shops welcome leashed dogs. Moab Bark Park (off-leash, 0.5 mi from Supercharger). Bring water — desert heat is brutal. |

**🌡️ Heat safety reminders:**
- **Never leave the dog in the car**, even with AC on — Tesla Cabin Overheat Protection has limits
- Carry a collapsible water bowl and extra water bottle for the dog
- Check pavement temperature with your hand before letting the dog walk on asphalt
- Evening stops (Glenwood Springs, Silverthorne on return) are best for longer dog walks
- The Moab Supercharger has some shade from adjacent buildings — park in the shade if possible

---

## ⚠️ Contingency Plans

### Charger is busy or broken

| Stop | Plan B | Plan C |
|---|---|---|
| **Silverthorne** | Frisco Supercharger, 8 mi west (8 stalls) | ChargePoint L2 at Silverthorne Town Hall (slow) |
| **Glenwood Springs** | Electrify America at Walmart (0.5 mi, CCS 150 kW) | Rifle Supercharger, 27 mi west (8 stalls) |
| **Grand Junction** | Electrify America at Walmart (1.2 mi, CCS 350 kW) | ChargePoint at Mesa Mall (L2, emergency only) |
| **Moab** | Electrify America at City Market (CCS 150 kW) | Free L2 at Moab Info Center (slow, daytime only) |

### Unexpected range loss

**Scenario:** Using more energy than planned (headwind, detour, heavier AC use).

- **Watch the energy graph** on the Tesla display. If consumption exceeds 300 Wh/mi sustained, adjust the plan.
- **Slow down:** Dropping from 75 to 65 mph recovers ~15% range. Worth it if you're running low.
- **Reduce AC:** Switch from 68°F to 74°F to reduce compressor load. Crack windows at lower speeds.
- **Skip a leg:** If running hot between Glenwood Springs and Grand Junction, stop at the **Rifle Supercharger** (27 mi past Glenwood Springs) for a quick 10-minute top-off.

### Emergency charging (really low, no Supercharger nearby)

| Location | Option | Type | Notes |
|---|---|---|---|
| Glenwood Canyon | **No charging** | — | No pulloffs with power. Do NOT enter this canyon with less than 30%. |
| Between GJ and Moab | **Cisco, UT** | Nothing | True dead zone. No public chargers for 112 miles. |
| Moab area | **Moab Regional Hospital** | L2, J-1772 | Emergency option, 7 kW. Enough to limp to the Supercharger. |

### What if there's a long wait at a Supercharger?

- Check the **Tesla app** en route — it shows real-time Supercharger availability and queue length
- Friday evening and Sunday evening are peak times on I-70 — **expect 10–15 min waits** at Silverthorne and Glenwood Springs
- If wait exceeds 20 min, divert to the backup charger
- Consider adjusting departure time: leaving at **4:00 PM** instead of 5:00 PM avoids the worst Friday rush

---

## 📱 Apps to Have Ready

| App | Purpose | Must-Have? |
|---|---|---|
| **Tesla App** | Real-time Supercharger availability, precondition battery, remote AC for dog | ✅ Yes |
| **A Better Route Planner (ABRP)** | Independent route planning, real-time range prediction, alternate charger suggestions | ✅ Yes |
| **PlugShare** | Crowdsourced charger reviews, photos, real-time status from users — best for finding backup L2 chargers | ✅ Yes |
| **ChargePoint App** | Access ChargePoint L2/L3 chargers (backup options) | Recommended |
| **Electrify America App** | Start/pay at EA chargers (backup CCS options at Walmart locations) | Recommended |
| **Google Maps** | Offline maps — download the I-70 corridor and Moab area. Cell service is spotty in Glenwood Canyon and between GJ and Moab. | ✅ Yes |
| **AllTrails** | Hiking trails near charging stops — turn charge time into adventure time | Nice to have |

**Pre-trip app checklist:**
1. Open ABRP → enter your route → verify it matches this plan
2. Download offline Google Maps for the entire corridor
3. Check Tesla app for any Supercharger maintenance alerts
4. Pre-set your Tesla navigation to Silverthorne Supercharger (battery preconditioning starts automatically)

---

## 🎯 Ben & Sarah's Quick Reference

**Print this page or screenshot it for the road.**

### Outbound Cheat Sheet (Friday)

```
🔋 Denver (92%) ──68 mi──→ ⚡ Silverthorne (charge 18 min to 88%)
                  ──104 mi──→ ⚡ Glenwood Springs (charge 20 min to 90%)
                  ──89 mi──→  ⚡ Grand Junction (charge 22 min to 95%)
                  ──112 mi──→ 🏕️ Moab! (arrive ~57%)
```

### Return Cheat Sheet (Sunday)

```
🏕️ Moab (95%) ──112 mi──→ ⚡ Grand Junction (charge 30 min to 95%)
               ──89 mi──→  ⚡ Glenwood Springs (charge 22 min to 95%)
               ──104 mi──→ ⚡ Silverthorne (charge 12 min to 75%)
               ──68 mi──→  🏠 Denver! (arrive ~60%)
```

### Critical Numbers

| What | Number |
|---|---|
| Real-world range at 100% | ~245 miles (NOT 330) |
| Longest gap without charger | 112 miles (GJ ↔ Moab) |
| Minimum charge leaving GJ for Moab | 55% (don't risk lower) |
| Total outbound charge time | ~53 min |
| Total return charge time | ~1 hr 24 min |
| Total trip charging cost | ~$44.70 |
| Emergency number | Tesla Roadside: 1-877-798-3752 |

### Three Rules for the Trip

1. **Never enter the GJ↔Moab gap below 55%.** There is nothing out there.
2. **Charge more on the return.** Uphill costs more than downhill. The return needs ~30 min more charging.
3. **Check Supercharger availability** in the Tesla app 30 minutes before each stop. Divert to backup if needed.

---

*Plan generated by Squad EV Charging Optimizer • RouteOptimizer + ChargerFinder + CostCalculator*
*Confidence: High (93/100) • Last verified: August 2024*
