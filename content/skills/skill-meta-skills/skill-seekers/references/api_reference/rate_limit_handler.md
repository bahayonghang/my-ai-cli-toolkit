# API Reference: rate_limit_handler.py

**Language**: Python

**Source**: `src/skill_seekers/cli/rate_limit_handler.py`

---

## Classes

### RateLimitError

Raised when rate limit is exceeded and cannot be handled.

**Inherits from**: Exception



### RateLimitHandler

Handles GitHub API rate limits with multiple strategies.

Usage:
    handler = RateLimitHandler(
        token=github_token,
        interactive=True,
        profile_name="personal"
    )

    # Before starting
    handler.check_upfront()

    # Around requests
    response = requests.get(url, headers=headers)
    handler.check_response(response)

**Inherits from**: (none)

#### Methods

##### __init__(self, token: str | None = None, interactive: bool = True, profile_name: str | None = None, auto_switch: bool = True)

Initialize rate limit handler.

Args:
    token: GitHub token (or None for unauthenticated)
    interactive: Whether to show prompts (False for CI/CD)
    profile_name: Name of the profile being used
    auto_switch: Whether to auto-switch profiles when rate limited

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| token | str | None | None | - |
| interactive | bool | True | - |
| profile_name | str | None | None | - |
| auto_switch | bool | True | - |


##### check_upfront(self) → bool

Check rate limit status before starting.
Shows non-intrusive warning if no token configured.

Returns:
    True if check passed, False if should abort

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |

**Returns**: `bool`


##### check_response(self, response: requests.Response) → bool

Check if response indicates rate limit and handle it.

Args:
    response: requests.Response object

Returns:
    True if handled successfully, False if should abort

Raises:
    RateLimitError: If rate limit cannot be handled

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| response | requests.Response | - | - |

**Returns**: `bool`


##### extract_rate_limit_info(self, response: requests.Response) → dict[str, Any]

Extract rate limit information from response headers.

Args:
    response: requests.Response with rate limit headers

Returns:
    Dict with rate limit info

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| response | requests.Response | - | - |

**Returns**: `dict[str, Any]`


##### get_rate_limit_info(self) → dict[str, Any]

Get current rate limit status from GitHub API.

Returns:
    Dict with rate limit info

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |

**Returns**: `dict[str, Any]`


##### handle_rate_limit(self, rate_info: dict[str, Any]) → bool

Handle rate limit based on strategy.

Args:
    rate_info: Dict with rate limit information

Returns:
    True if handled (can continue), False if should abort

Raises:
    RateLimitError: If cannot handle in non-interactive mode

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| rate_info | dict[str, Any] | - | - |

**Returns**: `bool`


##### try_switch_profile(self) → bool

Try to switch to another GitHub profile.

Returns:
    True if switched successfully, False otherwise

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |

**Returns**: `bool`


##### wait_for_reset(self, wait_seconds: float, wait_minutes: int) → bool

Wait for rate limit to reset with countdown.

Args:
    wait_seconds: Seconds to wait
    wait_minutes: Minutes to wait (for display)

Returns:
    True if waited successfully, False if aborted

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| wait_seconds | float | - | - |
| wait_minutes | int | - | - |

**Returns**: `bool`


##### show_countdown_timer(self, total_seconds: float)

Show a live countdown timer.

Args:
    total_seconds: Total seconds to count down

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| total_seconds | float | - | - |


##### prompt_user_action(self, wait_seconds: float, wait_minutes: int) → bool

Prompt user for action when rate limited.

Args:
    wait_seconds: Seconds until reset
    wait_minutes: Minutes until reset

Returns:
    True if user chooses to continue, False to abort

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| wait_seconds | float | - | - |
| wait_minutes | int | - | - |

**Returns**: `bool`




## Functions

### create_github_headers(token: str | None = None) → dict[str, str]

Create GitHub API headers with optional token.

Args:
    token: GitHub token (or None)

Returns:
    Dict of headers

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| token | str | None | None | - |

**Returns**: `dict[str, str]`


