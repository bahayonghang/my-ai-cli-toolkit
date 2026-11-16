# Implement Plan: Optimize goal-meta-skill

Do not start this plan until the user approves implementation.

## Step 0: Reconfirm Context

- Run `git status --porcelain` and note unrelated dirty files.
- Re-read `skills/developer-tools-integrations/goal-meta-skill/SKILL.md`, README, references, script, and agent metadata.
- Re-check current docs generation behavior if generated files changed since this plan was written.

Verify:

- Only `.gitignore` or other unrelated user changes are excluded from this task.

## Step 1: Metadata and Docs Discovery

- Add or correct `category`, `tags`, and `version` in `SKILL.md`.
- Run `just skills-check`.
- Run `just docs-sync`.

Verify:

- `goal-meta-skill` gets generated pages under both `docs/skills/...` and `docs/en/skills/...`.
- `docs/skills.md`, `docs/en/skills.md`, and generated catalog include the skill.

## Step 2: Codex Goal Semantics Update

- Update `SKILL.md` operating mode and workflow with current `/goal` behavior.
- Update `references/goal-command-playbook.md`.
- Update `references/default-goal-strategy.md` and `references/interview-checklist.md` only where the same concepts repeat.
- Add the 4,000 character/file-pointer rule.
- Add `features.goals` troubleshooting guidance.
- Add existing-goal management guidance for `/goal`, `/goal pause`, `/goal resume`, and `/goal clear`.

Verify:

- No references to unsupported `/目标` as executable command are introduced.
- The skill still says it drafts instructions and does not execute the goal unless explicitly asked.

## Step 3: README and Agent Metadata

- Replace `<owner>` install placeholders with the actual repo install command.
- Add Windows-friendly command examples using `python` or `py -3` where relevant.
- Search for consumers of `agents/interface.yaml`.
- Add `agents/openai.yaml` or migrate metadata only if current validators and docs allow it.

Verify:

- README remains bilingual but concise.
- Source credit remains intact.
- `just skills-check` still passes.

## Step 4: Add Evals and Test Coverage

- Create `skills/developer-tools-integrations/goal-meta-skill/evals/evals.json`.
- Include at least 6 realistic prompts covering trigger and near-miss behavior.
- Add tests for `lint_goal_command.py` and/or a contract fixture for Chinese-first output structure.
- Specifically include one fixture where the raw `/goal` block is valid but the required Chinese-first companion sections are missing.

Skill-creator required human review step:

- Create evals JSON and run `eval-viewer/generate_review.py` so human can review test cases.
- If subagents are unavailable, run the evals inline or save static review output and report the limitation.

Verify:

- New tests fail on the known missing-mirror case before the fix or directly prove the new checker catches it.
- `just node-test` covers the added tests if they are `.mjs`.

## Step 5: Full Validation

Run:

```powershell
just skills-check
just python-check
just node-test
just docs-check
just ci
```

If line-ending warnings appear on Windows, distinguish them from real `git diff --check` failures.

## Step 6: Review and Finish

- Inspect `git diff --stat` and `git diff --check`.
- Confirm no unrelated `.gitignore` changes are staged or altered.
- Summarize:
  - metadata/docs fix
  - `/goal` semantics update
  - eval/test additions
  - validation results
- Ask before committing, following the repo's Trellis Phase 3 commit flow.

## Rollback Points

- After Step 1: metadata/docs changes can be reverted independently.
- After Step 2: instruction/reference changes can be reverted independently.
- After Step 4: tests/evals can be removed if they are too broad, without losing metadata/docs repair.

