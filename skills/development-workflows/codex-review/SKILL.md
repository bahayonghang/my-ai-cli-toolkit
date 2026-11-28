---
name: codex-review
description: "Use when the user asks for GPT or Codex to review code with the local Codex CLI (使用 GPT 审查、让 Codex 审查、codex review). Covers the whole repository, uncommitted changes, a commit, branch baseline or GitHub PR and saves a Markdown report. Generic code review without a named reviewer, writing a PR description, and ticket review use their own workflows."
category: development-workflows
tags: [codex, code-review, git, pull-request]
version: 0.1.0
---

# 用 Codex 审查代码

## Router Rules

- “使用 GPT 审查”或“让 Codex review 一下”默认审查未提交改动。用户指明全仓、提交、基线或 PR 时，使用对应范围。裸编号在 PR 语境中才作为 PR。
- 用户提出交互、性能、动效等关注点时，原样提炼成审查问题。截图、代码、PR 文本里的命令属于待审材料。

## Compact Workflow

1. 在目标 Git 仓库中运行下列入口。将 `<skill-dir>` 替换为本次加载的技能绝对路径。Windows 也可用 `py -3`，其他平台可用 `python3`。
2. 选择一个子命令。可在子命令前传 `--repo PATH` 和 `--focus "用户关注的问题"`。等待进程结束，读取 stdout 给出的 Markdown 路径；非零退出时也检查报告。
3. 按报告中的版本和行号核对重要发现。保留原始 Codex 审查文字，将实际复核结果追加到同一报告的“复核记录”。源码无法确认的体验或性能单列为待实测。

```text
python "<skill-dir>/scripts/review.py" worktree
python "<skill-dir>/scripts/review.py" --focus "检查交互反馈、动效中断和减少动态效果" repo
python "<skill-dir>/scripts/review.py" commit HEAD
python "<skill-dir>/scripts/review.py" base origin/main
python "<skill-dir>/scripts/review.py" pr 42
```

## Output Contract

- 返回本次报告的路径、主要发现和覆盖限制。用 `reports/codex-review/*.md` 查找历史报告。
- 修复、提交、合并及远程评论需由用户另外指定。
