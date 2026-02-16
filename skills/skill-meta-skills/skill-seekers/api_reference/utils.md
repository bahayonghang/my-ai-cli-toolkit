# API Reference: utils.py

**Language**: Python

**Source**: `src/skill_seekers/cli/utils.py`

---

## Functions

### open_folder(folder_path: str | Path) → bool

Open a folder in the system file browser

Args:
    folder_path: Path to folder to open

Returns:
    bool: True if successful, False otherwise

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| folder_path | str | Path | - | - |

**Returns**: `bool`



### has_api_key() → bool

Check if ANTHROPIC_API_KEY is set in environment

Returns:
    bool: True if API key is set, False otherwise

**Returns**: `bool`



### get_api_key() → str | None

Get ANTHROPIC_API_KEY from environment

Returns:
    str: API key or None if not set

**Returns**: `str | None`



### get_upload_url() → str

Get the Claude skills upload URL

Returns:
    str: Claude skills upload URL

**Returns**: `str`



### print_upload_instructions(zip_path: str | Path) → None

Print clear upload instructions for manual upload

Args:
    zip_path: Path to the .zip file to upload

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| zip_path | str | Path | - | - |

**Returns**: `None`



### format_file_size(size_bytes: int) → str

Format file size in human-readable format

Args:
    size_bytes: Size in bytes

Returns:
    str: Formatted size (e.g., "45.3 KB")

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| size_bytes | int | - | - |

**Returns**: `str`



### validate_skill_directory(skill_dir: str | Path) → tuple[bool, str | None]

Validate that a directory is a valid skill directory

Args:
    skill_dir: Path to skill directory

Returns:
    tuple: (is_valid, error_message)

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| skill_dir | str | Path | - | - |

**Returns**: `tuple[bool, str | None]`



### validate_zip_file(zip_path: str | Path) → tuple[bool, str | None]

Validate that a file is a valid skill .zip file

Args:
    zip_path: Path to .zip file

Returns:
    tuple: (is_valid, error_message)

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| zip_path | str | Path | - | - |

**Returns**: `tuple[bool, str | None]`



### read_reference_files(skill_dir: str | Path, max_chars: int = 100000, preview_limit: int = 40000) → dict[str, dict]

Read reference files from a skill directory with enriched metadata.

This function reads markdown files from the references/ subdirectory
of a skill, applying both per-file and total content limits.
Returns enriched metadata including source type, confidence, and path.

Args:
    skill_dir (str or Path): Path to skill directory
    max_chars (int): Maximum total characters to read (default: 100000)
    preview_limit (int): Maximum characters per file (default: 40000)

Returns:
    dict: Dictionary mapping filename to metadata dict with keys:
        - 'content': File content
        - 'source': Source type (documentation/github/pdf/api/codebase_analysis)
        - 'confidence': Confidence level (high/medium/low)
        - 'path': Relative path from references directory
        - 'repo_id': Repository identifier for multi-source (e.g., 'encode_httpx'), None for single-source

Example:
    >>> refs = read_reference_files('output/react/', max_chars=50000)
    >>> refs['documentation/api.md']['source']
    'documentation'
    >>> refs['documentation/api.md']['confidence']
    'high'

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| skill_dir | str | Path | - | - |
| max_chars | int | 100000 | - |
| preview_limit | int | 40000 | - |

**Returns**: `dict[str, dict]`



### retry_with_backoff(operation: Callable[[], T], max_attempts: int = 3, base_delay: float = 1.0, operation_name: str = 'operation') → T

Retry an operation with exponential backoff.

Useful for network operations that may fail due to transient errors.
Waits progressively longer between retries (exponential backoff).

Args:
    operation: Function to retry (takes no arguments, returns result)
    max_attempts: Maximum number of attempts (default: 3)
    base_delay: Base delay in seconds, doubles each retry (default: 1.0)
    operation_name: Name for logging purposes (default: "operation")

Returns:
    Result of successful operation

Raises:
    Exception: Last exception if all retries fail

Example:
    >>> def fetch_page():
    ...     response = requests.get(url, timeout=30)
    ...     response.raise_for_status()
    ...     return response.text
    >>> content = retry_with_backoff(fetch_page, max_attempts=3, operation_name=f"fetch {url}")

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| operation | Callable[[], T] | - | - |
| max_attempts | int | 3 | - |
| base_delay | float | 1.0 | - |
| operation_name | str | 'operation' | - |

**Returns**: `T`



### retry_with_backoff_async(operation: Callable[[], T], max_attempts: int = 3, base_delay: float = 1.0, operation_name: str = 'operation') → T

**Async function**

Async version of retry_with_backoff for async operations.

Args:
    operation: Async function to retry (takes no arguments, returns awaitable)
    max_attempts: Maximum number of attempts (default: 3)
    base_delay: Base delay in seconds, doubles each retry (default: 1.0)
    operation_name: Name for logging purposes (default: "operation")

Returns:
    Result of successful operation

Raises:
    Exception: Last exception if all retries fail

Example:
    >>> async def fetch_page():
    ...     response = await client.get(url, timeout=30.0)
    ...     response.raise_for_status()
    ...     return response.text
    >>> content = await retry_with_backoff_async(fetch_page, operation_name=f"fetch {url}")

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| operation | Callable[[], T] | - | - |
| max_attempts | int | 3 | - |
| base_delay | float | 1.0 | - |
| operation_name | str | 'operation' | - |

**Returns**: `T`



### _determine_source_metadata(relative_path: Path) → tuple[str, str, str | None]

Determine source type, confidence level, and repo_id from path.

For multi-source support, extracts repo_id from paths like:
- codebase_analysis/encode_httpx/ARCHITECTURE.md -> repo_id='encode_httpx'
- github/README.md -> repo_id=None (single source)

Returns:
    tuple: (source_type, confidence_level, repo_id)

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| relative_path | Path | - | - |

**Returns**: `tuple[str, str, str | None]`


