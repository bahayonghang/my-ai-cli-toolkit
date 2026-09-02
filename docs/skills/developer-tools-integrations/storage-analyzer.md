# storage-analyzer

> 此页由 `docs/scripts/sync_docs_catalog.py` 从 `SKILL.md` 自动生成。

## 用途概览

Use when the user wants a read-only disk/storage analysis on macOS or Windows: 磁盘满了, C盘满了, 空间不够, 存储分析, 占空间, 清缓存, storage analysis, disk cleanup, or Chinese 内存满了 when they mean disk space.

## 触发场景

- the user wants a read-only disk/storage analysis on macOS or Windows: 磁盘满了, C盘满了, 空间不够, 存储分析, 占空间, 清缓存, storage analysis, disk cleanup, or Chinese 内存满了 when they mean disk space
- Scans known hotspots, classifies cache vs user data vs keep, and writes an HTML report with copyable commands
- After this-turn approval of shown paths, may start a local report server that only moves allowlisted cache paths to Trash

## 元数据

| 字段 | 值 |
| --- | --- |
| 名称 | `storage-analyzer` |
| 分类 | `developer-tools-integrations` (开发者工具集成) |
| 版本 | `0.1.0` |
| 标签 | `disk`, `storage`, `cleanup`, `windows`, `macos`, `cache` |

## 安装命令

```bash
npx skills add bahayonghang/my-claude-code-settings/skills --skill storage-analyzer
```

## 目录内容

| 路径 | 类型 | 文件数 | 说明 |
| --- | --- | ---: | --- |
| `skills/developer-tools-integrations/storage-analyzer/agents` | 目录 | 1 | 配套 agent |
| `skills/developer-tools-integrations/storage-analyzer/assets` | 目录 | 1 | 素材资源 |
| `skills/developer-tools-integrations/storage-analyzer/evals` | 目录 | 2 | 评测样例 |
| `skills/developer-tools-integrations/storage-analyzer/LICENSE` | 文件 | 1 | 顶层目录 |
| `skills/developer-tools-integrations/storage-analyzer/manifest.json` | 文件 | 1 | 顶层文件 |
| `skills/developer-tools-integrations/storage-analyzer/README.md` | 文件 | 1 | 顶层文件 |
| `skills/developer-tools-integrations/storage-analyzer/references` | 目录 | 6 | 引用资料 |
| `skills/developer-tools-integrations/storage-analyzer/reports` | 目录 | 5 | 顶层目录 |
| `skills/developer-tools-integrations/storage-analyzer/scripts` | 目录 | 4 | 可执行脚本 |
| `skills/developer-tools-integrations/storage-analyzer/security` | 目录 | 1 | 顶层目录 |
| `skills/developer-tools-integrations/storage-analyzer/tests` | 目录 | 1 | 自动化测试 |
| `skills/developer-tools-integrations/storage-analyzer/THIRD_PARTY_NOTICES.md` | 文件 | 1 | 顶层文件 |

## 脚本、引用与测试资源

| 资源 | 路径 | 用途 |
| --- | --- | --- |
| agents | `skills/developer-tools-integrations/storage-analyzer/agents` | 配套 agent |
| assets | `skills/developer-tools-integrations/storage-analyzer/assets` | 素材资源 |
| evals | `skills/developer-tools-integrations/storage-analyzer/evals` | 评测样例 |
| references | `skills/developer-tools-integrations/storage-analyzer/references` | 引用资料 |
| scripts | `skills/developer-tools-integrations/storage-analyzer/scripts` | 可执行脚本 |
| tests | `skills/developer-tools-integrations/storage-analyzer/tests` | 自动化测试 |

## 验证方式

```bash
just skills-check
just python-check
just node-test
just ci
```

## 源码路径

- `skills/developer-tools-integrations/storage-analyzer/SKILL.md`
- `skills/developer-tools-integrations/storage-analyzer`
