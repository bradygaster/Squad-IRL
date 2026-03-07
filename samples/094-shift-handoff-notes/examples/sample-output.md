# Shift Handoff Notes — Example Output

> This is what the agent team produces when you run this sample.

---

## Scenario

**Unit:** Medical-Surgical, Riverside Community Hospital
**Date:** Tuesday, March 12, 2024
**Outgoing Nurse:** Maria Santos, RN — Day Shift (0700–1900)
**Incoming Nurse:** James Park, RN — Night Shift (1900–0700)
**Patient Load:** 4 patients (Rooms 412A, 414, 418B, 420)

Maria is finishing a busy 12-hour day shift. She has one critical new admission (DKA), one
post-op approaching discharge, one CHF patient with an electrolyte concern, and a pneumonia
patient who took a turn for the worse this afternoon. James needs a clear, prioritized handoff
to manage overnight safely.

---

## What the Agents Did

### Round 1 — Nurse (Writer Agent) Draft

The Nurse agent produced a first-pass narrative handoff. It captured the basic facts but
presented them as loose paragraphs with no structure. The grader scored it **46 / 100**.

**Problems identified by the DetailCapture grader:**

- ❌ No SBAR format — information dumped in narrative paragraphs
- ❌ Critical items buried: Aisha's active insulin drip rate and Eleanor's low K+ were
  mentioned mid-paragraph with no visual emphasis
- ❌ Pending items missing entirely: no mention of Gerry's blood culture or CXR results
  still outstanding
- ❌ No consolidated task list for the night shift
- ❌ Pain medication last-dose times not documented for Marcus
- ❌ Family communication needs (Eleanor's daughter, Aisha's parents en route) not
  highlighted
- ❌ No fall risk or safety flags visible for Gerry
- ❌ No medication timing schedule for overnight doses

**Grader feedback excerpt:**

> "This handoff would be unsafe. A nurse scanning this at shift change would miss the
> insulin drip titration schedule, the pending potassium recheck, and the fact that Room 420
> is a fall risk with active sundowning. Restructure using SBAR. Flag urgent items at the
> top. Add a time-based task list."

### Round 2 — PriorityHighlighter (Writer Agent) Revision

The PriorityHighlighter agent rewrote the handoff from scratch using the grader's feedback.
It applied SBAR format to every patient, added visual priority flags, built a consolidated
overnight timeline, and surfaced pending orders prominently. The grader scored it
**94 / 100**.

**Improvements:**

- ✅ SBAR format for each patient with clear section headers
- ✅ 🔴 URGENT flags placed at the top of each patient section
- ✅ Pending orders and follow-ups presented as checklists
- ✅ Night shift task timeline organized hour-by-hour
- ✅ Family communication needs prominently noted with expected call/visit times
- ✅ Safety concerns (fall risk, fluid restriction, insulin drip) visually highlighted
- ✅ Medication timing clearly documented with next-dose times
- ✅ Critical attention summary across all patients placed at the very top

**Grader final note:**

> "This handoff is safe, scannable, and thorough. A receiving nurse can immediately identify
> the three highest-risk items, find patient-specific tasks, and plan their night. Minor
> deduction: consider adding on-call pager numbers for consultants. Otherwise, excellent."

---

## Final Output

---

# 📋 SHIFT HANDOFF SUMMARY

| Field              | Detail                                      |
|--------------------|---------------------------------------------|
| **Unit**           | Medical-Surgical, 4th Floor                 |
| **Facility**       | Riverside Community Hospital                |
| **Date**           | Tuesday, March 12, 2024                     |
| **Outgoing**       | Maria Santos, RN (Day Shift 0700–1900)      |
| **Incoming**       | James Park, RN (Night Shift 1900–0700)      |
| **Patient Census** | 4 patients                                  |
| **Report Given**   | 1855 at nursing station                     |

---

# 🔴 CRITICAL ATTENTION ITEMS — READ FIRST

These are the top-priority items across your entire assignment tonight. Address or monitor
these before anything else.

| # | Room  | Patient          | Critical Item                                                                 |
|---|-------|------------------|-------------------------------------------------------------------------------|
| 1 | 418B  | Aisha Okonkwo    | **Active insulin drip at 5 units/hr.** Q1h BG checks. DKA — bicarb still normalizing. Endo consult (Dr. Rivera) has NOT yet seen patient. |
| 2 | 420   | Gerald Whitfield  | **New fever spike 101.8°F at 1500.** Blood cultures x2 pending. CXR pending. O2 requirement ↑ to 3L NC. Possible clinical deterioration — monitor closely. |
| 3 | 412A  | Eleanor Voss     | **K+ 3.3 this AM (low).** Replacement given. Recheck due at 0600. On IV Lasix — monitor for further depletion. |

---

# 🏥 PATIENT-BY-PATIENT SBAR NOTES

---

## Room 412A — Eleanor Voss

| Field              | Detail                                     |
|--------------------|--------------------------------------------|
| **Name**           | Eleanor Voss                               |
| **Age / Sex**      | 78 F                                       |
| **Admitting Dx**   | CHF Exacerbation                           |
| **Admission Date** | March 10, 2024 (Hospital Day 3)            |
| **Attending**      | Dr. Huang                                  |
| **Code Status**    | Full Code                                  |
| **Allergies**      | NKDA                                       |

### 🔴 URGENT ITEMS
- **K+ 3.3 this AM** — replacement given, recheck ordered at **0600**
- **Fluid restriction: 1500 mL/24h** — track all PO and IV intake strictly

### S — Situation
Mrs. Voss is a 78-year-old female admitted on 3/10 for CHF exacerbation. She is on hospital
day 3 and continues to diurese well. She had a low potassium this morning that was replaced.
Cardiology saw her today and is considering transition to oral diuretics tomorrow.

### B — Background
- History: CHF (EF 35%), HTN, CKD Stage 3, A-fib on Eliquis
- Admitted with 3+ pitting edema bilateral LE, weight up 4.5 kg from dry weight, BNP 1,840
- Daily weights: admission 78.2 kg → today 76.1 kg (**lost 2.1 kg since admission**)
- Cardiology consult: Dr. Patel evaluated today. Impression: good diuretic response. Plan
  to transition to PO Lasix 40 mg BID tomorrow AM if weight continues trending down overnight
- Diet: cardiac / 2 g sodium, fluid restriction 1500 mL

### A — Assessment
- **Neuro:** A&O x4, pleasant, cooperative
- **Cardiac:** HR 72 (controlled A-fib), BP 128/74, no new murmurs
- **Resp:** Lungs with bibasilar crackles (improved from admission — were diffuse), SpO2 96% on RA
- **GI/GU:** Foley in place, urine output 2,100 mL (0700–1900), amber/clear
- **Skin:** Bilateral LE edema improved to 1+ (was 3+ on admission)
- **Mobility:** Ambulatory with walker, steady gait
- **Pain:** Denies pain
- **Labs (today 0600):**
  - K+ 3.3 ↓ (replacement 40 mEq PO KCl given at 0800)
  - BUN 32, Cr 1.4 (baseline 1.2–1.3)
  - Mg 1.9 (WNL)
  - Na 138

### R — Recommendations / Night Shift Tasks
- [ ] Strict I&Os — document all PO fluids toward 1500 mL restriction
- [ ] Daily weight at **0500** (before breakfast) — compare to today's 76.1 kg
- [ ] **K+ recheck at 0600** — if still low, notify Dr. Huang for additional replacement
- [ ] IV Lasix 40 mg due at **2000** — administer on time
- [ ] Monitor for signs of over-diuresis: dizziness, orthostatic hypotension, rising Cr
- [ ] Telemetry monitoring — watch for ectopy related to hypokalemia

### 💊 Medications Due This Shift
| Time | Medication                  | Route | Notes                        |
|------|-----------------------------|-------|------------------------------|
| 2000 | Lasix (furosemide) 40 mg   | IV    | Next scheduled dose          |
| 2100 | Eliquis (apixaban) 5 mg    | PO    | With evening snack           |
| 2100 | Metoprolol tartrate 25 mg  | PO    | Hold if HR < 60 or SBP < 100|
| 0600 | AM labs (BMP for K+ recheck)| Draw  | Standing order               |

### 📝 Pending Orders / Results
- [ ] K+ recheck at 0600 — pending
- [ ] Cardiology to reassess tomorrow AM for PO Lasix transition

### 👨‍👩‍👧 Family / Communication Notes
> **Daughter (primary contact) calls every evening around 2000.**
> She is anxious and wants detailed updates. Be prepared to discuss:
> - Today's weight trend (positive — down 2.1 kg)
> - Potassium level and replacement
> - Plan for possible transition to oral Lasix tomorrow
> - Expected remaining length of stay (likely 2–3 more days)

### ⚠️ Safety Flags
- 🟡 Fall risk: moderate (age, diuretic use, walker) — bed in low position, call light in reach
- 🟡 Fluid restriction 1500 mL — signage at bedside, communicate with dietary/PCAs
- 🟡 Telemetry — monitor for hypokalemia-related arrhythmias

---

## Room 414 — Marcus Thompson

| Field              | Detail                                     |
|--------------------|--------------------------------------------|
| **Name**           | Marcus Thompson                            |
| **Age / Sex**      | 52 M                                       |
| **Admitting Dx**   | Cholelithiasis — s/p lap cholecystectomy    |
| **Surgery Date**   | March 10, 2024 (POD #2)                    |
| **Surgeon**        | Dr. Kim (General Surgery)                  |
| **Code Status**    | Full Code                                  |
| **Allergies**      | Codeine (nausea)                           |

### 🟢 NO URGENT ITEMS — Routine post-op, on track for discharge tomorrow

### S — Situation
Mr. Thompson is a 52-year-old male, POD #2 from laparoscopic cholecystectomy. He is
recovering well, tolerating a regular diet, pain controlled on oral Tylenol, ambulating
independently, and is targeted for discharge tomorrow afternoon.

### B — Background
- History: cholelithiasis with recurrent biliary colic, otherwise healthy
- Surgery: uncomplicated laparoscopic cholecystectomy 3/10
- JP drain placed intraoperatively — output has been decreasing daily
- Diet progression: clears POD#0 → clears POD#1 → regular diet today at lunch (tolerated
  well, no nausea/vomiting)

### A — Assessment
- **Neuro:** A&O x4, pleasant, eager to go home
- **Cardiac:** HR 78, BP 122/76, RRR
- **Resp:** Lungs CTA bilaterally, SpO2 98% on RA, using incentive spirometer q1h while awake
- **GI:** Abdomen soft, mildly tender at port sites, +BS x4 quadrants, tolerating regular
  diet, had BM this morning
- **Surgical site:** 4 laparoscopic port sites — clean, dry, intact, no erythema or drainage,
  steri-strips in place
- **JP Drain:** output 45 mL today (serosanguineous, decreasing from 80 mL yesterday)
- **Pain:** 2/10 at port sites, managed with Tylenol 1000 mg PO q6h (last dose **1400**)
- **Mobility:** Ambulated in hallway x3 today, independent, steady gait
- **Labs:** CBC this AM — WBC 8.2, Hgb 13.4, all WNL

### R — Recommendations / Night Shift Tasks
- [ ] Tylenol 1000 mg PO due at **2000** — assess pain before/after
- [ ] Monitor JP drain output overnight — record amount and character at **0600**
- [ ] If JP output remains < 50 mL by morning, surgical team plans to pull drain tomorrow AM
- [ ] Continue ambulation as tolerated — encourage at least 1 walk overnight if awake
- [ ] Encourage incentive spirometry q1h while awake
- [ ] **Discharge planning:** Verify discharge prescriptions and instructions are in chart for
  tomorrow; patient may need pharmacy education on wound care

### 💊 Medications Due This Shift
| Time | Medication                   | Route | Notes                              |
|------|------------------------------|-------|------------------------------------|
| 2000 | Acetaminophen 1000 mg       | PO    | q6h scheduled (next after: 0200)   |
| 0200 | Acetaminophen 1000 mg       | PO    | Offer if awake; hold if sleeping and pain-free |
| PRN  | Ondansetron 4 mg            | IV    | q6h PRN nausea (has not needed)    |

### 📝 Pending Orders / Results
- [ ] Surgical team to round tomorrow AM — decision on JP drain removal
- [ ] Discharge order anticipated tomorrow early afternoon
- [ ] Discharge prescriptions: confirm with pharmacy (likely Tylenol PRN, wound care instructions)

### 👨‍👩‍👧 Family / Communication Notes
> Wife plans to pick him up tomorrow afternoon for discharge.
> No specific communication needs overnight. Patient has cell phone at bedside.

### ⚠️ Safety Flags
- 🟢 Low fall risk
- 🟢 No isolation precautions
- 🟡 Codeine allergy — documented in MAR and on armband. If pain escalates overnight, do NOT
  order codeine-containing meds. Contact surgical team for alternatives (e.g., tramadol or
  low-dose PO morphine if needed)

---

## Room 418B — Aisha Okonkwo

| Field              | Detail                                     |
|--------------------|--------------------------------------------|
| **Name**           | Aisha Okonkwo                              |
| **Age / Sex**      | 34 F                                       |
| **Admitting Dx**   | Diabetic Ketoacidosis (DKA) — new-onset T1DM|
| **Admission Date** | March 12, 2024 (admitted today at 1100)     |
| **Attending**      | Dr. Huang                                  |
| **Code Status**    | Full Code                                  |
| **Allergies**      | Penicillin (rash)                          |

### 🔴 URGENT ITEMS
- **Active insulin drip at 5 units/hr** — Q1h BG checks mandatory. Last BG **245 mg/dL at 1800** (↓ from 487 on admission)
- **Endocrinology consult (Dr. Rivera) still PENDING** — was called at 1600, has not seen patient yet. Follow up if not seen by 2100
- **DKA protocol in progress** — bicarb improving but not yet normalized (18, goal ≥ 22)
- **Parents en route from Birmingham — ETA approximately 2200**

### S — Situation
Ms. Okonkwo is a 34-year-old female admitted today at 1100 with new-onset DKA, likely
new-diagnosis Type 1 diabetes. She is currently on an insulin drip with Q1h blood glucose
monitoring. Her glucose and bicarb are trending in the right direction but she is not yet
ready for drip discontinuation. She is anxious and tearful — this is a new, life-changing
diagnosis for her.

### B — Background
- History: previously healthy, no significant PMH
- Presented to ED with 2-week history of polyuria, polydipsia, 12-lb unintentional weight
  loss, nausea/vomiting x2 days
- ED labs: BG 487, pH 7.18, bicarb 12, anion gap 24, positive serum ketones, A1c 11.2%
- GAD65 antibodies sent (pending) — high suspicion for Type 1 DM
- Started on DKA protocol in ED: IV insulin drip, aggressive IVF resuscitation (received 3L
  NS in ED, now on D5 1/2 NS at 150 mL/hr)

### A — Assessment
- **Neuro:** A&O x4, appropriate, tearful intermittently, asking many questions about diabetes
- **Cardiac:** HR 92 (improved from 118 on admission), BP 110/68, RRR
- **Resp:** RR 20 (improved from 28 — Kussmaul respirations resolving), SpO2 97% on 2L NC,
  lungs CTA
- **GI:** Abdomen soft, mild diffuse tenderness, nausea resolved after fluids, tolerating
  ice chips
- **Endo/Metabolic (serial values):**

  | Time  | BG (mg/dL) | pH   | Bicarb | K+  | Anion Gap |
  |-------|-----------|------|--------|-----|-----------|
  | 1100  | 487       | 7.18 | 12     | 5.1 | 24        |
  | 1400  | 362       | 7.26 | 15     | 4.5 | 19        |
  | 1800  | 245       | 7.32 | 18     | 4.1 | 14        |

- **IV Access:** 2 large-bore peripheral IVs (18g R AC, 20g L hand)
- **Skin:** Dry mucous membranes improving, skin turgor improved with hydration
- **Emotional:** Scared about diagnosis, tearful. Has been Googling diabetes on her phone.
  Expressed worry about "having to take shots forever." Receptive to education but overwhelmed
  right now.

### R — Recommendations / Night Shift Tasks
- [ ] **Q1h BG checks** — follow DKA insulin drip protocol on MAR:
  - BG > 300: continue insulin at 5 units/hr
  - BG 200–300: decrease to 3 units/hr, ensure D5-containing IVF running
  - BG 150–200: decrease to 2 units/hr
  - BG < 150: call Dr. Huang — may transition to subQ insulin
- [ ] **Q2h BMP** (next draw at **2000**) — monitor K+, bicarb, anion gap
  - If K+ < 4.0: replace per protocol (40 mEq KCl in IVF)
  - If bicarb ≥ 22 and anion gap closed: notify MD — may be ready to transition off drip
- [ ] **Follow up on endo consult** — if Dr. Rivera has not seen patient by **2100**, page
  endo on-call again
- [ ] Maintain IVF: D5 1/2 NS at 150 mL/hr (reassess with next BMP)
- [ ] Strict I&Os
- [ ] **When parents arrive (~2200):** orient them to the unit, offer to update them on
  Aisha's condition. They may have questions — be empathetic, this is new for the whole family
- [ ] Emotional support — check in frequently. She is alone until parents arrive. Offer
  chaplain services or social work referral if she wants someone to talk to
- [ ] Once DKA resolved and off drip: diabetes education consult will be placed (likely
  tomorrow). Do NOT start education tonight — she is too overwhelmed

### 💊 Medications Due This Shift
| Time         | Medication                         | Route  | Notes                                |
|--------------|------------------------------------|--------|--------------------------------------|
| Continuous   | Insulin regular drip (5 units/hr) | IV     | Titrate per DKA protocol             |
| Continuous   | D5 1/2 NS at 150 mL/hr           | IV     | Reassess with each BMP               |
| Q2h          | BMP draw                           | Lab    | Next at 2000                         |
| PRN          | Ondansetron 4 mg                   | IV     | q6h PRN nausea                       |
| PRN          | KCl 40 mEq                        | IV     | Per protocol if K+ < 4.0             |

### 📝 Pending Orders / Results
- [ ] **Endocrinology consult — Dr. Rivera — NOT YET SEEN** (paged at 1600)
- [ ] GAD65 antibodies — sent, pending (may take several days)
- [ ] A1c resulted: 11.2%
- [ ] Transition to subQ insulin — pending DKA resolution (likely tomorrow)
- [ ] Diabetes education consult — to be placed after DKA resolved

### 👨‍👩‍👧 Family / Communication Notes
> **Parents driving from Birmingham — ETA approximately 2200.**
> Aisha is an only child. Parents are her emergency contacts and healthcare proxies.
> She has asked that her parents be fully updated when they arrive.
>
> **Emotional support is a priority tonight.** She is 34, previously healthy, and just
> learned she has a chronic illness. Be patient with questions. Validate her feelings.
> She does NOT want to talk to other patients about her diagnosis yet.

### ⚠️ Safety Flags
- 🔴 **Active insulin drip** — Q1h BG monitoring is NON-NEGOTIABLE. Hypoglycemia risk if
  drip not titrated properly. Keep D50 at bedside
- 🔴 **Electrolyte shifts** — DKA treatment causes rapid K+ shifts. Monitor closely with
  each BMP
- 🟡 Fall risk: moderate (weakness, dehydration, new admission)
- 🟡 Penicillin allergy — documented in MAR and on armband
- 🟡 2 peripheral IVs — check sites q4h for infiltration (running high-volume IVF + insulin)

---

## Room 420 — Gerald "Gerry" Whitfield

| Field              | Detail                                     |
|--------------------|--------------------------------------------|
| **Name**           | Gerald "Gerry" Whitfield                   |
| **Age / Sex**      | 67 M                                       |
| **Admitting Dx**   | Community-Acquired Pneumonia (CAP)         |
| **Admission Date** | March 9, 2024 (Hospital Day 4)             |
| **Attending**      | Dr. Huang                                  |
| **Code Status**    | Full Code                                  |
| **Allergies**      | Sulfa (anaphylaxis)                        |

### 🔴 URGENT ITEMS
- **New fever spike 101.8°F at 1500** — was afebrile yesterday. Possible treatment failure or new infection source
- **Blood cultures x2 drawn at 1515 — PENDING**
- **Repeat CXR done at 1600 — results PENDING**
- **O2 requirement INCREASED today: room air → 3L NC** (SpO2 was 89% on RA at 1430)
- **SUNDOWNING — increased confusion expected tonight. Fall risk HIGH. Bed alarm ON**

### S — Situation
Mr. Whitfield is a 67-year-old male, hospital day 4, admitted for community-acquired
pneumonia on IV Zosyn (day 4 of planned 7-day course). He had been improving until today
when he developed a new fever of 101.8°F, increased oxygen requirements, and worsening
confusion. Dr. Huang has been notified and ordered blood cultures and a repeat CXR, both
of which are pending. He is a significant fall risk, especially overnight when his
sundowning worsens.

### B — Background
- History: COPD (mild, on home albuterol PRN), HTN, BPH, mild cognitive impairment at
  baseline
- Admitted 3/9 from ED with productive cough (yellow-green sputum), fever 102.4°F, RR 24,
  SpO2 91% on RA
- Admission CXR: RLL consolidation with small parapneumonic effusion
- Sputum culture (3/9): Streptococcus pneumoniae, sensitive to Zosyn
- Course: was improving — defervesced by day 2, O2 weaned to RA by day 3
- **Today's setback:** temperature spike, increased O2 requirement, more confused

### A — Assessment
- **Neuro:** Intermittently confused — knows his name but is disoriented to date and place.
  Oriented x1 at baseline x3. **Sundowning pattern**: worse after 1800, tries to get out of
  bed, pulled at IV line once today. Calm when reoriented, responds well to his wife's name
  ("Betty")
- **Cardiac:** HR 98 (up from 78 this morning), BP 134/82, RRR
- **Resp:** RR 22, SpO2 93% on 3L NC, lungs with coarse crackles RLL (unchanged) and new
  scattered rhonchi bilaterally, productive cough with thick yellow sputum
- **Temp:** 101.8°F at 1500 (Tmax today). Given Tylenol 650 mg PO at 1530. Rechecked at
  1730: 100.2°F
- **GI:** Eating ~50% of meals (decreased appetite today), +BS, no N/V
- **Skin:** Intact, no pressure injuries, warm and dry
- **IV Access:** 20g R hand — site clean, no signs of phlebitis
- **Labs (AM draw):**
  - WBC 14.2 (was 11.8 yesterday — trending up)
  - Procalcitonin 0.8 (up from 0.4 on day 2)
  - BMP: WNL except BUN 28 (mild dehydration)

### R — Recommendations / Night Shift Tasks
- [ ] **Monitor O2 closely** — if SpO2 drops below 90% on 3L NC, titrate up to 5L and notify
  Dr. Huang. If requiring > 5L, may need rapid response evaluation
- [ ] **Check blood culture results** — if positive or if speciation available, notify
  Dr. Huang immediately. May need antibiotic change
- [ ] **Check CXR results** — compare with admission film. Watch for worsening consolidation,
  new infiltrates, or enlarging effusion
- [ ] **Fever management:** Tylenol 650 mg PO/PR q4h PRN temp > 100.4°F. Encourage fluids.
  If temp > 103°F or new hemodynamic instability, call Dr. Huang
- [ ] Continue IV Zosyn 3.375 g q6h — next dose at **2200**
- [ ] **Fall prevention is critical tonight:**
  - Bed alarm MUST remain on at all times
  - Bed in lowest position, 3 side rails up, 1 rail down (nearest to bathroom)
  - Non-skid socks on
  - Call light pinned to gown
  - Commode at bedside (do NOT let him walk to bathroom unassisted)
  - Reorient frequently — use wife's name "Betty" to calm if agitated
  - If severely agitated and unsafe, call Dr. Huang for PRN Haldol order (not currently
    ordered — avoid if possible)
- [ ] Encourage PO fluids — at least 240 mL q2h if tolerated
- [ ] Neuro checks q4h — document orientation level and behavior

### 💊 Medications Due This Shift
| Time | Medication                         | Route | Notes                               |
|------|------------------------------------|-------|-------------------------------------|
| 2200 | Piperacillin-tazobactam 3.375 g  | IV    | Infuse over 30 min. Day 4 of 7     |
| 0400 | Piperacillin-tazobactam 3.375 g  | IV    | Infuse over 30 min                  |
| 2100 | Lisinopril 10 mg                  | PO    | Hold if SBP < 100                   |
| 2100 | Tamsulosin 0.4 mg                 | PO    | For BPH                             |
| PRN  | Acetaminophen 650 mg              | PO/PR | q4h PRN temp > 100.4°F             |
| PRN  | Albuterol 2.5 mg neb              | INH   | q4h PRN wheezing/SOB               |

### 📝 Pending Orders / Results
- [ ] **Blood cultures x2 — drawn 1515 — PENDING** (check micro lab by 0200 for preliminary)
- [ ] **Repeat CXR — done 1600 — results PENDING** (check radiology PACS)
- [ ] Procalcitonin trending up — may need repeat tomorrow AM
- [ ] If cultures positive or clinical decline: Dr. Huang may broaden antibiotics or consult
  infectious disease

### 👨‍👩‍👧 Family / Communication Notes
> **Wife Betty visits daily** — she left at 1700 today. No specific call time but she may
> call the unit tonight if worried.
> She is aware of today's fever and increased O2 needs — Maria updated her before she left.
> If Gerry becomes severely agitated or if there is a significant change in condition,
> Betty wants to be called regardless of the hour. **Cell: see chart contacts.**

### ⚠️ Safety Flags
- 🔴 **HIGH FALL RISK** — bed alarm ON, side rails x3, non-skid socks, commode at bedside
- 🔴 **SUNDOWNING** — will worsen overnight. Expect increased confusion, possible agitation,
  attempts to get OOB. Frequent rounding essential
- 🔴 **Sulfa allergy — ANAPHYLAXIS** — in MAR and on armband. Do NOT administer
  sulfonamide antibiotics, TMP-SMX, or sulfa-containing medications
- 🟡 Aspiration risk — elevated HOB ≥ 30° at all times, supervised meals if confused
- 🟡 IV access limited to one site — protect R hand IV

---

# ⏰ NIGHT SHIFT TASK TIMELINE

This consolidated timeline covers key actions across all four patients. Build into your
rounding schedule.

| Time  | Task                                                                                     |
|-------|------------------------------------------------------------------------------------------|
| **1900** | Receive report. Verify bed alarm Room 420. Visual check all 4 patients.              |
| **1900** | Room 418B: BG check (Q1h ongoing). Verify insulin drip rate and IVF.                 |
| **2000** | Room 418B: Draw BMP (Q2h per DKA protocol).                                          |
| **2000** | Room 412A: Administer IV Lasix 40 mg. Verify fluid restriction tracking.             |
| **2000** | Room 414: Administer Tylenol 1000 mg PO. Assess pain.                                |
| **2000** | Room 412A: **Expect call from daughter.** Provide update on weight, K+, plan.        |
| **2000** | Room 418B: Q1h BG check.                                                              |
| **2100** | Room 412A: Administer Eliquis 5 mg PO, Metoprolol 25 mg PO.                         |
| **2100** | Room 420: Administer Lisinopril 10 mg PO, Tamsulosin 0.4 mg PO.                     |
| **2100** | Room 418B: If Dr. Rivera has NOT seen Aisha yet, page endo on-call again.            |
| **2100** | Room 418B: Q1h BG check.                                                              |
| **2200** | Room 420: Administer Zosyn 3.375 g IV over 30 min.                                   |
| **2200** | Room 418B: Q1h BG check + draw Q2h BMP.                                              |
| **2200** | Room 418B: **Parents arriving approximately this time.** Orient to unit, update.     |
| **2300** | Room 418B: Q1h BG check. Assess emotional status.                                    |
| **2300** | Room 420: Neuro check. Assess confusion level. Ensure bed alarm on.                   |
| **0000** | Room 418B: Q1h BG check + draw Q2h BMP.                                              |
| **0000** | Midnight rounding — visual check all patients. I&O documentation.                     |
| **0100** | Room 418B: Q1h BG check.                                                              |
| **0200** | Room 414: Offer Tylenol 1000 mg PO (if awake and has pain).                          |
| **0200** | Room 418B: Q1h BG check + draw Q2h BMP.                                              |
| **0200** | Room 420: Check micro lab for preliminary blood culture results.                      |
| **0300** | Room 418B: Q1h BG check.                                                              |
| **0300** | Room 420: Neuro check. Fall risk reassessment.                                        |
| **0400** | Room 420: Administer Zosyn 3.375 g IV over 30 min.                                   |
| **0400** | Room 418B: Q1h BG check + draw Q2h BMP.                                              |
| **0400** | Comfort rounds — reposition patients, offer fluids (within restrictions).             |
| **0500** | Room 412A: **Daily weight** — compare to 76.1 kg.                                    |
| **0500** | Room 418B: Q1h BG check.                                                              |
| **0600** | Room 412A: **Draw BMP for K+ recheck.** Flag result for AM team.                     |
| **0600** | Room 414: Record JP drain output (total overnight). Note character.                   |
| **0600** | Room 418B: Q1h BG check + Q2h BMP.                                                   |
| **0600** | Room 420: AM labs — CBC, BMP, procalcitonin.                                          |
| **0600** | Pre-shift documentation — update all I&Os, assessments, overnight events.             |
| **0700** | Prepare handoff report for day shift.                                                 |

---

# 📞 IMPORTANT CONTACTS

| Role                          | Name            | Contact                          |
|-------------------------------|-----------------|----------------------------------|
| Attending (Rooms 412A, 418B, 420) | Dr. Huang   | Pager 4412                       |
| Cardiology Consult (412A)     | Dr. Patel       | Pager 4287                       |
| General Surgery (414)         | Dr. Kim         | Pager 4190                       |
| Endocrinology Consult (418B)  | Dr. Rivera      | Pager 4305 (or endo on-call)     |
| Night House Supervisor        | —               | Ext. 7700                        |
| Rapid Response Team           | —               | Ext. 7777                        |
| Pharmacy                      | —               | Ext. 7500                        |
| Lab (STAT results)            | —               | Ext. 7600                        |
| Respiratory Therapy           | —               | Pager 4100                       |

---

# ✅ END-OF-SHIFT CHECKLIST

**Maria Santos, RN — completed at end of day shift:**

- [x] Verbal report given to James Park, RN at bedside for all 4 patients
- [x] All I&Os documented through 1900
- [x] All medications administered and documented on MAR
- [x] Pending labs and orders communicated verbally and in writing
- [x] Code status verified for all patients
- [x] Fall risk assessments current
- [x] Bed alarm verified ON for Room 420
- [x] IV sites assessed and documented for all patients with active IVs
- [x] Fluid restriction signage confirmed at bedside for Room 412A
- [x] D50 at bedside confirmed for Room 418B (insulin drip safety)
- [x] Critical lab values (K+ 3.3 for Room 412A) communicated to MD and incoming RN
- [x] Family communication needs documented: 412A daughter calling at ~2000, 418B parents
  arriving ~2200
- [x] Isolation/precaution status reviewed: no isolation precautions active

**James Park, RN — to verify at start of night shift:**

- [ ] Confirm bed alarm functioning Room 420
- [ ] Confirm insulin drip rate and BG check schedule Room 418B
- [ ] Verify D50 syringe at bedside Room 418B
- [ ] Confirm fluid restriction tracking setup Room 412A
- [ ] Review pending orders and results for all patients
- [ ] Introduce yourself to all patients at start of shift

---

*Report generated by Squad agent team: Nurse (writer) → DetailCapture (grader) →
PriorityHighlighter (writer) → DetailCapture (grader). Final score: 94/100.*
