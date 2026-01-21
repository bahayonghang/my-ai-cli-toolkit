# API Reference: test_install_agent.py

**Language**: Python

**Source**: `tests/test_install_agent.py`

---

## Classes

### TestAgentPathMapping

Test agent path resolution and mapping.

**Inherits from**: (none)

#### Methods

##### test_get_agent_path_home_expansion(self)

Test that ~ expands to home directory for global agents.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_get_agent_path_project_relative(self)

Test that project-relative paths use current directory.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_get_agent_path_project_relative_with_custom_root(self)

Test project-relative paths with custom project root.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_get_agent_path_invalid_agent(self)

Test that invalid agent raises ValueError.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_get_available_agents(self)

Test that all 11 agents are listed.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_agent_path_case_insensitive(self)

Test that agent names are case-insensitive.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |




### TestAgentNameValidation

Test agent name validation and fuzzy matching.

**Inherits from**: (none)

#### Methods

##### test_validate_valid_agent(self)

Test that valid agent names pass validation.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_validate_invalid_agent_suggests_similar(self)

Test that similar agent names are suggested for typos.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_validate_special_all(self)

Test that 'all' is a valid special agent name.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_validate_case_insensitive(self)

Test that validation is case-insensitive.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_validate_shows_available_agents(self)

Test that error message shows available agents.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |




### TestSkillDirectoryValidation

Test skill directory validation.

**Inherits from**: (none)

#### Methods

##### test_validate_valid_skill_directory(self)

Test that valid skill directory passes validation.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_validate_missing_directory(self)

Test that missing directory fails validation.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_validate_not_a_directory(self)

Test that file (not directory) fails validation.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_validate_missing_skill_md(self)

Test that directory without SKILL.md fails validation.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |




### TestInstallToAgent

Test installation to single agent.

**Inherits from**: (none)

#### Methods

##### setup_method(self)

Create test skill directory before each test.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### teardown_method(self)

Clean up after each test.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_install_creates_skill_subdirectory(self)

Test that installation creates {agent_path}/{skill_name}/ directory.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_install_preserves_structure(self)

Test that installation preserves SKILL.md, references/, scripts/, assets/.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_install_excludes_backups(self)

Test that .backup files are excluded from installation.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_install_existing_directory_no_force(self)

Test that existing directory without --force fails with clear message.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_install_existing_directory_with_force(self)

Test that existing directory with --force overwrites successfully.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_install_invalid_skill_directory(self)

Test that installation fails for invalid skill directory.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_install_missing_skill_md(self)

Test that installation fails if SKILL.md is missing.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_install_dry_run(self)

Test that dry-run mode previews without making changes.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |




### TestInstallToAllAgents

Test installation to all agents.

**Inherits from**: (none)

#### Methods

##### setup_method(self)

Create test skill directory before each test.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### teardown_method(self)

Clean up after each test.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_install_to_all_success(self)

Test that install_to_all_agents attempts all 11 agents.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_install_to_all_partial_success(self)

Test that install_to_all collects both successes and failures.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_install_to_all_with_force(self)

Test that install_to_all respects force flag.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_install_to_all_returns_results(self)

Test that install_to_all returns dict with all results.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |




### TestInstallAgentCLI

Test CLI interface.

**Inherits from**: (none)

#### Methods

##### setup_method(self)

Create test skill directory before each test.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### teardown_method(self)

Clean up after each test.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_cli_help_output(self)

Test that --help shows usage information.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_cli_requires_agent_flag(self)

Test that CLI fails without --agent flag.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_cli_dry_run(self)

Test that --dry-run flag works correctly.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_cli_integration(self)

Test end-to-end CLI execution.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_cli_install_to_all(self)

Test CLI with --agent all.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |




## Functions

### mock_get_agent_path(agent_name, _project_root = None)

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| agent_name | None | - | - |
| _project_root | None | None | - |

**Returns**: (none)



### mock_get_agent_path(agent_name, _project_root = None)

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| agent_name | None | - | - |
| _project_root | None | None | - |

**Returns**: (none)



### mock_get_agent_path(agent_name, _project_root = None)

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| agent_name | None | - | - |
| _project_root | None | None | - |

**Returns**: (none)



### mock_get_agent_path(agent_name, _project_root = None)

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| agent_name | None | - | - |
| _project_root | None | None | - |

**Returns**: (none)



### mock_get_agent_path(agent_name, _project_root = None)

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| agent_name | None | - | - |
| _project_root | None | None | - |

**Returns**: (none)


