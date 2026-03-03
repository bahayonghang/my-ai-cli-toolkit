Execute the Rust CLI/TUI development task described in `$ARGUMENTS`.

## Steps

1. If `$ARGUMENTS` is empty, report an error requesting a description of the desired terminal application.
2. Read `$SKILL_DIR/references/CLI_TUI_GUIDE.md` for architectural patterns and library specifics (clap, inquire, ratatui).
3. Review `$SKILL_DIR/SOURCE_SETUP.md` if submodules need to be initialized.
4. If the user wants to see official examples, search the `@source` directory as outlined in the guide.
5. Generate or modify the required Rust code according to best practices.

## Output

Generated Rust code implementing the requested CLI or TUI functionality.

## Examples

**User Request:** "Create a basic CLI that accepts a config file path using clap."
**Response Strategy:** Generate a `main.rs` using `clap::Parser` with a `config` argument, following the patterns in the guide.

## Troubleshooting

- If compilation fails due to missing features, refer to the guide to ensure proper `cargo add` commands were used (e.g., `clap --features derive`).
