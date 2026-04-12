# MCP → Skill Mapping Reference

## Component Mapping

| MCP Component | Skill Equivalent | Notes |
|---------------|------------------|-------|
| Server name | Skill directory name | Lowercase, hyphenated |
| Server description | `SKILL.md` frontmatter `description` | Include trigger conditions |
| **Tool** | `scripts/` executable or instruction section | See Pattern A/B/C below |
| Tool name | Script filename or section heading | e.g. `search_code` → `scripts/search_code.py` |
| Tool description | Section description in SKILL.md | Rewrite for human readability |
| Tool parameters | Script CLI args or instruction params | Preserve required/optional semantics |
| Tool inputSchema | Script argparse / section parameter list | Map JSON Schema types to CLI types |
| **Resource** | `references/` markdown file | Static data → `.md`; dynamic → script that generates |
| Resource URI template | Reference file path or script arg | `repo://{owner}/{repo}` → `--owner --repo` |
| Resource mimeType | File extension or output format | `application/json` → `.json` reference |
| **Prompt** | Instruction section in SKILL.md | Prompts become workflow guidance |
| Prompt name | Section heading | e.g. `review-code` → `## Code Review Workflow` |
| Prompt arguments | Instruction parameters | Inline in workflow steps |

## Conversion Patterns

### Pattern A: Script-Based (Complex Tools)

When the MCP tool has non-trivial logic, external dependencies, or multi-step processing.

**When to use:** API calls, data transformation, file manipulation with logic, tools needing error handling.

```
MCP Tool                          Skill Script
─────────                         ────────────
name: "search_issues"      →     scripts/search_issues.py
inputSchema: {query, repo}  →     argparse: --query, --repo
implementation: fetch+parse →     requests + json processing
```

Reference in SKILL.md:
```markdown
### Search Issues
Run the analysis script:
`python3 scripts/search_issues.py --query "bug" --repo "owner/repo"`
```

### Pattern B: Instruction-Based (Simple Tools)

When the MCP tool wraps a single command or simple operation that the AI can execute directly.

**When to use:** Shell one-liners, simple file operations, system commands, tools with no external deps.

```
MCP Tool                              Skill Instruction
─────────                             ──────────────────
name: "list_directory"          →     Section with direct command
implementation: fs.readdir()    →     "Run: ls -la <path>"
```

### Pattern C: Hybrid (Server-Dependent Tools)

When tools require the MCP server runtime and cannot be extracted as standalone scripts.

**When to use:** Tools sharing server state, database connections, WebSocket sessions, or complex initialization.

```markdown
## Setup
Start the server:
\`\`\`bash
cd /path/to/project && npm start
\`\`\`
Then invoke tools via the running MCP server connection.
```

**Decision flowchart:**
1. Can the tool run without the server? → **Pattern A or B**
2. Is the logic trivial (single command)? → **Pattern B**
3. Does it need dependencies/error handling? → **Pattern A**
4. Must it share state with other tools? → **Pattern C**

## Secrets & Environment Variables

MCP servers often require API keys or tokens. Map these to skill conventions:

| MCP Pattern | Skill Equivalent |
|-------------|------------------|
| `.env` file with `API_KEY=xxx` | `config/secrets.example.md` documenting required vars |
| Hardcoded config object | `config/` directory with example configs |
| CLI `--token` flag | Script argument, documented in Prerequisites |
| OAuth flow | Prerequisites section with setup instructions |

**Best practices:**
- Never include actual secrets in skill files
- Create `config/secrets.example.md` listing all required environment variables
- Document the minimum required scopes/permissions
- Provide a setup checklist in SKILL.md Prerequisites section

```markdown
## Prerequisites

Required environment variables:
- `GITHUB_TOKEN` — Personal access token with `repo` scope
- `OPENAI_API_KEY` — (Optional) For AI-enhanced features

Copy `config/secrets.example.md` and follow setup instructions.
```
