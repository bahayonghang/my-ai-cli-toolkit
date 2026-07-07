# Windows Dev Process Cleanup

默认中文 | [English](./README.en.md)

一个用于 **审计并安全清理 Windows 开发残留进程树** 和 **UWP 后台任务堆积** 的 Codex Skill / PowerShell 工具集。

它的核心原则是：**先分类，再清理**。默认不会误杀正在运行的开发服务、编辑器语言服务或无法确认用途的进程树。

## 能检查什么

### 1. 开发进程树

`scripts/audit-dev-processes.ps1` 会审计这些 Windows 开发相关进程：

- `node.exe`
- `npm.exe`
- `npx.exe`
- `cmd.exe`
- `pwsh.exe`

并将进程树分类为：

- `npm-outdated`
- `playwright-mcp`
- `dev-server`
- `ide-language-service`
- `generic`

### 2. UWP 后台任务堆积

`scripts/audit-uwp-backgroundtasks.ps1` 会通过 `tasklist /apps` 审计应用关联的 `backgroundTaskHost.exe`，重点关注：

- 手机连接 / Phone Link / `Microsoft.YourPhone`
- 杜比音效 / Dolby Access / `DolbyLaboratories.DolbyAccess`
- Microsoft Store / StorePurchaseApp / Microsoft To Do 等其他 UWP 后台任务

## 快速开始

审计开发进程树：

```powershell
pwsh -NoLogo -File scripts/audit-dev-processes.ps1 -Mode audit
```

预览保守清理，不实际结束进程：

```powershell
pwsh -NoLogo -File scripts/audit-dev-processes.ps1 -Mode cleanup -Profile safe -WhatIf
```

清理孤儿 `npm outdated` 进程树：

```powershell
pwsh -NoLogo -File scripts/audit-dev-processes.ps1 -Mode cleanup -Profile safe
```

审计 UWP / App 后台任务：

```powershell
pwsh -NoLogo -File scripts/audit-uwp-backgroundtasks.ps1 -Mode audit
```

禁用手机连接后台运行，并结束手机连接相关进程：

```powershell
pwsh -NoLogo -File scripts/audit-uwp-backgroundtasks.ps1 -Mode cleanup -Profile phone-link-background -DisablePhoneLinkBackground
```

只结束堆积的 Dolby Access `backgroundTaskHost.exe`，不禁用杜比音效：

```powershell
pwsh -NoLogo -File scripts/audit-uwp-backgroundtasks.ps1 -Mode cleanup -Profile dolby-backgroundtask
```

## 清理策略

### `audit-dev-processes.ps1`

- `safe`：只结束明确过期的孤儿 `npm-outdated` 进程树。
- `playwright-mcp`：结束 Playwright MCP 进程树。仅在确认浏览器自动化 worker 已残留时使用。
- `codex-playwright-safe`：只结束由 Codex 拉起且超过过期时间阈值的 Playwright MCP 进程树。
- `safe-plus-codex-playwright`：同时清理孤儿 `npm-outdated` 和过期 Codex Playwright 进程树。
- `workspace-dev-server`：只结束命令行匹配 `-WorkspacePath` 的指定工作区开发服务。

### `audit-uwp-backgroundtasks.ps1`

- `phone-link-background`：结束 Phone Link / `Microsoft.YourPhone` 相关应用进程。配合 `-DisablePhoneLinkBackground` 可写入 HKCU 后台访问禁用标记。
- `dolby-backgroundtask`：只结束 Dolby Access 相关 `backgroundTaskHost.exe` 实例；不会禁用、卸载或修改 Dolby Access 音效功能。

## 安全原则

- 永远先审计，再清理。
- 非简单清理前优先使用 `-WhatIf` 预览。
- 未经确认，不结束 `dev-server`、`ide-language-service` 或 `generic` 类型进程树。
- 不默认禁用 Dolby Access，因为它可能影响音效功能。
- 只有在用户不需要手机后台同步时，才禁用 Phone Link 后台运行。

## Codex Skill 用法

`SKILL.md` 描述了 Codex 何时以及如何使用这些脚本。

## 环境要求

- Windows
- 推荐 PowerShell 7
- Windows 内置命令：`tasklist`、`taskkill`
- 可用的 CIM/WMI 进程查询能力

## 许可证

MIT
