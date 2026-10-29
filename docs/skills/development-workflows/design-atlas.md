# design-atlas

> 此页由 `docs/scripts/sync_docs_catalog.py` 从 `SKILL.md` 自动生成。

## 用途概览

UI design skill with an offline catalog of 202 design languages (84 brands, 67 styles, 50 material themes, 1 business scene). Picks one for the project automatically when none is set, writes it as DESIGN.md, implements or restyles production UI from it, and checks the result against anti-AI-slop gates.

## 触发场景

- the user asks to build or restyle a page or component, list or compare design styles or themes, design in the style of a known product (Linear, Vercel, Stripe, Apple), use a look such as minimal, editorial, riso, newsprint, terminal, glassmorphism, 轻盈毛玻璃, or brutalism, build a BI / 经营分析 / 数据看板 workbench, create or follow DESIGN.md, or audit a page for AI slop / 自动选主题、生成 DESIGN.md、按 DESIGN.md 实施 UI、页面去 AI 模板味、审查 AI 味
- Not for copy or prose de-AI rewriting (use write), HTML reports, plans, or slides (use html-artifact), screenshot or mockup recreation (use image-to-ui-skill), or backend work

## 元数据

| 字段 | 值 |
| --- | --- |
| 名称 | `design-atlas` |
| 分类 | `development-workflows` (开发工作流) |
| 版本 | `0.3.0` |
| 标签 | `design-system`, `design-md`, `frontend`, `ui`, `design-tokens`, `accessibility`, `anti-ai-slop` |

## 安装命令

```bash
npx skills add bahayonghang/my-claude-code-settings/skills --skill design-atlas
```

## 目录内容

| 路径 | 类型 | 文件数 | 说明 |
| --- | --- | ---: | --- |
| `skills/development-workflows/design-atlas/agents` | 目录 | 1 | 配套 agent |
| `skills/development-workflows/design-atlas/assets` | 目录 | 213 | 素材资源 |
| `skills/development-workflows/design-atlas/evals` | 目录 | 1 | 评测样例 |
| `skills/development-workflows/design-atlas/README.md` | 文件 | 1 | 顶层文件 |
| `skills/development-workflows/design-atlas/references` | 目录 | 8 | 引用资料 |
| `skills/development-workflows/design-atlas/scripts` | 目录 | 3 | 可执行脚本 |
| `skills/development-workflows/design-atlas/tests` | 目录 | 27 | 自动化测试 |

## 脚本、引用与测试资源

| 资源 | 路径 | 用途 |
| --- | --- | --- |
| agents | `skills/development-workflows/design-atlas/agents` | 配套 agent |
| assets | `skills/development-workflows/design-atlas/assets` | 素材资源 |
| evals | `skills/development-workflows/design-atlas/evals` | 评测样例 |
| references | `skills/development-workflows/design-atlas/references` | 引用资料 |
| scripts | `skills/development-workflows/design-atlas/scripts` | 可执行脚本 |
| tests | `skills/development-workflows/design-atlas/tests` | 自动化测试 |

## 验证方式

```bash
just skills-check
just python-check
just node-test
just ci
```

## 源码路径

- `skills/development-workflows/design-atlas/SKILL.md`
- `skills/development-workflows/design-atlas`
