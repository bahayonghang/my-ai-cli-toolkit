---
name: card
description: "Turn URLs, pasted text, Markdown, or article files into PNG knowledge cards and visual explainers. Supports five modes: `-l` long reading card, `-i` infographic, `-m` multi-card carousel, `-v` sketchnote, and `-c` black-and-white manga comic. Use whenever the user asks to make content into a card, long image, infographic, visual note, sketchnote, comic, manga page, or says '铸' / 'cast' / '做成图' / '做成卡片' / '视觉化一下', even if they do not specify a mode. Choose the best-fit mode automatically when no flag is given. Do not use it for generic photo illustration, slide decks, or editable diagram authoring."
category: visual-media-design
tags: [card, png, infographic, sketchnote, comic, visualization, longform]
version: "1.8.0"
---

# card: 铸

将内容铸成可见的形态。内容进去，HTML 与 PNG 出来。模具决定形状，根 Skill 负责路由、质检与交付。

## 参数

| 参数 | 模具 | 尺寸 | 说明 |
|------|------|------|------|
| `-l`（默认） | 长图 | 1080 x auto | 单张阅读卡，内容自动撑高 |
| `-i` | 信息图 | 1080 x auto | 内容驱动的自适应视觉布局 |
| `-m` | 多卡 | 1080 x 1440 | 自动切分为多张阅读卡片 |
| `-v` | 视觉笔记 | 1080 x auto | 手绘风格 sketchnote，动态选择风格路线 |
| `-c` | 漫画 | 1080 x auto | 日式黑白漫画风格，动态选择漫画家视觉语言 |

## 输入与输出

### 可接受输入

- URL
- 粘贴文本
- Markdown / 文章文件路径
- 已经整理好的提纲、要点、框架说明

### 输出策略

- 若用户给出输出路径，优先使用该路径。
- 若用户未给出路径，使用默认输出目录 `~/Downloads/`。
- 始终先生成 HTML，再生成 PNG。
- 单张模式返回：所选 mode、HTML 路径、PNG 路径。
- 多卡模式返回：卡片数量、每张 HTML 路径、每张 PNG 路径。

本 skill 输出为视觉文件，不适用 L0 中的 Org-mode、Denote 和 ASCII-only 规范。

## 共享执行协议

### 获取内容

- URL：优先用轻量网页读取方式抓正文。
- 粘贴文本：直接使用。
- 文件路径：读取本地文件内容。

除非用户要求保留原文的全部噪声，先去掉明显无关的导航、广告、脚注和样板语，再交给对应模具。

### 文件命名

从内容提取标题或核心思想作为 `{name}`（中文直接用，去标点，≤ 20 字符）。

### 输出目录

记 `output_dir` 为最终 PNG 与 HTML 的保存目录：

- 用户指定路径：按用户指定
- 用户未指定：`~/Downloads/`

### 截图工具

```bash
node "$SKILL_DIR/scripts/capture.js" <html> <png> <width> <height> [fullpage]
```

依赖：Skill 目录内的 Playwright。如报错：

```bash
cd "$SKILL_DIR" && npm install && npx playwright install chromium
```

### arxiv 检测

内容来源为 arxiv 论文时（URL 含 `arxiv.org`、文件名含 `paper` 标签、或内容中出现 arxiv ID），提取 arxiv ID（格式 `XXXX.XXXXX`），在卡片 footer 右侧显示。适用于 `-l` 和 `-i` 模具（`-m` 多卡无 footer，不适用）。

## 品味准则

**所有模具共享**。执行任何模具前，先 Read `$SKILL_DIR/references/taste.md`，把它作为视觉质量底线。

核心：反 AI 生成痕迹。禁 Inter 字体默认方案、禁纯黑、禁三等分卡片、禁居中 Hero、禁 AI 文案腔、禁假数据。

`-l/-m/-i` 另外必须 Read `$SKILL_DIR/references/editorial-typography.md`。这三个 editorial mode 使用 Skill 自带的本地仓耳今楷，不依赖远程字体。

## Mode 选择

显式参数优先。若用户已经给出 `-l/-i/-m/-v/-c`，不要擅自改模具。

用户未指定参数时，按内容与目标自动路由：

- `-l`：线性阅读型内容、文章摘要、观点长文、阅读卡
- `-i`：结构化知识、对比、框架、步骤、数据密集内容
- `-m`：明显超出单张承载能力，或用户明确要轮播 / 分页 / 多页卡片
- `-v`：概念关系、教学拆解、因果链、节点网络
- `-c`：叙事张力、角色冲突、阶段转折、需要漫画化表达的内容

若仍然模糊，默认 `-l`，同时在结果中明确说明这是保守选择。

## 统一工作流

1. 获取内容并去噪。
2. 提取标题、核心命题、来源信息与 `{name}`。
3. 决定 mode。
4. Read `$SKILL_DIR/references/taste.md` 与对应 mode 文档。
   `-l/-m/-i` 还要 Read `$SKILL_DIR/references/editorial-typography.md`。
5. 用 mode 文档指导生成完整 HTML。
6. 先做 mode 自检，再做根 Skill 统一质检。
7. 保存 HTML 到 `output_dir`。
8. 调用 `$SKILL_DIR/scripts/capture.js` 生成 PNG。
9. 返回交付路径，不要只说“已生成”。

## 统一失败检查

在任何模具下，若出现以下情况，视为失败并重做：

- 标题拥挤、遮挡正文，或侵入主内容区
- 版面退化为等分卡片墙，没有主次层级
- 留白明显失控，看上去像没做完，而不是有意呼吸
- 手机缩放后正文或标注不可读
- 视觉语言与内容不匹配
- 结果带明显 AI 味：默认字体、默认阴影、默认渐变、均匀模板感、空洞文案

先调整结构与层级，再考虑删减内容。不要一上来就砍信息量。

## 交付契约

### 单张模式（`-l/-i/-v/-c`）

- 报告所选 mode
- 报告 HTML 路径
- 报告 PNG 路径
- 如有 arXiv ID，说明已写入 footer（仅 `-l/-i`）

### 多卡模式（`-m`）

- 报告卡片总数
- 按顺序列出每张卡的 HTML 路径与 PNG 路径
- 给每张卡一句极短摘要，方便人工核对分页是否合理

## 模具资源

根据参数选择模具，Read `$SKILL_DIR/references/taste.md` + 对应 mode 文件，按步骤执行：

### -l（默认）：长图

Read `$SKILL_DIR/references/editorial-typography.md` + `$SKILL_DIR/references/mode-long.md`，按其步骤执行。

模板：`$SKILL_DIR/assets/long_template.html`

### -i：信息图

Read `$SKILL_DIR/references/editorial-typography.md` + `$SKILL_DIR/references/mode-infograph.md`，按其步骤执行。

模板：`$SKILL_DIR/assets/infograph_template.html`

### -m：多卡

Read `$SKILL_DIR/references/editorial-typography.md` + `$SKILL_DIR/references/mode-multi.md`，按其步骤执行。

模板：`$SKILL_DIR/assets/poster_template.html`

### -v：视觉笔记

Read `$SKILL_DIR/references/mode-sketchnote.md`，按其步骤执行。

模板：`$SKILL_DIR/assets/sketchnote_template.html`

### -c：漫画

Read `$SKILL_DIR/references/mode-comic.md`，按其步骤执行。

模板：`$SKILL_DIR/assets/comic_template.html`
