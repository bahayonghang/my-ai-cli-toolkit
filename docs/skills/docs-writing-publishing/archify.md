# archify

> 此页由 `docs/scripts/sync_docs_catalog.py` 从 `SKILL.md` 自动生成。

## 用途概览

Create professional architecture, workflow, sequence, data-flow, and lifecycle/state diagrams as standalone HTML files with SVG graphics, a built-in dark/light theme toggle, and one-click export to PNG / JPEG / WebP / SVG. Accepts plain-language descriptions or pasted Mermaid code (flowchart, sequenceDiagram, stateDiagram) and lays the diagram out from scratch in archify style.

## 触发场景

- the user asks for system architecture diagrams, infrastructure diagrams, cloud architecture visualizations, security diagrams, network topology, technical workflows, approval flows, runbooks, CI/CD flows, process diagrams, API call sequences, request lifecycles, data pipelines, ETL/ELT maps, PII boundaries, data lineage, state machines, lifecycle diagrams, status transitions, or asks to convert/beautify a Mermaid diagram

## 元数据

| 字段 | 值 |
| --- | --- |
| 名称 | `archify` |
| 分类 | `docs-writing-publishing` (文档写作与发布) |
| 版本 | `2.6` |
| 标签 | `diagrams`, `architecture`, `svg`, `workflow`, `mermaid` |

## 安装命令

```bash
npx skills add bahayonghang/my-claude-code-settings/skills --skill archify
```

## 目录内容

| 路径 | 类型 | 文件数 | 说明 |
| --- | --- | ---: | --- |
| `skills/docs-writing-publishing/archify/assets` | 目录 | 1 | 素材资源 |
| `skills/docs-writing-publishing/archify/examples` | 目录 | 10 | 示例 |
| `skills/docs-writing-publishing/archify/LICENSE` | 文件 | 1 | 顶层目录 |
| `skills/docs-writing-publishing/archify/package-lock.json` | 文件 | 1 | 顶层文件 |
| `skills/docs-writing-publishing/archify/package.json` | 文件 | 1 | 顶层文件 |
| `skills/docs-writing-publishing/archify/renderers` | 目录 | 13 | 顶层目录 |
| `skills/docs-writing-publishing/archify/schemas` | 目录 | 7 | 数据结构 |
| `skills/docs-writing-publishing/archify/scripts` | 目录 | 1 | 可执行脚本 |
| `skills/docs-writing-publishing/archify/tests` | 目录 | 4 | 自动化测试 |

## 脚本、引用与测试资源

| 资源 | 路径 | 用途 |
| --- | --- | --- |
| assets | `skills/docs-writing-publishing/archify/assets` | 素材资源 |
| examples | `skills/docs-writing-publishing/archify/examples` | 示例 |
| schemas | `skills/docs-writing-publishing/archify/schemas` | 数据结构 |
| scripts | `skills/docs-writing-publishing/archify/scripts` | 可执行脚本 |
| tests | `skills/docs-writing-publishing/archify/tests` | 自动化测试 |

## 验证方式

```bash
just skills-check
just node-test
just ci
```

## 源码路径

- `skills/docs-writing-publishing/archify/SKILL.md`
- `skills/docs-writing-publishing/archify`
