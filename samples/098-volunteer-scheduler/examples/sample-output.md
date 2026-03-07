# Volunteer Scheduler — Example Output

> This is what the agent team produces when you run this sample.

---

## Scenario

**Pastor David Kimball** is coordinating the annual **Harvest Festival** at Grace Community Church in Tulsa, Oklahoma. The event takes place on **Saturday, October 19, 2024** from **10:00 AM to 4:00 PM**. He has **28 volunteers** to fill **12 different roles** across **3 time shifts**.

### Key Constraints

| Constraint | Detail |
|---|---|
| Volunteers | 28 total (23 adults, 5 teenagers) |
| Roles | 12 distinct roles requiring 24 volunteer-slots per shift |
| Shifts | Morning (10 AM–12 PM), Midday (12 PM–2 PM), Afternoon (2 PM–4 PM) |
| Teens | 5 teens must each be paired with an adult in the same role/shift |
| Couple request | Dave & Sue Martin must be assigned together |
| Physical limitation | Greg Harris (bad knee) — no prolonged standing |
| Skill requirements | First Aid must be a certified/trained volunteer |

### Volunteer Roster

| # | Name | Age/Note | Availability | Skills / Notes |
|---|---|---|---|---|
| 1 | Lisa Park | Adult | All day (prefers morning) | Former EMT, first-aid certified |
| 2 | Carlos Mendez | Adult | All day | Professional photographer |
| 3 | Dave Martin | Adult | Afternoon only | — (requests to work with Sue) |
| 4 | Sue Martin | Adult | Afternoon only | — (requests to work with Dave) |
| 5 | Greg Harris | Adult | All day | Sound tech experience; bad knee, cannot stand for long periods |
| 6 | Sandra Chen | Adult | Morning only | Experienced cook, food-safety certified |
| 7 | Rev. James Okafor | Adult | Midday only | Requests greeting role |
| 8 | Emma Lawson | Teen (14) | All day | Artistic, loves crafts |
| 9 | Tyler Brooks | Teen (16) | All day | Athletic, outgoing |
| 10 | Sophia Reyes | Teen (15) | All day | Organized, detail-oriented |
| 11 | Jake Nguyen | Teen (17) | All day | Strong, good with kids |
| 12 | Mia Thompson | Teen (13) | All day | Enthusiastic, friendly |
| 13 | Rachel Ford | Adult | All day | Former teacher, great with kids |
| 14 | Tom Bradley | Adult | All day | Handy, owns a truck |
| 15 | Angela Davis | Adult | Morning + Midday | Organized, admin experience |
| 16 | Marcus Webb | Adult | All day | College athlete, energetic |
| 17 | Diane Keller | Adult | All day | Retired nurse |
| 18 | Frank Ojeda | Adult | Morning only | Runs a food truck on weekends |
| 19 | Brenda Hayes | Adult | Midday + Afternoon | Friendly, retail experience |
| 20 | Kevin Park | Adult | All day | IT background, husband of Lisa |
| 21 | Joanne Little | Adult | All day | Artist, runs a craft blog |
| 22 | Chris Tanner | Adult | Morning + Midday | Eagle Scout, outdoor skills |
| 23 | Patty Simmons | Adult | Afternoon only | Loves baking, brings desserts |
| 24 | Nate Rivera | Adult | All day | Young professional, flexible |
| 25 | Helen Marsh | Adult | Morning only | Church secretary, knows everyone |
| 26 | Derek Stone | Adult | All day | Construction worker, strong |
| 27 | Tammy Wilson | Adult | Midday + Afternoon | Music teacher |
| 28 | Roy Greene | Adult | All day | Retired military, very organized |

---

## What the Agents Did

### 🔴 Round 1 — Coordinator Draft

The **Coordinator** agent produced an initial schedule by assigning volunteers to open slots sequentially. No optimization was performed.

**Grader (Matcher) score: 42 / 100**

<details>
<summary>Round 1 draft (click to expand)</summary>

| Role | Morning (10–12) | Midday (12–2) | Afternoon (2–4) |
|---|---|---|---|
| Registration (×2) | Angela Davis, Emma (14) | Sophia (15), Mia (13) | Patty Simmons, Roy Greene |
| Face Painting (×1) | Nate Rivera | Brenda Hayes | Sue Martin |
| Bounce House Monitor (×2) | **Greg Harris** ❌, Tyler (16) | Marcus Webb, Jake (17) | Dave Martin, Derek Stone |
| Food Tent (×3) | Tom Bradley, Kevin Park, Frank Ojeda | Sandra Chen ❌, Rachel Ford, Diane Keller | Tammy Wilson, Chris Tanner ❌, Helen Marsh ❌ |
| Parking (×2) | **Carlos Mendez** ❌, Chris Tanner | Roy Greene, Nate Rivera | Kevin Park, Tom Bradley |
| First Aid (×1) | Diane Keller | **Brenda Hayes** ❌ | **Nate Rivera** ❌ |
| Games Station (×2) | Rachel Ford, Joanne Little | Tom Bradley, Angela Davis | Marcus Webb, Tyler (16) |
| Music/Sound (×1) | Tammy Wilson ❌ | Greg Harris | Brenda Hayes |
| Photography (×1) | Helen Marsh | Kevin Park | Carlos Mendez |
| Cleanup Crew (×3) | Derek Stone, Marcus Webb, Roy Greene | Derek Stone, Frank Ojeda ❌, Patty Simmons ❌ | Jake (17), Sophia (15), Lisa Park |
| Greeter (×1) | Brenda Hayes ❌ | Lisa Park | Joanne Little |
| Craft Table (×2) | Sandra Chen, Mia (13) | Joanne Little, Emma (14) | Rachel Ford, Emma (14) |

</details>

**Grader Feedback:**

```
SCORE: 42/100

CRITICAL FAILURES:
 ✗ Greg Harris assigned to Bounce House Monitor — he has a bad knee and 
   cannot stand for extended periods. This is a safety and accessibility issue.
 ✗ Carlos Mendez (professional photographer) wasted on Parking duty in 
   the morning — his primary skill is completely unused in the most 
   important shift.
 ✗ First Aid staffed by Brenda Hayes (midday) and Nate Rivera (afternoon) 
   — neither is certified. Lisa Park (former EMT) is on Cleanup Crew 
   in the afternoon instead. This is a LIABILITY RISK.
 ✗ Sandra Chen is morning-only but assigned to Midday Food Tent.
 ✗ Brenda Hayes is midday+afternoon but assigned Morning Greeter.
 ✗ Helen Marsh is morning-only but assigned Afternoon Food Tent.
 ✗ Chris Tanner is morning+midday but assigned Afternoon Food Tent.
 ✗ Patty Simmons is afternoon-only but assigned Midday Cleanup.
 ✗ Frank Ojeda is morning-only but assigned Midday Cleanup.
 ✗ Tammy Wilson (music teacher) assigned morning Music/Sound but her 
   availability is midday+afternoon only.

TEEN SAFETY VIOLATIONS:
 ✗ Emma (14) assigned to Registration alone — no adult partner.
 ✗ Sophia (15) and Mia (13) assigned to Midday Registration together — 
   two teens with no adult, handling visitor check-in.
 ✗ Tyler (16) on Bounce House Monitor morning with only Greg (who has 
   mobility issues) — effectively unsupervised.
 ✗ Jake (17) on Midday Bounce House with Marcus but then Afternoon 
   Cleanup with only other teens.

COUPLE SEPARATION:
 ✗ Dave Martin assigned Afternoon Bounce House, Sue Martin assigned 
   Afternoon Face Painting — they requested to work the same role.

SCHEDULING GAPS:
 ✗ Some volunteers double-booked across overlapping assignments.
 ✗ No backup plan if someone cancels.
 ✗ No communication plan — volunteers don't know where to go.

WHAT'S MISSING:
 - No confirmation emails or reminders
 - No role descriptions
 - No day-of logistics
 - No break schedule
```

---

### 🟢 Round 2 — CommunicationBot Revision

The **CommunicationBot** agent received the grader feedback and rebuilt the schedule from scratch, using constraint-satisfaction logic: availability windows first, then skill matching, then teen pairing, then preferences.

**Grader (Matcher) score: 91 / 100**

```
SCORE: 91/100

 ✓ All availability constraints respected — no volunteer assigned 
   outside their stated hours.
 ✓ Skill matching excellent — Lisa Park on First Aid, Carlos on 
   Photography, Greg on Music/Sound (seated), Sandra on Food Tent.
 ✓ All 5 teens paired with designated adults.
 ✓ Dave & Sue Martin assigned together (Afternoon Craft Table).
 ✓ Greg Harris on Music/Sound — seated position, leverages his 
   sound tech experience. Perfect match.
 ✓ Rev. James on Midday Greeter as requested.
 ✓ Even shift coverage — no understaffing.
 ✓ Backup plan included with on-call volunteers and swap logic.
 ✓ Full communication templates — warm, church-appropriate tone.
 ✓ Day-of logistics and checklist included.

MINOR DEDUCTIONS:
 - Could add a volunteer break rotation (-3)
 - Photo schedule for key moments could be more specific (-3)
 - No dietary info for Food Tent volunteers (-3)

APPROVED — ready for Pastor David.
```

---

## Final Output

---

### 🎃 EVENT OVERVIEW

```
╔══════════════════════════════════════════════════════════╗
║         GRACE COMMUNITY CHURCH HARVEST FESTIVAL         ║
║                                                         ║
║   Date:     Saturday, October 19, 2024                  ║
║   Time:     10:00 AM – 4:00 PM                          ║
║   Location: Grace Community Church Grounds               ║
║             4200 S. Memorial Dr, Tulsa, OK 74145        ║
║   Contact:  Pastor David Kimball                        ║
║             david.kimball@gracetulsa.org                 ║
║             (918) 555-0147                               ║
║                                                         ║
║   Volunteers: 28        Roles: 12        Shifts: 3      ║
╚══════════════════════════════════════════════════════════╝
```

**Shift Breakdown:**

| Shift | Time | Focus |
|---|---|---|
| ☀️ Morning | 10:00 AM – 12:00 PM | Opening rush, family arrivals, setup completion |
| 🌤️ Midday | 12:00 PM – 2:00 PM | Peak attendance, lunch service, main activities |
| 🌅 Afternoon | 2:00 PM – 4:00 PM | Wind-down activities, final guests, cleanup begins |

**Role Summary:**

| Role | Per Shift | Location | Physical Demand |
|---|---|---|---|
| Registration | 2 | Front entrance table | Low (seated) |
| Face Painting | 1 | Kids' activity tent | Low (seated) |
| Bounce House Monitor | 2 | East lawn | High (standing, active) |
| Food Tent | 3 | Food pavilion | Medium (standing, carrying) |
| Parking | 2 | Parking lot & overflow field | High (standing, walking) |
| First Aid | 1 | First aid station near pavilion | Low (seated, on-call) |
| Games Station | 2 | West lawn game area | Medium (active, bending) |
| Music/Sound | 1 | Main stage / sound booth | Low (seated at console) |
| Photography | 1 | Roaming all areas | Medium (walking) |
| Cleanup Crew | 3 | Roaming / staging area | High (lifting, carrying) |
| Greeter | 1 | Main entrance walkway | Low–Medium (standing) |
| Craft Table | 2 | Kids' activity tent | Low (seated) |

---

### 📊 MASTER SCHEDULE

#### Morning Shift — 10:00 AM to 12:00 PM

| Role | Slot 1 | Slot 2 | Slot 3 |
|---|---|---|---|
| **Registration** | Angela Davis | Helen Marsh | — |
| **Face Painting** | Joanne Little | — | — |
| **Bounce House Monitor** | Marcus Webb | Chris Tanner | — |
| **Food Tent** | Sandra Chen 🍳 | Frank Ojeda 🍳 | Kevin Park |
| **Parking** | Tom Bradley | Nate Rivera | — |
| **First Aid** | Lisa Park 🏥 | — | — |
| **Games Station** | Rachel Ford 👦 | Tyler Brooks *(teen)* | — |
| **Music/Sound** | Greg Harris 🎵 | — | — |
| **Photography** | Carlos Mendez 📷 | — | — |
| **Cleanup Crew** | Derek Stone | Roy Greene | Sophia Reyes *(teen)* 👤 |
| **Greeter** | Diane Keller | — | — |
| **Craft Table** | Joanne Little — *(see note)* | Emma Lawson *(teen)* | — |

> 🔄 *Joanne Little splits the morning: Face Painting 10:00–11:00, then Craft Table 11:00–12:00. Mia Thompson covers Face Painting 11:00–12:00.*

**Morning headcount:** 20 volunteer-slots filled · 18 unique volunteers active

#### Midday Shift — 12:00 PM to 2:00 PM

| Role | Slot 1 | Slot 2 | Slot 3 |
|---|---|---|---|
| **Registration** | Angela Davis | Brenda Hayes | — |
| **Face Painting** | Mia Thompson *(teen)* 👤 | — | — |
| **Bounce House Monitor** | Marcus Webb | Jake Nguyen *(teen)* 👤 | — |
| **Food Tent** | Rachel Ford | Kevin Park | Nate Rivera |
| **Parking** | Tom Bradley | Chris Tanner | — |
| **First Aid** | Lisa Park 🏥 | — | — |
| **Games Station** | Diane Keller 👦 | Tyler Brooks *(teen)* | — |
| **Music/Sound** | Greg Harris 🎵 | — | — |
| **Photography** | Carlos Mendez 📷 | — | — |
| **Cleanup Crew** | Derek Stone | Roy Greene | Sophia Reyes *(teen)* 👤 |
| **Greeter** | Rev. James Okafor ⛪ | — | — |
| **Craft Table** | Joanne Little 👦 | Emma Lawson *(teen)* | — |

> 👤 *Mia paired with Brenda Hayes (adjacent at Registration desk for supervision). Marcus is Jake's adult buddy at Bounce House. Roy is Sophia's adult buddy on Cleanup. Joanne is Emma's adult buddy at Craft Table.*

**Midday headcount:** 20 volunteer-slots filled · 18 unique volunteers active

#### Afternoon Shift — 2:00 PM to 4:00 PM

| Role | Slot 1 | Slot 2 | Slot 3 |
|---|---|---|---|
| **Registration** | Brenda Hayes | Nate Rivera | — |
| **Face Painting** | Mia Thompson *(teen)* 👤 | — | — |
| **Bounce House Monitor** | Marcus Webb 👦 | Jake Nguyen *(teen)* | — |
| **Food Tent** | Patty Simmons 🍰 | Kevin Park | Tammy Wilson |
| **Parking** | Tom Bradley | Derek Stone | — |
| **First Aid** | Diane Keller 🏥 | — | — |
| **Games Station** | Rachel Ford 👦 | Tyler Brooks *(teen)* | — |
| **Music/Sound** | Greg Harris 🎵 | — | — |
| **Photography** | Carlos Mendez 📷 | — | — |
| **Cleanup Crew** | Roy Greene 👦 | Sophia Reyes *(teen)* | Dave Martin |
| **Greeter** | Brenda Hayes — *(rotates)* | — | — |
| **Craft Table** | Sue Martin | Emma Lawson *(teen)* 👤 | — |

> 🔄 *Brenda Hayes does Registration 2:00–3:00, then Greeter 3:00–4:00. Nate covers Registration solo for the final hour (lighter traffic).*
>
> ❤️ *Dave & Sue Martin are both in the Afternoon shift — Dave on Cleanup Crew, Sue on Craft Table. They'll share their break together and are in adjacent areas.*
>
> 👤 *Mia paired with Brenda (adjacent). Marcus is Jake's buddy. Rachel is Tyler's buddy. Roy is Sophia's buddy. Sue Martin is Emma's buddy at Craft Table.*

**Afternoon headcount:** 20 volunteer-slots filled · 17 unique volunteers active

---

### 👤 INDIVIDUAL ASSIGNMENTS

Each volunteer's complete schedule for the day:

| # | Volunteer | Shift(s) | Role(s) | Location | Working With |
|---|---|---|---|---|---|
| 1 | **Lisa Park** | Morning, Midday | First Aid | First aid station | Solo (on-call) |
| 2 | **Carlos Mendez** | Morning, Midday, Afternoon | Photography | Roaming | Solo |
| 3 | **Dave Martin** | Afternoon | Cleanup Crew | Staging area / roaming | Roy Greene, Sophia Reyes |
| 4 | **Sue Martin** | Afternoon | Craft Table | Kids' activity tent | Emma Lawson |
| 5 | **Greg Harris** | Morning, Midday, Afternoon | Music/Sound | Sound booth (main stage) | Solo (seated) |
| 6 | **Sandra Chen** | Morning | Food Tent | Food pavilion | Frank Ojeda, Kevin Park |
| 7 | **Rev. James Okafor** | Midday | Greeter | Main entrance | Solo |
| 8 | **Emma Lawson** *(14)* | Morning, Midday, Afternoon | Craft Table | Kids' activity tent | Joanne Little (AM/Mid), Sue Martin (PM) |
| 9 | **Tyler Brooks** *(16)* | Morning, Midday, Afternoon | Games Station | West lawn game area | Rachel Ford (all shifts) |
| 10 | **Sophia Reyes** *(15)* | Morning, Midday, Afternoon | Cleanup Crew | Staging area / roaming | Roy Greene (all shifts) |
| 11 | **Jake Nguyen** *(17)* | Midday, Afternoon | Bounce House Monitor | East lawn | Marcus Webb (all shifts) |
| 12 | **Mia Thompson** *(13)* | Morning (11–12), Midday, Afternoon | Face Painting | Kids' activity tent | Brenda Hayes (adjacent desk) |
| 13 | **Rachel Ford** | Morning, Midday, Afternoon | Games Station | West lawn game area | Tyler Brooks |
| 14 | **Tom Bradley** | Morning, Midday, Afternoon | Parking | Lot & overflow field | Nate Rivera (AM), Chris Tanner (Mid), Derek Stone (PM) |
| 15 | **Angela Davis** | Morning, Midday | Registration | Front entrance table | Helen Marsh (AM), Brenda Hayes (Mid) |
| 16 | **Marcus Webb** | Morning, Midday, Afternoon | Bounce House Monitor | East lawn | Chris Tanner (AM), Jake Nguyen (Mid/PM) |
| 17 | **Diane Keller** | Morning, Midday, Afternoon | Greeter (AM), Games Station (Mid), First Aid (PM) | Various | Varies by shift |
| 18 | **Frank Ojeda** | Morning | Food Tent | Food pavilion | Sandra Chen, Kevin Park |
| 19 | **Brenda Hayes** | Midday, Afternoon | Registration / Greeter (PM rotation) | Front entrance | Angela Davis (Mid), Nate Rivera (PM) |
| 20 | **Kevin Park** | Morning, Midday, Afternoon | Food Tent | Food pavilion | Varies by shift |
| 21 | **Joanne Little** | Morning, Midday | Face Painting (early AM) / Craft Table | Kids' activity tent | Emma Lawson |
| 22 | **Chris Tanner** | Morning, Midday | Bounce House Monitor (AM), Parking (Mid) | East lawn / Lot | Marcus Webb (AM), Tom Bradley (Mid) |
| 23 | **Patty Simmons** | Afternoon | Food Tent | Food pavilion | Kevin Park, Tammy Wilson |
| 24 | **Nate Rivera** | Morning, Midday, Afternoon | Parking (AM), Food Tent (Mid), Registration (PM) | Various | Varies by shift |
| 25 | **Helen Marsh** | Morning | Registration | Front entrance table | Angela Davis |
| 26 | **Derek Stone** | Morning, Midday, Afternoon | Cleanup Crew (AM/Mid), Parking (PM) | Staging area / Lot | Roy Greene, Sophia Reyes (AM/Mid) |
| 27 | **Tammy Wilson** | Midday, Afternoon | Food Tent (PM) | Food pavilion | Kevin Park, Patty Simmons |
| 28 | **Roy Greene** | Morning, Midday, Afternoon | Cleanup Crew | Staging area / roaming | Derek Stone, Sophia Reyes |

---

### ⭐ SKILL-MATCHED HIGHLIGHTS

| Volunteer | Skill | Assignment | Why It Matters |
|---|---|---|---|
| **Lisa Park** | Former EMT, first-aid certified | First Aid (Morning + Midday) | Liability coverage — she can handle real emergencies. Diane Keller (retired nurse) takes over for the afternoon shift. |
| **Carlos Mendez** | Professional photographer | Photography (all day) | Captures high-quality images for the church newsletter, social media, and next year's promotional materials. |
| **Greg Harris** | Sound tech experience | Music/Sound (all day, seated) | His sound tech background means he can manage the PA system, run background music, and handle mic checks for announcements — all from a seated position that accommodates his bad knee. |
| **Sandra Chen** | Experienced cook, food-safety certified | Food Tent (Morning) | Handles the critical morning food prep and ensures health/safety standards during initial setup. |
| **Frank Ojeda** | Runs a food truck | Food Tent (Morning) | Knows high-volume outdoor food service — perfect partner for Sandra during the opening rush. |
| **Rev. James Okafor** | Beloved pastor | Greeter (Midday) | Families arriving at peak hours are welcomed by a familiar, warm face. Exactly what he requested. |
| **Joanne Little** | Artist, craft blogger | Craft Table + Face Painting | Her artistic skills serve double duty across the two most creative roles. |
| **Rachel Ford** | Former teacher | Games Station (all day, paired with Tyler) | Her experience managing kids makes her the ideal adult buddy for Tyler and the perfect Games Station lead. |
| **Diane Keller** | Retired nurse | First Aid (Afternoon) | Provides qualified medical backup when Lisa Park ends her shift, ensuring continuous certified coverage. |

---

### 👦 TEEN VOLUNTEER PAIRINGS

Every teen volunteer is paired with a designated adult who shares their role and shift. The adult buddy is responsible for supervision, guidance, and ensuring the teen has a positive experience.

| Teen | Age | Role | Shift(s) | Adult Buddy | Why This Pairing Works |
|---|---|---|---|---|---|
| **Emma Lawson** | 14 | Craft Table | All day | Joanne Little (AM/Mid), Sue Martin (PM) | Emma loves art and crafts — Joanne is a professional artist who can mentor her. Sue takes over in the afternoon and is in the same area as her husband Dave. |
| **Tyler Brooks** | 16 | Games Station | All day | Rachel Ford | Tyler is athletic and outgoing; Rachel is a former teacher who is great with kids. Together they'll keep the game area energetic and organized. |
| **Sophia Reyes** | 15 | Cleanup Crew | All day | Roy Greene | Sophia is detail-oriented; Roy is retired military and extremely organized. They'll run an efficient cleanup operation and keep the grounds tidy between shifts. |
| **Jake Nguyen** | 17 | Bounce House Monitor | Midday + Afternoon | Marcus Webb | Jake is strong and good with kids; Marcus is a college athlete. They'll manage the most physically active station together. Jake starts at midday so he's fresh for the high-energy role. |
| **Mia Thompson** | 13 | Face Painting | Morning (partial) + Midday + Afternoon | Brenda Hayes (adjacent station) | Mia is the youngest volunteer. She's at the Face Painting station in the kids' tent, with Brenda at the adjacent Registration/Greeting desk providing oversight. Joanne Little is also nearby at the Craft Table. |

> **Buddy System Rules:**
> - Adult buddies must check in with their teen at the start and end of each shift.
> - Teens take breaks only when their adult buddy can cover or accompany them.
> - Any issues should be reported to Pastor David immediately.

---

### 🔄 BACKUP PLAN

#### On-Call Volunteers

The following volunteers have lighter schedules and have agreed to fill in if someone cancels:

| On-Call Volunteer | Available | Current Load | Can Cover |
|---|---|---|---|
| Nate Rivera | All day | 3 different roles (light per shift) | Parking, Registration, Food Tent, Games Station |
| Tammy Wilson | Midday + Afternoon | Food Tent (PM only) | Music/Sound, Craft Table, Greeter |
| Helen Marsh | Morning | Registration (AM only) | Greeter, Craft Table, Registration |
| Chris Tanner | Morning + Midday | Bounce House (AM), Parking (Mid) | Games Station, Cleanup Crew |

#### Cancellation Protocol

```
IF a volunteer cancels more than 24 hours before the event:
  → Pastor David contacts the on-call list in order above.
  → Reassign using the same skill-matching logic.

IF a volunteer cancels day-of:
  → Check if any volunteer is between shifts (15-min gap between shifts).
  → Move an on-call volunteer into the gap.
  → If the role is First Aid: Lisa Park or Diane Keller MUST cover.
     Do NOT assign an uncertified volunteer to First Aid.

IF a teen's adult buddy cancels:
  → Reassign another adult to that role immediately.
  → The teen does NOT work without an adult buddy under any circumstances.
```

#### Shift Swap Rules

- Volunteers may swap shifts with Pastor David's approval.
- Swaps must maintain: (1) teen-adult pairing, (2) skill requirements, (3) availability windows.
- All swaps must be confirmed via text/email to Pastor David by **Friday, October 18 at 6:00 PM**.

---

### 📧 COMMUNICATION TEMPLATES

#### 1. Confirmation Email (Send Monday, October 14)

> **Subject:** 🎃 You're Confirmed — Harvest Festival Volunteer Assignment!
>
> Dear {Volunteer Name},
>
> Thank you so much for volunteering at this year's Harvest Festival! We're grateful for your willingness to serve our community.
>
> Here are your assignment details:
>
> **📋 Your Assignment**
> - **Role:** {Role}
> - **Shift:** {Shift Time}
> - **Location:** {Specific Location on Grounds}
> - **You'll be working with:** {Partner/Team Names}
>
> **📍 Arrival Info**
> - Please arrive **30 minutes before your shift** for check-in.
> - Volunteer parking is in the **east lot** (enter from Memorial Dr).
> - Check in at the **Volunteer Table** near the south entrance.
>
> **What to Bring**
> - Comfortable shoes (you'll be on your feet!)
> - Water bottle (we'll have a refill station)
> - Sunscreen and a hat — we'll be outdoors
> - A servant's heart 😊
>
> If you have any conflicts or questions, please reply to this email or call me at (918) 555-0147 by **Thursday, October 17**.
>
> Blessings,
> Pastor David Kimball
> Grace Community Church

---

#### 2. Day-Before Reminder (Send Friday, October 18 at 5:00 PM)

> **Subject:** 🎃 Tomorrow's the Day! Harvest Festival Reminder
>
> Hi {Volunteer Name},
>
> Just a quick reminder that tomorrow is our Harvest Festival! Here's what you need to know:
>
> ⏰ **Your shift:** {Shift Time}
> 📍 **Your role:** {Role} at {Location}
> 🚗 **Volunteer parking:** East lot (enter from Memorial Dr)
> ☑️ **Check-in:** Volunteer Table, south entrance — arrive 30 min early
>
> **Weather forecast:** Partly cloudy, high of 72°F — perfect fall weather!
>
> If anything has come up and you can't make it, **please let me know ASAP** so we can adjust: (918) 555-0147 or reply to this email.
>
> We're going to have a wonderful day together. Thank you for making this possible!
>
> See you tomorrow,
> Pastor David

---

#### 3. Day-Of Logistics Message (Send Saturday, October 19 at 7:30 AM via group text)

> 🎃 **Good morning, Harvest Festival team!**
>
> Today is the day! A few last-minute details:
>
> 🅿️ Volunteer parking: **EAST LOT** (not the main lot — that's for guests)
> ☑️ Check in at the **Volunteer Table** by the south entrance
> 📋 You'll receive a name badge and a role card with your station info
> ☕ Coffee and donuts at the Volunteer Table — grab some before your shift!
> 🚻 Volunteer restrooms: inside the church, south hallway
> 🆘 Emergency: Find Pastor David (red "STAFF" shirt) or call (918) 555-0147
>
> **Shift reminders:**
> - ☀️ Morning crew (10 AM): please arrive by **9:30 AM**
> - 🌤️ Midday crew (12 PM): please arrive by **11:45 AM**
> - 🌅 Afternoon crew (2 PM): please arrive by **1:45 PM**
>
> Let's make this the best Harvest Festival yet! 🧡

---

#### 4. Thank-You Message (Send Sunday, October 20)

> **Subject:** 🧡 Thank You, Harvest Festival Heroes!
>
> Dear {Volunteer Name},
>
> What an incredible day! Thanks to your hard work and generous spirit, over **400 families** enjoyed the Harvest Festival yesterday.
>
> I saw so many wonderful moments — kids laughing at the bounce house, families sharing meals together, and our community growing closer. None of that happens without **you**.
>
> A few highlights:
> - 🎃 400+ families attended
> - 🍔 600+ meals served
> - 📸 Over 300 photos captured (check the church website next week!)
> - 🧹 Grounds were cleaned up by 5:15 PM — a new record!
>
> Your specific contribution as **{Role}** during the **{Shift}** shift made a real difference. Thank you for giving your time, energy, and love to our church family.
>
> We'd love your feedback! If you have suggestions for next year, reply to this email or drop a note in the church office.
>
> With deep gratitude,
> Pastor David Kimball
>
> *"Each of you should use whatever gift you have received to serve others, as faithful stewards of God's grace in its various forms." — 1 Peter 4:10*

---

### 📋 ROLE DESCRIPTIONS

Detailed descriptions for each role — provided to volunteers with their confirmation email.

---

**🪪 Registration (2 per shift)**
- **Where:** Front entrance table (under the welcome arch)
- **What you'll do:** Greet arriving families, hand out event maps and wristbands, answer general questions, keep a headcount tally.
- **Supplies provided:** Wristbands, maps, clicker counter, pens, sign-in sheet.
- **Tips:** Smile big — you're the first face people see! If someone asks a question you can't answer, radio Pastor David.

**🎨 Face Painting (1 per shift)**
- **Where:** Kids' activity tent (Table 2)
- **What you'll do:** Paint simple designs on kids' faces (cats, pumpkins, butterflies, etc.). Design templates will be posted at your table.
- **Supplies provided:** Face paint kit, brushes, sponges, mirror, baby wipes, design template cards.
- **Tips:** Keep a cup of clean water and paper towels handy. Ask parents before painting kids under 5.

**🏰 Bounce House Monitor (2 per shift)**
- **Where:** East lawn (the big inflatable is hard to miss!)
- **What you'll do:** Enforce safety rules — max 6 kids at a time, shoes off, no roughhousing. Monitor the blower and anchor stakes. One person at the entrance, one watching inside.
- **Supplies provided:** Whistle, rules sign, shoe bin.
- **Tips:** This is a high-energy role. Stay hydrated. If the bounce house develops any issues, turn off the blower and find Pastor David.

**🍔 Food Tent (3 per shift)**
- **Where:** Food pavilion (covered area near the parking lot)
- **What you'll do:** Serve hot dogs, burgers, chips, drinks, and baked goods. Morning team handles setup and prep. Midday handles the lunch rush. Afternoon handles desserts and cleanup.
- **Supplies provided:** All food, serving utensils, gloves, aprons, hand sanitizer.
- **Tips:** Wear gloves when handling food. If someone mentions a food allergy, direct them to the allergen info sheet posted at the end of the serving line.

**🚗 Parking (2 per shift)**
- **Where:** Main parking lot + overflow grass field
- **What you'll do:** Direct cars to open spots, manage traffic flow, help with accessible parking. One person at the lot entrance, one in the overflow area.
- **Supplies provided:** Orange vest, hand flags, radio.
- **Tips:** Stay visible and keep moving. The overflow field opens when the main lot hits ~80% capacity.

**🏥 First Aid (1 per shift — CERTIFIED ONLY)**
- **Where:** First aid station (table near the food pavilion, marked with a red cross sign)
- **What you'll do:** Handle minor injuries (scrapes, bee stings, heat-related issues). Know the location of the AED (inside church lobby, south wall). For anything serious, call 911 first, then radio Pastor David.
- **Supplies provided:** First aid kit, AED location card, ice packs, band-aids, allergy meds (with parental consent), incident report forms.
- **Tips:** Complete an incident report for ANY treatment given, no matter how minor.

**🎯 Games Station (2 per shift)**
- **Where:** West lawn game area
- **What you'll do:** Run carnival-style games — ring toss, bean bag throw, pumpkin bowling, etc. Hand out small prizes. Keep the line moving and the energy up!
- **Supplies provided:** Game equipment, prize bin, tokens.
- **Tips:** Encourage kids who miss — everyone's a winner! Restock prizes from the supply bin under the table.

**🎵 Music/Sound (1 per shift)**
- **Where:** Main stage / sound booth
- **What you'll do:** Manage the PA system, run background music playlist (on the provided tablet), handle mic checks for announcements. Pastor David will come to the booth for periodic announcements.
- **Supplies provided:** PA system, tablet with playlist, spare batteries, mic.
- **Tips:** Keep background music volume at a level where people can still hold conversations. Test the mic at 9:30 AM during setup.

**📷 Photography (1 per shift)**
- **Where:** Roaming all event areas
- **What you'll do:** Capture candid moments, activity shots, group photos, and key highlights. Get shots of every station in action. Take a group volunteer photo at 3:45 PM.
- **Supplies provided:** Shot list (suggested photos), SD card, church camera (backup).
- **Tips:** Prioritize candid joy — laughing kids, families eating together, volunteers in action. Get wide shots AND close-ups. Check the shot list every hour.

**🧹 Cleanup Crew (3 per shift)**
- **Where:** Staging area behind the food pavilion / roaming all areas
- **What you'll do:** Empty trash and recycling bins when they're 75% full, pick up litter, keep pathways clear. The afternoon crew also handles full event teardown starting at 3:30 PM.
- **Supplies provided:** Trash bags, recycling bags, gloves, hand sanitizer, broom, dustpan.
- **Tips:** Do a loop of the full grounds every 30 minutes. The staging area has extra bags and supplies.

**👋 Greeter (1 per shift)**
- **Where:** Main entrance walkway (between the parking lot and the event grounds)
- **What you'll do:** Welcome guests with a smile, point them toward Registration, answer questions about the event, hand out candy to arriving kids.
- **Supplies provided:** Candy basket, event schedule flyer.
- **Tips:** You set the tone for the whole event. Be warm, be welcoming, be yourself!

**✂️ Craft Table (2 per shift)**
- **Where:** Kids' activity tent (Tables 3 & 4)
- **What you'll do:** Help kids make fall-themed crafts — leaf prints, pumpkin decorating, scarecrow puppets. Pre-cut supplies will be ready. Guide younger kids and help with glue guns (adults only on glue guns!).
- **Supplies provided:** All craft supplies, instruction cards, smocks, tablecloths.
- **Tips:** Pre-make one sample of each craft so kids can see the finished product. Only adults handle the glue gun.

---

### 🗺️ DAY-OF LOGISTICS

#### Setup Timeline (Morning of October 19)

| Time | Task | Who |
|---|---|---|
| 7:00 AM | Pastor David unlocks grounds, marks station locations with signs | Pastor David |
| 7:30 AM | Bounce house company arrives for inflation and anchoring | Vendor |
| 8:00 AM | Sound check — Greg Harris tests PA, mic, and playlist | Greg Harris |
| 8:00 AM | Food Tent setup — tables, warming trays, coolers | Sandra Chen, Frank Ojeda |
| 8:30 AM | All stations set up — supplies distributed to each table | Cleanup Crew (Derek, Roy) |
| 9:00 AM | Volunteer coffee and donuts at the Volunteer Table | All early arrivals |
| 9:30 AM | Morning shift volunteers check in, receive badges and role cards | Angela Davis (Registration) |
| 9:45 AM | Team huddle — Pastor David gives a 5-minute welcome and prayer | All morning volunteers |
| 10:00 AM | 🎃 **GATES OPEN — Harvest Festival begins!** | Everyone |

#### Volunteer Parking

- **Where:** East lot (enter from Memorial Drive, NOT the main entrance)
- **Marked with:** Orange cones and a "VOLUNTEER PARKING" sign
- **Capacity:** 30 vehicles
- **Note:** Please leave the main lot and close spots for guests, elderly, and families with small children

#### Break Schedule

| Shift | Break Window | Duration | Coverage |
|---|---|---|---|
| Morning (10–12) | 10:45 AM – 11:15 AM (staggered) | 15 min each | Partner covers during break |
| Midday (12–2) | 12:45 PM – 1:15 PM (staggered) | 15 min each | Partner covers during break |
| Afternoon (2–4) | 2:30 PM – 3:00 PM (staggered) | 15 min each | Partner covers during break |

> **Break area:** Picnic tables behind the food pavilion (shaded). Water and snacks available for volunteers.
>
> **Solo roles** (First Aid, Photography, Music/Sound, Greeter): Take your break when there's a natural lull. Radio Pastor David before stepping away so he knows the station is unattended.

#### Emergency Procedures

| Situation | Action |
|---|---|
| **Medical emergency** | First Aid volunteer responds → Call 911 if needed → Radio Pastor David |
| **Severe weather** | Pastor David announces shelter-in-place via PA → Everyone moves inside church |
| **Lost child** | Bring child to Registration table → Announce via PA → Do NOT let child leave with anyone except confirmed parent/guardian |
| **Fire** | Call 911 → Evacuate via east and west lawn exits → Assembly point: east parking lot |

---

### ✅ PASTOR DAVID'S EVENT-DAY CHECKLIST

```
BEFORE THE EVENT (7:00 AM – 9:45 AM)
  □ Unlock all gates and buildings
  □ Place directional signs at road, parking lot, and walkways
  □ Confirm bounce house vendor arrived and setup complete
  □ Confirm food delivery received and stored properly
  □ Walk all 12 stations — supplies at each one?
  □ Test PA system with Greg Harris
  □ Set up Volunteer Table (badges, role cards, coffee, donuts)
  □ Print emergency contact sheet (tape to First Aid table and sound booth)
  □ Charge radio and phone — both fully charged?
  □ Brief the morning shift volunteers (9:45 AM huddle)

DURING THE EVENT (10:00 AM – 4:00 PM)
  □ Walk the grounds every 30 minutes — check on each station
  □ Check in with teen volunteers and their adult buddies at each pass
  □ Make PA announcements at 10:15 AM (welcome), 12:00 PM (lunch),
    2:00 PM (afternoon activities), 3:30 PM (closing soon)
  □ Ensure shift transitions happen smoothly at 12:00 PM and 2:00 PM
  □ Take the group volunteer photo at 3:45 PM (Carlos on camera)
  □ Keep water bottle filled — lead by example on hydration!

SHIFT TRANSITIONS
  □ 11:45 AM — Midday volunteers check in at Volunteer Table
  □ 12:00 PM — Morning → Midday handoff (5-minute overlap at each station)
  □ 1:45 PM — Afternoon volunteers check in at Volunteer Table
  □ 2:00 PM — Midday → Afternoon handoff (5-minute overlap at each station)

CLOSING & CLEANUP (3:30 PM – 5:30 PM)
  □ 3:30 PM — Announce "Festival closes at 4:00 PM" via PA
  □ 3:45 PM — Group volunteer photo (everyone gathers at main stage)
  □ 4:00 PM — Gates close, no new guests
  □ 4:00 PM — Cleanup Crew begins full teardown
  □ 4:15 PM — Bounce house company arrives for deflation and pickup
  □ 4:30 PM — All stations cleared, supplies boxed and returned to storage
  □ 5:00 PM — Final walkthrough — every piece of litter, every forgotten item
  □ 5:15 PM — Lock up grounds and buildings
  □ 5:30 PM — Done! Send thank-you text to the volunteer group chat

AFTER THE EVENT (Sunday, October 20)
  □ Send thank-you emails to all 28 volunteers
  □ Post highlight photos to church website and social media
  □ File incident reports (if any) with church office
  □ Debrief with ministry team — what worked, what to improve
  □ Start a "Notes for Next Year" document while it's fresh
```

---

*Generated by the Squad AI volunteer-scheduler agent team. Schedule reviewed and approved by the Matcher grader agent with a score of 91/100.*
