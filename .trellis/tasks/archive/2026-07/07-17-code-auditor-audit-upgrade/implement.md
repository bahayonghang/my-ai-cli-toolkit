# Implement: code-auditor project-audit upgrade

Execution order matters: description first (yao-meta), then workflow assets, then evals, then hygiene. Do not start until `task.py start` after artifact review.

## Checklist

1. **Read three-way boundary before editing**
   - Read `skills/development-workflows/code-quality-review/SKILL.md` description and `~/.claude/skills/fuck-my-shit-mountain/SKILL.md` description.
   - Verify: design.md's boundary line does not steal code-quality-review's maintainability-only scope (eval #5 must remain a valid near-negative).
   - → verify: write the confirmed three-way boundary sentence into `references/audit-workflow.md` header notes.

2. **Update SKILL.md frontmatter description + version** (description-first)
   - Append whole-project audit wording per design.md §4; bump `version: 0.3.0`.
   - → verify: `just skills-check` passes.

3. **Add Route section + rewire Workflow step 1 in SKILL.md**
   - Insert routing table (pr / dir / project) per design.md §1; change ">200 files → narrow" to ">200 files → confirm switch to project route".
   - Keep pr/dir behavior textually unchanged; project route points to `<skill-dir>/references/audit-workflow.md`.
   - → verify: diff shows no edits to pr/dir workflow steps beyond the routing prelude.

4. **Create `references/audit-workflow.md`**
   - Four phases (Orient / Ground / Judge / Report), depth tiers quick|deep, delta mode, native-tool table with graceful fallback, file:line-required contract, per design.md §2.
   - → verify: every `<skill-dir>` path referenced resolves to a real file.

5. **Create `assets/audit-report-template.md`**
   - Seven sections per design.md §3, including required "looks bad but is actually fine", "open questions", "what was checked / missing evidence".
   - Structure-reference style (localizable), matching existing template conventions.
   - → verify: template section list matches design.md §3 exactly.

6. **Extend `evals/evals.json`** (repo schema; NOT consumed by trigger_eval.py or `just ci`)
   - Keep #1–#5 unchanged. Add E6–E9 per design.md §5(a), with E6/E7 asserting in-chat default and opt-in report offer.
   - → verify: JSON parses (`PYTHONUTF8=1 python -c "import json;json.load(open('skills/development-workflows/code-auditor/evals/evals.json',encoding='utf-8'))"`).

7. **Trigger evaluation** (yao-meta route/boundary gate — requires its own artifacts, schema incompatible with evals.json)
   - Author `.trellis/tasks/07-17-code-auditor-audit-upgrade/research/trigger-cases.json` with `should_trigger` / `should_not_trigger` / `near_neighbor` buckets per design.md §5(b).
   - Author `.trellis/tasks/07-17-code-auditor-audit-upgrade/research/semantic_config.json` tuned for code-audit routing (yao-meta's default `evals/semantic_config.json` targets skill-creation and does not apply).
   - Run (PowerShell, repo root):
     ```powershell
     $env:PYTHONUTF8=1
     python "$env:USERPROFILE\.claude\skills\yao-meta\scripts\trigger_eval.py" `
       --cases .trellis\tasks\07-17-code-auditor-audit-upgrade\research\trigger-cases.json `
       --semantic-config .trellis\tasks\07-17-code-auditor-audit-upgrade\research\semantic_config.json `
       --description-file skills\development-workflows\code-auditor\SKILL.md
     ```
     (Confirm exact flag names via `trigger_eval.py --help` before running; adjust if the CLI differs. Record output to `research/trigger-eval.md`.)
   - → verify: project-audit + PR prompts route in; maintainability-only and health-report near-neighbors route out.

8. **Production gates** (yao-meta)
   - Run `validate_skill.py` and `resource_boundary_check.py` from `~\.claude\skills\yao-meta\scripts\` against the skill dir; record results in `research/gates.md`. Mark anything the scripts can't produce as `missing evidence`.
   - → verify: both scripts exit 0 or their findings are triaged in `research/gates.md`.

9. **Full validation**
   - → verify: `just ci` passes (skills-check, python-check, node-test, `git diff --check`).

10. **pyc verification (after final CI — python-check regenerates local caches)**
    - → verify: `git ls-files skills/development-workflows/code-auditor | grep -c pyc` returns 0 and `git status -uall` shows no pyc to add (`.gitignore` `*.pyc` already covers them).
    - Optional local cleanup (PowerShell): `Remove-Item -Recurse skills\development-workflows\code-auditor\scripts\__pycache__` — cosmetic only; `rm -rf` is hook-blocked.

11. **Manual smoke (review gate)**
    - Dry-run: "对这个项目做一次全维度的代码审计" should produce orientation-first, in-chat report, and offer (not force) saving to `docs/audits/`; "review this PR" unchanged; no tool auto-install or unapproved network access.
    - Present diff summary to user before commit.

## Rollback points

- After step 3: revert SKILL.md only.
- After step 6: additionally delete the two new files and revert evals.json (restores v0.2.0 exactly, per design.md rollback boundary).

## Notes for sub-agents

- Windows: prefix `PYTHONUTF8=1` on any Python invocation reading UTF-8.
- PostToolUse formatter reflows Markdown tables — if writing files with character-position-sensitive content, use Bash heredoc instead of Write.
- Do not edit `references/rules/*.json`, `scripts/*.py` logic, or pr/dir templates — out of scope.
