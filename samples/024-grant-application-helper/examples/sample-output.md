# Grant Application Helper — Example Output

> This is what the agent team produces when you run this sample.

## Scenario

Maria Santos runs "Tech Futures," a tiny nonprofit in East Oakland that teaches coding to low-income high school students. She's been running it for 3 years out of a borrowed church basement with 2 volunteer teachers and 40 students. The equipment is ancient (donated laptops from 2012), and she's been funding everything with bake sales and her own credit cards. The Knight Foundation just announced a $50,000 grant for "youth digital literacy programs" — due in 9 days. Maria has never written a grant before. She has the passion and the track record (3 students went to college for CS, one just got hired at a startup), but she doesn't know how to translate "we're teaching kids to code in a church basement" into "fundable nonprofit program."

## What the Agents Did

### Round 1: First Draft

**GrantWriter** produced:

**PROJECT SUMMARY**

Tech Futures is requesting $50,000 to support our digital literacy program for underserved youth in East Oakland. We teach coding and computer skills to high school students who lack access to technology education. Our program has been successful over the past three years, serving 40 students with volunteer instructors. Funding will be used to purchase new equipment, expand our curriculum, and hire part-time staff. This aligns with Knight Foundation's mission to support informed and engaged communities through technology access.

**Budget Summary:**
- Equipment: $20,000
- Staffing: $18,000
- Curriculum development: $7,000
- Operations: $5,000
**Total: $50,000**

**AlignmentChecker** scored it **69/100** and found:

- "Underserved youth" is vague — Knight wants specific demographics with numbers (Maria mentioned 92% students of color, 78% qualify for free lunch, median household income $31,000 — USE THOSE)
- Missing the compelling outcome: 3 college CS students and 1 startup hire from a program with ZERO budget is a 10% college placement rate in CS — better than most funded programs — this is your credibility
- The $20,000 equipment line doesn't explain the problem: students currently share 8 computers (5:1 ratio) and half the laptops can't run modern dev tools — Knight wants to see the gap you're filling
- No alignment with Knight's specific priorities: their RFP emphasized "pathways to tech careers" and "community-driven solutions" — you have both (the startup hire, the church partnership) but didn't mention them
- Weak program description: "teach coding" could mean anything — need specifics: JavaScript, Python, Git, what curriculum, what outcomes
- Zero community voice: no student quotes, no partner testimonials, no evidence that community wants/needs this beyond your assertion

### Round 2: Improved Draft

**ImpactStoryteller** transformed it into narrative-driven evidence:

Opened with Maria's origin story: laid off from tech job in 2020, saw neighborhood kids on phones with no computer access, started teaching HTML in her living room. Added the student spotlight: Jamal, 16, learned Python in the church basement, built an app to help his grandmother track diabetes medication, now has internship at local startup earning $22/hour (more than his parents). Included hard data: East Oakland has 34% youth unemployment vs. 12% citywide, and tech jobs in Oakland grew 47% since 2020 but only 3% went to East Oakland residents — this is the gap. Detailed the equipment crisis: current student:computer ratio is 5:1, students wait 30 minutes for a turn, half can't do homework because no computer at home. Added church partnership context: Pastor Williams saw Tech Futures as mission-aligned (serving community) and donated space; this is community-driven, not top-down. Brought in parent testimonial: "My daughter comes home excited about 'functions' and 'loops' instead of hanging out on the corner. Ms. Santos saved her." Ended with Knight-specific alignment: this program creates direct pathways to tech careers (proven by the startup hire) using community infrastructure (the church) with measurable outcomes (10% college CS placement despite $0 budget).

**AlignmentChecker** scored it **91/100**: "Strong narrative with specific evidence and clear Knight alignment. The Jamal story and the parent quote give it emotional punch while the data backs it up. This is fundable."

## Final Output

---

# TECH FUTURES: BRIDGING THE DIGITAL DIVIDE ONE STUDENT AT A TIME

**Grant Application to Knight Foundation**  
**Program:** Youth Digital Literacy Initiative  
**Amount Requested:** $50,000  
**Project Period:** January 2024 – December 2024  
**Submitted by:** Maria Santos, Founder & Executive Director

---

## EXECUTIVE SUMMARY

Tech Futures is requesting $50,000 to expand our coding education program that serves low-income high school students in East Oakland, California. Over the past three years, operating on a $0 annual budget from a borrowed church basement, we have taught 40 students fundamental programming skills — resulting in 3 college computer science enrollments and 1 student hired at a Bay Area tech startup.

Our students are 92% youth of color from households earning a median income of $31,000 (60% below Oakland median). They face a stark reality: tech jobs in Oakland grew 47% since 2020, but only 3% went to East Oakland residents. Our program creates a direct pathway from "no computer at home" to "employed in tech" — but we're currently doing it with 8 donated laptops from 2012 and volunteer teachers who can only commit evenings.

This grant will enable us to:
- **Triple our equipment capacity** (8 → 25 computers) so students don't wait 30 minutes for a turn
- **Hire two part-time instructors** to expand from 2 evenings/week to 5 days/week
- **Formalize curriculum** with industry-standard tools (Git, VS Code, modern frameworks)
- **Create job placement pipeline** connecting graduates to local tech employers

Knight Foundation's focus on informed and engaged communities through technology access aligns perfectly with our mission. We're not just teaching coding — we're building a bridge from East Oakland's church basements to Bay Area tech offices, one student at a time.

---

## THE PROBLEM: TECH BOOM, MEET TECH DESERT

East Oakland is 20 minutes from Silicon Valley. It might as well be 2,000 miles.

**The numbers tell the story:**

| Metric | East Oakland | Oakland Citywide | Bay Area |
|--------|--------------|------------------|----------|
| **Youth unemployment (16-24)** | 34% | 12% | 8% |
| **Median household income** | $31,000 | $73,000 | $104,000 |
| **High school CS course access** | 8% of schools | 34% of schools | 67% of schools |
| **Students with home computer** | 41% | 68% | 89% |
| **Tech job growth (2020-2023)** | +3% | +47% | +52% |

While tech jobs exploded across the Bay Area, East Oakland was left behind. Our students live in a tech desert surrounded by tech oases.

**What this looks like in practice:**

- Jamal, 16, wants to learn programming but his high school (Castlemont) doesn't offer computer science. The nearest school that does is 8 miles away.
- Destiny, 17, taught herself HTML from YouTube on her phone (no computer at home). She can build a website on a 5-inch screen but can't run developer tools.
- Carlos, 15, is brilliant at math but has never typed on a keyboard. His school has a computer lab — 30 computers for 1,200 students, available only during lunch.

These kids have the talent. They lack the access.

---

## OUR SOLUTION: HIGH-IMPACT CODING EDUCATION IN COMMUNITY SPACES

Three years ago, I was laid off from my software engineering job at a Bay Area startup. I'm from East Oakland — grew up here, went to Castlemont High, was the first in my family to go to college (San Jose State, Computer Science). Getting that degree changed my life trajectory completely.

After the layoff, I started noticing neighborhood kids always on their phones but never on computers. They could navigate Instagram like pros but had never opened a terminal or written a line of code. I thought: I know how to code. I have free time. I have a living room.

I started teaching HTML and CSS to five kids in my apartment. Word spread. Within three months, I had 15 students and no space. Pastor Williams at Bethel AME Church offered his basement: "You're doing God's work, teaching these kids a skill that can feed their families."

**That was three years ago. Here's what we've built:**

### Program Model

**Who we serve:** High school students (grades 9-12) from East Oakland. Our current cohort of 40 students:
- 92% students of color (48% Black, 31% Latino, 13% Asian, 8% other)
- 78% qualify for free/reduced lunch
- 63% live in households below federal poverty line
- 55% have no computer at home
- 0% have access to CS courses at their high schools

**What we teach:**
- **Fundamentals Track** (12 weeks): HTML, CSS, JavaScript, Git basics
- **Python Track** (12 weeks): Python fundamentals, data structures, APIs
- **Project Track** (8 weeks): Build a real app from idea to deployment

**How we teach:**
- Small groups (max 8 students per instructor)
- Project-based learning (students build real things, not just tutorials)
- Pair programming (students learn from each other, not just instructor)
- Industry mentorship (volunteer developers from local companies give feedback)

**When we teach:**
- Tuesday & Thursday evenings, 6-8 PM
- Saturday mornings, 10 AM-12 PM
- Open lab hours: Sunday 1-4 PM (students work on projects, instructor available)

**Where we teach:**
- Bethel AME Church basement (donated space)
- 8 donated laptops (5 work reliably, 3 are "backup" when the primary ones crash)
- Student:computer ratio: 5:1 (students take turns, average wait time: 32 minutes)

### Our Results (Despite $0 Budget)

**Student outcomes:**
- **40 students served** over 3 years (13, 14, 13 per cohort)
- **36 students completed** full program (90% retention)
- **12 students built deployed apps** (live websites they can show employers)
- **3 students enrolled in college CS programs** (UC Merced, San Francisco State, Laney College)
- **1 student hired at tech startup** ($22/hour internship → full-time offer)

That last one is Jamal.

---

## STUDENT SPOTLIGHT: JAMAL'S JOURNEY

Jamal walked into Tech Futures in September 2022. He was 16, a junior at Castlemont High, and his guidance counselor had told him "computer science isn't for kids like you."

Jamal's grandmother has diabetes. She takes six medications on different schedules. She kept missing doses, ending up in the ER. Jamal watched this happen three times.

In Tech Futures, Jamal learned Python. Then he learned about APIs. Then he learned about mobile app frameworks. Then he built "GramBot" — an app that texts his grandmother medication reminders, tracks when she confirms taking them, and alerts Jamal if she misses a dose.

GramBot kept his grandmother out of the ER for six months straight. Jamal showed it to a local startup founder at our demo day. The founder offered him an internship on the spot.

Jamal now works part-time at a health tech startup in Oakland, earning $22/hour (more than either of his parents make). He's learning production code. He's building features that thousands of people use. He just got a full-time offer for after graduation.

**Jamal didn't need charity. He needed a computer and someone to teach him.**

---

## WHY THIS WORKS: COMMUNITY-DRIVEN, OUTCOME-FOCUSED

Our model succeeds because it's built WITH the community, not FOR the community.

### Partnership with Bethel AME Church

Pastor Williams didn't just give us a room. He gave us credibility. When Tech Futures operates out of Bethel — a church that's been in East Oakland for 60 years, that everyone's grandmother goes to, that's housed and fed the neighborhood through recessions and gentrification — parents trust us.

"I wouldn't send my daughter to some program in a office building downtown," one parent told us. "But Pastor Williams vouches for Ms. Santos, so I know it's real."

Church partnership also gives us:
- **Free space** (valued at ~$1,500/month)
- **Built-in community** (parents already come here, trust is pre-established)
- **Mission alignment** (church sees education as ministry, we see education as empowerment)

### Parent & Community Testimonials

**Linda Martinez, mother of Destiny (17):**
> "My daughter used to come home and go straight to her room, on her phone for hours doing who knows what. Now she comes home and goes straight to her computer, building websites, talking about 'functions' and 'loops.' She has a skill. She has a future. Ms. Santos saved her."

**Pastor Joshua Williams, Bethel AME Church:**
> "Tech Futures is doing what the schools should be doing but aren't. These kids have talent. They just need someone to believe in them and give them the tools. Maria is that person. This program is a blessing to our community."

**Jamal Morrison, program graduate (now employed in tech):**
> "I thought coding was for rich kids with expensive computers. Tech Futures showed me it's for anyone willing to learn. Now I'm the one teaching my boss stuff. I'm 17 and I'm getting paid to solve problems. That's crazy."

---

## THE FUNDING NEED: FROM SURVIVAL MODE TO SUSTAINABLE IMPACT

We've proven the model works. Now we need to scale it.

**Current limitations:**

1. **Equipment crisis:** 5:1 student-to-computer ratio means students spend more time waiting than coding. Half our laptops can't run VS Code or modern dev tools. Students can't take work home (no computer at home, can't borrow ours because we only have 8).

2. **Instructor capacity:** I'm the primary instructor. I have one volunteer who can teach Tuesday evenings. I'm burning out. We turn away students because we can't staff more sessions.

3. **Curriculum gaps:** We teach what I know (web dev, Python basics) but students ask for React, SQL, data science, mobile dev — and I don't have time to formalize those curricula.

4. **No job placement pipeline:** Jamal got his internship by luck (right founder at right demo day). We need systematic connections to employers.

### How $50,000 Changes Everything

**EQUIPMENT UPGRADE: $20,000**
- **20 new laptops** (Dell Latitude 3420, $650 each = $13,000)
  - Bring student:computer ratio from 5:1 to 2:1
  - Able to run modern tools (VS Code, Docker, Git, React dev server)
  - 5 loaners for students with no home computer
- **3 external monitors** for pair programming stations ($300)
- **Networking equipment** (router upgrade, ethernet cables) ($700)
- **Software licenses** (GitHub Copilot for Education, JetBrains, Figma) ($0 — free for nonprofits, but listing for transparency)
- **Backup & security** (external drives, surge protectors) ($500)

**STAFFING: $25,000**
- **Part-time Lead Instructor** ($18,000/year = $30/hour × 12 hours/week × 50 weeks)
  - Allows us to expand from 2 evenings to 5 days/week
  - Frees Maria to focus on curriculum development, fundraising, partnerships
  - Brings new expertise (hire someone with data science or mobile dev background)
- **Part-time Program Coordinator** ($7,000/year = $25/hour × 6 hours/week × 47 weeks)
  - Student recruitment, attendance tracking, family communication
  - Employer relationship management for internship pipeline
  - Grant reporting and outcome measurement

**CURRICULUM DEVELOPMENT: $3,000**
- **Formalize existing curricula** into structured modules with assessments
- **Develop 3 new tracks:** React/Frontend, SQL/Databases, Python Data Science
- **Create teacher guides** so program can scale beyond Maria's knowledge
- **Stipends for curriculum reviewers** (pay industry professionals to review/improve)

**OPERATIONS: $2,000**
- **Liability insurance** ($800/year — currently uninsured, risky)
- **Supplies** (cables, mice, desk organizers, whiteboard markers) ($500)
- **Student support** (bus fare assistance for students who can't afford transit) ($700)

---

## ALIGNMENT WITH KNIGHT FOUNDATION PRIORITIES

Knight Foundation's mission is to foster informed and engaged communities through investments in journalism, arts, and technology. Tech Futures advances this mission through:

### 1. Technology Access as Community Empowerment

You write: "We believe that vibrant, informed communities are essential to a healthy democracy."

We prove: Students who learn to code don't just get jobs — they solve community problems. Jamal built GramBot because his grandmother needed it. Destiny is building a website for her church's food pantry. Carlos is creating a Spanish-language resource finder for immigrants.

When East Oakland students have technology skills, they build technology FOR East Oakland.

### 2. Pathways to Economic Opportunity

You write: "Technology access should translate to economic mobility."

We deliver: 10% college CS placement rate (3 of 30 graduates) despite operating on $0 budget. For context, national average for college CS enrollment is 3% overall and less than 1% for low-income students of color. We're 10x the national average.

Jamal's $22/hour internship will earn him ~$18,000 this year — more than his mother makes working full-time at a grocery store. That's life-changing for his family.

### 3. Community-Driven Solutions

You write: "The best solutions come from communities themselves."

We embody: Tech Futures wasn't designed by consultants or imported from elsewhere. It grew organically from a church basement because that's where the community is. Parents send their kids because Pastor Williams vouches for us. Students stay because they see Jamal's success and think "that could be me."

This isn't a program imposed ON East Oakland. It's a program built BY and FOR East Oakland.

---

## SUSTAINABILITY PLAN: BEYOND THIS GRANT

$50,000 gets us to sustainability, not dependence.

**Year 1 (this grant):** Expand equipment and staffing, prove expanded model works  
**Year 2:** Leverage track record to secure multi-year funding from:
- Tech company CSR programs (Google.org, Microsoft Philanthropies)
- Local foundations (Silicon Valley Community Foundation, East Bay Community Foundation)
- Earned revenue: fee-for-service corporate training (teach tech employees to teach teens)

**Year 3:** Replicate model in 2 additional East Oakland churches (already in talks with Pastor Williams' colleagues)

**Endgame:** Tech Futures becomes the go-to pipeline for East Oakland → Bay Area tech. When companies want to hire diverse talent, they recruit from us. When students want to learn coding, they come to us. When churches want to serve their community, they partner with us.

---

## MEASURABLE OUTCOMES

If funded, we will achieve by December 2024:

| Metric | Current | Target | Measurement |
|--------|---------|--------|-------------|
| **Students served** | 13/year | 50/year | Enrollment records |
| **Student:computer ratio** | 5:1 | 2:1 | Equipment inventory |
| **Weekly instruction hours** | 6 hours | 20 hours | Calendar |
| **Program completion rate** | 90% | 90%+ | Attendance records |
| **Students w/ deployed projects** | 40% | 70% | GitHub portfolio review |
| **College CS enrollment** | 10% | 15% | Graduate tracking |
| **Internship/job placement** | 3% | 10% | Employer verification |
| **Student satisfaction** | (unmeasured) | 85%+ | Anonymous surveys |

**Quarterly reporting:** We will submit progress reports every 3 months with:
- Student enrollment and attendance data
- Student project showcases (links to deployed apps)
- Curriculum milestones completed
- Partnership development updates
- Financial statements (budget vs. actual)

---

## BUDGET NARRATIVE

**Equipment ($20,000):** Laptop cost researched through Dell Education pricing. 20 laptops brings us to 2.5:1 ratio (accounting for 50 students + occasional absences). 5 loaners addresses home access gap for highest-need students.

**Staffing ($25,000):** Part-time rates are below market (full-time instructors earn $60-80k) but competitive for part-time education roles. Maria remains volunteer Executive Director (donating ~20 hours/week). Lead Instructor salary assumes 12 hours/week: 8 hours instruction + 4 hours prep/grading. Program Coordinator at 6 hours/week: 3 hours admin + 3 hours employer outreach.

**Curriculum ($3,000):** Primarily Maria's time (volunteer) but includes stipends for 3 industry reviewers at $500 each to ensure quality and relevance.

**Operations ($2,000):** Bare-bones operating costs. Church space remains donated. Maria's home office remains program HQ (donated space). No marketing budget (word of mouth + church network). No overhead/administrative fees (100% programmatic).

**Total: $50,000**

---

## ORGANIZATIONAL CAPACITY

**Tech Futures** is a 501(c)(3) nonprofit (EIN: 85-1234567, incorporated May 2021).

**Leadership:**

*Maria Santos, Founder & Executive Director*
- 8 years software engineering experience (worked at: LinkedIn, small startups)
- B.S. Computer Science, San Jose State University
- East Oakland native, Castlemont High School alumna
- Volunteer role (20 hours/week, unpaid)

*Board of Directors:*
- Pastor Joshua Williams (Bethel AME Church) — Chair
- Linda Chen (Google software engineer) — Treasurer
- Marcus Johnson (Oakland Unified teacher) — Secretary

**Current budget:** ~$3,000/year (bake sales, personal funds, small donations)

**Fiscal health:** No debt, no outstanding obligations. Church space donated. Laptops donated (various sources). Insurance not yet acquired (planned with this grant).

---

## CONCLUSION: INVEST IN PROOF, NOT PROMISES

Most grant applications promise future impact. We're showing current impact and asking you to multiply it.

We've already proven that:
- East Oakland students WANT to learn coding (90% retention rate)
- Our model WORKS (10% college CS placement despite no budget)
- Community TRUSTS us (40 students, 2-year waiting list)
- Students SUCCEED after graduation (Jamal employed, earning above-poverty wages at 17)

The limiting factor isn't demand, isn't talent, isn't curriculum quality. It's capacity.

We're teaching world-class coding skills with 2012 laptops, volunteer instructors, and no formal staffing. Imagine what we could do with proper equipment, part-time instructors, and sustainable operations.

**$50,000 turns survival mode into scale mode.**

Knight Foundation invests in informed and engaged communities. Tech Futures creates them — one student, one line of code, one deployed app at a time.

Thank you for considering our application.

---

**Contact:**
Maria Santos  
Founder & Executive Director, Tech Futures  
maria@techfutures-oakland.org  
(510) 555-0147  

**Fiscal Sponsor:** Bethel AME Church  
**Church Address:** 2847 E 14th St, Oakland, CA 94601  
**EIN:** 85-1234567
