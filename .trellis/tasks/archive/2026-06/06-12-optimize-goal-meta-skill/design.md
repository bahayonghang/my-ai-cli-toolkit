# Design: Optimize goal-meta-skill

## Boundaries

Allowed implementation scope:

- `skills/developer-tools-integrations/goal-meta-skill/**`
- Generated docs files produced by `just docs-sync`
- Directly related generated docs catalog files

Forbidden scope unless separately approved:

- Unrelated skills
- User-level installed skills
- `.gitignore` pre-existing change
- Publishing, plugin installation, or user-level Codex config mutation

## Package Metadata

Add frontmatter consistent with nearby skills:

```yaml
category: developer-tools-integrations
tags:
  - codex
  - goal
  - prompt-engineering
  - agent-skills
  - verification
version: 0.1.0
```

Use the version that best matches repo convention during implementation. If history shows this skill has an existing release version elsewhere, preserve that instead of inventing a downgrade.

## Codex Goal Semantics

Update `SKILL.md` and references to distinguish:

- Drafting a goal instruction versus starting a goal.
- `/goal <text>` to set a goal.
- `/goal` to view current goal.
- `/goal pause`, `/goal resume`, `/goal clear` for management.
- `features.goals` troubleshooting when `/goal` is not listed.
- 4,000 character objective limit; long goals should point at a file.

Keep the current safety principle: the skill drafts the instruction and does not start or execute it unless explicitly asked.

## Output Contract

Preserve current high-value structure:

- Chinese-first users get `推荐执行版（中文，可直接复制）` first.
- Vague tasks get `默认选择理由`, `可选调整`, and `你可以直接回复`.
- English-compatible mirror stays semantically equivalent.
- English-only prompts get English output only unless Chinese is requested.

Add guidance for existing active goals:

- If the user asks to inspect/manage an existing goal, give the appropriate `/goal`, `/goal pause`, `/goal resume`, or `/goal clear` command rather than drafting a new objective.

## README and Distribution

Replace placeholder install commands with the repository install form used by generated docs:

```bash
npx skills add bahayonghang/my-claude-code-settings/skills --skill goal-meta-skill
```

Add concise troubleshooting for:

- `/goal` missing from slash commands.
- Goal too long.
- Wanting only one language.

Keep source credit intact.

## Agent Metadata

Before editing agent metadata, search current repo consumers for `agents/interface.yaml` and `agents/openai.yaml`.

Recommended path:

1. Add `agents/openai.yaml` matching current Codex manual metadata if no conflict is found.
2. Keep `agents/interface.yaml` for compatibility unless a repo script treats duplicate metadata as invalid.
3. If both cannot coexist, migrate carefully and document the reason in the change summary.

## Tests and Evals

Add `evals/evals.json` with realistic prompts:

- Chinese vague app/MVP prompt should produce Chinese copy-ready goal, reason, options, reply hint, and English mirror.
- English repo bugfix prompt should produce English-only goal with verification and boundaries.
- High-risk medical/financial/copyright prompt should produce discovery-first goal and pause conditions.
- Existing-goal management prompt should route to `/goal pause/resume/clear` or `/goal` view guidance.
- Long complex goal prompt should use file-pointer guidance when likely over 4,000 characters.
- Simple translation or one-line shell request should not force `/goal`.

Add automated coverage for:

- `lint_goal_command.py` rejects `/目标`, placeholders, broad edit scope, weak verification, and thin marker content.
- A contract test or fixture catches missing Chinese-first companion sections when the prompt requires them.
- Metadata/docs sync can detect the generated docs page for `goal-meta-skill`.

## Validation Ladder

Narrow checks first:

1. Python syntax for `lint_goal_command.py`.
2. New Node/Python tests for the linter/contract.
3. `just skills-check`.
4. `just docs-sync` then `just docs-check`.
5. `just python-check`.
6. `just node-test`.
7. `just ci`.

## Rollback

If the optimization overreaches, revert only the goal-meta-skill files and generated docs touched for this task. Do not reset the whole worktree.

