# 实施计划

## 1. 编码 review gate

- 更新 `SKILL.md`：在 Governed mode、Workflow、Output contract、Management 与 Quality bar 中统一 draft-only、approve-text-only、activation-outside-skill 语义。
- 更新 `references/default-goal-strategy.md`：加入 review envelope、祈使 payload 规则和批准后仍停止的形状。
- 更新 `references/goal-command-playbook.md`：让 drafting rules/示例与 review packet 对齐，不改 Goal 正文字段和 Trellis cadence。

完成门：三个入口对 `DRAFT`、`APPROVED TEXT`、Goal activation 的定义一致，无互相矛盾的“execute/launch”授权。

## 2. 收紧宿主接口

- 更新 `agents/interface.yaml` 的 short description、default prompt 与 trust 元数据。
- 确认 `allowed-tools` 仍不包含 Goal/Codex/通配 Git 写能力。

完成门：Cursor/兼容宿主默认 prompt 明确在展示后停止，祈使 payload 不授予启动权限。

## 3. 增加行为与包契约回归

- 在 `evals/evals.json` 追加连续 id 的截图同构 case 与批准文本 case。
- 在 `tests/lint-goal-command.test.mjs` 增加 review gate/package interface/eval 断言。
- 先运行目标 Node 测试文件，再运行全仓 Node tests。

完成门：删除任一核心 review gate、接口 forbid 或新增 fixture 时，目标测试会失败。

## 4. 同步版本和交付证据

- 将当前版本绑定升级到 `0.7.0`：`SKILL.md`、linter、persistent contract、两组 tests、creation handoff。
- 更新 `reports/creation-handoff.md`，保留旧版本历史，新增 0.7.0 边界、验证与 missing evidence。
- 因 frontmatter version 变化运行 `rtk just docs-sync`。

完成门：活动合同中无遗留 `goal-meta-skill 0.6.0`；历史变更叙述保留时上下文明确。

## 5. 验证

按从小到大顺序运行：

1. `rtk node --test skills/developer-tools-integrations/goal-meta-skill/tests/lint-goal-command.test.mjs`
2. `rtk node --test skills/developer-tools-integrations/goal-meta-skill/tests/persist-goal-contract.test.mjs`
3. `rtk just node-test`
4. `rtk just skills-check`
5. `rtk just python-check`
6. `rtk just docs-sync`
7. `rtk just ci`
8. `rtk git diff --check`

另外人工审阅新增 eval，确认截图任务没有被执行、没有 Goal activation claim。provider-backed Cursor 重跑保持 `missing evidence`，除非用户另行提供真实运行。

## 风险与回滚点

- 主要风险是旧 companion 标题/测试耦合；优先增加 envelope，不无关重写 Goal 正文 marker。
- 如果 static wording assertion 过度依赖整句，改成多个短语义锚点加物质禁止行为，不用长句快照。
- 若 docs-sync 生成文件超出 goal-meta catalog 页面，检查生成器行为，不手工编辑生成页。
