# 常青项目与五套 Harness 审查报告

日期：2026-09-07。结论：**现有 CI 全绿，但 Claude hook 有已复现的协议失效；五工具的项目说明尚未完整对齐。建议批准下列四个有限子任务。** 本轮只审查和规划，尚未实施。

## 基线和范围

- 本地：D:/Documents/Code/Agents/my-claude-code-settings，dev，HEAD `3c45297777a94f085f0564fc752ffaf03e4d0516`。origin 实际为 bahayonghang/my-ai-cli-toolkit。
- 审查入口：根 AGENTS/CLAUDE/code_map/README，中英 docs 首页与生成器，justfile、GitHub workflow、install_projects，Claude hooks、Codex agent 源规范，goal-meta、codex-bridge、skill-session-review 关键契约与测试。
- 结构：41 个一方 skills，按六类组织；platforms 只有 antigravity/claude/codex；scripts 管校验/安装；docs 生成 catalog；.trellis 管规划。安装器已有五目标不表示五客户端全部发现或原生适配。
- 未逐行审计全部 41 个 skill 实现，未审计忽略目录中的用户运行配置；未运行付费 provider、全局安装或用户 UI。
- 完整测试基线见 [test-baseline.md](test-baseline.md)，工具来源与矩阵见 [harness-capabilities.md](harness-capabilities.md)。

## 发现与根因

| 编号/级别 | 发现及影响 | 证据与根因 | 改造归属 |
| --- | --- | --- | --- |
| F1 / P1 | Claude PreToolUse 在标准事件输入下放行本应阻断的字符串；旧 argv 命中也只是非阻断失败 | `platforms/claude/hooks/pre-bash.py:19` 只读 argv；第 24 行 exit 1；`platforms/claude/hooks/hooks.json:10` 接线使用旧变量。官方 stdin JSON 安全探针实际 0，旧 argv 实际 1，需 2 | C1 |
| F2 / P2 | session 日志混合，与“session-isolated”声明不符；no-op/自动 review 描述也已失真 | `platforms/claude/hooks/log-prompt.py:17` 取端口/default，忽略事件 session_id；两个合成会话实际落同一日志。`platforms/claude/hooks/hooks.json:12` 调用 deprecated no-op | C1、C2 |
| F3 / P1 | 全绿门没有测试 hook 行为，也不运行已有 PR 远程操作安全 Python 单测 | `justfile:73` 仅 compile；`justfile:77` 仅扫描 skills 下 .mjs。gh-pr-release 三个标准库 unittest 手动 22/22 通过，却未进入总门 | C3 |
| F4 / P2 | 五目标安装选择/落点缺成套回归；现有全绿仅覆盖通用+Claude 场景 | `scripts/install_projects.py:35` 有五映射；`scripts/test_install_projects.py:281` 周边仅测试 universal/claude；静态表存在不是 runtime 证明 | C3 |
| F5 / P2 | CLAUDE 与共用 AGENTS 重复维护并已漂移；README/站点描述遗漏门或引用不存在内容 | `CLAUDE.md:15` 漏 docs/installer；`README.md:65` 漏 docs；`docs/index.md:20` Claude commands 断言不符；`docs/scripts/sync_docs_catalog.py:759` 引用已无 archive-planning/prompts | C2 |
| F6 / P2 | “跨平台”说明缺五工具明确能力和证据界限，容易把通用安装当作所有 skill 原生等价 | `README.md:5`、第 95 行平台概述未给五工具矩阵；`skills/developer-tools-integrations/skill-session-review/scripts/review_contract.py:36` 只支持四方，Kimi 没有该契约 | C2、C4；不自动扩四方解析器 |

F1 与 F3 分别是运行协议根因、检测覆盖根因，可独立验收。独立计划审查另发现正式规范也固化了错误：`.trellis/spec/backend/error-handling.md:28` 与第 41 行把 policy failure/Claude blocked commands 写为 exit 1，该文件又被上下文清单注入。C4 已纳入修正规范并区分通用 CLI 与宿主协议，避免 F1 回归。缺失本地 fixture 或 provider 证据不自动升级为产品缺陷。未发现需要 P0 处置的问题。

## 测试结果

| 类别 | 实际结果 |
| --- | --- |
| 本地 just ci | exit 0；docs unit 4，skills 41，Python compile 65，installer 29；Node 423 / 419 pass / 0 fail / 4 skip |
| 额外已有标准库单测 | gh-pr-release 22/22 PASS |
| focused 契约 | goal-meta 五平台 64/64；skill-session-review 四方 25 pass / 1 skip（均属于 Node 总集） |
| pytest runner | exit 1：本机无 pytest；16 个 pytest 函数未运行，非断言失败 |
| 当前 HEAD hosted | [33956940164](https://github.com/bahayonghang/my-ai-cli-toolkit/actions/runs/33956940164) 三 OS success，真实 browser smoke 通过 |
| 新增审查探针 | hook 标准 stdin 命中仍 exit 0；旧 argv 命中 exit 1；不同 session_id 共用日志：不满足声明契约 |
| provider | 五工具新会话 discovery、原生 hook/代理执行均 UNVERIFIED |

## 历史失败工作流追踪

本轮只读抓取近期失败 run 日志并对照修复提交与当前通过结果；没有触发重跑。

| 失败记录 | 失败机制 | 当前处置 |
| --- | --- | --- |
| [33956631078](https://github.com/bahayonghang/my-ai-cli-toolkit/actions/runs/33956631078) | Windows CRLF 导致 Goal 示例正则提取 0 项 | 当前 `lint-goal-command.test.mjs:909` 规范化 CRLF；3c452977 已修，五平台64项和hosted均通过，不重修 |
| [33578529265](https://github.com/bahayonghang/my-ai-cli-toolkit/actions/runs/33578529265)、[32933729653](https://github.com/bahayonghang/my-ai-cli-toolkit/actions/runs/32933729653) | 生成 docs 过期，docs-check 正常阻断 | 当前无漂移；C2继续由生成器同步，C4回写生成规则 |
| [33578895767](https://github.com/bahayonghang/my-ai-cli-toolkit/actions/runs/33578895767) | macOS/Linux 的临时 cache prefix 缺失；同轮 Ubuntu CDP createTarget 超时 | cache由3501d30f修复；CDP后续无相关代码修改通过，只能归为更符合瞬时集成故障，不能宣称已证实唯一根因 |
| [33302218102](https://github.com/bahayonghang/my-ai-cli-toolkit/actions/runs/33302218102) | resolve 改写调用方路径身份，session-review 多例级联 | 7f4cb596 修复，当前 focused通过 |
| [32826267873](https://github.com/bahayonghang/my-ai-cli-toolkit/actions/runs/32826267873)、[32826821460](https://github.com/bahayonghang/my-ai-cli-toolkit/actions/runs/32826821460) | macOS /var→/private/var 与 Windows 短路径别名导致断言不一致 | 后续统一 Python canonicalization；当前通过，不另造路径抽象 |

## 可批准计划

| 子项 | 优先级/文件范围 | 必过检查 | 工具与模型 |
| --- | --- | --- | --- |
| C1 `09-07-claude-hook-runtime-contract` | P1：pre-bash.py、log-prompt.py、hooks.json、Claude code_map；删 inject-spec.py；新增标准库 hook tests | hook unittest、JSON parse、python-check、最终CI；真实Claude接线另列 | Claude/Codex强模型定协议和审查；便宜模型实现已冻结字段/返回码/fixtures |
| C2 `09-07-harness-guidance-alignment` | P2：AGENTS/CLAUDE、README双语、docs首页/导航、生成器；新增双语 harnesses 说明 | 规则走读、逐平台来源、docs-sync/docs-check、最终CI | Codex主规划，Claude核import；Grok/Kimi/OMP核本产品；便宜模型同步文本 |
| C3 `09-07-harness-verification-coverage` | P1：justfile、installer tests；CI保持同一入口，通常无须改workflow | 新python-test、installer五方实际布局、最终CI、后续实现SHA hosted证据 | Codex强模型审覆盖/根因；便宜模型接门及表驱动测试 |
| C4 `09-07-harness-model-routing-knowledge` | P2：项目 spec 分工指南、索引、quality/authoring约定、批准项验收映射 | 强模型语义审查、引用检查、diff-check、整体验证 | 强模型裁定结论；便宜模型整理。注明五工具通用与原生专属部分 |

推荐执行顺序：C1 → C3 → C2 最终同步 → C4；C2资料整理可与C1并行。依赖以实现就绪和定向检查为准；C1/C3保持 in_progress 交接，父项集成 CI 通过后回填其最终门，之前不归档。每项详见独立 PRD/design/implement；不新增跨平台框架或复制三套空规则。

## 说明对齐与范围判定

- 根 AGENTS 和 Codex 源/激活边界已有正确约定，保留。
- CLAUDE 改为共用 AGENTS 的显式导入入口；Grok 可能读取多个入口，避免重复互相冲突。
- 五平台 capabilities 文档明确 Kimi Code 当前产品与旧 kimi-cli 区别、OMP main 文档与已装版本区别；Goal lifecycle 继续引用既有 skill 单一事实表。
- goal-meta 已有五平台契约；codex-bridge 是 Codex 专属，skill-session-review 是四平台专属。**不要求所有 skill 强行覆盖五平台**，必须说明适用工具。Kimi session-review 扩展需要真实脱敏 schema，列为后续，不在本次计划冒充现成实现。
- Antigravity 旁支存在静态审查候选：`platforms/antigravity/commands/plan/impl.toml:8` 接收 args，后续第 42/83 行改用 plan_file/plan_path，所读文本未建立绑定；运行影响未验证。它不在指定五工具范围，未纳入此次代码改造，也不把规划文件写入的明确例外误报为全面只读违规。

## 回写和完成边界

批准后：正式项目说明由 C2 回写；本次 hook/测试/分工教训由 C4 写回项目 spec 并注明工具。未批准内容仅保留在规划报告，不写全局规则或 Basic Memory。完成需批准项交付、行为检查、全部必过门、范围复核和知识落点齐备；未执行的真实客户端/新SHA hosted 保持 UNVERIFIED。

本轮交付是可批准计划，不是实施完成。父子任务全部 planning，无 start/commit/push。
