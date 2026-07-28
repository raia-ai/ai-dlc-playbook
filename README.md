# The raia × AI Coding Agent Playbook

**How any development team can pair [raia](https://raiaai.com) — as its centralized agentic platform — with an AI coding agent to run the development lifecycle, keep support answers current, and make documentation a byproduct of shipping instead of a chore.**

Twelve plays across three tracks, plus the one-time foundation that makes them all work.

> **Tooling note:** [Claude Code](https://claude.com/claude-code) is the reference implementation throughout because it spans CLI, IDE, and headless CI use. Every play that touches the coding agent relies on only two standard capabilities — an **MCP client** and a **repo-level instruction file** — so Cursor, Windsurf, Copilot, or any equivalent MCP-capable tool can run the same plays with its own config format.

**Contents of this repo**

| Path | What it is |
|---|---|
| `README.md` | The playbook (canonical source — this file) |
| `docs/lifecycle-map.html` | Visual: the AI DLC loop, PM and developer swimlanes |
| `docs/playbook.html` | Styled, shareable rendering of this playbook |
| `templates/` | Drop-in configs: `.mcp.json`, IDE variant, instruction-file snippets |
| `workflows/knowledge-push.yml` | The C1 "merge = retrain" CI job, ready to adapt |
| `skills/spec-review/` | The A4 spec-aware review skill for Claude Code |
| `docs/presentation-guide.md` | Slide-by-slide source material for presenting this playbook |
| `docs/raia-ai-dlc-presentation.pptx` | The 16-slide deck with speaker notes |
| `docs/devkit-spec/` | **Layer 2:** build spec for the raia Agent DevKit — the DLC applied to raia agents themselves (see below) |

---

## The thesis

raia and your coding agent are complementary halves of an AI development lifecycle (AI DLC):

- **raia** holds the organization's knowledge — agents trained on large document volumes in vector stores via raia Command — and talks to everyone through Copilot, Live Chat, Teams, the browser extension, MCP, and the REST API.
- **The coding agent** (Claude Code or equivalent) holds the repository and does the engineering: plan, build, test, review, ship.

Left unconnected, neither system learns from the other. The integration goal is a closed circuit: **agents brief the code, and shipped code retrains the agents.**

---

## Operating principles

1. **One brain per domain, not per person.** Knowledge lives in named raia agents (Codebase, Product, Support/Docs) trained in raia Command — never in someone's head, a stale wiki, or a private chat. Tools and people both query the same agents.
2. **Merging is retraining.** Any merge that changes behavior must update the vector stores in the same pipeline run. If the Support Agent can answer questions about a feature the day it ships, the loop is closed; if not, a play was skipped.
3. **Agents brief, humans decide, the coding agent executes.** raia agents supply context and evidence; PMs and developers make the calls; the coding agent does the mechanical work. Escalation paths (Copilot takeover, PR review) stay human at every step.
4. **Write once, near the code.** Specs, ADRs, and docs live in the repo as Markdown. From there they flow automatically to vector stores and docs sites. Never author knowledge directly in a place only one system can read.

---

## Foundation (one-time setup)

### F1 — Stand up the agent roster

Three agents cover the whole playbook. Build them in Launch Pad, train them in raia Command, and enable the **MCP Skill** on each so tools can reach them.

| Agent | Trained on (raia Command) | Queried by |
|---|---|---|
| **Codebase Agent** (per repo or shared) | Architecture docs, ADRs, generated references (your repos' `docs/` folders), API contract docs, migration guides | Coding-agent sessions, IDE chats, new-hire onboarding |
| **Product Agent** | PRDs, strategy docs, acceptance-criteria history, release notes, roadmap, pricing/policy rules | PMs drafting specs, coding-agent plan mode, spec-aware review |
| **Support & Docs Agent** | Help-center articles, docs-site export, release notes, resolved-ticket summaries, known-issues list | Customers (Live Chat), support staff (Copilot), weekly triage routine |

*Optional later:* front all three with raia's **Orchestrator Skill** so one endpoint routes questions to the right specialist — callers then need only one key.

### F2 — Connect your coding agent to raia (per repo)

With Claude Code, commit a `.mcp.json` at each repo root — every session (terminal, desktop, or web) picks it up automatically; other tools have an equivalent per-project MCP config. Use the key from the agent's **MCP Skill** (not the Agent-Secret-Key), passed **without** a `Bearer` prefix, and keep it in an environment variable rather than the file.

See [`templates/.mcp.json`](templates/.mcp.json).

Then tell the agent *when* to use the tools — add a short section to each repo's instruction file (`CLAUDE.md` for Claude Code; `AGENTS.md`, `.cursorrules`, or equivalent for other tools). See [`templates/CLAUDE.md-snippet.md`](templates/CLAUDE.md-snippet.md) and [`templates/AGENTS.md-snippet.md`](templates/AGENTS.md-snippet.md).

### F3 — Connect the IDE (VS Code / Cursor / Windsurf)

For engineers who live in the IDE rather than the CLI, add the same server to `.vscode/mcp.json` (or via **MCP: Add Server**). Same endpoint, same key rules. Verify with **MCP: List Servers → Start** until logs show `Connection state: Running`. See [`templates/vscode-mcp.json`](templates/vscode-mcp.json).

> **Key hygiene:** MCP Skill key ≠ Agent-Secret-Key. The MCP key goes in `Authorization` with no `Bearer` prefix and no extra spaces. The Agent-Secret-Key is only for the REST API (`Agent-Secret-Key` header). Both are scoped per agent, so a leak affects one agent only — rotate from Launch Pad.

### F4 — Give PM agents eyes on the dev toolchain

In raia Command, add MCP *integrations* (client mode) on the Product Agent pointing at GitHub and Jira MCP servers. Use "Get Available Tools" and expose only **read** tools (list/search issues, PRs, commits) — status questions need no write access. Now "what shipped this week?" is answerable in Copilot, Teams, or the browser extension.

---

## Track A · Build — the development lifecycle

### A1 — Evidence-backed specs

**Who:** PM · **When:** every new feature or change request · **Where:** raia Copilot / Chat

Draft the PRD in conversation with the Product Agent instead of a blank page.

1. Ask the Support & Docs Agent for the customer evidence first: "top friction points related to X, with example conversations."
2. Draft with the Product Agent: it flags overlap with existing features and reuses acceptance-criteria patterns from past PRDs.
3. Commit the finished spec as Markdown in the repo (`docs/specs/`) — Play C1 syncs it to the vector store automatically.

> **Success signal:** every spec cites at least one piece of real usage evidence, and a developer can ask "why does this requirement exist?" and get an answer without a meeting.

### A2 — Agent-briefed planning

**Who:** Developer · **When:** starting any non-trivial task · **Where:** coding-agent plan mode

Never plan from the ticket text alone. Open the coding agent in plan mode and let it interrogate both agents before proposing an approach.

1. Prompt: "Plan the implementation of *ticket*. First query `raia-product` for the spec and constraints, and `raia-codebase` for prior art and architecture rationale."
2. Review the plan — it should cite both product truth (policy, acceptance criteria) and code truth (which service, which boundaries).
3. Disagreements between agent answers and actual code are findings: fix the doc or retrain the agent (Play C2).

> **Success signal:** fewer "built the wrong thing" reworks; plans reference constraints the developer didn't personally know.

### A3 — Domain questions stay in-session

**Who:** Developer · **When:** continuously while building · **Where:** coding agent / IDE chat

When an edge case, business rule, or "how do customers actually hit this?" question comes up mid-implementation, ask the connected agent instead of interrupting a human or guessing.

- Business rule → `raia-product` ("what's the refund window for annual plans?")
- Legacy intent → `raia-codebase` ("why does the message handler dedupe on external_id?")
- Real-world usage → Support & Docs Agent ("do customers use the SMS channel with attachments?")

> **Success signal:** measurable drop in chat interruptions per feature; agent answer-quality issues get filed as retraining items rather than ignored.

### A4 — Spec-aware review gate

**Who:** Developer (automated) · **When:** every PR · **Where:** coding-agent review + custom skill

Standard reviews check the code; this play also checks the *behavior against the spec*. Create a small repeatable workflow — a repo skill in Claude Code ([`skills/spec-review/`](skills/spec-review/)), or a saved prompt/command in your tool of choice — that:

1. Summarizes the diff's user-visible behavior changes.
2. Sends that summary to `raia-product`: "Does this match the agreed spec and policies? List mismatches."
3. Posts mismatches as PR comments alongside standard code-review and security-review output.

> **Success signal:** spec deviations caught at PR time, not in UAT; the skill's mismatch comments are actionable more than half the time.

### A5 — Weekly agent-assisted triage

**Who:** Eng lead (automated) · **When:** weekly, scheduled · **Where:** headless coding-agent routine

A scheduled session runs every Monday:

1. Queries the Support & Docs Agent: "new or growing problem patterns this week, with example conversations."
2. Cross-references the repos and recent releases to localize likely causes.
3. Files pre-investigated GitHub issues (suspected component, repro notes, first-seen version) and posts a digest to the team channel.

> **Success signal:** bugs enter the backlog already triaged; time-to-first-diagnosis drops for support-reported issues.

---

## Track B · Support — customers and operators

### B1 — Day-one support readiness

**Who:** automated (CI) + Support lead · **When:** every release · **Where:** CI → raia Command

Because Play C1 pushes release notes and changed docs to the Support & Docs Agent's vector store on merge, the agent can answer questions about a feature the day it ships. The support lead's job shifts to verification:

1. After each release, run 3–5 Copilot **simulations** asking about the new behavior.
2. Check Admin Mode to confirm the agent retrieved the new release notes, not stale articles.
3. Gaps become docs tickets (Play C3), not tribal-knowledge chat threads.

> **Success signal:** zero lag between "shipped" and "supportable"; escalation rate on new features trends down release over release.

### B2 — Escalation-to-issue pipeline

**Who:** automated + human takeover · **When:** bug-shaped escalations · **Where:** Live Chat → n8n → GitHub

When a Live Chat conversation escalates with a bug signature, an n8n flow has a triage agent extract structured details (steps, environment, severity, verbatim quote) and file a GitHub issue tagged `from-support`. For a narrow allowlisted class — copy errors, config mistakes — a headless coding-agent session picks the issue up and opens a **draft PR** for human review.

> **Guardrail:** the draft-PR automation starts with the narrowest possible class and widens only as the merge rate of its PRs proves out. Everything else stops at a well-formed issue.

> **Success signal:** support bugs arrive with repro steps ≥80% of the time; trivial fixes ship within a day of being reported.

### B3 — Feedback as structured QA

**Who:** Support operators · **When:** continuously · **Where:** raia Copilot feedback + scoring

Operators rate agent answers in Copilot as part of normal work. Weekly, the PM reviews the lowest-scored conversation clusters — these are either **knowledge gaps** (→ docs ticket, Play C3), **agent instruction issues** (→ Launch Pad edit), or **product problems** (→ backlog via Play A1). Every low score gets one of those three routes; none are dead ends.

> **Success signal:** feedback scores trend up; each week's low-score cluster produces at least one concrete ticket.

### B4 — Internal answer desk

**Who:** whole company · **When:** ad hoc · **Where:** browser extension, Teams, Copilot

Sales, CS, and leadership get the same agents through low-friction surfaces: the Chrome extension's slide-out drawer (with "read page content" for in-context questions), the Teams integration, or Copilot. One truth, many doors — nobody DMs an engineer for something the Codebase or Product Agent already knows.

> **Success signal:** "quick question" pings to engineering drop; extension/Teams query volume grows instead.

---

## Track C · Documentation — the flywheel

### C1 — Merge = retrain (the keystone play)

**Who:** automated (CI) · **When:** every merge to main · **Where:** GitHub Actions → raia API

One post-merge job per repo keeps the vector stores current. Because raia's pipeline works best on Markdown, keep docs as Markdown and the job is mostly plumbing. See [`workflows/knowledge-push.yml`](workflows/knowledge-push.yml).

- **Route by audience:** `docs/` + ADRs → Codebase Agent; specs + release notes → Product Agent; user-facing docs + changelog → Support & Docs Agent.
- **Delete-and-replace** superseded files (the API supports file removal) so retrieval never surfaces stale versions.

> **Success signal:** ask any agent about a feature merged yesterday — the answer reflects it. Spot-check weekly.

### C2 — Docs written by the diff

**Who:** Developer + coding agent · **When:** any behavior-changing PR · **Where:** same branch

Documentation is part of the PR, and the coding agent writes the first draft from the diff — it already knows what changed and why.

1. Before opening the PR: "Update the affected docs under `docs/` and draft the changelog entry for this change."
2. If your repos enforce docs discipline (generated references, validation scripts), the agent runs those checks as part of the task — and adding such checks is itself a worthwhile first move.
3. Reviewer reviews docs and code as one unit; merge triggers C1 and the knowledge propagates everywhere.

> **Success signal:** docs PRs stop existing as a separate (perpetually late) category; docs-freshness complaints from support drop.

### C3 — Gap-driven docs backlog

**Who:** Docs owner (automated assist) · **When:** weekly · **Where:** Copilot insights + coding agent

The docs backlog comes from real retrieval failures, not guesses:

1. Weekly, pull the questions where the Support & Docs Agent scored poorly or retrieved nothing relevant (Copilot Admin Mode shows retrievals and confidence).
2. Feed the list to a coding-agent session: "For each gap, find the authoritative answer in the codebase and draft the missing doc page."
3. Human edits, merges — C1 retrains the agent, closing the exact gap a customer hit. For bulk legacy content, raia's [convert](https://convert.raia.run) and [PDF-splitter](https://pdf.raia.run) tools prepare files for upload.

> **Success signal:** the same question never fails twice; "no relevant retrieval" rate declines month over month.

---

## Role cards — what each person actually does

| Role | Focus | Plays |
|---|---|---|
| **Developer** | Build with agents on tap; plan via A2, ask via A3; docs in the same PR (C2); trust but verify agent answers against code; file bad answers as retraining items | A2 A3 A4 C2 |
| **Product manager** | Own the shared brain; specs with evidence (A1); status via agent, not standup (F4); weekly feedback review (B3); owns Product Agent quality | A1 F4 B3 |
| **Support lead** | Verify, escalate, rate; post-release simulations (B1); tend the escalation pipeline (B2); rate answers while working (B3); owns Support Agent quality | B1 B2 B3 |
| **Docs owner** | Curate the flywheel; watch C1 pipeline health; run the weekly gap review (C3); keep vector stores deduplicated; owns routing rules (which doc → which agent) | C1 C3 |

---

## Governance & safety rails

- **Scoped keys, rotated.** Per-agent keys only (MCP Skill key for MCP, Agent-Secret-Key for REST); store in CI secrets and env vars, never in committed files; rotate from Launch Pad on any suspicion.
- **Read-only by default.** PM-agent integrations to GitHub/Jira expose read tools only. Write access (filing issues, PRs) belongs to audited automations — n8n flows and headless coding-agent sessions — not to conversational agents.
- **No sensitive payloads in prompts.** Customer PII stays in raia's governed stores (Auditor Skill on, retention configured). Don't paste conversation transcripts into coding-agent sessions; query the agent for synthesized answers instead.
- **Humans gate every merge.** Automation may draft PRs; it never merges them. The B2 draft-PR class is allowlisted and reviewed like any other change, and its scope grows only with demonstrated merge rate.

## How you'll know it's working

| Metric | Definition | Direction |
|---|---|---|
| Time-to-context | Minutes from "assigned" to "credible plan" | Falls sharply with A2/A3 |
| Knowledge lag | Time between merge and agents answering correctly about it | Target: same day (C1) |
| Escalation quality | % of support-filed bugs with usable repro steps | Target: ≥80% (B2) |
| Retrieval failure rate | % of agent queries with no relevant retrieval | Declines monthly (C3) |
| Interrupt load | Ad-hoc "quick question" pings to engineers | Migrates to agent surfaces (B4) |
| Spec-mismatch catch point | Where deviations surface | PR review (good) vs UAT/production (bad) (A4) |

---

## 30 / 60 / 90 rollout

**Days 1–30 · Foundation — wire it up, prove the loop**
- Build the three agents; train on existing docs (F1)
- Commit MCP config + instruction-file guidance to every active repo (F2, F3)
- Ship the C1 knowledge-push workflow in one repo
- Developers start A2/A3 habitually

**Days 31–60 · Habits — make the plays routine**
- C1 in all repos; C2 becomes PR convention
- PM specs via A1; agent status via F4
- Support simulations after each release (B1); feedback loop running (B3)
- First weekly triage routine (A5) and gap review (C3)

**Days 61–90 · Automation — close the outer loop**
- Spec-aware review skill on PRs (A4)
- Escalation-to-issue pipeline live; draft-PR class piloted (B2)
- Company-wide answer desk rollout (B4)
- Review metrics; decide what to widen or kill

---

## Layer 2 — Agents as code: the raia Agent DevKit

This playbook covers **layer 1**: using raia agents inside the *software* development lifecycle. The natural next question is who applies that same discipline to the **agents themselves** — today an agent's prompt, skills, knowledge, and guardrails are edited live in Launch Pad, with no diff, no review, no release gate, and no rollback.

[`docs/devkit-spec/`](docs/devkit-spec/) contains the implementation-ready build specification for the **raia Agent DevKit**: a harness-neutral CLI/SDK (plus a thin Claude Code plugin) that manages a raia agent as versioned software through a raia-native lifecycle — **define → diff → validate → evaluate → review → release → stage → observe → learn**. Key properties: deterministic semantic diffs of agent behavior, evaluation gates with immutable evidence, idempotent releases, staging-only deployment from the coding harness, and a fail-closed security model.

The two layers close the same loop at different levels:

| | Layer 1 — this playbook | Layer 2 — Agent DevKit |
|---|---|---|
| Versioned artifact | Application code | The raia agent itself (manifest, prompts, evals) |
| Knowledge flow | Merge retrains the org's agents (C1) | Traces become regression evals (`raia learn`) |
| Review gate | Spec-aware PR review (A4) | Semantic diff + evaluation gates + release policy |
| Deploy safety | Humans gate every merge | Immutable candidates, staging-only from Claude |

**Status:** complete, validated specification package (36 files — normative schemas and contracts, the vendored raia external OpenAPI, the `helpdesk-agent` reference example, lifecycle framework, decision log, and acceptance checklist). Package integrity is pinned in `PACKAGE_MANIFEST.sha256`, and its own validators pass (`validate_package.py`, `preflight.mjs`). Implementation starts by placing this package at `docs/raia-devkit-spec/` in a dedicated repository and running [`docs/devkit-spec/CLAUDE_CODE_START_PROMPT.md`](docs/devkit-spec/CLAUDE_CODE_START_PROMPT.md) (WP0 + WP1 first).

---

*Written for any development team adopting raia as its agentic platform, with Claude Code as the reference coding agent — every play transfers to any MCP-capable equivalent. Endpoints and key rules taken from the raia Developer Hub (MCP: `api.raia2.com/mcp`; REST: Swagger at `api.raia2.com/api/external/docs`). The C1 workflow is a sketch — confirm the exact vector-store upload endpoint against the [OpenAPI spec](https://api.raia2.com/api/external/docs/openapi.json) before implementing. Snippets and play thresholds are starting points; tune them after your first 30 days.*
