# Agent Workflow Reference

本文档集中说明 git-commit skill 在 agent 上下文下的特殊行为：何时注入 `[AI]` 标签和 agent trailer、agent context 如何识别、checkpoint 如何最终整理。

## Agent Context 识别

skill 在 §1 Preflight 阶段判定当前是否处于 agent 上下文。判定规则：

- skill 由 agent 调用（默认条件） → agent 上下文为真
- 用户显式说「不要 AI 标记」「no ai tag」「不加 agent trailer」 → 退回普通 Conventional Commit 模式

进入 agent 上下文后，按以下顺序解析必填的两个变量：

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
chore(wip): [AI] 🔧 [WIP] <subject>

Agent-Task: <value>
Agent-Model: <value>
Generated-By: agent
```

- type 固定 `chore(wip)`，便于后续 `git log --grep='^chore(wip):'` 检索
- 跳过 `--require-why`
- 仍带完整 agent trailer
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

## 与现有禁止项的边界

| 项 | 是否允许 |
|----|----------|
| `Co-Authored-By: ...` | 禁止 |
| `🤖 Generated with Claude Code` 等 attribution 文案 | 禁止 |
| `Generated-By: agent` trailer | 允许（结构化字段，非署名） |
| `Agent-Model: <id>` trailer | 允许 |
| 在 message 中讨论 `git push` | 禁止 |

`Generated-By` 与 `Co-Authored-By` 的区别：前者是机器可解析的审计字段，写入 trailer 是为了后续 grep；后者是面向人的署名，会让 GitHub 把 commit 计入指定账号的贡献统计，因此本 skill 持续禁用。
