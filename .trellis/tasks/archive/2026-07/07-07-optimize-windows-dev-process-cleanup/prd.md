# 优化 windows-dev-process-cleanup skill：修复静默失败与触发覆盖

## Goal

让 `skills/developer-tools-integrations/windows-dev-process-cleanup` 的清理功能真实生效、报告诚实，并使该 skill 在 Claude Code / Codex 双端可被正确触发与执行：修复已验证的 UWP cleanup 静默空转 bug，消除误杀风险，补齐仓库元数据/路径约定，并用回归测试接入 `just ci` 防止复发。

## Background（审计已验证的事实）

- **P0 静默空转**：`audit-uwp-backgroundtasks.ps1` 第 179 行调用 `Stop-Pids -Pids $cleanupPids`，但函数声明的参数是 `$TargetPids`。`Stop-Pids` 是普通函数，未知参数落入 `$args`，`$TargetPids` 恒为 null——cleanup 模式**一个进程都不会结束，却报告 `terminated`**（已用最小复现验证）。
- **P0 部分生效假成功**：phone-link profile 会先写 HKCU 注册表禁用后台访问，再调用坏掉的 Stop-Pids——注册表已改、进程未杀、输出宣称成功。
- **P0 误杀风险**：进程树分类基于整树 command line 拼接后首匹配（npm-outdated 优先），`taskkill /T /F` 作用于树根；混合树（同根下既有 npm outdated 又有 dev server）会被整树杀掉。
- **P1 路径约定违规**：SKILL.md 全部命令用裸相对路径 `scripts/...`，CWD 不在 skill 目录即失败；仓库其余带脚本 skill 均用 `"<skill-dir>/scripts/..."` 占位符约定。
- **P1 触发覆盖缺口**：frontmatter description 只覆盖 node/npm/npx/cmd 且绑定 "Codex" 措辞；完全没提 UWP / backgroundTaskHost / Phone Link / Dolby（skill 的一半功能），没有中文触发词，漏掉脚本实际审计的 `pwsh.exe`。
- **P1 元数据缺失**：缺 `category`/`tags`/`version`（`scripts/check.py` 现报 warning "Top-level category is missing"；仓库 CLAUDE.md 要求这些字段）。
- **P1 接口文件命名**：全仓库 16 个 agents 接口文件里唯独此 skill 用 `agents/openai.yaml`，其余全是 `agents/interface.yaml`。
- **P2 若干**：两脚本无 BOM 且含中文字符串（PS 5.1 下乱码）但未声明 `#requires -Version 7`；UWP cleanup 默认 `-Profile none` 静默无操作；dev 脚本 `-AsJson` 提前 `exit 0` 跳过 `-ExportJson/-ExportMarkdown`；`Get-Recommendation` 的 `$CodexParent`/`$Age` 是死参数导致 audit 标签与 cleanup 选择器不一致；`Stop-Pids` 用 `SilentlyContinue` 后一律报 `terminated`；SKILL.md 中英文混写、把两个脚本的分类混为一谈；README 声称的 Store/ToDo 覆盖范围与实现（仅 backgroundTaskHost 行）不符；无任何测试。
- **正面基线（保持不破坏）**：audit 模式双脚本实测可用（46/45 棵树、JSON 合法）；audit-first + profile 白名单 + `-WhatIf`（含注册表写入）安全姿态良好；dev 脚本 cleanup 检查 `$LASTEXITCODE`。

## Requirements

- R1 UWP cleanup 必须把选中的 PID 列表真实传入终止逻辑并逐 PID 报告真实结果（终止失败不得报 `terminated`）。
- R2 消除部分生效假成功：phone-link profile 的输出必须能区分"注册表已禁用"与"进程终止成功数"，任一步失败不得整体宣称成功。
- R3 dev 脚本 cleanup 不得杀混合树：目标树若含 dev-server / ide-language-service 成员，必须降级为 manual-review 并排除出 cleanup 目标。
- R4 SKILL.md 全部命令改用 `"<skill-dir>/scripts/..."` 约定，任意 CWD 可执行。
- R5 frontmatter description 重写：中英双语触发词、覆盖 dev 进程与 UWP 两半功能（含 backgroundTaskHost/Phone Link/Dolby/任务管理器/进程堆积等关键词）、平台中立措辞、补 `pwsh.exe`；≤1024 字符且不含尖括号（check.py 约束）。
- R6 frontmatter 补 `category: developer-tools-integrations`、`tags`、`version`；`scripts/check.py` 对本 skill 零 warning。
- R7 `agents/openai.yaml` 更名为 `agents/interface.yaml`，内容更新以覆盖 UWP 功能。
- R8 SKILL.md / README.md / README.en.md 与脚本实际行为对齐：按脚本拆分分类清单、单一语言行文、修正 Store/ToDo 覆盖表述、声明 PS7 要求、文档化 `-Profile none` 与 `-AsJson`+`-Export*` 语义。
- R9 两脚本声明 `#requires -Version 7.0`；UWP 脚本在 `Mode=cleanup` 且 `Profile=none` 时快速报错而非静默无操作；dev 脚本 `-AsJson` 不再跳过导出参数。
- R10 新增回归测试并被 `just node-test` 自动发现：参数绑定回归（shim 验证 PID 列表逐个到达终止调用）、分类 fixture、`-WhatIf` 冒烟、SKILL.md 路径 lint；非 Windows / 无 pwsh 环境优雅跳过。

## Constraints

- 保持已文档化的 CLI 兼容：参数名（含 `-Profile`）、profile 名、输出 JSON 既有字段只增不改不删。
- 手术式修改：不新增 profile、不做跨平台支持、不引入 PSScriptAnalyzer/Pester 依赖、不重构 README 结构。
- 遵循仓库规则：skill 目录结构不变；Conventional Commits；`just ci` 必须全绿。

## Acceptance Criteria

- [x] 单测（shim 注入伪 `Stop-Process`）证明选中 PID 列表逐个到达终止调用——`-Pids`/`-TargetPids` 失配类缺陷有回归保护。
- [x] `pwsh -File <uwp脚本> -Mode cleanup -Profile dolby-backgroundtask -WhatIf -AsJson` 退出码 0，JSON 合法且 `cleanup.result == 'preview'`。
- [x] UWP 脚本 `Mode=cleanup` + `Profile=none` 快速失败并给出明确错误信息。
- [x] cleanup 结果 JSON 含逐 PID 结果；shim 模拟"终止后仍存活"的 PID 被报告为 failed。
- [x] phone-link 结果中注册表变更与终止计数分离可见（如 `registry_changed` + 逐 PID 结果）。
- [x] 分类 fixture 测试：含 dev-server 成员的 npm-outdated 混合树被标记 mixed/manual-review 且不进入 cleanup 目标。
- [x] audit 输出能区分满足 codex+stale 条件的 playwright 树（原死参数被使用或移除，标签与 cleanup 选择器一致），fixture 验证。
- [x] SKILL.md 无任何裸 `scripts/` 调用（测试断言）；行文单一语言；分类按脚本拆分。
- [x] `PYTHONUTF8=1 python scripts/check.py skills/developer-tools-integrations/windows-dev-process-cleanup` 输出 OK 且零 warning。
- [x] description 同时含英文与中文触发词、覆盖两半功能、无尖括号、≤1024 字符。
- [x] `agents/interface.yaml` 存在且覆盖 UWP 表述；`agents/openai.yaml` 已删除。
- [x] 两份 README 与脚本行为一致（pwsh.exe、PS7、覆盖范围表述、测试说明）。
- [x] 两脚本首行区含 `#requires -Version 7.0`。
- [x] 新测试文件位于 `skills/developer-tools-integrations/windows-dev-process-cleanup/tests/*.mjs`，`just node-test` 自动发现并通过；在无 pwsh 环境跳过不失败。
- [x] `just ci` 全绿。

## Non-Goals

- 跨平台（Linux/macOS）支持、Windows PowerShell 5.1 兼容。
- 新 cleanup profile 或新审计目标类别。
- 引入 Pester / PSScriptAnalyzer 等外部工具链。
- 重命名 `$Profile` 参数（有意保留，向后兼容优先）。
