# Role-based quick starts

This guide translates the playbook into the first actions each role should take. Start with one repository and one product area. The goal of the pilot is not maximum automation; it is a complete, reviewable loop from customer evidence to verified agent knowledge.

## Shared prerequisites

Before any role begins, name one accountable pilot owner and confirm the following conditions.

| Requirement | Minimum acceptable state | Evidence |
|---|---|---|
| Agent roster | A Product Agent, Codebase Agent, and Support & Docs Agent have named owners | Owner names recorded in the pilot brief |
| Source quality | Each agent has a small, reviewed set of authoritative documents | Source inventory with document owner and review date |
| Repository connection | The coding tool can reach only the required raia MCP servers | Successful read-only test query from the repository |
| Credential hygiene | Keys are stored in environment variables or secret storage, never in committed files | Secret scan and configuration review pass |
| Pilot change | One real, low-risk, behavior-changing feature is selected | Linked issue and product specification |
| Human gates | A person is accountable for product decisions, code approval, and knowledge verification | RACI section completed in the pilot brief |

If any prerequisite is missing, fix it before enabling write automation.

## Developer quick start

The developer’s job is to use agent context without surrendering engineering judgment.

| Session | Action | Evidence of completion |
|---|---|---|
| Connect | Copy the appropriate MCP template, provide keys through the environment, and confirm the Product and Codebase Agents answer a harmless test query | Both servers are reachable; no key appears in the repository or command output |
| Plan | Ask the coding agent to query product constraints and codebase precedent before proposing an implementation | The plan cites both product and code evidence and identifies uncertainty |
| Build | Implement the change with tests and update affected documentation in the same branch | Code, tests, and documentation appear in one diff |
| Review | Run the spec-review skill and independently verify each reported mismatch | Confirmed mismatches and specification gaps are attached to the pull request |
| Learn | Report stale or unsupported agent answers instead of silently working around them | A retraining or source-correction issue links the bad answer to its authoritative replacement |

A developer should stop and ask a human when agents disagree with current code, the product policy is ambiguous, a requested action would expose credentials or customer data, or the workflow proposes a merge or production write.

## Product-manager quick start

The product manager owns decisions and the quality of product truth; the Product Agent helps retrieve and connect evidence.

| Session | Action | Evidence of completion |
|---|---|---|
| Ground | Ask the Support & Docs Agent for recurring friction and representative, redacted examples | The feature brief links at least one reviewed evidence item |
| Specify | Draft acceptance criteria with the Product Agent, then decide scope and resolve ambiguity personally | A versioned Markdown specification names an owner and decision date |
| Brief | Test whether a developer can ask “why does this requirement exist?” and receive a supported answer | The answer cites the current specification or policy source |
| Review | Resolve every specification gap surfaced by the review gate before merge | Each gap is closed by a documented decision or explicit deferral |
| Measure | Review pilot outcomes with engineering and support | Baseline and post-pilot measures are recorded in the scorecard |

The Product Agent is a retrieval and synthesis aid, not the approver of pricing, permissions, legal language, or customer commitments.

## Support-lead quick start

The support lead turns real customer outcomes into evidence while keeping sensitive payloads inside governed systems.

| Session | Action | Evidence of completion |
|---|---|---|
| Observe | Identify the recurring customer question or failure pattern selected for the pilot | A redacted pattern summary is available to the product owner |
| Verify | After release, run a small set of approved questions through the Support & Docs Agent | Results include answer, source retrieval, pass/fail decision, and reviewer |
| Route | Classify each poor answer as a knowledge gap, agent-behavior problem, or product problem | Every failed check has exactly one owner and destination |
| Escalate | Require human takeover for customer-impacting ambiguity or unsupported claims | Escalation evidence links to the corresponding issue or incident |
| Improve | Re-run the failed question after the corrective change | The original failure is demonstrably closed rather than merely discussed |

Do not copy raw customer transcripts into coding-agent sessions. Provide a redacted pattern or query the governed raia agent for a synthesis.

## Documentation-owner quick start

The documentation owner controls what becomes retrievable truth and verifies that superseded sources disappear.

| Session | Action | Evidence of completion |
|---|---|---|
| Inventory | Map repository paths and document classes to the appropriate agent | A reviewed routing table exists for specs, ADRs, release notes, and user documentation |
| Review | Confirm that behavior-changing pull requests update the affected source document | Documentation is reviewed in the same pull request as code |
| Refresh | Approve the first knowledge synchronization in dry-run mode, then enable the reviewed write path | The workflow records intended files before any API mutation |
| Verify | Confirm the target agent retrieves the new source and not a superseded one | A freshness check records the retrieved document identity |
| Maintain | Review duplicates, stale files, and failed retrievals on a regular cadence | Each cleanup item has an owner and closure date |

Knowledge synchronization is not successful merely because an upload returned a success code. Success requires retrieval of the correct source in a representative question.

## Platform-owner quick start

The platform owner makes the pilot safe, observable, and reversible.

| Session | Action | Evidence of completion |
|---|---|---|
| Scope | Issue separate, least-privilege credentials for each agent and environment | Credential inventory states owner, scope, storage location, and rotation path |
| Protect | Keep conversational agents read-only against development tools; isolate audited write automation | Tool allowlists and workflow permissions are reviewed |
| Gate | Require dry-run defaults, protected branches, human review, and environment approval for every write path | Repository and environment protection settings are documented |
| Observe | Preserve correlation among issue, commit, workflow run, knowledge receipt, and verification result | A pilot change can be traced end to end |
| Recover | Test credential rotation and document rollback before broad rollout | A tabletop exercise records outcome and follow-up actions |

## First pilot exit criteria

The pilot is complete when one real change finishes the minimum operating loop and produces evidence for every stage. The team should be able to answer four questions without relying on memory:

1. Which customer or operator evidence justified the change?
2. Which product and code constraints shaped the implementation?
3. Who approved the application change and the knowledge update?
4. Can the target raia agent now answer the representative question from the correct source?

If the answer to any question is missing, keep the pilot scope narrow and repair the operating loop before adding scheduled triage, issue filing, or draft-pull-request automation.
