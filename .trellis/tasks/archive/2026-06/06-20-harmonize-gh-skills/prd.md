# Harmonize git-github-collaboration skill suite

## Goal

Fix runtime/contract defects and unify the four skills under
`skills/git-github-collaboration/` (`gh-address-comments`, `gh-bootstrap`,
`gh-fix-ci`, `git-commit`) to a single house standard. The skills currently come
from three different provenances and have drifted apart in path handling, tool
declarations, eval format, interface contracts, and directory structure.
`git-commit` is the most hardened member and serves as the reference standard.

## Background

Source: a yao-meta-method review of all four skills (2026-06-20). Findings, by
severity:

- **P0 (runtime-breaking):** F1 `$SKILL_DIR` is unset at runtime so three skills'
  `python "$SKILL_DIR/scripts/..."` calls resolve to a broken path; F2
  `allowed-tools` declares the invalid token `python` and omits `Edit`/`Write`
  that the fix-applying skills actually need.
- **P1 (suite consistency):** F3 gh-bootstrap's `phases/`+`specs/` describe a
  second, contradictory execution engine that the SKILL.md already replaced with a
  runtime script; F4 eval format is fragmented (`test-prompts.json` vs
  `evals/evals.json`) and lacks negative/near-neighbor cases; F5 interface
  contracts are platform-named (`agents/openai.yaml`) and field-inconsistent.
- **P2 (quality):** F6 stale `mcs-web-test` recipe (the `mcs/` workspace was
  removed); F7 thin `RULES.md` with an `EXACT CLOPY` typo; F8 uneven
  `LICENSE.txt`/`assets/` distribution; F9 missing governance metadata.

Scope decisions confirmed with the user:

- Execute **all** P0–P2 work packages.
- gh-bootstrap: **delete** `phases/` and `specs/execution-rules.md`; make the
  runtime script the single execution path.
- Plan via Trellis before implementing.

## Requirements

### R1 — Scripts resolve reliably (P0)

Every skill that invokes a bundled script must locate it without depending on an
unset `$SKILL_DIR`. The resolution mechanism must be identical across all four
skills and must work on the user's Windows + Git Bash environment.

### R2 — `allowed-tools` matches actual behavior (P0)

Each skill's `allowed-tools` must declare exactly the real Claude Code tools it
uses — no invalid tokens (`python`), no missing tools that a documented step
requires (fix-applying skills need `Edit`), no over-declared tools no step uses
(`Task` in gh-bootstrap unless justified).

### R3 — gh-bootstrap has one execution path (P1)

The runtime script (`gh_bootstrap_runtime.py`) is the only documented execution
engine. The contradictory manual `phases/`+`specs/execution-rules.md` flow is
removed. Remaining reference material (component→URL mapping) is consistent with
what the runtime script consumes.

### R4 — Evals are uniform and meaningful (P1)

All four skills use one eval format and location. Each skill's eval set includes
at least two negative/near-neighbor cases that assert correct routing against the
other three sibling skills.

### R5 — Interface contracts are uniform (P1)

The four interface files share one naming convention and consistent fields
(`display_name`, a genuinely short `short_description`, a consistent icon policy).
No skill claims capabilities its `allowed-tools` cannot deliver.

### R6 — Quality cleanup (P2)

Remove the stale `mcs-web-test` recipe; fix/absorb `RULES.md`; make
`LICENSE.txt`/`assets/` presence consistent across the suite; record optional
governance metadata in a check-clean way if pursued.

### R7 — Suite standard is captured (P1)

The agreed conventions are written down (a suite-level guidance file) so the four
skills do not drift apart again.

## Out of Scope

- Rewriting the three high-quality Python scripts' core logic.
- Adding a CI harness that executes eval cases (evals are currently not CI-gated;
  unification is for consistency and future tooling only).
- Changing git-commit's commit semantics, trailer policy, or message rules.
- Adding new skills or new top-level skill categories.

## Acceptance Criteria

- [ ] **AC1:** No skill body contains `$SKILL_DIR`; all script invocations use the
      chosen standard mechanism, verified by actually running one gh-\* script end to
      end and confirming the script is found.
- [ ] **AC2:** `allowed-tools` for each skill is correct: no `python` token;
      `gh-address-comments` and `gh-fix-ci` include `Edit`; gh-bootstrap drops unused
      `Task`; git-commit can read its own references.
- [ ] **AC3:** `gh-bootstrap/phases/` and `gh-bootstrap/specs/execution-rules.md`
      are deleted; SKILL.md references no deleted files; the runtime script is the only
      execution path described.
- [ ] **AC4:** All four skills carry `evals/evals.json` in the unified schema;
      `test-prompts.json` files are removed; each eval set has ≥2 negative/near-neighbor
      cases.
- [ ] **AC5:** All four interface files share one name and consistent fields;
      git-commit's `short_description` is one short line.
- [ ] **AC6:** No occurrence of `mcs-web-test` remains; `RULES.md` is fixed or
      absorbed; LICENSE/assets policy is consistent and documented.
- [ ] **AC7:** A suite-level convention note exists under
      `skills/git-github-collaboration/`.
- [ ] **AC8:** `just docs-sync` then `just ci` both pass clean (skills-check,
      python-check, node-test, docs-check, `git diff --check`).

## Constraints

- **Surgical:** every changed line traces to a finding above; do not "improve"
  unrelated code, comments, or formatting.
- **House standard = git-commit:** converge the other three toward its proven
  patterns rather than inventing new ones.
- **No behavior regression:** the skills must still do what their descriptions
  promise after the change.
- **Validation reality:** `scripts/check.py` only validates SKILL.md frontmatter;
  unknown frontmatter keys warn (do not fail); `description` must not contain
  `<`/`>`. Structural changes (deleting dirs, moving evals, renaming yaml) drift the
  docs catalog, so `just docs-sync` must run before `just ci`.
