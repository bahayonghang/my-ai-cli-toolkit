# API Reference: swift_patterns.py

**Language**: Python

**Source**: `src/skill_seekers/cli/swift_patterns.py`

---

## Functions

### _validate_patterns(patterns: dict[str, list[tuple[str, int]]]) → None

Validate pattern structure at module load time.

Ensures all patterns follow the expected format:
- Each pattern is a (regex_string, weight) tuple
- Weight is an integer between 1 and 5
- Regex string is a valid string

Raises:
    ValueError: If any pattern is malformed

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| patterns | dict[str, list[tuple[str, int]]] | - | - |

**Returns**: `None`


