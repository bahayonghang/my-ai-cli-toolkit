---
name: brand-design-md
description: 当用户明确点名真实品牌、产品或媒体站点的视觉语言，并希望先从 getdesign.md 拉取结构化设计规范，再据此生成或改造 UI 代码时使用。适用于“做成 Apple/Stripe/Notion/WIRED 的感觉”“参考某品牌官网风格做页面”“把现有 React 组件改成 Vercel 风格”这类请求，即使用户没提 getdesign.md 也应优先触发。不要用于泛化的“更现代一点”、logo 设计、图片/海报生成、幻灯片换皮、图表/流程图或纯设计分析。
category: visual-media-design
tags: [brand-style, design-system, getdesign, ui-code, html, react, vue]
version: 1.0.0
argument-hint: [brand-style-ui-request]
---

# Brand Design MD

让模型先拿到真实品牌的结构化设计规范，再去写 UI，而不是靠“像某某风格”盲猜。

## 何时使用

优先用于这些场景：

- 用户明确点名某个品牌、产品或媒体站点的视觉语言
- 用户要“参考某品牌官网风格”生成新页面、新组件或新原型
- 用户要把现有 React/Vue/HTML 组件改造成某品牌风格
- 用户要混搭两个明确品牌，并希望说明各自负责哪一层设计语言

不要用于这些场景：

- 只说“现代一点”“高级一点”“更有设计感”
- logo 设计、图片/海报生成、视觉卡片、流程图/架构图、幻灯片主题替换
- 纯设计分析或品牌研究，而不需要产出 UI 代码

## 运行入口

先使用本地 helper，不要在 `SKILL.md` 里手工维护品牌主表，也不要假设固定的 `/tmp/.../DESIGN.md` 路径。

### Helper commands

```bash
node "$SKILL_DIR/scripts/getdesign-helper.mjs" list --json
node "$SKILL_DIR/scripts/getdesign-helper.mjs" resolve --query "<user request>"
node "$SKILL_DIR/scripts/getdesign-helper.mjs" fetch --slug <brand-slug>
node "$SKILL_DIR/scripts/getdesign-helper.mjs" fetch --slug <brand-slug> --out <target-file>
```

这个 helper 负责：

- 用 `npx getdesign@latest list` 获取官方实时品牌目录
- 维护小型 alias 层（中文名、常见别称、易混写法）
- 按固定顺序做品牌解析：`alias -> slug -> fuzzy`
- 用 `npx getdesign@latest add <slug> --out <path>` 固定输出文件路径

## 工作流

### 1. 先判断是“新建原型”还是“改现有项目”

- 如果用户是在现有 repo/组件里改造，先读当前框架、组件结构、样式组织方式，再输出该栈里的增量代码。
- 如果用户没有给现成代码或没有指定框架，默认输出完整单文件 HTML。

不要把“改 React 组件”重写成脱离上下文的新 HTML 原型。

### 2. 解析品牌

把完整用户请求传给 helper 的 `resolve` 命令。

- 如果 `resolution` 是 `exact`，直接使用返回的 `matches`
- 如果 `resolution` 是 `fuzzy` 且只有一个高置信命中，可以继续并在回复里说明这个假设
- 如果 `resolution` 是 `none`，或模糊结果不够稳，直接展示 helper 返回的 `suggestions`，不要瞎猜

默认最多支持 2 个品牌：

- 1 个品牌：直接采用该品牌规范
- 2 个品牌：第一个品牌负责布局、密度、组件结构；第二个品牌负责强调色、排版气质或用户明确指定的维度
- 3 个以上品牌：先要求用户收敛到 1-2 个，否则输出质量和归因都会失真

### 3. 获取 DESIGN 规范

对每个选中的品牌运行 helper `fetch`：

- 未指定输出路径时，让 helper 写入临时文件
- 只有当用户明确要求“把规范保存到项目里”时，才传 `--out <project path>`

然后读取 helper 返回的 `outPath` 指向的文件内容。

## 如何使用 DESIGN 内容

从 DESIGN 文本里至少提取并核对这 4 类 token：

- 颜色：背景、正文、强调、边框
- 排版：字体、字号、字重、行高、字距
- 间距：section spacing、组件 padding、布局密度
- 形状：圆角、描边、阴影

如果规范里给了精确值，就直接复用，不要自由近似。

错误示例：

- 把 `rgba(...)` 自作主张改成近似 hex
- 把负字距四舍五入
- 只复用主色，却把整体密度和排版节奏改成通用 AI 模板

## 混搭规则

只有两个品牌时，按这个顺序处理：

1. 先确定主品牌和副品牌
2. 主品牌负责页面结构、组件骨架、间距密度
3. 副品牌负责强调色、排版情绪或用户点名的维度
4. 如果用户明确点名“Apple 留白 + Claude 强调色”这类组合，按用户指定维度覆盖默认规则

混搭输出里必须解释：

- 选择了哪些 slug
- 哪些 token 来自主品牌
- 哪些 token 来自副品牌

## 输出契约

无论输出 HTML、React 还是 Vue，都要满足：

1. 先说明最终使用的品牌和 slug
2. 说明是“新建原型”还是“改现有项目”路径
3. 代码注释或交付说明里列出关键 token 来源
4. 至少点名 4 类被直接复用的 token
5. 混搭时明确写出“哪部分来自哪个品牌”

默认输出：

- 绿地场景：单文件 HTML
- 已给定框架：沿用原框架
- 只有在用户明确要求时，才把 DESIGN 文件保存进项目目录

## 失败与降级

- `getdesign` 不可用或 `npx` 失败：明确报错，并建议用户检查 Node.js / `npx`
- 品牌未命中：优先展示 helper 的前 3 个建议，不要自己编造品牌支持列表
- 上游品牌目录变化：以 `list` 实时结果为准，本 skill 不应因为 README 里的静态数字而失效

## 最后自检

在交付前，快速核对：

- 品牌解析是否来自 helper，而不是手写猜测
- 选中的 slug 是否真实存在于 `getdesign list`
- 至少 4 类 token 是否能在 DESIGN 文本中找到直接证据
- 现有项目请求是否保持了原框架和原组件形态
- 混搭时是否说清了主品牌、副品牌和各自负责的层次
