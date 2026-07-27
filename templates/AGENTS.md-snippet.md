# AGENTS.md / .cursorrules snippet — raia knowledge agents

Tool-agnostic variant of the instruction-file guidance. Copy into whatever
repo-level instruction file your coding agent reads (`AGENTS.md`,
`.cursorrules`, `.windsurfrules`, etc.). Adjust server names to match your
MCP configuration.

---

## raia knowledge agents (MCP)

This repository is connected to raia knowledge agents over MCP:

- `raia-product` — product specs, policies, acceptance criteria, and the
  rationale behind requirements. Query it before planning any feature work.
- `raia-codebase` — architecture decisions, ADRs, and legacy intent. Query
  it when code intent is unclear and no document in the repo explains it.

Rules:

1. Agent answers are context, not authority. Verify any claim about code
   against the code itself before acting on it.
2. Do not paste customer conversation transcripts or PII into sessions;
   ask the agent for synthesized answers instead.
3. Surface wrong or stale agent answers to the user so they can be filed
   as retraining items.
