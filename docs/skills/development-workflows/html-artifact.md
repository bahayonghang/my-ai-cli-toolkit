# html-artifact

> 此页由 `docs/scripts/sync_docs_catalog.py` 从 `SKILL.md` 自动生成。

## 用途概览

Create single-file, self-contained HTML artifacts for complex, visual, comparison-heavy, reviewable, or shareable work outputs.

## 触发场景

- the user asks for an HTML artifact, browser-viewable report, implementation plan, PR/code review report, architecture explainer, design comparison, research briefing, incident report, status dashboard, temporary structured-data editor, mini deck, or design-system specimen
- Prefer this skill for long Markdown-like outputs that benefit from navigation, cards, diagrams, filters, copy/export buttons, or annotated diffs

## 元数据

| 字段 | 值 |
| --- | --- |
| 名称 | `html-artifact` |
| 分类 | `development-workflows` (开发工作流) |
| 版本 | `0.1.0` |
| 标签 | `html`, `artifact`, `planning`, `code-review`, `reports`, `accessibility`, `offline` |

## 安装命令

```bash
npx skills add bahayonghang/my-claude-code-settings/skills --skill html-artifact
```

## 目录内容

| 路径 | 类型 | 文件数 | 说明 |
| --- | --- | ---: | --- |
| `skills/development-workflows/html-artifact/assets` | 目录 | 1 | 素材资源 |
| `skills/development-workflows/html-artifact/evals` | 目录 | 2 | 评测样例 |
| `skills/development-workflows/html-artifact/references` | 目录 | 12 | 引用资料 |
| `skills/development-workflows/html-artifact/scripts` | 目录 | 1 | 可执行脚本 |
| `skills/development-workflows/html-artifact/tests` | 目录 | 1 | 自动化测试 |

## 脚本、引用与测试资源

| 资源 | 路径 | 用途 |
| --- | --- | --- |
| assets | `skills/development-workflows/html-artifact/assets` | 素材资源 |
| evals | `skills/development-workflows/html-artifact/evals` | 评测样例 |
| references | `skills/development-workflows/html-artifact/references` | 引用资料 |
| scripts | `skills/development-workflows/html-artifact/scripts` | 可执行脚本 |
| tests | `skills/development-workflows/html-artifact/tests` | 自动化测试 |

## 验证方式

```bash
just skills-check
just python-check
just node-test
just ci
```

## 源码路径

- `skills/development-workflows/html-artifact/SKILL.md`
- `skills/development-workflows/html-artifact`
