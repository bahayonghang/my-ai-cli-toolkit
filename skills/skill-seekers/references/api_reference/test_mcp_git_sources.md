# API Reference: test_mcp_git_sources.py

**Language**: Python

**Source**: `tests/test_mcp_git_sources.py`

---

## Classes

### TestFetchConfigModes

Test fetch_config tool with different modes.

**Inherits from**: (none)

#### Methods

##### test_fetch_config_api_mode_list(self)

Test API mode - listing available configs.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_fetch_config_api_mode_download(self, temp_dirs)

Test API mode - downloading specific config.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| temp_dirs | None | - | - |


##### test_fetch_config_git_url_mode(self, mock_git_repo_class, temp_dirs)

Test Git URL mode - direct git clone.

**Decorators**: `@patch('skill_seekers.mcp.server.GitConfigRepo')`

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| mock_git_repo_class | None | - | - |
| temp_dirs | None | - | - |


##### test_fetch_config_source_mode(self, mock_source_manager_class, mock_git_repo_class, temp_dirs)

Test Source mode - using named source from registry.

**Decorators**: `@patch('skill_seekers.mcp.server.GitConfigRepo')`, `@patch('skill_seekers.mcp.server.SourceManager')`

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| mock_source_manager_class | None | - | - |
| mock_git_repo_class | None | - | - |
| temp_dirs | None | - | - |


##### test_fetch_config_source_not_found(self)

Test error when source doesn't exist.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_fetch_config_config_not_found_in_repo(self, mock_git_repo_class, temp_dirs)

Test error when config doesn't exist in repository.

**Decorators**: `@patch('skill_seekers.mcp.server.GitConfigRepo')`

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| mock_git_repo_class | None | - | - |
| temp_dirs | None | - | - |


##### test_fetch_config_invalid_git_url(self, mock_git_repo_class)

Test error handling for invalid git URL.

**Decorators**: `@patch('skill_seekers.mcp.server.GitConfigRepo')`

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| mock_git_repo_class | None | - | - |




### TestSourceManagementTools

Test add/list/remove config source tools.

**Inherits from**: (none)

#### Methods

##### test_add_config_source(self, _temp_dirs)

Test adding a new config source.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| _temp_dirs | None | - | - |


##### test_add_config_source_missing_name(self)

Test error when name is missing.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_add_config_source_missing_git_url(self)

Test error when git_url is missing.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_add_config_source_invalid_name(self)

Test error when source name is invalid.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_list_config_sources(self)

Test listing config sources.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_list_config_sources_empty(self)

Test listing when no sources registered.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_list_config_sources_enabled_only(self)

Test listing only enabled sources.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_remove_config_source(self)

Test removing a config source.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_remove_config_source_not_found(self)

Test removing non-existent source.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_remove_config_source_missing_name(self)

Test error when name is missing.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |




### TestCompleteWorkflow

Test complete workflow of add → fetch → remove.

**Inherits from**: (none)

#### Methods

##### test_add_fetch_remove_workflow(self, mock_sm_class, mock_git_repo_class, temp_dirs)

Test complete workflow: add source → fetch config → remove source.

**Decorators**: `@patch('skill_seekers.mcp.server.GitConfigRepo')`, `@patch('skill_seekers.mcp.server.SourceManager')`

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| mock_sm_class | None | - | - |
| mock_git_repo_class | None | - | - |
| temp_dirs | None | - | - |




## Functions

### temp_dirs(tmp_path)

Create temporary directories for testing.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| tmp_path | None | - | - |

**Returns**: (none)



### mock_git_repo(temp_dirs)

Create a mock git repository with config files.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| temp_dirs | None | - | - |

**Returns**: (none)


