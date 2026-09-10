# Journal - lyh (Part 2)

> Continuation from `journal-1.md` (archived at ~2000 lines)
> Started: 2026-09-08

---



## Session 65: herdr-orchestra 0.2.0 运行时路由

**Date**: 2026-09-08
**Task**: herdr-orchestra 0.2.0 运行时路由
**Branch**: `dev`

### Summary

Compact Workflow 在 agent start 前选择 pane 或 agent surface；未登记 identity 严格 incomplete。wait 标记不得出现在命令文本。约定写入 skill-authoring。

### Main Changes

- herdr-orchestra 0.2.0：surface 选择、未登记 identity、H13-H15
- skill-authoring-conventions：compact 路径与 wait 标记

### Git Commits

| Hash | Message |
|------|---------|
| `420aabbda1e2c2f7e0ddb4a5cafa4d20f582ce59` | (see git log) |
| `f66f7631dfa5ae8d5f2db3021cbee4c8a28e203e` | (see git log) |

### Testing

- [OK] just ci

### Status

[OK] **Completed**

### Next Steps

- live Herdr 检测仍为 missing evidence，未推送


## Session 66: Codex 上下文技能升级与弃用技能清理收尾

**Date**: 2026-09-10
**Task**: Codex 上下文技能升级与弃用技能清理收尾
**Branch**: `dev`

### Summary

完成 codex-context-improver 2.0.0 升级、更名与弃用技能残留清理，纳入全部既有删除及 skills-lock.json。完整 just ci 通过：Node 412 通过、4 跳过、0 失败；暂存后修正报告末尾空行并通过 whitespace 检查。任务已归档至 archive/2026-09/09-10-codex-context-improver，归档上下文各 5 项验证通过。qiaomu README schema 差异及宿主/provider 缺证据保留。未推送。

### Git Commits

| Hash | Message |
|------|---------|
| `e9916058` | (see git log) |
| `2e38428e` | (see git log) |

### Status

[OK] **Completed**
