# 完善 Goal Prompt 的提交归档闭环

## Goal

让 `goal-meta-skill` 在生成 Trellis 实施 Prompt 时，把两项默认执行策略写成不可省略、可校验的合同：首句显式声明优先使用 subagents 的默认开关；任务完成后先提交该任务的相关产品改动和当前任务规划产物，再归档该任务。生成结果不得把 subagent 策略埋在长 Prompt 后部，也不得因工作树中存在其他未跟踪任务目录而再次把取舍抛给用户或静默纳入无关任务。

## Background

- 用户提供的失败场景中，工作树同时存在已跟踪修改和大量未跟踪规划产物；期望行为是现在不提前提交，待任务完成后提交相关改动和本任务，再归档任务。
- 当前 `SKILL.md` 的 Trellis adapter 只概括“先提交该任务产品改动，再 archive”，没有要求在归档前提交当前任务规划产物。
- 当前 `references/trellis-goal-cadence.md` 的迭代模板和 `Commit then archive` 章节同样只要求提交产品文件；归档提交由 `task.py archive` 单独拥有。
- 当前 linter 只强制 Trellis 实施 Prompt 的派发或 inline 形状，不能拒绝遗漏“当前任务规划产物提交”的 Prompt。
- 仓库历史已验证三阶段本地闭环可行：产品改动提交、当前任务规划提交、任务归档提交相互分离；`.trellis/tasks/` 在本仓库不被忽略，归档命令会为目录移动创建独立提交。
- 用户补充的 Cursor Prompt 已在 `约束`、`迭代策略` 和 `完成条件` 中要求 `trellis-implement` / `trellis-check`，但首句只描述任务顺序，不能让读者立即识别“优先使用 subagents”是默认执行策略。
- 当前 Trellis adapter 已区分派发组、显式 inline 请求和平台/项目的 inline 能力事实；新增开关必须保留该能力边界，而不能声称不支持派发的平台也能使用 subagents。

## Requirements

- R1 — Trellis 实施 Prompt 必须在 `迭代策略` 和 `完成条件` 中表达固定顺序：完成并验证一个可独立验收的当前任务；提交该任务相关产品改动和当前任务规划产物；确认二者均已进入版本历史；再对具体任务目录运行 `task.py archive`。
- R2 — “当前任务规划产物”仅指生成 Prompt 所绑定的具体 Trellis 任务目录，包括已有的 `task.json`、`prd.md`、可选 `design.md`、`implement.md`、`research/` 与上下文清单。不得把其他活动任务、未跟踪任务目录或范围外脏文件纳入提交。
- R3 — 产品改动与当前任务规划产物属于同一次任务收尾，可按仓库提交规范放入一个或多个语义清晰的 Conventional Commits；归档产生的目录移动/状态更新仍由后续 `task.py archive` 的独立提交拥有。不得 push、amend 或使用 `git add -f .trellis/`。
- R4 — 子任务逐个执行 R1–R3。父任务只有在所有子任务已归档、父任务自身相关改动和规划产物已提交、且命名发布门通过后才能归档。
- R5 — 该不变量必须同步到根 `SKILL.md`、host-facing `agents/interface.yaml`、`references/trellis-goal-cadence.md`、持久化 Trellis adapter、确定性 linter 与包契约测试，避免只改示例文案。
- R6 — 增加截图同构的行为 fixture：工作树含当前任务与大量无关未跟踪规划目录时，生成 Prompt 明确延后到完成时提交当前任务相关改动和当前任务规划，再归档；无关规划目录保持排除。
- R7 — 以补丁版本发布该行为修复，并同步版本断言、creation handoff 和生成的 docs catalog。
- R8 — outcome 明确为 Trellis task/child implementation 时，生成的 `/goal` 第一条陈述必须写明 `优先使用 subagents`，并把开关状态放在同一句中；默认状态为开启，不得仅在后文通过 `trellis-implement` / `trellis-check` 名称暗示。
- R9 — 用户没有提及 subagents、只说“按默认”或提供普通 Trellis 实施要求时，开关保持开启。只有用户明确要求“不使用 subagents”“主会话内联实施”或等价表达时，偏好开关才关闭；模糊、缺省或未提及不构成关闭授权。
- R10 — 目标项目的 `.trellis/workflow.md`、平台能力或 Codex `dispatch_mode: inline` 明确证明无法派发时，可以使用 inline 技术降级，但必须在首句标明原因；该降级是能力事实，不伪装成用户关闭开关。若用户明确要求必须使用 subagents 而目标不支持，则停止并报告冲突。
- R11 — 默认开启、用户明确关闭和技术降级三种首句状态必须与后续 `迭代策略`、`约束`、`完成条件` 一致；不得出现首句说优先使用 subagents、后文却无派发，或首句关闭、后文仍要求派发的自相矛盾 Prompt。

## Constraints

- 保留 `compile → lint → present → stop` 审阅门；skill 仍只生成、校验、展示 Prompt，不创建或激活 Goal，不执行生成 Prompt 内的提交或归档。
- 仅为 outcome 明确是 Trellis task/child implementation 的 Prompt 注入该闭环；普通代码、文档或非 Trellis Goal 不受影响。
- 不修改 `.trellis/workflow.md`、`task.py archive`、自动提交实现或平台 Goal 生命周期事实。
- 不提交或归档其他任务，不 push，不扩展到公开发布。
- 用户原文“只有具体说明不明才会放弃使用”按上下文解释为“只有明确说明不使用才会关闭偏好开关”；平台不支持派发时仍保留可解释的技术降级。

## Acceptance Criteria

- [ ] AC1 — 根 skill 与 host interface 明确要求 Trellis Prompt 在归档前提交当前任务相关产品改动和当前任务规划产物，同时排除无关任务与范围外脏文件。
- [ ] AC2 — Trellis cadence reference 定义当前任务规划产物的范围、允许的语义提交拆分、归档提交边界、子任务循环和父任务发布门。
- [ ] AC3 — linter 对遗漏当前任务规划产物提交的 Trellis inline/contract Prompt 报错；含完整闭环的派发模式和 inline 模式 Prompt 通过；非 Trellis Prompt 不误报。
- [ ] AC4 — 单元测试覆盖缺失、通过、inline 例外、非 Trellis 负路由与包内多层契约同步；行为 eval 新增连续 ID 的截图同构 fixture。
- [ ] AC5 — 版本、creation handoff 和 docs catalog 保持同步，且不夸大静态 fixture 为 provider/human evidence。
- [ ] AC6 — 专项 Node 测试、`just skills-check`、`just python-check`、`just docs-check`、`just ci`、`git diff --check` 与 `task.py validate` 全部通过；未运行的 provider 实跑或人工评审标记为 `missing evidence`。
- [ ] AC7 — 本任务收尾时，先提交本任务相关 skill/docs 改动和 `.trellis/tasks/08-27-goal-prompt-submit-plan-archive/` 规划产物，再运行 `task.py archive`；最终不 push，且工作树不存在本任务遗留改动。
- [ ] AC8 — 默认 Trellis Prompt 的 `/goal` 首句明确出现“优先使用 subagents”及默认开启状态；明确 opt-out Prompt 的首句标记用户已关闭；能力受限 Prompt 的首句标记 inline 技术降级原因。
- [ ] AC9 — linter 拒绝首句缺少 subagents 开关、开关状态与后文派发策略矛盾、或把未提及误当作 opt-out 的 Trellis Prompt；合法默认派发、明确 opt-out、技术降级和非 Trellis Prompt 分别通过。
- [ ] AC10 — 行为 eval 覆盖用户提供的长 Cursor Prompt、默认开启、明确“不使用 subagents”和 inline 能力降级；recorded fixture 不宣称 provider 真实服从率。

## Out of Scope

- 自动执行生成的 `/goal`、提交或归档 payload。
- 改造 Trellis 的提交脚本、归档脚本、Git 忽略策略或全局工作流。
- 把所有未跟踪 `.trellis/tasks/` 目录视为当前任务产物。
- 强迫 inline-only 或不具备 agent 能力的平台虚构 subagent 派发。
- push、PR、Release 或远程发布。

## Technical Notes

- 这是边界明确的轻量行为修复，采用 PRD-only 规划；无需新增 `design.md` 或 `implement.md`。
- 预计版本从 `0.7.0` 调整为 `0.7.1`。
- Qiaomu generalization gate：将样例抽象为 Trellis adapter 的“首句声明默认执行策略”核心机制；用户长 Prompt 仅作为 eval fixture，并用 opt-out、inline 能力降级和非 Trellis 用例验证边界。
- 这是对现有 Trellis adapter 的定向修复，不是新 skill 或结构性重设计；外部 prior-art 搜索不适用，采用现有包契约、真实失败样例和仓库工作流作为证据。
- 静态 linter、recorded fixture 和本地 CI 只证明包契约；修复后的 provider 服从率、人工盲审与 telemetry 保持 `missing evidence`。
