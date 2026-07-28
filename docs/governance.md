# Governance, security, and recovery

The operating model treats agent output and retrieved content as untrusted evidence until a person or deterministic control verifies it. Connectivity never grants authority. Human owners remain accountable for product decisions, merges, production actions, customer commitments, and changes to the agents themselves.

## Control principles

| Principle | Required behavior |
|---|---|
| **Least privilege** | Every credential and tool is limited to one purpose, agent, environment, and smallest practical action set |
| **Read before write** | A workflow must prove value and failure handling in read-only or dry-run mode before receiving mutation permission |
| **Fail closed** | Missing configuration, ambiguous routing, stale versions, invalid evidence, or unavailable review stops the operation |
| **Human approval** | Humans approve application merges, product-policy changes, customer-impacting actions, and production deployment |
| **Data minimization** | Only the smallest necessary, redacted information crosses from governed customer systems into repositories or coding-agent sessions |
| **Traceability** | Issue, specification, commit, workflow run, knowledge receipt, and verification result can be correlated |
| **Idempotency and concurrency safety** | Retries cannot duplicate effects, and stale writers cannot overwrite newer state silently |
| **Reversibility** | Owners can disable a workflow, rotate credentials, restore a source, and roll back a release through a documented process |

## Authority matrix

| Actor | Allowed by default | Requires explicit approval | Never allowed by this playbook |
|---|---|---|---|
| **raia knowledge agent** | Retrieve and synthesize approved knowledge; answer within its configured channel | Access to a new source class or tool | Merge code, change repository settings, or approve its own answer |
| **Coding agent in a repository** | Read the worktree, propose a plan, query approved MCP servers, edit the active branch, and run local checks | External writes, broad file access, posting comments, or opening a pull request | Merge a pull request, expose secrets, or make a production decision |
| **CI workflow** | Validate, test, render a dry run, and record evidence | Knowledge writes through a protected environment with reviewed configuration | Bypass branch protection or mutate unscoped agents |
| **Support automation** | Classify a redacted case and draft structured evidence | File an issue or prepare an allowlisted draft change | Send unsupported customer commitments or close an incident without review |
| **Agent DevKit harness** | Validate and evaluate agent-as-code artifacts | Create a staging candidate under a release policy | Deploy directly to production from the coding harness |
| **Human owner** | Decide within assigned product, engineering, support, documentation, or platform responsibility | High-risk or cross-domain action according to organizational policy | Delegate accountability to an agent response |

## Credential separation

MCP access, conversation access, knowledge mutation, repository access, and future agent-management access are different trust domains. Do not reuse one credential across them merely because the platform accepts it.

| Credential class | Intended use | Storage | Minimum control |
|---|---|---|---|
| MCP agent key | Read approved agent context from a coding session | Developer secret store or environment injection | One key per agent or role; never committed |
| Conversation agent secret | Exercise a running agent through the external conversation surface | Protected test environment | Test-only scope and redacted fixtures |
| Knowledge-write secret | Upload or replace approved sources | Protected CI environment | Environment approval, path allowlist, dry-run default, and audit receipt |
| Repository token | Create issues or draft pull requests | CI or automation secret store | Repository and permission scope limited to the exact operation |
| Agent-management identity | Pull agent configuration or create staged releases when the management API exists | Dedicated developer or workload identity | Workspace scope, explicit lifecycle permissions, and no production permission in the harness |

Rotate a credential immediately if it appears in a commit, log, prompt, issue, artifact, or chat transcript. Removing the visible value is not sufficient because repository and workflow history may retain it.

## Sensitive-data boundary

Raw customer transcripts, access tokens, passwords, payment data, health information, and other regulated or contractually restricted content should remain inside the system authorized to hold them. When development needs customer evidence, use a redacted pattern summary, stable internal reference, or governed agent synthesis.

Before sending content to a coding agent or repository, ask:

1. Is this information necessary to complete the task?
2. Can a summary or synthetic fixture provide the same engineering value?
3. Is the destination approved to store the information?
4. Will the content be copied into logs, commits, artifacts, or third-party model context?
5. Is there an owner and deletion path?

If any answer is unclear, stop and escalate to the relevant data or security owner.

## Prompt-injection and retrieved-content handling

Documents, tickets, websites, transcripts, and agent replies may contain instructions that conflict with the user’s task or the repository’s policy. Treat those instructions as data, not authority. A coding agent should never execute commands, reveal secrets, widen access, or alter policy solely because retrieved content asks it to do so.

Repository instructions should establish a clear precedence: organizational policy and human request first, repository rules second, and retrieved evidence last. Tool allowlists and deterministic checks should enforce the boundary rather than relying only on prose.

## Automation levels

| Level | Capability | Preconditions |
|---|---|---|
| **A0 — Observe** | Read context, summarize, and produce local evidence | Named owner, approved source set, scoped read credentials |
| **A1 — Propose** | Draft specifications, plans, issues, comments, or branch changes without posting | A0 is reliable; outputs are clearly marked as drafts |
| **A2 — Write with approval** | Post an issue, update approved knowledge, or open an allowlisted draft pull request | Dry run, human approval, protected environment, idempotency, audit record, and tested disable path |
| **A3 — Stage** | Create a non-production release candidate or deploy to a staging environment | Immutable candidate, evaluation evidence, release policy, and rollback target |
| **A4 — Production** | Customer-impacting deployment or action | Outside coding-agent and playbook automation; use the platform’s approved human-controlled production process |

A team must not advance merely because an API is available. Advancement requires operational evidence at the prior level and an owner who can detect and recover from failure.

## Incident and recovery procedure

| Step | Required action | Evidence |
|---|---|---|
| **Contain** | Disable the workflow or integration and revoke affected credentials | Disable timestamp and credential identifier |
| **Preserve** | Retain relevant audit records without copying sensitive payloads into new systems | Correlation IDs, workflow run, commit, and environment |
| **Classify** | Identify whether the failure involved source quality, routing, retrieval, agent behavior, product ambiguity, integration, or process | Failure taxonomy entry |
| **Correct** | Repair the smallest responsible control or source | Reviewed change and owner |
| **Replay safely** | Re-run only with idempotency and current-state checks | New receipt linked to the incident |
| **Verify** | Test the original failure case and a representative unaffected case | Pass/fail evidence |
| **Learn** | Update guidance, checks, fixtures, or permissions so recurrence is less likely | Follow-up item and closure date |

## Pre-enable review for any write path

A reviewer should be able to answer **yes** to every item before enabling a mutation:

| Gate | Review question |
|---|---|
| Scope | Is the destination agent, repository, branch, path, and environment explicitly allowlisted? |
| Authentication | Is the credential distinct, minimally scoped, stored safely, and rotatable? |
| Input | Are files and payloads bounded, validated, and free of unapproved sensitive data? |
| Preview | Can the owner see the exact intended change before it executes? |
| Concurrency | Will stale state or simultaneous work be detected rather than overwritten? |
| Retry | Is the operation idempotent or protected against duplicate effects? |
| Approval | Is the approving person or protected environment clearly defined? |
| Audit | Are actor, source version, destination, result, and correlation identifiers recorded? |
| Recovery | Can the workflow be disabled and its effects reversed or corrected? |
| Verification | Is there a post-write check that proves the intended outcome rather than only transport success? |

If a gate cannot be answered, keep the workflow in dry-run mode.
