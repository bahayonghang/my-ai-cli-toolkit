---
name: research
description: Use codex web search for technical research with citation links. Use when user needs online research, literature surveys, or technology comparisons.
argument-hint: [research-topic]
allowed-tools: Read, Bash(codex *), Write
metadata:
  category: research
  tags: [web-search, technical-research, citation, report]
---

Research `$ARGUMENTS` using codex web search.

## Steps

1. If `$ARGUMENTS` empty, ask user for research topic.
2. Clarify scope: core question, comparison targets, aspects (architecture/performance/cost).
3. Run batch codex web searches per `$SKILL_DIR/references/CODEX_COMMANDS.md`.
4. Extract key facts, data, and source URLs from results.
5. Organize findings into report structure per `$SKILL_DIR/references/OUTPUT_FORMAT.md`.
6. Validate all links via codex or user verification.
7. Replace any broken links with correct alternatives.
8. Output final report following guidelines in `$SKILL_DIR/references/GUIDELINES.md`.

## Rules

- Codex retrieves only; analyze and organize yourself.
- Keep only results user cares about. Trim irrelevant sections.
- All citations must include clickable source URLs.
- Prefer official docs > official blogs > third-party > benchmarks.
- No fabricated data. No performance numbers without sources.
