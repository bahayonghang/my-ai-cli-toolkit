# Code Auditor

面向正确性、安全性、性能、可读性、测试和架构六个维度的结构化代码审计技能。它会根据用户语境自适应中文或英文输出，同时保持问题分级清晰、建议可执行、技术标识不被硬翻译。

## 适用场景

- 合并前审查 git 改动或 PR
- 审计某个目录、文件集合或当前工作区
- 输出可直接落地的 merge feedback 或 review summary
- 在多语言代码库里执行一致的规则化审查
- 需要中文或英文审查结果，但保留原始标识符、API 名称和代码片段

## 工作流程

1. 选择目标，或默认审查当前 git changes / working directory
2. 读取 review dimensions、issue classification、workflow、communication 和 rules 等参考
3. 检测目标仓库语言并加载匹配的语言指南
4. 根据用户上下文决定最终只使用一种面向人的输出语言
5. 按四阶段流程执行：Collect Context、Quick Scan、Deep Review、Generate Report
6. 先输出 findings，再补 summary 和后续建议

## 严重级别与输出方式

- 中文模式会把阻塞类问题映射为 `必须修复`，中优先级问题映射为 `建议修改`，低优先级或提示类内容映射为 `仅供参考`
- 英文模式对应使用 `Must Fix`、`Should Fix` 和 `Nice to Have`
- 每个 critical 或 high 级别问题都应包含位置、风险、影响和具体修复建议
- 即使没有阻塞问题，也要说明检查了哪些范围，而不是只给一个空泛的 `LGTM`

## 主要资源

- `references/review-dimensions.md`
- `references/issue-classification.md`
- `references/workflow-guide.md`
- `references/communication-guide.md`
- `references/languages/`
- `references/rules/`
- `assets/issue-template.md`
- `assets/review-report-template.md`
- `assets/pr-comment-template.md`
- `assets/quick-checklist.md`

## 说明

- 如果目标为空，会退回到当前 git changes 或 working directory。
- 如果范围过大，应先缩小审查目标再继续。
- 没有语言专用指南时，退回到通用 best practices 和共享审查规则。
- 同一次输出保持一种稳定的面向人语言，不在中文和英文语气之间来回切换。
