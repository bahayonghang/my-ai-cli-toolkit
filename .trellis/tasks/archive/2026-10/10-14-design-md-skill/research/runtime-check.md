# 运行时核对（2026-10-14）

## 步骤

1. `design_catalog.py apply brand:claude --root <scratchpad>/design-md-runtime` 写入 DESIGN.md，来源注释位于 frontmatter 之后。
2. 按 `references/implementation.md` 手写最小页面 `index.html`：CSS 变量 token 层（与 frontmatter 一一对应）、导航、hero、主/次/禁用按钮、深色代码卡片、3 列特性卡片、页脚。品牌名使用占位名 "Northwind Notes"，未使用 Anthropic/Claude 标识或专有字体文件（衬线用 Cormorant Garamond → Georgia 回退）。
3. 本地 `python -m http.server`（127.0.0.1:8791）提供页面，用内置浏览器检查。8765 端口已被另一个本地服务占用（页面标题"面试学习笔记"），改用 8791。

## 结果

| 检查                        | 结果                                                                                                                                                                                                         |
| --------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 桌面（视口 1280px）计算样式 | body `rgb(250,249,245)`=canvas；主按钮 `rgb(204,120,92)`=primary；禁用 `rgb(230,223,216)`=primary-disabled；h1 64px 衬线栈；卡片 `rgb(239,233,222)`=surface-card，内边距 32px；hero 上内边距 96px；网格 3 列 |
| 移动（视口 320px）          | h1 32px；hero 与特性网格单列；`scrollWidth` 305 ≤ 320，无横向滚动                                                                                                                                            |
| 键盘焦点                    | Tab 后焦点在 "Create a notebook" 按钮，`:focus-visible` 为真，描边 2px solid primary，对画布 3.11:1（≥3:1）                                                                                                  |
| 对比度                      | body 文字/画布 10.34；ink/卡片 15.26；代码/深色 6.16；页脚 6.62；**白字/primary 3.28（低于 14px 文本的 4.5:1，不通过）**；禁用按钮 4.1（WCAG 对禁用控件无要求）                                              |
| 截图                        | 内置浏览器窗格宽约 456px，截图多次渲染超时，只取得窄视口局部截图；桌面布局以计算样式为证据                                                                                                                   |

## 结论与处理

- token 层、响应式、焦点样式按 DESIGN.md 生效。
- 上游条目 `brand:claude` 自身的按钮配色不满足 WCAG AA。已在 `references/implementation.md` §2 第 5 条加入规则：构建组件前检查条目 token 组合的对比度，不通过时修改 DESIGN.md token、记入 Known Gaps，再更新 token 层。
- 桌面全宽截图：`missing evidence`（窗格渲染超时）。
