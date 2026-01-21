# API Reference: markdown.py

**Language**: Python

**Source**: `src/skill_seekers/cli/adaptors/markdown.py`

---

## Classes

### MarkdownAdaptor

Generic Markdown platform adaptor.

Handles:
- Pure markdown format (no platform-specific formatting)
- ZIP packaging with combined or individual files
- No upload capability (manual use)
- No AI enhancement (generic export only)

**Inherits from**: SkillAdaptor

#### Methods

##### format_skill_md(self, skill_dir: Path, metadata: SkillMetadata) → str

Format SKILL.md as pure markdown.

Clean, universal markdown that works with any LLM or documentation system.

Args:
    skill_dir: Path to skill directory
    metadata: Skill metadata

Returns:
    Formatted markdown content

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| skill_dir | Path | - | - |
| metadata | SkillMetadata | - | - |

**Returns**: `str`


##### package(self, skill_dir: Path, output_path: Path) → Path

Package skill into ZIP file with markdown documentation.

Creates universal structure:
- README.md (combined documentation)
- references/*.md (individual reference files)
- metadata.json (skill information)

Args:
    skill_dir: Path to skill directory
    output_path: Output path/filename for ZIP

Returns:
    Path to created ZIP file

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| skill_dir | Path | - | - |
| output_path | Path | - | - |

**Returns**: `Path`


##### upload(self, package_path: Path, _api_key: str) → dict[str, Any]

Generic markdown export does not support upload.

Users should manually use the exported markdown files.

Args:
    package_path: Path to package file
    api_key: Not used
    **kwargs: Not used

Returns:
    Result indicating no upload capability

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| package_path | Path | - | - |
| _api_key | str | - | - |

**Returns**: `dict[str, Any]`


##### validate_api_key(self, _api_key: str) → bool

Markdown export doesn't use API keys.

Args:
    api_key: Not used

Returns:
    Always False (no API needed)

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| _api_key | str | - | - |

**Returns**: `bool`


##### get_env_var_name(self) → str

No API key needed for markdown export.

Returns:
    Empty string

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |

**Returns**: `str`


##### supports_enhancement(self) → bool

Markdown export doesn't support AI enhancement.

Returns:
    False

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |

**Returns**: `bool`


##### enhance(self, _skill_dir: Path, _api_key: str) → bool

Markdown export doesn't support enhancement.

Args:
    skill_dir: Not used
    api_key: Not used

Returns:
    False

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| _skill_dir | Path | - | - |
| _api_key | str | - | - |

**Returns**: `bool`


##### _create_combined_doc(self, skill_dir: Path) → str

Create a combined documentation file from all references.

Args:
    skill_dir: Path to skill directory

Returns:
    Combined markdown content

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| skill_dir | Path | - | - |

**Returns**: `str`



