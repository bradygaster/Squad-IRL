# Travel Planner — Squad Multi-Agent Sample

A self-contained TypeScript demo that plans a 5-day trip to Tokyo for 2 people
on a $4,000 budget. Five specialised agents collaborate to produce an optimised
itinerary in your terminal.

## Quick Start

```bash
npm install && npm start
```

## How It Works

The planner runs five agents in sequence. Each agent solves one part of the
problem and passes its output to the next, forming a constraint-satisfaction
pipeline.

### The Five Agents

| # | Agent | Responsibility |
|---|-------|---------------|
| 1 | **Flight Agent** ✈️ | Scores every flight option on price, duration, and stops using weighted normalisation, then selects the best value. |
| 2 | **Hotel Agent** 🏨 | Evaluates hotels on nightly rate, guest rating, and geographic proximity to the top 5 attractions (computed via Haversine distance). Picks the best option that fits the remaining budget. |
| 3 | **Activity Agent** 🎌 | Clusters 15+ real Tokyo activities by geographic proximity so each day visits a tight neighbourhood. Respects opening hours and calculates inter-activity travel time from Haversine distances. |
| 4 | **Budget Agent** 💰 | Aggregates all costs (flights, hotel, activities, meals, transport), visualises spend with bar charts, and suggests swaps if the plan exceeds the budget. |
| 5 | **Itinerary Agent** 📋 | Assembles the final day-by-day schedule. Applies nearest-neighbour route optimisation within each day, inserts meal breaks, and renders a visual distance map between stops. |

### Multi-Constraint Optimisation

The system satisfies four constraints simultaneously:

1. **Budget** — total spend ≤ $4,000 for 2 travellers across 5 days.
2. **Geography** — daily activities are clustered to minimise transit time,
   verified by real Haversine distance calculations between Tokyo landmarks.
3. **Time** — each day's schedule respects opening hours and includes realistic
   travel time (estimated at 30 km/h average Tokyo transit speed).
4. **Preference** — activities are weighted toward the travellers' interests
   (culture, food, technology, nature).

### Technical Highlights

- **Haversine formula** for accurate great-circle distance between GPS
  coordinates of 15 real Tokyo landmarks.
- **Nearest-neighbour heuristic** to order each day's stops and reduce total
  walking/transit distance.
- **Weighted multi-criteria scoring** for flights and hotels so the "best"
  option balances price against quality.
- **ANSI colour output** with simulated agent delays for a realistic
  collaborative feel.

## Project Structure

```
travel-planner/
├── index.ts          # All agent logic (self-contained, no external deps)
├── package.json
├── tsconfig.json
└── README.md
```

## Requirements

- Node.js 18+
- No API keys or network access required — all data is built-in.
