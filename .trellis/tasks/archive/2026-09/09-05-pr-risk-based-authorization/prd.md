# P2 — PR 按实质风险判断授权变化

## Goal
PR 按实质风险判断授权变化，消除原授权内的机械停顿。

## Evidence
skills/git-github-collaboration/gh-pr-release/SKILL.md:17-18 使用三文件门槛和 Drift resets authorization；references/address-comments.md:33、references/release-pr.md:31 重复数量门槛。

## Requirements
- R1：移除任意文件数量确认门槛；设计检查作为内部判断或简短说明，原授权内最小方案继续。
- R2：仅对尚未授权的新增依赖、新公开/远程目标、不可逆影响或实质范围变化询问；正常拆文件、验证、预期提交不自动重置授权。
- R3：保留远程动作明确授权与精确 head/fresh-read；同一请求可明确授权多个步骤，但不推定未列出的动作。
- R4：区分授权持续和证据刷新，同步各路线引用与评估；外来或未经审阅提交不能沿用旧 head 的验证。

## Acceptance Criteria
- [x] AC1（R1）：已授权四文件以上修复不会因数量停止；仅诊断仍保持只读。
- [x] AC2（R2）：正常进展不再批准；未授权的新依赖、目标或不可逆影响必须澄清。
- [x] AC3（R3）：明确“修复、push 并创建 PR”承接完整步骤；仅“修复”不触发远程写入。
- [x] AC4（R4）：head 漂移重新核查具体提交，实质变化才重新授权；各路由不与入口冲突，不确定写入禁止盲目重试。

## Scope
仅该技能及直接相关文档/评估；Goal 子任务可同步设计中列出的直接关联规范。无新依赖、配置、审批状态系统。用户已批准实施本任务树，当前为 in_progress；仅修改已规划的技能与直接关联文档，不启动 Goal、不提交或远程操作，不修改用户级安装副本。

## 验收证据
见父任务 `../09-05-skill-authorization-continuity/verification.md`；勾选表示本轮实现、静态审阅及已列出的局部测试通过，不代表未执行的真实远程或平台接力验证。
