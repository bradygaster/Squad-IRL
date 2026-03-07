# Travel Planner — Interactive LLM Sample

This sample prompts for a real trip, calls an OpenAI-compatible LLM for destination-specific data, and assembles a multi-agent itinerary tailored to the traveler.

## Quick Start

```bash
npm install
npm start
```

The app will ask:
- Where are you going?
- How many days?
- How many travelers?
- What's your budget?
- What are your interests?

## Environment Setup

Set an API key before running:

```bash
export OPENAI_API_KEY="your-key"
```

Optional overrides:
- `OPENAI_BASE_URL` (defaults to `https://api.openai.com/v1`)
- `OPENAI_MODEL` (defaults to `gpt-4o-mini`)

This works with OpenAI, Azure OpenAI, Ollama, or any OpenAI-compatible endpoint. For Ollama, set `OPENAI_BASE_URL=http://localhost:11434/v1`.

## How It Works

The planner makes 3–4 focused LLM calls and then runs a five-agent pipeline:

1. **Flight Agent** — Weighted scoring across price, duration, and stops.
2. **Hotel Agent** — Haversine proximity scoring to top landmarks.
3. **Activity Agent** — Clusters activities by geography and respects opening hours.
4. **Budget Agent** — Aggregates costs and visualizes spend with ASCII bars.
5. **Itinerary Agent** — Builds a morning/afternoon/evening schedule with meal picks, transit hints, and local tips.

## Output Highlights

- “Why this destination” summary
- Day-by-day schedule with morning/afternoon/evening sections
- Restaurant recommendations for each meal
- Transit directions between stops
- Local tips and “don’t miss” highlights
- Weather guidance, packing tips, and useful local phrases
- Budget breakdown with a bar chart

## Requirements

- Node.js 18+
- An OpenAI-compatible API key for live destination data
