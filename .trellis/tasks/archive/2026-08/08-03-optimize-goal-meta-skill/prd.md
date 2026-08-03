# 优化 goal-meta-skill:项目侦察与多轮访谈式 goal 生成

## Goal

在 Claude Code / Codex 中输入较模糊的需求时,skill 能**结合项目内容**、
**与用户多轮讨论问答**,最终产出完整、平台合规、可验证的 `/goal` 指令
(复杂合同以文件指针形态交付)。

现状 v0.2.0 是"懒人默认值 + 单轮编号选择题":不侦察项目、明确禁止多轮问答。
本任务升级为"侦察 → 有限讨论 → 可核验出稿",同时保留懒人快路径不回退。

复杂任务:`prd.md`(本文件,只含需求/约束/验收)+ `design.md`(技术设计)+
`implement.md`(执行计划)。官方事实以
`research/official-goal-facts-2026-08-03.md` 为唯一基线(含对现有 facts 的
三处修正:Codex goals 已 stable 默认启用、命令面含 `/goal edit`、
0.128.0 为可用性起点)。

## Requirements

### R1 项目侦察(对应"结合项目内容")

- 在项目目录内触发时,起草前先做一轮**只读**侦察:项目类型、项目规则文件
  (AGENTS.md / CLAUDE.md)、真实验证命令、写边界候选路径、git 状态
  (须含 untracked,本仓库配置会隐藏它们)。
- 侦察结论向用户播报并可纠正;验证字段优先引用真实命令、边界引用真实路径;
  侦察不到才降级为 discovery-first 泛化写法;无项目上下文不强行侦察。
- 侦察阶段不运行测试、不写文件、不读敏感文件;范围与排除规则见 design.md。

### R2 多轮讨论问答协议(对应"和我进行讨论问答")

- 两阶段:A) 复述理解 + 侦察发现 + 只问人类才能答的问题(每轮 ≤4 问);
  B) 完整草案 → 邀请修订 → 终稿。允许多轮直至收敛。
- 快路径不回退:需求已具体、或用户要求直接出稿时,跳过讨论单轮交付。
- 对话分支的完整状态机在 design.md 定义,并有对应 evals 覆盖。

### R3 可核验输出结构

- 每个完成条件绑定**权威枚举来源或确定性检查**(命令退出码、基准/报告、
  产物路径、资料来源)——不强制"计数";裸量词(所有/all/clean up)仅在
  **无任何可枚举证据来源**时才视为缺陷(官方示例本身使用 "all tests in
  test/auth pass",不得误伤)。
- 完成条件编号化为**推荐样式**,linter 至多软提示,不做硬错误。
- read-first 开局(先读指定文件/文档再动工)为官方背书模式,作为推荐选项。
- 预算类文字只能作为**软性停止条款**,并向用户说明它不等于平台运行时预算
  (Codex budget-limited 是运行时状态,goal 文本无法设置;Claude 轮次条款
  由 evaluator 软判定)。

### R4 适用性闸门

- 硬拒(不出 goal):方向未定、纯发散探索 → 建议先 `/plan` / 讨论。
- 警告放行:可修复的主观性 → 强制注入 stop 条件与轮次上限。
- 低风险模糊仍默认前进;闸门只拦"goal 形态本身不适用"。

### R5 验证命令分级

- references 提供 safe-quick / long / destructive / flaky 分级指引;
  destructive 不得作为循环内验证;基线捕获仅作为建议输出,skill 不代跑命令。

### R6 goal 合同文件(无副作用契约)

- >4k 或复杂合同:输出标准化 `.planning/goal-<slug>.md` 的**可复制内容**
  (人读记录 + 可粘贴 invocation 区块),并指示用户先保存再执行;
  **默认不落盘**,仅用户明确要求时才写文件(走常规权限流,不预授权 Write)。
- Claude Code 输出附"设置 goal 即开始一轮"提醒;Codex 同样即时生效
  (goal 文本即首轮 prompt)。

### R7 平台事实增补与修正

- 按 research 文件修正三处过期事实,增补:auto mode 配对、`/clear` 清 goal、
  evaluator reason 循环、`/goal edit` 语义(含记账保留)、Codex 决策即暂停、
  budget-limited 状态与文本预算的区别。
- community-observed 内容显式标注;facts 文件加 `Last verified` 行。

### R8 资产同步

- linter 新检查(软提示为主)+ `tests/*.mjs` 同步,旧检查零回退。
- `evals/evals.json` 新增 ≥4 条分阶段(多轮输入)用例,覆盖侦察、讨论、
  闸门、快路径。
- **路由门独立于 description 是否变更**:R4 改变适用边界,须以 yao-meta
  `trigger_eval.py` + 本任务专用 cases/semantic config 跑一次路由评测
  (evals.json 与它是两套互不兼容的系统,CI 均不执行,见 design.md)。
- `agents/interface.yaml`、套件 `AGENTS.md` 的 allowed-tools 表同步。

## 约束

- 不回退现有强项:懒人快路径、双语契约、平台事实单源、stop-and-report 语义、
  4k/file-pointer 规则、风险分级。
- 讨论协议每轮 ≤4 问,只问侦察答不了的;不得变成长问卷。
- allowed-tools 只加**只读子命令白名单**(禁止 `Bash(git *)` 类宽授权),
  并有契约测试防回归;skill 保持无默认写副作用。
- SKILL.md 常驻体量受 yao-meta resource_boundary 1000-token 预算约束:
  新内容尽量下沉 references;超限时按 house 规则记 missing evidence 并以
  显式 ceiling 复跑,不造假通过。
- 遵守 `.trellis/spec/guides/skill-authoring-conventions.md` 与
  `skills/developer-tools-integrations/AGENTS.md` 全部契约
  (`<skill-dir>` 路径、4 反引号外层围栏、docs-sync 顺序、Windows 兼容)。

## Acceptance Criteria

- [x] `just skills-check`、`just node-test`、`just python-check`、`just ci` 通过。
- [x] lint 新检查有 mjs 测试覆盖且旧测试零回退;含"拒绝宽 Bash 授权"的
      allowed-tools 契约测试。
- [x] evals ≥14 条,新增用例含分阶段输入;闸门负例与快路径正例齐备。
- [x] trigger_eval 路由评测通过(cases + semantic config 存于本任务
      `research/`,命令与阈值记录在 implement.md)。
- [x] platform-goal-facts.md 三处修正落地 + `Last verified: 2026-08-03` 行;
      community-observed 均有标注;`/goal edit` 进入管理型问答输出。
- [x] 产出的样例 goal 通过自 lint(codex 与 claude 两平台各一例)。
- [x] `just docs-sync` 后 `docs-check` 通过(先隔离无关 WIP,防钩子回滚)。
- [x] 套件 `AGENTS.md` allowed-tools 表与 skill frontmatter 一致。

## Open Decisions(已于 2026-08-03 全部确认,实现时不再询问)

1. **README.md:确认删除**。向阳乔木来源致谢与 MIT 声明迁入 SKILL.md 尾部,
   不得丢失 attribution(implement.md 步骤 7 落地)。
2. **合同文件无副作用契约:确认采纳**。默认只输出可复制内容、明确要求才落盘,
   Write 不进 allowed-tools。

## Notes

- 审阅报告 8 点处置:1/2/3 阻断成立已修复(facts 基线、三件套、JSONL);
  4/5/6/7 按建议收敛(验证锚点泛化、预算语义区分、无副作用契约、状态机+
  独立路由门);8 采纳并升级为白名单+契约测试。
- 访谈风格(混合式)、硬拒闸门(收窄启用)、基线捕获(仅建议)已作为设计
  决策进入 design.md;审阅未持异议,如需改动在 design 评审时提出。
- 调研快照 2026-08-03,来源清单见 research 文件。
