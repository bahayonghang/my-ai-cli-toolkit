# Accepted Upgrade-Check Gap

- Date: 2026-07-21
- Decision owner: user
- User direction: `不用管这个了，忽略这个错误`

## Accepted Gap

The user accepts the remaining `upgrade_check.py` failure for this task. The
checker reports both the declared and recommended bump as `major`, but still
fails unconditionally because the package name changes from `gh-pr` to
`gh-pr-release`.

This decision means:

- do not modify the external `yao-meta` installation;
- do not fabricate a same-name baseline;
- do not hand-edit generated reports or rewrite the blocker as a pass;
- preserve `reports/upgrade_check.*` and Review Studio as blocked evidence;
- continue task closeout with this acceptance criterion explicitly unmet and
  accepted by the user.

## Boundary

This decision covers only the upgrade-check rename failure. It is not a Review
Studio blocker waiver, because blockers are non-waivable under the governed
policy. It does not accept the independent Output Lab, Skill Atlas, Operations
Loop, Review Waivers, or world-class evidence warnings, and it does not support
provider-backed, human-adjudicated, world-class, or public-readiness claims.
