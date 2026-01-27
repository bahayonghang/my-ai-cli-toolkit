# GitHub to Skills

Automated factory for converting GitHub repositories into specialized AI skills.

## Overview

GitHub to Skills is an automation tool that transforms any GitHub repository into a fully functional AI skill. It fetches repository metadata, generates standardized skill structures, and creates wrapper scripts for seamless integration.

## Features

- 🔍 **Auto Analysis** - Fetches repository metadata (README, latest commit hash)
- 📦 **Standardized Structure** - Creates consistent skill directory layout
- 🏷️ **Enhanced Metadata** - Generates SKILL.md with extended frontmatter for lifecycle management
- 🔧 **Wrapper Generation** - Creates interface scripts for tool invocation
- 🔄 **Version Tracking** - Records commit hashes for future update detection

## Usage

Trigger the skill with a GitHub URL:

```
/github-to-skills https://github.com/yt-dlp/yt-dlp
```

Or use natural language:

```
Package this repo into a skill: https://github.com/username/repo
```

## Workflow

1. **Fetch Info** - Retrieves repository details (description, README, latest commit)
2. **Plan** - Analyzes README to understand tool invocation patterns
3. **Generate** - Creates SKILL.md and wrapper scripts with extended metadata
4. **Verify** - Confirms commit hash was correctly captured

## Generated Metadata Schema

Every skill created includes this extended YAML frontmatter:

```yaml
---
name: repo-name
description: Concise description for agent triggering
github_url: https://github.com/user/repo
github_hash: abc123def456...
version: 1.0.0
created_at: 2024-01-15T10:30:00Z
entry_point: scripts/wrapper.py
dependencies:
  - package1
  - package2
---
```

## Best Practices

- **Isolation** - Generated skills should manage their own dependencies
- **Progressive Disclosure** - Include only necessary wrapper code, reference original repo for details
- **Idempotency** - The `github_hash` field enables future update detection via `skill-manager`

## Integration with Skill Manager

Skills created by this factory are designed to work seamlessly with [skill-manager](./skill-manager.md) for:
- Update detection (comparing local vs remote commit hashes)
- Guided upgrade workflows
- Version management

## Requirements

- Python 3.8+
- Git
- Internet connection

## Scripts

- `scripts/fetch_github_info.py` - Fetches repository metadata
- `scripts/create_github_skill.py` - Orchestrates skill scaffolding

## License

MIT
