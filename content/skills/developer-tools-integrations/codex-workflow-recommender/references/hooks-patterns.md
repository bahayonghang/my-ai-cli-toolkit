# Codex Config and Hook Recommendations

Use this reference when the user asks for Codex config, hook, guardrail, or local-gate automation recommendations.

## Boundary First

Codex configuration is version- and environment-sensitive. Before recommending a hook or config change, inspect the installed surface:

```bash
codex --help
codex doctor --help
codex features --help
```

Read only when present:

```text
~/.codex/config.toml
~/.codex/hooks.json
.codex/config.toml
.codex/hooks.json
```

If the current installation does not expose a hook schema, say so and recommend standard repository gates instead.

## Config Recommendations

### Profiles and model defaults

Recommend a `~/.codex/config.toml` profile when the user repeatedly switches between models, sandbox modes, or approval policies.

| If you see | Recommendation |
|---|---|
| multiple project types | named profiles for frontend/backend/research |
| strict repo gates | profile that defaults to safer sandbox and approval policy |
| expensive long-running tasks | profile with explicit model/effort choices |

Add or adjust persistent config only after confirming the installed keys with `codex --help` or `codex doctor`. Prefer `codex -c key=value` for experiments before editing persistent config.

### Sandbox and approval policy

Use the CLI's documented options:

```bash
codex --sandbox read-only
codex --sandbox workspace-write
codex --sandbox danger-full-access
codex --ask-for-approval never
codex --ask-for-approval on-request
```

Recommend the narrowest policy that still lets the workflow run. Do not recommend `danger-full-access` as a default.

### Search and external retrieval

When live web is needed and policy allows it, recommend explicit search activation rather than assuming web access is always present:

```bash
codex --search
```

## Hook-Like Automation Patterns

Prefer standard repo tooling when Codex hooks are unavailable or undocumented.

| Goal | Codex-native if supported | Repository fallback |
|---|---|---|
| format after edits | Codex hook invoking formatter | `just fmt`, npm scripts, `pre-commit` |
| lint before completion | Codex hook invoking linter | CI, pre-commit, `just ci` |
| block secrets edits | pre-tool hook policy | `.gitignore`, secret scanning, branch protection |
| notify on long waits | notification hook | OS notification script in task runner |
| capture prompt/session metadata | prompt hook | local wrapper script around `codex exec` |

## Recommended Gates by Stack

| Detection | Gate to recommend |
|---|---|
| `package.json` with ESLint/Prettier | `npm run lint`, `npm run format:check`, or existing scripts |
| `tsconfig.json` | `npx tsc --noEmit` or repo script |
| `pyproject.toml` with Ruff/Black | `ruff check`, `ruff format --check` |
| `Cargo.toml` | `cargo fmt --check`, `cargo clippy -- -D warnings`, `cargo test` |
| `go.mod` | `gofmt`, `go test ./...` |
| Playwright config | `npx playwright test` |
| `justfile` | prefer documented `just` recipes over invented raw commands |

## Safety Guardrails to Recommend

### Secrets and credentials

Recommend guardrails when `.env`, credential files, cloud keys, or deployment configs are present:

- never paste secrets into prompts or committed config
- use environment variables for MCP bearer tokens
- keep user-level config out of repository commits
- add secret scanning or pre-commit checks when available

### Generated and lock files

Recommend policy language instead of hard blocks when generated artifacts must sometimes change:

- lock files change through package managers only
- generated files are updated by the generator command and verified by diff
- vendored or binary assets are not mass-edited by agents

### Destructive operations

Recommend explicit confirmation requirements for:

- deleting data or migrations
- force-pushing or rewriting history
- changing production credentials or endpoints
- running deploys or external side-effect commands

## Report Snippets

```markdown
#### Config/hooks
**Recommendation**: Add a documented local gate profile before adding hooks.
**Evidence**: `just ci` exists and covers docs, TypeScript, UI tests, Rust fmt/clippy/tests.
**Safe first step**: document `codex --sandbox workspace-write --ask-for-approval on-request` for normal repo work.
**Do not do yet**: edit `~/.codex/hooks.json` until the installed Codex hook schema is confirmed.
```

```markdown
#### Hook fallback
**Recommendation**: Use repo-native `pre-commit` or `just ci` for enforcement rather than Codex-only hooks.
**Why**: The same protection runs for humans, Codex CLI, Codex App, and CI.
```
