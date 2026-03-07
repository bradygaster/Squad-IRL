# Dashboard Designer

> Design effective dashboard layouts that tell data stories

## Who This Is For

📊 Data/Business

## The Team

| Agent | Role | What They Do |
|-------|------|-------------|
| Designer | Writer | Domain expert for dashboard designer |
| DataStoryteller | Grader | Domain expert for dashboard designer |
| UXExpert | Updater | Domain expert for dashboard designer |

## How It Works

1. **Write** — Designer reads `spec.md` and produces the first draft
2. **Grade** — DataStoryteller evaluates the output (1-100 score)
3. **Update** — If score < 90%, UXExpert improves the output
4. **Repeat** — Loop continues until quality threshold is met

## See It In Action

Here's what the agent team produced for Alex's SaaS product dashboard:

> **3-section layout** answers key questions: Are we growing? (MRR: $847K, +6.8% 🟢) | Are customers happy? (NRR: 112%, Churn: 2.1% 🟢) | Are we profitable? (LTV/CAC: 7.2x 🟢). **6 core metrics** (not 47). Color-coded alerts. Every number has context (target, trend, benchmark). Execs get 30-second health check; analysts can drill down.

> 📄 **[See the full example output →](examples/sample-output.md)**

## Running This Sample

```bash
npm install
npm start
```

## Output

Results are saved in the `output/` directory.
