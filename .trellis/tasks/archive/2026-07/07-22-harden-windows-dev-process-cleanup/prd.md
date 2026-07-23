# 加固 windows-dev-process-cleanup 的安全边界与治理证据

## Goal

把 `skills/developer-tools-integrations/windows-dev-process-cleanup` 从“已有安全姿态但证据不足的脚本型 skill”提升为可审计的 Governed Windows 清理工具：检查范围必须覆盖实际副作用范围，任何 cleanup 都要基于可复验的目标快照，输出必须足以解释每个被选中或被阻止的 PID，并用确定性测试、触发评测、输出评测和治理元数据证明这些约束不会再次漂移。

## User Value

- 用户能先看到完整、可核对的清理计划，不会因为路径前缀、负过期阈值或未检查的后代进程误杀正在使用的服务。
- cleanup 后能区分“命令返回成功”“目标确实退出”“注册表发生变化”和“状态在执行前已漂移”。
- 后续维护者能从 fixtures、evals、trust report 和 rollback boundary 直接判断一次改动是否削弱了安全边界。

## Confirmed Facts

- 2026-07-07 的上一轮任务已修复 UWP PID 参数绑定、假成功报告、基本 mixed-tree 防护、元数据和最小测试；本任务不重复这些已完成工作。
- 当前 skill-local 测试 `9/9` 通过，`scripts/check.py` 通过；这些门禁证明当前实现可解析和可运行，但没有覆盖本任务识别出的选择器与副作用边界。
- `audit-dev-processes.ps1` 只把 `node/npm/npx/cmd/pwsh` 放入树图，却用 `taskkill /T /F` 结束根进程及其全部后代。Windows 本机帮助和 Microsoft Learn 都确认 `/T` 会结束指定进程及其启动的子进程。
- `-WorkspacePath` 当前使用不区分路径边界的子串匹配；`C:\work\app` 会命中 `C:\work\app-copy`。
- `-StaleMinutes` 接受 `0` 和负数；推荐逻辑要求 `> 0`，cleanup 选择器却直接比较 `age >= StaleMinutes`，两者可分叉。
- `tasklist /apps /fo csv /nh` 在当前 Windows 11 主机可返回四列结构化数据；现实现仍解析默认表格文本。
- yao-meta 当前结果：initial load 约 `2725` tokens，超过 Governed `1300` 上限；缺 `manifest.json`，governance score `30/100`；接口缺 compatibility/trust 字段；自动 trust checker 只扫描 `scripts/*.py`，因此把两个 PowerShell 脚本计为 `0` 个脚本。
- 2026-07-09 的 description 精简删掉了 Phone Link、Dolby、`npx.exe`、orphan/slow-machine 等触发细节，且没有 trigger eval 证明压缩后路由仍等价。

## Operating Mode

`Governed`。本 skill 能强制结束整棵进程树并写入 HKCU，错误激活或错误分类会造成运行中工作丢失或持久化系统状态变化。高权限边界、所有者、复审周期、信任证据与回滚边界必须显式化。

## Requirements

### R1 - 检查范围与副作用范围一致

- dev-process audit 必须枚举并输出 cleanup 根进程的完整后代闭包，而不是只输出五种候选进程名。
- 每个成员至少包含 PID、PPID、名称、命令行、启动时间/身份指纹、分类、保护原因和是否会受 cleanup 影响。
- 任何自动 profile 遇到未分类、受保护、身份缺失或审计后新增的后代时必须 fail closed，转为 `manual-review`，不能继续 `/T` 强杀。
- `member_categories` 的文档与数据契约必须一致；不能把“去重类别集合”描述成“逐成员分类”。

### R2 - 输入与 profile 参数 fail closed

- `StaleMinutes` 必须是有界正整数，推荐标签、summary 计数和 cleanup 选择器共享同一个谓词。
- `WorkspacePath` 必须规范化并按路径段边界匹配；同前缀 sibling、大小写、尾分隔符、引号和不存在路径都有 fixture。
- 不适用于当前 mode/profile 的参数组合必须明确拒绝或输出 warning，不能静默忽略。
- 保留已发布的 profile 名、参数名和既有 JSON 字段；新增字段只增不删。若安全修复必须改变既有行为，按兼容性规则决定次版本或主版本升级并写 migration note。

### R3 - 清理前复验与清理后诚实报告

- cleanup 必须先生成目标计划，再在副作用前复验根 PID 身份、完整后代集合和保护谓词；状态漂移时返回 `precondition-failed`，不执行清理。
- dev cleanup 不能只依赖 `taskkill` 退出码；要核对根和已计划成员的最终状态，并逐项报告 `terminated`、`not-found`、`failed` 或 `identity-changed`。
- 输出必须包含 `cleanup_target_count`、blocked targets/reasons、执行结果聚合和可关联的计划标识；human-readable 与 JSON/Markdown 保持同一事实模型。

### R4 - UWP 解析与 Phone Link 持久状态安全

- UWP audit 优先使用 `tasklist /apps /fo csv /nh` 和结构化 CSV 解析，校验列数、PID 与命令退出状态；解析失败不能产生 cleanup 目标。
- Phone Link/Dolby 选择器基于规范化 package identity 和 process identity，不基于可能截断的显示文本。
- 对 `-DisablePhoneLinkBackground` 的注册表路径和值先查找当前 Microsoft 权威依据。若没有可复现的当前支持证据，则不得继续宣称“可靠禁用后台访问”：应弃用/降级该变更路径，保留只读说明或受控兼容错误。
- 若保留注册表写入，必须记录变更前状态、变更后状态、失败语义和可执行恢复路径；`WhatIf` 不得写状态。该结论写入 `rollback boundary` 和 trust report。

### R5 - 确定性测试覆盖安全谓词

- 使用 `file-backed fixture` 表示进程图、UWP CSV、路径和注册表状态；测试不能依赖真机恰好存在 Playwright、Dolby 或 mixed tree。
- 至少覆盖：完整后代闭包、未知/受保护后代阻断、单命令多类别、负/零 stale、workspace sibling 前缀、PID 身份漂移、taskkill 假成功、CSV 解析失败、Phone Link 状态回滚。
- 真实主机测试只做 audit 与 `-WhatIf`；CI 和实施验证禁止真实结束进程或写注册表。

### R6 - 触发、正文与输出质量可复验

- `SKILL.md` initial load 在显式 Governed `1300` token ceiling 内；长安全策略、Windows 行为依据和结果字段说明移入按需 `references/`。
- description 保留 dev-process 与 UWP 两半功能的中英文高信号触发词，并明确排除通用性能诊断、恶意软件处置、服务管理和卸载软件等 near neighbors。
- 仓库 `evals/evals.json` 覆盖行为/output contract 和至少两个 routing-negative；yao trigger cases + skill-specific semantic config 存在于任务 `research/`，结果零 false positive/negative 或显式记录未通过原因。
- output eval 比较 without-skill/with-skill 对清理计划、安全阻断和回滚说明的影响，生成 `reports/output_quality_scorecard.md`；provider/model、人工 blind review、遥测不可用时标记 `missing evidence`。

### R7 - Governed 包边界

- `manifest.json` 包含 `owner: lyh`、`review_cadence: quarterly`、Governed lifecycle，以及以下字面字段：
  - `input_files`，其测试输入分类为 `file-backed fixture`
  - `output contract`
  - `rollback boundary`
  - `trust report`
- `agents/interface.yaml` 补齐 canonical format、adapter targets、activation、Windows/PowerShell execution 和 trust/degradation 语义；不虚构宿主已强制执行的权限。
- 权限策略覆盖 process/CIM read、process termination、subprocess、report file write，以及条件式 registry read/write。
- 生成并复核 `trust report`；由于 yao 自动 trust checker 不扫描 `.ps1`，这一自动化盲区必须写成 `missing evidence` 并由 PowerShell 专项人工/测试证据补足，不能把 `script_count: 0` 当通过。

### R8 - 文档与发布一致

- `README.md`、`README.en.md`、`SKILL.md`、接口、脚本帮助和生成目录中的公开行为一致。
- 外部 Windows 行为声明进入 reference，并包含 `Last verified: 2026-07-22` 与来源 URL。
- 版本号按实际兼容性升级；运行 `just docs-sync` 后提交生成目录变化。

## Constraints

- 平台保持 Windows + PowerShell 7；不增加运行时依赖，不引入 Pester/PSScriptAnalyzer。
- 目标源码范围以 `skills/developer-tools-integrations/windows-dev-process-cleanup/` 为主；允许更新由 skill 元数据生成的 `docs/`、任务证据和确有复用价值的 Trellis spec。
- 不修改 yao-meta 本身以增加 PowerShell 扫描能力；该工具缺口只记录为 `missing evidence` / follow-up。
- 不在实现或验证中执行真实 cleanup、结束用户进程、禁用 Phone Link 或修改注册表。
- 保持无网络运行能力；官方文档只用于设计依据，不成为运行时依赖。

## Acceptance Criteria

- [x] fixture 证明 cleanup 计划包含 `/T` 会影响的完整后代，受保护/未知/新增后代会阻断自动清理。
- [x] `StaleMinutes <= 0` 失败；推荐、summary 与 cleanup 对同一 fixture 给出一致结果。
- [x] `C:\work\app` 不再命中 `C:\work\app-copy`，而大小写/尾分隔符等同一路径变体仍正确命中。
- [x] cleanup 前 PID 身份或后代集合变化时返回 `precondition-failed` 且 kill shim 零调用。
- [x] dev cleanup 逐成员复查；模拟 `taskkill` 返回 0 但成员仍存活时不能报告 `terminated`。
- [x] UWP CSV fixture 在非英文区域设置下稳定解析；坏列/PID/退出码产生明确失败且零 cleanup targets。
- [x] Phone Link 注册表路径有当前权威证据并具备恢复测试，或该写入能力被安全弃用/降级且文档不再做不受支持的保证。
- [x] skill-local 确定性测试覆盖上述安全谓词；Windows 真机测试仅 audit/WhatIf。
- [x] `resource_boundary_check.py --max-initial-tokens 1300` 通过，正文资源链接可达且无装饰目录。
- [x] `validate_skill.py` 与 `governance_check.py --require-manifest` 通过，governance score 达 Governed 建议门槛。
- [x] trigger eval 与 repo evals 覆盖 positive/negative/near-neighbor；结果及 semantic config 可复现。
- [x] `reports/output_quality_scorecard.md` 与 `trust report` 存在；所有不可用的人审/model/遥测证据均标记 `missing evidence`。
- [x] `python scripts/check.py <skill-dir>`、targeted Node tests、`just node-test`、`just docs-check`、`just ci` 全部通过。
- [x] 最终 diff 只含任务范围和必要生成文件，`git diff --check` 通过。

## Out of Scope

- 通用 Windows 任务管理器、服务管理、驱动/音频故障、恶意软件/事件响应。
- Linux/macOS 或 Windows PowerShell 5.1 支持。
- 自动卸载 UWP 包、禁用 Dolby、结束任意 generic 进程。
- 修改 yao-meta 的 PowerShell trust scanner。
- provider-backed benchmark、真实遥测或生产审批；不可用时保持 `missing evidence`。

## Planning Decision

Phone Link 注册表写入不作为默认保留能力。实施时先做权威证据 gate：只有能证明当前 Windows 版本支持、可验证且可恢复时才保留；否则以兼容性说明弃用该写入路径。该规则避免在缺证据时把高风险选项默认为继续支持。

## Open Questions

无阻塞产品问题。实施开始仍需用户审阅本任务并明确授权 `task.py start`；创建任务不等于授权实施。
