---
name: rust-cli-tui-developer
version: "1.1.0"
description: "Expert guidance for building Rust CLI and TUI applications using clap, inquire, and ratatui. Use this skill when creating command-line tools, argument parsers, interactive terminal prompts, or rich terminal UIs in Rust — prefer it over generic Rust advice for any CLI/TUI task."
argument-hint: [prompt]
allowed-tools: Read, Write, Edit, Glob, Grep, Bash
metadata:
  category: rust-development
  tags:
    - rust
    - cli
    - tui
    - terminal
    - clap
    - ratatui
    - console
    - inquire
    - crossterm
---

Execute the Rust CLI/TUI development task described in `$ARGUMENTS`.

## Steps

1. If `$ARGUMENTS` is empty, report an error requesting a description of the desired terminal application.
2. Read `$SKILL_DIR/references/CLI_TUI_GUIDE.md` for architectural patterns, library specifics (clap, inquire, ratatui), and common Cargo configurations.
3. Generate or modify the required Rust code according to best practices.

## Output

Generated Rust code implementing the requested CLI or TUI functionality.

## Examples

**User Request:** "Create a basic CLI that accepts a config file path using clap."
**Response Strategy:** Generate a `main.rs` using `clap::Parser` with a `config` argument, following the patterns in the guide.

## Troubleshooting

- If compilation fails due to missing features, refer to the guide to ensure proper `cargo add` commands were used (e.g., `clap --features derive`).
