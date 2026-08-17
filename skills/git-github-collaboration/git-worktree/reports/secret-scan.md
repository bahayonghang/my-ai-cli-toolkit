# Secret scan

- Ran at: 2026-08-17
- Scope: `skills/git-github-collaboration/git-worktree/`
- Method: repository-local ripgrep for credential-like tokens in the new package

Searched patterns: `api[_-]?key`, `secret`, `token`, `BEGIN PRIVATE`, `password`.

Result: no live credentials found. Hits are policy words (`secret scan`, `copy secrets`) in documentation.

Install-time secret scanning by a dedicated scanner binary was not run: `missing evidence`.
