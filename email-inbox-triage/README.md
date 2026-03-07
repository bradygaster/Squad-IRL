# Email Inbox Triage

A Squad sample demonstrating 3 AI agents collaboratively triaging an email inbox of 18 realistic messages.

## Agents

| Agent | Role |
|-------|------|
| **Classifier** | Categorizes emails (Work, Shopping, Newsletter, Alert, Personal, Spam) with weighted keyword scoring and fallback routing when confidence is low |
| **Summarizer** | Creates concise 1-line summaries and extracts key entities (names, dates, amounts, action items) |
| **Action Suggester** | Proposes next actions (Reply Urgently, Reply, Archive, Delete, etc.) with deadline suggestions for time-sensitive items |

## How It Works

1. Each email passes through the 3-agent pipeline sequentially
2. The Classifier uses keyword dictionaries with per-category weights to compute a confidence score (0.0–1.0)
3. If confidence falls below 0.6, a fallback mechanism re-analyzes the sender's domain to reclassify
4. Results are displayed progressively in the terminal, then grouped into a sorted inbox view by priority

## Running

```bash
npm install && npm start
```

No external API keys or services required — everything is self-contained with simulated data.
