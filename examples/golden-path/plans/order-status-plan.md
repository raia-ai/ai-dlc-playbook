# Implementation plan: order-status guidance

| Field | Value |
|---|---|
| Plan owner | Developer |
| Human review | Approved for the local reference example |
| Product context | `../fixtures/product-agent-context.json` |
| Codebase context | `../fixtures/codebase-agent-context.json` |
| Specification | `../specs/order-status.md` |

## Evidence considered

The Product Agent fixture identifies acceptance criteria AC-1 through AC-5 and cites the approved specification and synthetic support pattern. The Codebase Agent fixture requires deterministic routing, a full-string identifier check, fraud classification before lookup, dependency injection, and structured results.

The fixtures are evidence, not authority. The plan cross-checks their claims against the versioned specification and the implementation and test files in this repository.

## Planned change

| Step | Artifact | Evidence or check |
|---|---|---|
| 1 | `src/order-status.mjs` | Implement deterministic fraud detection, identifier validation, injected lookup, and structured outcomes |
| 2 | `test/order-status.test.mjs` | Cover every acceptance criterion and verify prohibited function calls do not occur |
| 3 | `docs/order-status.md` | Co-ship user-facing behavior, safety limits, and escalation expectations |
| 4 | `review/spec-review.json` | Map each acceptance criterion to a test and reviewed result |
| 5 | `scripts/run-golden-path.mjs` | Validate the evidence chain, generate a dry-run preview, apply only to a local mock store, and verify freshness |

## Risks and controls

| Risk | Control |
|---|---|
| Fraud language reaches lookup | Classify fraud before validating or calling the injected dependency |
| Malformed order identifiers trigger work | Anchor the full identifier pattern and test near-misses |
| Documentation lags implementation | Treat documentation as a required source in the same example change |
| Agent context is stale or contradictory | Validate fixture sources and acceptance-criterion coverage; stop on mismatch |
| Knowledge sync targets the wrong destination | Hard-code an offline mock destination and require an explicit apply flag |
| A passing test is mistaken for production approval | Preserve a human-review state and document the production non-goals |

## Unresolved production decision

A real integration must define and approve the customer escalation destination, the live raia agent identity, the current agent-file API contract, authentication, replacement semantics, idempotency, audit receipt, and rollback process. This example deliberately cannot make that decision or perform that operation.
