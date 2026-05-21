## Code Review Summary

Use the structure below, but localize headings and severity labels to the user's language.

- In Chinese mode, prefer `[必须修复] / [建议修改] / [仅供参考] / [问题]`.
- In English mode, prefer `Must Fix / Should Fix / Nice to Have / Question`.
- Keep findings before summary. Do not open with generic praise when blocking issues exist.

### Chinese PR Comment Template

```markdown
## 审查结论

整体看下来，主要风险集中在 {{review_focus}}。

### 主要问题

1. [必须修复] `path/to/file.ts:42`
   原因：说明具体风险或行为错误。
   建议：给出可执行的修复方向。

2. [建议修改] `path/to/file.ts:88`
   原因：说明维护性、性能或测试缺口。
   建议：给出改进方向。

### 已检查项

- 正确性：……
- 安全性：……
- 测试覆盖：……

### 补充建议

- [仅供参考] ……
```

### English PR Comment Template

```markdown
## Review Verdict

The main risks in this change are {{review_focus}}.

### Findings

1. Must Fix - `path/to/file.ts:42`
   Why: explain the concrete failure mode or risk.
   Recommendation: give an actionable fix.

2. Should Fix - `path/to/file.ts:88`
   Why: explain the maintainability, performance, or testing gap.
   Recommendation: give the next best change.

### What I Checked

- Correctness: ...
- Security: ...
- Test coverage: ...

### Optional Suggestions

- Nice to Have: ...
```

### Changes Overview

| Metric | Value |
|--------|-------|
| Files changed | {{files_changed}} |
| Lines added | +{{additions}} |
| Lines deleted | -{{deletions}} |
| Net change | {{net_change}} |

### Review Focus

{{review_focus}}

### Checklist

#### Basic Checks
- [ ] Code follows project coding standards
- [ ] Naming is clear and descriptive
- [ ] No obvious logic errors
- [ ] Error handling is complete

#### Quality Checks
- [ ] Code readability is good (comments, documentation)
- [ ] No redundant code or duplicate logic
- [ ] Boundary conditions are handled
- [ ] No obvious performance issues

#### Security & Testing
- [ ] No obvious security vulnerabilities
- [ ] No hardcoded sensitive information
- [ ] Test coverage is sufficient (if applicable)

### Detailed Feedback

{{detailed_feedback}}

### Suggestions

{{suggestions}}

---

*This review was generated with automated tool assistance. Please combine with human judgment.*
