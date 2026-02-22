# Squad SDK v1 — Internal Documentation

> **⚠️ INTERNAL ONLY — DO NOT PUBLISH**
>
> These docs describe the Squad SDK v1 replatform. They are **not public**.
> The public Squad docs and blog live in the [squad repo](https://github.com/bradygaster/squad) under `docs/`.
> Never reference v1, the SDK replatform, or any content from this folder in the public beta docs or blog.

## Structure

```
docs/
├── guide/          # v1 user guide (installation, config, usage)
├── api/            # TypeScript API reference
├── migration/      # Beta → v1 migration guides
├── architecture/   # Internal architecture docs
└── blog/           # v1 development blog (internal, not published)
```

## Version Separation Policy

| Concern | Beta (public) | v1 SDK (internal) |
|---------|--------------|-------------------|
| Repo | `bradygaster/squad` (beta) | `bradygaster/squad-pr` (v1 SDK) |
| Docs | `squad/docs/` | `squad-sdk/docs/` |
| Blog | `squad/docs/blog/` | `squad-sdk/docs/blog/` |
| Published | Yes — docs site | **No** — repo only |
| References v1? | **Never** | Yes |

## When v1 Ships

When v1 is ready for GA:
1. v1 docs become the new public docs
2. Beta docs are archived under `docs/archive/beta/`
3. Migration guide bridges beta → v1
4. Blog posts from beta are preserved as historical record
