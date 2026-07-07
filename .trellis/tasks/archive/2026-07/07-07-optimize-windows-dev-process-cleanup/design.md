# Design — 优化 windows-dev-process-cleanup skill

## 边界

改动全部收敛在 `skills/developer-tools-integrations/windows-dev-process-cleanup/` 内（脚本、SKILL.md、两份 README、agents 接口、新增 tests/），外加零仓库级改动——`just node-test` 的发现规则 `skills/**/tests/*.mjs` 已覆盖新测试目录，`justfile`/`scripts/check.py` 不动。

## 1. UWP 脚本修复（audit-uwp-backgroundtasks.ps1）

### 1.1 Stop-Pids 绑定修复 + 诚实报告（R1/R2）

- 调用点改为 `Stop-Pids -TargetPids $cleanupPids`（修名即修 bug）。
- `Stop-Pids` 重写报告契约（字段只增不删）：

```
{
  count: <int>,            # 保留：选中 PID 数
  pids: [<int>],           # 保留：选中 PID 列表
  result: 'preview' | 'terminated' | 'partial' | 'failed' | 'no-targets',
  details: [ { pid, outcome: 'terminated'|'failed'|'not-found' } ]   # 新增
}
```

- 逐 PID：`Stop-Process -Id $pid -Force` 后用 `Get-Process -Id $pid -ErrorAction SilentlyContinue` 复查存活；存活→`failed`，进程已不存在（先前已退出）→`not-found`（视为成功清除）。聚合规则：全部成功→`terminated`；部分→`partial`；全失败→`failed`；空列表→`no-targets`。
- 终止逻辑抽成可注入形态：`Stop-Pids` 接受可选 `[scriptblock]$KillAction`（默认封装真实 `Stop-Process`+复查），测试 dot-source 后注入 shim 断言收到的 PID 序列。这是最小可测缝，不引入模块文件。

### 1.2 phone-link 部分生效可见（R2）

cleanup 结果对象新增兄弟字段 `registry_changed: $true|$false`（仅 phone-link profile 且 `-DisablePhoneLinkBackground` 时为 true；`-WhatIf` 时保持 false 并在 `result='preview'` 中体现）。注册表写入仍先于杀进程（顺序不变），但输出不再可能"注册表改了却宣称 terminated 0 个也算成功"。

### 1.3 cleanup 需显式 profile（R9）

`Mode=cleanup` 且 `Profile=none` → `throw 'Profile is required when Mode is cleanup. Use phone-link-background or dolby-backgroundtask.'`（对齐 dev 脚本 workspace-dev-server 缺 `-WorkspacePath` 时 throw 的既有先例）。

## 2. dev 脚本修复（audit-dev-processes.ps1）

### 2.1 混合树防误杀（R3）

- `Get-CategoryFromLines` 保留（树级标签不变，兼容既有输出），新增成员级分类：对每条 command line 单独求 category，树对象新增字段：
  - `member_categories: [<string>]`（去重）
  - `mixed_tree: <bool>` — 成员中同时存在目标类（npm-outdated / playwright-mcp）与受保护类（dev-server / ide-language-service）时为 true。
- `mixed_tree` 树：`kill_recommendation` 强制 `manual-review`、`safe_to_kill=$false`、reason 注明 mixed tree；所有 cleanup profile 的目标筛选统一追加 `-and -not $_.mixed_tree`。
- 不做"只杀匹配分支"——那需要子树拆分与逐 PID taskkill，收益低复杂度高；排除+人工审查已消除误杀。

### 2.2 audit 标签与 cleanup 选择器对齐（P2，用掉死参数）

`Get-Recommendation` 的 playwright-mcp 分支使用 `$CodexParent`/`$Age`：满足 `codex_parent && age >= StaleMinutes` 时 `kill_recommendation='stale-codex-playwright'`（`safe_to_kill` 仍为 false——杀依旧需要显式 profile，只改标签）。`Get-Recommendation` 增加 `[int]$StaleMinutes` 传参。

### 2.3 `-AsJson` 与导出共存（R9）

把 `if ($AsJson) { ...; exit 0 }` 移到 `ExportJson`/`ExportMarkdown` 处理之后。语义变为：`-AsJson` 控制 stdout 形态，`-Export*` 独立生效，可组合。

### 2.4 两脚本共同

- 首行加 `#requires -Version 7.0`（README 本就推荐 PS7；中文字符串在 5.1 无 BOM 下会乱码，显式挡掉）。
- `Get-ChainRootPid` 加已访问 PID 集合防 PPID 循环（防御性，一行级改动）。
- `workspace_match` 改用 `$_.IndexOf($WorkspacePath, [StringComparison]::OrdinalIgnoreCase) -ge 0`，规避 `-like` 通配符元字符（`[ ]`）问题。
- 有意不改：`$Profile` 参数名（文档化 CLI 兼容）、`Test-ParentExists` 的 PID 复用误报（Windows 固有，保守方向影响小）、控制台表格截断（纯外观）。

## 3. 元数据 / 文档 / 接口

### 3.1 SKILL.md frontmatter（R5/R6）

```yaml
name: windows-dev-process-cleanup
category: developer-tools-integrations
tags: [windows, powershell, process-cleanup, uwp, playwright-mcp]
version: 1.1.0
description: >-  # 单段、无尖括号、≤1024 字符，要点：
  # en：audit & safely clean stale node/npm/npx/cmd/pwsh process trees; UWP
  #     backgroundTaskHost pileups (Phone Link, Dolby Access, Store); classify
  #     first, profile-gated kill, WhatIf preview; agent-neutral（去掉 "Codex needs"）
  # zh 触发词：Windows 进程堆积、任务管理器很多 node/backgroundTaskHost、
  #     清理残留进程、查杀手机连接/杜比后台、进程树审计
```

version 取 1.1.0：skill 已有线上行为，本次是行为修复+契约扩展的首个版本化发布。

### 3.2 SKILL.md 正文（R4/R8）

- 全部命令改 `pwsh -NoLogo -File "<skill-dir>/scripts/....ps1" ...`（对齐 gh-fix-ci / paper-plot / archive-planning 的既有占位符用法）。
- "Read the classification" 拆成两小节：dev 脚本 5 类 + `mixed_tree` 字段；UWP 脚本 3 类。
- 正文统一英文（去掉"重点筛查目标/查杀/卡顿"等夹杂；中文触发词只留在 description）。
- 新增/修订：cleanup 需显式 profile；`-AsJson` 可与 `-Export*` 组合；结果字段 `details`/`registry_changed`/`mixed_tree`/`stale-codex-playwright` 的解读；PS7 要求。

### 3.3 agents 接口（R7）

`git mv agents/openai.yaml agents/interface.yaml`；`short_description`/`default_prompt` 补 UWP 半边（backgroundTaskHost / Phone Link / Dolby）。schema 与其余 15 个 interface.yaml 一致（display_name/short_description/default_prompt），无结构改动。

### 3.4 README 双语（R8）

只修 drift：Store/StorePurchaseApp/ToDo 表述限定为"出现在 backgroundTaskHost 关联行时"；环境要求改"需要 PowerShell 7（脚本已 #requires）"；补一段测试运行方式；命令示例保持相对路径但注明"在 skill 目录内执行"。

## 4. 测试（R10）

`tests/audit-scripts.test.mjs`（node:test + node:assert，零依赖，`just node-test` 自动发现）：

- **环境门**：`process.platform !== 'win32'` 或 `pwsh` 不可用 → 全部 `t.skip()`，退出 0。
- **解析门**：`[System.Management.Automation.Language.Parser]::ParseFile` 两脚本零解析错误。
- **单元（dot-source 层）**：测试用 pwsh 内联脚本 dot-source 目标 ps1 的函数定义（通过 `-Command` 提取函数后调用；脚本顶层的 CIM 枚举在 dev 脚本会执行——为避免顶层副作用，dev 脚本单元测试仅覆盖纯函数 `Get-CategoryFromLines`，用 `Select-String` 抽函数体或直接 `. { <函数源> }` 注入；UWP 脚本顶层无立即副作用重排，`Stop-Pids`/`Get-UwpBackgroundTaskGroups` 可 dot-source 后测）：
  - `Stop-Pids -TargetPids @(...) -KillAction <shim>` → shim 收到的 PID 序列 == 输入去重序列；shim 模拟存活 → `outcome=failed`、聚合 `partial`。
  - `Get-CategoryFromLines` fixtures：npm outdated / playwright-mcp / vite / tsserver / 混合行。
  - 混合树目标排除：构造含 dev-server 成员的伪树对象过 profile 筛选逻辑（若筛选内联在主体，退化为端到端 `-WhatIf` 断言 + fixture 函数级断言组合覆盖）。
- **端到端冒烟（真机、只读/预览）**：
  - dev `-Mode audit -AsJson` → JSON 合法、summary 键齐全。
  - uwp `-Mode audit -AsJson` → 同上。
  - uwp `-Mode cleanup -Profile dolby-backgroundtask -WhatIf -AsJson` → `cleanup.result=='preview'`、`registry_changed==false`、退出 0。
  - uwp `-Mode cleanup`（无 profile）→ 非零退出 + 错误信息含 'Profile is required'。
- **文档 lint**：读 SKILL.md 断言 ①无 `-File scripts/` 裸相对调用 ②frontmatter 含 category/tags/version。

实现顺序注意：若 dot-source 抽函数过于脆弱，允许把被测函数微调为"定义与执行分离"（函数区 + 底部主流程），但不引入 .psm1 模块文件——保持双脚本自包含可直接 `-File` 运行。

## 5. 兼容与回滚

- **兼容**：CLI 参数、profile 名、既有 JSON 字段全保留；新增字段只增。行为变化仅两处破坏面极小的收紧：UWP cleanup 缺 profile 改报错（原为静默无操作+假成功，无人依赖）；mixed 树退出 cleanup 目标（原行为是 bug 级误杀面）。
- **回滚**：纯 git 边界——按 implement.md 的提交切分，任一步 `git revert` 即回滚；无外部状态、无数据迁移。脚本是用户手动运行的工具，旧版本随时可从历史检出。
