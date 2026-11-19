# 实施计划：skill-session-review

在用户明确批准**本轮修订后的**规划摘要之后，才运行 `task.py start`。本文件修订不是批准。

## 顺序

1. 根 `.gitignore` 追加精确行 `reports/skill-session-review/`。
   检查：该行存在；`git check-ignore -v reports/skill-session-review/x.md` 来源为仓库 `.gitignore`。
2. 建包目录 `skills/developer-tools-integrations/skill-session-review/`。
3. 写 `references/invocation-signals.md`、`finding-contract.md`、`report-template.md`、`handoff-prompt.md`。
   检查：finding-contract 含四字段、摘录 2×200、四裁决、`available/loaded/invoked`。
4. 写 `scripts/scan_invocations.py` 与 `tests/scan-invocations.test.mjs`。
   检查：`node --test skills/developer-tools-integrations/skill-session-review/tests/scan-invocations.test.mjs`
5. 写 `scripts/write_session_review.py` 与 `tests/write-session-review.test.mjs`。
   检查：`node --test skills/developer-tools-integrations/skill-session-review/tests/write-session-review.test.mjs`（含全局 exclude 而根缺行仍追加）。
6. 写 `SKILL.md`、`agents/interface.yaml`、`evals/evals.json`。
   检查：`just skills-check`。
7. 写任务内 `research/trigger-cases.json`，跑 qiaomu trigger_eval（绝对 `--cases`）。
   检查：命令退出 0，全部 case 通过。
8. 更新 `skills/developer-tools-integrations/AGENTS.md` 的 suite 表与 `allowed-tools` 行。
9. 真实只读 smoke：`scan_invocations.py --skill-name trellis-plan-review --scope global`，只记录会话数、平台、status 计数，不打印私聊。跨 cwd、同名两路径、Grok 嵌套 session id 各核一项。外部格式对不上则写入报告盲区 `UNVERIFIED`，不改 fixture 去迎合未知 schema。
10. `just docs-sync`。
11. `just ci`。

## 验证

逐步检查见上。汇总：

```text
node --test skills/developer-tools-integrations/skill-session-review/tests/scan-invocations.test.mjs
node --test skills/developer-tools-integrations/skill-session-review/tests/write-session-review.test.mjs
python "C:\Users\lyh\.grok\skills\qiaomu-meta\scripts\trigger_eval.py" "<skill-dir>" --cases "<repo>/.trellis/tasks/08-25-skill-usage-retro/research/trigger-cases.json"
just skills-check
just python-check
just node-test
just docs-sync
just ci
```

writer 另用临时仓库：文件落在 `reports/skill-session-review/<name>.md`；根 `.gitignore` 含精确行。

## 风险文件

- 根 `.gitignore`：只加这一行。
- `docs/`：只允许 `docs-sync` 生成页。
- `skills/developer-tools-integrations/AGENTS.md`：只补本 skill 一行。

## 回滚

删除 skill 目录、还原 `.gitignore` 与 `AGENTS.md`、再跑 `just docs-sync`。`ref/repo/skill-usage-retro/` 不进 git。

## task.py start 之前

- `prd.md` 无开放问题。
- `design.md`、`implement.md` 已按审阅报告修订。
- `implement.jsonl` / `check.jsonl` 只含 spec/research。
- 用户已批准最新规划摘要。
