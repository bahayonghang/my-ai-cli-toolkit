# Windows Dev Process Cleanup

默认中文 | [English](./README.en.md)

一个用于审计并安全清理 Windows 开发残留进程树和 UWP 后台任务堆积的 PowerShell 7 工具集。它先建立完整计划、阻断不确定目标、在清理前复验，再逐 PID 核实结果。

## 能检查什么

- 开发进程树：`node.exe`、`npm.exe`、`npx.exe`、`cmd.exe`、`pwsh.exe`，包括孤儿 `npm outdated`、Playwright MCP、开发服务和 IDE 语言服务。
- UWP 应用进程：通过 `tasklist /apps /fo csv /nh` 识别 Phone Link、Dolby Access 和 `backgroundTaskHost.exe` 堆积。

## 快速开始

从仓库根目录运行时，请使用脚本绝对路径；下面的命令假设当前目录是本 skill 目录。

```powershell
# 只读审计
pwsh -NoLogo -NoProfile -File scripts/audit-dev-processes.ps1 -Mode audit -AsJson
pwsh -NoLogo -NoProfile -File scripts/audit-uwp-backgroundtasks.ps1 -Mode audit -AsJson

# 只预览，不结束进程
pwsh -NoLogo -NoProfile -File scripts/audit-dev-processes.ps1 -Mode cleanup -Profile safe -WhatIf -AsJson
pwsh -NoLogo -NoProfile -File scripts/audit-uwp-backgroundtasks.ps1 -Mode cleanup -Profile dolby-backgroundtask -WhatIf -AsJson
```

只有用户明确要求清理、计划没有任何 blocked target，并且预览内容仍然准确时，才移除 `-WhatIf`。

## 开发进程 profiles

- `safe`：仅选择父进程已不存在的 `npm-outdated` 树。
- `playwright-mcp`：选择 Playwright MCP 树；需要明确清理意图。
- `codex-playwright-safe`：选择由 Codex 拉起且超过正数 `-StaleMinutes` 的 Playwright MCP 树。
- `safe-plus-codex-playwright`：组合前述两个保守条件。
- `workspace-dev-server`：只选择规范化路径与 `-WorkspacePath` 按目录段匹配的开发服务；cleanup 要求目录真实存在。

脚本枚举根进程及全部后代。任何 `mixed_tree`、受保护成员、未知成员、身份缺失或审计后新增的后代都会阻断整棵树。执行前会复验 PID 身份与后代集合，执行后会逐项报告 `terminated`、`not-found`、`failed` 或 `identity-changed`；`taskkill` 返回 0 不等于已成功结束。

## UWP profiles

- `phone-link-background`：选择完整 `Microsoft.YourPhone_*` 包身份和预期 Phone Link 进程。
- `dolby-backgroundtask`：只选择 Dolby Access 关联的 `backgroundTaskHost`，不会禁用、卸载或修改 Dolby 音效。

CSV 列数、PID、包身份或命令退出状态不合法时，审计标记为 failed，cleanup 不会继续。

## 2.0 迁移说明

`-DisablePhoneLinkBackground` 已弃用并硬失败，不再写入 HKCU。当前没有足够的 Microsoft 权威依据证明旧注册表值是稳定、可验证且可恢复的 Phone Link 控制接口。

需要持久修改时，请使用 Windows Settings：`系统 > 电源和电池 > 电池使用情况 > 管理后台活动`，在应用支持该控制时选择“从不”。详见 [migration-2.0.md](references/migration-2.0.md) 和 [windows-command-contracts.md](references/windows-command-contracts.md)。

## 输出与回滚边界

JSON/控制台/Markdown 共享同一事实模型：规范化输入、完整成员、角色与保护原因、blocked targets、`plan_id`、执行前条件和逐 PID 结果。进程终止不可回滚；本工具依赖计划、确认和复验预防误杀。报告文件是本地可删除文件；2.0 不执行注册表变更。

完整策略见 [safety-policy.md](references/safety-policy.md)。

## 环境与测试

- Windows
- PowerShell 7
- Windows 内置 `tasklist`、`taskkill`
- CIM/WMI 进程查询能力

```powershell
node --test tests/audit-scripts.test.mjs
```

测试使用 file-backed fixtures 和注入 shim，不会真实结束进程或写注册表。

## 许可证

MIT
