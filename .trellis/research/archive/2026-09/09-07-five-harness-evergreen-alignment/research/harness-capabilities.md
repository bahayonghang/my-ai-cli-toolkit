# 五套 Harness 能力边界与证据

审查日期：2026-09-07。由强模型主会话及 agent_skill_architect 独立核对。表格是当前规划证据，不表示正式支持承诺；本轮未安装或启动五套客户端。

## 产品身份

Kimi 指当前 **Kimi Code CLI**（`kimi`、`@moonshot-ai/kimi-code`、`~/.kimi-code` / `KIMI_CODE_HOME`），不用旧 kimi-cli 文档替代。身份来源：[官方入门](https://www.kimi.com/code/docs/en/kimi-code-cli/guides/getting-started)。OMP 指 can1357/oh-my-pi，不能把 Pi 同名或兼容内容当作 OMP 当前行为证据。

## 能力矩阵

| 工具 | 规则/skill/代理边界 | 扩展与权限 | 本仓库覆盖与运行证据 |
| --- | --- | --- | --- |
| Claude Code | CLAUDE.md/导入/嵌套加载；原生 skills、独立上下文 subagents；不得把 Codex 的逐层选择规则直接套用 | 原生 hooks 和权限；PreToolUse stdin JSON，exit 2 可阻断；注册不等于逻辑正确 | 有 CLAUDE、agents/hooks 源；CLAUDE 与 AGENTS 未转发统一；hook 脚本协议失败已复现，真实注册 UNVERIFIED |
| Codex | AGENTS.override/AGENTS/配置 fallback，root→cwd 每层选择；项目共享 .agents/skills；原生 .codex/agents | 原生 subagents 可按职责选模型；权限/沙箱由宿主配置，源模板不自动赋权 | AGENTS、原生 TOML 源与共享安装器存在；本轮代理工具可用；不能据此声称所有 catalog skills 的新会话发现已验证 |
| Grok Build | 当前官方 project rules 包含 AGENTS/CLAUDE/rules；native .grok/skills 和 .grok/agents | 原生 plugins/hooks/subagents；permissions 与 sandbox 是不同维度 | installer 有 .grok 映射，无 platforms/grok；共享 .agents/skills 未在所读官方位置表明确，需 native 目标与新会话验证 |
| Kimi Code CLI | 当前官方项目 skills 为 .kimi-code/skills 与 .agents/skills，agents 为 .kimi-code/agents 与 .agents/agents；上下文与模型池配置需依当前产品 | 原生 hooks stdin JSON；0 allow、2 block，其他非零/错误/超时不阻断；不能照搬 Claude 配置文件格式 | installer 有 .kimi-code 映射，无 Kimi 平台源；runtime discovery/agent/hook 实测 UNVERIFIED |
| OMP | standalone AGENTS 祖先发现与 .omp/AGENTS/RULES 自有优先级；native skills 与兼容 providers；skill provider 是一层 skill目录/SKILL.md | ExtensionAPI 优先；task 可并行和按配置递归；headless 子项强制 yolo，但仍受显式 per-tool policy/deny 影响 | installer 有 .omp 映射，无 OMP 源；canonical main docs 不等于已装发布版，固定版本新会话 UNVERIFIED |

OMP 补充：当前 main 文档说明 task 子进程的 settings snapshot 强制 `tools.approvalMode=yolo`，消除的是 mode 本身交互门，不是绕过显式 deny。若子进程最终 policy 为 prompt，其具体终态在本次资料中未证实，标 UNVERIFIED，不承诺会向主会话提示。

## 主要来源（均于 2026-09-07 读取）

- Claude：[memory](https://code.claude.com/docs/en/memory)、[skills](https://code.claude.com/docs/en/skills)、[subagents](https://code.claude.com/docs/en/subagents)、[hooks](https://code.claude.com/docs/en/hooks)。
- Codex：[AGENTS](https://learn.chatgpt.com/docs/agent-configuration/agents-md)、[skills](https://learn.chatgpt.com/docs/build-skills)、[subagents](https://learn.chatgpt.com/docs/agent-configuration/subagents)。官方指出子代理可分别选模型/推理级别，较窄执行可选择效率角色；不据此推导本项目的实际费用或质量收益。
- Grok：[project rules](https://docs.x.ai/build/features/project-rules)、[skills/plugins](https://docs.x.ai/build/features/skills-plugins-marketplaces)、[subagents](https://docs.x.ai/build/features/subagents)、[permissions](https://docs.x.ai/build/features/permissions)、[sandbox](https://docs.x.ai/build/features/sandbox)。
- Kimi：[skills](https://www.kimi.com/code/docs/en/kimi-code-cli/customization/skills.html)、[agents](https://www.kimi.com/code/docs/en/kimi-code-cli/customization/agents.html)、[hooks](https://www.kimi.com/code/docs/en/kimi-code-cli/customization/hooks.html)、[config files](https://www.kimi.com/code/docs/en/kimi-code-cli/configuration/config-files.html)。
- OMP canonical main：[context](https://github.com/can1357/oh-my-pi/blob/main/docs/context-files.md)、[skills](https://github.com/can1357/oh-my-pi/blob/main/docs/skills.md)、[extensions](https://github.com/can1357/oh-my-pi/blob/main/docs/extensions.md)、[task](https://github.com/can1357/oh-my-pi/blob/main/docs/tools/task.md)、[approval](https://github.com/can1357/oh-my-pi/blob/main/docs/approval-mode.md)。main 是浮动来源，实施验证必须补实际版本或 commit。

Goal 启动/管理/完成语义沿用仓库 `skills/developer-tools-integrations/goal-meta-skill/references/platform-goal-facts.md` 的单一事实源；该表上次核对日期为 2026-08-23，本轮未逐条重跑 lifecycle。Trellis 自定义代理名来自项目 workflow，不能称官方能力。

## 分工建议

| 问题 | 强模型规划/审查 | 可交较便宜模型的执行 | 验收位置 |
| --- | --- | --- | --- |
| Claude hook 输入、返回码和接线 | Claude Code 原生语义优先；Codex 强模型交叉核根因 | 已批准的字段提取、退出码、小型离线 fixture | 离线脚本协议 + 另行真实 Claude 注册检查 |
| 跨平台说明和权限冲突 | Codex 强模型总规划；Claude 查 import，Grok/Kimi/OMP 查本产品原生规则 | 已冻结文案、双语同步、链接修订 | 根/scoped入口走读，逐行官方来源 |
| 测试入口/CI遗漏 | Codex 强模型追踪执行链；独立审查验证哪些门真的运行 | just recipe、明确路径测试、有限代码修复 | 本地必过门，hosted 按实际 SHA |
| 原生任务执行 | 各 harness 的可用强模型核输入/授权与退出行为 | Kimi 次级模型池或 Codex/OMP 可用效率模型接独占窄任务；实际型号/权限现场确认 | 原生新会话/版本证据，未做即 UNVERIFIED |
| 知识回写 | 强模型裁定已证实结论及适用范围 | 结构化整理、引用检查、英文措辞 | 批准项→文件→测试→知识落点 |

“较便宜”是执行角色建议，未进行五工具收费方案或模型质量基准。强模型承担规划、根因、权限和最终结论；生成文档和跑测试不需要另调模型。
