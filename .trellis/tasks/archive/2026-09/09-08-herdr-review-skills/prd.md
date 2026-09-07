# Herdr 编排与 Codex 审查 skills

## Goal

为 Herdr 内运行的任意受支持 Agent 提供两个可组合的一方 skill：`herdr-orchestra` 负责启动和协调 worker，`codex-review` 经它创建 Codex 进程执行只读审查。以用户指定参考仓库为研究输入，用当前 Herdr 与 Codex 官方契约替代历史补丁。

## Background and confirmed facts

- 参考仓库为 `ref/repo/herdr-orchestra`，本地提交 `876af28f2f14d052cbf96fb666cbf5a439c046f2`，2026-07-03；其 README 声明基于旧 Windows preview 的 workaround，不能推广为当前 Herdr 行为。详见 `research/herdr-audit.md`。
- 仓库已有 `codex-bridge`：`skills/development-workflows/codex-bridge/SKILL.md:3` 定义文件 bundle 协作；新需求明确指定 Herdr pane/agent 通道，因此保留这个既有 skill 的范围。
- 当前本地第三方激活项 `.agents/skills/codex-review/SKILL.md:3` 包含自动 CHANGELOG；`skills/` 中尚无同名一方源包。源码创建不能证明运行时已加载新包。
- 本轮已核实 `HERDR_ENV=1`，Herdr/Codex help 可读取；没有创建 pane、启动付费 reviewer、修改 integration 或读取其他 Agent 的工作输出。
- 研究来源、版本、许可、候选取舍见 `research/herdr-audit.md`、`research/codex-review.md`、`research/prior-art-research.md`；研究事实与尚未执行的验收分开记录。

## Requirements

- R1：在 `skills/developer-tools-integrations/herdr-orchestra/` 创建 host-neutral 编排 skill，明确显式 Herdr 意图、环境检查、调用者上下文、最新 CLI 探测和 worker 权限边界。
- R2：编排使用 layout、pane、agent 各自的原生职责；从返回 JSON 取 ID，使用可用 shell pane，保留 cwd 与用户焦点，处理启动未就绪、blocked、unknown、timeout、prompt stalled 和不完整输出，不将状态静止当作任务成功。
- R3：在 `skills/development-workflows/codex-review/` 创建新源 skill。调用链必须为调用 Agent → codex-review → herdr-orchestra → 新的交互式 Codex reviewer；审查目标可为当前改动、显式 base/commit 或指定文件/计划。
- R4：reviewer 的项目访问为只读、审批策略明确、模型遵循用户或当前配置，不能自动 trust、提权、改文件、生成 CHANGELOG、提交或再次派生 reviewer。结果包含实际范围、证据定位、影响/触发条件和验证缺口；发起 Agent 核验后交付。
- R5：两个 skill 的 description、接口与回归样例必须覆盖彼此、官方 herdr、codex-bridge、普通 code-auditor/code-quality-review 的相邻路由。保留用户指定名称；明确本地第三方同名冲突而不自动替换安装。
- R6：按 qiaomu-meta 方法保存来源、keep/adapt/reject/invent、Skill IR、触发 smoke 与输出评估证据；遵循本仓库 frontmatter、neutral interface、evals 与 docs 约定，记录工具 schema 偏差。
- R7：文档列出 POSIX 与 PowerShell 参数传递方式及失败处理；不引入第三方依赖、控制服务、脚本规则引擎、固定模型表或兼容旧 CLI 的分支。以现有 CLI 和说明完成最小实现。
- R8：完成两个子任务的组合验证和本地 CI，准确区分包验证、词法触发 smoke、语义评估、安装和真实 Herdr/Codex 运行。未执行的运行或安装证据必须保留为 `missing evidence`，不得包装为已实现优势。

## Task map

| Child | Source requirements | Deliverable | Ordering |
| --- | --- | --- | --- |
| `09-08-herdr-orchestra-skill` | R1、R2、R5、R6、R7 | 编排入口与 delegation contract | 先实现并检查 |
| `09-08-herdr-codex-review-skill` | R3、R4、R5、R6、R7 | Codex review adapter 与 review prompt | 接受前一个子任务的 delegation contract 后实现 |
| 本父任务 | R5、R8 | 路由、文档目录与证据一致性组合检查 | 两个子任务检查完成后 |

## Acceptance criteria

- [x] AC1（R1、R5、R6）：两个目标目录各有唯一根 `SKILL.md`，元数据类别匹配路径、description 中英文触发范围明确，neutral interface 与自身 workflow 一致；不存在需要自动覆盖第三方安装才能使用源码的步骤。
- [x] AC2（R1、R2、R7）：输出评估覆盖 caller/focused 不同、环境缺失、ID 移动、占用 pane、blocked/unknown/timeout/stalled、输出截断、并发写 ownership；逐项记录观察行为与 verdict，无未经授权的控制或假成功。
- [x] AC3（R3、R4、R5）：组合用例明确启动新的 `--kind codex` 交互进程，将已冻结审查范围传入，只读与禁止递归写入 prompt；普通审查、非 Herdr Codex bundle 协作及 Herdr 只查 pane 的请求路由正确。
- [x] AC4（R4、R7）：review 模板包含文件/行、问题证据、触发条件、影响、优先级、实际检查与未验证项；截断/失败/目标变动不输出“通过”；PowerShell 引号/中文/空格路径样例保持参数边界。
- [x] AC5（R6、R8）：每包保存 prior-art、Skill IR、creation handoff、触发报告与输出评估记录；`just docs-sync` 后 `just ci` 通过，qiaomu 工具实际失败及 schema 偏差有记录，未执行的 provider/安装测试清楚标注。

## Out of scope

改动 `ref/`、用户全局 skills、`.agents/` 激活项、Herdr/Codex 安装与 hooks/config；自动修复审查发现；GitHub 发布、推送、创建 Release；多模型排行榜；通用队列/状态数据库；兼容旧版 Herdr。

## Planning and authorization

用户于 2026-09-08 审阅最终方案后明确回复“按照这份方案开始实施”。实现已获授权；先启动 orchestra 子任务，再启动 review 子任务。无未决产品选项。安装/真实模型运行仍按方案的目标与证据边界处理，不将包检查当作 runtime 证明。
