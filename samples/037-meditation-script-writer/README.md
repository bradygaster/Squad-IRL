# Meditation Script Writer

> Generate custom guided meditation scripts for specific needs

## Who This Is For

🏃 Health/Wellness

## The Team

| Agent | Role | What They Do |
|-------|------|-------------|
| MindfulnessGuide | Writer | Domain expert for meditation script writer |
| VoiceCoach | Grader | Domain expert for meditation script writer |
| IntentionSetter | Updater | Domain expert for meditation script writer |

## How It Works

1. **Write** — MindfulnessGuide reads `spec.md` and produces the first draft
2. **Grade** — VoiceCoach evaluates the output (1-100 score)
3. **Update** — If score < 90%, IntentionSetter improves the output
4. **Repeat** — Loop continues until quality threshold is met

## See It In Action

Rachel has never meditated and finds "clearing her mind" intimidating. The agents wrote a full 15-minute script with 4-7-8 breathing, a progressive body scan from feet to head, and a lake visualization — complete with [pause] timing markers and voice pacing notes. No crystals required.

> 📄 **[See the full example output →](examples/sample-output.md)**

## Running This Sample

```bash
npm install
npm start
```

## Output

Results are saved in the `output/` directory.
