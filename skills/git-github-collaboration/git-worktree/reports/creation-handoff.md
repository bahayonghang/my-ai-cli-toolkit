# Creation Handoff

- skill: `git-worktree` 0.1.0
- job: plan and execute isolated new-branch worktrees under one repository convention root
- path: `skills/git-github-collaboration/git-worktree/`
- publication: not requested

## Reference skills studied

- obra/superpowers `using-git-worktrees`: isolation detect, `.worktrees/` default, ignore before create. Mapped to inspect + default root.
- everyinc `ce-worktree`: absolute git-dir compare, one-branch-one-worktree. Mapped to isolation_state and create refusals.
- HamStudy `git-worktree`: lifecycle owner, exact path, lock / in-progress checks. Mapped to plan-remove and record-meta.
- super-worktree: named create/list/remove/prune verbs. Mapped to helper commands. Env copy rejected.

## Absorbed and rejected

- keep: isolation detect, ignore-before-create, registered-root reuse
- adapt: HamStudy owner without adopt; check-ignore -z --stdin as matcher authority
- reject: secret copy, node_modules symlink, sibling `../NAME`, `git-wt` CLI, finish-means-merged, auto-commit `.gitignore`
- invent: registered in-repo root discovery so `.claude/worktrees` is not replaced by a second default

## Advantages

- [design advantage] new-branch-only argv plus registered-root discovery
- [validated advantage] Node helper tests 16/16 on ignore gate, escapes, create refusals, remove, prune
- [validated advantage] qiaomu trigger_eval 14/14, report in reports/trigger-eval.json
- [hypothesis] Skill IR is a lite export because the package has no qiaomu manifest

## Verification and limits

- `validate_skill.py` failed on README.md, manifest.json, and adapter_targets. Recorded in reports/validate-skill.json as an intentional suite schema deviation. `just skills-check` passed.
- install proof, provider-backed comparison, human blind review: `missing evidence`
