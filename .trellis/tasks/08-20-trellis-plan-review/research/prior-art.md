# 先行研究：规划 / spec 审阅类 skill

检索日期 2026-08-20。渠道：SkillsMP 目录（`search_skillsmp.py`）、Exa 网页检索。
`npx skills find` 未使用（Windows 上 Python subprocess 直呼 `npx` 会失败）。

指标语义：`repo_stars` 是所属 GitHub 仓库的 star 数，不是该 skill 的安装量、评分或质量分。

## 目录检索结果

查询 `trellis task planning artifacts review`（9 条命中）：
`mindfold-ai/trellis` 已发布 `trellis-continue`、`trellis-brainstorm`、`trellis-before-dev`、
`trellis-check` 等 skill（repo_stars 13954），其中**没有规划产物审阅 skill**。
Trellis 的 `trellis-check` 面向代码写完后的质量核查，不审 prd / design / implement 本身。

查询 `plan review verify claims against codebase independent reviewer`（16 条命中）：
命中的是 `executing-plans`、`plan-update`、`plan-canvas`、`blueprint`、`plan-orchestrate` 等
**生成或执行**计划的 skill，没有以审阅规划产物为唯一职责的条目。

结论：目标位置在目录中为空白。

## 采纳的机制（keep / adapt）

| 来源                                                                | 机制                                                                                                                                 | 本 skill 的处理                                                                     |
| ------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------- |
| `degrammer/seldon` `skills/seldon`                                  | 独立评审者：用 Glob / Grep / Read 核对规划断言与实际代码；结论三档；每条问题带 severity + evidence + `path:line`；无法本地核实就明说 | 采纳。结论三档改为中文取值；证据字段设为必填                                        |
| `shinpr/claude-code-workflows` `agents/code-verifier`               | 按断言类型分别取证（存在性 / 行为 / 标识符）；反向覆盖（代码里有而文档没写）                                                         | 采纳并扩一类「数量断言」。反向覆盖改造成 Pass 2 的反向枚举与 Pass 7 的漂移检查      |
| `nikhilsitaram/claude-caliper` `skills/plan-review`                 | 两段式：先跑确定性 schema 校验，失败就停，不浪费 LLM 评审                                                                            | 采纳为 Pass 0 脚本 + Pass 1–7 判断层                                                |
| `b-mendoza/agent-skills` `validate-implementation-plan`             | 先抽取需求基线，再以基线逐项审 traceability / YAGNI / assumptions；标注而不改写                                                      | 采纳「先建基线再逐项审」的顺序与「只标注不改写」。不采纳其 6 个 subagent 的编排结构 |
| `povvo/claudikins-kernel`、`svenroth-ai/shipwright` `spec-reviewer` | 硬门：REJECT 必须给出 spec 行号引用，否则不可行动；配一张「合理化借口 vs 事实」对照表                                                | 采纳「无引用不出结论」。对照表改写成规划审阅场景的版本                              |
| `deepeshbodh/human-in-loop` `validation-plan-artifacts`             | 检查表按项给 severity；确定性扫描未解决标记（`[TBD]` `[TODO]` `[PLACEHOLDER]`）                                                      | 采纳。标记扫描进 Pass 0，并加 Trellis 特有的 `*.jsonl` `_example` 占位行            |
| `schreyack/tim` `ai-developer-ready-checklist`                      | 幻觉机会（引用的 API / 文件是否真存在）、可度量的成功判据、精确到可复制的测试命令、回滚路径                                          | 采纳。分别落到 Pass 1、Pass 6 与产物必需小节                                        |
| `genkovich/sdd` `skills/review`                                     | 丢弃无引用的发现；端到端追溯整条 AC 链，不只看 diff 声称覆盖的那几条                                                                 | 采纳。追溯改为子句级                                                                |
| `codagent-ai/agent-skills` `review-spec`                            | 接受需求本身，只报产物之间的冲突，不评判产品决策；不产出「改进版」                                                                   | 采纳为硬门与路由边界                                                                |
| `bdfinst/agentic-dev-team` `spec-compliance-review`                 | 规划偏离与范围越界分开归类，各自 severity 不同                                                                                       | 采纳到严重度三档的判定规则                                                          |

方法文章：

- NewPrompt《How to Find Gaps in an AI-Generated Plan Before You Use It》（2026-07-08）——
  「AI 审 AI 的规划不是独立第二意见，双方共享盲区；输出是待分诊列表不是批准」。采纳为盲区声明。
- Metacto《AI-Generated Code Review Checklist & Standards》（2026-07-08）——
  requirement fidelity 与 real-APIs-only 两条标准。采纳到 Pass 1 与 Pass 3。

## 拒绝的机制（reject）

- 多 subagent 编排（`validate-implementation-plan`）：本仓库其余审阅 skill 为单 agent 顺序执行；
  并行会让不同 agent 报出的证据行号不一致。
- 一致性百分比 / consistency score（`code-verifier`）：分母是「抽取到的可核断言数」，
  该数字本身由模型决定，分数会随抽取粒度浮动，不构成可比指标。
- 自动改写或产出修订版规划：多个同类 skill 一致禁止，理由相同——改写会产生一份带新盲区的规划。
- JSON-only 输出（多个 spec-reviewer）：本仓库审阅类 skill 的输出面向人阅读，
  机械结果已由 Pass 0 脚本的 JSON 承担。

## 本 skill 的原创部分

以下四条来自 `08-20-settings-font-picker-repaint` 的实测审阅，在采集到的先行技术中没有对应物：

1. **AC 子句级追溯**：把一条 AC 拆到分句，每个子句都要同时命中一条需求与一处 design 机制。
   该任务的 AC2 与 AC3 各含两个子句，每条都是一半有机制一半没有；AC 级检查会判为全部覆盖。
2. **Confirmed facts 的观察 / 推论分离 + 反向枚举**：Trellis PRD 的事实小节里，
   观察为真而附带推论为假是可复现的形态。反向枚举被改动代码路径实际更新的全部状态，
   而不是只核对文档点名的那几项。
3. **量化论证复核含单位来源**：重算算式的同时核对 `rem` 根值是否可变、`box-sizing` 取值、
   时钟单位；并判断结论是否真由该算式支撑。
4. **实现漂移检查（Pass 7）**：Trellis 任务目录同时提供计划侧（design.md 改动清单）与
   实际侧（git），可以直接比对并标出未申报的计划外机制。该任务有三处。

## missing evidence

- 未运行 `npx skills find`，目录侧仅有 SkillsMP 一个来源。
- 未安装或执行任何候选 skill 的代码，判断基于其公开 `SKILL.md` / agent 定义文本。
- 各候选的维护状态、license、权限面未逐个核查，本次只做机制层面的取舍。
- 未做人工盲评或提供方模型实跑，触发与输出质量证据限于本仓库 `evals/evals.json` 的人工评审资产。
