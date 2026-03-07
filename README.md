# 100 Ways to Use Squad

> 20 standalone sample projects showing what AI agent teams can actually do. Each one is technically different — different algorithms, different domains, different interaction patterns.

## What Is This?

Each folder is a self-contained TypeScript project with a team of AI agents solving a real-world problem. No API keys needed. No shared template. Every sample has its own unique codebase with real algorithms — from statistical z-tests to Haversine distance calculations to Monte Carlo simulations.

```bash
# Pick any sample, install, and run
cd email-inbox-triage
npm install
npm start
```

## The Samples

| Sample | What It Does | Key Tech |
|--------|-------------|----------|
| [ab-test-analyzer](ab-test-analyzer/) | Runs statistical analysis on A/B experiments — ship/don't ship decisions with confidence | Z-test, p-values, confidence intervals, power analysis |
| [appointment-scheduler](appointment-scheduler/) | Finds optimal meeting times across calendars and timezones | Constraint satisfaction, timezone intersection |
| [bug-triage](bug-triage/) | Classifies incoming bugs, detects duplicates, assigns priority | TF-IDF cosine similarity, Jaccard distance, 5-dim scoring |
| [competitive-intel-monitor](competitive-intel-monitor/) | Tracks competitor moves and generates positioning analysis | Sentiment analysis, ASCII scatter plots, market mapping |
| [compliance-checker](compliance-checker/) | Audits systems against OWASP, GDPR, and SOC2 frameworks | Multi-framework compliance mapping, CVSS scoring |
| [content-pipeline](content-pipeline/) | Multi-stage content creation with readability optimization | Flesch-Kincaid readability, multi-agent editorial pipeline |
| [contract-reviewer](contract-reviewer/) | Reviews contracts for risky clauses and missing protections | Clause parsing, risk scoring, benchmark comparison |
| [ecommerce-optimizer](ecommerce-optimizer/) | Optimizes pricing, bundles, and customer segments | Price elasticity, market basket analysis, RFM segmentation, Monte Carlo |
| [email-inbox-triage](email-inbox-triage/) | Classifies and prioritizes a flooded inbox | NLP keyword classification, urgency scoring, spam detection |
| [inventory-manager](inventory-manager/) | Optimizes stock levels with demand forecasting | EOQ formula, safety stock calculation, demand forecasting |
| [job-application-tracker](job-application-tracker/) | Tracks applications through a Kanban pipeline with salary analysis | State machine, decision matrix, salary visualization |
| [medical-appointment-prep](medical-appointment-prep/) | Prepares for doctor visits with symptom timelines and questions | Symptom severity scoring, medical timeline, time-budget |
| [meeting-recap-generator](meeting-recap-generator/) | Turns meeting transcripts into structured recaps with action items | Speaker diarization, action item extraction, bar charts |
| [podcast-processor](podcast-processor/) | Processes podcast transcripts into show notes, quotes, and clips | Topic segmentation, shareability quote scoring |
| [price-monitor](price-monitor/) | Tracks prices over time and predicts the best time to buy | Linear regression, sparkline charts, deal scoring |
| [real-estate-analyzer](real-estate-analyzer/) | Evaluates investment properties with full financial modeling | Mortgage amortization, NPV, cap rate, cash-on-cash return |
| [receipt-scanner](receipt-scanner/) | Parses receipt text and categorizes spending with tax analysis | OCR text parsing, category detection, tax calculation |
| [social-media-manager](social-media-manager/) | Creates platform-optimized content with posting schedules | Content variation engine, engagement heatmaps |
| [support-ticket-router](support-ticket-router/) | Routes support tickets to the right team and detects duplicates | Jaccard text similarity, priority scoring, duplicate detection |
| [travel-planner](travel-planner/) | Plans multi-city trips with optimized routes and budgets | Haversine distance, nearest-neighbor routing, budget optimization |

## What Makes These Different

Each sample is **technically unique** — not the same template with different data:

- **ab-test-analyzer** implements actual statistical hypothesis testing with z-scores and p-values
- **bug-triage** uses TF-IDF vectors and cosine similarity to find duplicate bug reports
- **travel-planner** calculates real geographic distances with the Haversine formula
- **ecommerce-optimizer** runs Monte Carlo simulations for revenue forecasting
- **real-estate-analyzer** computes full mortgage amortization schedules and NPV
- **content-pipeline** scores readability using the Flesch-Kincaid formula

Every agent team has a distinct collaboration pattern — some are pipelines, some are parallel fan-outs, some iterate until quality thresholds are met.

## Contributing

Have an idea for sample #21? Open a PR! Requirements:
1. Must be a **standalone** project (its own `package.json`)
2. Must use a **different algorithm or interaction pattern** than existing samples
3. Must run with `npm install && npm start` — no API keys
4. Must solve a problem someone would actually care about

## License

MIT — see [LICENSE](LICENSE) for details.
