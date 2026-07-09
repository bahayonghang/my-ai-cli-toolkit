# html-artifact

> 此页由 `docs/scripts/sync_docs_catalog.py` 从 `SKILL.md` 自动生成。

## 用途概览

Create self-contained HTML artifacts (single-file by default, split bundles when oversized) for complex, reviewable, or shareable work outputs.

## 触发场景

- Create self-contained HTML artifacts (single-file by default, split bundles when oversized) for complex, reviewable, or shareable work outputs
- Use for an HTML artifact, browser-viewable report, implementation plan, PR/code-review report, dashboard, or mini deck, or for long Markdown-like outputs needing navigation or diagrams
- Not for short answers, commit messages, or production UI

## 元数据

| 字段 | 值 |
| --- | --- |
| 名称 | `html-artifact` |
| 分类 | `development-workflows` (开发工作流) |
| 版本 | `0.3.0` |
| 标签 | `html`, `artifact`, `planning`, `code-review`, `reports`, `accessibility`, `offline` |

## 安装命令

```bash
npx skills add bahayonghang/my-claude-code-settings/skills --skill html-artifact
```

## 目录内容

| 路径 | 类型 | 文件数 | 说明 |
| --- | --- | ---: | --- |
| `skills/development-workflows/html-artifact/assets` | 目录 | 2 | 素材资源 |
| `skills/development-workflows/html-artifact/evals` | 目录 | 2 | 评测样例 |
| `skills/development-workflows/html-artifact/references` | 目录 | 19 | 引用资料 |
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
