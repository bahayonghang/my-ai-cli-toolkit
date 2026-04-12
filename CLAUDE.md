# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A curated collection of AI skills, commands, and prompts installable across multiple AI coding platforms (Claude, Codex, Gemini, Qwen, Kiro, Trae, Windsurf, etc.). The repository also ships **MCS** (My Claude Settings) — a Rust-based management tool available as both a TUI and a web app — for browsing, installing, and updating skills.

## Build & Dev Commands

All common tasks are managed via [`just`](https://github.com/casey/just). Run `just help` for the full list.

### MCS TUI (Rust)
```bash
just mcs          # Build (release) and run the TUI skill manager
just mcs-dev      # Dev mode (debug build, faster compile)
just mcs-rebuild  # Force clean + rebuild
```

### MCS Web (Rust backend + React UI)
```bash
just web                # Start both backend (port 23242) and UI (port 15173) with hot-reload
just mcs-web-server     # Backend only
just mcs-web-dev        # UI only (requires backend running)
just mcs-web            # Build production bundle and run
```

### Documentation Site (VitePress)
```bash
just doc    # Install deps and start dev server (http://localhost:4000)
just docs-build   # Build for production
```

### Code Quality
```bash
just ci                 # Full CI: tsc + cargo fmt + cargo clippy + cargo test
just rust-check-all     # cargo fmt --check + clippy + test
just rust-fix           # cargo fmt + clippy --fix
just rust-test          # cargo test (runs from mcs/)
just ts-check           # TypeScript type check (mcs-web UI)
```

To run a single Rust test:
```bash
cd mcs && cargo test <test_name>           # e.g. cargo test resolve_global_returns_original_platform
cd mcs && cargo test -p mcs-core <name>   # target a specific crate
```

## Architecture

### Content (`content/`)
The installable content, organized by type:
- **`content/skills/<category>/<skill-name>/`** — Each skill is a directory with a `SKILL.md` definition. Categories: `development-workflows`, `developer-tools-integrations`, `git-github-collaboration`, `docs-writing-publishing`, `research-learning-knowledge`, `visual-media-design`.
- **`content/commands/<platform>/`** — Slash commands for each platform (claude, codex, gemini, antigravity, windsurf, trae).
- **`content/agents/`** — AI agent definitions (CCW and specialist agents).
- **`content/prompts/`** — Global prompts, including platform-specific `CLAUDE.md` templates (`Windows/`, `Unix/`).
- **`content/community-skills-registry/`** — Directoryized external-skill registry (`index.toml` + category fragments) consumed by `mcs-core` and surfaced through the `mcs-web` `npx skills` flow.

### MCS Rust Workspace (`mcs/`)
Cargo workspace with three crates:

**`mcs-core`** (library crate) — Shared business logic:
- `config/platform.rs` — `PlatformConfig` struct + 3-tier config loading: `defaults → platforms.toml → ~/.config/myclaude/platforms.toml`. Each platform defines `base_dir`, `skills_subdir`, `commands_subdir`, and an optional `prompt_file`.
- `core/discovery.rs` — Scans the content directory for skills and commands, computes `InstallStatus` (Installed / NotInstalled / Outdated via mtime comparison).
- `core/installer.rs` — Copies/removes skills and commands to platform directories.
- `core/install_target.rs` — `InstallTarget` with `scope: Global | Project`. Global installs go to the platform's `base_dir`; Project installs resolve to `<project_path>/.<platform>` (with special mappings: `opencode` → `.opencode`, `antigravity` → `.gemini/antigravity`, `windsurf` → `.codeium/windsurf`).
- `core/skill_store.rs` — Local skill cache at `~/.mcs/skills/`. Installs via symlink (preferred) with copy fallback (`SkillInstallMode`). Used by the migration and external-registry-backed install systems.
- `core/skill_migration.rs` — One-shot migration (`skills-symlink-v1`) that converts skills previously copied into the store to symlinks for deduplication.
- `core/skill_meta.rs` — Parses `SKILL.md` metadata (name, description, tags, category).
- `model.rs` — Core types: `ItemInfo`, `ItemType`, `InstallStatus`, `InstallResult`, `LinkMode`.

**`mcs-tui`** (binary) — Terminal UI built with `ratatui`/`crossterm`:
- `tui/screens/` — Screen state machines (platform select, skill list, install, etc.)
- `tui/widgets/` — Reusable TUI widgets (header, footer, lists)
- `tui/popups/` — Modal overlays (confirm, detail, diff)
- `tui/input.rs`, `tui/actions.rs` — Input event → action dispatch

**`mcs-web`** (binary) — HTTP server + embedded SPA:
- Backend: Axum on port 23242. REST routes in `src/api/mod.rs`: platforms, skills, commands, prompt, dashboard, sync, diff.
- UI: React + TypeScript + MUI (Material UI v6) in `mcs-web/ui/`. Vite dev server on port 15173 proxies API calls to 23242.
- State: Zustand stores per domain (platformStore, dashboardStore, uiStore).

### Platform Configuration (`platforms.toml`)
Defines install paths for each supported platform. Priority order:
1. Hardcoded defaults in `mcs-core/src/config/platform.rs`
2. `platforms.toml` in the project root
3. `~/.config/myclaude/platforms.toml` (user overrides, highest priority)

### Skill Format
A skill is a directory containing at minimum a `SKILL.md` file. The file's YAML front-matter or heading structure is parsed by `skill_meta.rs` for name, description, category, and tags. Optional subdirectories: `scripts/`, `config/`, `references/`, `docs/`, `examples/`.

## Key Conventions

- **Rust edition 2024**, minimum toolchain `1.88`. Release builds use `opt-level = "z"`, `lto = true`, `strip = true`.
- **UI**: React + TypeScript strict mode, MUI v7 (Grid v2 API with `size` prop). No CSS files — all styling via MUI `sx` prop.
- **Commands source fallback**: Platforms can declare a `fallback_commands_source` (e.g., `codex` falls back to `claude` commands if no codex-specific commands exist).
- **No root `CLAUDE.md` for OMC config**: The OMC multi-agent orchestration config lives in `.claude/CLAUDE.md`, not the project root.

## Design Context

### Users
MCS Web serves developer-tool power users who manage AI skills, commands, agents, and platform configuration across local coding environments. They use it in active development workflows to scan platform availability, inspect install status, compare source vs installed content, and complete install, update, sync, and cleanup actions with low friction. The interface should support fast orientation, high information density, and confident execution rather than exploratory browsing.

### Brand Personality
Calm, precise, trustworthy.

The product should feel like a dependable control surface for serious technical work: composed, efficient, and quietly opinionated. The emotional target is confidence and clarity rather than hype or spectacle. Even when the UI becomes bolder, it should still communicate discipline, structure, and technical credibility.

### Aesthetic Direction
Direction: calm precision with stronger visual authority.

The interface should lean toward a refined control-room aesthetic for developer tools: structured, editorially deliberate, and slightly more distinctive than a generic dashboard, but never like a marketing landing page. Favor strong hierarchy, asymmetry where useful, tinted neutrals, and memorable focal moments that still preserve operational clarity. Avoid dark neon, purple-blue AI gradients, excessive motion, and anything that reads as promotional rather than utilitarian.

### Design Principles
1. Design for scanability first: users should understand state, available actions, and hierarchy within seconds.
2. Increase contrast with restraint: make important things feel more intentional and more visible without turning the interface into spectacle.
3. Keep the product operational, not promotional: every bold move must reinforce utility, orientation, or confidence.
4. Build memorable structure through typography, spacing, and surface treatment instead of trendy AI-slop effects.
5. Respect accessibility and focus: calm motion, strong contrast, clear keyboard/focus behavior, and reduced-motion-safe interactions are baseline quality.
