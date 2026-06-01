# Plan Schema

Use this schema when a machine-readable workflow plan helps coordination. Keep `plan.md` as the human source of truth.

```json
{
  "goal": "string",
  "success_criteria": ["string"],
  "constraints": ["string"],
  "risks": [
    {
      "risk": "string",
      "approval_required": true,
      "mitigation": "string"
    }
  ],
  "artifact_policy": {
    "preferred_path": ".planning/<feature> or .workflow/<slug>",
    "repo_ignore_checked": true,
    "pollution_guard": "Use .workflow only when durable artifacts are useful and acceptable for the repo.",
    "commit_intent": "local-only | commit | undecided"
  },
  "runner_capabilities": {
    "subagent_runner": "available | unavailable | unknown",
    "goal_mode": "explicitly_requested | unavailable | not_requested",
    "simulation_allowed": true,
    "max_concurrent_agents": 4,
    "max_total_agents": 12
  },
  "platform_notes": {
    "os": "windows | macos | linux | unknown",
    "shell": "powershell | bash | zsh | unknown",
    "path_guidance": "Quote paths with spaces; prefer pathlib.Path in scripts.",
    "python_command": "python, with py -3 fallback on Windows"
  },
  "packets": [
    {
      "id": "01-discovery",
      "objective": "string",
      "context": "string",
      "files_or_sources": ["string"],
      "ownership": "string",
      "do": ["string"],
      "do_not": ["string"],
      "expected_output": "string",
      "verification": ["string"],
      "status": "pending"
    }
  ],
  "integration_policy": {
    "owner": "parent",
    "conflict_resolution": "Inspect authoritative sources before choosing.",
    "final_output": "string"
  },
  "verification": [
    {
      "check": "string",
      "command": "string or null",
      "required": true,
      "status": "pending"
    }
  ],
  "reusable_artifacts": ["string"]
}
```

Suggested defaults:

- `runner_capabilities.max_concurrent_agents`: 2-4 for normal work.
- `runner_capabilities.max_total_agents`: 6-12 unless the user approves a larger run.
- Packet IDs: prefix with two digits so files sort naturally.
- Status values: `pending`, `in_progress`, `complete`, `blocked`, `skipped`.
- `artifact_policy.commit_intent`: default to `local-only` unless the user asks to commit workflow artifacts.
- `platform_notes.python_command`: document `python` plus Windows `py -3` fallback for runnable examples.
