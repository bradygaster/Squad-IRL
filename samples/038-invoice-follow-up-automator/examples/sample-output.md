# Invoice Follow-Up Automator — Example Output

> This is what the agent team produces when you run this sample.

## Scenario

Sarah Nguyen runs a freelance graphic design studio called "Bright Pixel Design" in Portland, Oregon. Her client, Meridian Properties LLC (contact: James Hartwell, Accounts Payable), owes $4,750 for a completed brand identity project (Invoice #BPD-2024-089). The invoice was due November 15, 2024. It's now January 14, 2025 — 60 days overdue. Sarah has sent one casual email reminder on December 1st with no response. She needs a professional escalation sequence that maintains the relationship (Meridian is a potential repeat client) while making it clear that payment is required.

## What the Agents Did

### Round 1: First Draft

**Collector** produced:

```
FOLLOW-UP EMAIL:

Subject: Past Due Invoice

Dear James,

This is a reminder that your invoice is past due. Please pay as soon as 
possible to avoid further action.

Thank you,
Sarah
```

**DiplomatBot** scored it **51/100** and found:

- Single generic email — should be an escalating sequence (friendly → firm → final)
- Missing all invoice details (number, amount, date, project description)
- "Avoid further action" is vaguely threatening without specifying what that means
- Doesn't acknowledge the existing relationship or the quality of work delivered
- No payment options or links to make payment easy
- No specific deadline for response
- Tone is cold and impersonal for a freelancer-client relationship
- Missing a phone call script for when emails are ignored
- No guidance on when to involve a collections attorney

### Round 2: Improved Draft

**EscalationExpert** addressed the feedback:

- Created a 4-step escalation sequence over 30 days with specific timing
- Each step increases in formality while remaining professional
- Included invoice details in every communication
- Added payment links and multiple payment options
- Wrote a phone call script for Step 3
- Added a final demand letter template with legal language
- Included relationship-preservation language in early steps
- Provided guidance on when to escalate to small claims court

**DiplomatBot** scored it **94/100**: "Excellent escalation arc — firm but respectful. Each step gives the client a clear path to resolve while protecting Sarah's rights."

## Final Output

---

# 📨 Invoice Follow-Up Sequence

**Creditor:** Bright Pixel Design (Sarah Nguyen)
**Debtor:** Meridian Properties LLC (James Hartwell, AP)
**Invoice:** #BPD-2024-089
**Amount Due:** $4,750.00
**Original Due Date:** November 15, 2024
**Days Overdue (as of today):** 60 days
**Previous Contact:** 1 email (Dec 1, 2024) — no response
**Relationship:** Active client, potential for repeat work

---

## Escalation Timeline

| Step | Date | Action | Tone | Escalation Level |
|------|------|--------|------|-----------------|
| **1** | Jan 15, 2025 (Day 61) | Friendly email with payment link | Warm, helpful | 🟢 Low |
| **2** | Jan 22, 2025 (Day 68) | Firm email with deadline | Professional, direct | 🟡 Medium |
| **3** | Jan 29, 2025 (Day 75) | Phone call + follow-up email | Serious, concerned | 🟠 High |
| **4** | Feb 5, 2025 (Day 82) | Final demand letter (certified mail) | Formal, legal | 🔴 Final |

---

## Step 1: Friendly Reminder Email (Send January 15)

**Tone:** Warm and helpful — assume it's an oversight, not intentional

---

**To:** james.hartwell@meridianproperties.com
**From:** sarah@brightpixeldesign.com
**Subject:** Quick follow-up — Invoice #BPD-2024-089 ($4,750)

Hi James,

Happy New Year! I hope the holidays treated you well.

I wanted to circle back on Invoice #BPD-2024-089 for the Meridian Properties brand identity project. The invoice for **$4,750.00** was due on **November 15, 2024**, and I don't show a payment received yet.

I know end-of-year can be chaotic for AP departments, so this may have just slipped through the cracks. Here are the details to make it easy:

**Invoice Summary:**
- Invoice #: BPD-2024-089
- Project: Brand Identity Package (logo, brand guidelines, stationery suite)
- Amount: $4,750.00
- Due Date: November 15, 2024
- Payment Link: [Pay Online via Stripe](https://invoice.stripe.com/xxxx)

**Payment Options:**
- 💳 Credit card / ACH via the link above
- 🏦 Bank transfer: Routing #021000021, Account #4839201847 (Bright Pixel Design LLC)
- 📬 Check payable to "Bright Pixel Design LLC" → 742 NW Everett St, Suite 204, Portland, OR 97209

Could you let me know the status when you get a chance? Even a quick "got it, processing next week" would be great.

Thanks, James — and I loved seeing the new branding go live on your website. It looks fantastic!

Best,
**Sarah Nguyen**
Bright Pixel Design
(503) 555-0184
sarah@brightpixeldesign.com

*Attachment: Invoice-BPD-2024-089.pdf*

---

### Step 1 Notes
- **Why this works:** Opens with warmth (Happy New Year), provides a face-saving explanation (end-of-year chaos), makes payment frictionless (3 options + direct link), and ends with a genuine compliment about the work. This preserves the relationship while being clear about what's needed.
- **Follow-up action:** If no response within 7 days → move to Step 2.

---

## Step 2: Firm Follow-Up with Deadline (Send January 22)

**Tone:** Professional and direct — still polite but no longer assuming an oversight

---

**To:** james.hartwell@meridianproperties.com
**CC:** (consider CC'ing your main contact at Meridian if James isn't the decision-maker)
**From:** sarah@brightpixeldesign.com
**Subject:** Action needed — Invoice #BPD-2024-089 now 68 days past due

James,

I'm following up on my email from January 15th regarding Invoice #BPD-2024-089 for **$4,750.00**, which is now **68 days past due** (original due date: November 15, 2024).

I want to make sure this gets resolved before it becomes a larger issue. I understand that payment processing can take time, and I'm happy to work with you on this — but I do need a response.

**What I need from you by January 29:**
1. **Payment in full** ($4,750.00) via any of the methods below, OR
2. **A payment plan proposal** if full payment isn't possible right now, OR
3. **A confirmed payment date** so I can update my records

**Payment Options:**
- Online: [Pay via Stripe](https://invoice.stripe.com/xxxx)
- Bank transfer: Routing #021000021, Account #4839201847
- Check: 742 NW Everett St, Suite 204, Portland, OR 97209

Per our service agreement (Section 7), invoices unpaid beyond 60 days may be subject to a **1.5% monthly late fee** ($71.25/month). I haven't applied this yet and would prefer not to.

I value the work we've done together on the Meridian rebrand, and I'd like to keep this relationship positive. Please let me know how you'd like to proceed.

Best,
**Sarah Nguyen**
Bright Pixel Design
(503) 555-0184

*Attachment: Invoice-BPD-2024-089.pdf*

---

### Step 2 Notes
- **Key changes from Step 1:** Introduces a specific deadline (Jan 29), offers 3 resolution paths (payment / plan / date), references the contract's late fee clause without being aggressive, and drops the "I'm sure it's an oversight" framing.
- **The 3-option technique:** Giving 3 options (pay, plan, or date) makes it psychologically easier to respond — saying "no" to all three feels unreasonable.
- **Follow-up action:** If no response by January 29 → move to Step 3 (phone call).

---

## Step 3: Phone Call + Follow-Up Email (January 29)

**Tone:** Serious and concerned — this is a real conversation, not a script to read robotically

### Phone Call Script

**Before calling:** Block your number if needed (dial *67 first). Have the invoice, contract, and email history open in front of you.

---

*[Phone rings]*

**James answers:**

> "Hi James, this is Sarah Nguyen from Bright Pixel Design. Do you have a couple of minutes? I wanted to check in about an outstanding invoice."

*[Let him respond]*

> "Great, thank you. I've sent a couple of emails about Invoice #BPD-2024-089 for the brand identity project — it's $4,750 and it's been outstanding since November 15th. I haven't heard back and I just want to make sure everything's okay on your end."

*[Listen. Let him explain. Common responses and how to handle them:]*

**If he says "I didn't see the emails":**
> "No worries — I know inboxes get overwhelming. I'll resend the invoice right after this call with a payment link. Could we set a date for payment? Would two weeks from now — February 12th — work for you?"

**If he says "We're having cash flow issues":**
> "I understand, and I appreciate your honesty. Would a payment plan work? We could do two payments of $2,375 — one now and one on February 15th. That way it's manageable for you and I can close out the project on my end."

**If he's evasive or says "I'll look into it":**
> "I appreciate that, James. Can I ask for a specific date when I can expect either payment or an update? I'd like to avoid having to escalate this formally, and I think we can work this out between us."

**If he doesn't answer:** Leave a voicemail:
> "Hi James, this is Sarah Nguyen from Bright Pixel Design. I'm calling about Invoice #BPD-2024-089 for $4,750 — it's been outstanding since November 15th. I've sent a couple of emails and haven't heard back, so I wanted to try reaching you directly. Could you call me back at (503) 555-0184? I'd like to get this resolved. Thanks, James."

---

### Follow-Up Email After Call (send same day)

**Subject:** Following up on our call — Invoice #BPD-2024-089

James,

Thank you for taking my call today. As discussed, here's a summary of what we agreed to:

- **[Option A]** Payment of $4,750.00 to be processed by **[agreed date]**
- **[Option B]** Payment plan: $2,375 by **[date 1]** and $2,375 by **[date 2]**

I've reattached the invoice and payment link for your convenience: [Pay Online](https://invoice.stripe.com/xxxx)

I appreciate you working with me on this. Please let me know if anything changes.

Best,
Sarah

---

*If James didn't answer the call, send this instead:*

**Subject:** Voicemail follow-up — Invoice #BPD-2024-089 ($4,750)

James,

I tried reaching you by phone today and left a voicemail regarding Invoice #BPD-2024-089 for **$4,750.00**, now **75 days past due**.

I've been unable to reach you via email (Jan 15 and Jan 22) or phone, and I'm concerned. I'd really like to resolve this directly between us before taking further steps.

**Please respond by February 3, 2025** with one of the following:
1. Payment in full
2. A payment plan proposal
3. A confirmed payment date

If I don't hear from you by that date, I'll need to send a formal demand letter and consider my options for collections.

I hope it doesn't come to that — I've genuinely enjoyed working with Meridian and I'd like to keep the door open for future projects.

Best,
**Sarah Nguyen**
Bright Pixel Design
(503) 555-0184

---

### Step 3 Notes
- **Why phone matters:** Emails are easy to ignore. A phone call creates personal accountability and is harder to dismiss. Many freelancers skip this step — don't.
- **Document everything:** After the call, write down what was said, what was promised, and the date. This becomes evidence if you need it later.
- **Follow-up action:** If no response or no payment by February 5 → move to Step 4 (formal demand letter).

---

## Step 4: Final Demand Letter — Certified Mail (Send February 5)

**Tone:** Formal and legal — this is the last step before involving a third party

**Send via:** USPS Certified Mail with Return Receipt Requested (cost: ~$7.75). This creates a legal record that the letter was delivered.

---

**BRIGHT PIXEL DESIGN LLC**
742 NW Everett St, Suite 204
Portland, OR 97209
(503) 555-0184
sarah@brightpixeldesign.com

February 5, 2025

**SENT VIA CERTIFIED MAIL — RETURN RECEIPT REQUESTED**

Mr. James Hartwell
Accounts Payable
Meridian Properties LLC
1200 SW Morrison St, Suite 800
Portland, OR 97205

**RE: FINAL DEMAND FOR PAYMENT — Invoice #BPD-2024-089**

Dear Mr. Hartwell,

This letter constitutes a **formal and final demand** for payment of **$4,750.00** owed to Bright Pixel Design LLC by Meridian Properties LLC for graphic design services rendered under our service agreement dated August 12, 2024.

**Invoice Details:**
| | |
|---|---|
| Invoice Number | BPD-2024-089 |
| Service Provided | Brand Identity Package (logo design, brand guidelines, stationery suite) |
| Invoice Date | October 15, 2024 |
| Due Date | November 15, 2024 |
| Amount Due | $4,750.00 |
| Late Fee (1.5%/month × 2 months, per Section 7 of Agreement) | $142.50 |
| **Total Amount Due** | **$4,892.50** |

Despite multiple attempts to resolve this matter — via email on December 1, 2024, January 15, 2025, and January 22, 2025, and by telephone on January 29, 2025 — I have received no response or payment.

**Payment of $4,892.50 is due within ten (10) business days of receipt of this letter — no later than February 19, 2025.**

If payment is not received by this date, I will pursue the following remedies available under Oregon law:

1. **Filing in Multnomah County Small Claims Court** (Oregon ORS 46.405 — claims up to $10,000). Filing fee: $54.
2. **Reporting the debt to commercial credit agencies**, which may affect Meridian Properties' business credit rating.
3. **Engaging a collections attorney**, whose fees and costs may be added to the amount owed per Section 9 of our agreement.

I would strongly prefer to resolve this matter directly and avoid these steps. If you are experiencing financial difficulty, I remain open to discussing a payment plan. Please contact me at (503) 555-0184 or sarah@brightpixeldesign.com by **February 19, 2025**.

Sincerely,

_________________________
Sarah Nguyen
Owner, Bright Pixel Design LLC

---

## After the Sequence: Decision Tree

```
Did they pay after Step 1?
├── YES → Done. Send thank-you email. Note for future: net-30 terms with this client.
└── NO → Send Step 2
    ├── Responded, agreed to plan → Monitor plan. If missed, skip to Step 4.
    └── No response → Step 3 (phone)
        ├── Reached, agreed to date → Follow up on that date. If missed, Step 4.
        ├── Reached, refused to pay → Step 4 immediately.
        └── Unreachable → Step 3 voicemail + email, then Step 4.
            └── Step 4 (demand letter)
                ├── Paid → Done. Evaluate whether to work with this client again.
                ├── Payment plan agreed → Document in writing. Monitor.
                └── No response by Feb 19 →
                    ├── Amount < $10K → File in Small Claims Court ($54 filing fee)
                    ├── Amount > $10K → Consult collections attorney
                    └── Consider: Is $4,750 worth the time? (Usually yes — small claims is straightforward)
```

---

## Key Principles

1. **Always be professional.** Even in the final demand letter. Emotional language undermines your position.
2. **Document every contact attempt** — date, method, content, response. This is your evidence file.
3. **Never threaten action you won't take.** If you say "I'll file in small claims court," be prepared to do it.
4. **Give them an out at every step.** Payment plan options reduce resistance and increase the chance of getting paid.
5. **Separate the relationship from the money.** You can like someone and still require them to pay you.
6. **Late fees are leverage, not income.** Mention them, apply them to the final demand, but be willing to waive them if they pay the principal promptly.

---

*Sequence generated for Bright Pixel Design | Invoice #BPD-2024-089 | $4,750.00 | 60 days overdue*
