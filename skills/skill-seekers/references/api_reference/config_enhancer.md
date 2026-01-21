# API Reference: config_enhancer.py

**Language**: Python

**Source**: `src/skill_seekers/cli/config_enhancer.py`

---

## Classes

### ConfigEnhancement

AI-generated enhancement for a configuration

**Inherits from**: (none)



### EnhancedConfigFile

Configuration file with AI enhancements

**Inherits from**: (none)



### ConfigEnhancer

AI enhancement for configuration extraction results.

Supports dual-mode operation:
- API mode: Uses Claude API (requires ANTHROPIC_API_KEY)
- LOCAL mode: Uses Claude Code CLI (no API key needed)
- AUTO mode: Automatically detects best available mode

**Inherits from**: (none)

#### Methods

##### __init__(self, mode: str = 'auto')

Initialize ConfigEnhancer.

Args:
    mode: Enhancement mode - "api", "local", or "auto" (default)

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| mode | str | 'auto' | - |


##### _detect_mode(self, requested_mode: str) → str

Detect best enhancement mode.

Args:
    requested_mode: User-requested mode

Returns:
    Actual mode to use

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| requested_mode | str | - | - |

**Returns**: `str`


##### enhance_config_result(self, result: dict) → dict

Enhance entire configuration extraction result.

Args:
    result: ConfigExtractionResult as dict

Returns:
    Enhanced result with AI insights

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| result | dict | - | - |

**Returns**: `dict`


##### _enhance_via_api(self, result: dict) → dict

Enhance configs using Claude API

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| result | dict | - | - |

**Returns**: `dict`


##### _create_enhancement_prompt(self, result: dict) → str

Create prompt for Claude API

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| result | dict | - | - |

**Returns**: `str`


##### _parse_api_response(self, response_text: str, original_result: dict) → dict

Parse Claude API response and merge with original result

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| response_text | str | - | - |
| original_result | dict | - | - |

**Returns**: `dict`


##### _enhance_via_local(self, result: dict) → dict

Enhance configs using Claude Code CLI

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| result | dict | - | - |

**Returns**: `dict`


##### _create_local_prompt(self, result: dict) → str

Create prompt file for Claude Code CLI

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| result | dict | - | - |

**Returns**: `str`


##### _run_claude_cli(self, prompt_file: Path, _output_file: Path) → dict | None

Run Claude Code CLI and wait for completion

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| prompt_file | Path | - | - |
| _output_file | Path | - | - |

**Returns**: `dict | None`




## Functions

### main()

Command-line interface for config enhancement

**Returns**: (none)


