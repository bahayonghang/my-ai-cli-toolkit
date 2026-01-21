# API Reference: config_analyzer.py

**Language**: Python

**Source**: `api/config_analyzer.py`

---

## Classes

### ConfigAnalyzer

Analyzes Skill Seekers config files and extracts metadata

**Inherits from**: (none)

#### Methods

##### __init__(self, config_dir: Path, base_url: str = 'https://api.skillseekersweb.com')

Initialize config analyzer

Args:
    config_dir: Path to configs directory
    base_url: Base URL for download links

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| config_dir | Path | - | - |
| base_url | str | 'https://api.skillseekersweb.com' | - |


##### analyze_all_configs(self) → list[dict[str, Any]]

Analyze all config files and extract metadata

Returns:
    List of config metadata dicts

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |

**Returns**: `list[dict[str, Any]]`


##### analyze_config(self, config_path: Path) → dict[str, Any] | None

Analyze a single config file and extract metadata

Args:
    config_path: Path to config JSON file

Returns:
    Config metadata dict or None if invalid

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| config_path | Path | - | - |

**Returns**: `dict[str, Any] | None`


##### get_config_by_name(self, name: str) → dict[str, Any] | None

Get config metadata by name

Args:
    name: Config name (e.g., "react", "django")

Returns:
    Config metadata or None if not found

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| name | str | - | - |

**Returns**: `dict[str, Any] | None`


##### _determine_type(self, config_data: dict[str, Any]) → str

Determine if config is single-source or unified

Args:
    config_data: Config JSON data

Returns:
    "single-source" or "unified"

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| config_data | dict[str, Any] | - | - |

**Returns**: `str`


##### _get_primary_source(self, config_data: dict[str, Any], config_type: str) → str

Get primary source URL/repo

Args:
    config_data: Config JSON data
    config_type: "single-source" or "unified"

Returns:
    Primary source URL or repo name

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| config_data | dict[str, Any] | - | - |
| config_type | str | - | - |

**Returns**: `str`


##### _categorize_config(self, name: str, description: str, config_data: dict[str, Any]) → str

Auto-categorize config based on name and content

Args:
    name: Config name
    description: Config description
    config_data: Full config data

Returns:
    Category name

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| name | str | - | - |
| description | str | - | - |
| config_data | dict[str, Any] | - | - |

**Returns**: `str`


##### _extract_tags(self, name: str, description: str, config_data: dict[str, Any]) → list[str]

Extract relevant tags from config

Args:
    name: Config name
    description: Config description
    config_data: Full config data

Returns:
    List of tags

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| name | str | - | - |
| description | str | - | - |
| config_data | dict[str, Any] | - | - |

**Returns**: `list[str]`


##### _get_max_pages(self, config_data: dict[str, Any]) → int | None

Get max_pages value from config

Args:
    config_data: Config JSON data

Returns:
    max_pages value or None

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| config_data | dict[str, Any] | - | - |

**Returns**: `int | None`


##### _get_last_updated(self, config_path: Path) → str

Get last updated date from git history

Args:
    config_path: Path to config file

Returns:
    ISO format date string

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| config_path | Path | - | - |

**Returns**: `str`



