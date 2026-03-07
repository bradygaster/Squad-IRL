# Packing List Generator

> Custom packing lists based on destination, duration, weather, and activities

## Who This Is For

✈️ Travelers

## The Team

| Agent | Role | What They Do |
|-------|------|-------------|
| TravelPro | Writer | Domain expert for packing list generator |
| WeatherAnalyst | Grader | Domain expert for packing list generator |
| MinimalistCoach | Updater | Domain expert for packing list generator |

## How It Works

1. **Write** — TravelPro reads `spec.md` and produces the first draft
2. **Grade** — WeatherAnalyst evaluates the output (1-100 score)
3. **Update** — If score < 90%, MinimalistCoach improves the output
4. **Repeat** — Loop continues until quality threshold is met

## See It In Action

**Emma is going to Tokyo for 10 days (3 work, 7 sightseeing) and is a chronic over-packer.** The agents created a carry-on-only packing list with weather-specific details (November Tokyo: 50-60°F, needs layers), outfit matrix showing 8 items = 12+ outfits, and Tokyo-specific essentials (compact umbrella, yen cash, Suica card). **The result: complete packing strategy with exactly what to pack, what to skip, and how to do laundry mid-trip.**

> 📄 **[See the full example output →](examples/sample-output.md)**

## Running This Sample

```bash
npm install
npm start
```

## Output

Results are saved in the `output/` directory.
