# Optimize goudi skill implementation plan

## Preconditions

- Planning artifacts are reviewed and the user asks to start implementation.
- Current task is moved to `in_progress` with `task.py start`.
- Phase 2 loads `trellis-before-dev` before editing.

## Checklist

1. Baseline snapshot
   - Confirm current `goudi` files and git status.
   - Create `goudi-workspace/skill-snapshot/` from `skills/development-workflows/goudi`.
   - Do not modify `geju`.

2. Commit-ready skill repair
   - Update `SKILL.md` frontmatter with `category`, `tags`, and `version`.
   - Remove stale `SKILL.zh_CN.md` reference or add the file only if intentionally useful.
   - Replace `hai-tdd` / `hai-goal` references with available-workflow wording.
   - Add concise-output and no-implementation boundaries.
   - Keep `references/output-template.md` aligned with the final output rules.
   - Keep `agents/openai.yaml` aligned with final trigger behavior.

3. Eval set
   - Add `skills/development-workflows/goudi/evals/evals.json`.
   - Include at least three realistic prompts and discriminating expectations.
   - Validate JSON syntax.

4. Docs sync
   - Run `just docs-sync`.
   - Inspect generated `docs/skills/development-workflows/goudi.md`, `docs/en/skills/development-workflows/goudi.md`, `docs/skills.md`, `docs/en/skills.md`, and `docs/.vitepress/generated/catalog.mjs` for expected metadata.

5. Evaluation run
   - Create `goudi-workspace/iteration-1/` eval directories.
   - Run each eval once with optimized `goudi` and once with `goudi-workspace/skill-snapshot`.
   - Save transcript/output markdown under each run's `outputs/` directory.
   - Save timing and basic metrics when available; if exact subagent token timing is unavailable, record that limitation in `timing.json` or reviewer notes.

6. Grading and benchmark
   - Grade every run into `grading.json` using `expectations[].text`, `passed`, and `evidence`.
   - Run `aggregate_benchmark.py` for `goudi-workspace/iteration-1`.
   - Add analyst notes when aggregate results hide important patterns.
   - Generate static `goudi-workspace/iteration-1/review.html` with `generate_review.py`.

7. Improvement pass
   - Review benchmark and outputs.
   - Apply a second skill edit pass only for issues grounded in evaluation evidence.
   - If a second pass changes behavior materially, either rerun affected evals or document why the first run remains sufficient.

8. Final verification
   - Run `just skills-check`.
   - Run `just docs-check`.
   - Run `just ci`.
   - Run `git status --short --untracked-files=all` and verify intended files are visible.

## Risk Points

- `goudi` is currently untracked, so final status must make intentional file inclusion obvious.
- `docs-check` was already failing because generated catalog files were stale; `just docs-sync` should be part of implementation, not a separate cleanup.
- Evaluation workspace artifacts can be large/noisy. Keep them local unless the user explicitly requests archival.
- The environment may not expose true subagent timing notifications. Do not fabricate token or timing metrics; record unavailable metrics honestly.

## Rollback

- Restore `skills/development-workflows/goudi` from `goudi-workspace/skill-snapshot/` if the edit pass makes the skill worse.
- Remove generated docs/catalog changes from the implementation candidate if `goudi` publication is abandoned.
- Delete local `goudi-workspace/iteration-*` artifacts if rerunning evals from scratch.

## Validation Commands

```powershell
just docs-sync
just skills-check
just docs-check
just ci
git status --short --untracked-files=all
```
