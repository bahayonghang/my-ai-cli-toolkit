# Optimize agents-md-improver for GPT-5.6

## Goal

把 `skills/developer-tools-integrations/agents-md-improver` 从“能完成基本
AGENTS/code-map 审计，但 Codex 发现语义过时、入口过重、缺少回归证据”的
skill，提升为准确、精简、可复验的 Production 包：它必须识别真实的 Codex
指令链，按用户授权选择报告或修改，区分行为指导与导航地图的创建条件，并用
触发、输出、跨平台和共享模板门禁证明优化不是单纯改写文案。

## User Value

- 审计结果反映 Codex 真正会加载的文件，而不是漏掉
  `AGENTS.override.md`、fallback 文件或 CWD 边界的静态目录猜测。
- 广义“审计/优化”仍保持 report-first；已经批准的方案或明确的小改可以直接
  执行，不再增加无意义的确认轮次。
- 复杂目录只需要导航时可以只创建 `code_map.md`，不会因为有 manifest/命令
  就自动增加一个长期占用上下文的 AGENTS 层。
- 后续 description、模板或报告格式变更有可复现的 near-neighbor、输出质量和
  共享模板回归证据。

## Confirmed Facts

- 当前版本为 `1.1.0`，仓库 `scripts/check.py` 通过且无 warning。
- Yao Production 资源门禁失败：estimated initial load `2890 > 1000`，其中
  `SKILL.md` body 约 2,802 tokens；references 均被引用，问题在入口正文。
- Yao `validate_skill.py` 失败：`agents/interface.yaml` 缺 compatibility、
  activation、execution、trust 和 degradation 契约。
- Skill IR schema 验证通过，但把当前包识别为 `scaffold`、0 targets、仅一个
  description trigger sample；skill 没有 evals、tests 或 manifest。
- 当前发现命令只找 `AGENTS.md`/`code_map.md`；没有
  `AGENTS.override.md`、配置的 fallback filenames、one-file-per-directory
  选择或 `project_doc_max_bytes` 检查。
- 当前正文与模板把 repo skill 路径写成 `.codex/skills`；OpenAI 当前官方
  文档使用 `.agents/skills`，而 `.codex/agents` 仍是项目 native subagent 路径。
- 两个 improver 的 fenced `code_map.md` 模板正文当前一致，但没有 CI parity
  test；共享契约只能靠人工记忆。
- 2026-07-08 任务曾决定不增加 Codex semantics reference；当前官方行为包含
  overrides、fallbacks、CWD-bound discovery、32 KiB 默认预算和新 skill roots，
  原决策已不再成立。
- OpenAI 当前 GPT-5.6 提示词指南要求 outcome-first、每条指令只写一次、明确
  autonomy/approval、tool routing、evidence 和 stop conditions，并用代表性 eval
  逐项验证精简。官方来源和本次提炼保存在 `research/openai-official-guidance.md`。

## Operating Mode

`Production`。该 skill 会跨仓库复用、允许 implicit invocation、与多个 skill
存在路由邻域，并输出用户可见的审计/修改结果；但它没有高权限脚本、远程写入、
合规或发布职责，不升级为 Governed。

## Requirements

### R1 - 对齐当前 Codex 指令发现语义（P1）

- 审计必须识别 global/project 的 `AGENTS.override.md`、`AGENTS.md` 与配置的
  `project_doc_fallback_filenames`，并说明每层实际选中的文件和被遮蔽候选。
- 报告必须绑定 launch CWD：指令链从 project root 走到 CWD、每目录最多一个、
  root-to-CWD 合并，不能把所有 descendant 文件都描述为当前 session 已加载。
- 检查空文件与 `project_doc_max_bytes` 截断风险；无法获得 effective config 时
  标记 `missing evidence`，不能假设默认值就是当前值。
- global Codex home 默认只读/不改；用户明确要求前不得写
  `CODEX_HOME`/`~/.codex`。
- 增加按需 Codex semantics reference，包含
  `Last verified: 2026-07-22` 和官方 URL；正文只保留影响分支选择的摘要。

### R2 - 按 GPT-5.6 指南收紧入口与授权边界（P1）

- `SKILL.md` 只保留 owned job、intent 分类、核心 workflow、success/output
  contract、工具/证据规则和 stop rules；每条约束只陈述一次。
- broad audit/optimize/plan 默认 report-first 且不写；approved plan 或明确的
  scoped change/fix 直接修改并做非破坏性验证。
- fully specified trivial edit 不应被 implicit description 强制路由；用户明确
  调用 skill 时走 fast path，不生成完整审计报告。
- external/destructive/user-global/costly/material scope expansion 继续要求确认。
- 不在 skill 中 pin `gpt-5.6`、reasoning effort、Pro 或 PTC；这里只吸收提示词
  方法，保持 skill 对后续模型兼容。
- default Production 1000-token resource gate 必须通过；不得用提高 ceiling 掩盖
  回归。

### R3 - 分开判断行为指导与导航地图（P1）

- 新建/保留 nested AGENTS 的最低条件是存在持久、非显然、局部的行为、命令、
  安全、ownership 或 override 需求；目录复杂度或文件数量不能单独满足条件。
- local `code_map.md` 使用独立的 navigation/routing 证据；允许“只建 map、不建
  AGENTS”。
- 每个候选都返回 `AGENTS` 决策、`code_map` 决策、证据和 no-create 理由，
  不能用一个总分替代最低条件。
- `AGENTS.override.md` 默认只审计已有文件；除非用户明确需要临时/强覆盖语义，
  不主动新建 override 文件。

### R4 - 建立证据优先、可缩放的输出合同（P1）

- audit 输出先列 severity 排序的 findings，每项含文件/作用域、事实证据、影响、
  proposed change 和 confidence/missing evidence。
- 多层仓库增加 effective instruction-chain 与 shadowed-candidate 视图；没有该
  情况时不输出空表。
- 需要修改的文件给出 proposed diff；报告模板不能再只承诺 diff 而不提供位置。
- after-edit summary 包含 changed files、behavioral outcome、passed/failed/skipped
  checks 和 remaining risks。
- 不把平均分当主要结论；保留分数时必须可追溯到具体证据与硬门槛。

### R5 - 跨平台、可验证的发现与模板行为（P1）

- 用 structured Glob/Read 或跨 PowerShell/Git Bash 的 `rg --files --hidden`
  discovery contract 替换 POSIX-only `find`；更新 `allowed-tools` 与目录级
  AGENTS 表格的目标行。
- repo skill 路径统一为 `.agents/skills`；保留准确的 `.codex/agents` 描述。
- templates 只保留 evidence-backed slots/conditional examples，删除与 skill 自身
  “不要写 generic advice”相冲突的默认填充。
- 共享 `code_map.md` fenced blocks 继续与 `claude-md-improver` byte-identical；
  新增 deterministic parity test。只有共享 block 真需变化时才改 sibling。

### R6 - Production 路由与输出评测（P1）

- 新增 repo-schema `evals/evals.json`，覆盖 AGENTS audit/update positives，以及
  至少两个 routing negatives：`claude-md-improver`、
  `codex-workflow-recommender`、trivial edit、ordinary docs/code review 中至少两类。
- task-local trigger cases 与专用 semantic config 覆盖 should-trigger、
  should-not-trigger、near-neighbor 和独立 holdout；最终 description 对 dev/holdout
  无未解释 FP/FN。
- 因 `trigger_eval.py` 不能正确解析 folded YAML description，评测使用从最终
  frontmatter 解析出的纯文本 fixture；不得把 `description: >-` 当真实输入。
- 增加小型 file-backed output eval，至少证明 effective-chain、navigation-only
  candidate、explicit-edit fast path 和 near-neighbor boundary 的 skill-guided 输出
  优于 baseline。
- recorded fixtures、provider run、human blind review、telemetry 分开标注；未实际
  运行的证据写 `missing evidence`。

### R7 - 对齐包元数据与 Production 证据（P2）

- `agents/interface.yaml` 对齐 actual OpenAI/Claude/generic activation、inline
  execution、local trust、remote inline forbid 和 degradation 行为，并通过 Yao
  validate。
- 增加轻量 Production lifecycle metadata，使 Skill IR 能识别 owner、review
  cadence、targets 和 maturity；不得套用 Governed 的高权限字段。
- 生成有实际用途的 prompt/output risk/quality evidence；不创建无人消费的装饰
  目录或报告。
- version 按 additive behavior/routing improvement 升为 `1.2.0`，并通过
  `just docs-sync` 同步公开目录。

### R8 - 完整验证与范围控制（P1）

- 执行 repo validator、targeted Node contract tests、docs sync/check、node-test、
  full `just ci` 和 final diff/status review。
- 执行 Yao Production 的 validate/resource、Skill IR/compiler、trigger/output、
  conformance、trust、Skill Atlas、registry/package/install/upgrade 与 Review Studio
  gate；不适用或依赖外部凭据的项目必须明确处置，不能伪造 pass。
- task research 保留 current/final description、official-source digest、gate outputs
  和 review notes；目标包只保留未来运行真正消费的资源。

## Constraints

- 主要源码范围是 `skills/developer-tools-integrations/agents-md-improver/`。
- 可改 `skills/developer-tools-integrations/AGENTS.md` 中与本 skill tool/eval 状态
  直接相关的行，以及 `just docs-sync` 生成的中英文目录页。
- `claude-md-improver` 默认只读；共享 code-map block 发生必要变化时才同步修改，
  不借机优化其余内容。
- 不修改 yao-meta 的 evaluator/frontmatter 解析器；工具限制写入任务证据。
- 不清理 `codex-workflow-recommender`、类别 inventory 或其他已知无关 drift。
- 不写用户全局 AGENTS/config，不安装新生产依赖，不执行外部写入。
- 官方网页是设计期依据，不成为 skill 运行时网络依赖。

## Acceptance Criteria

- [x] fixture 证明 override/AGENTS/fallback 每目录只选一个，root-to-CWD 指令链和
      budget/shadow 状态准确；缺 config 时输出 `missing evidence`。
- [x] `.codex/skills` 不再出现在目标 skill 的 active guidance/templates 中；
      `.agents/skills` 与 `.codex/agents` 角色正确。
- [x] broad audit 保持 report-first；approved/scoped change 直接执行；trivial
      implicit case 不误触发，explicit invocation 有 fast path。
- [x] nested AGENTS 和 local code_map 独立决策；navigation-only fixture 不新增
      行为指导文件。
- [x] audit report 含 prioritized evidence/findings 和需要时的 proposed diff；
      update summary 如实区分 passed/failed/skipped/missing evidence。
- [x] default `resource_boundary_check.py` 通过 Production 1000-token ceiling，
      无 unused resource directory。
- [x] `validate_skill.py` 通过；Skill IR 显示 `production` 和真实 adapter targets。
- [x] repo `evals/evals.json` 有 positives 和至少两个 routing negatives；task
      trigger dev/holdout 无未解释 FP/FN。
- [x] output eval 的 with-skill pass rate 高于 baseline；fixture 不冒充 model 或
      human evidence。
- [x] shared code-map fenced blocks parity test 通过，并锁住 stale skill path 与
      override discovery 回归。
- [x] version/docs/resources 同步；`python scripts/check.py <skill-dir>`、targeted
      tests、`just node-test`、`just docs-check`、`just ci`、`git diff --check` 通过。
- [x] Yao Production gate disposition 完整；所有 unavailable/not-applicable 证据有
      具体原因和 `missing evidence`，无虚构结论。
- [x] final diff 只包含目标 skill、必要 co-owned/generated 文件与本任务证据。

## Out of Scope

- 优化 `claude-md-improver` 的加载模型、正文、description 或 evals。
- 重写 `codex-workflow-recommender`，即使审计发现它也有旧路径。
- 修改 Codex runtime、`project_doc_max_bytes`、fallback config 或用户全局文件。
- 把 `code_map.md` 变成 OpenAI 官方标准；它仍是本仓库 skill 的导航约定。
- 为该 skill 增加执行脚本、网络依赖、PTC、多 agent 或 Pro-mode 依赖。
- provider-backed GPT-5.6 benchmark、真实遥测或外部人工审批；不可用时保持
  `missing evidence`。

## Planning Decision

采用“准确语义 + lean entrypoint + evidence package”的一次性 1.2.0 优化，不拆
parent/child。核心 prompt、rubric、output contract、evals 和 shared-template test
互相依赖，同一任务内可以按门禁逐步验证和回滚。

## Open Questions

无阻塞产品问题。任务保持 `planning`；创建任务不代表授权实施，只有用户审阅
本 PRD、`design.md`、`implement.md` 并明确批准后才能执行 `task.py start`。
