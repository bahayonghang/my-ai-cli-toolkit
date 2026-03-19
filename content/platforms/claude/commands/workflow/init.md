---
name: init
description: Initialize project-level state with intelligent project analysis using cli-explore-agent
argument-hint: "[--regenerate]"
examples:
  - /workflow:init
  - /workflow:init --regenerate
---

# Workflow Init Command (/workflow:init)

## Overview
Initialize `.workflow/project-tech.json` and `.workflow/project-guidelines.json` with comprehensive project understanding by delegating analysis to **cli-explore-agent**.

**Dual File System**:
- `project-tech.json`: Auto-generated technical analysis (stack, architecture, components)
- `project-guidelines.json`: User-maintained rules and constraints (created as scaffold)

**Note**: This command may be called by other workflow commands. Upon completion, return immediately to continue the calling workflow without interrupting the task flow.

## Usage
```bash
/workflow:init                 # Initialize (skip if exists)
/workflow:init --regenerate    # Force regeneration
```

## Execution Process

```
Input Parsing:
   └─ Parse --regenerate flag → regenerate = true | false

Decision:
   ├─ BOTH_EXIST + no --regenerate → Exit: "Already initialized"
   ├─ EXISTS + --regenerate → Backup existing → Continue analysis
   └─ NOT_FOUND → Continue analysis

Analysis Flow:
   ├─ Get project metadata (name, root)
   ├─ Invoke cli-explore-agent
   │   ├─ Structural scan (get_modules_by_depth.sh, find, wc)
   │   ├─ Semantic analysis (Gemini CLI)
   │   ├─ Synthesis and merge
   │   └─ Write .workflow/project-tech.json
   ├─ Create guidelines scaffold (if not exists)
   │   └─ Write .workflow/project-guidelines.json (empty structure)
   └─ Display summary

Output:
   ├─ .workflow/project-tech.json (+ .backup if regenerate)
   └─ .workflow/project-guidelines.json (scaffold if new)
```

## Implementation

### Step 1: Parse Input and Check Existing State

**Parse --regenerate flag**:
```javascript
const regenerate = $ARGUMENTS.includes('--regenerate')
```

**Check existing state**:

```bash
bash(test -f .workflow/project-tech.json && echo "TECH_EXISTS" || echo "TECH_NOT_FOUND")
bash(test -f .workflow/project-guidelines.json && echo "GUIDELINES_EXISTS" || echo "GUIDELINES_NOT_FOUND")
```

**If BOTH_EXIST and no --regenerate**: Exit early
```
Project already initialized:
- Tech analysis: .workflow/project-tech.json
- Guidelines: .workflow/project-guidelines.json

Use /workflow:init --regenerate to rebuild tech analysis
Use /workflow:session:solidify to add guidelines
Use /workflow:status --project to view state
```

### Step 2: Get Project Metadata

```bash
bash(basename "$(git rev-parse --show-toplevel 2>/dev/null || pwd)")
bash(git rev-parse --show-toplevel 2>/dev/null || pwd)
bash(mkdir -p .workflow)
```

### Step 3: Invoke cli-explore-agent

**For --regenerate**: Backup and preserve existing data
```bash
bash(cp .workflow/project-tech.json .workflow/project-tech.json.backup)
```

**Delegate analysis to agent**:

```javascript
Task(
  subagent_type="cli-explore-agent",
  run_in_background=false,
  description="Deep project analysis",
  prompt=`
Analyze project for workflow initialization and generate .workflow/project-tech.json.

## MANDATORY FIRST STEPS
1. Execute: cat ~/.claude/workflows/cli-templates/schemas/project-tech-schema.json (get schema reference)
2. Execute: ccw tool exec get_modules_by_depth '{}' (get project structure)

## Task
Generate complete project-tech.json following the schema structure:
- project_name: "${projectName}"
- initialized_at: ISO 8601 timestamp
- overview: {
    description: "Brief project description",
    technology_stack: {
      languages: [{name, file_count, primary}],
      frameworks: ["string"],
      build_tools: ["string"],
      test_frameworks: ["string"]
    },
    architecture: {style, layers: [], patterns: []},
    key_components: [{name, path, description, importance}]
  }
- features: []
- development_index: ${regenerate ? 'preserve from backup' : '{feature: [], enhancement: [], bugfix: [], refactor: [], docs: []}'}
- statistics: ${regenerate ? 'preserve from backup' : '{total_features: 0, total_sessions: 0, last_updated: ISO timestamp}'}
- _metadata: {initialized_by: "cli-explore-agent", analysis_timestamp: ISO timestamp, analysis_mode: "deep-scan"}

## Analysis Requirements

**Technology Stack**:
- Languages: File counts, mark primary
- Frameworks: From package.json, requirements.txt, go.mod, etc.
- Build tools: npm, cargo, maven, webpack, vite
- Test frameworks: jest, pytest, go test, junit

**Architecture**:
- Style: MVC, microservices, layered (from structure & imports)
- Layers: presentation, business-logic, data-access
- Patterns: singleton, factory, repository
- Key components: 5-10 modules {name, path, description, importance}

## Execution
1. Structural scan: get_modules_by_depth.sh, find, wc -l
2. Semantic analysis: Gemini for patterns/architecture
3. Synthesis: Merge findings
4. ${regenerate ? 'Merge with preserved development_index and statistics from .workflow/project-tech.json.backup' : ''}
5. Write JSON: Write('.workflow/project-tech.json', jsonContent)
6. Report: Return brief completion summary

Project root: ${projectRoot}
`
)
```

### Step 3.5: Create Guidelines Scaffold (if not exists)

```javascript
// Only create if not exists (never overwrite user guidelines)
if (!file_exists('.workflow/project-guidelines.json')) {
  const guidelinesScaffold = {
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

  Write('.workflow/project-guidelines.json', JSON.stringify(guidelinesScaffold, null, 2));
}
```

### Step 4: Display Summary

```javascript
const projectTech = JSON.parse(Read('.workflow/project-tech.json'));
const guidelinesExists = file_exists('.workflow/project-guidelines.json');

console.log(`
✓ Project initialized successfully

## Project Overview
Name: ${projectTech.project_name}
Description: ${projectTech.overview.description}

### Technology Stack
Languages: ${projectTech.overview.technology_stack.languages.map(l => l.name).join(', ')}
Frameworks: ${projectTech.overview.technology_stack.frameworks.join(', ')}

### Architecture
Style: ${projectTech.overview.architecture.style}
Components: ${projectTech.overview.key_components.length} core modules

---
Files created:
- Tech analysis: .workflow/project-tech.json
- Guidelines: .workflow/project-guidelines.json ${guidelinesExists ? '(scaffold)' : ''}
${regenerate ? '- Backup: .workflow/project-tech.json.backup' : ''}

Next steps:
- Use /workflow:session:solidify to add project guidelines
- Use /workflow:plan to start planning
`);
```

## Error Handling

**Agent Failure**: Fall back to basic initialization with placeholder overview
**Missing Tools**: Agent uses Qwen fallback or bash-only
**Empty Project**: Create minimal JSON with all gaps identified
