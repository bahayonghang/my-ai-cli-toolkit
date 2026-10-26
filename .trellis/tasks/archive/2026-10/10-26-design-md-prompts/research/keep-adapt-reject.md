# keep / adapt / reject / invent

设计权威是 `qiaomu-meta-skill`。本任务不调用 `skill-creator`。只借机制，不粘贴上游 `SKILL.md`。下面每条 adapt 或 keep 都写明以后实现任务要改的技能包文件；本任务不创建这些文件。

归类按机制，不按上游标题整段搬运。与现有三份参考的重叠写在每张表之后，并在文末收成一张对照。

现场目录检索没有做，记 missing evidence。采纳集合只有指定的三份来源，见 `research/license.md`。

五层顺序不变：用户当次明确要求，已有项目技术栈，项目根 DESIGN.md，默认工程规范，按请求加载的落地页或 motion。第 5 层碰到第 3、4 层时退让。

## instruct.md

服务 `research/intent.md` 的工程规范能力句，以及合并后技能在「实施 UI」时的那一段。

| 条目 | 归类 | 落到的目标文件 | 理由 |
| --- | --- | --- | --- |
| 先检查项目，再按七级决定复用：现有业务组件、已安装的 shadcn、官方组件、已安装依赖、成熟开源、组合、最后才自建 | adapt | `skills/development-workflows/design-md/references/engineering-baseline.md` | 新增约束。`implementation.md` 只探测栈，不规定复用顺序。 |
| 已有项目沿用技术栈、依赖版本和目录；绿色项目才用 React、TypeScript、按需 Vite 或 Next.js、Tailwind、shadcn/ui、Lucide | adapt | `skills/development-workflows/design-md/references/engineering-baseline.md`；`skills/development-workflows/design-md/references/implementation.md` 只加一句交叉指针 | 探测表留在 `implementation.md` §1。本文件写「不得绕过探测」和绿色项目默认选型。Next.js 只在用户要 SSR、SEO 或服务端能力时选用。 |
| 把 shadcn Nova 当成默认视觉风格：紧凑 SaaS、浅色、禁玻璃和禁大渐变 | reject | 不落文件 | 与第 3 层 DESIGN.md 和目录选择冲突。用户没点名风格时仍 apply 一条目录条目。Nova 不是设计语言。 |
| 默认选型与「禁止第二套同类库」分开：按需安装；已有图标、动画、拖放、客户端状态、请求缓存、图表或日期库时，不并行再引一套 | adapt | `skills/development-workflows/design-md/references/engineering-baseline.md` | 选型不等于禁令。`implementation.md` 已禁止第二套 token，不在这里重写。一次装齐整个技术栈表是禁止的。 |
| 设计令牌、禁止硬编码、WCAG 对比度 | reject | 权威留在 `skills/development-workflows/design-md/references/design-system-core.md` §3 和 `skills/development-workflows/design-md/references/implementation.md` §2 | 阈值和「原始色值只允许出现在 token 层」已经存在。再写一套会分叉。 |
| 组件状态、键盘、焦点、不只靠颜色表示错误、reduced-motion | adapt | `skills/development-workflows/design-md/references/design-system-core.md` | 状态表和 §7 的 reduced-motion 检查不复制。只补缺的可测句：图标按钮要有可访问名称，对话框关闭后焦点归还，拖放要有键盘替代。媒体查询仍只留在 `implementation.md` §2。 |
| 优先用探测到的组件库标准件，不用 div 仿对话框、菜单、选择器和提示 | adapt | `skills/development-workflows/design-md/references/engineering-baseline.md` | 新增，但服从第 2 层。已有 Ant Design、MUI 或其他库时不得改投 shadcn。 |
| 短动效用 CSS；只有 JS 才能表达的过渡才用 Motion；一个交互只用一个动画引擎 | adapt | `skills/development-workflows/design-md/references/engineering-baseline.md` | 产品内 hover、菜单、toast 留在这里，不进入 motion 参考。reduced-motion 只指向 `design-system-core.md` §7。 |
| 需要分栏才用 react-resizable-panels，需要拖放才用 dnd-kit；不手写第二套引擎 | adapt | `skills/development-workflows/design-md/references/engineering-baseline.md` | 按请求启用，不是每个界面的依赖。尊重已安装版本。 |
| 分清本地状态、Zustand 共享状态、TanStack Query 服务端状态、React Hook Form 加 Zod 的复杂表单 | adapt | `skills/development-workflows/design-md/references/engineering-baseline.md` | 新增。简单表单可以用 React 状态。禁止把服务端缓存再抄进 Zustand。没有远程缓存需求时不引入 Query。 |
| 复杂表格才用 TanStack Table；图表默认 shadcn Chart 加 Recharts；通用工作台按指标、趋势、明细、操作组织 | adapt | `skills/development-workflows/design-md/references/engineering-baseline.md` | 若 DESIGN.md 来自 `scene:bi`，信息架构、图表和表格以该设计源和 `implementation.md` §4 为准，本段退让。 |
| 锁文件、单一包管理器、不把密钥写入前端、简体中文混排和不依赖未确认的境外字体 CDN | adapt | `skills/development-workflows/design-md/references/engineering-baseline.md` | 新增，且都服从第 2 层的现有工程约定。 |
| 强制 `components/ui`、`features`、`stores` 目录树，以及开篇人格设定 | reject | 不落文件 | 目录以现有框架为准。人格提示不进入参考。只保留「不顺手重构」这一句，并进工程规范的执行段。 |
| 控件必须有真实行为；Mock 要标明；破坏性操作要有确认 | adapt | `skills/development-workflows/design-md/references/engineering-baseline.md` | `implementation.md` §4 已禁止虚构客户、指标和评价。这里补死控件和 Mock 标注，避免落地页拟真文案把虚构评价写成真实客户。 |
| 有检查命令就运行；没跑的类型检查、lint、测试或浏览器核对都不得报成通过 | adapt | `skills/development-workflows/design-md/references/engineering-baseline.md` | 截图、焦点、对比度和状态核对留在 `implementation.md` §5，不复制清单。 |
| 工程规范的载体是参考文件，不是目录条目，也不是 `default_prompt` 正文 | invent | `skills/development-workflows/design-md/references/engineering-baseline.md`；读取点写在 `skills/development-workflows/design-md/SKILL.md` 与 `skills/development-workflows/design-md/agents/interface.yaml` | 641 行放不进 interface。`scene:*` 会把正文 apply 成 DESIGN.md，这条通道不适合流程规则。 |

### 和现有参考的重叠

- `implementation.md` §1 的探测表覆盖 instruct §2 开头和 §3.1 的「先看项目」。不搬探测表。工程规范增加的是文件清单的阅读顺序和绿色项目选型。
- `implementation.md` §2 的单一 token 层、焦点和 reduced-motion 样例覆盖 instruct §4.2 与 §6.1 的落码方式。不搬 CSS。
- `implementation.md` §4 的 `scene:bi` 段覆盖 instruct §8.3 在 BI 页面上的信息架构。通用工作台句子只在没选 `scene:bi` 时使用。
- `implementation.md` §5 覆盖 instruct §13 的视觉核对。工程规范只扩展「项目自带的检查命令」。
- `design-system-core.md` §3、§4、§5、§7 覆盖对比度、状态、响应式和 reduced-motion 检查。工程规范不另起 QA 清单。
- `brand-boundary.md` 不由 instruct 修改。Lucide 和系统字体栈不得替换品牌条目里已经写明的替代字体，也不得复制品牌图标。

## landing-page-design

服务 `research/intent.md` 的落地页能力句。

| 条目 | 归类 | 落到的目标文件 | 理由 |
| --- | --- | --- | --- |
| 适用范围写成一切 Web UI，且与框架默认冲突时本文件优先 | reject | 不落文件 | 会压过第 2 到第 4 层。接入后不保留这句。 |
| 一个提供、一个受众、一个主要行动；广告流量要和广告承诺一致；利益先于功能；至少一种风险消除 | adapt | `skills/development-workflows/design-md/references/landing-page.md` | 这是模式主体。用自己的话写，不粘贴上游例句。 |
| 缺的信息一次问完；用户答不出就声明假设并继续 | adapt | `skills/development-workflows/design-md/references/landing-page.md` | 避免把实施卡住。假设不能改写 DESIGN.md 的视觉。 |
| 首屏、论证、异议处理的默认结构，以及经典首屏、长叙事、短转化、对比页四种版式 | adapt | `skills/development-workflows/design-md/references/landing-page.md` | 结构不是令牌。用户或 DESIGN.md 已指定区块时退让。 |
| 按区块实现，并在写代码前给出大纲、首屏文案、利益点、三步、FAQ 和是否索引 | adapt | `skills/development-workflows/design-md/references/landing-page.md`；`skills/development-workflows/design-md/SKILL.md` 的输出段只加一句 | 长判断留在参考。根文件不复制大纲模板。 |
| 广告页或强时效页 noindex；常青页才写标题、描述和可索引的 FAQ | adapt | `skills/development-workflows/design-md/references/landing-page.md` | 只保留这一道门槛，不扩展成 SEO 技能。 |
| 固定字体、禁用 Inter、禁用斜体、禁用 900 字重、字号吸附到 Tailwind 阶梯 | reject | 不落文件 | 第二套字体系统。`brand-boundary.md` 允许 Inter 等替代字体。DESIGN.md 的字体更高。 |
| 固定间距、按钮内边距、暗色色板、禁止背景渐变、标题渐变、禁止卡片单侧描边 | reject | 不落文件 | 与 `design-system-core.md` §3 和目录里的渐变、玻璃条目冲突。不能在已有 DESIGN.md 上偷偷改色。 |
| 标题按语意断行；嵌套圆角只在 DESIGN.md 没写内圆角时用「内圆角等于外圆角减去间隙」 | adapt | `skills/development-workflows/design-md/references/landing-page.md` | 机制可以留。680px、具体色值和 Tailwind 圆角白名单不留。 |
| Phosphor、Solar、Iconamoon，以及禁用 Material | reject | 不落文件 | 图标服从第 2 层和工程规范。绿色项目默认 Lucide。品牌图标仍受 `brand-boundary.md` 约束。 |
| 悬浮毛玻璃导航、独立缓动表、强制滚动揭示 | reject | 不落文件 | 这是另一套视觉和动效。落地页参考不拥有曲线表。 |
| 每个落地页必须有逐词变色的 tagline 区块 | reject | 不落文件 | 与 motion「纯文本区块不做故事」和 reduced-motion 冲突，也不是转化结构所必需。 |
| 只动画 transform 和 opacity、不用无节流 scroll 监听 | adapt | `skills/development-workflows/design-md/references/design-motion.md` | 机制归 motion，避免两套动效。reduced-motion 仍指向 `design-system-core.md` §7。落地页正文不重写。 |
| 写具体草稿，不用占位拉丁文；虚构证明必须标成草稿 | adapt | `skills/development-workflows/design-md/references/landing-page.md` | 收窄内容真实感。产品界面仍遵守 `implementation.md`「不虚构客户、指标、评价」。禁连字符和强制 sentence case 会破坏中文，不留。 |
| 死链、当前导航项、骨架与真实布局同形、不用 `window.alert` | adapt | `skills/development-workflows/design-md/references/design-system-core.md` | 与 §4 重叠的 hover、focus、error 不另写。不把「hover 时缩放」写成全局状态。 |
| 页脚法律链接、404、表单校验、favicon、meta、替代文本、语义标签 | adapt | `skills/development-workflows/design-md/references/landing-page.md` | 落地页交付清单。跳过链接和对比度指向 `design-system-core.md`，不复制。 |
| 配套的 redesign-existing-projects 技能 | reject | 不落文件 | 仓库外的另一个技能。已有 DESIGN.md 的改版仍走现有流程。 |
| 署名 | keep | `skills/development-workflows/design-md/references/landing-page.md` | 短署名，见 `research/license.md`。不粘贴 SKILL 正文，也不粘贴整份 MIT 文本。 |
| 载体是按请求阅读的参考，不登记 `scene:*` | invent | `skills/development-workflows/design-md/references/landing-page.md` | 留下的主体是结构和文案，不是可 apply 的视觉规范。见冲突图。 |

### 和现有参考的重叠

- 固定字体、间距、圆角、色板与 `design-system-core.md` §3、`implementation.md` §2 冲突，整段 reject，不是 adapt 成第二张 token 表。
- 状态与 `design-system-core.md` §4 重叠。只把缺的死链、当前导航、同形骨架、不用 `window.alert` 补进该文件。
- 虚构客户与 `implementation.md` §4 冲突。落地页只允许标明为草稿的营销文案。
- 品牌字体替代与 `brand-boundary.md` 规则 2 冲突。禁 Inter 不能成立。
- 毛玻璃导航会和 `brand:*` / `style:*` 的布局冲突，也会和 `scene:bi` 的工作台密度冲突。不进入常驻规则。

## design-to-motion

服务 `research/intent.md` 的动效能力句。

| 条目 | 归类 | 落到的目标文件 | 理由 |
| --- | --- | --- | --- |
| 先区分展示片和站内区块：展示片动整个画面并从空态循环；站内只动有视觉的区块，纯文本区块不动，入场只播一次 | adapt | `skills/development-workflows/design-md/references/design-motion.md` | 回答「两种上下文如何分」。在现有代码库里默认站内；只有设计、没有站点时默认展示片；仍不清楚就问一次。 |
| 产品内 hover、菜单、toast 不属于这个模式 | keep | `skills/development-workflows/design-md/references/design-motion.md`；触发边界写在 `skills/development-workflows/design-md/SKILL.md` 的 description | 这些短动效留在工程规范。这是边界，不是新的动效系统。 |
| 空态、应用框架的静态表面、分离卡片的入场，以及阅读顺序的错落 | adapt | `skills/development-workflows/design-md/references/design-motion.md` | 用自己的话写。不粘贴上游 HTML、CSS 和像素公式。DESIGN.md 已有时长或位移时用 DESIGN.md。 |
| 每个视觉先写一句故事，动作结束后回到设计；纯文本卡片休息；并列故事错开 | adapt | `skills/development-workflows/design-md/references/design-motion.md` | 模式主体。故事表用自己的话压缩，不整表粘贴。 |
| 展示片可以慢于产品 UI；站内故事不溶解、不整页循环 | adapt | `skills/development-workflows/design-md/references/design-motion.md` | 产品短动效的时长仍由工程规范约束。用户没要展示片时，不把 12 秒循环套到普通页面。 |
| 设计里的照片或纹理背景在入场和循环中保持不动、不变色 | adapt | `skills/development-workflows/design-md/references/design-motion.md` | 语义规则。不写 Figma image API。品牌摄影仍受 `brand-boundary.md` 约束。 |
| 只动画 transform、opacity、filter、clip-path；reduced-motion 时展示静止结果；没有要求就不缩放、不摇镜 | adapt | `skills/development-workflows/design-md/references/design-motion.md` | 检查项指向 `design-system-core.md` §7。不复制 `implementation.md` 的媒体查询。模糊上限和「不要从零放大」用一句话带过，作为署名里那三条 MIT 规则的机制。 |
| 动手前说明上下文、布局、背景是否保持、入场和每个视觉的故事 | adapt | `skills/development-workflows/design-md/references/design-motion.md`；`skills/development-workflows/design-md/SKILL.md` 输出段只加一句 | 不要求报告 PSNR 或三个导出文件。 |
| 与框架默认冲突时本文件优先 | reject | 不落文件 | 与落地页来源同一句，接入后删除。 |
| Figma REST、确定性逐帧截图、ffmpeg、PSNR | defer | 无。后续实现不要在技能包新增导出参考，也不要在 `design-motion.md` 写这些步骤、命令或参数 | 不进入常驻流程。理由见下节。 |
| 单文件 HTML、`?still` / `?loop` / `?capture` 时钟和 base64 舞台 | reject | 不落文件 | 实施必须留在 `implementation.md` 探测到的技术栈。捕获架构属于导出流水线。 |
| Make it yours 的数值总表 | reject | 不落文件 | 第二套令牌。参考里只保留少量散文默认，并声明 DESIGN.md 优先。 |
| 把截图、Figma 链接或 “animate this” 的一切说法都当成像素克隆 | reject | 不落文件 | 截图和设计稿复原继续走 `image-to-ui-skill`。本技能的触发词是动效演示、循环动画、loop animation、animate this design。 |
| 署名 | keep | `skills/development-workflows/design-md/references/design-motion.md` | 短署名，见 `research/license.md`。 |
| 载体是按请求阅读的参考，不登记 `scene:*` | invent | `skills/development-workflows/design-md/references/design-motion.md` | 主体是入场和故事，不是视觉规范，不能 apply 成 DESIGN.md。 |

### 导出流水线为什么 defer

来源把 Part C 限制为展示片导出，或网站上用户明确要求导出时才做。`design-md` 的验收是运行中的页面，不是 MP4 或 GIF。流水线依赖 Figma 个人令牌、逐帧截图和 ffmpeg，和目录选型、DESIGN.md、工程规范不是同一职责。像素级克隆又和 `image-to-ui-skill`、`brand-boundary.md` 重叠。

defer 的意思是：这次以及紧接着的实现任务都不把它写进常驻路径。用户当次明确要求导出视频时，按第 1 层承认缺口，交付页内循环，不临时发明命令。这不是 adapt。以后若要单独立项，也只能是默认不读的可选参考，并且不得塞回根流程。

### 和现有参考的重叠

- reduced-motion、焦点和「非必要动画可关」已经在 `design-system-core.md` §7 与 `implementation.md` §2。motion 参考只声明展示片在减少动效时停在静止结果。
- 产品内短动效与 instruct 的 CSS / Motion 分工重叠，胜出方是工程规范，不是 design-to-motion。
- 像素级还原与 `brand-boundary.md` 规则 1 到 4 冲突。motion 不得导出 logo、品牌名或专有字体层。
- 站内纯文本区块的滚动揭示不从落地页的被拒绝曲线表里复活。没有 DESIGN.md 的 motion token 时，用参考里的少量默认，并仍然服从减少动效。

## 跨来源的发明

这些不是某一份来源里的原机制，而是接入时必须有的路由。后续实现任务要写，本任务不写。

| 条目 | 归类 | 落到的目标文件 | 理由 |
| --- | --- | --- | --- |
| 根流程写明三份参考的读取条件，并放一段五层顺序 | invent | `skills/development-workflows/design-md/SKILL.md` | 长规则不进根文件。根文件只保留触发、读取点和输出约束。 |
| `default_prompt` 只改首句 | invent | `skills/development-workflows/design-md/agents/interface.yaml` | 首句点名工程规范与两种按请求参考。后面的目录、scene、品牌边界句子保留。 |
| 行为用例 | invent | `skills/development-workflows/design-md/evals/evals.json` | 从本任务的 `research/trigger-cases.json` 摘行为断言。`just ci` 不执行该文件。 |
| 安装说明与 description 对齐 | invent | `skills/development-workflows/design-md/README.md` | 补落地页、动效演示和短动效边界。不手改 `docs/`，用 `just docs-sync`。 |

不改 `references/brand-boundary.md`、`assets/catalog/**`、`scripts/build_catalog.py`、`scripts/design_catalog.py`。不新增 `scene:*`。

## 重叠对照

| 现有文件 | 来源里看起来重复的部分 | 推荐后的归属 |
| --- | --- | --- |
| `references/implementation.md` | 技术栈探测、单一 token 层、scene:bi 的信息架构、运行时截图核对 | 探测和核对留在原文件。工程规范只加指针和绿色项目选型。 |
| `references/design-system-core.md` | 对比度、状态、响应式、reduced-motion、令牌引用 | 原清单保留。只补图标按钮名称、对话框焦点、拖放键盘路径、死链、当前导航、同形骨架。 |
| `references/brand-boundary.md` | 替代字体、禁止品牌图标和品牌图片 | 原文件不动。落地页的禁 Inter 和 Phosphor、motion 的像素克隆都不得削弱它。 |
