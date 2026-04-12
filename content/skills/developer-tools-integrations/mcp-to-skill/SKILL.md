---
name: mcp-to-skill
description: |
  Convert MCP (Model Context Protocol) servers to Claude Code Skills. Use when:
  (1) User wants to convert an MCP server project to a skill
  (2) User mentions "MCP to skill", "convert MCP", "MCP 转 skill"
  (3) User has an MCP server codebase and wants to make it a reusable skill
  (4) User wants to analyze MCP server structure for skill creation
  (5) User says "MCP project is too hard to install" or "share MCP tools with others"
  (6) User wants to package MCP tools for non-technical users
  (7) User asks "how to distribute MCP tools" or "make MCP portable"
  Supports TypeScript/JavaScript and Python MCP servers. Handles Tools, Resources, and Prompts.
category: developer-tools-integrations
tags: [mcp, skill-conversion, model-context-protocol, automation]
---

# MCP to Skill Converter

Convert MCP servers into Claude Code Skills for easier distribution and usage.

## Conversion Workflow

### Step 1: Analyze MCP Server

Run the analysis script to extract tool/resource/prompt definitions:

```bash
python3 scripts/analyze_mcp.py /path/to/mcp-project --pretty
```

The script outputs JSON with: `tools`, `resources`, `prompts`, `mcp_sdks`, `dependencies`.

For manual analysis, inspect these key files:
- `package.json` / `pyproject.toml` — dependencies and entry point
- `src/index.ts` / `main.py` — server setup, tool/resource/prompt registration
- Source files — implementation details

### Step 2: Map MCP Components to Skill Structure

Map all three MCP primitives:

| MCP Primitive | Skill Equivalent |
|---------------|------------------|
| **Tool** | `scripts/` executable or instruction section |
| **Resource** | `references/` markdown file (static) or script (dynamic) |
| **Prompt** | Workflow instruction section in SKILL.md |

For the complete mapping table and conversion patterns, see `references/MAPPING.md`.

### Step 3: Choose Conversion Pattern Per Tool

For each MCP tool, pick the right pattern:

- **Pattern A (Script):** Complex logic, API calls, error handling → `scripts/tool_name.py`
- **Pattern B (Instruction):** Simple commands, no deps → inline in SKILL.md
- **Pattern C (Hybrid):** Tools requiring server runtime → setup instructions + MCP connection

Decision: Can it run standalone? → A or B. Is it trivial? → B. Needs server state? → C.

For detailed pattern descriptions and examples, see `references/MAPPING.md`.
For real-world conversion case studies, see `references/EXAMPLES.md`.

### Step 4: Generate Skill Structure

```
{skill-name}/
├── SKILL.md                    # Core instructions
├── scripts/
│   └── {tool_name}.{ext}      # Pattern A tool scripts
├── references/
│   └── {topic}.md             # MCP Resources → reference docs
└── config/
    └── secrets.example.md     # Required env vars / API keys
```

### Step 5: Write SKILL.md

```markdown
---
name: {skill-name}
description: |
  {Original MCP server description}. Use when:
  (1) {Primary use case from tool descriptions}
  (2) {Secondary use case}
---

# {Skill Name}

{Brief description}

## Prerequisites

{Setup: permissions, API keys, runtime requirements}
Required environment variables: (list from MCP server's .env / config)

## Tools

### {Tool Name}
{Description, usage, parameters, example}
```

### Step 6: Handle Secrets & Environment Variables

- Never include actual secrets in skill files
- Create `config/secrets.example.md` listing all required env vars with descriptions
- Document minimum required scopes/permissions in Prerequisites
- See `references/MAPPING.md` § "Secrets & Environment Variables" for patterns

### Step 7: Verify the Converted Skill

Before packaging, run through this checklist:

- [ ] SKILL.md has proper frontmatter (`name`, `description` with triggers)
- [ ] All MCP **Tools** are documented with usage instructions
- [ ] All MCP **Resources** are converted to `references/` files
- [ ] All MCP **Prompts** are converted to workflow sections
- [ ] Scripts are executable (`chmod +x`) and tested standalone
- [ ] `config/secrets.example.md` exists if env vars are needed
- [ ] No content duplication between SKILL.md and references
- [ ] No unnecessary files (README, CHANGELOG, LICENSE, etc.)

Test the skill by:
1. Installing it to a test platform directory
2. Invoking each tool/instruction manually
3. Verifying scripts handle missing args and errors gracefully
