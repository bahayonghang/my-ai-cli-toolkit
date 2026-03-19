# MCS TUI

## What it is

`MCS` is the terminal UI binary provided by the Rust workspace in `mcs/`. The TUI is built from:

- `mcs-core` for discovery, install, diff, metadata parsing, migration, and platform resolution
- `mcs-tui` for the ratatui/crossterm interface

## Run it

```bash
just mcs
```

Alternative:

```bash
cd mcs
cargo run --release --bin mcs --
```

## Repository root detection

The current implementation detects the project root by walking upward until it finds `content/skills/`.

That means the correct mental model is:

- repository root contains `content/`
- skills live under `content/skills/`
- platform content lives under `content/platforms/<platform>/`

If the TUI cannot find that layout, it exits early.

## Main screens

### Platform select

- choose a platform
- open the dashboard
- quit

### Main view

- `1`: skills
- `2`: commands
- `3`: agents
- `Tab`: cycle sidebar, item list, and search
- `/`: focus search
- `d`: open detail
- `D`: open diff
- `P`: view platform config
- `S`: multi-platform sync

### Install and status model

- `✓` installed and current
- `⚠` outdated or drifted
- `○` not installed

## Storage and install model

MCS keeps canonical skill copies in `~/.mcs/skills/` and then installs to platform targets by:

- symlink when possible
- copy when symlink is unavailable

This is also why one-time migration files appear under `~/.mcs/migrations/`.

## Guidance update behavior

Claude and Codex both expose guidance update flow in the default platform config (`CLAUDE.md` and `AGENTS.md`). The TUI guidance diff/update action is platform-aware rather than Claude-only.

If you are extending guidance behavior, also inspect:

- `mcs/mcs-core/src/core/guidance.rs`
- `platforms.toml`
- the runtime assets documented in [Runtime Files](/guide/runtime-files)

## Troubleshooting

### Project root not detected

Run the TUI from the repository root so `content/skills/` is visible:

```bash
just mcs
```

### Rust toolchain missing

Install Rust via [rustup](https://rustup.rs).

### Rendering issues in older terminals

Use ASCII mode:

```bash
MCS_ASCII=1 just mcs
```

## Related pages

- [MCS Web](/guide/mcs-web)
- [MCS Architecture](/guide/mcs-architecture)
- [Installation](/guide/installation)
