---
name: spec-review
description: Review the current branch's diff against the product spec by querying the raia Product Agent. Use when asked to spec-review a change, verify a diff matches the PRD, or run the A4 spec-aware review gate before opening a PR.
---

# Spec-aware review (Play A4)

You are reviewing the current branch's changes for **behavioral conformance
to the product spec** — not code quality (that's a separate review). The
source of product truth is the raia Product Agent, available as an MCP tool
(server `raia-product` in this repo's MCP config).

## Steps

1. **Collect the diff.** Run `git diff <base>...HEAD` (default base: the
   repo's default branch). Identify only the *user-visible behavior
   changes*: new/changed endpoints, UI flows, validation rules, copy,
   limits, pricing/policy-relevant logic. Ignore pure refactors.

2. **Summarize behavior, not code.** Write a plain-language list of the
   behavior changes, each phrased as "the system now does X (was Y)".
   Do not include code, secrets, or customer data in the summary.

3. **Interrogate the Product Agent.** For the change set as a whole, and
   individually for any change touching policy, pricing, permissions, or
   published contracts, ask `raia-product`:
   - "Here are the behavior changes in this PR: <list>. Do these match the
     agreed spec and current policies? List any mismatches, ambiguities,
     or spec sections they contradict."
   - Follow up on each reported mismatch to get the specific spec language.

4. **Verify before reporting.** Agent answers are context, not authority.
   For each claimed mismatch, re-read the relevant code to confirm the
   behavior is as summarized. Drop anything that doesn't hold up.

5. **Report.** Output a short review with three sections:
   - **Confirmed mismatches** — behavior contradicts the spec (cite the
     spec language the agent returned, and the file/line).
   - **Spec gaps** — behavior the spec doesn't cover; needs a PM decision.
   - **Conforms** — one line stating what was checked and found consistent.

   If posting to a PR, post only the first two sections as a comment;
   keep it brief and actionable.

## Rules

- Never block on style or implementation choices — spec conformance only.
- If `raia-product` is unreachable, say so and stop; do not guess at the
  spec from memory.
- If the agent's answer appears stale (contradicts a merged, newer spec in
  `docs/specs/`), flag the staleness as a retraining item in your report.
