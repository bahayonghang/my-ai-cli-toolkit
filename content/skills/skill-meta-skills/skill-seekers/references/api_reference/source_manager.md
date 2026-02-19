# API Reference: source_manager.py

**Language**: Python

**Source**: `src/skill_seekers/mcp/source_manager.py`

---

## Classes

### SourceManager

Manages config source registry at ~/.skill-seekers/sources.json

**Inherits from**: (none)

#### Methods

##### __init__(self, config_dir: str | None = None)

Initialize source manager.

Args:
    config_dir: Base config directory. Defaults to ~/.skill-seekers/

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| config_dir | str | None | None | - |


##### add_source(self, name: str, git_url: str, source_type: str = 'github', token_env: str | None = None, branch: str = 'main', priority: int = 100, enabled: bool = True) → dict

Add or update a config source.

Args:
    name: Source identifier (lowercase, alphanumeric + hyphens/underscores)
    git_url: Git repository URL
    source_type: Source type (github, gitlab, bitbucket, custom)
    token_env: Environment variable name for auth token
    branch: Git branch to use (default: main)
    priority: Source priority (lower = higher priority, default: 100)
    enabled: Whether source is enabled (default: True)

Returns:
    Source dictionary

Raises:
    ValueError: If name is invalid or git_url is empty

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| name | str | - | - |
| git_url | str | - | - |
| source_type | str | 'github' | - |
| token_env | str | None | None | - |
| branch | str | 'main' | - |
| priority | int | 100 | - |
| enabled | bool | True | - |

**Returns**: `dict`


##### get_source(self, name: str) → dict

Get source by name.

Args:
    name: Source identifier

Returns:
    Source dictionary

Raises:
    KeyError: If source not found

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| name | str | - | - |

**Returns**: `dict`


##### list_sources(self, enabled_only: bool = False) → list[dict]

List all config sources.

Args:
    enabled_only: If True, only return enabled sources

Returns:
    List of source dictionaries (sorted by priority)

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| enabled_only | bool | False | - |

**Returns**: `list[dict]`


##### remove_source(self, name: str) → bool

Remove source by name.

Args:
    name: Source identifier

Returns:
    True if removed, False if not found

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| name | str | - | - |

**Returns**: `bool`


##### update_source(self, name: str) → dict

Update specific fields of an existing source.

Args:
    name: Source identifier
    **kwargs: Fields to update (git_url, branch, enabled, priority, etc.)

Returns:
    Updated source dictionary

Raises:
    KeyError: If source not found

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| name | str | - | - |

**Returns**: `dict`


##### _read_registry(self) → dict

Read registry from file.

Returns:
    Registry dictionary

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |

**Returns**: `dict`


##### _write_registry(self, registry: dict) → None

Write registry to file atomically.

Args:
    registry: Registry dictionary

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| registry | dict | - | - |

**Returns**: `None`


##### _default_token_env(source_type: str) → str

Get default token environment variable name for source type.

Args:
    source_type: Source type (github, gitlab, bitbucket, custom)

Returns:
    Environment variable name (e.g., GITHUB_TOKEN)

**Decorators**: `@staticmethod`

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| source_type | str | - | - |

**Returns**: `str`



