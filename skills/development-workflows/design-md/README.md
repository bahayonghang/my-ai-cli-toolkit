# design-md

从一个离线、分类的设计目录里选定设计语言，写成项目根目录的 `DESIGN.md`，再按它实施前端 UI，并在运行中的页面上核对。

Pick a design language from a categorized offline catalog, write it as the project-root `DESIGN.md`, then build and verify UI from it.

目录共 152 个条目：84 个受真实产品启发的品牌 DESIGN.md，68 个通用风格。

## 适用场景

- 列出或搜索可用设计，按类别浏览
- 按某个产品的设计语言做页面（Linear、Vercel、Stripe、Claude、Apple 等）
- 选一种通用风格（极简、编辑排版、玻璃拟态、新粗野主义、复古像素等）
- 给项目创建、定制或更换 `DESIGN.md`
- 按已有 `DESIGN.md` 实施或改造页面与组件

不适用：HTML 报告、计划、幻灯片式产出物（用 `html-artifact`）；截图或设计稿复刻（用 `image-to-ui-skill`）；非 UI 任务。

## 安装

在本仓库根目录把 skill 链接到当前项目：

```bash
just install-projects
```

或从 GitHub 安装：

```bash
npx skills add https://github.com/bahayonghang/my-ai-cli-toolkit --skill design-md
```

## 示例请求

- 列出所有可用的设计风格，按类别分组
- 用 Linear 的风格给这个项目做一个定价页
- 我们是面向开发者的数据库产品，推荐几个合适的设计风格
- Create a DESIGN.md for this project using the minimal style
- Implement the landing page from our existing DESIGN.md
- Switch our design from brutalism to editorial and keep a backup of the old DESIGN.md

## 命令

```bash
python skills/development-workflows/design-md/scripts/design_catalog.py list
python skills/development-workflows/design-md/scripts/design_catalog.py search 极简
python skills/development-workflows/design-md/scripts/design_catalog.py show brand:linear.app
python skills/development-workflows/design-md/scripts/design_catalog.py apply style:minimal --root .
```

`apply` 写入 `<root>/DESIGN.md`（UTF-8、LF），并在 frontmatter 后加一行来源注释。根目录已有任何大小写形式的 `design.md` 时，命令拒绝写入（退出码 3）；加 `--force` 会先把旧文件改名为 `design.md.bak-<时间戳>` 再写入。

## 类别概览

| 类别                                               | 数量 | 示例                                     |
| -------------------------------------------------- | ---- | ---------------------------------------- |
| AI 与大模型平台 / AI & LLM Platforms               | 13   | claude, mistral.ai, ollama, x.ai         |
| 开发者工具与 IDE / Developer Tools & IDEs          | 7    | cursor, vercel, raycast, warp            |
| 后端、数据库与 DevOps / Backend, Database & DevOps | 9    | supabase, sentry, posthog, clickhouse    |
| 效率工具与 SaaS / Productivity & SaaS              | 9    | linear.app, notion, cal, slack           |
| 设计与创意工具 / Design & Creative Tools           | 6    | figma, framer, miro, webflow             |
| 金融科技与加密货币 / Fintech & Crypto              | 9    | stripe, wise, revolut, coinbase          |
| 电商与零售 / E-commerce & Retail                   | 6    | airbnb, nike, shopify, starbucks         |
| 媒体与消费科技 / Media & Consumer Tech             | 16   | apple, spotify, theverge, wired          |
| 汽车 / Automotive                                  | 7    | tesla, ferrari, bmw, renault             |
| 复古网页 / Retro Web                               | 2    | dell-1996, nintendo-2001                 |
| 极简与留白 / Minimal & Clean                       | 9    | minimal, clean, spacious, flat           |
| 编辑与印刷 / Editorial & Print                     | 9    | editorial, paper, riso, terracotta       |
| 产品与企业系统 / Product & Enterprise Systems      | 11   | shadcn, material, ant, bento             |
| 高对比与表现力 / Bold & Expressive                 | 11   | bold, brutalism, neobrutalism, gradient  |
| 质感与空间深度 / Tactile & Depth                   | 7    | glassmorphism, claymorphism, neumorphism, airy-glass |
| 科技与暗色 / Tech & Dark                           | 8    | cosmic, neon, matrix, codex              |
| 复古与游戏 / Retro & Game                          | 7    | retro, pacman, sega, tetris              |
| 亲和与手绘 / Friendly & Hand-drawn                 | 6    | friendly, doodle, sketch, lingo          |

前 10 类是品牌条目（`brand:*`），后 8 类是通用风格（`style:*`）。

## 输出

- 项目根目录的 `DESIGN.md`（必要时附旧文件备份）
- 一个 token 层（CSS 变量、Tailwind theme 或项目现有主题文件）
- 按 `DESIGN.md` 实现的组件与页面
- 运行时核对结果：桌面与移动端截图、键盘焦点、对比度、组件状态

## 限制

- 品牌条目描述的是公开网页的视觉语言。实施时不复制 logo、wordmark、品牌名、品牌图片或专有字体文件，产出界面只能是"受某品牌启发"。规则见 `references/brand-boundary.md`。
- 10 个品牌条目是旧格式（无 YAML token），需要从正文表格读取 token。
- 风格条目不定义组件，组件按 `references/design-system-core.md` 从 token 推导。
- 目录是离线快照，不自动跟随上游更新。

## 来源与许可

| 上游                                                                                | commit    | 许可                              |
| ----------------------------------------------------------------------------------- | --------- | --------------------------------- |
| [VoltAgent/awesome-design-md](https://github.com/VoltAgent/awesome-design-md)       | `3b60532` | MIT, Copyright (c) 2026 VoltAgent |
| [bergside/awesome-design-skills](https://github.com/bergside/awesome-design-skills) | `f631a09` | MIT, Copyright (c) 2026 Bergside  |

许可证原文在 `assets/catalog/LICENSES/`。维护者更新目录：

```bash
python skills/development-workflows/design-md/scripts/build_catalog.py --design-md <awesome-design-md-checkout> --design-skills <awesome-design-skills-checkout> --out skills/development-workflows/design-md/assets/catalog
```

任何条目缺少类别时构建失败，且不写入文件；新类别映射在 `assets/catalog/categories.json` 中维护。
