# research-learning-knowledge: 新增 AGENTS.md 护栏并统一 evals 约定

- Date: 2026-06-20
- Status: Planning
- Parent: `.trellis/tasks/06-20-rlk-skills-optimization`
- 覆盖发现: F5（P1 缺护栏）、F7（P2 evals 不一致）

## Goal

补齐本品类的工程护栏与一致性：新增 `skills/research-learning-knowledge/AGENTS.md`（对齐另
三个品类），并统一 4 个 skill 的 eval 约定。F5 是 F1 类问题的**系统性根因**——本品类缺少
那条"不要用 `$SKILL_DIR`"的护栏，所以 paper-workbench 才会踩坑。

## Confirmed Facts

- F5：另 3 个品类均有 AGENTS.md：`developer-tools-integrations/AGENTS.md`（6.5K）、
  `development-workflows/AGENTS.md`（6.6K）、`git-github-collaboration/AGENTS.md`（3.6K）；
  `research-learning-knowledge/` **无** AGENTS.md。
- 这些 AGENTS.md 覆盖：`<skill-dir>` 脚本路径解析约定、禁用裸 `$SKILL_DIR`、frontmatter
  字段要求、eval 约定等。`development-workflows/AGENTS.md:16` 还点名 code-auditor 为路径解析范例。
- F7 evals 现状（3 套约定、2 种 schema、0 接 CI）：
  - `paper-workbench/evals/evals.json` → 对象 `{skill_name, evals:[{id,prompt,expected_output,files}]}`。
  - `roundtable/test-prompts.json`、`deep-research-pro/test-prompts.json` → 数组 `[{id,prompt,expected}]`。
  - `literature-mentor` → **无任何 eval**。
  - `just node-test` 只发现并运行 `skills/**/tests/*.mjs`；`paper-workbench/tests/test_normalize_paper.py`
    （pytest）**不被 `just ci` 执行**，`just python-check` 仅做 `py_compile`。

## Requirements

1. 新增 `skills/research-learning-knowledge/AGENTS.md`，对齐另三个品类的结构与口径，至少覆盖：
   - 脚本路径用 `<skill-dir>` 字面占位符，禁用裸 `$SKILL_DIR`（明确指向 F1 教训）；
   - frontmatter 五字段（`name`/`description`/`category`/`tags`/`version`）与目录品类对齐；
   - 本品类的 eval 约定（见下条）；
   - 指向范例 skill（如 paper-workbench 的 references/modes 分层、code-auditor 的路径解析）。
2. 选定**单一** eval 约定并在 AGENTS.md 写明（实现时定，见 Open Questions），把 4 个 skill 收敛到同一约定：
   - 统一文件位置与文件名（`test-prompts.json` 或 `evals/evals.json` 二选一）；
   - 统一字段 schema（`expected` vs `expected_output`+`files` 二选一）。
3. 为 `literature-mentor` 补一份覆盖三种模式（快速筛选 / 导师深读 / 研究复盘）的触发 eval，
   领域示例与其改造后定位（CS/DL/自动化）一致——与 `06-20-litmentor-redomain` 协调，避免领域口径冲突。
4. 对"pytest 是否接入 CI"给出明确决策并落到 AGENTS.md：要么在 `justfile` 增加发现 `tests/*.py`
   的目标并纳入 `just ci`，要么显式声明这些 pytest 为本地可选、不进 CI，并说明理由。

## Acceptance Criteria

- [ ] `skills/research-learning-knowledge/AGENTS.md` 存在，且含禁用 `$SKILL_DIR` / 使用 `<skill-dir>` 的明确条目。
- [ ] 4 个 skill 的 eval 文件名/位置/字段 schema 一致，符合 AGENTS.md 写明的单一约定。
- [ ] `literature-mentor` 具备至少 3 条触发 eval（对应三种模式），领域示例为 CS/DL/自动化。
- [ ] AGENTS.md 记录了 pytest-in-CI 的明确决策（接入或显式排除 + 理由）。
- [ ] `just ci` 通过；若选择接入 pytest，则 `just ci` 实际执行到 `paper-workbench/tests/`。
- [ ] `python scripts/check.py skills/research-learning-knowledge` 仍全部 `[OK]`。

## Out Of Scope

- 重写各 skill 的正文内容（仅碰 eval 文件与新增 AGENTS.md）。
- literature-mentor 的领域改造本体——属 `06-20-litmentor-redomain`（本任务只补它的 eval）。

## Open Questions

- eval 约定选 `test-prompts.json`（当前多数派 2:1，结构简单）还是 `evals/evals.json`
  （结构更规范、含 files 字段）？默认倾向 `test-prompts.json` 收敛，降低迁移成本；若希望未来
  接 eval runner，则统一到 `evals/evals.json` 更有扩展性。
- pytest 接 CI 还是显式排除？默认倾向"接入 `just ci`"，让 paper-workbench 既有的 271 行测试发挥价值。
