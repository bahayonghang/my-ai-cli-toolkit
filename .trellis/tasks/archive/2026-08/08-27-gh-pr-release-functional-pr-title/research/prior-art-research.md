# Prior-art research：PR 标题来自纳入提交

Date: 2026-08-27
Scope: SkillOps on existing `gh-pr-release` 3.0.0. Not a new skill.
Catalog: skills.sh via `npx --yes skills find`. SkillsMP: missing evidence（Windows 上 `search_skillsmp.py` 已知超时，本任务未跑）。
Source inspection: `gh api repos/.../contents/.../SKILL.md`（raw.githubusercontent.com / skills.sh 在本机被 SSRF 拦截）。

## Queries

1. `github pull request title conventional commits`
2. `merge pull request title from commits`

## Shortlist inspected

| Candidate | skills.sh installs (2026-08-27) | Why shortlisted | Inspected path |
| --- | ---: | --- | --- |
| nousresearch/hermes-agent@github-pr-workflow | 314 | 最高安装量的 GitHub PR 生命周期 skill | `skills/github/github-pr-workflow/SKILL.md` |
| perdolique/workflow@pr-creator | 87 | 明确要求标题反映完整 changeset | `skills/pr-creator/SKILL.md` |
| deevus/tea-skills@merge-pull | 78 | 名称像 merge 标题，实为 Gitea 合并 CLI | `skills/merge-pull/SKILL.md` |

Rating evidence unavailable（目录安装量不是用户评分）。

## Candidate-specific lessons

### perdolique/workflow@pr-creator

- 机制：对 `git log --oneline <base>..HEAD` 与 `git diff <base>...HEAD` 读**整段分支**，标题写 complete changeset 的主目的；完成后只报 URL、draft/ready、assignee。
- 落到本任务：create 模式用 `base...HEAD` 证据写标题；Completion 收成标识符。
- 不采用：强制英文、俚语/emoji 文风、默认 draft、默认把当前用户设为 assignee、把 commit skill 嵌进 PR 创建。

### nousresearch/hermes-agent@github-pr-workflow

- 机制：Conventional Commit 标题示例；`gh pr create --title/--body` 手写，不用 `--fill`。
- 落到本任务：继续禁止 `--fill` 生成正文。
- 不采用：默认 `--delete-branch`、CI 自动修循环、把 commit/CI/merge 写成一部百科、没有集成分支标题规则。

### deevus/tea-skills@merge-pull

- 机制：Gitea/Forgejo `tea pulls merge`，squash 时可另传 `--title`。
- 不采用：无 changeset 摘要；平台与授权模型不同。

## Absorbed and rejected

- keep：本包安全契约、逐项授权、仓库模板正文、pin SHA。
- adapt：pr-creator 的“整段 changeset 标题 + 短完成回报”。
- reject：百科式生命周期、默认删分支、强制英文/emoji 文风、把 git-commit 能力并进来。
- invent：长期集成分支合入时，禁止把 `merge <head> into <base>` 单独当作标题主语；用户口头说的 merge-dev-into-main 是**操作名**，功能主语来自纳入提交。具体标题形态见 PRD 待决问题。

## Limits

- SkillsMP stars：missing evidence。
- 未执行候选 skill 代码。
- 未做 provider-backed 对比。
