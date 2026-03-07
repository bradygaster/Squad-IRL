# Medical Appointment Prep 🏥

A multi-agent Squad simulation that helps you prepare for a doctor's appointment. Five specialized agents collaborate to analyze symptoms, compile history, generate questions, verify insurance, and build a printable visit summary.

## Quick Start

```bash
npm install
npm start
```

## The 5 Agents

| Agent | Role | What It Does |
|-------|------|--------------|
| 🩺 **Symptom Logger** | Symptom analysis | Scores and prioritizes symptoms using a composite algorithm (severity × frequency × duration) |
| 📋 **History Compiler** | Medical timeline | Renders a visual timeline of your medical history grouped by year |
| ❓ **Question Generator** | Smart questions | Cross-references symptoms with medications and history to generate prioritized questions |
| 💳 **Insurance Verifier** | Coverage check | Calculates estimated visit costs, flags pre-auth requirements |
| 📝 **Visit Planner** | Appointment prep | Builds a printable visit summary with time-budget optimization for a 15-minute appointment |

## How It Works

This is a standalone TypeScript simulation — no API keys or external services needed. It demonstrates how a Squad of specialized agents can divide a complex task (appointment prep) into focused subtasks, each producing structured output that feeds into the next agent's work.

The final output is a "Visit Summary Sheet" you could actually print and bring to an appointment.
