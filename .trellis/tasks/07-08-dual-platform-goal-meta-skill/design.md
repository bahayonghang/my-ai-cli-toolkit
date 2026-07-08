# Design: dual-platform goal-meta-skill

## 总体思路

不做两套模板，而是「共享 goal 合同 + 平台渲染层」。七要素合同（目标/验证/约束/边界/迭代/完成/暂停）是平台无关的思维框架；平台差异集中在三处：命令表面（management commands）、评估机制（谁来判定完成、能看到什么证据）、启用条件。把平台事实收敛进一个新 reference 文件，其余文件只引用它，避免同一事实散落多处后漂移。

## 文件级设计

### 新增 `references/platform-goal-facts.md`

唯一的平台事实来源（single source of truth），内容 = prd.md 的平台基线表展开：

- 每平台一节：命令语法、启用条件、长度上限、评估机制、恢复行为、相邻机制（Codex `/plan`；Claude Code `/loop` / Stop hook）。
- 一节「渲染规则」：
  - Codex 渲染：objective 措辞（"做成什么"）；保留既有中文/英文字段名不变。
  - Claude Code 渲染：condition 措辞（"什么状态算完成"）；验证证据白名单 = 命令退出码 / 测试输出 / lint 输出 / `git status`/`git diff` 结果 / 文件存在性清单——凡评估器在 transcript 里读不到的证据形式（纯截图、外部人工确认）必须改写或降级为约束；必须含 `否则在 N 轮后停止并总结剩余问题` 条款；「暂停条件」字段保留但语义改为「停止并报告，等待人工决定」（正文措辞用"停止并报告"，字段名不变，保证 linter 标记兼容）。
- 一节「平台判定」：显式声明 > 宿主环境推断 > 并入可选调整问一次。

### `SKILL.md`

- frontmatter：description 重写为双平台（含 "Claude Code /goal"、"Codex /goal"、中文触发词）；tags 增加 `claude-code`；version 升到 0.2.0。
- Operating Mode：Codex 专属假设改为按平台分列；新增 Claude Code 假设（trust/版本要求、无 pause、evaluator 只读 transcript、设置即开工）。
- Workflow：第 2 步之前插入「判定目标平台」；第 8 步（现有 goal 管理）改为按平台给命令；lint 调用示例加 `--platform`。
- Output Contract：保留中文优先五段结构；示例块改为「同一需求的 Codex 版 + Claude Code 版」各一个，替换现有单一示例（英文镜像规则不变）。
- 4,000 字符限制两平台通用，文字合并表述。

### `references/goal-command-playbook.md`

- 「Current Codex Goal Commands」一节改为「Platform Goal Commands」，按平台分列，细节指向 platform-goal-facts.md。
- Strong Examples 三个例子各补一个 Claude Code condition 版（不必逐字段重复，重点展示 condition 化 + 轮次条款 + transcript 证据的差异）。
- Anti-Patterns 增补：给 Claude Code 用户输出 `/goal pause`；验证只写"截图确认"（evaluator 读不到）；condition 无轮次上限。

### `references/default-goal-strategy.md` / `references/interview-checklist.md`

- strategy：Goal Length Rule 改为双平台通用；新增「平台判定」小节引用 facts 文件。
- checklist：开头的"新 goal vs 管理现有 goal"分流改为平台感知；Fast Interview 选择题在平台不明时增加一题 `0. 平台：A Claude Code / B Codex`（明确时不出现）。

### `scripts/lint_goal_command.py`

- 新增 `--platform {codex,claude,both}`，默认 `both`（= 现行为，向后兼容）。
- `claude` 模式追加规则：
  - 文本含 `/goal pause` 或 `/goal resume` → error（Claude Code 无此命令）。
  - 缺轮次/时间上限条款（正则匹配 `stop after \d+`、`\d+\s*轮`、`\d+ turns` 等）→ error。
- `codex` 模式：无追加规则（现集合已足够）。
- 两模式通用：`/goal` 首行去掉前缀后 > 4,000 字符 → error。
- 保持现有输出格式与退出码语义。

### `tests/lint-goal-command.test.mjs`

- 现有 5 个测试不动（验证向后兼容）。
- 新增：claude 模式拒绝 pause 建议；claude 模式拒绝缺轮次条款；claude 模式通过合法 condition 样例；超长 /goal 行报错。

### `evals/evals.json`

新增 3 条（id 8-10）：Claude Code 中文正向（要求含轮次条款、无 pause 措辞）；"我在 Claude Code 里想暂停 goal" → 纠偏解释 + 替代方案；平台未说明的模糊任务 → 通过可选调整问平台或按宿主默认并说明。

### `agents/interface.yaml` / `README.md`

- interface.yaml：short_description、default_prompt 双平台化；`degradation.claude` 改为描述原生 /goal 渲染。
- README：中文主体重写双平台章节（"Codex /goal 提示"→"两个平台的 /goal 差异"表）、troubleshooting 表按平台分组、安装与致谢保留。

## 权衡

- **为什么不拆成两个 skill**：合同核心 90% 重合，拆分会导致触发竞争和双份维护；渲染层差异一个 reference 文件即可承载。
- **为什么「暂停条件」字段名在 Claude Code 版保留**：linter 的 marker 集合与既有中文输出习惯依赖它；只改语义措辞成本最低。
- **linter 轮次条款用正则而非语义判断**：保持零依赖脚本，误报可用宽松模式集覆盖；漏报由 evals 兜底。

## 回滚

全部改动限于 `skills/developer-tools-integrations/goal-meta-skill/**`，单 commit 可整体 revert；`--platform` 默认值保证外部调用方（若有）不受影响。
