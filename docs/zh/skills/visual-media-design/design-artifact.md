# Design Artifact

生成 HTML-first 的独立设计产物。

## 适用场景

适合以下需求：

- 做一个可在浏览器直接打开的产品原型或流程演示
- 把 brief 变成 launch page、narrative page、feature story page 这类完整页面成品
- 做 HTML deck 或 storyboard，而不是 PPTX
- 做 motion concept、状态切换演示、时间轴型交互稿
- 把 2 到 4 个设计方向放进同一个 HTML 成品里比较

即使用户没有明确说 "HTML"，只要目标显然是浏览器可打开的独立设计产物，这个 skill 也应优先触发。

## 不适用场景

- 用户明确点名真实品牌并要迁移那套视觉语言时，应优先用 `brand-design-md`
- 现有产物只需要换主题、配色或字体时，应优先用 `theme-factory`
- 请求本质是架构图、流程图、Mermaid、Excalidraw 或技术图时，应转向对应图表 skill
- 请求本质是海报、长图、知识卡片时，应优先用 `card`
- 请求本质是插画、图像生成或修图时，应优先用 `gemini-image`

## 默认行为

- **默认交付物**：独立 `.html`
- **默认实现方式**：内联 CSS + 轻量 JavaScript
- **默认工作姿势**：先读取用户给的 brief、截图、代码、tokens，再决定界面方向
- **默认多方向策略**：如果任务核心是比较，优先把多个方向放进一个 artifact，而不是拆很多零散文件

## 支持的模式

1. **Product Prototype**：产品界面、流程、状态、交互逻辑
2. **Landing or Narrative Page**：讲述型页面、发布页、概念页
3. **HTML Deck or Storyboard**：HTML 幻灯或分镜顺序稿
4. **Motion Demo**：时间轴、动效、状态切换演示
5. **Comparative Exploration**：一个成品里并排比较多种方向

## 内置模板

这个 skill 提供可复用的 starter components，而不是只绑定一种页面骨架：

- `design_canvas.jsx`：多方向对比画布
- `browser_window.jsx`：桌面浏览器外框
- `ios_frame.jsx`：移动端设备外框
- `deck_stage.js`：HTML deck / storyboard 外壳
- `animations.jsx`：时间轴动效脚手架

这些模板都只是起点。只有当它们能明显减少重复工作或提高质量时，才应加载。

## 输出约定

返回时至少说明：

- 最终 artifact 路径
- 选中的 artifact mode
- 用于 grounding 的上下文来源
- 关键假设
- 下一轮最值得迭代的方向

## 主要支撑文件

- `content/skills/visual-media-design/design-artifact/SKILL.md`
- `content/skills/visual-media-design/design-artifact/references/artifact-modes.md`
- `content/skills/visual-media-design/design-artifact/references/workflow.md`
- `content/skills/visual-media-design/design-artifact/references/anti-slop.md`
- `content/skills/visual-media-design/design-artifact/references/starter-components.md`
- `content/skills/visual-media-design/design-artifact/references/verification.md`

## 说明

- 名字去掉了 `html`，但这一版仍然坚持 HTML-first。
- 这一阶段不引入宿主专用 agent 适配，也不补 PPTX / PDF 导出脚本。
- 如果用户提到现有应用或代码库，默认仍然交付独立 HTML artifact；只有在用户明确要求时才转向原框架内改造。
