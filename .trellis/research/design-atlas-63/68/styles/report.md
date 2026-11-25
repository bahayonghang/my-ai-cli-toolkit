# #68 · 同一幅双版画的两种风格

两页都能用指针或键盘隔离墨版，保留原画、数据和图注。独立复核到第三轮时，北欧页为 **ship**，Neobrutalism 页为 **fix**。后者剩一条文案意见。审查者认为 “Dark paper” 容易让人以为画纸也会变暗，建议改为 “Dark background”。按钮实际切换画框外围的界面，画纸保持奶油色。“Dark paper” 是 #67 原页和此次两组共用请求指定的控件名，已保留。两个样例均已达到现有流程的三轮上限。[#67 原页](../../../../../skills/development-workflows/design-atlas/assets/reference/scandinavian/index.html) · [共用请求](request.txt) · [六份独立复核原文](reviews.md)

## 输入和运行条件

每个临时项目开始时都没有 HTML 或 DESIGN.md。输入是相同的 Tide register 标题、原文、三条印刷记录、两个本地透明色版和相同的初始状态。两次请求只替换 `style:STYLEID` 里的 ID。北欧构建者自行读取了候选 skill 随附的 #67 北欧参考页。表现型构建者依据已有 Bergside MIT 条目构图。两页直接使用仓库中的原始 PNG。[Kelp](../../../../../skills/development-workflows/design-atlas/assets/reference/scandinavian/kelp.png) · [Oxide](../../../../../skills/development-workflows/design-atlas/assets/reference/scandinavian/oxide.png)

两次构建分别通过 Codex CLI 0.172.0 的独立临时会话运行，模型为 `gpt-6.2-astra`，推理强度 `medium`。两者首个工具调用均读取提交 `ed99d785da44b9fd3af67fa33439497f91bfe63e` 导出的同一绝对路径 SKILL.md，并用该目录的 CLI 执行 `apply`。旧版 `493a1a3aaf7e6da98dc9cc34629b5a13affb5c86` 的 `show style:scandinavian` 退出 1 并报告 unknown entry，此风格组只适用于候选版。构建原始回复、首次读取、应用命令、源路径、会话标识、扫描结果和复核输入摘要均有记录。[运行记录](runs.json)

## 实际画面

在 Windows 的 headless Edge 158.0.4370.33 中打开各自的 `index.html`，DPR 1、浅色、Both plates，初始 `scrollY=0`。桌面视口 1440 × 900，窄屏 390 × 844。以下尺寸为实际 CSS 像素。

| 观察 | 北欧 | Neobrutalism |
| --- | --- | --- |
| 成品与规范 | [可运行页面](scandinavian/index.html) · [第一方 DESIGN.md](scandinavian/DESIGN.md) | [可运行页面](neobrutalism/index.html) · [Bergside 来源及定制 DESIGN.md](neobrutalism/DESIGN.md) |
| 桌面与全页 | [首屏与全页相同，1440 × 900](scandinavian/desktop.webp) | [首屏](neobrutalism/desktop.webp) · [全页，1440 × 908](neobrutalism/full.webp) |
| 字级与分组 | 标题桌面 72、窄屏 40，字重 500，实际用 Segoe UI Semibold。16 的导语、14 的图注、细线和对齐的数值构成一份紧凑的记录。 | 标题 103.68 / 60.8、字重 900，实际用 Arial Black。导语 21 / 17，印刷记录 15。黄色刊头、紫色画框和硬边阴影与出版海报式标题呼应。 |
| 媒体与路径 | 桌面左侧画面 629 × 466，右侧标题、工具和记录。窄屏先看标题，再看画，最后选版。墨版标识用圆和菱形并排标名。[窄屏首屏](scandinavian/mobile.webp) | 桌面右侧画面 731 × 541，左侧先给标题与工具。窄屏的选版控件在画前，画从 y=416 开始；印刷记录从 y=764 开始，最后两行需滚动。[窄屏首屏](neobrutalism/mobile.webp) · [底部 y=119](neobrutalism/mobile-oxide-end.webp) |
| 同状态对照 | [窄屏 Oxide，y=8](scandinavian/mobile-oxide-y8.webp) · [桌面深色 Oxide，y=0](scandinavian/desktop-dark-oxide.webp) · [键盘焦点原尺寸](scandinavian/mobile-focus.png) | [窄屏 Oxide，y=8](neobrutalism/mobile-oxide-y8.webp) · [桌面深色 Oxide，y=0](neobrutalism/desktop-dark-oxide.webp) · [键盘焦点原尺寸](neobrutalism/mobile-focus.png) |

## 记录、交互与复核改动

- 每个视口均从 Both plates 起步，再点击 Kelp 和 Oxide，核对原生 radio 单选、实时图注及实际像素。画内原始绿墨为 RGB(31, 65, 58)，橙墨为 RGB(182, 82, 51)。单选后，隐藏墨版对应的像素计数降为零。左右方向键切换选项成功，所有单选标签高度 44。两页最终均使用 #67 的 `#F3E8CC` 画纸。切换深色前后，同一视口下 Oxide 画面内部 RGB 摘要一致。所有选择都能读到原始的 Kelp、Oxide、Register 三行及原数值。[北欧实测](scandinavian/measurements.json) · [表现型实测](neobrutalism/measurements.json)
- 两种明暗外观、三种选版状态下，检查标题、说明、图注、按钮、单选标签及印刷记录在实际背景上的文本对比。观察到的最低值分别为 6.64:1 和 9.39:1。两页横向溢出均为零。窄屏请求滚动 160 时实际分别停在 y=10 和 y=119，上表另有实际 y=8 的同位置对照。[北欧对比度](scandinavian/contrast.json) · [表现型对比度](neobrutalism/contrast.json)
- 北欧页首轮导语为三行。复核后拓宽为两行，使桌面控件上移 25 像素，并对齐标题缩放和图注行高。第二轮给 Dark paper 增加可见的选中勾与深色悬停反馈。强制颜色下仍能区分开关。复核建议把 Register 改为 Plate size；保留了原样例的字段名，并将它列入项目契约。[第一轮](scandinavian/round1-desktop.webp) · [修后桌面](scandinavian/desktop.webp) · [强制颜色开启](scandinavian/forced-toggle-on.png) · [关闭](scandinavian/forced-toggle-off.png)
- 表现型页首轮的深色画框边线与背景同色。修后外框和阴影在深色画布上使用浅色，印刷记录从 17 调回规范的 15。初版选择了另一种奶油色，复核修订时也把画纸恢复为 #67 的原色。第三轮仅余上述按钮文案意见。[第一轮深色](neobrutalism/round1-dark-oxide.webp) · [修后深色](neobrutalism/desktop-dark-oxide.webp) · [从初次构建到交付页的补丁](review-changes.patch)
- 首轮复核的独立输入包漏了 HTML 指向的共享 PNG，两份审查均提出缺图风险。第二、三轮从可运行的目录直接提供合同、HTML、两张源 PNG 和三幅截图，未提供构建者笔记或机械扫描结果。最终两组均从本仓库路径复跑。两页静态扫描均无 Floor/House 失败或开放 Reflex。表现型的等宽图注命中既有字体声明所允许的 Gate 64。实测范围涵盖本机 Edge、鼠标与键盘、浅深外观，以及强制颜色下的开关，未做真实屏幕阅读器或跨浏览器验收。[复核原文](reviews.md) · [扫描与运行记录](runs.json)

## 复跑

在仓库根目录使用装有 Playwright、Pillow 和 Microsoft Edge 的 Python 运行。第二个参数是审核项目之外的临时输出目录。把下例的 scandinavian 改为 neobrutalism 可复跑另一页。脚本输出首屏、全页、状态截图和测量 JSON。[采集脚本](capture.py)

```powershell
$styles = '.trellis/research/design-atlas-63/68/styles'
python "$styles/capture.py" "$styles/scandinavian/index.html" "$env:TEMP/atlas68-replay/scandinavian"
```
