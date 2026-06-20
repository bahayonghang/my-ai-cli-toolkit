# Deep Research Pro 🔬

A prompt-only deep-research skill: turns an open-ended topic into a grounded,
cited research deliverable using whatever web tools the host environment
provides. It bundles no scripts and needs no API keys of its own — it drives the
agent's available search/fetch tools and follows the workflow in
[`SKILL.md`](SKILL.md).

## What it does

1. **Lock the objective** — topic, goal (learn / decide / write / compare / monitor), depth, and output format.
2. **Decompose** — break the topic into 3-5 sub-questions.
3. **Search with source discipline** — prefer primary and high-signal sources; capture title, publisher, URL, and date.
4. **Deep-read** the strongest sources rather than relying on snippets.
5. **Synthesize** — distinguish fact, inference, and uncertainty; surface disagreements and missing data.
6. **Deliver** — executive summary, key findings, risks / open questions, and a dated source list.

## Usage

Just ask the agent to research something:

- "Research the current state of nuclear fusion commercialization"
- "Compare Rust vs Go for backend services in 2026 with sources"
- "帮我调研一下 AI coding agent 的市场格局，给出带来源总结"
- "What's the latest on the US housing market?"

See [`SKILL.md`](SKILL.md) for the full workflow, quality rules, and fallbacks.

## Quality rules (summary)

- Every non-trivial factual claim is source-backed.
- Prefer exact dates over vague recency words like "recently".
- Mark single-source claims, missing numbers, and unresolved conflicts.
- If browsing is unavailable, say current verification could not be completed
  instead of pretending the answer is current.

## Provenance

Adapted from an upstream community skill
([source](https://github.com/paragshah/deep-research-pro)). The original bundled
a standalone research CLI; this vendored version is prompt-only and relies on the
host environment's web tools, so there is no `scripts/` directory.
