# API Reference: test_git_repo.py

**Language**: Python

**Source**: `tests/test_git_repo.py`

---

## Classes

### TestGitConfigRepoInit

Test GitConfigRepo initialization.

**Inherits from**: (none)

#### Methods

##### test_init_with_custom_cache_dir(self, temp_cache_dir)

Test initialization with custom cache directory.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| temp_cache_dir | None | - | - |


##### test_init_with_env_var(self, tmp_path, monkeypatch)

Test initialization with environment variable.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| tmp_path | None | - | - |
| monkeypatch | None | - | - |


##### test_init_with_default(self, monkeypatch)

Test initialization with default cache directory.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| monkeypatch | None | - | - |




### TestValidateGitUrl

Test git URL validation.

**Inherits from**: (none)

#### Methods

##### test_validate_https_url(self)

Test validation of HTTPS URLs.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_validate_http_url(self)

Test validation of HTTP URLs.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_validate_ssh_url(self)

Test validation of SSH URLs.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_validate_file_url(self)

Test validation of file:// URLs.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_invalid_empty_url(self)

Test validation rejects empty URLs.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_invalid_malformed_url(self)

Test validation rejects malformed URLs.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_invalid_ssh_without_colon(self)

Test validation rejects SSH URLs without colon.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |




### TestInjectToken

Test token injection into git URLs.

**Inherits from**: (none)

#### Methods

##### test_inject_token_https(self)

Test token injection into HTTPS URL.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_inject_token_ssh_to_https(self)

Test SSH URL conversion to HTTPS with token.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_inject_token_with_port(self)

Test token injection with custom port.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_inject_token_gitlab_ssh(self)

Test GitLab SSH URL conversion.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |




### TestCloneOrPull

Test clone and pull operations.

**Inherits from**: (none)

#### Methods

##### test_clone_new_repo(self, mock_clone, git_repo)

Test cloning a new repository.

**Decorators**: `@patch('skill_seekers.mcp.git_repo.git.Repo.clone_from')`

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| mock_clone | None | - | - |
| git_repo | None | - | - |


##### test_pull_existing_repo(self, mock_repo_class, git_repo, temp_cache_dir)

Test pulling updates to existing repository.

**Decorators**: `@patch('skill_seekers.mcp.git_repo.git.Repo')`

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| mock_repo_class | None | - | - |
| git_repo | None | - | - |
| temp_cache_dir | None | - | - |


##### test_pull_with_token_update(self, mock_repo_class, git_repo, temp_cache_dir)

Test pulling with token updates remote URL.

**Decorators**: `@patch('skill_seekers.mcp.git_repo.git.Repo')`

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| mock_repo_class | None | - | - |
| git_repo | None | - | - |
| temp_cache_dir | None | - | - |


##### test_force_refresh_deletes_cache(self, mock_clone, git_repo, temp_cache_dir)

Test force refresh deletes existing cache.

**Decorators**: `@patch('skill_seekers.mcp.git_repo.git.Repo.clone_from')`

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| mock_clone | None | - | - |
| git_repo | None | - | - |
| temp_cache_dir | None | - | - |


##### test_clone_with_custom_branch(self, mock_clone, git_repo)

Test cloning with custom branch.

**Decorators**: `@patch('skill_seekers.mcp.git_repo.git.Repo.clone_from')`

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| mock_clone | None | - | - |
| git_repo | None | - | - |


##### test_clone_invalid_url_raises_error(self, git_repo)

Test cloning with invalid URL raises ValueError.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| git_repo | None | - | - |


##### test_clone_auth_failure_error(self, mock_clone, git_repo)

Test authentication failure error handling.

**Decorators**: `@patch('skill_seekers.mcp.git_repo.git.Repo.clone_from')`

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| mock_clone | None | - | - |
| git_repo | None | - | - |


##### test_clone_not_found_error(self, mock_clone, git_repo)

Test repository not found error handling.

**Decorators**: `@patch('skill_seekers.mcp.git_repo.git.Repo.clone_from')`

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| mock_clone | None | - | - |
| git_repo | None | - | - |




### TestFindConfigs

Test config file discovery.

**Inherits from**: (none)

#### Methods

##### test_find_configs_in_root(self, git_repo, temp_cache_dir)

Test finding config files in repository root.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| git_repo | None | - | - |
| temp_cache_dir | None | - | - |


##### test_find_configs_in_subdirs(self, git_repo, temp_cache_dir)

Test finding config files in subdirectories.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| git_repo | None | - | - |
| temp_cache_dir | None | - | - |


##### test_find_configs_excludes_git_dir(self, git_repo, temp_cache_dir)

Test that .git directory is excluded from config search.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| git_repo | None | - | - |
| temp_cache_dir | None | - | - |


##### test_find_configs_empty_repo(self, git_repo, temp_cache_dir)

Test finding configs in empty repository.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| git_repo | None | - | - |
| temp_cache_dir | None | - | - |


##### test_find_configs_nonexistent_repo(self, git_repo, temp_cache_dir)

Test finding configs in non-existent repository.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| git_repo | None | - | - |
| temp_cache_dir | None | - | - |


##### test_find_configs_sorted_by_name(self, git_repo, temp_cache_dir)

Test that configs are sorted by filename.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| git_repo | None | - | - |
| temp_cache_dir | None | - | - |




### TestGetConfig

Test config file loading.

**Inherits from**: (none)

#### Methods

##### test_get_config_exact_match(self, git_repo, temp_cache_dir)

Test loading config with exact filename match.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| git_repo | None | - | - |
| temp_cache_dir | None | - | - |


##### test_get_config_with_json_extension(self, git_repo, temp_cache_dir)

Test loading config when .json extension is provided.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| git_repo | None | - | - |
| temp_cache_dir | None | - | - |


##### test_get_config_case_insensitive(self, git_repo, temp_cache_dir)

Test loading config with case-insensitive match.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| git_repo | None | - | - |
| temp_cache_dir | None | - | - |


##### test_get_config_in_subdir(self, git_repo, temp_cache_dir)

Test loading config from subdirectory.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| git_repo | None | - | - |
| temp_cache_dir | None | - | - |


##### test_get_config_not_found(self, git_repo, temp_cache_dir)

Test error when config not found.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| git_repo | None | - | - |
| temp_cache_dir | None | - | - |


##### test_get_config_not_found_shows_available(self, git_repo, temp_cache_dir)

Test error message shows available configs.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| git_repo | None | - | - |
| temp_cache_dir | None | - | - |


##### test_get_config_invalid_json(self, git_repo, temp_cache_dir)

Test error handling for invalid JSON.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| git_repo | None | - | - |
| temp_cache_dir | None | - | - |




## Functions

### temp_cache_dir(tmp_path)

Create temporary cache directory for tests.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| tmp_path | None | - | - |

**Returns**: (none)



### git_repo(temp_cache_dir)

Create GitConfigRepo instance with temp cache.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| temp_cache_dir | None | - | - |

**Returns**: (none)


