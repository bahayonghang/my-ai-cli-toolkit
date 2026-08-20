# 执行计划：Trellis 规划审阅 skill

## 顺序

四步。步骤 1 建立可路由的最小 skill，步骤 2 补判据，步骤 3 补脚本，步骤 4 收尾验证。
每步单独可回退。

### 步骤 1：骨架与路由（R1 / R6 / R8 / AC1 / AC7）

- 建目录 `skills/development-workflows/trellis-plan-review/`。
- 写 `SKILL.md`：frontmatter（`name` `description` `category` `tags` `version`
  `argument-hint` `allowed-tools`）+ 硬门 + pass 索引 + 输出契约摘要 + 资源图。
  - `description` 含中英文触发语与非触发语，无尖括号，不超过 1024 字符。
  - `allowed-tools` 为逗号分隔字符串：`Read, Glob, Grep, Bash(python *), Bash(py -3 *),
Bash(git diff *), Bash(git log *), Bash(git show *), Bash(git status *)`。
    不含 `Write` / `Edit`，不含 `Bash(git *)`。
  - 脚本命令一律写成 `python "<skill-dir>/scripts/plan_precheck.py" ...`，并在首次出现处
    加一行占位符替换说明；给出 Windows `py -3` 备选。
- 写 `agents/interface.yaml`：`display_name` / `short_description` / `default_prompt`。

验证：`just skills-check`。

### 步骤 2：判据 references（R2 / R3 / R5 / R7 / AC2 / AC3 / AC6）

- `references/trellis-artifact-map.md` — 各产物语义、必需小节、审阅入口定位（含任务目录不在
  当前仓库时的查找方式）。
- `references/review-passes.md` — Pass 0–7 逐个写触发条件、判据、输出、案例例子。
  Pass 3 明确子句级拆分；Pass 7 明确触发条件与只读 git 数据来源。
- `references/claim-verification.md` — 存在性 / 行为 / 标识符 / 数量四类断言的取证规则。
- `references/finding-contract.md` — 结论行取值规则、问题条目字段、严重度三档、
  未能核实清单、可靠部分清单、反通胀规则、盲区声明。
- `references/case-study-font-picker.md` — 七类问题的原始形态、证据、严重度标定。

验证：人工核对 AC2 的「每个 pass 有判据与至少一个案例例子」。

### 步骤 3：机械预检脚本（R4 / AC4 / AC5）

- `scripts/plan_precheck.py`，参数与退出码按 design.md 的脚本契约。
- 所有读取显式 `encoding="utf-8"`；`--output` 由脚本用 `encoding="utf-8", newline="\n"` 写出。
- 四类检查：产物存在性、模板占位残留、引用解析、`R\d+` / `AC\d+` 交叉引用。
- 实测目标：`D:/Documents/Code/Github/clash-verge-ai-residential/.trellis/tasks/archive/`
  下已归档的 `08-20-settings-font-picker-repaint`（若归档路径变动则按 `--repo-root` 指定后重找）。
  预期报出该任务两个 `*.jsonl` 的 `_example` 占位行，并解析出其 `path:line` 引用与 R / AC 编号。

验证：`just python-check`；对 font-picker 任务目录实跑一次并记录输出。

### 步骤 4：evals 与收尾（R8 / R9 / AC8 / AC9）

- `evals/evals.json`，schema 为 `{ skill_name, evals: [ { id, prompt, expected_output, files,
assertions } ] }`。用例覆盖：中文审阅请求、英文审阅请求、已实现任务触发 Pass 7、
  轻量 PRD-only 任务不误报缺产物，以及两条近邻路由否定：
  - 纯 diff 审查请求 → 应交 `code-auditor` / `code-quality-review`。
  - 要求写或修规划 → 不属本 skill。
- `just docs-sync` 再生成 `docs/` 目录页。
- `just ci`。

验证：`just ci` 通过；`git status --porcelain -uall` 的改动范围符合 AC9。

## 验证命令

```bash
just skills-check
just python-check
just node-test
just docs-sync
just ci
git status --porcelain -uall
```

脚本实测：

```bash
python "skills/development-workflows/trellis-plan-review/scripts/plan_precheck.py" \
  "D:/Documents/Code/Github/clash-verge-ai-residential/.trellis/tasks/archive/2026-08/08-20-settings-font-picker-repaint"
```

## 手工验收

1. 按 AC2 逐个 pass 核对判据与案例例子是否都在。
2. 按 AC6 核对输出契约四段是否都在。
3. 按 AC7 核对 `allowed-tools` 字面值。
4. 用本任务自身的 `prd.md` / `design.md` / `implement.md` 跑一遍脚本，确认无阻断项。

## 回滚点

- 步骤 1 后：删除 skill 目录并重跑 `just docs-sync`。
- 步骤 2 后：删除 `references/`，`SKILL.md` 路由仍有效。
- 步骤 3 后：删除 `scripts/`，Pass 0 退化为人工检查。
- 步骤 4 后：`evals/` 与 `docs/` 再生成文件可单独回退。

## 审查门

- 步骤 1 完成、`just skills-check` 通过后停一次，向用户报告 `description` 与 `allowed-tools`
  的最终取值，再进步骤 2。
- 步骤 3 完成、脚本实测输出拿到后停一次，报告实测结果，再进步骤 4。
- `just ci` 通过后停一次，等用户完成手工验收，再进 Phase 3 提交。
