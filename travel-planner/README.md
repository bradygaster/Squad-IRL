# Travel Planner — A Squad of Travel Experts

Trip planning sucks. You're bouncing between Google Maps, TripAdvisor, Booking.com, Reddit threads, and your friend's cousin's blog. Visa requirements, flight connections, neighborhood vibes, whether that $200 hotel is worth it — it's fragmented, exhausting, and you're never sure you're making the right calls.

**This sample shows what happens when you stop asking one LLM and instead assemble a real team of travel specialists that actually talk to each other.**

Tell them: *"Plan my 5-day trip to Guam, budget $3000, I love hiking and local food"* — and watch them collaborate.

## The Team

The Travel Planning Squad has five specialists. They each own their domain, but they coordinate:

- **Research** — Knows destinations cold: culture, visa rules, safety, seasons, what to pack
- **Flights** — Finds flight routes, explains connection strategies, balances price vs. time
- **Lodging** — Matches neighborhoods to your style, explains tradeoffs, suggests booking tactics
- **Activities** — Curates experiences, builds day plans, finds hidden gems, handles logistics
- **Budget** — Tracks spending, finds money-saving moves, ensures you're on track

## Get Started

```bash
npm install
npx squad build
```

Open this folder in GitHub Copilot (VS Code or CLI), then talk to them:

```
"Plan my 5-day trip to Guam, budget $3000, I love hiking and local food"
```

Or ask specific questions:

```
"What neighborhoods in Tokyo should I look at for 3 nights? Family-friendly but walkable"
"I have $800 for flights from NYC to Tokyo in April. What are my realistic options?"
"Create a day plan for Barcelona: food-focused, morning to evening, skip the crowds"
```

## What Happens Inside

**You don't get a chatbot answering generic questions.** You get a *team*:

- **Research** starts by outlining what you need to know about the destination
- **Lodging** suggests neighborhoods that match your vibe and budget
- **Flights** recommends strategies based on realistic prices and schedules
- **Activities** builds a multi-day itinerary that actually flows (no zigzagging across town)
- **Budget** runs the numbers, flags if you're on track, suggests optimizations

Each agent uses real knowledge (web search) to inform decisions. They see each other's work and adjust. It's not a pipeline — it's a conversation.

## Example Interactions

### "I want to go somewhere warm and cheap for 7 days in January with $2500"

**Research** gathers options (Caribbean, Central America, Southeast Asia seasonality). **Budget** validates feasibility. **Flights** finds the best routing from your home airport. **Lodging** suggests neighborhoods that fit the budget. **Activities** builds realistic day plans with free options.

Result: A coherent plan—not a list of suggestions.

### "We're planning a family trip to Costa Rica. 2 kids, ages 6 and 10"

**Research** flags health/passport needs. **Lodging** finds family-friendly places with kitchens. **Activities** suggests activities that work for both kids (no 3-hour museums). **Flights** optimizes for non-stop when possible. **Budget** ensures you're not overspending on things kids won't care about.

### "I'm vegetarian, I love architecture, and I have exactly $100/day for food and activities"

**Activities** focuses on museums, walking tours, food markets. **Budget** validates the number and suggests free sites, happy hours, market meals. **Lodging** picks neighborhoods known for vegetarian restaurants and architectural richness.

## What Makes This Squad

This isn't a chatbot with five knowledge domains. It's the **SDK approach**: each agent is a specialist with its own charter, expertise, and responsibility. They:

- **Route queries** to the right person (flight questions go to @flights, not to research)
- **Collaborate** when the question needs multiple perspectives
- **Persist context** across the conversation—they remember your budget, your interests, earlier decisions
- **Coordinate** so lodging in a remote area ties back to flight options, and budget recalculates automatically

You describe a *human problem* (I want to go somewhere, but I don't know where). They solve it as a *team*. That's the difference between "Ask an LLM about travel" and "Use a squad of travel experts."

## Built With Squad SDK

This sample uses `@bradygaster/squad-sdk` to define the squad in code. The `squad.config.ts` file declaratively defines:

- Agents (who they are, what they know, how they think)
- Routing (how queries reach the right specialist)
- Collaboration rules (when they talk to each other)
- Ceremonies (sync meetings for complex trips)

No prompt engineering, no fragile prompt injection. Just well-defined experts doing what they're chartered to do.

## Try It

```bash
npm install
npx squad build
# Open in Copilot
```

Then ask for a real trip. The squad will handle it.
