---
name: skill-optimizer
description: Analyze Claude Code skills for compliance and token efficiency. Use when reviewing skills.
category: skill-management
tags:
  - optimization
  - analysis
  - skill-authoring
argument-hint: [skill-directory-path]
allowed-tools: Read, Glob, Grep, Bash(python *)
---

Optimize the Claude Code skill at `$ARGUMENTS`.

## Steps

1. If `$ARGUMENTS` is empty or the path does not contain SKILL.md, report: "Error: Provide a valid skill directory path containing SKILL.md."
2. Run: `python "$SKILL_DIR/scripts/analyze_skill.py" "$ARGUMENTS"`
3. Read `$SKILL_DIR/resources/CHECKLIST.md` and `$SKILL_DIR/resources/PATTERNS.md`.
4. Cross-reference JSON report with CHECKLIST and PATTERNS.
5. Present findings: **Critical → Recommended → Optional**, each with before/after fix.
6. Generate optimized SKILL.md resolving all Critical and Recommended issues.

## Output

Report issues by severity, then a token budget table (Before/After/Δ), then the full optimized SKILL.md.

## Rules

- Only official frontmatter fields: name, description, argument-hint, disable-model-invocation, user-invocable, allowed-tools, model, context, agent, hooks.
- Optimized SKILL.md: < 300 tokens body, imperative voice, no educational content inline.
- Preserve original intent. Move reference content to resources/.
