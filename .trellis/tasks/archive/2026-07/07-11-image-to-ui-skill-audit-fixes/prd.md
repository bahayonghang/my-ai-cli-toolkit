# image-to-ui-skill 审计修复集成任务

## Goal

作为父任务统筹 `image-to-ui-skill` 的三项独立审计修复：wrapper 正确性、路由/评测契约、跨平台 validator 迁移。父任务维护共同边界、显式依赖与最终集成验收，不直接混合实现各子任务代码；全部子任务完成后统一同步生成文档并验证发布面一致性。

## Operating Mode And Evidence

- yao-meta 模式：**Production**。该 skill 是仓库内公开、团队复用、可安装的能力，但本任务不是 Governed/release-critical 发布。
- 输出风险：错误路由、虚假声称已完成真实生图、wrapper 命令参数损坏、validator 假绿、跨平台声明无证据。
- 本机安装的 `yao-meta-skill` 缺少整个 `references/` 与 `scripts/` 目录，无法执行其声明的 trigger_eval、Review Studio 和完整 Skill OS 自动化。这些必须在 gate report 中标为 `missing evidence`，不得表述为通过。
- 仓库内可执行门禁（eval schema、Node/Python tests、skills-check、docs-check、三平台 CI）作为本任务的主要证据。

## Child Task Map

| Child | Ownership | Dependencies |
| --- | --- | --- |
| `07-11-image2-wrapper-correctness` | wrapper argv、dry-run、fallback readiness、运行路径与回归测试 | 无，可独立执行 |
| `07-11-image-to-ui-routing-contract` | description、references 索引、interface、evals、gate evidence | 无，可独立执行 |
| `07-11-image-to-ui-validator-migration` | root/demo validator、Node 20 CDP pipe、parity、三平台 browser CI | 依赖 routing child 的最终 references 索引 |

父任务最终集成依赖三个 child 全部通过各自验收。树结构不隐含依赖；上述依赖也必须保留在对应 child artifact 中。

## Shared Requirements

- R1 保持仓库 plain Node ≥20 基线，不通过 skip 绕过 Node 20 或浏览器缺失。
- R2 保持零 npm 依赖；不得新增 Playwright、Puppeteer、ws 等包。
- R3 不修改 demo HTML/CSS/JS 行为与视觉，不压缩、转码、替换或删除任何已跟踪资产/截图。
- R4 不新增生图通道，不改变 native image2 优先级、fallback 凭据与模型规则。
- R5 公开 skill 元数据/结构变化完成后只由父任务执行一次 `just docs-sync`，检查生成 diff 仅与本 skill 相关。
- R6 最终 package 必须同时包含精简且可路由的 SKILL.md、对齐的 `agents/interface.yaml`、持久 `evals/evals.json`、风险匹配测试和 boundary/exclusion/gate summary。
- R7 不预先规定“每个步骤一个 commit”。所有实现和验证完成后按 Trellis Phase 3.4 一次展示原子 commit plan，经用户确认后提交。

## Parent Acceptance Criteria

- [x] 三个 child 均完成自己的局部 acceptance criteria，依赖顺序得到遵守，并有可核验完成状态；child 不依赖父任务的 docs/CI 门禁。
- [x] wrapper 的模板、dry-run、fallback 与 `<skill-dir>` 契约有自动测试且全绿。
- [x] description ≤200 字符、interface 对齐、包内 `evals/evals.json` 包含正/负路由与 output assertions。
- [x] validator 在 Node 20 下运行；默认 browser test skip，显式 opt-in fail-closed。GitHub ubuntu/windows/macos 真实执行证据仍缺失，由用户于 2026-07-13 明确豁免，不再阻塞本任务归档。
- [x] parity matrix 全绿后 skill 内 `.ps1` 与 `validate.ps1` 引用均为零。
- [x] `just docs-sync` 后生成文档只反映本 skill 的预期变化，随后 `just docs-check` 通过。
- [x] `just skills-check`、`just python-check`、`just node-test`、显式 browser opt-in、`just ci` 与 `git diff --check` 全部通过。
- [x] `assets/` 与已跟踪 `demo/*/screenshots/` 在 staged/unstaged diff 中均为空。
- [x] gate report 对无法执行的 yao-meta 外部门禁使用 `missing evidence`，没有伪造 telemetry、approval、benchmark 或 Review Studio 结果。
- [x] 最终 work commit plan 仅包含已识别的本任务文件；归档前工作树干净，无无关 dirty file。
- [x] 三平台真实 browser CI 保持标记为 `missing evidence`，未以本地 Windows 结果替代跨平台实测；用户于 2026-07-13 明确接受该缺口并授权豁免归档。

## Non-Goals

- 不回流 vendored upstream。
- 不提升为 Governed package，不创建 trust report 或 release package。
- 不修改其他 skill、平台模板或无关生成文档。
- 不把父任务当作三个 child 的并行实现容器。

## Local Integration Evidence

- Wrapper tests: 8/8 passed; full default Node suite includes them.
- Routing: description 199 characters; references 8/8; evals 12 total (6 positive + 6 negative); manual matrix 12/12 PASS.
- Validator parity: legacy and new ArtMuse/Marble flows matched; `.ps1` and references removed after parity PASS.
- Default `just node-test`: 167 total, 165 passed, 2 explicit browser skips.
- Opt-in `just node-test`: 167/167 passed, 0 skipped.
- `just ci`: passed, including docs build, skill metadata, 35 Python files, Node tests, and whitespace.
- Generated docs diff is limited to four image-to-ui index/detail files.
- Remote ubuntu/windows/macos browser CI remains `missing evidence` until push/PR authorization.

## Open Questions

无。上轮审阅发现均已转换为可测试契约；下一步是用户评审父子规划，而不是启动实施。
