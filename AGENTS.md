# Repository Guidelines

## Project Structure & Module Organization
This repository has two main areas. `content/` contains installable skills, commands, agent definitions, hooks, and platform memory files. `mcs/` is the Rust workspace for the shared core library, terminal UI, and web backend. The React frontend lives in `mcs/mcs-web/ui/src`, with unit tests in `mcs/mcs-web/ui/src/**/*.test.ts` and Playwright flows in `mcs/mcs-web/ui/tests/e2e`. Documentation lives in `docs/` (VitePress). Review nested guidance files such as `content/CLAUDE.md` or module-local `CLAUDE.md` files before editing scoped areas.

## Build, Test, and Development Commands
Use `just` from the repository root for standard workflows:

- `just mcs` runs the Rust TUI.
- `just web` starts the Rust backend and Vite frontend together.
- `just doc` runs the docs site on port `4000`.
- `just mcs-web-test` runs the frontend Vitest suite.
- `cd mcs/mcs-web/ui && npm run test:e2e` runs Playwright end-to-end tests.
- `just rust-test` runs Rust tests across the workspace.
- `just ts-check` runs TypeScript type checking.
- `just ci` runs the local CI sequence: npm CI, TS checks, Vitest, Rust fmt, Clippy, and Rust tests.

## Coding Style & Naming Conventions
Follow the existing language defaults instead of inventing local variants. Rust must pass `cargo fmt` and `cargo clippy -- -D warnings`; use snake_case for modules and functions. React + TypeScript uses 2-space indentation, PascalCase for components and page files such as `NpxSkillsPage.tsx`, and camelCase for hooks, stores, and utilities such as `useUiStore` or `statusAggregation.ts`. Keep Markdown content concise and directory names kebab-case, for example `workflow-skills` or `git-github-skills`.

## Testing Guidelines
Prefer targeted tests while iterating, then run `just ci` before opening a PR. UI changes should include Vitest coverage and Playwright coverage for changed user flows. Rust changes should add or update `cargo test` coverage near the affected crate. When editing external-registry loading or `npx skills` integration, update the nearest Rust or web tests.

## Commit & Pull Request Guidelines
Recent history follows Conventional Commits with an optional scope and emoji, for example `feat(skills): ✨ add drawio skill` or `docs(guide): 📝 update runtime docs`. Keep subjects imperative and scoped. PRs should summarize the change, list verification commands, link related issues, and include screenshots or short recordings for `mcs-web`, TUI, or docs UI changes.
