# API Reference: config_manager.py

**Language**: Python

**Source**: `src/skill_seekers/cli/config_manager.py`

---

## Classes

### ConfigManager

Manages Skill Seekers configuration with multi-token support.

**Inherits from**: (none)

#### Methods

##### __init__(self)

Initialize configuration manager.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### _ensure_directories(self)

Ensure configuration and progress directories exist with secure permissions.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### _load_config(self) → dict[str, Any]

Load configuration from file or create default.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |

**Returns**: `dict[str, Any]`


##### _merge_with_defaults(self, config: dict[str, Any]) → dict[str, Any]

Merge loaded config with defaults to ensure all keys exist.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| config | dict[str, Any] | - | - |

**Returns**: `dict[str, Any]`


##### save_config(self)

Save configuration to file with secure permissions.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### add_github_profile(self, name: str, token: str, description: str = '', rate_limit_strategy: str = 'prompt', timeout_minutes: int = 30, set_as_default: bool = False)

Add a new GitHub profile.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| name | str | - | - |
| token | str | - | - |
| description | str | '' | - |
| rate_limit_strategy | str | 'prompt' | - |
| timeout_minutes | int | 30 | - |
| set_as_default | bool | False | - |


##### remove_github_profile(self, name: str)

Remove a GitHub profile.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| name | str | - | - |


##### list_github_profiles(self) → list[dict[str, Any]]

List all GitHub profiles.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |

**Returns**: `list[dict[str, Any]]`


##### get_github_token(self, profile_name: str | None = None, _repo_url: str | None = None) → str | None

Get GitHub token with smart fallback chain.

Priority:
1. Specified profile_name
2. Environment variable GITHUB_TOKEN
3. Default profile from config
4. None (will use 60/hour unauthenticated)

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| profile_name | str | None | None | - |
| _repo_url | str | None | None | - |

**Returns**: `str | None`


##### get_profile_for_token(self, token: str) → str | None

Get profile name for a given token.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| token | str | - | - |

**Returns**: `str | None`


##### get_next_profile(self, current_token: str) → tuple | None

Get next available profile for rate limit switching.

Returns: (profile_name, token) or None

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| current_token | str | - | - |

**Returns**: `tuple | None`


##### get_rate_limit_strategy(self, token: str | None = None) → str

Get rate limit strategy for a token (or default).

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| token | str | None | None | - |

**Returns**: `str`


##### get_timeout_minutes(self, token: str | None = None) → int

Get timeout minutes for a token (or default).

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| token | str | None | None | - |

**Returns**: `int`


##### set_api_key(self, provider: str, key: str)

Set API key for a provider (anthropic, google, openai).

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| provider | str | - | - |
| key | str | - | - |


##### get_api_key(self, provider: str) → str | None

Get API key with environment variable fallback.

Priority:
1. Environment variable
2. Config file

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| provider | str | - | - |

**Returns**: `str | None`


##### save_progress(self, job_id: str, progress_data: dict[str, Any])

Save progress for a job.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| job_id | str | - | - |
| progress_data | dict[str, Any] | - | - |


##### load_progress(self, job_id: str) → dict[str, Any] | None

Load progress for a job.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| job_id | str | - | - |

**Returns**: `dict[str, Any] | None`


##### list_resumable_jobs(self) → list[dict[str, Any]]

List all resumable jobs.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |

**Returns**: `list[dict[str, Any]]`


##### delete_progress(self, job_id: str)

Delete progress file for a job.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| job_id | str | - | - |


##### cleanup_old_progress(self)

Delete progress files older than configured days.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### is_first_run(self) → bool

Check if this is the first run.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |

**Returns**: `bool`


##### mark_first_run_complete(self)

Mark first run as completed.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### should_show_welcome(self) → bool

Check if we should show welcome message.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |

**Returns**: `bool`


##### mark_welcome_shown(self)

Mark welcome message as shown.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### display_config_summary(self)

Display current configuration summary.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |




## Functions

### get_config_manager() → ConfigManager

Get singleton config manager instance.

**Returns**: `ConfigManager`



### deep_merge(default: dict, custom: dict) → dict

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| default | dict | - | - |
| custom | dict | - | - |

**Returns**: `dict`


