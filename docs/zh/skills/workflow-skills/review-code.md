# Review Code

面向正确性、安全、性能、可读性、测试和架构六个维度的多维代码审查技能。

## 适用场景

- 合并前审查 git 改动
- 审计某个目录或文件集合
- 跨语言执行规则化 review

## 工作流程

1. 选择目标，或默认审查当前 git changes
2. 读取 review dimensions 与 issue classification 参考
3. 检测目标语言并加载匹配的语言指南
4. 按 `workflow-guide.md` 执行分阶段 review
5. 以严重级别分类问题，并用模板组织输出

## 主要资源

- `references/review-dimensions.md`
- `references/issue-classification.md`
- `references/workflow-guide.md`
- `references/languages/`
- `references/rules/`
- `assets/review-report-template.md`

## 说明

- 如果范围过大，应先缩小目标再继续。
- 没有语言专用指南时，退回到通用 best practices。
