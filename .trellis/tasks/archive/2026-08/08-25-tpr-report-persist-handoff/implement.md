# 执行计划：审阅报告落盘与交接 Prompt

## 顺序

四步。每步可单独回退。实现期间不运行 `task.py start` 以外的状态命令；本文件是给本任务实现用的。

### 步骤 1：写入 helper 与测试（R3 R4 R7 / AC1 AC3 AC7 AC11）

- 新增 `scripts/write_review_report.py`，契约见 `design.md`。复用或并列 `find_repo_root`（不要改 `plan_precheck.py` 的预检语义）。
- 新增 `tests/write-review-report.test.mjs`：
  - 临时仓库含 `.trellis/tasks/08-25-sample/` 时，写入 `.trellis/reviews/08-25-sample.md`，UTF-8 LF，stdout JSON 含 path/bytes/sha256。
  - 第二次写入覆盖同一路径。
  - `task_dir` 名含 `..` 或目的地逃逸 → 退出 1 或 2，不写文件。
  - 无 `.trellis` 祖先且未传 `--repo-root` → 退出 2，不写。
  - stdin / `--input` 中文正文不乱码。
- 验证：`just python-check`；`just node-test`（至少该测试文件通过）。

### 步骤 2：模板（R2 R6 / AC2 AC10）

- `references/report-template.md`：YAML 头 + 四段正文 + 盲区。
- `references/handoff-prompt.md`：占位符表、中文模板、英文模板、填充规则、禁止指代。
- `references/finding-contract.md` 末尾增加「落盘」与「对话输出」两小节，指向上述文件，不复制整份模板。

验证：对照 PRD R6 的 11 条，每条能在中英模板中定位。

### 步骤 3：SKILL 入口与 evals（R5 R8 R9 / AC5 AC6 AC8 AC9）

- `SKILL.md`：
  - `version: 0.2.0`
  - `description` 增加保存 `.trellis/reviews/` 报告与可复制交接 Prompt；保持无尖括号、≤1024 字符；非触发语不变。
  - 硬门：不改被审对象；报告文件除外。`allowed-tools` 增加 `Write`，并写明只用于报告或 helper 的 `--input`。
  - 步骤 4 改为：按模板写报告 → 调用 `write_review_report.py` → 对话只输出结论、路径、`text` fence。
  - Resource map 增加新文件。
- `agents/interface.yaml`：`default_prompt` 补落盘路径与交接 Prompt，仍禁止改规划产物。
- `evals/evals.json`：
  - #1、#3、#4、#5 的「不改任何文件」改为「不改规划产物；写入 `.trellis/reviews/<task>.md`；输出交接 Prompt」。
  - 新增一条：用户只要审阅结果、未提保存，仍落盘并给出 Prompt。
  - 保留 #6 纯 diff、#7 写规划 两条路由否定。

验证：`just skills-check`。

### 步骤 4：文档与 CI（AC12）

- `just docs-sync`
- `just ci`
- `git status --porcelain -uall` 确认改动范围。

## 验证命令

```bash
just python-check
just node-test
just skills-check
just docs-sync
just ci
git status --porcelain -uall
```

## 风险文件

- `SKILL.md`：description 长度与尖括号。
- `evals/evals.json`：正例断言与硬门新语义必须一起改，否则自相矛盾。
- `scripts/write_review_report.py`：Windows stdin 编码；路径逃逸。

## 回滚点

步骤 1 失败：删除 helper 与测试。步骤 2 失败：删除新 references，还原 finding-contract。步骤 3 失败：还原 SKILL / evals / interface。已写入用户项目的报告文件不自动删除。
