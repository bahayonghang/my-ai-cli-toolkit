# Review Report Template

Use this template as a structure reference. Localize headings, summaries, and severity labels to the user's language instead of copying the wording literally.

- In Chinese mode, prefer `[必须修复] / [建议修改] / [仅供参考] / [问题]`.
- In English mode, prefer `Must Fix / Should Fix / Nice to Have / Question`.
- Findings come before the closing summary.

## Template Structure

```markdown
# Code Review Report

## Review Overview

| Field | Value |
|------|------|
| Target Path | `{{target_path}}` |
| File Count | {{file_count}} |
| Total Lines | {{total_lines}} |
| Primary Language | {{language}} |
| Framework | {{framework}} |
| Review Duration | {{review_duration}} |

## Issue Summary

| Severity | Count |
|----------|------|
| 🔴 Critical | {{critical_count}} |
| 🟠 High | {{high_count}} |
| 🟡 Medium | {{medium_count}} |
| 🔵 Low | {{low_count}} |
| ⚪ Info | {{info_count}} |
| **Total** | **{{total_issues}}** |

### Dimension Breakdown

| Dimension | Count |
|------|--------|
| Correctness | {{correctness_count}} |
| Security | {{security_count}} |
| Performance | {{performance_count}} |
| Readability | {{readability_count}} |
| Testing | {{testing_count}} |
| Architecture | {{architecture_count}} |

---

## High-Risk Areas

{{#if risk_areas}}
| File | Why It Is Risky | Priority |
|------|------|--------|
{{#each risk_areas}}
| `{{this.file}}` | {{this.reason}} | {{this.priority}} |
{{/each}}
{{else}}
No obvious high-risk areas were identified.
{{/if}}

---

## Findings

{{#each dimensions}}
### {{this.name}}

{{#each this.findings}}
#### {{severity_emoji this.severity}} [{{this.id}}] {{this.category}}

- **Severity**: {{this.severity}}
- **File**: `{{this.file}}`{{#if this.line}}:{{this.line}}{{/if}}
- **Description**: {{this.description}}

{{#if this.code_snippet}}
```{{this.language}}
{{this.code_snippet}}
```
{{/if}}

**Recommendation**: {{this.recommendation}}

{{#if this.fix_example}}
**Fix Example**:
```{{this.language}}
{{this.fix_example}}
```
{{/if}}

---

{{/each}}
{{/each}}

## Closing Summary

### Must Fix

{{must_fix_summary}}

### Should Fix

{{should_fix_summary}}

### Nice to Have

{{nice_to_have_summary}}

---

*Generated At: {{generated_at}}*
```

## Variable Definitions

| Variable | Type | Source |
|----------|------|--------|
| `{{target_path}}` | string | state.context.target_path |
| `{{file_count}}` | number | state.context.file_count |
| `{{total_lines}}` | number | state.context.total_lines |
| `{{language}}` | string | state.context.language |
| `{{framework}}` | string | state.context.framework |
| `{{review_duration}}` | string | Formatted duration |
| `{{critical_count}}` | number | Count of critical findings |
| `{{high_count}}` | number | Count of high findings |
| `{{medium_count}}` | number | Count of medium findings |
| `{{low_count}}` | number | Count of low findings |
| `{{info_count}}` | number | Count of info findings |
| `{{total_issues}}` | number | Total findings |
| `{{risk_areas}}` | array | state.scan_summary.risk_areas |
| `{{dimensions}}` | array | Grouped findings by dimension |
| `{{generated_at}}` | string | ISO timestamp |

## Helper Functions

```javascript
function severity_emoji(severity) {
  const emojis = {
    critical: '🔴',
    high: '🟠',
    medium: '🟡',
    low: '🔵',
    info: '⚪'
  };
  return emojis[severity] || '⚪';
}

function formatDuration(ms) {
  const minutes = Math.floor(ms / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);
  return `${minutes}m ${seconds}s`;
}
```

## Usage Example

```javascript
const report = generateReport({
  context: state.context,
  summary: state.summary,
  findings: state.findings,
  scanSummary: state.scan_summary
});

Write(`${workDir}/review-report.md`, report);
```
