# Planning with Files

File-based planning system for complex multi-step tasks with automatic session recovery.

## Overview

Planning with Files implements a Manus-style file-based planning approach for complex tasks. It creates structured planning documents (`task_plan.md`, `findings.md`, `progress.md`) to maintain context and track progress across long-running tasks.

## Features

- 📋 **Structured Planning** - Creates task_plan.md for step-by-step execution
- 🔍 **Research Tracking** - Maintains findings.md for discoveries and insights
- ✅ **Progress Monitoring** - Updates progress.md with completed steps
- 🔄 **Session Recovery** - Automatically restores context after `/clear`
- 🎯 **Smart Triggers** - Activates for tasks requiring >5 tool calls

## When to Use

Use this skill when:
- Starting complex multi-step tasks
- Conducting research projects
- Building features that span multiple files
- Tasks that may take multiple sessions
- Any work requiring >5 tool calls

## Usage

The skill activates automatically for complex tasks, or trigger explicitly:

```
Plan this feature implementation
```

```
Create a task plan for building the authentication system
```

## Generated Files

### task_plan.md
Contains the structured plan with:
- Task overview
- Step-by-step breakdown
- Dependencies
- Success criteria

### findings.md
Tracks discoveries:
- Research insights
- Technical decisions
- Blockers and solutions
- Reference links

### progress.md
Monitors execution:
- Completed steps
- Current status
- Next actions
- Time estimates

## Workflow

1. **Initial Planning** - Creates task_plan.md with structured steps
2. **Execution** - Works through steps, updating progress.md
3. **Research** - Documents findings in findings.md
4. **Recovery** - Automatically restores context if session is cleared

## Session Recovery

After `/clear`, the skill automatically:
1. Detects existing planning files
2. Reads current progress
3. Restores task context
4. Continues from last checkpoint

## Best Practices

- Let the skill create files automatically for complex tasks
- Review task_plan.md before starting execution
- Update findings.md as you discover new information
- Use progress.md to track what's done and what's next

## Requirements

- Claude Code or compatible AI assistant
- File system access

## Version

2.10.0

## License

MIT
