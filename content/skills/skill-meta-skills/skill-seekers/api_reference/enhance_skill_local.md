# API Reference: enhance_skill_local.py

**Language**: Python

**Source**: `src/skill_seekers/cli/enhance_skill_local.py`

---

## Classes

### LocalSkillEnhancer

**Inherits from**: (none)

#### Methods

##### __init__(self, skill_dir, force = True)

Initialize enhancer.

Args:
    skill_dir: Path to skill directory
    force: If True, skip all confirmations (default: True, use --no-force to disable)

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| skill_dir | None | - | - |
| force | None | True | - |


##### summarize_reference(self, content: str, target_ratio: float = 0.3) → str

Intelligently summarize reference content to reduce size.

Strategy:
1. Keep first 20% (introduction/overview)
2. Extract code blocks (prioritize examples)
3. Keep headings and their first paragraph
4. Skip repetitive content

Args:
    content: Full reference content
    target_ratio: Target size as ratio of original (0.3 = 30%)

Returns:
    Summarized content

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| content | str | - | - |
| target_ratio | float | 0.3 | - |

**Returns**: `str`


##### create_enhancement_prompt(self, use_summarization = False, summarization_ratio = 0.3)

Create the prompt file for Claude Code

Args:
    use_summarization: If True, apply smart summarization to reduce size
    summarization_ratio: Target size ratio when summarizing (0.3 = 30%)

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| use_summarization | None | False | - |
| summarization_ratio | None | 0.3 | - |


##### write_status(self, status, message = '', progress = 0.0, error = None)

Write enhancement status to file for monitoring.

Args:
    status: One of: pending, running, completed, failed
    message: Status message
    progress: Progress percentage (0.0-1.0)
    error: Error message if failed

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| status | None | - | - |
| message | None | '' | - |
| progress | None | 0.0 | - |
| error | None | None | - |


##### read_status(self)

Read enhancement status from file.

Returns:
    dict: Status data or None if not found

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### run(self, headless = True, timeout = 600, background = False, daemon = False)

Main enhancement workflow with automatic smart summarization for large skills.

Automatically detects large skills (>30K chars) and applies smart summarization
to ensure compatibility with Claude CLI's ~30-40K character limit.

Smart summarization strategy:
- Keeps first 20% (introduction/overview)
- Extracts up to 5 best code blocks
- Keeps up to 10 section headings with first paragraph
- Reduces to ~30% of original size

Args:
    headless: If True, run claude directly without opening terminal (default: True)
    timeout: Maximum time to wait for enhancement in seconds (default: 600 = 10 minutes)
    background: If True, run in background and return immediately (default: False)
    daemon: If True, run as persistent daemon with monitoring (default: False)

Returns:
    bool: True if enhancement process started successfully, False otherwise

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| headless | None | True | - |
| timeout | None | 600 | - |
| background | None | False | - |
| daemon | None | False | - |


##### _run_headless(self, prompt_file, timeout)

Run Claude enhancement in headless mode (no terminal window)

Args:
    prompt_file: Path to prompt file
    timeout: Maximum seconds to wait

Returns:
    bool: True if enhancement succeeded

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| prompt_file | None | - | - |
| timeout | None | - | - |


##### _run_background(self, headless, timeout)

Run enhancement in background thread, return immediately.

Args:
    headless: Run headless mode
    timeout: Timeout in seconds

Returns:
    bool: True if background task started successfully

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| headless | None | - | - |
| timeout | None | - | - |


##### _run_daemon(self, timeout)

Run as persistent daemon process with monitoring.

Creates a detached background process that continues running even if parent exits.

Args:
    timeout: Timeout in seconds

Returns:
    bool: True if daemon started successfully

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| timeout | None | - | - |




## Functions

### detect_terminal_app()

Detect which terminal app to use with cascading priority.

Priority order:
    1. SKILL_SEEKER_TERMINAL environment variable (explicit user preference)
    2. TERM_PROGRAM environment variable (inherit current terminal)
    3. Terminal.app (fallback default)

Returns:
    tuple: (terminal_app_name, detection_method)
        - terminal_app_name (str): Name of terminal app to launch (e.g., "Ghostty", "Terminal")
        - detection_method (str): How the terminal was detected (for logging)

Examples:
    >>> os.environ['SKILL_SEEKER_TERMINAL'] = 'Ghostty'
    >>> detect_terminal_app()
    ('Ghostty', 'SKILL_SEEKER_TERMINAL')

    >>> os.environ['TERM_PROGRAM'] = 'iTerm.app'
    >>> detect_terminal_app()
    ('iTerm', 'TERM_PROGRAM')

**Returns**: (none)



### main()

**Returns**: (none)



### background_worker()

Worker function for background thread

**Returns**: (none)


