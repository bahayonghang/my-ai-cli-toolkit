# Rust CLI/TUI Developer Skill

Expert guidance for Rust command-line interface and terminal user interface development using the most popular libraries: **clap**, **inquire**, and **ratatui**.

## 📦 Included Libraries (via Git Submodules)

This skill includes the complete official source code for these libraries in the `source/` directory:

- **[`source/clap/`](source/clap/)** - [clap-rs/clap](https://github.com/clap-rs/clap) - Command-line argument parsing
- **[`source/inquire/`](source/inquire/)** - [mikaelmello/inquire](https://github.com/mikaelmello/inquire) - Interactive prompts
- **[`source/ratatui/`](source/ratatui/)** - [ratatui/ratatui](https://github.com/ratatui/ratatui) - Terminal UI framework

## 🚀 Quick Setup

### Initialize Git Submodules

Run this script to download the official library source code:

```bash
# Navigate to the skill directory
cd ~/.claude/skills/rust-cli-tui-developer

# Initialize and update all submodules
git submodule update --init --recursive

# Alternative: Initialize one submodule at a time
git submodule add https://github.com/clap-rs/clap.git source/clap
git submodule add https://github.com/mikaelmello/inquire.git source/inquire
git submodule add https://github.com/ratatui/ratatui.git source/ratatui
```

### Manual Setup (Alternative)

If the above doesn't work due to network issues, you can manually clone:

```bash
cd source/

# Clone the repositories manually
git clone https://github.com/clap-rs/clap.git
git clone https://github.com/mikaelmello/inquire.git
git clone https://github.com/ratatui/ratatui.git
```

## 📚 Available Resources

Once initialized, you'll have access to:

### Official Examples
- `source/clap/examples/` - CLI parsing examples
- `source/inquire/examples/` - Interactive prompt examples
- `source/ratatui/examples/` - TUI application examples

### Complete Documentation
- `source/clap/docs/` - Full clap documentation
- `source/ratatui/docs/` - Ratatui guides and API docs
- Source code for all three libraries

## 🛠️ Usage Examples

The skill provides ready-to-use code patterns for:

1. **CLI Applications** with clap
2. **Interactive Prompts** with inquire
3. **Rich Terminal UIs** with ratatui
4. **Complete Applications** combining all libraries

See the main `SKILL.md` file for comprehensive examples and best practices.