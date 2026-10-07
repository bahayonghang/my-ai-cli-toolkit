# 共享 rules

[English version](/en/rules)

仓库根目录 `rules/` 存放跨项目行为规则。Claude Code 和 OMP 使用各自的 rules 目录读取这批 Markdown；Codex 从全局 `AGENTS.md` 用 `@` 引用同一批文件。

目录里有这些文件，只说明源在仓库里。客户端有没有加载它们，要看下面的接入是否已经做好。

## 文件

| 文件 | 内容 |
| --- | --- |
| `anti-patterns.md` | 跨 skill 的行为边界 |
| `chinese.md` | 中文输出里要避开的 AI 腔，以及 GitHub issue/PR 中文评论 |
| `clarity.md` | 日常回复的指代、条件、义务和压缩边界 |
| `durable-context.md` | 读取记忆或旧决策时，以当前状态为准；记忆不构成授权 |
| `english.md` | 对用户自己写的英文做安静的纠错 |

## Claude Code

Claude Code 读取 `.claude/rules/*.md` 和 `~/.claude/rules/*.md`。仓库根上的 `rules/` 这个目录名本身不会被发现。来源：[memory](https://code.claude.com/docs/en/memory)（2026-10-07，official）。

当前这些文件没有 `paths` frontmatter。放进项目 `.claude/rules/` 后，Claude Code 在会话开始时加载它们，优先级与项目 `.claude/CLAUDE.md` 相同。用户级 `~/.claude/rules/` 先于项目规则加载；两边冲突时，Claude 可能采用任意一边。

这批规则是跨项目的个人约束，默认放在用户级目录：

```text
~/.claude/rules/
├── anti-patterns.md
├── chinese.md
├── clarity.md
├── durable-context.md
└── english.md
```

项目级 `.claude/rules/` 可以放同一批文件。指向工作目录以外的符号链接，Claude Code 按外部导入处理：批准之后，只加载没有 `paths` 的规则。用户级 `~/.claude/rules/` 不走这道项目批准。Windows 上创建符号链接需要管理员权限或开发者模式；直接复制文件也可以。

本仓库没有安装脚本把 `rules/` 链到 `~/.claude/rules/`。客户端是否加载：UNVERIFIED。

## OMP

OMP 指 [can1357/oh-my-pi](https://github.com/can1357/oh-my-pi)。native rules 目录（canonical `main`，2026-10-07，official）：

- 用户级：`~/.omp/agent/rules/*.{md,mdc}`。`--profile` 或 `PI_CODING_AGENT_DIR` 会改这个 agent 目录。
- 项目级：当前目录的 `.omp/` 非空时，读取 `<cwd>/.omp/rules/*.{md,mdc}`。

`RULES.md` 是另一条通道。它是单个始终生效的文件（`~/.omp/agent/RULES.md`，以及从 cwd 向仓库根走到的最近非空 `.omp/RULES.md`），和 `rules/` 目录分开。

canonical `main` 的分桶：frontmatter 里 `alwaysApply: true` 的文件始终生效；只有 `description`、没有 `alwaysApply: true` 的文件进入 rulebook；两者都没有时，文件会被发现然后丢掉。本仓库的 `rules/*.md` 目前没有这些 frontmatter。

`main` 是浮动来源。已安装的 OMP 版本本轮没有核对：UNVERIFIED。

## Codex

Codex 的全局指令在 Codex home（默认 `~/.codex`，可用 `CODEX_HOME` 改）。非空的 `AGENTS.override.md` 优先于 `AGENTS.md`，同一层只读第一份非空文件。来源：[AGENTS.md](https://learn.chatgpt.com/docs/agent-configuration/agents-md)（2026-10-07，official）。

把 `rules/` 加入 Codex 时，在实际被选中的那份全局文件里用 `@` 引用，一行一个文件：

```md
# ~/.codex/AGENTS.md

@/absolute/path/to/my-claude-code-settings/rules/anti-patterns.md
@/absolute/path/to/my-claude-code-settings/rules/chinese.md
@/absolute/path/to/my-claude-code-settings/rules/clarity.md
@/absolute/path/to/my-claude-code-settings/rules/durable-context.md
@/absolute/path/to/my-claude-code-settings/rules/english.md
```

把示例里的绝对路径换成这批文件在本机上的位置。`~/.codex/AGENTS.md` 不在本仓库里面。

2026-10-07 读到的 AGENTS 说明只写了整文件拼接，没有写 `@` 展开。同一天 `openai/codex` 的 `main` 上，`codex-rs/core/src/agents_md.rs` 也是拼接被选中的文件原文。已安装的 Codex 会不会展开这些 `@` 行：UNVERIFIED。

## 和平台源目录的区别

根目录 `rules/` 是上面这批共享行为规则。`platforms/<platform>/rules/` 是平台源资产的位置；本仓库当前没有那一层。
