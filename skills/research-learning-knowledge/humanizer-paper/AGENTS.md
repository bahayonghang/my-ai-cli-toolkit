# AGENTS.md

Guidance for AI coding agents (Claude Code, Codex, Warp, etc.) working in this
skill. Read the suite-level `skills/research-learning-knowledge/AGENTS.md` first;
this file adds the contract specific to `humanizer-paper`.

## What this skill is

A register-aware **academic** language polisher with two modes (`en-journal`,
`zh-dissertation`). The runtime artifact is `SKILL.md` — its YAML frontmatter
(metadata + allowed tools) followed by the router and behavioral rules. The heavy
content lives in `references/`; a bundled `scripts/polish_lint.py` covers the
quantifiable tells. This is **not** a generic prose humanizer, and generic
non-academic prose is intentionally out of scope.

## Key files (the sync set)

- `SKILL.md` — the router + behavioral hard rules (integrity boundary,
  target/section routing, core loop, output contract, `<skill-dir>` note). It is
  the source of truth for behavior and frontmatter.
- `references/ai-tells-academic.md` — the **re-gated kernel**: the taxonomy with a
  keep / calibrate / disable gate per tell, academic before/after, plus the 5 new
  academic-specific tells.
- `references/en-journal.md`, `references/zh-dissertation.md` — the two norm packs.
- `scripts/polish_lint.py` — the mechanical linter.
- `README.md` — for humans: what it does, the integrity boundary, install/usage,
  structure, and version history.
- `evals/evals.json` — trigger + routing-negative cases (git-commit schema).

## The maintenance contract

`SKILL.md`, `README.md`, and `references/` must stay in sync. The model here is
**not** "33 numbered generic patterns" — do not reintroduce a flat numbered
pattern table as the source of truth. The model is:

> a **re-gated kernel** (each tell gated keep / calibrate / disable for academic
> register) **plus academic additions** (the 5 new tells and the two norm packs).

When you change behavior or content:

- **Kernel gates:** if you change a tell's gate (keep ↔ calibrate ↔ disable) or
  its academic before/after, update `references/ai-tells-academic.md` and any
  cross-reference in the norm packs and `SKILL.md` in the same change. The
  re-gating rationale (which general-prose defaults are backwards in academic
  register) must stay consistent across the kernel and both norm packs.
- **Norm packs:** keep `en-journal.md` / `zh-dissertation.md` aligned with the
  kernel's calibrated tells (especially passive section-gating, hedging
  calibration, dash rules, terminology consistency) and with the `README.md`
  summary of what each pack covers.
- **Linter contract:** `SKILL.md` documents the `polish_lint.py` flags
  (`--target {en-journal,zh-dissertation}`, `--file`, `--glossary`, `--json`,
  `--save`). If you change the CLI or the surface/cadence/terms check set, update
  the `SKILL.md` "Mechanical check" section, the `README.md` usage block, and the
  kernel checklist the linter mirrors, together.
- **Integrity boundary:** the "polish the author's own draft, not detector
  evasion" rule is a behavioral hard rule. It lives in the `SKILL.md` 诚信边界
  section, is echoed in `zh-dissertation.md` §八, and is summarized in `README.md`.
  Keep all three consistent; do not weaken it.
- **Version:** `SKILL.md` frontmatter `version:` and the `README.md`
  "Version History" must bump together. A scope/behavior change is a major bump.
- **Non-obvious fixes:** if you change the prompt or the linter to handle a
  tricky failure mode, add a short note to the `README.md` version history.

## Script convention

- Refer to the skill's own directory as `` `<skill-dir>` `` in `SKILL.md` and tell
  the agent to substitute the literal path announced when the skill loads. **Do
  not** use a bare `$SKILL_DIR` — it is unset at runtime and expands to a broken
  path.
- Bundled scripts are **pure standard library** and **self-locate** via
  `Path(__file__)`, so only the script _path_ must resolve. `polish_lint.py` is a
  reporter: it must keep **exit code 0** (it is not a gate) and read/write UTF-8
  explicitly (the repo hits GBK decode errors on Windows otherwise — run with
  `PYTHONUTF8=1`).

## Validation

- `python scripts/check.py skills/research-learning-knowledge/humanizer-paper`
  validates frontmatter (it must be `[OK]` with no `compatibility` warning).
- `just python-check` does `py_compile` on the script (CI gate). `pytest` under
  `tests/` is **local/optional** and not wired into CI.
- Adding/removing resource folders drifts the docs catalog — run `just docs-sync`,
  then `just ci` (which runs `docs-check`) must pass clean.
