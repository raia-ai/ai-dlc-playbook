# Golden path: one feature through the complete AI-DLC loop

This example demonstrates one behavior-changing feature from evidence to verified agent knowledge. It is intentionally local, deterministic, and credential-free. It makes no network requests and does not mutate a real raia agent, repository, issue tracker, or production system.

> **Scenario:** customers need an order-status answer. The feature must request a valid order number, never request a password, provide a tracking link for shipped orders, and escalate suspected fraud.

## What the example proves

| AI-DLC stage | Example artifact | Deterministic check |
|---|---|---|
| Ground | `evidence/customer-pattern.md` | A redacted evidence source and accountable owner are present |
| Specify | `specs/order-status.md` | Acceptance criteria `AC-1` through `AC-5` are explicit |
| Plan | `plans/order-status-plan.md` plus mock raia context fixtures | The plan cites both product and codebase context and names unresolved risk |
| Build | `src/order-status.mjs`, `test/order-status.test.mjs`, and `docs/order-status.md` | Node’s built-in test runner verifies behavior; documentation co-ships |
| Review | `review/spec-review.json` | Every acceptance criterion has an explicit result and human-review state |
| Refresh | `scripts/run-golden-path.mjs` | Default run writes only a local sync preview with content hashes |
| Verify | Local mock agent store and deterministic freshness questions | Explicit local apply copies the approved source, emits a receipt, and proves retrieval from the expected document hash |

## Requirements

Use Node.js 20 or newer. The example has no package dependencies and does not require an API key.

## Run the golden path

From this directory, first execute the fail-closed checks and dry-run preview:

```bash
npm test
npm run dry-run
```

The dry run validates the evidence chain, executes the behavior tests, checks the review record, scans the example inputs for obvious credential patterns, and writes `artifacts/sync-preview.json`. It does not update even the local mock agent store.

After reviewing the preview, explicitly apply the change to the **local mock store only**:

```bash
npm run apply-mock-sync
```

The apply command copies the approved documentation into `artifacts/mock-agent-store/`, emits `artifacts/sync-receipt.json`, runs the representative freshness checks, and writes `artifacts/pilot-evidence.json` plus `artifacts/pilot-summary.md`.

To remove generated evidence:

```bash
npm run clean
```

## Expected result

A successful dry run prints `GOLDEN_PATH_DRY_RUN_OK`. A successful local apply prints `GOLDEN_PATH_COMPLETE`. Any missing artifact, changed source hash, failed behavior test, incomplete review result, suspicious credential pattern, wrong knowledge destination, or failed freshness check stops the run with a non-zero exit status.

## What a real raia integration changes

The local mock boundary is deliberate. A production implementation replaces only the knowledge adapter after the team confirms the current raia agent-file contract, destination identity, authentication class, replacement behavior, idempotency strategy, audit fields, and rollback procedure. The evidence chain, human gates, dry-run default, and post-write freshness verification remain the same.

Do not point this example at a real endpoint by editing the runner. Use the separately reviewed `workflows/knowledge-push.yml` reference and the [governance guide](../../docs/governance.md) when designing a live integration.
