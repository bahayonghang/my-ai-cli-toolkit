# Creation Handoff

- skill: `git-worktree` 0.2.0
- job: plan and execute isolated new-branch worktrees under one repository convention root
- path: `skills/git-github-collaboration/git-worktree/`
- publication: not requested
- change (2026-08-20): create path now appends the planned ignore line when the repo `.gitignore` does not cover the convention root

## Reference skills studied

- obra/superpowers `using-git-worktrees`: isolation detect, `.worktrees/` default, ignore before create. Mapped to inspect + default root. 2026-08-20: also mapped auto-append of the ignore line on create.
- everyinc `ce-worktree`: absolute git-dir compare, one-branch-one-worktree, add `.worktrees/` to `.gitignore` when `check-ignore` misses. Mapped to isolation_state, create refusals, and `plan-create` ignore apply.
- HamStudy `git-worktree`: lifecycle owner, exact path, lock / in-progress checks. Mapped to plan-remove and record-meta.
- super-worktree: named create/list/remove/prune verbs. Mapped to helper commands. Env copy rejected.

## Absorbed and rejected

- keep: isolation detect, ignore-before-create, registered-root reuse
- adapt: HamStudy owner without adopt; check-ignore -z --stdin as matcher authority; obra/everyinc auto-append of `<resolved_root>/` on create (no second confirmation)
- reject: secret copy, node_modules symlink, sibling `../NAME`, `git-wt` CLI, finish-means-merged, auto-commit `.gitignore`
- invent: registered in-repo root discovery so `.claude/worktrees` is not replaced by a second default

## Advantages

- [design advantage] new-branch-only argv plus registered-root discovery
- [design advantage] `plan-create` ensures a repo `.gitignore` covers the convention root before `ok_to_create`
- [validated advantage] Node helper tests cover auto-append, parent-rule no-op, unstaged ignore line, escapes, create refusals, remove, prune
- [validated advantage] qiaomu trigger_eval 14/14 on 2026-08-17, report in reports/trigger-eval.json
- [hypothesis] Skill IR is a lite export because the package has no qiaomu manifest

## Verification and limits

- `validate_skill.py` failed on README.md, manifest.json, and adapter_targets. Recorded as an intentional suite schema deviation. `just skills-check` is the suite gate.
- install proof, provider-backed comparison, human blind review: `missing evidence`
