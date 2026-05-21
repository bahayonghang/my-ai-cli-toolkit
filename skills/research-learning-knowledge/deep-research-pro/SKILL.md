---
name: deep-research-pro
version: 1.0.0
description: "Multi-source deep research skill for current-topic investigation, comparison, and cited report writing. Use when the user asks to research, compare, or deep-dive a topic with current web sources and citations, including phrases like research, deep dive, latest, 调研, 做个深度研究, or 带来源总结. Do not use for offline-only codebase questions, casual opinion requests, or when the user explicitly forbids web access."
category: research-learning-knowledge
tags: [research, web, citations, synthesis, report-writing, current-events]
homepage: https://github.com/paragshah/deep-research-pro
metadata: {"clawdbot":{"emoji":"🔬","category":"research"}}
---

# Deep Research Pro

Use this skill to turn an open-ended topic into a grounded, cited research
deliverable. The goal is not to dump links. The goal is to answer the user's
real question with evidence, recency awareness, and explicit uncertainty.

## When to use

Use this skill when the user wants:

- current information
- topic comparison or landscape mapping
- a cited briefing, memo, or report
- decision support backed by multiple sources
- research on markets, companies, policy, science, or technology

Do not use this skill when:

- the task is purely local to the repo or codebase
- the user explicitly says not to browse
- the user only wants a quick opinion with no sourcing

## Workflow

### 1. Lock the research objective

Extract or infer:

- topic
- user goal: learn, decide, write, compare, or monitor
- preferred depth: quick brief, standard report, or deep dive
- expected output: chat answer, outline, memo, or saved file

Ask at most 1-2 clarifying questions only if the answer would materially change
the search plan or final deliverable. If not, proceed with reasonable defaults
and state them.

### 2. Break the topic into sub-questions

Create 3-5 sub-questions that cover the topic from different angles, such as:

- definition and scope
- current state and recent developments
- evidence, metrics, or outcomes
- major players or competing schools
- risks, limitations, or open questions

Do not search blindly for the top-level topic only.

### 3. Search with source discipline

Use the current environment's available web tools. Prefer primary and
high-signal sources in this order:

1. official documentation, regulators, standards bodies, company filings,
   papers, or datasets
2. reputable journalism or domain publications
3. expert analysis and industry commentary

For each sub-question:

- try 2-3 focused query variants
- collect multiple independent sources
- prefer recent sources when the topic is time-sensitive
- capture source title, publisher, URL, and date

Aim for roughly 8-20 unique sources total unless the user requested a very
lightweight answer.

### 4. Deep-read the strongest sources

Do not rely on snippets alone. Open and read the most relevant pages in full.

For each key source, extract:

- the core claim
- the concrete evidence or data point
- publication date
- why it matters to the user's goal

If a claim appears only once, treat it as provisional instead of established.

### 5. Synthesize, do not concatenate

Combine the evidence into a structured answer that:

- answers the user's actual question
- distinguishes fact, inference, and uncertainty
- highlights disagreements across sources
- calls out missing data when evidence is thin

If the user asks for recommendations, make it explicit which parts come from
sources and which parts are your synthesis.

### 6. Deliver in the right format

Default output structure:

```markdown
# {Topic}

## Executive Summary
- 3-5 high-signal findings

## Key Findings
### {Theme 1}
...
### {Theme 2}
...

## Risks / Open Questions
...

## Sources
1. [Title](url) — source type, date
```

If the user asked for a saved report, write it to a user-specified path or a
workspace-relative path. Do not assume a personal home-directory convention.

## Quality rules

1. Every non-trivial factual claim should be source-backed.
2. Prefer exact dates over vague recency words like "recently".
3. Mark single-source claims, missing numbers, and unresolved conflicts.
4. Do not invent statistics, quotes, or consensus.
5. If browsing is unavailable, say that current verification could not be
   completed instead of pretending the answer is current.

## Failure and fallback

- If the topic is too broad, narrow it to the user's likely goal and state the
  narrowed scope.
- If relevant sources are low quality, say the evidence base is weak.
- If the topic is highly time-sensitive, explicitly date-stamp the conclusion.
- If the user wants a simple answer after the research pass, compress the report
  into a short briefing instead of dumping the full notes.

## Example prompts

- `Research the current state of nuclear fusion commercialization`
- `Compare Rust vs Go for backend services in 2026 with sources`
- `帮我调研一下 AI coding agent 的市场格局，给出带来源总结`
- `What's the latest on the US housing market?`
