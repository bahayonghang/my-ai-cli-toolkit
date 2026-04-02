# 卡片铸造 (Card)

将内容铸造成 PNG 视觉产物的技能，支持五种不同的视觉模具。

## 适用场景

- 用户希望把内容做成卡片、海报、信息图、视觉笔记或漫画
- 用户使用“铸”“cast”“做成图”“做成卡片”等触发词
- 目标产物是 PNG 视觉文件，而不是纯文本内容

## 工作流程

1. 从 URL、粘贴文本或本地文件收集源内容
2. 根据目标样式选择合适的模具
3. 读取 `references/taste.md` 和对应模具说明
4. 使用对应 HTML 模板渲染并截图输出 PNG
5. 返回生成文件路径

## 模具

- `-l` 长图阅读卡
- `-i` 信息图
- `-m` 多张阅读卡
- `-v` 视觉笔记
- `-c` 黑白漫画

## 主要资源

- `references/taste.md`：统一视觉质量基线
- `references/editorial-typography.md`：`-l/-m/-i` 的本地 editorial 字体协议
- 各模具说明文件，例如 `references/mode-long.md`
- `assets/` 下的 HTML 模板
- 基于 Playwright 的截图脚本

## 说明

- 输出为 PNG，因此不遵循 Org-mode 或 ASCII-only 约束。
- 对 arXiv 来源内容，部分模具会在页脚展示 arXiv ID。
- `-l`、`-m`、`-i` 现在使用 Skill 自带的本地仓耳今楷，保证 `file://` 截图时字体稳定。
- `-v` 视觉笔记与 `-c` 漫画仍保留各自专用字体系统。
- 渲染完成后会汇报生成文件路径。
