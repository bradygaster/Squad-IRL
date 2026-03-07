# Iep Goal Writer

> Write measurable IEP goals that meet compliance and support student growth

## Who This Is For

🏫 Teachers/SPED

## The Team

| Agent | Role | What They Do |
|-------|------|-------------|
| SpecialEdExpert | Writer | Domain expert for iep goal writer |
| ComplianceChecker | Grader | Domain expert for iep goal writer |
| GoalCrafter | Updater | Domain expert for iep goal writer |

## How It Works

1. **Write** — SpecialEdExpert reads `spec.md` and produces the first draft
2. **Grade** — ComplianceChecker evaluates the output (1-100 score)
3. **Update** — If score < 90%, GoalCrafter improves the output
4. **Repeat** — Loop continues until quality threshold is met

## See It In Action

Here's what the agent team produced for Jayden's 4th grade IEP (dyslexia + ADHD):

> **Goal 1**: Decode 20 multisyllabic words (3-4 syllables) with 80% accuracy across 4/5 trials by March 2025. **Baseline**: 45% accuracy. **Method**: Bi-weekly CORE Phonics assessments. **Supports**: Wilson Reading, syllable division strategies. Includes short-term objectives, progress monitoring schedule, and accommodations. ✅ SMART, compliant, measurable.

> 📄 **[See the full example output →](examples/sample-output.md)**

## Running This Sample

```bash
npm install
npm start
```

## Output

Results are saved in the `output/` directory.
