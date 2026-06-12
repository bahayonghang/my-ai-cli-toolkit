# Design: Spark Codex and Claude Plan Mode Refactor

## Summary

Refactor `spark` so it becomes platform-aware: Codex native Plan mode stays chat-only, Claude Code Plan mode uses Claude's approval/exit flow before any file materialization, and writable/default mode keeps Spark's existing durable `.plannings/` artifact flow.

## Target Files

Primary implementation files:

- `skills/development-workflows/spark/SKILL.md`
- `skills/development-workflows/spark/README.md`
- `skills/development-workflows/spark/tests/spec-html-contract.test.mjs`

Potential generated docs after sync:

- `docs/skills/development-workflows/spark.md`
- `docs/en/skills/development-workflows/spark.md`
- aggregate skill indexes/catalog output

No new skill package should be created.

## Surface Model

### Surface A: Codex native Plan mode

Use when the session is already in native Codex Plan mode.

Rules:

- Treat the session as read-only.
- Do not derive a `.plannings` output path.
- Do not write Markdown, HTML, `.spark/brainstorm`, glossary, ADR, task, or implementation files.
- Use native structured questions when available.
- If structured questions are unavailable, ask one concise plain-text question.
- End with a chat-visible final plan / decision ledger.
- If the user wants a file artifact, record it as the first follow-up after leaving Plan mode.

### Surface B: Claude Code Plan mode

Use when Spark is running in Claude Code Plan mode.

Rules:

- Allow Claude Code's native Plan mode enter/exit behavior.
- Use `EnterPlanMode` / `ExitPlanMode` when the Claude Code environment exposes those tools.
- Do not write files while Plan mode is active.
- Present the plan through Claude Code's approval flow.
- If the user approves and Claude Code exits Plan mode into a writable permission mode, write the approved Markdown plan to `.plannings` when Spark was invoked for durable planning output.
- Stop after materializing the planning artifact; do not implement production changes unless the user separately asks.
- If the user exits Plan mode without approving, do not write an artifact.

### Surface C: Writable/default Spark mode

Use when the environment is not native Plan mode and file writes are allowed.

Rules:

- Keep the existing default artifact:
  `<project-root>/.plannings/YYYY-MM-DD-<feature-slug>.md`.
- Keep Markdown as the default.
- Keep optional paired HTML only when explicitly requested.
- Keep the visual companion only for explicit visual questions and only when the environment can write scratch files.
- Stop after user approval or requested revisions.

### Surface D: Compatibility fallback

Use when the environment does not expose native Plan mode or structured questions, but Spark is still invoked.

Rules:

- Follow the writable/default artifact flow if file writes are allowed.
- Use the `writing-plans` rubric only as the planning method fallback.
- If file writes are not allowed, fall back to a chat-only plan and explicitly say no artifact was saved.

## Interrogation Model

Spark's discovery phase should absorb the useful behavior from `grill-me` and `grill-with-docs` without becoming a separate adversarial-review skill.

### Evidence before questions

Before asking the user, inspect:

- `AGENTS.md` and scoped guidance;
- `code_map.md`;
- existing `.plannings/`, task plans, PRDs, or design docs;
- `CONTEXT.md` / `CONTEXT-MAP.md`;
- `docs/adr/` and package ADR folders;
- relevant code, tests, configs, and fixtures.

### Decision tree

Build an internal queue of unresolved decisions:

- goal and user value;
- actor / workflow / owner;
- input and output contract;
- state and lifecycle;
- terminology;
- compatibility or migration;
- failure modes;
- acceptance tests and stop criteria;
- artifact surface: chat-only vs writable Markdown vs optional HTML/visual.
- platform surface: Codex Plan mode vs Claude Code Plan mode vs writable/default mode.

Ask the next blocking question only when evidence cannot answer it.

### Question contract

Each question should include:

- the decision needed;
- why it matters;
- Spark's recommended answer;
- trade-off if the user chooses differently;
- 2-4 mutually exclusive options when using structured questions.

### Grilling moves

Spark should challenge weak planning input by:

- calling out glossary conflicts;
- splitting overloaded terms;
- inventing concrete edge scenarios;
- surfacing contradictions between user claims and code/docs;
- naming the largest hidden assumption;
- asking for kill/revise/continue criteria when risk is high.

This should remain planning-focused. Spark should not become `cold-shower`; the output is still an implementation plan, not a one-shot critique.

## Output Model

### Codex native Plan mode output

Chat-only final plan with:

- summary;
- resolved decisions;
- assumptions;
- recommended approach;
- rejected alternatives;
- implementation steps;
- files/areas likely to change;
- risks and mitigations;
- test/acceptance criteria;
- follow-up file artifacts to create after leaving Plan mode.

### Writable mode output

Markdown file at `.plannings/YYYY-MM-DD-<feature-slug>.md` using the existing structure, plus optional paired HTML only when explicitly requested.

### Claude Code Plan mode output

Plan approval through Claude Code's Plan mode UI/tool flow first. After approval exits Plan mode, Spark may write the approved Markdown plan to `.plannings` and optional explicit HTML if the resulting permission mode allows it.

## Rejected Alternatives

### Create `codex-grill`

Rejected by user instruction. The behavior belongs inside Spark.

### Treat Claude Code like Codex native Plan mode

Rejected because Claude Code exposes explicit Plan mode enter/exit behavior and approval flow. Spark should use it when available.

### Keep current `.plannings` default unconditionally

Rejected because it contradicts native Codex Plan mode's no-file-write boundary.

### Remove `.plannings` entirely

Rejected because `.plannings` is still the correct durable artifact path outside native Plan mode.

### Enable visual companion in native Plan mode

Rejected because the companion writes `.spark/brainstorm` scratch files. In native Plan mode, Spark should describe visual decisions in chat or defer the visual companion to writable mode.

## Test Strategy

Update static tests to prove:

- `spark` version is bumped, likely to `0.6.0`;
- `SKILL.md` distinguishes native Plan mode from writable/default mode;
- Codex native Plan mode is chat-only/read-only;
- Claude Code Plan mode uses approval/exit before writing;
- Plan modes do not write `.plannings`, `.spark`, HTML, glossary, ADR, or task files while still active;
- writable mode still saves Markdown to `.plannings`;
- HTML/visual branch is explicit and writable-mode-only;
- `AskUserQuestion` / structured questions are conditional;
- `EnterPlanMode` / `ExitPlanMode` are allowed only in the Claude Code branch and are not presented as Codex tools;
- README matches the new behavior.

## Risks and Mitigations

- Risk: The updated Spark becomes too complex.
  Mitigation: express the split as a small surface-selection table and keep the rest of the workflow shared.

- Risk: Tests overfit wording.
  Mitigation: use behavior-oriented regex assertions such as `native Plan mode`, `chat-only`, `writable mode`, and `does not write`.

- Risk: Generated docs drift.
  Mitigation: run docs sync/check after changing frontmatter or README.

- Risk: Grill behavior causes too many questions.
  Mitigation: keep the "ask only blocking questions" rule and require evidence-first answers.
