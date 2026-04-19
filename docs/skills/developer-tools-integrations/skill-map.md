# Skill Map

Skill inventory viewer that detects the current CLI, resolves that platform's installed-skills root, and renders a compact ASCII map of what is available on the current machine.

## When to use it

- user asks what skills are installed locally
- user wants a grouped overview of the current CLI's installed skills
- user asks for a quick local skill list without opening raw directories
- user wants to review overlap or near-duplicates across installed skills

Do not use it for registry discovery, installable catalog browsing, or skill recommendations.

## Core workflow

1. detect the current CLI and resolve that platform's installed-skills root
2. if detection fails, fall back to the shared install root (`~/.agents/skills`)
3. extract each skill instance's stable id, name, version, triggerability, description summary, source category, group key, and install root
4. preserve duplicate names that exist in different roots instead of collapsing them away during scan
5. group skills by the fixed display group order defined by the skill map
6. render the final result as an ASCII table directly from the Node CLI

## Output contract

- produces an on-screen ASCII map only
- does not write files or generate installable artifacts
- includes grouped counts and footer stats for `Total`, `Invocable`, `Unknown`, and `Groups`
- supports `--json` for structured output, `--platform` for explicit platform selection, and `--root` for test/debug overrides
- keeps duplicate installations visible by preserving a stable `instance_id` per skill instance
- supports `--analyze` and `--min-score` for similarity review without deleting or moving files

## Main supporting assets

- `scripts/skill-map.mjs`
- `scripts/lib/platforms.mjs`
- `scripts/lib/similarity.mjs`
- the category rules and ASCII layout in `SKILL.md`
- installed skill metadata under the current platform's installed-skills root

## Key constraints

- scan installed skills only, not repository source directories
- keep frontmatter `category` as `source_category`, but do not use it as the display grouping key
- keep builtin/system roots such as `~/.codex/skills` out of the default map
- keep the layout ASCII-only and stable across runs
- keep scan results instance-aware so same-name installs from different roots do not disappear
- never change the installed skill set as part of the listing flow
- keep the script cross-platform across Windows, macOS, and Linux

## Notes

- The skill is about orientation, not installation.
- It is useful as a quick local inventory view before choosing a skill.
- The similarity mode is suggestions-only and intentionally leaves deletion decisions to the user.
