# Archify

生成专业技术图：以独立 HTML 文件交付，内部使用 inline SVG，并内置深浅色主题切换和导出菜单。

## 适用场景

适合以下需求：

- 生成系统架构图、云基础设施图、安全边界图、网络拓扑图等 polished 技术图
- 把技术流程转成可在浏览器打开的 workflow、审批流、runbook、CI/CD 或事故响应图
- 展示 API 调用序列、请求生命周期、服务交互路径、缓存 fallback 或返回路径
- 绘制数据管道、ETL/ELT、分析链路、PII 边界、consent 路径或治理边界
- 描述状态机、对象生命周期、状态流转、重试、取消、超时或终止状态路径
- 用户希望拿到完成态 `.html` 图，而不是 Mermaid 代码或可编辑白板文件

## 不适用场景

- 图必须直接嵌入 Markdown / README 且要求 Mermaid 语法时，应优先用 `mermaid-expert`
- 用户需要可手工编辑的白板或 canvas 文件时，应优先用 `excalidraw`
- 交付物是插画、海报、宣传图，而不是技术图 artifact 时，应使用图像或设计类技能
- 如果一次简短澄清后节点、流程、状态或信任边界仍然不清楚，不应靠猜测补全

## 默认行为

- **必交付物**：一个独立 `.html` 文件
- **渲染方式**：基于 Archify 自带 HTML 模板，内部使用 inline SVG
- **交互能力**：深浅色主题切换；导出菜单支持 Copy PNG 以及 PNG / JPEG / WebP / SVG 下载
- **主题机制**：使用 CSS variables 和语义 SVG class，不硬编码颜色
- **渲染器准备**：renderer-backed 模式首次使用前，需要在 skill 目录执行 `npm ci`

## 图类型

| 模式 | 适合 | 实现方式 |
| --- | --- | --- |
| `architecture` | 定制化系统、云、拓扑、安全边界图 | 手工定制 `assets/template.html` 中的 SVG |
| `workflow` | 流程泳道、审批、runbook、CI/CD、事故、工具调用 | JSON IR + `renderers/workflow/render-workflow.mjs` |
| `sequence` | 参与者交互、API / 请求生命周期的时间顺序 | JSON IR + `renderers/sequence/render-sequence.mjs` |
| `dataflow` | 数据管道、lineage、PII、治理、数仓和下游消费者 | JSON IR + `renderers/dataflow/render-dataflow.mjs` |
| `lifecycle` | 状态机、状态流转、重试、等待、终态 | JSON IR + `renderers/lifecycle/render-lifecycle.mjs` |

## 工作流

1. 根据用户措辞和交付目标选择图类型。
2. 对 renderer-backed 模式，读取 `references/renderer-modes.md`，必要时从最接近的 `examples/*.json` 开始。
3. 对 architecture 模式，复制 `assets/template.html`，并读取 `references/design-system.md` 与 `references/template-export.md`。
4. 标签应短、语义明确，并能在窄预览中保持可读。
5. 条件允许时，渲染或检查最终 HTML。
6. 返回输出路径、采用的模式、补充假设，以及实际运行过的验证 / 渲染命令。

## 安装与验证

renderer-backed 模式通过内置 npm 依赖 `ajv` 做 JSON Schema 校验。

在 fresh checkout 中，先进入 skill 目录执行一次：

```bash
npm ci
```

然后可以渲染示例，例如：

```bash
node renderers/workflow/render-workflow.mjs examples/agent-tool-call.workflow.json workflow.html
```

如果依赖安装被阻止，应改用 architecture 手工模板模式，或明确说明 blocker；不要声称 renderer 校验已经成功。

## 主要支撑文件

- `content/skills/visual-media-design/archify/SKILL.md`
- `content/skills/visual-media-design/archify/assets/template.html`
- `content/skills/visual-media-design/archify/references/renderer-modes.md`
- `content/skills/visual-media-design/archify/references/design-system.md`
- `content/skills/visual-media-design/archify/references/template-export.md`
- `content/skills/visual-media-design/archify/renderers/*/render-*.mjs`
- `content/skills/visual-media-design/archify/schemas/*.schema.json`
- `content/skills/visual-media-design/archify/examples/*.json`

## 关键约束

- 使用 JSON IR renderer 前必须先安装依赖
- 不要为了单张图绕过 schema 或 layout 失败而修改 renderer
- 使用 `c-backend`、`t-muted`、`a-emphasis` 等 CSS class，避免 inline SVG 颜色
- 箭头应位于组件盒子后方，半透明填充下方使用 `c-mask`
- 图例和 summary 内容应放在图形边界之外
- 图变大时扩展 SVG `viewBox`，不要裁切或挤压布局

## 说明

Archify 与旧的 `architecture-diagram` 有重叠，但范围更广、结构化程度更高：除了手工架构图，还支持 renderer-driven 的 workflow、sequence、dataflow 和 lifecycle 图。
