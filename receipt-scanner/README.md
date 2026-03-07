# 🧾 Receipt Scanner & Expense Processor

A Squad sample demonstrating a 4-agent data-extraction pipeline that processes
10 simulated receipt OCR outputs into a complete expense report.

## Agents

| Agent | Role | What It Does |
|-------|------|-------------|
| **Scanner** | Data Extractor | Parses messy OCR text with regex heuristics, extracts vendor/amount/date/payment fields with confidence scores |
| **Matcher** | Duplicate Detector | Compares receipts by vendor + amount + date proximity, flags duplicates and split transactions |
| **Classifier** | GL Coder | Assigns General Ledger codes (6100–6900) and department based on vendor/line-item analysis |
| **Approver** | Policy Checker | Enforces company expense policy — meal limits, VP approval thresholds, weekend justification, duplicate resolution |

## Pipeline

```
OCR Text → Scanner → Matcher → Classifier → Approver → Expense Report
```

Each receipt flows through all four agents sequentially. The final output is a
formatted expense report with category totals, approval statuses, and processing
statistics.

## Run

```bash
npm install && npm start
```

No external APIs required — everything is self-contained with simulated data.
