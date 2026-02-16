# API Reference: gemini.py

**Language**: Python

**Source**: `src/skill_seekers/cli/adaptors/gemini.py`

---

## Classes

### GeminiAdaptor

Google Gemini platform adaptor.

Handles:
- Plain markdown format (no YAML frontmatter)
- tar.gz packaging for Gemini Files API
- Upload to Google AI Studio / Files API
- AI enhancement using Gemini 2.0 Flash

**Inherits from**: SkillAdaptor

#### Methods

##### format_skill_md(self, skill_dir: Path, metadata: SkillMetadata) → str

Format SKILL.md with plain markdown (no frontmatter).

Gemini doesn't use YAML frontmatter - just clean markdown.

Args:
    skill_dir: Path to skill directory
    metadata: Skill metadata

Returns:
    Formatted SKILL.md content (plain markdown)

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| skill_dir | Path | - | - |
| metadata | SkillMetadata | - | - |

**Returns**: `str`


##### package(self, skill_dir: Path, output_path: Path) → Path

Package skill into tar.gz file for Gemini.

Creates Gemini-compatible structure:
- system_instructions.md (main SKILL.md)
- references/*.md
- gemini_metadata.json (skill metadata)

Args:
    skill_dir: Path to skill directory
    output_path: Output path/filename for tar.gz

Returns:
    Path to created tar.gz file

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| skill_dir | Path | - | - |
| output_path | Path | - | - |

**Returns**: `Path`


##### upload(self, package_path: Path, api_key: str) → dict[str, Any]

Upload skill tar.gz to Gemini Files API.

Args:
    package_path: Path to skill tar.gz file
    api_key: Google API key
    **kwargs: Additional arguments

Returns:
    Dictionary with upload result

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| package_path | Path | - | - |
| api_key | str | - | - |

**Returns**: `dict[str, Any]`


##### validate_api_key(self, api_key: str) → bool

Validate Google API key format.

Args:
    api_key: API key to validate

Returns:
    True if key starts with 'AIza'

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| api_key | str | - | - |

**Returns**: `bool`


##### get_env_var_name(self) → str

Get environment variable name for Google API key.

Returns:
    'GOOGLE_API_KEY'

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |

**Returns**: `str`


##### supports_enhancement(self) → bool

Gemini supports AI enhancement via Gemini 2.0 Flash.

Returns:
    True

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |

**Returns**: `bool`


##### enhance(self, skill_dir: Path, api_key: str) → bool

Enhance SKILL.md using Gemini 2.0 Flash API.

Args:
    skill_dir: Path to skill directory
    api_key: Google API key

Returns:
    True if enhancement succeeded

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| skill_dir | Path | - | - |
| api_key | str | - | - |

**Returns**: `bool`


##### _read_reference_files(self, references_dir: Path, max_chars: int = 200000) → dict[str, str]

Read reference markdown files from skill directory.

Args:
    references_dir: Path to references directory
    max_chars: Maximum total characters to read

Returns:
    Dictionary mapping filename to content

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| references_dir | Path | - | - |
| max_chars | int | 200000 | - |

**Returns**: `dict[str, str]`


##### _build_enhancement_prompt(self, skill_name: str, references: dict[str, str], current_skill_md: str = None) → str

Build Gemini API prompt for enhancement.

Args:
    skill_name: Name of the skill
    references: Dictionary of reference content
    current_skill_md: Existing SKILL.md content (optional)

Returns:
    Enhancement prompt for Gemini

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| skill_name | str | - | - |
| references | dict[str, str] | - | - |
| current_skill_md | str | None | - |

**Returns**: `str`



