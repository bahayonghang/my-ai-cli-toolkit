# 五套 Harness 能力边界

审查日期：2026-09-07。本页把父任务 `research/harness-capabilities.md`（日期 2026-09-07）的规划证据改写成仓库公开说明。表格是当前资料边界，不是正式支持承诺。本轮未安装或启动五套客户端；客户端加载保持 **UNVERIFIED**。

[English version](/en/harnesses)

## 证据标签

| 标签 | 含义 |
| --- | --- |
| official | 该产品官方文档或规范源，读取日期 2026-09-07 |
| repo contract | 本仓库源文件、安装器映射或脚本契约 |
| local probe | 已命名的本地观察（不经过客户端） |
| UNVERIFIED | 所读资料或本轮检查未证实 |

第三方资料或其他产品只能标独立参考，不能填为目标产品事实。

## 产品身份

- **Kimi** 指当前 **Kimi Code CLI**（`kimi`、`@moonshot-ai/kimi-code`、`~/.kimi-code` / `KIMI_CODE_HOME`）。不要用旧 kimi-cli 文档替代。身份来源：[官方入门](https://www.kimi.com/code/docs/en/kimi-code-cli/guides/getting-started)（official）。
- **OMP** 指 [can1357/oh-my-pi](https://github.com/can1357/oh-my-pi)。不能把 Pi 同名或兼容内容当作 OMP 当前行为证据。canonical `main` 文档是浮动来源；实施验证必须补实际版本或 commit。
- **Antigravity** 只作为本仓库已有平台源说明，不在下列五工具矩阵里，也不实施其旁支工作流重构。
- Trellis 自定义代理名来自项目 workflow，不能称官方能力。

## 三层不要混用

| 层 | 本仓库位置 | 能证明什么 |
| --- | --- | --- |
| 平台源 catalog | `platforms/claude/`、`platforms/codex/`、`platforms/antigravity/` | 仓库里有哪些可复制/链接的源资产 |
| 安装器目标 | `scripts/install_projects.py` 的 `ALWAYS_DEST` 与 `DETECT_AGENTS` | 本地 live-link 在已有 agent 根目录时写到哪里 |
| 实际 runtime | 各客户端自己的发现与加载 | 新会话是否发现 skills/hooks/agents。静态 dest 映射不是 discovery 证明 |

本仓库没有 `platforms/grok/`、`platforms/kimi/` 或 `platforms/omp/`。安装器有 `.grok`、`.kimi-code`、`.omp` 映射，只表示 live-link 目标，不表示这些客户端已验证发现。

第三方 `npx skills add` 与本地 `just install-projects` 是不同工具。前者按该 CLI 自己的目标安装；后者把一方 catalog live-link 到当前项目（默认 `.agents/skills/`），并且拒绝用户家目录。

## 能力矩阵

Goal 的启动、管理、完成语义见单一事实源 [`skills/developer-tools-integrations/goal-meta-skill/references/platform-goal-facts.md`](https://github.com/bahayonghang/my-claude-code-settings/blob/dev/skills/developer-tools-integrations/goal-meta-skill/references/platform-goal-facts.md)。不要把该 lifecycle 表复制到本页。该表上次核对日期为 2026-08-23；本轮未逐条重跑 lifecycle。

| 工具 | 原生指令 / skill 根 | Hook 或扩展 API | 代理 / 委托 | 权限 / 沙箱 | Goal 与验证约束 |
| --- | --- | --- | --- | --- | --- |
| Claude Code | `CLAUDE.md`、`@` 导入、嵌套加载（official）。原生 skills（official）。本仓库 Claude 源为 `platforms/claude/agents/` 与 `platforms/claude/hooks/`（repo contract）。不得把 Codex 逐层选择规则套用到 Claude（official）。 | 原生 hooks（official）。PreToolUse 读 stdin JSON；exit 2 可阻断（official）。`hooks.json` 存在不等于客户端已注册（UNVERIFIED）。 | 独立上下文 subagents（official）。本仓库有 agent 提示资产（repo contract）。 | 原生 hooks 与权限（official）。源模板不代替宿主授权。 | Goal 见 platform-goal-facts（2026-08-23）。hook 脚本契约有 stdlib 测试（local probe / repo contract）。真实 Claude 接线 UNVERIFIED。 |
| Codex | `AGENTS.override.md` / `AGENTS.md` / 配置 fallback，root→cwd 每层选择（official）。项目共享 `.agents/skills`（official）。本仓库 Codex 源只有 `platforms/codex/agents/`，没有 `prompts/`（repo contract）。 | 无本仓库 Codex hook 源。权限与沙箱由宿主配置（official）。 | 原生 `.codex/agents`；子代理可按职责选模型/推理级别（official）。不据此推导本项目费用或质量收益。源模板不自动赋权（repo contract）。 | 宿主配置；仓库 TOML 不授予运行时权限（official + repo contract）。 | Goal 见 platform-goal-facts。本轮规划会话里代理工具可用，不能声称全部 catalog skills 已在新会话发现（UNVERIFIED）。 |
| Grok Build | 当前官方 project rules 包含 AGENTS / CLAUDE / rules（official）。native `.grok/skills` 与 `.grok/agents`（official）。所读官方位置表未明确共享 `.agents/skills`（UNVERIFIED）。无 `platforms/grok/`（repo contract）。 | 原生 plugins / hooks / subagents（official）。 | 原生 subagents（official）。 | permissions 与 sandbox 是不同维度（official）。 | Goal 见 platform-goal-facts。安装器有 `.grok` 映射（repo contract）。native 目标与新会话发现 UNVERIFIED。 |
| Kimi Code CLI | 当前官方项目 skills 为 `.kimi-code/skills` 与 `.agents/skills`；agents 为 `.kimi-code/agents` 与 `.agents/agents`（official）。上下文与模型池配置需依当前产品，不以旧 kimi-cli 为准。无 Kimi 平台源目录（repo contract）。 | 原生 hooks，stdin JSON；0 allow、2 block；其他非零 / 错误 / 超时不阻断（official）。不能照搬 Claude 配置文件格式（official）。 | 官方 agents 目录如上（official）。runtime agent 实测 UNVERIFIED。 | 按当前 Kimi Code CLI 配置，不以 Claude/Codex 文档替代（official）。 | Goal 见 platform-goal-facts。安装器有 `.kimi-code` 映射（repo contract）。runtime discovery / agent / hook UNVERIFIED。 |
| OMP | standalone AGENTS 祖先发现，以及 `.omp/AGENTS` / `.omp/RULES` 自有优先级（official，canonical main）。native skills 与兼容 providers；skill provider 是一层 skill 目录 / `SKILL.md`（official）。无 `platforms/omp/`（repo contract）。不要借用 Pi 能力结论。 | ExtensionAPI 优先（official，canonical main）。 | task 可并行，并可按配置递归（official，canonical main）。 | headless 子项 settings snapshot 强制 `tools.approvalMode=yolo`，消除的是 mode 交互门，不是绕过显式 per-tool policy / deny（official，canonical main）。若子进程最终 policy 为 prompt，终态 UNVERIFIED，不承诺向主会话提示。 | Goal 见 platform-goal-facts。canonical main 不等于已装发布版。固定版本新会话 UNVERIFIED。 |

## 分工具说明

### Claude Code

来源（2026-09-07，official）：[memory](https://code.claude.com/docs/en/memory)、[skills](https://code.claude.com/docs/en/skills)、[subagents](https://code.claude.com/docs/en/subagents)、[hooks](https://code.claude.com/docs/en/hooks)。

- 根 `CLAUDE.md` 使用文档支持的 `@AGENTS.md` 导入共用规则，只保留 Claude 加载说明（repo contract）。
- Hook 脚本读取官方 PreToolUse stdin JSON 的 `tool_input.command`；危险模式以 **exit 2** 阻断（repo contract）。`log-prompt.py` 按事件 `session_id` 与 `cwd` 写会话隔离日志（repo contract）。这些是脚本契约，不是客户端已加载证明。
- 真实 Claude Code 注册、新会话 skill 发现：UNVERIFIED。

### Codex

来源（2026-09-07，official）：[AGENTS](https://learn.chatgpt.com/docs/agent-configuration/agents-md)、[skills](https://learn.chatgpt.com/docs/build-skills)、[subagents](https://learn.chatgpt.com/docs/agent-configuration/subagents)。

- 官方子代理可分别选模型/推理级别；较窄执行可选择效率角色。不据此推导本项目的实际费用或质量收益。
- 仓库可复用工作流放在 `skills/`（例如 `$git-commit`），不声称存在 `platforms/codex/prompts/` 或 `$archive-planning`。

### Grok Build

来源（2026-09-07，official）：[project rules](https://docs.x.ai/build/features/project-rules)、[skills/plugins](https://docs.x.ai/build/features/skills-plugins-marketplaces)、[subagents](https://docs.x.ai/build/features/subagents)、[permissions](https://docs.x.ai/build/features/permissions)、[sandbox](https://docs.x.ai/build/features/sandbox)。

- Grok 可能读取 AGENTS / CLAUDE / rules 多个入口。共用规则只写在 `AGENTS.md`，避免入口互相冲突。
- 共享 `.agents/skills` 是否被官方发现：UNVERIFIED。需要 native `.grok` 目标与新会话验证。

### Kimi Code CLI

来源（2026-09-07，official）：[skills](https://www.kimi.com/code/docs/en/kimi-code-cli/customization/skills.html)、[agents](https://www.kimi.com/code/docs/en/kimi-code-cli/customization/agents.html)、[hooks](https://www.kimi.com/code/docs/en/kimi-code-cli/customization/hooks.html)、[config files](https://www.kimi.com/code/docs/en/kimi-code-cli/configuration/config-files.html)。

- 产品是 Kimi Code CLI，不是旧 kimi-cli。
- Hook 退出码语义与 Claude 不同：非 2 的失败不阻断。

### OMP

来源（2026-09-07，official canonical main）：[context](https://github.com/can1357/oh-my-pi/blob/main/docs/context-files.md)、[skills](https://github.com/can1357/oh-my-pi/blob/main/docs/skills.md)、[extensions](https://github.com/can1357/oh-my-pi/blob/main/docs/extensions.md)、[task](https://github.com/can1357/oh-my-pi/blob/main/docs/tools/task.md)、[approval](https://github.com/can1357/oh-my-pi/blob/main/docs/approval-mode.md)。

- 不要把 Pi 文档填进 OMP 行。
- `main` 是浮动来源。已装版本/commit 未核：UNVERIFIED。

## 本仓库覆盖

| 资产 | 状态 |
| --- | --- |
| 根 `AGENTS.md` | 共用规则（repo contract） |
| 根 `CLAUDE.md` | `@AGENTS.md` 导入 + Claude 加载说明（repo contract） |
| `platforms/claude/agents/`、`platforms/claude/hooks/` | Claude 源（repo contract） |
| `platforms/codex/agents/` | Codex agent 模板；无 prompts 目录（repo contract） |
| `platforms/antigravity/commands/` | 现有旁支源；不在五工具验收范围 |
| `scripts/install_projects.py` | 含 claude-code / grok / codex / kimi-code / omp 映射；不是 discovery 证明 |
| 五工具新会话 discovery、原生 hook/代理执行 | UNVERIFIED |
