# Rust CLI/TUI Developer

Expert guidance for Rust CLI and TUI development with official library examples.

## Overview

Rust CLI/TUI Developer provides expert guidance for building modern command-line interfaces and terminal user interfaces in Rust. It includes structured patterns, best practices, and real implementations from the official source code of clap, inquire, and ratatui libraries.

## Features

- 🎯 **Three Core Libraries** - clap, inquire, and ratatui
- 📚 **Official Examples** - Real code from library repositories
- 🏗️ **Structured Patterns** - Proven architectural approaches
- ⚡ **Best Practices** - Performance and usability guidelines
- 🔧 **Complete Workflows** - From parsing args to rich TUIs

## Supported Libraries

### clap - CLI Argument Parsing
- Command-line argument parsing
- Subcommands and flags
- Auto-generated help
- Shell completions

### inquire - Interactive Prompts
- Text input
- Select menus
- Multi-select
- Confirmations
- Custom validators

### ratatui - Terminal UI
- Rich terminal interfaces
- Widgets (tables, charts, lists)
- Layouts and styling
- Event handling
- Real-time updates

## Usage

Ask for guidance on any CLI/TUI topic:

```
How do I create a CLI with subcommands in Rust?
```

```
Show me how to build an interactive menu with inquire
```

```
I need to create a terminal dashboard with ratatui
```

## Library Selection Guide

| Use Case | Recommended Library |
|----------|-------------------|
| Simple CLI with flags | clap |
| Interactive prompts | inquire |
| Rich terminal UI | ratatui |
| Complex CLI app | clap + inquire |
| Full TUI application | ratatui |

## Example Patterns

### Basic CLI with clap
```rust
use clap::Parser;

#[derive(Parser)]
struct Cli {
    #[arg(short, long)]
    name: String,
}
```

### Interactive Prompt with inquire
```rust
use inquire::Select;

let options = vec!["Option 1", "Option 2"];
let answer = Select::new("Choose:", options).prompt()?;
```

### Terminal UI with ratatui
```rust
use ratatui::{
    backend::CrosstermBackend,
    widgets::{Block, Borders},
    Terminal,
};
```

## Best Practices

- Use clap's derive API for type-safe argument parsing
- Validate user input with inquire's custom validators
- Structure ratatui apps with clear state management
- Handle terminal cleanup properly in TUI apps
- Provide helpful error messages

## Requirements

- Rust 1.70+
- Cargo

## Dependencies

Add to your `Cargo.toml`:

```toml
[dependencies]
clap = { version = "4.0", features = ["derive"] }
inquire = "0.6"
ratatui = "0.25"
crossterm = "0.27"
```

## License

MIT
