# Grandkid Gift Finder

> Suggest age-appropriate gifts for grandchildren based on trends and interests

## Who This Is For

👵 Seniors

## The Team

| Agent | Role | What They Do |
|-------|------|-------------|
| GiftExpert | Writer | Domain expert for grandkid gift finder |
| TrendWatcher | Grader | Domain expert for grandkid gift finder |
| AgeAppropriateFilter | Updater | Domain expert for grandkid gift finder |

## How It Works

1. **Write** — GiftExpert reads `spec.md` and produces the first draft
2. **Grade** — TrendWatcher evaluates the output (1-100 score)
3. **Update** — If score < 90%, AgeAppropriateFilter improves the output
4. **Repeat** — Loop continues until quality threshold is met

## See It In Action

> From generic "LEGO set - $59.99" to a curated gift guide for an 11-year-old: Top pick is the LEGO Minecraft Deep Dark Battle set ($64.99, 584 pieces, 2-3 hour build-together activity). Runner-up is Sphero BOLT+ coding robot ($74.99) addressing his "really into coding now" interest. Includes what to avoid (Minecraft t-shirts are "too babyish for middle school"), where to buy in Sacramento, and summer bonding activities for each gift.

📄 **[See the full example output →](examples/sample-output.md)**

## Running This Sample

```bash
npm install
npm start
```

## Output

Results are saved in the `output/` directory.
