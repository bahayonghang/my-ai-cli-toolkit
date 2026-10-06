# Design: test backfill

共享契约在父任务 `design.md` 的 CI Shape 与 Test Backfill Shape。

## Files

新建：

- `scripts/check_skill_evals.py`
- `scripts/test_check_skill_evals.py`，由扩展后的 `python-test` 收集
- 四个 skill 的 `tests/test_*.py`
- 14 个说明型 skill 的 `tests/*.test.mjs`
- `claude-context-improver/evals/evals.json`
- 其他 skill 仅在路由负例不足两条时追加的 eval 元素

修改：

- `justfile` 的 `python-test`、新增 `evals-check`、`ci` 的八步提示
- 根 `AGENTS.md` 的 `just ci` 列举
- `skills/AGENTS.md`
- `skills/development-workflows/AGENTS.md`
- `skills/research-learning-knowledge/AGENTS.md`
- `skills/research-learning-knowledge/humanizer-paper` 里声明 pytest 不进 CI 的句子
- 两份既有测试文件：改为 unittest

`repo-test-audit` 目录只在 recipe 提取与新 justfile 不一致时做最小修补。

## python-test Discovery

用一段 Python 找出目录再逐个 `unittest discover -s <dir> -p test_*.py`。失败即停。发现范围：

- `platforms/claude/hooks/tests` 若存在 `test_*.py`
- `skills` 下目录名是 `tests`、父级不是 `scaffolds`、且含 `test_*.py` 的目录

跳过路径分量 `.git`、`node_modules`、`__pycache__`、`ref`、`.agents`、`.claude`、`.trellis`。

## evals-check

标准库读取每个 skill 的 `evals/evals.json`。错误信息含相对路径和缺的字段名。退出码 1 表示失败。不访问网络。

## Rollback

`justfile` 与约定文档一起还原。两份 pytest 文件还原到改写前的 git blob。新测试文件删除。
