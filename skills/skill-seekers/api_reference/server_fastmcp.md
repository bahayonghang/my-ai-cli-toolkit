# API Reference: server_fastmcp.py

**Language**: Python

**Source**: `src/skill_seekers/mcp/server_fastmcp.py`

---

## Functions

### safe_tool_decorator()

Decorator that works when mcp is None (for testing)

**Returns**: (none)



### generate_config(name: str, url: str, description: str, max_pages: int = 100, unlimited: bool = False, rate_limit: float = 0.5) → str

**Async function**

Generate a config file for documentation scraping.

Args:
    name: Skill name (lowercase, alphanumeric, hyphens, underscores)
    url: Base documentation URL (must include http:// or https://)
    description: Description of when to use this skill
    max_pages: Maximum pages to scrape (default: 100, use -1 for unlimited)
    unlimited: Remove all limits - scrape all pages (default: false). Overrides max_pages.
    rate_limit: Delay between requests in seconds (default: 0.5)

Returns:
    Success message with config path and next steps, or error message.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| name | str | - | - |
| url | str | - | - |
| description | str | - | - |
| max_pages | int | 100 | - |
| unlimited | bool | False | - |
| rate_limit | float | 0.5 | - |

**Returns**: `str`



### list_configs() → str

**Async function**

List all available preset configurations.

Returns:
    List of available configs with categories and descriptions.

**Returns**: `str`



### validate_config(config_path: str) → str

**Async function**

Validate a config file for errors.

Args:
    config_path: Path to config JSON file

Returns:
    Validation result with any errors or success message.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| config_path | str | - | - |

**Returns**: `str`



### estimate_pages(config_path: str, max_discovery: int = 1000, unlimited: bool = False) → str

**Async function**

Estimate how many pages will be scraped from a config.

Args:
    config_path: Path to config JSON file (e.g., configs/react.json)
    max_discovery: Maximum pages to discover during estimation (default: 1000, use -1 for unlimited)
    unlimited: Remove discovery limit - estimate all pages (default: false). Overrides max_discovery.

Returns:
    Estimation results with page count and recommendations.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| config_path | str | - | - |
| max_discovery | int | 1000 | - |
| unlimited | bool | False | - |

**Returns**: `str`



### scrape_docs(config_path: str, unlimited: bool = False, enhance_local: bool = False, skip_scrape: bool = False, dry_run: bool = False, merge_mode: str | None = None) → str

**Async function**

Scrape documentation and build Claude skill.

Args:
    config_path: Path to config JSON file (e.g., configs/react.json or configs/godot_unified.json)
    unlimited: Remove page limit - scrape all pages (default: false). Overrides max_pages in config.
    enhance_local: Open terminal for local enhancement with Claude Code (default: false)
    skip_scrape: Skip scraping, use cached data (default: false)
    dry_run: Preview what will be scraped without saving (default: false)
    merge_mode: Override merge mode for unified configs: 'rule-based' or 'claude-enhanced' (default: from config)

Returns:
    Scraping results with file paths and statistics.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| config_path | str | - | - |
| unlimited | bool | False | - |
| enhance_local | bool | False | - |
| skip_scrape | bool | False | - |
| dry_run | bool | False | - |
| merge_mode | str | None | None | - |

**Returns**: `str`



### scrape_github(repo: str | None = None, config_path: str | None = None, name: str | None = None, description: str | None = None, token: str | None = None, no_issues: bool = False, no_changelog: bool = False, no_releases: bool = False, max_issues: int = 100, scrape_only: bool = False) → str

**Async function**

Scrape GitHub repository and build Claude skill.

Args:
    repo: GitHub repository (owner/repo, e.g., facebook/react)
    config_path: Path to GitHub config JSON file (e.g., configs/react_github.json)
    name: Skill name (default: repo name)
    description: Skill description
    token: GitHub personal access token (or use GITHUB_TOKEN env var)
    no_issues: Skip GitHub issues extraction (default: false)
    no_changelog: Skip CHANGELOG extraction (default: false)
    no_releases: Skip releases extraction (default: false)
    max_issues: Maximum issues to fetch (default: 100)
    scrape_only: Only scrape, don't build skill (default: false)

Returns:
    GitHub scraping results with file paths.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| repo | str | None | None | - |
| config_path | str | None | None | - |
| name | str | None | None | - |
| description | str | None | None | - |
| token | str | None | None | - |
| no_issues | bool | False | - |
| no_changelog | bool | False | - |
| no_releases | bool | False | - |
| max_issues | int | 100 | - |
| scrape_only | bool | False | - |

**Returns**: `str`



### scrape_pdf(config_path: str | None = None, pdf_path: str | None = None, name: str | None = None, description: str | None = None, from_json: str | None = None) → str

**Async function**

Scrape PDF documentation and build Claude skill.

Args:
    config_path: Path to PDF config JSON file (e.g., configs/manual_pdf.json)
    pdf_path: Direct PDF path (alternative to config_path)
    name: Skill name (required with pdf_path)
    description: Skill description (optional)
    from_json: Build from extracted JSON file (e.g., output/manual_extracted.json)

Returns:
    PDF scraping results with file paths.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| config_path | str | None | None | - |
| pdf_path | str | None | None | - |
| name | str | None | None | - |
| description | str | None | None | - |
| from_json | str | None | None | - |

**Returns**: `str`



### scrape_codebase(directory: str, output: str = 'output/codebase/', depth: str = 'deep', languages: str = '', file_patterns: str = '', build_api_reference: bool = False, build_dependency_graph: bool = False) → str

**Async function**

Analyze local codebase and extract code knowledge.

Args:
    directory: Directory to analyze (required)
    output: Output directory for results (default: output/codebase/)
    depth: Analysis depth - surface, deep, full (default: deep)
    languages: Comma-separated languages to analyze (e.g., "Python,JavaScript,C++")
    file_patterns: Comma-separated file patterns (e.g., "*.py,src/**/*.js")
    build_api_reference: Generate API reference markdown (default: false)
    build_dependency_graph: Generate dependency graph and detect circular dependencies (default: false)

Returns:
    Codebase analysis results with file paths.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| directory | str | - | - |
| output | str | 'output/codebase/' | - |
| depth | str | 'deep' | - |
| languages | str | '' | - |
| file_patterns | str | '' | - |
| build_api_reference | bool | False | - |
| build_dependency_graph | bool | False | - |

**Returns**: `str`



### detect_patterns(file: str = '', directory: str = '', output: str = '', depth: str = 'deep', json: bool = False) → str

**Async function**

Detect design patterns in source code.

Analyzes source files or directories to identify common design patterns.
Provides confidence scores and evidence for each detected pattern.

Args:
    file: Single file to analyze (optional)
    directory: Directory to analyze all source files (optional)
    output: Output directory for JSON results (optional)
    depth: Detection depth - surface (fast), deep (balanced), full (thorough). Default: deep
    json: Output JSON format instead of human-readable (default: false)

Returns:
    Pattern detection results with confidence scores and evidence.

Example:
    detect_patterns(file="src/database.py", depth="deep")
    detect_patterns(directory="src/", output="patterns/", json=true)

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| file | str | '' | - |
| directory | str | '' | - |
| output | str | '' | - |
| depth | str | 'deep' | - |
| json | bool | False | - |

**Returns**: `str`



### extract_test_examples(file: str = '', directory: str = '', language: str = '', min_confidence: float = 0.5, max_per_file: int = 10, json: bool = False, markdown: bool = False) → str

**Async function**

Extract usage examples from test files.

Analyzes test files to extract real API usage patterns including:
- Object instantiation with real parameters
- Method calls with expected behaviors
- Configuration examples
- Setup patterns from fixtures/setUp()
- Multi-step workflows from integration tests

Supports 9 languages: Python (AST-based), JavaScript, TypeScript, Go, Rust, Java, C#, PHP, Ruby.

Args:
    file: Single test file to analyze (optional)
    directory: Directory containing test files (optional)
    language: Filter by language (python, javascript, etc.)
    min_confidence: Minimum confidence threshold 0.0-1.0 (default: 0.5)
    max_per_file: Maximum examples per file (default: 10)
    json: Output JSON format (default: false)
    markdown: Output Markdown format (default: false)

Examples:
    extract_test_examples(directory="tests/", language="python")
    extract_test_examples(file="tests/test_scraper.py", json=true)

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| file | str | '' | - |
| directory | str | '' | - |
| language | str | '' | - |
| min_confidence | float | 0.5 | - |
| max_per_file | int | 10 | - |
| json | bool | False | - |
| markdown | bool | False | - |

**Returns**: `str`



### build_how_to_guides(input: str, output: str = 'output/codebase/tutorials', group_by: str = 'ai-tutorial-group', no_ai: bool = False, json_output: bool = False) → str

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

Args:
    input: Path to test_examples.json from extract_test_examples
    output: Output directory for guides (default: output/codebase/tutorials)
    group_by: Grouping strategy - ai-tutorial-group, file-path, test-name, complexity (default: ai-tutorial-group)
    no_ai: Disable AI enhancement for grouping (default: false)
    json_output: Output JSON format alongside markdown (default: false)

Examples:
    build_how_to_guides(input="output/codebase/test_examples/test_examples.json")
    build_how_to_guides(input="examples.json", group_by="file-path", no_ai=true)

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| input | str | - | - |
| output | str | 'output/codebase/tutorials' | - |
| group_by | str | 'ai-tutorial-group' | - |
| no_ai | bool | False | - |
| json_output | bool | False | - |

**Returns**: `str`



### extract_config_patterns(directory: str, output: str = 'output/codebase/config_patterns', max_files: int = 100, enhance: bool = False, enhance_local: bool = False, ai_mode: str = 'none', json: bool = True, markdown: bool = True) → str

**Async function**

Extract configuration patterns from config files with optional AI enhancement.

Analyzes configuration files in the codebase to extract settings,
detect common patterns, and generate comprehensive documentation.

**AI Enhancement (NEW)**: Optional AI-powered insights including:
- Explanations of what each config does
- Best practice suggestions
- Security analysis (hardcoded secrets, exposed credentials)
- Migration suggestions (consolidation opportunities)
- Context-aware documentation

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
    directory: Directory to analyze (required)
    output: Output directory for results (default: output/codebase/config_patterns)
    max_files: Maximum config files to process (default: 100)
    enhance: Enable AI enhancement - API mode (default: false, requires ANTHROPIC_API_KEY)
    enhance_local: Enable AI enhancement - LOCAL mode (default: false, uses Claude Code CLI)
    ai_mode: AI enhancement mode - auto, api, local, none (default: none)
    json: Output JSON format (default: true)
    markdown: Output Markdown format (default: true)

Returns:
    Config extraction results with patterns, settings, and optional AI insights.

Examples:
    extract_config_patterns(directory=".")
    extract_config_patterns(directory="/path/to/repo", max_files=50)
    extract_config_patterns(directory=".", enhance_local=true)  # With AI enhancement (LOCAL mode)
    extract_config_patterns(directory=".", ai_mode="api")  # With AI enhancement (API mode)

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| directory | str | - | - |
| output | str | 'output/codebase/config_patterns' | - |
| max_files | int | 100 | - |
| enhance | bool | False | - |
| enhance_local | bool | False | - |
| ai_mode | str | 'none' | - |
| json | bool | True | - |
| markdown | bool | True | - |

**Returns**: `str`



### package_skill(skill_dir: str, target: str = 'claude', auto_upload: bool = True) → str

**Async function**

Package skill directory for target LLM platform.

Args:
    skill_dir: Path to skill directory to package (e.g., output/react/)
    target: Target platform (default: 'claude'). Options: claude, gemini, openai, markdown
    auto_upload: Auto-upload after packaging if API key is available (default: true). Requires platform-specific API key: ANTHROPIC_API_KEY, GOOGLE_API_KEY, or OPENAI_API_KEY.

Returns:
    Packaging results with file path and platform info.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| skill_dir | str | - | - |
| target | str | 'claude' | - |
| auto_upload | bool | True | - |

**Returns**: `str`



### upload_skill(skill_zip: str, target: str = 'claude', api_key: str | None = None) → str

**Async function**

Upload skill package to target platform.

Args:
    skill_zip: Path to skill package (.zip or .tar.gz, e.g., output/react.zip)
    target: Target platform (default: 'claude'). Options: claude, gemini, openai
    api_key: Optional API key (uses env var if not provided: ANTHROPIC_API_KEY, GOOGLE_API_KEY, or OPENAI_API_KEY)

Returns:
    Upload results with skill ID and platform URL.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| skill_zip | str | - | - |
| target | str | 'claude' | - |
| api_key | str | None | None | - |

**Returns**: `str`



### enhance_skill(skill_dir: str, target: str = 'claude', mode: str = 'local', api_key: str | None = None) → str

**Async function**

Enhance SKILL.md with AI.

Args:
    skill_dir: Path to skill directory containing SKILL.md (e.g., output/react/)
    target: Target platform (default: 'claude'). Options: claude, gemini, openai
    mode: Enhancement mode (default: 'local'). Options: local (Claude Code, no API), api (uses platform API)
    api_key: Optional API key for 'api' mode (uses env var if not provided: ANTHROPIC_API_KEY, GOOGLE_API_KEY, or OPENAI_API_KEY)

Returns:
    Enhancement results with backup location.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| skill_dir | str | - | - |
| target | str | 'claude' | - |
| mode | str | 'local' | - |
| api_key | str | None | None | - |

**Returns**: `str`



### install_skill(config_name: str | None = None, config_path: str | None = None, destination: str = 'output', auto_upload: bool = True, unlimited: bool = False, dry_run: bool = False, target: str = 'claude') → str

**Async function**

Complete one-command workflow to install a skill.

Args:
    config_name: Config name from API (e.g., 'react', 'django'). Mutually exclusive with config_path. Tool will fetch this config from the official API before scraping.
    config_path: Path to existing config JSON file (e.g., 'configs/custom.json'). Mutually exclusive with config_name. Use this if you already have a config file.
    destination: Output directory for skill files (default: 'output')
    auto_upload: Auto-upload after packaging (requires platform API key). Default: true. Set to false to skip upload.
    unlimited: Remove page limits during scraping (default: false). WARNING: Can take hours for large sites.
    dry_run: Preview workflow without executing (default: false). Shows all phases that would run.
    target: Target LLM platform (default: 'claude'). Options: claude, gemini, openai, markdown. Requires corresponding API key: ANTHROPIC_API_KEY, GOOGLE_API_KEY, or OPENAI_API_KEY.

Returns:
    Workflow results with all phase statuses.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| config_name | str | None | None | - |
| config_path | str | None | None | - |
| destination | str | 'output' | - |
| auto_upload | bool | True | - |
| unlimited | bool | False | - |
| dry_run | bool | False | - |
| target | str | 'claude' | - |

**Returns**: `str`



### split_config(config_path: str, strategy: str = 'auto', target_pages: int = 5000, dry_run: bool = False) → str

**Async function**

Split large configs into multiple skills.

Supports:
- Documentation configs: Split by categories, size, or create router skills
- Unified configs: Split by source type (documentation, github, pdf)

Args:
    config_path: Path to config JSON file (e.g., configs/godot.json or configs/react_unified.json)
    strategy: Split strategy: auto, none, source, category, router, size (default: auto). 'source' is for unified configs.
    target_pages: Target pages per skill for doc configs (default: 5000)
    dry_run: Preview without saving files (default: false)

Returns:
    Splitting results with generated config paths.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| config_path | str | - | - |
| strategy | str | 'auto' | - |
| target_pages | int | 5000 | - |
| dry_run | bool | False | - |

**Returns**: `str`



### generate_router(config_pattern: str, router_name: str | None = None) → str

**Async function**

Generate router/hub skill for split documentation.

Args:
    config_pattern: Config pattern for sub-skills (e.g., 'configs/godot-*.json')
    router_name: Router skill name (optional, inferred from configs)

Returns:
    Router generation results with file paths.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| config_pattern | str | - | - |
| router_name | str | None | None | - |

**Returns**: `str`



### fetch_config(config_name: str | None = None, destination: str = 'configs', list_available: bool = False, category: str | None = None, git_url: str | None = None, source: str | None = None, branch: str = 'main', token: str | None = None, refresh: bool = False) → str

**Async function**

Fetch config from API, git URL, or registered source.

Args:
    config_name: Name of the config to download (e.g., 'react', 'django', 'godot'). Required for git modes. Omit to list all available configs in API mode.
    destination: Directory to save the config file (default: 'configs/')
    list_available: List all available configs from the API (only works in API mode, default: false)
    category: Filter configs by category when listing in API mode (e.g., 'web-frameworks', 'game-engines', 'devops')
    git_url: Git repository URL containing configs. If provided, fetches from git instead of API. Supports HTTPS and SSH URLs. Example: 'https://github.com/myorg/configs.git'
    source: Named source from registry (highest priority). Use add_config_source to register sources first. Example: 'team', 'company'
    branch: Git branch to use (default: 'main'). Only used with git_url or source.
    token: Authentication token for private repos (optional). Prefer using environment variables (GITHUB_TOKEN, GITLAB_TOKEN, etc.).
    refresh: Force refresh cached git repository (default: false). Deletes cache and re-clones. Only used with git modes.

Returns:
    Fetch results with config path or list of available configs.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| config_name | str | None | None | - |
| destination | str | 'configs' | - |
| list_available | bool | False | - |
| category | str | None | None | - |
| git_url | str | None | None | - |
| source | str | None | None | - |
| branch | str | 'main' | - |
| token | str | None | None | - |
| refresh | bool | False | - |

**Returns**: `str`



### submit_config(config_path: str | None = None, config_json: str | None = None, testing_notes: str | None = None, github_token: str | None = None) → str

**Async function**

Submit a custom config file to the community.

Args:
    config_path: Path to config JSON file to submit (e.g., 'configs/myframework.json')
    config_json: Config JSON as string (alternative to config_path)
    testing_notes: Notes about testing (e.g., 'Tested with 20 pages, works well')
    github_token: GitHub personal access token (or use GITHUB_TOKEN env var)

Returns:
    Submission results with GitHub issue URL.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| config_path | str | None | None | - |
| config_json | str | None | None | - |
| testing_notes | str | None | None | - |
| github_token | str | None | None | - |

**Returns**: `str`



### add_config_source(name: str, git_url: str, source_type: str = 'github', token_env: str | None = None, branch: str = 'main', priority: int = 100, enabled: bool = True) → str

**Async function**

Register a git repository as a config source.

Args:
    name: Source identifier (lowercase, alphanumeric, hyphens/underscores allowed). Example: 'team', 'company-internal', 'my_configs'
    git_url: Git repository URL (HTTPS or SSH). Example: 'https://github.com/myorg/configs.git' or 'git@github.com:myorg/configs.git'
    source_type: Source type (default: 'github'). Options: 'github', 'gitlab', 'gitea', 'bitbucket', 'custom'
    token_env: Environment variable name for auth token (optional). Auto-detected if not provided. Example: 'GITHUB_TOKEN', 'GITLAB_TOKEN', 'MY_CUSTOM_TOKEN'
    branch: Git branch to use (default: 'main'). Example: 'main', 'master', 'develop'
    priority: Source priority (lower = higher priority, default: 100). Used for conflict resolution when same config exists in multiple sources.
    enabled: Whether source is enabled (default: true)

Returns:
    Registration results with source details.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| name | str | - | - |
| git_url | str | - | - |
| source_type | str | 'github' | - |
| token_env | str | None | None | - |
| branch | str | 'main' | - |
| priority | int | 100 | - |
| enabled | bool | True | - |

**Returns**: `str`



### list_config_sources(enabled_only: bool = False) → str

**Async function**

List all registered config sources.

Args:
    enabled_only: Only show enabled sources (default: false)

Returns:
    List of registered sources with details.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| enabled_only | bool | False | - |

**Returns**: `str`



### remove_config_source(name: str) → str

**Async function**

Remove a registered config source.

Args:
    name: Source identifier to remove. Example: 'team', 'company-internal'

Returns:
    Removal results with success/error message.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| name | str | - | - |

**Returns**: `str`



### parse_args()

Parse command-line arguments.

**Returns**: (none)



### setup_logging(log_level: str)

Configure logging.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| log_level | str | - | - |

**Returns**: (none)



### run_http_server(host: str, port: int)

**Async function**

Run the MCP server with HTTP transport using uvicorn.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| host | str | - | - |
| port | int | - | - |

**Returns**: (none)



### main()

Run the MCP server with stdio or HTTP transport.

**Returns**: (none)



### wrapper(func)

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| func | None | - | - |

**Returns**: (none)



### health_check(_request)

**Async function**

Health check endpoint.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| _request | None | - | - |

**Returns**: (none)


