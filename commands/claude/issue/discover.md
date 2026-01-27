---
name: issue:discover
description: Discover potential issues from multiple perspectives (bug, UX, test, quality, security, performance, maintainability, best-practices) using CLI explore. Supports Exa external research for security and best-practices perspectives.
argument-hint: "<path-pattern> [--perspectives=bug,ux,...] [--external]"
allowed-tools: SlashCommand(*), TodoWrite(*), Read(*), Bash(*), Task(*), AskUserQuestion(*), Glob(*), Grep(*)
---

# Issue Discovery Command

## Quick Start

```bash
# Discover issues in specific module (interactive perspective selection)
/issue:discover src/auth/**

# Discover with specific perspectives
/issue:discover src/payment/** --perspectives=bug,security,test

# Discover with external research for all perspectives
/issue:discover src/api/** --external

# Discover in multiple modules
/issue:discover src/auth/**,src/payment/**
```

**Discovery Scope**: Specified modules/files only
**Output Directory**: `.workflow/issues/discoveries/{discovery-id}/`
**Available Perspectives**: bug, ux, test, quality, security, performance, maintainability, best-practices
**Exa Integration**: Auto-enabled for security and best-practices perspectives
**CLI Tools**: Gemini → Qwen → Codex (fallback chain)

## What & Why

### Core Concept
Multi-perspective issue discovery orchestrator that explores code from different angles to identify potential bugs, UX improvements, test gaps, and other actionable items. Unlike code review (which assesses existing code quality), discovery focuses on **finding opportunities for improvement and potential problems**.

**vs Code Review**:
- **Code Review** (`review-module-cycle`): Evaluates code quality against standards
- **Issue Discovery** (`issue:discover`): Finds actionable issues, bugs, and improvement opportunities

### Value Proposition
1. **Proactive Issue Detection**: Find problems before they become bugs
2. **Multi-Perspective Analysis**: Each perspective surfaces different types of issues
3. **External Benchmarking**: Compare against industry best practices via Exa
4. **Direct Issue Integration**: Discoveries can be exported to issue tracker
5. **Dashboard Management**: View, filter, and export discoveries via CCW dashboard

## How It Works

### Execution Flow

```
Phase 1: Discovery & Initialization
   └─ Parse target pattern, create session, initialize output structure

Phase 2: Interactive Perspective Selection
   └─ AskUserQuestion for perspective selection (or use --perspectives)

Phase 3: Parallel Perspective Analysis
   ├─ Launch N @cli-explore-agent instances (one per perspective)
   ├─ Security & Best-Practices auto-trigger Exa research
   ├─ Agent writes perspective JSON, returns summary
   └─ Update discovery-progress.json

Phase 4: Aggregation & Prioritization
   ├─ Collect agent return summaries
   ├─ Load perspective JSON files
   ├─ Merge findings, deduplicate by file+line
   └─ Calculate priority scores

Phase 5: Issue Generation & Summary
   ├─ Convert high-priority discoveries to issue format
   ├─ Write to discovery-issues.jsonl
   ├─ Generate single summary.md from agent returns
   └─ Update discovery-state.json to complete

Phase 6: User Action Prompt
   └─ AskUserQuestion for next step (export/dashboard/skip)
```

## Perspectives

### Available Perspectives

| Perspective | Focus | Categories | Exa |
|-------------|-------|------------|-----|
| **bug** | Potential Bugs | edge-case, null-check, resource-leak, race-condition, boundary, exception-handling | - |
| **ux** | User Experience | error-message, loading-state, feedback, accessibility, interaction, consistency | - |
| **test** | Test Coverage | missing-test, edge-case-test, integration-gap, coverage-hole, assertion-quality | - |
| **quality** | Code Quality | complexity, duplication, naming, documentation, code-smell, readability | - |
| **security** | Security Issues | injection, auth, encryption, input-validation, data-exposure, access-control | ✓ |
| **performance** | Performance | n-plus-one, memory-usage, caching, algorithm, blocking-operation, resource | - |
| **maintainability** | Maintainability | coupling, cohesion, tech-debt, extensibility, module-boundary, interface-design | - |
| **best-practices** | Best Practices | convention, pattern, framework-usage, anti-pattern, industry-standard | ✓ |

### Interactive Perspective Selection

When no `--perspectives` flag is provided, the command uses AskUserQuestion:

```javascript
AskUserQuestion({
  questions: [{
    question: "Select primary discovery focus:",
    header: "Focus",
    multiSelect: false,
    options: [
      { label: "Bug + Test + Quality", description: "Quick scan: potential bugs, test gaps, code quality (Recommended)" },
      { label: "Security + Performance", description: "System audit: security issues, performance bottlenecks" },
      { label: "Maintainability + Best-practices", description: "Long-term health: coupling, tech debt, conventions" },
      { label: "Full analysis", description: "All 7 perspectives (comprehensive, takes longer)" }
    ]
  }]
})
```

**Recommended Combinations**:
- Quick scan: bug, test, quality
- Full analysis: all perspectives
- Security audit: security, bug, quality

## Core Responsibilities

### Orchestrator

**Phase 1: Discovery & Initialization**

```javascript
// Step 1: Parse target pattern and resolve files
const resolvedFiles = await expandGlobPattern(targetPattern);
if (resolvedFiles.length === 0) {
  throw new Error(`No files matched pattern: ${targetPattern}`);
}

// Step 2: Generate discovery ID
const discoveryId = `DSC-${formatDate(new Date(), 'YYYYMMDD-HHmmss')}`;

// Step 3: Create output directory
const outputDir = `.workflow/issues/discoveries/${discoveryId}`;
await mkdir(outputDir, { recursive: true });
await mkdir(`${outputDir}/perspectives`, { recursive: true });

// Step 4: Initialize unified discovery state (merged state+progress)
await writeJson(`${outputDir}/discovery-state.json`, {
  discovery_id: discoveryId,
  target_pattern: targetPattern,
  phase: "initialization",
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  target: { files_count: { total: resolvedFiles.length }, project: {} },
  perspectives: [],  // filled after selection: [{name, status, findings}]
  external_research: { enabled: false, completed: false },
  results: { total_findings: 0, issues_generated: 0, priority_distribution: {} }
});
```

**Phase 2: Perspective Selection**

```javascript
// Check for --perspectives flag
let selectedPerspectives = [];

if (args.perspectives) {
  selectedPerspectives = args.perspectives.split(',').map(p => p.trim());
} else {
  // Interactive selection via AskUserQuestion
  const response = await AskUserQuestion({...});
  selectedPerspectives = parseSelectedPerspectives(response);
}

// Validate and update state
await updateDiscoveryState(outputDir, {
  'metadata.perspectives': selectedPerspectives,
  phase: 'parallel'
});
```

**Phase 3: Parallel Perspective Analysis**

Launch N agents in parallel (one per selected perspective):

```javascript
// Launch agents in parallel - agents write JSON and return summary
const agentPromises = selectedPerspectives.map(perspective =>
  Task({
    subagent_type: "cli-explore-agent",
    run_in_background: false,
    description: `Discover ${perspective} issues`,
    prompt: buildPerspectivePrompt(perspective, discoveryId, resolvedFiles, outputDir)
  })
);

// Wait for all agents - collect their return summaries
const results = await Promise.all(agentPromises);
// results contain agent summaries for final report
```

**Phase 4: Aggregation & Prioritization**

```javascript
// Load all perspective JSON files written by agents
const allFindings = [];
for (const perspective of selectedPerspectives) {
  const jsonPath = `${outputDir}/perspectives/${perspective}.json`;
  if (await fileExists(jsonPath)) {
    const data = await readJson(jsonPath);
    allFindings.push(...data.findings.map(f => ({ ...f, perspective })));
  }
}

// Deduplicate and prioritize
const prioritizedFindings = deduplicateAndPrioritize(allFindings);

// Update unified state
await updateDiscoveryState(outputDir, {
  phase: 'aggregation',
  'results.total_findings': prioritizedFindings.length,
  'results.priority_distribution': countByPriority(prioritizedFindings)
});
```

**Phase 5: Issue Generation & Summary**

```javascript
// Convert high-priority findings to issues
const issueWorthy = prioritizedFindings.filter(f =>
  f.priority === 'critical' || f.priority === 'high' || f.priority_score >= 0.7
);

// Write discovery-issues.jsonl
await writeJsonl(`${outputDir}/discovery-issues.jsonl`, issues);

// Generate single summary.md from agent return summaries
// Orchestrator briefly summarizes what agents returned (NO detailed reports)
await writeSummaryFromAgentReturns(outputDir, results, prioritizedFindings, issues);

// Update final state
await updateDiscoveryState(outputDir, {
  phase: 'complete',
  updated_at: new Date().toISOString(),
  'results.issues_generated': issues.length
});
```

**Phase 6: User Action Prompt**

```javascript
// Prompt user for next action based on discovery results
const hasHighPriority = issues.some(i => i.priority === 'critical' || i.priority === 'high');
const hasMediumFindings = prioritizedFindings.some(f => f.priority === 'medium');

await AskUserQuestion({
  questions: [{
    question: `Discovery complete: ${issues.length} issues generated, ${prioritizedFindings.length} total findings. What would you like to do next?`,
    header: "Next Step",
    multiSelect: false,
    options: hasHighPriority ? [
      { label: "Export to Issues (Recommended)", description: `${issues.length} high-priority issues found - export to issue tracker for planning` },
      { label: "Open Dashboard", description: "Review findings in ccw view before exporting" },
      { label: "Skip", description: "Complete discovery without exporting" }
    ] : hasMediumFindings ? [
      { label: "Open Dashboard (Recommended)", description: "Review medium-priority findings in ccw view to decide which to export" },
      { label: "Export to Issues", description: `Export ${issues.length} issues to tracker` },
      { label: "Skip", description: "Complete discovery without exporting" }
    ] : [
      { label: "Skip (Recommended)", description: "No significant issues found - complete discovery" },
      { label: "Open Dashboard", description: "Review all findings in ccw view" },
      { label: "Export to Issues", description: `Export ${issues.length} issues anyway` }
    ]
  }]
});

// Handle response
if (response === "Export to Issues") {
  // Append to issues.jsonl
  await appendJsonl('.workflow/issues/issues.jsonl', issues);
  console.log(`Exported ${issues.length} issues. Run /issue:plan to continue.`);
} else if (response === "Open Dashboard") {
  console.log('Run `ccw view` and navigate to Issues > Discovery to manage findings.');
}
```

### Output File Structure

```
.workflow/issues/discoveries/
├── index.json                           # Discovery session index
└── {discovery-id}/
    ├── discovery-state.json             # Unified state (merged state+progress)
    ├── perspectives/
    │   └── {perspective}.json           # Per-perspective findings
    ├── external-research.json           # Exa research results (if enabled)
    ├── discovery-issues.jsonl           # Generated candidate issues
    └── summary.md                       # Single summary (from agent returns)
```

### Schema References

**External Schema Files** (agent MUST read and follow exactly):

| Schema | Path | Purpose |
|--------|------|---------|
| **Discovery State** | `~/.claude/workflows/cli-templates/schemas/discovery-state-schema.json` | Session state machine |
| **Discovery Finding** | `~/.claude/workflows/cli-templates/schemas/discovery-finding-schema.json` | Perspective analysis results |

### Agent Invocation Template

**Perspective Analysis Agent**:

```javascript
Task({
  subagent_type: "cli-explore-agent",
  run_in_background: false,
  description: `Discover ${perspective} issues`,
  prompt: `
    ## Task Objective
    Discover potential ${perspective} issues in specified module files.

    ## Discovery Context
    - Discovery ID: ${discoveryId}
    - Perspective: ${perspective}
    - Target Pattern: ${targetPattern}
    - Resolved Files: ${resolvedFiles.length} files
    - Output Directory: ${outputDir}

    ## MANDATORY FIRST STEPS
    1. Read discovery state: ${outputDir}/discovery-state.json
    2. Read schema: ~/.claude/workflows/cli-templates/schemas/discovery-finding-schema.json
    3. Analyze target files for ${perspective} concerns

    ## Output Requirements

    **1. Write JSON file**: ${outputDir}/perspectives/${perspective}.json
    - Follow discovery-finding-schema.json exactly
    - Each finding: id, title, priority, category, description, file, line, snippet, suggested_issue, confidence

    **2. Return summary** (DO NOT write report file):
    - Return a brief text summary of findings
    - Include: total findings, priority breakdown, key issues
    - This summary will be used by orchestrator for final report

    ## Perspective-Specific Guidance
    ${getPerspectiveGuidance(perspective)}

    ## Success Criteria
    - [ ] JSON written to ${outputDir}/perspectives/${perspective}.json
    - [ ] Summary returned with findings count and key issues
    - [ ] Each finding includes actionable suggested_issue
    - [ ] Priority uses lowercase enum: critical/high/medium/low
  `
})
```

**Exa Research Agent** (for security and best-practices):

```javascript
Task({
  subagent_type: "cli-explore-agent",
  run_in_background: false,
  description: `External research for ${perspective} via Exa`,
  prompt: `
    ## Task Objective
    Research industry best practices for ${perspective} using Exa search

    ## Research Steps
    1. Read project tech stack: .workflow/project-tech.json
    2. Use Exa to search for best practices
    3. Synthesize findings relevant to this project

    ## Output Requirements

    **1. Write JSON file**: ${outputDir}/external-research.json
    - Include sources, key_findings, gap_analysis, recommendations

    **2. Return summary** (DO NOT write report file):
    - Brief summary of external research findings
    - Key recommendations for the project

    ## Success Criteria
    - [ ] JSON written to ${outputDir}/external-research.json
    - [ ] Summary returned with key recommendations
    - [ ] Findings are relevant to project's tech stack
  `
})
```

### Perspective Guidance Reference

```javascript
function getPerspectiveGuidance(perspective) {
  const guidance = {
    bug: `
      Focus: Null checks, edge cases, resource leaks, race conditions, boundary conditions, exception handling
      Priority: Critical=data corruption/crash, High=malfunction, Medium=edge case issues, Low=minor
    `,
    ux: `
      Focus: Error messages, loading states, feedback, accessibility, interaction patterns, form validation
      Priority: Critical=inaccessible, High=confusing, Medium=inconsistent, Low=cosmetic
    `,
    test: `
      Focus: Missing unit tests, edge case coverage, integration gaps, assertion quality, test isolation
      Priority: Critical=no security tests, High=no core logic tests, Medium=weak coverage, Low=minor gaps
    `,
    quality: `
      Focus: Complexity, duplication, naming, documentation, code smells, readability
      Priority: Critical=unmaintainable, High=significant issues, Medium=naming/docs, Low=minor refactoring
    `,
    security: `
      Focus: Input validation, auth/authz, injection, XSS/CSRF, data exposure, access control
      Priority: Critical=auth bypass/injection, High=missing authz, Medium=weak validation, Low=headers
    `,
    performance: `
      Focus: N+1 queries, memory leaks, caching, algorithm efficiency, blocking operations
      Priority: Critical=memory leaks, High=N+1/inefficient, Medium=missing cache, Low=minor optimization
    `,
    maintainability: `
      Focus: Coupling, interface design, tech debt, extensibility, module boundaries, configuration
      Priority: Critical=unrelated code changes, High=unclear boundaries, Medium=coupling, Low=refactoring
    `,
    'best-practices': `
      Focus: Framework conventions, language patterns, anti-patterns, deprecated APIs, coding standards
      Priority: Critical=anti-patterns causing bugs, High=convention violations, Medium=style, Low=cosmetic
    `
  };
  return guidance[perspective] || 'General code discovery analysis';
}
```

## Dashboard Integration

### Viewing Discoveries

Open CCW dashboard to manage discoveries:

```bash
ccw view
```

Navigate to **Issues > Discovery** to:
- View all discovery sessions
- Filter findings by perspective and priority
- Preview finding details
- Select and export findings as issues

### Exporting to Issues

From the dashboard, select findings and click "Export as Issues" to:
1. Convert discoveries to standard issue format
2. Append to `.workflow/issues/issues.jsonl`
3. Set status to `registered`
4. Continue with `/issue:plan` workflow

## Related Commands

```bash
# After discovery, plan solutions for exported issues
/issue:plan DSC-001,DSC-002,DSC-003

# Or use interactive management
/issue:manage
```

## Best Practices

1. **Start Focused**: Begin with specific modules rather than entire codebase
2. **Use Quick Scan First**: Start with bug, test, quality for fast results
3. **Review Before Export**: Not all discoveries warrant issues - use dashboard to filter
4. **Combine Perspectives**: Run related perspectives together (e.g., security + bug)
5. **Enable Exa for New Tech**: When using unfamiliar frameworks, enable external research
