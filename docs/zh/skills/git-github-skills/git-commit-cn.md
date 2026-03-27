# Git Commit CN

为 staged Git 变更安全地规划、起草或执行中文 Conventional Commit，并且默认不推送。

## 概览

这个技能现在不只是 message 生成器，而是一个安全的 commit 编排技能：

1. 先检查 `git status` 和 `git diff --staged`
2. 判断当前 staged 集合是否适合直接提交
3. 不安全时先输出拆分计划
4. 按中文 Conventional Commit 规则分类
5. 用脚本生成 message
6. 视用户要求决定只起草还是实际执行 `git commit`
7. 读取提交输出，hook 失败时立即停止

脚本仍然负责跨 shell 安全地生成多行 commit message：

```bash
python content/skills/git-github-skills/git-commit-cn/scripts/compose_commit_message.py \
  --type feat \
  --scope auth \
  --summary 添加双因素认证 \
  --body-line 支持 TOTP 和恢复码 \
  --refs 128 \
  --footer-line "Jira: AUTH-42" \
  --output .git/COMMIT_EDITMSG.codex

git commit -F .git/COMMIT_EDITMSG.codex
```

## 工作流

1. 先检查 `git status`、`git diff --staged --stat` 和 `git diff --staged`。
2. 如果没有 staged changes，直接停止并提示先暂存。
3. 如果 staged 内容混杂且无法安全拆分，只输出拆分计划，不盲目提交。
4. 选择正确的 Conventional Commit 类型、scope、emoji 策略和 breaking change 标记。
5. 用脚本生成 commit message。
6. 如果用户只要文案，就只返回草稿。
7. 如果真正提交，统一使用 `git commit -F ...`，并先读取结果再汇报成功。

## RTK 快路径

如果本机安装了 `rtk`，优先把它用于暂存区探索：

- `rtk git status`
- `rtk git diff --staged`
- 在需要压缩最终提交反馈时，可使用 `rtk git commit -F ...`

## 护栏

- 默认不执行 `git push`
- 绝不添加 `Co-Authored-By` 或 AI attribution
- commit hook 失败时，直接报告原始错误并停止
- `type` 保持英文，`scope`、`subject`、`body` 默认优先中文
