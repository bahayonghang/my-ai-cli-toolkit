# Qiaomu Tooling Compatibility

- Inspected at: 2026-08-10
- Qiaomu meta path: `<qiaomu-meta-dir>` (resolved locally during validation)

## Available scripts

- `validate_skill.py`
- `export_skill_ir.py`
- `trigger_eval.py`
- `release_check.py`
- `research_prior_art.py`
- `search_skillsmp.py`
- `publish_skill.py`

The referenced `resource_boundary_check.py` and `trust_check.py` are not present in this installed Qiaomu package. Their results cannot be claimed.

## Repository contract conflicts

1. Qiaomu `validate_skill.py` requires `manifest.json`; the category `AGENTS.md` requires `SKILL.md` frontmatter to remain the single version source rather than duplicating version in sidecars.
2. Qiaomu recommends package-local `evals/trigger_cases.json`; the repository requires one package eval format, `evals/evals.json`, and the Trellis skill-authoring spec places the incompatible trigger cases under task research.
3. Qiaomu `release_check.py` blocks on any validator warning and loads `manifest.json` unconditionally, so it cannot audit the actual repository-compliant package to a clean result.
4. `release_check.py --run-tests` invokes `python3`, which is not the portable Windows command used by this repository.
5. `export_skill_ir.py` must be probed during implementation; any manifest dependency or other mismatch is evidence of incompatibility, not permission to hand-edit a fake generated report.
6. `trigger_eval.py` resolves relative `--cases` and `--output` paths under the supplied skill directory, not the caller's working directory. From this skill, use `../../../.trellis/tasks/08-10-create-idea-bib-review-skill/research/trigger-cases.json` for cases and `reports/trigger-eval.json` for output.

## Planned handling

- Follow repository-local rules as the higher-priority contract.
- Use Qiaomu trigger evaluation with task-local cases and save the generated report in the skill.
- Run Qiaomu validation as an audit and preserve actual failures/warnings.
- Use the repository's `just ci` as the authoritative merge gate.
- Label missing resource/trust scripts, clean Qiaomu release check, provider output comparison, human review, and public installation as `missing evidence`.
- Do not publish or create a separate repository in this task.
