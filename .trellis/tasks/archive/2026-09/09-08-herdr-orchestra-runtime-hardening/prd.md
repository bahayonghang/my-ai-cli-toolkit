# herdr-orchestra 运行时路由与检测恢复

## Goal

让 `herdr-orchestra` 在接到「调用某 kind 查询/执行」时，先选对 Herdr surface，并在 `agent start` 未登记 identity 时给出可核验的 incomplete receipt。调用者不再把 60s 超时、未登记 TUI、第二次 pane 和 CLI 输出混成一次成功编排。

用户价值：同类请求在 Herdr 内一次走对路径；失败时身份、lifecycle 与结果分开，且不扩大权限。

## Confirmed facts

- 包路径：`skills/developer-tools-integrations/herdr-orchestra/`，version `0.1.0`。归档创建任务：`09-08-herdr-orchestra-skill`。
- 根 `SKILL.md` Compact Workflow 第 3 步默认 `agent start`；`references/delegation.md` 第 28 行已规定 one-shot `exec`/`review` 与普通程序走 pane surface，不得用 agent lifecycle 代替退出状态。
- 2026-09-08 实操：`/herdr-orchestra` 查询 omp 谷歌模型。`w4:p3` 上 `agent start --kind omp --timeout 60000` 超时，name `omp_google_models` 未登记；TUI 仍在，pane `unknown`。随后另开 `w4:p4` 跑 `omp models` 得到目录。完整过程见 `research/incident-2026-09-08-omp-google-models.md`。
- 现有 evals 覆盖环境门禁、caller/focus、blocked/timeout/unknown、禁止 raw pane 输入、禁止静默换 transport（H01、H07、H08）。不覆盖：start 前 surface 分类、start 超时后进程仍在、wait-output 标记与命令行撞车。
- qiaomu 泛化：omp/`bun.exe`/谷歌模型表不得升为核心规则。可升级的是 surface 选择、未登记 identity、同一 worker 检查、完成标记不得出现在命令文本。
- 仓库约定：不为本包补 README/manifest 去迎合 qiaomu schema。mode 维持 in-repo Production。不发布。生成文档 `docs/skills/developer-tools-integrations/herdr-orchestra.md` 含 `版本` 字段，frontmatter version 变更必须 `just docs-sync`。
- 2026-09-08 用户选定选项 1：交互路径 start 超时且 identity 未登记时，只允许同一 pane 检查 + incomplete；不允许 CLI 回退、raw 输入或 `report-agent` 冒充。

## Requirements

- R1：根 Compact Workflow 在 split/start 之前选择 surface。验收可由 kind 原生非交互命令满足时，走 pane surface（`pane run` + 退出状态/输出）。需要交互 Agent 时才 `agent start` + `agent prompt`。两种路径都写进根流程，不再把 pane 例外只留在 reference。
- R2：pane-surface 任务仍遵守 caller、cwd、`--no-focus`、确认可用 shell、返回 pane ID。完成证据是命令退出后的输出，不是 agent idle/done。
- R3：`agent start` 超时或 not-ready 时，检查本任务创建的 pane：进程、visible/detection、integration status、name 是否仍在。进程在而 name 不在，仍算该 worker 的启动失败，不是空 shell。
- R4：Herdr 未登记预期 kind identity 时：不得 `agent prompt`；不得 raw pane 输入把 assignment 打进 TUI；不得 `pane report-agent` 冒充集成；不得另起第二个 pane/worker；不得在超时后再改用 kind CLI。receipt 分开写 timeout/unknown、可见 TUI 证据、incomplete。
- R5：pane `wait-output` 所用完成标记不得作为子串出现在已发送的命令文本中。
- R6：新增/更新 evals 与 output-eval，覆盖 R1–R5。omp 实例只作为 fixture。触发 description 不扩大到普通 pane 查询或非 Herdr 环境。
- R7：版本按行为变更递增到 `0.2.0`；`just skills-check` 与 `just docs-sync` 通过。不改官方 Herdr skill、不改本机 herdr 集成安装、不引入控制脚本或模型表。

## Acceptance Criteria

- [x] AC1（R1、R2）：给定「调用 omp 查询当前 Google/Gemini 模型」类输入，候选动作在 `agent start` 之前选择 pane surface，并使用 kind 原生非交互命令；不把 TUI start 当作该验收的必要步骤。
- [x] AC2（R3、R4）：给定 `agent start` timeout、TUI 可见、pane unknown、name 丢失，候选动作检查同一 pane，回 incomplete，不 prompt、不 raw 输入、不 `report-agent`、不自动第二 worker、不事后改跑 kind CLI。
- [x] AC3（R5）：给定完成标记出现在 `pane run` 命令字符串中，候选动作不把该次 wait 当作命令已结束。
- [x] AC4（R6、R7）：`evals/evals.json` 含上述三类案例；`reports/output-eval.md` 记录 source-guided 结果；frontmatter version 为 `0.2.0`；`just skills-check` 通过；docs catalog 版本已同步。

## Out of scope

- 修复 omp/Herdr 检测扩展、Windows named pipe 或 `hasUI` 行为。
- 安装或更新 `herdr integration install omp`。
- 允许自动 trust、扩大写权限、关闭非本任务 pane。
- 为 omp 维护 Google 模型清单。
- 重新做 prior-art 目录调研（本迭代收紧既有契约；若后续新增第三种 transport 再做）。
- 公开发布该 skill。
