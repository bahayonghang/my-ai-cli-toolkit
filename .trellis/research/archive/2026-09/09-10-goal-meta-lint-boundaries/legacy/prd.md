# Goal lint 无落盘输入与逐命令验证

## Goal
让聊天 Goal 无需临时文件即可 lint，并确保通过结果针对每一条实际复制的命令。

## Requirements
- R1：文件和 '-' stdin 输入共享确定性验证；stdin 支持 UTF-8/BOM，非法编码清晰失败，不写候选文件。依据：skills/developer-tools-integrations/goal-meta-skill/scripts/lint_goal_command.py:1445、skills/developer-tools-integrations/goal-meta-skill/scripts/lint_goal_command.py:1460。
- R2：每条 Goal 具有独立字段和平台/专项检查；另一条 Goal 或围栏外说明不能提供字段。依据：skills/developer-tools-integrations/goal-meta-skill/scripts/lint_goal_command.py:1146、skills/developer-tools-integrations/goal-meta-skill/scripts/lint_goal_command.py:1164。
- R3：长度只统计本条 /goal 的正文，不包含 prefix、closing fence 或外部说明；单条、双语、多条 raw/fenced 输入边界一致。依据：skills/developer-tools-integrations/goal-meta-skill/scripts/lint_goal_command.py:315。
- R4：保留合同、review-remediation、Trellis、五平台、中文 companion 与持久化检查；不把自然语言质量转换成新的关键词规则引擎。

## Acceptance Criteria
- [x] AC1（R1）：同一合法中文内容由文件和 '-' stdin 输入获得相同成功结果；BOM 可读，非法 UTF-8 非零退出；stdin 模式不创建输出文件，现有文件输入仍可用。
- [x] AC2（R2）：完整 Goal 通过；不完整 Goal 加外部完整字段失败；完整 Goal 后加残缺第二条失败；两个独立完整 Goal 均通过，任何一条失败均使 CLI 非零退出。
- [x] AC3（R3）：四千字符正文在 raw 与 text fence 中均通过长度检查；四千零一均失败；闭合围栏、后续说明和相邻 Goal 不计入该条长度。围栏内空行违反当前输出契约时明确拒绝，不能截断后假通过。
- [x] AC4（R4）：现有目标 Node 测试全部通过，新增边界回归可证明对应缺陷修复；持久化 helper 的安全行为保持通过。

## Out of scope
不改字符预算与平台事实，不扩大写入权限，不新增 Markdown 依赖或语义校验器，不精简整个入口，不修改 writer。

## Dependencies
先于 09-10-goal-meta-contract-consolidation；共享 SKILL.md/test 文件不能同时编辑。
