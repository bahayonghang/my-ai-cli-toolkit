# Mermaid Expert

这个技能用于生成可直接放进文档、README 或架构说明里的 Mermaid 图表代码。

## 适用场景

- 用户明确提到 Mermaid
- 用户要在 Markdown 或文档里嵌入图表
- 用户需要帮忙判断该用哪种 Mermaid 图类型
- 用户已经有 Mermaid 代码，但需要修复语法或渲染问题

## 核心流程

1. 先判断请求最适合的图类型。
2. 需要精确语法时，回读 `SKILL.md` 和 `references/mermaid_syntax_guide.md`。
3. 默认直接返回可用的 fenced `mermaid` 代码块。
4. 重点解决当前图表问题，不展开成长篇 Mermaid 教程。
5. 如果渲染失败，优先做最小修改，把图恢复成合法语法。

## 输出约定

- 默认输出是合法 Mermaid 语法，放在 fenced `mermaid` 代码块里
- 流程图默认用 `TD` / `TB`，除非 `LR` 更清晰
- 只有在用户明确需要时，才展开 HTML 集成或工具链细节

## 主要支撑资源

- `content/skills/diagram-skills/mermaid-expert/SKILL.md`
- `content/skills/diagram-skills/mermaid-expert/references/mermaid_syntax_guide.md`

## 关键约束

- 用户要 Mermaid 语法时，不能只给伪代码
- 用户要的是一个能工作的图时，不要堆一大段语法百科
- 优先做定点修复，不要无必要地整图重写

## 说明

- 这个页面只说明 skill 的能力边界，不替代完整 Mermaid 参考手册。
- 更完整的语法细节以 skill 自带 reference 为准。
