# Scripts Subtree Guidelines

This `AGENTS.md` governs `scripts/**`. Root `AGENTS.md` still applies.

## Subtree Purpose

`scripts/` owns repository-wide validation, Python test discovery, and local project skill live-linking.

- Docs catalog sync and VitePress build helpers live in `docs/scripts/`, not here.
- Skill-specific scripts live inside the owning skill at `skills/<category>/<skill>/scripts/`.

## Script Inventory

| File | Role | `just` Entrypoint | Runtime & Boundaries |
| :--- | :--- | :--- | :--- |
| `check_skill_frontmatter.py` | Validates `SKILL.md` YAML frontmatter (`name`, `description`, `category`, `tags`, `version`, allowed keys) and directory category match | `just skills-check` | Requires `PyYAML`; skips hidden dirs, symlinks/junctions, and `SKIP_PARTS`; fails on missing target paths |
| `check_skill_evals.py` | Offline JSON schema check for first-party `skills/<cat>/<skill>/evals/evals.json` (never invokes models or network) | `just evals-check` | Stdlib-only; rejects missing files, `skill_name` mismatches, empty `evals`, and blank `assertions` |
| `run_python_tests.py` | Discovers and runs `unittest` suites under `platforms/claude/hooks/tests`, `skills/**/tests`, and `scripts/tests`, failing on the first error | `just python-test` | Stdlib-only; preserves `--dynamic-unittest-discover` for external recipe audits |
| `install_projects.py` | Live-links selected first-party skills into a target project's `.agents/skills/` and detected agent roots via symlinks or Windows junctions | `just install-projects` | Requires `PyYAML`; project-scoped only — refuses user home directory and `.agent/`; static `DETECT_AGENTS` maps are a repo contract, not discovery proof |
| `_common.py` | Internal shared constants and helpers (`REPO_ROOT`, `CANONICAL_CATEGORY_SLUGS`, `SKIP_PARTS`, `configure_stdio`, `skip_dir`, `display_path`, frontmatter helpers) | — | Not a CLI entrypoint; keep top-level imports stdlib-only |
| `tests/test_*.py` | Unit tests covering all scripts in `scripts/` | `just python-test`, `just install-projects-test` | Uses temporary directories or mocked boundaries; keep real `skills/` untouched |

## Local Rules

- Naming: use `<verb>_<target>.py` for CLI scripts, `_<name>.py` for internal shared helpers, and `tests/test_<module>.py` for unit tests.
- Keep `_common.py` top-level imports stdlib-only so `check_skill_evals.py` and `run_python_tests.py` run without third-party packages; import optional dependencies like `yaml` lazily inside helper functions or in scripts that require them.
- Keep `CANONICAL_CATEGORY_SLUGS` in `_common.py` aligned with top-level directories under `skills/` and `docs/scripts/sync_docs_catalog.py`.
- Give every CLI script `configure_stdio()`, `argparse` CLI handling (`--help` exits `0`), a testable `main(argv=None) -> int`, and explicit exit codes (`0` pass, non-zero fail).
- Preserve documented external contracts: `install_projects.py` filename/flags and home/path safety guards, and `--dynamic-unittest-discover` on `run_python_tests.py`.

## Verification

- Run targeted checks while iterating: `just skills-check`, `just evals-check`, `just python-check`, `just python-test`, `just install-projects-test`.
- Run `just ci` from the repository root before finishing.
