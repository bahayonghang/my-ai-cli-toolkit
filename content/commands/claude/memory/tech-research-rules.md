---
name: tech-research-rules
description: "3-phase orchestrator: extract tech stack → Exa research → generate path-conditional rules (auto-loaded by Claude Code)"
argument-hint: "[session-id | tech-stack-name] [--regenerate] [--tool <gemini|qwen>]"
allowed-tools: SlashCommand(*), TodoWrite(*), Bash(*), Read(*), Write(*), Task(*)
---

# Tech Stack Rules Generator

## Overview

**Purpose**: Generate multi-layered, path-conditional rules that Claude Code automatically loads based on file context.

**Output Structure**:
```
.claude/rules/tech/{tech-stack}/
├── core.md           # paths: **/*.{ext} - Core principles
├── patterns.md       # paths: src/**/*.{ext} - Implementation patterns
├── testing.md        # paths: **/*.{test,spec}.{ext} - Testing rules
├── config.md         # paths: *.config.* - Configuration rules
├── api.md            # paths: **/api/**/* - API rules (backend only)
├── components.md     # paths: **/components/**/* - Component rules (frontend only)
└── metadata.json     # Generation metadata
```

**Templates Location**: `~/.claude/workflows/cli-templates/prompts/rules/`

---

## Core Rules

1. **Start Immediately**: First action is TodoWrite initialization
2. **Path-Conditional Output**: Every rule file includes `paths` frontmatter
3. **Template-Driven**: Agent reads templates before generating content
4. **Agent Produces Files**: Agent writes all rule files directly
5. **No Manual Loading**: Rules auto-activate when Claude works with matching files

---

## 3-Phase Execution

### Phase 1: Prepare Context & Detect Tech Stack

**Goal**: Detect input mode, extract tech stack info, determine file extensions

**Input Mode Detection**:
```bash
input="$1"

if [[ "$input" == WFS-* ]]; then
  MODE="session"
  SESSION_ID="$input"
  # Read workflow-session.json to extract tech stack
else
  MODE="direct"
  TECH_STACK_NAME="$input"
fi
```

**Tech Stack Analysis**:
```javascript
// Decompose composite tech stacks
// "typescript-react-nextjs" → ["typescript", "react", "nextjs"]

const TECH_EXTENSIONS = {
  "typescript": "{ts,tsx}",
  "javascript": "{js,jsx}",
  "python": "py",
  "rust": "rs",
  "go": "go",
  "java": "java",
  "csharp": "cs",
  "ruby": "rb",
  "php": "php"
};

const FRAMEWORK_TYPE = {
  "react": "frontend",
  "vue": "frontend",
  "angular": "frontend",
  "nextjs": "fullstack",
  "nuxt": "fullstack",
  "fastapi": "backend",
  "express": "backend",
  "django": "backend",
  "rails": "backend"
};
```

**Check Existing Rules**:
```bash
normalized_name=$(echo "$TECH_STACK_NAME" | tr '[:upper:]' '[:lower:]' | tr ' ' '-')
rules_dir=".claude/rules/tech/${normalized_name}"
existing_count=$(find "${rules_dir}" -name "*.md" 2>/dev/null | wc -l || echo 0)
```

**Skip Decision**:
- If `existing_count > 0` AND no `--regenerate` → `SKIP_GENERATION = true`
- If `--regenerate` → Delete existing and regenerate

**Output Variables**:
- `TECH_STACK_NAME`: Normalized name
- `PRIMARY_LANG`: Primary language
- `FILE_EXT`: File extension pattern
- `FRAMEWORK_TYPE`: frontend | backend | fullstack | library
- `COMPONENTS`: Array of tech components
- `SKIP_GENERATION`: Boolean

**TodoWrite**: Mark phase 1 completed

---

### Phase 2: Agent Produces Path-Conditional Rules

**Skip Condition**: Skipped if `SKIP_GENERATION = true`

**Goal**: Delegate to agent for Exa research and rule file generation

**Template Files**:
```
~/.claude/workflows/cli-templates/prompts/rules/
├── tech-rules-agent-prompt.txt  # Agent instructions
├── rule-core.txt                # Core principles template
├── rule-patterns.txt            # Implementation patterns template
├── rule-testing.txt             # Testing rules template
├── rule-config.txt              # Configuration rules template
├── rule-api.txt                 # API rules template (backend)
└── rule-components.txt          # Component rules template (frontend)
```

**Agent Task**:

```javascript
Task({
  subagent_type: "general-purpose",
  description: `Generate tech stack rules: ${TECH_STACK_NAME}`,
  prompt: `
You are generating path-conditional rules for Claude Code.

## Context
- Tech Stack: ${TECH_STACK_NAME}
- Primary Language: ${PRIMARY_LANG}
- File Extensions: ${FILE_EXT}
- Framework Type: ${FRAMEWORK_TYPE}
- Components: ${JSON.stringify(COMPONENTS)}
- Output Directory: .claude/rules/tech/${TECH_STACK_NAME}/

## Instructions

Read the agent prompt template for detailed instructions.
Use --rule rules-tech-rules-agent-prompt to load the template automatically.

## Execution Steps

1. Execute Exa research queries (see agent prompt)
2. Read each rule template
3. Generate rule files following template structure
4. Write files to output directory
5. Write metadata.json
6. Report completion

## Variable Substitutions

Replace in templates:
- {TECH_STACK_NAME} → ${TECH_STACK_NAME}
- {PRIMARY_LANG} → ${PRIMARY_LANG}
- {FILE_EXT} → ${FILE_EXT}
- {FRAMEWORK_TYPE} → ${FRAMEWORK_TYPE}
`
})
```

**Completion Criteria**:
- 4-6 rule files written with proper `paths` frontmatter
- metadata.json written
- Agent reports files created

**TodoWrite**: Mark phase 2 completed

---

### Phase 3: Verify & Report

**Goal**: Verify generated files and provide usage summary

**Steps**:

1. **Verify Files**:
   ```bash
   find ".claude/rules/tech/${TECH_STACK_NAME}" -name "*.md" -type f
   ```

2. **Validate Frontmatter**:
   ```bash
   head -5 ".claude/rules/tech/${TECH_STACK_NAME}/core.md"
   ```

3. **Read Metadata**:
   ```javascript
   Read(`.claude/rules/tech/${TECH_STACK_NAME}/metadata.json`)
   ```

4. **Generate Summary Report**:
   ```
   Tech Stack Rules Generated

   Tech Stack: {TECH_STACK_NAME}
   Location: .claude/rules/tech/{TECH_STACK_NAME}/

   Files Created:
   ├── core.md         → paths: **/*.{ext}
   ├── patterns.md     → paths: src/**/*.{ext}
   ├── testing.md      → paths: **/*.{test,spec}.{ext}
   ├── config.md       → paths: *.config.*
   ├── api.md          → paths: **/api/**/* (if backend)
   └── components.md   → paths: **/components/**/* (if frontend)

   Auto-Loading:
   - Rules apply automatically when editing matching files
   - No manual loading required

   Example Activation:
   - Edit src/components/Button.tsx → core.md + patterns.md + components.md
   - Edit tests/api.test.ts → core.md + testing.md
   - Edit package.json → config.md
   ```

**TodoWrite**: Mark phase 3 completed

---

## Path Pattern Reference

| Pattern | Matches |
|---------|---------|
| `**/*.ts` | All .ts files |
| `src/**/*` | All files under src/ |
| `*.config.*` | Config files in root |
| `**/*.{ts,tsx}` | .ts and .tsx files |

| Tech Stack | Core Pattern | Test Pattern |
|------------|--------------|--------------|
| TypeScript | `**/*.{ts,tsx}` | `**/*.{test,spec}.{ts,tsx}` |
| Python | `**/*.py` | `**/test_*.py, **/*_test.py` |
| Rust | `**/*.rs` | `**/tests/**/*.rs` |
| Go | `**/*.go` | `**/*_test.go` |

---

## Parameters

```bash
/memory:tech-research [session-id | "tech-stack-name"] [--regenerate]
```

**Arguments**:
- **session-id**: `WFS-*` format - Extract from workflow session
- **tech-stack-name**: Direct input - `"typescript"`, `"typescript-react"`
- **--regenerate**: Force regenerate existing rules

---

## Examples

### Single Language

```bash
/memory:tech-research "typescript"
```

**Output**: `.claude/rules/tech/typescript/` with 4 rule files

### Frontend Stack

```bash
/memory:tech-research "typescript-react"
```

**Output**: `.claude/rules/tech/typescript-react/` with 5 rule files (includes components.md)

### Backend Stack

```bash
/memory:tech-research "python-fastapi"
```

**Output**: `.claude/rules/tech/python-fastapi/` with 5 rule files (includes api.md)

### From Session

```bash
/memory:tech-research WFS-user-auth-20251104
```

**Workflow**: Extract tech stack from session → Generate rules

---

## Comparison: Rules vs SKILL

| Aspect | SKILL Memory | Rules |
|--------|--------------|-------|
| Loading | Manual: `Skill("tech")` | Automatic by path |
| Scope | All files when loaded | Only matching files |
| Granularity | Monolithic packages | Per-file-type |
| Context | Full package | Only relevant rules |

**When to Use**:
- **Rules**: Tech stack conventions per file type
- **SKILL**: Reference docs, APIs, examples for manual lookup
