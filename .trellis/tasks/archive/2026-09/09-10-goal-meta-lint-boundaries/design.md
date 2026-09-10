# Design

## Mechanisms
R1：复用 main 分派流程，将单个 '-' 解释为 stdin 输入，直接读取 sys.stdin.buffer 并以 UTF-8/BOM 解码。多文件能力保留；重复 '-' 直接报告参数使用错误以免静默二次读取 EOF。不用临时文件，输出不回显正文。

R2/R3：统一已有 _inline_goal_blocks 与长度扫描对命令边界的认识。raw 模式遇到下一条 /goal 或空行结束；text fence 模式以相应 closing fence 结束，围栏内空行按现有输出契约报错。隔离 wrapper 后逐块调用字段、平台、Trellis 与 review-remediation 检查。完整输入仍供 Chinese companion 的章节顺序检查。
分块返回正文与必要定位，供错误标注第几条 Goal；不增加通用 AST 或新 schema。contract 仍由现有 section 解析器处理，不把 launcher 当完整 inline 合同重复检查。

R4：长度函数消费同一分块结果，保留既有平台预算文案；专项参数和 writer import 调用点保持有效。只调整原来错误接受/拒绝的边界行为。

## Files
- skills/developer-tools-integrations/goal-meta-skill/scripts/lint_goal_command.py：stdin 与提取/验证流程。
- skills/developer-tools-integrations/goal-meta-skill/tests/lint-goal-command.test.mjs：对应 CLI、per-block、fence 和回归用例。
- skills/developer-tools-integrations/goal-meta-skill/SKILL.md：仅把聊天 lint 调用更新为 '-' 与 stdin 传正文。
不修改 persist_goal_contract.py；其既有测试作为回归消费者。

## Trace and rollback
AC1 对应 stdin 分支；AC2 对应逐块检查；AC3 对应统一边界与长度；AC4 对应现有专项与 writer 测试。回退此子任务 diff 即恢复原实现，无数据迁移。
