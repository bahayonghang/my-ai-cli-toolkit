# Academic Slides

统一处理学术幻灯片的生成、编辑、编译与审查，兼容 **Typst Touying** 和 **LaTeX Beamer** 两条主路线，适合快速迭代也适合正式投稿或答辩场景。

## 概述

Academic Slides 帮助你生成、编辑、编译和审查学术演示幻灯片。提供从主题/大纲到精美 PDF 输出的完整工作流，同时支持 Typst 和 LaTeX 生态系统。

## 工作流

| 工作流 | 触发词 | 操作 |
|--------|--------|------|
| create | "创建幻灯片" | 从主题/大纲生成 |
| from-paper | "论文转幻灯片" | 从论文提取 |
| edit | "编辑幻灯片" | 修改页面 |
| theme | "切换主题" | 切换主题/字体 |
| compile | "编译" | 构建 PDF |
| review | "审查" | 质量检查 |

## 脚本

运行 `python scripts/<name>.py`：

- `detect_file.py` — 查找 .typ/.tex 文件
- `compile.py <file>` — 编译为 PDF
- `validate_template.py <file>` — 检查占位符
- `analyze_structure.py <file>` — 解析结构
- `review_metrics.py <file>` — 质量评分

## 资源文件

- `WORKFLOWS.md` — 工作流步骤
- `THEME_REFERENCE.md` — 主题配置
- `REVIEW_CRITERIA.md` — 审查标准
- `TYPST_SYNTAX.md` — Typst 语法参考
- `LATEX_SYNTAX.md` — LaTeX 语法参考
- `ERROR_PATTERNS.md` — 常见错误修复

## 默认配置

| 设置 | 默认值 |
|------|--------|
| 引擎 | Typst |
| 主题 | university |
| 语言 | zh |
| 宽高比 | 16:9 |
| 输出目录 | `output/` |
