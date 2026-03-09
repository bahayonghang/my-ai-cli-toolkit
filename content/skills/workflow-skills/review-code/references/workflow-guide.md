# Review Workflow Guide

Phased review procedure for the 6-dimension code review system.

## Phase 1: Collect Context

1. Determine review target from `$ARGUMENTS` (default: current git changes or working directory).
2. Scan target for source files. If >200 files, prompt user to narrow scope.
3. Detect primary and secondary programming languages by file extension.
4. Load matching language guides from `$SKILL_DIR/references/languages/`.
5. Detect framework (React, Vue, Angular, Next.js, etc.) from package files if present.
6. Record context: target path, file list, languages, framework, total line count.

## Phase 2: Quick Scan

1. Scan each file for complexity indicators: line count, function count, nesting depth.
2. Flag high-risk areas (>500 lines, >20 functions, or nesting >8 levels).
3. Run quick pattern detection:
   - **Security**: `eval()`, `innerHTML`, hardcoded credentials (`password|secret|api_key|token` with literal values).
   - **Maintenance**: excessive TODO/FIXME/HACK/XXX (>5 per file).
   - **Readability**: console statements in production code (>3 per file), long functions (>2000 chars).
   - **Correctness**: empty catch blocks.
4. Calculate complexity score from risk areas and quick issues.
5. Optionally run `$SKILL_DIR/scripts/pr-analyzer.py` for PR-specific risk assessment.
6. If >20 high-risk areas found, prompt user to narrow scope before proceeding.

## Phase 3: Deep Review

Review each dimension in the order below. For each dimension, load and apply rules from `$SKILL_DIR/references/rules/{dimension}-rules.json`.

### Dimension Order and Weights

| Order | Dimension | Weight | Prefix | Focus |
|-------|-----------|--------|--------|-------|
| 1 | Correctness | 25% | CORR | Logic errors, boundary conditions, null safety, error handling |
| 2 | Security | 25% | SEC | Injection risks, authentication, data exposure, secrets |
| 3 | Performance | 15% | PERF | Algorithm complexity, memory usage, I/O patterns, caching |
| 4 | Readability | 15% | READ | Naming, function length, nesting depth, comments |
| 5 | Testing | 10% | TEST | Coverage, boundary tests, test isolation, mock usage |
| 6 | Architecture | 10% | ARCH | Layering, dependencies, coupling, single responsibility |

### Per-Dimension Procedure

1. Prioritize files flagged as high-risk in Phase 2.
2. Load dimension-specific rules from the JSON rule file.
3. For each file (cap at 50 files per dimension):
   a. Apply each rule's pattern (`regex` or `includes` match type).
   b. Exclude matches that hit any of the rule's `negativePatterns`.
   c. Record findings with ID format `{PREFIX}-{NNN}` (e.g., `SEC-001`).
4. Classify each finding by severity: Critical > High > Medium > Low > Info.
5. Provide a concrete fix recommendation and code example for every finding.
6. Apply language-specific checks from loaded language guides alongside generic rules.

### Finding ID Prefixes

| Dimension | Prefix | Example |
|-----------|--------|---------|
| Correctness | CORR | CORR-003 |
| Security | SEC | SEC-001 |
| Performance | PERF | PERF-012 |
| Readability | READ | READ-007 |
| Testing | TEST | TEST-005 |
| Architecture | ARCH | ARCH-002 |

## Phase 4: Generate Report

1. Aggregate all findings across all 6 dimensions.
2. Sort by severity (Critical first, then High, Medium, Low, Info).
3. Compute statistics: total issue count, count per severity level, count per dimension.
4. Generate structured Markdown report using template at `$SKILL_DIR/assets/review-report-template.md`.
5. Include: overview table, severity statistics, dimension breakdown, high-risk areas, detailed findings with code snippets, and actionable recommendations.
6. Present final summary to user with severity counts and top findings.

## Error Recovery

| Situation | Action |
|-----------|--------|
| Empty target (no files found) | Review current git changes; if none, prompt user for path |
| Workspace too large (>200 files) | Prompt user to narrow scope to specific directory or file list |
| Missing language guide | Apply general best practices for that language |
| File read failure | Skip file, continue review, log warning |
| Rule pattern error | Skip that rule, continue with remaining rules |
| Too many errors (>=3 consecutive) | Abort review, present partial findings collected so far |
