# windows-dev-process-cleanup

> 此页由 `docs/scripts/sync_docs_catalog.py` 从 `SKILL.md` 自动生成。

## 用途概览

Audit and safely clean Windows dev-process trees and UWP app background-task pileups, including orphan npm/npx, leaked Playwright MCP workers, workspace dev servers, IDE services, Phone Link, Dolby Access, and backgroundTaskHost.exe.

## 触发场景

- Audit and safely clean Windows dev-process trees and UWP app background-task pileups, including orphan npm/npx, leaked Playwright MCP workers, workspace dev servers, IDE services, Phone Link, Dolby Access, and backgroundTaskHost.exe
- Use for Task Manager node/npm noise, Windows process buildup, 进程堆积, 清理残留开发进程, 泄漏的 Playwright MCP, 手机连接或杜比后台任务堆积

## 元数据

| 字段 | 值 |
| --- | --- |
| 名称 | `windows-dev-process-cleanup` |
| 分类 | `developer-tools-integrations` (开发者工具集成) |
| 版本 | `2.0.0` |
| 标签 | `windows`, `powershell`, `process-cleanup`, `uwp`, `playwright-mcp` |

## 安装命令

```bash
npx skills add bahayonghang/my-claude-code-settings/skills --skill windows-dev-process-cleanup
```

## 目录内容

| 路径 | 类型 | 文件数 | 说明 |
| --- | --- | ---: | --- |
| `skills/developer-tools-integrations/windows-dev-process-cleanup/agents` | 目录 | 1 | 配套 agent |
| `skills/developer-tools-integrations/windows-dev-process-cleanup/evals` | 目录 | 3 | 评测样例 |
| `skills/developer-tools-integrations/windows-dev-process-cleanup/manifest.json` | 文件 | 1 | 顶层文件 |
| `skills/developer-tools-integrations/windows-dev-process-cleanup/README.en.md` | 文件 | 1 | 顶层文件 |
| `skills/developer-tools-integrations/windows-dev-process-cleanup/README.md` | 文件 | 1 | 顶层文件 |
| `skills/developer-tools-integrations/windows-dev-process-cleanup/references` | 目录 | 3 | 引用资料 |
| `skills/developer-tools-integrations/windows-dev-process-cleanup/reports` | 目录 | 10 | 顶层目录 |
| `skills/developer-tools-integrations/windows-dev-process-cleanup/scripts` | 目录 | 2 | 可执行脚本 |
| `skills/developer-tools-integrations/windows-dev-process-cleanup/security` | 目录 | 1 | 顶层目录 |
| `skills/developer-tools-integrations/windows-dev-process-cleanup/tests` | 目录 | 4 | 自动化测试 |

## 脚本、引用与测试资源

| 资源 | 路径 | 用途 |
| --- | --- | --- |
| agents | `skills/developer-tools-integrations/windows-dev-process-cleanup/agents` | 配套 agent |
| evals | `skills/developer-tools-integrations/windows-dev-process-cleanup/evals` | 评测样例 |
| references | `skills/developer-tools-integrations/windows-dev-process-cleanup/references` | 引用资料 |
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
