# Explore

Fast code search agent for locating code, files, and patterns in your project.

## Overview

Explore is your rapid-response code scout. It quickly locates code, understands structure, and traces dependencies—keeping the main agent's context lean while gathering the information needed.

## When to Use

- Find specific code locations
- Search files and modules
- Understand code structure
- Trace function call chains
- Find similar implementations

**Trigger phrases**: "where is", "which file", "find", "search", "locate"

## Search Strategy

### Multi-Angle Approach

For any search task, launch searches from multiple angles simultaneously:

```
Angle 1: Filename/path search (glob)
Angle 2: Content search (grep)
Angle 3: Symbol search (LSP)
Angle 4: AST pattern search (ast-grep)
Angle 5: Git history search (git log/blame)
```

### Tool Selection Guide

| Task | Tool | Example |
|------|------|---------|
| Find files | glob | `**/*auth*` |
| Search text | grep | `grep -r "TODO"` |
| Find definition | LSP goto_definition | Jump to function |
| Find references | LSP find_references | All call sites |
| Find symbols | LSP workspace_symbols | Search class/function names |
| Pattern match | ast_grep_search | `console.log($MSG)` |
| Commit history | git log | `git log -p --all -S 'keyword'` |
| Blame | git blame | Who changed this line |

### Search Order

1. **Narrow to Wide**: Start precise, broaden if needed
2. **Structure Before Content**: Check directory layout first
3. **Definition Before Reference**: Find definition, then usage

## Search Patterns

### Pattern 1: Feature Location

"Find authentication handling code"

```bash
# 1. Directory structure
ls -la src/
tree src/auth/ 2>/dev/null || tree src/ -L 2

# 2. Filename search
find . -name "*auth*" -o -name "*login*" -o -name "*session*"

# 3. Content search
grep -r "authenticate\|authorization\|session" --include="*.ts"

# 4. LSP symbol search
lsp_workspace_symbols query="auth"
```

### Pattern 2: Function Tracing

"Find all calls to handleSubmit"

```bash
# 1. Find definition
lsp_goto_definition file="src/form.tsx" line=42

# 2. Find references
lsp_find_references file="src/form.tsx" line=42

# 3. Confirm context
grep -B5 -A10 "handleSubmit" src/
```

### Pattern 3: Pattern Search

"Find all console.log statements"

```bash
# AST precise search
ast_grep_search pattern="console.log($MSG)" lang="typescript"

# Or quick grep
grep -rn "console\.log" --include="*.ts" --include="*.tsx"
```

### Pattern 4: History Tracing

"Who added this code and when"

```bash
# File modification history
git log --oneline -20 -- path/to/file.ts

# Specific line origin
git blame -L 10,20 path/to/file.ts

# Search commits with keyword
git log -p --all -S 'keyword' --since="2024-01-01"
```

## Output Formats

### File List

```markdown
## Found Files

| File | Description |
|------|-------------|
| `src/auth/login.ts` | Login logic |
| `src/auth/session.ts` | Session management |
| `src/middleware/auth.ts` | Auth middleware |
```

### Code Location

```markdown
## Search Results

### `src/auth/login.ts:42`
```typescript
export async function handleLogin(credentials: Credentials) {
  // validation logic
}
```

### `src/api/auth.ts:15`
```typescript
import { handleLogin } from '../auth/login'
```
```

### Structure Overview

```markdown
## Project Structure

```
src/
├── auth/           # Authentication
│   ├── login.ts    # Login
│   ├── logout.ts   # Logout
│   └── session.ts  # Session
├── api/            # API routes
│   └── auth.ts     # Auth API
└── middleware/     # Middleware
    └── auth.ts     # Auth middleware
```
```

## Execution Principles

1. **Parallel Search**: Launch multiple searches simultaneously
2. **Fast Response**: Return initial results quickly
3. **Progressive Refinement**: Narrow down iteratively
4. **Actionable Results**: Return specific file paths and line numbers

## Common Commands

```bash
# Find all TypeScript files
find . -name "*.ts" -o -name "*.tsx" | head -50

# Search function definitions
grep -rn "function\s\+functionName\|const\s\+functionName" --include="*.ts"

# Search imports
grep -rn "from.*moduleName" --include="*.ts"

# Search class definitions
grep -rn "class\s\+ClassName" --include="*.ts"

# Exclude node_modules
grep -r "pattern" --exclude-dir=node_modules --exclude-dir=.git
```

## Related

- [omo-agents](/agents/omo-agents) - Multi-agent system overview
- [sisyphus](/agents/sisyphus) - Main orchestrator
- [librarian](/agents/librarian) - External documentation research
