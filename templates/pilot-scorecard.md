# AI-DLC pilot scorecard

## Reporting context

| Field | Value |
|---|---|
| Pilot | `[name]` |
| Repository and domain | `[scope]` |
| Measurement window | `[YYYY-MM-DD]` to `[YYYY-MM-DD]` |
| Baseline window | `[YYYY-MM-DD]` to `[YYYY-MM-DD]` |
| Pilot owner | `[name]` |
| Review participants | `[names and roles]` |

## Outcome measures

Use the same definition for baseline and current values. Link the underlying sample or source rather than copying sensitive payloads into this file.

| Measure | Baseline | Current | Sample and source | Interpretation | Owner |
|---|---:|---:|---|---|---|
| Time to credible plan | `[value]` | `[value]` | `[link]` | `[what changed and why]` | `[name]` |
| Evidence-supported plan rate | `[value]` | `[value]` | `[link]` | `[interpretation]` | `[name]` |
| Specification-gap catch point | `[stage]` | `[stage]` | `[link]` | `[interpretation]` | `[name]` |
| Documentation co-ship rate | `[value]` | `[value]` | `[link]` | `[interpretation]` | `[name]` |
| Knowledge lag | `[value]` | `[value]` | `[link]` | `[interpretation]` | `[name]` |
| Freshness pass rate | `[value]` | `[value]` | `[link]` | `[interpretation]` | `[name]` |
| Unsupported-answer rate | `[value]` | `[value]` | `[link]` | `[interpretation]` | `[name]` |
| Team-selected outcome | `[value]` | `[value]` | `[link]` | `[interpretation]` | `[name]` |

## Minimum-loop completion

| Stage | Required evidence | Result | Link |
|---|---|---|---|
| Ground | Reviewed customer or operator evidence | `[pass/fail]` | `[link]` |
| Specify | Versioned specification and acceptance criteria | `[pass/fail]` | `[link]` |
| Plan | Human-approved plan citing product and code constraints | `[pass/fail]` | `[link]` |
| Build | Code, tests, and documentation in the same change set | `[pass/fail]` | `[link]` |
| Review | Human code review and specification-conformance evidence | `[pass/fail]` | `[link]` |
| Refresh | Approved knowledge-sync receipt tied to the merge | `[pass/fail]` | `[link]` |
| Verify | Representative question retrieves the correct current source | `[pass/fail]` | `[link]` |

## Failure log

| Date | Failure class | Summary | Impact | Owner | Corrective action | Re-test result |
|---|---|---|---|---|---|---|
| `[date]` | `[source/routing/retrieval/agent behavior/product/integration/process]` | `[redacted summary]` | `[impact]` | `[name]` | `[link]` | `[pending/pass/fail]` |

## Control review

| Control | Result | Evidence or gap |
|---|---|---|
| Credentials are scoped, separated, stored safely, and rotatable | `[pass/fail]` | `[link or action]` |
| Write workflows default to dry run and require approval | `[pass/fail]` | `[link or action]` |
| Human gates protected every merge and customer-impacting action | `[pass/fail]` | `[link or action]` |
| Sensitive customer payloads remained in approved systems | `[pass/fail]` | `[link or action]` |
| Workflow effects are traceable and recoverable | `[pass/fail]` | `[link or action]` |

## Decision

> Select exactly one outcome. An inconclusive pilot should continue at the same or narrower scope; it should not widen by default.

| Decision | Selected | Rationale |
|---|---|---|
| Continue | `[ ]` | `[evidence]` |
| Change | `[ ]` | `[evidence and planned correction]` |
| Widen | `[ ]` | `[evidence that controls and ownership can scale]` |
| Narrow | `[ ]` | `[risk or reliability reason]` |
| Stop | `[ ]` | `[reason and cleanup plan]` |

## Next review

| Field | Value |
|---|---|
| Decision owner | `[name]` |
| Next action | `[action]` |
| Due date | `[YYYY-MM-DD]` |
| Next review date | `[YYYY-MM-DD]` |
