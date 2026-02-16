# API Reference: install_agent.py

**Language**: Python

**Source**: `src/skill_seekers/cli/install_agent.py`

---

## Functions

### get_agent_path(agent_name: str, project_root: Path | None = None) → Path

Resolve the installation path for a given agent.

Handles both global paths (~/.<agent>/skills/) and project-relative paths
(.cursor/skills/, .github/skills/).

Args:
    agent_name: Name of the agent (e.g., 'claude', 'cursor')
    project_root: Optional project root directory for project-relative paths
                 (defaults to current working directory)

Returns:
    Absolute path to the agent's skill installation directory

Raises:
    ValueError: If agent_name is not recognized

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| agent_name | str | - | - |
| project_root | Path | None | None | - |

**Returns**: `Path`



### get_available_agents() → list

Get list of all supported agent names.

Returns:
    List of agent names (lowercase)

**Returns**: `list`



### validate_agent_name(agent_name: str) → tuple[bool, str | None]

Validate an agent name and provide suggestions if invalid.

Performs case-insensitive matching and fuzzy matching to suggest
similar agent names if the provided name is invalid.

Args:
    agent_name: Agent name to validate

Returns:
    Tuple of (is_valid, error_message)
    - is_valid: True if agent name is valid, False otherwise
    - error_message: None if valid, error message with suggestions if invalid

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| agent_name | str | - | - |

**Returns**: `tuple[bool, str | None]`



### validate_skill_directory(skill_dir: Path) → tuple[bool, str | None]

Validate that a directory is a valid skill directory.

A valid skill directory must:
- Exist
- Be a directory
- Contain a SKILL.md file

Args:
    skill_dir: Path to skill directory

Returns:
    Tuple of (is_valid, error_message)

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| skill_dir | Path | - | - |

**Returns**: `tuple[bool, str | None]`



### install_to_agent(skill_dir: str | Path, agent_name: str, force: bool = False, dry_run: bool = False) → tuple[bool, str]

Install a skill to a specific agent's directory.

Copies the skill directory to the agent's installation path, excluding
backup files and temporary files.

Args:
    skill_dir: Path to skill directory
    agent_name: Name of agent to install to
    force: If True, overwrite existing installation without asking
    dry_run: If True, preview installation without making changes

Returns:
    Tuple of (success, message)
    - success: True if installation succeeded, False otherwise
    - message: Success message or error description

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| skill_dir | str | Path | - | - |
| agent_name | str | - | - |
| force | bool | False | - |
| dry_run | bool | False | - |

**Returns**: `tuple[bool, str]`



### install_to_all_agents(skill_dir: str | Path, force: bool = False, dry_run: bool = False) → dict[str, tuple[bool, str]]

Install a skill to all available agents.

Attempts to install the skill to all agents in AGENT_PATHS,
collecting results for each agent.

Args:
    skill_dir: Path to skill directory
    force: If True, overwrite existing installations
    dry_run: If True, preview installations without making changes

Returns:
    Dictionary mapping agent names to (success, message) tuples

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| skill_dir | str | Path | - | - |
| force | bool | False | - |
| dry_run | bool | False | - |

**Returns**: `dict[str, tuple[bool, str]]`



### main() → int

Main entry point for install-agent CLI.

Returns:
    Exit code (0 for success, 1 for error)

**Returns**: `int`



### ignore_files(_directory, files)

Filter function for shutil.copytree to exclude unwanted files.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| _directory | None | - | - |
| files | None | - | - |

**Returns**: (none)


