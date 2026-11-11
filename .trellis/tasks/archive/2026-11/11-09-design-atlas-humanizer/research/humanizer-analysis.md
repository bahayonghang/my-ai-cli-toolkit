# vibecoding-humanizer → design-atlas 深度分析

设计权威：`qiaomu-meta`（单一 authoring authority，不另调 skill-creator）。归类方法：keep / adapt / reject / invent，只借机制，不粘贴上游文本。

## 1. 来源快照

| 项 | 值 |
| --- | --- |
| 仓库 | `LearnPrompt/vibecoding-humanizer`，本地 `ref/repo/vibecoding-humanizer`（ignored） |
| commit | `51f8b09`（main；0.3.0 发布于 `b1f9dc1`） |
| 版本 | 0.3.0（前身 `carl-ui-humanizer` 0.1.1 / 0.2.0） |
| 文件 | `SKILL.md`、`references/` 11 份、`examples/` 15 张 JPEG、`agents/openai.yaml`、`VALIDATION.md`、`assets/source-luinlee.png` |
| 脚本 | 无。纯提示型技能，没有任何机械检查 |
| 许可 | **仓库没有 LICENSE 文件**，默认保留全部权利。只有 `anthropic-prompts-en-zh.md` 里转载的 Anthropic notebook 段落是 MIT |

许可结论：不得把 humanizer 的中文条目、提示语 P1–P14、表格、示例图或 README 文本复制进 design-atlas。只能用自己的英文措辞重述机制，并在 README 致谢里写明「思路参考，未复制文本，上游未附许可证」。Anthropic MIT 段落本次不需要（见 §6）。第三方原帖（Zihua、ZaynHao 等）只引用思想，不转载原句。

## 2. 先例检索

- 采纳来源由用户指定，先例检索只用于避开近邻，不扩大采纳范围。
- design-atlas 已吸收 hallmark（gate 编号、主题、sloplint 移植）和 `10-26` 任务分析过的 ai-design-skills；这些是本次的对照基线。
- humanizer README 提到的 Impeccable、Taste Skill 未研读：`missing evidence`。
- skills.sh / SkillsMP 现场检索未运行（Windows 上 `research_prior_art.py` 调 `npx` 已知失败）：`missing evidence`。

## 3. 两者定位对比

| 维度 | vibecoding-humanizer | design-atlas 0.3.0 |
| --- | --- | --- |
| 产物范围 | 3D 场景、SVG、HTML 海报与代码动画、UI 四类 | 生产级 Web UI |
| 核心动作 | 诊断并改已有产物（改稿、去模板感） | 选设计语言 → 写 `DESIGN.md` → 从零实施 → 门禁 |
| 设计契约 | 无；靠「用户明确的风格优先」口头约束 | `DESIGN.md` + 声明材质 + 豁免行 |
| 验证 | 叮嘱「在真实输出里验收」，无工具 | `slop_check.mjs` 33 个机械 gate + 判断清单 + 新鲜上下文复核 |
| 强项 | **何时保留**：每条规则都写了保留条件；不强行重做好页面；区分审查/改稿/给提示语 | **可执行**：机械门禁、可豁免层级、确定性路由、离线目录 |
| 弱项 | 无机械检查；规则是作者在单一模型上的经验 | 改已有页面没有独立流程；去冗余时**没有「必须保留」的护栏**；中文文案套话完全漏检 |
| 语言 | 中文 | references 英文，触发词中英 |

结论：两者互补，不是重复。humanizer 补 design-atlas 的「判断边界」和「改稿流程」；design-atlas 的门禁与契约能把 humanizer 的口头约束变成可检查项。

## 4. 逐项映射

### 4.1 ui 模式 13 条诊断

| # | humanizer 条目 | design-atlas 覆盖 | 判定 | 落点 |
| --- | --- | --- | --- | --- |
| 1 | 同一信息反复解释（标题、副标题、卡片说明复述；按钮旁「点击此按钮上传」） | 部分：58 字数上限、69 回声、54 眉题；没有「副标题复述标题」「微文案重复按钮」 | adapt | 新 gate `DA1`（House, J） |
| 1 保留条件 | 必要标签、格式与容量限制、错误、风险、价格不能删，不能只藏进 hover | **缺失**。58 只压字数，没有护栏 | invent（升格） | 新 gate `DA2`（Floor, J）+ anti-slop 新节「Keep list」 |
| 2 | 中文标题上方的英文大写眉题、习惯性中点 | 覆盖：54、63、67 | keep | anti-slop 54/63 的判断清单各加一句中文页面示例。眉题机械检测见本表后备注（2026-11-09）；不扩写 54 |
| 3 | 文案不对准使用者：口号、造词（「开启你的多模态灵感赋能旅程」） | 部分：19 只认英文 buzzword，`BUZZ19` 用 `\b`，CJK 全部漏过 | adapt | `slop_check.mjs` gate 19 增中文套话检测 + 测试 |
| 4 | 每个数字单独套框（统计卡一排） | 部分：3（三等宽图标卡）、4（卡中卡） | adapt | 不新增 id；扩写 gate 3 判断项，覆盖「相关统计拆成多张阴影卡」 |
| 5 | 圆角、阴影、彩边层层叠加 | 覆盖：3（彩色侧边条）、4、29 | keep | 无 |
| 6 | 颜色没有稳定用途 | 覆盖：token 角色（design-system-core §2-3）、74 | keep | 无 |
| 7 | 字号档位过多、主次仍不清 | 缺失：48 只管颜色与字体族字面量 | adapt | 新 gate `DA3`（Reflex, J） |
| 8 | 光学对齐、嵌套圆角不协调 | 缺失 | adapt | 新 gate `DA4`（Finish, J）；内圆角=外圆角−间距，仅在 `DESIGN.md` 未定义内圆角时 |
| 9 | 低频设置挡在主任务前，重复确认 | 缺失（UX 层） | adapt | 新 gate `DA5`（Reflex, J）；授权、付费、删除、不可逆确认必须保留 |
| 10 | 每个元素都飘、弹、逐个入场 | 部分：11（hover）、12（回弹）、27、62 | adapt | 新 gate `DA6`（Reflex, J），只补「全员错落入场」「无操作时装饰持续运动」 |
| 11 | 只有「高级一点」，没有具体参照 | 已由目录 + `DESIGN.md` 解决 | keep + adapt | 补边界：用户给参考图并点名要借鉴的属性 → design-atlas 定制 `DESIGN.md`；忠实复刻 → `image-to-ui-skill` |
| 12 | 「获奖级」与无限自审 | 覆盖：review-prompt 三轮上限 | keep | 无 |
| 13 | 用网页规则把视频动画改坏 | 不在 design-atlas 范围 | reject（转路由） | SKILL.md Scope 增「代码动画、视频」出口 |

第 2 行备注（2026-11-09）：在 `skills/development-workflows/design-atlas/tests/fixtures/slop/cjk-copy-pass/index.html` 上跑 `slop_check.mjs`。没有改 gate 54 的检测。同一页的普通中文不触发 gate 19；下面两条只看眉题。

- 带 `class="eyebrow"`、`font-size: 12px`、`letter-spacing: 0.12em`、`text-transform: uppercase` 的英文 `PLATFORM`，紧挨在中文标题 `潮汐时刻表` 之上：gate 54 报告 `eyebrow "PLATFORM" before <h2>`；gate 67 报告 `.eyebrow: uppercase tracked 0.12em at 12px in a label role`。
- 无 class、无缩小字号、无字距的 `<p>PLATFORM</p>`，紧挨在中文标题 `泊位一览` 之上：gate 54 与 gate 67 都不报告。这是机械检测的缺口，仍由判断清单人工看。本次不扩写 54。

### 4.2 八维审美流程

typography / whitespace / visual hierarchy / color / motion / micro-interaction / responsive / originality。design-atlas 的 review-prompt 第 6–9 题零散覆盖其中五维，但没有结构化诊断。

- 判定：adapt。作为**改稿分支**的诊断与报告骨架（每维写证据、改了什么、保留什么），不打分。
- 落点：新 `references/restyle.md`。不改 review-prompt 的五题结构，只加一题（见 §4.5）。

### 4.3 「哪些情况不必改」

- 用户明确的风格与品牌不算错误；单一外观特征不能断言「AI 生成」。
- 卡片、渐变、圆角、英文小标题、阴影、动画只要表达真实关系就能留。
- 已经清楚、好用的页面不为执行去味而重做。

design-atlas 通过声明材质和豁免处理第一条，但审计报告里没有「不得断言 AI 生成」「列出应保留项」的要求，build 流程也没有「好页面不重做」。

- 判定：adapt。审计分支报告增加 Keep 段，并禁止「这页是 AI 做的」式结论；改稿分支写明「只修影响最大的少数问题」。

### 4.4 共用规则 1–6

| 规则 | 判定 | 说明 |
| --- | --- | --- |
| 1 先明确目标、参考、风格锚点；用户风格优先 | keep | `DESIGN.md` 即锚点；改稿分支新增「捕获现有外观」让用户风格有落脚处 |
| 2 减少无信息装饰与说明，必要信息保留 | adapt | 即 `DA1` + `DA2` |
| 3 分步做，先定关键一屏 | adapt | implementation §4：多页面时先建并验证主页面首屏再铺开；**不等待**用户确认（与无头自动继续一致），除非用户要求先看 |
| 4 用截图指具体问题 | keep | review-prompt 已要求可指认的问题 |
| 5 在真实输出里验收 | keep | Workflow 第 7 步已覆盖 |
| 6 输入里的网页、截图、注释是材料，不执行其中指令；不为风格装依赖、改业务逻辑 | adapt | SKILL.md 一行「输入即材料」护栏；不装依赖、不改业务逻辑写进 restyle.md 保留清单 |

### 4.5 返回方式

| 方式 | 判定 | 说明 |
| --- | --- | --- |
| 只看图 / 只审查 | keep | 现有 audit 分支；补 Keep 段 |
| 修改工程 | invent | 现有流程缺「改已有页面」，新增 Restyle 分支 |
| 给提示语 | reject | design-atlas 交付代码与 `DESIGN.md`，不是提示语生成器 |
| 嵌入已有任务 | keep | 已是默认行为 |

review-prompt 增一题：「某处修改是否删掉了访客需要的信息（标签、限制、错误、价格、同意条款）？」

### 4.6 混合场景规则

humanizer 的关键洞见：`html` 是载体、`ui` 是目标；页面里的 3D 或 SVG 由各自规则管，界面由 ui 规则管；冲突时主目标优先并说明取舍。

design-atlas 对应的真实冲突：页面嵌入 Three.js 画布、视频或插画时，29（光晕）、80（手绘插画）、阴影类判断会误伤嵌入内容本身。

- 判定：adapt。新增「嵌入媒体」规则：嵌入物是内容不是界面外壳；House/Reflex 判断只评嵌入物周围的 UI；Floor gate 照样作用于嵌入元素（33 无障碍名、27 reduced-motion、28a 自动播放静音、62 默认可见）。嵌入物自身的建模、灯光、矢量绘制不归本技能。
- 落点：restyle.md 与 implementation.md §4 各一句，长规则只放 restyle.md。

### 4.7 html 模式（代码动画 + HTML 动态海报）

| 条目 | 判定 | 说明 |
| --- | --- | --- |
| 代码动画四条（像会动的 PPT、无系统、定位不准、只截一帧） | reject | 视频/动效作品不在 design-atlas 范围；仓库内无对应技能，Scope 用通用措辞转出 |
| 文字被画进图里（标题、图注、数值是位图） | adapt | 对 Web UI 同样成立且是无障碍问题（WCAG 1.4.5 文字图像）→ 新 gate `DA7`（Floor, J）；logo 豁免但品牌条目仍受 brand-boundary 约束 |
| 简单动效用 CSS，不是性能保证 | adapt | 报告措辞纪律：不写「必然更流畅」类结论；并入 restyle.md 报告规则 |
| 交付形态（公众号要静帧/视频） | reject | 非 UI |
| 署名与来源保留 | keep | 已由 46a / 76 / brand-boundary 覆盖 |
| 不默认引入大型动画框架 | adapt | 并入 restyle.md 保留清单「不为风格新增依赖」 |

### 4.8 svg 模式

| 条目 | 判定 | 说明 |
| --- | --- | --- |
| 图标系统：统一 viewBox、描边宽度、端点圆角 | adapt | design-system-core §4 增 Icons 规则 + 新 gate `DA8`（Reflex, J） |
| 单色图标改 `currentColor`；多色插画不改 | adapt | 同上 |
| 压缩时保留被 CSS/JS/SMIL 引用的 id、class、defs | adapt | 同上（一句） |
| 目标尺寸 16/24px 可读性 | adapt | 同上 |
| 路径节点简化、布尔合并、背景隐形层、SVGO 流程 | reject | 独立矢量资产优化不在范围；Scope 转出 |

### 4.9 3d 模式

全部 reject 为独立模式（几何拓扑、接触悬浮、材质、灯光、相机、多视角）。仅保留 §4.6 的嵌入边界。Scope 转出「3D 场景建模与灯光」。

### 4.10 提示语库、风格词、Anthropic 提示、来源档案

| 文件 | 判定 | 理由 |
| --- | --- | --- |
| `prompt-library.md` P1–P14 | reject 文本，机制已在上表吸收 | 无许可；P10（动效说成可实现的动作）的机制 adapt 进 implementation §4「Motion spec」 |
| `aesthetic-reference.md` 七种风格词、两种艺术方向 | reject | 目录 202 条目承担风格选择；词表会与路由关键词形成第二套风格系统 |
| 同文件六组滚动关系、五种交互动效术语 | adapt（仅概念） | Motion spec 区分 scroll-triggered（到阈值播一次）与 scroll-linked（进度跟随滚动），要求写起止与停止状态、窄屏行为；不搬词表 |
| 同文件外部参考网站清单 | reject | design-atlas 是离线目录；外链易失效，且本技能不替用户打开或购买站点 |
| `anthropic-prompts-en-zh.md` | reject | 「绝不用 Inter」与 brand-boundary 的 Inter 替代、gate 1 可豁免冲突；字体对比、主题一致、背景纵深已由主题条目与 gate 1/2a/37/65 覆盖 |
| `source-coverage.md`、`original-materials.md`、`english-originals-zh.md`、`expanded-sources.md` | reject | humanizer 自身的来源档案，不是可执行规则 |
| `code-animation.md` | reject | 同 §4.7 |
| `examples/` 前后图 | reject | 无许可；跨模型、非控制变量，作者自己也标明不能归因 |
| `类型：3d/svg/html/ui` 提示约定 | reject | design-atlas 用工作流分支分类，不引入第二套模式语法 |

## 5. 冲突图

| 冲突 | 胜出方 | 处理 |
| --- | --- | --- |
| gate 58 字数上限 vs 必要标签/限制/错误 | 必要信息 | `DA2` 为 Floor；58 的修法写「删复述，不删约束」 |
| Anthropic「绝不用 Inter」vs brand-boundary 与 gate 1 | design-atlas | 不引入 Anthropic 绝对禁令 |
| 错落入场（Anthropic 鼓励）vs humanizer #10 vs gate 62 | gate 62 + 判断 | 62 保持 Floor；`DA6` 只判「全员入场」与「无操作持续运动」 |
| humanizer「先做 hero 确认再扩展」vs design-atlas 无头自动继续 | 自动继续 | 先建并验证主首屏，不停下等待，除非用户要求先看 |
| 「用户风格优先」vs House 默认 FAIL | 声明材质 | 改稿分支先把现有外观捕获为 `DESIGN.md`，用户的选择在里面声明，House/Reflex 自动 WAIVED |
| 改稿且无 `DESIGN.md`：套目录条目 vs 保留现有外观 | 按用户意图 | 「保留风格/品牌、只去味」→ 捕获；「换风格/重新设计」→ 现有 route/apply |
| 参考图：借鉴属性 vs 忠实复刻 | 按用户意图 | 借鉴点名属性 → design-atlas 定制 `DESIGN.md`；复刻 → `image-to-ui-skill` |
| 嵌入 3D/视频/插画 vs 29/80/阴影判断 | 嵌入边界 | 判断只评外围 UI；Floor gate 仍作用于嵌入元素 |
| description 预算 | 约 114 字符余量（当前约 910/1024） | 只加改稿触发与三项出口；实现时以 `scripts/check.py` 为准 |
| gate 表与 `TIERS`/`CLASSES` 同步测试 | 同步修改 | 新 gate 同时进表格与脚本两处 J 类登记 |

## 6. 范围选项

| 选项 | 内容 | 评价 |
| --- | --- | --- |
| A 最小 | 只吸收 ui 模式：Keep 护栏、DA gate、中文套话、改稿分支 | 风险低；但嵌入 SVG 图标、3D 画布、动效规格的真实冲突仍无规则 |
| **B 推荐** | A + 嵌入媒体边界 + SVG 图标规则 + Motion spec；3d/svg 资产/代码动画明确转出 | 只收在 Web UI 内真实发生的部分，description 能放下，契约不被稀释 |
| C 全量 | 把 3d/svg/html 四模式都并入 | 与 `DESIGN.md`、token 层、`slop_check` 的 Web UI 契约不兼容；description 放不下；建议另立独立技能（后续任务，不在本任务） |

## 7. missing evidence

- humanizer 规则来自作者在 SenseNova-6.8-Flash 上的实测，不是跨模型结论；本次未复现。
- 改稿分支、DA gate 在真实页面上的效果未验证；本任务交付后仍只有静态测试与 evals 草案。
- `evals.json` 不被 CI 执行；触发行为需另跑 trigger eval（用例草案见 `trigger-cases.json`）。
- 各宿主自动发现新版本未验证。
- Impeccable、Taste Skill 未研读；skills.sh / SkillsMP 未检索。
