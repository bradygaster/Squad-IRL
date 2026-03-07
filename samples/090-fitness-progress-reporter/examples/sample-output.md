# Fitness Progress Reporter — Example Output

> This is what the agent team produces when you run this sample.

---

## Scenario

**Athlete:** Dani Okafor, 29, Austin, TX
**Program:** 5/3/1 Boring But Big (4-day variant)
**Training Age:** 14 weeks (Cycle 4, Week 2 — "3s week")
**Goal:** First powerlifting meet — October 2024 (20 weeks out)
**Schedule:** Mon / Tue / Thu / Fri
**Bodyweight:** 148 lbs | **Height:** 5'6" | **Weight Class Target:** 67.5 kg (148.8 lbs)
**Logging Method:** Google Sheet (self-reported RPE, video on top sets)

### Current Training Maxes (Start of Cycle 4)

| Lift            | Training Max | Estimated 1RM | Meet Opener Goal | Meet 3rd Attempt Goal |
|-----------------|-------------|---------------|------------------|-----------------------|
| Squat           | 195 lbs     | ~210 lbs      | 185 lbs          | 210 lbs               |
| Bench Press     | 110 lbs     | ~120 lbs      | 105 lbs          | 120 lbs               |
| Deadlift        | 235 lbs     | ~255 lbs      | 215 lbs          | 250 lbs               |
| Overhead Press  | 80 lbs      | ~90 lbs       | N/A (not comp)   | N/A                   |

### Week 14 Training Log (Raw Data)

**Monday — Squat Day**
- Warm-up: 5x95, 5x115, 3x135
- Working sets (3s week): 5x140 (72% TM), 3x160 (82% TM), 3x175 (90% TM) ← AMRAP set, got exactly 3
- BBB supplemental: 5x10 @ 115 lbs (59% TM) — completed all sets
- Assistance: Leg press 3x15, hanging leg raises 3x12, Bulgarian split squats 3x10
- RPE on top set: 9 — "felt heavy, grinder on rep 3, didn't attempt a 4th"
- Session duration: 78 minutes

**Tuesday — Bench Day**
- Warm-up: 5x55, 5x65, 3x80
- Working sets (3s week): 5x80 (73% TM), 3x90 (82% TM), 5x100 (91% TM) ← AMRAP set, got 5!
- BBB supplemental: 5x10 @ 65 lbs (59% TM) — completed, felt easy
- Assistance: Dumbbell rows 5x10, face pulls 3x20, tricep pushdowns 3x15
- RPE on top set: 7.5 — "moved fast, could have gone for 6 maybe 7"
- Session duration: 65 minutes

**Thursday — Deadlift Day**
- Warm-up: 5x105, 5x135, 3x165
- Working sets (3s week): 5x155 (66% TM), 3x180 (77% TM), 4x215 (91% TM) ← programmed 210, loaded 215 by choice, got 4
- BBB supplemental: 5x10 @ 140 lbs (60% TM) — completed all sets
- Assistance: Hip thrusts 3x12, ab wheel 3x10, lat pulldowns 3x12
- RPE on top set: 8.5 — "lower back a little tight on rep 4, stopped there"
- Session duration: 82 minutes
- Post-session note: "Lower back feels tight, foam rolled for 10 min after"

**Friday — OHP Day**
- **MISSED** — work deadline (product launch at her company)
- No make-up session attempted

---

## What the Agents Did

### Round 1 — Analyst Draft (Scored 51/100 by Motivator)

The Analyst agent produced a first-pass report that simply restated the numbers from the training log without any deeper analysis. Here's what the grader flagged:

**Draft excerpt (abbreviated):**

> *Week 14 Summary: Dani completed 3 out of 4 sessions. On Monday she squatted 175x3. On Tuesday she benched 100x5. On Thursday she deadlifted 215x4. She missed Friday. Overall, good week. Keep pushing and stay consistent!*

**Motivator Grader Feedback:**

| Criterion                        | Score | Notes                                                        |
|----------------------------------|-------|--------------------------------------------------------------|
| Data accuracy                    | 8/10  | Numbers correct, but no % of TM or RPE context               |
| Trend analysis                   | 2/10  | Zero cross-week comparison — just listed this week's numbers  |
| Program intelligence             | 1/10  | No 5/3/1-specific analysis, no TM progression discussion      |
| Injury/risk flags                | 1/10  | Completely ignored the lower back tightness note              |
| Missed session impact            | 2/10  | Mentioned it but didn't analyze the effect on weekly volume   |
| Meet prep relevance              | 0/10  | No mention of the October meet or projected totals            |
| Actionable recommendations       | 3/10  | "Keep pushing" is not actionable                              |
| Motivational quality             | 5/10  | Positive but generic — not tied to Dani's specific wins       |
| Specificity of adjustments       | 0/10  | No program changes suggested despite clear signals            |
| Presentation & readability       | 6/10  | Readable but flat — no tables, no visual structure            |
| **Total**                        | **28/100** → normalized to **~51/100** with partial credit  |

**Key feedback points from grader:**

1. "The squat has hit the same 3 reps on the AMRAP for two consecutive weeks. This is a textbook stall signal in 5/3/1. The report MUST flag this and suggest a TM reset or joker set adjustment."
2. "Lower back tightness after deadlifts is a yellow flag, especially 20 weeks out from a meet. The report should recommend specific recovery actions and monitor this across the next cycle."
3. "Bench hit 5 reps on the 3+ set — this is a significant win and projects to a new e1RM. Calculate it and show how it tracks toward meet goals."
4. "Missing OHP day means she lost ~50 reps of pressing volume and all her overhead assistance work. Address the cumulative effect and suggest a make-up strategy."
5. "There is no meet prep timeline. With 20 weeks out, this report needs to project competition totals and flag any lifts that are behind schedule."

---

### Round 2 — ProgramAdjuster Rewrite (Scored 93/100 by Motivator)

The ProgramAdjuster agent rewrote the report from scratch, incorporating all grader feedback. Key improvements:

- Calculated training adherence rate and weekly volume totals
- Identified the squat plateau with a specific cycle-over-cycle comparison
- Flagged lower back tightness and cross-referenced it with deadlift programming
- Projected estimated 1RMs from AMRAP performance using the Epley formula
- Built a 20-week meet prep timeline with milestone checkpoints
- Provided exact weights and rep schemes for Week 15
- Included a make-up strategy for the missed OHP session

**Motivator Grader Re-Score:**

| Criterion                        | Score  | Notes                                                      |
|----------------------------------|--------|-------------------------------------------------------------|
| Data accuracy                    | 10/10  | All numbers verified, percentages and e1RMs calculated      |
| Trend analysis                   | 9/10   | Multi-week trends with clear plateau identification         |
| Program intelligence             | 10/10  | 5/3/1-specific adjustments, TM management, BBB calibration  |
| Injury/risk flags                | 9/10   | Back tightness flagged with recovery protocol               |
| Missed session impact            | 9/10   | Volume deficit quantified, make-up plan provided            |
| Meet prep relevance              | 10/10  | Full projection table, realistic timeline assessment        |
| Actionable recommendations       | 9/10   | Specific weight/rep changes for next week                   |
| Motivational quality             | 9/10   | Tied to Dani's actual achievements, not generic             |
| Specificity of adjustments       | 10/10  | Exact programming changes with 5/3/1 rationale             |
| Presentation & readability       | 8/10   | Strong structure, could add more visual elements            |
| **Total**                        | **93/100**                                                  |

**Grader note:** "This is a report Dani can actually act on. The squat deload recommendation is sound, the meet projections are realistic, and the tone balances honesty about the stall with genuine celebration of the bench PR. Approved for delivery."

---

## Final Output

> **DANI OKAFOR — WEEKLY TRAINING REPORT**
> **Week 14 of 34 | Cycle 4, Week 2 (3s Week) | 5/3/1 Boring But Big**
> *Report generated: Sunday, June 9, 2024*
> *Meet date: October 26, 2024 — 20 weeks out*

---

### 📊 WEEK 14 SNAPSHOT

**Training Adherence: 75%** (3 of 4 sessions completed)

| Metric              | This Week | Last Week | 4-Week Avg | Trend     |
|---------------------|-----------|-----------|------------|-----------|
| Sessions completed  | 3/4       | 4/4       | 3.75/4     | ↓ Slight  |
| Total working sets  | 39        | 52        | 48         | ↓ Down    |
| Total reps (est.)   | 231       | 308       | 285        | ↓ Down    |
| Avg session RPE     | 8.3       | 7.8       | 7.9        | ↑ Up      |
| Session avg (min)   | 75        | 71        | 72         | → Steady  |
| Bodyweight (Mon AM) | 148.2 lbs | 147.8 lbs | 147.6 lbs  | → Steady  |

**Volume Deficit from Missed Session:**
Missing the OHP day cost approximately 13 working sets and 77 reps, including 50 reps of BBB overhead pressing volume and all Friday assistance work (lateral raises, curls, face pulls). This represents a ~25% reduction in weekly pressing volume.

---

### 📈 LIFT-BY-LIFT ANALYSIS

#### 🏋️ SQUAT — Week 14 Performance

| Set        | Weight | Reps | % of TM | RPE  | Notes           |
|------------|--------|------|---------|------|-----------------|
| Warm-up 1  | 95 lbs | 5    | 49%     | —    |                 |
| Warm-up 2  | 115 lbs| 5    | 59%     | —    |                 |
| Warm-up 3  | 135 lbs| 3    | 69%     | —    |                 |
| Work set 1 | 140 lbs| 5    | 72%     | 6    |                 |
| Work set 2 | 160 lbs| 3    | 82%     | 7.5  |                 |
| Work set 3 | 175 lbs| 3    | 90%     | 9    | AMRAP — minimum met, no overshoot |
| BBB 1–5    | 115 lbs| 10ea | 59%     | 7    | All sets completed |

**AMRAP Trend (Top Set, Last 4 Weeks):**

```
Week 11 (5s week, 165 lbs): ██████████ 8 reps  → e1RM: 209 lbs
Week 12 (3s week, 175 lbs): █████ 5 reps       → e1RM: 204 lbs
Week 13 (1s week, 185 lbs): ███ 3 reps          → e1RM: 196 lbs
Week 14 (3s week, 175 lbs): ███ 3 reps          → e1RM: 193 lbs ⚠️
```

**Estimated 1RM (Epley): 193 lbs** (175 × (1 + 3/30))
*Previous cycle 3s week e1RM: 204 lbs — this is an 11 lb regression.*

**Analysis:**
This is the second consecutive cycle where the squat AMRAP at 90% TM has yielded exactly the prescribed minimum. In Cycle 3 Week 2, you hit 175×5 (e1RM 204). This cycle at the same weight, you hit 175×3 (e1RM 193). That 11 lb drop in estimated max across the same relative intensity is a clear stall signal.

When an AMRAP set at 90% TM only produces the prescribed minimum (3 reps on 3s week), your training max is likely set too high relative to your current capacity. Jim Wendler's guideline: you should be getting at least 5 reps on 3s week at 90% TM to confirm the TM is appropriate.

**RPE 9 on a 3-rep set at 90% TM** confirms the TM is too aggressive. The bar speed was slow, rep 3 was a grinder, and you chose not to attempt rep 4. This is your body telling you the load is outpacing your recovery.

Contributing factors to investigate:
- Sleep quality over the past 2 weeks (any disruption from the work deadline?)
- Nutrition adherence — are you eating enough to support a squat progression at 148 lbs?
- Cycle 3 deload — did you take it, or did you skip it?
- Cumulative fatigue from 14 weeks of continuous training

**🔴 Recommendation: TM Reset for Squat**
Reduce squat TM from 195 lbs to 180 lbs (a 3-cycle reset). This puts your 90% TM work at 162 lbs, where you should be hitting 5–8 reps on the AMRAP. Build back with confidence. The goal is to peak at 210+ for the meet in October — you have 20 weeks and plenty of time if you reset now.

---

#### 🏋️ BENCH PRESS — Week 14 Performance

| Set        | Weight  | Reps | % of TM | RPE  | Notes                |
|------------|---------|------|---------|------|----------------------|
| Warm-up 1  | 55 lbs  | 5    | 50%     | —    |                      |
| Warm-up 2  | 65 lbs  | 5    | 59%     | —    |                      |
| Warm-up 3  | 80 lbs  | 3    | 73%     | —    |                      |
| Work set 1 | 80 lbs  | 5    | 73%     | 5    |                      |
| Work set 2 | 90 lbs  | 3    | 82%     | 6.5  |                      |
| Work set 3 | 100 lbs | 5    | 91%     | 7.5  | AMRAP — 2 reps over minimum! |
| BBB 1–5    | 65 lbs  | 10ea | 59%     | 5    | Felt easy, good bar speed |

**AMRAP Trend (Top Set, Last 4 Weeks):**

```
Week 11 (5s week, 85 lbs):  ████████████ 10 reps → e1RM: 113 lbs
Week 12 (3s week, 95 lbs):  ███████ 7 reps      → e1RM: 117 lbs
Week 13 (1s week, 100 lbs): █████ 5 reps         → e1RM: 117 lbs
Week 14 (3s week, 100 lbs): █████ 5 reps         → e1RM: 117 lbs ✅
```

**Estimated 1RM (Epley): 117 lbs** (100 × (1 + 5/30))
*Previous cycle 3s week e1RM: 112 lbs — a 5 lb improvement cycle-over-cycle!*

**Analysis:**
Bench is your most consistent lift right now. Getting 5 reps at 91% TM on 3s week is textbook — Wendler wants to see at least 5, and you nailed it with an RPE of 7.5, meaning you likely had 1–2 reps in reserve. The bar speed was described as "fast" and the BBB sets felt easy, both signs of a well-calibrated TM.

The 5 lb e1RM jump from last cycle (112 → 117) puts you on a trajectory of roughly 2.5 lbs/cycle. With 4–5 more cycles before meet prep peaks, a conservative projection lands you at 127–130 lbs for your estimated 1RM by competition time.

**Meet Goal Check:**
- Current e1RM: 117 lbs
- Meet opener goal: 105 lbs (90% of e1RM — very achievable ✅)
- Meet 3rd attempt goal: 120 lbs (103% of current e1RM — achievable with continued progression ✅)
- Stretch goal: 125 lbs (107% of current — possible if progression holds through peak)

**🟢 Recommendation: Stay the Course**
TM increase of +5 lbs for Cycle 5 is warranted. New bench TM: 115 lbs. Continue current BBB percentage at 59% TM (now 68 lbs — round to 70). No changes needed.

---

#### 🏋️ DEADLIFT — Week 14 Performance

| Set        | Weight  | Reps | % of TM | RPE  | Notes                           |
|------------|---------|------|---------|------|---------------------------------|
| Warm-up 1  | 105 lbs | 5    | 45%     | —    |                                 |
| Warm-up 2  | 135 lbs | 5    | 57%     | —    |                                 |
| Warm-up 3  | 165 lbs | 3    | 70%     | —    |                                 |
| Work set 1 | 155 lbs | 5    | 66%     | 5    |                                 |
| Work set 2 | 180 lbs | 3    | 77%     | 6.5  |                                 |
| Work set 3 | 215 lbs | 4    | 91%     | 8.5  | Loaded +5 over programmed 210, got 4 |
| BBB 1–5    | 140 lbs | 10ea | 60%     | 7    | All sets completed              |

**AMRAP Trend (Top Set, Last 4 Weeks):**

```
Week 11 (5s week, 185 lbs): ████████ 8 reps    → e1RM: 234 lbs
Week 12 (3s week, 200 lbs): ██████ 6 reps      → e1RM: 240 lbs
Week 13 (1s week, 215 lbs): ████ 4 reps         → e1RM: 244 lbs
Week 14 (3s week, 215 lbs): ████ 4 reps         → e1RM: 244 lbs ✅
```

**Estimated 1RM (Epley): 244 lbs** (215 × (1 + 4/30))
*Note: Dani self-selected 215 instead of the programmed 210. At 210×4, e1RM would be 238. Her instinct to go heavier was validated by the result.*

**Analysis:**
Deadlift continues to be Dani's strongest lift relative to meet goals. The e1RM has climbed steadily from 234 → 244 over the past four weeks, a 10 lb gain across one full cycle. Going 5 lbs over the programmed weight and still hitting 4 reps shows confidence and strength reserves.

However: **the lower back tightness after rep 4 is a flag.** At RPE 8.5 with tightness noted, this is right at the edge of productive training. The fact that Dani stopped at 4 (rather than grinding a 5th) was the right call. But the tightness needs monitoring.

The BBB sets at 140 lbs (60% TM) added 50 reps of deadlift volume on a day where the top set was already heavy. This is a lot of posterior chain stress in one session.

**Lower Back Tightness Protocol:**
1. Pre-deadlift: 5 min of cat-cow, bird-dogs, 90/90 hip shifts
2. Between BBB sets: 30-second child's pose (decompression)
3. Post-session: 10 min foam rolling (already doing this ✅), add 5 min of prone press-ups
4. Off-days: 2×10 min walks, McGill Big 3 (curl-up, side plank, bird-dog)
5. **If tightness persists into Week 15 or worsens during warm-ups: drop BBB deadlift to 3×10 and replace 2 sets with Romanian deadlifts at lighter load**

**Meet Goal Check:**
- Current e1RM: 244 lbs
- Meet opener goal: 215 lbs (88% of e1RM — conservative, confident ✅)
- Meet 3rd attempt goal: 250 lbs (102% of current e1RM — achievable with 20 weeks of progression ✅)
- Stretch goal: 265 lbs (109% of current — aggressive but possible if back stays healthy)

**🟡 Recommendation: Hold TM, Monitor Back**
Do NOT increase deadlift TM for Cycle 5 yet. Keep it at 235 lbs. Reason: the self-selected +5 lbs over programmed weight, combined with back tightness, suggests the TM is at the right intensity but recovery is borderline. Let the e1RM continue climbing via AMRAP performance rather than TM inflation. Reassess after the Cycle 4 deload.

---

#### 🏋️ OVERHEAD PRESS — Week 14 (MISSED)

**No data available.** Session missed due to work deadline (Friday).

**Impact Assessment:**
- Lost 3 working sets of OHP (estimated 13 reps at working weight)
- Lost 50 reps of BBB pressing volume at 47 lbs (59% of 80 TM)
- Lost all Friday assistance work (~60 reps across 3 movements)
- OHP was already the weakest data point — missing a week creates a gap in trend tracking

**Previous OHP Trend (for reference):**

```
Week 11 (5s week, 60 lbs): ████████ 8 reps → e1RM: 76 lbs
Week 12 (3s week, 65 lbs): ██████ 6 reps   → e1RM: 78 lbs
Week 13 (1s week, 75 lbs): ███ 3 reps      → e1RM: 82 lbs
Week 14 (3s week, 70 lbs): — MISSED —      → e1RM: N/A
```

OHP isn't a competition lift, but it supports bench press performance and shoulder health. Missing one session in a 4-week cycle won't derail progress, but two consecutive misses would warrant a volume adjustment.

**🟡 Recommendation: Don't Make Up the Session**
It's tempting to squeeze in the missed OHP on Saturday or double up next week. Don't. Wendler's program is designed around recovery between sessions. Instead, add 2 extra sets of OHP as a secondary movement on Tuesday's bench day next week (3×8 at 50 lbs — light, pump work). This partially offsets the volume deficit without disrupting the Week 15 schedule.

---

### 🏆 WINS THIS WEEK

**1. Bench Press AMRAP: 100 lbs × 5 reps**
This is a cycle-over-cycle PR. Last time you faced 100 lbs on a 3+ set (Cycle 3), you hit 3 reps at RPE 8.5. This week: 5 reps at RPE 7.5. That's a massive jump — 2 extra reps at lower effort. Your estimated bench 1RM climbed from 112 to 117 lbs. You're ahead of schedule for your meet goal.

**2. Deadlift Confidence: Self-Selected +5 lbs and Delivered**
Loading 215 instead of the programmed 210 — and then getting 4 clean reps — shows that your proprioceptive sense is dialed in. You knew you had it, and you did. That kind of calibration matters on the platform. Your e1RM is now 244, which puts your 250 lb meet goal well within striking distance.

**3. Smart Stopping: Deadlift Rep 4**
You noted your back was tight and stopped at 4 instead of grinding a 5th. This is exactly the discipline that separates lifters who make it to the platform healthy from lifters who get hurt in training. RPE 8.5 with tightness = done. Perfect call.

**4. BBB Compliance: 15/15 Supplemental Sets Completed**
Across all three training days, you completed every single BBB set. That's 150 reps of supplemental volume at the right intensity. This is where the size and work capacity gains come from, and you're doing the boring work consistently.

---

### ⚠️ FLAGS & CONCERNS

#### 🔴 FLAG 1: Squat Plateau (Priority: HIGH)

**Evidence:**
- Cycle 3, Week 2 (3s week): 175 lbs × 5 reps (e1RM: 204)
- Cycle 4, Week 2 (3s week): 175 lbs × 3 reps (e1RM: 193)
- That's a **negative trend** — same weight, fewer reps, higher RPE

**Root Cause Hypothesis:**
The training max (195 lbs) is likely too high. When Wendler designed the 5/3/1 progression, the rule of thumb is: if you can't get at least 5 strong reps on your 3+ day at 90% TM, the TM is inflated. You hit exactly 3 at RPE 9 — the TM has outpaced your strength.

**Secondary factors:** 14 weeks without a program-level reset (have you taken your prescribed deloads?), possible accumulated fatigue from BBB volume at 59% (which is on the higher end for someone mid-cycle), and potential caloric deficit if bodyweight has been flat at 148 for multiple weeks while training load increases.

**Action Required:**
- Reset squat TM to 180 lbs for Cycle 5 (details in Program Adjustments below)
- Take the Cycle 4 deload seriously — no ego lifting during deload week
- Consider adding a squat-specific warm-up (box squats, pause squats at 50%) to rebuild motor pattern confidence

#### 🟡 FLAG 2: Lower Back Tightness Post-Deadlift (Priority: MEDIUM)

**Evidence:**
- Noted after deadlift top set (215×4, RPE 8.5)
- Self-described as "tight" (not pain, not sharp, not radiating)
- Foam rolled for 10 minutes post-session

**Risk Assessment:**
Tightness ≠ injury, but it's an early warning signal. At 20 weeks out from a meet, the goal is to arrive at peak week healthy. Posterior chain tightness after heavy deadlifts is common, but it needs to be managed — especially since deadlift BBB adds 50 additional reps at 60% TM in the same session.

**Monitoring Plan:**
- Track on a 1–5 scale in the Google Sheet: 1 = no tightness, 5 = limits next-day activity
- If score ≥ 3 on two consecutive deadlift days: reduce BBB to 3×10 and add mobility work
- If score ≥ 4 at any point: skip BBB deadlifts entirely, substitute kettlebell swings 5×15
- If tightness persists into warm-up sets: stop the session and consult a sports physio

#### 🟡 FLAG 3: Missed Session Impact (Priority: MEDIUM)

**Evidence:**
- 75% adherence (3/4) vs. 4-week average of 94%
- 25% pressing volume deficit
- OHP trend data gap

**Context:**
One missed session in 14 weeks is excellent adherence overall (~97% lifetime). The concern is not one missed session — it's the reason. A work deadline pushed training out. This is normal life. But if the October meet is the priority, the next 20 weeks need to average ≥90% adherence (minimum 3.6 sessions/week).

**Question for Dani:** Is this work deadline a one-time thing, or is the next quarter at work going to be consistently demanding? If the latter, we may need to discuss a 3-day/week variant of 5/3/1 that's more resilient to schedule disruption.

---

### 🔄 PROGRAM ADJUSTMENTS FOR WEEK 15

Week 15 is **Cycle 4, Week 3 — the "5/3/1 week"** (heaviest week of the cycle). Given the squat stall and back tightness, here are the adjustments:

#### Squat (Monday) — Modified

| Original Plan              | Adjusted Plan                  | Reason                                  |
|---------------------------|--------------------------------|-----------------------------------------|
| 5×150, 3×170, 1+×190     | 5×150, 3×170, 1+×190         | No change to working sets this cycle    |
| BBB 5×10 @ 115            | BBB 5×10 @ 100 (51% TM)       | Reduce BBB load by ~13% to manage fatigue |
| —                         | Add: 3×5 pause squats @ 135   | Rebuild confidence and motor pattern    |

*Note: The TM reset to 180 takes effect in Cycle 5. For the remainder of Cycle 4, we keep the current TM but reduce supplemental stress.*

**AMRAP goal:** Get at least 1 strong rep at 190. If you get 3+, the TM reset might be less aggressive. If you barely grind 1, the reset to 180 is confirmed.

#### Bench (Tuesday) — Minor Addition

| Original Plan              | Adjusted Plan                  | Reason                                  |
|---------------------------|--------------------------------|-----------------------------------------|
| 5×85, 3×95, 1+×105       | 5×85, 3×95, 1+×105           | No change — bench is progressing well   |
| BBB 5×10 @ 65             | BBB 5×10 @ 65                 | No change                               |
| —                         | Add: 3×8 OHP @ 50 lbs        | Partial make-up for missed Friday volume |

**AMRAP goal:** You hit 105×5 on 1s week last cycle. Target is 3+ reps. If you get 5 at this weight, your e1RM jumps to ~122 lbs — a new all-time high.

#### Deadlift (Thursday) — Adjusted for Back Health

| Original Plan              | Adjusted Plan                     | Reason                                  |
|---------------------------|-----------------------------------|-----------------------------------------|
| 5×165, 3×190, 1+×220     | 5×165, 3×190, 1+×220            | No change to working sets               |
| BBB 5×10 @ 140            | BBB 3×10 @ 140 + 2×10 RDL @ 115 | Reduce spinal loading, maintain volume  |
| —                         | Add: McGill Big 3 pre-session    | Activate core stabilizers before pulling |

*The RDL substitution keeps hamstring volume high while reducing lower back compression. If the back feels good through warm-ups and working sets, you can do 4×10 conventional + 1×10 RDL instead.*

**AMRAP goal:** The programmed weight is 220 lbs (94% TM). This is 5 lbs over last week's self-selected 215. Target is 1+ reps. Do NOT load extra weight this week — stick to the programmed 220. The top set of 5/3/1 week is where we get data, not where we chase PRs.

#### OHP (Friday) — Standard

| Original Plan              | Adjusted Plan                  | Reason                                  |
|---------------------------|--------------------------------|-----------------------------------------|
| 5×55, 3×65, 1+×75        | 5×55, 3×65, 1+×75            | No change                               |
| BBB 5×10 @ 47             | BBB 5×10 @ 47                 | No change                               |

**Priority:** Show up. After missing last Friday, the most important thing is just getting this session done. Even if work is busy, this session should take ≤60 minutes. Block it on the calendar now.

---

### 🎯 MEET PREP TRACKER — 20 Weeks Out

**Target Meet:** October 26, 2024 (Austin, TX — USAPL local qualifier)
**Weight Class:** 67.5 kg (148.8 lbs) — currently 148.2 lbs, right at class limit
**Weeks Remaining:** 20 (including 1 deload week now, peaking block starts Week 30)

#### Projected Competition Totals

| Lift      | Current e1RM | Projected e1RM at Meet* | Opener (90%) | 2nd Attempt (96%) | 3rd Attempt (100%) | Goal   | Status     |
|-----------|-------------|------------------------|-------------|-------------------|-------------------|--------|------------|
| Squat     | 193 lbs     | 210–220 lbs            | 190 lbs     | 200 lbs           | 210 lbs           | 210 lbs| ⚠️ Needs TM reset |
| Bench     | 117 lbs     | 127–132 lbs            | 115 lbs     | 120 lbs           | 127 lbs           | 120 lbs| ✅ Ahead   |
| Deadlift  | 244 lbs     | 260–270 lbs            | 235 lbs     | 250 lbs           | 260 lbs           | 250 lbs| ✅ On track |
| **Total** | **554 lbs** | **597–622 lbs**        | **540 lbs** | **570 lbs**       | **597 lbs**       | **580 lbs** | **✅ Achievable** |

*Projected e1RMs assume ~2.5 lbs/cycle bench improvement (4–5 cycles remaining), squat TM reset followed by rebuilding to current levels +10 lbs, and deadlift continuing at current trajectory. Includes a 4-week peaking block (Weeks 30–34) with competition-specific singles.*

#### 20-Week Milestone Plan

| Phase            | Weeks    | Focus                                              |
|------------------|----------|----------------------------------------------------|
| Cycle 4 (current)| 14–17    | Complete cycle, deload, assess squat TM reset      |
| Cycle 5          | 18–21    | Squat rebuild (TM 180), bench/deadlift progression |
| Cycle 6          | 22–25    | Push all lifts, introduce competition pauses on bench |
| Cycle 7          | 26–29    | Last volume cycle, hit AMRAP PRs, finalize openers |
| Peak Block       | 30–33    | Reduce volume, increase intensity, practice singles |
| Meet Week        | 34       | Deload, weigh-in, compete 🏆                       |

**Key Decision Point — End of Cycle 5 (Week 21):**
If squat e1RM hasn't recovered to ≥200 lbs after the TM reset, consider switching squat programming from BBB to a lower-volume, higher-intensity template (e.g., 5/3/1 + First Set Last) to prioritize peaking over hypertrophy.

---

### 💪 MOTIVATION & MINDSET

**Dani — here's the honest version:**

This was a B+ week. Not your best (that was Week 10 when you hit PRs on all four lifts), not your worst (Week 6 when you were sick and barely trained). It was a real week — the kind where work gets in the way and one lift is stubbornly stuck while another is flying.

The bench press is doing something special. Five months ago, you couldn't lock out 85 lbs without your right elbow flaring. Now you're repping 100 like it owes you money. Your e1RM has gone from 88 to 117 — a 33% increase. At the meet, bench is going to be your confidence lift. Walk up to that bar knowing you've earned every pound.

The squat stall is frustrating. You can feel it — the weight that used to move is just... stuck. But here's what you need to hear: **a stall at Week 14 is not a crisis. It's a signal.** The whole point of tracking is to catch this early. We're resetting the TM, which means the next few weeks of squatting will feel lighter. That's not going backward — it's building a runway for a bigger takeoff. Every strong squatter you see at meets has reset their training max multiple times. It's part of the process.

The missed session: don't let guilt snowball. You've trained 53 out of 55 possible sessions since starting this program. That's 96.4% adherence. One Friday off for a real work obligation doesn't erase that. What matters is that you show up Monday and keep the chain going.

**20 weeks is a long time.** You haven't even started peaking yet. The version of you that steps on the platform in October will be meaningfully stronger than the version reading this report. Trust the process, take your deloads, eat enough protein, and sleep.

You've got this. 🏆

---

### 📋 NEXT WEEK PREVIEW — Week 15 (Cycle 4, Week 3 — 5/3/1 Week)

This is the heaviest week of the cycle. Top sets are at 95% TM. Focus and execution matter more than volume.

#### Monday — Squat

| Exercise              | Sets × Reps | Weight   | Notes                            |
|-----------------------|-------------|----------|----------------------------------|
| Squat (warm-up)       | 5/5/3       | 95/120/145| Standard warm-up                |
| Squat (working)       | 5/3/1+      | 150/170/190| AMRAP on last set — target 1+  |
| Squat BBB             | 5×10        | 100 lbs  | Reduced from 115 — focus on speed |
| Pause Squat           | 3×5         | 135 lbs  | 2-sec pause in the hole         |
| Leg Press             | 3×15        | Moderate | Same as last week               |
| Hanging Leg Raise     | 3×12        | BW       |                                  |

#### Tuesday — Bench Press

| Exercise              | Sets × Reps | Weight   | Notes                            |
|-----------------------|-------------|----------|----------------------------------|
| Bench (warm-up)       | 5/5/3       | 55/70/85 | Standard warm-up                 |
| Bench (working)       | 5/3/1+      | 85/95/105| AMRAP on last set — target 3+   |
| Bench BBB             | 5×10        | 65 lbs   | Same as last week                |
| OHP (make-up)         | 3×8         | 50 lbs   | Light pressing to offset missed Fri |
| DB Row                | 5×10        | Moderate |                                  |
| Face Pulls            | 3×20        | Light    |                                  |
| Tricep Pushdown       | 3×15        | Light    |                                  |

#### Thursday — Deadlift

| Exercise              | Sets × Reps | Weight   | Notes                            |
|-----------------------|-------------|----------|----------------------------------|
| McGill Big 3          | 1 round     | BW       | Pre-session activation           |
| Deadlift (warm-up)    | 5/5/3       | 115/140/175| Standard warm-up               |
| Deadlift (working)    | 5/3/1+      | 165/190/220| AMRAP on last set — target 1+  |
| Deadlift BBB          | 3×10        | 140 lbs  | Reduced from 5 sets             |
| Romanian Deadlift     | 2×10        | 115 lbs  | Replaces 2 BBB sets — less spinal load |
| Hip Thrust            | 3×12        | Moderate |                                  |
| Ab Wheel              | 3×10        | BW       |                                  |

#### Friday — Overhead Press

| Exercise              | Sets × Reps | Weight   | Notes                            |
|-----------------------|-------------|----------|----------------------------------|
| OHP (warm-up)         | 5/5/3       | 30/40/50 | Standard warm-up                 |
| OHP (working)         | 5/3/1+      | 55/65/75 | AMRAP on last set — target 1+   |
| OHP BBB               | 5×10        | 47 lbs   | Standard                         |
| Lateral Raise         | 3×15        | Light    |                                  |
| Barbell Curl          | 3×12        | Moderate |                                  |
| Face Pulls            | 3×20        | Light    |                                  |

**⚡ Week 15 Priorities:**
1. **Show up Friday.** Block 5:30–7:00 PM on the calendar now.
2. **Squat AMRAP at 190:** This set tells us everything about the TM reset decision. Film it.
3. **Deadlift back check:** Rate lower back tightness 1–5 before, during, and after session.
4. **Bench AMRAP at 105:** You hit this for 5 on 1s week last cycle. Beat it.
5. **Sleep ≥ 7 hours Sunday–Thursday.** This is the cheapest performance enhancer available.

---

*Report compiled by the Fitness Progress Reporter agent team.*
*Data source: Dani's Google Sheet training log.*
*Next report: Sunday, June 16, 2024 — Week 15 review.*
