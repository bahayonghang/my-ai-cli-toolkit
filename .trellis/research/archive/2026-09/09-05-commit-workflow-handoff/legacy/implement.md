# 实施计划

1. 阅读 PRD、设计、当前源文件及规范，核对授权范围。
2. 修订入口及关联引用，在现有 evals 补充上述正反行为场景；不添加只匹配文案的硬编码规则。
3. 运行现有最小检查：`node --test skills/git-github-collaboration/git-commit/tests/*.test.mjs`。
4. 审阅场景并记录实际证据。evals 不由 CI 执行，其存在不等于行为已验证；真实 provider/远程行为没有 transcript 时标 UNVERIFIED。
5. 运行 just skills-check；公开元数据变化时 just docs-sync 并核对生成差异；最终 just ci。
6. 参与父任务联合验收。提交、归档、远程操作不属于本轮实施授权。
