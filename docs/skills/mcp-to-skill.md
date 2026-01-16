# mcp-to-skill

Convert MCP (Model Context Protocol) servers to Claude Code Skills for easier distribution and usage.

## Use Cases

- Convert an MCP server project to a reusable skill
- Analyze MCP server structure for skill creation
- Package MCP tools as standalone scripts or instructions

## Supported Platforms

- TypeScript/JavaScript MCP servers
- Python MCP servers

## Conversion Workflow

```
Analyze → Map → Generate → Write → Package
```

### 1. Analyze MCP Server

Extract key information from the MCP server:
- Server name and description
- Available tools (name, description, parameters)
- Dependencies and runtime requirements
- Execution method (node, python, etc.)

### 2. Map to Skill Structure

| MCP Concept | Skill Equivalent |
|-------------|------------------|
| Tool name | Script or instruction section |
| Tool description | SKILL.md description |
| Tool parameters | Script arguments |
| Tool implementation | `scripts/` executable |

### 3. Generate Skill Package

```
{skill-name}/
├── SKILL.md                    # Core instructions
├── scripts/
│   └── {tool_name}.{ext}      # Individual tool scripts
└── references/
    └── tools.md               # Tool reference documentation
```

## Conversion Patterns

### Pattern A: Script-based
For complex tools with significant logic, create executable scripts.

### Pattern B: Instruction-based
For simple tools, use inline instructions in SKILL.md.

### Pattern C: Hybrid
For tools requiring the MCP server runtime, include server startup instructions.

## Output Checklist

- [ ] SKILL.md has proper frontmatter
- [ ] Description includes all use cases
- [ ] All MCP tools are documented
- [ ] Scripts are executable and tested
- [ ] References are complete

## Related Skills

- [claude-expert-skill-creator](./claude-expert-skill-creator) - General skill creation with layered architecture
