# 轻盈毛玻璃如何进入目录

## 边界

改动只在 `skills/development-workflows/design-md/` 及其由 `just docs-sync` 生成的 docs 页面。

不改 `style:glassmorphism`，不新增技能包，不在仓库根写项目 `DESIGN.md`。

## 为什么不能只加一个 md

`scripts/build_catalog.py` 从两个上游检出生成 `entries`，再按 `files` 字典写 `styles/*.md`。字典里没有的 `styles/*.md` 会被删除（约第 314–319 行）。`categories.json` 的 `style` 映射若写入一个上游目录里不存在的 slug，构建会以 “mapped but missing upstream” 失败。

所以：

- 源文件放在 `assets/catalog/first-party/`，重建循环不扫描这个目录，也不会把它当上游缺失项。
- `categories.json` 的上游 slug 列表不加 `airy-glass`。
- `build_catalog.py` 在写出之前，若 `out/first-party/manifest.json` 存在，就把其中的条目并进 `index.json`，并把源 markdown 放进 `files["styles/airy-glass.md"]`。
- 临时测试目录没有 `first-party/` 时，构建行为与现在相同。

运行时读的是提交后的 `index.json` 和 `styles/airy-glass.md`。实现时两处都要更新，不能只改构建器。`styles/airy-glass.md` 与 `first-party/airy-glass.md` 字节相同。以后改内容只改 first-party，再让构建复制；本任务没有上游检出，就直接写两份相同的 LF 文本。

## 来源注释

`design_catalog.py` 的 `provenance()` 遇到 `source == "first-party"` 时写：

`<!-- design-md: entry=style:airy-glass; source=first-party; license=MIT -->`

不把 first-party 放进 `index.json` 的 `sources`。现有许可测试要求每个 source 都有 MIT 文件和上游 commit，冒充一条会把自有条目说成 VoltAgent 或 Bergside 的文件。

## 索引条目

插入到风格条目的 slug 字母序位置（`agentic` 之前）：

- `id`: `style:airy-glass`
- `kind`: `style`
- `slug`: `airy-glass`
- `name`: `轻盈毛玻璃`
- `category`: `style-tactile-depth`
- `format`: `stitch`
- `path`: `styles/airy-glass.md`
- `source`: `first-party`
- `upstream_path`: `assets/catalog/first-party/airy-glass.md`
- `description`: 同时含「轻盈毛玻璃」和 airy frosted glass，一句话写明浅色字段、白纸、绿与紫两个语义色。

`manifest.json` 使用同一对象，便于重建时合并。

## 视觉论点

- 视觉：明亮、低彩度的冷色空气。白纸浮在薄荷到薰衣草的字段上，数字负责强调。
- 内容：工作台，先状态，再数字，再动作。没有营销头图。
- 交互：按下时 `transform: scale(0.98)`，约 120ms，只动 transform。键盘触发的状态不动画。`prefers-reduced-motion` 取消缩放。模糊半径不参与动画。

这是有意打破 `/ui` 的两条默认禁令，并写进条目的 Don't 旁：

- 玻璃不是默认卡片皮肤。只有浮在字段上的纸可以用一次 `backdrop-filter`。井、列表行、表格用实色。
- 1px 边是 `rgba(255,255,255,0.80)` 的受光边，不是实色围栏，也不是控件的 3:1 边界。控件靠填充和 2px `#187A56` 焦点环（对白底 5.31:1）。

也不把应用外壳「装饰背景默认关闭」套到这条风格上。选用本条目就表示字段渐变是材料。不要把这层渐变贴到另一份 `DESIGN.md` 上。

## Token

字段与光斑不是文字背景。文字只出现在纸或井上。

| 角色 | 值 | 规则 |
| --- | --- | --- |
| `canvas-mint` | `#E7F6F1` | 渐变一端 |
| `canvas-lavender` | `#EDE7F8` | 渐变另一端，约 160deg |
| `blob-mint` / `blob-lavender` | 同色相、略高彩度 | 最多 3 块，模糊约 80px，不透明度约 0.55，不放在文字下 |
| `sheet` | `rgba(255,255,255,0.78)` | 唯一可模糊的表面 |
| `sheet-blur` | `20px` | 允许 16–24，默认 20。饱和 `1.15` |
| `sheet-solid` | `rgba(255,255,255,0.96)` | 窄屏、减少透明度、无 backdrop-filter |
| `sheet-edge` | `rgba(255,255,255,0.80)` | 1px。不是控件边界 |
| `sheet-shadow` | `0 20px 48px rgba(70, 90, 120, 0.08)` | 只一层 |
| `ink` | `#24303A` | 标题与正文 |
| `muted` | `#5C6B76` | 12px 级次要信息 |
| `input` | `#187A56` | 输入、完成、链接、焦点 |
| `input-wash` | `#E7F7F0` | 实色井，不再模糊 |
| `output` | `#6D4BD6` | 输出与次要数据 |
| `output-wash` | `#F3EEFC` | 实色井 |
| 圆角 | 12 / 16 / 20 / 999 | 内图 12，井 16，纸 20，胶囊 999。纸 padding 8 时内图圆角 12，满足 outer = inner + padding |
| 间距 | 8 / 12 / 16 / 24 / 32 / 48 | 最小间隙 8 |

字体：`Figtree, "PingFang SC", "Noto Sans SC", sans-serif`。不用 Inter、Plus Jakarta Sans、DM Sans。拉丁大号数字字距约 -0.02em，中文运行不加负字距。中文正文行高 1.7。数字 `font-variant-numeric: tabular-nums`，32px / 700。标题 16px / 650。正文 14px。次要 12px / muted。

图标：线性，描边约 1.5px，`currentColor`。

玻璃预算：同一视口最多 6 个 `backdrop-filter`。纸里面不再套纸。小于 960px 时全部改 `sheet-solid`。

## 文件结构

风格测试只强制 `## Accessibility` 和 `### Do`。本条目 additionally 按 stitch 顺序写 Overview、Colors、Typography、Layout、Elevation & Depth、Shapes、Accessibility、Writing Tone、Do's and Don'ts、Responsive Behavior、Known Gaps。不写 `## Components`。

Known Gaps 写明：无暗色主题，无图表色板，对比度是对静态井和白纸混合算的，不是对照片背景算的，Figtree 不可用时落到系统无衬线。

## 计数与触发

- `tests/test_design_catalog.py`：151 → 152，风格 67 → 68。列表断言改成标题里的 `152 entries`，避免字符串 `151` 偶然出现在别的描述里。
- README 总述与「质感与空间深度」一行：6 → 7，示例加上 airy-glass。
- `SKILL.md` description 现为一行约 836 字符，值本身低于 1024。把 151/67 改成 152/68，并在示例风格里加上 airy glass 与「轻盈毛玻璃」。
- `agents/interface.yaml` 若复述了 151，一并改。
- description 变更后运行 `just docs-sync`。

## 兼容与回滚

回滚是整组反向：删 first-party、删 `styles/airy-glass.md`、从 `index.json` 去掉条目、还原 provenance 分支、还原计数与测试。不要留下 `source: first-party` 但文件缺失的索引。

## 取舍

高填充（0.78）比 Dribbble 水晶卡更“实”。这是为了让低饱和字段上的文字稳定过 4.5:1。轻，来自字段的颜色、大圆角和淡阴影，不来自把纸做成全透明。

输入绿从更亮的 `#1F8A62`（3.89:1，不够正文）改到 `#187A56`（4.79:1）。井底保持很浅，所以色块仍然轻。
