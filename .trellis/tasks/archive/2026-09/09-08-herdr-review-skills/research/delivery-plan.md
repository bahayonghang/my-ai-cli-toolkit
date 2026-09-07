# Local delivery plan

Status: implementation and required validation complete. The user approved this local commit/archive/journal plan on 2026-09-08 with “提交并归档”. Current branch: `dev`; baseline HEAD: `36919731`. This plan covers only this task's 55 files.

## Work commit

```text
feat(skills): ✨ add Herdr orchestration and Codex review

Why: Give Herdr callers one orchestration contract and a read-only Codex reviewer.

Add two instruction-first packages with scoped delegation, leaf review,
complete-response recovery, prior-art and honest evaluation records.
Synchronize the bilingual catalog and record the qiaomu IR metadata limitation.

Validation: just ci; independent package and full-scope checks; isolated install.
```

One coherent work commit keeps the two dependent skills, generated docs, spec amendment and planning/evidence artifacts reversible together. No unexpected dirty paths were found. The largest file in the reviewed pre-plan inventory was 34,816 bytes; there were no likely credential filenames or large/binary artifacts.

## Exact work-commit file list

- `.trellis/spec/guides/skill-authoring-conventions.md`
- `.trellis/tasks/09-08-herdr-codex-review-skill/check.jsonl`
- `.trellis/tasks/09-08-herdr-codex-review-skill/design.md`
- `.trellis/tasks/09-08-herdr-codex-review-skill/implement.jsonl`
- `.trellis/tasks/09-08-herdr-codex-review-skill/implement.md`
- `.trellis/tasks/09-08-herdr-codex-review-skill/prd.md`
- `.trellis/tasks/09-08-herdr-codex-review-skill/task.json`
- `.trellis/tasks/09-08-herdr-orchestra-skill/check.jsonl`
- `.trellis/tasks/09-08-herdr-orchestra-skill/design.md`
- `.trellis/tasks/09-08-herdr-orchestra-skill/implement.jsonl`
- `.trellis/tasks/09-08-herdr-orchestra-skill/implement.md`
- `.trellis/tasks/09-08-herdr-orchestra-skill/prd.md`
- `.trellis/tasks/09-08-herdr-orchestra-skill/task.json`
- `.trellis/tasks/09-08-herdr-review-skills/check.jsonl`
- `.trellis/tasks/09-08-herdr-review-skills/design.md`
- `.trellis/tasks/09-08-herdr-review-skills/implement.jsonl`
- `.trellis/tasks/09-08-herdr-review-skills/implement.md`
- `.trellis/tasks/09-08-herdr-review-skills/prd.md`
- `.trellis/tasks/09-08-herdr-review-skills/research/codex-review.md`
- `.trellis/tasks/09-08-herdr-review-skills/research/delivery-plan.md`
- `.trellis/tasks/09-08-herdr-review-skills/research/herdr-audit.md`
- `.trellis/tasks/09-08-herdr-review-skills/research/plan-precheck.json`
- `.trellis/tasks/09-08-herdr-review-skills/research/prior-art-candidates.json`
- `.trellis/tasks/09-08-herdr-review-skills/research/prior-art-research.md`
- `.trellis/tasks/09-08-herdr-review-skills/research/verification.md`
- `.trellis/tasks/09-08-herdr-review-skills/task.json`
- `docs/.vitepress/generated/catalog.mjs`
- `docs/en/skills.md`
- `docs/en/skills/developer-tools-integrations/herdr-orchestra.md`
- `docs/en/skills/development-workflows/codex-review.md`
- `docs/skills.md`
- `docs/skills/developer-tools-integrations/herdr-orchestra.md`
- `docs/skills/development-workflows/codex-review.md`
- `skills/developer-tools-integrations/herdr-orchestra/SKILL.md`
- `skills/developer-tools-integrations/herdr-orchestra/agents/interface.yaml`
- `skills/developer-tools-integrations/herdr-orchestra/evals/evals.json`
- `skills/developer-tools-integrations/herdr-orchestra/evals/trigger_cases.json`
- `skills/developer-tools-integrations/herdr-orchestra/references/delegation.md`
- `skills/developer-tools-integrations/herdr-orchestra/references/patterns-and-recovery.md`
- `skills/developer-tools-integrations/herdr-orchestra/reports/creation-handoff.md`
- `skills/developer-tools-integrations/herdr-orchestra/reports/output-eval.md`
- `skills/developer-tools-integrations/herdr-orchestra/reports/prior-art-research.md`
- `skills/developer-tools-integrations/herdr-orchestra/reports/skill-ir.json`
- `skills/developer-tools-integrations/herdr-orchestra/reports/trigger-eval.json`
- `skills/development-workflows/codex-review/SKILL.md`
- `skills/development-workflows/codex-review/agents/interface.yaml`
- `skills/development-workflows/codex-review/evals/evals.json`
- `skills/development-workflows/codex-review/evals/trigger_cases.json`
- `skills/development-workflows/codex-review/references/codex-cli.md`
- `skills/development-workflows/codex-review/references/review-contract.md`
- `skills/development-workflows/codex-review/reports/creation-handoff.md`
- `skills/development-workflows/codex-review/reports/output-eval.md`
- `skills/development-workflows/codex-review/reports/prior-art-research.md`
- `skills/development-workflows/codex-review/reports/skill-ir.json`
- `skills/development-workflows/codex-review/reports/trigger-eval.json`

## Subsequent local bookkeeping

After the work commit, archive `09-08-herdr-orchestra-skill`, then `09-08-herdr-codex-review-skill`, then parent `09-08-herdr-review-skills`; use the repository task script's archive commits. Record one session journal with the work-commit hash using the repository journal script. Recheck the exact pending bookkeeping paths before each auto-commit and preserve other work.

The approval target is this local work commit plus those task/journal closeout operations. Runtime/provider validation and fresh-session discovery remain missing evidence; current third-party activation remains outside this source task. The temporary isolated install directory is retained because automatic approval review blocked cleanup; its exact path and the stated rejection are in [verification.md](verification.md).
