# API Reference: conflict_detector.py

**Language**: Python

**Source**: `src/skill_seekers/cli/conflict_detector.py`

---

## Classes

### Conflict

Represents a conflict between documentation and code.

**Inherits from**: (none)



### ConflictDetector

Detects conflicts between documentation and code sources.

**Inherits from**: (none)

#### Methods

##### __init__(self, docs_data: dict[str, Any], github_data: dict[str, Any])

Initialize conflict detector.

Args:
    docs_data: Data from documentation scraper
    github_data: Data from GitHub scraper with code analysis

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| docs_data | dict[str, Any] | - | - |
| github_data | dict[str, Any] | - | - |


##### _extract_docs_apis(self) → dict[str, dict[str, Any]]

Extract API information from documentation data.

Returns:
    Dict mapping API name to API info

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |

**Returns**: `dict[str, dict[str, Any]]`


##### _parse_doc_content_for_apis(self, content: str, source_url: str) → dict[str, dict]

Parse documentation content to extract API signatures.

This is a simplified approach - real implementation would need
to understand the documentation format (Sphinx, JSDoc, etc.)

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| content | str | - | - |
| source_url | str | - | - |

**Returns**: `dict[str, dict]`


##### _parse_param_string(self, params_str: str) → list[dict]

Parse parameter string into list of parameter dicts.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| params_str | str | - | - |

**Returns**: `list[dict]`


##### _extract_code_apis(self) → dict[str, dict[str, Any]]

Extract API information from GitHub code analysis.

Returns:
    Dict mapping API name to API info

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |

**Returns**: `dict[str, dict[str, Any]]`


##### detect_all_conflicts(self) → list[Conflict]

Detect all types of conflicts.

Returns:
    List of Conflict objects

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |

**Returns**: `list[Conflict]`


##### _find_missing_in_docs(self) → list[Conflict]

Find APIs that exist in code but not in documentation.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |

**Returns**: `list[Conflict]`


##### _find_missing_in_code(self) → list[Conflict]

Find APIs that are documented but don't exist in code.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |

**Returns**: `list[Conflict]`


##### _find_signature_mismatches(self) → list[Conflict]

Find APIs where signature differs between docs and code.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |

**Returns**: `list[Conflict]`


##### _compare_signatures(self, docs_info: dict, code_info: dict) → dict | None

Compare signatures between docs and code.

Returns:
    Dict with mismatch details if conflict found, None otherwise

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| docs_info | dict | - | - |
| code_info | dict | - | - |

**Returns**: `dict | None`


##### generate_summary(self, conflicts: list[Conflict]) → dict[str, Any]

Generate summary statistics for conflicts.

Args:
    conflicts: List of Conflict objects

Returns:
    Summary dict with statistics

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| conflicts | list[Conflict] | - | - |

**Returns**: `dict[str, Any]`


##### save_conflicts(self, conflicts: list[Conflict], output_path: str)

Save conflicts to JSON file.

Args:
    conflicts: List of Conflict objects
    output_path: Path to output JSON file

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| conflicts | list[Conflict] | - | - |
| output_path | str | - | - |



