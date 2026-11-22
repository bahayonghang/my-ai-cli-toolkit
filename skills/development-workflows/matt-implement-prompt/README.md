# matt-implement-prompt

将 Matt Pocock 工作流产出的 Spec 与 Ticket 任务图（GitHub Issues 或本地 `.scratch/` 票据），编译为可直接在全新对话中端到端实施、按任务与工作树现状选用新分支或 worktree、强制拆分原子提交并关联真实 commit SHA 关单、且按 `base` 分支策略完成 `dev` 直合清理或 `main`/`master` PR 合并与本地远端同步的自包含执行 Prompt。

## 安装

使用 Skills CLI 从本仓库安装：

```bash
npx skills add bahayonghang/my-claude-code-settings/skills --skill matt-implement-prompt
```

或在仓库本地通过项目安装器 live-link 到当前项目：

```bash
just install-projects --skill matt-implement-prompt
```

## 你可以直接这样说

- 「基于 `#55` 和子票 `#56`–`#60`，帮我写一份放到新对话里全自动实施并关闭远程 issue 的 Prompt。」
- 「当前仓库在 `dev` 且工作树有无关改动，基于 `#55` 和子票 `#56`–`#58` 编排新会话 Prompt，用 worktree 拆分提交、关联 SHA 关单后合并回 `dev` 并清理。」
- 「基线在 `main` 分支，帮我生成 `matt implement prompt`：拆分提交后走 PR 合并并确保本地和 remote 同步最新。」
- 「我已经用 `/to-tickets` 拆好了 `.scratch/auth-flow/issues/`，帮我生成给新会话逐票 `/implement` 的交接提示词。」
- "Compile a self-contained fresh-session prompt to execute Spec `#55` and close remote issues `#56`–`#60` after TDD, code-review, split commits, and `just ci` pass."

## 前置依赖

- `git`（只读探测仓库根、当前分支、工作树与已有 worktree 及远端）
- `python` >= 3.10（运行内置零依赖 `scripts/lint_implement_prompt.py`；仅标准库，无需第三方包）
- 可选：`gh` CLI（当项目使用 GitHub Issues 作为追踪器时用于只读拉取仓库默认分支、父子 Issue 与 `blocked_by` 依赖状态）

## 输出契约与权限边界

- **工作流**：`S0 路由锁 → S1 只读侦察（含分支/工作树/worktree/remote） → S2 策略自动推导与最小确认 → S3 编译指针驱动 Prompt → S4 确定性 lint 清零 → S5 单一 text 围栏输出并停止`
- **权威隔离（Payload-not-Execution）**：在当前编译会话内严格只读——**不修改业务代码、不创建/切换分支或 worktree、不提交、不合并、不开 PR、不关闭任何远程 Issue**。
- **提交与关单硬门**：编译出的 Prompt 强制要求按票据或逻辑边界**拆分原子提交**（含 `/code-review` 返修与派生文档同步）+ 关单/合并/开 PR 前检查 `git status --short --untracked-files=all` 完全为空 + 关单前在评论/票据中**关联真实 commit SHA**。
- **分支感知交付边界**：
  - `base == dev`（`dev-merge`）：实施并关联 SHA 关单后，直接合并回本地 `dev`（保留拆分提交）并清理临时分支与 worktree；默认不自动 `git push origin dev`。
  - `base == main | master`（`main-pr`）：**严禁直接提交或 `git push` 到 `main`/`master`、禁止 `--admin`/`--force`**；授权推送工作分支创建 PR、合并（优先 `--merge --delete-branch`）、关单/复核关单、清理临时分支/worktree 并拉取同步本地与 remote 至最新。
  - 其他基准分支（`branch-only`）：保守回退，强制隔离开发、拆分提交与关联关单，默认禁止 `git push`/合并/开 PR。

## 验证命令

```bash
# 校验生成的 dev 基准分支 Prompt（stdin 读取 UTF-8）
python skills/development-workflows/matt-implement-prompt/scripts/lint_implement_prompt.py --tracker github --base-branch dev --close-mode remote-close -

# 校验生成的 main/master 基准分支 PR 流 Prompt
python skills/development-workflows/matt-implement-prompt/scripts/lint_implement_prompt.py --tracker github --base-branch main --close-mode pr-close -

# 运行包内单元测试
python -m unittest discover -s skills/development-workflows/matt-implement-prompt/tests -v

# 运行 Qiaomu Meta Skill 包门禁与触发评测
python .agents/skills/qiaomu-meta-skill/scripts/validate_skill.py skills/development-workflows/matt-implement-prompt
python .agents/skills/qiaomu-meta-skill/scripts/trigger_eval.py skills/development-workflows/matt-implement-prompt --cases evals/trigger_cases.json
python .agents/skills/qiaomu-meta-skill/scripts/release_check.py skills/development-workflows/matt-implement-prompt --phase local --run-tests

# 同步生成文档并跑仓库全量 CI
just docs-sync
just ci
```

## Troubleshooting

| 现象 | 原因 | 解决方法 |
| --- | --- | --- |
| `gh issue view` / `gh api` 报错或未登录 | 本机未配置 `gh` 登录态或仓库无网络 | 先执行 `gh auth status` 排查，或按用户显式提供的票据范围降级并明确标注未核实的远程依赖 |
| 主工作树存在未提交修改却选了新建分支 | 直接 `git switch -c` 会把无关修改带入工作分支或发生冲突 | S1 侦察到主树脏状态时必须选用隔离 worktree（`git worktree add -b ...`），严禁用 `git stash` 干扰用户现场 |
| 仓库仅允许 squash merge 导致原拆分 SHA 不在主干 | GitHub squash merge 会生成新的合并 commit SHA | 在 Prompt 中内置降级条款：squash 合并完成后将最终 squash commit SHA 与 PR URL 补评论到关联 Issue 再核实关单 |
| `main`/`master` PR 因分支保护或审批无法自动合入 | 目标分支配置了必须人工 Approve 或状态检查未完成 | Prompt 严禁使用 `--admin`/`--force`，要求在此处停止并汇报 PR URL 与阻塞检查项 |
| `lint_implement_prompt.py` 报 `contradictory_delivery_policy` 或 `missing_main_pr_sync` | 套用了旧模板「禁止合并回 dev / 禁止开 PR」或漏掉四要素之一 | 按 `dev-merge` / `main-pr` 对应模板补全直推禁令、PR 创建合并、本地远端同步与清理指令 |
| 默认 `python` 执行仓库 `just ci` 报缺少 `yaml.safe_load` | 系统默认 `python` 缺少完整 `PyYAML` 安装 | 探测本机其他含 `PyYAML` 的解释器（如 `py -3.14`）并在当前命令会话的 `PATH` 中临时前置使用，不要强改全局环境 |
