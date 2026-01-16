# Skill Structure Reference

## Directory Layout

```
skill-name/
├── SKILL.md              # Required: Core instructions
├── scripts/              # Optional: Executable scripts
│   └── *.py|*.sh|*.js
├── references/           # Optional: Documentation
│   └── *.md
└── assets/               # Optional: Templates, images
    └── *
```

## SKILL.md Format

### Frontmatter (Required)

```yaml
---
name: skill-name
description: |
  Brief description. Use when:
  (1) First trigger condition
  (2) Second trigger condition
---
```

### Body Sections

1. **Quick Start** - Essential usage in <50 words
2. **Prerequisites** - Setup requirements (if any)
3. **Tools/Commands** - Main functionality
4. **Examples** - Concrete usage examples
5. **Troubleshooting** - Common issues (if needed)

## MCP to Skill Mapping

| MCP Component | Skill Equivalent |
|---------------|------------------|
| Server name | Skill name |
| Server description | SKILL.md description |
| Tool | Script or instruction section |
| Tool parameters | Script args or instruction params |
| Resource | Reference file |

## Common Patterns

### Standalone Tools (No Server)

When MCP tools can run independently:

```markdown
## Tool Name

Execute directly:
\`\`\`bash
osascript -e 'tell application "Finder" to ...'
\`\`\`
```

### Server-Dependent Tools

When tools need running server:

```markdown
## Setup

\`\`\`bash
cd /path/to/server && npm start
\`\`\`

## Using Tools

Tools available via MCP protocol after server starts.
```

### Script Wrapper

When creating executable scripts:

```python
#!/usr/bin/env python3
"""Tool description."""
import argparse

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--param', required=True)
    args = parser.parse_args()
    # Implementation

if __name__ == '__main__':
    main()
```
