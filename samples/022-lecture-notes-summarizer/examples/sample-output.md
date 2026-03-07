# Lecture Notes Summarizer — Example Output

> This is what the agent team produces when you run this sample.

## Scenario

Marcus Thompson is a sophomore at UCLA taking Cognitive Psychology (Psych 120B). He's a decent student but his lecture notes are chaotic — half-finished sentences, random margin doodles, key concepts buried in tangents. Midterms are in 6 days. He has 47 pages of messy handwritten notes from 8 weeks of lectures on memory, attention, and perception. He needs organized study material FAST or he's failing this exam.

## What the Agents Did

### Round 1: First Draft

**Librarian** produced:

**PSYCH 120B LECTURE NOTES SUMMARY**

**Week 1-2: Introduction to Memory Systems**
Memory can be divided into sensory memory, short-term memory, and long-term memory. Sensory memory lasts milliseconds. Short-term memory lasts seconds to minutes and has limited capacity (about 7 items). Long-term memory can last years or permanently. Different brain regions are involved in different types of memory. The hippocampus is important for forming new memories. Key experiments include the case of H.M., who couldn't form new memories after hippocampus removal.

**Week 3-4: Attention and Perception**  
Attention is selective focus on specific stimuli. We can't pay attention to everything at once. Perception involves interpreting sensory information. The Stroop effect demonstrates interference. Change blindness shows we don't notice everything...

**ConceptExtractor** scored it **71/100** and found:

- Missing the critical distinction between declarative and procedural memory that Professor Kim emphasized three times (and will definitely be on the exam)
- No mention of Atkinson-Shiffrin model by name even though Marcus drew the three-box diagram in his notes
- The H.M. case is mentioned but without the key detail that he could still learn motor skills (procedural memory intact) — this is the lynchpin concept for understanding memory dissociation
- "About 7 items" is vague — should be "7±2 items (Miller's Law)" which was explicitly called out as exam material
- Week 3-4 section is thin and doesn't include the key experiments (Posner's spatial cueing, Treisman's feature integration theory) that Marcus underlined in his notes
- No practice questions or self-test material to help Marcus verify he understands the concepts

### Round 2: Improved Draft

**QuizMaker** restructured the notes into active learning format:

Split content into clear conceptual hierarchies with memory systems properly distinguished (declarative: semantic + episodic; procedural: motor skills + conditioning). Added the Atkinson-Shiffrin model diagram with proper labels (sensory → STM → LTM with attention and rehearsal processes). Expanded H.M. case to highlight the dissociation: couldn't remember meeting the doctor (declarative failed) but could learn mirror-drawing task (procedural intact) — proving these are separate systems. Added specific experiments with testable details (Posner's cueing paradigm: invalid cues = 100ms slower responses). Created 15 practice questions matching Professor Kim's exam style (mix of definitions, application scenarios, and experiment interpretations). Added memory aids: "SPAM = Semantic, Procedural, Attention, Motor" mnemonic that Marcus can actually use during the exam.

**ConceptExtractor** scored it **94/100**: "Comprehensive concept extraction with clear hierarchy. Practice questions are well-targeted. Includes testable details and exam-relevant mnemonics. Meets quality threshold."

## Final Output

---

# PSYCH 120B: COGNITIVE PSYCHOLOGY  
**Organized Study Notes — Midterm Exam Prep**

**Professor:** Dr. Janet Kim  
**Exam Date:** October 19, 2023  
**Coverage:** Weeks 1-8 (Memory, Attention, Perception)  
**Exam Format:** 40 multiple choice, 3 short answer, 1 essay

---

## TABLE OF CONTENTS

1. [Memory Systems](#memory-systems)
2. [Encoding and Retrieval](#encoding-and-retrieval)
3. [Attention Mechanisms](#attention-mechanisms)
4. [Perception and Recognition](#perception-and-recognition)
5. [Key Experiments (Know These!)](#key-experiments)
6. [Practice Questions](#practice-questions)
7. [Quick Reference Sheet](#quick-reference-sheet)

---

## MEMORY SYSTEMS

### The Big Picture: Three Memory Types

```
DECLARATIVE (explicit)          PROCEDURAL (implicit)
"Knowing THAT"                  "Knowing HOW"
├─ Semantic: Facts              ├─ Motor skills
│  (Paris is capital of France) │  (riding a bike)
└─ Episodic: Events             └─ Classical conditioning
   (your 10th birthday)            (Pavlov's dogs)

Brain: Hippocampus + cortex     Brain: Basal ganglia + cerebellum
Can verbalize: YES              Can verbalize: NO
```

**Why this matters for the exam:** Prof. Kim said memory dissociation (declarative vs. procedural) will be a short-answer question. Know H.M. case cold.

---

### Atkinson-Shiffrin Model (1968) — THE Core Framework

```
SENSORY MEMORY → SHORT-TERM MEMORY → LONG-TERM MEMORY
(milliseconds)    (seconds-minutes)    (years-lifetime)

Key processes:
• ATTENTION: gates sensory → STM
• REHEARSAL: maintains info in STM
• ENCODING: transfers STM → LTM
• RETRIEVAL: brings LTM back to STM
```

**Sensory Memory:**
- **Iconic memory** (visual): 250-500ms duration
- **Echoic memory** (auditory): 3-4 seconds duration
- Capacity: HUGE (everything you sense)
- Function: Brief buffer while attention decides what to keep

**Short-Term Memory (STM) / Working Memory:**
- **Duration:** 15-30 seconds without rehearsal
- **Capacity:** 7±2 items (Miller's Law, 1956) ← EXAM ALERT: Know this number!
- **Chunking:** Grouping items to increase effective capacity
  - Example: "FBICIANBA" is 9 letters, but "FBI CIA NBA" is 3 chunks
- **Working memory model** (Baddeley & Hitch, 1974):
  - Central executive (attention control)
  - Phonological loop (verbal info)
  - Visuospatial sketchpad (visual info)
  - Episodic buffer (integrates info)

**Long-Term Memory (LTM):**
- **Duration:** Potentially permanent
- **Capacity:** Effectively unlimited
- **Forgetting:** Interference, not capacity limits
  - Proactive interference: Old memories disrupt new ones
  - Retroactive interference: New memories disrupt old ones

---

### The H.M. Case — KNOW THIS FOR THE EXAM

**Patient H.M. (Henry Molaison, 1926-2008)**

**What happened:**
- Age 27 (1953): Severe epilepsy surgery removed hippocampus bilaterally
- Result: Profound anterograde amnesia (couldn't form new long-term memories)
- Worked normally with new info for ~30 seconds, then forgot completely

**What he COULD do (procedural memory intact):**
- ✅ Learn mirror-drawing task: Got faster over 3 days, but denied ever doing it before
- ✅ Learn Tower of Hanoi puzzle: Improved performance without remembering practice
- ✅ Priming effects: Completed word fragments faster after exposure

**What he COULDN'T do (declarative memory lost):**
- ❌ Remember meeting the same doctor daily for years
- ❌ Learn new vocabulary (words invented after 1953)
- ❌ Form new episodic memories (what he ate for breakfast)

**THE KEY INSIGHT:** Hippocampus is necessary for declarative memory but NOT procedural memory. This proves they're separate systems using different brain regions.

**Prof. Kim's exam hint:** "If I ask you to explain memory dissociation, H.M. is your golden ticket. Talk about what he could vs. couldn't learn and why."

---

## ENCODING AND RETRIEVAL

### Levels of Processing (Craik & Lockhart, 1972)

**Shallow processing → Poor memory:**
- Structural: "Is the word in capital letters?" → 20% recall
- Phonemic: "Does the word rhyme with 'cat'?" → 50% recall

**Deep processing → Strong memory:**
- Semantic: "Does the word fit in this sentence?" → 85% recall
- Self-referential: "Does this word describe you?" → 90% recall

**Exam tip:** If a question asks how to improve memory for studying, answer = "semantic processing" or "elaborative rehearsal" (connecting new info to existing knowledge).

---

### Encoding Specificity Principle

**Memory retrieval is best when context matches encoding context.**

**Key experiment:** Godden & Baddeley (1975) — Scuba divers study
- Learn words underwater → Test underwater: 40% recall
- Learn words underwater → Test on land: 25% recall
- Learn words on land → Test on land: 38% recall
- Learn words on land → Test underwater: 24% recall

**Implication:** Study in a similar environment to where you'll be tested. Marcus, this means study in a quiet classroom-like setting, not your loud dorm with music playing.

**State-dependent memory:** Also applies to internal states (mood, drug state, arousal level). If you study exhausted at 2am, you'll recall better if exhausted during exam (but please don't do this).

---

## ATTENTION MECHANISMS

### Selective Attention Models

**Early Selection (Broadbent, 1958):**
- Filter happens BEFORE processing meaning
- Only physical features (pitch, location) determine what gets through
- Problem: Doesn't explain "cocktail party effect" (hearing your name across the room)

**Late Selection (Deutsch & Deutsch, 1963):**
- Filter happens AFTER processing meaning
- Everything is analyzed, but only some reaches awareness
- Problem: Wasteful — why process everything if you ignore most?

**Attenuation Model (Treisman, 1964):** ← Prof. Kim's favorite
- Middle ground: Unattended info is attenuated (turned down), not blocked
- Explains cocktail party effect: "Mom" or "Fire!" have low thresholds, break through easily
- This is the answer if exam asks "which attention model is most accepted"

---

### Visual Attention — Feature Integration Theory (Treisman & Gelade, 1980)

**Two stages of visual processing:**

**Stage 1: Preattentive (parallel processing)**
- Simple features (color, orientation, size) processed automatically across entire visual field
- FAST, effortless, unlimited capacity
- Example: Finding a red X among blue Xs = instant ("pop-out effect")

**Stage 2: Focused attention (serial processing)**
- Combining features requires attention to each object one-by-one
- SLOW, effortful, limited capacity
- Example: Finding a red X among red Os and blue Xs = slow search

**Illusory conjunctions:** Without attention, features can be miscombined (see blue triangle + red square, report "red triangle"). Proves features are initially separate and need attention to bind.

**Exam question pattern:** If they show a visual search task, ask yourself: "Do I need to combine features?" YES = serial search, NO = parallel pop-out.

---

### Posner's Spatial Cueing Paradigm (1980)

**Setup:**
1. Fixate on center cross
2. Cue appears (arrow pointing left or right)
3. Target appears (either where cue pointed or opposite side)
4. Press button as fast as possible

**Results:**
- **Valid cue** (80% of trials): Target where expected → 250ms reaction time
- **Invalid cue** (20% of trials): Target opposite side → 350ms reaction time
- **Cost of invalid cue:** 100ms slower (attention was in wrong place, had to reorient)

**What this proves:** Attention can be directed to locations in space BEFORE anything appears there. Attention is like a spotlight that can move independently of where you're looking.

**Prof. Kim emphasized:** This is "covert attention" (attention without eye movement) — different from "overt attention" (moving your eyes).

---

## PERCEPTION AND RECOGNITION

### The Stroop Effect (1935) — CLASSIC EXPERIMENT

**Task:** Name the INK COLOR (ignore the word)

RED (printed in blue ink) → You say "blue" (but it's HARD, takes longer)  
BLUE (printed in blue ink) → You say "blue" (EASY, automatic)

**Why this happens:**
- Reading is automatic for skilled readers (you can't NOT read)
- Color naming requires controlled processing
- Automatic process (reading) interferes with controlled process (color naming)

**Exam relevance:** Example of automaticity vs. controlled processing. Automatic processes are fast, parallel, require no attention. Controlled processes are slow, serial, require attention.

---

### Change Blindness — We Don't See Everything

**Definition:** Failure to detect large changes in a visual scene when change occurs during brief disruption.

**Famous demo:** Person asks for directions, workers carry door between you, person switches places with different person during occlusion → 50% of people don't notice different person!

**What this shows:**
- We have illusion of rich, detailed visual perception
- Reality: We only consciously perceive small part of visual field
- Attention is necessary to encode changes into memory

**Inattentional blindness:** Related phenomenon — fail to see unexpected objects when attention is focused elsewhere (invisible gorilla video).

---

## KEY EXPERIMENTS (KNOW THESE!)

| Experiment | Researcher(s) | Year | What It Showed | Exam Keyword |
|------------|---------------|------|----------------|--------------|
| **Patient H.M.** | Scoville & Milner | 1957 | Hippocampus necessary for declarative memory | Memory dissociation |
| **7±2 items** | George Miller | 1956 | STM capacity limit | Miller's Law |
| **Levels of processing** | Craik & Lockhart | 1972 | Deep processing = better memory | Semantic encoding |
| **Diver study** | Godden & Baddeley | 1975 | Context-dependent memory | Encoding specificity |
| **Attenuation model** | Anne Treisman | 1964 | Unattended info attenuated, not blocked | Cocktail party effect |
| **Feature integration** | Treisman & Gelade | 1980 | Attention binds features | Visual search |
| **Spatial cueing** | Michael Posner | 1980 | Covert attention to locations | Attention spotlight |
| **Stroop effect** | John Ridley Stroop | 1935 | Automatic vs. controlled processing | Reading automaticity |

**Prof. Kim's study tip:** "Know the researcher names. I will ask 'Who demonstrated that attention can be directed covertly?' Answer: Posner."

---

## PRACTICE QUESTIONS

### Section 1: Memory Systems (Know Your Distinctions!)

**Q1:** Patient R.M. suffered damage to his basal ganglia. Which of the following abilities would be MOST impaired?
- A) Remembering what he ate for breakfast
- B) Recalling the capital of France
- C) Learning to ride a unicycle
- D) Recognizing his daughter's face

**Answer:** C — Basal ganglia supports procedural memory (motor skills). R.M. would struggle with new motor learning but declarative memory (A, B) and recognition (D) would be intact.

---

**Q2:** A participant studies a list of words and is tested immediately. She recalls 8 words from the beginning of the list and 7 from the end, but only 3 from the middle. This demonstrates:
- A) Levels of processing
- B) Serial position effect
- C) Encoding specificity
- D) Proactive interference

**Answer:** B — Serial position effect (primacy + recency effects). Beginning words made it to LTM (primacy), end words still in STM (recency), middle words got squeezed out.

---

**Q3:** Which statement about the Atkinson-Shiffrin model is FALSE?
- A) Rehearsal maintains information in short-term memory
- B) Sensory memory has unlimited capacity
- C) Attention is required to transfer information from sensory to STM
- D) Long-term memory has a capacity of approximately 7±2 items

**Answer:** D — FALSE! LTM has unlimited capacity. The 7±2 limit is for STM (Miller's Law). This is a common trap question.

---

### Section 2: Attention (Spotlight or Attenuation?)

**Q4:** You're at a loud party focused on your conversation. Suddenly you hear your name spoken across the room and turn toward it. This is best explained by:
- A) Broadbent's early selection filter
- B) Treisman's attenuation model
- C) Posner's spatial cueing paradigm
- D) Feature integration theory

**Answer:** B — Treisman's attenuation model explains cocktail party effect. Unattended info (conversation across room) is attenuated (not blocked), and your name has low threshold so it breaks through to awareness.

---

**Q5:** In a visual search task, you must find a green T among green Os and red Ts. This will likely involve:
- A) Parallel processing (pop-out)
- B) Serial processing (item-by-item)
- C) Iconic memory search
- D) Echoic memory search

**Answer:** B — Serial processing. You need to conjoin two features (green + T-shape), which requires focused attention to each item. Feature integration theory says conjoining features is serial.

---

**Q6:** Posner's cueing experiment showed that when a cue is INVALID (target appears in unexpected location):
- A) Participants respond 100ms slower than valid cue trials
- B) Participants cannot detect the target at all
- C) Participants respond faster due to heightened alertness
- D) Participants show illusory conjunctions

**Answer:** A — 100ms cost for invalid cues (attention was in wrong place, had to reorient). This proves attention can be allocated to spatial locations before stimuli appear.

---

### Section 3: Perception (What We See vs. What We Think We See)

**Q7:** In the Stroop task, naming the ink color is SLOWER when:
- A) The word and color match
- B) The word and color mismatch
- C) The word is in a foreign language
- D) The ink is black

**Answer:** B — Mismatch (word "RED" in blue ink) creates interference. Automatic process (reading) conflicts with controlled process (color naming), slowing response time.

---

**Q8:** Change blindness demonstrates that:
- A) Our visual perception is richer and more detailed than we realize
- B) We consciously perceive only a small portion of the visual field
- C) Iconic memory lasts longer than echoic memory
- D) Procedural memory is more robust than declarative memory

**Answer:** B — Change blindness shows we DON'T see everything (even large changes). We have illusion of complete perception, but attention is required to encode details.

---

### Section 4: Encoding and Retrieval (It's All About Context)

**Q9:** According to levels of processing theory, which study technique would produce the BEST memory?
- A) Reading the chapter 3 times
- B) Highlighting key terms in yellow
- C) Creating a song with the material
- D) Explaining how the concepts relate to your own life

**Answer:** D — Self-referential processing (deepest level). Relating material to yourself creates semantic connections, leading to strongest encoding.

---

**Q10:** Godden & Baddeley's scuba diver study supports:
- A) State-dependent memory
- B) Encoding specificity principle
- C) Proactive interference
- D) Feature integration theory

**Answer:** B — Encoding specificity: Memory is best when retrieval context matches encoding context (underwater study → underwater test = best recall).

---

### Section 5: Short Answer Practice (Write 3-5 sentences)

**Q11:** Explain how the case of patient H.M. demonstrates that declarative and procedural memory are separate systems. Give specific examples of what H.M. could and could not do.

**Strong answer:** Patient H.M. had bilateral hippocampus removal, resulting in severe anterograde amnesia for declarative memory (couldn't remember meeting his doctor, learning new vocabulary, or what he ate for breakfast). However, his procedural memory remained intact — he successfully learned the mirror-drawing task and Tower of Hanoi puzzle, improving over days despite having no conscious memory of previous practice. This dissociation (impaired declarative but intact procedural) proves these systems use different brain regions: hippocampus for declarative, basal ganglia/cerebellum for procedural.

---

**Q12:** Compare and contrast Broadbent's early selection and Treisman's attenuation models of attention. Which better explains the cocktail party effect and why?

**Strong answer:** Broadbent proposed early selection: sensory information is filtered based on physical features before semantic processing, so unattended information is completely blocked. Treisman's attenuation model instead proposes unattended information is attenuated (reduced) but still processed semantically, with important stimuli (like your name) having low thresholds to break through. Treisman's model better explains the cocktail party effect — you can suddenly notice your name in an unattended conversation because it wasn't completely filtered out, just turned down. Broadbent's early filter can't explain this since meaning wouldn't be processed at all.

---

**Q13:** Describe Feature Integration Theory and explain why finding a red X among blue Xs is fast (parallel) but finding a red X among red Os and blue Xs is slow (serial).

**Strong answer:** Treisman's Feature Integration Theory proposes two stages: (1) preattentive parallel processing automatically detects simple features (color, shape) across the entire visual field, and (2) focused serial attention is required to combine features into objects. Finding a red X among blue Xs is fast because it only requires detecting a single feature (red color) that "pops out" via parallel processing. Finding a red X among red Os and blue Xs requires conjoining two features (red + X-shape), which demands serial attention to each item individually, making search slow and effortful.

---

## QUICK REFERENCE SHEET (Memorize This!)

### Memory Numbers to Know:
- **Sensory memory duration:** 250-500ms (iconic), 3-4 sec (echoic)
- **STM duration:** 15-30 seconds without rehearsal
- **STM capacity:** 7±2 items (Miller's Law)
- **LTM capacity:** Unlimited

### Brain Regions:
- **Hippocampus** → Declarative memory (facts, events)
- **Basal ganglia** → Procedural memory (motor skills)
- **Cerebellum** → Motor coordination, procedural learning

### Key Distinctions:
- **Declarative** = conscious, can verbalize ("knowing THAT")
- **Procedural** = unconscious, can't verbalize ("knowing HOW")
- **Episodic** = personal events ("your 10th birthday")
- **Semantic** = facts ("Paris is capital of France")
- **Automatic processing** = fast, parallel, no attention (reading)
- **Controlled processing** = slow, serial, requires attention (problem-solving)

### Models You Must Know:
1. **Atkinson-Shiffrin** (1968) — Sensory → STM → LTM with attention/rehearsal
2. **Treisman's Attenuation** (1964) — Unattended info attenuated, not blocked
3. **Levels of Processing** (Craik & Lockhart, 1972) — Deeper = better memory
4. **Feature Integration** (Treisman & Gelade, 1980) — Preattentive → Focused attention

### Exam Buzzwords:
- "Memory dissociation" → Talk about H.M.
- "Cocktail party effect" → Treisman's attenuation
- "7±2" → Miller's Law, STM capacity
- "Encoding specificity" → Context matching (diver study)
- "Pop-out effect" → Feature integration, single feature search
- "Illusory conjunction" → Features miscombined without attention

---

## STUDY SCHEDULE (6 Days to Exam)

**Day 1 (Today):** Read through entire study guide once, highlight anything confusing  
**Day 2:** Memorize Quick Reference Sheet, do Practice Questions 1-5  
**Day 3:** Deep dive on Memory Systems section, do Practice Questions 6-10  
**Day 4:** Deep dive on Attention + Perception, do short answer questions  
**Day 5:** Review all wrong answers, make flashcards for weak areas  
**Day 6 (Day before exam):** Quick review of Quick Reference Sheet, get good sleep

**DON'T:** Cram the night before. Sleep is critical for memory consolidation (that's literally what we learned in Week 5).

---

Good luck, Marcus! You've got this. 🧠
