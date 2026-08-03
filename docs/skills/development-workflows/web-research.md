# web-research

> 此页由 `docs/scripts/sync_docs_catalog.py` 从 `SKILL.md` 自动生成。

## 用途概览

跨平台互联网来源发现、核验与本地归档。.

## 触发场景

- the user wants to find, verify, then locally save specific web sources — 找来源, 搜一下某个平台上的讨论, 核验这几个链接, 把这些内容存到本地, 批量归档链接, collect and archive sources. 固定流程是发现 → 候选清单 → 用户确认 → 归档；搜索结果绝不自动转下载。

## 元数据

| 字段 | 值 |
| --- | --- |
| 名称 | `web-research` |
| 分类 | `development-workflows` (开发工作流) |
| 版本 | `0.1.0` |
| 标签 | `web-search`, `source-discovery`, `archiving`, `verification`, `safety-boundaries` |

## 安装命令

```bash
npx skills add bahayonghang/my-claude-code-settings/skills --skill web-research
```

## 目录内容

| 路径 | 类型 | 文件数 | 说明 |
| --- | --- | ---: | --- |
| `skills/development-workflows/web-research/agents` | 目录 | 1 | 配套 agent |
| `skills/development-workflows/web-research/evals` | 目录 | 1 | 评测样例 |
| `skills/development-workflows/web-research/README.md` | 文件 | 1 | 顶层文件 |

## 脚本、引用与测试资源

| 资源 | 路径 | 用途 |
| --- | --- | --- |
| agents | `skills/development-workflows/web-research/agents` | 配套 agent |
| evals | `skills/development-workflows/web-research/evals` | 评测样例 |

## 验证方式

```bash
just skills-check
just ci
```

此 skill 没有检测到 `tests/*.mjs`；如新增 Node 测试，请让 `just node-test` 覆盖它。

## 源码路径

- `skills/development-workflows/web-research/SKILL.md`
- `skills/development-workflows/web-research`
