# 设计：image-to-ui 审计修复任务树与集成边界

## Task Graph

```text
image-to-ui-skill-audit-fixes (parent / integration)
├── image2-wrapper-correctness       independent
├── image-to-ui-routing-contract     independent
└── image-to-ui-validator-migration  after routing-contract

parent integration
  requires all three children
  -> docs-sync
  -> full local gates
  -> three-OS CI evidence
  -> one-shot commit plan
```

父任务拥有共同约束、依赖图、生成文档同步和最终发布面检查。子任务拥有各自代码、局部测试与回滚边界；不得因为同属一个目录而把依赖留作隐含假设。

## Boundaries

### Wrapper Child

- 写入：`scripts/image2_asset.py`、SKILL.md wrapper 命令段、`tests/image2-asset.test.mjs`。
- 不写入：description、interface、evals、demo validator、assets。

### Routing Child

- 写入：SKILL.md frontmatter/索引、`agents/interface.yaml`、`evals/evals.json`、任务证据报告。
- 不写入：wrapper 逻辑、demo 页面/validator、assets。

### Validator Child

- 写入：root/demo validators、结构/行为 tests、demo 文档引用、GitHub CI opt-in 配置、parity evidence。
- 不写入：demo HTML/CSS/JS、description、wrapper、assets。

### Parent Integration

- 写入：仅 `just docs-sync` 产生的本 skill docs 和父任务集成证据。
- 不重新实现子任务代码。

## Contracts Across Children

- Routing child 先稳定 references index；validator child 的结构测试再将其作为集合相等契约。
- Wrapper 与 routing 可按任意顺序完成，但分别验收，不能用父任务的最终 CI 替代局部门禁。
- Validator 删除 ps1 的 hard gate 是 parity matrix 全绿；父任务不能 waiver。
- 所有 child 都必须保持 assets 与 tracked screenshots 零 diff。

## Integration Gates

1. 子任务状态与 acceptance evidence 完整。
2. 运行 `just docs-sync`，检查生成 diff 没有无关 catalog 漂移。
3. 运行默认本地 gates，证明默认不启动浏览器。
4. 运行显式 browser opt-in，证明两个 demo 都实际执行。
5. 汇总 boundary/exclusion/output contract/rollback/missing evidence。
6. 按 Phase 3.4 一次展示本地原子 commit plan并提交，不 push。
7. 请求独立的 push/PR 授权；获权后核对 GitHub 三平台 Node 20 job，不接受 skip 作为 browser 行为证据。
8. 三平台全绿后才进入 finish-work；未获权或未运行时保持父任务未完成。

## Rollback Boundary

- Wrapper、routing、runner 引入、旧 validator 删除、generated docs 可分别形成原子 commit batch，但所有 batch 只在最终验证后一次规划和确认。
- 删除 validator 的 batch 可单独 revert 以恢复 ps1；不得把资产放入任何 batch。
- 若 docs-sync 产生无关变更，停止集成并调查生成器/工作树，不手工隐藏漂移。
- 若 GitHub 任一 OS browser opt-in 失败，validator child 回到 planning/implementation 修复，父任务不满足完成条件。
