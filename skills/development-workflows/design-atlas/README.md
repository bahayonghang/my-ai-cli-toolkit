# design-atlas

> 原名 `design-md`，0.3.0 起改名为 `design-atlas`。项目里生成的文件仍叫 `DESIGN.md`。旧的 `--skill design-md` 安装命令已失效，请改用下面的命令。

一个完整的 UI 设计 skill：从离线设计目录里为项目选定设计语言（项目没指定时自动选），写成项目根目录的 `DESIGN.md`，按它实施前端 UI，并用 anti-AI-slop 门禁检查结果，避免页面看起来像 AI 生成的模板。

A complete UI design skill: pick a design language from an offline catalog (automatically when the project has none), write it as the project-root `DESIGN.md`, build UI from it, and check the result against anti-AI-slop gates.

目录共 202 个可见条目：84 个受真实产品启发的品牌、67 个通用风格、50 个材质主题（来自 hallmark）、1 个业务场景。

## 适用场景

- 列出、搜索或比较设计条目，按类别浏览
- 项目没有 `DESIGN.md`、用户也没点名风格时，按项目需求自动选择条目
- 按某个产品的设计语言做页面（Linear、Vercel、Stripe、Claude、Apple 等）
- 选一种通用风格或材质主题（极简、编辑排版、riso 双色印刷、报纸、终端、玻璃拟态等）
- 按业务场景做页面，例如 BI、经营分析或数据看板工作台
- 给项目创建、定制或更换 `DESIGN.md`，按已有 `DESIGN.md` 实施或改造页面
- 审查已有页面的“AI 模板味”（只出报告，不改文件）

不适用：文案或段落的去 AI 味改写（用 `write`）；HTML 报告、计划、幻灯片式产出物（用 `html-artifact`）；截图或设计稿复刻（用 `image-to-ui-skill`）；非 UI 任务。

## 安装

在本仓库根目录把 skill 链接到当前项目：

```bash
just install-projects
```

或从 GitHub 安装：

```bash
npx skills add https://github.com/bahayonghang/my-ai-cli-toolkit --skill design-atlas
```

需要 Python 3.9+；anti-slop 检查脚本需要 Node 20+（零依赖）。

## 示例请求

- 帮我给精酿啤酒厂做个官网（没有 DESIGN.md 时自动选主题，并给出两个备选）
- 我在做儿童编程夏令营报名页，推荐三个主题比较一下，我自己选
- 用 Linear 的风格给这个项目做一个定价页
- Build the homepage in the riso theme
- 做一个经营分析用的 BI 工作台，按场景规范生成 DESIGN.md
- Implement the landing page from our existing DESIGN.md
- audit ./site — 看看这个落地页有没有 AI 模板味，先别改代码

## 命令

```bash
python skills/development-workflows/design-atlas/scripts/design_catalog.py list
python skills/development-workflows/design-atlas/scripts/design_catalog.py list --kind theme
python skills/development-workflows/design-atlas/scripts/design_catalog.py search 极简
python skills/development-workflows/design-atlas/scripts/design_catalog.py show theme:riso
python skills/development-workflows/design-atlas/scripts/design_catalog.py signals --root .
python skills/development-workflows/design-atlas/scripts/design_catalog.py route --prompt "给精酿啤酒厂做官网" --root .
python skills/development-workflows/design-atlas/scripts/design_catalog.py apply theme:hedgerow --root .
node skills/development-workflows/design-atlas/scripts/slop_check.mjs ./src
```

- `apply` 写入 `<root>/DESIGN.md`（UTF-8、LF），并在 frontmatter 后加一行来源注释。根目录已有任何大小写形式的 `design.md` 时拒绝写入（退出码 3）；加 `--force` 会先把旧文件改名为 `design.md.bak-<时间戳>`。
- `route` 结果确定可复现：同一需求、同一项目得到同一结果；`--reroll 1` 换下一组。中英文需求都能路由；brand 条目只在点名或 `--include-brands` 时参与。
- `slop_check.mjs` 退出码 0 表示没有未处理的 FAIL/REFLEX，1 表示有，2 表示参数错误。豁免写在 `DESIGN.md` 的 `## Anti-slop Waivers` 章节。

## 自动路由

项目没有 `DESIGN.md`、用户也没点名条目时，skill 读取项目信号（package.json、README、已有 CSS token、依赖）和用户原话，按关键词（中英文）、流派、场景、配色兼容和依赖线索打分，同一视觉家族不会同时进入前三。默认直接取第 1 名继续实施，并在回复开头给出 Picks 块：选中理由、两个备选、怎么切换。用户要求比较时才停下来等选择。规则见 `references/routing.md`。

## Anti-AI-slop

规则见 `references/anti-slop.md`，沿用 hallmark 的 gate 编号，分四级：

- **Floor**：可访问性、正确性、诚实性（焦点可见、reduced-motion、无横向滚动、对比度、不编造数据等），不可豁免。
- **House**：最常见的 AI 模板痕迹（eyebrow 小标题、大写字距标签、中点拼接、紫蓝渐变、卡中卡、emoji 图标、手绘浏览器窗口），默认失败；`DESIGN.md` 明确声明了该材质时自动豁免。
- **Reflex**：模型的默认习惯（Inter 做标题、Tailwind 默认色板、mono 当装饰等），修掉或在 `DESIGN.md` 写理由豁免。
- **Finish**：工艺细节，只报告。

`slop_check.mjs` 检查 33 个可机械判断的 gate；其余由 agent 按判断清单检查，并做一次新鲜上下文复核（`references/review-prompt.md`）。

## 类别概览

| 类别 | 数量 | 示例 |
| --- | --- | --- |
| AI 与大模型平台 / AI & LLM Platforms | 13 | claude, mistral.ai, ollama, x.ai |
| 开发者工具与 IDE / Developer Tools & IDEs | 7 | cursor, vercel, raycast, warp |
| 后端、数据库与 DevOps / Backend, Database & DevOps | 9 | supabase, sentry, posthog, clickhouse |
| 效率工具与 SaaS / Productivity & SaaS | 9 | linear.app, notion, cal, slack |
| 设计与创意工具 / Design & Creative Tools | 6 | figma, framer, miro, webflow |
| 金融科技与加密货币 / Fintech & Crypto | 9 | stripe, wise, revolut, coinbase |
| 电商与零售 / E-commerce & Retail | 6 | airbnb, nike, shopify, starbucks |
| 媒体与消费科技 / Media & Consumer Tech | 16 | apple, spotify, theverge, wired |
| 汽车 / Automotive | 7 | tesla, ferrari, bmw, renault |
| 复古网页 / Retro Web | 2 | dell-1996, nintendo-2001 |
| 极简与留白 / Minimal & Clean | 9 | minimal, clean, spacious, flat |
| 编辑与印刷 / Editorial & Print | 8 | editorial, paper, terracotta |
| 产品与企业系统 / Product & Enterprise Systems | 11 | shadcn, material, ant, bento |
| 高对比与表现力 / Bold & Expressive | 11 | bold, brutalism, neobrutalism, gradient |
| 质感与空间深度 / Tactile & Depth | 7 | glassmorphism, claymorphism, neumorphism, airy-glass |
| 科技与暗色 / Tech & Dark | 8 | cosmic, neon, matrix, codex |
| 复古与游戏 / Retro & Game | 7 | retro, pacman, sega, tetris |
| 亲和与手绘 / Friendly & Hand-drawn | 6 | friendly, doodle, sketch, lingo |
| 主题·编辑出版 / Editorial Themes | 20 | newsprint, riso, specimen, almanac |
| 主题·现代极简 / Modern Minimal Themes | 12 | cobalt, coral, dusk, wayfind |
| 主题·氛围沉浸 / Atmospheric Themes | 9 | lumen, terminal, darkroom, refract |
| 主题·活泼趣味 / Playful Themes | 9 | arcade, sticker, hum, werkstatt |
| 分析与 BI / Analytics and BI | 1 | bi |

前 10 类是品牌条目（`brand:*`），接着 8 类是通用风格（`style:*`），4 类是材质主题（`theme:*`），最后 1 类是业务场景（`scene:*`）。`style:riso` 已被 `theme:riso` 取代，默认隐藏（`list --all` 可见），仍可 `show`/`apply`。

## 输出

- 项目根目录的 `DESIGN.md`（必要时附旧文件备份）
- 一个 token 层（CSS 变量、Tailwind theme 或项目现有主题文件）
- 按 `DESIGN.md` 实现的组件与页面
- 运行时核对结果：桌面与移动端截图、键盘焦点、对比度、组件状态
- anti-slop 结果：`slop_check` 汇总行、生效的豁免、复核结论

## 限制

- 品牌条目描述的是公开网页的视觉语言。实施时不复制 logo、wordmark、品牌名、品牌图片或专有字体文件，规则见 `references/brand-boundary.md`。
- 主题条目的颜色是 OKLCH；需要兼容旧浏览器时由项目自行加 hex 回退。主题预览图不随包提供，条目里的 `preview_url` 指向上游固定 commit。
- 主题是“材质”，不规定页面结构；hallmark 的页面构成库、图片库、截图采集与渲染层检查没有引入。
- `slop_check.mjs` 只做静态检查，不启动浏览器。
- 目录是离线快照，不自动跟随上游更新。

## 来源与许可

| 上游 | commit | 许可 |
| --- | --- | --- |
| [VoltAgent/awesome-design-md](https://github.com/VoltAgent/awesome-design-md) | `3b60532` | MIT, Copyright (c) 2026 VoltAgent |
| [bergside/awesome-design-skills](https://github.com/bergside/awesome-design-skills) | `f631a09` | MIT, Copyright (c) 2026 Bergside |
| [Nutlope/hallmark](https://github.com/Nutlope/hallmark) | `8f6969f` | MIT（主题、texture 配方，以及 anti-slop gate 与 sloplint 检查逻辑的移植） |

许可证原文在 `assets/catalog/LICENSES/`。维护者更新目录：

```bash
python skills/development-workflows/design-atlas/scripts/build_catalog.py --design-md <awesome-design-md-checkout> --design-skills <awesome-design-skills-checkout> --hallmark <hallmark-checkout> --out skills/development-workflows/design-atlas/assets/catalog
python skills/development-workflows/design-atlas/scripts/build_catalog.py --themes-only --hallmark <hallmark-checkout> --out skills/development-workflows/design-atlas/assets/catalog
```

主题去重结论在 `assets/catalog/overlays/dedup.json`，路由关键词在 `overlays/routing.json`，都是一方维护文件，重建时保留。
