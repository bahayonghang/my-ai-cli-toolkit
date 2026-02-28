# Skill Optimizer

Analyze and optimize Claude Code skills for compliance, token efficiency, and best practices.

## Overview

Skill Optimizer audits a skill directory against the official SKILL.md specification, identifies issues by severity, and generates an optimized version that reduces token usage while preserving functionality.

## Usage

```bash
# Analyze a skill directory
/skill_optimizer path/to/skill-directory
```

## What It Checks

| Category | Examples |
|----------|---------|
| **Frontmatter** | Valid fields (`name`, `description`, `allowed-tools`, etc.), missing required fields |
| **Token Budget** | Body exceeding 300 tokens, inline educational content that should be in `resources/` |
| **Style** | Imperative voice, concise instructions, no redundancy |
| **Structure** | Proper use of `resources/`, `scripts/`, `config/` subdirectories |

## Output

1. **Issue Report** — findings sorted by severity: Critical → Recommended → Optional, each with before/after fix examples
2. **Token Budget Table** — Before/After/Δ comparison
3. **Optimized SKILL.md** — resolves all Critical and Recommended issues

## Valid Frontmatter Fields

`name`, `description`, `argument-hint`, `disable-model-invocation`, `user-invocable`, `allowed-tools`, `model`, `context`, `agent`, `hooks`, `category`, `tags`

## When to Use

- Reviewing skills before publishing
- Reducing token consumption of verbose skills
- Ensuring compliance with the SKILL.md specification
- Auditing a skills collection for consistency