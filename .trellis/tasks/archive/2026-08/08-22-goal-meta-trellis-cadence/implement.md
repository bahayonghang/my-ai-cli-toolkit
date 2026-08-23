# implement.md — goal-meta-skill Trellis 节奏与终稿展示

## Ordered checklist

1. Add `skills/developer-tools-integrations/goal-meta-skill/references/trellis-goal-cadence.md`
   with detection, commit-then-archive, parent/发布门, pause text, and a
   pointer to this task's `research/trellis-archive-semantics.md` facts
   (do not copy script internals into SKILL.md).
2. Update `references/default-goal-strategy.md`:
   - Finalization Rule → dual-layer S6 (`最终可复制 /goal` fence + 字段一览).
   - One short trigger: when the outcome is Trellis task implementation,
     load `trellis-goal-cadence.md`.
3. Update `references/goal-command-playbook.md` bilingual draft strategy
   and one Trellis implementation example (Codex + Claude stop-and-report
   variant). Nested fences in this file must use a longer outer fence.
4. Update `references/interview-checklist.md` Phase B / 中文输出形状 to
   match the fenced `/goal` plus S6 字段一览.
5. Update `SKILL.md`: Operating Mode / S4–S6 one-liners and a Reference
   Files entry. Keep the body short. Bump `version` to 0.4.0. Extend
   `description` with Trellis 任务实施 / 归档 / 终稿展示 only if the
   1024-character and no-`<>` gates still pass.
6. Add evals id 15–18 in `evals/evals.json` for A1–A4. Do not weaken
   ids 1–14. Use key `assertions`.
7. Keep `scripts/lint_goal_command.py` behavior unless a doc example
   would false-fail; do not hard-require 字段一览. Add a Node test only
   if a lint change is actually required.
8. Point `agents/interface.yaml` `default_prompt` at the new cadence and
   dual-layer final output in one sentence, without breaking existing
   reconnaissance / interview / platform wording.
9. Run `just docs-sync` after frontmatter/catalog-visible edits.
10. Self-lint one Codex and one Claude Trellis sample with
    `python "<skill-dir>/scripts/lint_goal_command.py" --platform <codex|claude>`.
    Chinese samples add `--require-chinese-companion` on the S4-shaped
    fixture, not on a bare S6 fence.

## Validation

```text
just skills-check
just python-check
just node-test
just ci
```

Optional routing check only if `description` changes: run qiaomu
`trigger_eval.py` with absolute `--cases` / `--output` paths. Record
`missing evidence` if that run is skipped because description is
unchanged.

Windows: do not capture Python or git messages with PowerShell `>`.

## Risky files / rollback

- `SKILL.md` — description length, companion titles, `<skill-dir>` paths,
  4-backtick nested fences, `allowed-tools` exact string (Node test).
- `scripts/lint_goal_command.py` — touch only if a false fail appears.
- Generated `docs/skills/**` — never hand-edit; `just docs-sync` owns them.

Rollback: revert the skill directory and synced docs pages.

## Follow-up before `task.py start`

- User has approved this planning summary.
- `implement.jsonl` and `check.jsonl` have real spec/research entries.
- Do not start implementation in the same turn as that approval.
