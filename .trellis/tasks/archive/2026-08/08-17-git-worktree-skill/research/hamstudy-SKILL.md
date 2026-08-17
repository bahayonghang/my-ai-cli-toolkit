---
name: git-worktree
description: >-
  Isolate development in Git worktrees and carry each isolated task through
  implementation, verification, integration, and safe cleanup. Use whenever a
  user asks to work in a worktree, keep the main checkout untouched, develop on
  a separate branch without switching the current checkout, run independent
  implementation efforts in parallel, resume work already assigned to a
  worktree, reconcile a worktree branch with its integration branch, or remove
  a completed worktree. Also use when planning parallel write-capable work that
  needs separate files and indexes. Do not use merely because read-only
  research or review is parallel.
---

# Git Worktree Development

Use a worktree as an ownership and execution boundary, not merely as another
directory. Once a task is assigned to a worktree, carry the entire task through
that boundary until its work is integrated and the worktree is safely removed.

## Core invariants

1. **Make the assigned worktree authoritative.** The coordinator's current
   directory, a worker's inherited directory, and a previous `cd` do not prove
   where an operation will run. Record the worktree's canonical absolute path
   and route every task-related read, edit, command, test, generated artifact,
   Git operation, review fix, and conflict resolution to it.
2. **Keep one task in one checkout.** After isolation begins, do not make part
   of the task in the main checkout. Assign unrelated discoveries separately.
3. **Give every writing lane a unique branch and worktree.** Parallel readers
   may share a worktree. Prefer one coordinating writer per worktree. Separate
   independent writers when their changes do not share a commit or integration
   fate.
4. **Assign one lifecycle owner.** The actor that creates or explicitly adopts
   a worktree owns its removal. Other workers must not move, unlock, prune,
   delete, or repurpose it.
5. **Preserve unfamiliar state.** Treat existing worktrees, branches, staged
   changes, locks, and in-progress Git operations as belonging to someone else
   unless ownership is positively established.
6. **Finish with integration.** Coding, commits, a pushed branch, or an open
   review are intermediate states. Unless the user explicitly requests a
   handoff-only endpoint, do not call the task complete until the work is
   integrated, verified in its integrated form, and cleaned up.

## Decide whether isolation helps

Use a worktree for an implementation task that must leave the current checkout
undisturbed, for an independent parallel writing lane, or when the user
explicitly requests one.

Do not create worktrees merely to parallelize read-only research, planning, or
review. Worktrees add coordination and integration cost; use them when separate
mutable state earns that cost.

When multiple writers contribute to one tightly coupled change, prefer a single
worktree with one coordinating writer and parallel read-only support. Separate
worktrees are strongest when each lane can produce an independently coherent
commit series.

## Establish the boundary

Before creating or adopting a worktree:

- Read repository instructions and determine the intended integration branch.
- Inspect every registered worktree using Git's stable porcelain format.
- Inspect the current checkout and index without changing them.
- Select a unique, valid branch and filesystem-safe worktree name.
- Default the location to
  `<project-root>/.worktrees/<worktree-name>` unless the user or repository
  specifies another convention.
- Ensure `.worktrees/` is ignored without overwriting or committing unrelated
  state. Prefer an existing ignore rule. If a tracked ignore-file change would
  interfere with concurrent work, use repository-local exclusion and report it.
- Record the canonical absolute path, task, branch, integration branch, base
  commit, lifecycle owner, and current lifecycle state.

If the requested branch or path already exists, inspect it. Adopt it only when
it clearly belongs to the same task and the user-visible state is preserved.
Never force creation over an existing registration.

## Propagate scope

Pass the canonical worktree path to every worker and every resumed task. State
that the path is the exclusive scope for task-related operations and that the
main checkout and sibling worktrees are out of bounds.

Use execution mechanisms that set a working directory explicitly. Use absolute
paths for file operations when directory routing is uncertain. For Git, target
the worktree explicitly rather than relying on ambient shell state.

Before accepting a worker's result, verify that its changed paths and Git status
come from the assigned worktree. A textual claim that the worker used the right
directory is not evidence.

Read [references/coordination.md](references/coordination.md) when delegating,
resuming, or coordinating multiple workers.

## Develop inside the worktree

Keep setup, dependencies, edits, tests, builds, formatting, generated files, and
temporary artifacts inside the worktree. Do not copy secrets or machine-local
configuration automatically; use the repository's documented setup and ask
before propagating sensitive files.

Compose with other applicable skills rather than duplicating them:

- Use an available commit skill for ownership-aware staging, atomic commits,
  and commit messages.
- Use an available testing skill to select meaningful tests and assess their
  quality.
- Follow repository instructions for checks, review, delivery, and merge
  strategy.

The worktree boundary still applies while using those skills.

## Reconcile and integrate

Treat conflict resolution as implementation work. Reconcile the feature branch
with the latest integration branch using the repository's required strategy.
Do not rewrite published or foreign commits without authorization.

After reconciliation:

- Review the combined diff and the resulting history.
- Confirm both sides' intended behavior survived.
- Repeat relevant automated and behavioral verification.
- Resolve new failures inside the worktree.
- Integrate using the repository's merge policy.
- Verify the integrated result, not only the pre-merge feature branch.

If required access, checks, or review prevent integration, report the task as
blocked or handed off. Do not describe it as complete.

Read [references/integration.md](references/integration.md) before rebasing,
merging, resolving conflicts, or deciding that integration is complete.

## Clean up

Remove only a worktree owned by this workflow, and only after proving:

- No uncommitted or untracked task work remains.
- No Git operation is in progress.
- No worker or external coordinator is still using the path.
- The intended work is preserved in the integrated result.
- The registered worktree path exactly matches the cleanup target.
- The worktree is not locked.

Use Git's worktree removal operation so it can enforce safety and update
administrative state. Do not use recursive filesystem deletion or force by
default. Delete branches and remote refs only when their ownership and
retention policy are clear.

Finish by reporting the integrated destination, verification performed,
worktree removal, branch disposition, and any state deliberately left behind.

Read [references/recovery.md](references/recovery.md) when state is stale,
interrupted, locked, missing, moved, or of uncertain ownership.

## Completion contract

Consider a worktree task complete only when all of the following hold:

- The intended behavior is implemented in the assigned worktree.
- Appropriate verification passes there.
- The intended changes are intentionally committed.
- The feature is reconciled with its integration branch.
- Post-reconciliation verification passes.
- The work is integrated according to repository policy.
- The integrated result is verified.
- The owned worktree is safely removed.
- Final branch and repository state are reported accurately.

Do not weaken this contract because an agent, process, or review system says the
implementation is done.
