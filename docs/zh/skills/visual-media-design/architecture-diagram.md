# Architecture Diagram

生成深色主题的独立 HTML 架构图，图形内容使用 inline SVG。

## 适用场景

适合以下需求：
- 把系统描述直接变成可在浏览器打开的架构图成品
- 生成系统架构图、云基础设施图、安全边界图、网络拓扑图，并以 HTML 交付
- 希望拿到单个 `.html` 文件，而不是 Mermaid 代码或可编辑白板文件

如果用户明确要 Mermaid、Excalidraw，或者要通用 SVG/PNG 技术图，这个 skill 不应优先触发。

## 不适用场景

- 需要把图直接嵌进 Markdown 或 README 时，应优先用 `mermaid-expert`
- 需要可手工继续编辑的白板式产物时，应优先用 `excalidraw`
- 需要以 `.svg` 为主交付，并在条件允许时补 `.png` 时，应优先用 `fireworks-tech-graph`
- 如果补充澄清一次后，节点、连线或信任边界仍然不清楚，不应靠猜测补全

## 默认行为

- **必交付物**：`.html`
- **渲染方式**：独立 HTML 页面，内部使用 inline SVG
- **默认视觉**：深色主题，并按 frontend、backend、database、cloud、security、external 做语义配色
- **默认命名规则**：用户给了文件名就沿用；否则在当前工作目录生成 `descriptive-name-architecture.html`

## 工作流

1. 先读取 `assets/template.html`
2. 再读取 `references/style.md`
3. 只有当请求和现有案例足够接近时，才参考 `examples/` 中最接近的文件
4. 提取分层、节点、连线、标签、信任边界和图例需求
5. 先做布局选择，再开始改模板
6. 基于模板定制，而不是从零重建页面骨架
7. 写出最终 `.html` 文件，并返回实际路径

## 模板结构

这个 skill 自带的模板不只是空白 SVG 壳，而是已经包含了完整页面骨架：

- 标题与副标题区域
- 一个承载主图的 diagram card
- 图下方 3 个 summary cards，可用于补部署、安全或运行信息
- 一条简洁 footer

因此，默认做法应当是在模板上改造，而不是每次都重写整页 HTML。

## 语义样式

内置样式参考定义了统一的语义颜色和布局规则：

- **Frontend**：青色系
- **Backend**：绿色系
- **Database**：紫色系
- **AWS / Cloud**：琥珀色系
- **Security**：玫瑰色系，常配虚线边界
- **External / Generic**：石板灰系

同时，模板还统一了 JetBrains Mono 字体、圆角组件盒子、虚线区域边界，以及“图例必须放在所有边界之外”的布局规则。

## 输出约定

返回时至少说明：
- HTML 文件路径
- 采用的布局方式
- 使用了哪些假设或补充澄清
- 是否完成了图例位置、间距、边界检查

## 典型适配场景

- Web 应用或三层系统总览图
- AWS / 云区域部署图
- 服务到服务的请求链路图
- 安全边界、信任分区图
- 需要交付为“浏览器可直接打开成品”的网络拓扑图

## 主要支撑文件

- `content/skills/visual-media-design/architecture-diagram/SKILL.md`
- `content/skills/visual-media-design/architecture-diagram/assets/template.html`
- `content/skills/visual-media-design/architecture-diagram/references/style.md`
- `content/skills/visual-media-design/architecture-diagram/examples/web-app.html`
- `content/skills/visual-media-design/architecture-diagram/examples/microservices.html`
- `content/skills/visual-media-design/architecture-diagram/examples/aws-serverless.html`

## 关键约束

- 图例必须放在所有 region、cluster、security boundary 之外
- 箭头应渲染在组件盒子后面
- 纵向堆叠的组件之间要留出足够间距，避免重叠
- 除非用户明确要求内联代码，否则默认交付独立 HTML 成品
- 当图变大时，应扩展 SVG `viewBox`，而不是压缩图例或裁切边界

## 说明

- 这个页面说明的是 skill 的能力边界，以及它默认采用的 HTML 架构图模板模式，不等于完整 SVG 设计手册。
- `examples/` 中的文件更适合在请求形态足够接近时作为布局参考，而不是机械照搬。
