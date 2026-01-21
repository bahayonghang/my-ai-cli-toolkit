# API Reference: git_repo.py

**Language**: Python

**Source**: `src/skill_seekers/mcp/git_repo.py`

---

## Classes

### GitConfigRepo

Manages git operations for config repositories.

**Inherits from**: (none)

#### Methods

##### __init__(self, cache_dir: str | None = None)

Initialize git repository manager.

Args:
    cache_dir: Base cache directory. Defaults to $SKILL_SEEKERS_CACHE_DIR
              or ~/.skill-seekers/cache/

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| cache_dir | str | None | None | - |


##### clone_or_pull(self, source_name: str, git_url: str, branch: str = 'main', token: str | None = None, force_refresh: bool = False) → Path

Clone repository if not cached, else pull latest changes.

Args:
    source_name: Source identifier (used for cache path)
    git_url: Git repository URL
    branch: Branch to clone/pull (default: main)
    token: Optional authentication token
    force_refresh: If True, delete cache and re-clone

Returns:
    Path to cloned repository

Raises:
    GitCommandError: If clone/pull fails
    ValueError: If git_url is invalid

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| source_name | str | - | - |
| git_url | str | - | - |
| branch | str | 'main' | - |
| token | str | None | None | - |
| force_refresh | bool | False | - |

**Returns**: `Path`


##### find_configs(self, repo_path: Path) → list[Path]

Find all config files (*.json) in repository.

Args:
    repo_path: Path to cloned repo

Returns:
    List of paths to *.json files (sorted by name)

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| repo_path | Path | - | - |

**Returns**: `list[Path]`


##### get_config(self, repo_path: Path, config_name: str) → dict

Load specific config by name from repository.

Args:
    repo_path: Path to cloned repo
    config_name: Config name (without .json extension)

Returns:
    Config dictionary

Raises:
    FileNotFoundError: If config not found
    ValueError: If config is invalid JSON

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| repo_path | Path | - | - |
| config_name | str | - | - |

**Returns**: `dict`


##### _load_config_file(self, config_path: Path) → dict

Load and validate config JSON file.

Args:
    config_path: Path to config file

Returns:
    Config dictionary

Raises:
    ValueError: If JSON is invalid

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| config_path | Path | - | - |

**Returns**: `dict`


##### inject_token(git_url: str, token: str) → str

Inject authentication token into git URL.

Converts SSH URLs to HTTPS and adds token for authentication.

Args:
    git_url: Original git URL
    token: Authentication token

Returns:
    URL with token injected

Examples:
    https://github.com/org/repo.git → https://TOKEN@github.com/org/repo.git
    git@github.com:org/repo.git → https://TOKEN@github.com/org/repo.git

**Decorators**: `@staticmethod`

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| git_url | str | - | - |
| token | str | - | - |

**Returns**: `str`


##### validate_git_url(git_url: str) → bool

Validate git URL format.

Args:
    git_url: Git repository URL

Returns:
    True if valid, False otherwise

**Decorators**: `@staticmethod`

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| git_url | str | - | - |

**Returns**: `bool`



