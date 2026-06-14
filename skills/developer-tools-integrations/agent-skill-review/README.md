# Agent Skill Review

Review agent skill directories as reusable ability products.

This skill audits whether a `SKILL.md` package externalizes real expert workflow, taste, tools, gotchas, evals, and distribution readiness rather than acting as a long prompt or generic documentation.

## Install

```bash
npx skills add bahayonghang/my-claude-code-settings/skills --skill agent-skill-review
```

## Use

Ask your agent to use the skill when reviewing another skill directory:

```text
Use $agent-skill-review to review this skill directory and propose concrete improvements.
```

The review focuses on:

- Trigger quality and `description` as routing logic
- Whether the skill is an ability product, not just a prompt
- Externalized expert judgment, taste, and failure cases
- "Center short, radiating thick" skill architecture
- Workflow, scripts, references, assets, and validation design
- Gotchas, evals, lifecycle, and distribution readiness

## Origin and attribution

This package is adapted from the original upstream skill:

- Original skill source: https://github.com/sugarforever/guizang-review-skill
- Original post: https://x.com/op7418/status/2065232309310427565

## Files

- `SKILL.md`: the actual skill instructions loaded by the agent
- `agents/openai.yaml`: UI metadata for skill lists and default prompt
