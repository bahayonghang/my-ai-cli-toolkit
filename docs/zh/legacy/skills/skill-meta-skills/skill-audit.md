# Skill Audit

::: warning 历史文档
此页仅用于历史参考与兼容旧链接；对应的 skill 已不再由本仓库的 `content/skills/` 一方目录提供。
:::

用于 skill 合规性、重叠度与 token 效率分析的审计技能。

## 适用场景

- 发布前审查某个 skill 目录
- 找出 frontmatter 或结构问题
- 检查与同级 skill 的重叠
- 在保留意图的前提下压缩 `SKILL.md`

## 工作流程

1. 指向包含 `SKILL.md` 的目标目录
2. 运行 `scripts/analyze_skill.py`
3. 对照 checklist 与 patterns 参考资料
4. 如有需要，再对同级 skill 执行 overlap 检测
5. 以 Critical、Recommended、Optional 三档输出

## 主要资源

- `scripts/analyze_skill.py`
- `scripts/detect_overlap.py`
- `references/CHECKLIST.md`
- `references/PATTERNS.md`

## 输出要求

除了问题报告外，还应给出一份优化后的 `SKILL.md` 建议稿。
