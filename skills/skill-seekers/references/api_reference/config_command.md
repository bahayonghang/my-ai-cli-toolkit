# API Reference: config_command.py

**Language**: Python

**Source**: `src/skill_seekers/cli/config_command.py`

---

## Functions

### show_welcome_message()

Show first-run welcome message.

**Returns**: (none)



### main_menu()

Show main configuration menu.

**Returns**: (none)



### github_token_menu()

GitHub token configuration menu.

**Returns**: (none)



### add_github_profile()

Add a new GitHub profile interactively.

**Returns**: (none)



### remove_github_profile()

Remove a GitHub profile.

**Returns**: (none)



### set_default_profile()

Set default GitHub profile.

**Returns**: (none)



### open_github_token_page()

Open GitHub token creation page in browser.

**Returns**: (none)



### api_keys_menu()

API keys configuration menu.

**Returns**: (none)



### set_api_key(provider: str, url: str)

Set an API key interactively.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| provider | str | - | - |
| url | str | - | - |

**Returns**: (none)



### rate_limit_settings()

Configure rate limit settings.

**Returns**: (none)



### resume_settings()

Configure resume/progress settings.

**Returns**: (none)



### test_connections()

Test GitHub and API connections.

**Returns**: (none)



### main()

Main entry point for config command.

**Returns**: (none)


