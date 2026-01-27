---
name: solidify
description: Crystallize session learnings and user-defined constraints into permanent project guidelines
argument-hint: "[--type <convention|constraint|learning>] [--category <category>] \"rule or insight\""
examples:
  - /workflow:session:solidify "Use functional components for all React code" --type convention
  - /workflow:session:solidify "No direct DB access from controllers" --type constraint --category architecture
  - /workflow:session:solidify "Cache invalidation requires event sourcing" --type learning --category architecture
  - /workflow:session:solidify --interactive
---

# Session Solidify Command (/workflow:session:solidify)

## Overview

Crystallizes ephemeral session context (insights, decisions, constraints) into permanent project guidelines stored in `.workflow/project-guidelines.json`. This ensures valuable learnings persist across sessions and inform future planning.

## Use Cases

1. **During Session**: Capture important decisions as they're made
2. **After Session**: Reflect on lessons learned before archiving
3. **Proactive**: Add team conventions or architectural rules

## Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `rule` | string | ✅ (unless --interactive) | The rule, convention, or insight to solidify |
| `--type` | enum | ❌ | Type: `convention`, `constraint`, `learning` (default: auto-detect) |
| `--category` | string | ❌ | Category for organization (see categories below) |
| `--interactive` | flag | ❌ | Launch guided wizard for adding rules |

### Type Categories

**convention** → Coding style preferences (goes to `conventions` section)
- Subcategories: `coding_style`, `naming_patterns`, `file_structure`, `documentation`

**constraint** → Hard rules that must not be violated (goes to `constraints` section)
- Subcategories: `architecture`, `tech_stack`, `performance`, `security`

**learning** → Session-specific insights (goes to `learnings` array)
- Subcategories: `architecture`, `performance`, `security`, `testing`, `process`, `other`

## Execution Process

```
Input Parsing:
   ├─ Parse: rule text (required unless --interactive)
   ├─ Parse: --type (convention|constraint|learning)
   ├─ Parse: --category (subcategory)
   └─ Parse: --interactive (flag)

Step 1: Ensure Guidelines File Exists
   └─ If not exists → Create with empty structure

Step 2: Auto-detect Type (if not specified)
   └─ Analyze rule text for keywords

Step 3: Validate and Format Entry
   └─ Build entry object based on type

Step 4: Update Guidelines File
   └─ Add entry to appropriate section

Step 5: Display Confirmation
   └─ Show what was added and where
```

## Implementation

### Step 1: Ensure Guidelines File Exists

```bash
bash(test -f .workflow/project-guidelines.json && echo "EXISTS" || echo "NOT_FOUND")
```

**If NOT_FOUND**, create scaffold:

```javascript
const scaffold = {
  conventions: {
    coding_style: [],
    naming_patterns: [],
    file_structure: [],
    documentation: []
  },
  constraints: {
    architecture: [],
    tech_stack: [],
    performance: [],
    security: []
  },
  quality_rules: [],
  learnings: [],
  _metadata: {
    created_at: new Date().toISOString(),
    version: "1.0.0"
  }
};

Write('.workflow/project-guidelines.json', JSON.stringify(scaffold, null, 2));
```

### Step 2: Auto-detect Type (if not specified)

```javascript
function detectType(ruleText) {
  const text = ruleText.toLowerCase();

  // Constraint indicators
  if (/\b(no|never|must not|forbidden|prohibited|always must)\b/.test(text)) {
    return 'constraint';
  }

  // Learning indicators
  if (/\b(learned|discovered|realized|found that|turns out)\b/.test(text)) {
    return 'learning';
  }

  // Default to convention
  return 'convention';
}

function detectCategory(ruleText, type) {
  const text = ruleText.toLowerCase();

  if (type === 'constraint' || type === 'learning') {
    if (/\b(architecture|layer|module|dependency|circular)\b/.test(text)) return 'architecture';
    if (/\b(security|auth|permission|sanitize|xss|sql)\b/.test(text)) return 'security';
    if (/\b(performance|cache|lazy|async|sync|slow)\b/.test(text)) return 'performance';
    if (/\b(test|coverage|mock|stub)\b/.test(text)) return 'testing';
  }

  if (type === 'convention') {
    if (/\b(name|naming|prefix|suffix|camel|pascal)\b/.test(text)) return 'naming_patterns';
    if (/\b(file|folder|directory|structure|organize)\b/.test(text)) return 'file_structure';
    if (/\b(doc|comment|jsdoc|readme)\b/.test(text)) return 'documentation';
    return 'coding_style';
  }

  return type === 'constraint' ? 'tech_stack' : 'other';
}
```

### Step 3: Build Entry

```javascript
function buildEntry(rule, type, category, sessionId) {
  if (type === 'learning') {
    return {
      date: new Date().toISOString().split('T')[0],
      session_id: sessionId || null,
      insight: rule,
      category: category,
      context: null
    };
  }

  // For conventions and constraints, just return the rule string
  return rule;
}
```

### Step 4: Update Guidelines File

```javascript
const guidelines = JSON.parse(Read('.workflow/project-guidelines.json'));

if (type === 'convention') {
  if (!guidelines.conventions[category]) {
    guidelines.conventions[category] = [];
  }
  if (!guidelines.conventions[category].includes(rule)) {
    guidelines.conventions[category].push(rule);
  }
} else if (type === 'constraint') {
  if (!guidelines.constraints[category]) {
    guidelines.constraints[category] = [];
  }
  if (!guidelines.constraints[category].includes(rule)) {
    guidelines.constraints[category].push(rule);
  }
} else if (type === 'learning') {
  guidelines.learnings.push(buildEntry(rule, type, category, sessionId));
}

guidelines._metadata.updated_at = new Date().toISOString();
guidelines._metadata.last_solidified_by = sessionId;

Write('.workflow/project-guidelines.json', JSON.stringify(guidelines, null, 2));
```

### Step 5: Display Confirmation

```
✓ Guideline solidified

Type: ${type}
Category: ${category}
Rule: "${rule}"

Location: .workflow/project-guidelines.json → ${type}s.${category}

Total ${type}s in ${category}: ${count}
```

## Interactive Mode

When `--interactive` flag is provided:

```javascript
AskUserQuestion({
  questions: [
    {
      question: "What type of guideline are you adding?",
      header: "Type",
      multiSelect: false,
      options: [
        { label: "Convention", description: "Coding style preference (e.g., use functional components)" },
        { label: "Constraint", description: "Hard rule that must not be violated (e.g., no direct DB access)" },
        { label: "Learning", description: "Insight from this session (e.g., cache invalidation needs events)" }
      ]
    }
  ]
});

// Follow-up based on type selection...
```

## Examples

### Add a Convention
```bash
/workflow:session:solidify "Use async/await instead of callbacks" --type convention --category coding_style
```

Result in `project-guidelines.json`:
```json
{
  "conventions": {
    "coding_style": ["Use async/await instead of callbacks"]
  }
}
```

### Add an Architectural Constraint
```bash
/workflow:session:solidify "No direct DB access from controllers" --type constraint --category architecture
```

Result:
```json
{
  "constraints": {
    "architecture": ["No direct DB access from controllers"]
  }
}
```

### Capture a Session Learning
```bash
/workflow:session:solidify "Cache invalidation requires event sourcing for consistency" --type learning
```

Result:
```json
{
  "learnings": [
    {
      "date": "2024-12-28",
      "session_id": "WFS-auth-feature",
      "insight": "Cache invalidation requires event sourcing for consistency",
      "category": "architecture"
    }
  ]
}
```

## Integration with Planning

The `project-guidelines.json` is consumed by:

1. **`/workflow:tools:context-gather`**: Loads guidelines into context-package.json
2. **`/workflow:plan`**: Passes guidelines to task generation agent
3. **`task-generate-agent`**: Includes guidelines as "CRITICAL CONSTRAINTS" in system prompt

This ensures all future planning respects solidified rules without users needing to re-state them.

## Error Handling

- **Duplicate Rule**: Warn and skip if exact rule already exists
- **Invalid Category**: Suggest valid categories for the type
- **File Corruption**: Backup existing file before modification

## Related Commands

- `/workflow:session:start` - Start a session (may prompt for solidify at end)
- `/workflow:session:complete` - Complete session (prompts for learnings to solidify)
- `/workflow:init` - Creates project-guidelines.json scaffold if missing
