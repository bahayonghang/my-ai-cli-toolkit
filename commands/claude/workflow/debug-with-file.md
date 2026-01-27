---
name: debug-with-file
description: Interactive hypothesis-driven debugging with documented exploration, understanding evolution, and Gemini-assisted correction
argument-hint: "\"bug description or error message\""
allowed-tools: TodoWrite(*), Task(*), AskUserQuestion(*), Read(*), Grep(*), Glob(*), Bash(*), Edit(*), Write(*)
---

# Workflow Debug-With-File Command (/workflow:debug-with-file)

## Overview

Enhanced evidence-based debugging with **documented exploration process**. Records understanding evolution, consolidates insights, and uses Gemini to correct misunderstandings.

**Core workflow**: Explore → Document → Log → Analyze → Correct Understanding → Fix → Verify

**Key enhancements over /workflow:debug**:
- **understanding.md**: Timeline of exploration and learning
- **Gemini-assisted correction**: Validates and corrects hypotheses
- **Consolidation**: Simplifies proven-wrong understanding to avoid clutter
- **Learning retention**: Preserves what was learned, even from failed attempts

## Usage

```bash
/workflow:debug-with-file <BUG_DESCRIPTION>

# Arguments
<bug-description>          Bug description, error message, or stack trace (required)
```

## Execution Process

```
Session Detection:
   ├─ Check if debug session exists for this bug
   ├─ EXISTS + understanding.md exists → Continue mode
   └─ NOT_FOUND → Explore mode

Explore Mode:
   ├─ Locate error source in codebase
   ├─ Document initial understanding in understanding.md
   ├─ Generate testable hypotheses with Gemini validation
   ├─ Add NDJSON logging instrumentation
   └─ Output: Hypothesis list + await user reproduction

Analyze Mode:
   ├─ Parse debug.log, validate each hypothesis
   ├─ Use Gemini to analyze evidence and correct understanding
   ├─ Update understanding.md with:
   │   ├─ New evidence
   │   ├─ Corrected misunderstandings (strikethrough + correction)
   │   └─ Consolidated current understanding
   └─ Decision:
       ├─ Confirmed → Fix root cause
       ├─ Inconclusive → Add more logging, iterate
       └─ All rejected → Gemini-assisted new hypotheses

Fix & Cleanup:
   ├─ Apply fix based on confirmed hypothesis
   ├─ User verifies
   ├─ Document final understanding + lessons learned
   ├─ Remove debug instrumentation
   └─ If not fixed → Return to Analyze mode
```

## Implementation

### Session Setup & Mode Detection

```javascript
const getUtc8ISOString = () => new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString()

const bugSlug = bug_description.toLowerCase().replace(/[^a-z0-9]+/g, '-').substring(0, 30)
const dateStr = getUtc8ISOString().substring(0, 10)

const sessionId = `DBG-${bugSlug}-${dateStr}`
const sessionFolder = `.workflow/.debug/${sessionId}`
const debugLogPath = `${sessionFolder}/debug.log`
const understandingPath = `${sessionFolder}/understanding.md`
const hypothesesPath = `${sessionFolder}/hypotheses.json`

// Auto-detect mode
const sessionExists = fs.existsSync(sessionFolder)
const hasUnderstanding = sessionExists && fs.existsSync(understandingPath)
const logHasContent = sessionExists && fs.existsSync(debugLogPath) && fs.statSync(debugLogPath).size > 0

const mode = logHasContent ? 'analyze' : (hasUnderstanding ? 'continue' : 'explore')

if (!sessionExists) {
  bash(`mkdir -p ${sessionFolder}`)
}
```

---

### Explore Mode

**Step 1.1: Locate Error Source**

```javascript
// Extract keywords from bug description
const keywords = extractErrorKeywords(bug_description)

// Search codebase for error locations
const searchResults = []
for (const keyword of keywords) {
  const results = Grep({ pattern: keyword, path: ".", output_mode: "content", "-C": 3 })
  searchResults.push({ keyword, results })
}

// Identify affected files and functions
const affectedLocations = analyzeSearchResults(searchResults)
```

**Step 1.2: Document Initial Understanding**

Create `understanding.md` with exploration timeline:

```markdown
# Understanding Document

**Session ID**: ${sessionId}
**Bug Description**: ${bug_description}
**Started**: ${getUtc8ISOString()}

---

## Exploration Timeline

### Iteration 1 - Initial Exploration (${timestamp})

#### Current Understanding

Based on bug description and initial code search:

- Error pattern: ${errorPattern}
- Affected areas: ${affectedLocations.map(l => l.file).join(', ')}
- Initial hypothesis: ${initialThoughts}

#### Evidence from Code Search

${searchResults.map(r => `
**Keyword: "${r.keyword}"**
- Found in: ${r.results.files.join(', ')}
- Key findings: ${r.insights}
`).join('\n')}

#### Next Steps

- Generate testable hypotheses
- Add instrumentation
- Await reproduction

---

## Current Consolidated Understanding

${initialConsolidatedUnderstanding}
```

**Step 1.3: Gemini-Assisted Hypothesis Generation**

```bash
ccw cli -p "
PURPOSE: Generate debugging hypotheses for: ${bug_description}
Success criteria: Testable hypotheses with clear evidence criteria

TASK:
• Analyze error pattern and code search results
• Identify 3-5 most likely root causes
• For each hypothesis, specify:
  - What might be wrong
  - What evidence would confirm/reject it
  - Where to add instrumentation
• Rank by likelihood

MODE: analysis

CONTEXT: @${sessionFolder}/understanding.md | Search results in understanding.md

EXPECTED:
- Structured hypothesis list (JSON format)
- Each hypothesis with: id, description, testable_condition, logging_point, evidence_criteria
- Likelihood ranking (1=most likely)

CONSTRAINTS: Focus on testable conditions
" --tool gemini --mode analysis --rule analysis-diagnose-bug-root-cause
```

Save Gemini output to `hypotheses.json`:

```json
{
  "iteration": 1,
  "timestamp": "2025-01-21T10:00:00+08:00",
  "hypotheses": [
    {
      "id": "H1",
      "description": "Data structure mismatch - expected key not present",
      "testable_condition": "Check if target key exists in dict",
      "logging_point": "file.py:func:42",
      "evidence_criteria": {
        "confirm": "data shows missing key",
        "reject": "key exists with valid value"
      },
      "likelihood": 1,
      "status": "pending"
    }
  ],
  "gemini_insights": "...",
  "corrected_assumptions": []
}
```

**Step 1.4: Add NDJSON Instrumentation**

For each hypothesis, add logging (same as original debug command).

**Step 1.5: Update understanding.md**

Append hypothesis section:

```markdown
#### Hypotheses Generated (Gemini-Assisted)

${hypotheses.map(h => `
**${h.id}** (Likelihood: ${h.likelihood}): ${h.description}
- Logging at: ${h.logging_point}
- Testing: ${h.testable_condition}
- Evidence to confirm: ${h.evidence_criteria.confirm}
- Evidence to reject: ${h.evidence_criteria.reject}
`).join('\n')}

**Gemini Insights**: ${geminiInsights}
```

---

### Analyze Mode

**Step 2.1: Parse Debug Log**

```javascript
// Parse NDJSON log
const entries = Read(debugLogPath).split('\n')
  .filter(l => l.trim())
  .map(l => JSON.parse(l))

// Group by hypothesis
const byHypothesis = groupBy(entries, 'hid')
```

**Step 2.2: Gemini-Assisted Evidence Analysis**

```bash
ccw cli -p "
PURPOSE: Analyze debug log evidence to validate/correct hypotheses for: ${bug_description}
Success criteria: Clear verdict per hypothesis + corrected understanding

TASK:
• Parse log entries by hypothesis
• Evaluate evidence against expected criteria
• Determine verdict: confirmed | rejected | inconclusive
• Identify incorrect assumptions from previous understanding
• Suggest corrections to understanding

MODE: analysis

CONTEXT:
@${debugLogPath}
@${understandingPath}
@${hypothesesPath}

EXPECTED:
- Per-hypothesis verdict with reasoning
- Evidence summary
- List of incorrect assumptions with corrections
- Updated consolidated understanding
- Root cause if confirmed, or next investigation steps

CONSTRAINTS: Evidence-based reasoning only, no speculation
" --tool gemini --mode analysis --rule analysis-diagnose-bug-root-cause
```

**Step 2.3: Update Understanding with Corrections**

Append new iteration to `understanding.md`:

```markdown
### Iteration ${n} - Evidence Analysis (${timestamp})

#### Log Analysis Results

${results.map(r => `
**${r.id}**: ${r.verdict.toUpperCase()}
- Evidence: ${JSON.stringify(r.evidence)}
- Reasoning: ${r.reason}
`).join('\n')}

#### Corrected Understanding

Previous misunderstandings identified and corrected:

${corrections.map(c => `
- ~~${c.wrong}~~ → ${c.corrected}
  - Why wrong: ${c.reason}
  - Evidence: ${c.evidence}
`).join('\n')}

#### New Insights

${newInsights.join('\n- ')}

#### Gemini Analysis

${geminiAnalysis}

${confirmedHypothesis ? `
#### Root Cause Identified

**${confirmedHypothesis.id}**: ${confirmedHypothesis.description}

Evidence supporting this conclusion:
${confirmedHypothesis.supportingEvidence}
` : `
#### Next Steps

${nextSteps}
`}

---

## Current Consolidated Understanding (Updated)

${consolidatedUnderstanding}
```

**Step 2.4: Consolidate Understanding**

At the bottom of `understanding.md`, update the consolidated section:

- Remove or simplify proven-wrong assumptions
- Keep them in strikethrough for reference
- Focus on current valid understanding
- Avoid repeating details from timeline

```markdown
## Current Consolidated Understanding

### What We Know

- ${validUnderstanding1}
- ${validUnderstanding2}

### What Was Disproven

- ~~Initial assumption: ${wrongAssumption}~~ (Evidence: ${disproofEvidence})

### Current Investigation Focus

${currentFocus}

### Remaining Questions

- ${openQuestion1}
- ${openQuestion2}
```

**Step 2.5: Update hypotheses.json**

```json
{
  "iteration": 2,
  "timestamp": "2025-01-21T10:15:00+08:00",
  "hypotheses": [
    {
      "id": "H1",
      "status": "rejected",
      "verdict_reason": "Evidence shows key exists with valid value",
      "evidence": {...}
    },
    {
      "id": "H2",
      "status": "confirmed",
      "verdict_reason": "Log data confirms timing issue",
      "evidence": {...}
    }
  ],
  "gemini_corrections": [
    {
      "wrong_assumption": "...",
      "corrected_to": "...",
      "reason": "..."
    }
  ]
}
```

---

### Fix & Verification

**Step 3.1: Apply Fix**

(Same as original debug command)

**Step 3.2: Document Resolution**

Append to `understanding.md`:

```markdown
### Iteration ${n} - Resolution (${timestamp})

#### Fix Applied

- Modified files: ${modifiedFiles.join(', ')}
- Fix description: ${fixDescription}
- Root cause addressed: ${rootCause}

#### Verification Results

${verificationResults}

#### Lessons Learned

What we learned from this debugging session:

1. ${lesson1}
2. ${lesson2}
3. ${lesson3}

#### Key Insights for Future

- ${insight1}
- ${insight2}
```

**Step 3.3: Cleanup**

Remove debug instrumentation (same as original command).

---

## Session Folder Structure

```
.workflow/.debug/DBG-{slug}-{date}/
├── debug.log           # NDJSON log (execution evidence)
├── understanding.md    # NEW: Exploration timeline + consolidated understanding
├── hypotheses.json     # NEW: Hypothesis history with verdicts
└── resolution.md       # Optional: Final summary
```

## Understanding Document Template

```markdown
# Understanding Document

**Session ID**: DBG-xxx-2025-01-21
**Bug Description**: [original description]
**Started**: 2025-01-21T10:00:00+08:00

---

## Exploration Timeline

### Iteration 1 - Initial Exploration (2025-01-21 10:00)

#### Current Understanding
...

#### Evidence from Code Search
...

#### Hypotheses Generated (Gemini-Assisted)
...

### Iteration 2 - Evidence Analysis (2025-01-21 10:15)

#### Log Analysis Results
...

#### Corrected Understanding
- ~~[wrong]~~ → [corrected]

#### Gemini Analysis
...

---

## Current Consolidated Understanding

### What We Know
- [valid understanding points]

### What Was Disproven
- ~~[disproven assumptions]~~

### Current Investigation Focus
[current focus]

### Remaining Questions
- [open questions]
```

## Iteration Flow

```
First Call (/workflow:debug-with-file "error"):
   ├─ No session exists → Explore mode
   ├─ Extract error keywords, search codebase
   ├─ Document initial understanding in understanding.md
   ├─ Use Gemini to generate hypotheses
   ├─ Add logging instrumentation
   └─ Await user reproduction

After Reproduction (/workflow:debug-with-file "error"):
   ├─ Session exists + debug.log has content → Analyze mode
   ├─ Parse log, use Gemini to evaluate hypotheses
   ├─ Update understanding.md with:
   │   ├─ Evidence analysis results
   │   ├─ Corrected misunderstandings (strikethrough)
   │   ├─ New insights
   │   └─ Updated consolidated understanding
   ├─ Update hypotheses.json with verdicts
   └─ Decision:
       ├─ Confirmed → Fix → Document resolution
       ├─ Inconclusive → Add logging, document next steps
       └─ All rejected → Gemini-assisted new hypotheses

Output:
   ├─ .workflow/.debug/DBG-{slug}-{date}/debug.log
   ├─ .workflow/.debug/DBG-{slug}-{date}/understanding.md (evolving document)
   └─ .workflow/.debug/DBG-{slug}-{date}/hypotheses.json (history)
```

## Gemini Integration Points

### 1. Hypothesis Generation (Explore Mode)

**Purpose**: Generate evidence-based, testable hypotheses

**Prompt Pattern**:
```
PURPOSE: Generate debugging hypotheses + evidence criteria
TASK: Analyze error + code → testable hypotheses with clear pass/fail criteria
CONTEXT: @understanding.md (search results)
EXPECTED: JSON with hypotheses, likelihood ranking, evidence criteria
```

### 2. Evidence Analysis (Analyze Mode)

**Purpose**: Validate hypotheses and correct misunderstandings

**Prompt Pattern**:
```
PURPOSE: Analyze debug log evidence + correct understanding
TASK: Evaluate each hypothesis → identify wrong assumptions → suggest corrections
CONTEXT: @debug.log @understanding.md @hypotheses.json
EXPECTED: Verdicts + corrections + updated consolidated understanding
```

### 3. New Hypothesis Generation (After All Rejected)

**Purpose**: Generate new hypotheses based on what was disproven

**Prompt Pattern**:
```
PURPOSE: Generate new hypotheses given disproven assumptions
TASK: Review rejected hypotheses → identify knowledge gaps → new investigation angles
CONTEXT: @understanding.md (with disproven section) @hypotheses.json
EXPECTED: New hypotheses avoiding previously rejected paths
```

## Error Correction Mechanism

### Correction Format in understanding.md

```markdown
#### Corrected Understanding

- ~~Assumed dict key "config" was missing~~ → Key exists, but value is None
  - Why wrong: Only checked existence, not value validity
  - Evidence: H1 log shows {"config": null, "exists": true}

- ~~Thought error occurred in initialization~~ → Error happens during runtime update
  - Why wrong: Stack trace misread as init code
  - Evidence: H2 timestamp shows 30s after startup
```

### Consolidation Rules

When updating "Current Consolidated Understanding":

1. **Simplify disproven items**: Move to "What Was Disproven" with single-line summary
2. **Keep valid insights**: Promote confirmed findings to "What We Know"
3. **Avoid duplication**: Don't repeat timeline details in consolidated section
4. **Focus on current state**: What do we know NOW, not the journey
5. **Preserve key corrections**: Keep important wrong→right transformations for learning

**Bad (cluttered)**:
```markdown
## Current Consolidated Understanding

In iteration 1 we thought X, but in iteration 2 we found Y, then in iteration 3...
Also we checked A and found B, and then we checked C...
```

**Good (consolidated)**:
```markdown
## Current Consolidated Understanding

### What We Know
- Error occurs during runtime update, not initialization
- Config value is None (not missing key)

### What Was Disproven
- ~~Initialization error~~ (Timing evidence)
- ~~Missing key hypothesis~~ (Key exists)

### Current Investigation Focus
Why is config value None during update?
```

## Post-Completion Expansion

完成后询问用户是否扩展为issue(test/enhance/refactor/doc)，选中项调用 `/issue:new "{summary} - {dimension}"`

---

## Error Handling

| Situation | Action |
|-----------|--------|
| Empty debug.log | Verify reproduction triggered the code path |
| All hypotheses rejected | Use Gemini to generate new hypotheses based on disproven assumptions |
| Fix doesn't work | Document failed fix attempt, iterate with refined understanding |
| >5 iterations | Review consolidated understanding, escalate to `/workflow:lite-fix` with full context |
| Gemini unavailable | Fallback to manual hypothesis generation, document without Gemini insights |
| Understanding too long | Consolidate aggressively, archive old iterations to separate file |

## Comparison with /workflow:debug

| Feature | /workflow:debug | /workflow:debug-with-file |
|---------|-----------------|---------------------------|
| NDJSON logging | ✅ | ✅ |
| Hypothesis generation | Manual | Gemini-assisted |
| Exploration documentation | ❌ | ✅ understanding.md |
| Understanding evolution | ❌ | ✅ Timeline + corrections |
| Error correction | ❌ | ✅ Strikethrough + reasoning |
| Consolidated learning | ❌ | ✅ Current understanding section |
| Hypothesis history | ❌ | ✅ hypotheses.json |
| Gemini validation | ❌ | ✅ At key decision points |

## Usage Recommendations

Use `/workflow:debug-with-file` when:
- Complex bugs requiring multiple investigation rounds
- Learning from debugging process is valuable
- Team needs to understand debugging rationale
- Bug might recur, documentation helps prevention

Use `/workflow:debug` when:
- Simple, quick bugs
- One-off issues
- Documentation overhead not needed
