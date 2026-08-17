# Codex 审阅校验（2026-08-17）

本轮只读核对后写入规划修订。结论：不执行 `task.py start`。`task.py validate 08-17-git-worktree-skill` 通过 implement/check 各 5 条，只证明结构，不证明语义就绪。

对照文本：qiaomu-meta 2.8.1（`C:/Users/lyh/.skillsmanage/skills/qiaomu-meta/` 与 `C:/Users/lyh/.grok/skills/qiaomu-meta/` 内容一致）。

## 1. 成熟度判定 — 成立

- `operating-modes.md`：Governed 覆盖「文件写入」类 skill，并要求 owner、review cadence、rollback、trust。
- `gate-selection.md`：Production 以上必须跑 `trigger_eval.py`；Governed 还要 secret scan、install proof、trust/rollback、public claim guard。
- `SKILL.md` Compact Workflow / QA Ladder 2.0：Production 以上导出 Skill IR。`gate-selection.md` 把 Skill IR 写在 Library 以上。Governed 包含 Library，因此本任务必须导出 Skill IR。
- 当前 `prd.md:12` 写成 Production；`implement.md:42` 把 `trigger_eval.py` 写成可选。这两处与门禁不符。
- README / manifest 按 suite 省略，可保留为 schema deviation。不能因此跳过 trigger eval、Skill IR、permission/trust/rollback、secret scan。未跑的 install / provider / 人工盲评必须标 `missing evidence`。

修订：模式改为 Governed。trigger eval 与 Skill IR 列为必做。不声称 Production/Governed 已验证，直到对应证据文件存在。

## 2. plan-create 命令不确定 — 成立

- `design.md` D6 只有 `--branch` 与可选 `--start-point`。
- 未区分：新分支 `-b`、已有本地分支、远端跟踪分支、detached、路径已存在未注册。
- D9 测试清单没有这些状态。

修订：MVP 只支持 `--mode new-branch`。其他状态拒绝并报告。`plan-create` 必须输出完整 argv，并校验 ref / 路径冲突。

## 3. explicit-root 与 ignore 门未闭合 — 成立

- D4 只约束 slug，未约束 `--explicit-root`。`../outside`、绝对路径、`.git`、符号链接逃逸可进入 helper，随后可能被写入 `.gitignore`。
- 手写「哪条 gitignore 规则生效」会偏离 Git 的否定、转义、锚定和顺序。
- 自动改受跟踪 `.gitignore` 没有授权和回滚边界。HamStudy 写明：会干扰并发工作时改用 repository-local exclusion 并报告。

修订：`git check-ignore -v -z` 为匹配权威。只额外校验 source 是仓库内允许的 `.gitignore`。`--explicit-root` 必须是仓库内相对路径，禁止 `..`、绝对路径、`.git`、realpath 逃出仓库。`ensure-ignore` 默认只出计划；`--apply` 需要本轮明确授权。回滚是恢复写入前的 `.gitignore` 字节。

## 4. remove/prune 数据保护不足 — 成立

- 本仓库 `.git/config` 设置 `status.showUntrackedFiles=no`。`git status --porcelain` 会漏未跟踪文件。实测命令：`git config --get --show-origin status.showUntrackedFiles` → `file:.git/config` / `no`。
- `git worktree prune` 作用于整个仓库的 stale 记录，不只是本 skill 的根。
- PRD R2 写了「采用」，没有 adopt / ownership 契约。
- list/remove/prune 没有 helper 测试。`evals/evals.json` 本仓库 CI 不执行，这一点房规已写明。

修订：状态检查用 `--porcelain -uall`。remove 必须精确匹配已注册路径，并检查 lock、进行中的 Git 操作、submodule。记录 lifecycle owner；只删除本流程创建或本轮明确授权的树。prune 先列出候选项，取得明确授权。adopt 移出 MVP。list/remove/prune 加入 Node 测试。evals 仍是人工 fixture，不冒充 CI。

## 5. 原生宿主优先与单一默认根冲突 — 成立

- 当前仓库已注册：`D:/Documents/Code/Agents/my-claude-code-settings/.claude/worktrees/interesting-hofstadter-2a349b`（detached）。
- 旧 D2 只认 `.worktrees` / `.agents/worktrees` / `worktrees`。按旧计划会再创建一个 `.worktrees/` 根。

修订：先从 `git worktree list --porcelain` 推导已注册的仓库内根。已有仓库内根时不得再发明第二种默认根。忽略门必须发生在任何创建命令之前。原生工具若不能在创建前给出路径，则不得调用。

## 6. 收尾条件与保护脏工作区矛盾 — 成立

- P0 要求保留现有 `.trellis` 改动。
- P3 要求最终 status 只含产品文件。
- 当前工作区有多项 `.trellis` 运行时改动。两者不能同时成立。

修订：收尾改为产品路径白名单。允许基线脏状态继续存在。验证产品 diff / 暂存集不含 `.trellis/scripts/**`、`.trellis/workflow.md`、`.trellis/.version` 等基线路径。

## 7. 先例报告不可复现 — 成立

- 候选表缺源 URL 与 skill path。
- 「默认根仍由用户决定」与 PRD 已固定的解析顺序冲突。
- HamStudy 的 lifecycle owner、精确路径、lock、进行中操作未进入 keep/adapt/reject。
- `research_prior_art.py --strict` 因 `npx` 不在 PATH 失败，报告未保留失败快照正文。

修订：补链接、path、失败说明；删除过期「用户仍未决定默认根」；HamStudy ownership 进入 adapt，adopt 与「完成=已合并」进入 reject。
