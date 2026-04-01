---
description: Inspect running and recent codex-companion jobs for the current workspace
argument-hint: "[job-id] [--wait] [--timeout-ms <ms>] [--all] [--json]"
---
Run the `codex-companion` runtime status command.

Treat the user input after this prompt as raw arguments for:

```bash
node "<resolved-script-path>" status <arguments>
```

Execution rules:

1. Resolve the runtime script by checking these paths in order:
   - `./content/skills/ai-llm-skills/codex-companion/scripts/codex-companion.mjs`
   - `~/.agents/skills/codex-companion/scripts/codex-companion.mjs`
   - `./.agents/skills/codex-companion/scripts/codex-companion.mjs`
   - `./.codex/skills/codex-companion/scripts/codex-companion.mjs`
2. If the script cannot be found, stop and tell the user that `codex-companion` is not installed.
3. Execute the status command once and return its stdout.
