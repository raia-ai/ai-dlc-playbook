# Measurement framework

The playbook should be judged by whether it improves product delivery and knowledge quality, not by prompt count, token usage, or the number of connected tools. Capture a baseline before the pilot, define each measure before collecting it, and pair speed measures with quality measures so that faster work cannot hide worse decisions.

## Core metric registry

| Measure | Definition | Recommended source | Owner | Direction |
|---|---|---|---|---|
| **Time to credible plan** | Median elapsed working time from developer assignment to a human-approved implementation plan that cites product and code constraints | Issue history and plan-review timestamp | Engineering lead | Down |
| **Evidence-supported plan rate** | Percentage of sampled plans that link a current product source and relevant code precedent | Monthly plan sample | Product and engineering | Up |
| **Specification-gap catch point** | Stage at which an uncovered product decision is first identified: planning, pull request, acceptance testing, or production | Decision log and issue labels | Product owner | Earlier |
| **Documentation co-ship rate** | Behavior-changing merged changes with required documentation updated in the same change set, divided by all behavior-changing merged changes | Pull-request labels and changed paths | Documentation owner | Up |
| **Knowledge lag** | Elapsed time from merge of an authoritative source to a passing target-agent freshness check | Merge timestamp, sync receipt, and verification record | Platform owner | Down |
| **Freshness pass rate** | Passing representative post-sync questions divided by all executed freshness questions | Verification results | Documentation or support owner | Up |
| **Unsupported-answer rate** | Sampled agent answers that cannot be traced to an approved current source, divided by all sampled answers | Quality review sample | Agent owner | Down |
| **Escalation completeness** | Support escalations with expected behavior, actual behavior, reproduction context, impact, and an owner, divided by sampled escalations | Issue tracker sample | Support lead | Up |
| **Correction closure rate** | Failed agent or workflow cases re-tested successfully after corrective work, divided by corrective items marked complete | Failure log and verification results | Pilot owner | Up |
| **Human interrupt load** | Count of ad hoc domain questions routed to individual engineers during the measurement window | Lightweight team log or communication sample | Engineering lead | Down without reducing answer quality |

These measures are a starting registry, not universal targets. The pilot team should set thresholds only after capturing a representative baseline and agreeing on the cost of a false positive and false negative.

## Evidence schema

Each recorded measure should carry enough context to be auditable.

| Field | Meaning |
|---|---|
| `metric` | Stable name from the metric registry |
| `scope` | Repository, product domain, agent, and environment |
| `window` | Start and end date of the measurement period |
| `population` | Total eligible items in the period |
| `sample` | Items actually reviewed and the selection method |
| `value` | Result using the metric’s declared unit |
| `baseline` | Pre-pilot result calculated with the same definition |
| `owner` | Person responsible for interpretation and follow-up |
| `source` | Links to underlying issues, workflow runs, reviews, or verification records |
| `decision` | Continue, change, widen, narrow, or stop, with rationale |

## Failure taxonomy

Classify failures before assigning a remedy. A failed answer does not automatically mean the model or prompt is wrong.

| Failure class | Diagnostic question | Typical owner | Corrective path |
|---|---|---|---|
| **Source** | Was the authoritative information missing, obsolete, duplicated, or contradictory? | Product or documentation owner | Correct or retire the source, then refresh knowledge |
| **Routing** | Was the source sent to the wrong agent, domain, or environment? | Platform or documentation owner | Fix the routing rule and verify target selection |
| **Retrieval** | Was the correct source present but not retrieved for the representative question? | Agent owner | Improve source structure, metadata, or retrieval configuration |
| **Agent behavior** | Was the correct evidence retrieved but synthesized or acted on incorrectly? | Agent owner | Change instructions, tools, or guardrails; use the Agent DevKit lifecycle when available |
| **Product ambiguity** | Did the sources fail to define the intended behavior? | Product owner | Record a decision and update the specification |
| **Integration** | Did authentication, transport, rate limiting, or API behavior prevent the workflow from completing? | Platform owner | Repair the integration and replay idempotently |
| **Process** | Was a required review, documentation, refresh, or verification step skipped? | Pilot owner | Correct the operating control before adding automation |

## Review cadence

The pilot owner should review operational failures weekly and outcome measures at the end of each delivery cycle or at least monthly. The review should result in a decision, not a dashboard-only status update.

| Decision | Evidence standard |
|---|---|
| **Continue** | The loop completes reliably and quality is stable, but the sample is too small for expansion |
| **Change** | A play creates avoidable toil or a recurring failure has a specific corrective action |
| **Widen** | The loop is repeatable, the owners can support another repository, and quality measures meet the locally agreed threshold |
| **Narrow** | Scope or automation exceeds the team’s current control and recovery capability |
| **Stop** | The workflow does not improve a target outcome, creates unacceptable risk, or lacks an accountable owner |

## Interpretation guardrails

Do not compare teams using differently defined metrics. Do not report an average when a small number of severe failures matter more than the mean. Do not count an uploaded file as successful knowledge refresh until a representative query retrieves the correct current source. Do not count an agent-generated issue as useful until a human finds it actionable. Finally, preserve the human decision record whenever an automated signal changes scope, policy, permissions, or customer-facing behavior.
