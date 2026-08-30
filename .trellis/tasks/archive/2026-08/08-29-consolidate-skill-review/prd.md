# 精简 skill 套件：删除 skill-doctor 与 update-skill，并增强 skill-session-review

## Goal

`skills/developer-tools-integrations/` 下新增了两个未纳管的上游 skill（`skill-doctor`、`update-skill`）。二者与仓库既有能力重叠、不符合本目录约定，且 `skill-doctor` 在本机 GBK 环境下运行失败。

本任务：删除这两个 skill；把 `skill-doctor` 中经验证有价值的机制并入既有的 `skill-session-review`；为 `skill-session-review` 新增可在浏览器打开的 HTML 分析报告。

## 关键决策（TPR-08）

| 日期 | 决策 | 来源 | 理由 | 状态 |
| --- | --- | --- | --- | --- |
| 2026-08-29 | 删除 `update-skill` | 用户 | 与全局 `qiaomu-meta` 职责重叠，整篇面向 Warp 仓库 | 已确认 |
| 2026-08-29 | 删除 `skill-doctor`，可学习部分并入 `skill-session-review` | 用户 | 运行失败、厂商推广嵌入、与 `skill-session-review` 重叠 | 已确认 |
| 2026-08-29 | 最终产出一个可查看的 HTML 分析报告 | 用户 | 用户明确要求 | 已确认 |
| 2026-08-29 | 第二维度由 `code-quality` 裁剪为 `instruction_fit` | 用户 | `code-quality` 评代码产物；多数目标技能不产代码，会大量落到 `insufficient_evidence` | 已确认 |
| 2026-08-29 | **给加权总分与字母等级** | 用户 | 报告顶部需要一眼可读的分数 | 已确认 |
| 2026-08-29 | **生成后自动打开浏览器** | 用户 | 少一步手动操作 | 已确认 |
| 2026-08-29 | **报告包一次确认** | 用户 | 每次运行先展示已确认 repo root、精确 input/Markdown/HTML 路径及 create/remove/open 效果，再对该具名报告包取得一次确认；任何 replace 仍展示当前 SHA-256 并单独确认 | 已确认（本轮 TPR-01） |
| 2026-08-29 | **输入改为专用 JSON 输入契约**（TPR-02 Route 其一） | 用户 | 契约明确；输入文件的受控位置、创建与清理规则一次定清 | 已确认 |
| 2026-08-29 | 专用 JSON 如何与 `governed-file-writing.md` 共存 | 用户：保留专用 JSON，并新增窄化的受控报告子树写入契约 | 新增 `.trellis/spec/backend/governed-report-subtree-writing.md`；JSON 由输入管理器在校验后落盘，报告每次只写一份，`.gitignore` 独立受现有通用契约约束 | 已确认（Q1） |
| 2026-08-29 | 写入器每次调用只写一份产物，调用两次（TPR-01 Route 其一） | 用户 | 满足 `governed-file-writing.md:30`「一次只写一个请求文件」，同时消除双文件事务与回滚 | 已确认 |
| 2026-08-29 | schema 增加受约束 `language` 枚举（TPR-03 Route 其一） | 用户 | 保留 `report-template.md:52` 既有的中英文标题行为 | 已确认 |
| 2026-08-29 | `version` 取 `0.2.0` | 用户 | 0.x 阶段的破坏性变更按 semver 升次版本号 | 已确认 |
| 2026-08-29 | **`overall` 只用两维归一化加权，不设第三项**；调用比率改为只展示 | 用户（基于实测 EX-9 否决原提案） | 原提案 `invocation_rate = invoked/(invoked+loaded+available)` 实测恒约为 0，等级封顶 B 且无区分度 | 已确认 |
| 2026-08-29 | 浏览器打开由独立 helper 承担，不放进写入器 | spec 约束 | `governed-file-writing.md:30` 禁止写入器有 execute 类副作用；打开浏览器属 execute | 已确认（受 spec 约束，无可选空间） |
| 2026-08-29 | 仓库外备份的保留期限与提交记录格式 | 用户：完整 CI、工作提交与任务归档成功后删除 | 删除前核对精确目标、非 reparse 与 canonical inventory；提交记录只写 `%USERPROFILE%/...` 占位路径、计数和清单哈希。`task.py archive` 已把任务标为 completed，因此实际删除是 archive 后的 post-closeout cleanup，结果写入随后生成的 journal，不再作为 root task AC | 已确认（Q2，同时授权满足门槛后的精确删除） |
| 2026-08-29 | **允许并发 `08-29-goal-meta-single-pass-repair` 的 9 条 dirty row 作为受保护外部集合共存** | 用户：批准实施后选择“调整本任务规划” | 该集合在并发任务完成前一直被排除于本任务写入、stage 与 commit；其 9 条历史 path/status/SHA 保护证据保留在 notes | 已完成的历史 Q4；不再作为未来 active-state 前置条件 |
| 2026-08-30 | **按外部任务已归档事实重基并发隔离** | 正式复审 TPR-01 Route A | 外部任务已由 `35648631` archive、`f6d21107` journal 收口；active root 保持 absent，不恢复旧 9 条。未来广域命令保护当前 clean 的 12-file archived subtree identity，并把 `.github/workflows/agentkit-desktop.yml` 的既有 ` M` row 作为当前 protected external dirty file 单列；继续使用空 index、`--no-commit`、精确 pathspec 与 one-shot commit plan | 已采纳；不扩张本任务权限 |

「待复核」项可按证据调整，不得当作既定范围。

## 背景事实

以下为规划取证时在本机复现的事实；其中指向实施前代码的行号统一锚定 base revision `02fc877756302e14587dda108fc33a8f4b6849e6`，当前实现证据另按 live worktree 核验。审阅报告明确列为“未能核实”的时效性或运行时事项仍按文末边界处理，不因写入本表而升级为当前已复核。

### 两者共有

| 事实 | 证据 |
| --- | --- |
| 未纳入版本控制 | `git ls-files` 对两个目录返回空；`git status -uall` 显示 14 个 canonical governed source row 全为 `??`；`git log` 无记录。递归物理枚举另有 3 个被 Git 忽略的 `skill-doctor/scripts/__pycache__/*.pyc`，因此当前物理文件是 17 个；14/28 始终是排除任一路径段为 `__pycache__` 后的 canonical inventory 行数，不是完整物理文件计数 |
| 未登记进目录约定 | `skills/developer-tools-integrations/AGENTS.md` 的技能清单不含二者 |
| 无文档页 | `docs/skills/developer-tools-integrations/` 下 11 个同类技能均有页面，二者没有 |
| frontmatter 缺字段 | `python scripts/check.py <两个目录>` 输出 `warning: Top-level category is missing`；二者均缺 `category` / `tags` / `version` |

### skill-doctor

| 编号 | 事实 | 证据 |
| --- | --- | --- |
| SD-1 | GBK 环境下单元测试失败 | 本机 `locale.getpreferredencoding(False)` = `cp936`，`sys.stdout.encoding` = `gbk`。`python scripts/test_render_report.py` → `Ran 11 tests / FAILED (errors=3)`，`UnicodeDecodeError: 'gbk' codec can't decode byte 0x9d in position 1572`；已删除源的固定快照身份与 bare `read_text()` 点位见 `research/source-migration-evidence.md:13-18` |
| SD-2 | 转写写入崩溃 | 复现 `UnicodeEncodeError: 'gbk' codec can't encode character '✅'`；已删除源的固定快照身份与 bare `write_text(...)` 点位见 `research/source-migration-evidence.md:11-20` |
| SD-3 | 评分输入被破坏 | 已删除源在三类 UTF-8 内容上使用 `read_text(errors="replace")` 且未声明编码，中文按 GBK 解码后被替换字符污染；固定快照证据见 `research/source-migration-evidence.md:11-19` |
| SD-4 | 全部 IO 未声明编码 | 8 处 `read_text` / `write_text` 均未传 `encoding="utf-8"` |
| SD-5 | `$SKILL_ROOT` 运行时未定义 | 已删除源的固定快照在四处把 `$SKILL_ROOT` 用于可执行路径，见 `research/source-migration-evidence.md:38-41`；实测该变量未设置。目录 `skills/developer-tools-integrations/AGENTS.md` 规定不得使用未设置的 bare 目录变量，要求 `<skill-dir>` 字面替换 |
| SD-6 | 解释器名硬编码 | 全篇 `python3`；`AGENTS.md` 要求保留 `python` / `py -3` 回退 |
| SD-7 | 厂商推广写入输出 | 已删除源的固定快照同时包含 `cta_url`、每次回复的 Warp Factories 推广、Warp mark/design token 与 sticky CTA/script；身份与点位摘要见 `research/source-migration-evidence.md:9-13,29-33` |
| SD-8 | 与 `skill-session-review` 路由重叠 | 两者都扫描本地 Claude Code / Codex 会话历史、判断技能使用、产出改进建议。`skill-doctor` 的 `description` 无排除条款 |
| SD-9 | 第三方资产本地未声明许可证 | `assets/pierre-diffs.js` 当前为 1,156,623 bytes（约 1.16 MB / 1.10 MiB，内嵌 Shiki/TextMate 语法），本地文件无 license/copyright/SPDX 头，注释仅称可从 `warpdotdev/skill-doctor` 取回；未联网核实上游许可证状态 |
| SD-10 | 缺接口与回归资产 | 无 `allowed-tools`、无 `evals/`、无 `agents/interface.yaml`、无 `tests/` |

### update-skill

| 编号 | 事实 | 证据 |
| --- | --- | --- |
| US-1 | 面向 Warp 仓库 | 正文称 "Warp skills"，规定技能位于 `.agents/skills/`；本仓库为 `skills/<category>/<skill-name>/` |
| US-2 | 引用不存在的示例 | 已删除源的固定快照身份与两个不存在示例的点位见 `research/source-migration-evidence.md:38-42` |
| US-3 | frontmatter 规则冲突 | 只要求 `name` + `description`；`scripts/check.py` 与 `AGENTS.md` 要求五个字段 |
| US-4 | 校验命令不可用 | 推荐 `skills-ref validate ./my-skill`，本机未安装；本仓库为 `just skills-check` |
| US-5 | 命名约定冲突 | 已删除源推荐动名词式（`processing-pdfs`），固定快照身份与实际 `278-299` 点位见 `research/source-migration-evidence.md:14,34`；本仓库同类实际为 `agents-md-improver`、`file-sorter`、`git-commit` |
| US-6 | 与 `qiaomu-meta` 职责重叠 | 全局 `qiaomu-meta` 的 Router Rules 声明自己是唯一 authoring authority，并要求不要同时调用通用 skill-creator；`update-skill` 无排除条款 |

### 既有约束事实

| 编号 | 事实 | 证据 |
| --- | --- | --- |
| EX-1 | 既有写入器不符合受控写入 spec | `.trellis/spec/backend/governed-file-writing.md:22-30` 要求写入前完整 schema 校验与 secret 扫描、默认 no-clobber、替换须带已审核 SHA-256、临时兄弟文件独占且不跟随链接、完成后回读校验、报告 Git 可见性、**一次只写一个请求文件**、**不得有 stage/commit/execute/联网副作用**。现有 `write_session_review.py:119-130` 用固定 `<dest>.tmp` + `os.replace`，无上述任何一项 |
| EX-2 | 既有测试把无授权覆盖当作应通过 | `tests/write-session-review.test.mjs:86-94` 断言第二次写入直接覆盖同一路径并返回 0 |
| EX-3 | 技能硬门只授权 `--input` 临时文件 | `SKILL.md:39`：`Write only via the helpers below: the report file, the repo-root .gitignore exact line, and helper --input temp files.` |
| EX-4 | interface 仍要求只产出 Markdown | `agents/interface.yaml:4` 的 `default_prompt` 写 `write reports/skill-session-review/<name>.md` |
| EX-5 | 既有报告有中英文标题行为 | `references/report-template.md:52`：`Use English headings when the user request is English. Keep field names stable.` |
| EX-6 | evals 不由 CI 执行 | `skills/developer-tools-integrations/AGENTS.md:78-83`：`CI does not execute them` |
| EX-7 | 报告目录已被忽略 | `.gitignore` 有精确行 `reports/skill-session-review/`；`git check-ignore` 同时覆盖该目录下的 `.md`、`.html` 与子目录 |
| EX-8 | 上游等级分档 | 已删除源固定快照中的十一档 `GRADES` 与 `curve(score) = 0.5 + 0.5 * score` 已摘录到 `research/source-migration-evidence.md:22-27` |
| EX-9 | `available` 的口径不可用于加权 | 规划取证时用 `scan_invocations.py --scope global` 实测三个技能：goal-meta-skill `invoked/loaded/available = 14/38/785`、skill-session-review `0/4/4`、ripgrep `0/11/161`。`available` 由 `scan_invocations.py:307-309` 在会话含 `host_skills` 或 `## Skills` 且出现技能名时置位，Codex 几乎每个会话都注入该段——goal-meta-skill 的 785 个 `available` 中 752 个、ripgrep 的 161 个中 150 个来自 Codex。分母实为「窗口内全部 Codex 会话」。合并审阅未重新扫描私密会话窗口，因此这些计数不是当前快照；给定计数时算术与“不计分”决定仍成立 |

## Requirements

### R1 删除

- R1: 删除两个未纳管且职责重叠的上游 skill，保留可审计的移除证据，并在归档前回退窗口内维持可恢复副本。

- R1.1 删除 `skills/developer-tools-integrations/update-skill/`（2 个 canonical governed source row；当前物理文件同为 2 个）。
- R1.2 删除 `skills/developer-tools-integrations/skill-doctor/`（12 个 canonical governed source row，含 `assets/pierre-diffs.js`；规划取证时另有 3 个被 canonical inventory 排除的 `scripts/__pycache__/*.pyc`，因此当前物理文件为 15 个）。
- R1.3 删除后仓库无悬挂引用：`skills/`、`platforms/`、`docs/`、`scripts/`、`.trellis/spec/` 内不得残留指向这两个 skill 的路径。`ref/repo/` 下的上游只读副本不在本任务范围。
- R1.4 仓库内原件的移除必须在 R2 移植取材完成之后执行；取材期间仓库内路径仍然存在。
- R1.5 两个目录的 14 个 canonical governed source row 全部未跟踪，移除不产生 git deletion diff。移除证据必须记录进可提交的任务工件：14 个 governed row 的相对路径清单、计数、执行时间、稳定占位备份路径、governed inventory 计数与 SHA-256；同时记录**不排除任何普通文件**的 physical inventory 相对路径清单、计数与 SHA-256。规划基线为 physical source `17/<physical-source-sha256>`，其中 3 条位于 `__pycache__`；virtual/actual physical final 为 `34/<physical-final-sha256>`。任一物理路径或字节漂移（包括新增 `__pycache__` 文件）都改变 physical identity 并阻断；不得写主机绝对路径。
- R1.6 仓库外备份须至少保留到 `just ci` 与全部工作提交成功，并在调用 `task.py archive` 前再次通过精确路径、目标及子树无 symlink/reparse、canonical final inventory 与任务记录一致的完整预检；archive 执行期间及成功返回时仍不得删除。归档前是本任务承诺的回退窗口；所有 root task AC（含这项预检）必须在 archive 前完成。
- R1.7 source、virtual-final、actual-final 与删除前复核同时使用两套由同一函数族生成的身份。**Governed inventory**：只从任一路径段均不等于 `__pycache__` 的普通文件生成 row；**physical inventory**：对两个精确目录树中的全部普通文件生成 row，不作路径排除。两者都以各自验证 root 为基准得到 normalized relative POSIX path，按 path 的 ordinal 顺序排序，拼接 `<lowercase-file-sha256><two spaces><path>\n`，对无 BOM UTF-8 字节计算集合 SHA-256。阶段 0 从当前 source 固定 governed `14/<sha256>` 与 physical `17/<sha256>`，并在内存分别构造 governed final `28/<sha256>` 与 physical final `34/<sha256>`（每条 source row 再加 `.removed/` 前缀副本）。阶段 5、archive 前和 post-closeout 必须同时匹配两套 final identity；完整递归复制、恢复与删除作用于两个精确物理目录树。
- R1.8 `task.py archive` 会把任务标为 `completed`。Q2 授权的精确删除因此定义为 **post-closeout cleanup**，不是 root task AC：archive 成功后按 R1.7 同时重新验证 governed `28/<final-sha256>` 与 physical `34/<physical-final-sha256>` 后再尝试删除；成功或失败均写 session journal。验证失败时保留完整备份；删除执行失败时保留原始失败类别并重新证明可见残余。只有失败发生在 `delete` 阶段、类别属于既有 Q2 的权限/占用/杀毒边界，且残余重新通过精确路径、无 reparse、两套 final identity 全量证明时，才标为可在同一 PC1 重试；部分/未知/任一 identity 不匹配的残余一律标为 `requires_new_task`，不回写已归档任务状态。
- R1.9 阶段 5 的原件移除由 task-scoped PowerShell helper 的单一 advanced function 承担，并为递归删除提供可注入 `[scriptblock]$RemoveTree`；真实执行仍在一个 PowerShell 进程内解析显式 repo root、两个精确 source 与固定 `.removed`，逐字符核对边界并拒绝 source/destination root 或子树中的 symlink/reparse。`.removed` 不存在时先复制两源并同时验证 governed final `28/<sha256>` 与 physical final `34/<sha256>`；若它已存在，只有“两源仍同时匹配 governed source `14/<sha256>` 与 physical source `17/<sha256>` + `.removed`/backup 同时匹配两套 final identity”成立时，才进入 `verified-reused` 状态并复用，不得清理后重建。随后以终止错误语义删除两个 source；任一失败时从已验证 `.removed` 恢复**两个** source，并同时复核两套 source identity、留痕并停止。helper 的 temp-fixture self-test 必须用 shim 分别注入第一个/第二个删除失败，并证明恢复状态可在相同双 identity 证明下定向重试；无效的既有 `.removed` 一律标记 `source_removal_recovery_required` 并停止。
- R1.10 阶段 0 的初始备份准备也由同一 task-scoped PowerShell helper 承担。helper 先对两个 source 和固定 backup parent/target 做精确路径、无 reparse、governed source `14/<sha256>` 与 physical source `17/<sha256>` 双预检，再复制到唯一 invocation-owned sibling staging；所有关键创建、读取、递归复制、hash 与终局化使用终止错误语义。staging 同时通过两套 source identity 后才原子式终局化到固定 backup target；失败只清理本次 invocation-owned staging，绝不清理既有 final target。final target 已存在时，只有无 reparse且两套 source identity 均与当前 source 完全一致才返回 `backup-verified-reused`，否则返回 `backup-preparation-recovery-required` 并停止。temp-fixture self-test 注入第一/第二次复制失败，证明 final target 不出现、owned staging 被清理且随后无故障调用可成功；再证明合法 final target 可复用。

### R2 机制移植（skill-doctor → skill-session-review）

- R2: 把量表、聚合与建议晋级机制移入 `skill-session-review`，并以确定性 schema 校验保证评分与 finding 归档一致。

- R2.1 **分级量表**：引入带 `label / score / description` 表的评分量表。维度为 `execution_efficiency` 与 `instruction_fit`。
- R2.2 **`insufficient_evidence` 处理**：该档位只适用于 `instruction_fit`；证据不足的 `instruction_fit` 记为独立档位并排除出该维度均值，不记 0 分。`execution_efficiency` 只允许 R2.1 的四个效率档位，不接受 `insufficient_evidence`。
- R2.3 **失败会话过滤**：改进建议只能由「至少一项分数低于阈值」的会话支撑。与既有「至少两个 `invoked` 会话」门槛合并为一套判据。
- R2.4 **提改动的判据**：吸收 file / don't-file 清单（「若当前指令已要求正确行为而模型未遵守，则不提改动」「模型方差不提」「只能重述或加例子则不提」「无可提项时逐条说明为何不提」）。
- R2.5 **理由格式**：每个评分附 1–3 句理由，并使用结构化 `locator` 引用当前会话 id 或不超过 200 个 Unicode 字符的脱敏短摘录；理由须指明可修复的成因。
- R2.6 写入器先按维度校验 `label` 属于该维度的封闭集合，并与规范中唯一的固定 `score` 完全匹配，再从 `sessions[].scores` 的规范映射值以十进制真源**重算** `aggregate`；不得信任任意输入数值。JSON 浮点用 `Decimal` 解析；维度均值、`curve` 与 `overall` 依序各自量化为小数点后 6 位，舍入规则固定为 `ROUND_HALF_UP`，等级按量化后的 `overall` 与十进制阈值比较。输入数值在相同量化规则下与 canonical 值比较；报告固定显示 6 位小数。`execution_efficiency=insufficient_evidence` 必须拒绝；只有 `instruction_fit=insufficient_evidence` 才排除出均值。重算结果与输入不一致则拒绝写入。
- R2.7 写入器校验每条 `suggestions[].finding_ids`：对应 finding 的会话至少一个在 `failed_sessions` 中，且该模式由至少两个 `invoked` 会话支撑；不满足则拒绝写入。
- R2.8 `scores.*.reason` 为对象：`sentences` 是长度 1–3 的非空单行字符串数组；`locator` 是 `{type: "session", value: <当前 session id>}` 或 `{type: "excerpt", value: <1–200 字符脱敏摘录>}`。写入器按结构校验，不从自然语言标点猜句界。
- R2.9 `suggestions[].finding_ids` 与 `not_filed[].finding_id` 必须对 `findings[].id` 形成无遗漏、无重复的精确分区；所有引用必须存在。每个未进入 suggestion 的 finding 恰有一条 `not_filed` 理由，不满足则拒绝写入。
- R2.10 R2.4 的 file / don't-file 判断与 R2.5 的“理由指出可修复成因”均不可仅靠结构机械验证，须以两个分开的人工验收清单覆盖并在任务 notes 留痕。理由语义清单逐个 `invoked` 评分核对：locator 指向的具体行为与理由一致；理由没有只复述 label/score；至少指出一个导致该评分的因果机制；至少指出一个可修复的技能指令、流程或工具/校验杠杆。任一项不满足则该评分理由不通过。
- R2.11 **加权总分与字母等级**：移植上游 `curve(score) = 0.5 + 0.5 * score` 与 `GRADES` 分档（EX-8）。
  `overall = (0.5 * curve(execution_efficiency_mean) + 0.35 * curve(instruction_fit_mean)) / 0.85`。
  上游的第三项 `skill_coverage` 不移植；不设任何替代第三项（EX-9）。权重按 `0.85` 归一化，使 `overall` 恢复完整量程、`A+` 可达。`instruction_fit_mean` 为 `null` 时按原始 `0.5` 代入并在「未能核实」中说明。`overall` 与等级由写入器计算，不采信输入值。
- R2.12 **调用比率只展示不计分**：`invoked` / `loaded` / `available` 三个计数与 `invoked/(invoked+loaded+available)` 比率在 scorecard 区块展示，作为路由健康度的诊断信息，不进入 `overall`。展示处须注明 `available` 的口径含 Codex 全量会话（EX-9），不可当作质量指标横向比较。
- R2.13 **零样本有界停止**：评分/写报告的前置条件是至少一个 `status=invoked` 会话。扫描结果为零个 invoked（无论 loaded/available 是否非零）时，工作流在读取私密切片、构造 review JSON 或调用任一 writer 前停止，只输出有界的 `unrated: no-invoked-sessions` 与四平台 coverage/counts，不计算均值、`overall`、grade 或调用比率，不创建输入/报告、不打开浏览器。四平台均为 `missing-store` 时使用更具体的 `unrated: no-session-stores`。`review_contract.py` 同时防御性拒绝零 invoked / `scored_sessions == 0` / ratio 分母为 0 的 payload，防止绕过工作流生成伪评级。
- R2.14 **调用真实性、路径 identity、事件顺序、cwd scope 与唯一会话 identity**：scanner 用共享的“规范 assistant 正文”谓词映射平台事件形状：Codex 只接受 `response_item` 下 `payload.type=message`、`payload.role=assistant` 的正文，Oh My Pi 只接受顶层 `type=message` 下 `message.role=assistant` 的正文；两者都只提取 `type` 逐字符等于精确小写 `text` / `output_text` 的显式具名块，raw string content、list 中的裸字符串及 `TEXT` / `OUTPUT_TEXT` 等非规范大小写一律拒绝。工具载体检查递归覆盖完整平台事件；任一层出现非空 `tool*` / `function_call*` 元数据 key，或任一 block `type` 含 `tool` / 以 `function_call` 开头，就整体排除该事件，包括纯正文与工具块混合事件。Codex/Oh My Pi 必须按事件顺序推进状态：只有目标实例的 `loaded` 已在更早事件成立，或在当前事件先成立，当前/后续规范 assistant marker 才可晋级 `invoked`；目标读取前出现的 marker 不缓存，也不能被事后读取追溯晋级。`Step 1` / `步骤 1` 等通用步骤词不能单独作为目标技能 marker。tool call/result/output 对技能标题、路径或步骤的回显最多证明 `loaded`，不得晋级。显式提供 `--skill-path` 时，四个平台都必须先取得归一化后逐实例相等的路径证据；name-only 结构化调用、`skills/<name>/SKILL.md` 宽泛 token 或同名异路径实例均不能归属于目标实例，也不得由 scanner 事后改写为请求路径。仅未提供 `--skill-path` 时才允许既有 name fallback。scanner 的 session/skill 路径 identity 遵循宿主平台语义：Windows 以 `normcase` 归一大小写与分隔符，POSIX 保留大小写差异，避免把大小写敏感文件系统中的两个技能实例误合并；这不改变报告 basename 的独立 R6 契约。Codex 的 store 为全局递归枚举；`scope=cwd` 且给定 `repo_root` 时，每个 rollout 必须存在可规范化的绝对 `session_meta.payload.cwd` 且逐实例等于 repo root，缺失、非法、相对路径或不相等均 fail closed；`scope=global` 不应用该 cwd 过滤。Codex 每个 rollout 的 `sessions[].id` 使用唯一的 rollout 文件名 stem，不使用 fork 间可能复用的 payload/root id。回归 fixture 必须同时覆盖四平台显式路径模式下的同名异实例不归属、Codex/Oh My Pi 各自真实 assistant 正文正例，以及 raw string/list-string、`TEXT` / `OUTPUT_TEXT` 非规范大小写、外层/嵌套 tool 元数据、`tool_output`/未来 `*tool*` 类型与正文+工具混合事件负例；还须覆盖 marker-before-read 保持 `loaded` 与 read-before-marker 晋级 `invoked`、已 loaded 后仅出现无关 `Step 1` / `步骤 1` 仍保持 `loaded`、Codex cwd metadata 缺失/非法/不匹配负例及 global 保持收集、POSIX 大小写不同路径保持不同 identity（Windows 依平台语义跳过该断言），以及两个 fork 共用 payload/root id 时仍得到两个唯一 session id。

**R2.14 的 Codex 谓词分离**：递归检查任意非空 `tool*` / `function_call*` key 与 tool-like block type 的宽泛谓词，只用于保守排除 assistant marker 事件，不得作为 `loaded` 的正向证据。Codex 正向读取谓词只接受精确 `response_item` envelope，并按 `payload.type` 白名单读取对应字段：`custom_tool_call` 的 `cmd|command|input`、`custom_tool_call_output` 的 `output`、`function_call` 的 `arguments`、`function_call_output` 的 `output`；被检查字段必须同时含受支持读取动作与可绑定当前目标实例的精确 `SKILL.md` 路径。动作识别前必须先抽取并屏蔽允许字段中的全部 `SKILL.md` 路径 span，只在路径外文本匹配结构化读取动作；目标路径目录名本身为 `rg`、`cat`、`read_file`、`read_text` 或 `get-content` 时不得自造动作证据。路径 identity 与遮蔽必须共用同一组有序、非重叠 span：已接受的 quoted path 内不得再次提取 bare suffix；quoted JSON command container 不得整段冒充 path，只遮蔽其中实际 path 并保留外部动作；raw quote 与一层或多层 JSON-escaped quote wrapper 都必须把含空格的 Windows/POSIX path 识别为完整 span。普通 assistant prose、`world_state`、`toolbox_note` 等任意 tool-like metadata、非白名单 envelope 或非白名单字段均不能建立 `loaded`；`world_state` 只能在目标 catalog path 精确绑定时建立较低的 `available`。

不移植：Warp SQLite + protobuf 采集、`assets/pierre-diffs.js`、`cta_url` 与任何厂商标识、上游的 `skill_coverage` 及其任何替代第三项（EX-9）。

### R3 HTML 报告

- R3: 由同一受控数据源生成 Markdown 与单文件 HTML 报告，并在安全失败边界内打开 HTML。

- R3.1 满足 R2.13 评分前置条件的 `skill-session-review` 运行结束后产出一个可在浏览器直接打开的 HTML 分析报告；零 invoked 的未评级停止分支不产生报告。
- R3.2 HTML 自包含：单文件，无任何报告文件之外的资源读取。生成物不得出现资源承载属性（`script[src]`、`link[href]`、`img[src]`、`iframe[src]`、`source[src|srcset]`、`object[data]`、`embed[src]`、`video[src|poster]`、`audio[src]`、`use[href|xlink:href]`），样式中不得出现任何 `url()` 或 `@import`；网络 URL、相对路径、本地绝对路径与 `file:` 均拒绝。**正文文本节点中的 URL 字符串不构成资源请求**。
- R3.3 HTML 内容覆盖现有 Markdown 报告模板的全部区块（覆盖说明、调用清单、问题清单、建议条款、未能核实、可靠部分），并加入量表得分、`overall` 与字母等级。
- R3.4 HTML 不含任何厂商 CTA、外链推广或分享水印。
- R3.5 Markdown 与 HTML 由同一份受控输入派生。二者是两次独立的受控写入，不是一次双文件事务；任一次失败后的状态必须可检测、可通过重跑同一输入收敛。
- R3.6 **两份产物写入成功后自动用默认浏览器打开 HTML**。该动作由独立 helper 承担，不放进写入器（EX-1 的「不得有 execute 副作用」）。打开失败（无图形环境、无默认程序）不使整次运行失败，回退为在对话中输出 `file://` 路径。
- R3.7 端到端人工验收分成两个独立、具名确认的分支。A 为真实 `goal-meta-skill` 工作流 smoke：扫描必须显式绑定仓库内当前真源 `--skill-path` 与已确认 `--repo-root`；若 `invoked >= 1`，才创建 A 报告包，并用实际默认浏览器记录浏览器名称/版本、`100%` 缩放、`1440×900` viewport、全部注册区块可见与无非预期水平溢出；若 `invoked == 0`，则按 R2.13 以 `unrated: no-invoked-sessions`、零私密切片读取、零输入/报告写入、零浏览器调用及三个 A 目标均不存在作为 A 分支通过证据，不得为满足浏览器条件伪造样本或改用其他 skill 实例。B 为确定性 `skill-session-review-browser-fixture`，始终用实际默认浏览器验收；输入固定包含 hostile `<script>alert(1)</script>` 文本与至少一个 finding，证明 hostile 文本不执行、finding `details` 可展开/折叠并同时复核布局。任一**适用分支**固定条件未满足则 AC6 失败，不以 AC7/AC8 的静态检查替代。

### R4 符合本目录约定

- R4: 变更遵循目录级 skill、脚本、eval、interface 与测试约定，并通过仓库完整 CI。

- R4.1 全部改动遵循 `skills/developer-tools-integrations/AGENTS.md`：`<skill-dir>` 字面替换、`python` / `py -3` 回退、`allowed-tools` 精确声明。
- R4.2 新增/修改的 Python 脚本，所有文件 IO 显式传 `encoding="utf-8"`，写入显式 `newline="\n"`。GBK/no-env 验收枚举规划完成后的全部 8 个脚本：6 个 CLI（`scan_invocations.py`、`ensure_report_ignore.py`、`manage_review_input.py`、`write_session_review.py`、`render_review_html.py`、`open_report.py`）逐个在移除 `PYTHONUTF8` / `PYTHONIOENCODING` 的子进程中运行中文+emoji fixture；2 个模块（`report_headings.py`、`review_contract.py`）在同样环境下导入并调用其文本入口。Node harness 以 bytes 捕获 stdout/stderr 后按 UTF-8 严格解码，不依赖终端 GBK 解码。
- R4.3 `skill-session-review` 的 `version` 由 `0.1.0` 升至 `0.2.0`；`description` 保持路由契约（含排除条款），删除 `skill-doctor` 后不需要为其新增排除项。
- R4.4 `evals/evals.json` 使用 `assertions` 键，新增覆盖 HTML 报告、量表与新入口的用例，并保留至少两条 routing-negative 用例。
- R4.5 新增脚本配套 `tests/*.mjs`，可被 `just node-test` 发现。
- R4.6 同批更新 `skills/developer-tools-integrations/AGENTS.md` 的 `skill-session-review` 行：移除 `Write`，登记受控 JSON、两份报告与独立浏览器 helper 的真实可达工具，并把副作用说明改为「独立受控的 repo-root `.gitignore` + 固定报告子树单 payload 写入 + 两份产物成功后打开 HTML」。该目录说明与 spec、`SKILL.md`、interface、evals、tests 使用同一命令签名。

### R5 受控写入合规（TPR-01）

- R5: repo-root `.gitignore` 变更遵守 `.trellis/spec/backend/governed-file-writing.md`；固定报告子树内的专用 JSON 与两份报告遵守 `.trellis/spec/backend/governed-report-subtree-writing.md`。后者是窄化特例，不放宽前者对其他路径的约束。

- R5.1 单次 helper 调用只改变一个 payload 文件：`ensure_report_ignore.py` 只创建或替换 repo-root `.gitignore`；输入管理器每次只创建、替换或删除专用 JSON；报告写入器由 `--format markdown|html` 选择且每次只写一份报告。固定父目录仅可在完整预检后按需创建。
- R5.2 `.gitignore`、输入与报告创建均默认 no-clobber：目标已存在时拒绝且不改动原文件。替换须显式 `--replace --expected-sha256 <64 位小写十六进制>`，并在最终写入前立即复核该哈希。
- R5.3 `ensure_report_ignore.py` 在任何文件系统变更前完成 strict UTF-8 解码、可选 BOM/LF 规范化、完整 `.gitignore` artifact 校验与 secret 扫描；输入管理器在创建/替换 JSON 前完成同级解码、完整 schema/跨字段校验（含 R2.6–R2.9、R2.11、R2.12）与 secret 扫描；报告写入器每次消费落盘 JSON 时必须再次执行同一校验与扫描。
- R5.4 三类 writer 的临时兄弟文件都必须独占创建、不跟随链接；目标或临时兄弟为 symlink/reparse、已存在外来兄弟文件时一律拒绝；清理只删除本次调用创建的文件。
- R5.5 `.gitignore`、输入与报告写入完成后均回读并校验规范化字节与 SHA-256；finalization 失败时保全旧字节并只清理 invocation-owned temp。
- R5.6 三类 writer 的 stdout 只输出有界元数据：path、operation/format、mode、bytes、sha256、Git 可见性或删除结果。不回显 `.gitignore`、JSON、报告正文或疑似 secret。
- R5.7 `ensure_report_ignore.py`、输入管理器与 `markdown`/`html` 分别覆盖适用契约的完整验证矩阵。`.gitignore` helper 必须显式覆盖 invalid UTF-8、BOM/LF、secret、完整 artifact/delta、固定 root 目标、目标与 temp 的 symlink/reparse、read-back hash、Git/非 Git 可见性及 failure safety；报告子树另覆盖缺失 root、未生效 ignore、输入篡改、部分失败重试及 proof-gated cleanup；公共工作流再覆盖四个会话平台与 `openai`/`claude`/`generic` adapter 可达性。
- R5.8 HTML 渲染模块不得提供任意 `--out` 路径的独立写入入口；独立调试只输出到 stdout。
- R5.9 输入管理器与报告写入器不得修改 `.gitignore`；`ensure_report_ignore.py` 只能按完整 artifact 契约改变这一份根文件。三类 writer 均不得 stage、commit、打开浏览器或联网，Git ignore/可见性探测是唯一允许的只读外部命令；浏览器打开、docs 同步等副作用一律在这些写入器之外。
- R5.10 **报告包显式授权门**：任何报告子树写入或浏览器打开前，工作流必须展示已确认的精确 repo root、canonical `--name`、由其派生的 `.input/<name>.json`、`<name>.md`、`<name>.html` 三条精确路径，以及本次 `create input → create Markdown → create HTML → proof-gated remove input → open HTML` 效果；用户明确确认该具名报告包后，这五项才可按固定流水线执行。确认只对当次 root/name/path/effect 快照有效，任何漂移即失效。目标已存在时，原报告包确认不授权 replace；必须另行展示每个待替换目标的当前 SHA-256、精确路径与替换效果并取得显式确认。repo-root `.gitignore` 仍按通用契约独立预览与授权，不并入报告包确认。

### R6 专用 JSON 输入契约（TPR-02 Route 其一）

- R6: 保留专用 JSON；输入身份、生命周期与公共接口必须唯一、可验证，并符合 `governed-report-subtree-writing.md`。

- R6.1 报告写入器的输入为一个专用 review JSON 文件，经 `--review-json <path>` 传入；报告写入器移除 stdin 与 `--input` 两条旧路径。新增输入管理器仅在 `create`/`replace` 操作中通过 raw stdin 接收完整 JSON。
- R6.2 **受控位置、身份与报告 basename flag**：仅输入管理器、报告写入器和浏览器 helper 这三类**报告 basename 消费方**统一使用新规范定义的 `--name <safe-basename>`；它们不保留 `--skill-name` 别名。会话扫描器的查询参数仍是既有 `scan_invocations.py --skill-name`，不属于报告子树 basename 契约，也不在本任务迁移范围。输入文件解析后的绝对路径必须与由安全 `--name` 唯一派生的 `<repo-root>/reports/skill-session-review/.input/<name>.json` 完全相等；拒绝错误 basename、嵌套子目录、错误扩展名/大小写、traversal、symlink 与 reparse point。该目录被 `.gitignore` 的既有精确行覆盖（EX-7），不新增忽略行。
- R6.3 **生命周期与并发删除边界**：评分后由输入管理器校验并 no-clobber 创建；两次报告写入共用同一文件且各自重新校验；任一报告失败时保留输入供定向重试。两份报告成功后，输入管理器按固定 `input → Markdown → HTML` 顺序取得与 writer 共用的三个 destination lease，在全部 lease 内重读并校验 input 与两份报告 proof；最终 input 读取必须绑定打开对象的文件 identity，删除前紧邻确认路径仍指向该 identity，只删除该对象。live lease contention、proof 后 input/artifact replace 或 inode swap 均须 fail closed 并保留未经本次 proof 授权的新对象；成功只删除已证明的输入 JSON。
- R6.4 `SKILL.md` 硬门（EX-3）改写为四类**允许在取得相应授权后执行**的副作用：两份报告产物、repo-root `.gitignore` 精确行、`.input/<skill-name>.json` 输入文件、以及打开报告的 helper；列出允许项本身不构成授权。报告包使用 R5.10 的一次具名确认，`.gitignore` 与任何 replace 仍分别确认。
- R6.5 `agents/interface.yaml` 的 `default_prompt`（EX-4）与 `side_effect_policy` 同步为「受控输入管理器持久化专用 JSON → Markdown + HTML 两份独立产物 → proof-gated 输入清理 → 打开浏览器」；如 ignore 未生效，先按通用契约单独处理 `.gitignore`。
- R6.6 `evals/evals.json` 同步覆盖新入口与两份产物。
- R6.7 `SKILL.md` 工作流步骤同步为先执行 R5.10 的精确预览/报告包确认，再输入创建、两次报告写入、proof-gated 输入删除与一次打开调用，并说明第二次写入失败时如何检测与重跑收敛；定向重跑涉及 replace 时重新展示目标当前 SHA-256 并单独确认。
- R6.8 **payload 身份绑定**：schema 保留 `skill_name`，但它不是独立身份源。输入管理器的 create/replace 与报告写入器每次消费都必须把已验证的 canonical `--name` 传给共享校验器，并要求 `review.skill_name` 与其逐字符相等；不一致时在任何目录、temp 或目标变更前退出 6。两个 renderer 只消费已通过该绑定的 payload。

### R7 报告语言（TPR-03）

- R7: 报告语言由受约束字段决定，两个渲染器共享同一标题字典并保持字段名稳定。

- R7.1 review JSON 增加必填字段 `language`，取值受约束枚举 `zh` | `en`，由 Agent 依用户请求语言填写。渲染器不得从正文猜测语言。
- R7.2 Markdown 与 HTML 两个渲染器共享同一份标题字典，不各自判断语言。
- R7.3 中文与英文各一组回归用例，断言区块标题按 `language` 切换而字段名保持稳定（EX-5）。

### R8 Trellis 提交确认门

- R8: 工作提交必须遵守 `.trellis/workflow.md` Phase 3.4 的实际 dirty-state 与 one-shot confirmation 契约。

- R8.1 阶段 6 的四条 commit message 只是候选分组。提交前重新快照全部 dirty path，按「本轮已编辑 / 未识别」分类，为每个候选提交列出**实际文件清单**，把未识别文件单独列出并展示一次 commit plan；只有用户对该实际计划给出一次性确认后，才可依序 `git add`/`git commit`。未确认、清单漂移或存在未决未识别文件时不得提交；保持不 push、不 amend，以及 work commits → archive commit → journal commit 的顺序。

- R8.2 Q4 的 active 9 条 `??` 是已经完成的历史保护证据，不再是未来命令的存在性要求。当前 HEAD `f6d21107` 已包含外部任务的 archive commit `35648631` 与 journal 收口；`.trellis/tasks/08-29-goal-meta-single-pass-repair/` 必须保持 absent，不得为满足旧基线而恢复。未来每个可能扫描、生成、stage、commit 或迁移较大范围的命令前后，在同一 PowerShell 进程保护两类当前外部状态：一是 `.trellis/tasks/archive/2026-08/08-29-goal-meta-single-pass-repair/` 的 12 个 tracked regular files保持 worktree/index clean、无 reparse 且有序内容 manifest identity 不变；在任何 `Resolve-Path` 或递归枚举前先对精确 unresolved archive root 执行 `Get-Item -LiteralPath` 并拒绝 root `ReparsePoint`，解析后 canonical path 必须与 repo 下的精确预期位置逐字符相等，后代也逐项拒绝 reparse。二是 `.github/workflows/agentkit-desktop.yml` 保持既有 ` M` status 与 SHA-256，不被本任务写入或 stage。阶段 6 必须从 live status 重新捕获本任务 owned dirty files，把该 workflow 单列为 `Protected external dirty files (NOT in any commit)`，并确认 archived subtree 不出现在 dirty/index；任何其他未识别项单列且默认不纳入。本任务所有编辑目标、generator output、pathspec 与提交清单都排除这两类外部状态。`task.py archive` 与 `add_session.py` 必须使用 `--no-commit`；每次 lifecycle 写入前要求 index 为空，写入后仅 stage 精确 archived current-task path 或本次实际 journal/index 文件，cached name set 与 allowlist 逐字符相等后再手工提交。

## Acceptance Criteria

- [ ] AC1 (R1.1, R1.2) `git status -uall skills/developer-tools-integrations/` 不再列出 `skill-doctor/` 或 `update-skill/` 下任何路径。
- [ ] AC2 (R1.3) `rg -n "skill-doctor|update-skill" skills platforms docs scripts .trellis/spec` 无命中（`ref/` 除外）。
- [ ] AC3 (R1.5, R1.7) 任务工件中存在移除记录，含 governed source `14/<sha256>`、governed virtual/actual final `28/<sha256>`，以及不排除任何普通文件的 physical source `17/<sha256>`、physical virtual/actual final `34/<sha256>`；四类身份均含有序相对路径清单、计数、执行时间、稳定占位备份路径且不含主机绝对路径。source、backup/reuse、`.removed`、恢复、archive 前与 PC1 的对应双 identity 完全一致；任一新增/缺失/变更的物理路径均使 physical identity 不匹配并阻断。
- [ ] AC4 (R4.1, R4.3) `python scripts/check.py skills/developer-tools-integrations/skill-session-review` 通过且无 warning；`version` 为 `0.2.0`。
- [ ] AC5 (R4.2) 在本机 GBK 环境下同时移除 `PYTHONUTF8` 与 `PYTHONIOENCODING`，专用 Node fixture 逐项覆盖规划后的全部 8 个 `scripts/*.py`：6 个 CLI 分别以中文+emoji 输入运行，2 个模块分别导入并调用文本入口；harness 以 bytes 捕获 stdout/stderr 并按 UTF-8 严格解码。每个列名脚本均不得抛 `UnicodeEncodeError` / `UnicodeDecodeError`，case-name 清单与实际 `scripts/*.py` 集合精确相等。
- [ ] AC6 (R2.13, R3.1, R3.7) A 使用显式仓库真源 `--skill-path`、已确认 `--repo-root` 与 `scope=global` 执行真实 `goal-meta-skill` 扫描：若 `invoked >= 1`，A 页面须以实际默认浏览器从 `file://` 打开，并在任务 notes 记录浏览器名称/版本、`100%` 缩放与 `1440×900` viewport；scorecard 与全部注册区块须可见且 `scrollWidth <= clientWidth`；若 `invoked == 0`，任务 notes 须记录 `unrated: no-invoked-sessions`、四平台 counts、零私密切片读取、零 writer/open 调用，以及 A input/Markdown/HTML 三目标均不存在。B 的确定性 `skill-session-review-browser-fixture` 始终明确含 hostile `<script>alert(1)</script>` 文本与至少一个 finding，并用实际默认浏览器在 notes 记录浏览器名称/版本、`100%` 缩放与 `1440×900` viewport；页面须以 `file://` 打开、hostile 文本不执行、`scrollWidth <= clientWidth`，该 finding 的 `details` 可展开并再次折叠。任一适用分支固定条件失败则本 AC 失败。
- [ ] AC7 (R3.2, R3.4) 静态校验脚本拒绝任意资源承载属性、任意 CSS `url()`/`@import`，并覆盖网络 URL、相对路径、本地绝对路径、`file:` fixture；文件内无 `warp` 字样。正文文本节点含 `https://example.test` 短摘录时仍通过。
- [ ] AC8 (R3.3) HTML 报告包含覆盖说明、调用清单、问题清单、建议条款、未能核实、可靠部分六个区块，以及量表得分、`overall` 与字母等级。
- [ ] AC9 (R3.5) 同一份 review JSON 生成的 Markdown 与 HTML 中，同一 finding、同一得分同时出现；重跑同一输入后两份产物的 SHA-256 与首次一致。
- [ ] AC10 (R2.1, R2.2) `references/` 中存在量表文件：`execution_efficiency` 含四个效率档位的 `label / score / description`，`instruction_fit` 含 `fit / misfit / insufficient_evidence` 的 `label / score / description`；文件明确 `insufficient_evidence` 只属于 `instruction_fit`。
- [ ] AC11 (R2.1, R2.2, R2.6) fixture 测试：输入含顺利、失败及 `instruction_fit` 证据不足三类会话；每个 label/score 与其所属维度的规范映射一致；按 R2.6 的 Decimal/6 位 `ROUND_HALF_UP` 顺序重算的 `aggregate` 与手工期望值一致；`instruction_fit=insufficient_evidence` 不拉低该维度均值，全部 `instruction_fit` 都为该档位时仅 `instruction_fit` 为 `null`。`execution_efficiency=insufficient_evidence` 或任一 label/score 错配时拒绝且无文件系统变更。
- [ ] AC12 (R2.2, R2.6) fixture 测试：覆盖 `0.8 + 0.4`、循环小数均值、等级阈值上下各 `0.000001` 与不同等价 JSON 小数写法；输入 `aggregate` 只有在按 R2.6 同一 Decimal/分阶段 6 位量化规则与 canonical 值一致时通过，不一致时拒绝写入且不产生目标文件或临时残留。
- [ ] AC13 (R2.3, R2.7) fixture 测试：`suggestions` 引用的 finding 不在 `failed_sessions` 中，或支撑的 `invoked` 会话少于两个时，拒绝写入。
- [ ] AC14 (R2.5, R2.8) 纯结构 fixture 测试：`reason.sentences` 为空、超过三项、含空项/换行，或 `locator` 类型非法、session id 不匹配、excerpt 超过 200 字符/含 secret 时拒绝写入；中英文理由使用同一结构规则。本 AC 不替代 AC16 的理由语义判断。
- [ ] AC15 (R2.4, R2.9) fixture 测试：finding id 在 suggestions/not_filed 中缺失、重复、未知或同时出现时拒绝；合法输入中每个未提项恰有一条 `not_filed` 理由。
- [ ] AC16 (R2.4, R2.5, R2.10) 人工验收已执行并在任务 notes 分两张清单留痕：其一逐 finding 核对 file / don't-file；其二逐个 `invoked` 会话的两个评分理由核对 locator 与行为一致、没有只复述 label/score、指出至少一个因果机制、指出至少一个可修复的技能指令/流程/工具或校验杠杆。每项记录 pass/fail 与有界理由，任一 fail 阻断验收。
- [ ] AC17 (R2.11) fixture 测试：给定已知 `sessions`，写入器按 R2.6 的 Decimal/分阶段 6 位量化规则算出的两个 `curve` 值、`overall`（按 `/0.85` 归一化）与字母等级和手工期望一致；覆盖至少三个等级档及阈值两侧；断言两维满分时 canonical `overall == 1.000000` 且等级为 `A+`。
- [ ] AC18 (R2.11) fixture 测试：`instruction_fit` 为 `null` 时，加权按原始 0.5 代入，且「未能核实」区块出现对应说明。
- [ ] AC39 (R2.12) `aggregate` 中不存在参与加权的第三项字段；scorecard 区块展示 `invoked`/`loaded`/`available` 计数与比率，并带 `available` 口径的注记；改变该比率不改变 `overall` 与等级。
- [ ] AC19 (R4.4, R6.6) `evals/evals.json` 使用 `assertions` 键，含 HTML 报告、量表、新入口相关用例，且 routing-negative 用例不少于两条。
- [ ] AC20 (R5.1) `.gitignore` helper、输入管理器与报告写入器单次调用都只改变一份 payload；无 `--format` 或值非法时报告写入器拒绝执行。
- [ ] AC21 (R5.2) 对 `.gitignore`、输入、Markdown、HTML 分别测试：目标已存在时无 `--replace` 拒绝且原文件字节不变；过期哈希拒绝且原文件字节不变；正确哈希替换成功，并在 finalization 前复核。
- [ ] AC22 (R5.3) `.gitignore` helper 覆盖 invalid UTF-8、BOM/LF 规范化、完整 artifact/delta 非法与疑似 secret；输入管理器与报告写入器分别覆盖 schema 非法、跨字段失败与疑似 secret。所有拒绝均发生在该次调用的任何文件系统变更之前，不留下目标、父目录或 temp；落盘 JSON 被篡改后报告写入器仍重新拒绝。
- [ ] AC23 (R5.4) 对 `.gitignore`、输入、Markdown、HTML 分别覆盖目标为 symlink/reparse，以及临时兄弟为既有普通文件或 symlink/reparse 的拒绝路径；链接目标、原目标与外来残留均不变，清理只删除 invocation-owned temp。
- [ ] AC24 (R5.5) `.gitignore`、输入、Markdown、HTML 写入成功后 stdout 的 sha256 均与规范化磁盘回读值一致；注入 finalization 失败时旧字节保全且无 owned-temp 泄漏。
- [ ] AC25 (R5.6) 三类 writer 的 stdout 仅含 path/operation/format/mode/bytes/sha256/git 可见性或删除结果；测试断言 `.gitignore`/JSON/报告正文与疑似 secret 均不出现在 stdout。
- [ ] AC26 (R5.7) `ensure_report_ignore.py`、输入管理器与 `markdown`/`html` 分别覆盖适用契约的全部验证矩阵；`.gitignore` helper 明确覆盖编码/secret/artifact/path-link/read-back/Git/failure-safety，报告子树明确覆盖缺失 root、ignore 未生效、输入篡改、部分失败重试与 proof-gated cleanup，并以全平台 fixture 与 adapter 循环证明公共工作流可达。
- [ ] AC27 (R5.8) HTML 渲染模块无接受任意目标路径的写入入口。
- [ ] AC28 (R5.9) 测试断言输入管理器与报告写入器不改变 `.gitignore`，`ensure_report_ignore.py` 不改变 `.gitignore` 之外的文件；三类 writer 均不改变 git 索引、不启动非只读 Git 外部程序、不发起网络请求。
- [ ] AC29 (R6.1, R6.2, R6.8) 三类报告 basename 消费方（输入管理器、报告写入器、浏览器 helper）都以 `--name` 为唯一 basename flag，并拒绝其中的旧 `--skill-name`；扫描器继续以 `scan_invocations.py --skill-name` 正向工作。仅精确 `.input/<name>.json` 可作为专用输入，目录外、错误 basename、嵌套子目录、错误扩展名/大小写、traversal、symlink/reparse 均拒绝；payload `skill_name` 与 `--name` 不一致时 create/replace 和每次报告消费都在任何文件系统变更前退出 6。报告写入器拒绝 stdin 与旧 `--input`；输入管理器仅在 `create`/`replace` 接受 raw stdin。
- [ ] AC30 (R6.3) `SKILL.md` 已写明受控创建、两次调用共用、部分失败保留，以及仅在固定顺序取得 input/Markdown/HTML 三个 destination lease 后、全部 proof 在 lease 内重读匹配且 input 路径仍绑定最终读取 identity 时删除；测试逐一覆盖缺失/过期 proof、live lease contention、proof 后 input replace、artifact replace，以及 input/artifact **字节与 hash 均相同但 file identity 不同**的 inode swap，均不得删除未经证明的新对象；proof 完整且 identity 未漂移时才只删除输入。
- [ ] AC31 (R6.4) `SKILL.md` 硬门条目已列出四类允许副作用，并明确“允许项不等于本次授权”：报告子树与打开动作受 AC45 的具名报告包确认约束，`.gitignore` 更新是报告子树 helper 之外的独立通用受控写入，任何 replace 另行确认。
- [ ] AC32 (R6.5) `agents/interface.yaml` 的 `default_prompt` 与 `side_effect_policy` 均已描述专用 JSON 输入、两份产物与打开浏览器。
- [ ] AC33 (R6.7) `SKILL.md` 已写明先预览并取得具名报告包确认，再调用输入管理器、两次报告写入、proof-gated 删除和一次打开；同时写明部分失败的检测/重跑步骤，以及 replace 前展示当前 SHA-256 并再次确认。
- [ ] AC34 (R3.6) `scripts/open_report.py` 校验目标位于 `reports/skill-session-review/` 内后调用 `webbrowser`；测试覆盖：路径在目录外拒绝；`webbrowser.open` 抛异常或返回 False 时退出 0 并在 stdout 标记未打开。
- [ ] AC35 (R7.1, R7.2) 缺少 `language` 或取值非枚举时拒绝写入；两个渲染器引用同一标题字典（源码中只有一处定义）。
- [ ] AC36 (R7.3) `language: "zh"` 与 `"en"` 各一组回归用例，断言标题切换而字段名不变。
- [ ] AC37 (R4.5) `just ci` 全绿（含 `docs-check`、`skills-check`、`python-check`、`node-test`、`git diff --check`）。
- [ ] AC38 (R1.4) 移除记录中的执行时间晚于 R2 移植取材完成时间；量表与 finding-contract 的取材内容在原件移除前已落盘。
- [ ] AC40 (R1.6) 调用 `task.py archive` **之前**，`just ci` 与全部工作提交已成功，备份仍存在，精确路径、目标及子树无 reparse、actual-final count/hash 与 notes 一致；root task 的全部 AC 在此时均已满足，archive 是随后发生的完成状态转换。
- [ ] AC41 (R1.7, R1.9, R1.10) 阶段 0 从同一 source 同时构造 governed source `14/<sha256>`、physical source `17/<sha256>`、governed virtual-final `28/<sha256>` 与 physical virtual-final `34/<sha256>`；同一 path-ordinal/row-hash 实现用于阶段 5 actual-final、恢复、archive 前和 PC1/retry proof，所有对应 digest 完全一致。初始备份 self-test 注入第一/第二次复制失败，均断言 final target 不存在、仅 invocation-owned staging 被清理，随后无故障调用成功，并证明合法既有 final target 只有同时匹配两套 source identity 才返回 `backup-verified-reused`。source-removal self-test 注入第一/第二次删除失败，均断言两个 source 恢复后同时匹配 `14/<governed-source-sha256>` 与 `17/<physical-source-sha256>`、状态为 `source_removal_failed_recovered` 且停止；再证明 `.removed` 只有同时匹配 `28/<governed-final-sha256>` 与 `34/<physical-final-sha256>` 才进入 `verified-reused` 并成功重试。另加负向 fixture：在 `__pycache__` 新增 `unexpected.bin` 后 governed identity 不变但 physical identity 改变，所有 reuse/recovery/archive/PC1 入口均拒绝。真实阶段 5 逐字符核对 repo/source/destination、拒绝 reparse、使用终止错误；任一 identity 不匹配记录 `source_removal_recovery_required` 并停止。排序键为 normalized relative POSIX path，而不是完整 hash line。
- [ ] AC42 (R4.1, R4.6, R6.2, R6.5, R6.6) `.trellis/spec/backend/governed-report-subtree-writing.md`、`SKILL.md` 的**报告写入步骤**、`agents/interface.yaml`、`skills/developer-tools-integrations/AGENTS.md`、报告流程 evals 与命令契约 tests 对三类报告 basename 消费方作同一断言：canonical flag 为 `--name`，旧 `--skill-name` 仅在这些消费方的负向迁移用例出现；`SKILL.md` 的扫描步骤与 `invocation-signals.md` 继续正向使用扫描器 `--skill-name`。目录 AGENTS 行不再含 `Write`，其 allowed-tools 与副作用说明和实际 helper 流程一致。evals 结构单独校验，不以 `just ci` 代证执行。
- [ ] AC43 (R8.1, R8.2) 历史 active 9 条的保护结果保留在 notes，但未来硬门以当前状态为准：旧 active root absent；外部 archived task 的 unresolved root 在解析/枚举前非 reparse，解析后的 canonical path 精确等于预期位置，12-file tracked subtree在广域命令前后均 clean、后代无 reparse、内容 manifest identity 不变；临时 root junction/symlink fixture 证明 guard 在递归枚举前 fail closed。`.github/workflows/agentkit-desktop.yml` 的既有 ` M` status/SHA-256 前后不变且未进入 index。任一工作提交前按 Phase 3.4 重新快照 live dirty state，逐项分类本任务 owned、未识别与 protected external，展示一次含实际逐提交文件清单及两类排除项的 commit plan，并取得 one-shot confirmation；确认前无 `git add`/`git commit`，确认后只以本任务精确 pathspec 按获批顺序提交且不 push、不 amend。archive 前 index 为空，外部 archived subtree 与 workflow 均未被本任务写入或 stage；archive/journal 的后置隔离与精确提交由 PC2 判定，不反向充当 root task AC。
- [ ] AC44 (R2.13, R3.1) 三组 workflow/validator fixture 均通过且无文件系统副作用：四平台 store 全部 `missing-store` → `unrated: no-session-stores`；store 可用但零 `invoked`（可含 loaded/available）→ `unrated: no-invoked-sessions`；四类计数全零/ratio 分母为零的 review payload → 共享校验退出 6。前两组不读取会话切片、不创建 `.input`/Markdown/HTML、不调用浏览器；任一零 invoked payload 都不能生成 `overall`/grade/ratio。
- [ ] AC45 (R5.10, R6.4, R6.7) workflow/eval/contract fixture 证明：未确认时只输出已确认 repo root、canonical `--name`、三条精确路径与 create/remove/open 效果，不调用任何 helper；用户对该快照明确确认后才按一次报告包执行 create input、create Markdown、create HTML、proof-gated remove 与 open。root/name/path/effect 任一漂移使确认失效。任一目标已存在时，原确认不授权 replace；必须先展示目标当前 SHA-256 和替换效果并取得单独确认。`.gitignore` 的 preview/authorization 始终独立。
- [ ] AC46 (R2.14) scanner 回归测试证明：显式 `--skill-path` 模式下 Claude/Grok/Codex/Oh My Pi 都只把归一化后精确等于目标实例路径的证据归属于目标，name-only 或同名异路径实例不进入目标 sessions、不能晋级，也不会被事后标成请求路径；Codex `response_item/payload.message` 与 Oh My Pi 顶层/nested `message` 分别映射到共享的规范 assistant 正文，只有 `type` 逐字符等于精确小写 `text` / `output_text` 的显式 block 中的目标技能 workflow marker 可把已绑定实例晋级为 `invoked`。两平台各有真实正文正例，以及 raw string/list-string、`TEXT` / `OUTPUT_TEXT` 非规范大小写、外层与嵌套 tool 元数据、`tool_output`/未来 `*tool*` 类型、正文+工具混合事件负例；任一负例都保持 `loaded`。Codex/Oh My Pi 的 marker-before-read 保持 `loaded`，read-before-marker 才晋级 `invoked`；已 loaded 后仅出现无关 `Step 1` / `步骤 1` 仍保持 `loaded`。Codex `scope=cwd` 对缺失、非法/相对、无法规范化或不匹配 repo root 的 `session_meta.payload.cwd` 全部排除，matching cwd 保留，且同一 fixture 在 `scope=global` 仍全部收集。路径比较在 Windows 按 `normcase` 大小写不敏感，在 POSIX 保留大小写并拒绝把 `Skill/SKILL.md` 与 `skill/SKILL.md` 合并；两个 Codex fork rollout 即使共享 payload/root id，输出的 `sessions[].id` 仍分别等于各自唯一 rollout filename stem。`tests/valid-review.json` 作为 writer/workflow 的共享有效 review fixture 被实际消费，不是孤立 seed。

AC46 的 Codex 载体子矩阵还必须证明：四种白名单 `response_item.payload.type` 都可从各自允许字段建立精确目标读取；`toolbox_note + assistant 读命令文本 + 后续规范 marker` 只能保持 `available`/未命中，不得成为 `loaded` 或 `invoked`；普通 `world_state` 不得作为读取证据。另以 `get-content`、`read_file`、`read_text`、`cat`、`rg` 分别作为目标路径目录名，证明白名单载荷只有 path、路径外没有动作时均保持 `available`，而真实“动作 + path”正例仍晋级。四类 carrier 的 JSON command 无内层 path 引号正例，以及四类 JSON-escaped double-quoted 含空格 path 正例，都必须保留动作并晋级；一层和二次编码的带空格 target/other 对分别证明完整 target 可绑定、other 不得生成可命中当前 target 的 bare suffix，并以直接 extractor fixture 同时锁定 Windows/POSIX 完整 span。该矩阵与既有 marker-before-read/read-before-marker、cwd fail-closed/global、完整 assistant tool-bearing 排除矩阵同时通过。

## Post-closeout cleanup 判据（非 root task AC）

- PC1 (R1.8) `task.py archive` 成功后，在同一 PowerShell 进程中重新解析固定备份路径、拒绝目标或子树 reparse，并用 R1.7 同一实现同时复核 governed final `28/<sha256>` 与 physical final `34/<sha256>`，再删除唯一精确目录。成功时 journal 记录占位路径、两套 hash 与 `deleted: true`；验证失败时保留完整备份。删除执行失败时，journal 保留原始 failure phase/category，并记录有界 residual/retry-proof 状态；只有 delete 类别符合既有 Q2 边界且残余重新通过精确路径、无 reparse、两套 final identity 证明时才写 `retryable: true`，部分/未知/任一 identity 不匹配残余写 `requires_new_task: true`。任何失败都不得把 post-closeout cleanup 报为完成。
- PC2 (R8.2) archive 与 journal 是 root AC 全部完成后的 lifecycle 写入。二者分别用 `task.py archive ... --no-commit` 与 `add_session.py ... --no-commit`，各自在同一 PowerShell 进程用已通过 root-junction/symlink fail-closed fixture 的 snapshot helper 比较 unresolved/canonical archive-root identity、后代 reparse、12-file clean/manifest 与 protected workflow status/SHA-256。archive 前 index 必须为空；archive 后只 stage 精确 archived current-task path（仅当 source 原已 tracked时再 stage 精确 source 删除），journal 后只 stage本次 current developer 的实际 `journal-*.md`/`index.md` 差集。每次 cached name set 必须逐字符等于对应 allowlist，且不含外部 archived-task path或 protected workflow，才手工 commit。任一外部漂移、unexpected staged path 或 lifecycle 提交失败均停止、保留现状并报告 `post-closeout isolation: pending`；不得重跑已成功的 archive，也不得把 PC2 报为完成。

## Constraints

- 本仓库 `pre-bash` 钩子拒绝 `rm -rf`；Windows 上复制、恢复与递归删除全程使用同一个 PowerShell 进程中的 `Copy-Item` / `Remove-Item`，不跨 shell 传递枚举结果；全部 source/destination 预检先于任何阶段 5 变更，所有递归命令使用终止错误语义。
- 两个待删 skill 全部未跟踪，`git checkout` 无法恢复；移除前必须先复制到仓库外备份。强制可恢复窗口持续到 archive 前 AC40 完成；archive 后按 PC1 执行已授权的后置清理。
- 不改动 `ref/repo/` 下的上游只读副本。
- 不修改 `skill-session-review` 的既有硬性边界：不写入目标 skill 目录、不产出 `diff.patch`、不在对话里打印完整私密会话、不调用 qiaomu-meta。
- 输入文件与两份产物同在 `reports/skill-session-review/` 子树内，已被 `.gitignore` 精确行覆盖（EX-7），本仓库无需新增忽略行；报告子树 helper 永不修改 `.gitignore`。
- 写入器改为 no-clobber 会改变现有 `tests/write-session-review.test.mjs:86-94` 的期望行为（EX-2）；该测试须同批重写，属计划内的破坏性变更。
- 报告写入器移除 stdin 与 `--input`，且三类**报告** basename 消费方统一从旧报告参数 `--skill-name` 迁移到 canonical `--name`，均是 CLI 破坏性变更；不保留旧报告 flag 别名。扫描器 `scan_invocations.py --skill-name` 是独立查询契约，保持不变。新增输入管理器使用 raw stdin 并负责专用 JSON 的受控生命周期。仓库内唯一报告写入调用方为本技能自身，同批改写；未知外部消费者仍保持未核实。

## Out of Scope

- 不移植 Warp 会话采集（SQLite + protobuf 解码）。
- 不为 `skill-session-review` 新增多技能批量评级能力（`overall` 只对单个技能计算）。
- 不清理 `ref/repo/` 下引用这两个 skill 的上游只读副本。
- 不调整 `qiaomu-meta` 全局 skill。
- 不把受控写入合规改造推广到本仓库其他写入器。

## 审阅处理记录

| TPR | 严重度 | 采纳的 Route | 落点 |
| --- | --- | --- | --- |
| TPR-01 | 阻断 | **已选：保留专用 JSON并新增 `governed-report-subtree-writing.md`**；输入先校验后落盘，报告逐格式独立写入，proof-gated 删除，`.gitignore` 留在通用契约下独立处理 | R5、R6、AC20–AC33、design §5～§6 |
| TPR-02 | 阻断 | **其一：改为专用 JSON 输入契约**，一次同步硬门、输入文件生命周期、调用步骤、interface 与 evals | R6、AC29–AC33、design §5 |
| TPR-03 | 阻断 | 其一：schema 加受约束语言字段 + 共享标题字典 + 中英文回归用例 | R7、AC35–AC36、design §7 |
| TPR-04 | 应修 | 为每个 AC 加 R 注解；为 R2.2–R2.5 加确定性 fixture，判断性部分转人工验收 | R2.6–R2.10、AC11–AC16、全部 AC 加注解 |
| TPR-05 | 应修 | 其一：改为资源承载标签/属性与 CSS 引用的静态校验，加「正文含安全 URL」fixture | R3.2、AC7 |
| TPR-06 | 应修 | 其一：把「干净」改为精确允许清单 | implement 阶段 0 |
| TPR-07 | 应修 | **已选：临时备份到 CI、工作提交与 archive 均成功**；任务记录只写稳定占位路径与 inventory；archive 后核验精确目标再删除并在 journal 记录。完成语义已由本轮 TPR-03 进一步收紧为 post-closeout cleanup | R1.4～R1.8、AC3、AC38、AC40、PC1 |
| TPR-08 | 提示 | 采纳：增加带日期与理由的关键决策清单 | 本文件「关键决策」小节 |

### 本轮合并审阅处理（2026-08-29 17:49）

| TPR | 严重度 | 采纳的 Route | 落点 |
| --- | --- | --- | --- |
| TPR-01 | 阻断 | 保留独立 `.gitignore` helper；把它完整纳入通用 writer requirement、AC 与阶段 3b 矩阵，不再由输入 JSON/报告测试代证 | R5.1–R5.7、R5.9、AC20–AC26、AC28、design §6、implement 阶段 3a/3b |
| TPR-02 | 阻断 | 定义按 normalized relative POSIX path 做 ordinal 排序的 canonical inventory，并让 source、virtual-final、actual-final 与删除前复核使用同一 PowerShell 实现 | R1.7、AC3、AC41、design §12、implement 阶段 0/5/7 |
| TPR-03 | 阻断 | 保留 Q2 的 archive 后删除决定；所有 task AC 改为 archive 前完成，删除改为有独立失败记录/重试归属的 post-closeout cleanup；“可恢复”限定为归档前回退窗口 | R1、R1.6、R1.8、AC40、PC1、design §12、implement 阶段 7 |

### 本轮合并审阅处理（2026-08-29 18:20）

| TPR | 严重度 | 采纳的 Route | 落点 |
| --- | --- | --- | --- |
| TPR-01 | 阻断 | 选择收窄路线：`insufficient_evidence` 仅属于 `instruction_fit`；`execution_efficiency` 维持四档封闭集合 | R2.2、R2.6、AC10–AC11、design §3/§6.4、implement 阶段 1/3 |
| TPR-02 | 阻断 | 采用新 spec 的 canonical `--name`，不保留 `--skill-name` 别名；把目录 `AGENTS.md` 纳入 change list、公共契约阶段和独立验收 | R4.6、R6.2、AC29、AC42、design §1/§5.7/§6.2/§11、implement 阶段 2–4 |
| TPR-03 | 阻断 | 在同一 PowerShell 进程先核对 repo/source/destination 与 reparse；先复制并验证 `.removed`，再终止式删除；任一失败恢复两个 source、复核并留痕后停止 | R1.9、AC41、design §12、implement 5.7 |
| TPR-04 | 应修 | 固定默认浏览器人工验收的浏览器/缩放/viewport 与五项可观察条件 | R3.7、AC6、design §8.4、implement 5.2 |
| TPR-05 | 应修 | 阶段 0.1 改为单进程 PowerShell 的 22 条逐项精确集合比较，不写 `/tmp` | implement 0.1 |
| TPR-06 | 应修 | 阶段 6 提交消息降为候选；补 Phase 3.4 dirty-state 分类、实际文件清单、未识别文件和 one-shot confirmation | R8、AC43、design §14、implement 阶段 6 |

### 独立复审处理（2026-08-29 19:37）

| TPR | 严重度 | 采纳的 Route | 落点 |
| --- | --- | --- | --- |
| TPR-01 | 阻断 | 零 invoked 在评分/写入前有界停止；共享 validator 防御性拒绝零样本和零分母 payload | R2.13、R3.1、AC44、design §3.3/§5、implement 阶段 2–4 |
| TPR-02 | 阻断 | 把 canonical `--name` 明确限定为三类报告 basename 消费方；扫描器保留既有 `--skill-name` | R6.2、AC29、AC42、design §5.7/§6.2/§11、implement 4.0 |
| TPR-03 | 阻断 | 抽取 task-scoped advanced function，以 `$RemoveTree` shim 自测首/次删除失败；证明式复用恢复后 `.removed` | R1.9、AC41、design §1/§12.3、implement 5.7 |
| TPR-04 | 应修 | 将“可修复成因”加入独立的逐评分理由人工清单与 notes 留痕 | R2.10、AC14、AC16、implement 5.6 |
| TPR-05 | 应修 | 保留 payload `skill_name`，但 create/replace 与每次消费均强制逐字符等于 canonical `--name` | R6.8、AC29、design §5.6/§6.3/§6.4、implement 阶段 3 |
| TPR-06 | 应修 | PC1 的关键读取、递归枚举和删除全部使用 `-ErrorAction Stop`；catch 原始失败类别并映射 journal | R1.8、PC1、implement 7.1/7.3/7.4 |
| TPR-07 | 提示 | 更新为当前可复算的 1,156,623 bytes，并保留“本地未声明许可证、上游未核实”边界 | SD-9、design §2 |

### 实施期验收冲突处置（2026-08-30）

独立复核以显式仓库真源 `--skill-path`、`--repo-root` 与 `scope=global` 连续两次得到 `invoked=0`；更早的 Grok `2 invoked` 来自省略真源参数后解析到仓库外另一实例，不能作为当前 A 报告依据。用户确认采用条件验收：A 在 `invoked >= 1` 时生成并浏览，在 `invoked == 0` 时以 R2.13 的安全停止和零副作用证据通过；B 继续承担确定性 HTML 的实际默认浏览器验收。该处置同步到 R3.7、AC6、design §8.4 与 implement 5.1～5.6，不放宽 AC44 的零样本硬门；scanner 真实性与唯一会话 identity 另由 R2.14/AC46 固化。

### 正式复审处理（2026-08-30 12:53）

| TPR | 严重度 | 采纳的 Route | 落点 |
| --- | --- | --- | --- |
| TPR-01 | 应修 | Route B：用共享规范 assistant 正文谓词映射 Codex/Oh My Pi 的真实事件包装，只接受纯正文块并排除任何 tool-bearing 事件 | R2.14、AC46、design §3.3a、implement 2.10a |
| TPR-02 | 应修 | Route A：把 `research/source-migration-evidence.md` 登记为 task evidence，加入阶段 5 当前精确分类并留给 archive；不改历史 owned 22 / 总 31 启动快照 | design §1、implement 5.11/6.2 |
| TPR-03 | 提示 | 为实施前事实统一注明 base revision，live 实现继续按当前工作树核验 | PRD 背景事实、design 前言 |

### 正式复审阻断处理（2026-08-30 13:16）

| TPR | 严重度 | 采纳的 Route | 落点 |
| --- | --- | --- | --- |
| TPR-01 | 阻断 | Route A：保持 R2.14/AC46 的严格合同；拒绝 raw string/list-string，对完整事件递归拒绝任意 `tool*` / `function_call*` key 与 `*tool*` / `function_call*` block type，并补外层、嵌套、`tool_output`、未来类型及 mixed-event 负例 | R2.14、AC46、design §3.3a、implement 2.10a |

### 独立复审处理（2026-08-29 20:34）

| TPR | 严重度 | 采纳的 Route | 落点 |
| --- | --- | --- | --- |
| TPR-01 | 应修 | 保持 PC1 的完整 inventory 入口；catch 中重新证明精确路径、无 reparse、governed `28/<hash>` 与 physical `34/<hash>`，异常类别和双身份全量证明同时满足才允许同一 PC1 重试 | R1.8、PC1、design §12.2、implement 7.3～7.4 |
| TPR-02 | 应修 | 把初始备份准备纳入 task-scoped helper；用 invocation-owned staging、终止错误、copy 失败注入与合法 final 证明式复用收敛 | R1.10、AC41、design §12.2/§12.3、implement 0.3/5.7 |
| TPR-03 | 应修 | 在 design 变更边界显式登记 task `notes.md`，并把 helper + notes 作为穷举 task-evidence allowlist 留给 archive | design §1、implement 5.11/6.2 |
| TPR-04 | 提示 | 将 AC10 汇总 requirement 补齐为 `R2.1, R2.2` | implement 验收对照 |

### 未能核实项处理

- **「EX-9 三个私密会话窗口计数仍为 `14/38/785`、`0/4/4`、`0/11/161`」** — 保持未核实；合并审阅未重新扫描全局私密会话。规划只保留给定输入下的归一化算术与“不把调用比率计入 overall”的已确认决定，不把这些计数表述为当前值。
- **「`--input` 没有仓库外消费者」** — 本轮补核：扫描 `~/.claude`、`~/.codex`、`~/.grok`、`~/.omp` 四个 Agent 主目录，`write_session_review` 的全部命中均为会话转写，无配置或脚本调用。**仍未核实**：本机其他代码仓库与非 Agent 用户脚本未作全盘扫描。采纳 TPR-02 Route 其一后 stdin/`--input` 被移除，若存在未知外部调用方会直接失败；已在 Constraints 中记为计划内破坏性变更。
- **「新 HTML 在浏览器中的真实渲染与无外部请求行为」** — 保持未核实。AC6 为浏览器人工验收，AC7 为静态校验，二者不互相替代。
- **「`pierre-diffs.js` 上游许可状态」** — 保持未核实。本任务不移植该文件，风险随删除消解。
- **「新量表对真实私密会话的评分一致性」** — 保持未核实。AC16 的人工验收产生第一份真实样本，一致性需多轮观察，不在本任务收口。
- **「archive 后真实 `Remove-Item` 的权限、占用与杀毒行为」** — 保持未核实；planning 状态未创建或删除仓库外备份。PC1 只定义安全前置、成功/失败记录与重试归属，不把静态规划当作删除可成功的证据。
