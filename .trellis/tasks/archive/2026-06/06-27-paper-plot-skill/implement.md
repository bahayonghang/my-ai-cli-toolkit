# Implement — paper-plot skill

执行顺序与校验门。每步完成后勾选；遇 PRD 缺陷回 Plan。

## Step 0 — 前置确认

- [ ] 确认工作树无其它未提交 WIP（`docs-sync` 会重写 docs/）。
- [ ] 确认 matplotlib/numpy/PIL 是否可用（决定 Step 5 是「真跑」还是「降级为 py_compile + 人工核对」）。
- verify: `python -c "import matplotlib,numpy,PIL"` 退出码记录在案。

## Step 1 — 骨架与素材搬运

- [ ] 建目录 `skills/research-learning-knowledge/paper-plot/{references/modes,references/styles,scripts,assets/originals,evals}`。
- [ ] 复制 8 风格文档 → `references/styles/`；`reproduction_guide.md` → `references/`。
- [ ] 复制 9 脚本 → `scripts/`；10 张 `originals/*.png` → `assets/originals/`。
- [ ] 不复制 `repro/`、`agents/openai.yaml`、根 `README.md`。
- verify: `ls -R skills/research-learning-knowledge/paper-plot` 结构与 design §1 一致；无 vendor 文件。

## Step 2 — SKILL.md（精简路由 + 合规 frontmatter）

- [ ] 写 frontmatter（name/description/category/tags/version，见 design §2）。
- [ ] body：两 mode 说明 + 8 风格速查表 + 脚本运行约定（`<skill-dir>`、`python`、`PYTHONUTF8=1`）。
- verify: `python scripts/check.py`（或 `just skills-check`）对该 skill 通过、无未知键告警。

## Step 3 — modes 文档迁移

- [ ] `references/modes/from-data.md`：迁 plot-from-data workflow + 数据替换规则，去 frontmatter。
- [ ] `references/modes/from-image.md`：迁 plot-from-image workflow + 累积经验。
- [ ] 修所有跨 skill 引用：`../plot-from-data/references/<n>.md` → `../styles/<n>.md`；
      `../plot-from-data/scripts/` → `../../scripts/`；`python3` → `python`。
- verify: `grep -rn "plot-from-data\|plot-from-image\|\$SKILL_DIR\|python3" skills/research-learning-knowledge/paper-plot/references` 无残留。

## Step 4 — 风格文档与脚本路径/可移植性修复

- [ ] `references/styles/*.md`：脚本引用对齐 `<skill-dir>/scripts/...`（原 `repro/xx.py`）。
- [ ] 9 个脚本：输出路径参数化（`sys.argv[1]` 默认名落 cwd），不动绘图逻辑。
- [ ] 按需为读外部资源的脚本加 `Path(__file__).parent` 锚定（多数内嵌数据无需）。
- verify: `grep -rn "_repro.png'\)\|python3" skills/.../paper-plot/scripts` 确认输出已参数化。

## Step 5 — 脚本抽样运行（可移植性实证）

- [ ] 若环境可用：在临时目录跑 1 个 from-data 脚本 + from-image 示例脚本：
      `python <skill-dir>/scripts/bar_spice.py out1.png` 等，确认生成 dpi=300 PNG。
- [ ] 若环境不可用：降级为 `just python-check` 全绿 + 人工核对逻辑等价，并在 retro 注明降级原因。
- verify: 生成的 PNG 存在且非空；或 py_compile 全绿 + 降级说明。

## Step 6 — evals

- [ ] 写 `evals/evals.json`（git-commit schema）：from-data / from-image 各 ≥1 正例 +
      ≥2 路由反例（→ literature-mentor / paper-workbench）。
- verify: JSON 合法（`python -c "import json,sys;json.load(open(...))"`）；含 ≥2 反例。

## Step 7 — 全量校验与文档同步

- [ ] `just python-check` 通过。
- [ ] `just skills-check` 通过。
- [ ] `just docs-sync`（结构变更后），再 `just ci` 干净通过（含 docs-check、node-test、git diff --check）。
- verify: `just ci` 退出码 0。

## Step 8 — 收尾

- [ ] 对照 prd.md 验收清单逐条确认。
- [ ] 更新 spec（如有可复用约定）→ 提交（Conventional Commits，scope `feat(skills):`）。

## Rollback points

- Step 1–6 出问题：删除 `skills/research-learning-knowledge/paper-plot/` 重来。
- Step 7 docs-sync 后回滚：删目录后重跑 `docs-sync` 还原 docs/。
