# Goal 本地独立复核

日期：2026-09-05。范围为仓库 Goal 技能非 Trellis 契约；未修改安装目录、远端、主线程发现报告或 git-commit 包。

## Findings (fixed)

- File: `skills/developer-tools-integrations/goal-meta-skill/references/goal-command-playbook.md:307`
  - Issue: Claude checkout 条件简写遗漏本轮统一，仍用 `or stop after 20 turns`，没有明确交付存在、具名测试入口和超限未完成。
  - Fix: 补齐四项合取，改成 `otherwise ... incomplete`；原范围、平台及暂停边界保留。
- File: `skills/developer-tools-integrations/goal-meta-skill/references/goal-command-playbook.md:125`、`:137`
  - Issue: 中文模板把完成条件解释为“可以停止”，容易重新引入暂停与完成混同。
  - Fix: 引用同文件既有四项完成门，要求全部满足。
- File: `skills/developer-tools-integrations/goal-meta-skill/tests/lint-goal-command.test.mjs:909`
  - Issue: 新增公开样例回归只覆盖双语普通 packet 和持久 schema，漏掉 Claude 三个条件变体。
  - Fix: 扩展现有测试，检查三份变体的四门及超限 incomplete；结合各自前置完整合同运行现有 Claude linter。条件变体本身是局部替换，不冒充可独立 lint 的完整合同。

## Findings (not fixed)

- O1/O2 已有主线程现场源链与远端完整历史比对证据；同步实际运行仍有证据限制。
- O3 未完成：远端三份旧包仍存在；处置可能改变 Trellis 发现/生成语义，超出当前处置边界。尚无实际安装及新会话发现证据。
- O6 未完成：50–56 是行为评估设计用例，没有 provider transcript；确定性测试不证明模型遵从或新会话行为。

## Verification

- Lint: PASS，修复后 `just lint`，技能元数据通过且 65 个 Python 文件编译通过。
- TypeCheck: N/A，仓库没有该包独立类型检查命令；Python compilation PASS，未将编译冒称静态类型检查。
- Tests: PASS，两套 Goal Node 测试修复后 64/64，exit 0。
- Whitespace: PASS，`git diff --check`。
- Full CI / docs: 主线程统一执行，本文不预先宣称通过。
- Trellis adapter、review-remediation 专用规则及 Trellis 示例没有 diff；根 SKILL 仅版本变更。受控写入 helper 无行为修改，现有保存、旧哈希、路径/秘密/编码测试继续通过。
- 0.8.1 的 SKILL、Skill IR、schema、Generated-by linter 和测试元数据一致；description/interface 不变，trigger gate 不适用。
- 本次未发现需要新增 spec 机制的事项；已有 spec 的合取契约、文本编译边界和 fixture 证据限制足以覆盖，避免重复规则。

本地代码审查通过，整体任务仍未完成；没有提交、安装、启动 Goal 或归档。
