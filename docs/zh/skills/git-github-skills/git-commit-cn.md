# Git Commit CN

为暂存区变更生成带 emoji 的中文 Conventional Commit 信息，并且默认不推送。

## 概览

这个技能现在通过小脚本生成多行 commit message，避免 PowerShell 和 POSIX shell 在 HEREDOC 处理上的差异：

```bash
python content/skills/git-github-skills/git-commit-cn/scripts/compose_commit_message.py \
  --type feat \
  --scope auth \
  --summary 添加双因素认证 \
  --body-line 支持 TOTP 和恢复码 \
  --output .git/COMMIT_EDITMSG.codex

git commit -F .git/COMMIT_EDITMSG.codex
```

## 工作流

1. 先检查 `git status` 和 `git diff --staged`。
2. 把无关改动拆成多个提交。
3. 选择正确的 Conventional Commit 类型和 emoji。
4. 用脚本生成 commit message。
5. 通过 `git commit -F ...` 提交。

## RTK 快路径

如果本机安装了 `rtk`，优先把它用于暂存区探索：

- `rtk git status`
- `rtk git diff --staged`
- 在需要压缩最终提交反馈时，可使用 `rtk git commit -F ...`

这个技能默认不执行 `git push`。只有在用户明确要求时才讨论推送动作。
