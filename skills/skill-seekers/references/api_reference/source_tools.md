# API Reference: source_tools.py

**Language**: Python

**Source**: `src/skill_seekers/mcp/tools/source_tools.py`

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

### fetch_config_tool(args: dict) → list[TextContent]

**Async function**

Fetch config from API, git URL, or named source.

Supports three modes:
1. Named source from registry (highest priority)
2. Direct git URL
3. API (default, backward compatible)

Args:
    args: Dictionary containing:
        - config_name: Name of config to download (optional for API list mode)
        - destination: Directory to save config file (default: "configs")
        - list_available: List all available configs from API (default: false)
        - category: Filter configs by category when listing (optional)
        - git_url: Git repository URL (enables git mode)
        - source: Named source from registry (enables named source mode)
        - branch: Git branch to use (default: "main")
        - token: Authentication token for private repos (optional)
        - refresh: Force refresh cached git repository (default: false)

Returns:
    List of TextContent with fetch results or config list

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| args | dict | - | - |

**Returns**: `list[TextContent]`



### submit_config_tool(args: dict) → list[TextContent]

**Async function**

Submit a custom config to skill-seekers-configs repository via GitHub issue.

Validates the config (both legacy and unified formats) and creates a GitHub
issue for community review.

Args:
    args: Dictionary containing:
        - config_path: Path to config JSON file (optional)
        - config_json: Config JSON as string (optional, alternative to config_path)
        - testing_notes: Notes about testing (optional)
        - github_token: GitHub personal access token (optional, can use GITHUB_TOKEN env var)

Returns:
    List of TextContent with submission results

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| args | dict | - | - |

**Returns**: `list[TextContent]`



### add_config_source_tool(args: dict) → list[TextContent]

**Async function**

Register a git repository as a config source.

Allows fetching configs from private/team repos. Use this to set up named
sources that can be referenced by fetch_config.

Args:
    args: Dictionary containing:
        - name: Source identifier (required)
        - git_url: Git repository URL (required)
        - source_type: Source type (default: "github")
        - token_env: Environment variable name for auth token (optional)
        - branch: Git branch to use (default: "main")
        - priority: Source priority (default: 100, lower = higher priority)
        - enabled: Whether source is enabled (default: true)

Returns:
    List of TextContent with registration results

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| args | dict | - | - |

**Returns**: `list[TextContent]`



### list_config_sources_tool(args: dict) → list[TextContent]

**Async function**

List all registered config sources.

Shows git repositories that have been registered with add_config_source.

Args:
    args: Dictionary containing:
        - enabled_only: Only show enabled sources (default: false)

Returns:
    List of TextContent with source list

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| args | dict | - | - |

**Returns**: `list[TextContent]`



### remove_config_source_tool(args: dict) → list[TextContent]

**Async function**

Remove a registered config source.

Deletes the source from the registry. Does not delete cached git repository data.

Args:
    args: Dictionary containing:
        - name: Source identifier to remove (required)

Returns:
    List of TextContent with removal results

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| args | dict | - | - |

**Returns**: `list[TextContent]`


