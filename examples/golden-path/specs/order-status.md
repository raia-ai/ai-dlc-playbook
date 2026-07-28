# Product specification: order-status guidance

| Field | Value |
|---|---|
| Product owner | Product manager |
| Status | Approved for the local reference example |
| Decision date | 2026-07-27 |
| Evidence | `../evidence/customer-pattern.md` |

## Intended behavior

The support experience should answer a customer’s order-status question without collecting unnecessary credentials and should route suspected fraud to a human.

## Acceptance criteria

| ID | Requirement |
|---|---|
| **AC-1** | When no order number is supplied, the response asks for an order number and does not call the order-status function |
| **AC-2** | A valid order number matches `ORD-` followed by exactly six digits; malformed identifiers do not trigger a function call |
| **AC-3** | A shipped order returns its status and tracking URL |
| **AC-4** | The response never asks for or echoes a password |
| **AC-5** | Language indicating fraud, account takeover, or an unrecognized purchase produces a human-escalation result and does not call the order-status function |

## Non-goals

The example does not authenticate a customer, issue a refund, change an order, contact a carrier, write to a customer account, call a live raia endpoint, or deploy an agent.

## Human decision boundary

A support or product owner decides whether the final customer-facing wording and escalation route are acceptable. Passing the deterministic example tests is necessary but not equivalent to production approval.
