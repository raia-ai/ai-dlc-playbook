# AI-DLC Playbook and Agent DevKit

The two projects apply the same engineering discipline to different artifacts.

> **The AI-DLC Playbook helps a team use raia agents to build software. The [raia Agent DevKit](https://github.com/raia-ai/raia-agent-devkit) helps a developer build the raia agents themselves.**

| Question | AI-DLC Playbook | raia Agent DevKit |
|---|---|---|
| What is being changed? | Application code, product specifications, documentation, and support knowledge | Agent manifests, prompts, tools, guardrails, knowledge references, evaluations, and release policies |
| What is the product? | A team operating model with adoption guidance and reference workflows | An executable developer toolchain: contracts, deterministic core, CLI, provider adapters, MCP server, and coding-agent integration |
| What is the primary loop? | Evidence → plan → build → review → merge → refresh knowledge → verify | Define → diff → validate → evaluate → review → release → stage → observe → learn |
| Who uses it? | Product, engineering, support, documentation, and platform teams | Agent developers and platform engineers |
| What is the release gate? | A human-reviewed application pull request | A versioned agent candidate with deterministic validation, evaluation evidence, and a release policy |

## When to use each project

Use this playbook when the immediate question is **how a team should work with raia agents during normal product delivery**. Its core concerns are getting credible context into development, keeping shared knowledge current, catching product-specification mismatches, and learning from support outcomes.

Use the Agent DevKit when the immediate question is **how a developer should safely change a raia agent**. Its core concerns are agent-as-code representation, semantic diffs, repeatable evaluations, immutable release evidence, staging, rollback, and production learning.

The projects can be adopted independently. A team can use the playbook with agents configured in Launch Pad before the DevKit is complete. Once the DevKit is available, the same team can put changes to those agents through a software-style delivery process.

## Source-of-truth policy

The [dedicated Agent DevKit repository](https://github.com/raia-ai/raia-agent-devkit) is the canonical source for its specification, contracts, examples, implementation plan, and code. This playbook links to that repository instead of carrying an editable copy. This avoids specification drift and prevents readers from mistaking lifecycle guidance for a shipped developer tool.

## How the loops connect

The playbook closes the **application-learning loop**: raia agents brief the work, humans decide, a coding agent helps execute, and merged application changes refresh organizational knowledge.

The DevKit closes the **agent-learning loop**: developers change an agent, evaluations gate its release, production traces reveal failures, and reviewed failures become regression cases for the next version.

Together, they provide one operating model:

```text
Customer and operator evidence
            ↓
raia agents brief product and engineering work
            ↓
application code and documentation are reviewed and merged
            ↓
agent knowledge is refreshed and verified
            ↓
agent behavior is evaluated, versioned, and improved
            └───────────────────────────────────────────────↺
```
