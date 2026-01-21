# API Reference: config_extractor.py

**Language**: Python

**Source**: `src/skill_seekers/cli/config_extractor.py`

---

## Classes

### ConfigSetting

Individual configuration setting

**Inherits from**: (none)



### ConfigFile

Represents a configuration file

**Inherits from**: (none)



### ConfigExtractionResult

Result of config extraction

**Inherits from**: (none)

#### Methods

##### to_dict(self) → dict

Convert result to dictionary for JSON output

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |

**Returns**: `dict`


##### to_markdown(self) → str

Generate markdown report of extraction results

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |

**Returns**: `str`




### ConfigFileDetector

Detect configuration files in codebase

**Inherits from**: (none)

#### Methods

##### find_config_files(self, directory: Path, max_files: int = 100) → list[ConfigFile]

Find all configuration files in directory.

Args:
    directory: Root directory to search
    max_files: Maximum number of config files to find

Returns:
    List of ConfigFile objects

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| directory | Path | - | - |
| max_files | int | 100 | - |

**Returns**: `list[ConfigFile]`


##### _walk_directory(self, directory: Path)

Walk directory, skipping excluded directories

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| directory | Path | - | - |


##### _detect_config_type(self, file_path: Path) → str | None

Detect configuration file type

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| file_path | Path | - | - |

**Returns**: `str | None`


##### _infer_purpose(self, file_path: Path, _config_type: str) → str

Infer configuration purpose from file path and name

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| file_path | Path | - | - |
| _config_type | str | - | - |

**Returns**: `str`




### ConfigParser

Parse different configuration file formats

**Inherits from**: (none)

#### Methods

##### parse_config_file(self, config_file: ConfigFile) → ConfigFile

Parse configuration file and extract settings.

Args:
    config_file: ConfigFile object to parse

Returns:
    Updated ConfigFile with settings populated

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| config_file | ConfigFile | - | - |

**Returns**: `ConfigFile`


##### _parse_json(self, config_file: ConfigFile)

Parse JSON configuration

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| config_file | ConfigFile | - | - |


##### _parse_yaml(self, config_file: ConfigFile)

Parse YAML configuration

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| config_file | ConfigFile | - | - |


##### _parse_toml(self, config_file: ConfigFile)

Parse TOML configuration

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| config_file | ConfigFile | - | - |


##### _parse_env(self, config_file: ConfigFile)

Parse .env file

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| config_file | ConfigFile | - | - |


##### _parse_ini(self, config_file: ConfigFile)

Parse INI configuration

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| config_file | ConfigFile | - | - |


##### _parse_python_config(self, config_file: ConfigFile)

Parse Python configuration module

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| config_file | ConfigFile | - | - |


##### _parse_javascript_config(self, config_file: ConfigFile)

Parse JavaScript/TypeScript config (basic extraction)

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| config_file | ConfigFile | - | - |


##### _parse_dockerfile(self, config_file: ConfigFile)

Parse Dockerfile configuration

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| config_file | ConfigFile | - | - |


##### _extract_settings_from_dict(self, data: dict, config_file: ConfigFile, parent_path: list[str] = None)

Recursively extract settings from dictionary

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| data | dict | - | - |
| config_file | ConfigFile | - | - |
| parent_path | list[str] | None | - |


##### _infer_type(self, value: Any) → str

Infer value type

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| value | Any | - | - |

**Returns**: `str`


##### _extract_env_description(self, lines: list[str], line_index: int) → str

Extract description from comment above env variable

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| lines | list[str] | - | - |
| line_index | int | - | - |

**Returns**: `str`


##### _extract_python_docstring(self, _node: ast.AST) → str

Extract docstring/comment for Python node

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| _node | ast.AST | - | - |

**Returns**: `str`




### ConfigPatternDetector

Detect common configuration patterns

**Inherits from**: (none)

#### Methods

##### detect_patterns(self, config_file: ConfigFile) → list[str]

Detect which patterns this config file matches.

Args:
    config_file: ConfigFile with settings extracted

Returns:
    List of detected pattern names

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| config_file | ConfigFile | - | - |

**Returns**: `list[str]`




### ConfigExtractor

Main configuration extraction orchestrator

**Inherits from**: (none)

#### Methods

##### __init__(self)

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### extract_from_directory(self, directory: Path, max_files: int = 100) → ConfigExtractionResult

Extract configuration patterns from directory.

Args:
    directory: Root directory to analyze
    max_files: Maximum config files to process

Returns:
    ConfigExtractionResult with all findings

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| directory | Path | - | - |
| max_files | int | 100 | - |

**Returns**: `ConfigExtractionResult`


##### to_dict(self, result: ConfigExtractionResult) → dict

Convert result to dictionary for JSON output

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| result | ConfigExtractionResult | - | - |

**Returns**: `dict`




## Functions

### main()

CLI entry point for config extraction

**Returns**: (none)


