# The raia × AI Coding Agent Playbook

**Use [raia](https://raiaai.com) agents and an AI coding agent as one evidence-to-delivery system: shared agents brief the work, humans make the decisions, code and documentation ship together, and every merge refreshes organizational knowledge.**

> **In one sentence:** this repository explains how a product team uses raia agents while building software; the separate [raia Agent DevKit](https://github.com/raia-ai/raia-agent-devkit) is the toolchain for building the agents themselves.

The playbook is an adoption system, not just a list of ideas. It combines a minimum operating loop, 12 advanced plays across development, support, and documentation, role guidance, governance controls, measurement, and reusable templates.

| This playbook is | This playbook is not |
|---|---|
| A cross-functional operating model for product, engineering, support, documentation, and platform teams | An autonomous software-development system or a replacement for human review |
| A set of repeatable practices that connect raia knowledge to repositories and delivery workflows | The runtime, management API, or implementation of the raia platform |
| Harness-neutral guidance that uses Claude Code as the reference coding agent | A Claude-only framework; any MCP-capable coding tool can implement the same loop |
| A path from a small pilot to a measured, governed rollout | A promise that every illustrative automation is safe to enable without local review |

## Choose your starting point

| If you are… | Start with… |
|---|---|
| Evaluating the approach | [The thesis](#the-thesis), [the minimum operating loop](#the-minimum-operating-loop), and [how you will know it is working](#how-youll-know-its-working) |
| Running a pilot | [Foundation](#foundation-one-time-setup), then adopt A2, A4, C1, and B1 in one repository |
| A developer | A2 agent-briefed planning, A3 in-session questions, A4 spec-aware review, and C2 docs from the diff |
| A product, support, or docs owner | [Role cards](#role-cards--what-each-person-actually-does) and the matching track |
| Building or releasing a raia agent | [AI-DLC Playbook and Agent DevKit](docs/agent-devkit-boundary.md), then use the [dedicated DevKit repository](https://github.com/raia-ai/raia-agent-devkit) |

> **Tooling note:** [Claude Code](https://claude.com/claude-code) is the reference implementation because it spans CLI, IDE, and headless CI use. Every play that touches a coding agent relies on two portable capabilities: an **MCP client** and a **repository-level instruction file**. Cursor, Windsurf, Copilot, or an equivalent MCP-capable tool can implement the same practices with its own configuration format.

## Contents of this repository

| Path | What it is |
|---|---|
| `README.md` | The canonical playbook and operating model |
| `docs/agent-devkit-boundary.md` | The exact boundary between using agents in software delivery and building the agents themselves |
| `docs/quick-starts.md` | First-session actions and stop conditions for each role |
| `docs/maturity-model.md` | Observable adoption levels and evidence required to advance |
| `docs/measurement.md` | Outcome definitions, failure taxonomy, and decision rules |
| `docs/governance.md` | Permissions, data boundaries, automation levels, and recovery controls |
| `docs/lifecycle-map.html` | Archived visual map of the original AI-DLC loop; use this README for current controls |
| `docs/playbook.html` | Archived styled rendering of the original playbook; use this README for current guidance |
| `templates/` | Drop-in MCP, repository-instruction, pilot-brief, and scorecard templates |
| `examples/golden-path/` | A credential-free, executable Ground → Verify reference with deterministic evidence |
| `workflows/knowledge-refresh.yml` | A fail-closed, plan-first reference for the C1 knowledge-refresh workflow |
| `skills/spec-review/` | The A4 spec-aware review skill for Claude Code |
| `docs/presentation-guide.md` | Slide-by-slide source material for presenting the playbook |
| `docs/raia-ai-dlc-presentation.pptx` | Pre-v0.2 presentation snapshot; regenerate from the updated guide before external use |

> **Rendered-artifact note:** the HTML and presentation files are communication aids. `README.md` and the linked Markdown guides are the maintained sources of truth.

### Validate the playbook

Run the dependency-free repository validator before opening a pull request:

```bash
node scripts/validate-playbook.mjs
```

It checks required artifacts, internal links, JSON and JavaScript syntax, credential patterns, the single-source DevKit boundary, the complete golden path, and the fail-closed knowledge-refresh planner.

---

## The thesis

raia and your coding agent are complementary halves of an AI development lifecycle (AI DLC):

- **raia** holds the organization's knowledge — agents trained on large document volumes in vector stores via raia Command — and talks to everyone through Copilot, Live Chat, Teams, the browser extension, MCP, and the REST API.
- **The coding agent** (Claude Code or equivalent) holds the repository and does the engineering: plan, build, test, review, ship.

Left unconnected, neither system learns from the other. The integration goal is a closed circuit: **agents brief the code, and shipped code retrains the agents.**

---

## The minimum operating loop

Start with one repository, one product area, and one small group. Do not begin with scheduled issue filing or autonomous pull requests. Prove this loop first:

| Step | Human responsibility | Agent or automation responsibility | Evidence produced |
|---|---|---|---|
| **1. Ground** | A product owner chooses the problem and verifies the customer evidence | The Support & Docs Agent retrieves recurring questions, friction, and representative examples | A short evidence note linked from the specification |
| **2. Specify** | The product owner decides scope and acceptance criteria | The Product Agent identifies related policies, prior decisions, and open ambiguity | A versioned Markdown specification in the repository |
| **3. Plan** | A developer selects the approach and resolves conflicts | The coding agent queries Product and Codebase Agents before proposing a plan | A reviewed plan citing product and code constraints |
| **4. Build** | The developer owns the implementation and test strategy | The coding agent makes mechanical changes and keeps documentation in the branch | Code, tests, and documentation in one change set |
| **5. Review** | A human approves or rejects the pull request | The spec-review gate reports confirmed mismatches and uncovered specification gaps | Review evidence attached to the pull request |
| **6. Refresh** | The documentation or platform owner approves the destination and live-apply gate | Post-merge automation produces an immutable refresh plan; an approved adapter applies it without deleting the last known-good source first | A plan and, when live apply is enabled, a sync receipt tied to the merge commit |
| **7. Verify** | The product or support owner decides whether the answer is acceptable | A repeatable smoke check asks about the newly shipped behavior and records retrieval evidence | A pass/fail freshness result and, when needed, a retraining issue |

The pilot is successful only when a real change completes all seven steps. Once that happens consistently, add the broader support, triage, and automation plays.

Before connecting a live system, run the [credential-free golden path](examples/golden-path/README.md):

```bash
cd examples/golden-path
npm test
npm run dry-run
```

It exercises the complete evidence chain and writes only a local sync preview by default.

---

## Operating principles

1. **One brain per domain, not per person.** Knowledge lives in named raia agents (Codebase, Product, Support/Docs) trained in raia Command — never in someone's head, a stale wiki, or a private chat. Tools and people both query the same agents.
2. **Merging triggers retraining.** Any merge that changes behavior must produce an immutable knowledge-refresh plan. After the write path is contract-tested and explicitly approved, a protected adapter applies that plan, retains a receipt, and verifies freshness. A successful merge alone never proves that the agent learned the change.
3. **Agents brief, humans decide, the coding agent executes.** raia agents supply context and evidence; PMs and developers make the calls; the coding agent does the mechanical work. Escalation paths (Copilot takeover, PR review) stay human at every step.
4. **Write once, near the code.** Specs, ADRs, and docs live in the repo as Markdown. From there, reviewed pipelines can route approved sources to vector stores and documentation sites. Never author knowledge directly in a place only one system can read.

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
3. Commit the finished spec as Markdown in the repo (`docs/specs/`) — Play C1 includes it in the governed knowledge-refresh plan after merge.

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

**Who:** CI planner + Documentation or Platform owner + Support lead · **When:** every release · **Where:** CI → protected adapter → raia Command

Play C1 creates a reviewable refresh plan for release notes and changed docs. Once an approved live adapter applies that plan and retains a receipt, the support lead verifies that the Support & Docs Agent actually learned the change:

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

### C1 — Merge triggers a governed knowledge refresh (the keystone play)

**Who:** CI planner + approved write-path owner · **When:** every merge to main · **Where:** GitHub Actions → protected adapter → raia API

The public reference, [`workflows/knowledge-refresh.yml`](workflows/knowledge-refresh.yml), inspects changed approved sources and emits an immutable plan artifact. It deliberately performs no remote write and requires no raia credential. A team enables live apply only after pinning its regional OpenAPI contract, approving destination routing, protecting the write environment, and proving recovery and freshness checks.

- **Route by audience:** `docs/` + ADRs → Codebase Agent; specs + release notes → Product Agent; user-facing docs + changelog → Support & Docs Agent. Routing is an explicit policy, never inferred from a secret or raw agent ID.
- **Replace safely:** upload and verify the new source before removing the superseded source. Retain the previous file identity and a receipt so failed indexing cannot leave the agent with no approved copy.

> **Success signal:** the refresh plan is traceable to the merge, the live receipt matches the approved destination, and representative questions retrieve the new source. A successful upload without retrieval verification is not a pass.

### C2 — Docs written by the diff

**Who:** Developer + coding agent · **When:** any behavior-changing PR · **Where:** same branch

Documentation is part of the PR, and the coding agent writes the first draft from the diff — it already knows what changed and why.

1. Before opening the PR: "Update the affected docs under `docs/` and draft the changelog entry for this change."
2. If your repos enforce docs discipline (generated references, validation scripts), the agent runs those checks as part of the task — and adding such checks is itself a worthwhile first move.
3. The reviewer evaluates docs and code as one unit; merge triggers C1’s plan-first refresh and the approved write path propagates the change.

> **Success signal:** docs PRs stop existing as a separate (perpetually late) category; docs-freshness complaints from support drop.

### C3 — Gap-driven docs backlog

**Who:** Docs owner (automated assist) · **When:** weekly · **Where:** Copilot insights + coding agent

The docs backlog comes from real retrieval failures, not guesses:

1. Weekly, pull the questions where the Support & Docs Agent scored poorly or retrieved nothing relevant (Copilot Admin Mode shows retrievals and confidence).
2. Feed the list to a coding-agent session: "For each gap, find the authoritative answer in the codebase and draft the missing doc page."
3. A human edits and merges the correction; C1 plans the refresh, the approved adapter applies it, and the owner verifies the original failed question. For bulk legacy content, raia's [convert](https://convert.raia.run) and [PDF-splitter](https://pdf.raia.run) tools prepare files for review and upload.

> **Success signal:** the same question never fails twice; "no relevant retrieval" rate declines month over month.

---

## Role cards — what each person actually does

Use the [role-based quick starts](docs/quick-starts.md) for first-session actions, required evidence, and stop conditions.

| Role | Focus | Plays |
|---|---|---|
| **Developer** | Plan with grounded agent context, verify against current code, keep tests and documentation in the same branch, and report stale answers | A2 A3 A4 C2 |
| **Product manager** | Own product truth, decide scope and ambiguity, support specifications with evidence, and review agent quality | A1 F4 B3 |
| **Support lead** | Verify customer-facing behavior, classify failures, preserve escalation quality, and close the loop against the original case | B1 B2 B3 |
| **Documentation owner** | Own source quality and routing, approve knowledge refresh, remove superseded sources, and verify retrieval | C1 C3 |
| **Platform owner** | Scope credentials, protect write paths, preserve traceability, and test disablement, rotation, and recovery | F2 C1 B2 |

---

## Governance & safety rails

The full [governance, security, and recovery guide](docs/governance.md) defines the authority matrix, credential separation, sensitive-data boundary, automation levels, write-path review, and incident procedure.

| Non-negotiable | Operational rule |
|---|---|
| **Read before write** | Prove the workflow in read-only or dry-run mode before granting mutation permission |
| **Scoped credentials** | Separate MCP reads, conversation tests, knowledge writes, repository writes, and future agent-management access |
| **No raw sensitive payloads in coding context** | Keep customer data in approved systems and use redacted patterns, synthetic fixtures, or governed synthesis |
| **Humans gate impact** | People approve merges, product decisions, customer commitments, knowledge-write enablement, and production actions |
| **Fail closed and recover** | Ambiguous routing, stale state, missing review, or failed verification stops the workflow; disablement and credential rotation are tested |

## How you'll know it's working

Use the [measurement framework](docs/measurement.md) and copy the [pilot scorecard](templates/pilot-scorecard.md). Capture a baseline before setting a target; the same metric name is not comparable when teams use different definitions or samples.

| Outcome | Core measure | Desired direction |
|---|---|---|
| Developers reach a supported implementation approach sooner | Time to credible plan and evidence-supported plan rate | Time down; support rate up |
| Product ambiguity surfaces before customer impact | Specification-gap catch point | Moves toward planning and pull-request review |
| Documentation ships with behavior | Documentation co-ship rate | Up |
| Agents learn current approved sources promptly | Knowledge lag and freshness pass rate | Lag down; pass rate up |
| Poor answers become closed corrective work | Unsupported-answer rate and correction closure rate | Unsupported rate down; closure rate up |
| Support escalations become more actionable | Escalation completeness | Up |

---

## Maturity and rollout gates

The [AI-DLC maturity model](docs/maturity-model.md) distinguishes five operating states: ad hoc, connected, repeatable, measured, and closed loop. A team advances only when every control for the current level is consistently evidenced. API access or a larger automation surface does not constitute maturity.

| Current state | Required next proof |
|---|---|
| Ad hoc | Named owners, approved sources, scoped repository connection, and a failure-reporting path |
| Connected | One real change completes the full minimum operating loop |
| Repeatable | Baselines, failure classification, and recurring scorecard review |
| Measured | Production failures create owned corrective work and recovery paths are exercised |
| Closed loop | Expansion preserves ownership, controls, and verification in each new domain |

---

## 30 / 60 / 90 rollout

These are review horizons, not permission deadlines. A team remains at the current horizon until its exit evidence is complete.

**Days 1–30 · Foundation — connect safely and complete one loop.** Name owners, inventory approved sources, configure one repository with read-only MCP access, capture a baseline, and run one real change through Ground → Specify → Plan → Build → Review → Refresh → Verify. Knowledge writes remain in dry-run mode until the platform and documentation owners approve the exact destination and recovery path.

**Days 31–60 · Repeatability — make the same loop work without heroics.** Complete additional changes in the same domain, make documentation co-ship routine, review failures weekly, and enable only the approved knowledge-write path behind a protected environment. Use the scorecard to distinguish real improvement from added process.

**Days 61–90 · Evidence-based expansion — widen, change, narrow, or stop.** Review outcome and control evidence. Widen to at most one additional repository or domain only if ownership and recovery capacity scale with it. Scheduled triage, issue filing, and draft-pull-request automation stay at proposal or dry-run level until they separately pass the governance gates.

---

## Layer 2 — Agents as code: the raia Agent DevKit

This playbook is **Layer 1**: using raia agents inside the software-development lifecycle. The [raia Agent DevKit](https://github.com/raia-ai/raia-agent-devkit) is **Layer 2**: applying version control, deterministic validation, evaluation gates, and staged releases to the agents themselves.

| | Layer 1 — this playbook | Layer 2 — Agent DevKit |
|---|---|---|
| Versioned artifact | Application code, specifications, and documentation | Agent manifest, prompts, tools, knowledge references, guardrails, and evaluations |
| Learning flow | A merge refreshes organizational knowledge and is followed by a freshness check | Reviewed production traces become regression evaluations for a future agent version |
| Review gate | Human-reviewed pull request plus specification-conformance evidence | Semantic diff, deterministic validation, evaluation evidence, and release policy |
| Deployment boundary | Automation may prepare work; humans gate every merge | The coding harness may target staging; production remains outside the harness |

Read [AI-DLC Playbook and Agent DevKit](docs/agent-devkit-boundary.md) for the detailed boundary. The dedicated DevKit repository is the **only canonical source** for its specification, contracts, examples, implementation status, and code. This repository deliberately does not carry an editable copy.

> **Current-status note:** the DevKit repository contains an implementation-ready specification and an initial WP0/WP1 plan. Check its own status tracker before presenting the CLI, SDK, plugin, or management provider as shipped functionality.

---

*Written for teams adopting raia as their agentic platform, with Claude Code as the reference coding agent. Every play transfers to an MCP-capable equivalent. Configuration snippets, automation thresholds, and API examples are starting points: verify them against your environment, keep write paths disabled until reviewed, and tune the operating model with evidence from the pilot.*
