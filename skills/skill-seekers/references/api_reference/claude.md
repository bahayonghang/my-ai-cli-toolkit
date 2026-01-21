# API Reference: claude.py

**Language**: Python

**Source**: `src/skill_seekers/cli/adaptors/claude.py`

---

## Classes

### ClaudeAdaptor

Claude AI platform adaptor.

Handles:
- YAML frontmatter format for SKILL.md
- ZIP packaging with standard Claude skill structure
- Upload to Anthropic Skills API
- AI enhancement using Claude API

**Inherits from**: SkillAdaptor

#### Methods

##### format_skill_md(self, skill_dir: Path, metadata: SkillMetadata) → str

Format SKILL.md with Claude's YAML frontmatter.

Args:
    skill_dir: Path to skill directory
    metadata: Skill metadata

Returns:
    Formatted SKILL.md content with YAML frontmatter

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| skill_dir | Path | - | - |
| metadata | SkillMetadata | - | - |

**Returns**: `str`


##### package(self, skill_dir: Path, output_path: Path) → Path

Package skill into ZIP file for Claude.

Creates standard Claude skill structure:
- SKILL.md
- references/*.md
- scripts/ (optional)
- assets/ (optional)

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

Upload skill ZIP to Anthropic Skills API.

Args:
    package_path: Path to skill ZIP file
    api_key: Anthropic API key
    **kwargs: Additional arguments (timeout, etc.)

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

Validate Anthropic API key format.

Args:
    api_key: API key to validate

Returns:
    True if key starts with 'sk-ant-'

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| api_key | str | - | - |

**Returns**: `bool`


##### get_env_var_name(self) → str

Get environment variable name for Anthropic API key.

Returns:
    'ANTHROPIC_API_KEY'

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |

**Returns**: `str`


##### supports_enhancement(self) → bool

Claude supports AI enhancement via Anthropic API.

Returns:
    True

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |

**Returns**: `bool`


##### enhance(self, skill_dir: Path, api_key: str) → bool

Enhance SKILL.md using Claude API.

Reads reference files, sends them to Claude, and generates
an improved SKILL.md with real examples and better organization.

Args:
    skill_dir: Path to skill directory
    api_key: Anthropic API key

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

Build Claude API prompt for enhancement.

Args:
    skill_name: Name of the skill
    references: Dictionary of reference content
    current_skill_md: Existing SKILL.md content (optional)

Returns:
    Enhancement prompt for Claude

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| skill_name | str | - | - |
| references | dict[str, str] | - | - |
| current_skill_md | str | None | - |

**Returns**: `str`



