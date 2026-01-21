# API Reference: upload_skill.py

**Language**: Python

**Source**: `src/skill_seekers/cli/upload_skill.py`

---

## Functions

### upload_skill_api(package_path, target = 'claude', api_key = None)

Upload skill package to LLM platform

Args:
    package_path: Path to skill package file
    target: Target platform ('claude', 'gemini', 'openai')
    api_key: Optional API key (otherwise read from environment)

Returns:
    tuple: (success, message)

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| package_path | None | - | - |
| target | None | 'claude' | - |
| api_key | None | None | - |

**Returns**: (none)



### main()

**Returns**: (none)


