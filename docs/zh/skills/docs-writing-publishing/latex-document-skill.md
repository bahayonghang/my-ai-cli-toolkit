# LaTeX Document Skill

通用的 LaTeX / PDF 文档工作流技能，覆盖撰写、编译、转换、diff 和结构化提取。

## 适用场景

- 创建或编辑 `.tex`
- 编译 LaTeX 到 PDF
- 文档格式转换
- 从 PDF 中提取结构化内容
- 生成 poster、cheat sheet、Beamer 文稿

## 工作流程

1. 判断任务类型：create、compile、convert、extract、poster、cheat sheet、diff
2. 只读取必要的 `references/` 文件
3. 优先复用 `assets/templates/`
4. 调用 `scripts/` 中匹配的脚本
5. 在返回源码和 PDF 之前先做校验

## 主要支撑区域

- `references/`：格式转换、PDF 工作流、poster、bibliography、diagram、accessibility 等
- `assets/templates/`：可复用模板
- `scripts/`：编译、lint、diff、分析、PDF 处理

## 说明

- 大型 PDF-to-LaTeX 任务会根据页数分批处理。
- 优先使用技能自带模板和脚本，而不是临时拼命令。
