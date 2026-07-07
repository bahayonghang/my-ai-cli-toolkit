# windows-dev-process-cleanup

> 此页由 `docs/scripts/sync_docs_catalog.py` 从 `SKILL.md` 自动生成。

## 用途概览

Audit and safely clean Windows development process buildup and UWP background-task pileups. Covers stale node.exe, npm.exe, npx.exe, cmd.exe, and pwsh.exe trees (leftover npm outdated runs, leaked Playwright MCP workers, dev servers, IDE language services) plus backgroundTaskHost.exe pileups from Phone Link (Microsoft.YourPhone) and Dolby Access. Classify process trees first, then terminate only profile-matched targets, with WhatIf preview and JSON or Markdown reports.

## 触发场景

- Task Manager is full of node/npm noise, the machine feels sluggish, orphan process trees linger after closing editors or agents, or dozens of backgroundTaskHost.exe instances appear. 中文触发：Windows 进程堆积、任务管理器一堆 node npm backgroundTaskHost、清理残留开发进程、查杀泄漏的 Playwright MCP、手机连接或杜比后台任务堆积、进程树审计与安全清理。

## 元数据

| 字段 | 值 |
| --- | --- |
| 名称 | `windows-dev-process-cleanup` |
| 分类 | `developer-tools-integrations` (开发者工具集成) |
| 版本 | `1.1.0` |
| 标签 | `windows`, `powershell`, `process-cleanup`, `uwp`, `playwright-mcp` |

## 安装命令

```bash
npx skills add bahayonghang/my-claude-code-settings/skills --skill windows-dev-process-cleanup
```

## 目录内容

| 路径 | 类型 | 文件数 | 说明 |
| --- | --- | ---: | --- |
| `skills/developer-tools-integrations/windows-dev-process-cleanup/agents` | 目录 | 1 | 配套 agent |
| `skills/developer-tools-integrations/windows-dev-process-cleanup/README.en.md` | 文件 | 1 | 顶层文件 |
| `skills/developer-tools-integrations/windows-dev-process-cleanup/README.md` | 文件 | 1 | 顶层文件 |
| `skills/developer-tools-integrations/windows-dev-process-cleanup/scripts` | 目录 | 2 | 可执行脚本 |
| `skills/developer-tools-integrations/windows-dev-process-cleanup/tests` | 目录 | 1 | 自动化测试 |

## 脚本、引用与测试资源

| 资源 | 路径 | 用途 |
| --- | --- | --- |
| agents | `skills/developer-tools-integrations/windows-dev-process-cleanup/agents` | 配套 agent |
| scripts | `skills/developer-tools-integrations/windows-dev-process-cleanup/scripts` | 可执行脚本 |
| tests | `skills/developer-tools-integrations/windows-dev-process-cleanup/tests` | 自动化测试 |

## 验证方式

```bash
just skills-check
just node-test
just ci
```

## 源码路径

- `skills/developer-tools-integrations/windows-dev-process-cleanup/SKILL.md`
- `skills/developer-tools-integrations/windows-dev-process-cleanup`
