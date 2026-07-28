# AI-DLC pilot brief

> Copy this file into the pilot repository and replace every bracketed field. The pilot should not begin while required ownership or security fields remain unresolved.

## Pilot identity

| Field | Value |
|---|---|
| Pilot name | `[name]` |
| Product domain | `[domain]` |
| Repository | `[owner/repository]` |
| Start date | `[YYYY-MM-DD]` |
| Review date | `[YYYY-MM-DD]` |
| Pilot owner | `[name and role]` |
| Selected real change | `[issue URL and one-sentence description]` |

## Intended outcome

Describe the delivery or knowledge problem in plain language. State what should improve for the team or customer, not which tool should be installed.

`[problem and intended outcome]`

## Scope and non-goals

| In scope | Out of scope |
|---|---|
| `[one repository, product area, agent set, and delivery loop]` | `[production writes, broad rollout, autonomous merges, or other excluded capability]` |

## Human ownership

| Responsibility | Named owner | Approval required at |
|---|---|---|
| Product decision | `[name]` | Specification and unresolved gaps |
| Code quality and merge | `[name]` | Pull request |
| Knowledge routing and source quality | `[name]` | Knowledge refresh |
| Support verification | `[name]` | Post-release representative questions |
| Platform access and recovery | `[name]` | Credential issue, write enablement, rollback |

## Agent and source roster

| Agent | Purpose | Owner | Approved source classes | Explicitly excluded content |
|---|---|---|---|---|
| Product Agent | `[purpose]` | `[name]` | `[specifications, decisions, policies]` | `[excluded content]` |
| Codebase Agent | `[purpose]` | `[name]` | `[ADRs, architecture, selected code documentation]` | `[excluded content]` |
| Support & Docs Agent | `[purpose]` | `[name]` | `[user documentation, release notes, approved support patterns]` | `[excluded content]` |

## Connection and permission plan

| Integration | Credential class | Allowed actions | Storage | Rotation owner |
|---|---|---|---|---|
| Repository → raia MCP | `[MCP key]` | Read approved agent context | `[secret store]` | `[name]` |
| CI → raia knowledge | `[knowledge-write secret]` | Dry run only until separately approved | `[protected environment]` | `[name]` |
| Coding agent → repository | `[local or repository identity]` | Worktree edits and local checks; no merge | `[credential store]` | `[name]` |

## Minimum operating loop

| Stage | Planned evidence | Owner | Complete |
|---|---|---|---|
| Ground | Evidence note linked from the specification | `[name]` | `[ ]` |
| Specify | Versioned specification and acceptance criteria | `[name]` | `[ ]` |
| Plan | Human-approved plan citing product and code constraints | `[name]` | `[ ]` |
| Build | Code, tests, and documentation in one branch | `[name]` | `[ ]` |
| Review | Code review and specification-conformance result | `[name]` | `[ ]` |
| Refresh | Dry-run preview, approval, and knowledge-sync receipt | `[name]` | `[ ]` |
| Verify | Representative question with source evidence and pass/fail decision | `[name]` | `[ ]` |

## Baseline and target measures

Do not set a target before recording how the existing process performs.

| Measure | Baseline definition and value | Desired direction | Source | Owner |
|---|---|---|---|---|
| Time to credible plan | `[value and method]` | Down | `[source]` | `[name]` |
| Evidence-supported plan rate | `[value and method]` | Up | `[source]` | `[name]` |
| Knowledge lag | `[value and method]` | Down | `[source]` | `[name]` |
| Freshness pass rate | `[value and method]` | Up | `[source]` | `[name]` |
| Team-selected outcome | `[value and method]` | `[direction]` | `[source]` | `[name]` |

## Risk and recovery

| Risk | Preventive control | Detection | Recovery owner |
|---|---|---|---|
| Stale or contradictory source | Source inventory and owner review | Freshness and unsupported-answer checks | `[name]` |
| Credential exposure | Secret injection and scanning | Repository and workflow alert | `[name]` |
| Wrong knowledge destination | Explicit routing allowlist and dry run | Sync preview and receipt | `[name]` |
| Bad or duplicate source mutation | Idempotency and current-state check | Post-sync list and retrieval test | `[name]` |
| Human gate skipped | Branch and environment protection | Audit review | `[name]` |

## Exit decision

At the review date, select one decision and record evidence.

| Decision | Selected | Rationale and evidence |
|---|---|---|
| Continue the same scope | `[ ]` | `[links]` |
| Change the workflow | `[ ]` | `[links]` |
| Widen to another repository or team | `[ ]` | `[links]` |
| Narrow the scope or automation level | `[ ]` | `[links]` |
| Stop the pilot | `[ ]` | `[links]` |
