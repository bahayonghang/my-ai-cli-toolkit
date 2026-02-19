---
name: debug
description: Interactive hypothesis-driven debugging with NDJSON logging, iterative until resolved
argument-hint: "\"bug description or error message\""
allowed-tools: TodoWrite(*), Task(*), AskUserQuestion(*), Read(*), Grep(*), Glob(*), Bash(*), Edit(*), Write(*)
---

# Workflow Debug Command (/workflow:debug)

## Overview

Evidence-based interactive debugging command. Systematically identifies root causes through hypothesis-driven logging and iterative verification.

**Core workflow**: Explore → Add Logging → Reproduce → Analyze Log → Fix → Verify

## Usage

```bash
/workflow:debug <BUG_DESCRIPTION>

# Arguments
<bug-description>          Bug description, error message, or stack trace (required)
```

## Execution Process

```
Session Detection:
   ├─ Check if debug session exists for this bug
   ├─ EXISTS + debug.log has content → Analyze mode
   └─ NOT_FOUND or empty log → Explore mode

Explore Mode:
   ├─ Locate error source in codebase
   ├─ Generate testable hypotheses (dynamic count)
   ├─ Add NDJSON logging instrumentation
   └─ Output: Hypothesis list + await user reproduction

Analyze Mode:
   ├─ Parse debug.log, validate each hypothesis
   └─ Decision:
       ├─ Confirmed → Fix root cause
       ├─ Inconclusive → Add more logging, iterate
       └─ All rejected → Generate new hypotheses

Fix & Cleanup:
   ├─ Apply fix based on confirmed hypothesis
   ├─ User verifies
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

// Auto-detect mode
const sessionExists = fs.existsSync(sessionFolder)
const logHasContent = sessionExists && fs.existsSync(debugLogPath) && fs.statSync(debugLogPath).size > 0

const mode = logHasContent ? 'analyze' : 'explore'

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
// e.g., ['Stack Length', '未找到', 'registered 0']

// Search codebase for error locations
for (const keyword of keywords) {
  Grep({ pattern: keyword, path: ".", output_mode: "content", "-C": 3 })
}

// Identify affected files and functions
const affectedLocations = [...]  // from search results
```

**Step 1.2: Generate Hypotheses (Dynamic)**

```javascript
// Hypothesis categories based on error pattern
const HYPOTHESIS_PATTERNS = {
  "not found|missing|undefined|未找到": "data_mismatch",
  "0|empty|zero|registered 0": "logic_error",
  "timeout|connection|sync": "integration_issue",
  "type|format|parse": "type_mismatch"
}

// Generate hypotheses based on actual issue (NOT fixed count)
function generateHypotheses(bugDescription, affectedLocations) {
  const hypotheses = []

  // Analyze bug and create targeted hypotheses
  // Each hypothesis has:
  // - id: H1, H2, ... (dynamic count)
  // - description: What might be wrong
  // - testable_condition: What to log
  // - logging_point: Where to add instrumentation

  return hypotheses  // Could be 1, 3, 5, or more
}

const hypotheses = generateHypotheses(bug_description, affectedLocations)
```

**Step 1.3: Add NDJSON Instrumentation**

For each hypothesis, add logging at the relevant location:

**Python template**:
```python
# region debug [H{n}]
try:
    import json, time
    _dbg = {
        "sid": "{sessionId}",
        "hid": "H{n}",
        "loc": "{file}:{line}",
        "msg": "{testable_condition}",
        "data": {
            # Capture relevant values here
        },
        "ts": int(time.time() * 1000)
    }
    with open(r"{debugLogPath}", "a", encoding="utf-8") as _f:
        _f.write(json.dumps(_dbg, ensure_ascii=False) + "\n")
except: pass
# endregion
```

**JavaScript/TypeScript template**:
```javascript
// region debug [H{n}]
try {
  require('fs').appendFileSync("{debugLogPath}", JSON.stringify({
    sid: "{sessionId}",
    hid: "H{n}",
    loc: "{file}:{line}",
    msg: "{testable_condition}",
    data: { /* Capture relevant values */ },
    ts: Date.now()
  }) + "\n");
} catch(_) {}
// endregion
```

**Output to user**:
```
## Hypotheses Generated

Based on error "{bug_description}", generated {n} hypotheses:

{hypotheses.map(h => `
### ${h.id}: ${h.description}
- Logging at: ${h.logging_point}
- Testing: ${h.testable_condition}
`).join('')}

**Debug log**: ${debugLogPath}

**Next**: Run reproduction steps, then come back for analysis.
```

---

### Analyze Mode

```javascript
// Parse NDJSON log
const entries = Read(debugLogPath).split('\n')
  .filter(l => l.trim())
  .map(l => JSON.parse(l))

// Group by hypothesis
const byHypothesis = groupBy(entries, 'hid')

// Validate each hypothesis
for (const [hid, logs] of Object.entries(byHypothesis)) {
  const hypothesis = hypotheses.find(h => h.id === hid)
  const latestLog = logs[logs.length - 1]

  // Check if evidence confirms or rejects hypothesis
  const verdict = evaluateEvidence(hypothesis, latestLog.data)
  // Returns: 'confirmed' | 'rejected' | 'inconclusive'
}
```

**Output**:
```
## Evidence Analysis

Analyzed ${entries.length} log entries.

${results.map(r => `
### ${r.id}: ${r.description}
- **Status**: ${r.verdict}
- **Evidence**: ${JSON.stringify(r.evidence)}
- **Reason**: ${r.reason}
`).join('')}

${confirmedHypothesis ? `
## Root Cause Identified

**${confirmedHypothesis.id}**: ${confirmedHypothesis.description}

Ready to fix.
` : `
## Need More Evidence

Add more logging or refine hypotheses.
`}
```

---

### Fix & Cleanup

```javascript
// Apply fix based on confirmed hypothesis
// ... Edit affected files

// After user verifies fix works:

// Remove debug instrumentation (search for region markers)
const instrumentedFiles = Grep({
  pattern: "# region debug|// region debug",
  output_mode: "files_with_matches"
})

for (const file of instrumentedFiles) {
  // Remove content between region markers
  removeDebugRegions(file)
}

console.log(`
## Debug Complete

- Root cause: ${confirmedHypothesis.description}
- Fix applied to: ${modifiedFiles.join(', ')}
- Debug instrumentation removed
`)
```

---

## Debug Log Format (NDJSON)

Each line is a JSON object:

```json
{"sid":"DBG-xxx-2025-12-18","hid":"H1","loc":"file.py:func:42","msg":"Check dict keys","data":{"keys":["a","b"],"target":"c","found":false},"ts":1734567890123}
```

| Field | Description |
|-------|-------------|
| `sid` | Session ID |
| `hid` | Hypothesis ID (H1, H2, ...) |
| `loc` | Code location |
| `msg` | What's being tested |
| `data` | Captured values |
| `ts` | Timestamp (ms) |

## Session Folder

```
.workflow/.debug/DBG-{slug}-{date}/
├── debug.log          # NDJSON log (main artifact)
└── resolution.md      # Summary after fix (optional)
```

## Iteration Flow

```
First Call (/workflow:debug "error"):
   ├─ No session exists → Explore mode
   ├─ Extract error keywords, search codebase
   ├─ Generate hypotheses, add logging
   └─ Await user reproduction

After Reproduction (/workflow:debug "error"):
   ├─ Session exists + debug.log has content → Analyze mode
   ├─ Parse log, evaluate hypotheses
   └─ Decision:
       ├─ Confirmed → Fix → User verify
       │   ├─ Fixed → Cleanup → Done
       │   └─ Not fixed → Add logging → Iterate
       ├─ Inconclusive → Add logging → Iterate
       └─ All rejected → New hypotheses → Iterate

Output:
   └─ .workflow/.debug/DBG-{slug}-{date}/debug.log
```

## Post-Completion Expansion

完成后询问用户是否扩展为issue(test/enhance/refactor/doc)，选中项调用 `/issue:new "{summary} - {dimension}"`

---

## Error Handling

| Situation | Action |
|-----------|--------|
| Empty debug.log | Verify reproduction triggered the code path |
| All hypotheses rejected | Generate new hypotheses with broader scope |
| Fix doesn't work | Iterate with more granular logging |
| >5 iterations | Escalate to `/workflow:lite-fix` with evidence |
