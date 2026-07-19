# Merge academic-figure and paper-plot into one skill

## Goal

Full-merge `paper-plot` into `academic-figure` so one installable skill owns
three canonical modes:

- **journal-spec** — create or review a figure against a target journal or
  thesis submission contract.
- **from-data** — fill a named paper-style catalog entry with user data.
- **from-image** — reproduce an uploaded paper figure as a matplotlib script.

The user chose the full merge over the lighter boundary-sharpening option. The
merge must preserve both existing output contracts while making routing and
initial context load predictable.

## Confirmed facts

- `academic-figure` currently covers journal-compliance figure creation and
  review, with a six-step protocol, preference CLI, Node test, and 10 evals.
- `paper-plot` currently contains 9 Python scripts, 8 style parameter files,
  2 mode references, a reproduction guide, and 10 original PNGs.
- The repository checker enforces `category == parent directory`, a
  description below 1024 characters, and no angle brackets.
- Repository eval JSON is a review fixture, not a CI-executed trigger gate.
  The project authoring spec requires a separate `trigger_eval.py` case set
  and semantic config for routing-boundary changes.
- The current checkout uses PowerShell and hides untracked files in ordinary
  `git status`; implementation preflight must use `git status --porcelain=v1
  -uall` and allow only the expected task files.

## Requirements

### R1 — One skill, three canonical modes, mode-selected contract

- Keep the skill at `skills/academic-research-tools/academic-figure/`.
- Use the canonical mode IDs `journal-spec`, `from-data`, and `from-image` in
  `SKILL.md`, references, eval assertions, and implementation notes.
- An explicit journal or thesis submission target takes precedence over a
  named style or uploaded image. In that case the image/style is a visual
  reference only and the journal contract governs. If the user explicitly
  demands both exact mimicry and journal compliance, ask once because the two
  contracts conflict.
- `journal-spec` keeps academic-figure's compliance contract: vector-first
  PDF/SVG/EPS, journal size/DPI/font requirements, colorblind-safe defaults,
  and the QA checklist.
- `from-data` and `from-image` keep paper-plot's mimicry contract: matplotlib,
  `dpi=300` PNG, and deliberate visual copying even when the source is not
  journal-compliant.

### R2 — Absorb every paper-plot asset without changing plotting logic

- Move all 9 scripts, all 8 style files, both mode references, the reproduction
  guide, and all 10 original PNGs under the merged skill.
- Preserve the `<skill-dir>` path convention and script behavior. Every script
  accepts an optional first output path; `line_selfdistill.py` additionally
  accepts an optional second output path and emits two figures.
- Keep academic-figure's existing references, preference CLI, and Node test.

### R3 — One valid trigger description

- The merged `SKILL.md` has one description below 1024 characters with no angle
  brackets and `category: academic-research-tools`.
- The description covers figure creation and review plus all three modes in
  English and Chinese trigger language.
- Exclusions are expressed as positive route guidance in the body and evals;
  the description does not spend its budget on a long `Not for...` list.

### R4 — Behavioral evals and trigger evals move together

- Merge the 15 source behavior cases into
  `academic-figure/evals/evals.json`, renumber them, and keep the two
  cross-skill negatives as in-skill mode positives.
- Add regression cases for review-only input and the explicit-journal-plus-
  reference-image precedence rule. The merged behavior fixture therefore has
  17 contiguous cases and assertions for both output contracts.
- Keep the real route negatives for `literature-mentor` and `paper-workbench`,
  plus BI dashboards and AI graphical abstracts.
- Add the task-local trigger suite and semantic config under `research/` and
  require zero false positives and zero false negatives from `trigger_eval.py`.

### R5 — Remove the live two-skill split from references

- Rewrite `skills/academic-research-tools/AGENTS.md` around the internal
  mode/contract boundary and the surviving near-neighbor skills.
- Replace the `paper-plot` reference in
  `.trellis/spec/guides/skill-authoring-conventions.md` with `academic-figure`.
- Remove the paper-plot self-route from `academic-figure/SKILL.md` and remove
  its stale future-build sentence.
- No live `paper-plot` reference remains in `skills/`, `docs/`, `platforms/`,
  or `.trellis/spec/`; archive and journal history is left untouched.

### R6 — Regenerate docs

- Run `just docs-sync`; do not hand-edit generated pages.
- `just ci` must pass, including the generated-doc check and site build.

### R7 — Cleanly remove the old path

- Delete the tracked `paper-plot` entrypoint and evals after moving assets.
- Quarantine any ignored residual directory under the OS temp directory using
  an explicit PowerShell path; do not use recursive deletion on a broad path.

## Locked decisions

- Keep `academic-figure` as the surviving skill name and directory.
- Use `journal-spec`, `from-data`, and `from-image` as the only mode IDs.
- Explicit journal target wins over a named style or reference image; an
  explicit exact-mimicry-plus-journal conflict asks once.
- Clean removal of the old `paper-plot` path; no redirect or tombstone.

## Acceptance criteria

- [ ] The merged skill directory exists and the old `paper-plot` path is absent
      after residual quarantine.
- [ ] `SKILL.md` contains the three canonical mode IDs, preserves create/review
      behavior, and passes `scripts/check.py` constraints.
- [ ] The expected inventory is complete: 9 scripts, 8 styles, 2 mode files,
      1 reproduction guide, and 10 original PNGs; no moved source is missing.
- [ ] All moved Python files pass `just python-check`; the four matplotlib/numpy
      smoke scripts emit PNGs; dependency-gated scripts are run when their
      declared dependency exists, otherwise the missing evidence is recorded.
- [ ] The `line_selfdistill.py` two-output exception is documented and tested
      with two output paths when its dependencies are available.
- [ ] The 17-case behavior fixture is valid JSON, covers all modes, review,
      contract separation, and surviving negatives.
- [ ] The task-local trigger eval has zero false positives and zero false
      negatives at its declared threshold. If the external evaluator is
      unavailable, the result is recorded as missing evidence, not a pass.
- [ ] All non-archive live references are clean, `just docs-sync` has run, and
      `just ci` is green.
- [ ] No commit, archive, or `task.py start` occurs before the user reviews the
      final planning artifacts.

## Out of scope

- No rewrite of plotting algorithms, style parameters, journal cards, or the
  preference CLI.
- No provider-backed output-quality experiment; the task adds deterministic
  route and artifact gates only.
- No memory update or unrelated cleanup.

## Open questions

None. The only product ambiguity, mixed journal target plus reproduction input,
is resolved by the locked precedence above.
