# 技能授权连续性优化

## Goal
落实用户第 2、4、10 项建议，消除明确授权工作中的强制停顿与跨技能提前终止。

## Requirements
- R1：Goal 明确保存同轮完成，由 09-05-goal-save-same-turn（P1）负责。
- R2：PR 按实质范围、目标和影响判断授权变化，由 09-05-pr-risk-based-authorization（P2）负责。
- R3：提交后续接已授权操作，由 09-05-commit-workflow-handoff（P1）负责。
- R4：三技能统一授权连续性，保留文件安全、远程授权及精确 head 验证。

## Acceptance Criteria
- [x] AC1（R1）：Goal 子任务验收项全部通过。
- [x] AC2（R2）：PR 子任务验收项全部通过。
- [x] AC3（R3）：commit 子任务验收项全部通过。
- [x] AC4（R4）：联合核查“生成并保存但不启动”“四文件修复”“提交并 push 再创建 PR”“仅提交”“外来 head 变化”，入口和引用无冲突；检查通过、失败、跳过与缺失证据分别报告。

## Scope
用户于 2026-09-05 明确批准实施，任务已进入 in_progress；不启动 Goal、提交、归档或远程操作。实现限 skills/ 对应技能及 Goal 直接关联规范。用户级安装副本与 C:/Users/lyh/.codex/AGENTS.md 不纳入修改；其中五文件 pause 作为外部约束，不宣称本任务已修复。保留现有 .gitignore 修改。

## 验收证据
见父任务 `../09-05-skill-authorization-continuity/verification.md`；勾选表示本轮实现、静态审阅及已列出的局部测试通过，不代表未执行的真实远程或平台接力验证。
