# 冲突图

五层顺序不推翻：

1. 用户当次明确要求。
2. 已有项目的技术栈、依赖版本和目录约定。
3. 项目根 DESIGN.md 的视觉令牌、布局和 Do / Don't。
4. 默认工程规范：复用顺序、组件状态、无障碍、依赖治理、验证。
5. 匹配到的场景参考。落地页提供页面结构和转化文案。motion 提供入场、故事循环，以及减少动效时停在静止结果。与第 3、4 层冲突时，第 5 层退让。

`brand-boundary.md` 不是第六层。选中 `brand:*` 时，它附着在第 3 层的产出约束上。用户要求公开复刻 logo、品牌名和品牌文案时，沿用该文件规则 5：说明限制并改做受启发版本。这是现有边界，不是落地页或 motion 可以豁免的第 1 层。

包装合同（description 长度、禁止嵌套 `SKILL.md`、目录重建）不进入这五层，也不改变顺序。

## PRD 要求 3 的每一项

### DESIGN.md 的视觉权威

- 冲突：instruct 的 Nova 视觉，落地页的字体、禁 Inter、禁渐变、暗色色板和 Phosphor，motion 的像素级还原，都会在代码里另起一套视觉。
- 胜出层：第 3 层。用户当次明确要求改视觉时，先改 DESIGN.md，再写代码，仍然落回第 3 层，而不是让参考文件直接改组件。
- 理由：三份来源里能当设计源的视觉段都与目录冲突，归类为 reject。留下的工程规则和页面结构不规定色彩、字体和圆角。

### implementation.md 的技术栈探测

- 冲突：instruct 的 React、Tailwind、shadcn Nova 默认选型可能覆盖已有的 Vue、Ant Design、MUI 或原生栈。
- 胜出层：第 2 层。探测程序留在 `references/implementation.md` §1。
- 理由：工程规范只写「不得绕过探测」。绿色项目没有既有栈时，才使用默认选型。Nova 只可能影响组件来源，不替代目录，也不替代探测。

### scene:bi 与目录重建

- 冲突：若把三份材料登记成 `scene:*`，`apply` 会用流程文本替换 DESIGN.md；`list --kind scene` 会把它们和 `scene:bi` 并列；`build_catalog.py` 会删除未进清单的 `scenes/**/*.md`，除非再写一份与 `first-party/` 字节相同的 manifest 条目。
- 胜出层：BI 的视觉和信息架构在 apply 之后是第 3 层。目录重建合同保持现状，不为这次接入改 `assets/catalog/`。
- 理由：`scene:*` 继续只表示可写成 DESIGN.md 的设计源。经营分析、数据看板、BI 仍先查 scene。没有落地页或动效演示的措辞时，不读第 5 层。`implementation.md` §4 对 `scene:bi` 的段落不改。

### brand-boundary.md

- 冲突：落地页禁用 Inter 并改用 Phosphor；motion 要把文字和图片按源设计导出成层。品牌条目的替代字体名单包含 Inter，并禁止 logo、品牌图片和专有字体。
- 胜出层：附着在第 3 层的品牌边界，高于第 4 层的 Lucide 默认，也高于第 5 层。
- 理由：文件本身不改。只有选中 `brand:*` 才适用；单独的 `scene:*` 不套用这些禁令。公开复刻请求走规则 5，不走像素导出。

### agents/interface.yaml 的 default_prompt

- 冲突：把 641 行规范或两份场景 SKILL 塞进 `default_prompt`，会让每次路由都加载长判断，也会和「只列目录不读长参考」冲突。
- 胜出：它是路由器，不是权威层。首句只能把读取点指到第 4 层和第 5 层，不能覆盖第 1 到第 3 层。
- 理由：现有句子保留：已有 DESIGN.md 就实施；BI、经营分析、数据看板先查 scene；scene 与品牌或风格同时出现时等待，不合并；apply 之后做单一 token 层；品牌边界仍在。首句的原文见 `design.md` 的最终推荐。

### html-artifact 与 image-to-ui-skill

- 冲突：落地页来源把范围写成一切 Web UI；motion 来源把截图、Figma 帧和 “animate this” 都算进来。报告、计划和幻灯片会因此误入。
- 胜出：这两条分流在进入五层之前就生效。报告、计划、幻灯片走 `html-artifact`。截图或设计稿复原走 `image-to-ui-skill`。
- 理由：description 和根 `SKILL.md` 的 Scope 保留现有分流，并补上「截图」「幻灯片」「后端」这些中文词。动效触发词不包括 screenshot。用户既要复原截图又要动画时，复原不由本技能做。

### description 预算

- 冲突：要加入落地页、营销页、动效演示、循环动画的中英触发词，还要写明产品内短动效走工程规范，同时不能超过 1024，也不能丢掉现有 153 条目录、BI 和两条分流。
- 胜出：仓库合同的 1024 字上限。description 只负责触发，不建立视觉权威。
- 现状：根 `SKILL.md` 的 description 为 832 字。拟用文本 1012 字，剩余 12 字。排除词含「报告」。全文在 `design.md` 最终推荐。计数方式与 `scripts/check.py` 相同，是去掉首尾空白后的 Python `len`。

### 禁止嵌套 SKILL.md

- 冲突：两份来源的文件名都是 `SKILL.md`。若原样放进技能包，`scripts/check.py` 和文档同步会把它当成另一个技能。
- 胜出：仓库包装合同。改编文件只能叫 `references/*.md`。
- 理由：这不改变五层顺序。`ref/` 不进安装包，所以运行时也不能继续读上游路径。

## 分析必须回答

### 哪些小节是重复，哪些是新增

重复，不另写一套：

- 技术栈探测：instruct §2 开头、§3.1，对 `implementation.md` §1。
- 单一 token 层、禁止硬编码、对比度：instruct §4.2，对 `design-system-core.md` §3 和 `implementation.md` §2。
- 组件状态、键盘、焦点、错误不只靠颜色：instruct §5.2 与 §11 的状态名单，落地页 B9 的 hover / focus / error，对 `design-system-core.md` §4。
- reduced-motion：三份来源都有，对 `design-system-core.md` §7 和 `implementation.md` §2 的媒体查询。
- 响应式与禁止横向溢出：instruct §4.4，对 `design-system-core.md` §5。
- 运行时截图核对：instruct §13，对 `implementation.md` §5。
- `scene:bi` 的四层信息架构：instruct §8.3 在 BI 页面上退让，对 `implementation.md` §4。

新增，进入 `references/engineering-baseline.md`：

- 七级复用顺序。
- 绿色项目默认选型，以及与之分开的「禁止第二套同类库」。
- 按需安装、锁文件、单一包管理器、前端不写密钥、简体中文混排。
- 探测到的组件库标准件，禁止用 div 仿对话框和菜单。
- CSS 负责短动效，Motion 只负责 CSS 表达不了的交互。
- 分栏和拖放的库，仅在请求需要时使用。
- 本地、共享、服务端、表单四类状态。
- 死控件禁止、Mock 必须标明。
- 项目已有的类型检查、lint 和测试要跑；没跑就不能报通过。

只补进 `design-system-core.md` 的缺口：图标按钮的可访问名称、对话框焦点归还、拖放的键盘替代、死链、当前导航项、骨架与布局同形。

### 默认选型，还是禁止第二套库

两件事分开写，都在工程规范里，都不改 DESIGN.md 的视觉。

默认选型只用于没有既有工程、且这项能力确实被请求用到的时候：

- React 与 TypeScript。
- 普通客户端用 Vite；用户明确要 SSR、SEO 或服务端能力时用 Next.js。
- Tailwind，以及 shadcn/ui 作为组件来源。
- Lucide 作为图标。
- Motion 只在 CSS 过渡不够时使用。
- Zustand 只在状态必须跨组件共享时使用。
- TanStack Query 只在需要远程缓存、失效和同步时使用。
- 同一张来源表里的 dnd-kit、react-resizable-panels、TanStack Table、React Hook Form 加 Zod、Recharts、date-fns，也是按需默认，不是每个项目都安装。

禁止第二套库适用于任何项目，包括已有项目：

- 已有图标、通用动画、拖放、客户端状态、请求缓存、图表或日期库时，不引入平行的第二套。
- 不为了凑齐技术栈表而安装用不到的库。
- 不并行两套 UI 组件体系或两套 token。第二套 token 的禁令已经在 `implementation.md`，工程规范指向它，不重写。

shadcn Nova 不属于上面两列。它不是绿色项目的设计语言，也不构成「禁止其他视觉」的禁令。用户没点名风格时，仍从目录选一条并 apply。

### 落地页的固定视觉如何退让

DESIGN.md 已存在时，固定字体、禁渐变、禁 Inter、Phosphor 全部无效。代码继续用 DESIGN.md 的字体、色彩、圆角和图标角色。Inter 仍可以是 `brand-boundary.md` 写出的替代字体。

这些句子不写入 `references/landing-page.md`。该文件要明确写：视觉冲突时本参考退让；禁止把 Geist、禁 Inter 或 Phosphor 写进组件来「修正」DESIGN.md。

只有用户当次明确要求改用那套视觉时，才按第 1 层处理：先改 DESIGN.md，再实施。参考文件不能绕过 DESIGN.md 直接改令牌。

嵌套圆角和按语意断行可以留下，但只在 DESIGN.md 没有对应规则时使用。

### 展示片和站内区块，以及导出流水线

展示片：整个画面，从空态入场，视觉演完故事后再循环。交付物是项目技术栈里的可运行页面，不是视频文件。

站内区块：只动带视觉的区块，例如功能卡片里的图、产品界面样张、标志行。标题、评价、FAQ、价格、行动号召和页脚不做这个参考里的故事动画。入场在进入视口时播一次。在现有代码库中默认站内；只有设计、没有站点时默认展示片；不清楚就问一次。

导出流水线（Figma REST、确定性逐帧截图、ffmpeg、PSNR）归类为 defer，不进入常驻流程，也不写入 `design-motion.md`。用户明确要求 MP4 或 GIF 时，说明缺口并交付页内循环。

### 三个参考同时匹配时的读取顺序

例子：「按某品牌做落地页，并做成动效演示，再导出视频」。

读取顺序：

1. 品牌目录条目，apply 成项目根 DESIGN.md。已有 DESIGN.md 且用户没要求换设计时，不重新 apply。
2. `references/engineering-baseline.md`，因为这次要写界面。
3. `references/implementation.md`，探测第 2 层的技术栈。
4. `references/landing-page.md`，决定结构和文案。
5. `references/design-motion.md`，决定展示片或站内，以及哪些视觉有故事。
6. `references/design-system-core.md` 与，若是 `brand:*`，`references/brand-boundary.md`。

不读取导出流水线。视觉权威仍是第 3 层 DESIGN.md。落地页的固定字体和色值退让。motion 不改色彩和字体。品牌边界不因「导出演示」放松。

第 5 层内部：落地页决定有哪些区块；motion 只给带视觉的区块加故事；纯文本区块保持落地页结构，不做故事循环。产品内 hover、菜单、toast 即使出现在同一页面，仍用第 4 层的 CSS 规则，不升级成展示片。

### 近邻请求

| 请求 | 是否触发技能 | 读什么 | 不读什么 |
| --- | --- | --- | --- |
| BI、经营分析、数据看板 | 触发 | scene 目录，通常是 `scene:bi`，然后工程规范与 `implementation.md` | 落地页参考、motion 参考 |
| 只改 hover、菜单、toast | 若是在做产品界面则触发 | 工程规范的短动效 | `design-motion.md` |
| 只列或只比较风格 | 触发 | 目录命令 | 三份长参考，也不写 DESIGN.md |
| HTML 报告或幻灯片 | 不触发 | 无 | 整个 design-md，改走 `html-artifact` |
| 按截图复原 | 不触发 | 无 | 整个 design-md，改走 `image-to-ui-skill` |
| 后端或非界面任务 | 不触发 | 无 | 整个 design-md |

对应草案在 `research/trigger-cases.json`。这些句子没有执行。
