# Closet Capsule Designer

> Build minimalist capsule wardrobes from existing clothes

## Who This Is For

🎨 Fashion/Everyone

## The Team

| Agent | Role | What They Do |
|-------|------|-------------|
| Stylist | Writer | Domain expert for closet capsule designer |
| ColorCoordinator | Grader | Domain expert for closet capsule designer |
| MixMatchExpert | Updater | Domain expert for closet capsule designer |

## How It Works

1. **Write** — Stylist reads `spec.md` and produces the first draft
2. **Grade** — ColorCoordinator evaluates the output (1-100 score)
3. **Update** — If score < 90%, MixMatchExpert improves the output
4. **Repeat** — Loop continues until quality threshold is met

## See It In Action

Here's what the agent team produced for Jessica, who had 150 pieces but "nothing to wear":

> **Your 28-piece capsule creates 52+ outfits** from a 5-color palette (Cream, Camel, Chocolate Brown, Terracotta, Olive Green). Every piece pairs with every other piece—no more orphan items. Remove 43 pieces, buy 6 gap items ($312), save 15 minutes every morning.

> 📄 **[See the full example output →](examples/sample-output.md)**

## Running This Sample

```bash
npm install
npm start
```

## Output

Results are saved in the `output/` directory.
