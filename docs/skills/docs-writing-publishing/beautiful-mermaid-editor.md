# beautiful-mermaid-editor

> 此页由 `docs/scripts/sync_docs_catalog.py` 从 `SKILL.md` 自动生成。

## 用途概览

Modify the Beautiful Mermaid live editor itself rather than writing ordinary Mermaid diagrams.

## 触发场景

- the task mentions the Beautiful Mermaid repo, editor.ts, generated editor.html, config panel, themes or dark mode, zoom, PNG/SVG export, sample presets, or renderer wiring
- Not for generic Mermaid syntax help

## 元数据

| 字段 | 值 |
| --- | --- |
| 名称 | `beautiful-mermaid-editor` |
| 分类 | `docs-writing-publishing` (文档写作与发布) |
| 版本 | `1.0.0` |
| 标签 | `mermaid`, `diagram-editor`, `bun`, `typescript`, `live-editor`, `svg-export` |

## 安装命令

```bash
npx skills add bahayonghang/my-claude-code-settings/skills --skill beautiful-mermaid-editor
```

## 目录内容

| 路径 | 类型 | 文件数 | 说明 |
| --- | --- | ---: | --- |
| `skills/docs-writing-publishing/beautiful-mermaid-editor/evals` | 目录 | 1 | 评测样例 |
| `skills/docs-writing-publishing/beautiful-mermaid-editor/references` | 目录 | 3 | 引用资料 |
| `skills/docs-writing-publishing/beautiful-mermaid-editor/tests` | 目录 | 1 | 自动化测试 |

## 脚本、引用与测试资源

| 资源 | 路径 | 用途 |
| --- | --- | --- |
| evals | `skills/docs-writing-publishing/beautiful-mermaid-editor/evals` | 评测样例 |
| references | `skills/docs-writing-publishing/beautiful-mermaid-editor/references` | 引用资料 |
| tests | `skills/docs-writing-publishing/beautiful-mermaid-editor/tests` | 自动化测试 |

## 验证方式

```bash
just skills-check
just node-test
just ci
```

## 源码路径

- `skills/docs-writing-publishing/beautiful-mermaid-editor/SKILL.md`
- `skills/docs-writing-publishing/beautiful-mermaid-editor`
