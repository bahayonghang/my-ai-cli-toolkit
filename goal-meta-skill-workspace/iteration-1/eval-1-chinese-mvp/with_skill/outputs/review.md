# Eval 1: Chinese MVP Defaults

Status: review artifact only. This Codex inline session did not spawn independent with-skill/baseline agents.

Prompt:

```text
用 goal-meta-skill 帮我把“做一个本地记账 App MVP”写成 Codex /goal。我不想填长表，直接给推荐执行版和几个可选调整。
```

Expected output:

- Chinese-first paste-ready `/goal`.
- `推荐执行版（中文，可直接复制）` appears first.
- Includes `默认选择理由`, `可选调整`, `你可以直接回复`, and `Goal Draft (English-compatible)`.
- Keeps `/goal` as the executable command prefix.

Automated coverage added in this iteration:

- `lint_goal_command.py --require-chinese-companion` verifies the Chinese-first companion sections.
- `just node-test` covers this contract through `lint-goal-command.test.mjs`.
