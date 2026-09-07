# Herdr Codex Review skill

## Goal

创建 `skills/development-workflows/codex-review/`，使 Herdr 内的 Agent 经 `herdr-orchestra` 启动一个新的 Codex reviewer，并交付可定位、可核验的只读审查结论。对应父任务 `09-08-herdr-review-skills` 的审查、权限、路由、证据与简洁性要求，编号映射以父任务 Task map 为准。

## Confirmed facts

- 最新官方 review 文档与本机 Codex 0.153.4 help 区分交互与非交互接口；范围参数与自定义 PROMPT 存在互斥，详见父任务 `research/codex-review.md`。
- 当前 `.agents/skills/codex-review/SKILL.md:3` 是含 CHANGELOG 行为的第三方本地激活项；本子任务创建一方源码，不能宣称已取代其 discovery。
- 宿主加载/安装边界沿用 `docs/harnesses.md`；不复制五宿主能力矩阵。

## Requirements

- R1：仅响应 Herdr 中明确的 Codex 审查请求；经已实现的 `herdr-orchestra` 进行进程/输出操作，不能另写 controller 或静默绕过 Herdr 直接启动。
- R2：先确定 cwd 与唯一审查范围，区分当前全部改动、base 比较、指定 commit、文件或计划；记录可复核的 input identity，并在接受结果前检查目标是否变化。
- R3：新建交互式 Codex，设置明确的只读/approval/no-alt-screen 参数；用户指定模型原样保留，其他情况继承配置。reviewer 为 leaf，禁止修复、CHANGELOG、Git 写操作、权限/配置变更和再次委托。
- R4：结果包含实际审阅范围、按优先级排列的可行动发现及路径/行、证据、触发条件、影响和验证缺口；无发现必须建立在完整审查上。父 Agent 核验，不自动修复或重新启动 reviewer。
- R5：只读 reviewer 的完整结果通过终端取得；必要时由同一 worker 分段重述，父 Agent 在自己的输出授权内保存已读内容。不为 temp file 放宽权限，不把 blocked/timeout/unknown/截断/范围漂移当作通过。
- R6：入口/neutral interface/评估/来源/IR/handoff 遵循本仓库与 qiaomu 证据约定，涵盖相邻 review/codex-bridge 路由及同名第三方冲突；不改安装或增加旧 CLI 兼容分支。

## Acceptance Criteria

- [x] AC1（R1、R6）：合法唯一根入口、类别及 neutral interface；行为评估中的 Herdr Codex review 路由到 orchestra，普通审查与非 Herdr bundle 请求不被劫持，已分配 leaf 不派生新进程。
- [x] AC2（R2、R3）：模板覆盖各范围及 staged/unstaged/untracked 语义，native argv 明确 read-only/never/no-alt-screen 且不硬编码模型；输入变化产生 scope-drift 结果，不 checkout/fetch/reset。
- [x] AC3（R3、R4）：输出评估验证审查禁止变更且 findings 字段齐全，证据不足降为 uncertainty；父 Agent 对具体结论做可追溯核验，无 findings 不等于没有风险。
- [x] AC4（R4、R5）：blocked/timeout/unknown、空输出、截断、只读文件 fallback 冲突及分段恢复有独立案例，失败/不完整结果不被“通过”吞并。
- [x] AC5（R1、R5、R6）：与 orchestra 的组合 walkthrough 只启动一个 reviewer，由同一 worker 完成分段恢复；记录 qiaomu/资源检查、输出评估和 docs 结果，同名 runtime discovery 和真实运行未执行时标记 missing evidence。

## Dependency and out of scope

实现依赖 `09-08-herdr-orchestra-skill` 已检查的 delegation reference；依赖顺序不可只从父子树推断。规划材料已完成，消费方实现需等待该契约。非交互 review runner、自动修复循环、CHANGELOG、发布/推送、全局安装替换和认证修改均不在范围内。用户于 2026-09-08 已批准最终方案，待前序契约检查完成后启动本子任务。
