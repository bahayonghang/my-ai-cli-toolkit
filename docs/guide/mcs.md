# MCS Guide

**MCS** (MyClaude Settings) is a high-performance, Rust-based TUI (Terminal User Interface) tool designed to manage AI skills, commands, and prompts for various agent platforms. It serves as the primary installer and management interface for the project.

## Key Features

- 🚀 **High Performance**: Built with Rust for instant startup and fluid navigation.
- 🎯 **Visual Management**: Browse, install, update, and uninstall skills via a modern TUI.
- 🔄 **Smart Updates**: Directory-aware detection for outdated skills (checks file content and mtime).
- 📦 **Batch Operations**: Queue multiple actions (install/uninstall) and execute them in one go.
- 🌏 **Unicode & ASCII Support**: Seamlessly adapts to modern terminals and legacy environments.
- 🔍 **Powerful Search**: Filter by category, status, or text search.

## Installation

### Prerequisites

- **Rust Toolchain**: MCS is built with Rust. You need `cargo` installed.
  ```bash
  rustup --version
  ```
  If not installed, get it from [rustup.rs](https://rustup.rs/).

### Running MCS

The recommended way to run MCS is via `just`:

```bash
just mcs
```

This command automatically builds (if needed) and runs the binary.

Alternatively, you can run the binary directly if built:

```bash
./mcs/target/release/mcs
```

## Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `MCS_ASCII` | Set to `1`, `true`, or `yes` to force ASCII mode. Useful for terminals with limited Unicode support. | `false` |

**Example: Force ASCII Mode**

```bash
MCS_ASCII=1 just mcs
```

### Project Root Detection

MCS automatically detects the project root by searching for the `skills/` directory. It looks in:
1. The directory of the executable.
2. The current working directory.
3. Parent directories (up to 10 levels).

Ensure you run `mcs` from within the `my-claude-skills` project structure.

## Navigation & Interface

### 1. Platform Selection Screen

Upon launch, you are presented with a list of supported platforms (Claude, Codex, Gemini, etc.).

- **Navigation**:
  - `↑` / `↓` or `k` / `j`: Move selection.
  - `Enter`: Select platform and open Main View.
- **Actions**:
  - `d`: Open Dashboard (system overview).
  - `q` or `Esc`: Quit.

### 2. Main View (Skills & Commands)

The main interface is divided into two columns: **Sidebar** (Categories) and **Item List**.

- **Tabs**:
  - `1`: **Skills** - Manage AI skills (tools).
  - `2`: **Commands** - Manage prompts and workflows.

- **Focus Management**:
  - `Tab`: Cycle focus between **Sidebar** ↔ **Item List** ↔ **Search Input**.

- **Status Icons**:
  - `✓` (Installed): Up to date.
  - `⚠` (Outdated): Local changes or updates available.
  - `○` (Not Installed): Ready to install.

### Keyboard Shortcuts

#### Navigation
| Key | Action |
|-----|--------|
| `↑` / `↓` / `k` / `j` | Move cursor up/down |
| `PgUp` / `PgDn` | Scroll pages (in lists and popups) |
| `Tab` | Switch focus (Sidebar / List / Search) |

#### Selection & Installation
| Key | Action |
|-----|--------|
| `Space` | Toggle selection of current item |
| `a` | **Select All** (or Clear All if all selected) in current list |
| `i` | **Install** selected items (or focused item if none selected) |
| `u` | **Uninstall** focused item |
| `x` | Batch **Uninstall** selected items |
| `U` | **Update** all outdated items in the current view |

#### Filters & Search
| Key | Action |
|-----|--------|
| `/` | Focus **Search** input |
| `s` | Cycle **Status Filter** (All -> Installed -> Outdated -> Not Installed) |
| `Esc` | Clear search / filters (or go back) |

#### Views & Tools
| Key | Action |
|-----|--------|
| `d` | Open **Detail** popup for focused item |
| `D` | Open **Diff** popup (compare installed vs source) |
| `p` | Open **Prompt** update popup (Claude only) |
| `P` | Open **Platform Config** popup |
| `S` | Open **Multi-Sync** popup (sync across platforms) |
| `Esc` | Back to Platform Select / Close Popup |
| `q` | Quit |

## Advanced Features

### Multi-Platform Sync (`S`)

The **Multi-Sync** feature allows you to install selected skills to multiple agents simultaneously.

1. Select items in the Main View using `Space`.
2. Press `S` to open the Sync popup.
3. Use `↑`/`↓` and `Space` to select target platforms (e.g., Claude + Gemini).
4. Press `Enter` to execute.

### Prompt Management (`p`)

*(Currently for Claude only)*

Press `p` to check if your global system prompt needs updating. MCS compares your installed prompt matches the project's verification prompt.

### Dashboard (`d`)

Press `d` on the Platform Select screen to view system stats, including total skills, installation paths, and version information.

## Troubleshooting

### "Error: Could not detect project root"
MCS needs to find the `skills/` directory.
- **Fix**: Run `just mcs` from the root of the `my-claude-skills` repository.

### "cargo: command not found"
- **Fix**: Install Rust via [rustup](https://rustup.rs).

### Display Glitches / Weird Characters
Some shells (like default PowerShell or old CMD) may not handle Unicode icons well.
- **Fix**: Run in ASCII mode:
  ```bash
  MCS_ASCII=1 just mcs
  ```
  Or use a modern terminal like Windows Terminal, VS Code Terminal, or iTerm2 with a Nerd Font.
