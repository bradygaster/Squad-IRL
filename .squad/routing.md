# Routing Rules — squad-sdk

## Work Type → Agent

| Work Type | Agent | Examples |
|-----------|-------|---------|
| Core runtime | Fenster 🔧 | CopilotClient, adapter, session pool, tools module, spawn orchestration |
| Prompt architecture | Verbal 🧠 | Agent charters, spawn templates, coordinator logic, response tier selection |
| Type system | Edie 👩‍💻 | Discriminated unions, generics, tsconfig, strict mode enforcement, declaration files |
| SDK integration | Kujan 🕵️ | @github/copilot-sdk usage, CopilotSession lifecycle, event handling, platform patterns |
| Runtime performance | Fortier ⚡ | Streaming, event loop health, session management, async iterators, memory profiling |
| Tests & quality | Hockney 🧪 | Test coverage, Vitest, edge cases, CI/CD, quality gates |
| Docs & messaging | McManus 📣 | README, API docs, getting-started, demos, tone review |
| Architecture & review | Keaton 🏗️ | Product direction, architectural decisions, code review, scope/trade-offs |
| Distribution | Rabin 📦 | npm packaging, esbuild config, global install, marketplace prep |
| Git & releases | Kobayashi 🚢 | Semantic versioning, GitHub Releases, CI/CD, branch protection |
| Security & PII | Baer 🔒 | Hook design (file-write guards, PII filters), security review, compliance |
| Visual identity | Redfoot 🎨 | Logo, icons, brand assets, design system |
| VS Code integration | Strausz 🔌 | VS Code Extension API, runSubagent compatibility, editor integration |

## Module Ownership

| Module | Primary | Secondary |
|--------|---------|-----------|
| `src/adapter/` | Fenster 🔧 | Kujan 🕵️ |
| `src/agents/` | Verbal 🧠 | Fenster 🔧 |
| `src/build/` | Edie 👩‍💻 | Rabin 📦 |
| `src/casting/` | Fenster 🔧 | Verbal 🧠 |
| `src/cli/` | Fenster 🔧 | Rabin 📦 |
| `src/client/` | Kujan 🕵️ | Fenster 🔧 |
| `src/config/` | Edie 👩‍💻 | Fenster 🔧 |
| `src/coordinator/` | Verbal 🧠 | Keaton 🏗️ |
| `src/hooks/` | Baer 🔒 | Fenster 🔧 |
| `src/marketplace/` | Rabin 📦 | Fenster 🔧 |
| `src/ralph/` | Fenster 🔧 | — |
| `src/runtime/` | Fortier ⚡ | Fenster 🔧 |
| `src/sharing/` | Fenster 🔧 | Rabin 📦 |
| `src/skills/` | Verbal 🧠 | — |
| `src/tools/` | Fenster 🔧 | Kujan 🕵️ |
| `src/index.ts` | Edie 👩‍💻 | Keaton 🏗️ |

## Routing Principles

1. **Eager by default** — spawn agents who could usefully start work, including anticipatory downstream work.
2. **Scribe always runs** after substantial work, always as `mode: "background"`. Never blocks.
3. **Quick facts → coordinator answers directly.** Don't spawn for trivial questions.
4. **Two agents could handle it** → pick the one whose domain is the primary concern.
5. **"Team, ..." → fan-out.** Spawn all relevant agents in parallel as `mode: "background"`.
6. **Anticipate downstream.** Feature being built? Spawn tester for test cases from requirements simultaneously.
