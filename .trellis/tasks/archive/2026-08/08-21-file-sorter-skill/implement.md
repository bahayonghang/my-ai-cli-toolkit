# implement.md — file-sorter 实施计划

执行前提：用户批准本规划摘要后，才运行 `task.py start`。当前不得 start。

产品路径白名单：

- `skills/developer-tools-integrations/file-sorter/**`
- `skills/developer-tools-integrations/AGENTS.md`
- `docs/**`（仅 `just docs-sync` 生成）

基线脏路径（允许继续存在，禁止纳入产品暂存集）：任务开始前已修改的 `.trellis/**`。

## P0 前置

- [ ] 任务仍为 `08-21-file-sorter-skill`，用户已批准摘要，状态才可切到 `in_progress`。
- [ ] 记录 `git status --porcelain -uall` 作为基线。
- [ ] 读取 `prd.md`、`design.md`、`research/source-capability-map.md`、`research/prior-art-research.md`、suite `AGENTS.md`、`.trellis/spec/guides/skill-authoring-conventions.md`。
- [ ] 实施前按 qiaomu-meta 跑先例命令（`npx.cmd` + `search_skillsmp.py` 已有结果可转写）；包内 `reports/prior-art-research.md` 从本任务 research 复制并补观察日期。

验证：基线已记录。回滚点：无产品改动。

## P1 helper 与测试（R3–R11/R15，A2–A7）

- [ ] 实现 `scripts/file_sorter.py`：`scan` / `assemble-plan` / `apply` / `undo`。
- [ ] 覆盖 `design.md` D4–D8。
- [ ] 测试在临时目录中进行，不触碰本仓库或用户 Downloads。
- [ ] Windows 上用 `python` / `py -3` 探测，与 `git-worktree` 测试相同。

```powershell
python -X utf8 "skills/developer-tools-integrations/file-sorter/scripts/file_sorter.py" --help
node --test "skills/developer-tools-integrations/file-sorter/tests/file-sorter.test.mjs"
just python-check
```

回滚点：删除新增 skill 目录。

## P2 入口、安全与 suite（R1/R2/R12/R13/R16，A1）

- [ ] `SKILL.md`：Governed 路由、scan → assemble → 批准 → apply、`<skill-dir>` 调用、中英文 description。
- [ ] `references/taxonomy.md`、`scan-safety.md`、`review-apply.md`、`naming.md`。判断规则语义重写，不粘贴 `LocalLLMPromptBuilder.cpp`。
- [ ] `agents/interface.yaml`、`security/permission_policy.json`、`README.md`、`THIRD_PARTY_NOTICES.md`。
- [ ] 更新 suite `AGENTS.md`：`file-sorter` → `Read, Glob, Grep, Bash(python *), Bash(py *)`。

验证：`just skills-check`。回滚点：还原 `AGENTS.md`，删除 skill 目录。

## P3 评测、IR、扫描与 docs（R12–R14，A8–A10）

- [ ] 房规 `evals/evals.json`（人工 fixture，CI 不跑）。含 5+ 正例、5+ 近邻/失败，含 process-cleanup 与 worktree 负例。
- [ ] 编写任务内 trigger cases 并运行：

```powershell
python -X utf8 "<qiaomu-meta-dir>/scripts/trigger_eval.py" `
  "skills/developer-tools-integrations/file-sorter" `
  --cases ".trellis/tasks/08-21-file-sorter-skill/research/trigger-cases.json" `
  --output "skills/developer-tools-integrations/file-sorter/reports/trigger-eval.json"
```

- [ ] `validate_skill.py`、`export_skill_ir.py` → `reports/skill-ir.json`。失败保存真实 stderr。
- [ ] 转写 `reports/prior-art-research.md` 与 `reports/creation-handoff.md`。优势标签只用 design/validated/hypothesis。
- [ ] secret scan：记录到 `reports/secret-scan.md`；未跑则 `missing evidence`。
- [ ] install / provider / 盲评：写 `missing evidence`。
- [ ] `just docs-sync`、`just ci`。
- [ ] 收尾：`git status --porcelain -uall` 与 `git diff --name-only`。产品改动 ⊆ 白名单。

回滚点：docs 可重跑 `just docs-sync`；reports 可删除后重生成。

## Follow-up before `task.py start`

- 规划摘要已展示。
- 用户在后续消息中明确批准该摘要。
- 未把 Q1 或其他已关闭问题重新打开。
- jsonl 含真实 spec/research 条目（seed `_example` 不算）。
