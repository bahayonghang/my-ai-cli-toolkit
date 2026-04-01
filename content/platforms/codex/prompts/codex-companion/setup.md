---
description: Run codex-companion setup checks for Codex CLI readiness, auth, and app-server capability
argument-hint: "[--json]"
---
Run the `codex-companion` runtime setup command.

Treat the user input after this prompt as raw arguments for:

```bash
node "<resolved-script-path>" setup <arguments>
```

Execution rules:

1. Resolve the runtime script by checking these paths in order:
   - `./content/skills/ai-llm-skills/codex-companion/scripts/codex-companion.mjs`
   - `~/.agents/skills/codex-companion/scripts/codex-companion.mjs`
   - `./.agents/skills/codex-companion/scripts/codex-companion.mjs`
   - `./.codex/skills/codex-companion/scripts/codex-companion.mjs`
2. If the script cannot be found, stop and tell the user that `codex-companion` is not installed.
3. Run the setup command once.
4. Return the command stdout directly. Keep extra commentary minimal.
