# Deep Research Pro

Multi-source deep research skill that searches the web, synthesizes findings, and delivers cited reports.

## When to Use

Use this skill when the user wants to:
- research a topic from multiple sources instead of getting a quick summary
- compare evidence across articles, official sources, and recent news
- generate a cited report for learning, decision-making, or writing
- break a broad topic into sub-questions and investigate each one systematically

If the request is only a quick factual lookup or a single-source answer, a lighter research workflow may be enough.

## Workflow

1. Ask 1-2 brief clarifying questions unless the user already gave enough direction.
2. Break the topic into 3-5 research sub-questions.
3. Search each sub-question with multiple query variants.
4. Fetch and read the most promising sources in depth rather than relying only on snippets.
5. Synthesize the findings into a structured report with citations.
6. Save the report and deliver either the full text or a concise summary, depending on length.

## Output Structure

The report typically includes:
- title and timestamp
- executive summary
- 2-4 major themes with cited findings
- key takeaways
- source list
- methodology section

## Quality Rules

- every meaningful claim needs a source
- cross-check important findings across multiple sources
- prefer recent and reputable sources when recency matters
- clearly call out uncertainty or missing information
- avoid unsourced speculation

## Requirements

This skill assumes the environment has the supporting search and fetch tooling described in its `SKILL.md`, including the DDG search helper and `curl`.
