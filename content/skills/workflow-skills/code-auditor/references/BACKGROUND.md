# Review Code Skill Background & Architecture

Multi-dimensional code review skill that analyzes code across 6 key dimensions and generates structured review reports with actionable recommendations.

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│  Phase 0: Specification Study (mandatory prerequisite)            │
│              → Read references/review-dimensions.md              │
│              → Understand review dimensions and issue criteria    │
└───────────────┬─────────────────────────────────────────────────┘
                ↓
┌─────────────────────────────────────────────────────────────────┐
│           Orchestrator (state-driven decisions)                   │
│           → Read state → Select action → Execute → Update state  │
└───────────────┬─────────────────────────────────────────────────┘
                │
    ┌───────────┼───────────┬───────────┬───────────┐
    ↓           ↓           ↓           ↓           ↓
┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐
│ Collect │ │ Quick   │ │ Deep    │ │ Report  │ │Complete │
│ Context │ │ Scan    │ │ Review  │ │ Generate│ │         │
└─────────┘ └─────────┘ └─────────┘ └─────────┘ └─────────┘
     ↓           ↓           ↓           ↓
┌─────────────────────────────────────────────────────────────────┐
│                     Review Dimensions                            │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐            │
│  │Correctness│ │Readability│ │Performance│ │ Security │            │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘            │
│  ┌──────────┐ ┌──────────┐                                       │
│  │ Testing  │ │Architecture│                                      │
│  └──────────┘ └──────────┘                                       │
└─────────────────────────────────────────────────────────────────┘
```

## Key Design Principles

1. **Multi-dimensional review**: Covers 6 dimensions — Correctness, Readability, Performance, Security, Testing, Architecture
2. **Layered execution**: Quick scan identifies high-risk areas; deep review focuses on critical issues
3. **Structured reporting**: Classified by severity, with file locations and fix recommendations
4. **State-driven**: Autonomous mode, dynamically selects next action based on review progress

## Execution Flow

```
┌─────────────────────────────────────────────────────────────────┐
│  Phase 0: Specification Study (mandatory - do not skip)           │
│  → Read: references/review-dimensions.md                         │
│  → Read: references/issue-classification.md                      │
│  → Understand review standards and issue classification          │
├─────────────────────────────────────────────────────────────────┤
│  Action: collect-context                                         │
│  → Collect target files/directories                              │
│  → Identify tech stack and languages                             │
│  → Output: state.context (files, language, framework)            │
├─────────────────────────────────────────────────────────────────┤
│  Action: quick-scan                                              │
│  → Quick scan overall structure                                  │
│  → Identify high-risk areas                                      │
│  → Output: state.risk_areas, state.scan_summary                  │
├─────────────────────────────────────────────────────────────────┤
│  Action: deep-review (per dimension)                             │
│  → Deep review per dimension                                     │
│  → Record discovered issues                                      │
│  → Output: state.findings[]                                      │
├─────────────────────────────────────────────────────────────────┤
│  Action: generate-report                                         │
│  → Aggregate all findings                                        │
│  → Generate structured report                                    │
│  → Output: review-report.md                                      │
├─────────────────────────────────────────────────────────────────┤
│  Action: complete                                                │
│  → Save final state                                              │
│  → Output review summary                                         │
└─────────────────────────────────────────────────────────────────┘
```

## Output Structure

```
.workflow/.scratchpad/code-auditor-{timestamp}/
├── state.json                    # Review state
├── context.json                  # Target context
├── findings/                     # Issue findings
│   ├── correctness.json
│   ├── readability.json
│   ├── performance.json
│   ├── security.json
│   ├── testing.json
│   └── architecture.json
└── review-report.md              # Final review report
```

## Review Dimensions

| Dimension | Focus Areas | Key Checks |
|-----------|-------------|------------|
| **Correctness** | Functional correctness | Boundary conditions, error handling, null checks |
| **Readability** | Code readability | Naming conventions, function length, comment quality |
| **Performance** | Execution efficiency | Algorithm complexity, I/O optimization, resource usage |
| **Security** | Security | Injection risks, sensitive data, access control |
| **Testing** | Test coverage | Test adequacy, boundary coverage, maintainability |
| **Architecture** | Architectural consistency | Design patterns, layering, dependency management |

## Issue Severity Levels

| Level | Prefix | Description | Action Required |
|-------|--------|-------------|-----------------|
| **Critical** | [C] | Blocking issue, must fix immediately | Must fix before merge |
| **High** | [H] | Important issue, needs fixing | Should fix |
| **Medium** | [M] | Recommended improvement | Consider fixing |
| **Low** | [L] | Optional optimization | Nice to have |
| **Info** | [I] | Informational suggestion | For reference |

## Reference Documents Catalog

- `references/workflow-guide.md`: Review workflow procedure (4 phases)
- `references/review-dimensions.md`: Review dimension specifications
- `references/issue-classification.md`: Issue classification standards
- `references/quality-standards.md`: Quality standards and thresholds
- `references/rules/`: Dimension-specific detection rules (6 JSON files)
- `references/languages/`: Language-specific review guides (9 languages)
- `references/communication-guide.md`: Team communication guide
- `assets/review-report-template.md`: Report template
- `assets/issue-template.md`: Issue template
- `assets/quick-checklist.md`: Quick review checklist
- `assets/pr-comment-template.md`: PR comment template
- `scripts/`: Automation scripts (pr-analyzer, issue-aggregator, rule-tester)
