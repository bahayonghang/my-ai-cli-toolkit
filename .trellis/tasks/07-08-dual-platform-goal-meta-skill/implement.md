# Implement: dual-platform goal-meta-skill

写入边界：仅 `skills/developer-tools-integrations/goal-meta-skill/**`。平台事实以 prd.md 基线表为准，不得引入表外行为描述。

## 执行清单（按序）

1. **新增 `references/platform-goal-facts.md`**
   - 内容按 design.md「新增 reference」一节：平台事实两节 + 渲染规则 + 平台判定。
   - 验证：`PYTHONUTF8=1 python scripts/check.py`（仓库根）不报该 skill 错误。

2. **改 `scripts/lint_goal_command.py`**
   - 加 `--platform {codex,claude,both}`（默认 both）；claude 追加规则（拒 pause/resume、要求轮次/时间条款）；通用 4,000 字符首行检查。
   - 验证：`PYTHONUTF8=1 python skills/developer-tools-integrations/goal-meta-skill/scripts/lint_goal_command.py --help` 正常；旧调用（无 --platform）对现测试样例行为不变。

3. **改 `tests/lint-goal-command.test.mjs`**
   - 现有 5 测试不动；按 design.md 新增 4 组用例。
   - 验证：`just node-test` 全绿。
   - 回滚点：若 linter 行为设计有误，revert 步骤 2-3 后重新设计，不影响文档步骤。

4. **改 `SKILL.md`**
   - frontmatter（description/tags/version 0.2.0）、Operating Mode 平台分列、Workflow 插入平台判定、Output Contract 双平台示例、lint 示例带 `--platform`。
   - 双平台示例必须能通过各自 `--platform` lint：写完后实际运行 linter 验证示例块。
   - 验证：`just skills-check`。

5. **改三个 references**
   - `goal-command-playbook.md`：Platform Goal Commands 化、三例补 Claude Code 版、Anti-Patterns 增补。
   - `default-goal-strategy.md`：长度规则双平台化、平台判定小节。
   - `interview-checklist.md`：平台分流、平台选择题（仅平台不明时）。
   - 验证：交叉检查无残留"Codex 独占"表述（`grep -rn "Codex" references/` 逐条确认语境正确）。

6. **改 `evals/evals.json`**
   - 追加 id 8-10（Claude Code 正向 / pause 纠偏 / 平台歧义）；现有 1-7 不动。
   - 验证：`python -c "import json;json.load(open(...))"` 语法通过。

7. **改 `agents/interface.yaml` + `README.md`**
   - interface.yaml 双平台化；README 双平台差异表 + troubleshooting 分组 + Claude Code 安装确认命令（`~/.claude/skills` 或 `~/.agents/skills` symlink 方案按现安装器实际路径写）。
   - 验证：YAML 可解析；README 中命令均与 platform-goal-facts.md 一致。

8. **收尾验证（review gate）**
   - `just ci` 全绿。
   - 手工核对 Acceptance Criteria 清单逐项打勾。
   - 用 `--platform claude` lint 一份故意含 `/goal pause` 的样例确认报错。

## 验证命令汇总

```bash
just skills-check
just python-check
just node-test
just ci
PYTHONUTF8=1 python skills/developer-tools-integrations/goal-meta-skill/scripts/lint_goal_command.py --platform claude <sample>
```

## 注意

- Windows 下运行 Python 一律前缀 `PYTHONUTF8=1`。
- 不删除 `scripts/__pycache__`（与本任务无关）；不改其他 skill。
- 提交：单 commit，`feat(skills): [AI] adapt goal-meta-skill for Claude Code and Codex /goal`。
