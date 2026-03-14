# Common Skill Anti-Patterns and Fixes

## Pattern 1: Non-Standard Frontmatter Fields

**Detect**: Fields like `version` or `author` inside `metadata`, or unsupported top-level fields like `priority`, `category`, `tags`.
**Problem**: Claude Code ignores unknown top-level fields; they waste tokens. Fields like `category` and `tags` belong inside the `metadata` block.
**Fix**: Use standard fields or put custom key-value pairs inside `metadata`.

```yaml
# Bad
---
name: my-skill
priority: high
---

# Good
---
name: my-skill
description: Review code for quality issues. Use when submitting PRs.
metadata:
  version: 2.2
  author: someone
license: MIT
---
name: my-skill
description: Review code for quality issues. Use when submitting PRs.
---
```

## Pattern 2: Description Too Long

**Detect**: Description exceeds 30 words, over 1024 characters, or lacks trigger context.
**Problem**: Long descriptions waste tokens and reduce discoverability.
**Fix**: Follow `<Action> <Object>. Use when <Trigger>.`

## Pattern 3: Bloated SKILL.md

**Detect**: SKILL.md > 500 tokens or > 100 lines.
**Problem**: Every token in SKILL.md is loaded on every invocation.
**Fix**: Move reference content to `references/`, keep only imperative steps.

## Pattern 4: Educational Content in Instructions

**Detect**: Sections titled "Why...", "Background", "Understanding...", or explanatory paragraphs.
**Problem**: Background knowledge is not an instruction; it inflates token cost.
**Fix**: Move to `references/BACKGROUND.md`. Reference it with a Read step if needed.

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

## Pattern 12: XML Injection Risk in Description

**Detect**: XML angle brackets (`<` or `>`) in any frontmatter field.
**Problem**: Frontmatter is included in Claude's system prompt. XML brackets could be interpreted as prompt injection or cause parsing errors.
**Fix**: Remove all `<` and `>` characters from the description. Rewrite instructions using standard punctuation.

## Pattern 13: Improper Skill Naming

**Detect**: Skill `name` contains uppercase letters, spaces, underscores, or the reserved words `claude` or `anthropic`. Folder name does not match the `name` field.
**Problem**: Claude Code requires skill names to be strictly kebab-case (e.g., `my-cool-skill`), forbids reserved prefixes, and expects the folder name to match.
**Fix**: Convert the name to lowercase, replace spaces and underscores with hyphens (`-`), remove reserved words, and align the folder name.

## Pattern 14: Conflicting README.md

**Detect**: A `README.md` or `README_CN.md` file exists in the skill's root directory (alongside `SKILL.md`).
**Problem**: Redundant documentation wastes tokens and creates conflict with `SKILL.md`. Humans should read the repository-level README, while Claude reads `SKILL.md` or files inside `references/`.
**Fix**: Delete the `README.md` from the skill folder. Move any essential documentation to `SKILL.md` or a file within the `references/` directory.

## Pattern 15: Directory Naming Convention Violation

**Detect**: A `resources/` directory exists in the skill folder.
**Problem**: Per the official spec, `references/` content is auto-loaded into Agent context; `assets/` stores static files (path-only). The name `resources/` is ambiguous legacy naming — Claude Code will treat it as static assets and NOT load its content into context, silently breaking any skill that relies on those files being available in context.
**Fix**: Rename `resources/` to `references/` if the content should be auto-loaded into context, or to `assets/` if the files are static templates/binaries referenced by path only.

```
# Bad
resources/
  CHECKLIST.md   ← will NOT be loaded into context

# Good — context-loaded reference material
references/
  CHECKLIST.md   ← auto-loaded into Agent context

# Also Good — static files referenced by path
assets/
  template.json  ← referenced by $SKILL_DIR/assets/template.json, not read into context
```

## Pattern 16: Dangling File References

**Detect**: SKILL.md body 提到 `references/X.md` 或 `scripts/Y.py`，但文件不存在；或目录有文件但 body 从未引用。
**Problem**: Claude 尝试读取/执行不存在的文件会失败；孤立文件浪费 context 预算。
**Fix**: 创建缺失文件，或移除/更新 body 中的引用。确保 body 至少引用一个目录内文件。
