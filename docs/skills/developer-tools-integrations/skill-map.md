# Skill Map

Skill inventory viewer that scans installed skills and renders a compact ASCII map of what is available.

## When to use it

- user asks what skills are installed or available
- user wants a grouped overview of the skill catalog
- user asks for a quick skill list without opening the raw registry

## Core workflow

1. scan the installed skill directories
2. extract each skill's name, version, triggerability, description, and category signal
3. group skills by the fixed category order defined by the skill map
4. render the final result as an ASCII table in the conversation

## Output contract

- produces an on-screen ASCII map only
- does not write files or generate installable artifacts
- includes category grouping and overall counts

## Main supporting assets

- the scanning script referenced by the skill
- the category rules and ASCII layout in `SKILL.md`
- installed skill metadata under `~/.claude/skills/`

## Key constraints

- scan installed skills only, not repository source directories
- prefer frontmatter category metadata when it exists
- keep the layout ASCII-only and stable across runs
- never change the installed skill set as part of the listing flow

## Notes

- The skill is about orientation, not installation.
- It is useful as a quick catalog view before choosing a skill.
