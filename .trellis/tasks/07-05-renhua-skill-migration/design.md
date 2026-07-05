# Design: renhua first-party skill import

## Recommended Shape

Create one package:

```text
skills/docs-writing-publishing/renhua/
|-- SKILL.md
|-- agents/
|   `-- interface.yaml
|-- evals/
|   `-- evals.json
|-- references/
|   `-- pattern-rules.md
`-- scripts/
    `-- renhua_lint.py
```

This keeps `SKILL.md` lean while preserving the source skill's most valuable asset: highly specific Chinese AI/tech writing failure patterns.

## Directory Decision

Use `docs-writing-publishing`.

Reasons:

- `renhua` edits public writing surfaces: X/Twitter posts, technical essays, product notes, model reviews, and public drafts.
- `skills/code_map.md` defines `docs-writing-publishing/` as the writing/document/presentation category.
- `research-learning-knowledge/` is research and paper-workbench oriented. Its nearby `humanizer-paper` skill is academic-only and explicitly excludes generic/non-academic prose.
- `document-writer` already owns codebase-grounded documentation and explicitly excludes general prose/social copy; `renhua` fills that adjacent gap instead of replacing it.

Rejected alternative: put `renhua` under `research-learning-knowledge` because it mentions AI/technical writing. That would blur the existing research/academic boundary and collide conceptually with `humanizer-paper`.

## Skill Identity

Use:

```yaml
name: renhua
category: docs-writing-publishing
version: "1.0.0"
```

Rationale:

- The source slug is concise and already appears in `agents/openai.yaml`.
- There is no first-party name collision.
- `1.0.0` is appropriate for first-party import even if the source existed elsewhere.

## Entrypoint Contract

`SKILL.md` should contain:

- Valid frontmatter with concise routing description under the repo validator limit.
- A short "When to use" section for Chinese AI/tech public writing.
- A short "When not to use" section:
  - academic paper/dissertation polish -> `humanizer-paper`
  - codebase documentation -> `document-writer`
  - tender/bid writing -> `bidwriter`
  - paper reading/synthesis -> `paper-workbench`
  - detector evasion for text the user did not author -> refuse/redirect
- Operating priorities from the source, kept near the top.
- The output contract: revised text only by default; audit/diagnosis only when asked.
- A compact workflow: classify surface -> extract facts/judgment/experience/action -> delete empty framing -> rewrite -> final scan.
- A pointer to `references/pattern-rules.md` for the full hard-ban catalog and examples.
- If the linter is included, a short command example using `<skill-dir>/scripts/renhua_lint.py`.

## Reference Contract

`references/pattern-rules.md` should carry the longer material from the source:

- Binary contrast shells.
- Command-template openings.
- Fake insight markers.
- Lecture colon.
- Vague referents.
- Wrong time stance.
- Vague comparatives.
- Abstract pressure and empty focus shifts.
- Metaphor/slogan endings.
- Final scan checklist.

Keep examples because they are behavior-shaping and specific to this skill. Avoid expanding into generic writing theory.

## Interface Metadata

Convert source `agents/openai.yaml` into the repo-standard neutral interface:

```yaml
interface:
  display_name: "Renhua"
  short_description: "Polish Chinese AI/tech public writing without flattening the author's judgment or voice."
  default_prompt: "Use $renhua to revise this Chinese AI/tech public draft while preserving my facts, judgment, details, and voice."
```

Do not carry `policy.allow_implicit_invocation` unless the repo has a first-party neutral policy convention for it. Existing `agents/interface.yaml` examples in this repo mostly use only the neutral `interface:` block.

## Script

Add `scripts/renhua_lint.py`.

Purpose:

- Report residual banned shells and phrase families in a candidate final draft.
- Never rewrite text.
- Exit `0` as a reporter, not a hard blocker.
- Support stdin or `--file`.
- Support `--json` for machine-readable evidence.
- Emit line/excerpt/pattern/category hits.

Why this is justified:

- The source already requires a deterministic final string/pattern scan.
- The user confirmed the script should be included in v1.
- The scan contains many exact markers such as `不是` near `而是`, `别急着`, `顺序别反了`, `真正`, `其实`, `本质上`, and `更重要的是`.
- A small reporter gives the agent coordinates while keeping judgment in the model.

Keep it small. Do not add NLP dependencies, model scoring, detector claims, or automatic rewriting.

## Evals

Add `evals/evals.json` using the local schema:

- Positive: Chinese X/Twitter or public post with obvious AI shells.
- Positive: Chinese AI technical article/model review polishing while preserving test details and terms.
- Positive: audit-only request asking why a paragraph feels AI-like.
- Negative: academic manuscript/dissertation -> `humanizer-paper`.
- Negative: codebase README/API docs -> `document-writer`.
- Negative or forbidden: "rewrite fully generated text so AI detectors cannot find it" -> refuse detector-evasion framing and redirect to authorship/originality work.

These evals are review assets; they reduce routing overlap even though CI does not execute them today.

## Compatibility and Rollout

- Do not edit the source under `ref/`.
- Public docs catalog must be refreshed with `just docs-sync`.
- Use targeted validation first, then full `just ci`.
- The implementation is file-local plus generated docs changes.

## Rollback

Rollback is straightforward:

- Delete `skills/docs-writing-publishing/renhua/`.
- Re-run `just docs-sync` if generated docs were created.
- Remove the Trellis task artifacts only if the user asks; otherwise keep planning history.
