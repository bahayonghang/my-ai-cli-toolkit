# Issue Classification

Issue classification and severity standards.

## When to Use

| Phase | Usage | Section |
|-------|-------|---------|
| Deep Review | Determine issue severity | Severity Levels |
| Generate Report | Issue classification display | Category Mapping |

---

## Severity Levels

### Critical 🔴

**Definition**: Blocking issues that must be fixed before merge.

**Criteria**:
- Security vulnerabilities (exploitable)
- Data corruption or loss risk
- System crash risk
- Major production failure

**Examples**:
- SQL/XSS/command injection
- Hardcoded secret exposure
- Uncaught exceptions causing crashes
- Database transactions not handled correctly

**Response**: Must fix immediately; blocks merge.

---

### High 🟠

**Definition**: Important issues that should be fixed before merge.

**Criteria**:
- Functional defects
- Important boundary conditions unhandled
- Severe performance degradation
- Resource leaks

**Examples**:
- Core business logic errors
- Memory leaks
- N+1 query problems
- Missing essential error handling

**Response**: Strongly recommended to fix.

---

### Medium 🟡

**Definition**: Code quality issues worth fixing.

**Criteria**:
- Code maintainability problems
- Minor performance issues
- Insufficient test coverage
- Non-compliance with team standards

**Examples**:
- Overly long functions
- Unclear naming
- Missing comments
- Code duplication

**Response**: Fix in subsequent iterations.

---

### Low 🔵

**Definition**: Optional improvements.

**Criteria**:
- Style issues
- Minor optimizations
- Readability improvements

**Examples**:
- Variable declaration order
- Extra blank lines
- More concise alternatives available

**Response**: Address per team preference.

---

### Info ⚪

**Definition**: Informational suggestions, not issues.

**Criteria**:
- Learning opportunities
- Alternative approach suggestions
- Documentation improvement suggestions

**Examples**:
- "Consider using the new API here"
- "Adding JSDoc comments would help"
- "Could reference the xxx pattern"

**Response**: For reference only.

---

## Category Mapping

### By Dimension

| Dimension | Common Categories |
|-----------|-------------------|
| Correctness | `null-check`, `boundary`, `error-handling`, `type-safety`, `logic-error` |
| Security | `injection`, `xss`, `hardcoded-secret`, `auth`, `sensitive-data` |
| Performance | `complexity`, `n+1-query`, `memory-leak`, `blocking-io`, `inefficient-algorithm` |
| Readability | `naming`, `function-length`, `complexity`, `comments`, `duplication` |
| Testing | `coverage`, `boundary-test`, `mock-abuse`, `test-isolation` |
| Architecture | `layer-violation`, `circular-dependency`, `coupling`, `srp-violation` |

### Category Details

#### Correctness Categories

| Category | Description | Default Severity |
|----------|-------------|------------------|
| `null-check` | Missing null/undefined check | High |
| `boundary` | Unhandled boundary condition | High |
| `error-handling` | Improper error handling | High |
| `type-safety` | Type safety issue | Medium |
| `logic-error` | Logic error | Critical/High |
| `resource-leak` | Resource leak | High |

#### Security Categories

| Category | Description | Default Severity |
|----------|-------------|------------------|
| `injection` | Injection risk (SQL/Command) | Critical |
| `xss` | Cross-site scripting risk | Critical |
| `hardcoded-secret` | Hardcoded secret/credential | Critical |
| `auth` | Authentication/authorization issue | High |
| `sensitive-data` | Sensitive data exposure | High |
| `insecure-dependency` | Insecure dependency | Medium |

#### Performance Categories

| Category | Description | Default Severity |
|----------|-------------|------------------|
| `complexity` | High algorithm complexity | Medium |
| `n+1-query` | N+1 query problem | High |
| `memory-leak` | Memory leak | High |
| `blocking-io` | Blocking I/O | Medium |
| `inefficient-algorithm` | Inefficient algorithm | Medium |
| `missing-cache` | Missing cache | Low |

#### Readability Categories

| Category | Description | Default Severity |
|----------|-------------|------------------|
| `naming` | Naming issue | Medium |
| `function-length` | Function too long | Medium |
| `nesting-depth` | Excessive nesting depth | Medium |
| `comments` | Comment issue | Low |
| `duplication` | Code duplication | Medium |
| `magic-number` | Magic number | Low |

#### Testing Categories

| Category | Description | Default Severity |
|----------|-------------|------------------|
| `coverage` | Insufficient test coverage | Medium |
| `boundary-test` | Missing boundary test | Medium |
| `mock-abuse` | Excessive mock usage | Low |
| `test-isolation` | Tests not independent | Medium |
| `flaky-test` | Flaky/unstable test | High |

#### Architecture Categories

| Category | Description | Default Severity |
|----------|-------------|------------------|
| `layer-violation` | Layer violation | Medium |
| `circular-dependency` | Circular dependency | High |
| `coupling` | Tight coupling | Medium |
| `srp-violation` | Single responsibility violation | Medium |
| `god-class` | God class | High |

---

## Finding ID Format

```
{PREFIX}-{NNN}

Prefixes by Dimension:
- CORR: Correctness
- SEC:  Security
- PERF: Performance
- READ: Readability
- TEST: Testing
- ARCH: Architecture

Examples:
- SEC-001: First security finding
- CORR-015: 15th correctness finding
```

---

## Quality Gates

| Gate | Condition | Action |
|------|-----------|--------|
| **Block** | Critical > 0 | Block merge; must fix |
| **Warn** | High > 0 | Requires approval |
| **Pass** | Critical = 0, High = 0 | Allow merge |

### Recommended Thresholds

| Metric | Ideal | Acceptable | Needs Work |
|--------|-------|------------|------------|
| Critical | 0 | 0 | Any > 0 |
| High | 0 | <= 2 | > 2 |
| Medium | <= 5 | <= 10 | > 10 |
| Total | <= 10 | <= 20 | > 20 |
