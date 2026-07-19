# Design — merge paper-plot into academic-figure

The merge keeps `academic-figure` as the public skill and makes the mode and
contract boundary explicit. The entrypoint remains a router; branch-heavy
material stays in references.

## 1. Canonical boundary and routing precedence

| Input intent | Canonical mode | Authoritative output contract |
|---|---|---|
| Explicit journal/thesis target, or compliance review of an existing figure | `journal-spec` | Academic-figure compliance contract |
| Named paper-style catalog entry or “use this paper style for my data” | `from-data` | Paper-plot mimicry contract |
| Uploaded figure to reproduce, without an explicit journal target | `from-image` | Paper-plot mimicry contract |
| Explicit journal target plus style/image | `journal-spec` | Style/image is reference material only |
| Exact mimicry and journal compliance both explicitly required | Ask once | The user chooses which contract is authoritative |
| Generic `论文配图` with no style/image | `journal-spec` | Existing preference/ask-once journal resolution |

The explicit-journal rule is the first tie-break. A named catalog token or
uploaded image selects a reproduction mode only when no explicit journal target
is present. All files, prose, and assertions use the canonical IDs.

## 2. Final directory layout

```text
skills/academic-research-tools/academic-figure/
  SKILL.md
  references/
    figure-contract.md
    journal-specs.md
    matplotlib-recipes.md
    plotly-recipes.md
    chart-recipes.md
    qa-checklist.md
    industrytslib-integration.md
    modes/
      journal-spec.md       # moved six-step journal protocol
      from-data.md          # moved; style catalog is its source of truth
      from-image.md         # moved
    styles/                  # 8 moved parameter files
    reproduction_guide.md   # moved
  scripts/
    academic_figure_pref.py
    bar_memevolve.py
    bar_spice.py
    line_selfdistill.py
    line_aime.py
    line_loss_inset.py
    scatter_tsne.py
    scatter_break.py
    radar_dora.py
    classwise_iou_table.py
  assets/originals/          # 10 moved PNGs
  tests/pref-script.test.mjs
  evals/evals.json
```

`skills/research-learning-knowledge/paper-plot/` is removed after the tracked
entrypoint/evals are deleted and any ignored residual directory is quarantined.

## 3. Entrypoint information hierarchy

`SKILL.md` contains only:

1. Frontmatter and a compact trigger description.
2. The mode router and the precedence table above.
3. One authoritative output-contract table.
4. A short route-elsewhere table for `literature-mentor` and
   `paper-workbench` plus BI/graphical-abstract exclusions.
5. A resource index with explicit pointers.

The six journal steps move from the current entrypoint to
`references/modes/journal-spec.md`. That file begins with the journal contract,
contains the six steps unchanged, and ends with the checkable completion rule:
the figure contract is locked and every applicable QA item passes.

`references/modes/from-data.md` remains the sole source of truth for the exact
style-to-script catalog and data substitution workflow. `from-image.md` keeps
its image measurement and visual comparison workflow and points to the style
catalog without copying its full table. The reproduction guide remains the
on-demand deep reference. This prevents the top-level router from absorbing
branch-only context and avoids a second copy of the style map.

## 4. Output contracts

The contract table in `SKILL.md` is authoritative:

| Mode | Required output behavior |
|---|---|
| `journal-spec` | Vector-first PDF/SVG/EPS; journal size, font, DPI, and colorblind-safe defaults; `fonttype=42`; full QA checklist |
| `from-data` / `from-image` | Matplotlib; `dpi=300` PNG; deliberately mimic the selected style/source; do not impose journal QA by default |

Mode references point back to the selected row rather than restating a second
conflicting contract. A mixed-input case is included in both trigger and
behavior evals so the precedence is observable.

## 5. Move map

All moves are history-preserving `git mv` operations:

| Source | Destination |
|---|---|
| `PP/references/modes/` | `AF/references/modes/` |
| `PP/references/styles/` | `AF/references/styles/` |
| `PP/references/reproduction_guide.md` | `AF/references/reproduction_guide.md` |
| `PP/scripts/*.py` (9) | `AF/scripts/` |
| `PP/assets/originals/` | `AF/assets/originals/` |
| `PP/SKILL.md`, `PP/evals/evals.json` | merged content, then deleted |

Relative references remain valid because the mode/style/guide directories keep
their `references/` parent, and `<skill-dir>/scripts/...` and
`<skill-dir>/assets/...` keep their skill-relative names. The move does not
change script code. `line_selfdistill.py` is the explicit two-output exception
to the otherwise single optional output path.

## 6. Entrypoint and eval content

The new description is authored before the body and fixed during planning so
implementation does not invent a new trigger surface:

> Create or review academic figures in three modes. journal-spec creates or
> reviews publication-ready figures for journal submission specs using
> matplotlib, seaborn, plotly, or industrytslib. from-data fills a named
> paper-style catalog with user data. from-image reproduces an uploaded paper
> figure as a matplotlib script and 300 dpi PNG. Use for 论文配图, 期刊图, 科研绘图,
> 审阅投稿图, 用某论文风格画数据, 复现这张图, or a named catalog style. An explicit
> journal target takes precedence over a style or reference image. Paper
> reading and multi-paper synthesis route to their dedicated research skills.

It includes create/review, the three canonical mode labels, bilingual
journal/style/image triggers, explicit-journal precedence, and positive route
guidance. It remains below 1024 characters and contains no angle brackets.

The behavior fixture starts with all 15 source cases, flips the two former
paper-plot routing negatives into `from-data`/`from-image` positives, and adds:

- a review-only journal-spec case;
- a mixed explicit-journal-plus-uploaded-image case;
- assertions that journal cases produce vector/compliance behavior while
  reproduction cases produce 300-DPI PNG/mimicry behavior.

The task-local trigger fixtures are:

- `research/trigger-cases.json` — visible positives, negatives, and
  near-neighbor families;
- `research/semantic_config.json` — figure/journal/style/image/review concepts
  and exclusions.

Run the external evaluator with a PyYAML-extracted description value because
the evaluator's `--description-file` parser does not reliably expand a folded
`description: >` frontmatter scalar.

## 7. Reference and docs rewrites

- `skills/academic-research-tools/AGENTS.md` describes one skill with three
  internal modes and keeps only the `literature-mentor` and `paper-workbench`
  near-neighbor boundary.
- `.trellis/spec/guides/skill-authoring-conventions.md` names
  `academic-figure` as the reference implementation.
- `just docs-sync` regenerates catalog and detail pages and removes stale
  `paper-plot` pages. No generated file is hand-edited.

## 8. Rollback boundary

Rollback is allowlist-based and only applies after preflight proves there are
no unrelated changes under `AF` or `PP`. Use exact-path `git restore
--source=HEAD --staged --worktree -- <AF/PP paths>` to undo tracked moves and
text edits, and remove only the known new `journal-spec.md` path if needed.
Do not use `git checkout -- .` or `git clean -fd`; those commands either leave
staged moves in place or can destroy unrelated user files. Quarantined residuals
under the OS temp directory are recoverable.

## 9. Out of scope

No plotting algorithm, style parameter, journal spec, preference CLI, or
industrytslib behavior changes. No provider-backed output-quality experiment,
memory mutation, or unrelated cleanup.
