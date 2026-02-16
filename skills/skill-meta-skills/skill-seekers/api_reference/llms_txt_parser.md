# API Reference: llms_txt_parser.py

**Language**: Python

**Source**: `src/skill_seekers/cli/llms_txt_parser.py`

---

## Classes

### LlmsTxtParser

Parse llms.txt markdown content into page structures

**Inherits from**: (none)

#### Methods

##### __init__(self, content: str, base_url: str = None)

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| content | str | - | - |
| base_url | str | None | - |


##### extract_urls(self) → list[str]

Extract all URLs from the llms.txt content.

Supports both markdown-style links [text](url) and bare URLs.
Resolves relative URLs using base_url if provided.
Filters out malformed URLs with invalid anchor patterns.

Returns:
    List of unique, cleaned URLs found in the content.
    Returns empty list if no valid URLs found.

Note:
    - Markdown links: [Getting Started](./docs/guide.md)
    - Bare URLs: https://example.com/api.md
    - Relative paths resolved with base_url
    - Invalid anchors (#section/path.md) are stripped

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |

**Returns**: `list[str]`


##### _clean_url(self, url: str) → str

Clean and validate URL, removing invalid anchor patterns.

Detects and strips malformed anchors that contain path separators.
Valid: https://example.com/page.md#section
Invalid: https://example.com/page#section/index.html.md

Args:
    url: URL to clean (absolute or relative)

Returns:
    Cleaned URL with malformed anchors stripped.
    Returns base URL if anchor contains '/' (malformed).
    Returns original URL if anchor is valid or no anchor present.

Example:
    >>> parser._clean_url("https://ex.com/page#sec/path.md")
    "https://ex.com/page"
    >>> parser._clean_url("https://ex.com/page.md#section")
    "https://ex.com/page.md#section"

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| url | str | - | - |

**Returns**: `str`


##### parse(self) → list[dict]

Parse markdown content into page structures.

Returns:
    List of page dicts with title, content, code_samples, headings

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |

**Returns**: `list[dict]`


##### _parse_section(self, content: str, title: str) → dict

Parse a single section into page structure

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| content | str | - | - |
| title | str | - | - |

**Returns**: `dict`



