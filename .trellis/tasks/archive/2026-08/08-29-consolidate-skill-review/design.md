# Design — 精简 skill 套件并增强 skill-session-review

> 本版按 `.trellis/reviews/08-29-consolidate-skill-review.md` 的合并审阅继续修订。Q1 已确认保留专用 JSON并新增窄化写入契约；Q2 已确认备份保留到完整 CI、工作提交与任务归档成功，之后核验精确目标并执行 post-closeout cleanup；Q3 已确认采用“具名报告包一次确认”，任何 replace 仍单独确认。实施期又确认 A 采用条件验收：真实扫描有 invoked 才生成/打开，零 invoked 则以安全停止与零副作用证据通过；B 始终承担实际浏览器渲染验收。归档前完成全部 root task AC，归档后删除不再反向充当任务完成条件。文中实施前代码行号统一锚定 base revision `02fc877756302e14587dda108fc33a8f4b6849e6`；live 实现证据按当前工作树另行核验。

## 1. 变更边界

| 文件/目录 | 动作 |
| --- | --- |
| `skills/developer-tools-integrations/update-skill/` | 删除（2 文件） |
| `skills/developer-tools-integrations/skill-doctor/` | 取材后删除（12 文件） |
| `skills/developer-tools-integrations/skill-session-review/SKILL.md` | 同步评分、输入、双产物与打开报告流程 |
| `skills/developer-tools-integrations/AGENTS.md` | 同步 `skill-session-review` 的 allowed-tools、canonical `--name` 与副作用说明 |
| `skills/developer-tools-integrations/skill-session-review/references/review-scorecard.md` | 新建量表、聚合与等级真源 |
| `skills/developer-tools-integrations/skill-session-review/references/finding-contract.md` | 修改建议晋级与逐 finding 归档契约 |
| `skills/developer-tools-integrations/skill-session-review/references/invocation-signals.md` | 收紧 `invoked` 真实性与 scanner 路径 identity：Codex/Oh My Pi 的不同事件包装映射到共享的规范 assistant 正文，只允许纯正文 marker 晋级并排除 tool-bearing 事件；Windows/POSIX 路径比较分别遵循宿主大小写语义 |
| `skills/developer-tools-integrations/skill-session-review/references/report-template.md` | 修改 review schema 与双渲染版式 |
| `skills/developer-tools-integrations/skill-session-review/scripts/report_headings.py` | 新建共享标题字典 |
| `skills/developer-tools-integrations/skill-session-review/scripts/review_contract.py` | 新建 JSON schema、跨字段重算与 secret 校验真源 |
| `skills/developer-tools-integrations/skill-session-review/scripts/manage_review_input.py` | 新建受控 JSON 输入创建/替换/proof-gated 删除 helper |
| `skills/developer-tools-integrations/skill-session-review/scripts/ensure_report_ignore.py` | 新建独立 repo-root `.gitignore` 受控 helper；不与报告写入混用 |
| `skills/developer-tools-integrations/skill-session-review/scripts/render_review_html.py` | 新建纯 HTML 渲染器 |
| `skills/developer-tools-integrations/skill-session-review/scripts/open_report.py` | 新建浏览器打开 helper |
| `skills/developer-tools-integrations/skill-session-review/scripts/scan_invocations.py` | 新增规范 assistant 正文提取谓词，分别映射 Codex/Oh My Pi 事件包装并排除 tool-bearing 事件；以宿主平台语义归一 session/skill 路径，并用 rollout filename stem 保证 Codex fork session id 唯一 |
| `skills/developer-tools-integrations/skill-session-review/scripts/write_session_review.py` | 改造 schema 校验、渲染与受控写入 |
| `skills/developer-tools-integrations/skill-session-review/tests/render-review-html.test.mjs` | 新建渲染测试 |
| `skills/developer-tools-integrations/skill-session-review/tests/manage-review-input.test.mjs` | 新建输入生命周期与删除 proof 矩阵测试 |
| `skills/developer-tools-integrations/skill-session-review/tests/ensure-report-ignore.test.mjs` | 新建独立 `.gitignore` helper 矩阵测试 |
| `skills/developer-tools-integrations/skill-session-review/tests/html-no-external-resources.test.mjs` | 新建自包含静态测试 |
| `skills/developer-tools-integrations/skill-session-review/tests/report-language.test.mjs` | 新建双语测试 |
| `skills/developer-tools-integrations/skill-session-review/tests/open-report.test.mjs` | 新建打开 helper 测试 |
| `skills/developer-tools-integrations/skill-session-review/tests/scan-invocations.test.mjs` | 增加 tool-output/无关通用步骤不误晋级、POSIX 大小写路径 identity 与 Codex fork id 唯一性回归 |
| `skills/developer-tools-integrations/skill-session-review/tests/skill-workflow-contract.test.mjs` | 新建四平台/三 adapter 公共工作流测试 |
| `skills/developer-tools-integrations/skill-session-review/tests/valid-review.json` | 新建 writer/workflow 共用的完整有效 review fixture |
| `skills/developer-tools-integrations/skill-session-review/tests/gbk-no-utf8-env.test.mjs` | 新建 8 个规划后 Python 脚本的 GBK/no-env 枚举矩阵 |
| `skills/developer-tools-integrations/skill-session-review/tests/write-session-review.test.mjs` | 重写写入矩阵测试 |
| `skills/developer-tools-integrations/skill-session-review/evals/evals.json` | 更新行为与 routing fixtures |
| `skills/developer-tools-integrations/skill-session-review/agents/interface.yaml` | 同步公共接口 |
| `docs/skills/developer-tools-integrations/skill-session-review.md` 及 `just docs-sync` 实际生成的 catalog diff | 生成后逐项审阅，不预写未出现文件 |
| `.trellis/spec/backend/governed-report-subtree-writing.md` | 新增固定报告子树、受控 JSON、单产物写入与 proof-gated cleanup 契约 |
| `.trellis/spec/backend/index.md` | 登记新增后端契约 |
| `.trellis/tasks/08-29-consolidate-skill-review/scripts/invoke-source-removal.ps1` | 实施期新增 task-scoped advanced helper；封装阶段 0 初始备份准备、阶段 5 source mutation、两类注入式 self-test 与证明式复用状态机，随任务归档，不进入产品 skill |
| `.trellis/tasks/08-29-consolidate-skill-review/scripts/test-external-root-guard.ps1` | 实施期新增 task-scoped regression fixture；证明 unresolved archive root 的 ReparsePoint 检查先于 canonical 解析和递归枚举，随任务归档，不进入产品 skill |
| `.trellis/tasks/08-29-consolidate-skill-review/notes.md` | 实施期新增 task evidence；记录浏览器/理由人工验收、source/virtual-final/actual-final inventory 与移除证据，随任务归档，不进入工作提交 |
| `.trellis/tasks/08-29-consolidate-skill-review/research/source-migration-evidence.md` | 实施期新增 task evidence；保存已删除源的固定身份与窄化取材摘要，承接 PRD/design 的稳定引用，随任务归档，不进入工作提交 |
| `ref/repo/**` | 不动 |

## 2. 取材清单

`skill-doctor` 的价值在评分与聚合机制，不在它的采集层与渲染层。采集层（Warp SQLite + protobuf）本机不用；渲染层绑定厂商标识且依赖当前 1,156,623 bytes（约 1.16 MB / 1.10 MiB）、本地未声明许可证的 JS 包；上游许可证状态未联网核实。已删除源的固定快照身份、保留机制与拒绝材料汇总在 `research/source-migration-evidence.md:5-36`。

| 源 | 机制 | 落点 |
| --- | --- | --- |
| `scorers/efficiency.md` | `label / score / description` 分级量表 + 1–3 句引证理由 | 新建 `references/review-scorecard.md`；取材边界见 `research/source-migration-evidence.md:22-27` |
| `scorers/code-quality.md` | 只为第二维 `instruction_fit` 取材 `insufficient_evidence` 独立档位、排除出均值而非记 0；不扩展到效率维度 | 同上；取材边界见 `research/source-migration-evidence.md:22-27` |
| `SKILL.md` Step 3 `curve()` | `curve(score) = 0.5 + 0.5 * score` | 同上，写入器实现；固定快照摘录见 `research/source-migration-evidence.md:24` |
| `SKILL.md` Step 3 `overall` | 加权总分 | 同上，去掉第三项并按 `0.85` 归一化（§3.4）；原机制见 `research/source-migration-evidence.md:24` |
| `render_report.py` `GRADES` | 十一档字母等级分档 | 同上，写入器实现；固定快照摘录见 `research/source-migration-evidence.md:26` |
| `SKILL.md` Step 3 `failed_conversations` | 改进建议只能由失败会话支撑 | 改 `references/finding-contract.md`；固定快照摘录见 `research/source-migration-evidence.md:24-25` |
| `references/skill-improvements.md` | file / don't-file 判据 | 同上；固定快照摘录与明确不迁移例外见 `research/source-migration-evidence.md:27` |

不移植：`collect_sessions.py`、`warp_decoder.py`、`assets/pierre-diffs.js`、`assets/warp-pixel-icon.svg`、`cta_url` 与所有 Warp 标识、上游 `skill_coverage` 及其任何替代第三项（§3.4）。

## 3. 评分量表（`references/review-scorecard.md`）

两个维度，只对 `invoked` 会话打分。

### 3.1 `execution_efficiency`

| label | score |
| --- | ---: |
| `highly_efficient` | 1.0 |
| `mostly_efficient` | 0.8 |
| `mostly_inefficient` | 0.4 |
| `highly_inefficient` | 0.2 |

判据：会话在该技能引导下达成结果的直接程度——返工、用户重复纠正、重复检索、串行未批处理、原地重试、校验时机过晚。

### 3.2 `instruction_fit`

| label | score |
| --- | ---: |
| `fit` | 1.0 |
| `misfit` | 0.2 |
| `insufficient_evidence` | 0.5 |

判据：技能文本是否覆盖了会话实际需要的判断。`misfit` = 至少一处会话必须自行摸索或被用户纠正的判断，技能文本本应给出而没有给出，或给得过死。

### 3.3 原始聚合

- **评分前置**：只有 `sessions` 中至少一个 `status=invoked` 才进入评分、review JSON 与双报告流程。零 invoked 时不定义均值/overall/grade/ratio，而按 R2.13 有界停止；四平台均 `missing-store` 使用 `no-session-stores`，其他零 invoked 使用 `no-invoked-sessions`。共享 validator 仍拒绝任何绕过该门的零 invoked、`scored_sessions == 0` 或 ratio 分母为 0 payload。
- `insufficient_evidence` 只属于 `instruction_fit`，不计入该维度均值；全部 `instruction_fit` 都为该档位时仅 `instruction_fit` 为 `null`，并在「未能核实」中说明。`execution_efficiency` 维持 §3.1 的四档封闭集合，任何 `execution_efficiency=insufficient_evidence` 都是 schema 错误。
- `failed_sessions` = 任一维度原始分 < 0.5 的会话（`insufficient_evidence` 不构成失败）。

### 3.3a 调用真实性与会话 identity

- scanner 的目标实例由显式 `--skill-path`、`--repo-root` 与 scope 共同确定；多实例时不得靠模糊自动发现选择 A 真源。只要传入 `--skill-path`，Claude/Grok/Codex/Oh My Pi 都必须先取得归一化后精确相等的实例路径证据；name-only 结构化调用、宽泛 `skills/<name>/SKILL.md` token 与同名异路径实例一律不归属于目标 sessions，scanner 也不得把未绑定 hit 事后标成请求路径。只有未传 `--skill-path` 才可使用既有 name fallback。
- 共享“规范 assistant 正文”谓词负责平台事件映射：Codex 只接收 `response_item` 下 `payload.type=message`、`payload.role=assistant` 的正文，Oh My Pi 只接收顶层 `type=message` 下 `message.role=assistant` 的正文；两者只提取 `type` 逐字符等于精确小写 `text` / `output_text` 的显式 block，拒绝 raw string content、list-string 与 `TEXT` / `OUTPUT_TEXT` 等非规范大小写。工具载体检查从完整事件根递归执行：任一层非空 `tool*` / `function_call*` key，或任一 block type 含 `tool` / 以 `function_call` 开头，都会整体排除事件，包括正文+工具混合事件。Codex/Oh My Pi 按原始 JSONL 事件顺序推进状态：先在当前事件识别精确目标读取并建立 `loaded`，再检查当前事件的规范 assistant marker，后续事件延续该状态；读取前的 marker 不缓存，不能由后续读取追溯晋级。技能特有 workflow marker 必须绑定目标技能，`Step 1` / `步骤 1` 等通用步骤词不得独立晋级。tool 回显最多证明 `loaded`，避免上下文注入、工具回显或无关步骤文本制造伪调用。
- Codex 将上述宽泛递归 tool-carrier 检查仅作为 assistant 正文的保守负向排除谓词，绝不复用它建立 `loaded`。正向目标读取谓词只接受外层 `type=response_item` 且 `payload.type` 精确属于白名单的真实载体，并且只检查对应载荷字段：`custom_tool_call` 的 `cmd`/`command`/`input`、`custom_tool_call_output` 的 `output`、`function_call` 的 `arguments`、`function_call_output` 的 `output`；字段内还必须同时出现受支持的读取动作与精确目标 `SKILL.md` 路径。实现用一个有序、非重叠 span extractor 同时服务 path identity 与遮蔽：已接受 quoted path 内不再产生 bare suffix，quoted JSON command container 只抽取内部实际 path，raw quote 与一层或多层 JSON-escaped quote wrapper 都完整识别含空格的 Windows/POSIX path；随后仅在路径外文本识别读取动作，避免 `rg`、`cat`、`read_file`、`read_text`、`get-content` 等目录名自造动作证据，同时保留 JSON command 的真实动作。普通 assistant prose、`world_state`、`toolbox_note`、任意其他 tool-like 元数据、非白名单 envelope 或非白名单字段都不能建立 `loaded`；`world_state` 中精确的 host skill 路径至多建立 `available`。正向与负向谓词保持独立，避免“为了保守排除 assistant 事件”反向扩大真实读取证据。
- Codex 会话文件来自全局 store。`scope=cwd` 且 `repo_root` 已给定时，分类器对 `session_meta.payload.cwd` fail closed：至少存在一个 metadata cwd，且每个值都是可规范化的绝对路径并与 repo root 逐实例相等；缺失、非法/相对、无法规范化或不相等均返回 `None`。`scope=global` 保持原有全局收集，不受 cwd metadata 完整性影响。
- scanner 的 session/skill 路径比较使用 `normpath` + 宿主平台 `normcase`：Windows 归一大小写与分隔符，POSIX 保留大小写差异，避免大小写敏感文件系统中的不同技能实例被误合并；该语义只属于 scanner identity，不复用报告 basename 的 R6 校验规则。
- Codex `sessions[].id` 使用每个 rollout 文件名的 stem，而不是 fork 间可能复用的 payload/root id；这样完整会话清单、评分 locator 与 finding 引用保持一对一。
- `tests/scan-invocations.test.mjs` 为四个平台分别构造显式目标路径与同名异实例路径，证明 name-only/异路径证据不会归属或晋级；Codex 与 Oh My Pi 分别用各自真实事件包装覆盖纯 assistant 正文正例，以及 raw string/list-string、外层/嵌套 tool 元数据、`tool_output`/未来 `*tool*` 类型、正文+工具混合事件负例；两平台分别固定 marker-before-read 保持 `loaded`、read-before-marker 晋级 `invoked`，另以已 loaded 后仅出现无关 `Step 1` / `步骤 1` 的 assistant message 验证仍保持 `loaded`。Codex cwd fixture 同时覆盖 metadata matching、missing、invalid 与 mismatch，证明 cwd scope 只保留 matching 而 global scope 保持全部收集；再在 POSIX 构造大小写不同路径验证不相等（Windows 按平台语义 skip），并构造共享 payload/root id 的两个 fork rollout 验证唯一 id；`tests/valid-review.json` 提供 writer/workflow 实际消费的完整有效数据，不承担 scanner 平台识别证明。
- Codex 载体专项 fixture 还必须逐一证明四类白名单 `response_item.payload` 载体可由允许字段建立真实读取，并证明 `toolbox_note + assistant 读取命令文本 + 后续 marker` 仍不得晋级 `loaded`/`invoked`；再以五类动作词分别仅存在于目标 path span 的 path-only 载荷证明保持 `available`，同时保留真实动作正例。四类 JSON command 无内层 path 引号正例、四类 JSON-escaped double-quoted 含空格 path 正例、Windows/POSIX 直接 span fixture、一层 escaped other-instance 负例及二次编码 target/other 对共同证明 extractor 不吞动作、不漏 target、不制造伪 identity。该矩阵与既有 marker-before-read/read-before-marker 及 cwd fail-closed/global fixture 同时保留。

### 3.4 加权总分与等级

移植上游的 `curve()` 与 `GRADES`，但**不移植第三项**。

```
curve(s) = 0.5 + 0.5 * s

overall = (0.5  * curve(execution_efficiency_mean)
         + 0.35 * curve(instruction_fit_mean)) / 0.85
```

- 上游第三项是 `skill_coverage`（采样会话中用到任一已装技能的比例）。本技能只复盘一个具名技能，该值恒为 1，无信息量。
- 曾提议用 `invocation_rate = invoked/(invoked+loaded+available)` 替代，**经实测否决**（EX-9）：三个真实技能分别得 `0.017` / `0.000` / `0.000`。原因是 `available` 由 `scan_invocations.py:307-309` 在会话含 `host_skills` 或 `## Skills` 时置位，而 Codex 几乎每个会话都注入该段——分母实为窗口内全部 Codex 会话。该项恒约为 0，只会把等级上限压到 `0.5 + 0.35 + 0.15*0.017 ≈ 0.853`（B），且各技能扣减量几乎相同，不提供区分度。
- 因此保留上游的权重比例，按 `0.85` 归一化，使 `overall` 恢复完整量程、`A+` 可达。
- `instruction_fit_mean` 为 `null` 时按原始 `0.5` 代入（与 `insufficient_evidence` 档位一致），并在「未能核实」中说明。
- **量程性质**：`curve` 把原始分 `[0.2, 1.0]` 映射到 `[0.6, 1.0]`，归一化后 `overall` 的取值范围是 `[0.6, 1.0]`，等级区间为 `D` 到 `A+`，`F` 不可达。这是上游 `curve()` 的固有设计（rubric 最低档不等于零分），不是缺陷。量表文件须写明，避免读者把 `D` 误读为接近满分。
- 对已通过评分前置的报告，调用计数（`invoked` / `loaded` / `available`）与其比率在 scorecard 区块**只作展示，不进入 `overall`**（R2.12）；此时 `invoked >= 1`，所以分母严格大于 0。展示处须注明 `available` 的口径含 Codex 全量会话，不可当作质量指标横向比较。零分母不会渲染 sentinel，而由前置门拒绝进入报告路径。
- 字母等级（已删除源的固定快照原值见 `research/source-migration-evidence.md:26`）：

| ≥ | 等级 | ≥ | 等级 | ≥ | 等级 |
| ---: | --- | ---: | --- | ---: | --- |
| 0.97 | A+ | 0.87 | B+ | 0.77 | C+ |
| 0.93 | A | 0.83 | B | 0.73 | C |
| 0.90 | A- | 0.80 | B- | 0.70 | C- |
| 0.60 | D | 0.0 | F | | |

- `overall`、各 `curve` 值与等级**由写入器计算，不采信输入**。数值真源为 `Decimal`：JSON 浮点以 `parse_float=Decimal` 读取；维度均值、`curve`、`overall` 依该顺序各自用 `ROUND_HALF_UP` 量化到 6 位小数，等级对量化后的 `overall` 与 Decimal 阈值比较；报告固定显示 6 位小数。输入声明值先按同一规则量化再与 canonical 值比较。与 `aggregate` 同批重算校验（§6.4）。

### 3.5 理由格式

每个评分的 `reason` 不再是自然语言字符串，而是结构化对象：

```json
{
  "sentences": ["具体理由一。", "具体理由二。"],
  "locator": {"type": "session", "value": "<当前 session id>"}
}
```

- `sentences` 长度为 1–3；每项为非空、无 CR/LF 的单行字符串。数组项数就是句数，不从中英文标点或缩写猜句界。
- `locator.type` 只能是 `session` 或 `excerpt`。`session` 的 value 必须逐字符等于当前 session id；`excerpt` 的 value 为 1–200 个 Unicode 字符，并沿用 `finding-contract.md` 的脱敏约束。
- 理由正文必须指出可修复的成因；这一语义判断由 AC16 人工验收，结构与定位由 `validate_reason` 强制。

## 4. 建议晋级门槛（改 `references/finding-contract.md`）

一条 `UPDATE SKILL` 建议成立，须同时满足：

1. 至少两个 `invoked` 会话呈现同一模式；
2. 其中至少一个属于 `failed_sessions`；
3. 通过 file 判据。

**File 判据**（全部为真才提）：失败可归因于某个具体载体上缺失、错误或欠明确的指令；能指名该载体与它本应写明的那一条可复用规则；若当时已有该规则并被遵守，本次失败不会发生。

**Don't-file 判据**（任一为真则不提）：现有指令已要求正确行为而模型未遵守（记 `COMPLIANCE GAP`）；属模型方差；唯一可做的修改是重述、加限定词或从本批会话里加例子；真正的修复点在指令载体之外。

每个 finding 必须且只能进入一个归宿：被某条 `suggestions[].finding_ids` 引用，或由恰好一条 `not_filed[].finding_id` 解释。两组 id 对 `findings[].id` 形成无遗漏、无重复的精确分区；未知 id、跨组重复、组内重复与遗漏均拒绝。无可提项时逐条记入 `not_filed`。这是成功结果，不是空报告。

条件 1、2 与 finding 精确分区由写入器强制（§6.4）。file / don't-file 判据本身依赖判断，由人工验收覆盖（AC16）。

## 5. 专用 JSON 输入契约（Q1 已确认）

### 5.1 规范路线

用户已选择保留单一 `--review-json <path>`，并新增 `.trellis/spec/backend/governed-report-subtree-writing.md`。该规范只覆盖固定的 `reports/skill-session-review/` 子树：专用 JSON 先由输入管理器从 raw stdin 接收，在 schema/跨字段/secret 预检全部通过后落盘；Markdown 与 HTML 再各由一次报告写入调用生成。它不放宽通用 `governed-file-writing.md` 对其他路径的约束。

repo-root `.gitignore` 位于报告子树之外，仍遵守通用规范。`ensure_report_ignore.py` 是独立 helper：只在 ignore 未生效时、经独立授权后接收完整候选 `.gitignore` 内容，并只创建或替换这一份根目录文件。输入管理器与报告写入器只验证 ignore 是否生效，绝不顺手修改它。

### 5.2 受控位置

```
<repo-root>/reports/skill-session-review/
├── .input/<skill-name>.json     ← 输入管理器校验后写入的专用 JSON
├── <skill-name>.md              ← 受控写入产物 1
└── <skill-name>.html            ← 受控写入产物 2
```

选择该位置的理由：

- 由已确认的 `--repo-root` 派生，与 `governed-file-writing.md` 对目标路径的要求同构，写入器可用同一套校验。
- `.gitignore` 已有精确行 `reports/skill-session-review/`，`git check-ignore` 覆盖其下全部子路径（EX-7）。不新增忽略行，也不会误入版本控制。
- 输入与产物同目录，排障时一处可见。

输入管理器和报告写入器都先由已通过 `NAME_RE` 的 `skill-name` 派生唯一期望路径 `<repo-root>/reports/skill-session-review/.input/<skill-name>.json`，再要求传入路径解析结果与期望路径逐字符/平台规范化后完全相等。错误 basename、嵌套子目录、错误扩展名或大小写、traversal、symlink 与 reparse point 均拒绝（退出 2）。Git 仓库中必须先证明精确 ignore 已生效；非 Git 目录报告 `non-repo`，不隐式创建 `.gitignore`。

### 5.3 生命周期

| 时机 | 动作 | 责任方 |
| --- | --- | --- |
| ignore 未生效时 | 单独预览并授权，只创建/替换 repo-root `.gitignore` | `ensure_report_ignore.py`（通用契约） |
| 报告子树任何副作用前 | 展示已确认 repo root、canonical name、三条精确派生路径及 create/remove/open 效果；用户一次确认该具名报告包。root/name/path/effect 漂移即失效；replace 始终展示当前 SHA-256 并另行确认 | Agent workflow（R5.10 / AC45） |
| 评分完成后、第一次报告写入前 | 从 raw stdin 完整校验后 no-clobber 创建 `.input/<skill-name>.json` | `manage_review_input.py create` |
| 已有同名输入且确需替换 | 显式 `replace --expected-sha256`，终局化前复核 | `manage_review_input.py replace` |
| 两次报告写入期间 | 每次重新读取、重新校验与 secret 扫描；共用同一输入字节 | `write_session_review.py` |
| 任一报告失败 | 保留输入与已成功产物，仅重试失败格式 | 调用工作流 |
| 两份报告均成功 | 校验输入当前哈希与两份报告返回哈希后只删除输入 | `manage_review_input.py remove` |

输入文件是短期受控草稿，不允许 Agent 直接写入、覆盖或删除。`remove` 必须同时收到输入哈希和 `markdown`/`html` 两份 artifact hash；任一缺失、不匹配或产物不存在均退出 8，并保留全部文件。

### 5.4 调用形状

```
scan result ─► invoked_count == 0 ─► bounded unrated stop（no-session-stores | no-invoked-sessions）
            └► invoked_count >= 1 ─► score + raw JSON ─► preview exact root/name/paths/effects
                                                    └─► explicit named-package confirmation
                                                        └─► manage_review_input.py create ─► .input/<name>.json
                                                    ├─► write_session_review.py --format markdown ─► <name>.md
                                                    └─► write_session_review.py --format html     ─► <name>.html
                                                                                 │
                 manage_review_input.py remove ◄── input/md/html hashes ─────────┤
                                                                                 └─► open_report.py
```

零 invoked 分支在读取会话切片、构造 raw JSON 或调用 helper 前结束，不触及文件系统或浏览器。已评级分支先完成报告包精确预览与一次显式确认；该确认只授权当前 root/name/path/effect 快照下的 no-clobber create、proof-gated input remove 与一次 open，不授权任何 replace。已确认分支的每次变更只触及一个 payload 文件；两份报告是两次独立调用，两次消费同一份 JSON 并在写前重新校验；渲染确定性，重跑得到相同 SHA-256。缺失 ignore 时的 `.gitignore` 操作只在已评级分支、且在报告子树流程之前独立预览和授权。

### 5.5 部分失败的处理

第二次调用失败时第一份产物已存在。这不是需要回滚的不一致状态：两份都由同一输入确定性派生，重跑第二次即收敛。`SKILL.md` 须写明：

1. 两次写入调用都必须完成，之后才调用 `open_report.py`；
2. 第二次失败时不要修改 JSON，直接重跑第二次调用；
3. 若产物已存在而需重写，用 `--replace --expected-sha256`，哈希取自上一次调用的 stdout；
4. 输入文件的删除只在两份产物都返回哈希后，通过 `manage_review_input.py remove` 提交 input/md/html 三份 hash proof；失败时保留以便重跑。

第 3 项不是初始报告包确认的延伸：Agent 必须展示每个待替换目标的精确路径、当前 SHA-256 与 replace 效果并取得单独确认，之后才可调用 `--replace`。输入删除属于初始报告包中已预览的 proof-gated remove；若 root/name/path/effect 漂移则原确认失效。

### 5.6 `review.json` schema

```json
{
  "schema_version": 1,
  "language": "zh",
  "skill_name": "",
  "skill_path": "",
  "scope": "global|cwd",
  "generated_at": "<ISO-8601>",
  "coverage": {
    "claude": { "status": "ok|missing-store", "invoked": 0, "loaded": 0, "available": 0 },
    "grok": {}, "codex": {}, "oh-my-pi": {}
  },
  "sessions": [
    {
      "id": "", "platform": "", "status": "invoked|loaded|available", "signal": "",
      "scores": {
        "execution_efficiency": {
          "label": "", "score": 0.0,
          "reason": {"sentences": [""], "locator": {"type": "session", "value": ""}}
        },
        "instruction_fit": {
          "label": "", "score": 0.0,
          "reason": {"sentences": [""], "locator": {"type": "session", "value": ""}}
        }
      }
    }
  ],
  "aggregate": {
    "execution_efficiency": 0.0,
    "instruction_fit": null,
    "overall": 0.0,
    "grade": "",
    "scored_sessions": 0,
    "failed_sessions": []
  },
  "findings": [
    { "id": "SSR-01", "verdict": "UPDATE SKILL|COMPLIANCE GAP|ONE-OFF|INCONCLUSIVE",
      "session_id": "", "platform": "", "evidence": "", "step_deviation": "",
      "user_correction": "", "gap": "", "suggestion": "" }
  ],
  "suggestions": [{ "finding_ids": ["SSR-01"], "clause": "", "why_filed": "" }],
  "not_filed": [{ "finding_id": "", "why_not": "" }],
  "unverified": [""],
  "reliable": [""]
}
```

`language` 必填枚举（§7）。`sessions[].scores` 仅 `invoked` 会话必填，且至少存在一个 invoked；零 invoked 结果不建模为本 schema，而由 §3.3/§5.4 提前停止。`skill_name` 必须逐字符等于命令行已验证的 canonical `--name`，输入管理器 create/replace 与报告写入器每次消费均传入 expected name 做同一校验。整个 `aggregate` 块由 Agent 声明、由写入器重算校验（§3.3、§3.4）。

### 5.7 公共契约同步

报告子树公共契约以 `.trellis/spec/backend/governed-report-subtree-writing.md` 为命令签名真源；其 canonical basename flag 已是 `--name`。该迁移只覆盖输入管理器、报告写入器、浏览器 helper 三类报告 basename 消费方，不提供它们的 `--skill-name` 兼容别名。扫描器 `scan_invocations.py --skill-name` 是独立的会话查询参数，`invocation-signals.md` 与 `SKILL.md` 扫描步骤继续正向使用，不纳入本迁移。

| 位置 | 现状 | 改为 |
| --- | --- | --- |
| `.trellis/spec/backend/governed-report-subtree-writing.md:24-36` | 输入管理器与报告写入器均为 `--name` | 保持为 canonical 真源；implementation 与 checks 逐字符对齐 |
| `SKILL.md:39` 硬门 | `the report file, the repo-root .gitignore exact line, and helper --input temp files` | 四类允许副作用，不是预授权：两份报告产物；独立受控的 repo-root `.gitignore` 精确行；由输入管理器维护的 `.input/<name>.json`；`open_report.py` 打开已生成的 HTML。报告包按 R5.10 一次确认，`.gitignore` 与 replace 分别确认 |
| `SKILL.md` 工作流第 3～5 步 | 扫描器用 `--skill-name`；一次旧报告 `--input` 调用 | 保留扫描器 `--skill-name`；扫描后新增零 invoked 停止门；已评级分支必要时独立确保 ignore → 预览 root/name/三路径/create-remove-open 并取得一次具名报告包确认 → 三类报告 helper 统一 `--name` → proof-gated remove → 打开报告（§5.4），含 replace 单独确认与部分失败重跑（§5.5） |
| `skills/developer-tools-integrations/AGENTS.md:58` | 仍含 `Write`，副作用只写 report dir + one gitignore line | 删除 `Write`；登记 `--name` 调用所需 helper、固定报告子树的单 payload 写入、独立 `.gitignore` helper 与两份产物成功后的浏览器打开 |
| `agents/interface.yaml:4` `default_prompt` | `write reports/skill-session-review/<name>.md` | `preview exact root/name/input/Markdown/HTML paths and create-remove-open effects, obtain one named-package confirmation, persist one validated review JSON, write <name>.md and <name>.html separately, remove the input only with complete hash proof, then open the HTML; confirm replacements separately` |
| `agents/interface.yaml` `side_effect_policy` | `writes only reports/skill-session-review and one gitignore line` | `requires one explicit confirmation for the exact named report package before fixed-subtree create/remove/open effects; replacements and the separately governed repo-root gitignore operation require their own confirmation` |
| `evals/evals.json` | 旧入口与单报告行为 | 新增未确认零 helper 调用、具名报告包一次确认、确认快照漂移失效、replace 单独确认、canonical `--name`、双产物与浏览器流程用例；evals 只作 review/future-tooling 资产，不以 `just ci` 代证执行 |
| 报告流程 `tests/*.mjs` | 旧 `--input` / 单报告调用 | 三类报告 basename 消费方正向只调用 `--name`，它们的 `--skill-name` 只作负向迁移用例；扫描器 tests 继续正向调用扫描器 `--skill-name`，并由 `node-test` 实际执行 |

`references/report-template.md` 由「Agent 手写模板」改为「review JSON schema + 两种渲染产物版式」。

## 6. 写入器：受控写入改造（TPR-01）

### 6.1 现状不合规

`write_session_review.py:119-130` 的 `atomic_write` 用固定 `<dest>.tmp` + `os.replace`，没有 no-clobber、替换授权、schema/secret 校验、临时文件独占、回读校验或 Git 可见性。它还在报告写入调用内维护 `.gitignore`，形成多目标副作用；`tests/write-session-review.test.mjs:86-94` 则把无授权覆盖断言为应通过。本任务扩大写入面，必须同批拆分职责并补齐。

### 6.2 命令签名

```text
# 仅当 ignore 未生效；完整候选 .gitignore 通过 raw stdin 传入
python "<skill-dir>/scripts/ensure_report_ignore.py" \
  --repo-root "<confirmed-root>" [--replace --expected-sha256 <gitignore-sha256>]

# 完整 review JSON 通过 raw stdin 传入
python "<skill-dir>/scripts/manage_review_input.py" create \
  --repo-root "<confirmed-root>" --name <name>
python "<skill-dir>/scripts/manage_review_input.py" replace \
  --repo-root "<confirmed-root>" --name <name> \
  --expected-sha256 <input-sha256>

python "<skill-dir>/scripts/write_session_review.py" \
  --repo-root "<confirmed-root>" --name <name> --format markdown|html \
  --review-json "<repo-root>/reports/skill-session-review/.input/<name>.json" \
  [--replace --expected-sha256 <artifact-sha256>]

python "<skill-dir>/scripts/manage_review_input.py" remove \
  --repo-root "<confirmed-root>" --name <name> \
  --expected-sha256 <input-sha256> \
  --artifact-sha256 markdown=<md-sha256> \
  --artifact-sha256 html=<html-sha256>
```

Windows 用 `py -3` 替代 `python`。`<skill-dir>` 为技能加载时给出的字面路径，不是环境变量。`--name` 是输入管理器、报告写入器与浏览器 helper 三类报告 basename 消费方的唯一 flag，与新 spec 逐字符一致；只有这三类消费方的旧 `--skill-name` 不保留别名，传入时报参数错误（退出 2）。扫描器继续使用独立的 `scan_invocations.py --skill-name`。报告写入器的 `--input` 与 stdin 路径被移除；只有输入管理器的 `create`/`replace` 从 raw stdin 读取 JSON。

`ensure_report_ignore.py` 完整遵守通用 `governed-file-writing.md`：目标固定为 repo-root `.gitignore`；raw stdin 必须 strict UTF-8 解码（可选 BOM）、规范化 LF，并在任何文件系统变更前完成完整 artifact 校验与高置信 secret 扫描。缺失时唯一合法候选是规范化字节 `reports/skill-session-review/\n`；已存在时须接收完整候选文件并要求 `--replace --expected-sha256`，候选相对当前规范化内容只能新增一次精确行，不能删除、重排或改变其他行。目标与临时兄弟都拒绝 symlink/reparse；create/replace 均使用独占 owned temp、finalization 前复核旧 hash、完成后回读字节与 SHA-256，并报告 Git 可见性。精确行已生效时只读返回 `mode: "unchanged"`，不读 stdin、不写磁盘。

### 6.3 执行顺序与单次副作用边界

**工作流级授权前置（位于所有 helper 之外）：**

1. 解析并展示已确认 repo root、canonical `--name`、三条精确派生路径，以及 `create input → create Markdown → create HTML → proof-gated remove input → open HTML` 效果。
2. 用户明确确认该具名报告包后，生成不可变 authorization snapshot；任一 root/name/path/effect 漂移使 snapshot 失效并回到预览。
3. no-clobber create/remove/open 依该 snapshot 执行。目标已存在时停止；逐一展示待替换目标的当前 SHA-256、精确路径与效果，并另取显式 replace 确认。
4. `.gitignore` 的完整候选预览/授权属于通用写入契约，永远不并入本报告包 snapshot。

**`.gitignore` helper `create`/`replace`：**

1. 校验显式 repo root 是普通目录且不是 symlink/reparse；目标只能逐字符等于其直接子项 `.gitignore`。
2. 从 raw stdin strict UTF-8 解码（可选 BOM）并规范化 LF；执行完整 artifact schema（create 仅 exact line；replace 仅在当前规范化内容上新增一次 exact line）与 `scan_secrets`。
3. 在任何目录、temp 或目标变更前完成 no-clobber / `--replace --expected-sha256` 授权；目标 symlink/reparse 一律拒绝。
4. 独占创建不跟随链接的 owned temporary sibling；外来普通文件或 link/reparse sibling 均拒绝且不删除。
5. finalization 前紧邻复核旧 hash，flush 后原子替换；注入失败时保全旧字节并只清 owned temp。
6. 回读规范化字节并核对 SHA-256；只读探测 `ignored|tracked|untracked|non-repo`，输出有界元数据。
7. 已有 exact line 时只读返回 `unchanged`；整个 helper 不 stage、commit、execute 或联网。

**输入管理器 `create`/`replace`：**

1. 解析并校验显式 repo root 与 `--name` 的安全 basename；派生唯一 `.input/<name>.json`。
2. Git repo 中只读验证精确 ignore 已生效；未生效退出 8，不修改 `.gitignore`。非 Git 目录记录 `non-repo`。
3. 从 raw stdin 严格 UTF-8 解码（允许 BOM），规范化 LF 并 `json.loads`。
4. 调用 `review_contract.py`，传入已验证 `--name` 作为 `expected_name`，执行完整 schema、`review.skill_name == expected_name`、至少一个 invoked、`scored_sessions > 0`、非零 ratio 分母、跨字段重算与 secret 扫描。
5. 完成 no-clobber 或 `--expected-sha256` 替换授权；此时之前不得创建父目录。
6. 只创建固定父目录，独占创建 owned temp，终局化前紧邻复核旧 hash，原子写入。
7. 回读规范化字节与 SHA-256，探测 Git 可见性，输出有界元数据。

**报告写入器每个 format：**

1. 解析并校验 repo root、`--name`、`--review-json` 完全相等关系与固定目标。
2. Git repo 中验证 ignore 已生效；不修改 `.gitignore`。
3. 严格读取专用 JSON，把当前已验证 `--name` 作为 `expected_name` 调用 `review_contract.py`，**重新执行** schema、payload name 绑定、零样本门、跨字段重算与 secret 扫描；防止准备后篡改或文件名/正文身份漂移。
4. 完成报告目标 no-clobber 或替换 hash 预检。
5. 确定性渲染一种 format；独占创建 owned temp，终局化前紧邻复核旧 hash，原子写入。
6. 回读目标并核对字节/SHA-256；只读探测 Git 可见性；输出有界元数据。
7. 失败只删除本次调用拥有的 temp，保留输入、已有报告与所有外来残留。

**输入管理器 `remove`：**

1. 重新解析固定路径，拒绝 symlink/reparse/traversal；按固定 `input → Markdown → HTML` 顺序取得与 writer 共用的三个 destination lease，任一 contention 立即 fail closed，释放已持有 lease。
2. 在全部 lease 内重新读取并校验输入，复核 `--expected-sha256`；最终读取通过 no-follow descriptor 返回文件 identity。
3. 在同一 lease 边界内要求 `markdown`、`html` 两种注册 format 各有且仅有一个 `--artifact-sha256`，并与固定报告文件当前字节完全匹配。
4. 删除前紧邻确认 input 路径仍指向最终读取 identity；任一 proof 缺失/过期、proof 后 input/artifact replace 或 inode swap 均退出并保留未经证明的新对象。identity 回归必须使用字节与 hash 完全相同、但 file identity 不同的 replacement，单独证明不是内容 hash 在拦截。全部匹配时只删除该已证明输入 JSON，回读确认不存在并输出有界元数据。

三类写入 helper 全程不 stage、不 commit、不打开浏览器、不联网（R5.9）。`git` 子进程只用于只读 ignore/可见性查询；按 `.trellis/spec/backend/skill-helper-command-contracts.md` 的「UTF-8 native command capture on Windows」，须传 `encoding="utf-8", errors="replace"`。

### 6.4 共享校验模块（`review_contract.py`）

| 函数 | 规则 | 对应 |
| --- | --- | --- |
| `decode_review_json` | strict UTF-8（可选 BOM）、LF 规范化、JSON object 根类型；JSON 浮点以 `parse_float=Decimal` 读取，返回规范化字节与对象 | R5.3, R6.1 |
| `validate_schema(review, expected_name)` | 必填字段、类型、枚举（`language`、`scope`、`status`、`verdict`、各维度封闭的 `label`）、`schema_version == 1`；`review.skill_name` 逐字符等于已验证的 canonical `--name`；至少一个 invoked、`scored_sessions > 0`、调用计数分母 > 0；每个 label 与所属维度的唯一 score 映射完全匹配；`execution_efficiency=insufficient_evidence` 拒绝 | R2.1, R2.2, R2.6, R2.13, R5.3, R6.8, R7.1 |
| `recompute_aggregate` | 只从 Decimal 规范 label-to-score 映射重算两维均值、`curve`、`overall`（`/0.85` 归一化）、`grade`、`scored_sessions`、`failed_sessions`，不信任任意输入 score；均值 → curve → overall 逐阶段以 `ROUND_HALF_UP` 量化 6 位，grade 对量化后 overall 判定，报告固定显示 6 位；只把 `instruction_fit=insufficient_evidence` 排除；全部 `instruction_fit` 为该档位时仅该维度为 `null` 且加权按 Decimal `0.5` 代入；输入声明按同一量化规则比较，不一致 → 拒绝。展示用调用计数与比率不参与 `overall` | R2.2, R2.6, R2.11, R2.12 |
| `validate_suggestions` | 每条 `finding_ids` 对应的 finding，其 `session_id` 至少一个在 `failed_sessions`；该模式由 ≥2 个 `invoked` 会话支撑 | R2.7 |
| `validate_reason` | 按 §3.5 校验 1–3 项 `sentences` 与结构化 `locator`；excerpt 长度与 secret 扫描同批执行 | R2.5, R2.8 |
| `validate_finding_partition` | suggestions/not_filed 引用全部存在，对 findings id 形成无遗漏、无重复的精确分区；每个未提 finding 恰有一条理由 | R2.4, R2.9 |
| `scan_secrets` | 对 `.gitignore` 候选与 review JSON/报告数据复用现有 `REDACT_RE` 的三类高置信模式（`sk-`、`ghp_`、`Bearer `）；命中即拒绝写入 | R5.3 |

`manage_review_input.py` 与 `write_session_review.py` 必须导入同一组函数，不能复制校验逻辑。`REDACT_RE` 语义由写入前脱敏改为写入前拒绝；脱敏仅可用于 stdout/stderr 诊断文本。

### 6.5 stdout 契约

报告写入与输入 create/replace：

```json
{
  "path": "", "operation": "input|report", "format": "json|markdown|html",
  "mode": "create|replace", "bytes": 0, "sha256": "",
  "git": "ignored|tracked|untracked|non-repo"
}
```

输入删除：

```json
{"path": "", "operation": "input", "mode": "remove", "sha256": "", "removed": true}
```

`.gitignore` helper 使用通用写入元数据，并允许 `mode: "unchanged"`。所有 stdout 都不回显正文或疑似 secret；删除失败只在 stderr 给出有界类别，不回显 proof 对应内容。

### 6.6 退出码

| 码 | 含义 |
| --- | --- |
| 0 | 成功或 ignore 已满足的只读 `unchanged` |
| 2 | 参数/root/path 错误；报告写入器收到已移除的 `--input` 或 stdin |
| 3 | 目标已存在且无 create/replace 授权 |
| 4 | 输入、报告或 `.gitignore` 替换哈希过期 |
| 5 | 临时兄弟已存在或为链接/重解析点 |
| 6 | JSON/schema/跨字段校验失败，或 `.gitignore` 候选包含精确行以外的改动 |
| 7 | secret 扫描命中 |
| 8 | ignore 未生效，或输入删除的 format/hash proof 缺失或不匹配 |
| 1 | 其他 IO/finalization 失败 |

### 6.7 验证矩阵覆盖

`ensure-report-ignore.test.mjs` 对 `.gitignore` 独立跑完整通用矩阵：缺失/非法/reparse root、固定直接子项目标、invalid UTF-8、BOM/LF、完整 artifact/delta、secret、create/no-op/no-clobber/authorized replace/stale hash、目标与 temp link/reparse、finalization failure、旧字节与外来 residue 保全、read-back hash、四种 Git 可见性、stdout 边界及无 Git mutation/execute/network。`manage-review-input.test.mjs` 覆盖输入创建、替换、篡改后拒绝、ignore 前置条件、部分成功保留及 proof-gated remove；`write-session-review.test.mjs` 对 `markdown` 与 `html` 分别覆盖最终获批写入矩阵（AC26）。不得用 JSON/报告用例代证 `.gitignore` artifact。

`tests/skill-workflow-contract.test.mjs` 先证明未确认时只产生精确预览且零 helper 调用，再以确认后的同一 root/name/path/effect snapshot 和包含 Claude/Grok/Codex/Oh My Pi 的 review fixture 跑通输入 create → 两种报告 → proof cleanup → open；另证明 snapshot 漂移失效、existing target 触发单独 replace 确认，并遍历 `agents/interface.yaml` 的 `openai`/`claude`/`generic` adapter targets，证明共享入口与产物契约可达；平台 session 识别继续由现有 `scan-invocations.test.mjs` 覆盖。

## 7. 报告语言（TPR-03）

- `language` 为必填枚举 `zh` | `en`（R7.1）。Agent 依用户请求语言填写；渲染器不做任何语言推断。
- 标题字典集中在 `scripts/report_headings.py`：`HEADINGS = {"zh": {...}, "en": {...}}`，键为稳定的区块标识（`scorecard`、`coverage`、`invocations`、`findings`、`suggestions`、`not_filed`、`unverified`、`reliable`）。`render_markdown` 与 `render_review_html` 都从这里导入，源码中只有一处定义（AC35）。
- 字段名（`Session`、`Platform`、`Evidence` 等）在两种语言下保持不变——`report-template.md:52` 的 `Keep field names stable` 原样保留。
- 回归用例：同一份 JSON 分别以 `zh` / `en` 渲染，断言标题切换、字段名不变、其余内容一致（AC36）。

## 8. HTML 渲染器（`scripts/render_review_html.py`）

### 8.1 约束

- 单文件自包含：内联 `<style>`，无外部资源请求（R3.2 的精确定义）。
- 零第三方依赖，零 JS。折叠用 `<details>/<summary>`。
- 无厂商 CTA、外链推广、分享水印。
- 全部插值经 `esc()` 转义。
- **不提供任意 `--out` 路径的写入入口**（R5.8）。模块只导出 `render_page(review) -> str`；独立调试用 `python render_review_html.py --review-json <path>` 把 HTML 打到 stdout。所有落盘走 §6 的受控写入器。

### 8.2 结构

```
render_page(review: dict) -> str
├── header        技能名、路径、scope、生成时间、language
├── scorecard     overall + 字母等级（醒目）；两维 curve 值与原始均值；
│                 计分会话数；invoked/loaded/available 计数与比率（只展示，
│                 带 available 口径注记）；维度为 null 时显示「证据不足」
├── coverage      四平台表（status / invoked / loaded / available）
├── sessions      调用清单表；invoked 行展开显示两个维度的 label/score/reason
├── findings      每条 SSR-NN 一个 <details>，verdict 作 summary
├── suggestions   已提条款 + why_filed
├── not_filed     未提项与理由
├── unverified    未能核实
└── reliable      可靠部分
```

区块标题取自 §7 的共享字典。等级仅作视觉呈现，不引入外部字体或图标。

### 8.3 外部资源静态校验（TPR-05）

AC7 不用 `rg "https?://"`。`tests/html-no-external-resources.test.mjs` 的规则：

- 资源承载标签/属性：`script[src]`、`link[href]`、`img[src]`、`iframe[src]`、`source[src|srcset]`、`object[data]`、`embed[src]`、`video[src|poster]`、`audio[src]`、`use[href|xlink:href]`。生成物出现任一此类属性即失败；本报告不需要资源型属性，也不设 data URI 例外。
- 样式内容出现任意 `url(...)` 或 `@import` 即失败。
- 失败 fixtures 覆盖 `https://`、`//`、`./relative`、Windows/Posix 本地绝对路径与 `file:`；这些都会读取报告文件之外的资源。
- 正文文本节点中的 URL 字符串**不判失败**。
- 必备 fixture：某条 `evidence` 含 `https://example.test/session-log` 短摘录，校验必须通过。
- 厂商字样 `warp` 作独立断言，与外部资源检查分开。

### 8.4 浏览器人工验收（AC6）

阶段 5 对 A 按真实扫描结果选择条件分支，并始终用系统实际默认浏览器打开已确认的 B `file://` 报告包；浏览器分支在任务 notes 记录浏览器名称/版本、`100%` 缩放和 `1440×900` viewport：

1. **真实 smoke `goal-meta-skill`**：扫描命令必须同时显式传入仓库内当前真源 `--skill-path`、已确认 `--repo-root` 与 `scope=global`，不得使用自动发现的另一实例。若 `invoked >= 1`，输入来自当次真实复盘，`open_report.py` 返回 `opened: true`；在任务 notes 记录浏览器名称/版本、`100%` 缩放和 `1440×900` viewport；scorecard 与 `coverage / invocations / findings / suggestions / not_filed / unverified / reliable` 全部注册区块可见且正文可读；在固定 viewport 下 `document.documentElement.scrollWidth <= document.documentElement.clientWidth`。若 `invoked == 0`，立即记录 `unrated: no-invoked-sessions` 与四平台 counts，并证明没有读取私密切片、没有构造 JSON、没有调用 writer/open helper、A 三个目标均不存在；该分支不打开浏览器，也不允许用 fixture、历史计数或其他 skill 实例伪造 A。真实输入允许 findings 为空，不承担 hostile/details 判据。
2. **确定性 `skill-session-review-browser-fixture`**：受控 fixture 固定含 `evidence: "<script>alert(1)</script>"` 与至少一条 finding；`open_report.py` 返回 `opened: true`；文本只显示而不产生脚本节点、弹窗或执行；同一 viewport 下 `scrollWidth <= clientWidth`；该 finding 的 `<details>` 可展开显示正文并再次折叠。

两个具名快照分别按 R5.10 展示精确 root/name/paths/effects 并取得确认；A 的确认在零 invoked 分支保持未消费，不触发 helper。任一适用分支固定项不满足即 AC6 失败。AC7 的静态资源检查与 AC8 的区块存在性不能替代 B 或有样本 A 的真实浏览器证据；浏览器分支若默认浏览器无法打开、helper 返回 `opened: false`，AC34 的失败边界可通过，但 AC6 保持未通过。

## 9. 打开报告（`scripts/open_report.py`）

用户要求生成后自动打开浏览器。`governed-file-writing.md:30` 禁止写入器有 execute 类副作用，因此打开动作必须在写入器之外，由独立 helper 承担。

### 9.1 契约

```text
python "<skill-dir>/scripts/open_report.py" --repo-root "<confirmed-root>" --name <name>
```

- 目标路径由 `--repo-root` 与 canonical `--name` 派生为 `<root>/reports/skill-session-review/<name>.html`，**不接受任意路径参数**；旧 `--skill-name` 按参数错误拒绝，与 §8.1 的收紧同理。
- 校验目标存在、是普通文件、不是 symlink/reparse。
- 调 `webbrowser.open(path.as_uri(), new=2)`；已删除上游的固定快照取材点见 `research/source-migration-evidence.md:33`。
- **失败不致命**：`webbrowser.Error`、`OSError` 或返回 `False`（无图形环境、无默认程序、WSL/SSH）时，退出码仍为 0，stdout 标记 `"opened": false`，由 Agent 在对话中输出 `file://` 路径兜底（R3.6）。
- stdout：`{"path": "", "opened": true|false, "reason": ""}`。
- 不读报告内容，不联网，不写任何文件。

### 9.2 硬门与声明

`SKILL.md` 硬门第 4 条列出四项授权项，其中包含「用 `open_report.py` 打开已生成的 HTML」。`interface.yaml` 的 `side_effect_policy` 同步声明该副作用（§5.7）。

## 10. 编码正确性（针对 SD-1 ~ SD-4）

`write_session_review.py` 现有显式编码是正确基线：`read_text(encoding="utf-8-sig")`、`write_text(..., encoding="utf-8", newline="\n")`、`text.encode("utf-8")` 后 `write_bytes`。新增代码沿用，并加三道回归闸：

1. **全脚本 GBK/no-env 矩阵**：`tests/gbk-no-utf8-env.test.mjs` 枚举最终 `scripts/*.py` 集合并与以下 8 项逐字符相等：6 个 CLI `scan_invocations.py`、`ensure_report_ignore.py`、`manage_review_input.py`、`write_session_review.py`、`render_review_html.py`、`open_report.py`，以及 2 个模块 `report_headings.py`、`review_contract.py`。每个子进程移除 `PYTHONUTF8` 与 `PYTHONIOENCODING`；CLI 分别运行中文+emoji fixture，模块在同环境导入并调用文本入口。Node 以 bytes 捕获 stdout/stderr 后按 UTF-8 严格解码，并输出逐 case-name 结果。
2. **内容往返测试**：两种报告及专用 JSON 写入含中文与 emoji（`✅`、`🐛`），读回字节按 UTF-8 解码与输入一致；`open_report.py` 用 stub，避免真实打开。`scan_invocations.py` 使用包含中文/emoji 的四平台 temp fixture，并同时覆盖 native-command capture。
3. **源码扫描测试**：白名单扫最终 8 个 `scripts/*.py`，断言不存在不带 `encoding=` 的 `read_text(` / `write_text(` / `open(`。按 `.trellis/spec/guides/skill-authoring-conventions.md` 的「Marker scanners must exclude their own documentation」，匹配前剥除 Python 注释与字符串字面量，避免自命中。

§6.3 的 `git` 子进程另受「UTF-8 native command capture on Windows」约束，须传 `encoding="utf-8", errors="replace"`；GBK 矩阵以实际 `scan_invocations.py` 和 writer Git probe fixture 证明该边界，而非只做静态扫描。

## 11. `SKILL.md` 与 interface 改动

- 保留工作流第 3 步扫描器的 `--skill-name`。扫描后先执行 R2.13：四平台全 missing-store 或零 invoked 时输出有界 unrated 状态并停止，不读会话切片、不构造 JSON、不写文件、不打开浏览器；只有 invoked ≥ 1 才进入原第 4 步。
- 工作流第 4 步之后插入评分步：读 `references/review-scorecard.md`，对 `invoked` 会话逐条打分，填 `language`、`skill_name`、`scores` 与 `aggregate`（含 `overall` / `grade` 声明值）；`skill_name` 必须等于后续报告 helper 的 `--name`。
- 第 5 步改为：必要时独立预览/授权并确保 ignore → 展示已确认 repo root、canonical name、三条精确路径和 create/remove/open 效果 → 取得一次具名报告包确认 → `manage_review_input.py create --name` → 两次 `write_session_review.py --name` 报告写入 → `manage_review_input.py remove --name` 提交三份 hash proof → `open_report.py --name`（§5.3、§5.4）。含确认 snapshot 漂移失效、replace 单独确认、部分失败保留与定向重跑说明（§5.5）；三类报告 helper 的 `--skill-name` 只在迁移负向测试中出现，扫描器的 `--skill-name` 仍是正向契约。
- 第 6 步聊天输出增加 HTML 的 `file://` 路径；`open_report.py` 返回 `"opened": false` 时明确提示需手动打开。仍不粘贴 SSR 表。
- 硬门第 4 条改写为四类允许副作用并明确“允许项不等于本次授权”；报告包、replace 与 `.gitignore` 分别遵守 §5.7/R5.10 的确认边界。
- 硬门新增：报告 HTML 不得包含外部资源引用或厂商推广。
- `description` 不变。
- `allowed-tools`：输入、报告与 `.gitignore` 都改由 helper 写入，不再需要 `Write`；收紧为 `Read, Glob, Grep, Bash(python *), Bash(py *), Bash(git rev-parse *), Bash(git check-ignore *)`。raw stdin 只作为 helper 载荷，不使用 shell 重定向直接写目标文件。
- `version`：`0.1.0` → `0.2.0`。
- `agents/interface.yaml` 按 §5.7 表格同步。
- `skills/developer-tools-integrations/AGENTS.md:58` 纳入同一变更：删除旧 `Write`，修正 allowed-tools Markdown 形状，并把副作用说明同步为独立 `.gitignore` helper、固定报告子树单 payload 写入和成功后的浏览器打开。`skills/developer-tools-integrations/AGENTS.md:78-83` 明确 CI 不执行 evals，因此阶段 4 另做 eval 结构/签名检查，不能只报 `just ci`。

## 12. 删除、canonical inventory 与生命周期

两个目录全部未跟踪，`git checkout` 无法恢复；`pre-bash` 钩子拒绝 `rm -rf`；移除不产生 git deletion diff。Windows 上复制、移动、复核与删除始终在 PowerShell 中完成，不跨 shell 传递枚举结果。

### 12.1 Canonical inventory 真源（TPR-02）

source、virtual-final、actual-final 与删除前复核都调用 `Get-ReviewInventorySet` / `Get-CanonicalReviewInventory` 的同一 PowerShell 实现，不再混用 Bash `sort -z` 与对完整 hash line 的 `Sort-Object`：

1. 以已验证 root 为唯一基准，递归枚举完整普通文件集合；每个文件都生成 normalized relative POSIX path 与 lowercase SHA-256，不排除 `__pycache__`。
2. `Get-CanonicalReviewInventory` 对任意 entry 集合统一按 `[StringComparer]::Ordinal` 排序 path，拼成 `<file-hash><two spaces><path>\n`，用无 BOM UTF-8 计算 collection SHA-256；不得按完整 hash line 排序。
3. **Physical identity** 对完整 entry 集合调用该函数。规划基线 source 为 `17/<physical-source-sha256>`，包含 3 个 `__pycache__` row；任何新增、缺失、改名或字节变化都改变 identity。
4. **Governed identity** 只把 path 段不含 `__pycache__` 的 14 个 entry 交给同一函数。它继续证明被纳管内容，不代替 physical identity。
5. `Get-ReviewInventorySet` 一次返回 `Physical`、`Governed` 与有序 `ExcludedPaths`；所有 mutation/reuse/recovery/cleanup 调用方必须比较 `Physical` 和 `Governed` 两者，不允许只做“ExcludedPaths 仍位于 __pycache__”的恒真类别检查。

阶段 0 用同一 source entry 集合分别固定 governed source `14/<sha256>` 与 physical source `17/<sha256>`；再为每条 source row 增加 `.removed/` 前缀副本，构造 governed final `28/<sha256>` 与 physical final `34/<sha256>`。阶段 5 actual-final、恢复、archive 前、post-closeout 与 retry proof 都必须同时匹配对应两套 identity（AC41）。复制、恢复和删除递归作用于两个精确物理目录树。

### 12.2 生命周期（TPR-03）

1. 在一个 PowerShell 进程内解析并验证固定备份父目录、目标与两个 source；由 task-scoped helper 先取得该固定目标唯一的跨进程排他 mutation lease，并在整个复制、验证、终局化、read-back 与 owned staging 清理期间持有。随后把两个 source **复制**（不是移动）到唯一 invocation-owned sibling staging。关键创建、读取、递归复制、hash 与终局化全部使用终止错误语义；staging 同时通过 governed source `14/<sha256>` 与 physical source `17/<sha256>` 验证后才终局化为 `%USERPROFILE%/.claude-skill-backup/08-29-consolidate-skill-review`。失败只清理本次 owned staging；既有 final 只有无 reparse且两套 source identity 都与当前 source 完全一致才证明式复用，否则保持不变并停止。仓库内原件始终在位。
2. 用 §12.1 同一函数记录 governed source `14/<sha256>`、physical source `17/<sha256>`，并构造 governed virtual-final `28/<sha256>` 与 physical virtual-final `34/<sha256>`。
3. 从**仓库内原件**取材，完成 §3、§4 的移植。
4. R2 全部验收通过后，在同一个 PowerShell 进程中取得并持续持有同一 task mutation lease，完成 §12.3 的全部 source/destination 预检；先把两个仓库内原件**复制**到 invocation-owned `.removed.staging-<guid>`，双 identity 验证后终局化为 `.removed/`，再验证 governed actual-final `28/<sha256>` 与 physical actual-final `34/<sha256>` 等于阶段 0 的两套 virtual-final digest，最后以终止错误语义删除两个精确 source。只有两源均确认不存在后，仓库内移除才成立。
5. 把移除证据写入本任务 `notes.md`：两套 source/virtual-final/actual-final 的有序相对路径、count/hash、执行时间、稳定占位路径与算法标识。不得写主机绝对路径（AC3、AC38、AC41）。
6. `just ci` 与全部工作提交完成后、archive **之前**，取得同一 task mutation lease，并通过 helper 的统一 fixed-backup identity 函数验证备份仍存在、目标及子树非 symlink/reparse，同时复核 governed actual-final `28/<sha256>` 与 physical actual-final `34/<sha256>`；释放 lease 后才可进入 archive。此时所有 root task AC（含 AC40）已完成。任一步失败都保留备份且不得 archive。
7. root task 全部 AC 与空 index 前置门已完成后，进入 PC2：运行 `task.py archive --no-commit`。该命令会先把 `task.json.status` 写成 `completed`，再移动任务并清理 active pointer；随后只 stage 实际 archived task 的精确路径（若 source 在 HEAD tracked，再以精确 source pathspec stage 删除），核对 cached name set 后手工产生 archive commit。因此 archive 是任务完成状态转换，PC2 的后置证明不得反向列为 task AC。
8. archive 成功后执行 Q2 已授权的 **post-closeout cleanup**：在同一个 PowerShell 进程中取得同一 task mutation lease，通过 helper 的统一 fixed-backup identity 函数重新解析路径、复核 reparse 与 §12.1 两套 inventory，并在该 lease 内删除唯一精确目录、完成删除后探测；验证、删除、残余重证与 post-delete-check 全部结束后才释放 lease。关键读取、递归枚举、hash 与删除都使用终止错误语义；有界 catch 保存原始 exception type 与发生阶段（`validation|delete|post-delete-check`），再检查残余并写 session journal。验证失败保留完整备份并 `requires_new_task: true`。删除阶段只有同时满足“权限/占用/杀毒类 exception + 残余在同一 lease 下经统一函数重新证明精确路径、无 reparse、governed `28/<sha256>` 与 physical `34/<sha256>`”才标为 `retryable`；部分、未知或任一 identity 不匹配残余标为 `requires_new_task`，不回写归档任务状态。

“可恢复”仅表示归档前的强制回退窗口；archive 后 journal 保留可审计证据，而实际副本按 Q2/PC1 成功删除后不再承诺可恢复。

### 12.3 task-scoped 备份/source 安全与失败状态（TPR-03）

实施期在 task 目录创建 `scripts/invoke-source-removal.ps1`。它是 task-scoped advanced helper，随 archive 保存为审计证据，不安装到产品 skill。helper 以 `Initialize-ReviewBackup` 和 `Invoke-ReviewSourceRemoval` 两个边界清晰的 advanced function 分别承担阶段 0 与阶段 5 mutation；两者共享唯一的 inventory-set/path/reparse 校验函数、`Enter-ReviewMutationLock` 跨进程排他 lease 与 `Assert-ReviewFixedBackupFinalIdentity` 固定备份终态校验函数，显式接收 repo root、backup root、两个固定 source name、expected governed source/final 与 expected physical source/final 四个 identity，以及适用的可注入 `[scriptblock]$CopyTree` / `[scriptblock]$RemoveTree`。默认 action 分别调用带 `-ErrorAction Stop` 的 `Copy-Item` / `Remove-Item`；生产与 temp-fixture self-test 共用真实函数，archive 前和 post-closeout 片段也只调用这些共享边界，不在 implement 文档复制第二份算法。

初始备份准备状态机（下述每个 `14/hash` 检查都与对应 `17/physical-hash` 同时执行）：

1. 在任何 mutation 前验证 repo/source、固定 backup parent/final target 的逐字符边界与 root/子树无 reparse，并从两个真实 source 同时得到 governed `14/<source-sha256>` 与 physical `17/<physical-source-sha256>`；
2. final target 不存在时，在已验证 parent 内创建带 invocation id 的唯一 sibling staging，逐个调用 `$CopyTree`，验证 staging 无 reparse且同时为同一 governed/physical source identity，再用终止错误语义终局化；final read-back 必须仍同时匹配；
3. 任一步失败只清理本次 invocation 创建且仍严格位于已验证 parent 的 staging，保留 final/source；清理失败返回有界 `backup-preparation-recovery-required`，不得猜测或递归清理其他路径；
4. final target 已存在时不覆盖、不清理。只有精确路径、无 reparse 与 current governed/physical source identity 全部成立才返回 `backup-verified-reused`；否则返回 `backup-preparation-recovery-required` 并停止；
5. `-Mode SelfTest -SelfTestScope Backup` 在唯一 temp fixture 中分别让第一次、第二次 `$CopyTree` 抛终止异常，断言 final 不出现、owned staging 被清理；随后无故障调用成功，再调用一次证明合法 final 走 `backup-verified-reused`；另持有 task mutation lease 后调用第二个 Prepare，证明其 fail-closed 且 source/final/staging identity 不变。self-test 不触碰真实 repo/backup。

阶段 5 真实模式在一个 PowerShell 进程中先完成全部预检；下述每个 governed identity 都必须与对应 physical identity 同时匹配：

1. 显式 repo root 解析为用户给出的项目根，解析值与期望值逐字符一致，root 本身不是 reparse；
2. `skills/developer-tools-integrations/` 父目录及两个 source 的绝对路径分别等于 repo root + 固定相对路径；两个 source 都是普通目录，root 与递归子树无 reparse，source 同时匹配阶段 0 的 governed `14/<source-sha256>` 与 physical `17/<physical-source-sha256>`；
3. backup root 与 `.removed` 都严格位于固定 backup parent 内，backup root/子树无 reparse；全部关键读取、递归枚举、复制和删除使用终止错误语义；
4. `.removed` 不存在时进入 `prepare`：创建 invocation-owned `.removed.staging-<guid>` 后复制两源，拒绝新 reparse，双 identity 验证通过后才终局化为 `.removed`，并验证 governed actual-final `28/<virtual-final-sha256>` 与 physical actual-final `34/<physical-virtual-final-sha256>`；
5. `.removed` 已存在时不得直接抛错或清理。只有 source 同时为 governed `14/<source-sha256>` 与 physical `17/<physical-source-sha256>`、backup/`.removed` 无 reparse且 actual-final 同时匹配 `28/<governed-final-sha256>` 与 `34/<physical-final-sha256>` 时进入 `verified-reused` 并跳过复制；否则输出 `source_removal_recovery_required`、保留全部内容并停止。

删除任一 source 抛出终止错误时，不继续后续 source；从已经证明的 `.removed/<name>` 恢复**两个** source，并同时复核 governed `14/<source-sha256>` 与 physical `17/<physical-source-sha256>`。成功输出 `source_removal_failed_recovered`、失败索引与两套 inventory 后停止；失败输出 `source_removal_recovery_required`，不得进入 5.8/CI/提交/archive。恢复成功保留 `.removed`，下一次执行按第 5 条双 identity 证明式复用，所以“可重试”不依赖手工删除证据目录。

helper 的 `-SelfTest` 只在 `New-Item` 创建的唯一临时 fixture 下运行，并在同一 resolved temp parent 内清理自身目录。它通过 shim `$RemoveTree` 分别在第一个、第二个 source 抛出终止异常，断言双源恢复、两套 source identity、停止状态和 `.removed` 保留；随后对恢复 fixture 注入无故障 action，断言状态先为 `verified-reused`、再成功移除两源。另在 `__pycache__` 注入 `unexpected.bin`，断言 governed identity 不变但 physical identity 改变，backup reuse、`.removed` reuse、恢复验收与 cleanup proof 均拒绝；再用独立 Removal fixture 预先持有 task mutation lease，证明第二个 Execute fail-closed，且 source、final 与 owned staging identity 均不变。self-test 不调用生产 repo/backup 路径，不靠真实随机权限故障。只有 self-test 全绿且真实调用返回 `removed`、两个 source 均不存在、backup 两套 actual-final identity 仍匹配，才写成功移除记录。

**提交计划不含独立的删除提交**：未跟踪文件移走后 `git diff` 为空，没有可提交内容。移除以 `notes.md` 的记录为证据，不制造审计型空提交。

## 13. 风险

| 风险 | 处置 |
| --- | --- |
| `just docs-sync` 重新生成全部 docs 页，覆盖未提交的手工修改 | 阶段 6 从 live status 捕获本任务 owned 集合；广域命令前后在同一进程复核外部 archived-task clean/manifest 与 protected workflow status/hash，任何漂移停止 |
| no-clobber 改变既有测试期望（EX-2） | `tests/write-session-review.test.mjs:86-94` 同批重写为「无 `--replace` 拒绝」+「授权替换成功」两例；已在 PRD Constraints 声明为计划内破坏性变更 |
| 报告副作用被技能硬门误读为预授权 | R5.10/§5.3 在所有 helper 前建立具名报告包精确预览与一次确认；snapshot 漂移失效，replace 和 `.gitignore` 分别确认，AC45 验证未确认时零 helper 调用 |
| 二进制浮点让语义相同的 aggregate 被拒绝或跨等级 | §3.4/§6.4 以 Decimal 为真源，均值→curve→overall 逐阶段 6 位 `ROUND_HALF_UP`，grade 对量化值判定；AC12/AC17 覆盖 `0.8+0.4`、循环小数和阈值两侧 |
| 移除 stdin/`--input` 若存在未知外部调用方会直接失败 | 仓库内唯一调用方为本技能自身；四个 Agent 主目录扫描无配置调用；仍作为未核实项与计划内破坏性变更记录 |
| 受控写入改造体量大 | 拆为阶段 3a（流程）与 3b（矩阵测试），各设审查闸；若阶段 3b 超出预期，停下重新定范围，不降低矩阵覆盖 |
| `secret` 由脱敏改为拒绝，可能拒掉正常报告 | 扫描限定为现有 `REDACT_RE` 的三类高置信模式，不引入宽泛启发式；错误信息指明命中类别但不回显内容 |
| 自动打开浏览器在无图形环境下失败 | `open_report.py` 失败退出 0 并标记 `"opened": false`，Agent 回退为输出 `file://` 路径（R3.6） |
| HTML 转义遗漏导致注入 | 所有插值统一走 `esc()`；测试断言含 `<script>` 的输入被转义 |
| 零 invoked 产生除零或伪评级 | §3.3/§5.4 在评分与写入前有界停止，shared validator 再拒绝零 invoked、零 scored_sessions 与零分母 payload；AC44 覆盖 no-store 与 no-invoked |
| 量表引入后 Agent 倾向给每个会话打分而忽略证据门槛 | §4 的条件 1、2 与 `not_filed` 非空由写入器强制（§6.4），违反则写不进去 |
| 两次写入调用中第二次失败 | §5.5 定义检测与重跑收敛路径；两份产物确定性派生，无需回滚 |
| 新报告子树契约被误当成全局放宽 | 在 spec、manifests 与测试中同时保留通用契约作为差异基线；子树 helper 触碰 `.gitignore` 或任意路径即失败 |
| inventory 排序漂移导致无损备份被误判 | governed 与 physical 的 source/virtual-final/actual-final 只用 §12.1 的同一 PowerShell 实现，path 用 ordinal 排序；阶段 0 的 28/34-row fixture 与阶段 5 两套实树 digest 必须分别一致 |
| 备份过早删除或目标解析错误 | 所有 task AC 在 archive 前完成；Q2 只授权 archive 后的精确目录作为 post-closeout cleanup。路径越界、reparse 或 governed 28/hash / physical 34/hash 任一不匹配时一律保留并写 `deleted: false`，不把后置清理报为完成 |
| 初始递归复制部分失败留下不可判定目录 | §12.3 的 `Initialize-ReviewBackup` 只写 invocation-owned staging；copy 失败 self-test 证明 final 不出现且 staging 可清理，合法既有 final 只能凭 governed 14/hash + physical 17/hash 双证明复用 |
| PC1 删除失败只剩部分残余 | exception 类别不再单独授予重试；catch 必须重新证明精确路径、无 reparse、governed 28/hash 与 physical 34/hash，否则 journal 标为 `requires_new_task` |
| 两个 source 删除发生部分失败 | §12.3 task-scoped advanced helper 提供可注入 `$RemoveTree` 与 temp-fixture self-test；失败后只执行“恢复两个 source → 复核 source hash → 留痕并停止”，恢复状态通过证明式 `verified-reused` 定向重试 |
| governed 14/28 与任意 `__pycache__` 漂移共存 | §12.1 另以不排除任何普通文件的 physical source `17/hash` 与 final `34/hash` 固定完整身份；所有 reuse/recovery/archive/PC1 同时比较两套 identity，并以 `unexpected.bin` 负向 fixture 证明 physical 漂移会阻断 |

## 14. Phase 3.4 提交确认门（TPR-06）

### 14.1 并发工作区隔离（Q4）

Q4 的 active 9 条 `??` 已完成其历史保护职责。外部任务由 `35648631` archive、`f6d21107` journal 收口后，旧 active root 必须保持 absent；不得恢复旧文件伪造基线。当前外部隔离对象改为两类：`.trellis/tasks/archive/2026-08/08-29-goal-meta-single-pass-repair/` 的 12-file tracked subtree必须 worktree/index clean、无 reparse并保持有序内容 manifest identity；`.github/workflows/agentkit-desktop.yml` 的既有 ` M` row与 SHA-256 必须保持不变且不得进入 index。archive guard先在 unresolved 精确路径上 `Get-Item -LiteralPath` 并拒绝 root reparse，再解析并验证 canonical root逐字符等于 repo 下预期位置，最后才递归检查后代；临时真实目录 + root junction（可用时加 symlink）fixture证明在递归枚举前 fail closed。对 `just docs-sync`、`just ci`、阶段 6 stage/commit、`task.py archive` 与 `add_session.py`，在**同一个 PowerShell 进程**中固定两类状态，执行单个命令后立即复算；前后不等即停止并把该命令结果视为不可归因。

不能依赖 Trellis auto-commit 代替隔离：`.trellis/scripts/common/safe_commit.py:176-187` 在 `task_name` 已给定时仍把整个 archive root 交给 `git add`，`.trellis/scripts/common/task_store.py:735-736` 随后用无 pathspec 的 `git commit` 提交当前 index；archive 后如果另一个会话成为唯一 current task，`.trellis/scripts/add_session.py:459-499` 也可能 stage 该 active task，再用无 pathspec commit。因此 archive 与 journal 路径固定使用 `--no-commit`。每次 lifecycle 写入前 index 必须为空，并先通过 root-aware external snapshot 与 reparse fixture；写入后只允许 stage 精确 archived current-task path（以及仅在 source 原已 tracked 时的精确 source 删除）或本次实际 journal/index path，cached name set 与允许集逐字符相等且不含两类 external path 后，才手工 commit。这些 archive/journal 证明组成 PC2，发生在 AC40 宣告 root AC 完成之后，不计入 AC43。

所有 apply-patch 目标、生成器输出边界、Git pathspec、候选提交和 current-task archive 输入都排除外部 archived-task subtree 与 protected workflow。阶段 6 将 workflow 单列为 `Protected external dirty files (NOT in any commit)`，将 archived subtree 记录为 `External archived task (clean; NOT in any commit)`，区别于普通 `Unrecognized dirty files`；即使用户确认本任务 commit plan，也不授权纳入。外部状态在两个受保护命令之间自行改变不自动扩张本任务权限；下一次命令若发现 status、path、manifest 或 hash 漂移则停止并重新分诊，而不是把漂移吸收到本任务。

阶段 6 的四条 Conventional Commit 消息只是规划候选，不是预授权。真正提交前按 `.trellis/workflow.md:601-631`：

1. 重新快照全部 dirty path，并学习当时最近提交的语言、scope 与长度风格；
2. 按「本轮 Agent 已编辑」与「未识别」分类，不以阶段 0 allowlist 代替实际归属判断；
3. 把本轮已编辑文件按真实 diff 分到候选提交，为每条消息列出逐文件清单；任何计划外/无法归属的普通 dirty path 单独列在 `Unrecognized dirty files`，当前 workflow 另列在 `Protected external dirty files (NOT in any commit)`，外部 archived task 以 clean/identity guard 单列；全部默认不纳入；
4. 一次性展示完整 commit plan 并等待用户 `ok` / `行` 或修订意见；确认前不得 `git add` 或 `git commit`；
5. 确认后才依获批顺序执行各工作提交，不 amend、不 push。若确认后文件清单再次漂移，原确认失效，重新展示一次实际计划；随后仍保持 work commits → archive commit → journal commit 的生命周期顺序。
