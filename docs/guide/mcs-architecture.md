# MCS Architecture

## Workspace shape

The Rust workspace in `mcs/` currently has three crates:

| Crate | Type | Responsibility |
|-------|------|----------------|
| `mcs-core` | library | discovery, metadata parsing, install logic, path resolution, migration, shared models |
| `mcs-tui` | binary | terminal UI built with ratatui/crossterm |
| `mcs-web` | binary | Axum API server plus SPA hosting for the React UI |

## Source-of-truth paths

`mcs-core` treats the repository as a `content/`-based project:

- skills: `content/skills/`
- platform content: `content/platforms/<platform>/{commands,agents,guidance}/`
- runtime support: `content/hooks/`

Project root detection succeeds when `content/skills/` is found.

## Core modules in `mcs-core`

### Config

- `config/paths.rs`: repository root detection and source-dir helpers
- `config/platform.rs`: default platform config, project overrides, user overrides, and install-path formatting

### Content discovery

- `core/discovery.rs`: walks skill, command, and agent source trees, computes install status, reads metadata
- `core/skill_meta.rs`: parses top-level skill frontmatter fields used by MCS
- `core/external_skills.rs`: loads the external-skills registry from `content/skills/external-skills/` (`index.toml` + category fragments)

### Install pipeline

- `core/installer.rs`: install/uninstall for skills, commands, and agents
- `core/install_target.rs`: global vs project-local install targets
- `core/skill_store.rs`: canonical local store under `~/.mcs/skills/`
- `core/skill_migration.rs`: one-time migration to canonical store + symlink model
- `core/guidance.rs`: guidance diff/update logic for platforms that define `CLAUDE.md` or `AGENTS.md`

## TUI flow

`mcs-tui` owns:

- screen state
- keyboard input handling
- popups and dialogs
- rendering widgets

It calls into `mcs-core` for discovery, diff, guidance update, install, uninstall, and sync decisions.

## Web flow

`mcs-web` owns:

- async app state
- REST API handlers
- external-registry-backed install jobs and streaming
- built UI asset serving

The React UI talks only to the Axum API layer. Shared business rules stay in `mcs-core`.

## Why the split matters

- content semantics and path rules live once in `mcs-core`
- terminal and browser UX can evolve independently
- platform path logic stays consistent across both surfaces
- documentation should describe the workspace as a three-part system, not as a single TUI binary
