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
- **`content/skills/<category>/<skill-name>/`** — Each skill is a directory with a `SKILL.md` definition. Categories: `academic-skills`, `ai-llm-skills`, `devtools-skills`, `diagram-skills`, `document-skills`, `git-github-skills`, `media-skills`, `obsidian-skills`, `skill-meta-skills`, `tech-stack-skills`, `development-skills`, `workflow-skills`.
- **`content/commands/<platform>/`** — Slash commands for each platform (claude, codex, gemini, antigravity, windsurf, trae).
- **`content/agents/`** — AI agent definitions (CCW and specialist agents).
- **`content/prompts/`** — Global prompts, including platform-specific `CLAUDE.md` templates (`Windows/`, `Unix/`).
- **`content/skills/external-skills/`** — Directoryized external-skill registry (`index.toml` + category fragments) consumed by `mcs-core` and surfaced through the `mcs-web` `npx skills` flow.

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

- **Rust edition 2024**, minimum toolchain `1.85`. Release builds use `opt-level = "z"`, `lto = true`, `strip = true`.
- **UI**: React + TypeScript strict mode, MUI v6 (Grid v2 API with `size` prop). No CSS files — all styling via MUI `sx` prop.
- **Commands source fallback**: Platforms can declare a `fallback_commands_source` (e.g., `codex` falls back to `claude` commands if no codex-specific commands exist).
- **No root `CLAUDE.md` for OMC config**: The OMC multi-agent orchestration config lives in `.claude/CLAUDE.md`, not the project root.

## Design Context

### Users
Primary users are developers and AI-tool power users managing Claude/Codex/Gemini/Qwen-style skills, commands, and platform configuration in local development environments. They use MCS Web to quickly understand platform availability, inspect install state, and complete installation or update tasks without friction or ambiguity.

### Brand Personality
Calm, precise, trustworthy.

The interface should evoke confidence and control rather than hype. It should feel like a polished control surface for real technical work: clear information hierarchy, low cognitive noise, and predictable interactions. Visual interest is welcome, but it must support orientation and focus instead of competing with the task.

### Aesthetic Direction
A refined productivity interface for technical users. The visual system can retain expressive theming and environmental depth, but should avoid obvious "AI-generated" tells such as gratuitous glassmorphism, repetitive card grids, decorative gradients, or flashy futuristic motifs. Both light and dark themes must feel intentional and equally complete. Motion should be restrained, meaningful, and reduced-motion-safe.

### Design Principles
1. Prioritize fast management flows: users should be able to scan status, choose a platform, and act quickly.
2. Favor calm precision over spectacle: every visual treatment must improve clarity, hierarchy, or feedback.
3. Avoid AI-slop patterns: no template-looking hero stats, decorative gradients, overused glass panels, or generic dashboard theatrics unless they serve a real purpose.
4. Design both themes seriously: light and dark modes should each have strong contrast, coherent surfaces, and no second-class styling.
5. Treat accessibility as baseline quality: target WCAG AA or better, preserve keyboard/focus clarity, and respect reduced-motion preferences.
