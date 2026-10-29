# design-atlas

> 此页由 `docs/scripts/sync_docs_catalog.py` 从 `SKILL.md` 自动生成。

## 用途概览

Pick a design language from a categorized offline catalog of 153 entries (84 brands, 68 styles, 1 business scene), write it as DESIGN.md in the project root, then implement or restyle production UI from that file and verify it in a running page.

## 触发场景

- the user asks to list or compare design styles, build a page in the style of a known product (Linear, Vercel, Stripe, Claude, Apple), choose a look such as minimal, editorial, glassmorphism, airy glass, 轻盈毛玻璃, brutalism, or retro, build a BI, analytics, 经营分析, or 数据看板 workbench, create or update DESIGN.md, or implement UI from an existing DESIGN.md / 列出设计风格、按场景选设计、BI 工作台、生成 DESIGN.md、按 DESIGN.md 实施 UI
- Not for HTML reports, plans, or slide-like artifacts (use html-artifact)
- not for recreating a screenshot or mockup (use image-to-ui-skill)
- not for backend or non-UI work

## 元数据

| 字段 | 值 |
| --- | --- |
| 名称 | `design-atlas` |
| 分类 | `development-workflows` (开发工作流) |
| 版本 | `0.3.0` |
| 标签 | `design-system`, `design-atlas`, `design-md`, `frontend`, `ui`, `design-tokens`, `accessibility` |

## 安装命令

```bash
npx skills add bahayonghang/my-claude-code-settings/skills --skill design-atlas
```

## 目录内容

| 路径 | 类型 | 文件数 | 说明 |
| --- | --- | ---: | --- |
| `skills/development-workflows/design-atlas/agents` | 目录 | 1 | 配套 agent |
| `skills/development-workflows/design-atlas/assets` | 目录 | 160 | 素材资源 |
| `skills/development-workflows/design-atlas/evals` | 目录 | 1 | 评测样例 |
| `skills/development-workflows/design-atlas/README.md` | 文件 | 1 | 顶层文件 |
| `skills/development-workflows/design-atlas/references` | 目录 | 4 | 引用资料 |
| `skills/development-workflows/design-atlas/scripts` | 目录 | 2 | 可执行脚本 |
| `skills/development-workflows/design-atlas/tests` | 目录 | 2 | 自动化测试 |

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
just ci
```

此 skill 没有检测到 `tests/*.mjs`；如新增 Node 测试，请让 `just node-test` 覆盖它。

## 源码路径

- `skills/development-workflows/design-atlas/SKILL.md`
- `skills/development-workflows/design-atlas`
