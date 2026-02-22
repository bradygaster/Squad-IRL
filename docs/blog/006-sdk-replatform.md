# The Squad SDK Replatform: Why and How

> ⚠️ **INTERNAL ONLY** — Draft for review before public posting.

**Date:** 2025  
**Author:** Squad Team

---

## Why We Replatformed

Squad started as a markdown convention — a `squad.agent.md` file and a `.squad/` directory that GitHub Copilot could read to coordinate multiple agents. It worked, but it hit a ceiling fast.

Markdown configs couldn't be validated at authoring time. Routing rules were fragile strings. There was no way to test a team configuration without running it live. And as teams grew past three or four agents, the lack of type safety made changes risky.

We needed a programmable foundation: something teams could lint, test, version, and extend — without losing the simplicity that made Squad approachable.

## What Changed

The replatform replaced the markdown layer with a typed TypeScript SDK while keeping backward compatibility.

**Configuration** moved from `squad.agent.md` to `squad.config.ts`. A `defineConfig()` helper gives authors full IntelliSense and compile-time validation. The schema covers team metadata, agent definitions, routing rules, model tiers, hooks, and plugins — all with defaults that make the minimal config just a few lines.

**Routing** became a first-class engine. Rules are typed objects with pattern matching, agent assignment, priority, and tier classification. The coordinator evaluates rules deterministically, and the casting engine tracks assignment history to balance workload.

**Agent lifecycle** is now explicit. Agents are spawned with a compiled charter, a resolved model, and a scoped tool set. The runtime manages health checks, cost tracking, and telemetry per agent.

**Distribution** is built in. `BundleBuilder` produces single-file bundles via esbuild. `NpmPackageBuilder` generates publish-ready packages. The marketplace registry lets teams discover and install shared configurations.

## Backward Compatibility

Squad uses the `.squad/` directory as the standard for all team state. The system provides migration tools to convert legacy configurations to the typed config format. A dedicated migration path converts markdown routing rules into typed `RoutingRule[]` objects.

## By the Numbers

- **7 milestones** (M0–M6), shipped over the course of the replatform
- **1400+ automated tests** covering config, routing, casting, lifecycle, distribution, and sharing
- **14 source modules** with strict TypeScript and ESM throughout
- **Zero runtime dependencies** beyond `@github/copilot-sdk`

## What's Next

v0.6.0 is the launch release. The marketplace will gain publish support in v0.7. We're exploring richer agent-to-agent communication, persistent memory across sessions, and community-contributed skill packs. The typed foundation makes all of this possible without breaking existing teams.

The replatform was a bet on developer experience. We think it pays off.
