# Agent Workflow Reference

本文档集中说明 git-commit skill 在 agent 上下文下的特殊行为：agent trailer 何时附加、`[AI]` 何时才插入（默认不插）、如何用本地 git 创建提交以免 GitHub 显示 “This commit was created on GitHub.com.” / “Committed via …”、checkpoint 如何最终整理。

## Agent Context 识别

skill 在 §1 Preflight 阶段判定当前是否处于 agent 上下文。判定规则：

- skill 由 agent 调用（默认条件） → agent 上下文为真
- 用户显式说「不要 AI 标记」「no ai tag」「不加 agent trailer」 → 退回普通 Conventional Commit 模式

进入 agent 上下文后，附加 `Agent-*` / `Generated-By` trailer，**不**在 header 插入 `[AI]`。仅当用户明确说「加 AI 标记」「add [AI] tag」「加上 [AI]」时才传 `--ai`。目标仓库 history 里已有 `[AI]` 只作观察，不复制到新提交。

按以下顺序解析必填的两个变量：

### Agent-Model

`Agent-Model` 必填，取自 agent 系统 prompt 中的 model 标识（例如 `claude-opus-4-8`、`gpt-5-codex`、`claude-sonnet-4-6`）。skill 应直接读取自身运行的模型 ID，不要求用户提供。

### Agent-Task

`Agent-Task` 推断顺序：

1. 用户当前消息中显式给出的 issue URL / task ID
2. 用户消息中提到的 `closes #N` / `refs #N` 编号
3. 当前 git 分支名中提取的 ticket 编号（例如 `agent/AUTH-42-sms-fallback` → `AUTH-42`）
4. 最近一次 commit message 中的 Agent-Task 值（继承同任务上下文）
5. 兜底 `unspecified`

若兜底为 `unspecified`，仍写入 trailer。空缺的 task 字段比缺失 trailer 更利于后续 grep 审计。

### Agent-Prompt-Ref（可选）

仅当存在稳定的 prompt 引用（例如 prompt 模板 hash、提示词模板 ID）时填写。临时对话内容不写入。

## Trailer 顺序与格式

```text
[BREAKING CHANGE: ...]
[<user footer-line>]
[Closes #...]
[Refs #...]
[Confidence: <high|medium|low>]
[Scope-risk: <narrow|moderate|broad>]
[Tested: <命令或说明>]
Agent-Task: <value>
Agent-Model: <value>
[Agent-Prompt-Ref: <value>]
Generated-By: agent
```

`Generated-By: agent` 始终位于 trailer 段末尾，作为审计哨兵。

### 质量留痕 trailer（Confidence / Scope-risk / Tested）

这三个 trailer 把 agent 的自评与验证写进历史，便于审计时按风险/可信度筛查。它们排在 issue 引用（`Closes`/`Refs`）之后、agent 身份 trailer（`Agent-Task` 起）之前：

| 字段 | 含义 | 取值示例 | 是否必填 |
|------|------|----------|----------|
| `Confidence` | agent 对本次改动正确性的自评 | `high` / `medium` / `low` | agent-mode 推荐 |
| `Scope-risk` | 影响半径 / 爆炸范围 | `narrow` / `moderate` / `broad` | agent-mode 推荐 |
| `Tested` | 如何验证（命令或说明） | `just ci`、`pytest -k auth`、`未运行` | agent-mode 推荐 |

它们由 compose 脚本的 `--confidence` / `--scope-risk` / `--tested` 生成。与 `Why` 不同，这三个不做强制（缺失不阻断提交），但在 agent-mode 下应尽量填写，让历史可按 `git log --grep='^Scope-risk: broad'` 这类口径回溯。来源约定与 `code-quality-review` skill 的留痕字段保持一致。

## Why-line 强制路径

| Type | Why 是否强制 |
|------|--------------|
| `feat` | 是 |
| `fix` | 是 |
| `refactor` | 是 |
| `perf` | 是 |
| `docs` | 否 |
| `style` | 否 |
| `test` | 否 |
| `build` | 否 |
| `ci` | 否 |
| `chore` | 否 |
| `revert` | 否 |

强制类型缺 Why 时：

1. compose 脚本传 `--require-why` 会以非零退出阻断
2. skill 不直接编造 Why，应回到 split-plan 层并提示用户补充背景

## Checkpoint 模式

### 触发词

用户消息中出现以下任一信号，进入 checkpoint 模式：

- 「checkpoint」「打个 checkpoint」「先打个存档」「先存一下」
- 「WIP」「[WIP]」「work in progress」
- 「先提交一下，待会再整理」

### 输出形式

```text
chore(wip): 🔧 [WIP] <subject>

Agent-Task: <value>
Agent-Model: <value>
Generated-By: agent
```

- type 固定 `chore(wip)`，便于后续 `git log --grep='^chore(wip):'` 检索
- 跳过 `--require-why`
- 仍带完整 agent trailer
- 默认无 `[AI]`；用户显式要求时才加
- 不带 `Closes` / `Refs`（issue 关闭留到最终 atomic commit）

### 整理路径

skill 本身不执行 rebase。verify 阶段若检测到当前分支含多个 `chore(wip):` 提交，提示用户：

```bash
# 把分支上的 checkpoint 整理成 atomic commit
git rebase -i <base-branch>
```

并提示「合并前 squash 所有 `[WIP]` commit」。

## 审计与运营

```bash
# 列出所有 agent 提交
git log --grep='^Generated-By: agent' --format='%H %s'

# 按模型筛选
git log --grep='^Agent-Model: claude-opus-4-8'

# 按任务追溯
git log --grep='^Agent-Task: AUTH-42'

# 按风险筛查高爆炸范围改动
git log --grep='^Scope-risk: broad' --format='%H %s'

# 列出未 squash 的 checkpoint
git log --grep='^chore(wip):' --format='%H %s'
```

## 与社区 Assisted-by 惯例的关系

社区已有公开的 AI 署名惯例：Linux Kernel 采用 `Assisted-by: AGENT_NAME:MODEL_VERSION [TOOL1] [TOOL2]` 格式——TOOL 段可选，只列 coccinelle / sparse 这类专用分析工具（不列编辑器、git 等基础工具），kernel 文档自身的示例是 `Assisted-by: Claude:claude-3-opus coccinelle sparse`——并明确 AI 永不署 `Signed-off-by`：DCO 只能由人类签署；OpenTelemetry 使用 `Assisted-by: Claude Opus 4.5` 这类人类可读形式；Apache 以 `Generated-by:` 记录机器可解析的 provenance。

> Last verified: 2026-07-13 against <https://allthingsopen.org/articles/open-source-ai-contributions-assisted-by-git-trailer-standard>（各项目细则以其官方文档为准）

本 skill 私有 trailer 组与这些惯例的对应关系：

| 本 skill 私有 trailer | 社区近似物 | 说明 |
|----------------------|-----------|------|
| `Agent-Model: <id>` | `Assisted-by:` 的 MODEL 段 | 独立字段便于 `git log --grep='^Agent-Model:'` 精确筛选 |
| `Generated-By: agent` | Apache `Generated-by:` | 同为 provenance 用途；本 skill 用固定值作审计哨兵 |
| `Agent-Task` + `Tested` / `Confidence` / `Scope-risk` | 无对应物 | 私有方案的保留理由：任务 / 模型 / 验证三维可 grep 审计 |

**默认仍使用私有 trailer 组**：本仓库的审计口径（`git log --grep='^Generated-By: agent'` 等）依赖这些字段，社区惯例没有等价的三维检索能力。

**仓库惯例分支**（仅当目标仓库有明确 AI 署名政策时启用）：Preflight 采样发现近 20 条 log 或 `CONTRIBUTING` / AI 政策文件中出现 `Assisted-by:` / `Generated-by:` 惯例时——

1. 按仓库实际格式输出该 trailer，经 compose 脚本 `--footer-line` 注入，例如 `--footer-line "Assisted-by: Claude:claude-opus-4"`（kernel 风格；TOOL 段仅在确实用了专用分析工具时追加）或 `--footer-line "Assisted-by: Claude Opus 4.5"`（OpenTelemetry 风格）。
2. 同时省略本 skill 私有的 `Agent-*` / `Generated-By: agent` 组——两套并存会造成双重署名噪音。
3. `[AI]` header 标签**不**跟随仓库 history。默认省略；仅用户显式要求时传 `--ai`。注意脚本约束：`--ai` 必须搭配 `--agent-model`（会一并输出 `Agent-Model` trailer）。
4. 无论哪个分支，都不得自行添加 `Signed-off-by`：DCO 签署主体必须是人。仓库要求 DCO 时，提示用户自行 `git commit -s`，或在用户明确确认后以用户名义签署。

## 与现有禁止项的边界

| 项 | 是否允许 |
|----|----------|
| `Co-authored-by: ...` / `Co-Authored-By: ...` | 禁止 |
| `Made-with:` / `Made with` / `Committed via …` | 禁止 |
| `git commit --trailer` 注入上述字段 | 禁止 |
| GitHub web / Contents API / Git Data API / GraphQL `createCommitOnBranch` / MCP `push_files` / `create_or_update_file` 创建提交 | 禁止 |
| `🤖 Generated with Claude Code` 等 attribution 文案 | 禁止 |
| 自行添加 `Signed-off-by: ...` | 禁止（DCO 只能由人类签署；仓库要求 DCO 时提示用户自行 `git commit -s`） |
| header `[AI]` | 默认禁止；仅用户显式要求时允许 |
| `Generated-By: agent` trailer | 允许（结构化字段，非署名） |
| `Agent-Model: <id>` trailer | 允许 |
| 仓库惯例的 `Assisted-by:` trailer（经 `--footer-line`） | 允许（仅在目标仓库已有该惯例时） |
| 在 message 中讨论 `git push` | 禁止 |

`Generated-By` 与 `Co-authored-by` 的区别：前者是机器可解析的审计字段，写入 trailer 是为了后续 grep；后者是面向人的署名，会让 GitHub 把 commit 计入指定账号的贡献统计，并常被渲染成 “Committed via Cursor Agent”，因此本 skill 持续禁用。

## 提交通道与 GitHub 页面标签

GitHub 提交页上的这两条不是 commit message 里的普通正文，而是托管端根据**如何创建提交**打上的标记：

| GitHub 页面文案 | 触发条件 | 本 skill 的对应动作 |
|-----------------|----------|---------------------|
| `This commit was created on GitHub.com.` | GraphQL `committedViaWeb`；committer 为 `GitHub <noreply@github.com>`；经 GitHub web、Contents API、Git Data API、GraphQL `createCommitOnBranch`、MCP `push_files` / `create_or_update_file`、或 GitHub App 在服务端建 commit | 只用本地 `git commit -F <message-file>`（可用 `rtk proxy git commit -F` 保留原始 hook 输出）。不要用上述 API / App 通道 |
| `Committed via Cursor Agent`（以及同类 Client 标签） | Cursor / 其它 agent 注入 `Co-authored-by: Cursor <cursoragent@cursor.com>`、`Made-with: Cursor`，或经 Cursor GitHub App 提交；IDE 里 `git commit --trailer` 也会写入 | 不要传 `--trailer`；不要把这些行写入 message file。compose 脚本对匹配行以退出码 4 拒绝 |

> Last verified: 2026-08-24 against GitHub GraphQL `committedViaWeb` (`https://docs.github.com/en/graphql/reference/commits`), GitHub Contents API create-or-update file contents, GitHub MCP `push_files` server-side commit behavior (`https://github.com/github/github-mcp-server/issues/2190`), and Cursor attribution (`Co-authored-by: Cursor`, `Made-with: Cursor`; IDE Settings > Git & PRs > Attribution; CLI `attribution.attributeCommitsToAgent`).

本地 `git commit` 后的 author/committer 来自该机器的 `git config user.name` / `user.email`。成功后用 `git log -1 --format='%an <%ae>%n%cn <%ce>%n%B'` 核对：message 里不得出现上表禁止行，committer 不应是 `GitHub <noreply@github.com>`。若宿主仍强行追加 trailer，报告该结果；本 skill 不 `commit --amend`。
