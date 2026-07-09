# windows-dev-process-cleanup

> 此页由 `docs/scripts/sync_docs_catalog.py` 从 `SKILL.md` 自动生成。

## 用途概览

Audit and safely clean Windows dev-process buildup and UWP background-task pileups — stale node/npm/cmd/pwsh trees (leaked Playwright MCP workers, dev servers, IDE services) and backgroundTaskHost.exe pileups.

## 触发场景

- Task Manager is full of node/npm noise, or for Windows 进程堆积, 清理残留开发进程, 查杀泄漏的 Playwright MCP, backgroundTaskHost 堆积

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
