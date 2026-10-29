# 设计：Anti-slop

## 1. 为什么移植而不 vendor

hallmark `sloplint.mjs`（236 KB）有三处硬耦合，原样 vendor 会在任何非 hallmark 项目上产生假 FAIL：

- gate 20（缺 Hallmark CSS 戳）是 Floor。
- 直接读取 `--color-paper`、`--space-*` 等固定 token 名。
- 豁免、posture、hero 等全部从 CSS 戳文本中解析。

见父 research §3。因此做法是：按 gate 逐个移植检测逻辑，换成与命名无关的 token 层识别和 DESIGN.md 豁免。解析器（CSS 解析、HTML 解析、JSX class 提取、模板遮罩、颜色解析与对比度计算）可以整段移植，并在函数头注释中标明上游行号范围。

## 2. 模块划分（单文件，按段落组织）

```
slop_check.mjs
  args / usage
  collect files            ← sloplint collectFiles
  parse: css, html, jsx    ← sloplint parseCss / parseHtml / templateMask / clsLits / classCalls
  color utils              ← parseColor / oklch↔srgb / contrastRatio
  token layer detection    （新写：:root、[data-theme]、.dark、@theme、tailwind.config theme）
  design.md reader         （新写：frontmatter token、x-theme、## Anti-slop Waivers）
  declared-material rules  （新写：gate → 谓词，作用在 DESIGN.md 上）
  gates                    （每个 gate 一个函数：(ctx) => findings[]）
  TIERS                    （与 anti-slop.md 一致，由测试保证）
  report / exit
```

不实现 hallmark 的 `--render`、`--before`、`--kept`、`--stage`、`--genre`。genre 豁免（如 mm 允许 `#fff` 纸面）改为由 DESIGN.md 中声明的颜色触发。

## 3. 声明材质谓词（初版）

| gate | 当 DESIGN.md 满足以下条件时 WAIVED (declared) |
| --- | --- |
| 1 默认字体做 display | `typography.display*` 或 `headline*` 的 fontFamily 首项就是被标记的字体 |
| 64 mono 当装饰 | `x-theme.display.class == mono`，或 body/label 字体首项为等宽字体 |
| 67 大写字距标签 | 任一 typography token 同时满足 `textTransform: uppercase` 和 `letterSpacing > 0`，或正文 `## Typography` 明确写出 uppercase label 规则 |
| 54 eyebrow | 正文明确将 eyebrow/kicker 列为组件（`## Components` 中出现 `eyebrow` 键） |
| 65 奶油纸+衬线+赤陶（J 类，进清单） | canvas 色相 55–105 且 L ≥ 90，并且 display 为衬线、primary 色相 20–50 |
| 2a 紫蓝渐变 | 正文或 token 显式声明渐变是材质（如 `style:gradient`），且渐变两端都是 DESIGN.md 中的颜色 token |
| 7a 纯黑白 | 任一颜色 token 的值为 `#000`/`#fff`/`oklch(0%…)`/`oklch(100%…)`。注意：7a 是 Floor，此处的“声明”只表示该字面量被视为 token 层的一部分，而不是豁免。检查器把 DESIGN.md 中声明的纯色当作 token 值，允许 `var()` 引用；页面中的裸字面量仍然 FAIL |

谓词只能把 House/Reflex 降为 WAIVED，永远不作用于 Floor。

## 4. 手写豁免

```
## Anti-slop Waivers
- waive 47b · one frame with a real terminal capture inside · the CLI output is the product
```

- 解析：`^- waive (\S+) · (.+?) · (.+)$`。
- 拒绝条件：gate 未知；gate 为 Floor；reason 少于 24 字符；同一 gate 出现两次。被拒绝的豁免报 `NOTE waiver-rejected`，原 gate 照常报。
- 豁免作用于整个项目，与 DESIGN.md 同一作用域。不提供按文件豁免，以免豁免失控。

## 5. 输出与 exit

- 一个 gate 在同一文件中命中超过 8 次时折叠为一行，例如 `+N more`，沿用 hallmark 做法。
- 汇总行：`slop_check: Floor 0 FAIL · House 1 FAIL · Reflex 2 (1 waived) · WARN 0 · files 12`。
- `--json`：`{summary, findings:[{gate, tier, grade, file, line, message, fix}]}`。

## 6. 与其他子任务的接口

- 主题正文中出现的 gate 编号（如 `waive 38iii`、`(83)`），在 anti-slop.md 中要么作为已采纳 gate 存在，要么在“未采纳 gate”附录中列出编号与一句说明，使主题引用不悬空。由 themes 子任务的引用扫描测试和本任务的 md 表格共同保证。
- 如果 themes 子任务先完成：用它生成的 `theme:terminal` 的 DESIGN.md 作为声明材质 fixture。如果它未完成：fixture 中手写一份等价的 DESIGN.md。

## 7. 逐 gate 移植决定（实现记录）

上游：hallmark `skills/hallmark/scripts/sloplint.mjs` @ `8f6969f8`。解析器（parseCss / parseHtml / templateMask / clsLits / jsxPseudo / classCalls）、颜色工具（parseColor / oklch 换算）和 Tailwind 读取（twParse / twInfo / twGroup）按上游逻辑移植，脚本中逐段标注上游行号。共性改动：去掉 Hallmark CSS 戳（gate 20 不移植）；token 层改为按选择器识别（`:root`、`html`、`:host`、主题属性/类、`@theme`、`@font-face`、`tailwind.config.*`），不看 token 名；豁免与声明材质改从 DESIGN.md 读取。

| Gate | 来源 | 决定 |
| --- | --- | --- |
| 1 | check1 | 照搬默认字体名单；display token 改用角色词正则（`--font-display`、`--heading-font` 等）加标题选择器的 font-family。声明：DESIGN.md display/headline typography 或 `x-theme.display.face` 同名 → WAIVED |
| 2a / 2b | gradientHues、bannedGradient、check2、twGradient | 照搬紫蓝、紫粉、深色页青色判定；深色页由 html/body/:root 背景或 DESIGN.md canvas 色判断（上游读 `--color-paper`）。2a 声明：正文写明渐变且所有色标等于 DESIGN.md 颜色 |
| 4 | check4 | 照搬 |
| 7a | check7 前半 | 照搬纯黑白判定；token 层按选择器豁免；新增内联 style 检查。7b 不移植 |
| 10a / 10b | check10、check10Motion | 合并为一个函数；Tailwind `transition-all`、`transition-[margin]` 保留。10b 报 REFLEX |
| 12 | check12 + Tailwind bounce/overshoot | 去掉上游 spring 姿态豁免（本 skill 无该 stamp） |
| 15 | check15 | 照搬 |
| 19 | check19、checkCopyTell | 占位名、Acme/Nexus、buzzword、反驳句式照搬；破折号只在两个拉丁字母之间判定，中文破折号不报；并入上游 42 的套话按钮文案（Learn more / Get started 等） |
| 26a / 26b | check26 | 照搬全局缺失判定（component scope 跳过缺失判定）；新增“focus 去掉 outline 且无替代”及 Tailwind `focus:outline-none` 无 ring |
| 27 | check27 | 照搬，含 Tailwind motion-reduce / motion-safe |
| 28a | check28 前半 | autoplay 无 muted 报 FAIL；首屏媒体 lazy 报 WARN。28b 不移植 |
| 30a / 30b | check30、checkComponentText | 照搬；30b 报 REFLEX |
| 33 | check33 | 照搬 |
| 34 | check34 | 照搬，含 Tailwind `overflow-x-hidden` 和 100vw |
| 37 | check37 | 照搬；token 字体只算 token 层规则 |
| 38i | check38a 前半 | 照搬。38ii 不移植，38iii 为 J |
| 39a | check39 前半 | 照搬。39b 不移植 |
| 47a / 47b | CHROME_47、check47 | 照搬类名/选择器正则。47c 为 J |
| 48 | check48 + checkTailwind 字面量 | 照搬；token 层按选择器识别 |
| 50 | check50、check50Wrap | 照搬 |
| 53 | check53 | 照搬 |
| 54 | EYEBROW_*、eyebrowHit、check54、check54Unheaded、tw54 | 照搬；无标题 section 报 WARN。声明：`## Components` 或 components token 中出现 eyebrow/kicker |
| 55a | check55 前半 | 照搬。55b 不移植 |
| 62 | HIDE_OK、check62 | 照搬 |
| 63 | check63、checkComponentText | 照搬（中点串、箭头、WORD - 片段、装饰状态点） |
| 64 | monoIsMaterial、check64、Tailwind font-mono | 页面自身 display/body 为等宽时仍静默；DESIGN.md 声明（`x-theme.display.class: mono` 或 typography 中等宽字体）→ WAIVED（declared），先于静默判定 |
| 67 | LABEL67、check67、check67Html、tw67 | 照搬。声明：typography token 同时 uppercase + letterSpacing>0，或 Typography 正文写明大写标签规则 |
| 74 | TAILWIND_HEX、checkTailwind 调色板计数 | CSS 中的 Tailwind 默认 hex 每处报；同一文件 3 个以上不同调色板类报一次；均为 REFLEX。声明：该 hex 出现在 DESIGN.md 颜色中 |

报告实现差异：
- 豁免 reason 校验沿用上游（≥24 字符、套话、复用、与页面无共同词），共同词扩展到 DESIGN.md 正文并支持中文二字词；超过 3 个被接受的豁免报 NOTE。Finish 检查不接受豁免。
- 被拒豁免报 `NOTE <gate> DESIGN.md:<line> waiver rejected: …`，JSON 带 `rule: "waiver-rejected"`。
- 7a 的 DESIGN.md 纯色声明不做 WAIVED：token 层内的纯色本就不报，组件里的裸字面量仍 FAIL，与第 3 节一致。
