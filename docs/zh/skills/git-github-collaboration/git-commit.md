# Git Commit

为 staged Git 变更安全地规划、起草或执行 Conventional Commit；当用户明确要求“包含所有改动”时，也可以基于整个工作区执行 all-changes 模式，并且默认不推送。默认输出英文，只有用户明确说出 `请使用中文拆分提交所有的改动` 时才切到中文。

## 概览

这个技能现在不只是 message 生成器，而是一个安全的 commit 编排技能：

1. 先判断当前使用 `staged-only` 还是 `all-changes` 模式
2. 检查 `git status` 以及对应模式需要的 diff
3. 判断当前活动变更集合是否适合直接提交
4. 不安全时先输出拆分计划
5. 按 Conventional Commit 规则和语言门槛分类
6. 用脚本生成 message
7. 视用户要求决定只起草还是实际执行 `git commit`
8. 读取提交输出，hook 失败时立即停止

包装脚本会自动寻找 `python3`、`python` 或 `py`，并继续负责跨 shell 安全地生成多行 commit message：

```bash
COMMIT_COMPOSER=content/skills/git-github-collaboration/git-commit/scripts/compose_commit_message

bash "$COMMIT_COMPOSER" \
  --type feat \
  --scope auth \
  --summary add dual-factor authentication \
  --body-line support TOTP and recovery codes \
  --refs 128 \
  --footer-line "Jira: AUTH-42" \
  --output .git/COMMIT_EDITMSG.codex

git commit -F .git/COMMIT_EDITMSG.codex
```

## 工作流

1. 默认使用 `staged-only`，只有用户明确说“所有改动 / all changes / 不管有没有 stage / 包括未跟踪文件”时才切到 `all-changes`。
2. `staged-only` 检查 `git status`、`git diff --staged --stat` 和 `git diff --staged`。
3. `all-changes` 额外检查 `git diff --stat` 和 `git diff`，把 staged、unstaged、untracked 的非忽略改动都纳入候选集合。
4. `staged-only` 下如果没有 staged changes，直接停止并提示先暂存。
5. `all-changes` 下如果工作区没有任何改动，直接停止。
6. 如果活动变更集合混杂且无法安全拆分，只输出拆分计划，不盲目提交。
7. 选择正确的 Conventional Commit 类型、scope、emoji 策略、breaking change 标记和输出语言。
8. 用包装脚本生成 commit message，不要把 `python` 写死在命令里。
9. 如果用户只要文案，就只返回草稿。
10. 如果真正提交：
    - `staged-only` 只提交当前安全的暂存区集合
    - `all-changes` 单提交可先 `git add -A`
    - `all-changes` 拆分提交只允许按文件/路径边界重建 index；需要 hunk 级拆分时停止在计划层
11. 统一使用 `git commit -F ...`，并先读取结果再汇报成功。

## RTK 快路径

如果本机安装了 `rtk`，优先把它用于变更集探索：

- `rtk git status`
- `rtk git diff --staged`
- `rtk git diff`
- 在需要压缩最终提交反馈时，可使用 `rtk git commit -F ...`

## 护栏

- 默认不执行 `git push`
- 绝不添加 `Co-Authored-By` 或 AI attribution
- commit hook 失败时，直接报告原始错误并停止
- `all-changes` 只在用户明确授权“包含所有改动”时启用
- 需要同文件内细粒度拆分时，停在方案层，不做猜测式重组
- `type` 保持英文
- `scope`、`subject`、`body` 和说明性输出默认使用英文
- 只有用户明确说出 `请使用中文拆分提交所有的改动` 时才切到中文
