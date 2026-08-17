# Prior-Art Research

- Researched at: 2026-08-17
- Queries: `git worktree skill`, `git worktree agent`, `worktree isolated checkout`, `worktrees directory convention`
- Catalogs: skills.sh (`npx.cmd skills find`)、SkillsMP (`search_skillsmp.py`)、GitHub (`gh search repos` / `gh api`)
- Rating evidence: unavailable
- Unified runner failure: `python .../research_prior_art.py --strict` 在本机退出 1。原因：`subprocess` 调用 `npx`，Windows 上可执行文件是 `npx.cmd`，报 `FileNotFoundError: [WinError 2]`。随后改用 `npx.cmd` 与 SkillsMP 分开检索。失败快照未保存完整 stdout，此处只记录退出原因。
- 用户已确认默认策略 C（2026-08-17）：无已注册根时默认 `.worktrees/<slug>`，并保留已有本地根。

## Catalog notes

- skills.sh installs 是采用量，不是质量。
- SkillsMP `repo_stars` 属于父仓库。
- 关键字碰撞已丢弃：`openclaw-changelog-update`、`git-workflow`、`github-ops`。

## Shortlist

| Candidate | Source | Relevance | skills.sh installs | SkillsMP repo stars | Quality/trust evidence | Adopt | Reject | License |
|---|---|---|---:|---:|---|---|---|---|
| obra/superpowers `using-git-worktrees` | https://github.com/obra/superpowers/tree/main/skills/using-git-worktrees | Isolation-first | 165000 (2026-08-17) | 271592 (parent) | 已读 SKILL.md | keep/adapt: 检测隔离、创建前 ignore、`.worktrees/` 默认 | 每次创建后自动装依赖并跑测试；忽略门之后才问原生工具路径 | MIT (parent; skill-only 未复验) |
| everyinc `ce-worktree` | https://github.com/everyinc/compound-engineering-plugin （skill 路径以仓库内 `.agents/skills` / `skills/ce-worktree` 为准；本机曾 404 过 `skills/git-worktree`） | 更严的安全 | 2400 (2026-08-17) | missing evidence（plugin 24320 star） | 已读 `ce-worktree` SKILL.md | keep/adapt: 绝对 git-dir 比较、一分支一树、从仓库根解析、沙箱失败即停 | 创建失败后就地继续 | missing evidence |
| marioxe301/super-worktree | https://github.com/marioxe301/super-worktree/blob/main/SKILL.md | 生命周期 CLI | missing evidence | missing evidence | 已读根 SKILL.md | adapt: create/list/remove/prune 动词 | 复制密钥、`node_modules` symlink、hooks、Bash 4/`jq` | missing evidence |
| HamStudy/git-worktree | https://github.com/HamStudy/git-worktree-skill/blob/main/skills/git-worktree/SKILL.md | 生命周期所有权 | 0 | n/a | 已读 SKILL.md | **adapt**: lifecycle owner；只删除自己的树；porcelain 精确路径；检查 lock / 进行中 Git 操作；不自动复制密钥；与 commit skill 组合 | **reject**: 「完成 = 已合并并删树」；MVP 不做 adopt | missing evidence |
| chen-gdp `using-git-worktrees` | https://github.com/chen-gdp/git-worktrees-skill/blob/main/skill/SKILL.md | 目录选择 | 0 | n/a | 已读 skill/SKILL.md | adapt: 已有本地目录优先 | 用 `grep` 代替 `check-ignore`；交互式选全局目录 | missing evidence |
| AutoGPT `worktree` | https://github.com/Significant-Gravitas/AutoGPT/blob/master/.claude/skills/worktree/SKILL.md | 兄目录 + 项目脚本 | missing evidence | 186582 (parent) | 已读 | reject 作为默认布局 | `../NAME`、Prisma、杀端口 | missing evidence |
| kuderr/git-wt | https://github.com/kuderr/git-wt/blob/main/skills/git-wt/SKILL.md | 全局管理器 | 10 | n/a | 已读 | reject 作为依赖 | `~/.git-wt/`、默认复制 `.env*` 与 `.claude` | missing evidence |
| neolabhq `git-worktrees` | https://github.com/neolabhq/context-engineering-kit/blob/main/skills/git-worktrees/SKILL.md | 命令手册 | 928 | missing evidence | 已读 | reject 作为 skill 形态 | 兄目录示例、长命令清单 | missing evidence |
| kndoshn `managing-git-worktrees` | https://github.com/kndoshn/git-worktree-skill/blob/main/skills/managing-git-worktrees/SKILL.md | 安全 add/remove | 0 (repo 1 star) | n/a | 已读 | keep: 变更前 inspect；默认不用 `--ignore-other-worktrees` | 默认 `../wt/<branch>` | missing evidence |
| Lxxyx `wt-init` | https://github.com/Lxxyx/git-worktree-skills/blob/main/wt-init/SKILL.md | 名称碰撞 | 0 | n/a | 已读 | reject | 只重命名当前分支 | missing evidence |

`jnmetacode/superpowers-zh@using-git-worktrees`（902 installs）视为 obra 译本。

## Location conventions observed

| Pattern | Used by | Property |
|---|---|---|
| `<repo>/.worktrees/<slug>` | obra, everyinc, HamStudy, chen-gdp, super-worktree | 仓内隐藏根，必须被 ignore |
| `<repo>/.claude/worktrees/<name>` | 本仓库当前已注册 worktree | 宿主已放置；解析时必须当作已有根 |
| `<repo>/worktrees/<slug>` | obra / chen-gdp 备选 | 仓内可见根 |
| `<repo>/.agents/worktrees/<slug>` | 用户举例 | 已检查的公开 skill 未把它当默认 |
| `../<repo>-<slug>` 或 `../wt/<branch>` | AutoGPT, neolabhq, kndoshn | 兄目录 |
| `~/.git-wt/<repo>/<name>/` | kuderr/git-wt | 仓外全局 |

本仓库 `.gitignore` 已有 `.worktrees/` 与 `.agents/`。

## Original contribution

suite 内的 Governed 规范 skill：单一仓库内根、创建前 `check-ignore` 权威、new-branch-only argv、owned remove、授权 prune。默认根策略已由用户选 C，不再是开放问题。

## What we learned from each inspected candidate

- obra: 先检测隔离；默认 `.worktrees/`；创建前确认 ignore。
- everyinc: 绝对路径比较 git-dir；不嵌套；一分支一树。
- super-worktree: 命名动词有用；密钥复制不是核心。
- HamStudy: **owner 拥有删除权**；精确匹配注册路径；检查 lock 与进行中操作；不自动复制密钥。adopt 与「完成=已合并」不进入本 MVP。
- chen-gdp: 已有本地目录优先于默认值。
- AutoGPT / neolabhq / kndoshn: 兄目录不作为本 skill 默认根。
- kuderr/git-wt: 仓外全局根需要第三方 CLI，并默认复制密钥/AI 状态。
- Lxxyx `wt-init`: 仓库名含 worktree 不等于该工作。

## Created skill advantages

- Design advantage: 单一默认根 + 已注册根发现 + 创建前 ignore 门 + new-branch argv。实现后可见。
- Validated advantage: 无。trigger / Node 测试尚未写。
- Hypothesis: 在已有 `.claude/worktrees` 的仓库沿用该根，可避免第二种默认根。待测试。

## Missing evidence

- 多数独立仓库的 skills.sh 安装数与许可证。
- 用户评分：两目录均无。
- 未执行任何第三方 skill 脚本。
- 宿主原生 worktree API 的第一方合同：今日未复验。
- `research_prior_art.py --strict` 完整 stdout：未保存。
