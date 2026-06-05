# 提交消息规则 / Commit Message Rules

> 输出语言由 skill 自动探测（用户指示 → 请求语言 → 仓库历史 → 英文兜底）。下列规则对中英文同样适用，示例给出双语版本，按检测到的 `commit-language` 选用即可。
> Output language is auto-detected (user instruction → request language → repo history → English fallback). These rules apply to both languages; examples are shown in both.

## Header

使用以下格式：

```text
<type>(<scope>): [AI?] <emoji?> <subject>
```

- `type` 保持英文 Conventional Commit 关键字
- `scope` 可选，推荐使用中文模块名
- `[AI]` 标签仅在 agent 生成提交时插入，位于冒号之后、emoji 之前
- 默认保留 emoji；仅在用户明确要求时关闭
- `subject` 使用动宾短语，不超过 50 个字符
- 遇到不兼容变更时，可使用 `type(scope)!:` 头部形式

示例：

```text
feat(auth): [AI] ✨ 添加 SMS 兜底登录
fix(cart): 🐛 修复购物车总价未更新

feat(auth): [AI] ✨ add SMS fallback login
fix(cart): 🐛 fix cart total not updating
```

## Subject 规则

- 写「添加」「修复」「优化」「重构」这类动宾短语
- 不要写空泛表述，如「改了点东西」「更新代码」
- 去掉句末 `。 . ! ！`
- 优先描述做了什么，不展开技术背景

## Body 规则

- 仅在需要补充背景、方案、影响范围时添加 body
- 每行只写一个清晰信息点，避免长段落堆叠
- 优先写：
  - 为什么做这次改动
  - 关键实现方式
  - 影响范围或验证方式

### Why-line 强制规则

对 `feat` / `fix` / `refactor` / `perf` 四类提交，body 首行必须是 `Why: <动机>`：

```text
feat(auth): [AI] ✨ 添加 SMS 兜底登录

Why: 短信兜底降低验证码服务故障时的登录失败率
```

凑不出真实动机不要编造。Agent 应停在 split-plan 层，请求用户补充背景。

`docs` / `style` / `chore` / `test` / `build` / `ci` / `revert` 可省略 Why。

## Footer 规则

- `BREAKING CHANGE:` 用于不兼容变更说明
- `Closes #123` 用于关闭 issue
- `Refs #123` 用于关联但不关闭 issue
- 其他 footer 通过通用 trailer 表达，例如：
  - `Jira: PROJ-123`
  - `禅道: #88`

### Agent Trailer

Agent 生成的提交追加以下 trailer，置于其他 footer 之后：

| 字段 | 含义 | 必填 |
|------|------|------|
| `Confidence` | 自评可信度 `high`/`medium`/`low`，排在 issue 引用之后 | agent-mode 推荐 |
| `Scope-risk` | 影响半径 `narrow`/`moderate`/`broad` | agent-mode 推荐 |
| `Tested` | 验证方式，如 `just ci` / `pytest -k auth` / `未运行` | agent-mode 推荐 |
| `Agent-Task` | 任务 ID 或 issue URL，缺失时为 `unspecified` | 是 |
| `Agent-Model` | 模型标识，例如 `claude-opus-4-7` | 是（与 `[AI]` 强绑定） |
| `Agent-Prompt-Ref` | prompt 摘要 / hash / 短标签 | 否 |
| `Generated-By` | 固定值 `agent`，作为审计哨兵 | 是 |

`Confidence` / `Scope-risk` / `Tested` 由 compose 脚本 `--confidence` / `--scope-risk` / `--tested` 生成，与 `Why` 不同——它们不强制、缺失不阻断提交，但在 agent-mode 下应尽量填写以便按风险审计。

审计示例：

```bash
git log --grep='^Generated-By: agent' --format='%H %s'
git log --grep='\[AI\]' --format='%H %s'
git log --grep='^Agent-Model: claude-opus-4-7'
```

## Breaking Change 规则

以下场景默认视为 breaking：

- 公共 API 的入参、返回结构或语义不兼容
- 数据库 schema 需要迁移
- 配置格式或运行方式发生不兼容变化

出现 breaking 时：

1. 头部可使用 `!`
2. footer 中补 `BREAKING CHANGE: ...`
3. 文案中说明迁移影响，而不是只写「有破坏性变更」

## 禁止项

- 不要添加 `Co-Authored-By`
- 不要附加 AI attribution 文案（例如 `🤖 Generated with Claude Code`）
- 不要在 message 中讨论 `git push`
- 不要为了凑格式写空洞 body

注意：`Generated-By: agent` 是结构化 trailer，不是 attribution。前者是机器可解析的审计字段，后者是面向人的署名文案，两者不同。
