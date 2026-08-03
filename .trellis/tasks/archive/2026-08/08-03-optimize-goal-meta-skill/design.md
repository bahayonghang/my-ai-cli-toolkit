# design.md — goal-meta-skill 升级技术设计

事实基线:`research/official-goal-facts-2026-08-03.md`(唯一来源,含证据等级)。

## D1 对话状态机(R2/R4,验收可依此断言)

```
S0 触发分类
 ├─ 管理型请求(查看/暂停/恢复/编辑/清除现有 goal)→ 平台管理答复,终态
 │    Codex: /goal · /goal edit(保留记账;重置记账需 clear 后新建)· pause · resume · clear
 │    Claude: /goal · /goal clear(无 pause/edit;给 clear+重设 或 打断 的替代)
 ├─ 不适用任务(方向未定/纯发散)→ 硬拒出 goal,建议 /plan 或讨论,终态
 ├─ 近邻路由(简单翻译/一句话任务/AGENTS.md 审计等)→ 现有 routing-negative,终态
 └─ 新 goal 请求 → S1
S1 项目侦察
 ├─ 检测到项目上下文 → 执行 D2 只读侦察 → S2
 └─ 无项目上下文(纯想法/新项目)→ 跳过侦察 → S2
S2 快路径判定
 ├─ 需求已具体 或 用户要求直接出稿("直接给"/"按默认")→ S4(单轮交付,现行为)
 └─ 关键槽位缺失(结果/验证/边界/风险容忍)→ S3
S3 访谈轮(可循环)
 · 输出:复述理解 + 侦察播报(可纠正)+ ≤4 个问题
 · 问题混合式:编号选择题为主(带默认),意图/优先级类允许开放问题
 · 只问侦察答不了的;平台歧义并入编号项(现有 0. 平台 A/B 规则)
 · 用户可随时"按默认"跳出 → S4
S4 草案(完整双语契约,平台渲染见 D5)
 ├─ 主观性可修的任务:警告放行 = 草案强制含 stop 条件 + 轮次上限
 └─ → S5
S5 修订循环:用户提修改 → 更新草案 → S5;确认 → S6
S6 终稿交付
 · 内联 ≤4k:最终 /goal + (可选)自 lint
 · >4k/复杂:输出 .planning/goal-<slug>.md 可复制内容 + "先保存再执行"指示(D6)
 · Claude 附"设置即开跑一轮"提醒;Codex 附"goal 文本即首轮 prompt"提醒
```

evals 用分阶段 prompt 序列断言 S1→S3→S4→S5 路径与 S2 快路径、S0 三类终态。

## D2 侦察设计(R1)

只读清单(按优先级,查到即止,不深挖):

1. 项目规则:`AGENTS.md` / `CLAUDE.md`(根层;含 nested 时提示存在)
2. 命令来源:`justfile` / `Makefile` / `package.json` scripts / `pyproject.toml` /
   `Cargo.toml` / CI 配置(`.github/workflows/*.yml` 文件名级)
3. git 基线:`git rev-parse --show-toplevel`、`git branch --show-current`、
   `git status --porcelain -uall`(本仓库 `status.showUntrackedFiles=no`,
   必须 `-uall` 才见 untracked —— house 验证陷阱)
4. 边界候选:与任务相关的顶层目录名(Glob 一层,不递归全树)

硬约束:不运行测试/构建;不写任何文件;跳过依赖与生成目录
(`node_modules` `dist` `build` `target` `.venv` `.git` 内部);不读敏感文件
(`.env*`、密钥/凭证类文件名);单文件只读必要片段。侦察失败或超时 → 降级
discovery-first 泛化写法,并在播报中说明"未能确认,goal 内含发现步骤"。

## D3 权限设计(R8,house"只读白名单"规则)

frontmatter:

```
allowed-tools: Read, Glob, Grep, Bash(python *), Bash(py *), Bash(git status *), Bash(git branch *), Bash(git rev-parse *)
```

- 不授 `Bash(git *)` 宽族;不预授权 `Write`(落盘走常规权限流,见 D6)。
- 契约测试(tests/*.mjs)断言:frontmatter 不含 `Bash(git *)`、`Bash(codex *)`
  等宽授权与任何 mutating git 子命令;SKILL.md 正文示例命令不越出授权面。
- 同步套件 `AGENTS.md` allowed-tools 表的 goal-meta-skill 行及理由列。

## D4 验证锚点规则(R3,替代被审阅否决的"计数强制")

- 锚点合法形态:命令退出码 / 测试・lint・构建输出 / 基准或报告数值 /
  产物路径或文件清单 / 指定资料来源。编号 Done-when 为**推荐样式**。
- 裸量词检测(linter 软提示):完成条件含 全部|所有|每个|all|every|clean up
  且**同段无任何锚点形态** → warning(非 error)。官方例
  "all tests in test/auth pass" 含命令锚点,不触发。
- 预算语义(两平台通用文案规则):轮次/时间/预算条款一律写成软停止条款;
  禁止输出"该条款会设置平台预算"的表述;Codex 管理型问答可提及
  budget-limited 为运行时状态。
- read-first 开局与 checkpoint+进度日志模式进 playbook 推荐段(官方背书)。

## D5 平台渲染增量(R7)

- 共同:双语契约、六字段、4k、file-pointer —— 不变。
- Codex:管理命令面 + `/goal edit`(edit 保留记账;completed→active;
  budget-limited 不变);stable 默认启用,`features.goals` 降为老版本排障;
  决策即暂停(暂停条件有运行时对应);goal 文本即首轮 prompt。
- Claude:增补 auto mode 配对提示(无人值守必配)、`/clear` 清 goal、
  evaluator reason 可作转向依据;其余现有规则不动。
- facts 文件头部加 `Last verified: 2026-08-03 against <urls>`;
  community-observed 段落(continuation.md audit、PR #21954 细节)单独小节标注。

## D6 无副作用契约(R6,采纳审阅建议)

- 默认:只输出 `.planning/goal-<slug>.md` 的完整可复制内容(两段式:
  人读记录 frontmatter+上下文;`<!-- invocation-start/end -->` 定界的可粘贴体),
  并给出保存指示 + 指向该文件的短 /goal。
- 用户明确要求落盘时才写文件;Write 不在 allowed-tools,触发常规权限批准,
  形成二次确认。SKILL.md 明文写出该契约,linter 不涉及。

## D7 linter 与测试变更(R8)

- 新增(均 warning 级,不破坏现有产出):裸量词无锚点、完成条件未编号
  (仅提示)、"预算=平台限制"表述检测(error 级,防误导)。
- 现有硬检查(标签齐全、占位符、危险模糊语、4k、claude 平台规则)零改动。
- tests/lint-goal-command.test.mjs:新检查正反例 + D3 契约测试;
  遵守 house 规则(UTF-8、`node --test` 自动发现)。

## D8 评测设计(R8,两套系统并行)

- `evals/evals.json`(行为契约,人审,CI 不执行):新增 ≥4 条,含
  分阶段 prompt 序列(S1→S3→S4 全流程、S2 快路径、S0 硬拒、
  侦察正例:fixture 给出 justfile 时验证字段必须引用 `just ci` 类真实命令)。
- yao-meta `trigger_eval.py`(路由门,与 evals.json 不兼容):
  在 `research/` 下新建 `trigger_cases.json`(should_trigger /
  should_not_trigger / near_neighbor,近邻至少含 agents-md-improver、
  codex-workflow-recommender、翻译/一句话任务)+ 本 skill 专用
  `semantic_config.json`(默认 config 面向 skill-creation,复用则召回全 0)。
  **无论 description 是否变更都跑**(R4 改边界)。

## D9 体量与兼容

- SKILL.md 目标净增 ≤ ~15 行:状态机细节、侦察清单、渲染增量全部下沉
  references;超 resource_boundary 1000-token 预算时按 house 规则记
  missing evidence 并 `--max-initial-tokens` 复跑,不造假。
- 版本 0.2.0 → 0.3.0;description 若改动:保持 ≤1024、无尖括号、双语触发词,
  并与 D8 路由门同批验证。
- 编辑 playbook/checklist 时:含 ``` 的示例块外层用 4 反引号围栏
  (formatter 钩子会吞段,house 陷阱)。
- 回滚:单 commit 交付,`git revert` 即整体回退;无跨 skill 依赖。
  docs-sync 产物与源改动同 commit。

## 已定设计决策(审阅未持异议)

- 访谈风格:混合式(选择题为主 + 意图开放问)。
- 硬拒闸门:启用,收窄至"方向未定/纯发散"。
- 基线捕获:仅建议输出,不代跑命令。
