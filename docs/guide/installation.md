# Installation

## Prerequisites

Choose the minimal setup for your workflow:

- Direct skill installation only:
  - Node.js
  - `npx`
- Repository workflows:
  - Git
  - Rust toolchain (`cargo`) for `mcs/`
  - Node.js + npm for the docs site and `mcs-web/ui`
  - optional `just` for local task entrypoints

## Install skills without cloning the repository

If you only want to install skills, the repository clone is optional.

### Interactive remote installer

```bash
# macOS / Linux
bash <(curl -fsSL https://raw.githubusercontent.com/bahayonghang/my-claude-code-settings/main/tools/scripts/skills-install/skills-install.sh)
```

```powershell
# Windows PowerShell
irm https://raw.githubusercontent.com/bahayonghang/my-claude-code-settings/main/tools/scripts/skills-install/skills-install.ps1 | iex
```

These scripts:

- ask you to choose `project` or `global` scope first
- inspect the selected scope with `npx skills ls --json`
- let you choose either:
  - first-party skills from this repository's GitHub source
  - third-party skills from `content/skills/external-skills/`
- download candidate metadata from GitHub:
  - first-party skills from `content/skills/catalog.json`
  - third-party skills from `content/skills/external-skills/index.toml` and `categories/*.toml`
- hide already installed skills before selection

For `project` scope, the current shell working directory is used as the install target.

### Install only the first-party skills catalog

```bash
npx skills add bahayonghang/my-claude-code-settings/content/skills
```

This is the lightweight path when you only want the first-party skill folders and do not need the repository's MCS tooling or the interactive external-skills flow.

### Install all first-party skills non-interactively

```bash
npx skills add bahayonghang/my-claude-code-settings/content/skills --skill '*' -g -y -a universal -a antigravity -a claude-code -a iflow-cli -a kiro-cli -a qwen-code -a trae -a trae-cn
```

## Clone the repository when you need local tooling

Clone the repository when you want the Rust TUI, the web app, the local docs site, or local `just` wrappers for the installer scripts.

```bash
git clone https://github.com/bahayonghang/my-claude-code-settings.git
cd my-claude-code-settings
```

### Primary local entrypoints

```bash
just mcs
just web
just doc
just skills-install
```

Explicit local installer entrypoints are also available:

```bash
just skills-install-sh
just skills-install-ps1
```

`just skills-install` picks the current platform default:

- Windows -> `skills-install.ps1`
- macOS / Linux -> `skills-install.sh`

## Platform paths

The authoritative platform path mapping lives in `platforms.toml` and is merged with defaults from `mcs-core`.

### Shared-skills platforms

These platforms install skills into the shared `~/.agents/skills/` root:

- Amp
- Cline
- Codex
- Cursor
- Gemini
- GitHub Copilot
- Kimi
- OpenCode

Commands, agents, or guidance still install into platform-specific locations.

### Native platform paths

| Platform | Skills path | Platform-managed extras |
|----------|-------------|-------------------------|
| Claude | `~/.claude/skills/` | commands: `~/.claude/commands/`, agents: `~/.claude/agents/`, guidance: `~/.claude/CLAUDE.md` |
| Codex | `~/.agents/skills/` | guidance: `~/.codex/AGENTS.md` |
| Gemini | `~/.agents/skills/` | commands: `~/.agents/commands/` |
| Qwen | `~/.qwen/skills/` | commands: `~/.qwen/commands/` |
| Kiro | `~/.kiro/skills/` | commands: `~/.kiro/steering/` |
| Qoder | `~/.qoder/skills/` | commands: `~/.qoder/commands/` |
| Trae | `~/.trae/skills/` | commands: `~/.trae/commands/` |
| Trae CN | `~/.trae-cn/skills/` | commands: `~/.trae-cn/commands/` |
| OpenCode | `~/.agents/skills/` | commands: `~/.config/opencode/commands/` |
| iFlow | `~/.iflow/skills/` | commands: `~/.iflow/commands/` |
| Antigravity | `~/.gemini/antigravity/skills/` | workflows: `~/.gemini/antigravity/workflows/` |
| Windsurf | `~/.codeium/windsurf/skills/` | workflows: `~/.codeium/windsurf/workflows/` |

## Project root detection

`mcs-core` auto-detects the repository root by walking upward until it finds `content/skills/`. That means:

- The current repository model is `content/skills/`, not a top-level `skills/` directory.
- Running `just mcs` or `just web` from the repository root is the expected path.

## Skill storage model

MCS keeps a canonical skill store at `~/.mcs/skills/`:

- symlink install is preferred
- copy install is the automatic fallback
- one-time migration metadata lives in `~/.mcs/migrations/`

See [MCS TUI](/guide/mcs) for the operational flow and [MCS Architecture](/guide/mcs-architecture) for implementation details.
