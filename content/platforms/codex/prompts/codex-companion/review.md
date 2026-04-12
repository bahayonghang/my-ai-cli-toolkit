---
description: Run a read-only codex-companion review on the current repository or a base branch
argument-hint: "[--wait|--background] [--base <ref>] [--scope auto|working-tree|branch]"
---
Run the `codex-companion` runtime review command.

Treat the user input after this prompt as raw arguments for:

```bash
node "<resolved-script-path>" review <arguments>
```

Execution rules:

1. Resolve the runtime script by checking these paths in order:
   - `./content/skills/developer-tools-integrations/codex-companion/scripts/codex-companion.mjs`
   - `~/.agents/skills/codex-companion/scripts/codex-companion.mjs`
   - `./.agents/skills/codex-companion/scripts/codex-companion.mjs`
   - `./.codex/skills/codex-companion/scripts/codex-companion.mjs`
2. If the script cannot be found, stop and tell the user that `codex-companion` is not installed.
3. Do not invent custom focus text or extra flags. Pass only what the user supplied.
4. Execute the review command once and return its stdout.
5. This command is review-only. Do not fix issues found by the review unless the user later requests a task or write-capable workflow.
