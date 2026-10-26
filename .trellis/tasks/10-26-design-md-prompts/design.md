# design-md 默认工程规范与两种场景的接入设计

本文件在规划阶段给出工作假设。Phase 2 研究结束后，在文末「最终推荐」落成后续实现任务可以直接执行的方案。若研究推翻假设，改写最终推荐并保留推翻理由。

## 问题

`design-md` 今天负责选设计语言、写 `DESIGN.md`、再按项目技术栈实施 UI。用户要求把一份通用工程规范默认接上，并把 landing page 与 motion 两种场景接进同一个技能。

三份来源的职责不同：

| 来源 | 行数 | 它实际规定的事 |
| --- | --- | --- |
| `ref/design/instruct.md` | 641，LF | 实施前检查、复用顺序、状态、无障碍、依赖、验证。新项目默认 React + shadcn Nova |
| `landing-page-design` | 431，CRLF | 单一转化目标、页面结构、文案，以及字体、间距、圆角、图标、动效的固定值 |
| `design-to-motion` | 513，CRLF | 静态设计的像素级还原、入场与故事循环、MP4 / GIF 导出 |

## 现状

实施路径在 `skills/development-workflows/design-md/references/implementation.md`：先探测 Tailwind、CSS、组件库或原生栈，再映射 `DESIGN.md` 的 token。已有 token 层只扩展，不并列第二套。

视觉路径在根 `SKILL.md`：选 `brand:*`、`style:*` 或 `scene:*`，用 `design_catalog.py apply` 写 `DESIGN.md`。`scene:bi` 的正文本身就是设计源。

`agents/interface.yaml` 的 `default_prompt` 是单段路由指令。641 行规范放不进这个字段。仓库合同要求详细判断放在一个 reference，根文件和 interface 只点名决定。

`ref/` 不进入安装包。包内嵌套 `SKILL.md` 会被 `scripts/check.py` 和文档同步当成另一个技能。

## 工作假设

1. 默认启用指实施 UI 的回合读取工程规范。列目录和只比较风格的回合不读它。
2. 工程规范改编后放在 `references/engineering-baseline.md`。它约束复用、状态、无障碍、依赖和验证。它不覆盖 `DESIGN.md` 的色彩、字体和圆角。
3. 已有项目继续按 `implementation.md` 第 1 节探测技术栈。规范里的 React / shadcn Nova 只作为没有既有工程时的默认选型。
4. 用户没点名风格时，仍从目录里选一条并 `apply`。Nova 不跳过目录。
5. landing page 与 motion 改编后分别放在 `references/landing-page.md`、`references/design-motion.md`。请求匹配才读。它们不进入 `assets/catalog/scenes/`，也不写进 `first-party/manifest.json`。
6. `scene:*` 保持「可写成 `DESIGN.md` 的设计源」这一个含义。页面类型和动效类型用参考文件表达。
7. 只借鉴机制。根 `SKILL.md` 增加读取点和触发词。长规则留在 reference。
8. motion 的 Figma API、逐帧截图和 ffmpeg 导出先标成待分类项。默认不把这套流水线写进技能的常驻流程。

推翻条件：研究若证明某份来源的主体是一套可独立 `apply` 的视觉规范，并且与目录条目冲突可以在 `DESIGN.md` 内解决，才允许新增 `scene:*`。新增前要说明 `build_catalog.py` 如何保留该文件。

## 权威分层

从高到低：

1. 用户当次明确要求。
2. 已有项目的技术栈、依赖版本和目录约定。
3. 项目根 `DESIGN.md` 的视觉 token、布局和 Do / Don't。
4. 默认工程规范：复用顺序、组件状态、无障碍、依赖治理、验证。
5. 匹配到的场景参考：landing page 提供页面结构和转化文案；motion 提供入场、故事循环和 reduced-motion。与第 3、4 层冲突时，场景参考退让。

landing page 来源写着「与框架默认冲突时本文件优先」。接入后这条不保留。框架与 `DESIGN.md` 保持更高层。用户明确要求采用该视觉系统时，按第 1 层处理，并先改 `DESIGN.md` 再写代码。

motion 来源把产品内 hover、菜单、toast 排除在外。那些交互留在工程规范的短动效规则里。截图或视觉稿复原继续分流到 `image-to-ui-skill`。报告、计划和幻灯片继续分流到 `html-artifact`。

## 推荐阅读点

后续实现任务按这个形状改包。本任务不创建这些文件。

| 读取条件 | 文件 | 根流程里的一句话 |
| --- | --- | --- |
| 每次实施 UI | `references/engineering-baseline.md` | 写代码前读取工程规范；已有技术栈优先 |
| 落地页、营销页、转化页 | `references/landing-page.md` | 先定一个行动和一个受众，再按 `DESIGN.md` 取视觉 |
| 把静态界面做成循环演示、入场或故事动画 | `references/design-motion.md` | 先分展示片或站内区块，再定空态和每个视觉的故事 |

`default_prompt` 的第一句写明：实施 UI 时使用工程规范；只有请求落到落地页或动效演示时才读对应参考。缺省保持目录选择。

description 在 832 字上增加落地页、营销页、动效演示、循环动画的中英触发词，并写明产品内短动效仍走工程规范、截图复原仍走 `image-to-ui-skill`。改完后不超过 1024 字。

## 分析必须回答

- 工程规范里哪些小节与 `implementation.md`、`design-system-core.md` 重复，哪些是新增约束。
- Nova、Lucide、Motion、Zustand、TanStack Query 是默认选型，还是禁止引入第二套库的约束。二者分开写。
- landing page 的固定字体、禁渐变、禁 Inter、Phosphor 图标，在 `DESIGN.md` 已存在时如何退让。
- motion 的展示片与站内区块如何区分；导出流水线是 adapt、延后还是 reject。
- 三个参考同时匹配时的读取顺序。例如「按某品牌做落地页并导出演示」读品牌条目、工程规范、landing page、motion，视觉仍以 `DESIGN.md` 为准。
- 近邻请求：BI 工作台、只改 hover、只列风格、HTML 报告、按截图复原、后端任务。

## 许可证

`ai-design-skills` 的 README 写明 MIT，并指向 taste-skill 与若干动效技能的署名。研究要核对 `LICENSE` 原文。改编文件保留上游仓库、作者和许可证名，不整篇复制正文。

`instruct.md` 无许可证头，与 `ref/design/BI` 一样视为本仓库材料。改编进技能包后不依赖 `ref/`。

上游两份 SKILL 是 CRLF。若后续有摘录进入 git，先转为 LF，并去掉行尾空白。

## 回滚

本任务只在 `.trellis/tasks/10-26-design-md-prompts/` 写研究文件。回滚即删除该任务目录中的研究产物。技能包保持 `0.2.0` 的已提交内容。

后续实现任务应让新参考文件可单独删除，目录索引和 `scene:bi` 不参与这次改动。

## 最终推荐

工作假设成立，不推翻。三份来源的主体都不是可单独 `apply` 的视觉规范。instruct 的 Nova 视觉段与目录冲突，已拒绝。落地页留下的是结构和文案，固定字体、禁渐变和 Phosphor 与 DESIGN.md 冲突，已拒绝。motion 留下的是入场和故事循环；Figma、逐帧截图、ffmpeg 和 PSNR 不在常驻路径。因此不新增 `scene:*`，五层顺序保持上文。后续实现任务按本节执行，不再重选文件落点和权威顺序。本任务没有改技能包。

### 文件清单

后续任务才创建或修改这些文件。本任务一个都不写。

| 文件 | 职责 |
| --- | --- |
| `skills/development-workflows/design-md/references/engineering-baseline.md` | 新建。七级复用、绿色项目默认选型、禁止第二套同类库、状态归属、依赖与安全、死控件和 Mock 标注。指向但不复制技术栈探测、对比度阈值和状态全表。 |
| `skills/development-workflows/design-md/references/landing-page.md` | 新建。一个行动、一个受众、默认结构、四种版式、转化文案、上线清单，以及「视觉退让给 DESIGN.md」的声明。不含固定字体、色板和图标库。 |
| `skills/development-workflows/design-md/references/design-motion.md` | 新建。展示片与站内区块、空态、故事循环、减少动效时停在静止结果。不含 Figma、截图时钟、ffmpeg 或 PSNR。 |
| `skills/development-workflows/design-md/references/design-system-core.md` | 只补缺句：图标按钮的可访问名称、对话框焦点归还、拖放的键盘替代、死链、当前导航项、骨架与布局同形。不搬上游状态表。 |
| `skills/development-workflows/design-md/references/implementation.md` | 在 §1 前加一句：写组件前先读工程规范；探测表、单一 token 层和 `scene:bi` 段落仍以本文件为准。不复制工程规范。 |
| `skills/development-workflows/design-md/SKILL.md` | 步骤 1 和步骤 6 的读取点、References 三行、五层短段、下面的 description、输出口径各加一句。`version` 改为 `0.3.0`。 |
| `skills/development-workflows/design-md/agents/interface.yaml` | 只改 `default_prompt` 的第一句。后面的目录、scene、apply、token 和品牌边界句子保留。 |
| `skills/development-workflows/design-md/evals/evals.json` | 补行为断言。`just ci` 不执行它。触发草案留在本任务 `research/trigger-cases.json`，不拷进技能包当作已经跑过。 |
| `skills/development-workflows/design-md/README.md` | 适用场景补落地页、营销页、动效演示，并写明 hover、菜单、toast 走工程规范。 |

不改 `references/brand-boundary.md`、`assets/catalog/**`、`scripts/build_catalog.py`、`scripts/design_catalog.py`。不新增名为 `SKILL.md` 的文件。三份新参考用 UTF-8、LF、无行尾空白。署名按 `research/license.md`，不粘贴上游正文。

### 默认启用读哪里

默认启用指写界面的那一步读取工程规范。只列目录、只比较风格、不写界面时，不读三份长参考。

`SKILL.md` 步骤 1 增加这三句：

只列出或只比较风格时，停在目录输出，不读 `references/engineering-baseline.md`、`references/landing-page.md`、`references/design-motion.md`。请求是 landing page、marketing page、落地页或营销页时，实施阶段再读 `references/landing-page.md`。请求是动效演示、循环动画、loop animation 或 animate this design 时，实施阶段再读 `references/design-motion.md`；hover、menu、菜单和 toast 不读它。

`SKILL.md` 步骤 6 的第一句改为：

写界面时先读 `references/engineering-baseline.md`，再按 `references/implementation.md` 探测技术栈并实施。

`agents/interface.yaml` 的 `default_prompt` 第一句改为，后面的现有句子原样接上：

When implementing UI, use the engineering baseline; read the landing reference only for a landing page, marketing page, 落地页, or 营销页, and the motion reference only for a 动效演示, 循环动画, loop animation, or animate this design; otherwise keep catalog selection.

这句对应的中文要求是：实施 UI 时使用工程规范；只有请求落到落地页或动效演示时才读对应参考；缺省保持目录选择。

根 `SKILL.md` 在 Scope 后加一段五层短文，顺序与下节相同。长规则仍只在参考文件里。

### 五层权威

从高到低，最终顺序：

1. 用户当次明确要求。要求改视觉时，先改 DESIGN.md 再写代码。
2. 已有项目的技术栈、依赖版本和目录约定。探测表在 `references/implementation.md` §1。
3. 项目根 DESIGN.md 的视觉令牌、布局和 Do / Don't。选中 `brand:*` 时，`references/brand-boundary.md` 附着在这一层。
4. 默认工程规范：复用顺序、组件状态、无障碍、依赖治理、验证。
5. 匹配到的落地页或 motion 参考。与第 3、4 层冲突时退让。

三个参考同时要读时，打开顺序是：目录条目、工程规范、`implementation.md`、落地页、motion。视觉仍以 DESIGN.md 为准。导出步骤不在这个顺序里。细节见 `research/conflict-map.md`。

### 不新增 scene:*

否决 `apply` 通道。`scene:*` 表示一份会被 `apply` 写成 DESIGN.md 的设计源，`scene:bi` 就是这样。这三份材料是流程和工程规则。落地页里唯一像视觉规范的部分已经拒绝，不能整份 apply。motion 没有可独立成立的色彩和字体系统。若登记成 scene，换品牌做落地页会撞上「不合并两条目录正文」，`build_catalog.py` 也会在缺少 first-party manifest 时删掉 `scenes/**` 里的新文件。页面类型和动效类型用参考文件表达。BI、经营分析、数据看板仍只走 `scene:bi`。

### 导出流水线

归类 defer。Figma REST、确定性逐帧截图、ffmpeg 和 PSNR 不进入常驻流程，不新增参考文件，也不写进 `design-motion.md`。用户明确要求视频或 GIF 时，说明这项未接入，并交付页内循环。不要在实现任务里把命令补上。

### description

现描述 832 字，上限 1024。拟用描述 1012 字，剩余 12 字。后续任务整段替换，不要另插句子，否则会超过上限或丢掉触发词。

```text
Pick a design language from a categorized offline catalog of 153 entries (84 brands, 68 styles, 1 business scene), write it as DESIGN.md in the project root, then implement or restyle production UI from that file and verify it in a running page. Use when the user asks to list or compare design styles, build a page in the style of a known product (Linear, Vercel, Stripe, Claude, Apple), choose a look such as minimal, editorial, glassmorphism, airy glass, 轻盈毛玻璃, brutalism, or retro, build a BI, analytics, 经营分析, or 数据看板 workbench, create or update DESIGN.md, or implement UI from an existing DESIGN.md, or build a landing page, marketing page, 落地页, or 营销页, or make a 动效演示, 循环动画, loop animation, or animate this design / 列出设计风格、按场景选设计、BI 工作台、生成 DESIGN.md、按 DESIGN.md 实施 UI. Hover, menu, 菜单, and toast stay on the 工程规范. Not for HTML reports, 报告, plans, 幻灯片, or slide-like artifacts (use html-artifact); not for recreating a screenshot, 截图, or mockup (use image-to-ui-skill); not for backend, 后端, or non-UI work.
```

触发词：landing page、marketing page、落地页、营销页、动效演示、循环动画、loop animation、animate this design。短动效边界词：hover、menu、菜单、toast、工程规范。原有 BI、经营分析、数据看板、列出设计风格，以及 html-artifact、image-to-ui-skill、报告、幻灯片、截图、后端都保留。没有尖括号。

### 实现任务的验收

在仓库根目录运行：

```powershell
just skills-check
just python-test
just docs-sync
just ci
```

`skills-check` 会拒绝超过 1024 字的 description、尖括号，以及技能包内嵌套的 `SKILL.md`。`python-test` 必须仍然只看到 `scene:bi` 这一条 scene。frontmatter 改动后要先 `docs-sync`，再让 `just ci` 做完整门禁。`just ci` 不执行 `evals/evals.json`。触发用例仍以本任务的 `research/trigger-cases.json` 为准，本方案没有跑过它们。

另外确认：`assets/catalog/first-party/manifest.json` 没有落地页或 motion 条目；三份新参考是 UTF-8 LF，且没有行尾空白。
