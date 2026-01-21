# API Reference: openai.py

**Language**: Python

**Source**: `src/skill_seekers/cli/adaptors/openai.py`

---

## Classes

### OpenAIAdaptor

OpenAI ChatGPT platform adaptor.

Handles:
- Assistant instructions format (not YAML frontmatter)
- ZIP packaging for Assistants API
- Upload creates Assistant + Vector Store
- AI enhancement using GPT-4o

**Inherits from**: SkillAdaptor

#### Methods

##### format_skill_md(self, skill_dir: Path, metadata: SkillMetadata) → str

Format SKILL.md as Assistant instructions.

OpenAI Assistants use instructions rather than markdown docs.

Args:
    skill_dir: Path to skill directory
    metadata: Skill metadata

Returns:
    Formatted instructions for OpenAI Assistant

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| skill_dir | Path | - | - |
| metadata | SkillMetadata | - | - |

**Returns**: `str`


##### package(self, skill_dir: Path, output_path: Path) → Path

Package skill into ZIP file for OpenAI Assistants.

Creates OpenAI-compatible structure:
- assistant_instructions.txt (main instructions)
- vector_store_files/*.md (reference files for vector store)
- openai_metadata.json (skill metadata)

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


##### upload(self, package_path: Path, api_key: str) → dict[str, Any]

Upload skill ZIP to OpenAI Assistants API.

Creates:
1. Vector Store with reference files
2. Assistant with file_search tool

Args:
    package_path: Path to skill ZIP file
    api_key: OpenAI API key
    **kwargs: Additional arguments (model, etc.)

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

Validate OpenAI API key format.

Args:
    api_key: API key to validate

Returns:
    True if key starts with 'sk-'

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| api_key | str | - | - |

**Returns**: `bool`


##### get_env_var_name(self) → str

Get environment variable name for OpenAI API key.

Returns:
    'OPENAI_API_KEY'

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |

**Returns**: `str`


##### supports_enhancement(self) → bool

OpenAI supports AI enhancement via GPT-4o.

Returns:
    True

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |

**Returns**: `bool`


##### enhance(self, skill_dir: Path, api_key: str) → bool

Enhance SKILL.md using GPT-4o API.

Args:
    skill_dir: Path to skill directory
    api_key: OpenAI API key

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

Build OpenAI API prompt for enhancement.

Args:
    skill_name: Name of the skill
    references: Dictionary of reference content
    current_skill_md: Existing SKILL.md content (optional)

Returns:
    Enhancement prompt for GPT-4o

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| skill_name | str | - | - |
| references | dict[str, str] | - | - |
| current_skill_md | str | None | - |

**Returns**: `str`



