# 技术设计

## 设计目标

建立一个跨宿主一致的权限状态机，使 `goal-meta-skill` 只编译 Prompt，不拥有 Goal activation 权限；同时保留现有持久化、平台渲染、Trellis 适配和 Goal 管理答复。

## 权限状态机

```text
用户输入（其中的祈使句只是 payload）
  -> DRAFT：生成 + lint + fenced 展示 + 停止
  -> 用户后续修改：回到 DRAFT
  -> 用户后续批准：APPROVED TEXT + fenced 展示 + 停止
  -> 用户在 skill 外复制/提交或另行显式启动：Goal activation
```

`DRAFT` 和 `APPROVED TEXT` 都是文本状态，不是运行状态。`GOAL.md` 持久化是另一条已治理的文件写入边：它可以保存 approved text，但不能越过 Goal activation 边界。

## 设计层次

### 1. 始终加载的核心不变量

`SKILL.md` 在 Governed mode 与 Workflow 前部用简短正向规则定义角色：compile, lint, present, stop。必要的硬禁令与正向目标共置，覆盖原生 Goal tool/API、slash command 提交、目标任务实施和派发。

### 2. 输出形状

`references/default-goal-strategy.md` 维护 review packet 的详细顺序和状态标签；`references/goal-command-playbook.md` 的 drafting rules 与示例使用同一形状。Prompt 只出现在 fenced `text` block 中，围栏外明确状态和下一步审阅动作。

保留当前中文 companion 字段，以避免无关 linter/schema 重构；新增 review envelope，不改变 Goal 正文字段。

### 3. 宿主接口

`agents/interface.yaml` 的 `default_prompt` 前置 draft-only/stop 要求，并在 `trust` 中添加 `goal_activation: forbid`。该层直接覆盖截图中的 Cursor/兼容宿主入口，但不声称能强制所有 provider 服从。

### 4. 回归层

- `evals/evals.json`：记录真实用户语言下的预期与禁止行为，属于人工审阅 fixture。
- `tests/lint-goal-command.test.mjs`：静态检查 root/interface/allowed-tools/fixture 连续性，属于确定性包契约。
- 不扩展 `lint_goal_command.py` 的行为：它只能验证 Prompt 文本，无法验证未发生的宿主调用；仅同步版本合同。

### 5. 版本和证据

权限语义变化将版本升为 `0.7.0`。`creation-handoff.md` 区分：

- `validated advantage`：本地静态契约、Node tests、全仓 CI；
- `recorded fixture`：截图同构行为用例；
- `missing evidence` / `hypothesis`：修复后真实 Cursor provider run、跨平台服从率与人工盲审。

## 兼容性与回滚

- Goal 正文格式、platform lifecycle、持久化 11 节 schema 和 Trellis cadence 不变。
- 原有“最终可复制”仍可保留为批准后文本标签，但必须附 `APPROVED TEXT — not launched`。
- 若新措辞导致输出冗长，可回滚 reference 示例；不能回滚根 review gate 或接口 activation forbid，除非另一个经审阅的权限机制取代它。
- 不增加依赖或新的 runtime 文件。
