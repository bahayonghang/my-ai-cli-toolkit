# Codex Plugin Recommendations

Use this reference when a workflow needs a packaged distribution of skills, tools, MCP servers, or app capabilities.

## Codex Plugin Command Surface

Verify current help before implementation:

```bash
codex plugin --help
codex plugin list
codex plugin list --marketplace <name>
codex plugin marketplace list
codex plugin marketplace add <name> <source>
codex plugin marketplace upgrade <name>
codex plugin add <plugin>@<marketplace>
codex plugin add <plugin> --marketplace <marketplace>
codex plugin remove <plugin>
```

Do not install or remove plugins from this recommender skill. Recommend only.

## When to Recommend a Plugin

| Signal | Plugin recommendation |
|---|---|
| team wants a shared capability bundle | package skills and config as a plugin |
| multiple related skills are needed | prefer one plugin over scattered manual installs |
| browser/doc/spreadsheet/document tooling needed | use existing plugin capability if installed/available |
| project has reusable internal workflows | create an internal marketplace entry |
| user asks for marketplace distribution | use `codex plugin marketplace ...` |

## When Not to Recommend a Plugin

- A single short instruction in `AGENTS.md` is enough.
- A one-off script is not meant to be reused.
- The user needs a local project skill, not a marketplace-distributed bundle.
- The marketplace source or plugin name cannot be verified.

## Safe Recommendation Pattern

```markdown
#### Plugins
1. **Browser plugin**
   - Evidence: frontend app requires screenshot/e2e verification.
   - Why plugin instead of raw MCP: bundles browser automation skill plus app tooling.
   - Preflight: `codex plugin marketplace list` and `codex plugin list`.
   - Install command after approval: `codex plugin add <plugin>@<marketplace>`.
   - Verification: confirm plugin appears in `codex plugin list` and run a minimal browser task.
```

## Marketplace Hygiene

- Prefer pinned or trusted marketplace sources for team workflows.
- Document marketplace names in repo guidance, but keep user-specific auth outside the repo.
- Use `codex plugin marketplace upgrade` deliberately; it can change what plugin versions are available.
- Remove stale plugins with `codex plugin remove` only after confirming no workflows depend on them.
