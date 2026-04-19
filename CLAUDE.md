# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repo shape

This repository has two main areas:
- `content/` — installable skills, commands, prompts, agents, and the community skills registry
- `mcs/` — the Rust workspace for MCS, including shared core logic, the TUI, and the web app

Before editing a scoped area, check for nested guidance files such as `CLAUDE.md` or `AGENTS.md` inside that subtree.

## Core commands

Use `just` from the repository root.

- `just mcs` — run the Rust TUI
- `just web` — run the Rust backend and Vite frontend together
- `just doc` — run the docs site
- `just mcs-web-test` — run frontend Vitest tests
- `just rust-test` — run Rust tests
- `just ts-check` — run TypeScript checks
- `just ci` — full validation

Runtime ports:
- backend: `23242`
- frontend: `15173`
- docs: `4000`

## Non-obvious repo rules

- `platforms.toml` is load-bearing: it defines install targets, prompt/command directories, and some platform-specific project install paths.
- Some platforms use command fallbacks instead of their own command directories; check platform config before assuming commands live only under their platform folder.
- Public skill changes usually require doc updates in both `docs/` and `docs/zh/`.
- The curated third-party registry lives under `content/community-skills-registry/`, not `content/skills/`.
- Zustand selectors in `mcs/mcs-web/ui/src/stores/` must return referentially stable values; see `mcs/mcs-web/ui/src/stores/README.md` for the rules.

## Validation and commits

- During implementation, run targeted checks for the area you changed.
- Before finishing or opening a PR, run `just ci`.
- Use Conventional Commits; prefer adding a scope when it helps clarify the change.
