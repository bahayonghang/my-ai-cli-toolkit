# Review Code

面向正确性、安全性、性能、可读性、测试和架构六个维度的多维代码审查技能。skill 会根据用户语境自适应中英输出，在中文场景下会采用更适合国内团队协作的审查表达方式。

## 适用场景

- 合并前审查 git 改动
- 审计某个目录或文件集合
- 跨语言执行规则化 review
- 生成 PR 评论或 review summary，需要可执行的问题列表
- 中文或中英混合工程语境下的代码审查

## 工作流程

1. 选择目标，或默认审查当前 git changes
2. 读取 review dimensions、issue classification、workflow、communication 等参考
3. 检测目标语言并加载匹配的语言指南
4. 根据用户上下文决定最终以中文还是英文输出
5. 按 `workflow-guide.md` 执行分阶段 review
6. 以严重级别分类问题，并用模板组织输出

## 主要资源

- `references/review-dimensions.md`
- `references/issue-classification.md`
- `references/workflow-guide.md`
- `references/communication-guide.md`
- `references/languages/`
- `references/rules/`
- `assets/review-report-template.md`
- `assets/pr-comment-template.md`
- `assets/quick-checklist.md`

## 说明

- 如果范围过大，应先缩小目标再继续。
- 没有语言专用指南时，退回到通用 best practices。
- 中文模式下会优先使用 `必须修复`、`建议修改`、`仅供参考` 等更符合团队协作的标签。
- 输出会优先列出 findings，再给 summary；如果没有阻塞问题，也会说明已检查的范围和结论。
