# Migrate and optimize renhua skill

## Status

Planning. The task is created because the user explicitly requested a Trellis task. Do not start implementation until the user reviews the planning direction and asks to proceed.

## Goal

Move `ref/repo/rnskill/skills/renhua` into the first-party `skills/` catalog at the right category, then optimize it as a reusable agent skill for Chinese AI/tech public writing. The optimized skill should preserve the source's strong voice and hard-ban pattern knowledge while fitting this repository's metadata, structure, validation, and routing conventions.

## Confirmed Facts

- Source package: `ref/repo/rnskill/skills/renhua/` contains `SKILL.md` and `agents/openai.yaml`.
- Source `SKILL.md` declares `name: renhua` and describes a Chinese AI/tech writing de-AI editor for posts, X/Twitter threads, technical essays, product notes, model reviews, and public-writing drafts.
- Source `SKILL.md` currently has no top-level `category`, `tags`, or `version`; `python scripts/check.py ref/repo/rnskill/skills/renhua --json` passes with a warning: `Top-level category is missing`.
- Source `agents/openai.yaml` parses as YAML and contains `display_name`, `short_description`, `default_prompt`, and `policy.allow_implicit_invocation`.
- User confirmed v1 should include a small `renhua_lint.py` residual-pattern reporter.
- The first-party skill layout is `skills/<category>/<skill-name>/SKILL.md`.
- `skills/code_map.md` defines `docs-writing-publishing/` as writing, document, and presentation-oriented skills, and `research-learning-knowledge/` as research and paper-workbench skills.
- Existing `humanizer-paper` is academic-only and explicitly routes generic/non-academic prose away from itself.
- Existing `document-writer` is codebase-grounded documentation and explicitly excludes general prose, marketing/social copy, and non-technical localization.
- Therefore the best target directory is `skills/docs-writing-publishing/renhua/`, not `research-learning-knowledge/`.
- Local `yao-meta-skill` references extra `references/` playbooks, but those files are absent in the installed package. Planning uses the available root `SKILL.md`, README, and repo-local skill review guidance only.

## Requirements

1. Create a first-party skill package at `skills/docs-writing-publishing/renhua/`.
2. Keep the skill identity as `name: renhua` unless the user chooses a rename; there is no current first-party name collision.
3. Add valid top-level frontmatter:
   - `category: docs-writing-publishing`
   - `tags` covering Chinese public writing, AI-tell removal, technical writing, posts/threads, and product/model review copy
   - `version`, likely `1.0.0` for its first first-party import
4. Preserve the source's core behavioral contract:
   - revised text only by default
   - diagnosis only when asked
   - preserve facts, numbers, product/model/tool names, dates, technical terms, stance, uncertainty, and lived experience
   - do not add new examples, data, quotes, or personal experience
5. Keep the strongest source-specific pattern knowledge, especially binary contrast shells, command-template openings, fake insight markers, lecture colon, vague referents, wrong time stance, vague comparatives, abstract-pressure endings, and slogan/metaphor endings.
6. Improve package structure with a lean `SKILL.md` plus supporting files where useful:
   - move long hard-ban examples/checklists into `references/`
   - add neutral `agents/interface.yaml` rather than platform-named `agents/openai.yaml`
   - add `evals/evals.json` with positive, negative, and forbidden-boundary routing cases
7. Add an explicit boundary against academic-paper polishing and detector evasion:
   - academic journal/dissertation polishing routes to `humanizer-paper`
   - codebase-grounded documentation routes to `document-writer`
   - requests to launder fully generated text past AI detectors should be refused or redirected to legitimate authorship work
8. Add a small pure-Python `scripts/renhua_lint.py` that reports residual banned Chinese shells/patterns in a final draft without rewriting it.
9. Refresh generated docs after public skill metadata changes.
10. Keep changes surgical: no unrelated skill rewrites, no changes under `ref/`, and no user-level skill installation in this task.

## Acceptance Criteria

- [ ] `skills/docs-writing-publishing/renhua/SKILL.md` exists with valid top-level frontmatter and `category: docs-writing-publishing`.
- [ ] `python scripts/check.py skills/docs-writing-publishing/renhua` reports `[OK]` with no category/tag/version-related warnings.
- [ ] The optimized skill clearly triggers on Chinese AI/tech public-writing edits: posts, X/Twitter threads, product notes, model reviews, public technical essays, and requests like `去AI味`, `改得像本人`, `写推特post`, `精修中文AI技术文章`.
- [ ] The optimized skill does not over-trigger on academic manuscripts/dissertations, codebase docs, tender documents, paper reading/synthesis, or generic "pass AI detector" laundering.
- [ ] Core hard-ban patterns from the source are preserved and reachable from `SKILL.md`, either directly or via referenced files.
- [ ] Default output contract is explicit: final revised copy only unless the user asks for diagnosis/audit.
- [ ] `agents/interface.yaml` exists in the neutral repo shape with display name, short description, and default prompt.
- [ ] `evals/evals.json` exists and includes at least:
      one positive X/Twitter/public post case, one positive AI/tech article case, one audit-only case, one routing-negative case vs `humanizer-paper`, one routing-negative case vs `document-writer`, and one integrity-boundary case for detector evasion.
- [ ] `scripts/renhua_lint.py` is included, pure stdlib, UTF-8 safe, reports matches without rewriting text, has `--json`, exits 0 as a reporter, and compiles under `just python-check`.
- [ ] `just docs-sync`, `just skills-check`, `just docs-check`, and `just ci` are run before completion, or any unavailable/failing gate is reported with exact failure output.

## Notes

- This is a complex task because it imports a skill, chooses catalog placement, changes public skill metadata, adds routing boundaries, likely adds evals, and may add a small deterministic lint helper.
- Final planning decision: new skill at `skills/docs-writing-publishing/renhua/`, keep the `renhua` slug, and include a small pattern-report script.

## Resolved Question

Decision: include `scripts/renhua_lint.py` in v1.

Rationale: the source already has a deterministic "Before Returning" banned-pattern scan, so a small stdlib reporter turns that fragile manual step into verifiable evidence without making the skill heavy. The tradeoff is one extra script and a little test/maintenance surface, accepted for this task.
