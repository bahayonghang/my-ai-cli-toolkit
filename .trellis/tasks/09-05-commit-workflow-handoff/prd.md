# P1 — 本地提交后续接已授权工作流

## Goal
本地提交后续接已授权工作流，消除原授权内的机械停顿。

## Evidence
skills/git-github-collaboration/git-commit/SKILL.md:28 明确要求混合请求只完成 commit 并将其余标为 out of scope。

## Requirements
- R1：git-commit 只负责本地提交，verify 后将原请求已授权剩余动作交回主协调者，路由至 gh-pr-release 或相应工作流，不将技能边界当作请求终点。
- R2：交接仓库、分支、提交 SHA、验证结果、剩余动作及阻碍；授权有效时继续，目标不明时仅澄清缺失信息。
- R3：提交失败或工具不可用时准确报告完成项及未完成原因，不伪称请求完成，不绕道 GitHub API 创建 commit。
- R4：保持 staged-only/all-changes、语言和索引保护等现有规则；仅提交不推定 push/PR 权限。

## Acceptance Criteria
- [x] AC1（R1）：“提交并 push，再创建 PR”先验证本地提交，再交接剩余动作，不以 out of scope 结束或重复索取已有授权。
- [x] AC2（R2）：交接信息足以固定仓库、分支、SHA 和剩余动作；不明确目标被明确列为待决事项。
- [x] AC3（R3）：提交失败时不执行依赖该提交的 push/PR；后续工具缺失时如实报告阻碍。
- [x] AC4（R4）：仅提交止于本地；不包含无关修改；入口、描述、完成说明和 evals 一致。

## Scope
仅该技能及直接相关文档/评估；Goal 子任务可同步设计中列出的直接关联规范。无新依赖、配置、审批状态系统。用户已批准实施本任务树，当前为 in_progress；仅修改已规划的技能与直接关联文档，不启动 Goal、不提交或远程操作，不修改用户级安装副本。

## 验收证据
见父任务 `../09-05-skill-authorization-continuity/verification.md`；勾选表示本轮实现、静态审阅及已列出的局部测试通过，不代表未执行的真实远程或平台接力验证。
