# Research Notes: Spark Codex and Claude Plan Mode Refactor

## Revised Direction

The target is no longer a new `codex-grill` skill. The correct product shape is to refactor the existing `spark` skill so it handles both:

- native Codex Plan mode, where Spark must stay chat-only and cannot rely on file writes;
- Claude Code Plan mode, where Spark can use Claude Code's plan approval/exit flow before materializing files;
- writable/default planning mode, where Spark can continue saving durable `.plannings/` artifacts.

## Current Spark Evidence

Sources:

- `skills/development-workflows/spark/SKILL.md`
- `skills/development-workflows/spark/README.md`
- `skills/development-workflows/spark/tests/spec-html-contract.test.mjs`
- `skills/development-workflows/spark/visual-companion.md`
- `skills/development-workflows/spark/spec-document-reviewer-prompt.md`

Findings:

- Spark currently describes itself as a Markdown-plan-by-default workflow.
- It currently saves the default plan to `<project-root>/.plannings/YYYY-MM-DD-<feature-slug>.md`.
- It says to prefer native plan surfaces when available, but does not separate native Plan mode from writable file-artifact mode.
- Its optional HTML branch writes `.plannings/YYYY-MM-DD-<feature-slug>.html`.
- Its visual companion writes scratch files under `.spark/brainstorm/`.
- Its tests assert the `.plannings` default and the explicit HTML branch, and they already forbid `EnterPlanMode`.

Implication:

Spark has the right planning identity, but its surface model is wrong for native Codex Plan mode. The refactor should not delete `.plannings`; it should make `.plannings` writable-mode-only.

## Reference Skill Evidence

### `grill-me`

Source: `ref/repo/skills/skills/productivity/grill-me/SKILL.md`

Useful behaviors to absorb into Spark:

- Interview until shared understanding exists.
- Walk the design tree by dependency order.
- Ask one question at a time.
- Provide the recommended answer for each question.
- Explore the codebase instead of asking questions that evidence can answer.

### `grill-with-docs`

Source: `ref/repo/skills/skills/engineering/grill-with-docs/SKILL.md`

Useful behaviors to absorb into Spark:

- Look for `CONTEXT.md`, `CONTEXT-MAP.md`, and ADRs during exploration.
- Challenge terminology that conflicts with existing glossary language.
- Sharpen overloaded terms into canonical terms.
- Test domain relationships through concrete scenarios.
- Cross-reference user claims against code.
- Offer ADRs only for decisions that are hard to reverse, surprising without context, and real trade-offs.

Behavior to adapt, not copy:

- `grill-with-docs` updates `CONTEXT.md` inline. Spark must not do that in native Plan mode. It should list proposed glossary/ADR updates in the final chat plan and write them only later in a writable implementation request.

## Codex Plan Mode Evidence

Sources:

- Official Codex manual: `https://developers.openai.com/codex/codex-manual.md`
- Official Codex app features / slash command docs: `https://developers.openai.com/codex/app/features`
- Upstream Plan mode template: `https://raw.githubusercontent.com/openai/codex/main/codex-rs/collaboration-mode-templates/templates/plan.md`

Findings:

- Codex documentation describes Plan mode as useful for gathering context, asking clarifying questions, and building a stronger plan before implementation.
- Codex documentation says users toggle Plan mode with `/plan` or Shift+Tab.
- Codex slash command documentation lists `/plan` as the multi-step planning command.
- The upstream Plan mode template says to use `request_user_input` for clarification when needed.
- The upstream Plan mode template tells the assistant to produce the final plan in a conversation wrapper so the user can switch out of Plan mode and request implementation.
- The upstream Plan mode template explicitly forbids mutating actions, including editing or writing files. It allows non-mutating exploration and dry-run style checks, but not repo-tracked file edits or generated artifacts that carry out the plan.
- None of these sources expose a skill-level command for entering Plan mode, exiting Plan mode, or writing files from Plan mode.

Interpretation:

Spark should not claim it can force Plan mode, auto-exit Plan mode, or write plan files while Plan mode is active. Native Plan mode should be a read-only planning surface. Spark can still produce durable files when invoked outside native Plan mode in a writable environment.

## Claude Code Plan Mode Evidence

Sources:

- Claude Code permission modes: `https://docs.anthropic.com/en/docs/claude-code/iam#permission-modes`
- Claude Code slash commands: `https://docs.anthropic.com/en/docs/claude-code/slash-commands`
- Claude Code tool reference: `https://docs.anthropic.com/en/docs/claude-code/settings#tools-available-to-claude`

Findings:

- Claude Code Plan mode is a permission mode, not just an output format.
- Claude Code can enter Plan mode with `Shift+Tab`, `/plan`, or `claude --permission-mode plan`.
- In Claude Code Plan mode, the assistant researches, asks questions, and creates a plan without modifying files.
- The user can press `Shift+Tab` again to leave Plan mode without approving a plan.
- When the user approves the plan, Claude Code exits Plan mode and switches to the chosen execution permission mode.
- Claude Code documents `EnterPlanMode` and `ExitPlanMode` as available tools. `ExitPlanMode` submits the plan for user approval and exits Plan mode.

Interpretation:

Claude Code should not be treated like Codex native Plan mode. Spark can support a Claude Code Plan-mode branch that asks stronger planning questions, uses `ExitPlanMode` when available, and after user approval/exit materializes the `.plannings` Markdown artifact. The write still happens after Plan mode, not during it.

## Recommended Conclusion

Refactor Spark into a platform-aware workflow:

1. Codex native Plan mode:
   - inspect evidence;
   - ask one structured blocking question at a time when the tool is available;
   - use stronger grilling questions from `grill-me` / `grill-with-docs`;
   - output a final plan in chat;
   - defer all file writes, HTML/visual artifacts, glossary updates, and ADR updates.

2. Claude Code Plan mode:
   - use `EnterPlanMode` / `ExitPlanMode` behavior when available;
   - do not write files while Plan mode is active;
   - after the user approves the plan and exits Plan mode, write the approved Spark plan to `.plannings` if durable output is part of the invocation;
   - then stop before production implementation.

3. Writable/default mode:
   - keep `.plannings/YYYY-MM-DD-<feature-slug>.md` as the default durable artifact;
   - keep optional paired HTML only when explicitly requested;
   - keep visual companion only when explicitly useful and writable;
   - self-review and stop for approval.

4. Compatibility fallback:
   - when structured questions are unavailable, ask a single concise plain-text question;
   - when native Plan mode is unavailable but files are writable, use the existing writable Spark artifact flow.
