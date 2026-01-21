# API Reference: test_source_manager.py

**Language**: Python

**Source**: `tests/test_source_manager.py`

---

## Classes

### TestSourceManagerInit

Test SourceManager initialization.

**Inherits from**: (none)

#### Methods

##### test_init_creates_config_dir(self, tmp_path)

Test that initialization creates config directory.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| tmp_path | None | - | - |


##### test_init_creates_registry_file(self, temp_config_dir)

Test that initialization creates registry file.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| temp_config_dir | None | - | - |


##### test_init_preserves_existing_registry(self, temp_config_dir)

Test that initialization doesn't overwrite existing registry.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| temp_config_dir | None | - | - |


##### test_init_with_default_config_dir(self)

Test initialization with default config directory.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |




### TestAddSource

Test adding config sources.

**Inherits from**: (none)

#### Methods

##### test_add_source_minimal(self, source_manager)

Test adding source with minimal parameters.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| source_manager | None | - | - |


##### test_add_source_full_parameters(self, source_manager)

Test adding source with all parameters.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| source_manager | None | - | - |


##### test_add_source_normalizes_name(self, source_manager)

Test that source names are normalized to lowercase.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| source_manager | None | - | - |


##### test_add_source_invalid_name_empty(self, source_manager)

Test that empty source names are rejected.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| source_manager | None | - | - |


##### test_add_source_invalid_name_special_chars(self, source_manager)

Test that source names with special characters are rejected.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| source_manager | None | - | - |


##### test_add_source_valid_name_with_hyphens(self, source_manager)

Test that source names with hyphens are allowed.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| source_manager | None | - | - |


##### test_add_source_valid_name_with_underscores(self, source_manager)

Test that source names with underscores are allowed.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| source_manager | None | - | - |


##### test_add_source_empty_git_url(self, source_manager)

Test that empty git URLs are rejected.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| source_manager | None | - | - |


##### test_add_source_strips_git_url(self, source_manager)

Test that git URLs are stripped of whitespace.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| source_manager | None | - | - |


##### test_add_source_updates_existing(self, source_manager)

Test that adding existing source updates it.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| source_manager | None | - | - |


##### test_add_source_persists_to_file(self, source_manager, temp_config_dir)

Test that added sources are persisted to file.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| source_manager | None | - | - |
| temp_config_dir | None | - | - |


##### test_add_multiple_sources_sorted_by_priority(self, source_manager)

Test that multiple sources are sorted by priority.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| source_manager | None | - | - |




### TestGetSource

Test retrieving config sources.

**Inherits from**: (none)

#### Methods

##### test_get_source_exact_match(self, source_manager)

Test getting source with exact name match.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| source_manager | None | - | - |


##### test_get_source_case_insensitive(self, source_manager)

Test getting source is case-insensitive.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| source_manager | None | - | - |


##### test_get_source_not_found(self, source_manager)

Test error when source not found.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| source_manager | None | - | - |


##### test_get_source_not_found_shows_available(self, source_manager)

Test error message shows available sources.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| source_manager | None | - | - |


##### test_get_source_empty_registry(self, source_manager)

Test error when registry is empty.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| source_manager | None | - | - |




### TestListSources

Test listing config sources.

**Inherits from**: (none)

#### Methods

##### test_list_sources_empty(self, source_manager)

Test listing sources when registry is empty.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| source_manager | None | - | - |


##### test_list_sources_multiple(self, source_manager)

Test listing multiple sources.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| source_manager | None | - | - |


##### test_list_sources_sorted_by_priority(self, source_manager)

Test that sources are sorted by priority.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| source_manager | None | - | - |


##### test_list_sources_enabled_only(self, source_manager)

Test listing only enabled sources.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| source_manager | None | - | - |


##### test_list_sources_all_when_some_disabled(self, source_manager)

Test listing all sources includes disabled ones.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| source_manager | None | - | - |




### TestRemoveSource

Test removing config sources.

**Inherits from**: (none)

#### Methods

##### test_remove_source_exists(self, source_manager)

Test removing existing source.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| source_manager | None | - | - |


##### test_remove_source_case_insensitive(self, source_manager)

Test removing source is case-insensitive.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| source_manager | None | - | - |


##### test_remove_source_not_found(self, source_manager)

Test removing non-existent source returns False.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| source_manager | None | - | - |


##### test_remove_source_persists_to_file(self, source_manager, temp_config_dir)

Test that source removal is persisted to file.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| source_manager | None | - | - |
| temp_config_dir | None | - | - |


##### test_remove_source_from_multiple(self, source_manager)

Test removing one source from multiple.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| source_manager | None | - | - |




### TestUpdateSource

Test updating config sources.

**Inherits from**: (none)

#### Methods

##### test_update_source_git_url(self, source_manager)

Test updating source git URL.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| source_manager | None | - | - |


##### test_update_source_branch(self, source_manager)

Test updating source branch.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| source_manager | None | - | - |


##### test_update_source_enabled(self, source_manager)

Test updating source enabled status.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| source_manager | None | - | - |


##### test_update_source_priority(self, source_manager)

Test updating source priority.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| source_manager | None | - | - |


##### test_update_source_multiple_fields(self, source_manager)

Test updating multiple fields at once.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| source_manager | None | - | - |


##### test_update_source_updates_timestamp(self, source_manager)

Test that update modifies updated_at timestamp.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| source_manager | None | - | - |


##### test_update_source_not_found(self, source_manager)

Test error when updating non-existent source.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| source_manager | None | - | - |


##### test_update_source_resorts_by_priority(self, source_manager)

Test that updating priority re-sorts sources.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| source_manager | None | - | - |




### TestDefaultTokenEnv

Test default token environment variable detection.

**Inherits from**: (none)

#### Methods

##### test_default_token_env_github(self, source_manager)

Test GitHub sources get GITHUB_TOKEN.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| source_manager | None | - | - |


##### test_default_token_env_gitlab(self, source_manager)

Test GitLab sources get GITLAB_TOKEN.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| source_manager | None | - | - |


##### test_default_token_env_gitea(self, source_manager)

Test Gitea sources get GITEA_TOKEN.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| source_manager | None | - | - |


##### test_default_token_env_bitbucket(self, source_manager)

Test Bitbucket sources get BITBUCKET_TOKEN.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| source_manager | None | - | - |


##### test_default_token_env_custom(self, source_manager)

Test custom sources get GIT_TOKEN.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| source_manager | None | - | - |


##### test_override_token_env(self, source_manager)

Test that custom token_env overrides default.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| source_manager | None | - | - |




### TestRegistryPersistence

Test registry file I/O.

**Inherits from**: (none)

#### Methods

##### test_registry_atomic_write(self, source_manager, temp_config_dir)

Test that registry writes are atomic (temp file + rename).

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| source_manager | None | - | - |
| temp_config_dir | None | - | - |


##### test_registry_json_formatting(self, source_manager, temp_config_dir)

Test that registry JSON is properly formatted.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| source_manager | None | - | - |
| temp_config_dir | None | - | - |


##### test_registry_corrupted_file(self, temp_config_dir)

Test error handling for corrupted registry file.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| temp_config_dir | None | - | - |




## Functions

### temp_config_dir(tmp_path)

Create temporary config directory for tests.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| tmp_path | None | - | - |

**Returns**: (none)



### source_manager(temp_config_dir)

Create SourceManager instance with temp config.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| temp_config_dir | None | - | - |

**Returns**: (none)


