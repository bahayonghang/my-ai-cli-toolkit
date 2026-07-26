# Codex config, rule, hook, and automation recommendations

Load this reference only for durable runtime defaults, lifecycle enforcement, or
scheduled work.

## Scope and trust

CLI, IDE, and desktop App share local Codex configuration layers; ChatGPT web
does not read local Codex config. Project configuration and project-local hooks
apply only for a trusted project. User and project layers permit different keys,
and managed requirements/policy can constrain both. Treat unavailable effective
precedence as `missing evidence`.

Prefer a one-off current CLI override when testing a runtime setting before a
persistent edit. Persistent user-global or project config always requires
separate approval and a current-schema check. Never infer a hooks schema from a
different CLI or copy raw doctor/config/auth/provider/environment values.

## Hard decision gates

- Config/profile/rule: a repeated runtime default or enforcement policy is
  needed and existing repo guidance cannot own it.
- Hook: deterministic control must run at a documented agent lifecycle event.
- Automation: work must execute on a schedule or recurring follow-up trigger.

Prefer repository-native CI, task runners, formatters, or pre-commit gates when
the protection must apply to humans and other agents too. Technology detection
alone does not justify a hook. OMX stays optional unless detected or requested.

Each recommendation names the effective layer, trusted-project/managed-policy
preflight, event or schedule, command cwd/input/output, failure behavior,
permission/data risk, verification, disable/revert rollback, and separate
approval boundary.
