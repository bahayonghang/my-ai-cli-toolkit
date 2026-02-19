# API Reference: scraping_tools.py

**Language**: Python

**Source**: `src/skill_seekers/mcp/tools/scraping_tools.py`

---

## Classes

### TextContent

Fallback TextContent for when MCP is not installed

**Inherits from**: (none)

#### Methods

##### __init__(self, type: str, text: str)

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| type | str | - | - |
| text | str | - | - |




## Functions

### run_subprocess_with_streaming(cmd: list[str], timeout: int = None) → tuple

Run subprocess with real-time output streaming.

This solves the blocking issue where long-running processes (like scraping)
would cause MCP to appear frozen. Now we stream output as it comes.

Args:
    cmd: Command list to execute
    timeout: Optional timeout in seconds

Returns:
    Tuple of (stdout, stderr, returncode)

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| cmd | list[str] | - | - |
| timeout | int | None | - |

**Returns**: `tuple`



### estimate_pages_tool(args: dict) → list[TextContent]

**Async function**

Estimate page count from a config file.

Performs fast preview without downloading content to estimate
how many pages will be scraped.

Args:
    args: Dictionary containing:
        - config_path (str): Path to config JSON file
        - max_discovery (int, optional): Maximum pages to discover (default: 1000)
        - unlimited (bool, optional): Remove discovery limit (default: False)

Returns:
    List[TextContent]: Tool execution results

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| args | dict | - | - |

**Returns**: `list[TextContent]`



### scrape_docs_tool(args: dict) → list[TextContent]

**Async function**

Scrape documentation and build skill.

Auto-detects unified vs legacy format and routes to appropriate scraper.
Supports both single-source (legacy) and unified multi-source configs.
Creates SKILL.md and reference files.

Args:
    args: Dictionary containing:
        - config_path (str): Path to config JSON file
        - unlimited (bool, optional): Remove page limit (default: False)
        - enhance_local (bool, optional): Open terminal for local enhancement (default: False)
        - skip_scrape (bool, optional): Skip scraping, use cached data (default: False)
        - dry_run (bool, optional): Preview without saving (default: False)
        - merge_mode (str, optional): Override merge mode for unified configs

Returns:
    List[TextContent]: Tool execution results

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| args | dict | - | - |

**Returns**: `list[TextContent]`



### scrape_pdf_tool(args: dict) → list[TextContent]

**Async function**

Scrape PDF documentation and build Claude skill.

Extracts text, code, and images from PDF files and builds
a skill package with organized references.

Args:
    args: Dictionary containing:
        - config_path (str, optional): Path to PDF config JSON file
        - pdf_path (str, optional): Direct PDF path (alternative to config_path)
        - name (str, optional): Skill name (required with pdf_path)
        - description (str, optional): Skill description
        - from_json (str, optional): Build from extracted JSON file

Returns:
    List[TextContent]: Tool execution results

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| args | dict | - | - |

**Returns**: `list[TextContent]`



### scrape_github_tool(args: dict) → list[TextContent]

**Async function**

Scrape GitHub repository and build Claude skill.

Extracts README, Issues, Changelog, Releases, and code structure
from GitHub repositories to create comprehensive skills.

Args:
    args: Dictionary containing:
        - repo (str, optional): GitHub repository (owner/repo)
        - config_path (str, optional): Path to GitHub config JSON file
        - name (str, optional): Skill name (default: repo name)
        - description (str, optional): Skill description
        - token (str, optional): GitHub personal access token
        - no_issues (bool, optional): Skip GitHub issues extraction (default: False)
        - no_changelog (bool, optional): Skip CHANGELOG extraction (default: False)
        - no_releases (bool, optional): Skip releases extraction (default: False)
        - max_issues (int, optional): Maximum issues to fetch (default: 100)
        - scrape_only (bool, optional): Only scrape, don't build skill (default: False)

Returns:
    List[TextContent]: Tool execution results

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| args | dict | - | - |

**Returns**: `list[TextContent]`



### scrape_codebase_tool(args: dict) → list[TextContent]

**Async function**

Analyze local codebase and extract code knowledge.

Walks directory tree, analyzes code files, extracts signatures,
docstrings, and optionally generates API reference documentation
and dependency graphs.

Args:
    args: Dictionary containing:
        - directory (str): Directory to analyze
        - output (str, optional): Output directory for results (default: output/codebase/)
        - depth (str, optional): Analysis depth - surface, deep, full (default: deep)
        - languages (str, optional): Comma-separated languages (e.g., "Python,JavaScript,C++")
        - file_patterns (str, optional): Comma-separated file patterns (e.g., "*.py,src/**/*.js")
        - build_api_reference (bool, optional): Generate API reference markdown (default: False)
        - build_dependency_graph (bool, optional): Generate dependency graph and detect circular dependencies (default: False)

Returns:
    List[TextContent]: Tool execution results

Example:
    scrape_codebase(
        directory="/path/to/repo",
        depth="deep",
        build_api_reference=True,
        build_dependency_graph=True
    )

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| args | dict | - | - |

**Returns**: `list[TextContent]`



### detect_patterns_tool(args: dict) → list[TextContent]

**Async function**

Detect design patterns in source code.

Analyzes source files or directories to detect common design patterns
(Singleton, Factory, Observer, Strategy, Decorator, Builder, Adapter,
Command, Template Method, Chain of Responsibility).

Supports 9 languages: Python, JavaScript, TypeScript, C++, C, C#,
Go, Rust, Java, Ruby, PHP.

Args:
    args: Dictionary containing:
        - file (str, optional): Single file to analyze
        - directory (str, optional): Directory to analyze (analyzes all source files)
        - output (str, optional): Output directory for JSON results
        - depth (str, optional): Detection depth - surface, deep, full (default: deep)
        - json (bool, optional): Output JSON format (default: False)

Returns:
    List[TextContent]: Pattern detection results

Example:
    detect_patterns(file="src/database.py", depth="deep")
    detect_patterns(directory="src/", output="patterns/", json=True)

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| args | dict | - | - |

**Returns**: `list[TextContent]`



### extract_test_examples_tool(args: dict) → list[TextContent]

**Async function**

Extract usage examples from test files.

Analyzes test files to extract real API usage patterns including:
- Object instantiation with real parameters
- Method calls with expected behaviors
- Configuration examples
- Setup patterns from fixtures/setUp()
- Multi-step workflows from integration tests

Supports 9 languages: Python (AST-based deep analysis), JavaScript,
TypeScript, Go, Rust, Java, C#, PHP, Ruby (regex-based).

Args:
    args: Dictionary containing:
        - file (str, optional): Single test file to analyze
        - directory (str, optional): Directory containing test files
        - language (str, optional): Filter by language (python, javascript, etc.)
        - min_confidence (float, optional): Minimum confidence threshold 0.0-1.0 (default: 0.5)
        - max_per_file (int, optional): Maximum examples per file (default: 10)
        - json (bool, optional): Output JSON format (default: False)
        - markdown (bool, optional): Output Markdown format (default: False)

Returns:
    List[TextContent]: Extracted test examples

Example:
    extract_test_examples(directory="tests/", language="python")
    extract_test_examples(file="tests/test_scraper.py", json=True)

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| args | dict | - | - |

**Returns**: `list[TextContent]`



### build_how_to_guides_tool(args: dict) → list[TextContent]

**Async function**

Build how-to guides from workflow test examples.

Transforms workflow examples extracted from test files into step-by-step
educational guides. Automatically groups related workflows, extracts steps,
and generates comprehensive markdown guides.

Features:
- Python AST-based step extraction (heuristic for other languages)
- 4 grouping strategies: ai-tutorial-group, file-path, test-name, complexity
- Detects prerequisites, setup code, and verification points
- Generates troubleshooting tips and next steps
- Creates index with difficulty levels

Args:
    args: Dictionary containing:
        - input (str): Path to test_examples.json from extract_test_examples
        - output (str, optional): Output directory for guides (default: output/codebase/tutorials)
        - group_by (str, optional): Grouping strategy - ai-tutorial-group, file-path, test-name, complexity
        - no_ai (bool, optional): Disable AI enhancement for grouping (default: False)
        - json_output (bool, optional): Output JSON format alongside markdown (default: False)

Returns:
    List[TextContent]: Guide building results

Example:
    build_how_to_guides(
        input="output/codebase/test_examples/test_examples.json",
        group_by="ai-tutorial-group",
        output="output/codebase/tutorials"
    )

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| args | dict | - | - |

**Returns**: `list[TextContent]`



### extract_config_patterns_tool(args: dict) → list[TextContent]

**Async function**

Extract configuration patterns from config files (C3.4).

Analyzes configuration files in the codebase to extract settings,
detect common patterns (database, API, logging, cache, etc.), and
generate comprehensive documentation.

Supports 9 config formats: JSON, YAML, TOML, ENV, INI, Python modules,
JavaScript/TypeScript configs, Dockerfile, Docker Compose.

Detects 7 common patterns:
- Database configuration (host, port, credentials)
- API configuration (endpoints, keys, timeouts)
- Logging configuration (level, format, handlers)
- Cache configuration (backend, TTL, keys)
- Email configuration (SMTP, credentials)
- Authentication configuration (providers, secrets)
- Server configuration (host, port, workers)

Args:
    args: Dictionary containing:
        - directory (str): Directory to analyze
        - output (str, optional): Output directory (default: output/codebase/config_patterns)
        - max_files (int, optional): Maximum config files to process (default: 100)
        - enhance (bool, optional): Enable AI enhancement - API mode (default: False, requires ANTHROPIC_API_KEY)
        - enhance_local (bool, optional): Enable AI enhancement - LOCAL mode (default: False, uses Claude Code CLI)
        - ai_mode (str, optional): AI mode - auto, api, local, none (default: none)
        - json (bool, optional): Output JSON format (default: True)
        - markdown (bool, optional): Output Markdown format (default: True)

Returns:
    List[TextContent]: Config extraction results with optional AI enhancements

Example:
    extract_config_patterns(directory=".", output="output/configs")
    extract_config_patterns(directory="/path/to/repo", max_files=50, enhance_local=True)

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| args | dict | - | - |

**Returns**: `list[TextContent]`


