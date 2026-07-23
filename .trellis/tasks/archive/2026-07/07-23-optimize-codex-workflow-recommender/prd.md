# Optimize Codex workflow recommender

## Goal

把 `skills/developer-tools-integrations/codex-workflow-recommender` 从“能枚举
Codex 配置选项，但存在发现路径过时、入口过重、推荐优先级静态且缺少回归证据”
的说明型 skill，提升为准确、精简、可验证的 Production 包。它应基于仓库、
当前 Codex 运行表面和权限边界，推荐最小且高价值的工作流改进；允许明确建议
“无需改动”，并始终保持只读审阅边界。

## User Value

- 不再把 repo skill 推荐到 Codex 当前不会发现的 `.codex/skills` 路径。
- 不会因为检测到某个技术栈就机械推荐 MCP、plugin、subagent 或 hook。
- 能区分 CLI、IDE、桌面 App 与 ChatGPT web 的能力和配置作用域。
- 推荐包含证据、缺口、权限、前置条件、验证和回滚，而不是功能目录。
- 后续 Codex 表面变化可通过日期化事实源、触发 eval、输出 eval 和契约测试发现。

## Confirmed Facts

- 当前版本为 `1.0.0`，仓库 `scripts/check.py` 通过且无 warning。
- Yao Production 资源门禁失败：estimated initial load `2079 > 1000`；
  `SKILL.md` 约 8,316 chars，5 份 references 约 4,512 deferred tokens。
- Yao `validate_skill.py` 失败：缺少 `agents/interface.yaml`；governance score
  为 `20`、band 为 `draft`，且没有 `manifest.json`。
- 当前包没有 `evals/`、`tests/` 或 `reports/`；目录级规范已把缺少 evals 记录为
  `codex-workflow-recommender` 的 known gap。
- `SKILL.md:70,117-119` 与 `references/skills-reference.md:11-12` 把 repo/user
  skill roots 写成 `.codex/skills` / `~/.codex/skills`。2026-07-23 获取的官方
  Build skills 文档使用 repo `.agents/skills`、user `~/.agents/skills`；
  `.codex/agents` / `~/.codex/agents` 仍是 native subagent 路径。
- `SKILL.md:25` 的 `Bash(Get-ChildItem *)`、`Bash(Get-Content *)`、
  `Bash(Select-String *)` 对 Claude Code 的 Bash 工具不可达；目录级规范明确要求
  `allowed-tools` 只声明可执行的真实工具。
- `references/subagent-templates.md:36` 使用 `nickname_candidates`，该字段不在
  当前官方 standalone custom agent schema 的 required 或 supported config keys
  中，不能作为可复制模板发布。
- 当前本机 `codex-cli 0.145.0` 支持 `mcp`、`plugin`、`doctor`、`features`；
  `codex plugin list` 默认列出 marketplace 视图并标识 installed/enabled，
  `--available --json` 才显式包含未安装项。
- 当前本机 `codex mcp list --json` 可同时出现直接配置与 plugin 提供的 MCP，
  而 `codex doctor --json` 的 direct config 计数不同。只写“configured or absent”
  会丢失 provenance，并可能把 plugin capability 误判为重复配置需求。
- 官方 Customization/Best practices 当前区分 prompt/thread、`AGENTS.md`、
  memories、skills、plugins、MCP、subagents、hooks、automations、config 与不同
  产品 surfaces；当前 skill 声称覆盖 CLI/App，却没有 surface 选择或
  memories/rules/automations 分支，并把 OMX 作为固定报告项。
- 官方当前建议优先复用已存在的 plugin，再创建 skill；当前
  `Safe Implementation Order` 是固定的 AGENTS -> skill/subagent -> MCP/plugin，
  不能随已安装能力、权限和依赖关系调整。

## Operating Mode

`Production`。该 skill 会在多个仓库和 Codex 环境复用，错误路由或错误推荐会
浪费配置成本并扩大权限，但它自身严格只读、没有高权限脚本、生产变更或合规
职责，不升级为 Library/Governed。

## Requirements

### R1 - 校准当前 Codex 能力与发现语义（P1）

- repo/user skill roots 使用 `.agents/skills` / `~/.agents/skills`，native
  subagent roots 保持 `.codex/agents` / `~/.codex/agents`。
- 区分 prompt/thread、AGENTS、memories、skills、plugins、MCP/connectors、
  subagents、hooks、automations、config/profiles/rules，以及 CLI、IDE、桌面 App、
  ChatGPT web/cloud 的作用域。
- 增加按需加载的 dated Codex surface reference，记录 `Last verified`、官方 URL、
  CLI-probed facts 与不确定性；入口正文只保留影响分支选择的事实。
- 当前 CLI help 优先于记忆；缺失、旧版本或 surface-specific 事实必须标为
  `missing evidence`，不能借用其他 CLI 或 surface 的能力。

### R2 - 建立证据和风险驱动的推荐决策（P1）

- 先判断是否需要任何持久改动；`no change` 必须是合法且可解释的结果。
- 每个候选使用同一决策合同：observed evidence、owned job、scope、existing
  capability、impact、effort、permission/data risk、prerequisites、confidence、
  verification、rollback/defer reason。
- 选择最小表面：一次性约束留在 prompt/thread，持久 repo 规则用 AGENTS，
  重复流程用 skill，外部数据/动作用 MCP/connector，可独立委派的工作才用
  subagent，机械生命周期控制才用 hook，定时工作才用 automation，团队分发
  才用 plugin。
- 已安装且适配的 plugin/native capability 优先于重复创建 skill 或 raw MCP；
  静态 category order 改为依赖、可逆性和权限驱动的实施顺序。
- 技术栈或依赖只能成为调查信号，不能单独触发 MCP/plugin 推荐。

### R3 - 收紧发现、provenance 与隐私边界（P1）

- 用 structured Read/Glob/Grep 或可达的 `rg`/`codex` 命令替换无效
  PowerShell-in-Bash 声明；不在一个示例中混合不兼容 shell。
- inventory 必须区分 direct config、project config、user config、built-in、
  plugin-provided、installed/enabled、available/uninstalled 与 unsupported。
- `codex doctor`、config、MCP/plugin 列表只提取完成推荐所需的最小字段；
  不复制 auth、provider URL、tokens、环境变量值或原始诊断输出到报告。
- project config、hooks、MCP 和 subagents 必须考虑 trusted project、managed
  requirements/policy 与 user-global 边界；任何外部写入或持久配置仍需单独授权。

### R4 - 精简入口并重构输出合同（P1）

- `SKILL.md` 只保留 owned job、exclusions、read-only authorization、核心
  discovery/decision flow、success/output contract、reference routing 和 stop rules。
- default Production 1000-token resource gate 必须通过；不得提高 ceiling 掩盖
  入口膨胀。
- 输出以 outcome 和 prioritized recommendation table 开始；仅呈现有证据的
  categories，不生成空目录，也不强制 `Want me to implement...` 标题。
- 每条推荐必须可追溯到 evidence，并含 unknowns/missing evidence、风险、
  verification 和 rollback；最后给出需用户单独批准的可执行选项。
- 如果用户只问一个 surface，输出可缩窄，不加载或报告无关 references。

### R5 - 明确近邻路由与模板正确性（P1）

- direct AGENTS/code-map edits 路由到 `agents-md-improver`；Codex 官方事实问答
  路由到 `openai-docs`；skill package 审阅路由到 `agent-skill-review`；动态多阶段
  workflow 实现路由到 `codex-dynamic-workflows`；目标 skill 只拥有 repo-grounded
  Codex workflow recommendation/audit。
- description 保留中英文高信号触发词，加入 near-neighbor exclusions，避免把
  “配置某个 MCP”误解为已授权执行配置。
- subagent、skill、plugin、MCP、hook references 中的命令、路径和 schema 与
  当前官方/CLI 证据一致；示例不包含未验证字段或占位 plugin 名称的事实断言。

### R6 - 增加 Production 路由、输出与契约证据（P1）

- 新增 repo schema `evals/evals.json`，至少覆盖 4 个 positives、4 个 negatives，
  negatives 包括 AGENTS direct edit、docs-only Codex question、dynamic workflow、
  ordinary tooling/code review 中至少三类。
- 新增 `file-backed fixture` 输出 eval，覆盖正确 skill roots、installed plugin vs
  raw MCP、MCP provenance、no-change、old/missing CLI 和 high-permission setup。
- with-skill assertion pass rate 必须高于 baseline；recorded fixtures、provider
  runs、human blind review、telemetry 分开标注，未运行项为 `missing evidence`。
- 新增 Node contract test，锁住 stale roots、unsupported subagent fields、
  reference reachability、JSON parseability、read-only contract 和 output schema。

### R7 - 对齐 Production 包元数据和发布门禁（P2）

- 新增 neutral `agents/interface.yaml`，对齐 read-only activation、inline
  execution、local trust、surface/version degradation 和 default prompt。
- 新增轻量 `manifest.json`，记录 owner、quarterly review cadence、Production
  maturity、context budget、target adapters、references/evals/tests/reports；不添加
  Governed 权限或公共 readiness 伪证据。
- version 按兼容性修复与新增决策/证据能力升为 `1.1.0`，运行 `just docs-sync`。
- 完成 Yao Production 的 Skill IR/compiler、trigger/output eval、conformance、
  trust、Skill Atlas、registry/package/install/upgrade/drift/Review Studio disposition；
  外部 provider/human/telemetry 证据保持 `missing evidence`。

### R8 - 范围与验证（P1）

- 源码默认只改目标 skill；只在 tool/eval/interface 状态变化时更新
  `skills/developer-tools-integrations/AGENTS.md` 对应行。
- generated docs 只由 `just docs-sync` 更新；不借机清理相邻 skill 或现有 Trellis
  框架改动。
- 运行 targeted validator/test，再运行 `just skills-check`、`just node-test`、
  `just docs-check`、`just ci`、`git diff --check` 和 full status/diff review。

## Constraints

- 目标 skill 继续只读；不得安装/移除 plugin、添加/移除 MCP、写 user/global
  config、运行外部副作用或修改仓库产品代码。
- 不新增生产依赖或自动配置脚本；确定性测试可用现有 Node/Python 工具链。
- 官方文档是设计和 dated reference 依据，不强制成为每次运行的网络依赖。
- 不把 OMX 删除为“无效”；仅从固定核心报告面降为检测到或用户要求时的可选
  extension。
- 保留用户现有 17 个 Trellis 框架改动及未跟踪 agent 模板，不纳入本任务。

## Acceptance Criteria

- [x] active guidance 和 examples 不再把 `.codex/skills` / `~/.codex/skills`
      当作当前 Codex skill roots；`.agents/skills` 与 `.codex/agents` 角色正确。
- [x] 当前官方/CLI 事实集中在 dated surface reference；过时 CLI 或无法确认的
      surface 输出 `missing evidence`。
- [x] recommendation engine 可以输出 no-change，并按 evidence、existing
      capability、risk、dependency 选择最小表面和实施顺序。
- [x] inventory 区分 direct/plugin-provided MCP 与 installed/available plugin，
      不泄露 raw doctor/config/auth/provider/env evidence。
- [x] invalid PowerShell-in-Bash allowed-tools 和 `nickname_candidates` 模板被移除；
      discovery/examples 在声明的工具表面可达。
- [x] `SKILL.md` 通过默认 Production 1000-token gate，无 unused references。
- [x] `agents/interface.yaml`、Production manifest、Skill IR 与 target adapters 对齐，
      Yao validate 无 failure。
- [x] trigger eval 覆盖 positives/near-neighbor negatives，无未解释 FP/FN。
- [x] output eval 覆盖 6 个核心场景且 with-skill 优于 baseline；fixture 不冒充
      provider/model/human/telemetry evidence。
- [x] contract tests 锁住 roots、schema、read-only/output/reference contracts。
- [x] version/docs/resource inventory 同步；targeted checks、`just node-test`、
      `just docs-check`、`just ci` 与 `git diff --check` 通过。
- [x] final diff 只含目标包、必要 category guidance/generated docs 和本任务证据；
      所有 unavailable/not-applicable gates 有明确处置。

## Out of Scope

- 实际安装/启用/删除 plugin、MCP、hook、automation、skill 或 subagent。
- 修改用户 `~/.codex`、repo `.codex`、`.agents` activation state 或 managed policy。
- 重写 `agents-md-improver`、`goal-meta-skill`、`codex-dynamic-workflows`、
  `openai-docs` 或其他近邻 skill。
- 新建推荐执行器、自动修改器、网络 crawler 或长期 telemetry collector。
- provider-backed model benchmark、真实用户 telemetry 或代替用户完成 blind
  review；不可用时记录 `missing evidence`。

## Planning Decision

采用一次 `1.1.0` Production 优化，不拆 parent/child。入口、事实源、决策模型、
references、evals 和契约测试互相约束，分拆会导致中间状态仍发布错误路径或无法
验证的推荐合同。

## Planning Status

需求已收敛，无阻塞产品问题。任务保持 `planning`；创建任务不代表授权实施。
只有用户审阅本 PRD、`design.md`、`implement.md` 并明确批准后，才能运行
`task.py start`。
