# Introduction

This site documents the current repository shape of [`my-claude-code-settings`](https://github.com/bahayonghang/my-claude-code-settings), not the older template project layout that some historical pages still referenced.

## What lives in this repository

- `content/skills/` contains installable skill directories, organized by category.
- `content/platforms/<platform>/commands/` contains platform-scoped command and workflow sources.
- `content/platforms/claude/agents/` contains Claude agent definitions grouped into `ccw` and `specialist`.
- `content/platforms/<platform>/guidance/` contains persistent guidance seeds such as `CLAUDE.md` and `AGENTS.md`.
- `content/skills/external-skills/` contains the external skill registry metadata used by MCS Web.
- `content/hooks/` contains runtime support files.
- `mcs/` is a Rust workspace with a shared core library, a terminal UI, and a web app.

## Recommended entrypoints

### Install skills directly from GitHub

```bash
# macOS / Linux
bash <(curl -fsSL https://raw.githubusercontent.com/bahayonghang/my-claude-code-settings/main/tools/scripts/skills-install/skills-install.sh)
```

```powershell
# Windows PowerShell
irm https://raw.githubusercontent.com/bahayonghang/my-claude-code-settings/main/tools/scripts/skills-install/skills-install.ps1 | iex
```

- Best when you want an interactive terminal installer without cloning the repository.
- Supports first-party GitHub installs and third-party `external-skills` installs with installed-skill detection.

### Install the first-party skills catalog directly

```bash
npx skills add bahayonghang/my-claude-code-settings/content/skills
```

- Fast path when you only need the first-party skills catalog.
- Does not replace the repository-level MCS tooling or command catalogs.

### Use MCS TUI

```bash
just mcs
```

- Best for browsing installed vs source content.
- Supports platform switching, diff view, batch install/uninstall, and multi-sync.

[Open the TUI guide →](/guide/mcs)

### Use MCS Web

```bash
just web
```

- Runs the Axum backend and React UI together for a browser-based workflow.
- Best for richer detail drawers, install target dialogs, and catalog browsing.

[Open the MCS Web guide →](/guide/mcs-web)

### Use local installer wrappers after cloning

```bash
just skills-install
just skills-install-ps1
```

- Local convenience wrappers around the same installer scripts.
- Only relevant after the repository has already been cloned.

## Documentation map

- [Installation](/guide/installation): direct remote install, clone-based workflows, build, and supported platform paths
- [MCS TUI](/guide/mcs): keyboard flow, install model, migration, troubleshooting
- [MCS Web](/guide/mcs-web): backend/UI startup, pages, install flows
- [MCS Architecture](/guide/mcs-architecture): `mcs-core`, `mcs-tui`, `mcs-web`
- [Commands](/guide/commands): how `content/platforms/*/commands` maps to installed command locations
- [Runtime Files](/guide/runtime-files): hooks and platform guidance/runtime assets
- [External Skills](/guide/external-skills): registry format and install flow for third-party skills
- [Creating Skills](/guide/creating-skills): adding new `content/skills/<category>/<skill-name>/`

## Notes on legacy pages

Some historical pages used older names such as `my-claude-skills`, `skills/`, `install.sh`, `install.ps1`, or `src/install.py`. Those references are no longer the source of truth for this repository. Where compatibility pages remain, they now redirect readers to the current model.
