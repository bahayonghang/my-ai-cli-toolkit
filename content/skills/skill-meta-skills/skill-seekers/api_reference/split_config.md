# API Reference: split_config.py

**Language**: Python

**Source**: `src/skill_seekers/cli/split_config.py`

---

## Classes

### ConfigSplitter

Splits large documentation configs into multiple focused configs

**Inherits from**: (none)

#### Methods

##### __init__(self, config_path: str, strategy: str = 'auto', target_pages: int = 5000)

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| config_path | str | - | - |
| strategy | str | 'auto' | - |
| target_pages | int | 5000 | - |


##### load_config(self) → dict[str, Any]

Load configuration from file

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |

**Returns**: `dict[str, Any]`


##### is_unified_config(self) → bool

Check if this is a unified multi-source config

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |

**Returns**: `bool`


##### get_split_strategy(self) → str

Determine split strategy

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |

**Returns**: `str`


##### split_by_category(self, create_router: bool = False) → list[dict[str, Any]]

Split config by categories

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| create_router | bool | False | - |

**Returns**: `list[dict[str, Any]]`


##### split_by_size(self) → list[dict[str, Any]]

Split config by size (page count)

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |

**Returns**: `list[dict[str, Any]]`


##### split_by_source(self) → list[dict[str, Any]]

Split unified config by source type

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |

**Returns**: `list[dict[str, Any]]`


##### create_router_config(self, sub_configs: list[dict[str, Any]]) → dict[str, Any]

Create a router config that references sub-skills

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| sub_configs | list[dict[str, Any]] | - | - |

**Returns**: `dict[str, Any]`


##### split(self) → list[dict[str, Any]]

Execute split based on strategy

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |

**Returns**: `list[dict[str, Any]]`


##### save_configs(self, configs: list[dict[str, Any]], output_dir: Path = None) → list[Path]

Save configs to files

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| configs | list[dict[str, Any]] | - | - |
| output_dir | Path | None | - |

**Returns**: `list[Path]`




## Functions

### main()

**Returns**: (none)


