# Gemini CLI Integration Patterns

Advanced patterns for orchestrating Gemini CLI effectively from Claude Code.

## Shared Model Convention

Assume the primary and fast model variables are set once per shell session.

```bash
GEMINI_MODEL="${GEMINI_MODEL:-gemini-3.1-pro-preview}"
GEMINI_FAST_MODEL="${GEMINI_FAST_MODEL:-gemini-3.1-flash-preview}"
```

```powershell
if (-not $env:GEMINI_MODEL) { $env:GEMINI_MODEL = "gemini-3.1-pro-preview" }
if (-not $env:GEMINI_FAST_MODEL) { $env:GEMINI_FAST_MODEL = "gemini-3.1-flash-preview" }
```

If preview access is unavailable, switch `GEMINI_MODEL` to `gemini-2.5-pro` or `auto`.

## Pattern 1: Generate-Review-Fix Cycle

The most reliable pattern for quality code generation.

```bash
GEMINI_MODEL="${GEMINI_MODEL:-gemini-3.1-pro-preview}"

# Step 1: Generate code
gemini "Create [code description]" -m "$GEMINI_MODEL" --approval-mode yolo -o text

# Step 2: Have Gemini review its own work
gemini "Review [generated file] for bugs and security issues" -m "$GEMINI_MODEL" -o text

# Step 3: Fix identified issues
gemini "Fix these issues in [file]: [list from review]. Apply now." -m "$GEMINI_MODEL" --approval-mode yolo -o text
```

### Why It Works
- Different "mindset" for generation vs review
- Self-correction catches common mistakes
- Security vulnerabilities often caught in review phase

### Example
```bash
GEMINI_MODEL="${GEMINI_MODEL:-gemini-3.1-pro-preview}"

# Generate
gemini "Create a user authentication module with bcrypt and JWT" -m "$GEMINI_MODEL" --approval-mode yolo -o text

# Review
gemini "Review auth.js for security vulnerabilities" -m "$GEMINI_MODEL" -o text
# Output: "Found XSS risk, missing input validation, weak JWT secret"

# Fix
gemini "Fix in auth.js: XSS risk, add input validation, use env var for JWT secret. Apply now." -m "$GEMINI_MODEL" --approval-mode yolo -o text
```

## Pattern 2: JSON Output for Programmatic Processing

Use JSON output when you need to process results programmatically.

```bash
GEMINI_MODEL="${GEMINI_MODEL:-gemini-3.1-pro-preview}"
gemini "[prompt]" -m "$GEMINI_MODEL" -o json 2>&1
```

### Parsing the Response

```javascript
// In Node.js or with jq
const result = JSON.parse(output);
const content = result.response;
const [modelName] = Object.keys(result.stats.models);
const tokenUsage = result.stats.models[modelName].tokens.total;
const toolCalls = result.stats.tools.byName;
```

### Use Cases
- Extracting specific data from responses
- Monitoring token usage
- Tracking tool call success/failure
- Building automation pipelines

## Pattern 3: Background Execution

For long-running tasks, execute in background and continue working.

```bash
# Bash / zsh
GEMINI_MODEL="${GEMINI_MODEL:-gemini-3.1-pro-preview}"
gemini "[long task]" -m "$GEMINI_MODEL" --approval-mode yolo -o text > gemini.log 2>&1 &
echo $!
```

```powershell
# PowerShell
if (-not $env:GEMINI_MODEL) { $env:GEMINI_MODEL = "gemini-3.1-pro-preview" }
Start-Process gemini -ArgumentList @("[long task]", "-m", $env:GEMINI_MODEL, "--approval-mode", "yolo", "-o", "text") -RedirectStandardOutput "gemini.log" -RedirectStandardError "gemini.err"
```

### When to Use
- Code generation for large projects
- Documentation generation
- Running multiple Gemini tasks in parallel

### Parallel Execution
```bash
GEMINI_MODEL="${GEMINI_MODEL:-gemini-3.1-pro-preview}"

# Run multiple tasks simultaneously
gemini "Create frontend" -m "$GEMINI_MODEL" --approval-mode yolo -o text > frontend.log 2>&1 &
gemini "Create backend" -m "$GEMINI_MODEL" --approval-mode yolo -o text > backend.log 2>&1 &
gemini "Create tests" -m "$GEMINI_MODEL" --approval-mode yolo -o text > tests.log 2>&1 &
```

## Pattern 4: Model Selection Strategy

Choose the right model for the task.

### Decision Tree

```
Is the task complex (architecture, multi-file, deep analysis)?
├── Yes -> Use $GEMINI_MODEL (default: gemini-3.1-pro-preview)
└── No → Is speed critical?
    ├── Yes -> Use $GEMINI_FAST_MODEL (default: gemini-3.1-flash-preview)
    └── No -> Use $GEMINI_MODEL, or fallback to auto if preview access is unavailable
```

### Examples
```bash
GEMINI_MODEL="${GEMINI_MODEL:-gemini-3.1-pro-preview}"
GEMINI_FAST_MODEL="${GEMINI_FAST_MODEL:-gemini-3.1-flash-preview}"

# Complex: Architecture analysis
gemini "Analyze codebase architecture" -m "$GEMINI_MODEL" -o text

# Quick: Simple formatting
gemini "Format this JSON" -m "$GEMINI_FAST_MODEL" -o text

# Compatibility fallback if 3.1 preview is unavailable
gemini "Refactor this module" -m "$GEMINI_MODEL" -o text
```

## Pattern 5: Rate Limit Handling

Strategies for working within rate limits.

### Approach 1: Let Auto-Retry Handle It
Default behavior - CLI retries automatically with backoff.

### Approach 2: Use Flash for Lower Priority
```bash
GEMINI_MODEL="${GEMINI_MODEL:-gemini-3.1-pro-preview}"
GEMINI_FAST_MODEL="${GEMINI_FAST_MODEL:-gemini-3.1-flash-preview}"

# High priority: Use the primary model
gemini "[important task]" -m "$GEMINI_MODEL" --approval-mode yolo -o text

# Lower priority: Use the fast model
gemini "[less critical task]" -m "$GEMINI_FAST_MODEL" -o text
```

### Approach 3: Batch Operations
Combine related operations into single prompts:
```bash
GEMINI_MODEL="${GEMINI_MODEL:-gemini-3.1-pro-preview}"

# Instead of multiple calls:
gemini "Create file A" -m "$GEMINI_MODEL" --approval-mode yolo
gemini "Create file B" -m "$GEMINI_MODEL" --approval-mode yolo
gemini "Create file C" -m "$GEMINI_MODEL" --approval-mode yolo

# Single call:
gemini "Create files A, B, and C with [specs]. Create all now." -m "$GEMINI_MODEL" --approval-mode yolo
```

### Approach 4: Sequential with Delays
For automated scripts, add delays:
```bash
GEMINI_MODEL="${GEMINI_MODEL:-gemini-3.1-pro-preview}"
gemini "[task 1]" -m "$GEMINI_MODEL" --approval-mode yolo -o text
sleep 2
gemini "[task 2]" -m "$GEMINI_MODEL" --approval-mode yolo -o text
```

```powershell
if (-not $env:GEMINI_MODEL) { $env:GEMINI_MODEL = "gemini-3.1-pro-preview" }
gemini "[task 1]" -m $env:GEMINI_MODEL --approval-mode yolo -o text
Start-Sleep -Seconds 2
gemini "[task 2]" -m $env:GEMINI_MODEL --approval-mode yolo -o text
```

## Pattern 6: Context Enrichment

Provide rich context for better results.

### Using File References
```bash
GEMINI_MODEL="${GEMINI_MODEL:-gemini-3.1-pro-preview}"
gemini "Based on @./package.json and @./src/index.js, suggest improvements" -m "$GEMINI_MODEL" -o text
```

### Using GEMINI.md
Create project context that's automatically included:
```markdown
# .gemini/GEMINI.md

## Project Overview
This is a React app using TypeScript.

## Coding Standards
- Use functional components
- Prefer hooks over classes
- All functions need JSDoc
```

### Explicit Context in Prompt
```bash
GEMINI_MODEL="${GEMINI_MODEL:-gemini-3.1-pro-preview}"
gemini "Given this context:
- Project uses React 18 with TypeScript
- State management: Zustand
- Styling: Tailwind CSS

Create a user profile component." -m "$GEMINI_MODEL" --approval-mode yolo -o text
```

## Pattern 7: Validation Pipeline

Always validate Gemini's output before using.

### Validation Steps

1. **Syntax Check**
   ```bash
   # For JavaScript
   node --check generated.js

   # For TypeScript
   tsc --noEmit generated.ts
   ```

2. **Security Scan**
   - Check for innerHTML with user input (XSS)
   - Look for eval() or Function() calls
   - Verify input validation

3. **Functional Test**
   - Run any generated tests
   - Manual smoke test

4. **Style Check**
   ```bash
   eslint generated.js
   prettier --check generated.js
   ```

### Automated Validation Pattern
```bash
# Generate
GEMINI_MODEL="${GEMINI_MODEL:-gemini-3.1-pro-preview}"
gemini "Create utility functions" -m "$GEMINI_MODEL" --approval-mode yolo -o text

# Validate
node --check utils.js && eslint utils.js && npm test
```

## Pattern 8: Incremental Refinement

Build complex outputs in stages.

```bash
GEMINI_MODEL="${GEMINI_MODEL:-gemini-3.1-pro-preview}"

# Stage 1: Core structure
gemini "Create basic Express server with routes for /api/users" -m "$GEMINI_MODEL" --approval-mode yolo -o text

# Stage 2: Add feature
gemini "Add authentication middleware to the Express server in server.js" -m "$GEMINI_MODEL" --approval-mode yolo -o text

# Stage 3: Add another feature
gemini "Add rate limiting to the Express server in server.js" -m "$GEMINI_MODEL" --approval-mode yolo -o text

# Stage 4: Review all
gemini "Review server.js for issues and optimize" -m "$GEMINI_MODEL" -o text
```

### Benefits
- Easier to debug issues
- Each stage validates before continuing
- Clear audit trail

## Pattern 9: Cross-Validation with Claude

Use both AIs for highest quality.

### Claude Generates, Gemini Reviews
```bash
# 1. Claude writes code (using normal Claude Code tools)
# 2. Gemini reviews
GEMINI_MODEL="${GEMINI_MODEL:-gemini-3.1-pro-preview}"
gemini "Review this code for bugs and security issues: [paste code]" -m "$GEMINI_MODEL" -o text
```

### Gemini Generates, Claude Reviews
```bash
# 1. Gemini generates
GEMINI_MODEL="${GEMINI_MODEL:-gemini-3.1-pro-preview}"
gemini "Create [code]" -m "$GEMINI_MODEL" --approval-mode yolo -o text

# 2. Claude reviews the output (in conversation)
# "Review this code that Gemini generated..."
```

### Different Perspectives
- Claude: Strong on reasoning, following complex instructions
- Gemini: Strong on current web knowledge, codebase investigation

## Pattern 10: Session Continuity

Use sessions for multi-turn workflows.

```bash
# Initial task
GEMINI_MODEL="${GEMINI_MODEL:-gemini-3.1-pro-preview}"
gemini "Analyze this codebase architecture" -m "$GEMINI_MODEL" -o text
# Session saved automatically

# List sessions
gemini --list-sessions

# Continue with follow-up
echo "What patterns did you find?" | gemini -r 1 -o text

# Further refinement
echo "Focus on the authentication flow" | gemini -r 1 -o text
```

### Use Cases
- Iterative analysis
- Building on previous context
- Debugging sessions

## Anti-Patterns to Avoid

### Don't: Expect Immediate Execution
`--approval-mode yolo` doesn't prevent planning. Gemini may still present plans.

**Do**: Use forceful language ("Apply now", "Start immediately")

### Don't: Ignore Rate Limits
Hammering the API wastes time on retries.

**Do**: Use appropriate models, batch operations

### Don't: Trust Output Blindly
Gemini can make mistakes, especially with security.

**Do**: Always validate generated code

### Don't: Over-Specify in Single Prompt
Extremely long prompts can confuse the model.

**Do**: Use incremental refinement for complex tasks

### Don't: Forget Context Limits
Even with 1M tokens, context can overflow.

**Do**: Use .geminiignore, be specific about files
