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
