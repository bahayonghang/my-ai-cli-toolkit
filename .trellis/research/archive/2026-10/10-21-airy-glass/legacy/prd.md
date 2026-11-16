# 把轻盈毛玻璃加入 design-md

## Goal

让 `design-md` 能按名称选出并 `apply` 一套独立的「轻盈毛玻璃」风格。使用者得到一份可实施的 `DESIGN.md`：白纸叠在低饱和冷色字段上，输入/完成是绿，输出是紫，圆角与胶囊统一，文字在最差背景下仍满足 WCAG 2.2 AA。

## Background

- 用户给出了材质、背景、色彩、形状、层级、质感六条，并附了一张浅色记录卡界面作为气质参考。参考只提供气质，不提供可复制的产品内容。
- 目录已有 `style:glassmorphism`（`skills/development-workflows/design-md/assets/catalog/styles/glassmorphism.md`）。它是高对比蓝色的上游薄条目，没有这套材料规则。
- 用户要求新增，不是替换。
- `scripts/build_catalog.py` 会按上游检出重写 `brands/`、`styles/` 和 `index.json`，并删除上游没有的 `styles/*.md`。只手改 `styles/` 的条目，下次重建会消失。
- `scripts/design_catalog.py` 的 `provenance()` 用 `index["sources"][entry["source"]]` 写来源注释。新条目不能冒充两个 MIT 上游之一。
- 仓库根 `LICENSE` 是 MIT，Copyright (c) 2026 李永航。
- 风格条目约定不定义组件库。组件状态仍由 `references/design-system-core.md` 从 token 推导。
- 这不是新的 qiaomu 技能包。qiaomu-meta-skill 只作为本次请求的作者路由。

## Requirements

1. 新增目录条目 `style:airy-glass`，显示名「轻盈毛玻璃」，归入 `style-tactile-depth`。`search` 能用「轻盈毛玻璃」和 `airy-glass` 找到它。`show` 与 `apply` 能读到它。
2. 条目是 stitch 风格文件：机器可读 token，加上材料、色彩、字体、圆角、层级、无障碍和 Do/Don't。不写组件库，不写参考产品的名称或插画。
3. 材料规则固定为：字段是薄荷绿到浅薰衣草的低饱和渐变，可有少量模糊光斑；文字面板是白填充约 0.78、模糊 20px、饱和 1.15、1px 白色 0.80 描边、一层淡的大阴影、外圆角 20px。色井是实色，不再模糊。窄屏、减少透明度、以及没有 `backdrop-filter` 时改为不透明纸。
4. 强调色只有两个，并且有语义：`#187A56` 表示输入或完成，`#6D4BD6` 表示输出。它们同时用作极浅的井底色。正文 `#24303A`，次要文字 `#5C6B76`。
5. 按钮和标签是胶囊。图标是细线。重点靠大号数字和标题，次要信息是小号灰字。数字使用等宽数字。
6. 重建目录时这条条目还在，并且不会被标成 VoltAgent 或 Bergside 的上游文件。
7. 公开计数从 151 / 67 改为 152 / 68。根 `SKILL.md` 的 description 加入可被搜到的「轻盈毛玻璃」，并保持在校验器的 1024 字限制内。

## Acceptance Criteria

- [ ] `python skills/development-workflows/design-md/scripts/design_catalog.py search 轻盈毛玻璃` 输出含 `style:airy-glass`。
- [ ] `show style:airy-glass` 成功，正文含模糊 20px、两个语义色、减少透明度时的不透明回退，以及 `## Accessibility` 与 `### Do`。
- [ ] `apply style:airy-glass` 写入的来源注释标明 first-party，不引用 awesome-design-md 或 awesome-design-skills 的 commit。
- [ ] `tests/test_design_catalog.py` 与 `tests/test_build_catalog.py` 通过。构建测试证明：临时目录里的 first-party 条目在重建后仍在，且不属于 first-party 的多余 `styles/*.md` 仍会被删除。
- [ ] 用同一对比度算法复算，正文与两个强调色在其指定背景上不低于 4.5:1。白描边不被写成控件边界。
- [ ] `just skills-check` 通过。description 改动后已运行 `just docs-sync`，生成的 docs 与 description 一致。

## Out of Scope

- 修改或合并 `style:glassmorphism`。
- 做示例页面、运行中的界面，或按参考截图复刻布局。
- 暗色主题、图表色板、品牌条目。
- 新的 qiaomu 技能包、发布、提交。提交留在 Trellis Phase 3.4。
