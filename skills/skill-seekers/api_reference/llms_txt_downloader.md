# API Reference: llms_txt_downloader.py

**Language**: Python

**Source**: `src/skill_seekers/cli/llms_txt_downloader.py`

---

## Classes

### LlmsTxtDownloader

Download llms.txt content from URLs with retry logic

**Inherits from**: (none)

#### Methods

##### __init__(self, url: str, timeout: int = 30, max_retries: int = 3)

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| url | str | - | - |
| timeout | int | 30 | - |
| max_retries | int | 3 | - |


##### get_proper_filename(self) → str

Extract filename from URL and convert .txt to .md

Returns:
    Proper filename with .md extension

Examples:
    https://hono.dev/llms-full.txt -> llms-full.md
    https://hono.dev/llms.txt -> llms.md
    https://hono.dev/llms-small.txt -> llms-small.md

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |

**Returns**: `str`


##### _is_markdown(self, content: str) → bool

Check if content looks like markdown (not HTML).

Returns:
    True if content contains markdown patterns and is NOT HTML

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| content | str | - | - |

**Returns**: `bool`


##### download(self) → str | None

Download llms.txt content with retry logic.

Returns:
    String content or None if download fails

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |

**Returns**: `str | None`



