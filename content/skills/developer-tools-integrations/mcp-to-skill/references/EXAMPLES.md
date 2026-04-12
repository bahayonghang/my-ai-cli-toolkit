# Conversion Examples

Real-world examples showing MCP server → Skill transformation.

## Case 1: API-Type MCP Server (GitHub MCP → Skill)

### Input: MCP Structure

```
github-mcp-server/
├── package.json          # @modelcontextprotocol/sdk dependency
├── src/
│   ├── index.ts          # Server setup, tool registration
│   └── tools/
│       ├── issues.ts     # search_issues, create_issue, list_issues
│       └── pulls.ts      # list_pulls, create_pull_request
└── .env                  # GITHUB_TOKEN
```

Key tool definition:
```typescript
server.tool("search_issues", "Search GitHub issues", {
  query: { type: "string", description: "Search query" },
  repo: { type: "string", description: "owner/repo" },
}, async ({ query, repo }) => { /* fetch GitHub API */ });
```

### Output: Skill Structure

```
github-tools/
├── SKILL.md
├── scripts/
│   ├── search_issues.py      # Pattern A: API call with error handling
│   ├── create_issue.py
│   └── list_pulls.py
├── references/
│   └── github-api.md         # API endpoints reference
└── config/
    └── secrets.example.md    # Documents GITHUB_TOKEN requirement
```

SKILL.md excerpt:
```markdown
## Prerequisites
- `GITHUB_TOKEN` environment variable set with repo access scope

## Search Issues
\`\`\`bash
python3 scripts/search_issues.py --query "memory leak" --repo "org/project"
\`\`\`
```

**Pattern used:** A (Script-based) — API calls need auth, error handling, pagination.

---

## Case 2: File-Operation MCP Server (Filesystem MCP → Skill)

### Input: MCP Structure

```
filesystem-mcp/
├── package.json
└── src/
    └── index.ts          # read_file, write_file, list_directory, search_files
```

Key tool definition:
```typescript
server.tool("search_files", "Search for files matching pattern", {
  path: { type: "string" }, pattern: { type: "string" },
}, async ({ path, pattern }) => { /* glob search */ });
```

### Output: Skill Structure

```
filesystem-tools/
├── SKILL.md              # All tools as inline instructions
└── references/
    └── common-patterns.md
```

SKILL.md excerpt:
```markdown
### Search Files
Find files matching a glob pattern:
\`\`\`bash
find <path> -name "<pattern>"
\`\`\`

### Read File
\`\`\`bash
cat <file_path>
\`\`\`
```

**Pattern used:** B (Instruction-based) — All tools are simple shell commands, no external deps.

---

## Case 3: System-Tool MCP Server (AppleScript MCP → Skill)

### Input: MCP Structure

```
applescript-mcp/
├── package.json
└── src/
    ├── index.ts              # Server setup
    └── categories/
        ├── system.ts         # volume, notifications, clipboard
        ├── finder.ts         # file operations via Finder
        └── calendar.ts       # calendar event management
```

Key tool definition:
```typescript
{
  name: "set_volume",
  description: "Set system volume level",
  // Implementation: osascript -e 'set volume output volume <level>'
}
```

### Output: Skill Structure

```
macos-automation/
├── SKILL.md                  # Grouped by category, instruction-based
├── scripts/
│   └── calendar_event.py     # Complex: needs date parsing, validation
└── references/
    └── applescript-patterns.md
```

SKILL.md excerpt:
```markdown
## System Controls

### Set Volume
\`\`\`bash
osascript -e 'set volume output volume <0-100>'
\`\`\`

### Send Notification
\`\`\`bash
osascript -e 'display notification "<message>" with title "<title>"'
\`\`\`

## Calendar (Script-based)
Complex operations use the helper script:
\`\`\`bash
python3 scripts/calendar_event.py --title "Meeting" --date "2024-01-15" --time "14:00"
\`\`\`
```

**Pattern used:** Mixed A+B — Simple system commands use Pattern B; complex calendar logic uses Pattern A.

---

## Pattern Selection Summary

| MCP Server Type | Typical Pattern | Rationale |
|----------------|-----------------|-----------|
| API wrappers (GitHub, Slack) | A (Script) | Auth, pagination, error handling |
| File/system utilities | B (Instruction) | Simple commands, no deps |
| Database/stateful services | C (Hybrid) | Shared connections, server state |
| Mixed complexity | A+B combined | Per-tool decision |
