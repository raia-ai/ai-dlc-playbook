# AI-DLC maturity model

The maturity model describes observable operating capability, not the number of AI tools a team has purchased. Advance only when the current level is repeatable and evidenced. More automation without ownership, review, and measurement is not higher maturity.

| Level | Operating state | Observable evidence | Main risk | Next move |
|---|---|---|---|---|
| **0 — Ad hoc** | People use private chats and copy context manually. Agent ownership and authoritative sources are unclear. | No shared source inventory, review gate, or reliable record of why an answer was trusted | Confident work based on stale or unverifiable context | Name owners, define authoritative sources, and select one pilot repository |
| **1 — Connected** | A repository can query named raia agents through scoped, read-only connections | MCP connectivity is tested; keys are separated and stored safely; repository instructions say when to query each agent | Teams confuse access with accuracy and begin automating before trust is established | Run the minimum operating loop manually for one real change |
| **2 — Repeatable** | Product evidence, planning, implementation, review, documentation, knowledge refresh, and verification follow the same workflow | A real change produces a specification, cited plan, spec-review result, human-approved merge, sync receipt, and freshness check | The process works but its benefit and failure rate remain anecdotal | Establish baselines, owners, and a pilot scorecard |
| **3 — Measured** | The team tracks quality, latency, adoption, and failure outcomes and uses them to adjust the plays | Monthly scorecard, failure taxonomy, service targets, and explicit decisions to widen, change, or stop automations | Teams optimize activity metrics rather than useful outcomes | Route production failures into owned corrective work and test recovery paths |
| **4 — Closed loop** | Product, code, support, documentation, and agent-quality signals continuously inform one another under controlled automation | Failed answers become source fixes or regression cases; rollback and key rotation are tested; write paths are allowlisted and audited | Broad automation can amplify a bad policy or source if scope controls erode | Expand to additional domains only when controls and ownership scale with them |

## Assessment

Score each statement as **not true**, **sometimes true**, or **consistently true**. A level is achieved only when every statement for that level is consistently true.

### Level 1 — Connected

| Statement | Evidence to inspect |
|---|---|
| Every raia agent used by the pilot has a named business or technical owner | Agent roster |
| Authoritative sources are known and reviewed | Source inventory |
| Repository connections use distinct, scoped credentials | Secret and access configuration |
| Coding-agent instructions define when to query each agent and when to stop | Repository instruction file |
| A failed or stale answer has an owner and reporting path | Issue template or operating procedure |

### Level 2 — Repeatable

| Statement | Evidence to inspect |
|---|---|
| Product changes begin with reviewed evidence and a versioned specification | Issue and specification history |
| Development plans cite product and code constraints obtained from the appropriate sources | Planning artifact |
| Behavior-changing changes receive specification-aware review in addition to normal code review | Pull-request evidence |
| Code and affected documentation ship in the same change set | Repository history |
| Knowledge refresh runs only after an approved merge and records what changed | Workflow receipt |
| A human verifies that the target agent retrieves the new authoritative source | Freshness result |

### Level 3 — Measured

| Statement | Evidence to inspect |
|---|---|
| The team captured a baseline before the pilot | Baseline scorecard |
| Each core metric has a definition, owner, source, and review cadence | Measurement registry |
| Failures are classified consistently as source, retrieval, agent behavior, product, integration, or process problems | Failure log |
| The team can identify which plays improved an outcome and which created toil | Monthly review decision |
| Automation is widened or stopped according to evidence rather than enthusiasm | Decision log |

### Level 4 — Closed loop

| Statement | Evidence to inspect |
|---|---|
| Poor agent outcomes create owned corrective work without exposing raw sensitive data | Triage record |
| Corrective work is verified against the original failure after release | Closed-loop test result |
| Write automations use allowlists, human approvals, idempotency, and audit records | Workflow and platform configuration |
| Credential rotation, workflow disablement, and rollback are tested | Exercise report |
| A new team or repository can adopt the system without relying on tribal knowledge | Onboarding run and retrospective |

## Rules for advancing

A team should not automate issue creation before it can classify failures reliably. It should not automate draft pull requests before human-reviewed issues routinely contain usable reproduction evidence. It should not synchronize knowledge broadly before one repository demonstrates correct routing, replacement of superseded sources, and post-sync retrieval verification.

The maturity level belongs to a specific domain and workflow, not the company as a whole. A support domain may operate at Level 3 while a new engineering repository remains at Level 1. Record the scope whenever reporting a level.
