# Geju Skill Optimization Design

- Date: 2026-06-06
- Status: Draft for review

## Summary

Optimize `geju` as a self-contained English-only strategic reframing skill. The target state keeps the current skill identity while removing Chinese text, cross-skill references, and incomplete metadata. The implementation should be a small content-focused change with docs regeneration and validation.

## Scope And Boundaries

In scope:

- `skills/development-workflows/geju/SKILL.md`
- `skills/development-workflows/geju/references/output-template.md`
- `skills/development-workflows/geju/agents/openai.yaml` if the default prompt needs alignment
- Generated docs under `docs/` after `just docs-sync`

Out of scope:

- Directory rename
- Skill slug rename
- New helper scripts
- Runtime behavior changes outside this skill package
- New tests unless implementation reveals a cheap deterministic check worth adding

## Target Model

`geju` should be an English-language "bigger frame" judgment skill:

- It starts from the desired end state instead of the current implementation.
- It treats compatibility, migration cost, legacy names, and local code shape as constraints to evaluate, not default vetoes.
- It produces a bold thesis and then makes that thesis testable.
- It explicitly separates the clean target direction from execution sequencing.
- It avoids becoming a code review, PRD writing, risk review, or implementation workflow.

## Language Strategy

Use English everywhere in the skill package.

Recommended replacements:

- Chinese trigger phrases in frontmatter -> English trigger phrases such as "think bigger", "open up the design space", "challenge local-detail fixation", and "make a bold product or architecture direction call".
- Mixed-language "high-geju thesis" -> "bigger-frame thesis" or "high-leverage thesis".
- Template title -> `# Strategic Frame: <topic>`.
- Template heading -> `## High-Leverage Direction`.
- Core principle -> "Bold hypothesis, careful verification."

The word `geju` may remain as the skill name and explicit `$geju` invocation because it is the stable ASCII identifier for this skill.

## Frontmatter Design

Add complete top-level metadata:

```yaml
name: geju
description: Use when the user explicitly asks to think bigger, open up the design space, challenge conservative design, avoid over-indexing on backward compatibility, escape local-detail fixation, or make a bold high-level product or architecture direction call. Use for strategic reframing, not for ordinary code review, PRD writing, implementation planning, or adversarial risk review.
category: development-workflows
tags:
  - strategy
  - architecture
  - product-direction
  - design-judgment
  - compatibility
version: 0.1.0
```

The implementation may adjust wording, but it should preserve these semantics.

## Cross-Skill Reference Strategy

Remove all direct references to other skills.

Replace:

- "Use `<skill-name>` for ..." wording

With:

- "This is not a substitute for implementation quality review."
- "This is not a deep architecture review."
- "This is not a PRD authoring workflow."
- "If the user asks for those outputs, handle that as a separate workflow rather than forcing this skill to do it."

This keeps the skill portable and avoids coupling it to this repository's catalog.

## Content Structure

Keep the existing useful structure, but tighten the boundaries:

1. Overview
2. Core principle
3. Ways to open the frame
4. What to fight
5. Workflow
6. Output rules
7. What this skill is not

Add one explicit rule near the workflow or output rules:

- Do not modify files, write code, or start execution while using this skill unless the user separately asks for implementation after the strategic judgment.

## Output Template Design

Keep `references/output-template.md` as a structured optional template, but make it English-only.

Recommended headings:

- `# Strategic Frame: <topic>`
- `## Thesis`
- `## Confidence`
- `## The Trap`
- `## High-Leverage Direction`
- `## Frame-Opening Move`
- `## Bold Takes`
- `## Options`
- `## What Not To Do`
- `## First Proof Point`
- `## Falsifier`

The template should guide structured answers without forcing a long report for every short prompt. `SKILL.md` should allow concise output when the user asks a narrow question.

## Compatibility And Migration Notes

This task intentionally does not preserve the Chinese trigger phrases because the user requested English-only skill content.

Compatibility to preserve:

- Directory path
- `name: geju`
- `$geju` self-invocation in `agents/openai.yaml`
- Existing strategic reframing purpose

Compatibility not required:

- Chinese prompt synonyms
- References to absent skills
- References to other repository skills
- Missing metadata state

## Validation Design

Use deterministic checks before subjective review:

```powershell
rg -n "[^\x00-\x7F]" skills/development-workflows/geju
rg -n "clean-code-reviewer|hai-architecture|hai-prd|code-auditor|code-quality-review|spark|cold-shower" skills/development-workflows/geju
python scripts/check.py skills/development-workflows/geju
just docs-sync
python docs/scripts/sync_docs_catalog.py --check
just skills-check
just docs-check
just ci
```

The `$geju` self-reference in `agents/openai.yaml` is allowed; broader `$<skill>` references are not.

## Risks And Mitigations

- Risk: Removing Chinese trigger phrases may reduce trigger recall for Chinese user prompts.
  - Mitigation: This is accepted by the user's explicit English-only requirement.
- Risk: A too-broad description may trigger for ordinary reviews or planning.
  - Mitigation: Put negative trigger boundaries in the description.
- Risk: A too-heavy template may make short answers verbose.
  - Mitigation: Treat the template as a structure for full responses, not a mandatory length requirement.
- Risk: Generated docs drift remains after metadata changes.
  - Mitigation: Run `just docs-sync`, then `just docs-check`.

## Rollback Plan

The implementation should be a small file-content change plus generated docs. If validation or review shows the rewrite damages the skill's intent, revert only the `geju` skill files and regenerated `geju` docs from the patch. Do not touch unrelated skill packages.
