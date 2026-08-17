# implement.md — git-worktree 实施计划

执行前提：用户批准本修订规划摘要后，才运行 `task.py start`。当前不得 start。

产品路径白名单：

- `skills/git-github-collaboration/git-worktree/**`
- `skills/git-github-collaboration/AGENTS.md`
- `docs/**`（仅 `just docs-sync` 生成）

基线脏路径（允许继续存在，禁止纳入产品暂存集）：

- `.trellis/scripts/**`
- `.trellis/workflow.md`
- `.trellis/.version`
- `.trellis/.template-hashes.json`
- 其他任务开始前已修改的 `.trellis/**`

## P0 前置

- [ ] 任务仍为 `08-17-git-worktree-skill`，用户已批准修订摘要，状态才可切到 `in_progress`。
- [ ] 记录 `git status --porcelain -uall` 作为基线。
- [ ] 读取 `design.md`、`research/review-response.md`、`research/qiaomu-gates.md`、suite `AGENTS.md`。

验证：基线已记录。回滚点：无产品改动。

## P1 helper 与测试（R3–R8/R12，A2–A6/A8）

- [ ] 实现 `inspect` / `ensure-ignore` / `plan-create` / `plan-list` / `plan-remove` / `plan-prune`。
- [ ] 覆盖 `design.md` D8。
- [ ] 测试在临时仓库中进行，不触碰本仓库 `.gitignore` 或 `.claude/worktrees`。

```powershell
python -X utf8 "skills/git-github-collaboration/git-worktree/scripts/worktree_convention.py" --help
node --test "skills/git-github-collaboration/git-worktree/tests/worktree-convention.test.mjs"
just python-check
```

回滚点：删除新增 skill 目录。

## P2 入口、安全与 suite（R1/R2/R9–R11）

- [ ] `SKILL.md`：Governed 路由、创建前忽略门、new-branch-only、授权写入/prune、`<skill-dir>` 调用。
- [ ] `references/convention.md`、`references/safety.md`。
- [ ] `agents/interface.yaml`、`security/permission_policy.json`。
- [ ] 更新 suite `AGENTS.md`：`git-worktree` → `Read, Bash`。

验证：`just skills-check`。回滚点：还原 `AGENTS.md`，删除 skill 目录。

## P3 评测、IR、扫描与 docs（R10/R13，A1/A7/A8）

- [ ] 房规 `evals/evals.json`（人工 fixture，CI 不跑）。
- [ ] 编写并运行任务内 trigger cases：

```powershell
python -X utf8 "<qiaomu-meta-dir>/scripts/trigger_eval.py" `
  "skills/git-github-collaboration/git-worktree" `
  --cases ".trellis/tasks/08-17-git-worktree-skill/research/trigger-cases.json" `
  --output "skills/git-github-collaboration/git-worktree/reports/trigger-eval.json"
```

- [ ] `export_skill_ir.py` → `reports/skill-ir.json`。若因缺少 README/manifest 失败，保存真实 stderr，不伪造 pass。
- [ ] 转写 `reports/prior-art-research.md` 与 `reports/creation-handoff.md`。
- [ ] secret scan：记录命令与结果到 `reports/secret-scan.md`；未跑则写 `missing evidence`。
- [ ] install / provider / 盲评：写 `missing evidence`。
- [ ] `just docs-sync`、`just ci`。
- [ ] 收尾检查：`git status --porcelain -uall` 与 `git diff --name-only`。产品改动 ⊆ 白名单。基线脏路径仍可存在。暂存集不得包含基线脏路径。

回滚点：docs 可重跑 `just docs-sync`；reports 可删除后重生成。
