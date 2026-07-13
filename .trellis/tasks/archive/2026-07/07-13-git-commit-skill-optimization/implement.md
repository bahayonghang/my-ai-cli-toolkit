# 执行计划：git-commit skill 优化

前置：按 `prd.md`（R1–R8）与 `design.md`（D1–D6）执行。改动全部位于 `skills/git-github-collaboration/git-commit/` 与本任务目录。

## 顺序清单

### 阶段 A：脚本（R1/R2 → D1/D2）

- [ ] A1 `scripts/compose_commit_message.py`：加 `--max-header-width`（默认 72，`<20` 报错）；报错文案按 D1 模板 → 验证：`python scripts/compose_commit_message.py --type feat --summary "<78列header>" --max-header-width 100` exit 0；不传 flag exit 1
- [ ] A2 同文件：移除 `--type` 的 `choices=`，加 `^[a-z][a-z0-9-]*$` 校验与 `--emoji <char>`；emoji 优先级按 D2 → 验证：`--type hotfix --emoji 🚑` / `--type hotfix`（stderr 提示、无 emoji）/ `--type feat` 输出与旧版 diff 为空
- [ ] A3 回归自查：内置 11 type × 不传新 flag，stdout 逐字节与 1.10.0 一致 → 验证：对 `git stash` 前后输出做 diff，或用 A4 测试的基线用例覆盖

### 阶段 B：测试（R5 → D5）

- [ ] B1 新建 `tests/compose-commit-message.test.mjs`，实现 D5 用例 1–10（含默认回归分支）→ 验证：`just node-test` 发现并全绿
- [ ] B2 确认 Windows 下 Python 探测与 skip 逻辑不误跳 → 验证：本机运行输出 `pass` 计数 ≥10，无 skip

### 阶段 C：文档（R3/R4/R6 → D3/D4）

- [ ] C1 SKILL.md §4：参数表补 `--output` / `--max-header-width` / `--emoji`；§5.3 改用 `--output` 并加 PowerShell `>` 禁令 → 验证：通读 §4/§5 无自相矛盾；行数仍 <500
- [ ] C2 SKILL.md Preflight §5：采样点加 AI 署名惯例检测；§3 Classify 加「仓库惯例 trailer 分支」一句并指向 agent-workflow.md → 验证：与 D4 决定一致（复用 `--footer-line`，私有 trailer 组在该分支省略）
- [ ] C3 agent-workflow.md：新增「与社区 Assisted-by 惯例的关系」小节（映射表 + 保留理由 + kernel 格式示例）；边界表加 `Signed-off-by` 禁止行 → 验证：与 message-rules.md 禁止项互引一致
- [ ] C4 message-rules.md 禁止项：加「不自行添加 Signed-off-by（DCO 属人类签署）」→ 验证：`git grep -n "Signed-off-by" skills/git-github-collaboration/git-commit/` 命中两处文档
- [ ] C5 frontmatter description 追加负向触发句（push/PR/amend/rebase/tag 不在此 skill）；顺手处理 F7 两处（模型 ID 例子改为泛化写法；commit-types.md 加 subject=what/body=why 澄清括号）→ 验证：`just skills-check` 通过
- [ ] C6 `agents/interface.yaml` default_prompt 若受 C2/C5 影响则同步措辞 → 验证：与 SKILL.md 描述无冲突

### 阶段 D：evals 与版本（R7/R8 → D6）

- [ ] D1 evals.json 追加 #24/#25/#26（按 design.md D6 断言）→ 验证：JSON 可解析（`python -c "import json;json.load(open(...))"`）
- [ ] D2 SKILL.md `version: 1.11.0` → 验证：`just skills-check`

### 阶段 E：收口

- [ ] E1 `just ci` 全绿（含 `git diff --check`）
- [ ] E2 对照 prd.md Acceptance Criteria 逐条勾验
- [ ] E3 Conventional Commit 提交（建议拆分：`feat(git-commit)` 脚本+测试 / `docs(git-commit)` 文档+evals，或单原子提交，按最终 diff 体量定）

## review 门

- 阶段 A 结束后：核对 A3 零回归证据再进入 B。
- 阶段 C 结束后：通读 SKILL.md 全文一遍，确认新增内容没有把「仓库配置优先」改出第三处矛盾。

## 回滚点

- 每阶段独立可回退；最终若单提交，`git revert <sha>` 整体回退（design.md「兼容与回滚」）。
- 脚本回滚不影响文档，反之亦然；测试文件删除即回退。

## 验证命令汇总

```bash
just skills-check
just python-check
just node-test
just ci
PYTHONUTF8=1 python skills/git-github-collaboration/git-commit/scripts/compose_commit_message.py --type feat --summary "试例" --max-header-width 100
```

（Windows 下运行 Python 命令带 `PYTHONUTF8=1`，见全局 memory。）
