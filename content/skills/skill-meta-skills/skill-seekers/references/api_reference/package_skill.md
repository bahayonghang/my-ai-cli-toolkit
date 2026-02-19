# API Reference: package_skill.py

**Language**: Python

**Source**: `src/skill_seekers/cli/package_skill.py`

---

## Functions

### package_skill(skill_dir, open_folder_after = True, skip_quality_check = False, target = 'claude')

Package a skill directory into platform-specific format

Args:
    skill_dir: Path to skill directory
    open_folder_after: Whether to open the output folder after packaging
    skip_quality_check: Skip quality checks before packaging
    target: Target LLM platform ('claude', 'gemini', 'openai', 'markdown')

Returns:
    tuple: (success, package_path) where success is bool and package_path is Path or None

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| skill_dir | None | - | - |
| open_folder_after | None | True | - |
| skip_quality_check | None | False | - |
| target | None | 'claude' | - |

**Returns**: (none)



### main()

**Returns**: (none)


