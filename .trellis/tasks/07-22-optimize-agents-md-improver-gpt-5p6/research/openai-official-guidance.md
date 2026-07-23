# OpenAI official guidance baseline

Last verified: 2026-07-23.

## Sources

1. Current-model resolver
   - The live OpenAI docs resolver returned `gpt-5.6-sol` with the exact
     migration guide
     https://developers.openai.com/api/docs/guides/upgrading-to-gpt-5p6-sol.md
     and the prompting guide below.
2. GPT-5.6 model guidance
   - https://developers.openai.com/api/docs/guides/latest-model?model=gpt-5.6
   - The shorter HTML route
     https://developers.openai.com/api/docs/guides/model-guidance?model=gpt-5.6
     currently redirects to this model-specific page.
3. GPT-5.6 prompting guidance
   - https://developers.openai.com/api/docs/guides/prompt-guidance-gpt-5p6.md
   - The live Markdown title is `Prompting guidance for GPT-5.6 Sol`; it covers
     GPT-5.6 Sol and the GPT-5.6 family and reports
     `Last-Modified: Wed, 22 Jul 2026 16:58:24 GMT`.
4. Codex `AGENTS.md` guidance
   - https://learn.chatgpt.com/docs/agent-configuration/agents-md
   - Retrieved through the current OpenAI Codex Manual helper.
5. Codex skills guidance
   - https://learn.chatgpt.com/docs/skills
   - Retrieved through the current OpenAI Codex Manual helper.

## GPT-5.6 prompt implications

- State the user-visible outcome, important constraints, available evidence,
  success criteria, and stopping conditions. Leave routine path selection to
  the model.
- State each instruction once. Remove repeated process prose, examples that do
  not correct a measured gap, and irrelevant tool descriptions.
- Keep autonomy and approval boundaries compact: audit/plan is read-only;
  change/fix authorizes scoped local edits and non-destructive validation;
  external, destructive, costly, and scope-expanding actions require approval.
- Define tool routes by task shape and prerequisite order. Independent reads can
  run concurrently; dependent decisions stay sequential; suspiciously empty
  results require one or two meaningful fallbacks.
- Ground factual claims in retrieved evidence, distinguish inference, and use
  `missing evidence` instead of converting absence into a factual negative.
- Validate the final user-facing answer, not only intermediate tool output.
- Establish a baseline, make one small prompt change at a time, and rerun the
  same representative evals. Token reduction is an improvement only when the
  output contract still passes.

## Current Codex facts the skill must model

- Codex builds the project instruction chain once per run. It starts at the
  project root and walks down to the current working directory.
- At each directory Codex selects at most one file in this order:
  `AGENTS.override.md`, `AGENTS.md`, then configured
  `project_doc_fallback_filenames`.
- Files are concatenated root-to-CWD; closer guidance wins because it appears
  later. Discovery stops at the current working directory.
- Global discovery uses `CODEX_HOME` (default `~/.codex`) and selects
  `AGENTS.override.md` before `AGENTS.md`.
- Empty files are skipped. The combined project instruction budget is governed
  by `project_doc_max_bytes` and defaults to 32 KiB.
- Current repo-scoped skill discovery uses `.agents/skills`, searched from CWD
  upward to the repository root. `.codex/agents` remains the project-scoped
  native subagent location.
- Official guidance recommends small, practical instruction files based on
  recurring mistakes, repeated review feedback, non-obvious commands, and
  durable local constraints. Navigation pressure can justify routing guidance
  without automatically justifying another behavioral instruction file.

## Planning consequences

- Add a deferred Codex semantics reference with a `Last verified` line instead
  of expanding `SKILL.md` with every discovery edge case.
- Replace the POSIX-only `find` recipe with a cross-platform discovery contract
  and include overrides plus configured fallback names.
- Separate the decision to add local behavioral guidance from the decision to
  add a local `code_map.md`; directory complexity alone is not enough evidence
  for a new instruction layer.
- Make report-first behavior conditional on audit/plan intent and add a small,
  explicitly requested edit fast path. Keep the user's report-first audit
  preference intact.
- Treat trigger and output evals as promotion gates for the revised prompt.
