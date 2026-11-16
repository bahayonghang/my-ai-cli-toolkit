# 统一 Trellis 父子任务计划审阅输出

## Goal

优化 `skills/development-workflows/trellis-plan-review/`：当一次审阅以 Trellis 父任务为根并覆盖其子任务时，把整个任务树视为一个原子审阅作用域，只生成一份合并 Markdown 报告和一条可复制的统一修订 Prompt；叶子任务审阅保持一份报告、一条 Prompt。继续保持只审不改、不启动任务的边界。

## Background

当前 skill 的入口、机械预检、报告模板和 handoff 都以单个 task 为单位：`skills/development-workflows/trellis-plan-review/SKILL.md:37-46` 只定位一个任务，`skills/development-workflows/trellis-plan-review/SKILL.md:50-60` 只预检一个目录，`skills/development-workflows/trellis-plan-review/SKILL.md:93-110` 按该目录 basename 落盘并返回一条 Prompt；`skills/development-workflows/trellis-plan-review/scripts/write_review_report.py:81-96` 也从单个 task basename 推导目标路径。

反例 `D:/Documents/Code/Rust/Exp/quanergy_client_rs/.trellis/reviews/` 中，一个父任务和两个子任务被写成三份报告。父报告 `08-26-intellectual-property-materials.md` 的第 22 行明确写着“关联子任务已另写报告”，同时父报告 TPR-01 与专利子报告 TPR-04 是同一根因，软著子报告也用“与父任务 TPR-03 同类”指向跨文件重复。这使审阅结论、问题编号和修订入口被拆散，最终需要多条 Prompt 才能覆盖同一任务树。

Qiaomu generalization gate 将该反例抽象为：**一次用户请求选定的审阅作用域，应对应一个原子、持久化的审阅交付物和一个 handoff；作用域内成员仍需逐任务标识和核验。** 该规则属于可复用的核心机制，不是把反例正文写进 skill。

## Confirmed facts

- 目标 skill 当前版本为 `0.3.0`，已有单任务预检、UTF-8/LF 原子写入、四段式报告、单条 handoff 和 Node 回归测试。
- Trellis 当前以 `task.json.children` 表示子任务目录名，`subtasks` 是 deprecated legacy field；归档子任务仍保留在父任务 `children` 中，因此树解析必须同时查找活动任务与 `archive/<YYYY-MM>/`。
- 父/子结构不是依赖图。跨子任务的执行顺序仍必须从规划产物核验，不能从树位置推断。
- `write_review_report.py` 每次调用只写一个文件；多文件反例来自审阅协议对父、子任务分别执行，而不是该 helper 单次调用写多份。
- `evals/evals.json` 是人工行为 fixture，`just ci` 不执行；可执行回归必须落在 `tests/*.mjs`。
- 本次不改变 skill 的用户意图或近邻路由边界，因此不需要为了此行为修复扩写 frontmatter 触发词。
- Qiaomu 先行检索与本地证据记录在 `research/tree-review-evidence.md`。Provider 实跑、人工盲审和真实跨仓库重放在规划阶段仍是 `missing evidence`。

## Requirements

- R1：单一审阅作用域。

- 给定根任务目录，审阅作用域包含根任务及其 `children` 递归闭包，按根优先、同层保持 `children` 声明顺序生成确定性成员列表。
- 叶子任务的作用域只有自身，保持现有单任务行为。
- `children` 是当前权威字段；仅当 `children` 字段不存在时才允许用 legacy `subtasks` 回退。两者同时非空且内容冲突时不得猜测成员集合。
- 子任务可位于活动目录或归档目录；同名命中多个位置、缺失成员、循环、重复边、跨仓库逃逸或 `parent` 回指不一致必须显式报告，不能静默漏审。

- R2：树级机械预检。

- 扩展 `plan_precheck.py`，保留现有单任务 CLI 兼容性，并提供显式的递归子任务模式。
- 树模式只产生一个聚合 JSON 结果：根任务、成员/边、每个成员的现有预检结果、聚合阻断项、各任务状态与统一报告目标；不得为每个子任务产生持久化预检文件。
- 任一成员存在机械阻断时，退出码保持 `1`；参数/路径错误保持 `2`；成功保持 `0`。

- R3：整树判断与跨任务去重。

- Pass 1–7 对每个成员按其自身状态和产物执行；Pass 5 同时核验父需求、子任务范围、跨子任务顺序和共享契约是否一致。
- 同一根因跨父、子任务出现时只产生一个 TPR，列出所有 affected tasks 与 locations；不得在父报告和子报告重复编号。
- 总结论与计数按整树合并结果计算：任一阻断使整体为“需返回规划”，否则沿用现有严重度规则。

- R4：一份合并报告。

- 每次树级审阅只调用一次 `write_review_report.py`，目标固定为 `.trellis/reviews/<root-task-name>.md`。
- 报告 frontmatter 和正文记录 root、`task_count`、有序成员/状态、聚合 verdict/counts；每条 finding 必须标识 owning/affected task，跨任务 location 使用明确的任务相对路径。
- 报告保留“结论、问题清单、未能核实、可靠部分、盲区”语义，并新增紧凑的“审阅范围”区段。
- 已存在的旧子任务报告不删除、不覆盖、不迁移；本次只约束后续一次审阅的产物数量。

- R5：一条统一 Prompt。

- 成功返回仍只有 verdict、合并报告路径和一个 `text` fence；不得按任务成员再输出 Prompt。
- handoff Prompt 指向合并报告与根任务，列出或要求从报告读取完整成员清单，并要求修订者按 TPR 的 task/location 更新所有受影响规划产物。
- Prompt 继续禁止实现、`task.py start/finish/archive`、扩大范围和修改审阅报告。

- R6：只读与兼容边界。

- 保持“不改规划、不改产品代码、不修复发现、不运行写状态 Trellis 命令”的硬门。
- 保持现有单任务报告路径、严重度词汇、TPR 字段、UTF-8/LF 原子写入、Git visibility note 与失败降级行为。
- 不新增依赖，不修改 Trellis 核心 `.trellis/workflow.md` 或 `task.py`。

- R7：包合同与版本。

- 同步更新 `SKILL.md`、`agents/interface.yaml`、相关 references、`plan_precheck.py`、tests 与 `evals/evals.json`；报告模板中的活动版本必须与 skill 版本一致。
- 行为扩展将版本提升为 `0.4.0`，运行 docs 同步和仓库原生验证。
- Qiaomu 证据使用本任务 `research/`，不为满足外部 schema 添加本仓库未采用的 `README.md` / `manifest.json` 仪式文件。

## Acceptance Criteria

- [ ] AC1（R1, R2）：fixture 含一个父任务、一个活动子任务和一个归档子任务；树模式输出根优先的 3 个唯一成员、2 条边、各成员状态和根报告路径，且只生成一个聚合结果。
- [ ] AC2（R1, R2）：缺失 child、活动/归档同名歧义、循环、重复边、parent 回指不一致和越出同一 `.trellis/tasks/` 的成员分别有确定性失败测试，失败不留下报告或临时残留。
- [ ] AC3（R3, R4）：基于反例同构 fixture 的行为/包合同断言证明一次父任务审阅只写 `.trellis/reviews/<parent>.md`，目录中没有新建 child report；同一跨任务根因只出现一个 TPR，且包含全部 affected tasks/locations。
- [ ] AC4（R4）：合并报告模板含审阅范围、根任务、成员状态、聚合 counts 和 task-qualified finding 字段；整体 verdict 严格取决于聚合严重度。
- [ ] AC5（R5）：新增 eval 明确断言父+子审阅只返回一个 report path 和一个 `text` fence；统一 Prompt 覆盖全部受影响任务，禁止每个子任务各出一条 Prompt。
- [ ] AC6（R6）：叶子任务 fixture 仍写 `.trellis/reviews/<leaf>.md`，现有 writer/precheck 测试与错误码保持通过；旧子任务报告不会被清理或覆盖。
- [ ] AC7（R7）：skill 与报告模板活动版本均为 `0.4.0`，`evals/evals.json` id 连续，接口默认 Prompt 与根合同一致。
- [ ] AC8（R7）：目标 Node 测试、`just node-test`、`just skills-check`、`just python-check`、`just docs-sync`、`just ci` 和 `git diff --check` 通过；最终 dirty-state 审计只包含本任务与目标 skill/生成 docs 的授权路径，不包含既有 `08-26-resume-interview-skill` 工作。
- [ ] AC9（R7）：最终交付将静态/fixture/CI 结果标为本地确定性证据；真实 provider 遵循“一报告一 Prompt”、人工质量判断和旧反例跨仓库重放在未执行前保持 `missing evidence`。

## Out of scope

- 删除、合并或改写 `quanergy_client_rs/.trellis/reviews/` 中已有的三份反例报告。
- 一次审阅多个互不相关的根任务，或生成跨项目统计总表。
- 修改 Trellis 的任务 schema、父子生命周期、归档逻辑、workflow 或 task CLI。
- 自动修订规划、启动/执行/归档任务、审阅纯代码 diff。
- 增加 sub-agent 编排、新依赖、发布 PR/release、安装验证或远程写入。
- 借本次改动重构无关 pass、严重度体系或全量 Qiaomu 包结构。

## Key decisions

- 一次用户请求选定的 review scope 是输出原子性边界；任务目录不是报告数量边界。
- 根任务名拥有持久化报告路径。子任务保留独立可核验身份，但其发现进入根报告。
- 使用递归 `children` 闭包而不是只处理一层，避免孙任务静默遗漏；树异常 fail closed。
- 跨任务同根因先去重再编号，保留多 location，而不是把多个旧报告机械拼接。
- 不删除旧 child reports：清理既有用户数据是独立、潜在破坏性动作，不属于行为修复。
- 本次是一个可独立验证的 skill 优化交付物，不拆成多个 Trellis 子任务。

## Planning status

- Artifacts: `prd.md`, `design.md`, `implement.md`, `research/tree-review-evidence.md`
- Blocking open questions: none
- Status remains `planning`; implementation requires explicit approval of this final planning summary and a later `task.py start`.
