# Workflow Commands

> Historical / offline note: this page documents a removed command family. The matching source tree is not present in current `content/platforms/*/commands/`, and this page is intentionally kept outside the live sidebar.


The `workflow` family is the largest command group, providing a structured development lifecycle from project initialization through planning, execution, debugging, testing, review, and cleanup. Commands are organized around a session-based workflow system that stores state in `.workflow/` directories.

The workflow system follows a session-based model:

1. `init` creates project-level state (`project-tech.json`, `project-guidelines.json`)
2. `plan` creates a session (`WFS-*`) with `IMPL_PLAN.md`, task JSONs, and `TODO_LIST.md`
3. `execute` runs tasks through specialized agents
4. `test-gen` / `test-cycle-execute` validates the implementation
5. `review` performs specialized post-implementation analysis
6. `session:complete` archives the session with lessons learned

Lite variants (`lite-plan`, `lite-execute`, `lite-fix`, `lite-lite-lite`) skip session management for simpler tasks.

## Commands

### Core Workflow

#### `init`

Initialize project-level state with intelligent project analysis using cli-explore-agent. Generates `.workflow/project-tech.json` (auto-generated tech analysis) and `.workflow/project-guidelines.json` (user-maintained rules scaffold).

```bash
/workflow:init                 # Initialize (skip if exists)
/workflow:init --regenerate    # Force regeneration
```

#### `plan`

5-phase autonomous planning workflow. Creates a workflow session and generates implementation artifacts through session discovery, context gathering, optional conflict resolution, and task generation via action-planning-agent.

```bash
/workflow:plan "Build JWT authentication system"
/workflow:plan requirements.md
```

Outputs `IMPL_PLAN.md`, `IMPL-*.json` task files, and `TODO_LIST.md` in the session directory.

#### `execute`

Orchestrate autonomous task execution through agent coordination. Discovers active sessions, parses execution strategy from `IMPL_PLAN.md` (sequential, parallel, phased, or TDD), and runs tasks with lazy-loaded JSON context. One agent executes exactly one task JSON.

```bash
/workflow:execute                              # Auto-discover session
/workflow:execute --resume-session="WFS-auth"  # Resume specific session
```

#### `replan`

Interactive replanning with session-level artifact updates. Supports both session-wide and individual task replanning with interactive boundary clarification, impact analysis, and automatic backup management.

```bash
/workflow:replan "Add two-factor auth support"
/workflow:replan --session WFS-oauth IMPL-2 "Increase test coverage to 90%"
/workflow:replan --interactive
```

#### `review`

Post-implementation specialized review with four types: quality (default), security, architecture, and action-items. Uses analysis agents and Gemini/Qwen for domain-specific evaluation.

```bash
/workflow:review                              # Default quality review
/workflow:review --type=security              # Security audit
/workflow:review --type=architecture WFS-id   # Architecture compliance
/workflow:review --archived --type=quality WFS-old  # Review archived session
```

#### `clean`

Intelligent cleanup with mainline detection, stale artifact discovery, and safe execution. Analyzes git history to identify core modules, then scans for orphaned sessions, drifted documents, and dead code. Supports dry-run and focused cleanup.

```bash
/workflow:clean                  # Full cleanup with confirmation
/workflow:clean --dry-run        # Preview only
/workflow:clean "auth module"    # Focus on specific area
```

#### `debug`

Evidence-based interactive debugging with NDJSON logging. Generates testable hypotheses, adds instrumentation, then analyzes log output to confirm or reject each hypothesis iteratively.

```bash
/workflow:debug "Stack Length error: registered 0"
```

#### `debug-with-file`

Enhanced version of `debug` with documented exploration. Records understanding evolution in `understanding.md`, uses Gemini-assisted hypothesis generation and correction, and consolidates insights with strikethrough corrections across iterations.

```bash
/workflow:debug-with-file "Intermittent auth token expiry"
```

#### `action-plan-verify`

Non-destructive cross-artifact consistency analysis between `IMPL_PLAN.md` and task JSONs with quality gate validation. Recommended before execution.

```bash
/workflow:action-plan-verify
/workflow:action-plan-verify --session WFS-auth
```

#### `review-fix`

Automated fixing of code review findings with AI-powered planning, intelligent grouping, multi-stage timeline coordination, and test-driven verification.

```bash
/workflow:review-fix .workflow/active/WFS-123/.review/fix-export.json
/workflow:review-fix --resume --max-iterations=5
```

#### `review-module-cycle`

Independent multi-dimensional code review for specified modules/files across 7 dimensions (security, architecture, performance, maintainability, testing, error-handling, code-quality) with hybrid parallel-iterative execution.

```bash
/workflow:review-module-cycle src/auth/**
/workflow:review-module-cycle src/api --dimensions=security,architecture
```

#### `review-session-cycle`

Session-based comprehensive review analyzing git changes from a workflow session across 7 dimensions with focused deep-dives on critical issues until quality gates are met.

```bash
/workflow:review-session-cycle
/workflow:review-session-cycle WFS-auth --max-iterations=3
```

#### `multi-cli-plan`

Multi-CLI collaborative planning using Gemini, Codex, and Claude for iterative cross-verification to converge on an optimal execution plan.

```bash
/workflow:multi-cli-plan "Implement user authentication"
/workflow:multi-cli-plan "Redesign API" --tools=gemini,codex --mode=parallel
```

### Lite Variants

Lightweight alternatives that skip full session management for simpler tasks.

#### `lite-plan`

Interactive planning with in-memory planning, code exploration, and handoff to `lite-execute` after user confirmation.

```bash
/workflow:lite-plan "Refactor payment module"
/workflow:lite-plan -e "Explore auth patterns"
```

#### `lite-execute`

Execute tasks from in-memory plan, prompt description, or file content. Three input modes supported.

```bash
/workflow:lite-execute --in-memory
/workflow:lite-execute "Add input validation to forms"
/workflow:lite-execute path/to/spec.md
```

#### `lite-fix`

Lightweight bug diagnosis and fix with intelligent severity assessment and optional hotfix mode for production incidents.

```bash
/workflow:lite-fix "Login returns 500 on empty password"
/workflow:lite-fix --hotfix "Production payment gateway timeout"
```

#### `lite-lite-lite`

Ultra-lightweight multi-tool analysis and direct execution. No artifacts for simple tasks; auto-creates planning docs in `.workflow/.scratchpad/` for complex tasks. Auto-selects tools based on task analysis.

```bash
/workflow:lite-lite-lite "Fix the login bug"
```

### TDD Commands

#### `tdd-plan`

TDD workflow planning with Red-Green-Refactor task chain generation, test-first development structure, and cycle tracking.

```bash
/workflow:tdd-plan "User registration with email verification"
```

#### `tdd-verify`

Verify TDD workflow compliance against Red-Green-Refactor cycles. Generates quality report with coverage analysis.

```bash
/workflow:tdd-verify
/workflow:tdd-verify WFS-auth
```

#### `test-gen`

Create an independent test-fix workflow session from a completed implementation session. Analyzes code to generate test tasks with cross-session context gathering.

```bash
/workflow:test-gen WFS-auth-system
```

#### `test-fix-gen`

Create a test-fix workflow session from a session ID, feature description, or file path with test strategy generation and task planning.

```bash
/workflow:test-fix-gen WFS-auth
/workflow:test-fix-gen "Payment gateway integration"
/workflow:test-fix-gen /path/to/spec.md
```

#### `test-cycle-execute`

Execute test-fix workflow with dynamic task generation and iterative fix cycles until test pass rate reaches 95% or max iterations.

```bash
/workflow:test-cycle-execute
/workflow:test-cycle-execute --resume-session="WFS-test-auth" --max-iterations=5
```

### Brainstorm Sub-family

Role-based brainstorming commands that generate perspective-specific analysis documents. Each role command creates or updates a `{role}/analysis.md` file addressing guidance-specification discussion points.

#### `artifacts`

Interactive clarification generating a confirmed guidance specification through role-based analysis and synthesis.

```bash
/workflow:brainstorm:artifacts "Build a marketplace platform"
```

#### `synthesis`

Clarify and refine role analyses through intelligent Q&A and targeted updates with a synthesis agent.

```bash
/workflow:brainstorm:synthesis
```

#### `auto-parallel`

Parallel brainstorming automation with dynamic role selection and concurrent execution across multiple perspectives.

```bash
/workflow:brainstorm:auto-parallel "Design notification system"
```

#### Role Commands

Each generates analysis from its domain perspective:

| Command | Perspective |
|---------|-------------|
| `api-designer` | API design |
| `data-architect` | Data architecture |
| `product-manager` | Product management |
| `product-owner` | Product ownership |
| `scrum-master` | Agile process |
| `subject-matter-expert` | Domain expertise |
| `system-architect` | System architecture |
| `ui-designer` | UI design |
| `ux-expert` | UX |

Usage: `/workflow:brainstorm:{role}`

### Session Sub-family

Workflow session lifecycle management.

| Command | Description |
|---------|-------------|
| `start` | Discover existing sessions or start a new one with intelligent session management and conflict detection |
| `list` | List all workflow sessions with status filtering and progress information |
| `resume` | Resume the most recently paused session with automatic discovery |
| `complete` | Mark session as complete, archive with lessons learned, update manifest |
| `solidify` | Crystallize session learnings and user-defined constraints into permanent project guidelines |

```bash
/workflow:session:start "Auth system implementation"
/workflow:session:list
/workflow:session:resume
/workflow:session:complete
/workflow:session:solidify
```

### Tools Sub-family

Internal utility commands used by the planning and testing pipelines. Typically invoked by other workflow commands, not directly.

| Command | Description |
|---------|-------------|
| `context-gather` | Collect project context using context-search-agent, package into standardized JSON |
| `conflict-resolution` | Detect and resolve conflicts between plan and existing codebase using CLI-powered analysis |
| `task-generate-agent` | Generate `IMPL_PLAN.md`, task JSONs, and `TODO_LIST.md` using action-planning-agent |
| `task-generate-tdd` | Autonomous TDD task generation with Red-Green-Refactor cycles and cycle validation |
| `tdd-coverage-analysis` | Analyze test coverage and TDD cycle execution with R-G-R compliance verification |
| `test-concept-enhanced` | Coordinate test analysis workflow using cli-execution-agent to generate test strategy |
| `test-context-gather` | Collect test coverage context and package into standardized test-context JSON |
| `test-task-generate` | Generate test planning documents using action-planning-agent |

### UI Design Sub-family

Design system extraction, prototyping, and synchronization commands.

| Command | Description |
|---------|-------------|
| `style-extract` | Extract design style from reference images or text prompts with variant generation |
| `layout-extract` | Extract structural layout information from reference images or prompts |
| `animation-extract` | Extract animation and transition patterns from prompts and image references |
| `codify-style` | Extract styles from code and generate shareable reference package with preview |
| `import-from-code` | Import design system from code files (CSS/JS/HTML/SCSS) with automatic discovery |
| `generate` | Assemble UI prototypes by combining layout templates with design tokens |
| `explore-auto` | Interactive exploratory UI design with style-centric batch generation and user selection |
| `imitate-auto` | UI design workflow with direct code/image input for design token extraction |
| `design-sync` | Synchronize finalized design system references to brainstorming artifacts |
| `reference-page-generator` | Generate multi-component reference pages from design run extraction |

```bash
/workflow:ui-design:style-extract "Modern minimalist dashboard"
/workflow:ui-design:explore-auto --input reference.png --targets "dashboard,settings"
/workflow:ui-design:generate
```

## Notes

- The standard lifecycle is: `init` -> `plan` -> `execute` -> `test-gen` -> `test-cycle-execute` -> `review` -> `session:complete`.
- Lite variants (`lite-plan`, `lite-execute`, `lite-fix`, `lite-lite-lite`) are independent of the session system and suited for smaller tasks.
- All session data is stored under `.workflow/active/WFS-*/` during execution and moved to `.workflow/archives/` on completion.
- The `brainstorm` sub-family is optional and feeds into `plan` when multi-perspective analysis is needed.
- Review dimensions include: security, architecture, performance, maintainability, testing, error-handling, and code-quality.
- UI design commands store artifacts in `.workflow/ui-design/` with design run directories.
