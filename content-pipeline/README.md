# 📝 Content Pipeline

A multi-agent content creation pipeline that simulates **5 specialized AI agents**
collaborating to produce a polished article on *"How to Negotiate a Raise."*

Built as a standalone TypeScript demo — no external API calls, no AI models —
everything runs locally with embedded knowledge and real readability math.

## The 5 Agents

| # | Agent | Role | Output |
|---|-------|------|--------|
| 1 | **Researcher** | Gathers key points, statistics, and talking points about salary negotiation | `ResearchData` |
| 2 | **Outliner** | Structures the research into a hierarchical H2/H3 outline | `OutlineSection[]` |
| 3 | **Writer** | Produces a full ~800-word article with substantive paragraphs per section | `ArticleDraft` |
| 4 | **SEO Optimizer** | Calculates Flesch-Kincaid readability, keyword density, and title variations | `SEOAnalysis` |
| 5 | **Editor** | Scores tone, flow, and grammar; suggests specific line-level improvements | `EditReview` |

## Flesch-Kincaid Readability

The SEO Optimizer implements the actual Flesch-Kincaid formulas:

```
Grade Level  = 0.39 × (words / sentences) + 11.8 × (syllables / words) − 15.59
Reading Ease = 206.835 − 1.015 × (words / sentences) − 84.6 × (syllables / words)
```

Syllable counting uses vowel-group heuristics with corrections for silent-e,
`-le` endings, and common prefixes. The step-by-step calculation is displayed
in the terminal so you can follow the math.

## Running

```bash
npm install
npm start
```

Requires **Node.js 18+** and installs only `tsx` and `typescript` as dev
dependencies. The main `index.ts` file has zero runtime imports beyond
Node.js built-ins — it is entirely self-contained.

## Terminal Output

The pipeline renders with ANSI colors, box-drawing characters, progress bars,
and simulated processing delays so you can watch the article being assembled
stage by stage.

## Project Structure

```
content-pipeline/
├── index.ts        # Single-file pipeline (all 5 agents)
├── package.json
├── tsconfig.json
└── README.md
```

## What You'll Learn

- How to model a multi-agent pipeline with typed hand-offs
- Real Flesch-Kincaid readability scoring in TypeScript
- Building rich terminal UIs with ANSI escape codes
- Structuring simulated agent workflows without external dependencies
