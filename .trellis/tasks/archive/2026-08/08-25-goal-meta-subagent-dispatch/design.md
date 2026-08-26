# 技术设计

## 设计目标

把「Trellis 任务实施必须派发子代理」这条要求编码进 `goal-meta-skill` 的生成物，覆盖适配器、范本、linter、evals 四层，同时不破坏三条既有边界：普通任务不注入 Trellis 节奏、内联模式平台不注入派发、`platform-goal-facts.md` 仍是 `/goal` 生命周期事实的唯一来源。

## 机制依据

宿主抑制指令 `Do not call the AgentTool unless the user requested it` 的谓词是「用户是否请求了」。`/goal` 正文由用户粘贴，因此写进 `/goal` 的派发要求天然满足该谓词。这是本设计不去改仓库钩子的理由，证据见 `research/host-directive-and-breadcrumb-evidence.md`。

该机制论证的等级是 hypothesis，不是已验证。本任务能证明的是生成物含派发条款、linter 能拦住缺失、evals 覆盖注入与豁免；不能证明执行 agent 的实际派发率上升。

## 改动点 1：`references/trellis-goal-cadence.md` 新增派发一节

插在现有 `## Detection` 之后、`## Commit then archive` 之前——派发决定「谁来做」，归档决定「做完怎么收尾」，顺序与执行顺序一致。

### 派发事实表

沿用 `platform-goal-facts.md:9-12` 的证据词汇（`official` / `local-probe` / `community-observed` / `missing evidence`），并带独立的 `Last verified` 行。该表的事实来源是目标项目的 `.trellis/workflow.md`，不是平台官方文档，所以任何一行都不能标 `official`。

| Platform    | 派发形状                                                                                             | Evidence                                                                                                      |
| ----------- | ---------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| Claude Code | `Task` / `Agent` 工具，`subagent_type` 取 `trellis-implement` / `trellis-check` / `trellis-research` | `local-probe`：本机 `.claude/agents/trellis-*.md` 三个文件存在，`workflow.md:475-488` 列 Claude Code 为派发组 |
| Codex       | 由 `.trellis/config.yaml` 的 `codex.dispatch_mode` 决定：`auto` 派发，`inline` 不派发                | `local-probe`：本机 `config.yaml:125-145` 记录默认 `auto` 与 `inline` 的语义                                  |
| Oh My Pi    | 派发组，agent 名同 Claude Code                                                                       | `.trellis/workflow.md` 来源（`:475-488` 分组行）                                                              |
| Grok Build  | `spawn_subagent`，`subagent_type` 取 Trellis agent 名                                                | `.trellis/workflow.md` 来源（`:223` 平台注记、`:490-502` pull 组）                                            |
| Kimi Code   | 内建 `coder` / `explore` 子代理，配 `.kimi-code/skills/trellis-<role>/SKILL.md`                      | `.trellis/workflow.md` 来源（`:223` 平台注记、`:490-502` pull 组）                                            |

表内不写行号引用之外的 Trellis 脚本内部细节，遵循该文件 `:11-16` 已有的「不要把 Trellis 脚本内部抄进 SKILL.md」纪律。

### 侦察要求

skill 不得单方面断言目标项目一定存在某个 agent。生成的 `/goal` 必须包含一条读取要求：先读目标项目 `.trellis/workflow.md` 的 Phase 2.1 / 2.2，确认本项目实际的派发协议与 agent 名。理由有两条：

1. 目标项目的 Trellis 版本可能与本表的采样时点不同；
2. 派发组分组本身写在目标项目的 `workflow.md` 里，是可核对的一手来源。

这与 `default-goal-strategy.md:43-58` 的 Read-Only Project Reconnaissance 同构——那里已经要求先读 `AGENTS.md`、命令源与 Git 上下文，本节只是在 Trellis 场景下追加一个读取对象。

### 内联例外

不注入派发条款的三种情形：

1. 目标平台在目标项目 `workflow.md` 的内联组里（本机为 `codex-inline`、Kilo、Antigravity、Devin）。
2. 目标平台是 Codex 且 `.trellis/config.yaml` 的 `codex.dispatch_mode` 为 `inline`。
3. 用户明确要求主会话内联实施。

命中例外时，`迭代策略` 改用该项目的内联形状（本机 `workflow.md:518-526` 为 `trellis-before-dev` → 编辑 → `trellis-check`），并且 `约束` 里不得出现「主会话不得直接编辑产品文件」。

### 注入门

派发条款与归档节奏共用 `## Detection` 的同一个门：只有 outcome 明确是 Trellis 任务/子任务实施才注入；`.trellis/` 仅存在不构成理由。这保住 eval 17 的既有边界，也复用 `SKILL.md` Quality bar 已有的「Trellis 节奏误注入普通任务」拒收项。

## 改动点 2：`/goal` 字段落点

派发要求落到三个字段，各自承担不同职责。字符成本约 200，两个范本各有约 3000 字符余量，预算不构成约束。

**`迭代策略`** —— 派发谁、什么顺序、先读什么：

```
迭代策略：先读 .trellis/workflow.md 的 Phase 2.1 / 2.2 确认本项目派发协议与 agent 名；一次完成一个可独立验收的 Trellis 任务，代码实施派发 trellis-implement、验证派发 trellis-check；然后用 Conventional Commits 提交该任务相关产品文件；再运行 python ./.trellis/scripts/task.py archive <具体任务目录>。
```

**`约束`** —— 写入边界的主体限制：

```
主会话不直接 Edit/Write 产品文件；产品改动由 trellis-implement 完成。
```

放 `约束` 而非 `边界`，依据 `goal-command-playbook.md:219-220`：「什么不能变」进 `Constraints`，文件系统与仓库权限进 `Boundaries`。「谁来改」是行为约束，不是路径权限。

**`完成条件`** —— 派发证据。Codex 版可引用命令与产物；Claude Code 版必须 transcript 可见，因为其 evaluator 只读 transcript 且不跑工具（`platform-goal-facts.md:72-76`）：

```
每个任务的代码实施由 trellis-implement 完成、验证由 trellis-check 完成，派发记录出现在对话中。
```

`暂停条件` 不加派发相关条款。派发失败（agent 不存在、平台不支持）应由侦察步骤在实施前发现并转入内联形状，不是运行期暂停事件。

## 改动点 3：`references/goal-command-playbook.md` 范本更新

改 `:287-311` 的两个 Trellis 范本，只在三个字段追加派发措辞，现有 commit-then-archive 与父任务发布门措辞逐字保留。用 diff 确认只增不改。

`Anti-Patterns` 段（`:333-346`）追加两条拒收项：

- Trellis 实施 goal 缺派发条款而目标平台在派发组；
- 对内联模式平台注入派发条款。

`Drafting Rules` 的 `:229` 现在只说加载 cadence 文件，补一句点明 cadence 含派发要求与内联例外，避免读者以为该文件只管归档。

## 改动点 4：`scripts/lint_goal_command.py` 派发校验

新增两组模式常量，与既有 `COMPLETION_ANCHOR_PATTERNS` 等同风格：

- `DISPATCH_REQUIREMENT_PATTERNS`：匹配 `trellis-implement`、`trellis-check`、`spawn_subagent`、`subagent_type`、`派发`、`子代理` 等语义锚点。
- `INLINE_MODE_PATTERNS`：匹配 `dispatch_mode` 为 inline、`inline mode`、`内联模式`、`trellis-before-dev` 等豁免标记。

判定顺序（两个分支共用一个辅助函数，避免两份实现）：

| 输入                                                | 结果   |
| --------------------------------------------------- | ------ |
| 非 Trellis 文本                                     | 不检查 |
| Trellis 文本 + 命中 `INLINE_MODE_PATTERNS`          | 不检查 |
| Trellis 文本 + 命中 `DISPATCH_REQUIREMENT_PATTERNS` | 通过   |
| Trellis 文本 + 两者都未命中                         | 报错   |

**契约分支**：接在 `lint_persisted_contract` 现有的 `if ".trellis/tasks/" in text:`（`:577`）内，检查区域与既有 cadence 检查一致，即 `Iteration policy` + `Completion conditions` 拼接串（`:581`）。

**内联分支**：`lint_text`（`:338-387`）目前没有 Trellis 识别。新增识别条件采用双条件而非单条件：文本含 `.trellis/tasks/` **且** 含归档节奏（`archive`）。只用前者会把「侦察到 `.trellis/` 但不是任务实施」的 goal 误判为 Trellis 实施——那正是 eval 17 的场景。

按 `.trellis/spec/backend/error-handling.md` 的既有约定，派发缺失归 `errors` 而不是 `warnings`：它是合同缺陷，不是风格建议。这与 `lint_completion_warnings`（编号建议属 warning）的分级保持一致。

## 改动点 5：evals 与 mjs 测试

两套系统职责不同（`.trellis/spec/guides/skill-authoring-conventions.md:212-252`）：`evals.json` 是人工审阅的行为 fixture，`just ci` 不跑；`tests/*.mjs` 由 `just node-test` 执行，是唯一的自动回归保障。因此派发校验的回归必须落在 `.mjs`。

**`evals/evals.json`**：

- id 15、16、29 各加一条派发断言；
- id 17 加一条「不注入派发条款」的反向断言；
- 新增 id 34 覆盖内联例外（Codex `dispatch_mode: inline`）；
- 新增 id 35 覆盖派发组平台但用户明确要求内联。

按该 spec `:207-210`，每条断言组合多个短语义锚点加一条禁止行为，不要求复现长句。

**`tests/lint-goal-command.test.mjs`**：

- 派发校验四种输入各一个用例；
- 同步 `:258` 的版本断言到 `0.6.0`；
- 同步 `:280-281` 的 eval id 断言到新的 id 集合；
- 新增派发表 `Last verified` 日期的同步断言，与现有 `platform-goal-facts.md` 日期断言（`:269`）同风格。

`tests/persist-goal-contract.test.mjs` 的 Trellis 契约 fixture（`:368-395`）需要补派发措辞，否则新校验会让该既有用例失败。这是本次改动的必然连带修改，不是范围外。

## 改动点 6：版本与元数据同步

版本 `0.5.0` → `0.6.0`，7 处：`SKILL.md:5`、`scripts/lint_goal_command.py:478-479`、`references/persistent-goal-contract.md:77`、`reports/creation-handoff.md:1,5`、`tests/persist-goal-contract.test.mjs:80`、`tests/lint-goal-command.test.mjs:258`。

`SKILL.md` 的 `Trellis adapter` 段（`:110-112`）补派发要求与内联例外一句；`Quality bar`（`:114-116`）追加两条拒收项，与 playbook 的 Anti-Patterns 对齐。`SKILL.md` 保持路由与最小工作流，判断细节留在 reference。

`agents/interface.yaml` 的 `default_prompt` 末句补派发要求。

frontmatter `version` 变更会让 docs catalog 漂移，`just ci` 的 `docs-check` 会报错，因此必须先跑 `just docs-sync`。

## 兼容性

| 场景                                 | 行为变化                                 |
| ------------------------------------ | ---------------------------------------- |
| 普通任务 goal                        | 无                                       |
| `.trellis/` 存在但非任务实施         | 无（双条件识别保住 eval 17）             |
| 派发组平台的 Trellis 实施 goal       | 新增三字段派发条款                       |
| 内联组平台或 `dispatch_mode: inline` | 无派发条款，保持内联形状                 |
| 已有的 Trellis `GOAL.md` 契约        | 重跑 linter 会报缺派发；属预期，需人工补 |

最后一行是唯一的破坏性变化：本次之前生成的 Trellis 契约在新 linter 下不再通过。可接受，因为那正是要修的缺陷；`reports/creation-handoff.md` 需明确记录。

## 回滚

全部改动在版本库内（`skills/` 已跟踪），`git checkout skills/developer-tools-integrations/goal-meta-skill/` 即可整体撤销。`docs/` 的 catalog 变更用 `just docs-sync` 重新生成。

## 风险

1. **派发条款是否真的提高执行 agent 的派发率，无法在本任务内证明。** 谓词匹配是机制层论证。观测方法：生成一份含派发条款的 Trellis `/goal`，在新会话执行，统计 `Task`/`Agent` 调用与主会话编辑数，与 `research/host-directive-and-breadcrumb-evidence.md` 的基线表对比。标为 hypothesis。
2. **派发事实表会随目标项目的 Trellis 版本漂移。** 用 `Last verified` 日期加侦察要求缓解，但表本身仍需定期复核。`SKILL.md` frontmatter 的 `review_cadence` 现为 `quarterly-or-on-platform-goal-change`，应扩到包含 Trellis 派发协议变更。
3. **linter 的语义锚点匹配可能漏判。** `DISPATCH_REQUIREMENT_PATTERNS` 是关键词匹配，用户若用别的说法表达派发（例如只写 agent 名不写动词）可能误报。缓解：锚点集合覆盖 agent 名本身，只要出现 `trellis-implement` 就算命中。
4. **内联豁免可能被滥用。** 文本里出现 `trellis-before-dev` 就豁免，理论上可被用来绕过校验。可接受：linter 是起草辅助，不是安全边界，且滥用者就是起草者本人。
