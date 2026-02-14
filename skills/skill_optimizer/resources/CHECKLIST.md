# Skill Optimization Checklist

## 1. Frontmatter Compliance

- **Check**: All fields are in the official set: `name`, `description`, `argument-hint`, `disable-model-invocation`, `user-invocable`, `allowed-tools`, `model`, `context`, `agent`, `hooks`, `category`, `tags`.
- **Fail**: Any field not in the list (e.g., `version`, `author`, `license`).
- **Fix**: Remove non-standard fields. Migrate useful metadata into SKILL.md body or resources/.

## 2. Description Quality

- **Check**: 10–30 words. Follows `<Action> <Object>. Use when <Trigger>.` pattern. Contains concrete trigger conditions.
- **Fail**: Over 40 words, vague, or missing trigger context.
- **Fix**: Rewrite to formula. Example: `Analyze and optimize skills for compliance. Use when reviewing or improving existing skills.`

## 3. Token Efficiency

- **Check**: SKILL.md < 300 tokens core instructions. Total with resources < 3000 tokens.
- **Fail**: SKILL.md > 500 tokens, or contains reference material inline.
- **Fix**: Move reference content to `resources/`. Keep only executable instructions in SKILL.md.

## 4. Content Layering

- **Check**: SKILL.md contains only execution instructions. Background knowledge, examples, and reference tables are in `resources/` or `scripts/`.
- **Fail**: Educational sections ("Why X fails", "Background on Y") in SKILL.md.
- **Fix**: Extract to `resources/BACKGROUND.md` or similar.

## 5. Instruction Clarity

- **Check**: All instructions use imperative voice ("Run X", "Check Y"). Steps are numbered and unambiguous.
- **Fail**: Passive voice ("X should be done"), first-person ("I'll check"), or vague steps.
- **Fix**: Rewrite each instruction as a direct command.

## 6. Official Feature Utilization

- **Check**: Uses `$ARGUMENTS` if skill accepts input. Uses `argument-hint` if parameterized. Uses `allowed-tools` to restrict scope. Uses `!`command`` for dynamic context where beneficial.
- **Fail**: Hardcoded paths, no parameter support, unrestricted tool access.
- **Fix**: Add the appropriate frontmatter fields and template variables.

## 7. Script/Resource Utilization

- **Check**: Deterministic operations (parsing, counting, validation) are in scripts. Reference data is in resources/.
- **Fail**: Claude asked to manually count tokens, parse YAML, or perform mechanical checks.
- **Fix**: Create a script for the deterministic work, output structured data (JSON).

## 8. Workflow Completeness

- **Check**: Includes validation step (script or manual). Has clear output format. Handles error cases.
- **Fail**: No verification, vague output expectations, no error guidance.
- **Fix**: Add validation script, define output template, add error handling section.
