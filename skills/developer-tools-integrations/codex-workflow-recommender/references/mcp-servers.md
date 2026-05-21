# Codex MCP Server Recommendations

Use this reference when repository signals suggest external tools would materially improve Codex work.

## Codex MCP Command Surface

Confirm the installed command help first:

```bash
codex mcp --help
codex mcp list --json
codex mcp get <name>
codex mcp add <name> -- <command> [args...]
codex mcp add <name> --url <https-url> --bearer-token-env-var <ENV_VAR>
codex mcp remove <name>
```

Use `--env KEY=VALUE` for stdio servers when needed. Use `--bearer-token-env-var` for HTTP servers that require a token. Never put raw secrets in a recommendation.

## Setup Guidance

- Prefer user-level MCP config for personal tools and secrets.
- Prefer project documentation for team expectations; do not commit private tokens.
- After any approved change, verify with `codex mcp list --json` and a small task that uses the server.
- If the server package or URL is not already known in the repo, look up its current official install command before implementation.

## Recommendation Matrix

| Codebase signal | MCP type to consider | Why |
|---|---|---|
| React/Vue/Angular/Next app | Browser automation such as Playwright MCP | inspect UI, screenshots, forms, e2e debugging |
| heavy dependency/framework churn | live docs MCP such as Context7-style docs lookup | reduce stale API guesses |
| PostgreSQL/MySQL/SQLite/Supabase | database MCP | schema-aware read/query workflows |
| GitHub issues/PR/actions | GitHub MCP | issue triage, PR context, CI status |
| Linear/Jira references | issue-tracker MCP | turn tickets into repo-grounded tasks |
| Sentry/Datadog/OpenTelemetry | observability MCP | connect errors/traces to code |
| AWS/GCP/Azure/IaC | cloud or IaC MCP | inspect resources without hand-copying state |
| Figma/design files | design MCP | map design requirements to UI implementation |
| docs or website QA | browser/search/docs MCP | validate rendered output and current facts |

## Common Recommendations

### Browser / Playwright

Recommend when the repo has a frontend, Playwright config, visual QA needs, or user-facing flows.

**Value**: Codex can interact with a running app, take screenshots, and verify flows instead of guessing from source files.

**Verification**: start the app, run a minimal navigation/screenshot task, and keep screenshots or test output as evidence.

### Live documentation

Recommend when the codebase uses fast-moving SDKs or frameworks and local docs are thin.

**Value**: Codex can pull current API references before changing code.

**Caveat**: Verify package names and server commands from current official docs before install.

### Database

Recommend when schema inspection or query validation is central to the work.

**Safety**: default to read-only credentials when possible. Explicitly label write-capable access as higher risk.

### GitHub / issue tracker

Recommend when work is driven by issues, PR review, release notes, or CI.

**Safety**: distinguish read-only issue/PR context from write actions such as commenting, labeling, or merging.

## Output Snippet

```markdown
#### MCP servers
1. **Playwright/browser MCP**
   - Evidence: React app with Playwright tests under `tests/e2e`.
   - Why: Codex can verify UI behavior with real browser evidence.
   - Safe setup: confirm the server's current install command, then add it with `codex mcp add <name> -- <command>`.
   - Verification: `codex mcp list --json`, launch the app, and run one browser smoke task.
```
