# P1 — Goal 明确保存请求同轮落盘

## Goal
Goal 明确保存请求同轮落盘，消除原授权内的机械停顿。

## Evidence
skills/developer-tools-integrations/goal-meta-skill/SKILL.md:31-39、64-65、96 强制后续批准；references/persistent-goal-contract.md:23、default-goal-strategy.md:129-130、interview-checklist.md:136、goal-command-playbook.md:34 重复该限制。

## Requirements
- R1：明确生成并保存到已确定项目根目录 GOAL.md 的请求授权同轮检查、生成、lint、展示目标与影响、经现有 helper 创建及回读；普通生成、仅“直接给”不授权写文件。
- R2：写 Goal 文本与启动 Goal 严格分离；保存后只报告文本已保存和 Goal 未启动，不执行 payload、调用 Goal API 或派发 Agent。
- R3：文件已存在且未授权替换、路径不明确或合同范围实质变化时处理必要确认；保留 create-only、旧 SHA-256、路径/重解析点保护、原子写入及敏感信息检查。
- R4：同步入口、引用、接口、evals 及直接关联规范的矛盾描述，不扩大普通草稿流程。

## Acceptance Criteria
- [x] AC1（R1）：明确保存且无冲突时同轮保存并回读，无机械后续批准；仅生成和“直接给”不写文件。
- [x] AC2（R2）：即使 payload 包含“实施直到完成”，保存后也没有启动或执行 Goal。
- [x] AC3（R3）：未批准替换时旧文件不变；hash 失效拒绝覆盖；缺失路径或实质新增目标时只澄清缺失决策。
- [x] AC4（R4）：现有 writer 安全回归通过，正反 eval 与文档一致；区分静态测试和真实代理行为证据。

## Scope
仅该技能及直接相关文档/评估；Goal 子任务可同步设计中列出的直接关联规范。无新依赖、配置、审批状态系统。用户已批准实施本任务树，当前为 in_progress；仅修改已规划的技能与直接关联文档，不启动 Goal、不提交或远程操作，不修改用户级安装副本。

## 验收证据
见父任务 `../09-05-skill-authorization-continuity/verification.md`；勾选表示本轮实现、静态审阅及已列出的局部测试通过，不代表未执行的真实远程或平台接力验证。
