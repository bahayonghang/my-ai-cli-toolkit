# Hallmark × design-md 合并分析

> 2026-10-28。来源：`ref/repo/hallmark`（Nutlope/hallmark v2.0.0，commit `8f6969f8922caabde9de1784959eae11ddf68073`，MIT）与 `skills/development-workflows/design-md` v0.2.0。所有数字都是本次读取的实际值。

## 1. 两边各有什么

| 项 | hallmark | design-md |
| --- | --- | --- |
| 设计条目 | 50 个 theme（`references/themes/<slug>.md` 3–8 KB + `<slug>.jpg` 约 110 KB），`index.json` 汇总头部元数据 | 153 个条目：84 brand、68 style（bergside）、1 scene（`scene:bi`），19 个分类，`index.json` |
| 条目性质 | “材质”：纸、墨、字体、表面、控件、动效、语气、禁区；OKLCH `:root` token；明确不规定页面结构 | stitch 格式 DESIGN.md（YAML token + 章节）或 legacy |
| 选择方式 | `theme.mjs deal`：按 prompt 关键词 + genre 打分，发 3 张，模型看图挑 1 | `search` / `list --category`，给 2–3 个候选后**等用户选**；用户授权时才自选 |
| 质量门禁 | 88 行 gate（Floor / Reflex / Finish / Ledger），`sloplint.mjs` 236 KB 静态 + `sloplint-render.mjs` 100 KB 渲染（puppeteer-core） | `design-system-core.md` QA 清单（9 项），无脚本检查 |
| 项目锁定 | 可选 `design.md`（约 45 行）锁系统 | 项目根 `DESIGN.md` 是唯一事实源 |
| 其他 | 21 个 macrostructure、`anatomy.md`（按“访客要做的事”排页面）、755 张 Wikimedia 图片清单（`photos.json` 453 KB）、`capture.mjs`、`imagegen.mjs`（Together AI）、redesign/audit 动词、新鲜上下文 reviewer | brand-boundary、实现指南、运行页验证 |

## 2. 50 个主题与现有条目的重叠判定

判定口径：

- `supersede`：材质相同（纸/墨/字体类/强调色/姿态 4 项中 ≥3 项一致，且描述指向同一种视觉传统）。导入 hallmark 主题，旧 style 条目保留 id 但标记 `superseded_by`，默认不出现在 list/route。
- `cluster`：同一视觉家族但材质不同。两边都保留，路由时同一 cluster 不同时进入前 3。
- `distinct`：现有目录没有对应物，直接导入。

下表的 `supersede` 和 `cluster` 是**初判**，实现时须并排读两份文件确认，最终结论写进 `dedup.json`。

| theme | genre | paper | display | accent | 初判 | 对照条目 |
| --- | --- | --- | --- | --- | --- | --- |
| almanac | editorial | mid | grotesk-sans | magenta | distinct | — |
| arcade | playful | dark | pixel | ember | cluster `retro-pixel` | style:pacman, sega, retro, tetris |
| atelier | editorial | light | roman-serif | cool | cluster `refined-serif` | style:refined, square |
| bloom | atmospheric | light | grotesk-sans | warm | distinct | — |
| blueprint | modern-minimal | mid | geometric-sans | neutral | distinct | — |
| broadside | editorial | light | display-condensed | warm | cluster `poster` | style:bold, dramatic |
| brutal | editorial | light | grotesk-heavy | yellow | **supersede?** | style:brutalism, neobrutalism |
| carnival | editorial | light | display-heavy | yellow | cluster `poster` | style:vibrant, expressive |
| cobalt | modern-minimal | light | grotesk-sans | cool | cluster `devtool-light` | style:shadcn |
| console | modern-minimal | dark | grotesk-sans | amber | distinct | — |
| coral | modern-minimal | light | grotesk-sans | warm | cluster `saas-light` | style:clean, professional |
| darkroom | atmospheric | dark | display-condensed | amber | distinct | — |
| dose | modern-minimal | light | grotesk-sans | green | distinct | — |
| dusk | modern-minimal | dark | grotesk-sans | cool | cluster `glass` | style:enterprise |
| editorial | editorial | light | display-condensed | green | cluster `magazine`（同名不同材质） | style:editorial, modern |
| formwork | editorial | mid | display-condensed | warm | distinct | — |
| furrow | modern-minimal | light | grotesk-sans | warm | distinct | — |
| garden | editorial | light | roman-serif | green | distinct | — |
| grid | editorial | light | grotesk-sans | cool | cluster `swiss` | style:geometric |
| halftone | playful | light | slab-serif | warm | cluster `print-dot` | style:dithered |
| hedgerow | editorial | dark | high-contrast-serif | green | distinct | — |
| hum | playful | light | rounded-sans | yellow | cluster `friendly` | style:friendly, lingo |
| ink | editorial | light | grotesk-sans | teal | distinct | — |
| kiln | atmospheric | dark | high-contrast-serif | warm | distinct | — |
| loom | editorial | light | roman-serif | cool | distinct | — |
| lumen | atmospheric | dark | roman-serif | warm | distinct | — |
| manifesto | editorial | dark | display-condensed | warm | cluster `poster` | style:power, dramatic |
| midnight | atmospheric | dark | grotesk-sans | cool | distinct | — |
| newsprint | editorial | light | slab-serif | warm | cluster `print-paper` | style:paper, basic |
| overprint | playful | light | grotesk-heavy | cool | distinct | — |
| pasteup | playful | mid | display-condensed | yellow | distinct | — |
| piste | playful | light | display-condensed | cool | distinct | — |
| refract | atmospheric | light | grotesk-sans | cool | cluster `glass` | style:glassmorphism, airy-glass |
| ribbon | atmospheric | light | grotesk-sans | teal | distinct | — |
| rim | modern-minimal | dark | grotesk-sans | warm | distinct | — |
| riso | editorial | light | grotesk-heavy | pink | **supersede** | style:riso（同为粉蓝双色 riso） |
| solstice | editorial | light | high-contrast-serif | warm | distinct | — |
| specimen | editorial | light | high-contrast-serif | cool | distinct | — |
| spore | atmospheric | dark | roman-serif | warm | distinct | — |
| sport | editorial | light | display-condensed | volt | distinct | — |
| squeeze | playful | mid | geometric-sans | warm | distinct | — |
| sticker | playful | light | display-heavy | magenta | distinct | — |
| studio | editorial | light | roman-serif | warm | distinct | — |
| terminal | atmospheric | dark | mono | green | **supersede?** | style:mono（绿荧光等宽）；cluster style:matrix, codex |
| terrazzo | modern-minimal | light | geometric-sans | warm | distinct | — |
| ultraviolet | modern-minimal | light | geometric-sans | cool | cluster `neon` | style:neon |
| vantage | modern-minimal | dark | grotesk-sans | lime | distinct | — |
| vellum | editorial | light | blackletter | cool | distinct | — |
| wayfind | modern-minimal | light | mono | cool | distinct | — |
| werkstatt | playful | mid | geometric-sans | cool | distinct | — |

初判合计：supersede 1 个确定（riso）+ 2 个待确认（brutal、terminal）；cluster 约 17 个；distinct 约 30 个。导入后可见条目约 153 + 50 − 1~3 ≈ 200。

## 3. Anti-slop 机制要点

- **Floor 16 条**（SKILL.md）：token 化颜色与字体、禁 `transition: all`、禁标题中单个斜体词、`overflow-x: clip`、`minmax(0,1fr)`、`:focus-visible` 立即出现、reduced-motion 回退、禁编造数据/评价/logo 墙、禁 eyebrow 与大写字距标签、禁中点拼接 meta 串、禁紫蓝渐变/卡中卡/emoji 图标/手绘浏览器窗、首屏 1280×800 可见、每屏约 80 词、容器封顶居中、CSS 戳、跑 sloplint。
- **gates.md 88 行**，分级：Floor（不可豁免）、Reflex（可带理由豁免）、Finish（不阻塞）、Ledger（记账）。分类：M 静态、M/R 静态+渲染、R 渲染、R/J、J 人工判断。
- **Hallmark 的“house rule”**：54 eyebrow、58 屏幕字数、63 模板标点、67 大写字距标签被提成 Floor，比行业更严。
- **sloplint 与 hallmark 深度耦合**（`scripts/sloplint.mjs`）：
  - gate 20（缺 Hallmark 戳）是 Floor，任何非 hallmark 页面都会 FAIL（行 799）。
  - 多处直接读 `--color-paper`（行 1140、2495、3074）。
  - 24a 依赖 `--space-*` token（行 1554、1576）。
  - 豁免、posture、hero 等都从 CSS 戳文本里解析（行 856–930）。
  - 渲染层需要 `puppeteer-core` + Chrome。
- 结论：**不能原样 vendor sloplint**。按 stitch DESIGN.md 搭建的项目 token 名不同，会产生大量假 FAIL。

## 4. 与现有目录的规则冲突

| hallmark gate | 冲突条目 | 处理方向 |
| --- | --- | --- |
| 65 奶油纸 + 高对比衬线 + 赤陶强调色（Reflex，只针对 custom/未定主题的构建） | style:claude、style:terracotta 正是这种外观 | DESIGN.md 声明了这种材质时视为“声明材质”，自动豁免并记录 |
| 1 Inter/Roboto 等做 display（Reflex） | 多个 brand 条目（如 linear.app、vercel）用 Inter/Geist | 同上，DESIGN.md 声明的字体自动豁免 |
| 67 大写字距标签、54 eyebrow（Floor house rule） | 部分 brand/style 条目要求大写 mono 标签 | 本 skill 中降为“默认 Floor，DESIGN.md 显式声明时可豁免”，可访问性/诚实类 Floor 仍不可豁免 |
| 64 mono 当装饰 | style:mono、matrix、theme:terminal、wayfind | 材质即 mono 时豁免 |

## 5. Deal 算法（`theme.mjs` 217–260 行）

- prompt 去停用词、词干化；主题关键词全部命中才算命中；按关键词在全体主题中的出现次数加权（df≤2 → 3 分，≤4 → 2 分，其他 → 1 分）。
- genre 相同 +2，不同 −1；最近 3 次用过的主题或与上次同轴（paper/display/accent 三元组）则屏蔽；同轴兄弟 −1。
- 取前 n 个时强制第 2 张换 paper 带、三张不同三元组。
- 随机种子 = prompt 哈希 + 项目 salt + 日期。
- 局限：只认英文关键词；不读项目本身（只读 prompt）；依赖 `.hallmark/log.json` 做跨构建多样性。

## 6. 不在本次范围内的 hallmark 能力

- `photos.json`（755 张 Wikimedia 图片，逐张许可与署名）与 `picture.mjs`、`capture.mjs`、`imagegen.mjs`（Together AI 付费服务）。
- 21 个 macrostructure 与 `anatomy.md`（按“访客要做的事”构造页面）：价值高，但属于“页面构成”而非“主题/门禁”，列为后续候选。
- redesign 流程（`--before` / `--kept` 记录与对比）。
- 渲染层 sloplint（8 宽度截图、像素级检查）。
- 跨构建多样性日志（`.hallmark/log.json`）：DESIGN.md 本来就锁定单项目单系统，多样性收益小。
- 主题预览图（50 张约 5.5 MB）：不进仓库，索引里存固定 commit 的远程 URL。

## 7. qiaomu-meta-skill 视角

- 模式：**Production**（仓库内团队复用、跨 Claude/Codex 等平台）+ Skill IR 导出。不到 Governed：不发布账号、不触碰密钥。
- Generalization gate：hallmark 的 house rule 是作者口味，不是跨领域不变量。只有可访问性、正确性、诚实性类 gate 保持不可豁免，其他都要允许 DESIGN.md 显式声明后豁免。
- 命名：meta-skill 默认 `qiaomu-` 前缀与署名在本仓库不适用。仓库约定是 kebab-case 和用户本人署名，按仓库约定执行。
- 触发边界的近邻：`html-artifact`（报告/幻灯片）、`image-to-ui-skill`（截图复刻）、用户全局的 `huashu-design`（HTML 原型/动画/三方向初稿）、`ui-ux-pro-max`、`ui`、`write`（文字“去 AI 味”）。“UI 去 AI 味”和“文案去 AI 味”必须在 description 和 evals 中分开。
- Prior-art 检索（`npx skills find` / SkillsMP）本次未运行，记为 `missing evidence`，放在父任务实现第 0 步。
