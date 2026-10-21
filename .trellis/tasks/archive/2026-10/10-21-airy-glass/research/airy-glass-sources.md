# 轻盈毛玻璃：材料与无障碍调研

日期：2026-10-21。本地对比度用相对亮度公式现算，不是外部工具的截图读数。

## 要解决的问题

用户要的是一种新的通用风格，不是改写已有的 `style:glassmorphism`。

已有条目（`assets/catalog/styles/glassmorphism.md`）是上游薄条目：主色 `#1856FF`，字体 Plus Jakarta Sans 与 JetBrains Mono，圆角 4px / 8px，自我描述为 high-contrast、bold、enterprise、liquidglass。它没有模糊半径、填充透明度、描边、阴影、语义色或降级规则。

参考界面是浅色工作台：薄荷绿到浅薰衣草的低饱和渐变，白色半透明面板，完成/输入用绿，输出用紫，大号数字，胶囊标签，线性图标。不能把该产品的名称、插画或信息架构写进目录。

## 外部材料

1. Chrome，Adam Argyle，2023-10-25，`prefers-reduced-transparency`。毛玻璃在 `reduce` 下应收起透明度，保留同一色相、提高不透明度。https://developer.chrome.com/blog/css-prefers-reduced-transparency
2. Apple Human Interface Guidelines，Materials，页面标注 2025-06-09。Liquid Glass 分 regular 与 clear。clear 只适合浮在影像上的控件；文字多的表面用 regular。系统会响应 Reduce Transparency 与 Increase Contrast。玻璃没有固有颜色。https://developer.apple.com/design/human-interface-guidelines/materials
3. Superdesign，Glassmorphism guide，2026-06-13。生产模糊常见落在约 4–25px，Apple 导航约 20px。玻璃需要有变化的背景，否则模糊没有内容。`backdrop-filter` 会变成包含块，困住 `position: fixed`。不要把玻璃铺到数据表格上。文中引用 Nielsen Norman Group 对 iOS 26 Liquid Glass 的可用性批评 “Liquid Glass Is Cracked”。https://superdesign.dev/styles/glassmorphism
4. Boring Reliability，Glassmorphism with Optimal Performance。`backdrop-filter: blur()` 贵；建议模糊不超过约 16–20px；限制玻璃元素数量；不要动画化模糊；大面积全屏玻璃不适合。https://www.boringreliability.dev/css-magic/glassmorphism
5. Axonix，2026-05-22。可读的模糊大约 8–15px；一屏一两个玻璃元素；整页卡片都模糊时，中端手机会掉帧。https://axonixtools.com/blog/glassmorphism-in-2026-css-guide/
6. UX Magic，2026-08-14。展示型玻璃常用填充 12%–25%、模糊 12–20px、白色高光描边。这个范围是“看得透”的水晶，不适合本风格的白面板。https://uxmagic.ai/blog/what-is-glassmorphism
7. 本仓库 `/ui` 的 `design-reference.md`。禁止把 `backdrop-filter` 玻璃当成默认卡片，禁止实色 1px 边框配模糊（实色边会切断层次），禁止紫到蓝的霓虹渐变，禁止渐变文字。OKLCH：高明度时彩度要低。中英混排时拉丁字体在前、中文字体在后，中文正文行高约 1.7–1.8，中文不要负字距。数字用 `tabular-nums`。每个可按控件在按下时有位移，高频键盘操作不做动画。

## 从材料里收下的决定

- 填充不跟展示型玻璃的 12%–25%。文字面板用白色约 0.78，让渐变只从边缘透出来。再低，低饱和背景上对比度会随背后内容漂移。WCAG 2.2 AA 要按最差背景算，不能按平均背景算。
- 模糊默认 20px，落在用户给的 16–24px 中间，也贴近 Apple 导航的 20px。不使用 Apple 常见的 `saturate(180%)`。本风格饱和加成 1.15，避免液态玻璃的透镜感。
- 白色描边用约 0.80 透明度，是受光边，不是实色围栏。它不能充当控件边界：白边对薄荷绿底的对比度只有 1.11:1，低于 WCAG 1.4.11 的 3:1。控件边界靠填充色和焦点环。
- 模糊只放在一张“纸”上，不嵌套。色块、输入井、输出井用实色浅底，不再 `backdrop-filter`。
- 桌面同一视口最多 6 张模糊纸，对应一屏两行记录卡。窄屏（小于 960px）、`prefers-reduced-transparency: reduce`、以及不支持 `backdrop-filter` 时，纸改为白色 0.96、模糊为 none。
- 阴影只有一层，大而淡：`0 20px 48px rgba(70, 90, 120, 0.08)`。不做霓虹外发光，不做多层厚阴影。
- 这不是 Liquid Glass 移植：没有折射动画，没有 clear 变体，没有系统级透镜，玻璃不进入正文阅读层。

## 本地对比度（2026-10-21）

相对亮度，WCAG 公式。玻璃按白 0.78 叠在字段色上混合后再测文字。

| 前景 | 背景 | 比值 | 用途 |
| --- | --- | --- | --- |
| `#24303A` | `#FFFFFF` | 13.47 | 正文，不透明回退 |
| `#24303A` | 白 0.78 叠 `#E7F6F1` | 13.16 | 正文，最亮薄荷字段 |
| `#5C6B76` | 白 0.78 叠 `#E7F6F1` | 5.37 | 次要文字，过 4.5 |
| `#187A56` | `#E7F7F0` | 4.79 | 输入/完成，正文与大号数字 |
| `#187A56` | `#FFFFFF` | 5.31 | 链接与焦点环 |
| `#6D4BD6` | `#F3EEFC` | 5.08 | 输出，正文与大号数字 |
| `#6D4BD6` | `#FFFFFF` | 5.79 | 输出色落在白纸上 |
| `#FFFFFF` | `#E7F6F1` | 1.11 | 白描边，不能当控件边界 |

更亮的绿 `#1F8A62` 在 `#E7F7F0` 上只有 3.89，不够正文 4.5。所以输入色用 `#187A56`，浅底仍保持轻，数字不再用荧光绿。

## 明确不采纳

- 低填充水晶卡（5%–25% 白）加文字阴影。文字阴影不能代替对比度。
- 把 `style:glassmorphism` 的蓝主色、Plus Jakarta Sans、4px 圆角合并进来。那是另一条风格。
- 暗色玻璃配方 `rgba(15,15,30,0.75)`。本风格是浅色。
- 把参考截图里的产品名、鹈鹕插画、侧栏信息架构写成条目内容。
