# API Reference: agent_detector.py

**Language**: Python

**Source**: `src/skill_seekers/mcp/agent_detector.py`

---

## Classes

### AgentDetector

Detects installed AI coding agents and generates their MCP configurations.

**Inherits from**: (none)

#### Methods

##### __init__(self)

Initialize the agent detector.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### detect_agents(self) → list[dict[str, str]]

Detect installed AI coding agents on the system.

Returns:
    List of detected agents with their config paths.
    Each dict contains: {'agent': str, 'name': str, 'config_path': str, 'transport': str}

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |

**Returns**: `list[dict[str, str]]`


##### _get_config_path(self, agent_id: str) → str | None

Get the configuration path for a specific agent.

Args:
    agent_id: Agent identifier (e.g., 'claude-code', 'cursor')

Returns:
    Expanded config path if the parent directory exists, None otherwise

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| agent_id | str | - | - |

**Returns**: `str | None`


##### get_transport_type(self, agent_id: str) → str | None

Get the transport type for a specific agent.

Args:
    agent_id: Agent identifier

Returns:
    'stdio' or 'http', or None if agent not found

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| agent_id | str | - | - |

**Returns**: `str | None`


##### generate_config(self, agent_id: str, server_command: str, http_port: int | None = 3000) → str | None

Generate MCP configuration for a specific agent.

Args:
    agent_id: Agent identifier
    server_command: Command to start the MCP server (e.g., 'skill-seekers mcp')
    http_port: Port for HTTP transport (default: 3000)

Returns:
    Configuration string (JSON or XML) or None if agent not found

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| agent_id | str | - | - |
| server_command | str | - | - |
| http_port | int | None | 3000 | - |

**Returns**: `str | None`


##### _generate_stdio_config(self, server_command: str) → str

Generate stdio-based MCP configuration (JSON format).

Args:
    server_command: Command to start the MCP server

Returns:
    JSON configuration string

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| server_command | str | - | - |

**Returns**: `str`


##### _generate_http_config(self, http_port: int) → str

Generate HTTP-based MCP configuration (JSON format).

Args:
    http_port: Port number for HTTP server

Returns:
    JSON configuration string

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| http_port | int | - | - |

**Returns**: `str`


##### _generate_intellij_config(self, _server_command: str, http_port: int) → str

Generate IntelliJ IDEA MCP configuration (XML format).

Args:
    server_command: Command to start the MCP server
    http_port: Port number for HTTP server

Returns:
    XML configuration string

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| _server_command | str | - | - |
| http_port | int | - | - |

**Returns**: `str`


##### get_all_config_paths(self) → dict[str, str]

Get all possible configuration paths for the current system.

Returns:
    Dict mapping agent_id to config_path

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |

**Returns**: `dict[str, str]`


##### is_agent_installed(self, agent_id: str) → bool

Check if a specific agent is installed.

Args:
    agent_id: Agent identifier

Returns:
    True if agent appears to be installed, False otherwise

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| agent_id | str | - | - |

**Returns**: `bool`


##### get_agent_info(self, agent_id: str) → dict[str, Any] | None

Get detailed information about a specific agent.

Args:
    agent_id: Agent identifier

Returns:
    Dict with agent details or None if not found

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| agent_id | str | - | - |

**Returns**: `dict[str, Any] | None`




## Functions

### detect_agents() → list[dict[str, str]]

Convenience function to detect installed agents.

Returns:
    List of detected agents

**Returns**: `list[dict[str, str]]`



### generate_config(agent_name: str, server_command: str = 'skill-seekers mcp', http_port: int = 3000) → str | None

Convenience function to generate config for a specific agent.

Args:
    agent_name: Agent identifier
    server_command: Command to start the MCP server
    http_port: Port for HTTP transport

Returns:
    Configuration string or None

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| agent_name | str | - | - |
| server_command | str | 'skill-seekers mcp' | - |
| http_port | int | 3000 | - |

**Returns**: `str | None`



### get_transport_type(agent_name: str) → str | None

Convenience function to get transport type for an agent.

Args:
    agent_name: Agent identifier

Returns:
    'stdio' or 'http', or None

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| agent_name | str | - | - |

**Returns**: `str | None`


