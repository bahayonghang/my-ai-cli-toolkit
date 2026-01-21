# API Reference: llms_txt_detector.py

**Language**: Python

**Source**: `src/skill_seekers/cli/llms_txt_detector.py`

---

## Classes

### LlmsTxtDetector

Detect llms.txt files at documentation URLs

**Inherits from**: (none)

#### Methods

##### __init__(self, base_url: str)

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| base_url | str | - | - |


##### detect(self) → dict[str, str] | None

Detect available llms.txt variant.

Returns:
    Dict with 'url' and 'variant' keys, or None if not found

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |

**Returns**: `dict[str, str] | None`


##### detect_all(self) → list[dict[str, str]]

Detect all available llms.txt variants.

Returns:
    List of dicts with 'url' and 'variant' keys for each found variant

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |

**Returns**: `list[dict[str, str]]`


##### _check_url_exists(self, url: str) → bool

Check if URL returns 200 status

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| url | str | - | - |

**Returns**: `bool`



