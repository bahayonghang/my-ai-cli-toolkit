# Skill Evolution Manager

Continuously improve skills based on user feedback and conversation insights.

## Overview

Skill Evolution Manager is the "evolution hub" of the AI skill system. It captures learnings from conversations, extracts structured feedback, and persists improvements back into skill definitions without losing them during updates.

## Core Concepts

1. **Session Review** - Analyze skill performance after conversations
2. **Experience Extraction** - Convert feedback into structured `evolution.json`
3. **Smart Stitching** - Persist learned best practices into `SKILL.md`
4. **Cross-Version Alignment** - Restore experiences after skill updates

## Features

- 📊 **Performance Analysis** - Reviews what worked and what didn't
- 💾 **Structured Storage** - Saves feedback as JSON for version control
- 🔄 **Auto-Integration** - Merges learnings into skill documentation
- 🛡️ **Update-Proof** - Preserves experiences across skill version upgrades

## Usage

Trigger evolution after a conversation:

```
/evolve
```

Or use natural language:

```
Review this conversation and save the learnings
```

```
This tool didn't work well, record the issue
```

```
Save this experience to the skill
```

## Workflow

### 1. Review & Extract

When triggered, the agent:
1. **Scans Context** - Identifies pain points (errors, style issues) or successes
2. **Locates Skill** - Determines which skill needs evolution
3. **Generates JSON** - Creates structured feedback:

```json
{
  "preferences": ["User prefers silent downloads by default"],
  "fixes": ["Windows ffmpeg paths need escaping"],
  "custom_prompts": "Always print estimated time before execution"
}
```

### 2. Persist

Calls `scripts/merge_evolution.py` to incrementally write JSON to the skill's `evolution.json`:

```bash
python scripts/merge_evolution.py <skill_path> <json_string>
```

### 3. Stitch

Calls `scripts/smart_stitch.py` to convert JSON into Markdown and append to `SKILL.md`:

```bash
python scripts/smart_stitch.py <skill_path>
```

### 4. Align

After `skill-manager` updates a skill, run `smart_stitch.py` again to restore experiences to the new version.

## Core Scripts

| Script | Purpose |
|--------|---------|
| `merge_evolution.py` | Incrementally merge new experience data |
| `smart_stitch.py` | Generate/update best practices section in SKILL.md |
| `align_all.py` | Batch re-stitch all skills after updates |

## Best Practices

- **Don't Edit SKILL.md Directly** - Use the `evolution.json` channel to ensure experiences survive updates
- **Multi-Skill Sessions** - If a conversation involves multiple skills, evolve each one separately

## Integration

Works seamlessly with:
- [skill-manager](./skill-manager.md) - For skill updates
- [github-to-skills](./github-to-skills.md) - For newly created skills

## Requirements

- Python 3.8+
- PyYAML

## License

MIT
