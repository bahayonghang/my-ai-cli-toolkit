# Issue Template

Use this template for individual findings, but localize the human-facing labels to the output language.

- Chinese mode: use labels such as `严重程度` / `描述` / `建议` and map severities to `[必须修复] / [建议修改] / [仅供参考] / [问题]`.
- English mode: use labels such as `Severity` / `Description` / `Recommendation` and map severities to `Must Fix / Should Fix / Nice to Have / Question`.

## Single Issue Template

```markdown
#### {{severity_emoji}} [{{id}}] {{category}}

- **Severity**: {{severity}}
- **Dimension**: {{dimension}}
- **File**: `{{file}}`{{#if line}}:{{line}}{{/if}}
- **Description**: {{description}}

{{#if code_snippet}}
**Relevant Code**:
```{{language}}
{{code_snippet}}
```
{{/if}}

**Recommendation**: {{recommendation}}

{{#if fix_example}}
**Fix Example**:
```{{language}}
{{fix_example}}
```
{{/if}}

{{#if references}}
**References**:
{{#each references}}
- {{this}}
{{/each}}
{{/if}}
```

## Issue Object Schema

```typescript
interface Issue {
  id: string;
  severity: 'critical' | 'high' | 'medium' | 'low' | 'info';
  dimension: string;
  category: string;
  file: string;
  line?: number;
  column?: number;
  language?: string;
  code_snippet?: string;
  description: string;
  recommendation: string;
  fix_example?: string;
  references?: string[];
}
```

## ID Generation

```javascript
function generateIssueId(dimension, counter) {
  const prefixes = {
    correctness: 'CORR',
    readability: 'READ',
    performance: 'PERF',
    security: 'SEC',
    testing: 'TEST',
    architecture: 'ARCH'
  };

  const prefix = prefixes[dimension] || 'MISC';
  const number = String(counter).padStart(3, '0');

  return `${prefix}-${number}`;
}
```

## Severity Emojis

```javascript
const SEVERITY_EMOJI = {
  critical: '🔴',
  high: '🟠',
  medium: '🟡',
  low: '🔵',
  info: '⚪'
};
```
