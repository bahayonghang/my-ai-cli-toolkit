# 技术设计：Trellis 规划审阅 skill

## 交付清单

| 路径（相对 `skills/development-workflows/trellis-plan-review/`） | 内容                                                    | 对应 AC     |
| ---------------------------------------------------------------- | ------------------------------------------------------- | ----------- |
| `SKILL.md`                                                       | 路由 frontmatter、硬门、pass 索引、输出契约摘要、资源图 | AC1 AC2 AC7 |
| `references/review-passes.md`                                    | 八个 pass 的判据、触发条件、案例例子                    | AC2 AC3     |
| `references/claim-verification.md`                               | 断言分类与逐类取证规则                                  | AC2         |
| `references/finding-contract.md`                                 | 结论行、问题字段、未能核实、可靠部分、反通胀、盲区声明  | AC6         |
| `references/trellis-artifact-map.md`                             | 各产物的语义与必需小节，审阅入口的定位方法              | AC2         |
| `references/case-study-font-picker.md`                           | 七类问题的原始形态与严重度标定                          | AC2         |
| `scripts/plan_precheck.py`                                       | 机械预检，输出 JSON                                     | AC4 AC5     |
| `evals/evals.json`                                               | 触发与行为回归用例，含近邻路由否定                      | AC8         |
| `agents/interface.yaml`                                          | `display_name` / `short_description` / `default_prompt` | —           |

不新增类别目录，不改动其他 skill。`docs/` 目录由 `just docs-sync` 再生成，不手写。

## 审阅方法：八个 pass

分两层。Pass 0 由脚本判定，失败先报出；Pass 1–7 由模型判定，每个 pass 只回答一个问题。

### Pass 0 · 机械预检（脚本）

见「脚本契约」。四类检查：产物存在性、模板占位残留、`path:line` 引用解析、`R\d+` / `AC\d+` 交叉引用。

### Pass 1 · 代码断言核对

规划正文中每条关于仓库的陈述都是一条待核断言。按断言类型取证（`claim-verification.md`）：
存在性断言用 Glob / Grep 确认；行为断言必须读到实现；标识符断言逐字符比对；数量断言重新计数。

案例：font-picker 规划 15 处以上 `path:line` 引用全部正确，这是应当在「可靠部分」里说明的结果。

### Pass 2 · 事实与推论分离

Trellis PRD 有 `Confirmed facts` 小节。把每条拆成**观察**与**推论**，分别核实。

对形如「因此 X 不受影响」「因此不会滞后」的推论，做反向枚举：列出被改动或被移除的那条代码路径
实际更新了哪些状态，再逐个问它们是否在被审页面可见。不要只核对文档点名的那几项。

案例：font-picker 的观察「设置页只有连接徽标由 overview 驱动」为真；推论「因此跳过推送不会让
任何可见内容滞后」为假——「采集器」字段由 `refreshLivePage()` 内的 tray 拉取驱动，不经过 overview。

### Pass 3 · AC 子句到需求与机制的追溯

把每条 AC 按分句拆成子句。每个子句要同时找到：一条需求（R 编号）、design.md 中的一处机制。
两者缺任一即为问题。子句级是必要的：AC 级检查会把「一半有机制一半没有」判为已覆盖。

案例：AC2 的「`.workspace` 滚动位置」有 R3 与机制，「字体列表滚动位置」两者都没有；
AC3 的「插入符位置」有机制，「输入法组合不被打断」没有。

### Pass 4 · 量化论证复核

design.md 里的每个算式重算一遍，并核对单位来源：涉及 `rem` / `em` / 百分比时确认根值是否可变；
涉及盒模型尺寸时确认 `box-sizing`；涉及超时与重试时确认时钟单位。
同时判断结论是否真由该算式支撑，还是由另一个未被提及的机制支撑。

案例：`0.35rem×2 + 40px + 0.3rem + 14rem ≈ 274px` 对比 `18rem（288px）`。
`* { box-sizing: border-box }` 使实际预算为 274.8px；`html { font-size: var(--ui-font-size) }`
使 `rem` 在 14 / 16 / 18px 三档间变化；算式自身的和是 280px。结论成立的真实原因是列表作为
flex 项带 `overflow: auto`，自动最小尺寸为 0，预算不足时收缩而非溢出。

### Pass 5 · 内部矛盾

四处两两比对：需求条目 vs `Out of scope`；需求条目 vs `Key decisions`；
需求条目 vs design.md 的「已考虑不做」；design.md 的改动清单 vs implement.md 的步骤清单。

案例：R1 的「滚轮在列表上滚动时不带动 `.workspace`」被 design.md 明确不加
`overscroll-behavior: contain` 直接否决，且无 AC 覆盖。

### Pass 6 · 判据确定性

每条 AC 判断是否给定前置条件后有唯一的通过 / 不通过结果。标出依赖以下条件而未写明前置条件的判据：
滚动位置、窗口尺寸、时序与等待时长、外部服务状态、人工目视印象。

案例：AC1 的「面板底边不超出设置卡片可视区」——面板是 `position: absolute` 且无翻转逻辑，
底边位置取决于验收时触发按钮所在的滚动位置。

### Pass 7 · 实现漂移（仅当任务状态不是 `planning`）

触发条件：`task.json` 的 `status` 为 `in_progress`、`review`、`done` 或任务已归档。

数据来源：design.md 的改动清单为计划侧；只读 git 检查为实际侧
（`git status --porcelain -uall`、`git diff --stat`、`git diff -- <path>`，
已提交的用 `git log --oneline` 定位后 `git show --stat`）。

三类输出：计划清单外被改动的文件；计划未提及的机制（例如新增的属性、字段、调用点）；
被改动但不在任何 AC 覆盖范围内的行为。计划外改动本身不是缺陷，未申报是缺陷。

案例：实现阶段新增了 `data-report-scroll="font-picker-list"` 与两处 `refreshLivePage()`，
三者都不在 design.md 改动清单内，其中两处是为了补 PRD 事实错误留下的行为回退。

## 脚本契约

```
python "<skill-dir>/scripts/plan_precheck.py" <task-dir> [--repo-root <path>] [--output <json-path>]
```

- `<task-dir>`：`.trellis/tasks/<task>/` 目录。`--repo-root` 缺省时向上查找含 `.trellis` 的祖先目录。
- 所有文件读取显式 `encoding="utf-8"`；`--output` 由脚本用 `encoding="utf-8", newline="\n"` 写出。
  不提供 `--output` 时只把 JSON 打到 stdout，供人眼看，不作为下游输入。
- 退出码：`0` 无阻断项；`1` 有阻断项（缺产物、引用不可解析、占位残留）；`2` 参数或路径错误。

四类检查与输出字段：

| 检查         | 输出字段       | 判定                                                                          |
| ------------ | -------------- | ----------------------------------------------------------------------------- |
| 产物存在性   | `artifacts`    | `prd.md` 缺失为阻断；`design.md` / `implement.md` 缺失记为 `lightweight` 提示 |
| 模板占位残留 | `placeholders` | `*.jsonl` 的 `_example` 行、`TBD`、`TODO`、`[PLACEHOLDER]`、`待补`            |
| 引用解析     | `citations`    | 抽取 `path:line` 与 `path:line-line`，报文件不存在、行号越界                  |
| 编号交叉引用 | `identifiers`  | `R\d+` / `AC\d+` 的定义集与引用集之差                                         |

引用抽取用正则匹配「反引号内或裸露的 `路径:行号`」形状，路径需含 `/` 或已知扩展名，
避免把 `styles.css:1808` 之外的 `10:30` 之类时间串误判。解析结果分
`resolved` / `missing_file` / `line_out_of_range` / `unresolvable`，最后一类不计入阻断。

脚本只做能被字符串与文件系统判定的事。断言真伪、机制是否存在、算式是否正确都不在脚本内。

## 输出契约

`finding-contract.md` 固定四段：

1. 结论行：`可执行` / `可执行但需修订` / `需返回规划`。取值规则写在该文件里。
2. 问题清单：编号 `TPR-01`…，字段为严重度、位置（产物:行）、证据（仓库 `path:line` 或命令输出）、
   影响、建议动作。严重度三档：阻断 / 应修 / 提示。
3. 未能核实清单：本地无法判定的断言，注明为什么无法判定。
4. 可靠部分清单：核对通过且值得保留的做法。

反通胀规则：无证据条目不进问题清单；不为凑数造问题；规划没问题时问题清单可以为空。
盲区声明：审阅者与规划作者共享大部分盲区，清单是待分诊输入，不是批准。

## 硬门

- 不写 `prd.md` / `design.md` / `implement.md` / `*.jsonl` / `task.json`。
- 不改代码。
- 不执行 `task.py start` / `task.py finish` 或任何写状态的 Trellis 命令。
- `allowed-tools` 不含 `Write` / `Edit`；git 只授权 `git diff` / `git log` / `git show` /
  `git status` 四种形状，不用 `Bash(git *)`。

## 路由边界

- 本 skill：审阅 `.trellis/tasks/<task>/` 的规划产物。
- 纯代码 diff 审查 → `code-auditor`（全维度）或 `code-quality-review`（可维护性单一视角）。
- 任务诊断与未知项梳理 → `unknowns-first`，不在本 skill。
- 写规划、修规划、执行任务 → 项目自身的 Trellis 规划与执行流程，不由本 skill 承担。

## 兼容性

- 不改 `.trellis/` 下任何文件（本任务目录除外）。
- 不改其他 skill；不新增类别；不新增 Python / Node 依赖。
- `SKILL.md` frontmatter 新增会影响 `docs/` 目录，用 `just docs-sync` 再生成后提交。

## 回滚

三段互不依赖：

1. 脚本 —— 删除 `scripts/` 后其余 pass 仍可人工执行。
2. references —— 删除后 `SKILL.md` 失去判据细节，路由仍有效。
3. 整个 skill 目录 —— 删除目录并重跑 `just docs-sync`。

## 已考虑不做

- 给 skill 授予 `Write` 以便落盘审阅报告：会削弱「不改写被审对象」这道硬门。脚本自带 `--output`
  已覆盖机械结果的落盘需求。
- 用 subagent 并行跑各 pass：本仓库其他审阅 skill 都是单 agent 顺序执行，且并行会让证据行号在
  不同 agent 间不一致。先行研究里的 `validate-implementation-plan` 采用编排式多 subagent，
  本次只采用它的「先抽需求基线再逐项审」的顺序，不采用它的编排结构。
- 自动改写被审规划或生成修订版：先行研究中多个同类 skill 明确禁止改写，理由一致——改写会产生
  一份带新盲区的规划。本 skill 只报不改。
- 在脚本里判断断言真伪：需要读代码语义，超出字符串与文件系统能判定的范围。
