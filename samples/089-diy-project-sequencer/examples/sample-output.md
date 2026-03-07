# DIY Project Sequencer — Example Output

> This is what the agent team produces when you run this sample.

---

## Scenario

**Rachel Kowalski**, 41, Portland, Oregon.

Rachel and her husband Jake bought a 1952 ranch-style home with an attached single-car
garage (12′ × 20′). She wants to convert it into a dedicated home office. Rachel is an
intermediate DIYer — she's done interior painting, basic electrical (swapping outlets and
light fixtures), and installed click-lock laminate flooring in their bedroom. She has never
done framing or drywall.

| Detail | Value |
|---|---|
| Budget | $3,500 |
| Available labor | Rachel (weekday evenings) + Jake (weekends) |
| Timeline goal | 6 weekends |
| Existing conditions | Concrete slab, one 15-amp circuit, sectional garage door, no insulation, no HVAC |
| Skill gaps | Framing, drywall, permit process |

---

## What the Agents Did

### Round 1 — Handyman (Writer) Produces First Draft

The **Handyman** agent generated an initial project plan. The draft had the right general
idea — convert garage to office — but contained significant ordering errors, omissions,
and unrealistic estimates.

**Key problems identified by the grader:**

- ❌ Steps out of order — suggested hanging drywall *before* running electrical and
  installing insulation
- ❌ No mention of permits — Portland requires an electrical permit for new circuits and
  a building permit for garage-to-living-space conversion
- ❌ Zero safety warnings for electrical work, concrete dust, or fiberglass insulation
- ❌ Tool list incomplete — missing stud finder, voltage tester, drywall T-square,
  dust masks, and several others
- ❌ Time estimates wildly optimistic ("hang drywall — 2 hours" for a 12 × 20 garage)
- ❌ Garage door removal/replacement not addressed at all
- ❌ No guidance on when to call a licensed professional

### Round 1 — Sequencer (Grader) Scores the Draft

The **Sequencer** agent evaluated the Handyman's output against the five rubric
categories defined in `spec.md`:

| Criterion | Max | Score | Notes |
|---|---|---|---|
| Sequence Logic | 30 | 11 | Drywall before electrical is a critical ordering error |
| Completeness | 25 | 12 | Missing permits, garage door plan, and many tools |
| Safety Awareness | 20 | 4 | Almost no safety content |
| Clarity | 15 | 12 | Individual steps were clearly written |
| Practical Wisdom | 10 | 8 | A few useful tips, but no "call a pro" guidance |
| **Total** | **100** | **47** | **Below 90 — triggering improvement round** |

### Round 2 — SafetyOfficer (Updater) Improves the Draft

The **SafetyOfficer** agent rewrote the plan, fixing every issue flagged by the grader:

- ✅ Resequenced all steps with correct dependency ordering
- ✅ Added Portland permit requirements (electrical permit + building permit for
  change-of-use)
- ✅ Comprehensive safety warnings for electrical, concrete dust, fiberglass, and
  overhead work
- ✅ Complete tool and materials list with itemized costs
- ✅ Realistic time estimates for a two-person weekend crew
- ✅ Clear "call a pro" recommendations for main panel work and HVAC
- ✅ Full plan for garage door removal and insulated entry door installation

### Round 2 — Sequencer (Grader) Re-Scores

| Criterion | Max | Score | Notes |
|---|---|---|---|
| Sequence Logic | 30 | 28 | Correct ordering, clear dependencies, one minor nit |
| Completeness | 25 | 24 | Thorough materials list with prices; tools split owned/rental |
| Safety Awareness | 20 | 19 | Excellent warnings; PPE for every phase |
| Clarity | 15 | 13 | Detailed but occasionally dense in electrical section |
| Practical Wisdom | 10 | 7 | Strong troubleshooting and pro-tip sections |
| **Total** | **100** | **91** | **≥ 90 — accepted** |

---

## Final Output

What follows is the complete project guide produced by the agent team after two rounds.

---

# 🏗️ Garage-to-Home-Office Conversion

## Complete Project Guide for Rachel & Jake Kowalski

**Project:** Convert attached single-car garage (12′ × 20′ = 240 sq ft) into
climate-controlled home office

**Skill Level Required:** Intermediate — with specific call-outs for tasks requiring a
licensed professional

**Estimated Total Cost:** ~$3,200 (under $3,500 budget with contingency)

**Estimated Timeline:** 6 weekends (Saturday + Sunday, ~8 hrs/day, two people)

---

### Scope Assessment

This conversion involves seven major work categories:

1. **Demolition & prep** — removing garage door, cleaning slab
2. **Framing** — framing the door opening, adding wall framing for insulation
3. **Electrical** — adding circuits, outlets, lighting (partially professional)
4. **Insulation & vapor barrier** — walls and ceiling
5. **Drywall** — hanging, taping, mudding, sanding
6. **Finishing** — paint, flooring, trim
7. **Final details** — electrical covers, punch list, inspection

### Permit Requirements — City of Portland

Portland Bureau of Development Services (BDS) requires:

| Permit | Why | Approximate Cost | How to Apply |
|---|---|---|---|
| **Residential Building Permit** | Change of use from garage to habitable space | $150–$250 | Apply at [portland.gov/bds](https://www.portland.gov/bds/residential-permitting) or in person at 1900 SW 4th Ave |
| **Electrical Permit** | New circuits and sub-panel work | $75–$130 | Required for any new circuit; homeowner can self-permit for own residence |
| **Inspection** (included with permits) | Rough-in electrical + final inspection | Included | Schedule at 503-823-7300 or online |

> ⚠️ **Do not start framing or electrical work before permits are approved.** Portland
> typically processes residential permits in 3–5 business days for simple conversions.
> Apply the week *before* your first build weekend.

---

## 📋 Complete Materials List

### Framing & Structure

| Item | Qty | Unit Price | Total | Source |
|---|---|---|---|---|
| 2×4×96″ studs (pre-cut) | 45 | $3.98 | $179.10 | Home Depot |
| 2×4×8′ pressure-treated (bottom plate on slab) | 6 | $6.48 | $38.88 | Home Depot |
| 2×6×12′ header (door opening) | 2 | $9.87 | $19.74 | Home Depot |
| 36″ pre-hung insulated exterior door | 1 | $248.00 | $248.00 | Home Depot (Masonite) |
| Concrete tapcon screws 3/16″×2¾″ (75-pack) | 2 | $12.97 | $25.94 | Home Depot |
| Framing nails 16d (5 lb box) | 1 | $8.98 | $8.98 | Home Depot |
| Construction adhesive (Loctite PL Premium) | 3 | $5.98 | $17.94 | Home Depot |
| **Subtotal** | | | **$538.58** | |

### Insulation & Vapor Barrier

| Item | Qty | Unit Price | Total | Source |
|---|---|---|---|---|
| R-15 unfaced fiberglass batts, 15″ wide (Owens Corning, 40 sq ft roll) | 7 | $28.97 | $202.79 | Home Depot |
| R-19 unfaced fiberglass batts (ceiling, 48.96 sq ft roll) | 6 | $33.47 | $200.82 | Home Depot |
| 6-mil polyethylene vapor barrier (10′×100′ roll) | 1 | $29.98 | $29.98 | Home Depot |
| Vapor barrier tape (Tyvek, 1.88″×164′) | 2 | $8.47 | $16.94 | Home Depot |
| Foam sill sealer (3½″×50′) | 2 | $4.98 | $9.96 | Home Depot |
| **Subtotal** | | | **$460.49** | |

### Electrical

| Item | Qty | Unit Price | Total | Source |
|---|---|---|---|---|
| 20-amp breaker (matching existing panel brand) | 2 | $7.98 | $15.96 | Home Depot |
| 12/2 Romex NM-B wire (250 ft roll) | 1 | $89.00 | $89.00 | Home Depot |
| 14/2 Romex NM-B wire (100 ft roll) — lighting circuit | 1 | $37.98 | $37.98 | Home Depot |
| Single-gang old-work electrical boxes | 8 | $1.28 | $10.24 | Home Depot |
| Duplex outlets (20-amp, TR) | 6 | $3.48 | $20.88 | Home Depot |
| Decora light switches | 2 | $2.98 | $5.96 | Home Depot |
| 4′ LED shop lights (Lithonia, 4000K) | 4 | $24.98 | $99.92 | Home Depot |
| Wire staples, wire nuts, nail plates | 1 lot | $18.00 | $18.00 | Home Depot |
| Cover plates (outlet + switch) | 8 | $0.98 | $7.84 | Home Depot |
| **Subtotal** | | | **$305.78** | |

### Drywall & Finishing

| Item | Qty | Unit Price | Total | Source |
|---|---|---|---|---|
| 4×8′ ½″ drywall sheets | 24 | $12.98 | $311.52 | Home Depot |
| Drywall screws 1¼″ (5 lb box) | 2 | $9.98 | $19.96 | Home Depot |
| Paper drywall tape (500′ roll) | 1 | $4.98 | $4.98 | Home Depot |
| All-purpose joint compound (4.5 gal bucket) | 2 | $16.98 | $33.96 | Home Depot |
| Drywall corner bead (8′ lengths) | 6 | $2.48 | $14.88 | Home Depot |
| **Subtotal** | | | **$385.30** | |

### Paint & Flooring

| Item | Qty | Unit Price | Total | Source |
|---|---|---|---|---|
| Primer (Kilz 2 All-Purpose, 1 gal) | 2 | $21.98 | $43.96 | Home Depot |
| Interior latex paint (Behr Ultra, eggshell, 1 gal) | 3 | $33.98 | $101.94 | Home Depot |
| Paint rollers 9″ + covers (3-pack) | 2 | $8.97 | $17.94 | Home Depot |
| Painter's tape (FrogTape, 1.41″×60yd) | 3 | $7.98 | $23.94 | Home Depot |
| Drop cloths (9×12′) | 2 | $4.98 | $9.96 | Home Depot |
| Luxury vinyl plank flooring (LifeProof Sterling Oak, 20.06 sq ft/case) | 13 | $42.98 | $558.74 | Home Depot |
| LVP underlayment (100 sq ft roll) | 3 | $19.98 | $59.94 | Home Depot |
| Baseboard trim (MDF, 3¼″×8′) | 14 | $4.28 | $59.92 | Home Depot |
| Finish nails 18-gauge (1000-pack) | 1 | $7.98 | $7.98 | Home Depot |
| **Subtotal** | | | **$884.32** | |

### Miscellaneous

| Item | Qty | Unit Price | Total | Source |
|---|---|---|---|---|
| Sill plate anchoring (epoxy + bolts if needed) | 1 lot | $25.00 | $25.00 | Home Depot |
| Caulk (DAP Alex Plus, 4-pack) | 1 | $12.98 | $12.98 | Home Depot |
| Shims (8″ cedar, 12-pack) | 2 | $3.98 | $7.96 | Home Depot |
| Outlet/switch labels + wire markers | 1 lot | $6.00 | $6.00 | Home Depot |
| **Subtotal** | | | **$51.94** | |

### 📊 Budget Summary

| Category | Cost |
|---|---|
| Framing & Structure | $538.58 |
| Insulation & Vapor Barrier | $460.49 |
| Electrical | $305.78 |
| Drywall & Finishing | $385.30 |
| Paint & Flooring | $884.32 |
| Miscellaneous | $51.94 |
| Permits (estimated) | $300.00 |
| Tool rentals (see below) | $165.00 |
| **Grand Total** | **$3,091.41** |
| **Remaining contingency** | **$408.59** |

> 💡 The contingency covers mistakes (expect to ruin 1–2 drywall sheets your first time),
> extra joint compound (you always need more than you think), and any surprises behind
> the existing walls.

---

## 🧰 Tools Needed

### Tools Rachel & Jake Likely Own

- Cordless drill/driver (18V+)
- Circular saw
- Tape measure (25′)
- Speed square
- 4′ level
- Hammer
- Utility knife + extra blades
- Pry bar
- Extension cords (12-gauge, 50′)
- Step ladder (6′)
- Safety glasses
- Work gloves

### Tools to Buy (worth owning permanently)

| Tool | Price | Why |
|---|---|---|
| Stud finder (Franklin ProSensor 710) | $49.99 | Essential for framing and hanging; the ProSensor shows full stud width |
| Non-contact voltage tester (Klein NCVT-1P) | $19.98 | Must-have before touching any wiring |
| Drywall T-square (48″) | $24.98 | Straight cuts on drywall sheets; you cannot do this accurately freehand |
| 6″ and 12″ drywall taping knives | $16.97 | Needed for mudding and finishing |
| Mud pan (12″ stainless) | $8.98 | Holds compound while taping |
| Hammer tacker (Arrow T50) | $24.98 | For stapling vapor barrier quickly |
| **Total** | **$145.88** | |

### Tools to Rent

| Tool | Rental Cost (weekend) | Source |
|---|---|---|
| Rotary hammer drill (for tapcon holes in concrete slab) | $55/day | Home Depot tool rental |
| Drywall panel lift | $60/weekend | Home Depot tool rental |
| 18-gauge brad nailer + compressor | $50/weekend | Home Depot tool rental |
| **Total** | **~$165** | |

> 💡 Reserve tool rentals online at homedepot.com the Wednesday before each weekend.
> Portland-area stores frequently run out of panel lifts on Saturday mornings.

---

## ⚠️ Safety Equipment & Warnings

### Required PPE for This Project

| Equipment | When Required | Recommended Product |
|---|---|---|
| N95 respirator masks | Concrete drilling, insulation, drywall sanding | 3M 8511 (with valve) |
| Safety glasses (ANSI Z87.1) | All power tool work, overhead work, insulation | DeWalt DPG82-11 |
| Hearing protection | Circular saw, rotary hammer, compressor | 3M WorkTunes (doubles as radio) |
| Leather work gloves | Framing, demo, concrete work | Mechanix Wear M-Pact |
| Nitrile gloves (disposable) | Fiberglass insulation handling | Box of 100 |
| Long sleeves + pants | Insulation installation | Dedicated work clothes — wash separately |
| Hard hat | Overhead drywall work on lift | Basic ANSI Type I |
| Knee pads | Flooring installation, baseboard work | NoCry professional |

### Critical Safety Warnings

> 🛑 **ELECTRICAL SAFETY:** Before touching any existing wiring, turn off the breaker
> AND verify the circuit is dead with your voltage tester. Test the tester on a known-live
> circuit first. People die every year from "I thought I turned it off."

> 🛑 **CONCRETE DUST:** Drilling into the concrete slab produces silica dust, which
> causes permanent lung damage. Wear an N95 mask, wet the drill point, and work in a
> ventilated area. Keep the garage door opening clear during this phase.

> 🛑 **FIBERGLASS INSULATION:** Causes skin irritation and is harmful if inhaled. Wear
> long sleeves, nitrile gloves over work gloves, safety glasses, and an N95 mask. Shower
> immediately after handling. Do not rub your eyes.

> 🛑 **OVERHEAD WORK:** Hanging ceiling drywall is the most physically dangerous part
> of this project. Use the panel lift — do NOT try to hold sheets overhead by hand. A
> 4×8 sheet of ½″ drywall weighs ~57 lbs.

---

## 📅 Weekend-by-Weekend Schedule

---

### 🗓️ Weekend 1: Permits, Prep & Garage Door

**Goals:** Submit permits, clear the space, remove garage door, frame the new door opening

**Before this weekend:**
- Apply for building + electrical permits (do this the Monday before — $300 budget)
- Order the pre-hung exterior door for delivery/pickup on Friday
- Reserve the rotary hammer drill for Saturday

#### Saturday (Day 1) — ~8 hours

**Morning (8:00 AM – 12:00 PM)**

1. **Clear the garage completely** (1 hr)
   - Move everything into the driveway or house
   - Sweep the slab clean; note any cracks or drainage issues

2. **Disconnect the garage door opener** (30 min)
   - Unplug the opener motor
   - Pull the emergency release cord
   - Remove the motor unit from the ceiling bracket (two people, use ladder)

3. **Remove the garage door** (2 hrs)
   - Start from the top panel, working down
   - Remove the tension springs LAST — these are under extreme tension
   - ⚠️ **If your door has torsion springs (mounted above the door on a rod), STOP.
     Call a garage door company to release the tension. This is a $75–$100 service call
     that can save you from a hospital visit.** Extension springs (on the sides) are safer
     to handle but still require caution — clamp them before releasing.
   - Remove tracks, brackets, and all mounting hardware
   - Stack panels in driveway for disposal (schedule a junk pickup or haul to Metro
     Central transfer station, 6161 NW 61st Ave)

4. **Remove the door header trim and assess the opening** (30 min)
   - Measure the rough opening (should be approximately 8′–9′ wide × 7′ high)
   - Check the existing header beam — in a 1952 ranch, this is likely a doubled 2×8 or
     2×10 which is adequate for a 36″ door

**Afternoon (1:00 PM – 5:00 PM)**

5. **Frame the new door opening** (3 hrs)
   - Mark the 36″ rough opening on the existing header (centered or offset to your
     preference — Rachel wants it centered)
   - The rough opening for a 36″ pre-hung door is 38″ wide × 82″ tall
   - Install king studs from slab to existing header on each side
   - Install jack studs (trimmer studs) tight against king studs
   - Attach a new 2×6 header across the top of the jack studs (this carries the load
     above the door)
   - Install cripple studs above the header to the existing top plate
   - **Time estimate:** 2.5–3 hrs for first-time framers. Take your time — measure twice

6. **Fill the remaining garage door opening with framing** (1.5 hrs)
   - Frame the wall sections on either side of the new door opening
   - Use 16″ on-center stud spacing
   - Anchor bottom plates to the concrete slab with tapcon screws (pre-drill with rotary
     hammer, 3/16″ masonry bit, every 24″)
   - Apply foam sill sealer between the pressure-treated bottom plate and the concrete

#### Sunday (Day 2) — ~6 hours

7. **Install the pre-hung exterior door** (2 hrs)
   - Set the door in the rough opening on shims
   - Level and plumb — check with your 4′ level on both sides and the top
   - Shim at hinge locations and latch-side
   - Drive 3″ screws through the hinges into the king studs (replace one screw per hinge
     with a 3″ screw for strength)
   - Install the latch hardware
   - Test open/close multiple times before moving on
   - Apply expanding foam around the door frame perimeter (use low-expansion "door and
     window" foam — NOT standard Great Stuff, which can bow the frame)

8. **Sheathe the exterior of the new wall section** (2.5 hrs)
   - Install ½″ OSB sheathing on the exterior side of the framed wall
   - Wrap with Tyvek housewrap (overlap existing siding by 6″)
   - This doesn't need to be pretty — it will be behind the finished exterior

9. **Plan the exterior finish** (1 hr)
   - Decide on siding to match the house (1952 ranch likely has horizontal lap siding)
   - This can be a separate weekend project or hired out (~$300–$500 for a small section)
   - For now, the Tyvek wrap is weather-tight

> **End of Weekend 1 checkpoint:** The garage door opening is closed and weather-tight,
> a new insulated entry door is installed and functional, and the space is ready for
> interior work.

---

### 🗓️ Weekend 2: Framing Interior Walls & Rough Electrical

**Goals:** Fur out existing walls for insulation, run all new electrical wiring

**Before this weekend:**
- Confirm permits are approved (check portland.gov/bds portal)
- Have a licensed electrician install a sub-panel or add breakers to your main panel
  (see "When to Call a Professional" section — budget ~$200–$400 from contingency if
  needed). They can also pull the homeowner electrical permit for you.

#### Saturday (Day 3) — ~8 hours

**Morning (8:00 AM – 12:00 PM)**

1. **Fur out the three existing garage walls** (3.5 hrs)
   - The existing garage walls are likely bare stud (no drywall on the garage side) or
     concrete block. Inspect what you have:
     - **If bare stud walls:** Great — you already have a stud cavity for insulation.
       Check stud spacing (should be 16″ OC). Add blocking where needed.
     - **If concrete block walls:** Attach 2×4 furring strips vertically at 16″ OC using
       tapcon screws. This creates the insulation cavity.
   - Add horizontal blocking at 48″ height (for future shelf mounting)

2. **Frame the ceiling if needed** (1 hr)
   - If exposed rafters/joists: add blocking between joists for insulation support
   - If finished ceiling above: check for adequate depth (need 5.5″ for R-19 batts)

**Afternoon (1:00 PM – 5:00 PM)**

3. **Plan the electrical layout** (1 hr)
   - Mark outlet locations on the studs with painter's tape:
     - 6 outlets total: one on each short wall, two on each long wall
     - Place outlets 18″ from floor (center of box) per code
     - Place at least one outlet on a dedicated 20-amp circuit for computer equipment
     - Two light switch locations: one by the new entry door, one by the interior door
       to the house
   - Mark ceiling light locations (4 LED shop lights in a 2×2 grid pattern)

4. **Run all new electrical wiring** (3 hrs)
   - ⚠️ **Verify the main panel breaker is OFF and locked. Tape a note to the panel.**
   - Run 12/2 Romex from the panel location to all outlet boxes on the 20-amp circuits
   - Run 14/2 Romex from the switch locations to ceiling light boxes on the 15-amp
     lighting circuit
   - Drill ⅞″ holes through stud centers for wire runs
   - Install nail plates on every stud where wire passes within 1¼″ of the face (code
     requirement to prevent screw punctures)
   - Leave 8″ of extra wire at every box location
   - Staple wires within 12″ of every box and every 4′ along runs

> 💡 **Wiring tip:** Label every wire run with masking tape at both ends (e.g., "outlet 3,
> 20A circuit A"). Future-you will be grateful when connecting at the panel.

#### Sunday (Day 4) — ~5 hours

5. **Install electrical boxes** (1.5 hrs)
   - Nail old-work boxes to studs at marked locations
   - Pull wires through box knockouts, leaving 6–8″ of wire
   - Secure wires with cable clamps inside each box

6. **Rough-in inspection prep** (1 hr)
   - Take photos of every wire run, box, and nail plate location before insulation
   - These photos are invaluable for future work and for the inspector
   - Make sure all wire is stapled properly and boxes are secure

7. **Schedule rough-in electrical inspection** (15 min)
   - Call Portland BDS at 503-823-7300 or schedule online
   - Inspector will check wire gauge, box fill, staple spacing, and nail plates
   - Typical turnaround: 1–3 business days

8. **Use remaining time for cleanup and material prep** (2 hrs)
   - Sweep up all sawdust and wire scraps
   - Inventory insulation — confirm you have enough batts for walls + ceiling
   - Stage insulation near the garage for next weekend

> **End of Weekend 2 checkpoint:** All walls are framed, all wiring is run, electrical
> boxes are installed, and rough-in inspection is scheduled.

---

### 🗓️ Weekend 3: Insulation & Vapor Barrier

**Goals:** Insulate all walls and ceiling, install vapor barrier

**Before this weekend:**
- Rough-in electrical inspection must be PASSED before you cover any wiring
- If inspection failed, fix the issues first (usually minor — a missing staple, a nail
  plate, etc.)

#### Saturday (Day 5) — ~7 hours

1. **Insulate the walls** (3.5 hrs)
   - Install R-15 unfaced fiberglass batts in all wall cavities
   - Cut batts with a utility knife on a scrap piece of plywood (not on the floor)
   - Friction-fit into cavities — do NOT compress. Compressed insulation loses R-value.
   - Cut around electrical boxes — leave no gaps. Use scraps to fill odd spaces.
   - ⚠️ Full PPE: N95 mask, safety glasses, nitrile + work gloves, long sleeves/pants
   - **Tip:** Cut batts 1″ longer than the cavity and compress slightly for a snug fit.
     The insulation should fill the cavity without bulging past the stud face.

2. **Insulate the ceiling** (2.5 hrs)
   - Install R-19 batts between ceiling joists
   - Use insulation supports (wire hangers) or friction-fit
   - This is overhead work — take breaks every 30 minutes
   - Fiberglass rains down constantly — keep your mouth closed, glasses on, mask sealed

3. **Seal gaps and penetrations** (1 hr)
   - Use expanding foam around any pipe or wire penetrations through exterior walls
   - Seal the sill plate/slab junction with caulk
   - Fill any gaps around the door frame that expanding foam didn't fully cover

#### Sunday (Day 6) — ~6 hours

4. **Install the vapor barrier** (3 hrs)
   - Roll 6-mil polyethylene sheeting across the walls over the insulation
   - Staple to studs with the hammer tacker every 12″
   - Overlap seams by 12″ and seal with vapor barrier tape
   - Wrap the barrier into electrical box openings (you'll cut these out when
     installing drywall)
   - The barrier goes on the WARM side of the insulation (facing the room interior)
   - ⚠️ Portland's climate zone (4C) requires a vapor barrier on the interior face to
     prevent moisture from condensing inside the wall cavity

5. **Install ceiling vapor barrier** (2 hrs)
   - Same process on the ceiling — this is a two-person job
   - One person holds/positions, the other staples
   - Overlap wall-to-ceiling barrier seams by 6″

6. **Final insulation inspection** (1 hr)
   - Walk the entire room and check for:
     - Gaps in insulation (especially around boxes and at plate lines)
     - Compressed batts (pull them out to full thickness)
     - Unsealed vapor barrier seams
     - Any exposed wiring that should be behind the barrier

> **End of Weekend 3 checkpoint:** The room is fully insulated and sealed. You should
> already notice a temperature difference from the rest of the garage. The space is ready
> for drywall.

---

### 🗓️ Weekend 4: Drywall Hanging & First Coat of Mud

**Goals:** Hang all drywall, tape joints, apply first mud coat

**Before this weekend:**
- Reserve the drywall panel lift for Saturday morning pickup
- Have all 24 sheets of drywall delivered (Home Depot delivers for ~$79, worth it for
  this quantity — carrying 24 sheets through the house is miserable)

#### Saturday (Day 7) — ~9 hours (long day)

1. **Set up the panel lift and stage materials** (30 min)
   - Assemble the lift per instructions (takes 10 min)
   - Stack drywall sheets against a wall, face sides together in pairs
   - Set up a cutting station: two sawhorses with a plywood scrap as a table

2. **Hang the ceiling drywall FIRST** (4 hrs)
   - Always do ceilings before walls — wall sheets will support ceiling edges
   - Load a sheet onto the panel lift, raise to ceiling height
   - Position tight against the corner and screw into joists
   - Drive drywall screws every 12″ along joists, keeping screws ¼″ from edges
   - Dimple screws slightly below the surface without breaking the paper
   - **Expect this to be slow the first two sheets.** By sheet #4, you'll have a rhythm
   - Cut around ceiling light boxes with a drywall keyhole saw (jab saw)
   - ⚠️ Wear your hard hat — a dropped sheet from ceiling height can cause serious injury

3. **Hang the wall drywall** (4 hrs)
   - Hang top row first, tight against the ceiling drywall
   - Then bottom row — leave a ½″ gap at the floor (baseboard will cover it)
   - Cut outlet/switch holes: measure from the nearest edge and adjacent sheet, transfer
     to the drywall, cut with a keyhole saw
   - **Tip:** Rub a crayon on the box edges, press the drywall against the wall, and the
     crayon will mark the cut location perfectly
   - Screw into studs every 12″ — use your stud finder to mark stud lines on the floor
     with painter's tape for reference

#### Sunday (Day 8) — ~6 hours

4. **Install corner bead** (1 hr)
   - Nail metal corner bead on all outside corners
   - Use drywall nails every 9″ on alternating sides
   - Check with your level — corner bead sets the finished edge

5. **Tape all joints** (2 hrs)
   - Apply a thin bed coat of joint compound over every seam with your 6″ knife
   - Press paper tape into the wet compound
   - Run the knife over the tape to squeeze out excess compound and air bubbles
   - Also tape the inside corners (fold the tape before applying)

6. **Apply first mud coat over tape** (2.5 hrs)
   - After the tape is set (~30 min), apply a thin skim coat of compound over all taped
     joints
   - Cover all screw heads with a single pass of compound
   - Don't worry about perfection — this is the first of three coats
   - **Tip:** Thinner coats dry faster and sand easier. Resist the urge to glob it on.
   - Clean all tools immediately — dried compound is awful to remove

> **End of Weekend 4 checkpoint:** All drywall is hung, taped, and has its first coat
> of compound. The room now looks like a room. Let everything dry completely through the
> week.

---

### 🗓️ Weekend 5: Drywall Finishing, Prime & Paint

**Goals:** Second and third mud coats, sanding, primer, two coats of paint

**Before this weekend:**
- Check that the first mud coat is fully dry (should be white, not gray)
- Buy or borrow a 150-watt clip light — hold it against the wall at a steep angle to
  reveal imperfections ("raking light" technique)

#### Saturday (Day 9) — ~8 hours

1. **Apply second mud coat** (2 hrs)
   - Use the 12″ taping knife for this coat — feather out 6–8″ beyond the first coat
   - This coat fills imperfections and builds up the smooth transition
   - Pay special attention to butt joints (where two non-tapered edges meet) — these
     need wider feathering

2. **Let dry + apply third coat** (2 hrs active, 2 hrs drying)
   - If using quick-set compound (45-minute or 90-minute), you can do the third coat today
   - If using regular compound, the second coat may take 4–6 hrs to dry in Portland's
     humidity (run a box fan to speed it up)
   - Third coat is a thin skim — just enough to fill any remaining imperfections
   - Use the raking light technique to check the surface

3. **Sand all dried compound** (2 hrs)
   - Use 120-grit sanding screen on a pole sander for flat areas
   - Use a sanding sponge (fine grit) for corners and detail areas
   - ⚠️ **This produces extreme amounts of fine dust.** Seal the interior door to the
     house with plastic sheeting and painter's tape. Wear your N95 mask. Open any
     windows or the new exterior door for ventilation.
   - Wipe all surfaces with a damp sponge after sanding to remove dust

#### Sunday (Day 10) — ~7 hours

4. **Prime all surfaces** (2 hrs)
   - Apply Kilz 2 with a roller (⅜″ nap for smooth walls) and brush for edges
   - Prime the ceiling first, then walls
   - One coat is sufficient unless you see bleed-through from tape or compound
   - Let dry 1 hour

5. **First coat of paint** (2 hrs)
   - Cut in the edges with a brush (ceiling line, corners, around outlets)
   - Roll the walls with a ⅜″ nap roller
   - Work in 4′-wide sections, maintaining a wet edge
   - **Tip:** For the ceiling, Rachel should use a flat-finish white (Behr Ultra flat,
     "Ultra Pure White"). For walls, eggshell finish in her chosen color hides minor
     drywall imperfections.

6. **Second coat of paint** (2 hrs)
   - Let the first coat dry 2–4 hours
   - Apply the second coat the same way
   - Two coats of Behr Ultra over Kilz primer gives excellent, durable coverage

7. **Clean up** (1 hr)
   - Remove painter's tape while paint is still slightly tacky (gives cleanest lines)
   - Wipe up any drips on the slab
   - Vacuum/sweep all sanding dust

> **End of Weekend 5 checkpoint:** The room is primed and painted. It looks like a
> finished room — just needs flooring and trim.

---

### 🗓️ Weekend 6: Flooring, Trim & Final Details

**Goals:** Install LVP flooring, baseboard trim, final electrical connections, punch list

**Before this weekend:**
- Acclimate the LVP flooring in the room for 48 hours (bring it in by Wednesday)
- Reserve the brad nailer for Saturday
- Schedule the final electrical inspection for the following week

#### Saturday (Day 11) — ~8 hours

1. **Prep the concrete slab** (1 hr)
   - Fill any cracks with concrete patch compound (DAP Concrete Patch)
   - Check for flatness with a long straightedge — LVP tolerates 3/16″ variance per 10′
   - If the slab has moisture issues (do the plastic-sheet test: tape a 2′×2′ piece of
     plastic to the slab for 24 hrs — if moisture collects, you need a moisture barrier),
     install 6-mil poly under the underlayment

2. **Install underlayment** (30 min)
   - Roll out the underlayment perpendicular to the direction you'll lay the planks
   - Butt seams together (don't overlap) and tape with underlayment tape

3. **Install LVP flooring** (5 hrs)
   - Start along the longest wall, working toward the entry door
   - Leave ¼″ expansion gap at all walls (use spacers)
   - Stagger end joints by at least 6″ between rows
   - Click-lock LVP is a familiar skill for Rachel — she's done this before
   - Cut planks with a utility knife (score and snap) or a miter saw for cleaner cuts
   - **Tip:** Lay out several rows dry (no clicking) to plan the stagger pattern and
     avoid narrow pieces at the far wall. If the last row would be less than 2″ wide,
     trim the first row to balance.

4. **Install transition strips** (30 min)
   - T-molding at the interior door to the house (if floor heights differ)
   - Threshold transition at the new exterior door

#### Sunday (Day 12) — ~7 hours

5. **Install baseboard trim** (3 hrs)
   - Measure and cut each piece with a miter saw (borrow or rent)
   - Use 45° miters at inside and outside corners
   - Attach with 18-gauge brad nails into the studs (use your stud finder)
   - Leave a 1/16″ gap above the floor for expansion
   - Caulk the top edge of baseboard where it meets the wall (DAP Alex Plus, paintable)

6. **Complete final electrical connections** (2 hrs)
   - Install all outlets and switches in their boxes
   - Wire the LED shop lights to the ceiling boxes
   - Install cover plates
   - Turn on the breakers and test EVERY outlet with a plug-in outlet tester ($8 at Home
     Depot — tests for correct wiring, ground, and polarity)
   - Test all light switches

7. **Punch list walkthrough** (1.5 hrs)
   - Walk the entire room with the raking light:
     - Touch up any paint nicks from trim installation
     - Caulk any gaps between trim and wall
     - Tighten any loose outlet covers
     - Check the door for smooth operation; adjust strike plate if needed
     - Verify all outlets work
     - Check for any flooring clicks or gaps
   - Clean the room thoroughly — vacuum, wipe surfaces, clean windows

> **End of Weekend 6 checkpoint:** The home office is complete. Schedule the final
> electrical inspection (Portland BDS, 503-823-7300). Once passed, the space is fully
> permitted and ready for occupancy.

---

## 🔌 Electrical Details: DIY vs. Professional

| Task | Who Should Do It | Why |
|---|---|---|
| Adding breakers to the main panel | **Licensed electrician** | Main panel work involves live bus bars at 200+ amps. This can kill you. Not a DIY task. |
| Installing a sub-panel (if needed) | **Licensed electrician** | Same reason — live panel work |
| Running Romex through walls | **Rachel (DIY)** | Straightforward with permits; she has basic electrical experience |
| Installing outlet and switch boxes | **Rachel (DIY)** | Nail-in boxes are simple; just follow code for box fill |
| Wiring outlets and switches | **Rachel (DIY)** | She's swapped outlets before; 20-amp outlets are the same process |
| Wiring light fixtures | **Rachel (DIY)** | Standard black/white/ground connections |
| Final circuit testing | **Rachel (DIY)** | Plug-in tester + voltage tester covers this |
| Final electrical inspection | **Portland BDS inspector** | Required by permit; they verify code compliance |

> 💡 **Cost note:** A licensed electrician to add two 20-amp breakers and run wire to the
> garage typically charges $200–$400 in Portland. If Rachel's panel is full or outdated
> (common in 1952 homes), a sub-panel installation runs $500–$800. This would push the
> project over budget — consider doing the panel work only and running all branch wiring
> yourself to save money.

---

## 🛑 When to Call a Professional

| Situation | Who to Call | Estimated Cost |
|---|---|---|
| Torsion spring garage door springs | Garage door company | $75–$150 |
| Main electrical panel work | Licensed electrician (OR CCB licensed) | $200–$800 |
| Structural concerns (sagging header, cracked foundation) | Structural engineer | $300–$500 for assessment |
| Asbestos suspicion (common in 1952 homes — check ceiling texture, old insulation, pipe wrap) | DEQ-certified abatement company | $200–$500 for testing; abatement varies |
| HVAC extension (if you want heating/cooling) | HVAC contractor | $800–$2,000 for a mini-split |
| Matching exterior siding | Siding contractor | $300–$500 for a small section |

> ⚠️ **Asbestos warning for 1952 homes:** Before disturbing ANY existing ceiling
> texture, insulation, or pipe wrapping, test for asbestos. Portland DEQ maintains a list
> of certified testing labs. A test kit costs ~$30 and results take 5–7 days. If positive,
> DO NOT disturb the material — hire certified abatement professionals.

---

## 🔧 Troubleshooting Common Issues

### Framing

| Problem | Solution |
|---|---|
| Studs are bowed | Install with the crown (bow) facing the same direction. Minor bows are hidden by drywall. If the bow is more than ¼″, return the stud and pick a straighter one. |
| Bottom plate won't stay flat on slab | Use construction adhesive AND tapcon screws. If the slab is very uneven, grind the high spots with an angle grinder (rental) or shim under the plate. |
| Door frame is out of plumb | Shim the hinge side until plumb. Re-drive screws. Check that the king studs are plumb first. |

### Electrical

| Problem | Solution |
|---|---|
| Outlet tester shows "open ground" | You forgot to connect the ground wire (bare copper) to the green screw on the outlet. Turn off the breaker, open the box, and connect it. |
| Breaker keeps tripping | You have too much load on one circuit, or there's a short. Disconnect all devices and reconnect one at a time. If it trips with nothing connected, you have a wiring error — inspect for pinched or nicked wire. |
| Can't find a stud with the stud finder | Calibrate the finder on a known empty section of wall. In older homes, studs may be irregularly spaced. Use a strong magnet to find drywall screws/nails as an alternative. |

### Drywall

| Problem | Solution |
|---|---|
| Tape is bubbling/peeling | Not enough compound under the tape, or air bubbles weren't pressed out. Pull off the tape, scrape the area, and re-tape with a thicker bed coat. |
| Cracks along taped joints | Usually from applying compound too thick. Sand it out, apply a thin coat, let dry fully, and recoat. If cracks keep returning, use fiberglass mesh tape instead of paper tape on that joint. |
| Visible screw heads after painting | You didn't dimple the screws enough, or you missed a coat of mud over them. Sand the paint lightly, apply compound, let dry, sand, re-prime, and repaint the spot. |
| Mud is taking forever to dry | Portland humidity. Run a dehumidifier or box fan in the room. Crack the door. Consider using 45-minute quick-set compound for intermediate coats. |

### Flooring

| Problem | Solution |
|---|---|
| LVP planks won't click together | Make sure you're angling the long side in at ~20° and pressing down. Check for debris in the locking channel. If the slab is uneven, the plank can't seat — check with a straightedge and address low spots with self-leveling compound. |
| Gaps appearing between planks | The room temperature fluctuated too much before the planks acclimated. Pull up the affected section and re-lay. Make sure the room has been conditioned (heated/cooled) for 48 hours before and during installation. |
| Flooring is buckling at edges | The expansion gap is too small or was filled with caulk/trim. Remove the baseboard, verify ¼″ gap, trim planks if needed. |

---

## ✅ Final Inspection Checklist

Use this checklist before calling for your final inspection and before declaring the
project complete:

### Structural
- [ ] All framing is secure — no loose studs or plates
- [ ] Door opens and closes smoothly, latch catches, deadbolt works
- [ ] Exterior wall is sheathed and weather-sealed
- [ ] No visible gaps between framing and existing structure

### Electrical
- [ ] All outlets tested with plug-in tester — correct wiring confirmed
- [ ] All light switches operate correctly
- [ ] All cover plates installed and tight
- [ ] Wire labels match panel directory
- [ ] No exposed wiring visible anywhere
- [ ] GFCI protection where required (check with inspector — may be needed if any
  outlets are within 6′ of a water source)

### Insulation & Vapor Barrier
- [ ] No visible gaps in insulation through any gaps in drywall
- [ ] Vapor barrier was installed on the warm side (interior)
- [ ] All penetrations sealed with expanding foam

### Drywall & Paint
- [ ] No visible tape, screws, or joints (check with raking light)
- [ ] Two coats of paint applied evenly, no drips or holidays (missed spots)
- [ ] Corners are straight and clean
- [ ] All nail pops addressed

### Flooring & Trim
- [ ] No loose or clicking planks — walk every square foot
- [ ] Expansion gaps present at all walls (hidden by baseboard)
- [ ] Baseboard is tight to walls, caulked at top
- [ ] Transition strips secure at doorways
- [ ] No visible brad nail heads (fill with paintable wood filler if needed)

### Safety & Compliance
- [ ] Smoke detector installed (required for habitable space — hardwired or battery)
- [ ] Carbon monoxide detector installed (required if gas appliances in home)
- [ ] Permits posted and visible for inspector
- [ ] All rough-in and final inspections passed and signed off

---

## 💡 Pro Tips from Experience

1. **Buy 10% extra drywall and 20% extra compound.** You will make mistakes. Having
   extra sheets means you can re-cut instead of trying to patch a bad piece. You will
   always use more compound than you think — the bucket empties fast around coat #3.

2. **Photograph everything before you close up the walls.** Every wire run, every stud
   location, every junction. Save them in a "House Records" folder. You'll need them
   the first time you want to hang a heavy shelf or run a new wire.

3. **Don't skip the panel lift rental for drywall.** This is the single best $60 you'll
   spend on this project. Trying to hang ceiling drywall without one is how backs get
   thrown out and marriages get tested.

4. **Run one extra circuit now, even if you don't need it.** Pulling wire while the walls
   are open costs almost nothing. Running a new circuit after the walls are closed means
   cutting open your beautiful new drywall. Rachel should add one extra outlet location
   for future use.

5. **Schedule inspections early in the week.** Portland BDS inspectors are busiest
   Thursday and Friday. A Monday request for a Wednesday inspection keeps your project
   on schedule.

6. **Portland-specific: check your home for lead paint.** A 1952 home almost certainly
   has lead paint somewhere. The garage conversion may not disturb it, but if you're
   scraping or sanding ANY original surfaces, use a 3M LeadCheck swab first.

7. **Don't rush the drywall finishing.** Thin coats that dry fully between applications
   produce 10× better results than thick coats that you sand aggressively. Three thin
   coats and light sanding beats two thick coats and heavy sanding every single time.

8. **The "weekend warrior" timeline is achievable but tight.** If a weekend gets rained
   out (hello, Portland) or an inspection doesn't pass, don't force it. It's better to
   add a 7th weekend than to rush through electrical or drywall work.

9. **Keep a cooler with drinks in the room.** Seriously. Staying hydrated and taking
   breaks every 90 minutes is how you avoid mistakes, injuries, and arguments with
   your spouse about whether that wall is actually plumb.

10. **When it's done, get it appraised.** A permitted garage-to-office conversion in
    Portland adds $15,000–$25,000 in home value. For $3,200 in materials and six
    weekends of sweat equity, that's an excellent return on investment.

---

*Generated by the DIY Project Sequencer agent team: **Handyman** (writer) →
**Sequencer** (grader, 47 → 91) → **SafetyOfficer** (updater). Two rounds, final
score 91/100.*
