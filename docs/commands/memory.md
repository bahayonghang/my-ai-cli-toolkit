# Memory System Commands

> Historical / offline note: this page documents a removed command family. The matching source tree is not present in current `content/platforms/*/commands/`, and this page is intentionally kept outside the live sidebar.


Commands for managing project memory, documentation generation, session recovery, and skill packages. These commands handle context loading, memory compaction, and automated documentation workflows.

## Commands

### Documentation Generation

#### `docs`

Plan documentation workflow with dynamic grouping, generates IMPL tasks for parallel module documentation.

```bash
/memory:docs [path] [--tool <gemini|qwen|codex>] [--mode <full|partial>] [--cli-execute]
```

Analyzes project structure, decomposes documentation work into tasks (max 10 docs/task), and generates execution plans. Supports agent mode (default) and CLI mode. Output mirrors source structure under `.workflow/docs/{project_name}/`.

#### `docs-full-cli`

Generate full project documentation using CLI execution with batched agents and tool fallback.

```bash
/memory:docs-full-cli [path] [--tool <gemini|qwen|codex>]
```

Orchestrates project-wide documentation using a 3-layer architecture (bottom-up: Layer 3 to 1). Uses direct parallel execution for <20 modules, agent batch processing (4 modules/agent) for larger projects. Includes gemini/qwen/codex fallback chain.

#### `docs-related-cli`

Generate or update documentation for git-changed modules only.

```bash
/memory:docs-related-cli [--tool <gemini|qwen|codex>]
```

Context-aware incremental documentation. Detects changed modules via git diff, uses `single` strategy for focused updates. Direct parallel for <15 modules, agent batches for larger sets. Ideal for daily development workflows.

### Memory Loading

#### `load`

Analyze project via Gemini/Qwen CLI and return a JSON core content package for task context.

```bash
/memory:load [--tool gemini|qwen] "task context description"
```

Delegates to a universal-executor agent that analyzes project structure, discovers relevant files, and returns a structured content package (architecture, tech stack, relevant files, integration points, constraints). Read-only, token-efficient.

#### `load-skill-memory`

Activate a SKILL package and intelligently load documentation based on task intent.

```bash
/memory:load-skill-memory [skill_name] "task intent description"
```

Auto-detects skill from task description or file paths, or accepts manual specification. Loads documentation at the appropriate depth based on intent keywords (quick overview ~2K tokens to comprehensive ~40K tokens).

### Memory Management

#### `compact`

Compact session memory into structured text for session recovery via MCP core_memory.

```bash
/memory:compact [session description]
```

Extracts objective, execution plan, working/reference files, decisions, constraints, and state from the current session. Saves to persistent storage and returns a Recovery ID for future session restoration.

#### `update-full`

Update all CLAUDE.md files using layer-based execution with batched agents.

```bash
/memory:update-full [--tool gemini|qwen|codex] [--path <directory>]
```

Full project CLAUDE.md regeneration using Layer 3 to 1 bottom-up processing. Direct parallel for <20 modules, agent batches for larger projects. Uses gemini/qwen/codex fallback.

#### `update-related`

Update CLAUDE.md for git-changed modules only.

```bash
/memory:update-related [--tool gemini|qwen|codex]
```

Incremental CLAUDE.md updates based on git changes. Direct execution for <15 modules, agent batches otherwise.

### SKILL Package Generation

#### `code-map-memory`

Generate Mermaid-based code flow documentation and SKILL package for a feature.

```bash
/memory:code-map-memory "feature-keyword" [--regenerate] [--tool <gemini|qwen>]
```

3-phase orchestrator: parses feature keyword, delegates deep code analysis to cli-explore-agent (dual-source: Bash + Gemini), then generates 5 Mermaid documentation files (architecture, function calls, data flow, conditional paths, complete flow) plus a SKILL.md index with progressive loading levels.

#### `skill-memory`

Generate a complete SKILL package with progressive loading from project documentation.

```bash
/memory:skill-memory [path] [--tool <gemini|qwen|codex>] [--regenerate] [--mode <full|partial>] [--cli-execute]
```

4-phase autonomous orchestrator: check docs, plan via `/memory:docs`, execute via `/workflow:execute`, then generate SKILL.md with progressive loading index. Skips phases 2-3 if documentation already exists.

#### `style-skill-memory`

Generate a SKILL memory package from a style reference for consistent design system usage.

```bash
/memory:style-skill-memory [package-name] [--regenerate]
```

#### `workflow-skill-memory`

Process archived workflow sessions to generate a workflow-progress SKILL package.

```bash
/memory:workflow-skill-memory session <session-id> | all
```

Processes WFS-* archived sessions using universal-executor agents with Gemini analysis. Generates sessions-timeline, lessons learned, and conflict documentation.

### Specialized

#### `swagger-docs`

Generate complete Swagger/OpenAPI documentation following RESTful standards.

```bash
/memory:swagger-docs [path] [--tool <gemini|qwen|codex>] [--format <yaml|json>] [--version <v3.0|v3.1>] [--lang <zh|en>]
```

Produces global security definitions, API endpoint details, error codes, and validation tests.

#### `tech-research-rules`

Extract tech stack, research via Exa, and generate path-conditional rules auto-loaded by Claude Code.

```bash
/memory:tech-research-rules [session-id | tech-stack-name] [--regenerate] [--tool <gemini|qwen>]
```

3-phase orchestrator: extract tech stack from project, research best practices via Exa, then generate path-conditional rules that Claude Code auto-loads based on file context.

## Examples

```bash
# Load project context for a new feature
/memory:load "develop user authentication on current frontend"

# Generate full project documentation
/memory:docs-full-cli

# Update docs for recently changed modules
/memory:docs-related-cli --tool qwen

# Compact session for later recovery
/memory:compact "completed auth module implementation"

# Generate code flow map for a feature
/memory:code-map-memory "payment processing"

# Load skill memory with intent
/memory:load-skill-memory my_project "modify auth module to add OAuth"
```

## Notes

- Documentation commands output to `.workflow/docs/{project_name}/` mirroring source structure.
- Tool fallback order: gemini -> qwen -> codex (configurable via `--tool`).
- Memory loading is session-scoped; new sessions require re-execution.
- SKILL packages are stored under `.claude/skills/` with progressive loading levels (0-3).
