# Repository Guidelines

## Project Structure & Module Organization
- `content/` holds installable assets: skills in `content/skills/`, slash commands in `content/commands/`, shared prompts in `content/prompts/`, and agent definitions in `content/agents/`.
- Each skill lives in a dedicated kebab-case folder (for example `content/skills/diagram-skills/drawio/`) with a required `SKILL.md` and optional `scripts/`, `references/`, and `assets/`.
- `mcs/` is the Rust workspace (`mcs-core`, `mcs-tui`, `mcs-web`).
- `mcs/mcs-web/frontend/` is the React + TypeScript UI.
- `docs/` is the VitePress documentation site (`docs/` + `docs/zh/`).
- `content/external-skills/` contains the Python-based external skill installer and its Textual TUI.

## Build, Test, and Development Commands
- `just mcs`: run the Rust TUI manager (`cargo run --release --bin mcs`).
- `just web`: run MCS Web backend + frontend with hot reload (API `:13242`, UI `:5173`).
- `just doc`: install docs dependencies and start VitePress dev server.
- `just ci`: run local CI pipeline (TypeScript check + Rust fmt/clippy/test).
- `just rust-check-all`: run Rust format check, clippy, and tests.
- `cd mcs/mcs-web/frontend && npm run test`: run Vitest suites.

## Coding Style & Naming Conventions
- Rust: enforce `cargo fmt` and zero-clippy-warning policy (`-D warnings`).
- TypeScript/React: follow existing style (2-space indent, semicolons, double quotes) and keep type checks clean with `npx tsc --noEmit`.
- Test names: `*.test.ts` (frontend) and `test_*.py` (Python).
- Keep new files and folders descriptive, lowercase/kebab-case unless language conventions require otherwise.

## Testing Guidelines
- Add or update tests for any behavior change in touched modules.
- Rust changes: run `just rust-test` (or `cd mcs && cargo test`).
- Web changes: run `npm run test` in `mcs/mcs-web/frontend`.
- No global coverage gate is enforced; reviewers expect meaningful regression coverage for fixes/features.

## Commit & Pull Request Guidelines
- Follow Conventional Commits with optional emoji, consistent with history:
  - `feat(mcs-web): ✨ ...`
  - `fix(mcs-core): 🐛 ...`
  - `docs: 📝 ...`
- Keep commits scoped to one concern.
- PRs should include: purpose, impacted paths, verification commands run, and screenshots/GIFs for UI changes.
- Link related issues/spec docs when applicable.

## Security & Configuration Tips
- Never commit API keys, tokens, or local machine paths.
- Use example config files (for example `secrets.example.md`) as templates, not as secret storage.
