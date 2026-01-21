# API Reference: server_legacy.py

**Language**: Python

**Source**: `src/skill_seekers/mcp/server_legacy.py`

---

## Functions

### safe_decorator(decorator_func)

Returns the decorator if MCP is available, otherwise returns a no-op

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| decorator_func | None | - | - |

**Returns**: (none)



### run_subprocess_with_streaming(cmd, timeout = None)

Run subprocess with real-time output streaming.
Returns (stdout, stderr, returncode).

This solves the blocking issue where long-running processes (like scraping)
would cause MCP to appear frozen. Now we stream output as it comes.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| cmd | None | - | - |
| timeout | None | None | - |

**Returns**: (none)



### list_tools() → list[Tool]

**Async function**

List available tools

**Returns**: `list[Tool]`



### call_tool(name: str, arguments: Any) → list[TextContent]

**Async function**

Handle tool calls

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| name | str | - | - |
| arguments | Any | - | - |

**Returns**: `list[TextContent]`



### generate_config_tool(args: dict) → list[TextContent]

**Async function**

Generate a config file

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| args | dict | - | - |

**Returns**: `list[TextContent]`



### estimate_pages_tool(args: dict) → list[TextContent]

**Async function**

Estimate page count

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| args | dict | - | - |

**Returns**: `list[TextContent]`



### scrape_docs_tool(args: dict) → list[TextContent]

**Async function**

Scrape documentation - auto-detects unified vs legacy format

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| args | dict | - | - |

**Returns**: `list[TextContent]`



### package_skill_tool(args: dict) → list[TextContent]

**Async function**

Package skill to .zip and optionally auto-upload

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| args | dict | - | - |

**Returns**: `list[TextContent]`



### upload_skill_tool(args: dict) → list[TextContent]

**Async function**

Upload skill .zip to Claude

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| args | dict | - | - |

**Returns**: `list[TextContent]`



### list_configs_tool(_args: dict) → list[TextContent]

**Async function**

List available configs

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| _args | dict | - | - |

**Returns**: `list[TextContent]`



### validate_config_tool(args: dict) → list[TextContent]

**Async function**

Validate a config file - supports both legacy and unified formats

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| args | dict | - | - |

**Returns**: `list[TextContent]`



### split_config_tool(args: dict) → list[TextContent]

**Async function**

Split large config into multiple focused configs

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| args | dict | - | - |

**Returns**: `list[TextContent]`



### generate_router_tool(args: dict) → list[TextContent]

**Async function**

Generate router skill for split documentation

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| args | dict | - | - |

**Returns**: `list[TextContent]`



### scrape_pdf_tool(args: dict) → list[TextContent]

**Async function**

Scrape PDF documentation and build skill

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| args | dict | - | - |

**Returns**: `list[TextContent]`



### scrape_github_tool(args: dict) → list[TextContent]

**Async function**

Scrape GitHub repository to Claude skill (C1.11)

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| args | dict | - | - |

**Returns**: `list[TextContent]`



### fetch_config_tool(args: dict) → list[TextContent]

**Async function**

Fetch config from API, git URL, or named source

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| args | dict | - | - |

**Returns**: `list[TextContent]`



### install_skill_tool(args: dict) → list[TextContent]

**Async function**

Complete skill installation workflow.

Orchestrates the complete workflow:
    1. Fetch config (if config_name provided)
    2. Scrape documentation
    3. AI Enhancement (MANDATORY - no skip option)
    4. Package to .zip
    5. Upload to Claude (optional)

Args:
    config_name: Config to fetch from API (mutually exclusive with config_path)
    config_path: Path to existing config (mutually exclusive with config_name)
    destination: Output directory (default: "output")
    auto_upload: Upload after packaging (default: True)
    unlimited: Remove page limits (default: False)
    dry_run: Preview only (default: False)

Returns:
    List of TextContent with workflow progress and results

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| args | dict | - | - |

**Returns**: `list[TextContent]`



### submit_config_tool(args: dict) → list[TextContent]

**Async function**

Submit a custom config to skill-seekers-configs repository via GitHub issue

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| args | dict | - | - |

**Returns**: `list[TextContent]`



### add_config_source_tool(args: dict) → list[TextContent]

**Async function**

Register a git repository as a config source

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| args | dict | - | - |

**Returns**: `list[TextContent]`



### list_config_sources_tool(args: dict) → list[TextContent]

**Async function**

List all registered config sources

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| args | dict | - | - |

**Returns**: `list[TextContent]`



### remove_config_source_tool(args: dict) → list[TextContent]

**Async function**

Remove a registered config source

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| args | dict | - | - |

**Returns**: `list[TextContent]`



### main()

**Async function**

Run the MCP server

**Returns**: (none)



### noop_decorator(func)

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| func | None | - | - |

**Returns**: (none)


