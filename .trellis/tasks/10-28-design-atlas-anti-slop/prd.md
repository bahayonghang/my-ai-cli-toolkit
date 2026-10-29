# Anti-AI-slop 门禁

父任务：`10-28-design-atlas-upgrade`。依赖：`10-28-design-atlas-rename` 已完成。与 themes/routing 子任务没有代码依赖；`SKILL.md`、`README.md`、`evals/evals.json` 的最终合并由父任务完成。契约见父任务 `design.md` §6、§7。

## Goal

让按 design-atlas 实施的 UI 不带“AI 生成感”：有成文规则，有能跑的静态检查，有 DESIGN.md 级别的豁免记录，实施后有一次新鲜视角复核。另外提供一个只出报告的 audit 分支，用于检查已有页面。

## Requirements

- **`references/anti-slop.md`**（从 hallmark `gates.md`、SKILL.md Floor 语义移植并改写，不逐字复制）：
  1. 分级规则（Floor / House / Reflex / Finish），以及每级能否豁免、如何豁免。
  2. Gate 表：保留 hallmark 编号。列出 id、tier、class（M = 脚本检查 / J = agent 判断）、征兆、修法；只收录本 skill 采纳的 gate。
  3. 声明材质自动豁免规则（父 design §6），并给出例子。
  4. DESIGN.md 中 `## Anti-slop Waivers` 的语法和校验规则（reason ≥ 24 字符且与本页相关；Floor 不可豁免）。
  5. J 类判断清单，供 agent 在检查步骤逐项回答，至少包括：8 模板页、9 节奏单调、46a 编造数据、54 eyebrow 的语义判断、58 屏幕字数、69 事实重复、70 假提交、84 假产品截图、85 结尾邮件订阅。
  6. 不编造原则：数字、引言、logo 没有提供就不出现；图片缺失时留可替换的占位。
- **`references/review-prompt.md`**：新鲜上下文复核提示，合并 hallmark `review-hero.md` 与 `review-finish.md` 的思路。输入为截图路径、DESIGN.md、页面文件；输出首词为 `ship` / `fix` / `rebuild` 之一，后接最多 5 条具体问题。没有子代理时，说明按此提示自检，并在报告中标注“自检，非独立复核”。
- **`scripts/slop_check.mjs`**（Node ≥ 20，零依赖，文件头注明移植自 hallmark sloplint，MIT，commit `8f6969f8`）：
  - 输入：文件或目录（递归，跳过 node_modules、dist、build、coverage 和点开头的目录）；读取 .css、.html、.jsx、.tsx、.vue、.svelte、.astro，包括 Tailwind class 字符串和 `cn`/`clsx`/`cva` 调用。
  - 参数：`--design <path>`，默认在第一个输入路径向上查找最近的 DESIGN.md；`--scope page|component|app`；`--json`。
  - token 层识别与命名无关（父 design §6）。
  - 至少实现以下静态 gate：
    - Floor：`7a 10a 15 26a 27 28a 33 34 38i 39a 48 50 53 55a 62`
    - House：`2a 4 19 30a 47a 54 63 67`
    - Reflex：`1 2b 10b 12 26b 30b 37 47b 64 74`
    - 每个 gate 的移植取舍记录在 design.md。
  - 读取 DESIGN.md，处理声明材质豁免和手写豁免。对 Floor 的豁免会被拒绝，并且该 gate 照常报错。
  - 输出等级：FAIL、REFLEX、WAIVED、WARN、NOTE。文本格式为每行 `<grade> <gate> <file>:<line> <message> → <fix>`，最后一行汇总。
  - exit：0 = 没有未处理的 FAIL/REFLEX；1 = 有；2 = 参数错误。
- **tier 表单一来源**：脚本内的 gate→tier 映射必须与 `anti-slop.md` 的 gate 表一致，由测试解析 md 表格后比对。
- **测试** `tests/slop_check.test.mjs` + `tests/fixtures/slop/`：
  - 从 hallmark fixtures 改编（MIT）：slopped 页、eyebrow pass/fail、tailwind pass/fail、豁免用例（改为 DESIGN.md 豁免）。
  - 每个实现的 gate 至少有 1 个触发用例和 1 个不触发用例。
  - 声明材质豁免（mono 主题与 64、Inter 字体与 1）。
  - 拒绝对 Floor 的豁免。
  - exit code 契约。
- **`references/implementation.md`**：在构建与验证步骤中加入：实施时遵守 Floor；实施后运行 slop_check，修到 0 FAIL，并处理每个 REFLEX（修复或在 DESIGN.md 中豁免）；逐项回答 J 清单；做新鲜上下文复核。
- **`design-system-core.md` §7 QA 清单**：加一行指向 anti-slop.md，不重复其内容。
- **SKILL.md 片段**（由父任务合并）：约 10 行的 “Anti-slop Floor” 摘要、检查步骤、`audit <path>` 分支。
- **evals**：一条 audit 用例（断言只出报告、不改文件、运行了 slop_check）；一条反例“帮我把这段产品文案去 AI 味” → 路由到 `write`。

## Acceptance Criteria

- [ ] `just node-test` 发现并通过 `slop_check.test.mjs`。
- [ ] slopped fixture：报告中至少 10 个不同 gate 为 FAIL；对应的干净 fixture 为 0 FAIL、0 REFLEX。
- [ ] 一个用 `apply theme:terminal` 生成 DESIGN.md、使用等宽标签的 fixture 页：64 报 `WAIVED (declared)`。
- [ ] DESIGN.md 中写 `waive 27 · …` 时，脚本报 waiver rejected，27 仍为 FAIL。
- [ ] tier 一致性测试通过。
- [ ] 脚本在 `skills/development-workflows/design-atlas` 自身目录上运行不会崩溃，可以有 finding，但必须正常结束。
- [ ] `anti-slop.md` 中每个 M 类 gate 都在脚本中实现，每个 J 类 gate 都在判断清单中出现。
