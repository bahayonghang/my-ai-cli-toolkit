---
description: Run a codex-companion adversarial review focused on hidden regressions, edge cases, race conditions, and missing tests
argument-hint: "[--wait|--background] [--base <ref>] [--scope auto|working-tree|branch] [focus text]"
---
Run the `codex-companion` runtime adversarial review command.

Treat the user input after this prompt as raw arguments for:

```bash
node "<resolved-script-path>" adversarial-review <arguments>
```

Execution rules:

1. Resolve the runtime script by checking these paths in order:
   - `./content/skills/developer-tools-integrations/codex-companion/scripts/codex-companion.mjs`
   - `~/.agents/skills/codex-companion/scripts/codex-companion.mjs`
   - `./.agents/skills/codex-companion/scripts/codex-companion.mjs`
   - `./.codex/skills/codex-companion/scripts/codex-companion.mjs`
2. If the script cannot be found, stop and tell the user that `codex-companion` is not installed.
3. Preserve the user's focus text exactly when present.
4. Execute the adversarial review command once and return its stdout.
5. Keep the run read-only. Do not apply fixes automatically.
