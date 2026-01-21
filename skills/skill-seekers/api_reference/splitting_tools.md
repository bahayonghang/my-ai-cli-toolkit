# API Reference: splitting_tools.py

**Language**: Python

**Source**: `src/skill_seekers/mcp/tools/splitting_tools.py`

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



### split_config(args: dict) → list[TextContent]

**Async function**

Split large configs into multiple focused skills.

Supports both documentation and unified (multi-source) configs:
- Documentation configs: Split by categories, size, or create router skills
- Unified configs: Split by source type (documentation, github, pdf)

For large documentation sites (10K+ pages), this tool splits the config into
multiple smaller configs. For unified configs with multiple sources, splits
into separate configs per source type.

Args:
    args: Dictionary containing:
        - config_path (str): Path to config JSON file (e.g., configs/godot.json or configs/react_unified.json)
        - strategy (str, optional): Split strategy: auto, none, source, category, router, size (default: auto)
                                   'source' strategy is for unified configs only
        - target_pages (int, optional): Target pages per skill for doc configs (default: 5000)
        - dry_run (bool, optional): Preview without saving files (default: False)

Returns:
    List[TextContent]: Split results showing created configs and recommendations,
                      or error message if split failed.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| args | dict | - | - |

**Returns**: `list[TextContent]`



### generate_router(args: dict) → list[TextContent]

**Async function**

Generate router/hub skill for split documentation.

Creates an intelligent routing skill that helps users navigate between split
sub-skills. The router skill analyzes user queries and directs them to the
appropriate sub-skill based on content categories.

Args:
    args: Dictionary containing:
        - config_pattern (str): Config pattern for sub-skills (e.g., 'configs/godot-*.json')
        - router_name (str, optional): Router skill name (optional, inferred from configs)

Returns:
    List[TextContent]: Router skill creation results with usage instructions,
                      or error message if generation failed.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| args | dict | - | - |

**Returns**: `list[TextContent]`


