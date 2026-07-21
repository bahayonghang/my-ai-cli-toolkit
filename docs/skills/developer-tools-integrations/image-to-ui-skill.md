# image-to-ui-skill

> 此页由 `docs/scripts/sync_docs_catalog.py` 从 `SKILL.md` 自动生成。

## 用途概览

将 UI 截图或设计稿复刻为可点击前端/App demo，区分代码 UI 与真实位图资产。Use for image-to-UI, screenshot-to-code, clickable app/iOS prototypes, or faithful recreation; exclude image-only generation and reference-free UI polish.

## 触发场景

- 将 UI 截图或设计稿复刻为可点击前端/App demo，区分代码 UI 与真实位图资产。Use for image-to-UI, screenshot-to-code, clickable app/iOS prototypes, or faithful recreation
- exclude image-only generation and reference-free UI polish

## 元数据

| 字段 | 值 |
| --- | --- |
| 名称 | `image-to-ui-skill` |
| 分类 | `developer-tools-integrations` (开发者工具集成) |
| 版本 | `0.1.0` |
| 标签 | `image-to-ui`, `codex`, `frontend`, `prototype`, `image2` |

## 安装命令

```bash
npx skills add bahayonghang/my-claude-code-settings/skills --skill image-to-ui-skill
```

## 目录内容

| 路径 | 类型 | 文件数 | 说明 |
| --- | --- | ---: | --- |
| `skills/developer-tools-integrations/image-to-ui-skill/.gitignore` | 文件 | 1 | 顶层文件 |
| `skills/developer-tools-integrations/image-to-ui-skill/agents` | 目录 | 1 | 配套 agent |
| `skills/developer-tools-integrations/image-to-ui-skill/assets` | 目录 | 21 | 素材资源 |
| `skills/developer-tools-integrations/image-to-ui-skill/demo` | 目录 | 22 | 顶层目录 |
| `skills/developer-tools-integrations/image-to-ui-skill/evals` | 目录 | 1 | 评测样例 |
| `skills/developer-tools-integrations/image-to-ui-skill/README.md` | 文件 | 1 | 顶层文件 |
| `skills/developer-tools-integrations/image-to-ui-skill/references` | 目录 | 8 | 引用资料 |
| `skills/developer-tools-integrations/image-to-ui-skill/scripts` | 目录 | 2 | 可执行脚本 |
| `skills/developer-tools-integrations/image-to-ui-skill/tests` | 目录 | 3 | 自动化测试 |

## 脚本、引用与测试资源

| 资源 | 路径 | 用途 |
| --- | --- | --- |
| agents | `skills/developer-tools-integrations/image-to-ui-skill/agents` | 配套 agent |
| assets | `skills/developer-tools-integrations/image-to-ui-skill/assets` | 素材资源 |
| evals | `skills/developer-tools-integrations/image-to-ui-skill/evals` | 评测样例 |
| references | `skills/developer-tools-integrations/image-to-ui-skill/references` | 引用资料 |
| scripts | `skills/developer-tools-integrations/image-to-ui-skill/scripts` | 可执行脚本 |
| tests | `skills/developer-tools-integrations/image-to-ui-skill/tests` | 自动化测试 |

## 验证方式

```bash
just skills-check
just python-check
just node-test
just ci
```

## 源码路径

- `skills/developer-tools-integrations/image-to-ui-skill/SKILL.md`
- `skills/developer-tools-integrations/image-to-ui-skill`
