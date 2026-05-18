# CC (Command Creation) Commands

> Historical / offline note: this page documents a removed command family. The matching source tree is not present in current `content/platforms/*/commands/`, and this page is intentionally kept outside the live sidebar.


Create and manage custom Claude Code commands and sub-agent configurations.

## Commands

### `create-command`

**Description**: Create new Claude Code custom commands with proper structure and best practices.
**Usage**: `/cc:create-command [command-name] [description]`

#### Workflow

1. **Command Analysis** - Determine command purpose, scope, and appropriate location (project-level vs user-level)
2. **Structure Planning** - Define required parameters, workflow steps, tools, and permissions
3. **Command Creation** - Generate the command file in `.claude/commands/` with YAML frontmatter (`description`, `argument-hint`, `allowed-tools`) and comprehensive documentation
4. **Quality Assurance** - Validate syntax, structure, tool permissions, and review against best practices

#### Template Structure

```markdown
---
description: Brief description of the command
argument-hint: Expected argument format
allowed-tools: List of required tools
---

# Command Name

Detailed description of what this command does and when to use it.

## Usage

`/[category:]command-name [arguments]`
```

### `meta-agent`

**Description**: Generate new Claude Code sub-agent configuration files from user descriptions.
**Usage**: `/cc:meta-agent [description]`

#### Workflow

1. **Fetch Latest Docs** - Retrieve current Claude Code sub-agent documentation from Anthropic docs
2. **Analyze Input** - Parse user prompt to understand the new agent's purpose, tasks, and domain
3. **Design Name** - Create a concise, descriptive `kebab-case` name (e.g., `dependency-manager`)
4. **Select Tools** - Infer the minimal required tool set based on the agent's tasks
5. **Build System Prompt** - Write a detailed system prompt with step-by-step instructions and best practices
6. **Write File** - Output a complete `.md` agent definition to `.claude/agents/<agent-name>.md`

#### Output Format

```markdown
---
name: <agent-name>
description: <action-oriented description>
tools: <tool-1>, <tool-2>
model: haiku | sonnet | opus
---

# Purpose

You are a <role definition>.

## Instructions

1. Step-by-step instructions...

## Report / Response

Provide your final response in a clear, ordered manner.
```

## Examples

```bash
# Create a new command for database migrations
/cc:create-command db-migrate "Run and manage database migrations"

# Generate a new code review agent
/cc:meta-agent "An agent that reviews TypeScript code for accessibility compliance"
```

## Notes

- `create-command` uses `$ARGUMENTS` for argument handling in generated commands
- `meta-agent` defaults to `sonnet` model unless otherwise specified
- Both commands use `WebSearch` to fetch latest documentation when needed
- Generated files follow existing command/agent conventions in the repository
