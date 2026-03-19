# Installation

## Prerequisites

- Git
- Rust toolchain (`cargo`) for `mcs/`
- Node.js + npm for the docs site and `mcs-web/ui`
- Optional: `npx` if you want the direct skill-only install flow

## Clone the repository

```bash
git clone https://github.com/bahayonghang/my-claude-code-settings.git
cd my-claude-code-settings
```

## Primary ways to use the repository

### 1. Start the terminal UI

```bash
just mcs
```

This builds and runs `mcs-tui` from the Rust workspace.

### 2. Start the web app

```bash
just web
```

This runs the Axum backend (`mcs-web`) and the React UI together.

### 3. Browse the documentation site locally

```bash
just doc
```

### 4. Install only the skills catalog

```bash
npx skills add bahayonghang/my-claude-code-settings/content/skills
```

This is the lightweight path when you only want the skill folders and do not need the repository's MCS tooling.

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
