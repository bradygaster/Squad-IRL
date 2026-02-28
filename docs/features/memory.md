# Memory System

> ⚠️ **Experimental** — Squad is alpha software. APIs, commands, and behavior may change between releases.


**Try this to query team decisions:**
```
What decisions has the team made about testing strategy?
```

**Try this to establish a new rule:**
```
Always use single quotes in TypeScript
```

**Try this to check agent knowledge:**
```
What does Kane remember about the authentication system?
```

Squad remembers everything — decisions, conventions, architecture patterns, and individual agent learnings. Memory grows with every session, making agents smarter over time.

---

## Memory Layers

Squad's memory is layered. Each layer serves a different purpose, and knowledge grows with every session.

---

## Personal Memory: `history.md`

Each agent has its own history file at `.squad/agents/{name}/history.md`. After every session, agents append what they learned — architecture decisions, conventions, file paths, user preferences.

**Only that agent reads its own history.** This means each team member builds specialized knowledge about their domain.

After a few sessions, agents stop asking questions they've already answered.

### Progressive summarization

Histories grow over time. When an agent's `history.md` exceeds ~12KB, older entries are archived into a summary section. Recent entries stay detailed; older entries are condensed. This keeps the file within a useful context budget without losing accumulated knowledge.

---

## Shared Memory: `decisions.md`

Team-wide decisions live in `.squad/decisions.md`. **Every agent reads this before working.** This is the team's shared brain.

Decisions are captured three ways:

### 1. From agent work

When an agent makes a decision during a task, it writes to the inbox:

```
.squad/decisions/inbox/{agent-name}-{slug}.md
```

### 2. From user directives

When you say "always..." or "never...", it's captured as a directive:

```
> Always use single quotes in TypeScript
> Never use inline styles
> Prefer named exports over default exports
```

These go directly into `decisions.md`.

### 3. Scribe merges

The Scribe agent (a silent team member) periodically:

1. Reads all entries from `.squad/decisions/inbox/`
2. Merges them into the canonical `decisions.md`
3. Deduplicates overlapping decisions
4. Propagates updates to affected agents

### Decision archiving

As your project grows, `decisions.md` accumulates hundreds of blocks. Stale sprint artifacts, completed analysis docs, and one-time planning fragments consume context window space without adding value. When this happens, old decisions are archived to `.squad/decisions-archive.md` — preserved for reference but no longer loaded into agent context.

Active decisions (ongoing policies, user preferences, current architecture) stay in `decisions.md`. Agents always read the lean, current shared brain.

---

## Skills

Reusable knowledge files at `.squad/skills/{skill-name}/SKILL.md`. See [Skills System](skills.md) for details.

Skills differ from decisions — decisions are project policies ("use PostgreSQL"), while skills are transferable techniques ("how to set up CI with GitHub Actions").

---

## How Memory Compounds

| Stage | What agents know |
|-------|-----------------|
| 🌱 First session | Project description, tech stack, your name |
| 🌿 After a few sessions | Conventions, component patterns, API design, test strategies |
| 🌳 Mature project | Full architecture, tech debt map, regression patterns, performance conventions |

---

## Memory Architecture

```
.squad/
├── decisions.md                          # Shared — all agents read this
├── decisions/inbox/                      # Drop-box for parallel writes
│   ├── kane-api-versioning.md
│   └── dallas-component-structure.md
├── agents/
│   ├── kane/
│   │   └── history.md                    # Kane's personal memory
│   ├── dallas/
│   │   └── history.md                    # Dallas's personal memory
│   └── lambert/
│       └── history.md                    # Lambert's personal memory
└── skills/
    ├── squad-conventions/SKILL.md        # Starter skill
    └── ci-github-actions/SKILL.md        # Earned skill
```

---

## Tips

- **Commit `.squad/`** — anyone who clones the repo gets the team with all their accumulated knowledge.
- Directives ("always...", "never...") are the fastest way to shape team behavior. Use them liberally.
- If an agent keeps making the same mistake, check `decisions.md` — the relevant convention might be missing.
- You can edit `decisions.md` and `history.md` files directly. They're plain Markdown.
- The first session is always the least capable. Give the team a few sessions to build up context.

## Sample Prompts

```
what does Kane remember about the authentication system?
```

Queries a specific agent's personal history for relevant context.

```
show me the team decisions about API design
```

Searches the shared decisions.md file for a particular topic.

```
what happened in the last session?
```

Reviews session history and recent agent learnings.

```
always use single quotes in TypeScript
```

Adds a directive to the shared decisions that all agents will follow.

```
search past decisions for database choices
```

Finds historical decisions related to a specific topic or keyword.
