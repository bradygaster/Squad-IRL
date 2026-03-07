# Email Inbox Triage — Gmail Edition

A Squad sample that opens your **real Gmail inbox** in a browser, scrapes the visible emails using Playwright, and feeds them to a four-agent AI triage squad for actionable advice.

## How It Works

1. A Chromium browser launches and navigates to Gmail
2. You log in (or it uses your saved session from a previous run)
3. Press Enter once your inbox is visible
4. The app scrapes sender, subject, snippet, unread status, and labels from the visible emails
5. Four AI agents collaborate to triage your inbox:
   - **Classifier** — categorizes each email and assigns priority
   - **Summarizer** — distils each email into key facts
   - **Action Advisor** — recommends what to do (reply, archive, delete, flag)
   - **Priority Ranker** — orders everything into an action plan
6. Ask follow-up questions: "draft a reply to the budget email", "which should I handle first?"

## Prerequisites

- Node.js ≥ 20
- GitHub Copilot CLI installed and authenticated

## Setup

```bash
npm install
npx playwright install chromium
```

## Usage

```bash
npm start
```

On first run you'll need to log into Gmail in the browser window that opens. Subsequent runs remember your session (stored in `.gmail-session/`), so you'll likely be logged in automatically.

## Notes

- **Read-only** — this demo reads your inbox but never modifies, sends, or deletes anything
- **Privacy** — your emails are sent to the AI model for triage but are not stored anywhere
- **Gmail DOM** — Gmail's interface changes frequently; if scraping fails, the app falls back to extracting raw row text
- **Session persistence** — browser profile is saved in `.gmail-session/` so you don't re-authenticate every run

