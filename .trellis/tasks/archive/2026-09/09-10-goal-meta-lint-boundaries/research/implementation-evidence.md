# Implementation evidence

日期：2026-09-10。执行角色：trellis-implement。用户已批准父任务与两个子任务实施；本文记录实现者验证，不代替独立 trellis-check 或父级验收。

## Changes and decisions

- `scripts/lint_goal_command.py`：`-` 从 `sys.stdin.buffer` 读取并按 UTF-8/BOM 解码；重复 `-` 在参数解析阶段以 exit 2 拒绝。文件、stdin 与混合多输入共用验证入口；不创建候选文件，不回显正文。
- `_inline_goal_blocks` 共用 raw/fenced 分块，raw 在空行、下一条 Goal 或 fence 结束；fenced 在匹配 closing fence 或下一条 Goal 结束，保留内部空行供明确拒绝。每条 payload 独立进行字段、具体证据、长度、Claude bounding clause、Trellis 与 review-remediation 检查。
- 长度消费同一提取结果，只去掉 `/goal` prefix 和起始分隔空白；保留正文内部空白，不计 closing fence、wrapper 或下一条 Goal。公开 `lint_goal_block_length` 与 `lint_persisted_contract` 调用契约保持可用，未修改 writer。
- 按既有测试契约与主会话确认，placeholder、dangerous vague instruction、预算误导、跨平台管理命令、Claude pause/resume 禁用提示仍在全文级检查一次；它们不能提供正向字段或 bounding clause。Chinese companion 章节顺序仍使用完整输入。
- `tests/lint-goal-command.test.mjs`：新增 8 个测试组，覆盖 UTF-8/BOM、stdin 无输出文件、非法编码、重复 stdin、混合输入、wrapper 字段借用、相邻/共享 fence 内独立 Goal、4000/4001、围栏内部空行与 Claude bounding clause 借用。
- `SKILL.md`：聊天与 review-remediation inline 命令改用 `-`，说明通过 UTF-8 stdin 传正文及已有文件用法。未改版本、平台事实、writer 或其他技能文件。

## Red / green evidence

1. 修改实现前运行父级 `research/reproduce_lint_gaps.py`：base PASS；borrowed_explanation 与 second_incomplete_goal 错误接受；raw_4000 PASS，fenced_4000 错误计为 4004。
2. 添加首批 6 个边界测试组后运行目标 lint suite：58 tests，52 passed，6 failed，0 skipped。六组分别因缺 stdin、缺 UTF-8 stdin 路由、wrapper 借字段、第二条漏检、fence 误计长度和空行截断错误失败。
3. 实现后首轮 lint + writer suite：70 tests，70 passed，0 failed，0 skipped。
4. 补齐混合输入及 Claude clause 隔离回归后最终运行：`rtk node --test skills/developer-tools-integrations/goal-meta-skill/tests/lint-goal-command.test.mjs skills/developer-tools-integrations/goal-meta-skill/tests/persist-goal-contract.test.mjs`，72 tests，72 passed，0 failed，0 skipped。
5. 原探针复核：base PASS；borrowed_explanation 报 `/goal[1]` 的六项缺字段；second_incomplete_goal 报 `/goal[2]` 的六项缺字段；raw_4000 和 fenced_4000 均无长度错误。
6. `just python-check`：PASS，65 Python files。
7. `just skills-check`：PASS，无 warning。
8. `just docs-sync`：PASS，82 skill detail pages / 89 total generated files；`git diff --name-only -- docs` 无差异。

## Remaining evidence

- 独立 trellis-check 和父级最终 `just ci` 尚由主会话调度；本子任务不重复运行全仓 CI。
- provider 输出/触发质量、跨会话接力、真实安装、人类盲评、线上平台当前行为均为 missing evidence。未运行真实 Goal，未写用户 GOAL.md。
- 未提交、归档、变更 task 状态或碰触预先存在的 `.trellis/.gitignore` 与已删除旧 review 文件。
