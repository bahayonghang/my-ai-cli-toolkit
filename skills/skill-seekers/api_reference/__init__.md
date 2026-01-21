# API Reference: __init__.py

**Language**: Python

**Source**: `src/skill_seekers/cli/adaptors/__init__.py`

---

## Functions

### get_adaptor(platform: str, config: dict = None) → SkillAdaptor

Factory function to get platform-specific adaptor instance.

Args:
    platform: Platform identifier ('claude', 'gemini', 'openai', 'markdown')
    config: Optional platform-specific configuration

Returns:
    SkillAdaptor instance for the specified platform

Raises:
    ValueError: If platform is not supported or not yet implemented

Examples:
    >>> adaptor = get_adaptor('claude')
    >>> adaptor = get_adaptor('gemini', {'api_version': 'v1beta'})

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| platform | str | - | - |
| config | dict | None | - |

**Returns**: `SkillAdaptor`



### list_platforms() → list[str]

List all supported platforms.

Returns:
    List of platform identifiers

Examples:
    >>> list_platforms()
    ['claude', 'gemini', 'openai', 'markdown']

**Returns**: `list[str]`



### is_platform_available(platform: str) → bool

Check if a platform adaptor is available.

Args:
    platform: Platform identifier to check

Returns:
    True if platform is available

Examples:
    >>> is_platform_available('claude')
    True
    >>> is_platform_available('unknown')
    False

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| platform | str | - | - |

**Returns**: `bool`


