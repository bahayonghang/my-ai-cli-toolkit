# Design：academic-figure 1.3.0 整体设计

本文件记录跨子任务的边界与契约。子任务的细节设计写在各自的 `design.md`。

## 1. 任务树与文件归属

| 子任务                     | 交付物                                    | 独占修改的文件                                                                                                                                                                                                                                                                            |
| -------------------------- | ----------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `09-24-af-defect-fixes`    | 缺陷修复、许可证记录                      | `references/attribution.md`、`design-theory.md`、`panel-layout-patterns.md`、`matplotlib-recipes.md`、`plotly-recipes.md`、`qa-checklist.md`、`layout-defaults.md`、`journal-specs.md`、`visual-review.md`、`viz-pitfalls.md`、现有 9 个风格脚本、`visual_qa.py`、`modes/*.md` 中的缺陷行 |
| `09-24-af-figstyle-module` | `scripts/figstyle.py` 与测试              | `scripts/figstyle.py`、`tests/figstyle.test.mjs`                                                                                                                                                                                                                                          |
| `09-24-af-f4p-port`        | 24 个移植脚本、原图、风格文档、展示级路由 | `scripts/figures4papers/**`、`assets/originals/figures4papers/**`、`references/styles/f4p_*.md`、`modes/from-data.md` 的目录表与展示级分支、`modes/from-image.md` 的目录匹配表、`tests/f4p-scripts.test.mjs`                                                                      |
| `09-24-af-recipes-evals`   | 新 recipe、evals、trigger 用例            | `references/chart-recipes.md`、`evals/evals.json`、`evals/trigger_cases.json`                                                                                                                                                                                                             |
| 父任务                     | README、路由、版本、生成文档             | `README.md`、`SKILL.md`、`agents/interface.yaml`、`skills/academic-research-tools/AGENTS.md`、`docs/` 生成页                                                                                                                                                                              |

同一文件只归一个任务。子任务需要改动他人独占的文件时，在自己的 `implement.md`
中写明，并在该文件所属任务提交之后再改。

## 2. 执行顺序

1. `af-defect-fixes`：先修正共享参考文件，后续任务在修正后的文本上追加内容。
2. `af-figstyle-module`：无前置依赖，可与第 1 步并行。
3. `af-f4p-port`：在第 1 步提交后开始，因为它追加 `attribution.md` 的移植记录。
4. `af-recipes-evals`：在第 2 步提交后开始，因为新 recipe 调用 `figstyle` 的函数。
5. 父任务集成：README、`SKILL.md`、`interface.yaml`、`AGENTS.md`、版本号、
   `just docs-sync`、`just ci`。

## 3. 许可证边界

- figures4papers 内容为 CC BY-NC 4.0，本仓库根目录为 MIT。移植内容集中放在
  `scripts/figures4papers/` 与 `assets/originals/figures4papers/`，便于识别。
- 出处记录位置：README 致谢节（用户要求），以及 `attribution.md` 的移植记录表
  （来源路径、快照 `3c181f8`、改动说明）。CC BY 要求标明改动，移植记录表承担该项。
- `figstyle.py` 与新 recipe 为本仓库原创代码，参考 figures4papers 的设计事实。

## 4. 移植脚本契约（与现有 9 个风格脚本一致）

- 第一个位置参数为输出路径；缺省时写到当前目录，文件名固定。
- 在导入 `pyplot` 之前选择 `Agg` 后端。
- 保留上游 `figsize`、`ylim`、配色与字号，不套用期刊默认值（spec「Plotting
  layout defaults」：目录复现脚本保留源图参数）。
- 字体使用回退链 `["Helvetica", "Arial", "DejaVu Sans"]`，不单写 `helvetica`。
- 需要 LaTeX 的脚本检测 `latex` 是否可用；不可用时改用 mathtext 等价标签，
  图中不得出现未解析的 TeX 命令。
- 可选依赖（scipy、seaborn、dateutil）在风格文档中声明；测试在缺少依赖时跳过该脚本，
  并输出跳过原因。
- 上游已知错误（`research/figures4papers-catalog.md` 推荐 9）在移植时修正，并写入
  移植记录表。

## 5. 展示级路由

figures4papers 图为海报与幻灯片尺寸（字号 24 pt、线宽 3）。不新增第五个模式。
`modes/from-data.md` 增加「展示级分支」：用户要求海报、幻灯片或 README 图，没有期刊
目标，也没有指定目录风格时，按图型选最接近的 figures4papers 目录风格，并使用
`figstyle` 的 display 预设。输出契约沿用 from-data（matplotlib 脚本 + 300 dpi PNG），
另加同名 PDF。期刊目标仍优先（现有冲突规则 1）。父任务在集成时把该分支写入
`SKILL.md` 的模式表。

## 6. 回滚

每个子任务单独提交。回滚某个子任务时，按提交逆序 `git revert`；父任务集成提交
最后生成，回滚时最先撤销。
