# API Reference: config_tools.py

**Language**: Python

**Source**: `src/skill_seekers/mcp/tools/config_tools.py`

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

### generate_config(args: dict) → list[TextContent]

**Async function**

Generate a config file for documentation scraping.

Interactively creates a JSON config for any documentation website with default
selectors and sensible defaults. The config can be further customized after creation.

Args:
    args: Dictionary containing:
        - name (str): Skill name (lowercase, alphanumeric, hyphens, underscores)
        - url (str): Base documentation URL (must include http:// or https://)
        - description (str): Description of when to use this skill
        - max_pages (int, optional): Maximum pages to scrape (default: 100, use -1 for unlimited)
        - unlimited (bool, optional): Remove all limits - scrape all pages (default: False). Overrides max_pages.
        - rate_limit (float, optional): Delay between requests in seconds (default: 0.5)

Returns:
    List[TextContent]: Success message with config path and next steps, or error message.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| args | dict | - | - |

**Returns**: `list[TextContent]`



### list_configs(_args: dict) → list[TextContent]

**Async function**

List all available preset configurations.

Scans the configs directory and lists all available config files with their
basic information (name, URL, description).

Args:
    args: Dictionary (empty, no parameters required)

Returns:
    List[TextContent]: Formatted list of available configs with details, or error if no configs found.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| _args | dict | - | - |

**Returns**: `list[TextContent]`



### validate_config(args: dict) → list[TextContent]

**Async function**

Validate a config file for errors.

Validates both legacy (single-source) and unified (multi-source) config formats.
Checks for required fields, valid URLs, proper structure, and provides detailed
feedback on any issues found.

Args:
    args: Dictionary containing:
        - config_path (str): Path to config JSON file to validate

Returns:
    List[TextContent]: Validation results with format details and any errors/warnings, or error message.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| args | dict | - | - |

**Returns**: `list[TextContent]`


