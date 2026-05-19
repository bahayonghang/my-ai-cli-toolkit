---
name: codex-workflow-recommender
description: >-
  Analyze a repository and current Codex environment, then recommend Codex CLI,
  Codex App, AGENTS.md, skills, native subagents, plugins, MCP servers,
  config/hooks, and optional OMX workflow improvements without modifying files.
  Use when the user asks to optimize Codex workflows, improve Codex setup,
  recommend Codex automation, configure MCP/plugins/subagents, analyze AGENTS.md
  scope needs, or says "优化 Codex 流程", "Codex 工作流推荐", "给 Codex 配 MCP",
  "配置 Codex plugins", or "配置 Codex subagents".
version: 1.0.0
category: developer-tools-integrations
tags:
  - codex
  - codex-cli
  - codex-app
  - workflow
  - agents-md
  - skills
  - subagents
  - plugins
  - mcp
  - hooks
  - omx
argument-hint: "[repository-or-workflow-goal]"
allowed-tools:
  - Read
  - Glob
  - Grep
  - Bash(codex *)
  - Bash(git *)
  - Bash(find *)
  - Bash(ls *)
  - Bash(Get-ChildItem *)
  - Bash(Get-Content *)
  - Bash(Select-String *)
---

# Codex Workflow Recommender

Analyze a codebase and the local Codex surface, then recommend a safe implementation order for Codex-specific workflow improvements.

**This skill is read-only.** It may inspect files and run read-only discovery commands, but it must not create, edit, install, remove, or reconfigure anything. End with implementation options the user can approve separately.

## Output Contract

Return exactly these top-level sections unless the user asks for a narrower category:

1. `Codebase Profile`
2. `Current Codex Surface`
3. `Top Recommendations by category`
4. `Safe Implementation Order`
5. `Verification Plan`
6. `Want me to implement...`

Keep recommendations evidence-based. Recommend the highest-value 1-2 items per relevant category, not a catalog dump.

## Discovery Workflow

### 1. Profile the repository

Inspect only enough to classify the project and its verification gates:

```bash
# POSIX shells
find . -maxdepth 3 \( -name package.json -o -name pyproject.toml -o -name Cargo.toml -o -name go.mod -o -name justfile -o -name Makefile \) -print
find . -maxdepth 4 \( -name AGENTS.md -o -path './.codex/*' \) -print

# PowerShell
Get-ChildItem -Recurse -Depth 3 -Include package.json,pyproject.toml,Cargo.toml,go.mod,justfile,Makefile | Select-Object -ExpandProperty FullName
Get-ChildItem -Recurse -Depth 4 -Force -Include AGENTS.md | Select-Object -ExpandProperty FullName
```

Capture:

| Signal | Why it matters |
|---|---|
| language/runtime manifests | hooks, test commands, subagent expertise |
| frontend/backend/data boundaries | Playwright/browser MCP, DB MCP, API docs |
| existing `AGENTS.md` files | root vs nested guidance recommendations |
| `.codex/skills`, `.codex/agents` | project-local Codex capabilities already present |
| `~/.codex/config.toml`, `~/.codex/hooks.json` when readable | user-level Codex config and hook surface |
| CI and local gates | verification plan and safe hook candidates |
| external services in dependencies or docs | MCP/plugin candidates |
| OMX files such as `.omx/` or `AGENTS.md` OMX sections | optional repo-specific runtime workflows |

### 2. Confirm the local Codex command surface

Prefer the installed CLI over memory:

```bash
codex --help
codex mcp --help
codex plugin --help
codex doctor --help
```

When available, also inspect configured state without modifying it:

```bash
codex mcp list --json
codex plugin list
codex plugin marketplace list
```

If a command is missing, state that the recommendation depends on the installed Codex version.

### 3. Load focused references only when needed

- MCP recommendations: `references/mcp-servers.md`
- Skills recommendations: `references/skills-reference.md`
- Hooks/config recommendations: `references/hooks-patterns.md`
- Native subagents: `references/subagent-templates.md`
- Plugins: `references/plugins-reference.md`

Do not load every reference by default.

## Recommendation Categories

### AGENTS.md guidance

Recommend root or nested `AGENTS.md` changes when the repository has distinct subtrees, commands, generated files, safety boundaries, or verification gates that future Codex agents must know. If the user wants direct AGENTS.md edits, use `agents-md-improver` instead of this read-only recommender.

### Codex skills

Recommend skills for repeatable workflows, project-specific procedures, bundled scripts/templates, or domain knowledge that should be discoverable by Codex. Typical roots include:

- user/system skills: `~/.codex/skills`
- project-local skills: `.codex/skills`
- shared installs used by this repo/user environment: `~/.agents/skills`

Confirm the actual roots for the current environment before giving path-specific instructions.

### Native subagents

Recommend `.codex/agents` or `~/.codex/agents` only for bounded roles with clear ownership, sandbox expectations, and verification responsibilities. Avoid suggesting a subagent when a skill, prompt, or direct instruction is simpler.

### MCP servers

Recommend MCP only when external tool access materially helps: browser automation, live docs, databases, issue trackers, observability, cloud services, or filesystem boundaries. Use `codex mcp add/list/get/remove` syntax and avoid provider-specific commands from other CLIs.

### Plugins

Recommend plugins when the user needs a bundled set of skills/tools or a reusable team distribution unit. Use `codex plugin list/add/remove/marketplace` syntax and verify marketplaces before recommending a plugin name.

### Config and hooks

Recommend `~/.codex/config.toml` or hook-related changes only when the current Codex installation and local policy support them. Treat `~/.codex/hooks.json` as environment-specific; do not invent a schema when it is not present. For enforcement that must work outside Codex, recommend standard repo gates such as pre-commit, `just`, npm scripts, or CI.

### Codex CLI runtime

Recommend direct CLI features when they match the workflow:

| Need | Codex surface |
|---|---|
| non-interactive implementation or analysis | `codex exec` |
| read-only diff review | `codex review` |
| continue or branch a previous session | `codex resume` / `codex fork` |
| diagnose install/auth/config health | `codex doctor` |
| sandboxed local command execution | `codex sandbox` |
| launch desktop app | `codex app` |

### OMX workflows

Mention OMX only when the repository or user environment shows OMX is installed or requested. Present it as an optional enhancement, not a universal Codex capability.

## Report Template

```markdown
## Codex Workflow Recommendations

### Codebase Profile
- **Type**: ...
- **Primary gates**: ...
- **Risk boundaries**: ...

### Current Codex Surface
- **AGENTS.md**: root/nested/global status
- **Skills**: discovered roots and notable project-local skills
- **Subagents**: discovered `.codex/agents` or user agents
- **MCP**: configured or absent
- **Plugins**: configured marketplaces/plugins or absent
- **Config/hooks**: current known surface and unsupported gaps
- **OMX**: present/absent/optional

### Top Recommendations by category

#### AGENTS.md
1. **...**
   - Evidence: ...
   - Why now: ...
   - Suggested scope: ...

#### Skills
...

#### Native subagents
...

#### MCP servers
...

#### Plugins
...

#### Config/hooks
...

#### Codex CLI runtime
...

### Safe Implementation Order
1. Read-only inventory and baseline verification
2. AGENTS.md or docs guidance changes
3. Local/project skill or subagent additions
4. MCP/plugin/config changes behind explicit approval
5. Verification and rollback notes

### Verification Plan
- `codex doctor` for installation/config health
- repository-specific lint/type/test/build gates
- skill or agent validators when new packages are added
- `codex mcp list --json` / `codex plugin list` after configuration changes

### Want me to implement...
I can implement the approved local-file changes next. I will not install plugins, add MCP servers, or change user-level config without explicit approval.
```

## Safety Rules

- Do not modify files or run install/remove/config mutation commands in this skill.
- Do not claim a Codex feature exists solely because another CLI has it.
- Do not recommend secrets in config files; prefer environment variables and bearer-token env var options where supported.
- Do not place OMX recommendations in the critical path unless the current environment actually uses OMX.
- Keep implementation advice reversible and ordered from lowest-risk to highest-risk.
