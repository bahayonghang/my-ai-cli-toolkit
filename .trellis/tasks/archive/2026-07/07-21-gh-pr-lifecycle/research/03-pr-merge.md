# Research: Merge Best Practices (strategy tradeoffs, pre-merge checklist, auto-merge, cleanup)

- **Query**: merge commit vs squash vs rebase tradeoffs, pre-merge checklist, auto-merge, branch cleanup
- **Scope**: external
- **Date**: 2026-07-21

## Findings

### The Three Merge Methods (GitHub)

(docs.github.com/.../about-merge-methods-on-github; about-pull-request-merges)

| Method                                | What it does                                                                                   | History shape                                        |
| ------------------------------------- | ---------------------------------------------------------------------------------------------- | ---------------------------------------------------- |
| **Create a merge commit** (`--merge`) | Retains all commits from the branch and adds a merge commit tying the two branch tips together | Non-linear; preserves full WIP history + merge point |
| **Squash and merge** (`--squash`)     | Combines all the PR's commits into a **single commit** on the base; merged fast-forward        | Linear; one commit per PR                            |
| **Rebase and merge** (`--rebase`)     | Replays each commit from the head branch onto the base individually, no merge commit           | Linear; per-commit history preserved                 |

### Tradeoffs — when to use each

Decision table (mergify.com/how-to-pick-your-github-merge-methods; mitchellh gist; docs.github.com):

| Property                              | Merge commit               | Rebase  | Squash  |
| ------------------------------------- | -------------------------- | ------- | ------- |
| Easily bisectable                     | warn                       | warn    | **yes** |
| Easily revertable                     | **yes** (`git revert -mN`) | warn    | **yes** |
| Tracks authorship of original commits | **yes**                    | **yes** | **no**  |
| Linear history                        | no                         | **yes** | **yes** |
| Preserves WIP commits                 | **yes**                    | **yes** | no      |

**Decision rules:**

- **Squash** when the PR has many tiny "WIP"/"fix typo" commits aiming at one small, coherent change. Rewrite the squash commit message — GitHub's default just concatenates the WIP messages, which is poor. Best for a clean linear main history and one-commit-per-PR bisect/revert. Pairs naturally with Conventional-Commit PR titles (the title becomes the commit subject). Downside: loses per-commit authorship/granularity.
- **Merge commit** when you want to preserve true history — the merge point, all WIP commits, and easy whole-PR revert (`git revert -mN`). Good default for teams that value full history. Downside: noisier, non-linear graph.
- **Rebase** when commit history is already clean and meaningful and you want linear history with per-commit granularity. Restraint advised — it includes _all_ commits, so only use with clean PRs. Note: GitHub's rebase-and-merge always rewrites committer info and creates new SHAs (differs from local `git rebase`), and cannot sign commits on your behalf. May require the author to rebase + force-push locally to resolve conflicts first.
- No strategy is right 100% of the time — choose situationally per PR.

### Pre-Merge Checklist

Derived from GitHub branch-protection features and review standards:

- [ ] Required **status checks (CI) are green** ("Require status checks to pass before merging").
- [ ] **Required approvals** obtained ("Require pull request reviews before merging").
- [ ] Branch is **up to date with base** ("Require branches to be up to date before merging" — ensures the PR was tested against the latest base). (github.com/github/docs managing-a-branch-protection-rule.md)
- [ ] **All review threads resolved** (or explicitly deferred with a TODO+bug); don't merge while a reviewer still has an unaddressed comment without their LGTM. (chromium cl_respect.md)
- [ ] PR description has correct `Closes #N` for issues to auto-close (and targets the default branch).
- [ ] Squash commit message rewritten to be descriptive (if squashing).

### Auto-Merge

(docs.github.com/.../automatically-merging-a-pull-request)

- Auto-merge merges the PR **automatically once all merge requirements are met** (required reviews approved + required status checks passed) — avoids waiting around.
- **Must be enabled at repo level** first (Settings; or repo admin). The "Enable auto-merge" option only appears on PRs that **cannot be merged immediately** (i.e. branch protection is blocking on unmet reviews/checks).
- Requires write permission to enable; author or write-users can disable.
- Auto-merge is **disabled automatically** if someone without write permission pushes new changes to the head branch or switches the base branch.
- When targeting a branch with a **merge queue**: if required checks haven't passed, `gh pr merge --auto` enables auto-merge; if they have, the PR is added to the queue. `--admin` bypasses the queue.

### Branch Cleanup After Merge

- Delete the head branch after merge to keep the repo tidy — `gh pr merge --delete-branch` (`-d`) deletes both the local and remote branch. GitHub can also auto-delete head branches repo-wide via Settings.

## Caveats / Not Found

- Whether a given method is even available depends on repo settings (each of the three can be individually enabled/disabled by admins).
- Signed-commit workflows: GitHub cannot sign on your behalf for rebase/squash; teams needing verified signatures rebase+merge locally then push to the base.
