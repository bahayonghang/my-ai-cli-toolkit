# API Reference: base.py

**Language**: Python

**Source**: `src/skill_seekers/cli/adaptors/base.py`

---

## Classes

### SkillMetadata

Universal skill metadata used across all platforms

**Inherits from**: (none)



### SkillAdaptor

Abstract base class for platform-specific skill adaptors.

Each platform (Claude, Gemini, OpenAI) implements this interface to handle:
- Platform-specific SKILL.md formatting
- Platform-specific package structure (ZIP, tar.gz, etc.)
- Platform-specific upload endpoints and authentication
- Optional AI enhancement capabilities

**Inherits from**: ABC

#### Methods

##### __init__(self, config: dict[str, Any] | None = None)

Initialize adaptor with optional configuration.

Args:
    config: Platform-specific configuration options

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| config | dict[str, Any] | None | None | - |


##### format_skill_md(self, skill_dir: Path, metadata: SkillMetadata) → str

Format SKILL.md content with platform-specific frontmatter/structure.

Different platforms require different formats:
- Claude: YAML frontmatter + markdown
- Gemini: Plain markdown (no frontmatter)
- OpenAI: Assistant instructions format

Args:
    skill_dir: Path to skill directory containing references/
    metadata: Skill metadata (name, description, version, etc.)

Returns:
    Formatted SKILL.md content as string

**Decorators**: `@abstractmethod`

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| skill_dir | Path | - | - |
| metadata | SkillMetadata | - | - |

**Returns**: `str`


##### package(self, skill_dir: Path, output_path: Path) → Path

Package skill for platform (ZIP, tar.gz, etc.).

Different platforms require different package formats:
- Claude: .zip with SKILL.md, references/, scripts/, assets/
- Gemini: .tar.gz with system_instructions.md, references/
- OpenAI: .zip with assistant_instructions.txt, vector_store_files/

Args:
    skill_dir: Path to skill directory to package
    output_path: Path for output package (file or directory)

Returns:
    Path to created package file

**Decorators**: `@abstractmethod`

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| skill_dir | Path | - | - |
| output_path | Path | - | - |

**Returns**: `Path`


##### upload(self, package_path: Path, api_key: str) → dict[str, Any]

Upload packaged skill to platform.

Returns a standardized response dictionary for all platforms.

Args:
    package_path: Path to packaged skill file
    api_key: Platform API key
    **kwargs: Additional platform-specific arguments

Returns:
    Dictionary with keys:
    - success (bool): Whether upload succeeded
    - skill_id (str|None): Platform-specific skill/assistant ID
    - url (str|None): URL to view/manage skill
    - message (str): Success or error message

**Decorators**: `@abstractmethod`

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| package_path | Path | - | - |
| api_key | str | - | - |

**Returns**: `dict[str, Any]`


##### validate_api_key(self, api_key: str) → bool

Validate API key format for this platform.

Default implementation just checks if key is non-empty.
Override for platform-specific validation.

Args:
    api_key: API key to validate

Returns:
    True if key format is valid

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| api_key | str | - | - |

**Returns**: `bool`


##### get_env_var_name(self) → str

Get expected environment variable name for API key.

Returns:
    Environment variable name (e.g., "ANTHROPIC_API_KEY", "GOOGLE_API_KEY")

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |

**Returns**: `str`


##### supports_enhancement(self) → bool

Whether this platform supports AI-powered SKILL.md enhancement.

Returns:
    True if platform can enhance skills

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |

**Returns**: `bool`


##### enhance(self, _skill_dir: Path, _api_key: str) → bool

Optionally enhance SKILL.md using platform's AI.

Only called if supports_enhancement() returns True.

Args:
    skill_dir: Path to skill directory
    api_key: Platform API key

Returns:
    True if enhancement succeeded

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| _skill_dir | Path | - | - |
| _api_key | str | - | - |

**Returns**: `bool`


##### _read_existing_content(self, skill_dir: Path) → str

Helper to read existing SKILL.md content (without frontmatter).

Args:
    skill_dir: Path to skill directory

Returns:
    SKILL.md content without YAML frontmatter

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| skill_dir | Path | - | - |

**Returns**: `str`


##### _extract_quick_reference(self, skill_dir: Path) → str

Helper to extract quick reference section from references.

Args:
    skill_dir: Path to skill directory

Returns:
    Quick reference content as markdown string

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| skill_dir | Path | - | - |

**Returns**: `str`


##### _generate_toc(self, skill_dir: Path) → str

Helper to generate table of contents from references.

Args:
    skill_dir: Path to skill directory

Returns:
    Table of contents as markdown string

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| skill_dir | Path | - | - |

**Returns**: `str`



