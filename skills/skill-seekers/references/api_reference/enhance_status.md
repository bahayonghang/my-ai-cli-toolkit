# API Reference: enhance_status.py

**Language**: Python

**Source**: `src/skill_seekers/cli/enhance_status.py`

---

## Functions

### read_status(skill_dir)

Read enhancement status from file.

Args:
    skill_dir: Path to skill directory

Returns:
    dict: Status data or None if not found

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| skill_dir | None | - | - |

**Returns**: (none)



### format_status(status)

Format status for display.

Args:
    status: Status dict

Returns:
    str: Formatted status string

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| status | None | - | - |

**Returns**: (none)



### watch_status(skill_dir, interval = 2)

Watch status in real-time.

Args:
    skill_dir: Path to skill directory
    interval: Update interval in seconds

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| skill_dir | None | - | - |
| interval | None | 2 | - |

**Returns**: (none)



### main()

**Returns**: (none)


