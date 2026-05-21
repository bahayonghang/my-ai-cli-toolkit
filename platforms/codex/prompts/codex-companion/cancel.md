---
description: Cancel an active codex-companion job
argument-hint: "[job-id] [--json]"
---
Run the `codex-companion` runtime cancel command.

Treat the user input after this prompt as raw arguments for:

```bash
node "<resolved-script-path>" cancel <arguments>
```

Execution rules:

1. Resolve the runtime script by checking these paths in order:
   - `./skills/developer-tools-integrations/codex-companion/scripts/codex-companion.mjs`
   - `~/.agents/skills/codex-companion/scripts/codex-companion.mjs`
   - `./.agents/skills/codex-companion/scripts/codex-companion.mjs`
   - `./.codex/skills/codex-companion/scripts/codex-companion.mjs`
2. If the script cannot be found, stop and tell the user that `codex-companion` is not installed.
3. Execute the cancel command once and return its stdout.
