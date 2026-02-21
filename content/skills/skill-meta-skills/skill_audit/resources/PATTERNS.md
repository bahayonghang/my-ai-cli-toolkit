# Common Skill Anti-Patterns and Fixes

## Pattern 1: Non-Standard Frontmatter Fields

**Detect**: Fields like `version`, `author`, `license`, `priority` in frontmatter.
**Problem**: Claude Code ignores unknown fields; they waste tokens.
**Fix**: Remove them. If the info is useful, put it in a comment or resources/.

```yaml
# Bad
---
name: my-skill
version: 2.2
author: someone
license: MIT
---

# Good
---
name: my-skill
description: Review code for quality issues. Use when submitting PRs.
---
```

## Pattern 2: Description Too Long

**Detect**: Description exceeds 30 words or lacks trigger context.
**Problem**: Long descriptions waste tokens and reduce discoverability.
**Fix**: Follow `<Action> <Object>. Use when <Trigger>.`

## Pattern 3: Bloated SKILL.md

**Detect**: SKILL.md > 500 tokens or > 100 lines.
**Problem**: Every token in SKILL.md is loaded on every invocation.
**Fix**: Move reference content to `resources/`, keep only imperative steps.

## Pattern 4: Educational Content in Instructions

**Detect**: Sections titled "Why...", "Background", "Understanding...", or explanatory paragraphs.
**Problem**: Background knowledge is not an instruction; it inflates token cost.
**Fix**: Move to `resources/BACKGROUND.md`. Reference it with a Read step if needed.

## Pattern 5: Non-Imperative Voice in Instructions

**Detect**: First-person phrases ("I'll analyze", "I will check") or passive voice ("is analyzed", "should be done", "It would be good to").
**Problem**: Ambiguous agency — Claude may not recognize these as directives.
**Fix**: Rewrite as imperative: "Analyze X", "Run Y", "Output Z".

```
# Bad (first-person)
I'll first check the frontmatter for compliance.

# Bad (passive)
The frontmatter should be checked for compliance.

# Good (imperative)
Check the frontmatter for compliance.
```

## Pattern 6: Hardcoded Paths

**Detect**: Absolute paths or assumptions about directory structure in SKILL.md.
**Problem**: Breaks portability across machines and projects.
**Fix**: Use `$ARGUMENTS` for user-provided paths, `$SKILL_DIR` for skill-relative paths.

## Pattern 7: Missing Parameter Support

**Detect**: No `$ARGUMENTS` usage, no `argument-hint` in frontmatter.
**Problem**: Skill cannot accept runtime input, limiting flexibility.
**Fix**: Add `argument-hint` to frontmatter, use `$ARGUMENTS` in instructions.

## Pattern 8: Unrestricted Tool Access

**Detect**: No `allowed-tools` in frontmatter.
**Problem**: Skill can use any tool, increasing risk of unintended side effects.
**Fix**: Add `allowed-tools` listing only the tools the skill actually needs.

## Pattern 9: Missing Validation Step

**Detect**: No verification after generation/modification steps.
**Problem**: Output quality is unchecked; errors propagate silently.
**Fix**: Add a script-based or manual validation step before presenting results.

## Pattern 10: No Error Handling

**Detect**: No guidance for when inputs are invalid or steps fail.
**Problem**: Skill fails silently or produces confusing output.
**Fix**: Add precondition checks and error messages at the start of the workflow.

```
# Good pattern
If `$ARGUMENTS` is empty or the path does not contain SKILL.md, report:
"Error: Provide a valid skill directory path containing SKILL.md."
```

## Pattern 11: Overlapping Skill Scope

**Detect**: Two or more skills with description Jaccard similarity ≥ 0.4, or ≥ 2 shared tags, or near-identical trigger conditions.
**Problem**: Ambiguous skill selection — Claude may choose the wrong skill or be confused by overlapping scopes.
**Fix**: Differentiate descriptions with distinct action verbs and trigger conditions. Use specific tags. Merge skills if scopes are truly identical.

```yaml
# Bad — two skills with overlapping scope
# skill-a: "Review code for quality. Use when submitting PRs."
# skill-b: "Check code quality issues. Use when reviewing code."

# Good — distinct scopes
# skill-a: "Run automated lint checks on staged files. Use when preparing PRs."
# skill-b: "Deep architecture review with design pattern analysis. Use when refactoring modules."
```
