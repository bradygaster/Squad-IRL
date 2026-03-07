# Bug Triage — Squad Multi-Agent Demo

Five agents collaborate to triage 10 incoming bug reports: parsing free-text into structured data, detecting duplicates with text similarity algorithms, cross-referencing environment data, scoring priority on five dimensions, and recommending the best engineer for each bug.

## What It Does

| Agent | Name | Role | Algorithm |
|-------|------|------|-----------|
| 1 | **Parser** | Extracts structured fields from messy free-text reports | Keyword extraction, quality scoring (1–10) |
| 2 | **Duplicate Detector** | Finds existing bugs that match incoming reports | Jaccard similarity + cosine similarity on TF-IDF vectors |
| 3 | **Environment Checker** | Cross-references platform/version against known issues | Version-range matching, platform lookup |
| 4 | **Priority Scorer** | Scores each bug on 5 weighted dimensions | Weighted composite: severity×0.30 + users×0.25 + workaround×0.15 + business×0.20 + reproducibility×0.10 |
| 5 | **Assignee Recommender** | Matches bugs to the best-fit engineer | Specialty match (40%) + workload balance (25%) + past experience (35%) |

## Text Similarity Algorithms

### Jaccard Similarity

Measures overlap between two sets of tokens (words):

```
J(A,B) = |A ∩ B| / |A ∪ B|
```

Higher values mean more shared vocabulary between two bug reports.

### Cosine Similarity on TF-IDF Vectors

Each document is represented as a vector of TF-IDF weights:

```
TF(t,d)  = count of t in d / total terms in d
IDF(t)   = log(N / df(t))   where N = total docs, df = docs containing t
cosine   = (A · B) / (|A| × |B|)
```

Captures not just shared words, but how important those words are across the entire corpus.

## Running

```bash
npm install
npm start        # runs: npx tsx index.ts
```

Requires Node.js ≥ 18.

## Why This Matters for Squad

Bug triage is high-volume, repetitive, and error-prone. This demo shows how a pipeline of specialized agents can turn messy human-written reports into a prioritized, deduplicated, assigned queue — the kind of workflow where Squad's multi-agent architecture shines.
