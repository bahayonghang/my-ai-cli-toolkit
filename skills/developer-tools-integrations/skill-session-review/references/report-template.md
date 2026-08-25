# Report template

Write UTF-8 LF Markdown to `reports/skill-session-review/<skill-name>.md`.

```markdown
---
skill: skill-session-review
target_name: <name>
target_path: <absolute posix or 未解析>
scope: global|cwd
generated_at: <ISO-8601>
---

# 使用情况反馈：<name>

## 覆盖说明
| 平台 | coverage | invoked | loaded | available |
| --- | --- | ---: | ---: | ---: |
| claude | ok\|missing-store | N | N | N |
| grok |  |  |  |  |
| codex |  |  |  |  |
| oh-my-pi |  |  |  |  |

检索域：global 或 cwd。Oh My Pi 来自 `~/.omp`，不使用 `~/.pi`。

## 调用清单
| Session | Platform | Status | Signal |
| --- | --- | --- | --- |
|  |  | invoked\|loaded\|available |  |

## 问题清单

### SSR-01 · <UPDATE SKILL|COMPLIANCE GAP|ONE-OFF|INCONCLUSIVE>
- Session: <id>
- Platform: <platform>
- Evidence: <file> <locator>
- Step deviation: …
- User correction: 无|…
- Gap: …
- Reusable suggestion: 无|…

## 建议改 SKILL.md 的条款
仅列出至少两个 invoked 会话支持的 `UPDATE SKILL` 项。不要附 `diff.patch`。

## 未能核实
…

## 可靠部分
…
```

Use English headings when the user request is English. Keep field names stable.
