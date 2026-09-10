# Independent check evidence

2026-09-10，trellis-check 独立核对 PRD/design、全部子任务产品 diff、writer import 消费路径及新增 helper-command spec。未改变任务状态、writer、平台事实、版本或无关文件。

## Finding fixed

- `_inline_goal_blocks` 用 `line.strip()` 保存 Goal 首行，丢掉首行末尾、处于多行正文内部的空格，使实际 4001 字符误报为 4000。独立函数探针在 raw/fenced 两种输入均复现无错误；新增完整合法 Goal 的 CLI 回归先失败（1 failed）。改为 `line.lstrip()` 保留正文末尾空白，最终回归通过。未引入新规则或依赖。

## Acceptance verification

- AC1 PASS：文件/stdin UTF-8 与 BOM 一致；非法字节和重复 `-` 非零；混合输入任一失败会汇总失败；stdin 无输出文件，来源可辨认且不回显正文。
- AC2 PASS：raw、独立 fence、共享 fence 与相邻 Goal 分块；wrapper 不能提供缺少字段，第二条残缺必失败，两个完整命令均通过。Claude 正向 bounding clause 逐块校验，全文禁止命令检查保留。
- AC3 PASS：4000/4001 raw/fenced、外部说明、下一条命令和正文空白计数；fenced 内空行保留并明确失败。
- AC4 PASS：普通/Trellis/中文 companion/review-remediation/五平台与 writer 安全回归通过。`persist_goal_contract.py` 继续只 import `lint_persisted_contract`；持久合同保持 section parser，launcher 仅调用长度与平台管理命令检查。
- 新增 `.trellis/spec/backend/skill-helper-command-contracts.md` 的 stdin/payload scenario 与实现一致，无需修订。

## Commands and boundaries

- `rtk node --test skills/developer-tools-integrations/goal-meta-skill/tests/lint-goal-command.test.mjs skills/developer-tools-integrations/goal-meta-skill/tests/persist-goal-contract.test.mjs`：73 passed，0 failed，0 skipped。
- `just python-check`：65 files PASS（编译检查；项目未配置本层独立静态类型检查）。
- `just skills-check`：PASS，无 warning；`rtk git diff --check`：PASS。
- 复用实现者 docs-sync 无生成差异证据；本次只修 Python/test，没有新增文档生成输入。父级最终 `just ci` 由主会话完成。
- 无未修复的范围内阻断项。Provider 行为、真实安装、跨会话接力与人类验收仍为 missing evidence；本次未调用真实 Goal 或保存用户合同。
