# Quality Standards

Code review quality standards.

## When to Use

| Phase | Usage | Section |
|-------|-------|---------|
| Generate Report | Quality assessment | Quality Dimensions |
| Complete | Final scoring | Quality Gates |

---

## Quality Dimensions

### 1. Completeness - 25%

**Assesses how thoroughly the review covered the codebase.**

| Score | Criteria |
|-------|----------|
| 100% | All dimensions reviewed, all high-risk files checked |
| 80% | Core dimensions complete, main files checked |
| 60% | Partial dimensions complete |
| < 60% | Review incomplete |

**Checkpoints**:
- [ ] All 6 dimensions reviewed
- [ ] High-risk areas given focused attention
- [ ] Critical files covered

---

### 2. Accuracy - 25%

**Assesses the precision of identified issues.**

| Score | Criteria |
|-------|----------|
| 100% | Findings accurately located, correctly classified, no false positives |
| 80% | Occasional classification variance, locations accurate |
| 60% | Some false positives or missed issues |
| < 60% | Poor accuracy |

**Checkpoints**:
- [ ] Issue line numbers accurate
- [ ] Severity levels reasonable
- [ ] Classifications correct

---

### 3. Actionability - 25%

**Assesses how practical the recommendations are.**

| Score | Criteria |
|-------|----------|
| 100% | Every issue has a specific, actionable fix recommendation |
| 80% | Most issues have clear recommendations |
| 60% | Recommendations are generic |
| < 60% | Lacking actionable recommendations |

**Checkpoints**:
- [ ] Specific fix recommendations provided
- [ ] Code examples included
- [ ] Fix priorities stated

---

### 4. Consistency - 25%

**Assesses the uniformity of review standards applied.**

| Score | Criteria |
|-------|----------|
| 100% | Same issues treated consistently, uniform standards |
| 80% | Mostly consistent, occasional variance |
| 60% | Standards somewhat inconsistent |
| < 60% | Standards applied inconsistently |

**Checkpoints**:
- [ ] ID format uniform
- [ ] Severity criteria consistent
- [ ] Description style uniform

---

## Quality Gates

### Review Quality Gate

| Gate | Overall Score | Action |
|------|---------------|--------|
| **Excellent** | >= 90% | High-quality review |
| **Good** | >= 80% | Acceptable review |
| **Acceptable** | >= 70% | Minimally acceptable |
| **Needs Improvement** | < 70% | Requires improvement |

### Code Quality Gate (Based on Findings)

| Gate | Condition | Recommendation |
|------|-----------|----------------|
| **Block** | Critical > 0 | Block merge; must fix |
| **Warn** | High > 3 | Requires team discussion |
| **Caution** | Medium > 10 | Recommend improvements |
| **Pass** | Otherwise | May merge |

---

## Report Quality Checklist

### Structure

- [ ] Includes review overview
- [ ] Includes issue statistics
- [ ] Includes high-risk areas
- [ ] Includes issue details
- [ ] Includes fix recommendations

### Content

- [ ] Issue descriptions are clear
- [ ] File locations are accurate
- [ ] Code snippets are valid
- [ ] Fix recommendations are specific
- [ ] Priorities are explicit

### Format

- [ ] Markdown formatting correct
- [ ] Tables aligned
- [ ] Code block syntax correct
- [ ] Links valid
- [ ] No spelling errors

---

## Improvement Recommendations

### If Completeness is Low

- Expand file scanning scope
- Ensure all dimensions are reviewed
- Focus on high-risk areas

### If Accuracy is Low

- Improve rule precision
- Reduce false positives
- Verify line number accuracy

### If Actionability is Low

- Add fix recommendations for every issue
- Provide code examples
- Explain fix steps

### If Consistency is Low

- Standardize ID format
- Unify severity criteria
- Use templated descriptions
