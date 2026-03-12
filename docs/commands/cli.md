# CLI Tools Commands

Initialize CLI tool configurations and perform code reviews using external CLI tools.

## Commands

### `cli-init`

**Description**: Generate `.gemini/` and `.qwen/` config directories with settings.json and technology-aware ignore files.
**Usage**: `/cli:cli-init [--tool gemini|qwen|all] [--output path] [--preview]`

#### How It Works

1. **Workspace Analysis** - Runs `get_modules_by_depth.sh` to analyze project structure
2. **Technology Detection** - Identifies tech stacks based on config files, directories, and file extensions
3. **Config Creation** - Generates tool-specific configuration directories with `settings.json`
4. **Ignore Rules Generation** - Creates `.geminiignore` and `.qwenignore` with technology-specific filtering rules

#### Options

| Option | Description |
|--------|-------------|
| `--tool gemini` | Initialize Gemini only (`.gemini/` + `.geminiignore`) |
| `--tool qwen` | Initialize Qwen only (`.qwen/` + `.qwenignore`) |
| `--tool all` | Initialize both (default) |
| `--preview` | Show what would be generated without creating files |
| `--output <path>` | Generate files in specified directory |

#### Supported Technology Stacks

| Category | Technologies | Detection |
|----------|-------------|-----------|
| Frontend | React/Next.js, Vue/Nuxt, Angular | `package.json`, framework configs |
| Backend | Node.js, Python, Java, Go, C#/.NET | `requirements.txt`, `pom.xml`, `go.mod` |
| Infrastructure | Docker, Kubernetes | `Dockerfile`, helm charts |

### `codex-review`

**Description**: Interactive code review using Codex CLI with configurable review target, model, and custom instructions.
**Usage**: `/cli:codex-review [--uncommitted|--base branch|--commit sha] [--model model] [prompt]`

#### How It Works

1. **Parse Arguments** - Detect target flags and options from input
2. **Interactive Selection** - If no target specified, guide user through review target, model, and focus area selection
3. **Build Prompt** - Construct review prompt based on selected focus area (general, security, performance, code quality)
4. **Execute Review** - Run `codex review` via ccw cli endpoint

#### Options

| Option | Description |
|--------|-------------|
| `--uncommitted` | Review staged, unstaged, and untracked changes |
| `--base <branch>` | Review changes against a base branch |
| `--commit <sha>` | Review changes introduced by a specific commit |
| `--model <model>` | Override model (default, o3, gpt-4.1, o4-mini) |

#### Focus Areas

| Focus | Key Checks |
|-------|------------|
| General review | Correctness, style, bugs, documentation |
| Security focus | Injection, auth, validation, data exposure |
| Performance focus | Complexity, memory, queries, caching |
| Code quality | SOLID, duplication, naming, tests |

## Examples

```bash
# Initialize all CLI tools
/cli:cli-init

# Preview what would be generated
/cli:cli-init --preview

# Initialize Gemini only
/cli:cli-init --tool gemini

# Review uncommitted changes
/cli:codex-review --uncommitted

# Review against main branch with o3 model
/cli:codex-review --base main --model o3

# Interactive mode (guided flow)
/cli:codex-review
```

## Notes

- `cli-init` backs up existing config files before overwriting
- Ignore files use gitignore syntax and include base rules (VCS, OS, IDE, logs) plus technology-specific rules
- `codex-review` target flags (`--uncommitted`, `--base`, `--commit`) and custom prompts are mutually exclusive
- When a target flag is specified, codex uses its default review behavior without custom prompts
