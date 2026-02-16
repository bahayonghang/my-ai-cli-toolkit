# API Reference: test_setup_scripts.py

**Language**: Python

**Source**: `tests/test_setup_scripts.py`

---

## Classes

### TestSetupMCPScript

Test setup_mcp.sh for path correctness and syntax

**Inherits from**: (none)

#### Methods

##### script_path(self)

Get path to setup_mcp.sh

**Decorators**: `@pytest.fixture`

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### script_content(self, script_path)

Read setup_mcp.sh content

**Decorators**: `@pytest.fixture`

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| script_path | None | - | - |


##### test_setup_mcp_exists(self, script_path)

Test that setup_mcp.sh exists

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| script_path | None | - | - |


##### test_bash_syntax_valid(self, script_path)

Test that setup_mcp.sh has valid bash syntax

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| script_path | None | - | - |


##### test_references_correct_mcp_directory(self, script_content)

Test that script references src/skill_seekers/mcp/ (v2.4.0 MCP 2025 upgrade)

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| script_content | None | - | - |


##### test_requirements_txt_path(self, script_content)

Test that script uses pip install -e . (v2.0.0 modern packaging)

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| script_content | None | - | - |


##### test_server_py_path(self, script_content)

Test that server_fastmcp.py module is referenced (v2.4.0 MCP 2025 upgrade)

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| script_content | None | - | - |


##### test_referenced_files_exist(self)

Test that all files referenced in setup_mcp.sh actually exist

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_config_directory_exists(self)

Test that referenced config directory exists

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_script_is_executable(self, script_path)

Test that setup_mcp.sh is executable

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| script_path | None | - | - |


##### test_json_config_path_format(self, script_content)

Test that JSON config examples use correct format (v2.4.0 MCP 2025 upgrade)

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| script_content | None | - | - |


##### test_no_hardcoded_paths(self, script_content)

Test that script doesn't contain hardcoded absolute paths

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| script_content | None | - | - |


##### test_pytest_command_references(self, script_content)

Test that pytest commands reference correct test files

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| script_content | None | - | - |




### TestBashScriptGeneral

General tests for all bash scripts in repository

**Inherits from**: (none)

#### Methods

##### all_bash_scripts(self)

Find all bash scripts in repository root

**Decorators**: `@pytest.fixture`

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_all_scripts_have_shebang(self, all_bash_scripts)

Test that all bash scripts have proper shebang

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| all_bash_scripts | None | - | - |


##### test_all_scripts_syntax_valid(self, all_bash_scripts)

Test that all bash scripts have valid syntax

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| all_bash_scripts | None | - | - |


##### test_all_scripts_use_set_e(self, all_bash_scripts)

Test that scripts use 'set -e' for error handling

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| all_bash_scripts | None | - | - |


##### test_no_deprecated_backticks(self, all_bash_scripts)

Test that scripts use $() instead of deprecated backticks

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| all_bash_scripts | None | - | - |




### TestMCPServerPaths

Test that MCP server references are consistent across codebase

**Inherits from**: (none)

#### Methods

##### test_github_workflows_reference_correct_paths(self)

Test that GitHub workflows reference correct MCP paths

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_readme_references_correct_paths(self)

Test that README references correct MCP paths

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_documentation_references_correct_paths(self)

Test that documentation files reference correct MCP paths

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |




## Functions

### test_mcp_directory_structure()

Test that MCP directory structure is correct (new src/ layout)

**Returns**: (none)


