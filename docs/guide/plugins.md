# Plugins

Claude Code supports a plugin system that extends its capabilities through community-contributed skills and tools.

## Plugin Marketplaces

Marketplaces are repositories that host collections of plugins. You can add multiple marketplaces to discover and install plugins.

| Marketplace | Repository | Available | Description |
|-------------|------------|-----------|-------------|
| claude-code-workflows | [wshobson/agents](https://github.com/wshobson/agents) | 67 | Workflow collection |
| claude-hud | [jarrodwatts/claude-hud](https://github.com/jarrodwatts/claude-hud) | 1 | HUD display enhancement |
| claude-plugins-official ⭐ | [anthropics/claude-plugins-official](https://github.com/anthropics/claude-plugins-official) | 40 | Official Anthropic plugins |
| daymade-skills | [daymade/claude-code-skills](https://github.com/daymade/claude-code-skills) | 26 | Skills collection |

## Recommended Plugins

### Official Plugins (claude-plugins-official)

| Plugin | Description |
|--------|-------------|
| code-review | Code review assistant |
| context7 | Context management |
| feature-dev | Feature development helper |
| frontend-design | Frontend design assistant |
| pyright-lsp | Python language server support |
| rust-analyzer-lsp | Rust language server support |
| serena | Serena assistant |
| typescript-lsp | TypeScript language server support |

### Community Plugins

| Plugin | Source | Description |
|--------|--------|-------------|
| claude-hud | claude-hud | HUD display enhancement for Claude Code |
| skill-creator | daymade-skills | Tool for creating new skills |

## Usage

Use the `/plugin` command in Claude Code to manage plugins:

```
> /plugin
```

### Navigation

- `Discover` - Browse available plugins
- `Installed` - View installed plugins
- `Marketplaces` - Manage plugin sources
- `Errors` - View error logs

### Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `Tab` | Cycle through tabs |
| `Space` | Toggle selection |
| `Enter` | View details |
| `Delete` | Uninstall plugin |
| `Esc` | Go back |

## Adding a Marketplace

1. Open the plugin manager with `/plugin`
2. Navigate to `Marketplaces` tab
3. Select `+ Add Marketplace`
4. Enter the repository in format `owner/repo`

## Plugin Installer CLI

This project includes a cross-platform CLI tool for batch installing plugins.

### Installation

```bash
cd claude-plugin-install-scripts
uv add typer rich tomli  # Python < 3.11
uv add typer rich        # Python >= 3.11
```

### Usage

```bash
# List all available plugins
uv run python install.py list

# List by category
uv run python install.py list --category python

# Install all plugins
uv run python install.py install --all

# Install specific plugins
uv run python install.py install python-development canvas

# Install by category
uv run python install.py install --category python

# Dry run (show commands only)
uv run python install.py install --all --dry-run

# View all categories
uv run python install.py categories
```

### Available Plugins

| Category | Plugin | Description |
|----------|--------|-------------|
| python | `python-development` | Python dev suite (python-pro, django-pro, fastapi-pro) |
| javascript | `javascript-typescript` | JS/TS dev suite (javascript-pro, typescript-pro) |
| review | `comprehensive-review` | Code review suite (architect-review, code-reviewer, security-auditor) |
| infrastructure | `deployment` | Deployment tools |
| infrastructure | `kubernetes` | Kubernetes configuration tools |
| security | `security-scanning` | Security scanning tools |
| tools | `canvas` | Canvas plugin for split-pane generation |

### Configuration

Plugins are configured in `claude-plugin-install-scripts/plugins.toml`:

```toml
# Define a marketplace
[marketplaces.wshobson-agents]
repo = "wshobson/agents"
description = "Claude Code Workflows & Skills"

# Define a plugin
[plugins.python-development]
marketplace = "wshobson-agents"
description = "Python dev suite"
category = "python"
```

To add new plugins, simply edit the TOML file.
