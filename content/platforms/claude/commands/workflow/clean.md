---
name: clean
description: Intelligent code cleanup with mainline detection, stale artifact discovery, and safe execution
argument-hint: "[--dry-run] [\"focus area\"]"
allowed-tools: TodoWrite(*), Task(*), AskUserQuestion(*), Read(*), Glob(*), Bash(*), Write(*)
---

# Clean Command (/workflow:clean)

## Overview

Intelligent cleanup command that explores the codebase to identify the development mainline, discovers artifacts that have drifted from it, and safely removes stale sessions, abandoned documents, and dead code.

**Core capabilities:**
- Mainline detection: Identify active development branches and core modules
- Drift analysis: Find sessions, documents, and code that deviate from mainline
- Intelligent discovery: cli-explore-agent based artifact scanning
- Safe execution: Confirmation-based cleanup with dry-run preview

## Usage

```bash
/workflow:clean                          # Full intelligent cleanup (explore → analyze → confirm → execute)
/workflow:clean --dry-run                # Explore and analyze only, no execution
/workflow:clean "auth module"            # Focus cleanup on specific area
```

## Execution Process

```
Phase 1: Mainline Detection
   ├─ Analyze git history for development trends
   ├─ Identify core modules (high commit frequency)
   ├─ Map active vs stale branches
   └─ Build mainline profile

Phase 2: Drift Discovery (cli-explore-agent)
   ├─ Scan workflow sessions for orphaned artifacts
   ├─ Identify documents drifted from mainline
   ├─ Detect dead code and unused exports
   └─ Generate cleanup manifest

Phase 3: Confirmation
   ├─ Display cleanup summary by category
   ├─ Show impact analysis (files, size, risk)
   └─ AskUserQuestion: Select categories to clean

Phase 4: Execution (unless --dry-run)
   ├─ Execute cleanup by category
   ├─ Update manifests and indexes
   └─ Report results
```

## Implementation

### Phase 1: Mainline Detection

**Session Setup**:
```javascript
const getUtc8ISOString = () => new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString()

const dateStr = getUtc8ISOString().substring(0, 10)
const sessionId = `clean-${dateStr}`
const sessionFolder = `.workflow/.clean/${sessionId}`

Bash(`mkdir -p ${sessionFolder}`)
```

**Step 1.1: Git History Analysis**
```bash
# Get commit frequency by directory (last 30 days)
bash(git log --since="30 days ago" --name-only --pretty=format: | grep -v "^$" | cut -d/ -f1-2 | sort | uniq -c | sort -rn | head -20)

# Get recent active branches
bash(git for-each-ref --sort=-committerdate refs/heads/ --format='%(refname:short) %(committerdate:relative)' | head -10)

# Get files with most recent changes
bash(git log --since="7 days ago" --name-only --pretty=format: | grep -v "^$" | sort | uniq -c | sort -rn | head -30)
```

**Step 1.2: Build Mainline Profile**
```javascript
const mainlineProfile = {
  coreModules: [],        // High-frequency directories
  activeFiles: [],        // Recently modified files
  activeBranches: [],     // Branches with recent commits
  staleThreshold: {
    sessions: 7,          // Days
    branches: 30,
    documents: 14
  },
  timestamp: getUtc8ISOString()
}

// Parse git log output to identify core modules
// Modules with >5 commits in last 30 days = core
// Modules with 0 commits in last 30 days = potentially stale

Write(`${sessionFolder}/mainline-profile.json`, JSON.stringify(mainlineProfile, null, 2))
```

---

### Phase 2: Drift Discovery

**Launch cli-explore-agent for intelligent artifact scanning**:

```javascript
Task(
  subagent_type="cli-explore-agent",
  run_in_background=false,
  description="Discover stale artifacts",
  prompt=`
## Task Objective
Discover artifacts that have drifted from the development mainline. Identify stale sessions, abandoned documents, and dead code for cleanup.

## Context
- **Session Folder**: ${sessionFolder}
- **Mainline Profile**: ${sessionFolder}/mainline-profile.json
- **Focus Area**: ${focusArea || "全项目"}

## Discovery Categories

### Category 1: Stale Workflow Sessions
Scan and analyze workflow session directories:

**Locations to scan**:
- .workflow/active/WFS-* (active sessions)
- .workflow/archives/WFS-* (archived sessions)
- .workflow/.lite-plan/* (lite-plan sessions)
- .workflow/.debug/DBG-* (debug sessions)

**Staleness criteria**:
- Active sessions: No modification >7 days + no related git commits
- Archives: >30 days old + no feature references in project-tech.json
- Lite-plan: >7 days old + plan.json not executed
- Debug: >3 days old + issue not in recent commits

**Analysis steps**:
1. List all session directories with modification times
2. Cross-reference with git log (are session topics in recent commits?)
3. Check manifest.json for orphan entries
4. Identify sessions with .archiving marker (interrupted)

### Category 2: Drifted Documents
Scan documentation that no longer aligns with code:

**Locations to scan**:
- .claude/rules/tech/* (generated tech rules)
- .workflow/.scratchpad/* (temporary notes)
- **/CLAUDE.md (module documentation)
- **/README.md (outdated descriptions)

**Drift criteria**:
- Tech rules: Referenced files no longer exist
- Scratchpad: Any file (always temporary)
- Module docs: Describe functions/classes that were removed
- READMEs: Reference deleted directories

**Analysis steps**:
1. Parse document content for file/function references
2. Verify referenced entities still exist in codebase
3. Flag documents with >30% broken references

### Category 3: Dead Code
Identify code that is no longer used:

**Scan patterns**:
- Unused exports (exported but never imported)
- Orphan files (not imported anywhere)
- Commented-out code blocks (>10 lines)
- TODO/FIXME comments >90 days old

**Analysis steps**:
1. Build import graph using rg/grep
2. Identify exports with no importers
3. Find files not in import graph
4. Scan for large comment blocks

## Output Format

Write to: ${sessionFolder}/cleanup-manifest.json

\`\`\`json
{
  "generated_at": "ISO timestamp",
  "mainline_summary": {
    "core_modules": ["src/core", "src/api"],
    "active_branches": ["main", "feature/auth"],
    "health_score": 0.85
  },
  "discoveries": {
    "stale_sessions": [
      {
        "path": ".workflow/active/WFS-old-feature",
        "type": "active",
        "age_days": 15,
        "reason": "No related commits in 15 days",
        "size_kb": 1024,
        "risk": "low"
      }
    ],
    "drifted_documents": [
      {
        "path": ".claude/rules/tech/deprecated-lib",
        "type": "tech_rules",
        "broken_references": 5,
        "total_references": 6,
        "drift_percentage": 83,
        "reason": "Referenced library removed",
        "risk": "low"
      }
    ],
    "dead_code": [
      {
        "path": "src/utils/legacy.ts",
        "type": "orphan_file",
        "reason": "Not imported by any file",
        "last_modified": "2025-10-01",
        "risk": "medium"
      }
    ]
  },
  "summary": {
    "total_items": 12,
    "total_size_mb": 45.2,
    "by_category": {
      "stale_sessions": 5,
      "drifted_documents": 4,
      "dead_code": 3
    },
    "by_risk": {
      "low": 8,
      "medium": 3,
      "high": 1
    }
  }
}
\`\`\`

## Execution Commands

\`\`\`bash
# Session directories
find .workflow -type d -name "WFS-*" -o -name "DBG-*" 2>/dev/null

# Check modification times (Linux/Mac)
stat -c "%Y %n" .workflow/active/WFS-* 2>/dev/null

# Check modification times (Windows PowerShell via bash)
powershell -Command "Get-ChildItem '.workflow/active/WFS-*' | ForEach-Object { Write-Output \"$($_.LastWriteTime) $($_.FullName)\" }"

# Find orphan exports (TypeScript)
rg "export (const|function|class|interface|type)" --type ts -l

# Find imports
rg "import.*from" --type ts

# Find large comment blocks
rg "^\\s*/\\*" -A 10 --type ts

# Find old TODOs
rg "TODO|FIXME" --type ts -n
\`\`\`

## Success Criteria
- [ ] All session directories scanned with age calculation
- [ ] Documents cross-referenced with existing code
- [ ] Dead code detection via import graph analysis
- [ ] cleanup-manifest.json written with complete data
- [ ] Each item has risk level and cleanup reason
`
)
```

---

### Phase 3: Confirmation

**Step 3.1: Display Summary**
```javascript
const manifest = JSON.parse(Read(`${sessionFolder}/cleanup-manifest.json`))

console.log(`
## Cleanup Discovery Report

**Mainline Health**: ${Math.round(manifest.mainline_summary.health_score * 100)}%
**Core Modules**: ${manifest.mainline_summary.core_modules.join(', ')}

### Summary
| Category | Count | Size | Risk |
|----------|-------|------|------|
| Stale Sessions | ${manifest.summary.by_category.stale_sessions} | - | ${getRiskSummary('sessions')} |
| Drifted Documents | ${manifest.summary.by_category.drifted_documents} | - | ${getRiskSummary('documents')} |
| Dead Code | ${manifest.summary.by_category.dead_code} | - | ${getRiskSummary('code')} |

**Total**: ${manifest.summary.total_items} items, ~${manifest.summary.total_size_mb} MB

### Stale Sessions
${manifest.discoveries.stale_sessions.map(s =>
  `- ${s.path} (${s.age_days}d, ${s.risk}): ${s.reason}`
).join('\n')}

### Drifted Documents
${manifest.discoveries.drifted_documents.map(d =>
  `- ${d.path} (${d.drift_percentage}% broken, ${d.risk}): ${d.reason}`
).join('\n')}

### Dead Code
${manifest.discoveries.dead_code.map(c =>
  `- ${c.path} (${c.type}, ${c.risk}): ${c.reason}`
).join('\n')}
`)
```

**Step 3.2: Dry-Run Exit**
```javascript
if (flags.includes('--dry-run')) {
  console.log(`
---
**Dry-run mode**: No changes made.
Manifest saved to: ${sessionFolder}/cleanup-manifest.json

To execute cleanup: /workflow:clean
`)
  return
}
```

**Step 3.3: User Confirmation**
```javascript
AskUserQuestion({
  questions: [
    {
      question: "Which categories to clean?",
      header: "Categories",
      multiSelect: true,
      options: [
        {
          label: "Sessions",
          description: `${manifest.summary.by_category.stale_sessions} stale workflow sessions`
        },
        {
          label: "Documents",
          description: `${manifest.summary.by_category.drifted_documents} drifted documents`
        },
        {
          label: "Dead Code",
          description: `${manifest.summary.by_category.dead_code} unused code files`
        }
      ]
    },
    {
      question: "Risk level to include?",
      header: "Risk",
      multiSelect: false,
      options: [
        { label: "Low only", description: "Safest - only obviously stale items" },
        { label: "Low + Medium", description: "Recommended - includes likely unused items" },
        { label: "All", description: "Aggressive - includes high-risk items" }
      ]
    }
  ]
})
```

---

### Phase 4: Execution

**Step 4.1: Filter Items by Selection**
```javascript
const selectedCategories = userSelection.categories  // ['Sessions', 'Documents', ...]
const riskLevel = userSelection.risk                 // 'Low only', 'Low + Medium', 'All'

const riskFilter = {
  'Low only': ['low'],
  'Low + Medium': ['low', 'medium'],
  'All': ['low', 'medium', 'high']
}[riskLevel]

const itemsToClean = []

if (selectedCategories.includes('Sessions')) {
  itemsToClean.push(...manifest.discoveries.stale_sessions.filter(s => riskFilter.includes(s.risk)))
}
if (selectedCategories.includes('Documents')) {
  itemsToClean.push(...manifest.discoveries.drifted_documents.filter(d => riskFilter.includes(d.risk)))
}
if (selectedCategories.includes('Dead Code')) {
  itemsToClean.push(...manifest.discoveries.dead_code.filter(c => riskFilter.includes(c.risk)))
}

TodoWrite({
  todos: itemsToClean.map(item => ({
    content: `Clean: ${item.path}`,
    status: "pending",
    activeForm: `Cleaning ${item.path}`
  }))
})
```

**Step 4.2: Execute Cleanup**
```javascript
const results = { deleted: [], failed: [], skipped: [] }

for (const item of itemsToClean) {
  TodoWrite({ todos: [...] })  // Mark current as in_progress

  try {
    if (item.type === 'orphan_file' || item.type === 'dead_export') {
      // Dead code: Delete file or remove export
      Bash({ command: `rm -rf "${item.path}"` })
    } else {
      // Sessions and documents: Delete directory/file
      Bash({ command: `rm -rf "${item.path}"` })
    }

    results.deleted.push(item.path)
    TodoWrite({ todos: [...] })  // Mark as completed
  } catch (error) {
    results.failed.push({ path: item.path, error: error.message })
  }
}
```

**Step 4.3: Update Manifests**
```javascript
// Update archives manifest if sessions were deleted
if (selectedCategories.includes('Sessions')) {
  const archiveManifestPath = '.workflow/archives/manifest.json'
  if (fileExists(archiveManifestPath)) {
    const archiveManifest = JSON.parse(Read(archiveManifestPath))
    const deletedSessionIds = results.deleted
      .filter(p => p.includes('WFS-'))
      .map(p => p.split('/').pop())

    const updatedManifest = archiveManifest.filter(entry =>
      !deletedSessionIds.includes(entry.session_id)
    )

    Write(archiveManifestPath, JSON.stringify(updatedManifest, null, 2))
  }
}

// Update project-tech.json if features referenced deleted sessions
const projectPath = '.workflow/project-tech.json'
if (fileExists(projectPath)) {
  const project = JSON.parse(Read(projectPath))
  const deletedPaths = new Set(results.deleted)

  project.features = project.features.filter(f =>
    !deletedPaths.has(f.traceability?.archive_path)
  )

  project.statistics.total_features = project.features.length
  project.statistics.last_updated = getUtc8ISOString()

  Write(projectPath, JSON.stringify(project, null, 2))
}
```

**Step 4.4: Report Results**
```javascript
console.log(`
## Cleanup Complete

**Deleted**: ${results.deleted.length} items
**Failed**: ${results.failed.length} items
**Skipped**: ${results.skipped.length} items

### Deleted Items
${results.deleted.map(p => `- ${p}`).join('\n')}

${results.failed.length > 0 ? `
### Failed Items
${results.failed.map(f => `- ${f.path}: ${f.error}`).join('\n')}
` : ''}

Cleanup manifest archived to: ${sessionFolder}/cleanup-manifest.json
`)
```

---

## Session Folder Structure

```
.workflow/.clean/{YYYY-MM-DD}/
├── mainline-profile.json     # Git history analysis
└── cleanup-manifest.json     # Discovery results
```

## Risk Level Definitions

| Risk | Description | Examples |
|------|-------------|----------|
| **Low** | Safe to delete, no dependencies | Empty sessions, scratchpad files, 100% broken docs |
| **Medium** | Likely unused, verify before delete | Orphan files, old archives, partially broken docs |
| **High** | May have hidden dependencies | Files with some imports, recent modifications |

## Error Handling

| Situation | Action |
|-----------|--------|
| No git repository | Skip mainline detection, use file timestamps only |
| Session in use (.archiving) | Skip with warning |
| Permission denied | Report error, continue with others |
| Manifest parse error | Regenerate from filesystem scan |
| Empty discovery | Report "codebase is clean" |

## Related Commands

- `/workflow:session:complete` - Properly archive active sessions
- `/memory:compact` - Save session memory before cleanup
- `/workflow:status` - View current workflow state
