# Audit Findings: goal-meta-skill

## Scope

Target package: `skills/developer-tools-integrations/goal-meta-skill`.

User request: search the repository for Codex goal related skills, audit this skill with the `skill-creator` lens, and create a Trellis optimization task.

## Related Repository Search Results

Primary match:

- `skills/developer-tools-integrations/goal-meta-skill`: the only first-party skill dedicated to drafting Codex `/goal` commands.

Adjacent references:

- `skills/development-workflows/codex-dynamic-workflows`: contains a `Goal Mode` boundary. It says goal mode should only be entered when the user explicitly requests durable goal execution or sustained autonomous execution.
- `skills/developer-tools-integrations/codex-workflow-recommender`: adjacent Codex setup/workflow recommender, but read-only and not a `/goal` drafting skill.

Non-goal noise found by search:

- Generic "goal" words in unrelated research, docs, and command templates.
- Historical `hai-goal` negative examples in `goudi` evals; not a real current skill dependency.

## Official Codex Manual Findings

Fresh manual fetched by `openai-docs` helper:

- Manual path: `C:\Users\lyh\AppData\Local\Temp\openai-docs-cache\codex-manual.md`
- Status: local manual was updated.

Relevant facts:

- Goal mode gives Codex a persistent objective across longer tasks; the goal text acts as starting prompt and completion criteria.
- Goal mode can be started with `/goal` in Codex app, IDE extension, or CLI.
- If `/goal` is absent from the slash command list, enable `features.goals` in `config.toml` or via `codex features enable goals`.
- CLI slash commands support:
  - `/goal <text>` to set the goal.
  - `/goal` to view the current goal.
  - `/goal pause`, `/goal resume`, and `/goal clear`.
- Goal objectives must be non-empty and at most 4,000 characters. Longer instructions should live in a file and the goal should point to that file.
- Codex skills use progressive disclosure; implicit invocation depends heavily on a concise, front-loaded `description`.

## Current Package State

Files present:

- `SKILL.md`
- `README.md`
- `agents/interface.yaml`
- `references/default-goal-strategy.md`
- `references/goal-command-playbook.md`
- `references/interview-checklist.md`
- `scripts/lint_goal_command.py`

Missing package surfaces:

- No `evals/evals.json`.
- No `tests/*.mjs`.
- No generated docs page currently present under `docs/skills/developer-tools-integrations/`.
- No `agents/openai.yaml`; other newer Codex-oriented skills mostly use `agents/openai.yaml`.

## Validation Evidence

Commands run:

- `rg -n -i "codex goal|goal-meta|goal meta|\bgoal\b|create_goal|update_goal|get_goal|token_budget|budgeted goal|active goal" skills platforms scripts docs README.md code_map.md AGENTS.md`
- `just skills-check`
- `just docs-check`
- `python -m py_compile skills\developer-tools-integrations\goal-meta-skill\scripts\lint_goal_command.py`
- Inline linter probe importing `lint_goal_command.py`
- `codex --help`
- `codex exec --help`
- `codex --version`
- `openai-docs` Codex manual helper

Results:

- `just skills-check` passes but warns for `goal-meta-skill`: `Top-level category is missing`.
- `just docs-check` fails because generated docs are stale and specifically missing:
  - `docs/skills/developer-tools-integrations/goal-meta-skill.md`
  - `docs/en/skills/developer-tools-integrations/goal-meta-skill.md`
  - stale `docs/skills.md`, `docs/en/skills.md`, and `docs/.vitepress/generated/catalog.mjs`
- `py_compile` passed for the Python linter. Generated `__pycache__` was cleaned up afterward.
- Linter probe showed a valid Chinese `/goal` block without `Goal Draft (English-compatible)`, default reason, or optional adjustments still passes. This means the linter catches low-level goal shape but not the full Chinese-first output contract.
- `codex --help` does not expose `goal` as a top-level subcommand, which is expected because `/goal` is an interactive slash command.
- `codex --version`: `codex-cli 0.139.0`.

## Audit Findings

### P0: Public package metadata and generated docs are incomplete

`SKILL.md` currently has only `name` and `description` frontmatter. The repo guidance says skill frontmatter should use `name`, `description`, `category`, `tags`, and `version`. Other skills in `developer-tools-integrations` have these fields.

Impact:

- Validator warning remains visible.
- Docs catalog generation omits the skill page.
- Users cannot discover the skill through the generated docs site even though it exists in `skills/`.

### P0: Skill is missing eval/test coverage

The package has no `evals/evals.json` and no test directory. This is risky because the skill is prompt-behavior heavy and contains nuanced bilingual output rules.

Impact:

- There is no regression coverage for Chinese-first output order.
- There is no negative trigger coverage for simple one-shot tasks.
- There is no test that the skill uses discovery-first goals for high-risk domains.

### P1: Current instructions lag official `/goal` behavior

The current skill correctly uses `/goal`, but it does not cover:

- `/goal` as view current goal.
- `/goal pause`, `/goal resume`, `/goal clear`.
- `features.goals` troubleshooting.
- 4,000 character objective limit and the file-pointer pattern for longer goals.

Impact:

- The skill can still draft good goals, but it may give incomplete operational guidance for current Codex.

### P1: README install commands are placeholders

README uses:

```bash
npx skills add <owner>/goal-meta-skill
```

Generated docs for comparable skills use:

```bash
npx skills add bahayonghang/my-claude-code-settings/skills --skill <skill-name>
```

Impact:

- README is not copy-ready for users.

### P1: Interface metadata may be on an older local schema

`agents/interface.yaml` exists, but other newer Codex-facing skills use `agents/openai.yaml`. The official manual documents `agents/openai.yaml` as optional metadata for Codex app UI, invocation policy, and tool dependencies.

Impact:

- Codex app metadata may not be picked up as intended.
- Migration should be done carefully: search repo consumers before deleting `interface.yaml`.

### P2: Linter catches low-level shape but not skill output contract

`lint_goal_command.py` verifies markers, placeholders, vague dangerous phrases, and minimal verification evidence. It does not verify:

- Chinese-first response order.
- Required English-compatible mirror when the user writes Chinese and does not opt out.
- `默认选择理由`, `可选调整`, and `你可以直接回复` for vague tasks.
- Negative-trigger behavior where `/goal` should not be forced.

Impact:

- A user-visible regression can pass local script validation.

### P2: Shell instructions are not Windows-friendly enough

The skill body says to run `python3 scripts/lint_goal_command.py <file>`. README repeats `python3 ~/.agents/...`.

Impact:

- This repo and host are Windows/PowerShell-heavy. Future examples should include `python` or `py -3` fallback without breaking POSIX users.

## Recommended Optimization Shape

1. Add metadata and docs sync first.
2. Update `/goal` semantics in `SKILL.md` and references based on the official manual.
3. Fix README install commands and troubleshooting.
4. Add `evals/evals.json` and tests for the linter/contract.
5. Generate reviewer artifact with `skill-creator` before final revision.
6. Run `just ci`.

