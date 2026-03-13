# Rust CLI & TUI Development Guide

## Cargo Dependencies

```bash
# CLI argument parsing
cargo add clap --features derive

# Interactive terminal prompts
cargo add inquire

# Terminal UI framework
cargo add ratatui crossterm
```

### Common Cargo.toml features

```toml
[dependencies]
clap = { version = "4", features = ["derive", "env", "unicode"] }
inquire = "0.7"
ratatui = { version = "0.29", features = ["all-widgets"] }
crossterm = "0.28"

# Optional: useful companions
anyhow = "1"           # Error handling
serde = { version = "1", features = ["derive"] }
serde_json = "1"
```

---

## clap — Command-Line Argument Parsing

### Basic derive usage

```rust
use clap::Parser;

#[derive(Parser)]
#[command(name = "myapp", version, about = "A sample CLI tool")]
struct Cli {
    /// Input file path
    input: String,

    /// Output file path
    #[arg(short, long, default_value = "output.txt")]
    output: String,

    /// Enable verbose output
    #[arg(short, long)]
    verbose: bool,

    /// Repeat count
    #[arg(short, long, default_value_t = 1)]
    count: u32,
}

fn main() {
    let cli = Cli::parse();
    println!("Input: {}, Output: {}", cli.input, cli.output);
}
```
### Subcommands

```rust
use clap::{Parser, Subcommand};

#[derive(Parser)]
#[command(name = "tool")]
struct Cli {
    #[command(subcommand)]
    command: Commands,
}

#[derive(Subcommand)]
enum Commands {
    /// Initialize a new project
    Init {
        /// Project name
        name: String,
    },
    /// Run the application
    Run {
        /// Config file
        #[arg(short, long)]
        config: Option<String>,
    },
    /// Show status
    Status,
}

fn main() {
    let cli = Cli::parse();
    match cli.command {
        Commands::Init { name } => println!("Initializing {name}"),
        Commands::Run { config } => println!("Running with config: {config:?}"),
        Commands::Status => println!("All good"),
    }
}
```

### Argument types

| Attribute | Effect |
|-----------|--------|
| `#[arg(short, long)]` | `-v` / `--verbose` flag |
| `#[arg(default_value = "x")]` | Default string value |
| `#[arg(default_value_t = 8)]` | Default typed value |
| `#[arg(value_enum)]` | Restrict to enum variants |
| `#[arg(env = "MY_VAR")]` | Read from environment variable |
| `#[arg(num_args = 1..)]` | Accept multiple values |

---

## inquire — Interactive Terminal Prompts

### Prompt types

```rust
use inquire::{Text, Select, MultiSelect, Confirm};

// Text input
let name = Text::new("Project name:")
    .with_default("my-app")
    .with_help_message("Enter a valid Rust crate name")
    .prompt()?;

// Single selection
let options = vec!["MIT", "Apache-2.0", "GPL-3.0"];
let license = Select::new("Choose a license:", options)
    .prompt()?;

// Multiple selection
let features = vec!["logging", "config", "cli", "tui"];
let selected = MultiSelect::new("Enable features:", features)
    .with_default(&[0, 2])
    .prompt()?;

// Yes/No confirmation
let proceed = Confirm::new("Continue?")
    .with_default(true)
    .prompt()?;
```

### Validation

```rust
use inquire::{Text, validator::MinLengthValidator};

let name = Text::new("Username:")
    .with_validator(MinLengthValidator::new(3))
    .prompt()?;
```

---

## ratatui — Terminal UI Framework

### Minimal event loop

```rust
use std::io;
use crossterm::{
    event::{self, Event, KeyCode},
    terminal::{disable_raw_mode, enable_raw_mode,
               EnterAlternateScreen, LeaveAlternateScreen},
    execute,
};
use ratatui::{prelude::*, widgets::Paragraph};

fn main() -> io::Result<()> {
    enable_raw_mode()?;
    let mut stdout = io::stdout();
    execute!(stdout, EnterAlternateScreen)?;
    let backend = CrosstermBackend::new(stdout);
    let mut terminal = Terminal::new(backend)?;

    loop {
        terminal.draw(|frame| {
            let area = frame.area();
            frame.render_widget(
                Paragraph::new("Hello ratatui! Press 'q' to quit."),
                area,
            );
        })?;

        if let Event::Key(key) = event::read()? {
            if key.code == KeyCode::Char('q') {
                break;
            }
        }
    }

    disable_raw_mode()?;
    execute!(terminal.backend_mut(), LeaveAlternateScreen)?;
    Ok(())
}
```
### Layout and constraints

```rust
use ratatui::prelude::*;

// Vertical split: 3-line header, flexible body, 1-line footer
let chunks = Layout::default()
    .direction(Direction::Vertical)
    .constraints([
        Constraint::Length(3),
        Constraint::Min(0),
        Constraint::Length(1),
    ])
    .split(frame.area());

// Horizontal split within body
let body = Layout::default()
    .direction(Direction::Horizontal)
    .constraints([
        Constraint::Percentage(30),
        Constraint::Percentage(70),
    ])
    .split(chunks[1]);
```

### Common widgets

```rust
use ratatui::widgets::{Block, Borders, List, ListItem, Table, Row, Cell};

// Block with borders
let block = Block::default()
    .title("Panel")
    .borders(Borders::ALL);

// List
let items: Vec<ListItem> = vec![
    ListItem::new("Item 1"),
    ListItem::new("Item 2"),
];
let list = List::new(items)
    .block(Block::default().title("List").borders(Borders::ALL))
    .highlight_symbol(">> ");

// Table
let rows = vec![
    Row::new(vec![Cell::from("Name"), Cell::from("Value")]),
];
let table = Table::new(rows, [Constraint::Percentage(50), Constraint::Percentage(50)])
    .header(Row::new(vec!["Key", "Val"]).style(Style::default().bold()))
    .block(Block::default().title("Table").borders(Borders::ALL));
```

### Implementing a custom Widget

```rust
use ratatui::prelude::*;

struct StatusBar {
    message: String,
}

impl Widget for StatusBar {
    fn render(self, area: Rect, buf: &mut Buffer) {
        let style = Style::default().fg(Color::White).bg(Color::Blue);
        buf.set_string(area.x, area.y, &self.message, style);
    }
}
```

---

## Combined Architecture

A typical CLI+TUI app follows this pattern:

```
main()
  ├── clap::Parser::parse()        // Parse CLI arguments
  ├── match subcommand
  │   ├── interactive mode ──► inquire prompts ──► collect input
  │   └── tui mode ──► ratatui event loop
  └── execute business logic
```

### Example: CLI with optional TUI

```rust
use clap::{Parser, Subcommand};

#[derive(Parser)]
struct Cli {
    #[command(subcommand)]
    command: Commands,
}

#[derive(Subcommand)]
enum Commands {
    /// Interactive setup wizard
    Init,
    /// Launch TUI dashboard
    Dashboard,
    /// Run a one-shot command
    Run { task: String },
}

fn main() -> anyhow::Result<()> {
    let cli = Cli::parse();
    match cli.command {
        Commands::Init => {
            // Use inquire for interactive prompts
            let name = inquire::Text::new("Project name:").prompt()?;
            println!("Created project: {name}");
        }
        Commands::Dashboard => {
            // Launch ratatui TUI
            run_tui()?;
        }
        Commands::Run { task } => {
            println!("Running: {task}");
        }
    }
    Ok(())
}
```

---

## Tips

- Always enable `clap`'s `derive` feature for ergonomic argument parsing.
- Use `anyhow::Result` as the return type for `main()` to simplify error handling.
- For TUI apps, always restore terminal state in a cleanup block or `Drop` impl to avoid leaving the terminal in raw mode on panic.
- Prefer `crossterm` over `termion` for cross-platform compatibility (especially Windows).
- Use `ratatui`'s `StatefulWidget` trait when widgets need to track state (e.g., list selection, scroll position).
