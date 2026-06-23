---
name: image-to-ui-skill
description: 将 UI 截图、设计稿、参考图复刻为可点击的前端/App demo:拆分代码渲染 UI 与必须生成的位图资产，生成提示词并把生成图接回页面。also use for image to UI, UI screenshot to code, clickable app demo, mobile prototype, iOS preview, high-fidelity UI recreation。涉及生图时优先项目指定 image2 入口，失败再走已登记的 OpenRouter ICU gpt-image-2 备案通道并标明实际通道；不要用 imagegen 或其他未指定工具替代。要求做成 App/手机/iOS 预览时，交付带 iOS 外边框的可点击预览与截图验真。
category: developer-tools-integrations
tags:
  - image-to-ui
  - codex
  - frontend
  - prototype
  - image2
version: 0.1.0
argument-hint: "[ui-reference-image]"
allowed-tools: Read, Write, Edit, Bash, Glob, Grep
---

# Image to UI Skill

使用这个 skill，把 UI 参考图转成可执行的图片资产方案：先分析哪些区域需要生成图片，再生成、后处理，并集成回 UI。

本文件保留路由、核心生图边界与主流程；App/网页交付、UI 分析、字体、尺寸、提示词写法、抠图、集成、交互、审查、差距核对与最终交付报告等细则已下沉到 `references/`，按需读取(见文末「详细规则索引」)。

## image2 生图优先规则

当用户明确要求“调用 image2 生图”“用 image2 复刻”“参考图片做高保真 UI”，或参考图的效果明显依赖摄影、插画、颗粒、半色调、像素噪点、复杂纹理、景深、真实材质、复杂岛屿/地图/角色等位图质感时，必须优先走真实的 image2 位图生成流程，而不是只用 HTML/CSS/SVG 做近似。

在这类任务里：

- 必须先判断哪些区域属于 **必须真实生图**，哪些区域属于 **必须代码实现**。
- 必须至少生成并落地一批真实位图资产后，才能声称“已经调用 image2”。
- 不要把“用 CSS 画了一个相似背景”“用 SVG 拼了插画”“用渐变和噪点近似了风格”描述成已经完成 image2 生图。
- 如果只是先做代码骨架，必须明确说明“当前仅完成结构 UI，还未真正调用 image2 生成资产”。
- 如果用户要的是高保真复刻，优先生成主视觉、路线插画、卡片缩略图、复杂背景纹理等高影响位图资产，再做 CSS 微调。

以下内容默认视为 **应优先调用 image2**：

- 首屏主视觉海景、人物、产品、摄影感场景
- 带颗粒、半色调、像素噪点、蓝晒/丝网印刷、扫描感的复杂插画
- 跳岛路线图中的岛屿插画、装饰地图、复杂海岸线和非标准装饰物
- 卡片缩略图、场景图、带统一美术风格的多张主题图
- 用代码实现会显著降低质感或极难逼近参考图的区域

以下内容默认 **不要交给 image2**：

- 标题、正文、价格、按钮文案、列表文案、标签、导航文字
- 常规按钮、输入框、卡片、分隔线、底部导航、常规 icon 容器
- 需要保持可访问、可翻译、可交互的 UI 文本

## image2 调用边界

本 skill 里的 `image2` 指项目指定的 image2 调用入口，不等同于任意图片生成工具。当前 skill 也包含一个备案通道：当原生 image2 命令不可用或失败时，`scripts/image2_asset.py` 会在**备案前置条件满足时**自动转到 OpenRouter ICU `gpt-image-2`(前置条件见下方「备案通道前置条件」)。若前置条件不满足，脚本会以非零码明确报错，此时必须如实说明尚未生图，不得声称已落地位图。

执行时：

- 在任何真实生图前，先按 `references/image2-entrypoint.md` 确认当前项目的 image2 调用入口和备案通道。
- 优先调用本 skill 的 `scripts/image2_asset.py`，不要自己重写 API 请求。
- `scripts/image2_asset.py` 会先尝试原生 `image2` 命令或 `IMAGE2_COMMAND` 环境变量；失败后自动调用 `openrouter-icu-image/scripts/openrouter_icu_image.py`，模型固定默认为 `gpt-image-2`。
- 可以把 OpenRouter ICU `gpt-image-2` 记为“image2 备案通道”或“fallback 通道”，但最终必须说明实际走的是 `native-image2` 还是 `openrouter-icu-gpt-image-2`。
- 不要把 `imagegen` skill、其它图片生成插件、随机在线生图服务或手写 SDK 请求当作本 skill 的 image2/fallback 通道。
- 如果原生 image2 和 OpenRouter ICU fallback 都不可用，再停止并说明缺少可用生图入口；不要声称已经生图。
- 可以继续实现代码 UI 骨架，但必须明确标注“尚未完成真实位图资产生成”，不能把代码近似、CSS/SVG 视觉或其它来源图片写成 image2 结果。

### 备案通道前置条件

OpenRouter ICU `gpt-image-2` 备案通道并非无条件可用。`scripts/image2_asset.py` 走 fallback 需要同时满足：

- **能定位 OpenRouter ICU CLI**:在本 skill 同级目录安装 `openrouter-icu-image` skill(脚本默认查找 `openrouter-icu-image/scripts/openrouter_icu_image.py`),或显式设置 `OPENROUTER_ICU_IMAGE_CLI` 指向该脚本。本仓库默认不附带该兄弟 skill，需要时另行安装或配置。
- **凭据可用**:设置 `OPENROUTER_ICU_API_KEY` 或 `OPENAI_API_KEY`。

任一前置条件不满足时，脚本会以非零码报错(例如 `OpenRouter ICU fallback CLI not found`，或提示需要配置 API key),不会产出位图。此时按下文「真实生图验真」与 `references/image2-entrypoint.md` 的「找不到入口时怎么办」处理:完成 UI 拆解、资产清单、提示词与代码骨架，明确标注“尚未完成真实位图资产生成”,不得用 CSS/SVG 代码近似冒充 image2 结果。

### 生图命令

文本生图：

```powershell
python scripts\image2_asset.py generate `
  --prompt "为 App 首屏生成一张无文字、无 logo 的高级时尚产品主视觉，留出左侧文案空间，柔和自然光，4:3" `
  --output public\generated\hero-main.png `
  --size 1536x1024 `
  --quality medium `
  --output-format png
```

参考图编辑或多图参考：

```powershell
python scripts\image2_asset.py edit `
  --image reference.png `
  --prompt "保留参考图主体轮廓和色彩气质，生成无文字、无 logo 的 UI 卡片缩略图，适合 3:2 裁切" `
  --output public\generated\card-visual.png `
  --size 1536x1024 `
  --quality medium `
  --output-format png
```

强制只测试原生 image2：

```powershell
python scripts\image2_asset.py generate `
  --prompt "test image" `
  --output output\generated\test.png `
  --prefer image2
```

强制走备案通道：

```powershell
python scripts\image2_asset.py generate `
  --prompt "test image" `
  --output output\generated\test.png `
  --prefer fallback
```

OpenRouter ICU fallback 需要 `OPENROUTER_ICU_API_KEY` 或 `OPENAI_API_KEY` 可用。脚本会用当前 Python 运行已安装的 OpenRouter ICU CLI，不使用 `py -3`。

## image2 最小闭环

当任务触发 image2 流程时，至少完成这个闭环：

1. 从参考图中拆出必须生图的资产类别。
2. 为每个资产或同风格资产组编写可执行提示词。
3. 实际调用 `scripts/image2_asset.py`，优先原生 image2，必要时自动备案 OpenRouter ICU `gpt-image-2`，产出真实位图文件。
4. 必要时做裁切、切片、透明化、尺寸修正或导出不同槽位版本。
5. 将生成结果接回前端页面，而不是只停留在“生成了一张图”。
6. 打开真实页面截图，验证这些资产已经被渲染，而不是停留在本地文件夹。
7. 在最终汇报里列出生成资产路径，并明确说明哪些视觉区域已经改为真实生图。

如果上述 1-7 没完成，不要把任务描述成“已用 image2 完成复刻”；应准确描述为“已完成部分生图”或“仅完成生图准备”。

## 核心流程

1. 在编辑代码或生成图片之前，先检查用户提供的每一张 UI 参考图。
2. 将 UI 拆分为：
   - **代码渲染 UI**：布局、文字、按钮、卡片、简单渐变、边框、阴影、开关、表单、图表和重复组件。
   - **图标资产**：优先使用项目已有图标库或 lucide 风格矢量图标。只有当图标是自定义插画式标记，且设计系统无法表达时，才生成图标。
   - **image-to-ui 图片资产**：照片、插画、产品渲染图、角色、复杂纹理、复杂首屏背景、真实物体、App 展示图、装饰性位图，以及用代码复刻会脆弱或低质的视觉内容。
   - **抠图资产**：需要透明 PNG/WebP、遮罩或去背景的前景人物、产品、物体。
3. 先输出前期审查文档，说明哪些元素好还原、哪些元素不好还原、哪些需要生成图片、哪些需要用户确认；如果用户已经明确要求“直接做”或“直接复刻”，可以跳过等待，但仍要先在内部完成这一步拆解。
4. 等用户确认关键问题后，再进入生图；如果用户明确要求“直接继续”，可以用合理假设继续，但要记录假设。
5. 生成前输出资产清单。清单要包含资产 id、UI 位置、目标槽位尺寸、导出尺寸、宽高比、生成提示词、后处理需求、集成目标，以及“是否必须真实 image2 生图”的判断。
6. 只生成真正需要位图生成的资产。结构性 UI、可读文字和普通控件继续用代码实现。
7. 对需要统一风格的一组资产，优先考虑“一次生成统一资产板，再切片导出”的方案，减少风格漂移。
8. 按需做后处理：裁剪、缩放、去背景、添加 alpha、压缩和尺寸验证。
9. 将生成资产集成到 UI 中，使用稳定尺寸、`object-fit`、响应式约束、alt 文本和必要的懒加载。
10. 给页面补齐可点击行为和跳转逻辑：明显的按钮、链接、返回/关闭、卡片、标签、导航项都要有真实交互；多屏参考图要自动串成可流转原型。
11. 对完整页面做最终审查：检查尺寸、乱码、排版、响应式、图片嵌入、代码 UI 的融合和交互跳转是否自然。
12. 将最终页面截图与原始 UI 参考图做差距核对，列出差异，修正后再次截图对比。
13. 如果目标是前端应用，最后用渲染截图和点击路径验证效果，并确认截图里真实出现了 image2 资产。

确认 image2 调用入口、判断能否真实生图时，读取 `references/image2-entrypoint.md`。构建资产清单、编写 image-to-ui 提示词、计算输出尺寸或规划抠图/去背景时，读取 `references/asset-manifest-and-prompts.md`。

当用户要把社媒视觉热点、INS/Pinterest 小趋势或图像创作工具做成可用网页，并关心上线验证、传播数据或技术社区案例时，可读取 `references/hicolor-case-study.md` 作为真实项目参考。

## 真实生图验真

如果任务涉及 image2，最终必须输出一段“生图验真”信息，至少包含：

- 实际生成了哪些资产
- 每个资产的落地路径
- 每个资产实际使用的通道：`native-image2` 或 `openrouter-icu-gpt-image-2`
- 哪些页面区域已经替换为真实位图
- 哪些区域仍然是代码近似
- 用什么截图或页面验证方式确认这些资产已经显示

禁止出现以下误导性表述：

- “已按 image2 流程完成”，但没有任何新生成位图文件
- “已经生图”，但图片没有接入页面
- “已经高保真复刻”，但复杂视觉仍全部由 CSS/SVG 临摹

如果页面仍主要依赖代码近似，必须明确写成：

- “当前为结构复刻版，尚未完成真实 image2 资产替换”
- 或 “当前仅首页主视觉已接入生图，其余区域仍待补齐”

## 详细规则索引

以下细则均从本 skill 下沉到 `references/`，内容与此前 SKILL.md 一致，按需读取：

- `references/image2-entrypoint.md` — 确认 image2 调用入口、备案通道与生图后的验真记录。
- `references/asset-manifest-and-prompts.md` — 前期审查模板、资产清单模板、image2 提示词模板、页面级检查清单。
- `references/delivery-app-and-web.md` — App 形式触发规则(iOS 外边框、Dynamic Island、可点击预览、截图验真)与网页交付默认规则。
- `references/integration-rules.md` — UI 分析规则、字体识别与加载、尺寸规划、image-to-ui 提示词写法、抠图与去背景、集成规则、交互与跳转。
- `references/review-and-gap-check.md` — 前期审查与确认、常见风险与防护、页面级审查、原图差距核对与迭代、最终交付报告。
- `references/hicolor-case-study.md` — 把社媒视觉趋势做成可上线网页的真实项目案例。
