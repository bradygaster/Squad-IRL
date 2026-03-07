# 🎙️ Podcast Processor — Multi-Agent Transcript Analysis

A self-contained TypeScript demo that processes a simulated 15-minute tech
podcast interview through **five specialised agents**, producing a complete
episode package ready for publication.

## Agents

| # | Agent | What it does |
|---|-------|--------------|
| 1 | **Transcript Formatter** | Speaker diarisation, simulated timestamps, per-speaker word counts |
| 2 | **Summarizer** | Executive summary, key takeaways, topic-distribution bar chart |
| 3 | **Chapter Generator** | Detects topic shifts via keyword clustering and creates timestamped chapters |
| 4 | **Quote Extractor** | Scores every sentence on brevity / insight / standalone / emotion and picks the top 5 |
| 5 | **Social Content Creator** | Generates a Twitter/X thread, LinkedIn post, and newsletter blurb |

## NLP Techniques

* **Speaker identification** — pattern matching on interrogative markers, name
  references, and discourse cues ("Welcome", "Thank you", "Great question").
* **Topic modelling (lightweight)** — TF-style keyword frequency per sliding
  window to detect thematic shifts.
* **Shareability scoring** — weighted multi-factor score
  `(brevity × 0.25) + (insight × 0.35) + (standalone × 0.20) + (emotion × 0.20)`.
* **Sentence segmentation** — regex-based splitting that respects abbreviations.

## Quick Start

```bash
npm install
npm start        # runs: npx tsx index.ts
```

No external runtime dependencies — only `tsx` and `typescript` as dev
dependencies for execution.

## Output

The program prints a richly formatted terminal report including:

- Colour-coded transcript with timestamps
- Topic distribution bar charts (█ blocks)
- Chapter timeline
- Quote scoring tables with per-factor breakdowns
- Platform-branded social-content boxes
- Final episode-package summary card
