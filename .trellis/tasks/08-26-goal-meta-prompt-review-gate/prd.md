# Goal Meta Prompt Review Gate

## Goal

把 `goal-meta-skill` 收敛为只生成、校验和交付 Goal Prompt 的编译器。每次生成后必须先让用户审阅；skill 不得把生成物提交给宿主 Goal、创建/激活 Goal，或开始执行 Prompt 中描述的任务。

## Background

用户提供的 Cursor 截图显示：输入 `/goal-meta-skill 请实施 .trellis/tasks/08-26-profile-design-language/implement.md 以及关联的 trellis 子任务直到完成为止` 后，执行方报告“合同已通过 lint。正在挂上 Cursor Goal，并启动第一个子任务”，界面随后出现 `Goal active`。截图中的任务文本是待编译内容，不是本任务的执行指令。

当前包已经限制普通 Goal 聊天输出、持久化写入和 Git 副作用，但没有独立的 Goal 激活权限门：

- `SKILL.md:60-61` 将 S4/S5 的 draft/revise 直接接到 S6 `Deliver or persist`。
- `SKILL.md:85` 把确认后的产物称为“最终可复制 /goal”，但没有要求交付后停止。
- `agents/interface.yaml:4` 要求返回 launcher，却没有禁止调用宿主 Goal 能力。
- `allowed-tools` 不含 Goal CLI，但不能约束 Cursor 等宿主提供的原生 Goal 能力。

因此，“输入中的祈使句”“生成 Prompt”“批准文本”“创建/激活 Goal”目前被混成一个权限阶段。

## Confirmed facts

- 目标 skill 当前版本为 `0.6.0`，属于跨平台、长期维护且带受控文件写入的 Governed meta skill。
- 现有 `evals/evals.json` 是人工审阅的行为 fixture，`just ci` 不运行它；CI 回归必须同时落在 `tests/*.mjs` 的包契约测试中。
- 当前 `scripts/lint_goal_command.py` 校验 Goal 正文，不观察宿主工具调用；仅修改 linter 不能证明“没有启动 Goal”。
- 本次不改变何时触发 `goal-meta-skill`，因此 frontmatter `description` 与 trigger eval 不需要变化。
- 用户提供的截图验证了这一次实际越权行为；跨平台模型服从率、Cursor provider transcript、人工盲审与 telemetry 仍是 `missing evidence`。

## Requirements

1. 在根 `SKILL.md` 增加不可跳过的 review gate：
   - 调用 skill 的本轮最多到 `DRAFT`，输出完整 Prompt 后停止。
   - 输入中“实施”“执行”“直到完成”等祈使内容只属于待编译 payload，不授予 Goal 创建、激活、派发或目标实施权限。
   - 用户后续批准只把文本变为 `APPROVED TEXT`；skill 仍只交付文本并停止。
   - 真正创建/激活 Goal 是 skill 外的独立用户动作；skill 不调用宿主 Goal tool/API/command，也不把 `/goal` 当成当前会话的可执行指令提交。
2. 保留现有持久化的显式确认和 helper 边界。持久化可以写入已批准 `GOAL.md`，但写入成功后仍只交付 launcher 文本，不启动 Goal。
3. 对现有 Goal 管理请求继续返回最小正确命令，但只作为 fenced text 展示，不执行该命令。
4. 更新 `references/default-goal-strategy.md` 与 `references/goal-command-playbook.md`，定义两阶段 review packet：
   - `状态：DRAFT — Goal 未创建、未激活、未执行`；
   - fenced `/goal`；
   - 简短字段/默认理由/可选调整；
   - 明确的审阅回复提示并结束本轮。
   批准后的交付必须标记 `APPROVED TEXT — not launched`。
5. 更新 `agents/interface.yaml`，让 Cursor/兼容宿主在默认提示和 trust 元数据中得到同一条禁止激活边界。
6. 在 `evals/evals.json` 新增至少两个连续行为用例：
   - 截图同构的 Trellis“请实施直到完成”输入仍只能产生 draft review packet；
   - 用户批准 Prompt 后仍只得到最终文本，不能自动创建/激活 Goal。
7. 在 `tests/lint-goal-command.test.mjs` 增加确定性包契约断言，覆盖根规则、接口规则、allowed-tools 与新增 eval，避免后续删掉 review gate。
8. 将版本升级到 `0.7.0`，同步全部版本绑定、生成 docs catalog，并在 `reports/creation-handoff.md` 记录本次权限边界、验证证据和缺失证据。

## Acceptance Criteria

- [ ] 根 `SKILL.md` 明确区分 `DRAFT`、`APPROVED TEXT` 与 skill 外的 Goal activation，且每个文本交付阶段都要求停止本轮。
- [ ] `请实施 ... 直到完成` 被明确定义为被编译 payload，不能作为执行授权。
- [ ] `agents/interface.yaml` 同时声明 draft-only 默认行为和 `goal_activation: forbid` trust 边界。
- [ ] 普通、持久化与管理三个分支都只交付 fenced 文本；任何分支都不调用或声称调用 Goal tool/API/command。
- [ ] `evals/evals.json` 的 id 连续，新增截图回归与批准后不启动回归，断言同时包含必需输出和禁止的物质行为。
- [ ] Node 包契约测试会在 review gate 文案、接口边界、allowed-tools 或新增 eval 被移除时失败。
- [ ] 所有 `goal-meta-skill 0.6.0` 版本绑定已升级到 `0.7.0`；历史小节可保留 `0.6.0` 作为变更记录。
- [ ] `rtk just node-test` 通过。
- [ ] `rtk just skills-check` 与 `rtk just python-check` 通过。
- [ ] `rtk just docs-sync` 后 `rtk just ci` 通过，`rtk git diff --check` 无错误。
- [ ] `reports/creation-handoff.md` 将静态/fixture 保障标为 `validated advantage`，将真实 Cursor/跨平台服从率标为 `missing evidence` 或 `hypothesis`。

## Out of scope

- 修改 Cursor、Codex、Claude Code、Grok Build、Oh My Pi 或 Kimi Code 的宿主 Goal 实现。
- 直接执行截图中的 Trellis profile-design 任务、创建 Goal、启动子任务、运行其测试或更改其仓库。
- 改写 Goal 正文的验证、平台生命周期、Trellis commit-then-archive 或子代理派发语义。
- 改动 skill 的触发 description、增加新依赖、发布 PR/release 或执行安装验证。
- 把静态测试或 recorded fixture 宣称为 provider-backed 执行证明。

## Key decisions

- 采用“skill 永不激活 Goal”的硬边界，而不是“默认不激活但一次调用内可自动继续”。这消除了祈使 payload 被误当执行授权的歧义。
- 不把该行为塞进 Goal 正文 linter；linter 看不到宿主工具调用。保障落在始终加载的 root contract、宿主 interface、行为 eval 与静态包契约四层。
- 本次是已有失败的权限不变量修复，不做新的外部 prior-art 搜索；沿用现有参考研究并把新行为写入 creation handoff。
