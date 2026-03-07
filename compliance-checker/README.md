# Compliance Checker — Multi-Agent Security Audit

A simulated multi-agent Squad that audits a codebase for security compliance across OWASP Top 10, GDPR, and SOC2 frameworks — with dependency scanning and a final scorecard.

## How to Run

```bash
npm install
npm start
```

## The 5 Agents

| # | Agent | Role |
|---|-------|------|
| 1 | **OWASP Scanner** 🛡️ | Scans code for OWASP Top 10 vulnerabilities (injection, XSS, broken auth, etc.) and assigns CVSS severity scores. |
| 2 | **GDPR Checker** 🇪🇺 | Evaluates data-handling practices against GDPR requirements — consent, right-to-deletion, data minimization, breach notification, and more. |
| 3 | **SOC2 Auditor** 🔐 | Audits Trust Service Criteria (logical access, encryption, monitoring, incident response, change management, backups). |
| 4 | **Dependency Auditor** 📦 | Scans the dependency tree for known CVEs, calculates a health score, and recommends prioritized upgrades. |
| 5 | **Report Generator** 📊 | Synthesizes all findings into a cross-framework compliance matrix, computes a letter grade (A–F), and produces a prioritized remediation plan. |

## What You'll See

Progressive terminal output showing each agent working in sequence — scanning files, checking configurations, auditing dependencies — then a final compliance scorecard with remediation priorities.

> **Note:** This is a simulation. No real files or network calls are made. All data is hard-coded for demonstration purposes.
