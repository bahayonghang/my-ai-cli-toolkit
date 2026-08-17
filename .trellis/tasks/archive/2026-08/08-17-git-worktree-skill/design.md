# design.md — git-worktree 技术设计

依据：修订后的 `prd.md`、`research/review-response.md`、`research/qiaomu-gates.md`、`research/prior-art-research.md`、skill-authoring / helper / error-handling 规范。

## D1 交付与模式

单任务交付 suite skill、suite 房规更新、docs catalog、Governed 证据文件。不拆父子任务。不发布。不执行 `task.py start` 直到用户批准本修订摘要。

成熟度：Governed。

```text
skills/git-github-collaboration/git-worktree/
├── SKILL.md
├── agents/interface.yaml
├── references/convention.md
├── references/safety.md
├── scripts/worktree_convention.py
├── tests/worktree-convention.test.mjs
├── evals/evals.json
├── security/permission_policy.json
└── reports/
    ├── skill-ir.json
    ├── trigger-eval.json
    ├── prior-art-research.md
    ├── creation-handoff.md
    └── secret-scan.md
```

不添加 suite 以外的 `README.md` / `manifest.json`。`validate_skill.py` 对这两项的失败写入 `reports/creation-handoff.md` 的 schema deviation。任务内 `research/trigger-cases.json` 是 trigger eval 的源。

`allowed-tools: Read, Bash`。文件写入只通过 helper。版本 `0.1.0`。`metadata.owner: lyh`。`metadata.review_cadence: quarterly`。`metadata.mode: governed`。

## D2 路由

| 请求 | 所有者 |
|---|---|
| 提交 / checkpoint | `git-commit` |
| PR / 评审 / 合并 / CI / Release / tag 构建 detached worktree | `gh-pr-release` |
| GitHub 模板初始化 | `gh-bootstrap` |
| 规范隔离 worktree 的 create/list/remove/授权 prune | `git-worktree` |
| adopt 已有树、在已有分支上 add | 本 skill 拒绝并说明 MVP 边界 |

## D3 根解析

仓库根：`git rev-parse --show-toplevel`。所有相对路径相对该根。比较前做 realpath，结果必须仍位于仓库根下。

1. 收集 `registered_in_repo_roots`：`git worktree list --porcelain` 中、realpath 落在仓库内、且不是主 worktree 的路径的第一段约定根（例如 `.claude/worktrees/foo` → `.claude/worktrees`）。
2. 校验 `--explicit-root`（若有）：必须是相对路径；无盘符；无 `..` 段；规范化后不等于 `.git` 且不以 `.git/` 开头；realpath（已存在时）或拼接路径（不存在时）不得逃出仓库；拒绝符号链接把最终目标带出仓库。
3. 选择根：
   - 合法显式根 → `explicit`
   - 否则若 `registered_in_repo_roots` 非空：若只有一个，用它；若多个，按 `.worktrees`、`.claude/worktrees`、`.agents/worktrees`、`worktrees`、其余按路径排序取第一个 → `registered`
   - 否则若已知目录存在：`.worktrees` > `.claude/worktrees` > `.agents/worktrees` > `worktrees` → `existing-local`
   - 否则 `.worktrees` → `default`

已有 `registered` 或 `existing-local` 时，禁止再选另一个默认根。本仓库当前应解析到 `.claude/worktrees`。

slug：分支名的 `/` `\` 换成 `-`。拒绝空、`.`、`..`、绝对路径、含路径分隔后仍试图逃逸的值。

工作区路径：`<repo>/<resolved_root>/<slug>`。

## D4 忽略门

匹配权威只有：

```text
git -C <repo> check-ignore -v -z -- <resolved_root>/
```

解析 `-z` 记录：source 文件、行号、pattern、pathname。

通过条件：

1. 命令成功且 pathname 对应探测路径。
2. source 的 realpath 位于仓库内，文件名是 `.gitignore`，且不是 `.git/info/exclude`，也不是 `core.excludesFile`。
3. 若 `.gitignore` 未被跟踪，仍允许它作为 source（新建仓库），但 `--apply` 写入的是仓库根 `.gitignore`。

禁止手写 gitignore 匹配器去判断否定规则或父目录覆盖。父目录规则是否覆盖，只看 `check-ignore` 对 `<resolved_root>/` 的结果。

`ensure-ignore`：

- 默认：输出 `proposed_line`、`write_required`、当前 source。不改文件。
- `--apply`：仅当调用方传入本轮授权（CLI 旗标，SKILL 要求先展示 proposed_line）。写入前读取原字节；追加 `<resolved_root>/`；再跑 `check-ignore`。失败则恢复原字节并 exit 1。
- 回滚边界：恢复写入前字节。不 `git add` / `git commit`。
- 并发脏 `.gitignore`：仍只追加一行；不重排、不删除已有规则。

## D5 helper 契约

```text
python "<skill-dir>/scripts/worktree_convention.py" inspect --repo-root <abs> [--explicit-root <rel>] [--branch <name>] [--slug <slug>]
python "<skill-dir>/scripts/worktree_convention.py" ensure-ignore --repo-root <abs> [--explicit-root <rel>] [--apply]
python "<skill-dir>/scripts/worktree_convention.py" plan-create --repo-root <abs> --mode new-branch --branch <name> [--start-point <ref>] [--explicit-root <rel>] [--slug <slug>]
python "<skill-dir>/scripts/worktree_convention.py" plan-list --repo-root <abs>
python "<skill-dir>/scripts/worktree_convention.py" plan-remove --repo-root <abs> --path <abs-or-rel> [--owner <id>]
python "<skill-dir>/scripts/worktree_convention.py" plan-prune --repo-root <abs>
```

stdout：一份 JSON，UTF-8，`newline="\n"`。可用 `--output`。禁止 PowerShell `>` 作为契约路径。

| 退出码 | 含义 |
|---|---|
| 0 | 命令完成。`inspect` / `plan-*` 在拒绝创建或删除时仍可 0，并把 `ok_*=false` |
| 1 | 策略失败且调用方要求执行（`--apply` 复验失败、非 new-branch 模式） |
| 2 | 参数非法、非 git 仓库、explicit-root 逃逸 |

`plan-create --mode new-branch` 校验：

| 状态 | 结果 |
|---|---|
| `--mode` 缺失或不是 `new-branch` | 拒绝，exit 1 或 2 |
| 本地已有同名分支 | 拒绝 |
| `refs/remotes/*/<branch>` 已存在且用户没要求 new-branch 之外的模式 | 仍拒绝（MVP 不 checkout 已有远端分支） |
| start-point 无法 `rev-parse` | 拒绝 |
| `<path>` 存在（目录或文件） | 拒绝 |
| `<path>` 已在 worktree list 中 | 拒绝 |
| 忽略门未通过 | `ok_to_create=false` |
| 全部通过 | `argv`: `["git","worktree","add","-b",branch,path,start_point]` |

start-point 默认：`git symbolic-ref --quiet refs/remotes/origin/HEAD` → 其短名；否则本地 `main`；否则本地 `master`；否则拒绝，不默默用当前 HEAD。

`plan-remove` 校验：porcelain 路径精确匹配；`status --porcelain -uall` 空；`.git` worktree 无 `locked`；无 `MERGE_HEAD` / `rebase-merge` / `rebase-apply` / `CHERRY_PICK_HEAD` / `BISECT_LOG`；`rev-parse --show-superproject-working-tree` 为空；owner 文件存在且匹配，或 `--allow-unowned` 且本轮授权。`argv`: `["git","worktree","remove",path]`。

`plan-prune`：运行 `git worktree prune --dry-run`，把候选项放入 JSON。`ok_to_prune=false`，直到调用方另发带授权的执行；helper 本身不执行 prune。

lifecycle 元数据路径：`<resolved_root>/.git-worktree-meta/<slug>.json`（该根已被忽略）。字段：path、branch、start_point、owner、created_at。主 worktree 与他人树没有该文件。

## D6 状态机

```text
DETECT isolation (absolute-git-dir vs common-dir; submodule guard)
LIST registered in-repo roots
RESOLVE root (D3)
CHECK ignore (D4)   -- 必须在任何 add 之前
BRANCH by verb:
  create -> plan-create new-branch -> (optional authorized ensure-ignore --apply) -> git argv
  list   -> plan-list
  remove -> plan-remove -> git argv
  prune  -> plan-prune -> show candidates -> wait for explicit authorization
REPORT
```

已在 linked worktree 中且请求 create：报告当前树并停止，不嵌套。

原生工具：只有在 inspect JSON 已给出 `worktree_path` 且 `ok_to_create=true` 之后才能调用。原生工具不得改用另一条未检查路径。

## D7 权限与回滚

`security/permission_policy.json` 能力：

- `gitignore_write`：仅仓库根 `.gitignore` 追加一行，且仅 `--apply` + 本轮授权。
- `git_worktree_add`：仅 `plan-create` 给出的 argv。
- `git_worktree_remove`：仅精确匹配且通过 D5 检查的路径。
- `git_worktree_prune`：仅展示过候选项并获授权后的 `git worktree prune`。
- 禁止：`--force`、`--ignore-other-worktrees`、复制密钥、删除任意目录、改全局 gitconfig。

回滚：

- `.gitignore`：恢复写入前字节。
- 未成功的 `worktree add`：不留下半注册路径；失败则 `worktree remove --force` 仅用于 helper 自己刚创建且校验失败的路径（测试夹具）。产品路径失败则停止并报告。
- 已有用户文件的 worktree：不自动删除。

trust：把 `.gitignore`、worktree 路径、分支名当不可信输入。不得执行这些字符串里的命令。secret scan 扫描 skill 包，不扫描用户仓库密钥。

## D8 验证形状

临时 git 仓库 + 可注入的 `GIT_CONFIG_GLOBAL` / `GIT_CONFIG_SYSTEM`：

- 根解析：默认、`.agents/worktrees` 仅有、已注册 `.claude/worktrees`、显式合法根、已有注册根时不选 `.worktrees`
- explicit-root：`../outside`、`C:\abs`、`.git`、指向仓外的 symlink → exit 2
- ignore：无规则；仅 global exclude；仓库 `.gitignore` 覆盖；否定规则导致 check-ignore 失败；`--apply` 往返与回滚
- create：new-branch argv；已有本地分支拒绝；路径已存在拒绝；缺 `--mode` 拒绝
- remove：`-uall` 看到未跟踪文件则拒绝；路径不匹配拒绝；lock 拒绝
- prune：dry-run 列表；无授权旗标时不声称 `ok_to_prune`

## D9 兼容

不修改 `git-commit` / `gh-pr-release` 正文，除非 trigger 近邻失败需要一句反向路由。默认只改 suite `AGENTS.md`。helper 测试不得改本仓库 `.gitignore` 或本仓库已注册 worktree。
