# design-atlas 轻盈毛玻璃按项目配色自适应

## Goal

`style:airy-glass`（轻盈毛玻璃）现在把字段写死为薄荷 `#E7F6F1` → 薰衣草 `#EDE7F8`，语义色写死为绿 `#187A56`（输入）/ 紫 `#6D4BD6`（输出）。不论项目是什么、已有什么配色，写出的 `DESIGN.md` 都是浅绿。

目标：把配色变成一个「色板拨盘」（palette dial），由项目已有配色和项目内容决定；毛玻璃的材质规则和 WCAG 2.2 AA 对比度门禁保持不变，且每一套写出的配色都附带实测对比度。

## 已确认的决定（2026-11-09，用户）

- 取色机制：**预设色板 + 脚本推导**。内置若干套实测好的 colourway（薄荷/薰衣草保留为其中一套），按项目 accent 色相和内容挑最近的一套；项目有明确主色、离所有预设都远时，按色相推导整套颜色，自动调到 AA，并把实测比值写进 `DESIGN.md`。
- 语义色：**跟着变，语义保留**。input 跟随项目主色（或所选 colourway 的主色），output 取一个拉开色相的对比色；「输入/完成 vs 输出」、焦点环用 input 色这些规则不变。

## Requirements

R1. 色板数据：airy-glass 拥有一组预设 colourway（至少 4 套，包含现有 mint），每套给出 field-start、field-end、input、input-wash、output、output-wash，以及选择用的锚点色相和内容关键词（中英）。数据放在 first-party、重建 catalog 时不会被删除的位置。

R2. 自动选择（`auto`，airy-glass 的默认行为）按以下优先级：
  1. 项目 CSS token 层有可读的、有彩度的 accent（primary/brand/accent）→ 色相离某套预设足够近就用那套，否则按该色相推导；
  2. 没有可用 accent → 用项目内容（README、package/pyproject/Cargo 描述和关键词）与用户提示词匹配预设关键词；
  3. 都没有 → 默认 mint，并说明是回退。
  灰色或近灰的 accent（低彩度）视为没有 accent。

R3. 显式选择：用户可以指定预设名或色相（例如 `hue:18`），覆盖自动选择。

R4. 推导：给定任意色相 0–359，生成的整套颜色必须通过 R6 的全部门禁；output 色相与 input 拉开且不落在错误红/警告琥珀的保留色相带；字段两端彩度低到不会被 anti-slop 渐变门禁（2a）当作有彩渐变。

R5. 写出 `DESIGN.md`：`apply style:airy-glass` 写出的文件中，frontmatter 颜色、正文里的色值、CSS 示例、Accessibility 对比度表都对应所选配色；provenance 注释下记录所用 colourway / 色相和选择理由；不再出现与所选配色无关的「薄荷 / 绿 / 紫」描述。stdout 打印所选配色与理由，供 Picks 块使用。

R6. 对比度门禁（每套预设和每个推导结果都要满足，按最差背景计算）：
  - ink 在白纸、以及在「白 0.78 叠字段两端」上 ≥ 4.5:1；
  - muted 在「白 0.78 叠字段两端」上 ≥ 4.5:1；
  - input 在 input-wash 和白色上 ≥ 4.5:1（同时保证 2px 焦点环 ≥ 3:1）；
  - output 在 output-wash 和白色上 ≥ 4.5:1；
  - 白描边对字段的比值照常列出（用于说明它不能当控件边界）。

R7. 只读预览：能在不写文件的情况下看到某个项目会得到哪套配色及对比度表（文本与 JSON）。

R8. 材质规则不变：仅纸张 blur 一次（16–24px，默认 20px，saturate 1.15）、不透明回退（<960px / 减少透明度 / 无 `backdrop-filter`）、每屏 ≤ 6 层、不嵌套、不动画 blur、单阴影、圆角与字体、无暗色主题，全部保留。

R9. 范围约束：`--palette` 只对有色板数据的条目生效；对其他条目给出参数错误，不静默忽略。其他 201 个条目的 `show` / `apply` 输出字节不变。

R10. 文档与评测同步：SKILL.md 命令表与版本号、README、`references/routing.md`（Picks 块）、`references/design-md-format.md`（自定义一节）、`evals/evals.json` 增加覆盖自适应配色的用例。

## Acceptance Criteria

- [ ] 用 mint 预设重新生成的 Accessibility 表与现有实测值一致（13.47 / 13.16 / 5.37 / 4.79 / 5.31 / 5.08 / 5.79 / 1.11，允许 ±0.01），证明对比度计算与原表口径相同。
- [ ] 每套预设、以及 0–345° 每 15° 一个色相的推导结果，全部通过 R6；字段两端 OKLCH 彩度 ≤ 0.04；output 色相不在保留色相带内。
- [ ] 项目 `:root { --color-primary: #2563EB }` → `apply style:airy-glass` 写出的 `DESIGN.md` 不含 `#E7F6F1` / `#187A56` / `#6D4BD6`，字段和 input 跟随蓝色系，stdout 写明理由引用 `--color-primary`。
- [ ] 无 CSS token、README 含明确内容关键词的项目 → 选中对应预设；什么信号都没有 → mint，并标注为回退；灰色 accent → 不当作 accent。
- [ ] `--palette sky` / `--palette hue:18` 覆盖自动选择；非法值和对非色板条目使用 `--palette` 均以退出码 2 结束，不写文件。
- [ ] 对 apply 结果所在目录运行 `slop_check.mjs`，使用所写字段渐变的示例页面不会出现 2a FAIL（声明的渐变材质能被识别为豁免）。
- [ ] 同一输入重复运行结果相同（确定性）。
- [ ] `assets/catalog/first-party/airy-glass.md` 与 `assets/catalog/styles/airy-glass.md` 仍逐字节一致；其他条目的 `apply` 输出不变。
- [ ] `just ci` 通过（含 docs-check、python-test、node-test、evals-check）。

## Out of Scope

- 暗色主题、图表色板（仍列在 Known Gaps）。
- 让其他 style / theme 条目也支持色板拨盘（机制做成可复用，但这次只填 airy-glass 的数据）。
- 改动路由打分、`slop_check` 的门禁逻辑。
- ink / muted 随色相染色（保持固定中性色，记为 Known Gap）。
