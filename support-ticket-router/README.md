# Support Ticket Router — Squad Multi-Agent Demo

This sample demonstrates how a **Squad** of five specialized AI agents can collaboratively triage, classify, deduplicate, and draft responses for incoming support tickets — all without any external API calls.

## What It Does

Twelve realistic support tickets are fed through a five-stage pipeline. Each stage is handled by a dedicated agent with its own algorithm and domain logic:

| # | Agent | Role | Algorithm |
|---|-------|------|-----------|
| 1 | **Classifier** | Assigns priority (P1–P4) and category (Billing / Technical / Account / Feature Request) with confidence scores | Weighted keyword frequency scoring — each category has a curated keyword dictionary; confidence is the normalized match count against total keywords found |
| 2 | **Duplicate Detector** | Flags tickets that match known issues | **Jaccard similarity** on tokenized word sets (`|A ∩ B| / |A ∪ B|`). Threshold ≥ 0.3 flags a potential duplicate |
| 3 | **KB Searcher** | Finds relevant knowledge-base articles | **TF-IDF–like scoring** — shared significant words are weighted by inverse document frequency across the KB corpus |
| 4 | **Response Generator** | Drafts template replies (or escalates P1s) | Template selection based on category + KB match, with dynamic slot filling |
| 5 | **Quality Checker** | Scores every draft on Tone / Accuracy / Completeness | Deterministic rubric: 0-30 Tone + 0-40 Accuracy + 0-30 Completeness = 0-100 total. Responses below 70 are flagged for human review |

## Running

```bash
npm install
npm start
```

Requires Node.js ≥ 18. No external runtime dependencies — only `tsx` and `typescript` as dev tools.

## Why This Matters for Squad

This project shows the Squad pattern of **decomposing a complex workflow into small, focused agents** that each own one responsibility. The agents communicate through a shared data pipeline rather than direct calls, making the system easy to extend (add a sixth agent for sentiment analysis, swap the similarity algorithm, etc.).
