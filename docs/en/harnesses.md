# Five-harness capability bounds

Review date: 2026-09-07. This page restates the parent planning evidence in `research/harness-capabilities.md` (dated 2026-09-07) as public repository documentation. The tables are current source bounds, not a support commitment. This round did not install or start the five clients. Client load remains **UNVERIFIED**.

[中文版](/harnesses)

## Evidence labels

| Label | Meaning |
| --- | --- |
| official | Product documentation or canonical source, read on 2026-09-07 |
| repo contract | Source files, installer maps, or script contracts in this repository |
| local probe | A named local observation that did not go through a client |
| UNVERIFIED | The sources read in this round did not prove the claim |

Third-party material or another product may appear only as a separate reference. Do not fill it in as a fact about the target product.

## Product identity

- **Kimi** means current **Kimi Code CLI** (`kimi`, `@moonshot-ai/kimi-code`, `~/.kimi-code` / `KIMI_CODE_HOME`). Do not substitute old kimi-cli docs. Identity source: [getting started](https://www.kimi.com/code/docs/en/kimi-code-cli/guides/getting-started) (official).
- **OMP** means [can1357/oh-my-pi](https://github.com/can1357/oh-my-pi). Do not treat Pi same-name or compatibility content as current OMP behavior. Canonical `main` docs are a floating source. Implementation checks must add an actual version or commit.
- **Antigravity** is an existing platform source in this repo. It is outside the five-tool matrix. This page does not redesign that workflow.
- Trellis custom agent names come from the project workflow. They are not official harness capabilities.

## Do not mix these three layers

| Layer | Location in this repo | What it proves |
| --- | --- | --- |
| Platform source catalog | `platforms/claude/`, `platforms/codex/`, `platforms/antigravity/` | Which copyable or linkable source assets exist |
| Installer destinations | `ALWAYS_DEST` and `DETECT_AGENTS` in `scripts/install_projects.py` | Where the local live-link writes when an agent root already exists |
| Actual runtime | Each client’s own discovery and load | Whether a new session finds skills, hooks, or agents. A static dest map is not discovery proof |

This repository has no `platforms/grok/`, `platforms/kimi/`, or `platforms/omp/`. The installer maps for `.grok`, `.kimi-code`, and `.omp` are live-link destinations only. They do not mean those clients have verified discovery.

The third-party `npx skills add` CLI and local `just install-projects` are different tools. The CLI installs according to its own targets. The live-link installer links the first-party catalog into the current project (default `.agents/skills/`) and refuses the user home directory.

## Capability matrix

Goal start, management, and completion semantics live in one fact source: [`skills/developer-tools-integrations/goal-meta-skill/references/platform-goal-facts.md`](https://github.com/bahayonghang/my-claude-code-settings/blob/dev/skills/developer-tools-integrations/goal-meta-skill/references/platform-goal-facts.md). Do not copy that lifecycle table here. That table was last verified on 2026-08-23. This round did not re-run the lifecycle checks.

| Tool | Native instruction / skill roots | Hook or extension API | Delegation | Permission / sandbox | Goal and verification bounds |
| --- | --- | --- | --- | --- | --- |
| Claude Code | `CLAUDE.md`, `@` imports, nested load (official). Native skills (official). This repo’s Claude sources are `platforms/claude/agents/` and `platforms/claude/hooks/` (repo contract). Do not apply Codex per-layer selection to Claude (official). | Native hooks (official). PreToolUse reads stdin JSON; exit 2 can block (official). `hooks.json` on disk is not client registration (UNVERIFIED). | Independent-context subagents (official). This repo ships agent prompt assets (repo contract). | Native hooks and permissions (official). Source templates do not replace host authorization. | Goal: platform-goal-facts (2026-08-23). Hook script contracts have stdlib tests (local probe / repo contract). Real Claude wiring UNVERIFIED. |
| Codex | `AGENTS.override.md` / `AGENTS.md` / config fallback, root→cwd per-layer selection (official). Project-shared `.agents/skills` (official). This repo’s Codex source is `platforms/codex/agents/` only; there is no `prompts/` directory (repo contract). | No Codex hook source in this repo. Permission and sandbox come from host config (official). | Native `.codex/agents`; subagents may pick model and reasoning effort (official). Do not infer cost or quality gains for this project. Source templates do not grant runtime permission (repo contract). | Host config; repository TOML files do not grant runtime permission (official + repo contract). | Goal: platform-goal-facts. Agent tools were available in this planning session. That does not prove new-session discovery of every catalog skill (UNVERIFIED). |
| Grok Build | Current official project rules include AGENTS / CLAUDE / rules (official). Native `.grok/skills` and `.grok/agents` (official). Shared `.agents/skills` was not explicit in the official location table that was read (UNVERIFIED). No `platforms/grok/` (repo contract). | Native plugins / hooks / subagents (official). | Native subagents (official). | Permissions and sandbox are different dimensions (official). | Goal: platform-goal-facts. Installer has a `.grok` map (repo contract). Native targets and new-session discovery UNVERIFIED. |
| Kimi Code CLI | Current official project skills are `.kimi-code/skills` and `.agents/skills`; agents are `.kimi-code/agents` and `.agents/agents` (official). Context and model-pool config must follow the current product, not old kimi-cli. No Kimi platform source tree (repo contract). | Native hooks, stdin JSON; 0 allow, 2 block; other nonzero / error / timeout values do not block (official). Do not copy Claude hook config files (official). | Official agent directories as above (official). Runtime agent execution UNVERIFIED. | Follow current Kimi Code CLI config. Do not substitute Claude or Codex docs (official). | Goal: platform-goal-facts. Installer has a `.kimi-code` map (repo contract). Runtime discovery / agent / hook UNVERIFIED. |
| OMP | Standalone AGENTS ancestor discovery plus `.omp/AGENTS` / `.omp/RULES` priority (official, canonical main). Native skills and compatible providers; a skill provider is one skill-directory / `SKILL.md` layer (official). No `platforms/omp/` (repo contract). Do not borrow Pi capability conclusions. | ExtensionAPI is preferred (official, canonical main). | Tasks may run in parallel and recurse by config (official, canonical main). | A headless child settings snapshot forces `tools.approvalMode=yolo`. That removes the mode’s interactive gate. It does not bypass explicit per-tool policy / deny (official, canonical main). If the child policy is prompt, the final state is UNVERIFIED. Do not promise a prompt back to the parent session. | Goal: platform-goal-facts. Canonical main is not an installed release. Version-pinned new-session behavior UNVERIFIED. |

## Per-tool notes

### Claude Code

Sources (2026-09-07, official): [memory](https://code.claude.com/docs/en/memory), [skills](https://code.claude.com/docs/en/skills), [subagents](https://code.claude.com/docs/en/subagents), [hooks](https://code.claude.com/docs/en/hooks).

- Root `CLAUDE.md` uses the documented `@AGENTS.md` import for shared rules and keeps Claude loader notes only (repo contract).
- Hook scripts read official PreToolUse stdin JSON `tool_input.command` and block dangerous patterns with **exit 2** (repo contract). `log-prompt.py` writes session-isolated logs from event `session_id` and `cwd` (repo contract). These are script contracts, not proof that a client loaded the hooks.
- Real Claude Code registration and new-session skill discovery: UNVERIFIED.

### Codex

Sources (2026-09-07, official): [AGENTS](https://learn.chatgpt.com/docs/agent-configuration/agents-md), [skills](https://learn.chatgpt.com/docs/build-skills), [subagents](https://learn.chatgpt.com/docs/agent-configuration/subagents).

- Official subagents may pick model and reasoning effort. Narrower execution may use an efficiency role. Do not infer cost or quality gains for this project from that fact.
- Reusable workflows belong under `skills/` (for example `$git-commit`). This page does not claim a `platforms/codex/prompts/` directory or a `$archive-planning` skill.

### Grok Build

Sources (2026-09-07, official): [project rules](https://docs.x.ai/build/features/project-rules), [skills/plugins](https://docs.x.ai/build/features/skills-plugins-marketplaces), [subagents](https://docs.x.ai/build/features/subagents), [permissions](https://docs.x.ai/build/features/permissions), [sandbox](https://docs.x.ai/build/features/sandbox).

- Grok may read AGENTS / CLAUDE / rules as multiple entry files. Shared rules live only in `AGENTS.md` so those entries do not conflict.
- Whether official discovery includes shared `.agents/skills`: UNVERIFIED. Native `.grok` targets and a new session are required to prove it.

### Kimi Code CLI

Sources (2026-09-07, official): [skills](https://www.kimi.com/code/docs/en/kimi-code-cli/customization/skills.html), [agents](https://www.kimi.com/code/docs/en/kimi-code-cli/customization/agents.html), [hooks](https://www.kimi.com/code/docs/en/kimi-code-cli/customization/hooks.html), [config files](https://www.kimi.com/code/docs/en/kimi-code-cli/configuration/config-files.html).

- The product is Kimi Code CLI, not old kimi-cli.
- Hook exit-code semantics differ from Claude: a failure other than 2 does not block.

### OMP

Sources (2026-09-07, official canonical main): [context](https://github.com/can1357/oh-my-pi/blob/main/docs/context-files.md), [skills](https://github.com/can1357/oh-my-pi/blob/main/docs/skills.md), [extensions](https://github.com/can1357/oh-my-pi/blob/main/docs/extensions.md), [task](https://github.com/can1357/oh-my-pi/blob/main/docs/tools/task.md), [approval](https://github.com/can1357/oh-my-pi/blob/main/docs/approval-mode.md).

- Do not fill the OMP row from Pi docs.
- `main` is a floating source. Installed version/commit was not checked: UNVERIFIED.

## Coverage in this repository

| Asset | Status |
| --- | --- |
| Root `AGENTS.md` | Shared rules (repo contract) |
| Root `CLAUDE.md` | `@AGENTS.md` import plus Claude loader notes (repo contract) |
| `platforms/claude/agents/`, `platforms/claude/hooks/` | Claude sources (repo contract) |
| `platforms/codex/agents/` | Codex agent templates; no prompts directory (repo contract) |
| `platforms/antigravity/commands/` | Existing side-branch source; outside five-tool acceptance |
| `scripts/install_projects.py` | Maps claude-code / grok / codex / kimi-code / omp; not discovery proof |
| Five-client new-session discovery and native hook/agent execution | UNVERIFIED |
