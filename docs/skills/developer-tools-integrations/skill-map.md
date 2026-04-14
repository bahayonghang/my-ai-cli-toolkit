# Skill Map

Skill inventory viewer that scans locally installed skills and renders a compact ASCII map of what is available on the current machine.

## When to use it

- user asks what skills are installed locally
- user wants a grouped overview of local installed skills
- user asks for a quick local skill list without opening raw directories

Do not use it for registry discovery, installable catalog browsing, or skill recommendations.

## Core workflow

1. scan the default local skill roots: `~/.claude/skills` and `~/.agents/skills`
2. extract each skill's name, version, triggerability, description summary, source category, group key, and install root
3. group skills by the fixed display group order defined by the skill map
4. render the final result as an ASCII table directly from the Node CLI

## Output contract

- produces an on-screen ASCII map only
- does not write files or generate installable artifacts
- includes grouped counts and footer stats for `Total`, `Invocable`, `Unknown`, and `Groups`
- supports `--json` for structured output and `--root` for test/debug overrides

## Main supporting assets

- `scripts/skill-map.mjs`
- the category rules and ASCII layout in `SKILL.md`
- installed skill metadata under `~/.claude/skills/` and `~/.agents/skills/`

## Key constraints

- scan installed skills only, not repository source directories
- keep frontmatter `category` as `source_category`, but do not use it as the display grouping key
- keep the layout ASCII-only and stable across runs
- never change the installed skill set as part of the listing flow
- keep the script cross-platform across Windows, macOS, and Linux

## Notes

- The skill is about orientation, not installation.
- It is useful as a quick local inventory view before choosing a skill.
