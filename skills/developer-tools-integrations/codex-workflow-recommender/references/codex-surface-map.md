# Current Codex surface map

Last verified: 2026-07-23

Use this dated map for branch selection, then prefer current callable CLI help
for exact local syntax. A newer/older or unavailable surface is `missing
evidence`, not permission to infer behavior from memory or another product.

## Products and scope

| Surface | Relevant ownership |
| --- | --- |
| CLI | local threads, config/profiles/rules, skills, plugins, MCP, agents, hooks |
| IDE | local Codex configuration and repository context; UI availability varies |
| desktop App | local Codex configuration plus App-specific UI/workflows |
| ChatGPT web | workspace plugins/connectors; does not read local Codex config |

Prompt/thread owns one-off context. AGENTS owns mandatory repository guidance.
Memory owns learned context rather than rules. Skills own repeated workflows.
Plugins own installed/team bundles. MCP/connectors own live external context or
actions. Subagents own independent bounded delegation. Hooks own lifecycle
enforcement; automations own scheduled work.

## Discovery roots

- Project skills: `.agents/skills` searched from launch CWD toward repo root.
- User skills: `~/.agents/skills`; admin skills: `/etc/codex/skills`.
- Native custom agents: project `.codex/agents`, user `~/.codex/agents`.
- Project config and hooks require a trusted project; user/project keys differ.

## Provenance vocabulary

Use: `built-in`, `user-config`, `project-config`, `plugin-provided`,
`installed-enabled`, `installed-disabled`, `available-uninstalled`,
`unsupported`, `missing evidence`. Preserve these states instead of reducing
them to configured/absent.

## Read-only probe rules

Probe `codex --version` and only relevant `--help` subcommands. Capability lists
may be inspected when needed, but reports contain minimal status/provenance
summaries, never raw doctor/config/auth/provider/environment values. Do not run
install/add/remove/enable/upgrade or write-capable external actions.

The 2026-07-23 local probe used `codex-cli 0.145.0` and found `mcp`, `plugin`,
`doctor`, `features`, `exec`, `review`, `resume`, `fork`, `sandbox`, and `app`.
This is dated evidence, not a minimum-version promise.

## Trust and policy

Before recommending project config, hooks, MCP, plugins, or subagents, check the
trusted project boundary, managed requirements/policy, data classes, read/write
permissions, and user-global versus project ownership. Unavailable effective
policy is `missing evidence`. Any persistent or external action requires a new
authorization after the recommendation.

## Official sources

- https://learn.chatgpt.com/docs/build-skills.md
- https://learn.chatgpt.com/docs/agent-configuration/subagents.md
- https://learn.chatgpt.com/docs/customization/overview.md
- https://learn.chatgpt.com/docs/config-file/config-advanced.md
- https://learn.chatgpt.com/docs/extend/mcp.md
- https://learn.chatgpt.com/docs/build-plugins.md
- https://learn.chatgpt.com/docs/hooks.md
- https://learn.chatgpt.com/guides/best-practices.md
