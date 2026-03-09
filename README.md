# Squad IRL

> A community-driven collection of real-world automation samples built with Squad agent teams. Non-technical people design them. AI builds them. Anyone can learn from them.

## What Is This?

Tired of automation being hard? Squad makes it simple. This repo contains 20 working samples showing how Squad agent teams solve everyday problems — no coding required.

Each sample is a **self-contained TypeScript project** with a team of AI agents. All you do is describe your problem in plain English, and Squad builds the code. No API keys. No boilerplate. Real algorithms, real patterns, real problems solved.

**Example:** Want to optimize your weekly meal prep based on grocery sales? Tell Squad your idea. It analyzes your grocery data, suggests recipes, plans your meals, calculates savings. Done.

```bash
# Pick any sample, install, and run
cd social-media-manager
npm install
npm start
```

## The 20 Samples

### 💬 Text & Conversation Input

These accept ideas, transcripts, or descriptions and produce structured output.

| Sample | What It Does |
|--------|-------------|
| [ab-test-orchestrator](ab-test-orchestrator/) | Turns experiment hypotheses into complete A/B test plans with variant designs, sample size calculations, and statistical analysis frameworks |
| [appointment-scheduler](appointment-scheduler/) | Converts plain-text meeting requests into optimized time suggestions across timezones with business-hour overlap analysis |
| [content-creation](content-creation/) | Transforms blog topics into polished, SEO-optimized articles through research, outlining, drafting, and editorial review |
| [gmail](gmail/) | Triages email inbox chaos into classified, summarized, and prioritized action items with suggested responses |
| [meeting-recap](meeting-recap/) | Extracts meeting summaries, action items, decisions, and follow-up communications from transcripts |
| [social-media-manager](social-media-manager/) | Generates platform-optimized social media posts with timing recommendations, engagement monitoring, and response strategies |
| [travel-planner](travel-planner/) | Orchestrates complete trip planning covering destinations, flights, accommodations, activities, and budget optimization |

### 🌐 Browser Automation & Web Integration

These analyze web data, listings, or user activity to provide recommendations.

| Sample | What It Does |
|--------|-------------|
| [job-application-tracker](job-application-tracker/) | Evaluates job listings against preferences, researches companies, and produces a prioritized application action plan |
| [linkedin-monitor](linkedin-monitor/) | Monitors LinkedIn notifications to classify, score by priority, recommend actions, and surface engagement opportunities with direct URLs |
| [price-monitor](price-monitor/) | Analyzes scraped product prices to score deals, recommend buy/wait/skip decisions, and highlight savings opportunities |
| [real-estate-analyzer](real-estate-analyzer/) | Evaluates property listings for investment potential with financial modeling, neighborhood scoring, and opportunity ranking |
| [mtg-commander-deck-builder](mtg-commander-deck-builder/) | Scrapes EDHREC for card recommendations, builds 100-card Commander decks, saves to disk, and supports conversational follow-up modifications |
| [realtor-sales-package](realtor-sales-package/) | Builds professional CMAs (Comparative Market Analysis) with market trends, comparable sales, and pricing recommendations for realtors |

### 📁 File & Data Analysis

These parse documents, receipts, CSVs, or structured data to extract insights.

| Sample | What It Does |
|--------|-------------|
| [bug-triage](bug-triage/) | Turns GitHub issue backlogs into prioritized, deduplicated action plans with severity classification and triage recommendations |
| [compliance-checker](compliance-checker/) | Scans project folders to evaluate compliance across security, licensing, documentation, and privacy with traffic-light scoring |
| [contract-reviewer](contract-reviewer/) | Extracts contract clauses, scores risk, suggests negotiation alternatives, and delivers an executive summary with red flags |
| [inventory-manager](inventory-manager/) | Analyzes inventory data to identify stockout risks, predict demand, optimize reorder quantities, and generate action plans |
| [receipt-scanner](receipt-scanner/) | Extracts receipt data, categorizes expenses, detects anomalies, and generates financial summaries with tax deduction flags |
| [support-ticket-router](support-ticket-router/) | Triages support tickets with classification, known-issue matching, empathetic response drafting, and prioritized action queuing |

### 🎵 Interactive & Personalization

These learn user preferences and adapt behavior based on mood, history, or ongoing interactions.

| Sample | What It Does |
|--------|-------------|
| [mood-playlist-builder](mood-playlist-builder/) | Creates custom playlists by mood, saves daily sessions, and launches curated songs to YouTube. Open previous playlists by date or individual mood sessions. Respects an 8-song launch cap and reports skip diagnostics for unresolved links.

## Why These Matter

Each sample demonstrates something real:

- **ab-test-orchestrator**: Statistical confidence in A/B decisions (not guessing)
- **inventory-manager**: Stock optimization that actually prevents stockouts
- **real-estate-analyzer**: Property ROI modeling with full financial math
- **contract-reviewer**: Red flags in legal language before you sign
- **gmail**: Email that doesn't steal your time
- **price-monitor**: "Buy now or wait?" decisions based on data
- **travel-planner**: Multi-city routing that minimizes backtracking

Every sample uses **real algorithms**. Not templates. Not toy code. The math that actually works.

## Getting Started

### Pick a Sample

Browse the samples above. Pick one that solves a problem you care about.

### Run It

```bash
cd YOUR-SAMPLE
npm install
npm start
```

That's it. No configuration. No API keys. Sample data included.

### Learn From It

Read the code. See how agents collaborate. Notice the patterns:

- Some samples **pipeline** — each agent refines the work of the previous one
- Some **fan out** — agents work in parallel and results combine
- Some **iterate** — agents keep improving until a quality threshold is met

## Contribute Your Own Sample

Have an idea? You don't need to be a coder. Tell Squad your idea, and it builds the sample for you.

**Read [CONTRIBUTING.md](CONTRIBUTING.md)** for the full workflow. The short version:

1. Fork this repo
2. Create a branch: `git checkout -b squad/your-idea`
3. Tell Squad your idea: `copilot --agent squad`
4. Squad builds the sample and updates the docs
5. Test it: `npm install && npm start`
6. Open a PR

**Your idea goes from concept to working sample in one session.**

The best ideas:
- Automate something you do weekly or daily
- Show multiple agents collaborating (not just one)
- Are relatable to normal people (not just engineers)
- Use a pattern we haven't covered yet

Examples: meal-prep planning, household budget optimization, job application tracking, travel itinerary building, receipt categorization.

## Built With Squad

This repo uses Squad for its own development. When you contribute a sample, you're using the same Squad that maintains this project. Community, Squad team, and AI collaborate as peers.

## License

MIT — see [LICENSE](LICENSE) for details.
