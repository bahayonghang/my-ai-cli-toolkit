# Official Codex surface evidence

Fetched: 2026-07-23

Method: current OpenAI Codex manual via the installed `openai-docs` helper, then
targeted reads plus local `codex-cli 0.145.0` help/list probes.

## Facts used by this plan

- Skill discovery: repo `.agents/skills` from CWD toward repo root, user
  `~/.agents/skills`, admin `/etc/codex/skills`, bundled system skills.
- Native custom agents: repo `.codex/agents`, user `~/.codex/agents`; standalone
  TOML requires `name`, `description`, `developer_instructions` and may use
  supported session config keys.
- Project `.codex/config.toml` and project-local hooks load only for trusted
  projects. User and project configuration layers have different allowed keys.
- CLI, IDE and desktop App share local Codex configuration layers; ChatGPT web
  does not read local Codex config and obtains remote tools through workspace
  plugins/connectors.
- Skills author reusable workflows. Plugins are installable distribution units
  and can bundle skills, connectors/MCP config, hooks and assets.
- Current best-practice order is contextual: durable AGENTS guidance, reuse an
  existing plugin when one fits, otherwise create a skill, add MCP for external
  systems, and use subagents for bounded delegated work.
- MCP configuration can be user or trusted project scoped. Permission, data
  access and provenance remain material even when discovery commands are
  read-only.
- Hooks are lifecycle enforcement; automations are scheduled work. Neither is a
  generic replacement for repo-native CI/pre-commit gates.

## Local CLI facts

- Version: `codex-cli 0.145.0`.
- Present subcommands: `mcp`, `plugin`, `doctor`, `features`, `exec`, `review`,
  `resume`, `fork`, `sandbox`, `app`.
- `codex plugin list` exposes marketplace plugins with status; `--json` and
  `--available` change the inventory view.
- `codex mcp list --json` includes enabled/provenance-bearing entries and can
  include plugin-provided MCP servers.
- `codex doctor --json` is redacted but can still reveal local provider/auth/
  path metadata. Future recommendation output should summarize minimal fields,
  not reproduce raw JSON.

## Official pages

- `https://learn.chatgpt.com/docs/build-skills.md`
- `https://learn.chatgpt.com/docs/agent-configuration/subagents.md`
- `https://learn.chatgpt.com/docs/customization/overview.md`
- `https://learn.chatgpt.com/docs/config-file/config-advanced.md`
- `https://learn.chatgpt.com/docs/extend/mcp.md`
- `https://learn.chatgpt.com/docs/build-plugins.md`
- `https://learn.chatgpt.com/docs/hooks.md`
- `https://learn.chatgpt.com/guides/best-practices.md`

## Evidence boundary

This file records design-time facts, not a permanent claim that every future
Codex version has the same command/schema. Implementation must retain the dated
reference plus runtime `--help` probing and `missing evidence` degradation.
