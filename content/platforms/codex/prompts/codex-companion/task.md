---
description: Delegate a diagnosis, research, or implementation task to a codex-companion task thread, including background and resume flows
argument-hint: "[--background] [--write] [--resume-last|--resume|--fresh] [--model <model|spark>] [--effort <none|minimal|low|medium|high|xhigh>] <task>"
---
Run the `codex-companion` runtime task command.

Treat the user input after this prompt as raw arguments for:

```bash
node "<resolved-script-path>" task <arguments>
```

Execution rules:

1. Resolve the runtime script by checking these paths in order:
   - `./content/skills/developer-tools-integrations/codex-companion/scripts/codex-companion.mjs`
   - `~/.agents/skills/codex-companion/scripts/codex-companion.mjs`
   - `./.agents/skills/codex-companion/scripts/codex-companion.mjs`
   - `./.codex/skills/codex-companion/scripts/codex-companion.mjs`
2. If the script cannot be found, stop and tell the user that `codex-companion` is not installed.
3. Preserve the user's routing flags exactly.
4. If the user supplied no task text and did not ask to resume the latest task, ask what Codex should investigate, implement, or continue.
5. Execute the task command once and return its stdout.
