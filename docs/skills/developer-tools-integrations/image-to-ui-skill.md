# image-to-ui-skill

> 此页由 `docs/scripts/sync_docs_catalog.py` 从 `SKILL.md` 自动生成。

## 用途概览

将 UI 截图、设计稿、参考图复刻为可点击的前端/App demo:拆分代码渲染 UI 与必须生成的位图资产，生成提示词并把生成图接回页面。also use for image to UI, UI screenshot to code, clickable app demo, mobile prototype, iOS preview, high-fidelity UI recreation。涉及生图时优先项目指定 image2 入口，失败再走已登记的 OpenRouter ICU gpt-image-2 备案通道并标明实际通道；不要用 imagegen 或其他未指定工具替代。要求做成 App/手机/iOS 预览时，交付带 iOS 外边框的可点击预览与截图验真。

## 触发场景

- 将 UI 截图、设计稿、参考图复刻为可点击的前端/App demo:拆分代码渲染 UI 与必须生成的位图资产，生成提示词并把生成图接回页面。also use for image to UI, UI screenshot to code, clickable app demo, mobile prototype, iOS preview, high-fidelity UI recreation。涉及生图时优先项目指定 image2 入口，失败再走已登记的 OpenRouter ICU gpt-image-2 备案通道并标明实际通道；不要用 imagegen 或其他未指定工具替代。要求做成 App/手机/iOS 预览时，交付带 iOS 外边框的可点击预览与截图验真。

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
| `skills/developer-tools-integrations/image-to-ui-skill/demo` | 目录 | 18 | 顶层目录 |
| `skills/developer-tools-integrations/image-to-ui-skill/README.md` | 文件 | 1 | 顶层文件 |
| `skills/developer-tools-integrations/image-to-ui-skill/references` | 目录 | 8 | 引用资料 |
| `skills/developer-tools-integrations/image-to-ui-skill/scripts` | 目录 | 1 | 可执行脚本 |
| `skills/developer-tools-integrations/image-to-ui-skill/validate.ps1` | 文件 | 1 | 顶层文件 |

## 脚本、引用与测试资源

| 资源 | 路径 | 用途 |
| --- | --- | --- |
| agents | `skills/developer-tools-integrations/image-to-ui-skill/agents` | 配套 agent |
| assets | `skills/developer-tools-integrations/image-to-ui-skill/assets` | 素材资源 |
| references | `skills/developer-tools-integrations/image-to-ui-skill/references` | 引用资料 |
| scripts | `skills/developer-tools-integrations/image-to-ui-skill/scripts` | 可执行脚本 |

## 验证方式

```bash
just skills-check
just python-check
just ci
```

此 skill 没有检测到 `tests/*.mjs`；如新增 Node 测试，请让 `just node-test` 覆盖它。

## 源码路径

- `skills/developer-tools-integrations/image-to-ui-skill/SKILL.md`
- `skills/developer-tools-integrations/image-to-ui-skill`
