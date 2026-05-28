# spark

> 此页由 `docs/scripts/sync_docs_catalog.py` 从 `SKILL.md` 自动生成。

## 用途概览

Spec-only brainstorming workflow for turning an idea into an approved offline HTML design spec.

## 触发场景

- the user wants to brainstorm an idea or design a feature/spec, especially when the result should be a written spec rather than immediate implementation
- Explores intent and requirements through dialogue, then writes a single-file HTML spec document to docs/spark/ and STOPS
- Does not auto-chain to implementation planning or any other skill

## 元数据

| 字段 | 值 |
| --- | --- |
| 名称 | `spark` |
| 分类 | `development-workflows` (开发工作流) |
| 版本 | `0.2.0` |
| 标签 | `brainstorming`, `spec-writing`, `product-design`, `requirements`, `planning` |

## 安装命令

```bash
npx skills add bahayonghang/my-claude-code-settings/skills --skill spark
```

## 目录内容

| 路径 | 类型 | 文件数 | 说明 |
| --- | --- | ---: | --- |
| `skills/development-workflows/spark/assets` | 目录 | 1 | 素材资源 |
| `skills/development-workflows/spark/README.md` | 文件 | 1 | 顶层文件 |
| `skills/development-workflows/spark/scripts` | 目录 | 5 | 可执行脚本 |
| `skills/development-workflows/spark/spec-document-reviewer-prompt.md` | 文件 | 1 | 顶层文件 |
| `skills/development-workflows/spark/tests` | 目录 | 1 | 自动化测试 |
| `skills/development-workflows/spark/visual-companion.md` | 文件 | 1 | 顶层文件 |

## 脚本、引用与测试资源

| 资源 | 路径 | 用途 |
| --- | --- | --- |
| assets | `skills/development-workflows/spark/assets` | 素材资源 |
| scripts | `skills/development-workflows/spark/scripts` | 可执行脚本 |
| tests | `skills/development-workflows/spark/tests` | 自动化测试 |

## 验证方式

```bash
just skills-check
just node-test
just ci
```

## 源码路径

- `skills/development-workflows/spark/SKILL.md`
- `skills/development-workflows/spark`
