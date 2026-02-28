# Skill Optimization Checklist

## 1. Frontmatter Compliance

- **Check**: All fields are in the official set: `name`, `description`, `argument-hint`, `disable-model-invocation`, `user-invocable`, `allowed-tools`, `model`, `context`, `agent`, `hooks`, `license`, `compatibility`, `metadata`. Custom fields like `category` and `tags` belong inside `metadata`.
- **Fail**: Any field not in the list (e.g., top-level `version`, `author`, `priority`, `category`, `tags`).
- **Fix**: Remove non-standard fields. Use `metadata` for custom key-value pairs.

## 2. Naming & Security Restrictions

- **Check**: Skill `name` uses strict kebab-case, matches folder name, and no frontmatter field contains XML brackets.
- **Fail**: Name has spaces/uppercase/underscores, uses reserved words (`claude`, `anthropic`), folder name differs from `name` field, or any frontmatter field contains `<` or `>`.
- **Fix**: Rename to kebab-case. Align folder and `name` field. Remove XML brackets.

## 3. Description Quality

- **Check**: 10–30 words, under 1024 characters. Follows `<Action> <Object>. Use when <Trigger>.` pattern. Contains concrete trigger conditions.
- **Fail**: Over 40 words, over 1024 characters, vague, or missing trigger context.
- **Fix**: Rewrite to formula. Example: `Analyze and optimize skills for compliance. Use when reviewing or improving existing skills.`

## 4. Token Efficiency

- **Check**: SKILL.md body < 300 tokens. SKILL.md internal total < 3000 tokens. (External references are lazily loaded and not subject to this strict limit).
- **Fail**: Body > 500 tokens, or contains reference material inline.
- **Fix**: Move reference content to `references/` or `assets/`. Keep only executable instructions.

## 5. Content Layering

- **Check**: SKILL.md contains only execution instructions. Background knowledge and reference tables are in `references/`, `assets/`, or `scripts/`.
- **Fail**: Educational sections ("Why X fails", "Background on Y") in SKILL.md.
- **Fix**: Extract to `references/BACKGROUND.md` or similar.

## 6. Instruction Clarity

- **Check**: All instructions use imperative voice ("Run X", "Check Y"). Steps are numbered and unambiguous.
- **Fail**: Passive voice ("X should be done"), first-person ("I'll check"), or vague steps.
- **Fix**: Rewrite each instruction as a direct command.

## 7. Official Feature Utilization

- **Check**: Uses `$ARGUMENTS` if skill accepts input. Uses `argument-hint` if parameterized. Uses `allowed-tools` to restrict scope. Uses `!`command`` for dynamic context where beneficial.
- **Fail**: Hardcoded paths, no parameter support, unrestricted tool access.
- **Fix**: Add the appropriate frontmatter fields and template variables.

## 8. Script/Resource Utilization

- **Check**: Deterministic operations (parsing, counting, validation) are in scripts. Reference data is in `references/`.
- **Fail**: Claude asked to manually count tokens, parse YAML, or perform mechanical checks.
- **Fix**: Create a script for the deterministic work, output structured data (JSON).

## 9. Workflow Completeness

- **Check**: Includes validation step (script or manual). Has clear output format. Handles error cases. Includes examples and troubleshooting guidance for larger skills.
- **Fail**: No verification, vague output expectations, no error guidance.
- **Fix**: Add validation script, define output template, add error handling section.

## 10. Scope Overlap

- **Check**: Skill description and tags are distinct from sibling skills. Trigger conditions do not overlap with existing skills in the same directory.
- **Fail**: Description Jaccard similarity ≥ 0.4 with another skill, or ≥ 2 shared tags without clear scope differentiation.
- **Fix**: Differentiate descriptions with distinct verbs and trigger conditions. Use more specific tags. Consider merging highly overlapping skills.
