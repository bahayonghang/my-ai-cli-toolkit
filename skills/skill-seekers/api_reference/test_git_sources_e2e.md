# API Reference: test_git_sources_e2e.py

**Language**: Python

**Source**: `tests/test_git_sources_e2e.py`

---

## Classes

### TestGitSourcesE2E

End-to-end tests for git source features.

**Inherits from**: (none)

#### Methods

##### temp_dirs(self)

Create temporary directories for cache and config.

**Decorators**: `@pytest.fixture`

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### temp_git_repo(self)

Create a temporary git repository with sample configs.

**Decorators**: `@pytest.fixture`

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_e2e_workflow_direct_git_url(self, temp_dirs, temp_git_repo)

E2E Test 1: Direct git URL workflow (no source registration)

Steps:
1. Clone repository via direct git URL
2. List available configs
3. Fetch specific config
4. Verify config content

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| temp_dirs | None | - | - |
| temp_git_repo | None | - | - |


##### test_e2e_workflow_with_source_registration(self, temp_dirs, temp_git_repo)

E2E Test 2: Complete workflow with source registration

Steps:
1. Add source to registry
2. List sources
3. Get source details
4. Clone via source name
5. Fetch config
6. Update source (re-add with different priority)
7. Remove source
8. Verify removal

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| temp_dirs | None | - | - |
| temp_git_repo | None | - | - |


##### test_e2e_multiple_sources_priority_resolution(self, temp_dirs, temp_git_repo)

E2E Test 3: Multiple sources with priority resolution

Steps:
1. Add multiple sources with different priorities
2. Verify sources are sorted by priority
3. Enable/disable sources
4. List enabled sources only

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| temp_dirs | None | - | - |
| temp_git_repo | None | - | - |


##### test_e2e_pull_existing_repository(self, temp_dirs, temp_git_repo)

E2E Test 4: Pull updates from existing repository

Steps:
1. Clone repository
2. Add new commit to original repo
3. Pull updates
4. Verify new config is available

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| temp_dirs | None | - | - |
| temp_git_repo | None | - | - |


##### test_e2e_force_refresh(self, temp_dirs, temp_git_repo)

E2E Test 5: Force refresh (delete and re-clone)

Steps:
1. Clone repository
2. Modify local cache manually
3. Force refresh
4. Verify cache was reset

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| temp_dirs | None | - | - |
| temp_git_repo | None | - | - |


##### test_e2e_config_not_found(self, temp_dirs, temp_git_repo)

E2E Test 6: Error handling - config not found

Steps:
1. Clone repository
2. Try to fetch non-existent config
3. Verify helpful error message with suggestions

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| temp_dirs | None | - | - |
| temp_git_repo | None | - | - |


##### test_e2e_invalid_git_url(self, temp_dirs)

E2E Test 7: Error handling - invalid git URL

Steps:
1. Try to clone with invalid URL
2. Verify validation error

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| temp_dirs | None | - | - |


##### test_e2e_source_name_validation(self, temp_dirs)

E2E Test 8: Error handling - invalid source names

Steps:
1. Try to add sources with invalid names
2. Verify validation errors

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| temp_dirs | None | - | - |


##### test_e2e_registry_persistence(self, temp_dirs, temp_git_repo)

E2E Test 9: Registry persistence across instances

Steps:
1. Add source with one SourceManager instance
2. Create new SourceManager instance
3. Verify source persists
4. Modify source with new instance
5. Verify changes persist

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| temp_dirs | None | - | - |
| temp_git_repo | None | - | - |


##### test_e2e_cache_isolation(self, temp_dirs, temp_git_repo)

E2E Test 10: Cache isolation between different cache directories

Steps:
1. Clone to cache_dir_1
2. Clone same repo to cache_dir_2
3. Verify both caches are independent
4. Modify one cache
5. Verify other cache is unaffected

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| temp_dirs | None | - | - |
| temp_git_repo | None | - | - |


##### test_e2e_auto_detect_token_env(self, temp_dirs)

E2E Test 11: Auto-detect token_env based on source type

Steps:
1. Add GitHub source without token_env
2. Verify GITHUB_TOKEN was auto-detected
3. Add GitLab source without token_env
4. Verify GITLAB_TOKEN was auto-detected

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| temp_dirs | None | - | - |


##### test_e2e_complete_user_workflow(self, temp_dirs, temp_git_repo)

E2E Test 12: Complete real-world user workflow

Simulates a team using the feature end-to-end:
1. Team lead creates config repository
2. Team lead registers source
3. Developer 1 clones and uses config
4. Developer 2 uses same source (cached)
5. Team lead updates repository
6. Developers pull updates
7. Config is removed from repo
8. Error handling works correctly

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| temp_dirs | None | - | - |
| temp_git_repo | None | - | - |




### TestMCPToolsE2E

E2E tests for MCP tools integration.

**Inherits from**: (none)

#### Methods

##### temp_dirs(self)

Create temporary directories for cache and config.

**Decorators**: `@pytest.fixture`

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### temp_git_repo(self)

Create a temporary git repository with sample configs.

**Decorators**: `@pytest.fixture`

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_mcp_add_list_remove_source_e2e(self, temp_dirs, temp_git_repo)

MCP E2E Test 1: Complete add/list/remove workflow via MCP tools

**Decorators**: `@pytest.mark.asyncio`

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| temp_dirs | None | - | - |
| temp_git_repo | None | - | - |


##### test_mcp_fetch_config_git_url_mode_e2e(self, temp_dirs, temp_git_repo)

MCP E2E Test 2: fetch_config with direct git URL

**Decorators**: `@pytest.mark.asyncio`

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| temp_dirs | None | - | - |
| temp_git_repo | None | - | - |


##### test_mcp_fetch_config_source_mode_e2e(self, temp_dirs, temp_git_repo)

MCP E2E Test 3: fetch_config with registered source

**Decorators**: `@pytest.mark.asyncio`

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| temp_dirs | None | - | - |
| temp_git_repo | None | - | - |


##### test_mcp_error_handling_e2e(self, temp_dirs, temp_git_repo)

MCP E2E Test 4: Error handling across all tools

**Decorators**: `@pytest.mark.asyncio`

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| temp_dirs | None | - | - |
| temp_git_repo | None | - | - |



