# Design: functional PR titles and compact completion

## Boundaries

This task edits `gh-pr-release` text and eval fixtures only. No new route, no new script, no `git-commit` changes, no Governed report regeneration.

```
user asks to create/merge a PR
    │
    ├─ exact title supplied
    │     → use that title
    ├─ otherwise
    │     → title from base...HEAD functional subject (create.md)
    │
    ├─ GitHub body
    │     → template or What/Why/How to test/Out of scope
    │     → optional one-line topology: Merges <head> into <base>
    │     → never --fill
    │
    ├─ existing open PR with mechanical merge title
    │     → propose functional retitle; authorize gh pr edit separately
    │
    └─ completion chat
          → identifiers only (SKILL.md Completion)
```

## Title algorithm (create.md is the home)

Inspect:

```bash
git log --oneline <base>..HEAD
git diff --name-status <base>...HEAD
```

Read changed files only until the main purpose is clear.

Then:

1. If the user supplied a complete title string, use it.
2. Drop commits whose only role is journal, task archive, or empty chore when any `feat` / `fix` / `refactor` / `perf` commit remains.
3. If one remaining commit already states the main purpose as `type(scope): subject`, reuse that header and keep the repo's language and emoji convention.
4. If several remaining commits share one purpose, write one covering Conventional Commit header in the same convention.
5. The GitHub title must not contain `merge <head> into <base>`, `合并 … 到`, a combined prefix/suffix of those phrases, or a bare branch-name subject.

Worked sample (PR #30 class, not a fixture dump):

| Input commit | Role |
| --- | --- |
| `fix(goal-meta-skill): 完善 Trellis Prompt 派发与归档闭环` | main purpose |
| `chore(trellis): 记录 Goal Prompt 收尾契约任务` | supporting |
| `chore(task): 归档 08-27-goal-prompt-submit-plan-archive` | drop from title |
| `chore: record journal` | drop from title |

Draft title: `fix(goal-meta-skill): 完善 Trellis Prompt 派发与归档闭环`

Forbidden: `feat: merge dev into main` and `feat: merge dev into main — 完善 Trellis Prompt 派发与归档闭环`.

## Mechanical title on an open PR (merge.md)

A title is mechanical when, ignoring Conventional Commit type/scope/emoji, the remaining subject is only a branch-merge phrase.

On inspect, if the PR is open and the title is mechanical:

1. Draft a replacement with the create.md algorithm against the PR base and head.
2. Show `gh pr edit PR --repo OWNER/REPO --title "..."`.
3. Authorize that edit separately from merge.
4. Merge still pins `--match-head-commit` after a fresh read.

Do not edit a MERGED PR.

## Completion contract (SKILL.md)

After a fresh read, the chat report contains only:

- PR number, title, URL
- state
- base and head refs
- authorized writes that actually ran
- head SHA, and merge commit SHA when merged
- missing evidence

Do not include actor login, wall-clock time, the included-commit catalog, CI job names, or a list of actions that were not authorized.

CI still gates merge in `merge.md`. Green/pending/failed remains an inspect fact. It does not become a job roster in the completion report unless the user asks.

## Eval shape

`evals.json` ids 39–42 (next after 38). `evals/output/cases.jsonl` adds matching recorded fixtures.

Assertions combine short required anchors with forbidden mechanical-title or operation-dump phrases. Do not require a full golden sentence.

Provider-backed and human blind review stay `missing evidence`.

## Compatibility

- Version: `3.0.1` in `SKILL.md` and `manifest.json` only. Historical `reports/` stay as previously generated evidence.
- After frontmatter change: `just docs-sync` then `just ci`.
- `agents/interface.yaml` default_prompt may add one routing clause that titles come from the changeset; it must not restate the algorithm.
- Description trigger phrases do not change. No trigger_eval rerun required.

## Trade-offs

- Reusing a dominant commit header beats inventing a new covering sentence when one commit already names the change.
- Compact completion drops useful debug fields. Those fields remain available when the user asks, and in `gh pr view` JSON.
- Not regenerating Governed reports leaves version drift in old evidence files. That drift is accepted; regenerating the atlas is out of scope.
