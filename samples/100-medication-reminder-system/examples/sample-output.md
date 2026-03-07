# Medication Reminder System — Example Output

> This is what the agent team produces when you run this sample.

---

## Scenario

**Patient:** Robert "Bob" Jameson, age 74
**Location:** One-bedroom apartment, Phoenix, Arizona (lives alone)
**Primary Caregiver:** Daughter **Karen Jameson-Price**, lives 45 minutes away
**Cognitive Status:** Mild cognitive decline — forgetful but still independent
**Medications:** 7 prescriptions from 3 different doctors
**Triggering Event:** Bob was recently hospitalized after accidentally taking his **evening** blood pressure pill (Amlodipine 5mg) in the **morning** alongside his morning blood pressure pill (Lisinopril 20mg). The double blood-pressure-lowering effect caused a dangerous hypotensive episode. He became dizzy, fell in the kitchen, and Karen found him on the floor during a check-in call. Paramedics recorded a blood pressure of 78/42.

**Key Constraints:**
- Bob uses a **basic flip phone** — no smartphone apps
- Bob has **arthritis in his hands** — child-proof caps are difficult
- Bob **sometimes forgets** whether he already took his pills
- Refill dates are **scattered** across the month from 3 different prescribers
- Karen **cannot visit daily** but wants remote monitoring capability

---

## What the Agents Did

### 🔴 Round 1 — MedOrganizer Draft (Score: 38/100)

MedOrganizer produced a basic medication reference sheet. Here is what it looked like:

> **Bob's Medications**
>
> | Medication | Dose | Frequency |
> |---|---|---|
> | Lisinopril | 20mg | Daily |
> | Amlodipine | 5mg | Daily |
> | Metformin | 500mg | Twice daily |
> | Atorvastatin | 40mg | Daily |
> | Donepezil | 10mg | Daily |
> | Tamsulosin | 0.4mg | Daily |
> | Aspirin | 81mg | Daily |
>
> *Consider using the Medisafe app to track your medications.*

**ReminderBot Grader Feedback (38/100):**

| Criterion | Score | Notes |
|---|---|---|
| Schedule clarity | 2/20 | No time-of-day assignments. "Daily" is useless for someone who confused AM and PM pills. |
| Safety & interactions | 0/20 | Zero interaction checking. Did not address the ER incident AT ALL. |
| Accessibility | 3/20 | Recommended a smartphone app — Bob has a flip phone. Small font. No visual aids. |
| Missed-dose protocols | 0/15 | None provided. |
| Refill management | 0/10 | None provided. |
| Caregiver integration | 0/10 | Karen not mentioned once. |
| Printability | 3/5 | Table could be printed but is not senior-friendly. |
| **TOTAL** | **8/100** → scaled **38/100** | "This plan is dangerous. It could cause the exact same ER visit again." |

**Critical failures identified:**
1. ❌ Listed Lisinopril and Amlodipine identically ("Daily") with no AM/PM distinction
2. ❌ Recommended technology Bob cannot use
3. ❌ No visual differentiation between morning and evening medications
4. ❌ Font size and format unsuitable for elderly patient with cognitive decline
5. ❌ Zero caregiver involvement planning

---

### 🟢 Round 2 — RefillTracker Revision (Score: 95/100)

RefillTracker completely rebuilt the plan with the following improvements:

- ✅ **Color-coded time-of-day system** (YELLOW morning, BLUE evening, PURPLE bedtime)
- ✅ **Large-print visual schedule** designed to be posted on the refrigerator
- ✅ **Interaction alert** for Lisinopril/Amlodipine timing separation
- ✅ **Directly solved** the AM/PM confusion that caused the ER visit
- ✅ **Flip phone alarm system** with distinct ring patterns
- ✅ **Arthritis-friendly pill organizer** recommendation
- ✅ **Weekly refill calendar** with Karen's involvement
- ✅ **Missed-dose protocol** for every single medication
- ✅ **Karen's remote monitoring plan** with daily/weekly check-ins
- ✅ **Printable wallet card** for emergency use

**ReminderBot Grader Feedback (95/100):**

| Criterion | Score | Notes |
|---|---|---|
| Schedule clarity | 19/20 | Excellent time-of-day separation with visual reinforcement. |
| Safety & interactions | 20/20 | Interaction flagged, ER incident specifically addressed, safeguards in place. |
| Accessibility | 18/20 | Flip phone compatible, large print, color-coded, arthritis considerations. |
| Missed-dose protocols | 14/15 | Individual protocols for each med. Metformin skip-if-close-to-next is correct. |
| Refill management | 10/10 | Complete tracker with pharmacy info and Karen's role. |
| Caregiver integration | 10/10 | Comprehensive remote monitoring with escalation triggers. |
| Printability | 4/5 | Wallet card, fridge poster, and loading guide all specified. |
| **TOTAL** | **95/100** | "This plan could genuinely prevent another ER visit. Approved." |

---

## Final Output

---

# 💊 BOB'S MEDICATION PLAN

### Prepared for: Robert "Bob" Jameson

### Last Updated: January 15, 2025

### Emergency? Call 911. Then show the wallet card in your billfold.

---

## 💊 BOB'S MEDICATION OVERVIEW

*(What you take, why you take it, and when — in plain English)*

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│  #  │ MEDICATION          │ WHAT IT DOES           │ WHEN         │ DOCTOR      │
├─────────────────────────────────────────────────────────────────────────────────┤
│  1  │ Lisinopril 20mg     │ Lowers blood pressure  │ 🌅 MORNING   │ Dr. Patel   │
│     │ Small white tablet   │                        │ with food    │ (PCP)       │
├─────────────────────────────────────────────────────────────────────────────────┤
│  2  │ Aspirin 81mg        │ Protects your heart    │ 🌅 MORNING   │ Dr. Patel   │
│     │ Tiny orange tablet   │                        │ with food    │ (PCP)       │
├─────────────────────────────────────────────────────────────────────────────────┤
│  3  │ Metformin 500mg     │ Controls blood sugar   │ 🌅 MORNING   │ Dr. Patel   │
│     │ White oval tablet    │ (diabetes)             │ AND          │ (PCP)       │
│     │                      │                        │ 🌆 EVENING   │             │
│     │                      │                        │ with meals   │             │
├─────────────────────────────────────────────────────────────────────────────────┤
│  4  │ Amlodipine 5mg      │ Lowers blood pressure  │ 🌆 EVENING   │ Dr. Patel   │
│     │ Small white tablet   │ (the EVENING one)      │ at dinner    │ (PCP)       │
├─────────────────────────────────────────────────────────────────────────────────┤
│  5  │ Tamsulosin 0.4mg    │ Helps you urinate      │ 🌆 EVENING   │ Dr.         │
│     │ Green/orange capsule │ easier (prostate)      │ 30 min after │ Hernandez   │
│     │                      │                        │ dinner       │ (Urologist) │
├─────────────────────────────────────────────────────────────────────────────────┤
│  6  │ Atorvastatin 40mg   │ Lowers cholesterol     │ 🌙 BEDTIME   │ Dr. Patel   │
│     │ White oval tablet    │                        │              │ (PCP)       │
├─────────────────────────────────────────────────────────────────────────────────┤
│  7  │ Donepezil 10mg      │ Helps memory &         │ 🌙 BEDTIME   │ Dr. Singh   │
│     │ Yellow round tablet  │ thinking               │              │ (Neuro)     │
└─────────────────────────────────────────────────────────────────────────────────┘
```

---

## ⚠️ CRITICAL SAFETY ALERTS

### 🚨 ALERT #1 — THE MOST IMPORTANT RULE

```
╔══════════════════════════════════════════════════════════════╗
║                                                              ║
║   LISINOPRIL (morning) and AMLODIPINE (evening)             ║
║   are BOTH blood pressure pills.                             ║
║                                                              ║
║   ❌  NEVER take them at the same time.                      ║
║                                                              ║
║   LISINOPRIL = MORNING pill (breakfast)                      ║
║   AMLODIPINE = EVENING pill (dinner)                         ║
║                                                              ║
║   Taking both at once can make your blood pressure           ║
║   drop dangerously low. This is what happened on             ║
║   December 3rd that sent you to the ER.                      ║
║                                                              ║
║   IF YOU ARE UNSURE WHICH IS WHICH:                          ║
║   → STOP. Do not take either one.                            ║
║   → Call Karen: (602) 555-0184                               ║
║   → Or call Dr. Patel's office: (602) 555-0291              ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝
```

### 🚨 ALERT #2 — METFORMIN AND FOOD

- **Always** take Metformin WITH food (during breakfast and during dinner).
- Taking Metformin on an empty stomach can cause nausea, stomach pain, and diarrhea.
- If you skipped a meal, **skip that dose of Metformin** too. Do not double up later.

### 🚨 ALERT #3 — TAMSULOSIN TIMING

- Take Tamsulosin **30 minutes after finishing dinner** — not during, not before.
- Taking it on an empty stomach reduces how well it works.
- Taking it and then standing up quickly can make you **dizzy**. Sit for a few minutes after taking it.

### 🚨 ALERT #4 — ASPIRIN AND BLEEDING

- If you notice unusual bruising, blood in your stool (dark/tarry), or bleeding gums, **call Dr. Patel** right away.
- Tell any new doctor or dentist that you take daily aspirin **before** they do any procedure.

### 🚨 ALERT #5 — DONEPEZIL SIDE EFFECTS

- Donepezil is best taken at bedtime because it can cause nausea.
- If you have vivid nightmares or very bad nausea, tell Dr. Singh — the dose may need adjusting.
- **Do not stop Donepezil suddenly** without talking to Dr. Singh.

---

## 🌅 MORNING ROUTINE — YELLOW TIME

**When:** At breakfast (around 8:00 AM)
**Flip phone alarm:** 8:00 AM — labeled "YELLOW PILLS"

### Step-by-step:

```
  STEP 1:  Sit down with your breakfast.

  STEP 2:  Open the YELLOW (MORNING) section of your
           weekly pill organizer.

  STEP 3:  You should see exactly 3 pills:

           💛  Lisinopril 20mg — small white tablet
               (blood pressure — the MORNING one)

           💛  Aspirin 81mg — tiny orange tablet
               (heart protection)

           💛  Metformin 500mg — white oval tablet
               (diabetes — take WITH food)

  STEP 4:  Take all 3 pills with a full glass of water.

  STEP 5:  Close the YELLOW compartment so it is EMPTY.
           This is how you know you took them.

  STEP 6:  ✅ Done! Your next pills are at DINNER.
```

**If the YELLOW compartment is already empty:**
You already took your morning pills. **Do NOT take them again.**
If you are not sure, call Karen.

---

## 🌆 EVENING ROUTINE — BLUE TIME

**When:** At dinner (around 6:00 PM) and 30 minutes after
**Flip phone alarm:** 6:00 PM — labeled "BLUE PILLS"

### Step-by-step:

```
  STEP 1:  Sit down with your dinner.

  STEP 2:  Open the BLUE (EVENING) section of your
           weekly pill organizer.

  STEP 3:  You should see exactly 2 pills to take NOW:

           💙  Amlodipine 5mg — small white tablet
               (blood pressure — the EVENING one)

           💙  Metformin 500mg — white oval tablet
               (diabetes — take WITH food)

  STEP 4:  Take these 2 pills with water, with your meal.

  STEP 5:  EAT YOUR DINNER.

  STEP 6:  Set a 30-minute timer on your flip phone
           (or just wait until you are done eating
           and have rested a bit).

  STEP 7:  After 30 minutes, take the last pill
           in the BLUE section:

           💙  Tamsulosin 0.4mg — green/orange capsule
               (prostate — must be AFTER food)

  STEP 8:  Sit for a few minutes after taking Tamsulosin.
           It can make you dizzy if you stand up fast.

  STEP 9:  Close the BLUE compartment so it is EMPTY.

  STEP 10: ✅ Done! Your last pills are at BEDTIME.
```

**If the BLUE compartment is already empty:**
You already took your evening pills. **Do NOT take them again.**
If you are not sure, call Karen.

---

## 🌙 BEDTIME ROUTINE — PURPLE TIME

**When:** Right before bed (around 9:30 PM)
**Flip phone alarm:** 9:30 PM — labeled "PURPLE PILLS"

### Step-by-step:

```
  STEP 1:  Get ready for bed as usual.

  STEP 2:  Open the PURPLE (BEDTIME) section of your
           weekly pill organizer.

  STEP 3:  You should see exactly 2 pills:

           💜  Atorvastatin 40mg — white oval tablet
               (cholesterol)

           💜  Donepezil 10mg — yellow round tablet
               (memory)

  STEP 4:  Take both pills with water.
           You do NOT need food for these.

  STEP 5:  Close the PURPLE compartment so it is EMPTY.

  STEP 6:  ✅ Done! All pills for today are complete.
           Good night, Bob!
```

**If the PURPLE compartment is already empty:**
You already took your bedtime pills. **Do NOT take them again.**

---

## 📊 VISUAL DAILY SCHEDULE

**Print this section in color and tape it to the refrigerator.**

```
╔══════════════════════════════════════════════════════════════════════╗
║                                                                      ║
║              B O B ' S    D A I L Y    P I L L S                     ║
║                                                                      ║
╠══════════════════════════════════════════════════════════════════════╣
║                                                                      ║
║  ☀️  8 : 0 0   A M  —  B R E A K F A S T                           ║
║  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━                           ║
║  ██ YELLOW ██  Open YELLOW compartment                               ║
║                                                                      ║
║     💛  Lisinopril 20mg    (BP — MORNING pill)                       ║
║     💛  Aspirin 81mg       (heart)                                   ║
║     💛  Metformin 500mg    (diabetes)                                ║
║                                                                      ║
║     ➡️  Take with FOOD and WATER                                     ║
║     ➡️  Close compartment when done                                  ║
║                                                                      ║
╠══════════════════════════════════════════════════════════════════════╣
║                                                                      ║
║  🌇  6 : 0 0   P M  —  D I N N E R                                 ║
║  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━                           ║
║  ██  BLUE  ██  Open BLUE compartment                                 ║
║                                                                      ║
║     💙  Amlodipine 5mg     (BP — EVENING pill)                       ║
║     💙  Metformin 500mg    (diabetes)                                ║
║                                                                      ║
║     ➡️  Take with FOOD and WATER                                     ║
║                                                                      ║
║     ⏱️  WAIT 30 MINUTES AFTER EATING, THEN:                         ║
║                                                                      ║
║     💙  Tamsulosin 0.4mg   (prostate)                                ║
║                                                                      ║
║     ➡️  Sit down for a few minutes after taking                      ║
║     ➡️  Close compartment when done                                  ║
║                                                                      ║
╠══════════════════════════════════════════════════════════════════════╣
║                                                                      ║
║  🌙  9 : 3 0   P M  —  B E D T I M E                               ║
║  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━                           ║
║  ██ PURPLE ██  Open PURPLE compartment                               ║
║                                                                      ║
║     💜  Atorvastatin 40mg  (cholesterol)                             ║
║     💜  Donepezil 10mg     (memory)                                  ║
║                                                                      ║
║     ➡️  Take with WATER (no food needed)                             ║
║     ➡️  Close compartment when done                                  ║
║                                                                      ║
╠══════════════════════════════════════════════════════════════════════╣
║                                                                      ║
║  ⚠️  REMEMBER: YELLOW = morning,  BLUE = evening,                   ║
║                PURPLE = bedtime                                      ║
║                                                                      ║
║  ⚠️  If a compartment is EMPTY, you ALREADY took                    ║
║     those pills. DO NOT take them again.                             ║
║                                                                      ║
║  ⚠️  UNSURE? Call Karen: (602) 555-0184                             ║
║                                                                      ║
╚══════════════════════════════════════════════════════════════════════╝
```

---

## ⏰ REMINDER SYSTEM SETUP

### Flip Phone Alarms

Bob's flip phone supports 3 daily alarms. Set them up exactly like this:

| Alarm | Time | Label | Meaning |
|---|---|---|---|
| Alarm 1 | 8:00 AM | YELLOW PILLS | Morning pills at breakfast |
| Alarm 2 | 6:00 PM | BLUE PILLS | Evening pills at dinner |
| Alarm 3 | 9:30 PM | PURPLE PILLS | Bedtime pills |

**Alarm setup instructions (for Karen to do on Bob's phone):**
1. Open the phone menu → Settings → Sounds → Alarms
2. Set each alarm to **repeat daily, all days**
3. Set the alarm tone to the **loudest available ring**
4. Set snooze to **5 minutes** (gives Bob a second chance if he dismisses it by accident)
5. Label each alarm with the color name (e.g., "YELLOW PILLS")

### Weekly Pill Organizer

**Recommended product:** A 7-day AM/PM/BEDTIME pill organizer with **easy-open push-button lids** (not child-proof twist caps).

**Suggested model:** _Ezy Dose Weekly (AM/PM) Pill Planner_ or _MedCenter 31-Day Pill Organizer_ — both have large compartments and arthritis-friendly push-tab openings.

**Color-coding the organizer:**
- Put a small piece of **yellow tape** on the morning compartment lid
- Put a small piece of **blue tape** on the evening compartment lid
- Put a small piece of **purple tape** on the bedtime compartment lid
- This matches the fridge poster and alarm labels

### Karen's Daily Check-In System

| Time | Method | What Karen Does |
|---|---|---|
| 8:30 AM | Phone call | "Good morning, Dad! Did you take your YELLOW pills with breakfast?" |
| 6:30 PM | Phone call | "Hi Dad, did you take your BLUE pills with dinner?" |
| Sunday 2:00 PM | In-person visit | Refill the weekly pill organizer for the coming week |

**If Bob does not answer the 8:30 AM call:**
1. Try again at 9:00 AM.
2. If no answer at 9:00 AM, call Bob's neighbor Mrs. Gutierrez: (602) 555-0347.
3. If neighbor cannot reach Bob, Karen drives to apartment for a welfare check.

---

## 🔄 REFILL TRACKER

### All Medications — Refill Schedule

| # | Medication | Pharmacy | Rx Number | Supply | Next Refill | Auto-Refill? |
|---|---|---|---|---|---|---|
| 1 | Lisinopril 20mg | Walgreens #4821 | RX-7790214 | 90 days | March 18 | ✅ Yes |
| 2 | Amlodipine 5mg | Walgreens #4821 | RX-7790215 | 90 days | March 18 | ✅ Yes |
| 3 | Metformin 500mg | Walgreens #4821 | RX-7790216 | 90 days | February 22 | ✅ Yes |
| 4 | Atorvastatin 40mg | Walgreens #4821 | RX-7790217 | 90 days | April 5 | ✅ Yes |
| 5 | Donepezil 10mg | Walgreens #4821 | RX-8834019 | 30 days | February 3 | ❌ No* |
| 6 | Tamsulosin 0.4mg | Walgreens #4821 | RX-8901472 | 30 days | February 10 | ❌ No* |
| 7 | Aspirin 81mg | OTC (no Rx) | N/A | Buy as needed | Check monthly | N/A |

*\*Donepezil and Tamsulosin require specialist authorization for refills. Karen should call the pharmacy 7 days before the refill date to confirm they are processing.*

### Karen's Refill Checklist (Monthly)

```
  FIRST SUNDAY OF EACH MONTH — REFILL CHECK

  □  Check all 6 prescription bottles. How many pills are left?
  □  If any bottle has fewer than 14 pills, call Walgreens
     to request a refill: (602) 555-0500
  □  Check aspirin bottle. If low, buy a new bottle of
     Aspirin 81mg (low-dose, enteric coated) at any store.
  □  Confirm all auto-refills are still active in the
     Walgreens system.
  □  For Donepezil: If Dr. Singh's authorization has expired,
     call his office to renew: (480) 555-0633
  □  For Tamsulosin: If Dr. Hernandez's authorization has
     expired, call his office to renew: (623) 555-0198
  □  Update the "Next Refill" dates on this sheet.
```

---

## ❓ MISSED DOSE PROTOCOLS

### What To Do If Bob Misses a Dose

**General Rule: NEVER double up. If you miss a dose, follow the specific instructions below for that medication.**

---

**1. Lisinopril 20mg (morning blood pressure)**
- If you remember **before noon**: Take it now with food.
- If it is **after noon**: Skip it. Take tomorrow's dose at the normal time.
- ⚠️ Do NOT take it in the evening — that is when you take Amlodipine, and taking both together is dangerous.

**2. Amlodipine 5mg (evening blood pressure)**
- If you remember **before bedtime**: Take it now.
- If you remember **the next morning**: Skip it. Take it at the next evening dose.
- ⚠️ Do NOT take it in the morning — that is when you take Lisinopril, and taking both together is dangerous.

**3. Metformin 500mg (diabetes — morning and evening)**
- If you remember **within 2 hours** of the missed dose: Take it now with a snack.
- If it is **more than 2 hours late**: Skip it. Take the next dose at the regular time.
- Never take 2 Metformin tablets at once.
- If you skipped a meal entirely, skip the Metformin dose for that meal.

**4. Atorvastatin 40mg (bedtime cholesterol)**
- If you remember **during the night or early morning**: Take it now.
- If you remember **the next afternoon**: Skip it. Take it at bedtime tonight.
- Missing one dose of Atorvastatin occasionally is not dangerous, but try to be consistent.

**5. Donepezil 10mg (bedtime memory)**
- If you remember **within a few hours**: Take it now.
- If you do not remember until the next day: Skip the missed dose.
- **Important:** Do not stop Donepezil for more than a few days without calling Dr. Singh. The medication needs to stay in your system consistently.
- If Bob misses **3 or more days in a row**, Karen should call Dr. Singh before restarting.

**6. Tamsulosin 0.4mg (evening prostate)**
- If you remember **before bedtime**: Take it with a small snack. Sit down afterward.
- If you do not remember until the next morning: Skip it. Take it after dinner as usual.
- Missing one dose may mean slightly more difficulty urinating that night — this is normal and not dangerous.

**7. Aspirin 81mg (morning heart)**
- If you remember **any time that day**: Take it now with food.
- If you do not remember until the next day: Just take the normal dose. Do not double up.
- Missing one day of low-dose aspirin is generally not dangerous.

---

### Quick-Reference Missed Dose Summary

```
┌──────────────────────────────────────────────────────────┐
│          IF YOU MISSED A DOSE, FIND YOUR PILL:           │
│                                                          │
│  LISINOPRIL    → Before noon? Take it. After? Skip.     │
│  AMLODIPINE    → Before bed? Take it. Next AM? Skip.    │
│  METFORMIN     → Within 2 hours? Take it. Later? Skip.  │
│  ATORVASTATIN  → Overnight? Take it. Next PM? Skip.     │
│  DONEPEZIL     → Within hours? Take it. Next day? Skip. │
│  TAMSULOSIN    → Before bed? Take it. Next AM? Skip.    │
│  ASPIRIN       → Same day? Take it. Next day? Normal.   │
│                                                          │
│    ⚠️  NEVER DOUBLE UP — one dose at a time ⚠️          │
│    ⚠️  When in doubt, call Karen or Dr. Patel  ⚠️       │
└──────────────────────────────────────────────────────────┘
```

---

## 🏥 PRESCRIBER CONTACTS

### Bob's Doctors

```
┌──────────────────────────────────────────────────────────────────┐
│                                                                  │
│  DR. RAJESH PATEL — Primary Care Physician                       │
│  ─────────────────────────────────────────                       │
│  Phoenix Family Medicine Associates                              │
│  4200 N Central Ave, Suite 100, Phoenix, AZ 85012               │
│  Phone: (602) 555-0291                                           │
│  Fax:   (602) 555-0292                                           │
│  Prescribes: Lisinopril, Amlodipine, Metformin,                 │
│              Atorvastatin, Aspirin                                │
│  Next appointment: March 10, 2025 at 10:00 AM                   │
│                                                                  │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  DR. ANITA SINGH — Neurologist                                   │
│  ─────────────────────────────────────                           │
│  Valley Neurology & Memory Center                                │
│  7500 E Osborn Rd, Suite 220, Scottsdale, AZ 85251             │
│  Phone: (480) 555-0633                                           │
│  Fax:   (480) 555-0634                                           │
│  Prescribes: Donepezil                                           │
│  Next appointment: April 22, 2025 at 2:30 PM                    │
│                                                                  │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  DR. CARLOS HERNANDEZ — Urologist                                │
│  ──────────────────────────────────                              │
│  Southwest Urology Partners                                      │
│  10250 W Camelback Rd, Suite 300, Glendale, AZ 85037           │
│  Phone: (623) 555-0198                                           │
│  Fax:   (623) 555-0199                                           │
│  Prescribes: Tamsulosin                                          │
│  Next appointment: May 8, 2025 at 9:00 AM                       │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

---

## 📋 KAREN'S REMOTE MONITORING PLAN

### Daily Check-In Protocol

**Morning call (8:30 AM):**
1. Call Bob. Let it ring 8 times (he is slow to get to the phone).
2. Ask: "Good morning, Dad. Did you take your **YELLOW** pills with breakfast?"
3. Listen for confidence in his answer. If he sounds confused or unsure, walk him through it:
   - "Go look at your pill organizer. Is today's YELLOW section empty or full?"
   - If full: "Okay, take those pills now with a glass of water and a piece of toast."
   - If empty: "Great, you already took them. You're all set."
4. Ask: "How are you feeling this morning? Any dizziness?"

**Evening call (6:30 PM):**
1. Call Bob.
2. Ask: "Hi Dad, did you take your **BLUE** pills with dinner?"
3. Same process as above — check if the BLUE compartment is empty.
4. Remind him: "Don't forget your Tamsulosin capsule 30 minutes after you finish eating."

### Weekly In-Person Visit (Sunday Afternoon)

**Karen's Sunday Checklist:**

```
  □  1. RELOAD THE PILL ORGANIZER
        Open all 7 prescription bottles and the aspirin.
        For each day (Mon–Sun), place:
          YELLOW section: Lisinopril + Aspirin + Metformin
          BLUE section:   Amlodipine + Metformin + Tamsulosin
          PURPLE section: Atorvastatin + Donepezil
        Double-check each day has exactly 3 + 3 + 2 = 8 pills.

  □  2. COUNT REMAINING PILLS
        Record how many pills are left in each bottle.
        If any bottle has fewer than 14 pills, call
        Walgreens at (602) 555-0500 for a refill.

  □  3. CHECK THE FRIDGE POSTER
        Is it still posted and readable?
        Replace if damaged, stained, or curling.

  □  4. CHECK THE WALLET CARD
        Is it still in Bob's billfold?
        Is it legible? Replace if worn.

  □  5. TEST THE PHONE ALARMS
        Have Bob show you his 3 daily alarms.
        Make sure all 3 are still set and ringing daily.
        Replace phone battery if low.

  □  6. CHECK BLOOD PRESSURE
        Use the home BP cuff. Record the reading.
        Normal for Bob: around 128/78.
        Call Dr. Patel if: above 160/100 or below 90/60.

  □  7. ASK ABOUT SIDE EFFECTS
        Any dizziness? (Could be blood pressure pills)
        Any stomach upset? (Could be Metformin)
        Any bad dreams? (Could be Donepezil)
        Any unusual bruising? (Could be Aspirin)

  □  8. CHECK THE APARTMENT
        Enough food for the week?
        Any fall hazards? (rugs, cords, wet floors)
        Lights all working? (nightlights in bathroom)
```

### Escalation Triggers — When to Call the Doctor

| Sign | Who to Call | Urgency |
|---|---|---|
| Blood pressure below 90/60 | Dr. Patel → or 911 if dizzy/faint | 🔴 Urgent |
| Blood pressure above 180/110 | Dr. Patel → or 911 | 🔴 Urgent |
| Bob cannot remember if he took pills 3+ days in a row | Dr. Singh (cognitive) | 🟡 Soon |
| Persistent nausea or vomiting | Dr. Patel | 🟡 Soon |
| Dark or tarry stool | Dr. Patel (possible GI bleed from aspirin) | 🔴 Urgent |
| Difficulty urinating despite Tamsulosin | Dr. Hernandez | 🟡 Soon |
| Bob found on the floor / fall | 911 first, then Dr. Patel | 🔴 Emergency |
| Bob is confused and does not recognize Karen | 911 | 🔴 Emergency |

---

## 🖨️ PRINTABLE CARDS

### Card 1: Wallet Card — For ER / Urgent Care

*Print on heavy cardstock. Fold to wallet size. Keep in Bob's billfold at all times.*

```
┌──────────────────────────────────────────────────────────┐
│           MEDICAL INFORMATION — Robert Jameson           │
│               DOB: 05/14/1950    Age: 74                 │
│         Emergency Contact: Karen (602) 555-0184          │
├──────────────────────────────────────────────────────────┤
│  ALLERGIES: Sulfa drugs (rash), Codeine (nausea)         │
│  CONDITIONS: Hypertension, Type 2 Diabetes,              │
│    Hyperlipidemia, Mild Cognitive Impairment, BPH        │
├──────────────────────────────────────────────────────────┤
│  CURRENT MEDICATIONS:                                    │
│   1. Lisinopril 20mg    QAM    (Dr. Patel)              │
│   2. Aspirin 81mg       QAM    (Dr. Patel)              │
│   3. Metformin 500mg    BID    (Dr. Patel)              │
│   4. Amlodipine 5mg     QPM    (Dr. Patel)              │
│   5. Tamsulosin 0.4mg   QPM    (Dr. Hernandez)          │
│   6. Atorvastatin 40mg  QHS    (Dr. Patel)              │
│   7. Donepezil 10mg     QHS    (Dr. Singh)              │
├──────────────────────────────────────────────────────────┤
│  ⚠️ Lisinopril AM + Amlodipine PM — DO NOT give         │
│     together (hypotension risk — prior ER visit 12/3)    │
├──────────────────────────────────────────────────────────┤
│  PCP: Dr. Patel (602) 555-0291                           │
│  Neuro: Dr. Singh (480) 555-0633                         │
│  Uro: Dr. Hernandez (623) 555-0198                       │
│  Pharmacy: Walgreens #4821 (602) 555-0500                │
│  Insurance: Medicare + AARP Supplement Plan F             │
│  Medicare #: 1EG4-TE5-MK72                               │
└──────────────────────────────────────────────────────────┘
```

### Card 2: Fridge Poster — Daily Schedule

*See the VISUAL DAILY SCHEDULE section above. Print it on a full 8.5" × 11" sheet in color. Laminate if possible. Tape to the refrigerator at Bob's eye level.*

### Card 3: Pill Organizer Loading Guide

*Print this card and keep it inside the box where you store Bob's pill bottles. Karen uses it every Sunday when refilling the organizer.*

```
┌──────────────────────────────────────────────────────────┐
│          WEEKLY PILL ORGANIZER LOADING GUIDE              │
│                                                          │
│  FOR EACH DAY (Monday through Sunday):                   │
│                                                          │
│  💛 YELLOW (Morning) compartment — 3 pills:             │
│     • 1 × Lisinopril 20mg   (small white tablet)        │
│     • 1 × Aspirin 81mg      (tiny orange tablet)        │
│     • 1 × Metformin 500mg   (white oval tablet)         │
│                                                          │
│  💙 BLUE (Evening) compartment — 3 pills:               │
│     • 1 × Amlodipine 5mg    (small white tablet)        │
│     • 1 × Metformin 500mg   (white oval tablet)         │
│     • 1 × Tamsulosin 0.4mg  (green/orange capsule)      │
│                                                          │
│  💜 PURPLE (Bedtime) compartment — 2 pills:             │
│     • 1 × Atorvastatin 40mg (white oval tablet)         │
│     • 1 × Donepezil 10mg    (yellow round tablet)       │
│                                                          │
│  TOTAL PER DAY: 8 pills                                 │
│  TOTAL PER WEEK: 56 pills                               │
│                                                          │
│  ⚠️  If any count seems wrong, STOP and recount.        │
│      Do NOT guess. Call Dr. Patel if unsure.             │
└──────────────────────────────────────────────────────────┘
```

---

## 💡 BOB-PROOFING TIPS

### Preventing the AM/PM Mix-Up (Most Important)

The ER visit happened because Lisinopril (morning) and Amlodipine (evening) are both small white tablets for blood pressure. Here is how to make them impossible to confuse:

1. **Use the color-coded pill organizer.** If Bob takes pills only from the organizer (never from the bottle), he cannot accidentally take the wrong one at the wrong time.
2. **Ask the pharmacist to change Amlodipine to a different color.** Some manufacturers make it as a yellow or blue tablet. A different appearance creates a visual safety check.
3. **Label the bottles with big colored stickers.** Yellow sticker on all morning bottles. Blue sticker on evening bottles. Purple sticker on bedtime bottles.
4. **Store them separately.** Keep morning bottles on the LEFT side of the medicine shelf. Keep evening bottles on the RIGHT side. Keep bedtime bottles on a SEPARATE shelf.
5. **Remove the evening bottles from easy reach.** If Bob can only see and reach morning bottles in the morning, he physically cannot grab the wrong one.

### Arthritis-Friendly Strategies

1. **Request non-child-proof caps** from Walgreens. Tell the pharmacist: "Please use easy-open caps for all of Robert Jameson's prescriptions." They are legally required to offer this.
2. **Use a pill organizer with push-button lids** instead of snap-open. The Ezy Dose brand has large tabs that require minimal finger strength.
3. **Keep a rubber grip pad** on the counter near the pills. This helps Bob grip bottles if he does need to open one directly.
4. **Pre-load the weekly organizer** (Karen does this on Sundays) so Bob never has to open a prescription bottle during the week.

### Preventing "Did I Already Take My Pills?" Confusion

1. **The empty-compartment system.** If the compartment for that time of day is empty, Bob already took those pills. Full means not yet taken.
2. **A simple paper checklist** next to the pill organizer with checkboxes for each day and time. Bob puts a big X after taking pills. Karen checks this on Sunday.
3. **Karen's daily phone calls** serve as a secondary verification system.
4. **Do NOT leave loose pills on the counter.** All pills go in the organizer. If Bob sees a loose pill, he should NOT take it — he should put it aside and tell Karen on Sunday.

### Other Safety Tips

- Keep a **nightlight in the bathroom and hallway** — Tamsulosin and Donepezil can cause dizziness, and getting up at night is common at 74.
- Keep the **Poison Control number** on the fridge: **1-800-222-1222**.
- If Bob accidentally takes the wrong pill or too many pills, call **Poison Control immediately**, then Karen, then 911 if advised.
- Keep a current **medication list** in the glove box of Karen's car (in addition to the wallet card) in case of emergency during car rides.

---

## 🎯 SETUP CHECKLIST FOR KAREN

*Complete these one-time tasks to get the system running.*

```
  ONE-TIME SETUP (do all of these the first Sunday)
  ─────────────────────────────────────────────────

  □  1.  BUY the weekly pill organizer (AM/PM/Bedtime,
         arthritis-friendly push tabs, e.g., Ezy Dose)

  □  2.  BUY colored tape: yellow, blue, and purple rolls.
         Apply tape to organizer lids to match the system.

  □  3.  CALL Walgreens at (602) 555-0500:
         - Request easy-open (non-child-proof) caps for
           ALL of Bob's prescriptions
         - Set up AUTO-REFILL for Lisinopril, Amlodipine,
           Metformin, and Atorvastatin
         - Ask if Amlodipine is available in a different
           color (to differentiate from Lisinopril)
         - Confirm Donepezil and Tamsulosin refill
           authorization status

  □  4.  LABEL all prescription bottles:
         - Yellow sticker: Lisinopril, Aspirin, Metformin
         - Blue sticker: Amlodipine, Metformin (2nd bottle),
           Tamsulosin
         - Purple sticker: Atorvastatin, Donepezil
         (Use a thick marker to write the TIME on each
         sticker: "MORNING" / "EVENING" / "BEDTIME")

  □  5.  SET UP Bob's flip phone alarms:
         - 8:00 AM → "YELLOW PILLS"
         - 6:00 PM → "BLUE PILLS"
         - 9:30 PM → "PURPLE PILLS"
         All set to repeat daily, loudest volume.

  □  6.  PRINT the fridge poster (Visual Daily Schedule
         section of this document). Laminate if possible.
         Tape to refrigerator at Bob's eye level.

  □  7.  PRINT the wallet card. Cut to wallet size.
         Place in Bob's billfold behind his driver's license.

  □  8.  PRINT the Pill Organizer Loading Guide.
         Place inside the storage box with Bob's pill bottles.

  □  9.  LOAD the pill organizer for the first week.
         Use the Loading Guide. Double-check each day.

  □  10. PRINT the paper checklist for the week.
         Place it next to the pill organizer with a pen.

  □  11. STORE morning bottles on LEFT side of medicine shelf.
         Store evening bottles on RIGHT side.
         Store bedtime bottles on a SEPARATE shelf.

  □  12. SET your own phone reminders:
         - 8:30 AM daily → Call Bob (morning check-in)
         - 6:30 PM daily → Call Bob (evening check-in)
         - 1st of each month → Refill inventory check
         - Sundays 2:00 PM → Visit Bob, reload organizer

  □  13. GIVE a copy of the wallet card information to:
         - Bob's neighbor Mrs. Gutierrez
         - Your own wallet
         - The glove box of your car
         - Bob's primary care chart (fax to Dr. Patel)

  □  14. INSTALL a nightlight in Bob's bathroom
         and hallway if not already present.

  □  15. POST emergency numbers on the fridge:
         - 911
         - Poison Control: 1-800-222-1222
         - Karen: (602) 555-0184
         - Dr. Patel: (602) 555-0291

  □  16. TAKE A PHOTO of the loaded pill organizer
         on your phone each Sunday. This gives you a
         reference if Bob calls confused during the week.
```

---

*Generated by the Medication Reminder Squad: MedOrganizer → ReminderBot (Grader) → RefillTracker*
*Sample #100 of 100 Ways to Use Squad*
