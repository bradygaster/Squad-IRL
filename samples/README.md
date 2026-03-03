# SDK Samples Portfolio — MVP Summit

> 7 samples shipping for MVP Summit (Monday). Each is a standalone working app demonstrating a slice of the Squad SDK.

---

## 1. hello-squad

**The "hello world."** Resolves a `.squad/` directory, loads config, casts a team from the Usual Suspects universe, onboards each agent, and prints the roster. Zero async complexity, zero governance, zero tooling. Pure SDK mechanics: casting engine in, typed roster out. If someone has 5 minutes and wants to see Squad produce output, this is it.

- **SDK APIs:** `resolveSquad()`, `loadConfig()`, `CastingEngine.castTeam()`, `onboardAgent()`
- **Difficulty:** Beginner
- **Estimated LOC:** ~60–80

---

## 2. knock-knock

**The simplest multi-agent demo.** Two agents cast from a "Comedy Club" universe trade knock-knock jokes forever, streaming token-by-token via `StreamingPipeline`. No routing, no governance, no auth — just casting and streaming. Runs in Docker; demo mode built in.

- **SDK APIs:** `CastingEngine.castTeam()`, `StreamingPipeline`, `onDelta()`, `EventBus`, `SessionPool`
- **Difficulty:** Beginner
- **Estimated LOC:** ~80–120

---

## 3. rock-paper-scissors

**Multi-agent strategy tournament.** Nine players with distinct strategies compete in endless 1-on-1 matches. A scorekeeper announces results with commentary. Demonstrates multi-session pooling, strategy-via-prompt, agent learning, and real-time streaming. The learning agent (Sherlock) analyzes opponent history to predict and counter moves — watch it adapt in the logs.

- **SDK APIs:** `SquadClientWithPool`, `SessionPool`, `StreamingPipeline`, `onDelta()`, `EventBus`, system prompts
- **Difficulty:** Intermediate
- **Estimated LOC:** ~200–250

---

## 4. hook-governance

**Every governance hook demoed in one script.** File-write guards that block writes outside allowed paths. PII scrubbing that redacts emails and phone numbers from tool output. Reviewer lockout that prevents an author from editing rejected files. Ask-user rate limiting that caps human interruptions per session. Custom pre-tool and post-tool hooks for audit logging and output validation. Each hook is configured, triggered, and the result printed — so you can see exactly what gets blocked and why.

- **SDK APIs:** `HookPipeline`, `addPreToolHook()`, `addPostToolHook()`, `getReviewerLockout()`, `PolicyConfig`
- **Difficulty:** Intermediate
- **Estimated LOC:** ~120–150

---

## 5. streaming-chat

**Multi-agent interactive chat with real-time streaming.** Creates a `SquadClient`, establishes sessions for multiple agents, and routes messages through the coordinator. Responses stream token-by-token to the terminal via `StreamingPipeline`. The user types messages, the coordinator picks the right agent, and you see the response build in real time. Demonstrates session lifecycle, message routing, and the streaming delta/usage/reasoning handlers.

- **SDK APIs:** `SquadClient`, `createSession()`, `StreamingPipeline`, `onDelta()`, `onUsage()`, `onReasoning()`, `EventBus`
- **Difficulty:** Intermediate
- **Estimated LOC:** ~150–180

---

## 6. cost-aware-router

**Cost-optimized task routing.** Uses `CostTracker` wired to the `EventBus` to monitor token usage per agent and per model in real time. Implements a custom routing layer that checks budget thresholds before dispatching work — if an agent's cost exceeds a cap, the router falls back to a cheaper model tier. Shows `recordUsage()`, `getSummary()`, `formatSummary()`, and the `selectResponseTier()` coordinator API for mapping tasks to Direct/Lightweight/Standard/Full tiers.

- **SDK APIs:** `CostTracker`, `EventBus`, `selectResponseTier()`, `getTier()`, `wireToEventBus()`, `recordUsage()`, `recordFallback()`
- **Difficulty:** Intermediate–Advanced
- **Estimated LOC:** ~180–220

---

## 7. skill-discovery

**Agents that learn, compress knowledge, and share it.** Demonstrates the skills system: agents write `SKILL.md` files with confidence levels (experimenting → confident → proven), read skills from other agents, and build on shared knowledge across sessions. Shows how the `.squad/skills/` directory acts as a team-wide knowledge base. Includes skill creation, retrieval, confidence promotion, and cross-agent skill consumption.

- **SDK APIs:** Skills system (`squad_skill` tool), `onboardAgent()`, skill CRUD operations, confidence levels
- **Difficulty:** Intermediate
- **Estimated LOC:** ~140–170

---

## 8. autonomous-pipeline

**The full showcase.** A multi-agent pipeline with casting, governance, cost tracking, streaming, monitoring, and a terminal dashboard. Creates a team, assigns a real task (e.g., "build a REST API"), fans out work to parallel agents, monitors health with `RalphMonitor`, tracks costs, enforces governance hooks, and renders a live terminal dashboard showing agent status, token usage, and streaming output. This is the "wow demo" — everything Squad can do in one running script.

- **SDK APIs:** `SquadClient`, `CastingEngine`, `HookPipeline`, `CostTracker`, `EventBus`, `RalphMonitor`, `StreamingPipeline`, `resolveSquad()`, `loadConfig()`, `createSession()`, `resumeSession()`
- **Difficulty:** Advanced
- **Estimated LOC:** ~350–450

---

## Summary Table

| # | Sample | Difficulty | Est. LOC | Key Theme |
|---|--------|-----------|----------|-----------|
| 1 | hello-squad | Beginner | ~60–80 | Casting + onboarding |
| 2 | knock-knock | Beginner | ~80–120 | Multi-agent streaming |
| 3 | rock-paper-scissors | Intermediate | ~200–250 | Strategy + learning |
| 4 | hook-governance | Intermediate | ~120–150 | All governance hooks |
| 5 | streaming-chat | Intermediate | ~150–180 | Real-time multi-agent chat |
| 6 | cost-aware-router | Int–Advanced | ~180–220 | Budget-aware routing |
| 7 | skill-discovery | Intermediate | ~140–170 | Knowledge sharing |
| 8 | autonomous-pipeline | Advanced | ~350–450 | Full showcase + dashboard |

**Total estimated LOC across all 8 samples: ~1,280–1,620**

> ⚠️ Samples are being built by individual agents. This doc is the portfolio overview only.
