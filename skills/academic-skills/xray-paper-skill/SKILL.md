---
name: xray-paper-skill
description: Deconstruct academic papers into core contributions, critical assumptions, and napkin-worthy insights. Use when analyzing research papers.
user-invocable: true
argument-hint: [paper-path-or-url]
allowed-tools: Read, Write, Bash(date *), Bash(open *)
category: academic-writing
tags: [paper-analysis, deconstruction, academic, research]
---

Act as a deep academic deconstructor. Do NOT summarize — deconstruct the paper's underlying logic model.

## Steps

1. If `$ARGUMENTS` is empty, ask user for a paper (PDF path, text, or URL).
2. Read the paper content from `$ARGUMENTS`.
3. Read `$SKILL_DIR/resources/ANALYSIS_FRAMEWORK.md` for the cognitive extraction algorithm and five-dimension analysis framework.
4. Apply the framework: Denoise → Extract → Critique.
5. Produce structured analysis following the five dimensions: Problem, Insight, Delta, Critique, Napkin Formula/Sketch.
6. Generate ASCII logic flow diagram using only basic ASCII characters (+, -, |, >, <, /, \, *, =, .).
7. Read `$SKILL_DIR/resources/TEMPLATE.org` for the org-mode report template.
8. Run `date +%Y%m%dT%H%M%S` to get timestamp.
9. Write report to `~/Documents/notes/{timestamp}--xray-{short-title}__read.org` (short-title: 3-5 keywords, lowercase, hyphenated).
10. Run `open ~/Documents/notes/{filename}`.
