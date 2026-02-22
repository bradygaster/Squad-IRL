# Squad Architecture Diagrams

> Mermaid diagrams for v0.6.0 SDK architecture. Render in any Mermaid-compatible viewer (GitHub, VS Code, etc.).

---

## 1. Beta vs v1 Architecture Comparison

```mermaid
graph LR
  subgraph "Beta (v0.4.x — Markdown)"
    A1[squad.agent.md] --> A2[.squad/team.md]
    A2 --> A3[.squad/routing.md]
    A3 --> A4[Copilot Agent Picker]
    A4 --> A5[Single-agent response]
  end

  subgraph "v1 (v0.6.x — Typed SDK)"
    B1[squad.config.ts] --> B2[ConfigLoader]
    B2 --> B3[Validator + Schema]
    B3 --> B4[Coordinator]
    B4 --> B5[RoutingEngine]
    B5 --> B6[CastingEngine]
    B6 --> B7[AgentLifecycle]
    B7 --> B8[Multi-agent response]
  end
```

## 2. Data Flow — Message to Response

```mermaid
sequenceDiagram
  participant User
  participant Copilot as Copilot SDK
  participant Coord as Coordinator
  participant Router as RoutingEngine
  participant Cast as CastingEngine
  participant Agent as Agent (spawned)

  User->>Copilot: Chat message
  Copilot->>Coord: route(message)
  Coord->>Router: match(message, rules)
  Router-->>Coord: RoutingResult (agents, tier)
  Coord->>Cast: assign(agents, context)
  Cast->>Agent: spawn(charter, model, tools)
  Agent-->>Coord: AgentResponse
  Coord-->>Copilot: formatted response
  Copilot-->>User: display
```

## 3. Config System — Load → Validate → Compile → Spawn

```mermaid
flowchart TD
  A[squad.config.ts] -->|"import()"| B[ConfigLoader]
  B --> C{Validate against schema}
  C -->|valid| D[Compile routing rules]
  C -->|invalid| E[ConfigValidationError]
  D --> F[Resolve model tiers]
  F --> G[Compile agent charters]
  G --> H[Spawn agents with config]

  style E fill:#f96,stroke:#333
  style H fill:#6f9,stroke:#333
```

## 4. Module Dependency Graph

```mermaid
graph TD
  index[index.ts] --> config[config/]
  index --> agents[agents/]
  index --> casting[casting/]
  index --> skills[skills/]
  index --> coordinator[coordinator/]
  index --> runtime[runtime/]
  index --> cli[cli/]
  index --> marketplace[marketplace/]
  index --> build[build/]
  index --> sharing[sharing/]

  coordinator --> runtime
  coordinator --> agents
  coordinator --> casting
  coordinator --> skills
  casting --> agents
  casting --> config
  agents --> config
  agents --> runtime
  runtime --> config
  cli --> config
  cli --> coordinator
  marketplace --> config
  marketplace --> sharing
  build --> config
  sharing --> config
```

## 5. Migration Path — .squad/ (current standard)

```mermaid
flowchart LR
  subgraph "Legacy (v0.4)"
    L1[.squad/team.md]
    L2[.squad/routing.md]
    L3[squad.agent.md]
  end

  subgraph "Detection"
    D1[detectLegacySetup]
  end

  subgraph "Migration"
    M1[markdown-migration]
    M2[loadLegacyAgentMd]
    M3[mergeLegacyWithConfig]
  end

  subgraph "v0.6 Typed"
    T1[squad.config.ts]
    T2[.squad/agents/]
    T3[.squad/routing.json]
  end

  L1 --> D1
  L2 --> D1
  L3 --> D1
  D1 -->|legacy detected| M1
  M1 --> M2
  M2 --> M3
  M3 -->|typed config wins| T1
  M1 -->|agents| T2
  M1 -->|rules| T3

  style D1 fill:#ff9,stroke:#333
  style T1 fill:#6f9,stroke:#333
```
