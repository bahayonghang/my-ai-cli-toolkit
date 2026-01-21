# API Reference: packaging_tools.py

**Language**: Python

**Source**: `src/skill_seekers/mcp/tools/packaging_tools.py`

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

### run_subprocess_with_streaming(cmd: list[str], timeout: int = None) → tuple[str, str, int]

Run subprocess with real-time output streaming.

This solves the blocking issue where long-running processes (like scraping)
would cause MCP to appear frozen. Now we stream output as it comes.

Args:
    cmd: Command to run as list of strings
    timeout: Maximum time to wait in seconds (None for no timeout)

Returns:
    Tuple of (stdout, stderr, returncode)

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| cmd | list[str] | - | - |
| timeout | int | None | - |

**Returns**: `tuple[str, str, int]`



### package_skill_tool(args: dict) → list[TextContent]

**Async function**

Package skill for target LLM platform and optionally auto-upload.

Args:
    args: Dictionary with:
        - skill_dir (str): Path to skill directory (e.g., output/react/)
        - auto_upload (bool): Try to upload automatically if API key is available (default: True)
        - target (str): Target platform (default: 'claude')
                       Options: 'claude', 'gemini', 'openai', 'markdown'

Returns:
    List of TextContent with packaging results

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| args | dict | - | - |

**Returns**: `list[TextContent]`



### upload_skill_tool(args: dict) → list[TextContent]

**Async function**

Upload skill package to target LLM platform.

Args:
    args: Dictionary with:
        - skill_zip (str): Path to skill package (.zip or .tar.gz)
        - target (str): Target platform (default: 'claude')
                       Options: 'claude', 'gemini', 'openai'
                       Note: 'markdown' does not support upload
        - api_key (str, optional): API key (uses env var if not provided)

Returns:
    List of TextContent with upload results

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| args | dict | - | - |

**Returns**: `list[TextContent]`



### enhance_skill_tool(args: dict) → list[TextContent]

**Async function**

Enhance SKILL.md with AI using target platform's model.

Args:
    args: Dictionary with:
        - skill_dir (str): Path to skill directory
        - target (str): Target platform (default: 'claude')
                       Options: 'claude', 'gemini', 'openai'
                       Note: 'markdown' does not support enhancement
        - mode (str): Enhancement mode (default: 'local')
                     'local': Uses Claude Code Max (no API key)
                     'api': Uses platform API (requires API key)
        - api_key (str, optional): API key for 'api' mode

Returns:
    List of TextContent with enhancement results

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
    4. Package for target platform (ZIP or tar.gz)
    5. Upload to target platform (optional)

Args:
    args: Dictionary with:
        - config_name (str, optional): Config to fetch from API (mutually exclusive with config_path)
        - config_path (str, optional): Path to existing config (mutually exclusive with config_name)
        - destination (str): Output directory (default: "output")
        - auto_upload (bool): Upload after packaging (default: True)
        - unlimited (bool): Remove page limits (default: False)
        - dry_run (bool): Preview only (default: False)
        - target (str): Target LLM platform (default: "claude")

Returns:
    List of TextContent with workflow progress and results

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| args | dict | - | - |

**Returns**: `list[TextContent]`


