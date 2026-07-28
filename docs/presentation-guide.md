# Presentation Guide — raia Agents in the AI Development Lifecycle

Source material for building a presentation on how development teams get the
most out of raia agents — in the AI DLC specifically, and in development work
generally. Everything here is drawn from the [playbook](../README.md) and the
[lifecycle map](lifecycle-map.html); this document arranges it as a story you
can present.

**How to use:** pick your audience cut (below), lift the slide outline
section by section, and use the speaker notes as your talk track. Soundbites
and objection-handling are at the end.

> **Artifact status:** this guide has been aligned with the v0.2 operating model. The bundled `.pptx` predates these changes and must be regenerated before external use.

---

## 1 · Audience cuts

One deck, three trims. Build the full 16-slide version, then hide slides per
audience:

| Audience | Length | Keep | Cut |
|---|---|---|---|
| **Executive / leadership** | 10 min | Slides 1–5, 8, 13–16 | Deep-dive plays, config slides |
| **Development team** (adopting the playbook) | 30–45 min | All slides + both demos | Soften the "why AI" framing (they know) |
| **Customer / prospect** (raia sales & enablement) | 20 min | 1–6, 9–12, 14, 16 | Internal rollout details; add pricing/next-steps slide |

---

## 2 · The narrative arc (5 beats)

Every cut follows the same spine:

1. **The gap.** Teams adopted AI in two disconnected places: coding agents
   in the IDE, and knowledge/chat agents for the business. Neither learns
   from the other. Developers still interrupt humans for domain answers;
   support still answers from stale docs; PMs still chase status.
2. **The vision.** A closed loop — *agents brief the code, and governed
   refreshes teach the agents what shipped.* raia is the organization's brain; the coding agent
   (Claude Code or equivalent) is the hands in the repository.
3. **The mechanics.** Four wires can connect the two sides: MCP server mode,
   the published REST API, MCP client mode, and governed webhooks or workflows.
   Read access is the starting point; every write path requires separate review.
4. **The practice.** A seven-step minimum loop plus twelve advanced plays across
   Build, Support, and Documentation — each with an owner, evidence, and a stop condition.
5. **The ask.** An evidence-gated pilot that starts with one repository, one
   domain, and no live write until routing, recovery, and verification are proven.

---

## 3 · Slide-by-slide outline

### Slide 1 — Title
- **Title:** "Closing the loop: raia agents in the AI development lifecycle"
- **Subtitle:** How product knowledge flows into every coding session — and
  everything shipped flows back into the agents.
- **Visual:** the lifecycle-map hero, or a simple two-node loop diagram
  (raia ⟷ codebase).

### Slide 2 — The problem: two AI revolutions that don't talk
- Coding agents (Claude Code, Cursor, Copilot) transformed the IDE.
- Knowledge agents (raia) transformed support, sales, and operations.
- **But:** what the PM knows lives in vector stores; what the codebase knows
  lives in git. Neither system learns from the other automatically.
- **Speaker note:** make it concrete — "A developer implementing refund logic
  today has three options: read a possibly stale wiki, interrupt a human, or
  guess. All three are failure modes we've normalized."

### Slide 3 — The costs of the gap (pick 3 for your org)
- Developers interrupt experts for domain answers; experts context-switch.
- Support answers lag releases by days or weeks.
- Docs are perpetually behind because they're a separate chore.
- PMs chase status in standups instead of reading it on demand.
- New hires take months to absorb tribal knowledge.
- **Visual:** simple icon row; no chart needed.

### Slide 4 — The thesis
- **On slide, large:** "Agents brief the code. Shipped code retrains the
  agents."
- raia = the organization's **brain**: centralized agents trained on large
  document volumes (vector stores in raia Command), reachable from every
  surface — Copilot, Live Chat, Teams, browser extension, MCP, API.
- Coding agent = the **hands**: plans, implements, tests, reviews, ships,
  inside the actual repository.
- **Speaker note:** stress *centralized*. The alternative — every tool with
  its own RAG, every team with its own bot — recreates the silo problem
  one level down.

### Slide 5 — The system map (four wires)
- **Visual:** the system-map section of the lifecycle map (raia platform |
  integration fabric | dev toolchain).
- Wire 1 — **MCP server mode**: coding agents query raia agents as tools. *Live today.*
- Wire 2 — **REST API**: CI creates a refresh plan; a protected, contract-tested adapter can apply approved sources to a vector store.
- Wire 3 — **MCP client mode**: raia agents read GitHub/Jira for PM status questions.
- Wire 4 — **Webhooks + n8n**: events trigger sessions; sessions trigger agents.
- **Speaker note:** "Start with read-only context and a local refresh plan. Live writes are a separate capability with a separate credential, approval gate, receipt, and recovery test."

### Slide 6 — The agent roster (the one-time investment)
- Three agents cover everything:
  - **Codebase Agent** — architecture docs, ADRs, API contracts → answers "why is the code like this?"
  - **Product Agent** — PRDs, policies, acceptance criteria → answers "what should it do, and why?"
  - **Support & Docs Agent** — help center, release notes, resolved tickets → answers customers and support staff.
- Built in Launch Pad, trained in raia Command, exposed via the MCP Skill.
- **Speaker note:** "One brain per domain, not per person. Optionally front
  all three with raia's Orchestrator so callers need a single endpoint."

### Slide 7 — Setup is two files and a key (dev-team cut)
- `.mcp.json` at the repo root → every coding-agent session opens connected.
- An instruction-file section (`CLAUDE.md` / `AGENTS.md` / `.cursorrules`)
  → the agent knows *when* to consult raia.
- Key hygiene: MCP Skill key (no `Bearer` prefix) ≠ Agent-Secret-Key (REST
  only); both per-agent scoped, rotated from Launch Pad.
- **Visual:** the two config snippets from `templates/`, side by side.

### Slide 8 — The AI DLC loop
- **Visual:** the seven-phase swimlane from the lifecycle map — PM lane,
  phase spine, developer lane.
- Walk the loop in 60 seconds: Discover (real usage signal) → Define
  (evidence-backed specs) → Plan (agent-briefed) → Build (domain answers
  in-session) → Verify (spec-aware review + Copilot simulations) → Ship
  (merge triggers a governed refresh) → Learn (usage becomes next backlog).
- **Speaker note:** the two green crossings are the whole point — knowledge
  crossing from raia into the plan, and from the merge back into raia.

### Slide 9 — Developer plays (Track A highlights)
- **A2 Agent-briefed planning:** never plan from ticket text alone; plan
  mode interrogates the Product and Codebase agents first.
- **A3 Domain questions stay in-session:** business rule → Product Agent;
  legacy intent → Codebase Agent; real usage → Support Agent. No more
  interrupt-driven archaeology.
- **A4 Spec-aware review:** a repo skill sends the diff's behavior summary
  to the Product Agent — "does this match the spec?" — and posts mismatches
  on the PR.
- **Speaker note:** emphasize the trust rule — agent answers are context,
  not authority; verify against code; bad answers become retraining items.

### Slide 10 — Support plays (Track B highlights)
- **B1 Day-one readiness:** CI plans the approved source refresh, a protected
  adapter applies it, and the Support lead verifies representative answers and
  retrieval evidence before calling the feature support-ready.
- **B2 Escalation-to-issue:** Live Chat bug → triage agent extracts repro
  steps → GitHub issue tagged `from-support` → (allowlisted classes only) a
  headless coding-agent session drafts a PR for human review.
- **B4 Internal answer desk:** browser extension, Teams, Copilot — one
  truth, many doors; "quick questions" stop landing on engineers.

### Slide 11 — Documentation plays (Track C highlights)
- **C1 Merge triggers a governed refresh (keystone):** CI emits an immutable
  plan; a human-approved adapter uploads and verifies the replacement before
  removing a stale source, then retains a receipt and freshness result.
- **C2 Docs written by the diff:** the coding agent drafts docs and
  changelog from the diff, in the same PR; reviewed as one unit.
- **C3 Gap-driven backlog:** weekly, pull the questions the agent failed to
  answer (Copilot Admin Mode shows retrievals); the coding agent drafts the
  missing pages from the codebase. Same question never fails twice.
- **Speaker note:** "Documentation stops being a chore and becomes a
  byproduct of shipping — and it compounds, because every doc also makes
  every agent smarter."

### Slide 12 — Governance (the slide that pre-empts the security question)
- Separate scoped credentials for MCP reads, conversation tests, knowledge writes, and future management operations.
- Product-agent access to the toolchain is read-only; mutation lives behind a protected environment with named reviewers.
- Raw customer transcripts and secrets stay out of coding context; use redacted patterns, approved summaries, or synthetic fixtures.
- Humans gate every merge, customer commitment, knowledge-write enablement, and production action.

### Slide 13 — How we'll know it's working
- **Visual:** six-metric table.
- Time to credible plan · evidence-supported plan rate · documentation co-ship rate · knowledge lag · freshness pass rate · escalation completeness.
- **Speaker note:** establish a baseline and exact sampling rule before setting a target. Widen, change, narrow, or stop the pilot based on both outcome and control evidence.

### Slide 14 — 30 / 60 / 90 rollout
- **Days 1–30 Foundation:** one domain, one repository, read-only MCP, a baseline, and one complete Ground → Verify loop with knowledge writes still in dry-run.
- **Days 31–60 Repeatability:** additional changes in the same domain, routine documentation co-ship, weekly failure review, and only the approved write path behind a protected environment.
- **Days 61–90 Evidence-based expansion:** review the scorecard; widen to at most one new domain only if ownership and recovery capacity scale.
- **Speaker note:** these are review horizons, not permission deadlines.

### Slide 15 — Beyond the DLC (development in general)
- **Onboarding:** new hires ask the Codebase Agent instead of waiting for a
  buddy; ramp time measured in days.
- **Incident response:** on-call queries the Codebase Agent for subsystem
  behavior and the Support Agent for blast radius while the coding agent
  bisects.
- **Cross-team reuse:** other departments (sales engineering, CS, legal)
  query the same agents through Copilot/Teams — the dev team's knowledge
  investment pays out org-wide.
- **Multi-agent future:** raia's Orchestrator routes to specialist
  subagents; the same pattern extends to per-service Codebase Agents as
  the codebase grows.

### Slide 16 — The ask / close
- For internal decks: approve a bounded pilot, name product, documentation, support, and platform owners, and agree on its baseline and stop conditions.
- For customer decks: start with one domain and one repository; run the credential-free golden path before connecting live systems.
- **Closing line:** "Every verified refresh makes the shared knowledge more useful."

---

## 4 · Soundbites

Use verbatim on slides or in the talk track:

- "Agents brief the code. Governed refreshes teach the agents what shipped."
- "Merge triggers a governed refresh."
- "One brain per domain, not per person."
- "One truth, many doors."
- "Agent answers are context, not authority."
- "Documentation becomes a byproduct of shipping, not a chore after it."
- "Start read-only; earn every write path with evidence."
- "The same question never fails twice."
- "Every verified refresh improves the shared knowledge."

---

## 5 · Demo scripts

### Demo 1 — Developer side (5 min): agent-briefed coding
1. Open a repo with `.mcp.json` committed; start a Claude Code session.
2. Show the raia tools are present (list MCP tools).
3. Ask a planning prompt: "Plan the implementation of <small real ticket>.
   Query raia-product for constraints first."
4. Show the plan citing the agent's answer; point out the constraint the
   ticket text didn't contain.
5. Mid-demo beat: ask the Codebase Agent a "why is it built this way?"
   question and contrast with grepping alone.

**Fallback if live MCP fails:** screenshots of a prior session; the demo
gods are fickle — capture these in advance regardless.

### Demo 2 — The governed loop (3 min): merge triggers refresh
1. Show the `knowledge-refresh.yml` workflow and its `contents: read` permission.
2. Show the immutable plan artifact for a small merged docs change; emphasize that no remote write occurred.
3. If the organization has an approved live adapter, show its protected-environment approval, sync receipt, and retrieval verification. Otherwise, use the local golden path.
4. Land the line: "The merge created evidence; the approved workflow applied it; the owner verified it."

### Demo 3 — PM side (2 min, optional)
1. In Copilot (or the browser extension on a PR page), ask the Product
   Agent: "What shipped this week and what's still open on <feature>?"
2. Show the answer grounded in live GitHub/Jira data via MCP client mode.

---

## 6 · Objection handling

| Objection | Response |
|---|---|
| "Our devs already have Copilot/Cursor — why raia too?" | Coding agents know the *repo*; they don't know your PRDs, policies, or ten thousand support conversations. raia is the missing context layer, and it plugs into the tools they already use via MCP — no switching. |
| "Won't agents give wrong answers?" | Yes, sometimes — which is why the playbook's trust rule is "context, not authority," verification against code is mandatory, and every bad answer becomes a retraining item. The failure mode is visible and self-correcting, unlike tribal knowledge. |
| "Is our data safe?" | The playbook separates credentials by capability, starts read-only, excludes raw sensitive payloads from coding context, places mutation behind protected environments, and requires a tested disablement and recovery path. Verify raia's current certifications and your own obligations separately. |
| "This sounds like a big lift." | Start with one domain, one repository, read-only context, and the credential-free golden path. Add a live write only after the team proves routing, rollback, and freshness verification. |
| "How is this different from putting docs in a wiki?" | The approved source remains versioned near the code, while agents make it queryable from working surfaces. C1 makes every refresh traceable and testable; it does not pretend that an upload alone eliminates staleness. |
| "What if we switch coding tools later?" | Every play depends on two standard capabilities — an MCP client and an instruction file. Claude Code is the reference implementation, not a lock-in. |

---

## 7 · Asset checklist

Prepare before building the deck:

- [ ] Screenshot: lifecycle-map hero + system map ([docs/lifecycle-map.html](lifecycle-map.html))
- [ ] Screenshot: the seven-phase swimlane (same file)
- [ ] Screenshot: a real Claude Code session with raia MCP tools listed
- [ ] Screenshot: raia Copilot Admin Mode showing a retrieval
- [ ] Screenshot: Launch Pad MCP Skill settings (key management)
- [ ] Code snippets: `templates/.mcp.json`, instruction-file section, `workflows/knowledge-refresh.yml`
- [ ] Pre-recorded fallback for each live demo
- [ ] Your org's real numbers for slide 3 (interrupts/week, docs lag, support escalation rate) — even rough estimates beat placeholders

## 8 · Sources

- The playbook: [`README.md`](../README.md)
- Visuals: [`docs/lifecycle-map.html`](lifecycle-map.html), [`docs/playbook.html`](playbook.html)
- raia endpoints & guides: Developer Hub (MCP `api.raia2.com/mcp`, Swagger `api.raia2.com/api/external/docs`, n8n node, browser extension, Teams)
- raia product docs: Command (vector stores, connectors, MCP), Copilot (Admin Mode, simulations, feedback), Launch Pad (Skills, security), Control (outbound), Orchestrator & Auditor skills
