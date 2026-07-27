# CLAUDE.md snippet — raia knowledge agents

Copy the section below into your repository's `CLAUDE.md` so Claude Code knows
*when* to consult the raia agents connected via `.mcp.json`. Adjust server
names to match your config.

---

## raia knowledge agents (MCP)

- Before planning a feature, query `raia-product` for the spec, its
  rationale, and any policy constraints.
- When code intent is unclear and no doc explains it, ask `raia-codebase`
  before guessing from the source alone.
- Treat agent answers as context, not authority: verify claims about code
  against the code itself.
- If an agent gives a wrong or stale answer, note it in your final response
  so it can be filed as a retraining item.
