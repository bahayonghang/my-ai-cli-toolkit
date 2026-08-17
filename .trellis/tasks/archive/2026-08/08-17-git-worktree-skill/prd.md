# 创建 git-worktree 规范 skill

## Goal

在 `skills/git-github-collaboration/` 新增一个 Governed skill：按统一规范创建、列出、移除隔离 worktree，并在明确授权后清理 stale 记录。默认把新工作区放在单一仓库内根下。创建前必须用 `git check-ignore` 证明仓库 `.gitignore` 排除了该根。该 skill 不处理提交、PR、release 构建、合并冲突或 adopt。

## Background

- 用户要求结合 `git-github-collaboration` suite，检索公开 worktree skill，并用 qiaomu-meta 2.8.1 做实施规划。
- Suite 现有 `git-commit`、`gh-pr-release`、`gh-bootstrap`。`gh-pr-release` 的 detached 发布构建与功能隔离工作区不是同一请求。
- 本仓库 `.gitignore` 已有 `.worktrees/` 与 `.agents/`。`.git/config` 设置 `status.showUntrackedFiles=no`。已注册 worktree：`.claude/worktrees/interesting-hofstadter-2a349b`（detached）。
- Codex 审阅见 `research/review-response.md`。门禁摘录见 `research/qiaomu-gates.md`。先例见 `research/prior-art-research.md`。
- 本任务不发布独立 GitHub 仓库。不执行 `task.py start`，直到用户批准本修订后的规划摘要。

## Decisions

- D1 默认根：无已注册仓库内根时，新工作区用 `.worktrees/<slug>`。
- D2 根解析：本轮合法显式根 > 已注册的仓库内 worktree 根 > 已存在的已知目录（`.worktrees/` > `.claude/worktrees/` > `.agents/worktrees/` > `worktrees/`）> 默认 `.worktrees/`。已有任一仓库内根时，不得再发明第二种默认根。
- D3 忽略权威：`git check-ignore -v -z -- <root>/`。额外校验 source 是仓库内允许的 `.gitignore`。不手写「哪条规则最终生效」。仅全局 excludes 或 `.git/info/exclude` 不算通过。
- D4 `.gitignore` 写入：`ensure-ignore` 默认只出计划。`--apply` 必须有本轮明确授权。回滚是恢复写入前的文件字节。不自动 commit。
- D5 创建 MVP：只支持 `--mode new-branch`。已有本地分支、只存在远端跟踪分支、detached ref、目标路径已存在（已注册或未注册）一律拒绝。
- D6 删除与 prune：remove 只针对本流程拥有或本轮明确授权的已注册路径。prune 是仓库全局操作，必须列出候选项并取得明确授权。adopt 不在 MVP。
- D7 模式：qiaomu Governed。trigger eval 与 Skill IR 必做。README/manifest 按 suite 省略，记为 schema deviation。install / provider / 人工盲评若未跑，标 `missing evidence`。
- D8 helper 决定路径、argv 和门状态；agent 只在 JSON 允许时执行 git。

## Requirements

- R1 名称与位置：`skills/git-github-collaboration/git-worktree/`。frontmatter 含 `name`、中英文 `description`、`category: git-github-collaboration`、`tags`、`version`。`metadata` 含 `owner`、`review_cadence`、`mode: governed`。
- R2 触发：create / list / remove，以及经授权的 prune。提交走 `git-commit`。PR / release / CI / 发布用 detached worktree 走 `gh-pr-release`。模板初始化走 `gh-bootstrap`。adopt、只读并行审查不触发创建。
- R3 路径：按 D1/D2。slug 将 `/` 与 `\` 换成 `-`，拒绝空名、`.`、`..`。`--explicit-root` 必须是仓库内相对路径：禁止绝对路径、`..` 段、`.git`、以及 realpath 逃出仓库或穿过符号链接逃逸。
- R4 创建忽略门：创建命令之前，`check-ignore` 必须成功且 source 为仓库 `.gitignore`。未通过则只允许在授权后 `--apply` 追加 `<root>/` 并复验。复验失败则停止。
- R5 创建安全：检测已有隔离，不嵌套创建。`--mode new-branch` 要求新分支名不存在，start-point 可解析为 commit。默认 start-point 为 `origin/HEAD` 的默认分支，否则 `main`，否则 `master`，否则拒绝。输出 argv 固定为 `git worktree add -b <branch> <path> <start-point>`。不用 `--force` / `--ignore-other-worktrees`。
- R6 删除安全：`plan-remove` 要求路径与 `git worktree list --porcelain` 精确匹配；`git -C <path> status --porcelain -uall` 为空；无 lock；无 MERGE/rebase/cherry-pick/bisect；非 submodule；lifecycle owner 为本流程或本轮授权。默认不用 `--force`。
- R7 prune 安全：`plan-prune` 先 `git worktree prune --dry-run`，列出将删除的记录。未展示候选项并取得本轮明确授权前，不得执行真实 prune。
- R8 生命周期记录：创建成功后记录绝对路径、分支、start-point、owner、创建时间。remove 只删除有记录或用户点名授权的树。元数据不得提交进 git。
- R9 原生工具：若宿主能在创建前给出将要使用的绝对路径，则先跑 R4，再调用原生工具。路径未知则不得调用原生工具，回退到 helper 计划。忽略门不得在创建后补跑。
- R10 治理：`security/permission_policy.json` 写明 `file_write`（仅仓库根 `.gitignore` 追加计划/授权写入）、`git_worktree_add`、`git_worktree_remove`、`git_worktree_prune`。`references/safety.md` 写 trust / rollback / secret 边界。实施时跑 trigger eval、导出 Skill IR、做 secret scan。install proof 标 `missing evidence`。
- R11 Suite：更新 `AGENTS.md`。`allowed-tools: Read, Bash`。房规 `evals/evals.json` 含正向用例、忽略门、删除/prune 拒绝用例，以及指向 `git-commit` 与 `gh-pr-release` 的近邻负例。CI 执行 Node helper 测试，不执行 `evals.json`。
- R12 可移植性：字面 `<skill-dir>`。Python 标准库。`shutil.which("git")`，argv 列表，`encoding=utf-8`。JSON UTF-8 + LF。不依赖 `jq`、Bash 4、`git-wt`。
- R13 收尾：`just docs-sync`、`just skills-check`、`just python-check`、`just node-test`、`just ci`。产品路径白名单见 implement.md。允许既有 `.trellis` 基线脏状态。产品 diff 不得包含这些基线路径。

## Acceptance Criteria

- [ ] A1 description 覆盖 create/list/remove/授权 prune，并排除 commit / PR / release / adopt。
- [ ] A2 根解析测试覆盖：显式合法根、已注册 `.claude/worktrees`、仅有 `.agents/worktrees`、默认 `.worktrees`、已有注册根时不再创建第二种默认根。
- [ ] A3 `--explicit-root` 对 `../`、绝对路径、`.git`、符号链接逃逸返回退出码 2，且不写 `.gitignore`。
- [ ] A4 `check-ignore` 失败或 source 不是仓库 `.gitignore` 时，`ok_to_create=false`。未带 `--apply` 不得改文件。仅全局 exclude 视为未通过。
- [ ] A5 `--mode new-branch` 在已有本地分支、已有路径、已注册路径上拒绝；成功计划的 argv 含 `-b`。
- [ ] A6 `plan-remove` 在未跟踪文件（`-uall`）、lock、进行中操作、路径不匹配时拒绝。`plan-prune` 无授权时只输出 dry-run 列表。
- [ ] A7 任务内 trigger eval 跑完并保存报告。Skill IR 已导出。permission / rollback / trust 文档存在。secret scan 有结果或标明 `missing evidence`。不声称 install/provider/盲评已通过。
- [ ] A8 Node 测试覆盖 create/list/remove/prune 计划。`just ci` 通过。产品 diff 落在白名单内。

## Out of Scope

- 提交、push、amend、rebase、合并冲突。
- PR / 评审 / CI / Release 与发布用 detached worktree。
- adopt 已有 worktree，或认领他人的树（除非本轮用户点名授权 remove）。
- 已有分支 / 远端跟踪 / detached 的 `worktree add`。
- 复制 `.env`、密钥、`node_modules` 链接、自动装依赖、自动跑全量测试。
- 第三方 `git-wt` CLI。
- qiaomu 独立发布、`qiaomu-*` 命名、自动 commit `.gitignore`。
- 真实隔离安装证明（本任务标 `missing evidence`）。
