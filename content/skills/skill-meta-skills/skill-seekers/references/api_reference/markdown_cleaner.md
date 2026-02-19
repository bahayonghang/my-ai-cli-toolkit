# API Reference: markdown_cleaner.py

**Language**: Python

**Source**: `src/skill_seekers/cli/markdown_cleaner.py`

---

## Classes

### MarkdownCleaner

Clean HTML from markdown while preserving structure

**Inherits from**: (none)

#### Methods

##### remove_html_tags(text: str) → str

Remove HTML tags while preserving text content.

Args:
    text: Markdown text possibly containing HTML

Returns:
    Cleaned markdown with HTML tags removed

**Decorators**: `@staticmethod`

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| text | str | - | - |

**Returns**: `str`


##### extract_first_section(text: str, max_chars: int = 500) → str

Extract first meaningful content, respecting markdown structure.

Captures content including section headings up to max_chars.
For short READMEs, includes everything. For longer ones, extracts
intro + first few sections (e.g., installation, quick start).

Args:
    text: Full markdown text
    max_chars: Maximum characters to extract

Returns:
    First section content (cleaned, including headings)

**Decorators**: `@staticmethod`

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| text | str | - | - |
| max_chars | int | 500 | - |

**Returns**: `str`


##### _truncate_at_sentence(text: str, max_chars: int) → str

Truncate at last complete sentence before max_chars.

Args:
    text: Text to truncate
    max_chars: Maximum character count

Returns:
    Truncated text ending at sentence boundary

**Decorators**: `@staticmethod`

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| text | str | - | - |
| max_chars | int | - | - |

**Returns**: `str`



